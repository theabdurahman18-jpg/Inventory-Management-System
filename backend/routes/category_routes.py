from flask import Blueprint, request, jsonify
from firebase_config import db
from models.category_model import Category

category_bp = Blueprint('category_bp', __name__)

@category_bp.route('/categories', methods=['GET'])
def get_categories():
    """Retrieve all categories."""
    try:
        docs = db.collection('categories').get()
        categories = [doc.to_dict() for doc in docs]
        return jsonify({"success": True, "categories": categories}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@category_bp.route('/categories', methods=['POST'])
def add_category():
    """Add a new category with duplicate prevention."""
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()

        if not name:
            return jsonify({"success": False, "error": "Category Name is required"}), 400

        # Duplicate check
        docs = db.collection('categories').get()
        for doc in docs:
            d = doc.to_dict()
            if d.get('name', '').strip().lower() == name.lower():
                return jsonify({"success": False, "error": f"Category '{name}' already exists!"}), 409

        new_cat = Category(name=name, description=description)
        cat_dict = new_cat.to_dict()

        db.collection('categories').document(new_cat.id).set(cat_dict)

        return jsonify({
            "success": True,
            "message": "Category created successfully",
            "category": cat_dict
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@category_bp.route('/categories/<category_id>', methods=['DELETE'])
def delete_category(category_id):
    """Delete a category."""
    try:
        doc_ref = db.collection('categories').document(category_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"success": False, "error": "Category not found"}), 404

        doc_ref.delete()
        return jsonify({"success": True, "message": "Category deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
