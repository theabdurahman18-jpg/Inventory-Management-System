from flask import Blueprint, jsonify
from firebase_config import db

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/reports/summary', methods=['GET'])
def get_summary_report():
    """Returns aggregated inventory metrics and breakdown data for the dashboard."""
    try:
        product_docs = db.collection('products').get()
        category_docs = db.collection('categories').get()

        products = [doc.to_dict() for doc in product_docs]
        categories = [doc.to_dict() for doc in category_docs]

        total_products = len(products)
        total_categories = len(categories)

        total_stock = sum(int(p.get('quantity', 0)) for p in products)
        inventory_value = sum(float(p.get('price', 0)) * int(p.get('quantity', 0)) for p in products)

        # Low stock items threshold < 5
        low_stock_items = [p for p in products if int(p.get('quantity', 0)) < 5]
        low_stock_count = len(low_stock_items)

        # Category Breakdown
        category_counts = {}
        category_values = {}
        for p in products:
            cat_name = p.get('category', 'Uncategorized')
            qty = int(p.get('quantity', 0))
            val = float(p.get('price', 0)) * qty

            category_counts[cat_name] = category_counts.get(cat_name, 0) + qty
            category_values[cat_name] = category_values.get(cat_name, 0.0) + val

        # Recent Products (Top 5 sorted by created_at or updated_at desc)
        sorted_products = sorted(products, key=lambda x: x.get('created_at', ''), reverse=True)
        recent_products = sorted_products[:5]

        return jsonify({
            "success": True,
            "summary": {
                "total_products": total_products,
                "total_categories": total_categories,
                "total_stock": total_stock,
                "inventory_value": round(inventory_value, 2),
                "low_stock_count": low_stock_count
            },
            "low_stock_products": low_stock_items,
            "recent_products": recent_products,
            "category_distribution": category_counts,
            "category_values": category_values
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
