/* ==========================================================================
   INVENTORY MANAGEMENT SYSTEM - PRODUCTS MANAGEMENT MODULE
   ========================================================================== */

let currentProducts = [];
let currentCategories = [];

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productsTableBody')) {
        initProductsPage();
    }
});

async function initProductsPage() {
    await fetchCategoriesList();
    await fetchProductsList();

    // Event listeners for Search, Filter, Sort
    const searchInput = document.getElementById('productSearchInput');
    const categorySelect = document.getElementById('categoryFilterSelect');
    const sortSelect = document.getElementById('sortSelect');

    if (searchInput) searchInput.addEventListener('input', filterAndRenderProducts);
    if (categorySelect) categorySelect.addEventListener('change', filterAndRenderProducts);
    if (sortSelect) sortSelect.addEventListener('change', filterAndRenderProducts);

    // Form Submissions & Modals
    const addForm = document.getElementById('addProductForm');
    const editForm = document.getElementById('editProductForm');
    const imgInput = document.getElementById('prodImageFile');

    if (addForm) addForm.addEventListener('submit', handleAddProduct);
    if (editForm) editForm.addEventListener('submit', handleEditProduct);
    if (imgInput) imgInput.addEventListener('change', handleImagePreview);
}

// Fetch Categories to populate filter dropdowns & modal selects
async function fetchCategoriesList() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (response.ok) {
            const res = await response.json();
            if (res.success) currentCategories = res.categories;
        }
    } catch (e) {
        currentCategories = StorageEngine.getCategories();
    }

    if (!currentCategories || currentCategories.length === 0) {
        currentCategories = StorageEngine.getCategories();
    }

    populateCategoryOptions();
}

function populateCategoryOptions() {
    const filterSelect = document.getElementById('categoryFilterSelect');
    const addSelect = document.getElementById('prodCategory');
    const editSelect = document.getElementById('editProdCategory');

    const optionsHtml = currentCategories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    if (filterSelect) {
        filterSelect.innerHTML = `<option value="all">All Categories</option>` + optionsHtml;
    }
    if (addSelect) {
        addSelect.innerHTML = `<option value="" disabled selected>Select Category</option>` + optionsHtml;
    }
    if (editSelect) {
        editSelect.innerHTML = `<option value="" disabled>Select Category</option>` + optionsHtml;
    }
}

// Fetch Products from Backend or Local Engine
async function fetchProductsList() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                currentProducts = data.products;
                filterAndRenderProducts();
                return;
            }
        }
    } catch (e) {
        console.warn("Backend products API fallback to local storage engine.");
    }

    currentProducts = StorageEngine.getProducts();
    filterAndRenderProducts();
}

// Filter, Sort, and Render Products Table
function filterAndRenderProducts() {
    const searchVal = (document.getElementById('productSearchInput')?.value || '').trim().toLowerCase();
    const categoryVal = document.getElementById('categoryFilterSelect')?.value || 'all';
    const sortVal = document.getElementById('sortSelect')?.value || 'newest';

    let filtered = [...currentProducts];

    // Search filter
    if (searchVal) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchVal) ||
            (p.brand && p.brand.toLowerCase().includes(searchVal)) ||
            (p.supplier && p.supplier.toLowerCase().includes(searchVal)) ||
            (p.product_id && p.product_id.toLowerCase().includes(searchVal))
        );
    }

    // Category filter
    if (categoryVal !== 'all') {
        filtered = filtered.filter(p => p.category.toLowerCase() === categoryVal.toLowerCase());
    }

    // Sort
    if (sortVal === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'name-desc') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortVal === 'price-asc') {
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortVal === 'price-desc') {
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortVal === 'quantity-asc') {
        filtered.sort((a, b) => parseInt(a.quantity) - parseInt(b.quantity));
    } else if (sortVal === 'quantity-desc') {
        filtered.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity));
    } else {
        // Newest
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    renderProductsTable(filtered);
}

// Render Products Table Rows
function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    const countBadge = document.getElementById('productsCountBadge');

    if (countBadge) countBadge.textContent = `${products.length} Products`;
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <i class="bi bi-box-seam display-4 text-muted d-block mb-3"></i>
                    <h5 class="text-muted">No products found matching your search.</h5>
                    <p class="text-dim">Try clearing your filters or add a new product.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(p => {
        const qty = parseInt(p.quantity || 0);
        const isLowStock = qty < 5;
        const stockBadge = isLowStock
            ? `<span class="badge-stock badge-stock-low" data-bs-toggle="tooltip" title="Stock below 5 items!"><i class="bi bi-exclamation-triangle-fill"></i> ${qty} (Low)</span>`
            : `<span class="badge-stock badge-stock-normal"><i class="bi bi-check-circle-fill"></i> ${qty} In Stock</span>`;

        return `
            <tr>
                <td><code class="text-info">${p.product_id}</code></td>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${p.image_url || 'https://via.placeholder.com/44'}" class="product-img-thumb" alt="${p.name}">
                        <div>
                            <div class="fw-bold text-light">${p.name}</div>
                            <small class="text-muted">${p.brand || 'No Brand'}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-secondary opacity-75">${p.category}</span></td>
                <td>${p.supplier || 'N/A'}</td>
                <td class="fw-bold text-primary">${formatCurrency(p.price)}</td>
                <td>${stockBadge}</td>
                <td class="text-muted fs-7">${formatDate(p.created_at)}</td>
                <td class="text-end">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-glass text-info" onclick="viewProductDetails('${p.product_id}')" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-glass text-warning" onclick="openEditProductModal('${p.product_id}')" title="Edit">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-glass text-danger" onclick="confirmDeleteProduct('${p.product_id}', '${p.name.replace(/'/g, "\\'")}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    initGlobalTooltips();
}

// Image Upload File Preview Handler
async function handleImagePreview(e) {
    const file = e.target.files[0];
    const previewImg = document.getElementById('imagePreviewThumb');
    if (file && previewImg) {
        try {
            const base64 = await fileToBase64(file);
            previewImg.src = base64;
            previewImg.classList.remove('d-none');
        } catch (err) {
            console.error("Base64 error:", err);
        }
    }
}

// Handle Add Product Form Submit
async function handleAddProduct(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;
    const brand = document.getElementById('prodBrand').value.trim();
    const supplier = document.getElementById('prodSupplier').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    const quantity = parseInt(document.getElementById('prodQuantity').value);
    const description = document.getElementById('prodDescription').value.trim();
    const imgUrlInput = document.getElementById('prodImageUrl').value.trim();
    const imgFile = document.getElementById('prodImageFile').files[0];

    // Validation
    if (!name || !category || isNaN(price) || isNaN(quantity)) {
        showAlert('Please fill in all required fields (Name, Category, Price, Quantity).', 'danger');
        return;
    }
    if (price < 0 || quantity < 0) {
        showAlert('Price and Quantity cannot be negative numbers.', 'danger');
        return;
    }

    setButtonLoading(submitBtn, true, 'Saving Product...');

    let finalImageUrl = imgUrlInput || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80';
    if (imgFile) {
        try {
            finalImageUrl = await fileToBase64(imgFile);
        } catch (err) {
            console.warn("Base64 upload conversion failed:", err);
        }
    }

    const payload = { name, category, brand, supplier, price, quantity, description, image_url: finalImageUrl };

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (!response.ok || !res.success) {
            throw new Error(res.error || 'Failed to create product.');
        }

        showAlert('Product added successfully!', 'success');
        await fetchProductsList();
        closeModal('addProductModal');
        e.target.reset();
        document.getElementById('imagePreviewThumb')?.classList.add('d-none');

    } catch (err) {
        console.warn("API Add product failed. Falling back to local storage:", err.message);
        
        // Local engine duplicate check
        const existing = StorageEngine.getProducts();
        if (existing.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            showAlert(`Product with name '${name}' already exists!`, 'danger');
            setButtonLoading(submitBtn, false, 'Add Product');
            return;
        }

        const newP = {
            product_id: "PRD-" + Math.floor(1000 + Math.random() * 9000),
            name, category, brand, supplier, price, quantity, description,
            image_url: finalImageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        existing.push(newP);
        StorageEngine.saveProducts(existing);

        showAlert('Product created successfully!', 'success');
        fetchProductsList();
        closeModal('addProductModal');
        e.target.reset();
    } finally {
        setButtonLoading(submitBtn, false, 'Add Product');
    }
}

// Open Edit Product Modal
function openEditProductModal(productId) {
    const product = currentProducts.find(p => p.product_id === productId);
    if (!product) return;

    document.getElementById('editProdId').value = product.product_id;
    document.getElementById('editProdName').value = product.name;
    document.getElementById('editProdCategory').value = product.category;
    document.getElementById('editProdBrand').value = product.brand || '';
    document.getElementById('editProdSupplier').value = product.supplier || '';
    document.getElementById('editProdPrice').value = product.price;
    document.getElementById('editProdQuantity').value = product.quantity;
    document.getElementById('editProdDescription').value = product.description || '';
    document.getElementById('editProdImageUrl').value = product.image_url || '';

    const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    editModal.show();
}

// Handle Edit Product Form Submit
async function handleEditProduct(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const productId = document.getElementById('editProdId').value;
    const name = document.getElementById('editProdName').value.trim();
    const category = document.getElementById('editProdCategory').value;
    const brand = document.getElementById('editProdBrand').value.trim();
    const supplier = document.getElementById('editProdSupplier').value.trim();
    const price = parseFloat(document.getElementById('editProdPrice').value);
    const quantity = parseInt(document.getElementById('editProdQuantity').value);
    const description = document.getElementById('editProdDescription').value.trim();
    const imageUrl = document.getElementById('editProdImageUrl').value.trim();

    if (!name || !category || isNaN(price) || isNaN(quantity)) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
    }

    setButtonLoading(submitBtn, true, 'Updating Product...');

    const payload = { name, category, brand, supplier, price, quantity, description, image_url: imageUrl };

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (!response.ok || !res.success) {
            throw new Error(res.error || 'Failed to update product.');
        }

        showAlert('Product updated successfully!', 'success');
        await fetchProductsList();
        closeModal('editProductModal');

    } catch (err) {
        console.warn("API Edit failed. Utilizing local storage update fallback:", err.message);

        let products = StorageEngine.getProducts();
        const index = products.findIndex(p => p.product_id === productId);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name, category, brand, supplier, price, quantity, description,
                image_url: imageUrl || products[index].image_url,
                updated_at: new Date().toISOString()
            };
            StorageEngine.saveProducts(products);
            showAlert('Product updated successfully!', 'success');
            fetchProductsList();
            closeModal('editProductModal');
        }
    } finally {
        setButtonLoading(submitBtn, false, 'Save Changes');
    }
}

// Confirm Delete Product Modal Trigger
function confirmDeleteProduct(productId, productName) {
    const deleteModalEl = document.getElementById('deleteConfirmModal');
    if (!deleteModalEl) return;

    document.getElementById('deleteProdNameHolder').textContent = productName;
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    confirmBtn.onclick = async () => {
        setButtonLoading(confirmBtn, true, 'Deleting...');
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, { method: 'DELETE' });
            const res = await response.json();
            if (!response.ok || !res.success) throw new Error(res.error);

            showAlert(`Product '${productName}' deleted!`, 'success');
            await fetchProductsList();
        } catch (e) {
            let products = StorageEngine.getProducts();
            products = products.filter(p => p.product_id !== productId);
            StorageEngine.saveProducts(products);
            showAlert(`Product '${productName}' deleted!`, 'success');
            fetchProductsList();
        } finally {
            setButtonLoading(confirmBtn, false, 'Delete Product');
            closeModal('deleteConfirmModal');
        }
    };

    const modal = new bootstrap.Modal(deleteModalEl);
    modal.show();
}

// View Product Details Modal
function viewProductDetails(productId) {
    const p = currentProducts.find(prod => prod.product_id === productId);
    if (!p) return;

    const modalEl = document.getElementById('viewProductModal');
    if (!modalEl) return;

    document.getElementById('viewProdImg').src = p.image_url || 'https://via.placeholder.com/150';
    document.getElementById('viewProdName').textContent = p.name;
    document.getElementById('viewProdId').textContent = p.product_id;
    document.getElementById('viewProdCategory').textContent = p.category;
    document.getElementById('viewProdBrand').textContent = p.brand || 'N/A';
    document.getElementById('viewProdSupplier').textContent = p.supplier || 'N/A';
    document.getElementById('viewProdPrice').textContent = formatCurrency(p.price);
    document.getElementById('viewProdQuantity').textContent = p.quantity;
    document.getElementById('viewProdDescription').textContent = p.description || 'No detailed description provided.';
    document.getElementById('viewProdCreated').textContent = formatDate(p.created_at);
    document.getElementById('viewProdUpdated').textContent = formatDate(p.updated_at);

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// Helper to close modal cleanly
function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
        const modal = bootstrap.Modal.getInstance(el);
        if (modal) modal.hide();
    }
}
