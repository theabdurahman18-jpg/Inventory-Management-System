from flask import Blueprint, request, jsonify
from datetime import datetime
from firebase_config import db
from models.product_model import Product

product_bp = Blueprint('product_bp', __name__)

@product_bp.route('/products', methods=['GET'])
def get_products():
    """Retrieve all products with optional search, category filter, and sorting."""
    try:
        docs = db.collection('products').get()
        products = []
        for doc in docs:
            products.append(doc.to_dict())

        # Filtering parameters
        search_query = request.args.get('search', '').strip().lower()
        category_filter = request.args.get('category', '').strip()
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('order', 'desc')

        # Apply search filter
        if search_query:
            products = [
                p for p in products 
                if search_query in p.get('name', '').lower() 
                or search_query in p.get('brand', '').lower() 
                or search_query in p.get('supplier', '').lower()
                or search_query in p.get('product_id', '').lower()
            ]

        # Apply category filter
        if category_filter and category_filter.lower() != 'all':
            products = [p for p in products if p.get('category', '').lower() == category_filter.lower()]

        # Apply sorting
        reverse_flag = (sort_order.lower() == 'desc')
        if sort_by == 'name':
            products.sort(key=lambda x: x.get('name', '').lower(), reverse=reverse_flag)
        elif sort_by == 'price':
            products.sort(key=lambda x: float(x.get('price', 0)), reverse=reverse_flag)
        elif sort_by == 'quantity':
            products.sort(key=lambda x: int(x.get('quantity', 0)), reverse=reverse_flag)
        else:
            # Default by created_at or updated_at
            products.sort(key=lambda x: x.get('created_at', ''), reverse=reverse_flag)

        return jsonify({
            "success": True,
            "count": len(products),
            "products": products
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@product_bp.route('/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Retrieve a single product by product_id."""
    try:
        doc = db.collection('products').document(product_id).get()
        if not doc.exists:
            return jsonify({"success": False, "error": "Product not found"}), 404
        return jsonify({"success": True, "product": doc.to_dict()}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@product_bp.route('/products', methods=['POST'])
def add_product():
    """Create a new product with validation and duplicate prevention."""
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        category = data.get('category', '').strip()
        brand = data.get('brand', '').strip()
        supplier = data.get('supplier', '').strip()
        quantity = data.get('quantity')
        price = data.get('price')
        description = data.get('description', '').strip()
        image_url = data.get('image_url', '').strip()

        # Validation
        if not name:
            return jsonify({"success": False, "error": "Product Name is required"}), 400
        if not category:
            return jsonify({"success": False, "error": "Category is required"}), 400
        if price is None or float(price) < 0:
            return jsonify({"success": False, "error": "Valid positive Price is required"}), 400
        if quantity is None or int(quantity) < 0:
            return jsonify({"success": False, "error": "Valid positive Quantity is required"}), 400

        # Duplicate check (prevent creating product with exact same name)
        existing_docs = db.collection('products').get()
        for doc in existing_docs:
            d = doc.to_dict()
            if d.get('name', '').strip().lower() == name.lower():
                return jsonify({"success": False, "error": f"Product with name '{name}' already exists!"}), 409

        new_product = Product(
            name=name,
            category=category,
            brand=brand,
            supplier=supplier,
            quantity=int(quantity),
            price=float(price),
            description=description,
            image_url=image_url
        )

        product_dict = new_product.to_dict()
        db.collection('products').document(new_product.product_id).set(product_dict)

        return jsonify({
            "success": True,
            "message": "Product created successfully",
            "product": product_dict
        }), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@product_bp.route('/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update an existing product."""
    try:
        doc_ref = db.collection('products').document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"success": False, "error": "Product not found"}), 404

        data = request.get_json() or {}
        existing_data = doc.to_dict()

        name = data.get('name', existing_data.get('name')).strip()
        category = data.get('category', existing_data.get('category')).strip()
        brand = data.get('brand', existing_data.get('brand')).strip()
        supplier = data.get('supplier', existing_data.get('supplier')).strip()
        price = float(data.get('price', existing_data.get('price')))
        quantity = int(data.get('quantity', existing_data.get('quantity')))
        description = data.get('description', existing_data.get('description')).strip()
        image_url = data.get('image_url', existing_data.get('image_url')).strip()

        # Validation
        if not name:
            return jsonify({"success": False, "error": "Product Name cannot be empty"}), 400
        if price < 0 or quantity < 0:
            return jsonify({"success": False, "error": "Price and Quantity must be non-negative"}), 400

        # Duplicate check against other products
        all_docs = db.collection('products').get()
        for d in all_docs:
            p_data = d.to_dict()
            if p_data.get('product_id') != product_id and p_data.get('name', '').strip().lower() == name.lower():
                return jsonify({"success": False, "error": f"Another product with name '{name}' already exists"}), 409

        updated_fields = {
            "name": name,
            "category": category,
            "brand": brand,
            "supplier": supplier,
            "price": price,
            "quantity": quantity,
            "description": description,
            "image_url": image_url,
            "updated_at": datetime.now().isoformat()
        }

        doc_ref.update(updated_fields)
        merged_data = {**existing_data, **updated_fields}

        return jsonify({
            "success": True,
            "message": "Product updated successfully",
            "product": merged_data
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@product_bp.route('/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product by ID."""
    try:
        doc_ref = db.collection('products').document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"success": False, "error": "Product not found"}), 404

        doc_ref.delete()
        return jsonify({
            "success": True,
            "message": f"Product {product_id} deleted successfully"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
