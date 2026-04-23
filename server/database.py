from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

# Initialize Qdrant Client once globally (singleton)
qdrant = QdrantClient(path="qdrant_data")
COLLECTION_NAME = "policies"

# Initialize Qdrant collection if it doesn't exist yet
try:
    qdrant.get_collection(COLLECTION_NAME)
except Exception:
    qdrant.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
    )
