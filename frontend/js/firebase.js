/* ==========================================================================
   INVENTORY MANAGEMENT SYSTEM - FIREBASE & LOCAL STORAGE ADAPTER
   ========================================================================== */

// Firebase Configuration Object (Replace with your Firebase Console Project credentials)
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "inventory-mgmt-system.firebaseapp.com",
    projectId: "inventory-mgmt-system",
    storageBucket: "inventory-mgmt-system.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let isLiveFirebase = false;

// Check if valid Firebase configuration credentials are provided
const isConfiguredKey = firebaseConfig.apiKey 
    && !firebaseConfig.apiKey.includes("YOUR_") 
    && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY"
    && firebaseConfig.apiKey.length > 20;

// Attempt Firebase Web SDK initialization if loaded via script tags
if (typeof firebase !== 'undefined' && isConfiguredKey) {
    try {
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
        } else {
            firebaseApp = firebase.app();
        }
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();
        isLiveFirebase = true;
        console.log("🔥 Firebase Client SDK initialized successfully!");
    } catch (e) {
        console.warn("Firebase SDK initialization warning:", e.message);
        isLiveFirebase = false;
    }
} else {
    console.log("ℹ️ Running in Local Engine / Demo Mode (To connect live Firebase Cloud, paste your Firebase Console API keys in frontend/js/firebase.js)");
}

// Client Local Storage Fallback Engine for seamless testing
class StorageEngine {
    static getProducts() {
        const data = localStorage.getItem('ims_products');
        if (!data) {
            // Seed initial realistic products
            const initial = [
                {
                    product_id: "PRD-1001",
                    name: "Dell XPS 15 Laptop",
                    category: "Electronics",
                    brand: "Dell",
                    supplier: "TechData",
                    quantity: 12,
                    price: 1499.99,
                    description: "High performance OLED 4K screen Intel i7 laptop",
                    image_url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    product_id: "PRD-1002",
                    name: "Logitech MX Master 3S Mouse",
                    category: "Peripherals",
                    brand: "Logitech",
                    supplier: "Logi Direct",
                    quantity: 3, // Low stock warning
                    price: 99.99,
                    description: "Ergonomic quiet click mouse",
                    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    product_id: "PRD-1003",
                    name: "Ergonomic Office Chair",
                    category: "Office Supplies",
                    brand: "Herman Miller",
                    supplier: "Workspace Supply Co.",
                    quantity: 8,
                    price: 450.00,
                    description: "Breathable mesh lumbar support chair",
                    image_url: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=400&q=80",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    product_id: "PRD-1004",
                    name: "Cisco Gigabit Router",
                    category: "Networking",
                    brand: "Cisco",
                    supplier: "Global Netcom",
                    quantity: 2, // Low stock warning
                    price: 289.50,
                    description: "Dual-band VPN router",
                    image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    product_id: "PRD-1005",
                    name: "Mechanical Keyboard RGB",
                    category: "Peripherals",
                    brand: "Keychron",
                    supplier: "Logi Direct",
                    quantity: 25,
                    price: 129.00,
                    description: "Wireless hot-swappable RGB keyboard",
                    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('ims_products', JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(data);
    }

    static saveProducts(products) {
        localStorage.setItem('ims_products', JSON.stringify(products));
    }

    static getCategories() {
        const data = localStorage.getItem('ims_categories');
        if (!data) {
            const initial = [
                { id: "cat_1", name: "Electronics", description: "Laptops, phones, and accessories" },
                { id: "cat_2", name: "Office Supplies", description: "Paper, furniture, and desk items" },
                { id: "cat_3", name: "Peripherals", description: "Keyboards, mice, and monitors" },
                { id: "cat_4", name: "Networking", description: "Routers and networking cables" }
            ];
            localStorage.setItem('ims_categories', JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(data);
    }

    static saveCategories(categories) {
        localStorage.setItem('ims_categories', JSON.stringify(categories));
    }

    static getUser() {
        const user = localStorage.getItem('ims_active_user');
        return user ? JSON.parse(user) : null;
    }

    static setUser(user) {
        if (user) {
            localStorage.setItem('ims_active_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('ims_active_user');
        }
    }
}
