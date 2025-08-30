import json
import operator
from typing import TypedDict, Annotated, Dict
from langchain_core.messages import AIMessage, ToolMessage
from langgraph.graph import StateGraph, END
from schemas import Product, FinalAnswer
from tools import find_product, get_deal
from config import llm

# --- Agent Setup ---
tools = [find_product, get_deal]
llm_with_tools = llm.bind_tools(tools)

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    retrieved_products: Annotated[Dict[str, Product], operator.ior]
    product_context_ids: list[str]

def tool_using_agent_node(state: AgentState):
    """Decides to call a tool or respond."""
    print("--- NODE: Tool Using Agent ---")
    product_context = state.get("product_context_ids", [])
    system_prompt = f"""
    You are an expert mobile salesperson. Follow these rules strictly:
    - For simple greetings or questions, respond directly.
    - **Current Product Context:** The user is discussing product IDs: {product_context if product_context else "None"}.
    - Use `find_product` for new product searches. This resets the context.
    - Use `get_deal` for discounts on products in the current context. Pass the context IDs.
    - You only sell mobiles.
    """
    response = llm_with_tools.invoke([("system", system_prompt)] + state["messages"])
    return {"messages": [response]}

def tool_node(state: AgentState):
    """Executes tools."""
    print("--- NODE: Tool Executor ---")
    tool_calls = state["messages"][-1].tool_calls
    tool_messages = []
    retrieved_products_update = {}

    for tool_call in tool_calls:
        tool_output = globals()[tool_call['name']].invoke(tool_call['args'])
        if tool_call['name'] == 'find_product':
            current_context_ids = [p['ID'] for p in tool_output]
            for product_dict in tool_output:
                product_obj = Product(**product_dict)
                retrieved_products_update[product_obj.id] = product_obj
            output_str = json.dumps(tool_output)
        else:
            current_context_ids = state.get("product_context_ids", [])
            output_str = str(tool_output)
        tool_messages.append(ToolMessage(content=output_str, tool_call_id=tool_call['id']))

    return {
        "messages": tool_messages,
        "retrieved_products": retrieved_products_update,
        "product_context_ids": current_context_ids
    }

def final_answer_node(state: AgentState):
    """Formats the final response."""
    print("--- NODE: Final Answer Formatter ---")
    formatter_llm = llm.with_structured_output(FinalAnswer)
    messages = [("system", "Format the final response using the `FinalAnswer` tool. `product_ids` must be from the `find_product` tool's output in the history.")] + state["messages"]
    response = formatter_llm.invoke(messages)
    return {"messages": [AIMessage(content="", tool_calls=[{"name": "FinalAnswer", "args": response.model_dump(), "id": "final"}])]}

def router(state: AgentState) -> str:
    """Decides the next step."""
    print("--- ROUTER ---")
    return "tools" if state["messages"][-1].tool_calls else "final_answer_formatter"

# --- Graph Definition ---
workflow = StateGraph(AgentState)
workflow.add_node("agent", tool_using_agent_node)
workflow.add_node("tools", tool_node)
workflow.add_node("final_answer_formatter", final_answer_node)
workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", router)
workflow.add_edge("tools", "agent")
workflow.add_edge("final_answer_formatter", END)
chatbot_graph = workflow.compile()