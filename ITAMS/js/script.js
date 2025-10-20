// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Main content area and navigation links
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');

    // Ensure maintenance array exists in mockData
    if (!mockData.maintenance) mockData.maintenance = [];

    /**
     * Renders asset rows in inventory table
     */
    const displayAssets = (assetsToRender) => {
        const inventoryTbody = document.getElementById('inventory-tbody');
        if (!inventoryTbody) return;

        // Render each asset as a table row
        inventoryTbody.innerHTML = assetsToRender.map(asset => `
            <tr>
                <td>${asset.id}</td>
                <td>${asset.type}</td>
                <td>${asset.brand}</td>
                <td>${asset.model}</td>
                <td>${asset.serial}</td>
                <td>${asset.purchaseDate}</td>
                <td>$${asset.cost.toFixed(2)}</td>
                <td class="status-${asset.warrantyStatus.toLowerCase()}">${asset.warrantyStatus}</td>
                <td>
                    <span class="status-badge status-${asset.status.replace(/\s+/g, '-').toLowerCase()}">${asset.status}</span>
                </td>
                <td>${asset.assignee || 'Unassigned'}</td>
                <td class="actions">
                    <button class="btn-icon btn-edit" data-id="${asset.id}" title="Edit"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn-icon btn-delete" data-id="${asset.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    <button class="btn-icon btn-retire" data-id="${asset.id}" title="Retire"><i class="fa-solid fa-box-archive"></i></button>
                </td>
            </tr>
        `).join('');
    };

    // --- VIEW TEMPLATES / RENDERERS ---
    // Inventory section HTML
    const renderInventory = () => `
        <h2>Asset Inventory</h2>
        <div class="controls">
            <input type="text" id="searchInput" class="search-bar" placeholder="Search assets...">
            <button id="addAssetBtn" class="btn">Add New Asset</button>
        </div>
        <table class="inventory-table">
            <thead>
                <tr>
                    <th>Asset ID</th>
                    <th>Type</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Serial Number</th>
                    <th>Purchase Date</th>
                    <th>Cost</th>
                    <th>Warranty</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="inventory-tbody"></tbody>
        </table>
    `;

    // Dashboard section HTML
    const renderDashboard = () => {
        // Calculate asset stats
        const totalAssets = mockData.assets.length;
        const assignedAssets = mockData.assets.filter(a => a.assignee).length;
        const unassignedAssets = totalAssets - assignedAssets;
        // Count upcoming maintenance
        const today = new Date().toISOString().slice(0,10);
        const upcomingMaintenance = mockData.maintenance
            .filter(m => m.date >= today).length;

        // Dashboard widgets and chart
        return `
            <h2>Dashboard</h2>
            <p>An overview of all IT assets in the system.</p>
            <div class="dashboard-grid">
                <div class="dashboard-widgets">
                    <div class="widget">
                        <h3>Total Assets</h3>
                        <p class="widget-value">${totalAssets}</p>
                    </div>
                    <div class="widget">
                        <h3>Assigned</h3>
                        <p class="widget-value">${assignedAssets}</p>
                    </div>
                    <div class="widget">
                        <h3>Unassigned</h3>
                        <p class="widget-value">${unassignedAssets}</p>
                    </div>
                    <div class="widget">
                        <h3>Upcoming Maintenance</h3>
                        <p class="widget-value">${upcomingMaintenance}</p>
                    </div>
                </div>
                <div class="dashboard-chart-container">
                    <h3>Assets by Type</h3>
                    <canvas id="assetTypeChart"></canvas>
                </div>
            </div>
            <div class="dashboard-activities">
                <h3>Recent Activities</h3>
                <ul>
                    ${mockData.activities.map(a => `<li>${a.date}: ${a.text}</li>`).join('')}
                </ul>
            </div>
        `;
    };
    
    const renderAssignments = () => `
        <h2>Asset Assignments</h2>
        <div class="controls">
            <select id="assignAssetSelect"><option value="">Select Asset</option></select>
            <select id="assignUserSelect"><option value="">Select User</option></select>
            <button id="addUserBtn" class="btn" type="button">Add User</button>
            <select id="assignLocationSelect"><option value="">Select Location</option></select>
            <button id="addLocationBtn" class="btn" type="button">Add Location</button>
            <button id="assignBtn" class="btn">Assign</button>
        </div>
        <p>Assign assets to users or departments.</p>
        <table class="inventory-table">
            <thead>
                <tr>
                    <th>Asset ID</th>
                    <th>Assignee</th>
                    <th>Location</th>
                    <th>Assignment Date</th>
                </tr>
            </thead>
            <tbody id="assignment-tbody">
                <!-- Assignment history rows go here -->
            </tbody>
        </table>
    `;
    const renderMaintenance = () => `
        <h2>Maintenance Logging</h2>
        <button id="openMaintenanceModal" class="btn">Log Maintenance</button>
        <h3>Maintenance History</h3>
        <table class="inventory-table">
            <thead>
                <tr>
                    <th>Asset ID</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Cost</th>
                    <th>Technician</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="maintenance-tbody">
                <!-- Maintenance history rows go here -->
            </tbody>
        </table>
    `;
    const renderReports = () => `
        <h2>Reporting & Analytics</h2>
        <div class="controls">
            <label for="reportType">Report Type:</label>
            <select id="reportType">
                <option value="assets">Assets</option>
                <option value="assignments">Assignments</option>
                <option value="maintenance">Maintenance</option>
            </select>
            <button id="exportCSV" class="btn">Export CSV</button>
            <button id="exportPDF" class="btn">Export PDF</button>
        </div>
        <div id="reportPreview"></div>
        <p>Preview and export system reports.</p>
    `;

    // --- ROUTING LOGIC ---
    // Route definitions
    const routes = {
        dashboard: renderDashboard,
        inventory: renderInventory,
        assignments: renderAssignments,
        maintenance: renderMaintenance,
        reports: renderReports,
    };

    // Navigation function
    const navigate = (target) => {
        // Set main content HTML
        mainContent.innerHTML = routes[target] ? routes[target]() : `<h2>404 - Not Found</h2>`;

        // Dashboard chart rendering
        if (target === 'dashboard') {
            const assetTypes = mockData.assets.reduce((acc, asset) => {
                acc[asset.type] = (acc[asset.type] || 0) + 1;
                return acc;
            }, {});
            const ctx = document.getElementById('assetTypeChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(assetTypes),
                    datasets: [{
                        label: 'Assets by Type',
                        data: Object.values(assetTypes),
                        backgroundColor: [
                            '#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: { responsive: true }
            });
        }
        // Post-render logic for specific views
        if (target === 'inventory') {
            // 1. Initially display all assets
            displayAssets(mockData.assets);

            // 2. Add event listener for the search bar
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredAssets = mockData.assets.filter(asset => {
                    // Check if the search term exists in any of the asset's string values
                    return Object.values(asset).some(value => 
                        String(value).toLowerCase().includes(searchTerm)
                    );
                });
                // Re-render the table with only the filtered assets
                displayAssets(filteredAssets);
            });

            // 3. Add event listener for the "Add New Asset" button
            const addAssetBtn = document.getElementById('addAssetBtn');
            addAssetBtn.addEventListener('click', openAddAssetModal);

            // 4. Use event delegation for table actions (edit/delete)
            const inventoryTbody = document.getElementById('inventory-tbody');
            inventoryTbody.addEventListener('click', (e) => {
                const targetButton = e.target.closest('button');
                if (!targetButton) return; // Exit if the click wasn't on a button

                const assetId = targetButton.dataset.id;

                if (targetButton.classList.contains('btn-delete')) {
                    handleDeleteAsset(assetId);
                }
                if (targetButton.classList.contains('btn-retire')) {
                    handleRetireAsset(assetId);
                }
                if (targetButton.classList.contains('btn-edit')) {
                    openEditAssetModal(assetId);
                }
            });

        }
        if (target === 'assignments') {
            // Populate dropdowns
            const assetSelect = document.getElementById('assignAssetSelect');
            const userSelect = document.getElementById('assignUserSelect');
            const locationSelect = document.getElementById('assignLocationSelect');
            assetSelect.innerHTML = '<option value="">Select Asset</option>' +
                mockData.assets
                    .filter(a => a.status === 'Active')
                    .map(a => `<option value="${a.id}">${a.id} (${a.type} - ${a.model})</option>`).join('');
            userSelect.innerHTML = '<option value="">Select User</option>' +
                mockData.users.map(u => `<option value="${u.name}">${u.name} (${u.department})</option>`).join('');
            locationSelect.innerHTML = '<option value="">Select Location</option>' +
                mockData.locations.map(l => `<option value="${l}">${l}</option>`).join('');

            // Assignment button logic
            document.getElementById('assignBtn').onclick = () => {
                const assetId = assetSelect.value;
                const assignee = userSelect.value;
                const location = locationSelect.value;
                if (!assetId || !assignee || !location) {
                    alert('Please select asset, user, and location.');
                    return;
                }
                const asset = mockData.assets.find(a => a.id === assetId);
                if (asset) {
                    asset.assignee = assignee;
                    const date = new Date().toISOString().slice(0,10);
                    mockData.assignments.unshift({ assetId, assignee, location, date });
                    mockData.activities.unshift({ text: `Asset ${assetId} assigned to ${assignee} (${location})`, date });
                    displayAssignments();
                    alert(`Asset ${assetId} assigned to ${assignee} at ${location}.`);
                }
            };

            // Add User button logic
            document.getElementById('addUserBtn').onclick = () => {
                userModal.style.display = 'block';
            };
            addUserForm.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('userName').value.trim();
                const dept = document.getElementById('userDept').value.trim();
                if (name && dept) {
                    mockData.users.push({ name, department: dept });
                    userModal.style.display = 'none';
                    addUserForm.reset();
                    userSelect.innerHTML = '<option value="">Select User</option>' +
                        mockData.users.map(u => `<option value="${u.name}">${u.name} (${u.department})</option>`).join('');
                    alert('User added.');
                }
            };

            // Add Location button logic
            document.getElementById('addLocationBtn').onclick = () => {
                locationModal.style.display = 'block';
            };
            addLocationForm.onsubmit = (e) => {
                e.preventDefault();
                const loc = document.getElementById('locationName').value.trim();
                if (loc) {
                    mockData.locations.push(loc);
                    locationModal.style.display = 'none';
                    addLocationForm.reset();
                    locationSelect.innerHTML = '<option value="">Select Location</option>' +
                        mockData.locations.map(l => `<option value="${l}">${l}</option>`).join('');
                    alert('Location added.');
                }
            };

            // Display assignment history
            function displayAssignments() {
                const tbody = document.getElementById('assignment-tbody');
                tbody.innerHTML = mockData.assignments.map(a =>
                    `<tr>
                        <td>${a.assetId}</td>
                        <td>${a.assignee}</td>
                        <td>${a.location}</td>
                        <td>${a.date}</td>
                    </tr>`
                ).join('');
            }
            displayAssignments();
        }
        if (target === 'maintenance') {
            // Populate asset dropdown in maintenance modal
            const assetSelect = document.getElementById('maintenanceAssetId');
            if (assetSelect) {
                assetSelect.innerHTML = mockData.assets
                    .filter(a => a.status !== 'Retired')
                    .map(a => `<option value="${a.id}">${a.id} (${a.type})</option>`).join('');
            }
            // Add event listener for opening maintenance modal (must be inside this block)
            const openMaintenanceModalBtn = document.getElementById('openMaintenanceModal');
            if (openMaintenanceModalBtn) {
                openMaintenanceModalBtn.onclick = () => {
                    // Refresh asset dropdown each time modal opens
                    if (assetSelect) {
                        assetSelect.innerHTML = mockData.assets
                            .filter(a => a.status !== 'Retired')
                            .map(a => `<option value="${a.id}">${a.id} (${a.type})</option>`).join('');
                    }
                    logMaintenanceModal.style.display = 'block';
                };
            }
            // Refresh maintenance history table
            const maintenanceTbody = document.getElementById('maintenance-tbody');
            if (maintenanceTbody) {
                maintenanceTbody.innerHTML = mockData.maintenance.map((m, idx) =>
                    `<tr>
                        <td>${m.assetId}</td>
                        <td>${m.type}</td>
                        <td>${m.date}</td>
                        <td>${m.description}</td>
                        <td>${m.cost}</td>
                        <td>${m.technician}</td>
                        <td>
                            <button class="btn-icon btn-delete-maintenance" data-index="${idx}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`
                ).join('');
                // Add event listener for delete buttons
                maintenanceTbody.addEventListener('click', (e) => {
                    const btn = e.target.closest('.btn-delete-maintenance');
                    if (btn) {
                        const index = parseInt(btn.dataset.index, 10);
                        if (!isNaN(index)) {
                            if (confirm('Delete this maintenance record?')) {
                                mockData.maintenance.splice(index, 1);
                                navigate('maintenance');
                            }
                        }
                    }
                });
            }
        }
        if (target === 'reports') {
            const reportTypeSelect = document.getElementById('reportType');
            const reportPreview = document.getElementById('reportPreview');
            function renderReportTable(type) {
                let html = '';
                if (type === 'assets') {
                    html = `<table class="inventory-table"><thead><tr>
                        <th>Asset ID</th><th>Type</th><th>Brand</th><th>Model</th><th>Serial</th><th>Purchase Date</th><th>Cost</th><th>Status</th><th>Assignee</th>
                    </tr></thead><tbody>` +
                    mockData.assets.map(a => `<tr>
                        <td>${a.id}</td><td>${a.type}</td><td>${a.brand}</td><td>${a.model}</td><td>${a.serial}</td><td>${a.purchaseDate}</td><td>${a.cost}</td><td>${a.status}</td><td>${a.assignee || ''}</td>
                    </tr>`).join('') + `</tbody></table>`;
                } else if (type === 'assignments') {
                    html = `<table class="inventory-table"><thead><tr>
                        <th>Asset ID</th><th>Assignee</th><th>Location</th><th>Date</th>
                    </tr></thead><tbody>` +
                    mockData.assignments.map(a => `<tr>
                        <td>${a.assetId}</td><td>${a.assignee}</td><td>${a.location}</td><td>${a.date}</td>
                    </tr>`).join('') + `</tbody></table>`;
                } else if (type === 'maintenance') {
                    html = `<table class="inventory-table"><thead><tr>
                        <th>Asset ID</th><th>Type</th><th>Date</th><th>Description</th><th>Cost</th><th>Technician</th>
                    </tr></thead><tbody>` +
                    mockData.maintenance.map(m => `<tr>
                        <td>${m.assetId}</td><td>${m.type}</td><td>${m.date}</td><td>${m.description}</td><td>${m.cost}</td><td>${m.technician}</td>
                    </tr>`).join('') + `</tbody></table>`;
                }
                reportPreview.innerHTML = html;
            }
            // Initial preview
            renderReportTable(reportTypeSelect.value);
            reportTypeSelect.onchange = () => renderReportTable(reportTypeSelect.value);

            document.getElementById('exportCSV').onclick = () => {
                const type = reportTypeSelect.value;
                let csv = '';
                if (type === 'assets') {
                    csv = 'Asset ID,Type,Brand,Model,Serial,Purchase Date,Cost,Status,Assignee\n';
                    mockData.assets.forEach(a => {
                        csv += `${a.id},${a.type},${a.brand},${a.model},${a.serial},${a.purchaseDate},${a.cost},${a.status},${a.assignee || ''}\n`;
                    });
                } else if (type === 'assignments') {
                    csv = 'Asset ID,Assignee,Location,Date\n';
                    mockData.assignments.forEach(a => {
                        csv += `${a.assetId},${a.assignee},${a.location},${a.date}\n`;
                    });
                } else if (type === 'maintenance') {
                    csv = 'Asset ID,Type,Date,Description,Cost,Technician\n';
                    mockData.maintenance.forEach(m => {
                        csv += `${m.assetId},${m.type},${m.date},${m.description},${m.cost},${m.technician}\n`;
                    });
                }
                const blob = new Blob([csv], { type: 'text/csv' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${type}-report.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
            document.getElementById('exportPDF').onclick = () => {
                alert('PDF export not implemented in this demo.');
            };
        }
    };

    // --- EVENT LISTENERS ---
    // Navigation link click handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.currentTarget.dataset.target;
            navLinks.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
            navigate(target);
        });
    });

    // --- MODAL LOGIC ---
    // Asset modal elements
    const modal = document.getElementById('addAssetModal');
    const closeButton = document.querySelector('#addAssetModal .close-button');
    const addAssetForm = document.getElementById('addAssetForm');

    // User/Location modal elements
    const userModal = document.getElementById('addUserModal');
    const closeUserModalBtn = document.getElementById('closeUserModal');
    const addUserForm = document.getElementById('addUserForm');
    const locationModal = document.getElementById('addLocationModal');
    const closeLocationModalBtn = document.getElementById('closeLocationModal');
    const addLocationForm = document.getElementById('addLocationForm');

    // Edit asset modal elements
    const editAssetModal = document.getElementById('editAssetModal');
    const closeEditAssetModalBtn = document.getElementById('closeEditAssetModal');
    const editAssetForm = document.getElementById('editAssetForm');
    let editingAssetId = null;

    // Open asset modal
    const openAddAssetModal = () => {
        modal.style.display = 'block';
    };

    // Close asset modal
    const closeAddAssetModal = () => {
        modal.style.display = 'none';
        addAssetForm.reset();
    };

    closeButton.addEventListener('click', closeAddAssetModal);

    // User modal logic
    closeUserModalBtn.addEventListener('click', () => {
        userModal.style.display = 'none';
        addUserForm.reset();
    });

    // Location modal logic
    closeLocationModalBtn.addEventListener('click', () => {
        locationModal.style.display = 'none';
        addLocationForm.reset();
    });

    // Edit asset modal logic
    closeEditAssetModalBtn.addEventListener('click', () => {
        editAssetModal.style.display = 'none';
        editAssetForm.reset();
    });

    // Close modals when clicking outside modal content
    window.addEventListener('click', (event) => {
        if (event.target == modal) closeAddAssetModal();
        if (event.target == userModal) {
            userModal.style.display = 'none';
            addUserForm.reset();
        }
        if (event.target == locationModal) {
            locationModal.style.display = 'none';
            addLocationForm.reset();
        }
        if (event.target == editAssetModal) {
            editAssetModal.style.display = 'none';
            editAssetForm.reset();
        }
    });

    // Handle the form submission
    addAssetForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the default form submission

        // Generate a new asset ID (simple increment for mock data)
        const lastId = mockData.assets.length > 0 ? parseInt(mockData.assets[mockData.assets.length - 1].id.split('-')[1]) : 0;
        const newId = `IT-${String(lastId + 1).padStart(3, '0')}`;

        // Create a new asset object from the form values
        const newAsset = {
            id: newId,
            type: document.getElementById('assetType').value,
            brand: document.getElementById('assetBrand').value,
            model: document.getElementById('assetModel').value,
            serial: document.getElementById('assetSerial').value,
            purchaseDate: document.getElementById('assetPurchaseDate').value,
            cost: parseFloat(document.getElementById('assetCost').value),
            warrantyStatus: 'Active',
            status: document.getElementById('assetStatus').value,
            assignee: null
        };

        // Add the new asset to our mock data array
        mockData.assets.push(newAsset);
        mockData.activities.unshift({ text: `Asset ${newId} added`, date: new Date().toISOString().slice(0,10) });

        closeAddAssetModal(); // Close the modal
        displayAssets(mockData.assets); // Refresh the inventory table
    });

    // --- ASSET ACTION HANDLERS ---
    // Delete asset handler
    const handleDeleteAsset = (assetId) => {
        if (confirm(`Are you sure you want to delete asset ${assetId}? This action cannot be undone.`)) {
            const assetIndex = mockData.assets.findIndex(asset => asset.id === assetId);
            if (assetIndex > -1) {
                mockData.activities.unshift({ text: `Asset ${assetId} deleted`, date: new Date().toISOString().slice(0,10) });
                mockData.assets.splice(assetIndex, 1);
                const searchInput = document.getElementById('searchInput');
                searchInput.dispatchEvent(new Event('input'));
            }
        }
    };
    const handleRetireAsset = (assetId) => {
        const asset = mockData.assets.find(a => a.id === assetId);
        if (asset && asset.status !== 'Retired') {
            asset.status = 'Retired';
            mockData.activities.unshift({ text: `Asset ${assetId} retired`, date: new Date().toISOString().slice(0,10) });
            displayAssets(mockData.assets);
        }
    };

    // --- INITIAL LOAD ---
    // Show dashboard immediately on load
    navigate('dashboard');

    // Role select change handler
    document.getElementById('roleSelect').addEventListener('change', (e) => {
        document.querySelector('.header__user span').textContent = e.target.value;
    });

    // --- Edit Asset Modal Logic ---
    function openEditAssetModal(assetId) {
        const asset = mockData.assets.find(a => a.id === assetId);
        if (!asset) return;
        editingAssetId = assetId;
        // Only set values if elements exist
        const typeInput = document.getElementById('editAssetType');
        const brandInput = document.getElementById('editAssetBrand');
        const modelInput = document.getElementById('editAssetModel');
        const serialInput = document.getElementById('editAssetSerial');
        const purchaseDateInput = document.getElementById('editAssetPurchaseDate');
        const costInput = document.getElementById('editAssetCost');
        const statusInput = document.getElementById('editAssetStatus');
        if (typeInput && brandInput && modelInput && serialInput && purchaseDateInput && costInput && statusInput) {
            typeInput.value = asset.type;
            brandInput.value = asset.brand;
            modelInput.value = asset.model;
            serialInput.value = asset.serial;
            purchaseDateInput.value = asset.purchaseDate;
            costInput.value = asset.cost;
            statusInput.value = asset.status;
            editAssetModal.style.display = 'block';
        }
    }

    // Only add event listeners if elements exist
    if (closeEditAssetModalBtn && editAssetForm) {
        closeEditAssetModalBtn.addEventListener('click', () => {
            editAssetModal.style.display = 'none';
            editAssetForm.reset();
        });
        editAssetForm.onsubmit = (e) => {
            e.preventDefault();
            const asset = mockData.assets.find(a => a.id === editingAssetId);
            if (asset) {
                asset.type = document.getElementById('editAssetType').value;
                asset.brand = document.getElementById('editAssetBrand').value;
                asset.model = document.getElementById('editAssetModel').value;
                asset.serial = document.getElementById('editAssetSerial').value;
                asset.purchaseDate = document.getElementById('editAssetPurchaseDate').value;
                asset.cost = parseFloat(document.getElementById('editAssetCost').value);
                asset.status = document.getElementById('editAssetStatus').value;
                mockData.activities.unshift({ text: `Asset ${asset.id} edited`, date: new Date().toISOString().slice(0,10) });
                displayAssets(mockData.assets);
                editAssetModal.style.display = 'none';
                editAssetForm.reset();
            }
        };
    }

    // Maintenance modal logic
    const logMaintenanceModal = document.getElementById('logMaintenanceModal');
    const closeMaintenanceModalBtn = document.getElementById('closeMaintenanceModal');
    const logMaintenanceForm = document.getElementById('logMaintenanceForm');
    const openMaintenanceModalBtn = document.getElementById('openMaintenanceModal');

    closeMaintenanceModalBtn.addEventListener('click', () => {
        logMaintenanceModal.style.display = 'none';
        logMaintenanceForm.reset();
    });
    logMaintenanceForm.onsubmit = (e) => {
        e.preventDefault();
        const assetId = document.getElementById('maintenanceAssetId').value;
        const type = document.getElementById('maintenanceType').value;
        const date = document.getElementById('maintenanceDate').value;
        const description = document.getElementById('maintenanceDesc').value;
        const cost = document.getElementById('maintenanceCost').value;
        const technician = document.getElementById('maintenanceTech').value;
        mockData.maintenance.push({ assetId, type, date, description, cost, technician });
        mockData.activities.unshift({ text: `Maintenance logged for ${assetId}`, date });
        logMaintenanceModal.style.display = 'none';
        logMaintenanceForm.reset();

        // Refresh maintenance history table in maintenance view
        const maintenanceTbody = document.getElementById('maintenance-tbody');
        if (maintenanceTbody) {
            maintenanceTbody.innerHTML = mockData.maintenance.map(m =>
                `<tr>
                    <td>${m.assetId}</td>
                    <td>${m.type}</td>
                    <td>${m.date}</td>
                    <td>${m.description}</td>
                    <td>${m.cost}</td>
                    <td>${m.technician}</td>
                </tr>`
            ).join('');
        }

        // Refresh maintenance history in inventory view if present
        const assetMaintenanceHistory = document.getElementById('asset-maintenance-history');
        if (assetMaintenanceHistory) {
            assetMaintenanceHistory.innerHTML = mockData.maintenance.map(m =>
                `<tr>
                    <td>${m.assetId}</td>
                    <td>${m.type}</td>
                    <td>${m.date}</td>
                    <td>${m.description}</td>
                    <td>${m.cost}</td>
                    <td>${m.technician}</td>
                </tr>`
            ).join('');
        }
    };

    // --- Export CSV Logic ---
    function exportTableToCSV() {
        let csv = 'Asset ID,Type,Brand,Model,Serial,Purchase Date,Cost,Warranty,Status,Assignee\n';
        mockData.assets.forEach(a => {
            csv += `${a.id},${a.type},${a.brand},${a.model},${a.serial},${a.purchaseDate},${a.cost},${a.warrantyStatus},${a.status},${a.assignee || ''}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'assets.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
    
         
