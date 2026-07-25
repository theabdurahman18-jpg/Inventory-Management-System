import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

from config import Config
from routes.auth_routes import auth_bp
from routes.product_routes import product_bp
from routes.category_routes import category_bp
from routes.report_routes import report_bp

def create_app():
    # Set relative paths to frontend directory if serving static frontend via Flask
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
    app.config.from_object(Config)

    # Enable CORS for cross-origin requests
    CORS(app)

    # Register API Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(product_bp, url_prefix='/api')
    app.register_blueprint(category_bp, url_prefix='/api')
    app.register_blueprint(report_bp, url_prefix='/api')

    # Frontend Page Routes
    @app.route('/')
    def index():
        return send_from_directory(frontend_dir, 'index.html')

    @app.route('/pages/<path:filename>')
    def serve_pages(filename):
        return send_from_directory(os.path.join(frontend_dir, 'pages'), filename)

    @app.route('/css/<path:filename>')
    def serve_css(filename):
        return send_from_directory(os.path.join(frontend_dir, 'css'), filename)

    @app.route('/js/<path:filename>')
    def serve_js(filename):
        return send_from_directory(os.path.join(frontend_dir, 'js'), filename)

    @app.route('/images/<path:filename>')
    def serve_images(filename):
        return send_from_directory(os.path.join(frontend_dir, 'images'), filename)

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "error": "Internal server error"}), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Inventory Management System Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
