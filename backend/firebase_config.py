import os
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("firebase_config")

db = None
auth_admin = None
is_firebase_initialized = False

# Try importing firebase_admin
try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth
    
    cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')
    
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        auth_admin = auth
        is_firebase_initialized = True
        logger.info("Firebase Admin SDK initialized with credentials file.")
    elif os.environ.get('FIREBASE_CONFIG_JSON'):
        cred_dict = json.loads(os.environ.get('FIREBASE_CONFIG_JSON'))
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        auth_admin = auth
        is_firebase_initialized = True
        logger.info("Firebase Admin SDK initialized with environment JSON.")
    else:
        logger.warning("No Firebase credentials file found at %s. Operating in local fallback mode.", cred_path)
except Exception as e:
    logger.warning("Firebase Admin initialization skipped: %s. Operating in local fallback mode.", str(e))


class MockFirestoreCollection:
    """In-memory data store providing Firestore-like interface for backend local testing when Firebase Admin is unconfigured."""
    def __init__(self, name):
        self.name = name
        self._data = {}
        if name == 'categories':
            self._seed_categories()
        elif name == 'products':
            self._seed_products()

    def _seed_categories(self):
        initial_cats = [
            {"id": "cat_1", "name": "Electronics", "description": "Laptops, phones, audio, and hardware accessories", "created_at": datetime.now().isoformat()},
            {"id": "cat_2", "name": "Office Supplies", "description": "Paper, pens, desk organizers, and furniture", "created_at": datetime.now().isoformat()},
            {"id": "cat_3", "name": "Peripherals", "description": "Keyboards, mice, monitors, and cables", "created_at": datetime.now().isoformat()},
            {"id": "cat_4", "name": "Networking", "description": "Routers, switches, access points, and LAN tools", "created_at": datetime.now().isoformat()},
        ]
        for c in initial_cats:
            self._data[c["id"]] = c

    def _seed_products(self):
        initial_prods = [
            {
                "product_id": "PRD-1001",
                "name": "Dell XPS 15 Laptop",
                "category": "Electronics",
                "brand": "Dell",
                "supplier": "TechData Distribution",
                "quantity": 12,
                "price": 1499.99,
                "description": "High performance laptop with 15.6 inch OLED 4K screen, Intel i7, 16GB RAM, 512GB SSD.",
                "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "product_id": "PRD-1002",
                "name": "Logitech MX Master 3S Mouse",
                "category": "Peripherals",
                "brand": "Logitech",
                "supplier": "Logi Direct",
                "quantity": 3,  # Low stock alert trigger
                "price": 99.99,
                "description": "Ergonomic wireless mouse with ultra-fast scroll wheel and quiet clicks.",
                "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "product_id": "PRD-1003",
                "name": "Ergonomic Office Chair",
                "category": "Office Supplies",
                "brand": "Herman Miller",
                "supplier": "Workspace Supply Co.",
                "quantity": 8,
                "price": 450.00,
                "description": "Adjustable lumbar support breathable mesh chair for comfortable all-day working.",
                "image_url": "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=400&q=80",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "product_id": "PRD-1004",
                "name": "Cisco Gigabit Ethernet Router",
                "category": "Networking",
                "brand": "Cisco",
                "supplier": "Global Netcom",
                "quantity": 2,  # Low stock alert trigger
                "price": 289.50,
                "description": "Enterprise dual-band enterprise Gigabit router with VPN firewall acceleration.",
                "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "product_id": "PRD-1005",
                "name": "Mechanical Keyboard RGB",
                "category": "Peripherals",
                "brand": "Keychron",
                "supplier": "Logi Direct",
                "quantity": 25,
                "price": 129.00,
                "description": "Wireless mechanical keyboard with hot-swappable switches and customizable backlight.",
                "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
        for p in initial_prods:
            self._data[p["product_id"]] = p

    def get(self):
        class DocumentSnapshot:
            def __init__(self, doc_id, data):
                self.id = doc_id
                self._data = data

            def to_dict(self):
                return self._data
            
            @property
            def exists(self):
                return self._data is not None

        return [DocumentSnapshot(k, v) for k, v in self._data.items()]

    def document(self, doc_id):
        parent = self
        class DocumentRef:
            def __init__(self, d_id):
                self.id = d_id

            def get(self):
                data = parent._data.get(self.id)
                class SingleDoc:
                    def __init__(self, d):
                        self._d = d
                        self.exists = d is not None
                    def to_dict(self):
                        return self._d
                return SingleDoc(data)

            def set(self, data):
                parent._data[self.id] = data

            def update(self, data):
                if self.id in parent._data:
                    parent._data[self.id].update(data)

            def delete(self):
                if self.id in parent._data:
                    del parent._data[self.id]

        return DocumentRef(doc_id)

    def add(self, data):
        doc_id = data.get("product_id") or data.get("id") or f"doc_{len(self._data)+1}"
        self._data[doc_id] = data
        class Ref:
            def __init__(self, i):
                self.id = i
        return None, Ref(doc_id)


class MockFirestoreClient:
    def __init__(self):
        self._collections = {}

    def collection(self, name):
        if name not in self._collections:
            self._collections[name] = MockFirestoreCollection(name)
        return self._collections[name]


if not is_firebase_initialized:
    db = MockFirestoreClient()
