import uuid
from datetime import datetime

class Category:
    def __init__(self, name, description="", id=None, created_at=None):
        self.id = id or f"CAT-{uuid.uuid4().hex[:6].upper()}"
        self.name = name.strip() if name else ""
        self.description = description.strip() if description else ""
        self.created_at = created_at or datetime.now().isoformat()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at
        }

    @staticmethod
    def from_dict(data):
        if not data:
            return None
        return Category(
            id=data.get("id"),
            name=data.get("name"),
            description=data.get("description"),
            created_at=data.get("created_at")
        )
