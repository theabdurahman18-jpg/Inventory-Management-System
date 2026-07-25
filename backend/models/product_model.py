import uuid
from datetime import datetime

class Product:
    def __init__(self, name, category, brand, supplier, quantity, price, description="", image_url="", product_id=None, created_at=None, updated_at=None):
        self.product_id = product_id or f"PRD-{uuid.uuid4().hex[:6].upper()}"
        self.name = name.strip() if name else ""
        self.category = category.strip() if category else "Uncategorized"
        self.brand = brand.strip() if brand else "Generic"
        self.supplier = supplier.strip() if supplier else "N/A"
        self.quantity = int(quantity) if quantity is not None else 0
        self.price = float(price) if price is not None else 0.0
        self.description = description.strip() if description else ""
        self.image_url = image_url if image_url else "https://via.placeholder.com/150?text=No+Image"
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "name": self.name,
            "category": self.category,
            "brand": self.brand,
            "supplier": self.supplier,
            "quantity": self.quantity,
            "price": self.price,
            "description": self.description,
            "image_url": self.image_url,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @staticmethod
    def from_dict(data):
        if not data:
            return None
        return Product(
            product_id=data.get("product_id"),
            name=data.get("name"),
            category=data.get("category"),
            brand=data.get("brand"),
            supplier=data.get("supplier"),
            quantity=data.get("quantity"),
            price=data.get("price"),
            description=data.get("description"),
            image_url=data.get("image_url"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at")
        )
