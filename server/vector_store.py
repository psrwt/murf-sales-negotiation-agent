from pinecone import Pinecone, ServerlessSpec
from config import PINECONE_API_KEY, PINECONE_INDEX_NAME, PINECONE_EMBEDDING_DIMENSION, embeddings_model

pc = Pinecone(api_key=PINECONE_API_KEY)

def get_pinecone_index():
    """Gets the Pinecone index, creating it if it doesn't exist."""
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

    if PINECONE_INDEX_NAME in existing_indexes:
        index_description = pc.describe_index(PINECONE_INDEX_NAME)
        if index_description.dimension != PINECONE_EMBEDDING_DIMENSION:
            print(f"Index '{PINECONE_INDEX_NAME}' exists but has wrong dimension. Deleting and recreating...")
            pc.delete_index(PINECONE_INDEX_NAME)
            existing_indexes.remove(PINECONE_INDEX_NAME)
        else:
            print(f"Index '{PINECONE_INDEX_NAME}' already exists with correct dimension.")

    if PINECONE_INDEX_NAME not in existing_indexes:
        print(f"Creating index '{PINECONE_INDEX_NAME}'...")
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=PINECONE_EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        print("Index created successfully.")

    return pc.Index(PINECONE_INDEX_NAME)

index = get_pinecone_index()

def populate_pinecone_data():
    """Populates the Pinecone index with sample data if it's empty."""
    if index.describe_index_stats()['total_vector_count'] > 0:
        print("Pinecone index already populated.")
        return

    sample_data = [
        {
            "ID": "mobile_13", "Allowed Discount": 11490, "Back Camera": "200MP + 12MP", "Capacity": 256,
            "Company Name": "Samsung", "Front Camera": "12MP", "Max Price": 114900, "Model Name": "Galaxy S24 Ultra",
            "Processor": "Exynos 2400", "Screen Size": "6.8 inches", "Text": "Best for: Power users, professionals, creatives, and tech enthusiasts. Ideal use cases: Advanced photography, AI-powered productivity, intense gaming, and seamless multitasking. The ultimate flagship experience.",
            "battery": 5000, "ram": 12, "weight": 234, "image_url": "https://picsum.photos/seed/samsung_s24_ultra/800/600"
        },
        {
            "ID": "mobile_12", "Allowed Discount": 10490, "Back Camera": "200MP + 12MP", "Capacity": 128,
            "Company Name": "Samsung", "Front Camera": "12MP", "Max Price": 104900, "Model Name": "Galaxy S24 Ultra",
            "Processor": "Exynos 2400", "Screen Size": "6.8 inches", "Text": "A great choice for users who want flagship features without needing maximum storage. Excellent for photography, productivity, and gaming.",
            "battery": 5000, "ram": 12, "weight": 234, "image_url": "https://picsum.photos/seed/samsung_s24_ultra_black/800/600"
        },
        {
            "ID": "mobile_11", "Allowed Discount": 8990, "Back Camera": "50MP + 10MP + 12MP", "Capacity": 256,
            "Company Name": "Apple", "Front Camera": "12MP", "Max Price": 89900, "Model Name": "iPhone 15 Pro",
            "Processor": "A17 Bionic", "Screen Size": "6.1 inches", "Text": "Experience the cutting-edge technology of the iPhone 15 Pro. Perfect for photography, gaming, and everyday use with its powerful A17 Bionic chip.",
            "battery": 3274, "ram": 8, "weight": 187, "image_url": "https://picsum.photos/seed/iphone_15_pro/800/600"
        },
        {
            "ID": "mobile_10", "Allowed Discount": 7990, "Back Camera": "50MP + 10MP + 12MP", "Capacity": 128,
            "Company Name": "Apple", "Front Camera": "12MP", "Max Price": 79900, "Model Name": "iPhone 15 Pro",
            "Processor": "A17 Bionic", "Screen Size": "6.1 inches", "Text": "The iPhone 15 Pro offers exceptional performance and a stunning camera system. Ideal for users who value premium design and seamless iOS experience.",
            "battery": 3274, "ram": 8, "weight": 187, "image_url": "https://picsum.photos/seed/iphone_15_pro_blue/800/600"
        },
        {
            "ID": "mobile_09", "Allowed Discount": 5990, "Back Camera": "50MP + 12MP", "Capacity": 128,
            "Company Name": "Google", "Front Camera": "10.8MP", "Max Price": 59900, "Model Name": "Pixel 8",
            "Processor": "Google Tensor G3", "Screen Size": "6.2 inches", "Text": "Discover the intelligence of Google Pixel 8. Featuring advanced AI capabilities, incredible camera, and a pure Android experience.",
            "battery": 4575, "ram": 8, "weight": 187, "image_url": "https://picsum.photos/seed/google_pixel_8/800/600"
        },
        {
            "ID": "mobile_08", "Allowed Discount": 6990, "Back Camera": "50MP + 48MP + 12MP", "Capacity": 256,
            "Company Name": "Google", "Front Camera": "10.8MP", "Max Price": 69900, "Model Name": "Pixel 8 Pro",
            "Processor": "Google Tensor G3", "Screen Size": "6.7 inches", "Text": "The Pixel 8 Pro delivers the ultimate Google experience with its pro-level camera, powerful Tensor G3 chip, and stunning display.",
            "battery": 5050, "ram": 12, "weight": 213, "image_url": "https://picsum.photos/seed/google_pixel_8_pro/800/600"
        }
    ]

    vectors_to_upsert = []
    for item in sample_data:
        embedding = embeddings_model.embed_query(item['Text'])
        metadata = {k: v for k, v in item.items() if k not in ['ID', 'Text']}
        metadata['Text'] = item['Text']
        vectors_to_upsert.append((item['ID'], embedding, metadata))

    if vectors_to_upsert:
        print("Upserting sample data to Pinecone...")
        index.upsert(vectors=vectors_to_upsert, namespace="mobiles")
        print("Sample data successfully upserted.")