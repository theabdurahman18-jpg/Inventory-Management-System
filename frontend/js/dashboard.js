/* ==========================================================================
   INVENTORY MANAGEMENT SYSTEM - DASHBOARD LOGIC & CHARTS
   ========================================================================== */

let stockChart = null;
let categoryPieChart = null;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('totalProductsCard')) {
        loadDashboardData();
    }
});

// Load Dashboard Data & Statistics
async function loadDashboardData() {
    let summaryData = null;
    let products = [];
    let categories = [];

    // Try fetching from Flask REST API backend
    try {
        const response = await fetch(`${API_BASE_URL}/reports/summary`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                summaryData = data.summary;
                products = data.recent_products || [];
            }
        }
    } catch (err) {
        console.warn("Backend API unavailable. Utilizing local storage engine fallback:", err);
    }

    // Fallback if API not running or returned empty
    if (!summaryData) {
        products = StorageEngine.getProducts();
        categories = StorageEngine.getCategories();

        const totalStock = products.reduce((acc, p) => acc + parseInt(p.quantity || 0), 0);
        const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.price || 0) * parseInt(p.quantity || 0)), 0);
        const lowStock = products.filter(p => parseInt(p.quantity || 0) < 5);

        summaryData = {
            total_products: products.length,
            total_categories: categories.length,
            total_stock: totalStock,
            inventory_value: totalValue,
            low_stock_count: lowStock.length
        };
    }

    // Update Summary Cards
    updateSummaryCards(summaryData);

    // Render Recent Products Table
    renderRecentProductsTable(products);

    // Render Analytics Charts
    renderStockChart(products);
    renderCategoryPieChart(products);
}

// Update Metric Cards
function updateSummaryCards(summary) {
    const totalProdEl = document.getElementById('totalProductsVal');
    const totalCatEl = document.getElementById('totalCategoriesVal');
    const totalStockEl = document.getElementById('totalStockVal');
    const totalValEl = document.getElementById('totalValueVal');
    const lowStockEl = document.getElementById('lowStockVal');

    if (totalProdEl) totalProdEl.textContent = summary.total_products || 0;
    if (totalCatEl) totalCatEl.textContent = summary.total_categories || 0;
    if (totalStockEl) totalStockEl.textContent = summary.total_stock || 0;
    if (totalValEl) totalValEl.textContent = formatCurrency(summary.inventory_value || 0);
    if (lowStockEl) lowStockEl.textContent = summary.low_stock_count || 0;
}

// Render Recent Products Data Table
function renderRecentProductsTable(products) {
    const tableBody = document.getElementById('recentProductsTableBody');
    if (!tableBody) return;

    if (!products || products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No products registered yet.</td></tr>`;
        return;
    }

    // Sort by recent created_at
    const sorted = [...products].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 5);

    tableBody.innerHTML = sorted.map(p => {
        const isLowStock = parseInt(p.quantity || 0) < 5;
        const stockBadge = isLowStock 
            ? `<span class="badge-stock badge-stock-low"><i class="bi bi-exclamation-triangle-fill"></i> ${p.quantity} Low</span>`
            : `<span class="badge-stock badge-stock-normal"><i class="bi bi-check-circle-fill"></i> ${p.quantity} In Stock</span>`;

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${p.image_url || 'https://via.placeholder.com/40'}" class="product-img-thumb" alt="${p.name}">
                        <div>
                            <div class="fw-bold text-light">${p.name}</div>
                            <small class="text-muted">${p.product_id}</small>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-secondary opacity-75">${p.category}</span></td>
                <td>${p.brand || 'N/A'}</td>
                <td class="fw-semibold text-info">${formatCurrency(p.price)}</td>
                <td>${stockBadge}</td>
                <td class="text-muted fs-7">${formatDate(p.created_at)}</td>
            </tr>
        `;
    }).join('');
}

// Render Stock Distribution Bar Chart using Chart.js
function renderStockChart(products) {
    const canvas = document.getElementById('stockDistributionChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (stockChart) stockChart.destroy();

    const topProducts = [...products].sort((a, b) => b.quantity - a.quantity).slice(0, 7);
    const labels = topProducts.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name);
    const quantities = topProducts.map(p => p.quantity);
    const backgroundColors = topProducts.map(p => p.quantity < 5 ? 'rgba(244, 63, 94, 0.85)' : 'rgba(124, 58, 237, 0.85)');

    stockChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Quantity',
                data: quantities,
                backgroundColor: backgroundColors,
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 27, 54, 0.95)',
                    titleColor: '#7c3aed',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { family: 'Inter' } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    ticks: { color: '#94a3b8', font: { family: 'Inter' } }
                }
            }
        }
    });
}

// Render Category Breakdown Doughnut/Pie Chart using Chart.js
function renderCategoryPieChart(products) {
    const canvas = document.getElementById('categoryPieChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (categoryPieChart) categoryPieChart.destroy();

    const catCounts = {};
    products.forEach(p => {
        const c = p.category || 'Uncategorized';
        catCounts[c] = (catCounts[c] || 0) + parseInt(p.quantity || 0);
    });

    const labels = Object.keys(catCounts);
    const dataVals = Object.values(catCounts);
    const palette = ['#7c3aed', '#a855f7', '#c084fc', '#34d399', '#fbbf24', '#f43f5e'];

    categoryPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataVals,
                backgroundColor: palette.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#0f1b36'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 15 }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 27, 54, 0.95)',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            cutout: '70%'
        }
    });
}
