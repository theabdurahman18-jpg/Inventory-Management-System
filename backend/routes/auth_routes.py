from flask import Blueprint, request, jsonify
from firebase_config import auth_admin, is_firebase_initialized

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify Firebase ID token sent from frontend client."""
    data = request.get_json() or {}
    token = data.get('idToken')
    
    if not token:
        return jsonify({"success": False, "error": "ID token missing"}), 400

    if is_firebase_initialized and auth_admin:
        try:
            decoded_token = auth_admin.verify_id_token(token)
            uid = decoded_token['uid']
            return jsonify({
                "success": True,
                "message": "Token verified",
                "user": {
                    "uid": uid,
                    "email": decoded_token.get('email', '')
                }
            }), 200
        except Exception as e:
            return jsonify({"success": False, "error": f"Invalid token: {str(e)}"}), 401
    else:
        # Local mock mode verification
        return jsonify({
            "success": True,
            "message": "Local verification mode",
            "user": {
                "uid": "mock_uid_123",
                "email": "admin@inventory.com"
            }
        }), 200
