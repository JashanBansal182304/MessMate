// Staff Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeStaffDashboard();
    setupNavigation();
    setupDateTimeDisplay();
    setupEventListeners();
    setupStaffChangePasswordForm();
    loadStaffData();
    loadInventoryData();
    loadFeedbackData();
    updateStats();
});

// Initialize staff dashboard
function initializeStaffDashboard() {
    // Check if staff is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(loggedInUser);
    if (user.userType !== 'STAFF') {
        alert('Access denied. Staff privileges required.');
        window.location.href = 'login.html';
        return;
    }
    
    displayStaffInfo(user);
}

// Display staff information
function displayStaffInfo(staff) {
    document.getElementById('staff-name').textContent = staff.name || 'Staff Member';
    document.getElementById('staff-shift').textContent = `Shift: ${staff.shift || 'Full Day'}`;
    
    // Set avatar initial
    const avatar = document.getElementById('staff-avatar');
    avatar.textContent = staff.name ? staff.name.charAt(0).toUpperCase() : '👤';
}

// Setup navigation functionality
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');
    const actionButtons = document.querySelectorAll('.action-btn');
    
    // Navigation click handlers
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionName = item.dataset.section;
            switchSection(sectionName, item, sections, sectionTitle);
        });
    });
    
    // Action button handlers
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionName = button.dataset.section;
            const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
            if (targetNavItem) {
                switchSection(sectionName, targetNavItem, sections, sectionTitle);
            }
        });
    });
}

// Switch between sections
function switchSection(sectionName, activeNavItem, sections, sectionTitle) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked nav item
    activeNavItem.classList.add('active');
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update section title
    const titles = {
        'overview': 'Staff Dashboard Overview',
        'daily-menu': 'Daily Menu Management',
        'meal-distribution': 'Meal Distribution Tracking',
        'student-orders': 'Student Orders Management',
        'inventory': 'Inventory Management',
        'feedback': 'Student Feedback Management',
        'profile': 'Staff Profile'
    };
    
    sectionTitle.textContent = titles[sectionName] || 'Staff Dashboard';
    
    // Load section-specific data
    if (sectionName === 'overview') {
        loadOverviewData();
    } else if (sectionName === 'daily-menu') {
        loadTodaysMenu();
    } else if (sectionName === 'meal-distribution') {
        loadMealDistributions();
    } else if (sectionName === 'student-orders') {
        setupOrdersDatePicker();
        loadStudentOrders();
    } else if (sectionName === 'inventory') {
        loadInventory();
    } else if (sectionName === 'feedback') {
        loadStaffFeedback();
    }
}

// Setup date/time display
function setupDateTimeDisplay() {
    function updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('current-datetime').textContent = now.toLocaleDateString('en-US', options);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    
    // Load overview data on initialization
    loadOverviewData();
    
    // Set today's date as default
    document.getElementById('menu-date').value = new Date().toISOString().split('T')[0];
}

// Setup event listeners
function setupEventListeners() {
    // Menu form
    document.getElementById('add-menu-form').addEventListener('submit', addMenuItem);
    
    // Inventory category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterInventory(e.target.dataset.category);
        });
    });
    
    // Feedback filters
    document.getElementById('feedback-filter-rating').addEventListener('change', filterFeedback);
    document.getElementById('feedback-filter-status').addEventListener('change', filterFeedback);
    
    // Item form
    document.getElementById('item-form').addEventListener('submit', saveInventoryItem);
    
    // Staff profile form
    document.getElementById('staff-profile-form').addEventListener('submit', updateStaffProfile);
}

// Load staff data
function loadStaffData() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        document.getElementById('profile-name').value = loggedInUser.name || '';
        document.getElementById('profile-email').value = loggedInUser.email || '';
        document.getElementById('profile-phone').value = loggedInUser.phone || '';
        document.getElementById('profile-shift').value = loggedInUser.shift || 'full';
        document.getElementById('profile-role').value = loggedInUser.userType || 'STAFF';
    }
}

// Update stats
function updateStats() {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {
        users: [],
        complaints: [],
        feedback: [],
        menus: []
    };
    
    const inventoryData = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const distributionData = JSON.parse(localStorage.getItem('meal_distributions')) || [];
    
    // Calculate stats
    const todaysMeals = getTodaysMenuItems().length;
    const mealsServed = getTodaysMealDistributions().length;
    const lowStockItems = inventoryData.filter(item => item.quantity <= item.minStock).length;
    // Load feedback stats asynchronously
    loadFeedbackStats();
    
    // Update UI
    document.getElementById('todays-meals').textContent = todaysMeals;
    document.getElementById('meals-served').textContent = mealsServed;
    document.getElementById('low-stock-items').textContent = lowStockItems;
    // Feedback stats loaded separately via loadFeedbackStats()
    
    // Update distribution stats
    document.getElementById('total-served-today').textContent = mealsServed;
    document.getElementById('remaining-meals').textContent = Math.max(0, todaysMeals * 50 - mealsServed); // Assuming 50 servings per item
}

// Daily Menu Management
async function loadTodaysMenu() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('menu-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = today;
    }
    
    const selectedDate = dateInput?.value || today;
    await loadMenuForDate(selectedDate);
}

async function loadMenuForDate(date = null) {
    const targetDate = date || document.getElementById('menu-date').value || new Date().toISOString().split('T')[0];
    const container = document.getElementById('daily-menu-list');
    
    try {
        console.log('Loading menu for date:', targetDate);
        
        // Fetch admin-created daily menus from backend
        const response = await fetch(`/api/menu/daily/date/${targetDate}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                container.innerHTML = '<div class="empty-state">No menu found for this date. Admin needs to create the daily menu first.</div>';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        console.log('Menu data received:', apiResponse);
        
        const menuData = apiResponse.data || [];
        
        if (menuData.length === 0) {
            container.innerHTML = '<div class="empty-state">No menu items found for this date</div>';
            return;
        }
        
        // Group menus by meal type for better display
        const menusByMealType = menuData.reduce((groups, menu) => {
            const mealType = menu.mealType;
            if (!groups[mealType]) {
                groups[mealType] = [];
            }
            groups[mealType].push(menu);
            return groups;
        }, {});
        
        container.innerHTML = Object.entries(menusByMealType).map(([mealType, menus]) => `
            <div class="meal-type-section">
                <h4 class="meal-type-header">${mealType}</h4>
                ${menus.map(menu => `
                    <div class="menu-item">
                        <div class="menu-info">
                            <div class="menu-name">${formatDate(menu.menuDate)} - ${menu.mealType}</div>
                            <div class="menu-items-list">
                                ${menu.menuItems ? menu.menuItems.map(item => `
                                    <div class="menu-item-detail">
                                        <span class="item-name">${item.name}</span>
                                        <span class="item-price">₹${item.price}</span>
                                        <span class="item-category">${item.category}</span>
                                    </div>
                                `).join('') : '<div class="no-items">No items added</div>'}
                            </div>
                            <div class="menu-meta">
                                <span class="total-price">Total: ₹${menu.menuItems ? menu.menuItems.reduce((sum, item) => sum + item.price, 0).toFixed(2) : '0.00'}</span>
                                <span class="menu-status ${menu.isActive ? 'active' : 'inactive'}">
                                    ${menu.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <div class="menu-actions">
                            <span class="created-at">Created: ${formatDate(menu.createdAt)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading menu for date:', error);
        container.innerHTML = '<div class="error-state">Error loading menu data. Please try again.</div>';
    }
}

async function addMenuItem(e) {
    e.preventDefault();
    
    const menuData = {
        name: document.getElementById('menu-item-name').value,
        description: document.getElementById('menu-item-name').value + ' - Added by staff',
        price: 0.0, // Default price, can be updated later
        mealType: document.getElementById('menu-meal-type').value.toUpperCase(),
        category: 'MAIN_COURSE', // Default category
        isAvailable: true,
        isVegetarian: true // Default to vegetarian
    };
    
    try {
        const response = await fetch('/api/menu/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(menuData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            const createdItem = result.data;
            
            // Also create/update daily menu for the selected date
            const selectedDate = document.getElementById('menu-date').value;
            const selectedMealType = document.getElementById('menu-meal-type').value.toUpperCase();
            
            await createOrUpdateDailyMenu(selectedDate, selectedMealType, [createdItem.id]);
            
            // Reset form
            document.getElementById('add-menu-form').reset();
            document.getElementById('menu-date').value = new Date().toISOString().split('T')[0];
            
            // Reload menu
            loadTodaysMenu();
            updateStats();
            
            showNotification('Menu item added successfully and added to daily menu for ' + selectedDate + '!', 'success');
        } else {
            showNotification('Error adding menu item: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error adding menu item:', error);
        showNotification('Network error. Please check if the server is running and try again.', 'error');
    }
}

async function updateMenuItemAvailability(itemId, isAvailable) {
    try {
        const response = await fetch(`/api/menu/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: itemId,
                isAvailable: isAvailable
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            loadTodaysMenu();
            updateStats();
            showNotification(`Menu item ${isAvailable ? 'marked as available' : 'marked as unavailable'}`, 'success');
        } else {
            showNotification('Error updating menu item: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error updating menu item:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Function to create or update daily menu with new items
async function createOrUpdateDailyMenu(date, mealType, newItemIds) {
    try {
        // First, check if daily menu already exists for this date and meal type
        const checkResponse = await fetch(`/api/menu/daily/date/${date}`);
        const checkResult = await checkResponse.json();
        
        let existingMenu = null;
        let existingItemIds = [];
        
        if (checkResponse.ok && checkResult.success && checkResult.data) {
            existingMenu = checkResult.data.find(menu => menu.mealType === mealType);
            if (existingMenu && existingMenu.menuItems) {
                existingItemIds = existingMenu.menuItems.map(item => item.id);
            }
        }
        
        // Combine existing items with new items (avoid duplicates)
        const allItemIds = [...new Set([...existingItemIds, ...newItemIds])];
        
        const dailyMenuData = {
            menuDate: date,
            mealType: mealType.toUpperCase(),
            menuItems: allItemIds.map(id => ({ id: id })),
            isActive: true
        };
        
        const response = await fetch('/api/menu/daily', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dailyMenuData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('Daily menu created/updated successfully!');
            return result.data;
        } else {
            console.error('Error creating daily menu:', result.message);
            return null;
        }
    } catch (error) {
        console.error('Error creating daily menu:', error);
        return null;
    }
}

// Function to create daily menu for a specific date and meal type
async function createDailyMenuForDate(date, mealType, menuItemIds) {
    return await createOrUpdateDailyMenu(date, mealType, menuItemIds);
}

// Function to add existing menu item to daily menu
async function addToDailyMenu(itemId, mealType, date) {
    try {
        await createOrUpdateDailyMenu(date, mealType, [itemId]);
        showNotification('Item added to daily menu successfully!', 'success');
        loadMenuForDate(date);
    } catch (error) {
        console.error('Error adding to daily menu:', error);
        showNotification('Error adding item to daily menu', 'error');
    }
}

function getMenuForDate(date) {
    const staffMenuData = JSON.parse(localStorage.getItem('staff_menu_data')) || [];
    return staffMenuData.filter(item => item.date === date);
}

function getTodaysMenuItems() {
    const today = new Date().toISOString().split('T')[0];
    return getMenuForDate(today);
}

// Meal Distribution Management
function loadMealDistributions() {
    const distributions = getTodaysMealDistributions();
    const container = document.getElementById('recent-distributions');
    
    if (distributions.length === 0) {
        container.innerHTML = '<div class="empty-state">No meals distributed today</div>';
        return;
    }
    
    container.innerHTML = distributions.slice(-10).reverse().map(dist => `
        <div class="distribution-item">
            <div>
                <div class="distribution-student">${dist.studentName}</div>
                <div class="distribution-meal">${dist.mealType} - ${dist.itemName}</div>
            </div>
            <div class="distribution-time">${new Date(dist.timestamp).toLocaleTimeString()}</div>
        </div>
    `).join('');
    
    // Update meal summary
    updateMealSummary(distributions);
}

function markMealServed() {
    const studentId = document.getElementById('student-id-input').value.trim();
    
    if (!studentId) {
        showNotification('Please enter a student ID or roll number', 'error');
        return;
    }
    
    // Get admin data to find student
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { users: [] };
    const student = adminData.users.find(u => 
        u.rollNumber === studentId || 
        u.id.toString() === studentId ||
        u.email === studentId
    );
    
    if (!student) {
        showNotification('Student not found', 'error');
        return;
    }
    
    // Check for duplicate entry today
    const today = new Date().toISOString().split('T')[0];
    const distributions = getTodaysMealDistributions();
    const duplicate = distributions.find(d => 
        d.studentId === student.id && 
        d.date === today &&
        d.mealType === getCurrentMealType()
    );
    
    if (duplicate) {
        showNotification('Meal already marked for this student today', 'error');
        return;
    }
    
    // Create distribution record
    const distribution = {
        id: Date.now(),
        studentId: student.id,
        studentName: student.name,
        studentRollNumber: student.rollNumber,
        mealType: getCurrentMealType(),
        itemName: 'Standard Meal',
        date: today,
        timestamp: new Date().toISOString(),
        markedBy: 'staff'
    };
    
    // Save distribution
    let distributions_data = JSON.parse(localStorage.getItem('meal_distributions')) || [];
    distributions_data.push(distribution);
    localStorage.setItem('meal_distributions', JSON.stringify(distributions_data));
    
    // Clear input and reload
    document.getElementById('student-id-input').value = '';
    loadMealDistributions();
    updateStats();
    
    showNotification(`Meal marked for ${student.name}`, 'success');
}

function getCurrentMealType() {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return 'breakfast';
    if (hour >= 12 && hour < 15) return 'lunch';
    if (hour >= 19 && hour < 22) return 'dinner';
    return 'general';
}

function getTodaysMealDistributions() {
    const today = new Date().toISOString().split('T')[0];
    const distributions = JSON.parse(localStorage.getItem('meal_distributions')) || [];
    return distributions.filter(d => d.date === today);
}

function updateMealSummary(distributions) {
    const summary = distributions.reduce((acc, dist) => {
        acc[dist.mealType] = (acc[dist.mealType] || 0) + 1;
        return acc;
    }, {});
    
    const summaryGrid = document.getElementById('meal-summary-grid');
    summaryGrid.innerHTML = Object.entries(summary).map(([meal, count]) => `
        <div class="summary-card">
            <div class="summary-meal">${meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
            <div class="summary-count">${count}</div>
        </div>
    `).join('');
}

// Inventory Management
function loadInventoryData() {
    // Initialize default inventory if empty
    let inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    
    if (inventory.length === 0) {
        inventory = getDefaultInventory();
        localStorage.setItem('mess_inventory', JSON.stringify(inventory));
    }
    
    loadInventory();
    showLowStockAlerts();
}

function getDefaultInventory() {
    return [
        { id: 1, name: 'Rice', category: 'grains', quantity: 50, unit: 'kg', minStock: 10 },
        { id: 2, name: 'Wheat Flour', category: 'grains', quantity: 30, unit: 'kg', minStock: 5 },
        { id: 3, name: 'Dal (Lentils)', category: 'grains', quantity: 25, unit: 'kg', minStock: 5 },
        { id: 4, name: 'Onions', category: 'vegetables', quantity: 20, unit: 'kg', minStock: 5 },
        { id: 5, name: 'Potatoes', category: 'vegetables', quantity: 40, unit: 'kg', minStock: 10 },
        { id: 6, name: 'Tomatoes', category: 'vegetables', quantity: 15, unit: 'kg', minStock: 5 },
        { id: 7, name: 'Salt', category: 'spices', quantity: 5, unit: 'kg', minStock: 1 },
        { id: 8, name: 'Turmeric', category: 'spices', quantity: 2, unit: 'kg', minStock: 0.5 },
        { id: 9, name: 'Milk', category: 'dairy', quantity: 20, unit: 'liters', minStock: 5 },
        { id: 10, name: 'Oil', category: 'others', quantity: 10, unit: 'liters', minStock: 2 }
    ];
}

function loadInventory() {
    const inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const container = document.getElementById('inventory-list');
    
    if (inventory.length === 0) {
        container.innerHTML = '<div class="empty-state">No inventory items found</div>';
        return;
    }
    
    container.innerHTML = inventory.map(item => {
        const stockStatus = getStockStatus(item);
        return `
            <div class="inventory-item">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-category">${item.category}</div>
                </div>
                <div class="item-stock">${item.quantity}</div>
                <div class="item-unit">${item.unit}</div>
                <div class="stock-status ${stockStatus}">${stockStatus.charAt(0).toUpperCase() + stockStatus.slice(1)}</div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editInventoryItem(${item.id})">Edit</button>
                    <button class="update-btn" onclick="quickUpdateStock(${item.id})">Update</button>
                </div>
            </div>
        `;
    }).join('');
}

function getStockStatus(item) {
    if (item.quantity <= item.minStock) return 'low';
    if (item.quantity <= item.minStock * 2) return 'medium';
    return 'good';
}

function filterInventory(category) {
    const inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const filtered = category === 'all' ? inventory : inventory.filter(item => item.category === category);
    
    const container = document.getElementById('inventory-list');
    container.innerHTML = filtered.map(item => {
        const stockStatus = getStockStatus(item);
        return `
            <div class="inventory-item">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-category">${item.category}</div>
                </div>
                <div class="item-stock">${item.quantity}</div>
                <div class="item-unit">${item.unit}</div>
                <div class="stock-status ${stockStatus}">${stockStatus.charAt(0).toUpperCase() + stockStatus.slice(1)}</div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editInventoryItem(${item.id})">Edit</button>
                    <button class="update-btn" onclick="quickUpdateStock(${item.id})">Update</button>
                </div>
            </div>
        `;
    }).join('');
}

function showLowStockAlerts() {
    const inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
    
    const alertsContainer = document.getElementById('low-stock-alerts');
    
    if (lowStockItems.length === 0) {
        alertsContainer.innerHTML = '';
        return;
    }
    
    alertsContainer.innerHTML = lowStockItems.map(item => `
        <div class="alert-item">
            <span><strong>${item.name}</strong> is running low (${item.quantity} ${item.unit} remaining)</span>
            <button onclick="quickUpdateStock(${item.id})" class="update-btn">Update Stock</button>
        </div>
    `).join('');
}

function addNewItem() {
    document.getElementById('modal-title').textContent = 'Add New Item';
    document.getElementById('item-form').reset();
    document.getElementById('item-modal').style.display = 'block';
}

function editInventoryItem(itemId) {
    const inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const item = inventory.find(i => i.id === itemId);
    
    if (item) {
        document.getElementById('modal-title').textContent = 'Edit Item';
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-unit').value = item.unit;
        document.getElementById('item-min-stock').value = item.minStock;
        
        // Store item id for editing
        document.getElementById('item-form').dataset.editId = itemId;
        document.getElementById('item-modal').style.display = 'block';
    }
}

function quickUpdateStock(itemId) {
    const newQuantity = prompt('Enter new stock quantity:');
    if (newQuantity && !isNaN(newQuantity)) {
        updateInventoryStock(itemId, parseFloat(newQuantity));
    }
}

function updateInventoryStock(itemId, newQuantity) {
    let inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const item = inventory.find(i => i.id === itemId);
    
    if (item) {
        item.quantity = newQuantity;
        item.updatedAt = new Date().toISOString();
        localStorage.setItem('mess_inventory', JSON.stringify(inventory));
        
        loadInventory();
        showLowStockAlerts();
        updateStats();
        showNotification(`Stock updated for ${item.name}`, 'success');
    }
}

function saveInventoryItem(e) {
    e.preventDefault();
    
    let inventory = JSON.parse(localStorage.getItem('mess_inventory')) || [];
    const editId = e.target.dataset.editId;
    
    const itemData = {
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        quantity: parseFloat(document.getElementById('item-quantity').value),
        unit: document.getElementById('item-unit').value,
        minStock: parseFloat(document.getElementById('item-min-stock').value)
    };
    
    if (editId) {
        // Edit existing item
        const itemIndex = inventory.findIndex(i => i.id == editId);
        if (itemIndex !== -1) {
            inventory[itemIndex] = { ...inventory[itemIndex], ...itemData, updatedAt: new Date().toISOString() };
        }
        delete e.target.dataset.editId;
    } else {
        // Add new item
        itemData.id = Date.now();
        itemData.createdAt = new Date().toISOString();
        inventory.push(itemData);
    }
    
    localStorage.setItem('mess_inventory', JSON.stringify(inventory));
    closeModal();
    loadInventory();
    showLowStockAlerts();
    updateStats();
    
    showNotification('Inventory item saved successfully!', 'success');
}

function closeModal() {
    document.getElementById('item-modal').style.display = 'none';
}

// Feedback Management
function loadFeedbackData() {
    loadStaffFeedback();
    loadFeedbackStats();
}

async function loadStaffFeedback() {
    try {
        // Show loading state
        document.getElementById('staff-feedback-list').innerHTML = '<div class="loading-state">Loading feedback...</div>';
        
        const response = await fetch('/api/feedback/all');
        if (response.ok) {
            const result = await response.json();
            console.log('Staff Feedback API response:', result);
            
            if (result.success && result.data) {
                displayFeedbackList(result.data);
            } else {
                document.getElementById('staff-feedback-list').innerHTML = '<div class="empty-state">No feedback received yet</div>';
            }
        } else {
            console.error('Failed to load feedback');
            document.getElementById('staff-feedback-list').innerHTML = '<div class="error-state">Failed to load feedback</div>';
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
        document.getElementById('staff-feedback-list').innerHTML = '<div class="error-state">Error loading feedback</div>';
    }
}

function displayFeedbackList(feedback) {
    const container = document.getElementById('staff-feedback-list');
    
    if (feedback.length === 0) {
        container.innerHTML = '<div class="empty-state">No feedback received yet</div>';
        return;
    }
    
    container.innerHTML = feedback.map(fb => `
        <div class="feedback-item" onclick="viewFeedbackDetails(${fb.id})">
            <div class="feedback-header">
                <span class="feedback-student">${fb.studentName || 'Unknown Student'}</span>
                <span class="feedback-rating">${'★'.repeat(fb.rating || 0)}${'☆'.repeat(5-(fb.rating || 0))}</span>
            </div>
            <div class="feedback-content">${fb.message || 'No message provided'}</div>
            <div class="feedback-meta">
                <span>${formatDate(fb.createdAt)}</span>
                <span class="feedback-type">${(fb.feedbackType || 'GENERAL').replace('_', ' ')}</span>
                <span class="feedback-status ${(fb.status || 'PENDING').toLowerCase()}">${fb.status || 'PENDING'}</span>
            </div>
        </div>
    `).join('');
}

async function filterFeedback() {
    const ratingFilter = document.getElementById('feedback-filter-rating').value;
    const statusFilter = document.getElementById('feedback-filter-status').value;
    
    try {
        let url = '/api/feedback/all';
        const params = new URLSearchParams();
        
        if (ratingFilter) {
            params.append('rating', ratingFilter);
        }
        
        if (statusFilter) {
            params.append('status', statusFilter);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        if (response.ok) {
            const feedback = await response.json();
            displayFeedbackList(feedback);
        } else {
            console.error('Failed to filter feedback');
        }
    } catch (error) {
        console.error('Error filtering feedback:', error);
    }
}

let currentFeedbackId = null;

async function viewFeedbackDetails(feedbackId) {
    try {
        const response = await fetch(`/api/feedback/${feedbackId}`);
        if (response.ok) {
            const result = await response.json();
            console.log('Feedback details API response:', result);
            
            if (result.success && result.data) {
                const feedback = result.data;
                currentFeedbackId = feedbackId;
                
                document.getElementById('feedback-details').innerHTML = `
                    <div class="feedback-detail">
                        <h4>From: ${feedback.studentName || 'Unknown Student'}</h4>
                        <div class="feedback-info">
                            <span><strong>Email:</strong> ${feedback.studentEmail || 'N/A'}</span>
                            <span><strong>Type:</strong> ${(feedback.feedbackType || 'GENERAL').replace('_', ' ')}</span>
                            <span><strong>Rating:</strong> ${'★'.repeat(feedback.rating || 0)}${'☆'.repeat(5-(feedback.rating || 0))} (${feedback.rating || 0}/5)</span>
                            <span><strong>Status:</strong> ${feedback.status || 'PENDING'}</span>
                        </div>
                        <div class="feedback-message">
                            <strong>Message:</strong>
                            <p>${feedback.message || 'No message provided'}</p>
                        </div>
                        ${feedback.staffReply ? `
                            <div class="staff-reply">
                                <strong>Staff Reply:</strong>
                                <p>${feedback.staffReply}</p>
                                <small>Replied by: ${feedback.repliedByName || 'Staff'} on ${formatDate(feedback.repliedAt)}</small>
                            </div>
                        ` : ''}
                        <div class="feedback-timestamp">
                            <small>Submitted: ${formatDate(feedback.createdAt)}</small>
                        </div>
                    </div>
                `;
                
                document.getElementById('feedback-modal').style.display = 'block';
            } else {
                showNotification('Failed to load feedback details', 'error');
            }
        } else {
            showNotification('Failed to load feedback details', 'error');
        }
    } catch (error) {
        console.error('Error loading feedback details:', error);
        showNotification('Error loading feedback details', 'error');
    }
}

async function markAsRead() {
    await updateFeedbackStatus(currentFeedbackId, 'REVIEWED');
}

async function forwardToAdmin() {
    await updateFeedbackStatus(currentFeedbackId, 'RESOLVED');
    showNotification('Feedback marked as resolved', 'success');
}

function replyToFeedback() {
    document.getElementById('reply-section').style.display = 'block';
}

async function sendReply() {
    const replyText = document.getElementById('reply-text').value;
    if (!replyText.trim()) {
        showNotification('Please enter a reply message', 'error');
        return;
    }
    
    await sendFeedbackReply(currentFeedbackId, replyText);
    closeFeedbackModal();
}

async function updateFeedbackStatus(feedbackId, status) {
    try {
        const response = await fetch(`/api/feedback/${feedbackId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        });
        
        if (response.ok) {
            showNotification('Feedback status updated', 'success');
            loadStaffFeedback();
            loadFeedbackStats();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Error updating feedback status:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

async function sendFeedbackReply(feedbackId, replyMessage) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    try {
        const response = await fetch(`/api/feedback/${feedbackId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                staffEmail: loggedInUser.email || 'staff@messmate.com',
                reply: replyMessage
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Reply sent successfully', 'success');
                loadStaffFeedback();
                loadFeedbackStats();
            } else {
                showNotification(result.message || 'Failed to send reply', 'error');
            }
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to send reply', 'error');
        }
    } catch (error) {
        console.error('Error sending reply:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function closeFeedbackModal() {
    document.getElementById('feedback-modal').style.display = 'none';
    document.getElementById('reply-section').style.display = 'none';
    document.getElementById('reply-text').value = '';
    currentFeedbackId = null;
}

// Load feedback statistics for overview
async function loadFeedbackStats() {
    try {
        const response = await fetch('/api/feedback/stats/pending-count');
        if (response.ok) {
            const result = await response.json();
            console.log('Feedback stats API response:', result);
            
            if (result.success) {
                const pendingCount = result.data || 0;
                const pendingElement = document.getElementById('pending-feedback');
                if (pendingElement) {
                    pendingElement.textContent = pendingCount;
                }
            } else {
                console.error('Failed to load feedback stats');
                const pendingElement = document.getElementById('pending-feedback');
                if (pendingElement) {
                    pendingElement.textContent = '0';
                }
            }
        } else {
            console.error('Failed to load feedback stats');
            const pendingElement = document.getElementById('pending-feedback');
            if (pendingElement) {
                pendingElement.textContent = '0';
            }
        }
    } catch (error) {
        console.error('Error loading feedback stats:', error);
        const pendingElement = document.getElementById('pending-feedback');
        if (pendingElement) {
            pendingElement.textContent = '0';
        }
    }
}

// Profile Management
function updateStaffProfile(e) {
    e.preventDefault();
    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const updatedUser = {
        ...loggedInUser,
        phone: document.getElementById('profile-phone').value,
        shift: document.getElementById('profile-shift').value
    };
    
    localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    displayStaffInfo(updatedUser);
    showNotification('Profile updated successfully!', 'success');
}

// Utility Functions
function refreshData() {
    const currentSection = document.querySelector('.nav-item.active')?.dataset.section || 'overview';
    
    if (currentSection === 'overview') {
        loadOverviewData();
    } else if (currentSection === 'daily-menu') {
        loadMenuForDate();
    } else if (currentSection === 'student-orders') {
        loadStudentOrders();
    } else {
        // Legacy refresh for other sections
        updateStats();
        loadTodaysMenu();
        loadMealDistributions();
        loadInventory();
        showLowStockAlerts();
        loadStaffFeedback();
    }
    
    showNotification('Data refreshed!', 'success');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 6px;
        z-index: 3000;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }
}

// Setup staff change password form
function setupStaffChangePasswordForm() {
    const changePasswordForm = document.getElementById('staff-change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('staff-current-password').value;
            const newPassword = document.getElementById('staff-new-password').value;
            const confirmPassword = document.getElementById('staff-confirm-password').value;
            
            // Validate passwords
            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match!', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('Password must be at least 6 characters long!', 'error');
                return;
            }
            
            // Get current user data
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (!loggedInUser || loggedInUser.userType !== 'STAFF') {
                showNotification('Staff user not found!', 'error');
                return;
            }
            
            // Verify current password
            if (currentPassword !== loggedInUser.password) {
                showNotification('Current password is incorrect!', 'error');
                return;
            }
            
            // Update password in localStorage
            loggedInUser.password = newPassword;
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            
            // Update in admin data if it exists (staff members created by admin)
            const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
            if (adminData.staff) {
                const staffIndex = adminData.staff.findIndex(s => s.email === loggedInUser.email || s.staffId === loggedInUser.staffId);
                if (staffIndex !== -1) {
                    adminData.staff[staffIndex].password = newPassword;
                    adminData.lastUpdated = new Date().toISOString();
                    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
                }
            }
            
            // Clear form
            changePasswordForm.reset();
            
            showNotification('Password changed successfully!', 'success');
        });
    }
}

// Student Orders Management Functions
function setupOrdersDatePicker() {
    const dateInput = document.getElementById('orders-date');
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
}

async function loadStudentOrders() {
    const selectedDate = document.getElementById('orders-date').value || new Date().toISOString().split('T')[0];
    
    // Show loading state
    showLoadingState(true);
    hideEmptyState();
    
    try {
        console.log('Loading student orders for date:', selectedDate);
        
        // Fetch booking statistics for the selected date
        const response = await fetch(`/api/menu/bookings/stats/${selectedDate}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                displayEmptyOrders();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        console.log('Booking stats received:', apiResponse);
        
        const bookingStats = apiResponse.data || [];
        
        if (!bookingStats || bookingStats.length === 0) {
            displayEmptyOrders();
            return;
        }
        
        // Hide loading state
        showLoadingState(false);
        
        // Initialize order counts
        let totalQuantity = 0;
        const ordersByMeal = {
            breakfast: { count: 0, quantity: 0, bookings: 0 },
            lunch: { count: 0, quantity: 0, bookings: 0 },
            dinner: { count: 0, quantity: 0, bookings: 0 }
        };
        
        // Process booking statistics
        bookingStats.forEach(stat => {
            const mealKey = stat.mealType.toLowerCase();
            if (ordersByMeal[mealKey]) {
                ordersByMeal[mealKey].quantity = stat.totalQuantity || 0;
                ordersByMeal[mealKey].bookings = stat.totalBookings || 0;
                totalQuantity += stat.totalQuantity || 0;
            }
        });
        
        // Update summary counts
        document.getElementById('total-orders-count').textContent = totalQuantity;
        document.getElementById('breakfast-orders-count').textContent = ordersByMeal.breakfast.quantity;
        document.getElementById('lunch-orders-count').textContent = ordersByMeal.lunch.quantity;
        document.getElementById('dinner-orders-count').textContent = ordersByMeal.dinner.quantity;
        
        // Display booking information for each meal type
        displayOrdersForMeal('breakfast', ordersByMeal.breakfast, selectedDate);
        displayOrdersForMeal('lunch', ordersByMeal.lunch, selectedDate);
        displayOrdersForMeal('dinner', ordersByMeal.dinner, selectedDate);
        
        // Show the detailed view
        const ordersDisplay = document.getElementById('orders-display');
        if (ordersDisplay) ordersDisplay.style.display = 'block';
        
        console.log('Student orders loaded successfully');
        showNotification(`Loaded bookings for ${selectedDate}`, 'success');
        
    } catch (error) {
        console.error('Error loading student orders:', error);
        showNotification('Error loading student orders. Please try again.', 'error');
        displayErrorOrders();
    }
}

function displayEmptyOrders() {
    console.log('Displaying empty orders state');
    
    // Hide loading state
    showLoadingState(false);
    
    // Reset all counts to 0
    document.getElementById('total-orders-count').textContent = '0';
    document.getElementById('breakfast-orders-count').textContent = '0';
    document.getElementById('lunch-orders-count').textContent = '0';
    document.getElementById('dinner-orders-count').textContent = '0';
    
    // Hide detailed view and show empty state
    const ordersDisplay = document.getElementById('orders-display');
    const ordersByMeal = document.getElementById('orders-by-meal');
    const emptyState = document.getElementById('empty-state');
    
    if (ordersDisplay) ordersDisplay.style.display = 'block';
    if (ordersByMeal) ordersByMeal.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    
    const selectedDate = document.getElementById('orders-date').value || new Date().toISOString().split('T')[0];
    if (emptyState) {
        emptyState.innerHTML = `
            <div class="empty-icon">📝</div>
            <h3>No Bookings Found</h3>
            <p>No meal bookings found for <strong>${selectedDate}</strong></p>
            <small>Students haven't made any reservations for this date yet</small>
            <button onclick="loadStudentOrders()" class="refresh-btn">
                🔄 Refresh
            </button>
        `;
    }
}

function displayErrorOrders() {
    // Hide loading state
    showLoadingState(false);
    
    // Reset all counts to 0
    document.getElementById('total-orders-count').textContent = '0';
    document.getElementById('breakfast-orders-count').textContent = '0';
    document.getElementById('lunch-orders-count').textContent = '0';
    document.getElementById('dinner-orders-count').textContent = '0';
    
    // Hide detailed view and show error state
    const ordersDisplay = document.getElementById('orders-display');
    const ordersByMeal = document.getElementById('orders-by-meal');
    const emptyState = document.getElementById('empty-state');
    
    if (ordersDisplay) ordersDisplay.style.display = 'block';
    if (ordersByMeal) ordersByMeal.style.display = 'none';
    if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <div class="empty-icon">❌</div>
            <h3>Error Loading Bookings</h3>
            <p>Unable to fetch booking data. Please check your connection and try again.</p>
            <button onclick="loadStudentOrders()" class="refresh-btn">
                🔄 Try Again
            </button>
        `;
        emptyState.classList.add('error-state');
    }
}

async function displayOrdersForMeal(mealType, orderData, selectedDate) {
    const container = document.getElementById(`${mealType}-orders-list`);
    
    if (orderData.quantity === 0) {
        container.innerHTML = '<div class="no-orders">No bookings for this meal</div>';
        return;
    }
    
    try {
        // Fetch detailed booking data for this meal type and date
        const response = await fetch(`/api/menu/daily/date/${selectedDate}`);
        
        if (!response.ok) {
            container.innerHTML = '<div class="no-orders">Menu not available for this date</div>';
            return;
        }
        
        const apiResponse = await response.json();
        const menus = apiResponse.data || [];
        
        // Find the menu for this meal type
        const mealMenu = menus.find(menu => menu.mealType.toLowerCase() === mealType);
        
        if (!mealMenu) {
            container.innerHTML = '<div class="no-orders">No menu available for this meal type</div>';
            return;
        }
        
        // Display booking summary with menu information
        container.innerHTML = `
            <div class="booking-summary-card">
                <div class="booking-header">
                    <div class="booking-title">
                        <h5>${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Bookings</h5>
                        <span class="booking-date">${formatDate(selectedDate)}</span>
                    </div>
                    <div class="booking-stats">
                        <span class="total-quantity">${orderData.quantity} meals</span>
                        <span class="total-bookings">${orderData.bookings} students</span>
                    </div>
                </div>
                
                <div class="menu-details">
                    <h6>Available Menu Items:</h6>
                    <div class="menu-items-grid">
                        ${mealMenu.menuItems.map(item => `
                            <div class="menu-item-card">
                                <div class="item-info">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-price">₹${item.price}</span>
                                </div>
                                <div class="item-details">
                                    <span class="item-category">${item.category}</span>
                                    <span class="item-type ${item.isVegetarian ? 'veg' : 'non-veg'}">
                                        ${item.isVegetarian ? '🟢 VEG' : '🔴 NON-VEG'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="booking-actions">
                    <button class="action-btn export-btn" onclick="exportMealBookings('${mealType}', '${selectedDate}')">
                        📊 Export Bookings
                    </button>
                    <button class="action-btn notify-btn" onclick="notifyStudents('${mealType}', '${selectedDate}')">
                        📢 Notify Students
                    </button>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading meal details:', error);
        container.innerHTML = `
            <div class="booking-summary-card">
                <div class="booking-header">
                    <div class="booking-title">
                        <h5>${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Bookings</h5>
                        <span class="booking-date">${formatDate(selectedDate)}</span>
                    </div>
                    <div class="booking-stats">
                        <span class="total-quantity">${orderData.quantity} meals</span>
                        <span class="total-bookings">${orderData.bookings} students</span>
                    </div>
                </div>
                <div class="error-message">
                    Unable to load menu details. Please try again.
                </div>
            </div>
        `;
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/orders/${orderId}/status?status=${newStatus}`, {
            method: 'PUT'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
            loadStudentOrders(); // Reload orders to reflect changes
        } else {
            showNotification(`Error updating order status: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status. Please try again.', 'error');
    }
}

// Helper functions for meal booking actions
async function exportMealBookings(date, mealType) {
    try {
        showNotification('Preparing export...', 'info');
        
        // Fetch detailed booking data for the specific meal
        const response = await fetch(`/api/menu/bookings/stats/${date}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch booking data for export');
        }
        
        const bookingStats = await response.json();
        const mealBookings = bookingStats.find(booking => booking.mealType === mealType);
        
        if (!mealBookings || mealBookings.totalBookings === 0) {
            showNotification('No bookings found for this meal to export', 'warning');
            return;
        }
        
        // Create CSV content
        const csvContent = generateBookingCSV(mealBookings, date, mealType);
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${mealType}_bookings_${date}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification(`${mealType} bookings exported successfully`, 'success');
        
    } catch (error) {
        console.error('Error exporting meal bookings:', error);
        showNotification('Error exporting bookings. Please try again.', 'error');
    }
}

function generateBookingCSV(mealBookings, date, mealType) {
    let csvContent = 'Date,Meal Type,Total Bookings,Menu Items\n';
    
    // Add booking summary row
    const menuItemsText = mealBookings.menuItems 
        ? mealBookings.menuItems.map(item => `${item.name} (₹${item.price})`).join('; ')
        : 'No menu items';
    
    csvContent += `${date},${mealType},${mealBookings.totalBookings},"${menuItemsText}"\n`;
    
    return csvContent;
}

async function notifyStudents(date, mealType) {
    try {
        showNotification('Sending notifications...', 'info');
        
        // Simulate notification API call
        const response = await fetch('/api/notifications/meal-reminder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: date,
                mealType: mealType,
                message: `Reminder: Your ${mealType} booking for ${date} is confirmed. Please collect your meal on time.`
            })
        });
        
        if (response.ok) {
            showNotification(`Notifications sent to students with ${mealType} bookings`, 'success');
        } else {
            // For now, show success even if API doesn't exist
            showNotification(`Notification feature will be implemented soon`, 'info');
        }
        
    } catch (error) {
        console.error('Error sending notifications:', error);
        // For now, show a placeholder message
        showNotification('Notification system will be available in the next update', 'info');
    }
}

// Enhanced UI control functions
function toggleView(viewType) {
    const summaryBtn = document.getElementById('summary-view-btn');
    const detailedBtn = document.getElementById('detailed-view-btn');
    const quickStats = document.getElementById('quick-stats');
    const ordersDisplay = document.getElementById('orders-display');
    
    // Update button states
    summaryBtn.classList.remove('active');
    detailedBtn.classList.remove('active');
    
    if (viewType === 'summary') {
        summaryBtn.classList.add('active');
        quickStats.style.display = 'grid';
        ordersDisplay.style.display = 'none';
    } else {
        detailedBtn.classList.add('active');
        quickStats.style.display = 'none';
        ordersDisplay.style.display = 'block';
    }
}

function filterMealType(mealType) {
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-meal="${mealType}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Show/hide meal sections based on filter
    const sections = {
        'breakfast-section': mealType === 'all' || mealType === 'BREAKFAST',
        'lunch-section': mealType === 'all' || mealType === 'LUNCH',
        'dinner-section': mealType === 'all' || mealType === 'DINNER'
    };
    
    Object.entries(sections).forEach(([sectionId, shouldShow]) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = shouldShow ? 'block' : 'none';
        }
    });
}

function getCurrentDate() {
    const dateInput = document.getElementById('orders-date');
    return dateInput.value || new Date().toISOString().split('T')[0];
}

async function exportAllBookings() {
    try {
        const selectedDate = getCurrentDate();
        showNotification('Preparing complete export...', 'info');
        
        // Fetch all booking data for the selected date
        const response = await fetch(`/api/menu/bookings/stats/${selectedDate}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch booking data for export');
        }
        
        const bookingStats = await response.json();
        
        if (!bookingStats || bookingStats.length === 0) {
            showNotification('No bookings found for this date to export', 'warning');
            return;
        }
        
        // Create comprehensive CSV content
        let csvContent = 'Date,Meal Type,Total Bookings,Menu Items,Total Revenue\n';
        let totalBookings = 0;
        let totalRevenue = 0;
        
        bookingStats.forEach(booking => {
            const menuItemsText = booking.menuItems 
                ? booking.menuItems.map(item => `${item.name} (₹${item.price})`).join('; ')
                : 'No menu items';
            
            const revenue = booking.menuItems 
                ? booking.menuItems.reduce((sum, item) => sum + (item.price * booking.totalBookings), 0)
                : 0;
            
            csvContent += `${selectedDate},${booking.mealType},${booking.totalBookings},"${menuItemsText}",₹${revenue}\n`;
            totalBookings += booking.totalBookings;
            totalRevenue += revenue;
        });
        
        // Add summary row
        csvContent += `\nSUMMARY,All Meals,${totalBookings},"",₹${totalRevenue}\n`;
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_bookings_${selectedDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification(`Complete booking report exported successfully`, 'success');
        
    } catch (error) {
        console.error('Error exporting all bookings:', error);
        showNotification('Error exporting bookings. Please try again.', 'error');
    }
}

async function notifyAllStudents() {
    try {
        const selectedDate = getCurrentDate();
        showNotification('Sending notifications to all students...', 'info');
        
        // Fetch booking data to get meal types with bookings
        const response = await fetch(`/api/menu/bookings/stats/${selectedDate}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch booking data');
        }
        
        const bookingStats = await response.json();
        
        if (!bookingStats || bookingStats.length === 0) {
            showNotification('No bookings found for notifications', 'warning');
            return;
        }
        
        // Send notifications for each meal type with bookings
        const notificationPromises = bookingStats.map(booking => 
            notifyStudents(selectedDate, booking.mealType)
        );
        
        await Promise.all(notificationPromises);
        
        showNotification(`Notifications sent for all meals on ${selectedDate}`, 'success');
        
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        showNotification('Error sending notifications. Please try again.', 'error');
    }
}

// Enhanced UI control functions for new student orders interface
function toggleView(viewType) {
    const summaryBtn = document.getElementById('summary-view-btn');
    const detailedBtn = document.getElementById('detailed-view-btn');
    const quickStats = document.getElementById('quick-stats');
    const ordersDisplay = document.getElementById('orders-display');
    
    // Update button states
    if (summaryBtn) summaryBtn.classList.remove('active');
    if (detailedBtn) detailedBtn.classList.remove('active');
    
    if (viewType === 'summary') {
        if (summaryBtn) summaryBtn.classList.add('active');
        if (quickStats) quickStats.style.display = 'grid';
        if (ordersDisplay) ordersDisplay.style.display = 'none';
    } else {
        if (detailedBtn) detailedBtn.classList.add('active');
        if (quickStats) quickStats.style.display = 'none';
        if (ordersDisplay) ordersDisplay.style.display = 'block';
    }
}

function filterMealType(mealType) {
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-meal="${mealType}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Show/hide meal sections based on filter
    const sections = {
        'breakfast-section': mealType === 'all' || mealType === 'BREAKFAST',
        'lunch-section': mealType === 'all' || mealType === 'LUNCH',
        'dinner-section': mealType === 'all' || mealType === 'DINNER'
    };
    
    Object.entries(sections).forEach(([sectionId, shouldShow]) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = shouldShow ? 'block' : 'none';
        }
    });
}

function getCurrentDate() {
    const dateInput = document.getElementById('orders-date');
    return dateInput ? (dateInput.value || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
}

async function exportAllBookings() {
    try {
        const selectedDate = getCurrentDate();
        showNotification('Preparing complete export...', 'info');
        
        // Fetch all booking data for the selected date
        const response = await fetch(`/api/menu/bookings/stats/${selectedDate}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch booking data for export');
        }
        
        const apiResponse = await response.json();
        const bookingStats = apiResponse.data || [];
        
        if (!bookingStats || bookingStats.length === 0) {
            showNotification('No bookings found for this date to export', 'warning');
            return;
        }
        
        // Create comprehensive CSV content
        let csvContent = 'Date,Meal Type,Total Bookings,Total Quantity\n';
        let totalBookings = 0;
        let totalQuantity = 0;
        
        bookingStats.forEach(booking => {
            csvContent += `${selectedDate},${booking.mealType},${booking.totalBookings || 0},${booking.totalQuantity || 0}\n`;
            totalBookings += booking.totalBookings || 0;
            totalQuantity += booking.totalQuantity || 0;
        });
        
        // Add summary row
        csvContent += `\nSUMMARY,All Meals,${totalBookings},${totalQuantity}\n`;
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_bookings_${selectedDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification(`Complete booking report exported successfully`, 'success');
        
    } catch (error) {
        console.error('Error exporting all bookings:', error);
        showNotification('Error exporting bookings. Please try again.', 'error');
    }
}

async function notifyAllStudents() {
    try {
        const selectedDate = getCurrentDate();
        showNotification('Sending notifications to all students...', 'info');
        
        // For now, show a placeholder message since the API doesn't exist yet
        setTimeout(() => {
            showNotification(`Bulk notifications will be implemented in the next update`, 'info');
        }, 1000);
        
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        showNotification('Error sending notifications. Please try again.', 'error');
    }
}

function showLoadingState(show) {
    const loadingState = document.getElementById('loading-state');
    const ordersDisplay = document.getElementById('orders-by-meal');
    
    if (loadingState) {
        if (show) {
            loadingState.style.display = 'block';
            if (ordersDisplay) ordersDisplay.style.display = 'none';
        } else {
            loadingState.style.display = 'none';
            if (ordersDisplay) ordersDisplay.style.display = 'block';
        }
    }
}

function hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

// Staff Dashboard Overview Data Loading Functions
async function loadOverviewData() {
    try {
        showNotification('Loading dashboard data...', 'info');
        
        // Load multiple data sources in parallel
        const [bookingStats, todaysMenu] = await Promise.all([
            fetchTodaysBookingStats(),
            fetchTodaysMenu()
        ]);
        
        // Update overview statistics
        updateOverviewStats(bookingStats, todaysMenu);
        
        // Update today's schedule
        updateTodaysSchedule(todaysMenu, bookingStats);
        
        console.log('Overview data loaded successfully');
        
    } catch (error) {
        console.error('Error loading overview data:', error);
        showNotification('Error loading dashboard data', 'error');
        displayOverviewError();
    }
}

async function fetchTodaysBookingStats() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/menu/bookings/stats/${today}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                return []; // No bookings for today
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || [];
        
    } catch (error) {
        console.error('Error fetching booking stats:', error);
        return [];
    }
}

async function fetchTodaysMenu() {
    try {
        const response = await fetch('/api/menu/daily/today');
        
        if (!response.ok) {
            if (response.status === 404) {
                return []; // No menu for today
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || [];
        
    } catch (error) {
        console.error('Error fetching today\'s menu:', error);
        return [];
    }
}

function updateOverviewStats(bookingStats, todaysMenu) {
    // Calculate total meals booked today
    const totalMealsBooked = bookingStats.reduce((sum, stat) => sum + (stat.totalQuantity || 0), 0);
    
    // Calculate total unique menu items available today
    const totalMenuItems = todaysMenu.reduce((sum, menu) => sum + (menu.menuItems ? menu.menuItems.length : 0), 0);
    
    // Calculate total students who booked meals
    const totalStudentsBooked = bookingStats.reduce((sum, stat) => sum + (stat.totalBookings || 0), 0);
    
    // Calculate estimated revenue
    let estimatedRevenue = 0;
    todaysMenu.forEach(menu => {
        if (menu.menuItems) {
            const menuRevenue = menu.menuItems.reduce((sum, item) => sum + (item.price || 0), 0);
            const mealBookings = bookingStats.find(stat => stat.mealType === menu.mealType);
            if (mealBookings) {
                estimatedRevenue += menuRevenue * (mealBookings.totalBookings || 0);
            }
        }
    });
    
    // Update stat cards
    document.getElementById('todays-meals').textContent = totalMenuItems;
    document.getElementById('meals-served').textContent = totalMealsBooked;
    document.getElementById('low-stock-items').textContent = totalStudentsBooked;
    document.getElementById('pending-feedback').textContent = Math.round(estimatedRevenue);
    
    console.log(`Overview stats updated: ${totalMenuItems} menu items, ${totalMealsBooked} meals booked, ${totalStudentsBooked} students, ₹${estimatedRevenue} revenue`);
}

function updateTodaysSchedule(todaysMenu, bookingStats) {
    const scheduleContainer = document.getElementById('todays-schedule');
    
    if (!scheduleContainer) {
        console.error('Schedule container not found');
        return;
    }
    
    // Define meal times
    const mealTimes = {
        'BREAKFAST': { time: '07:00 - 09:00', icon: '🌅' },
        'LUNCH': { time: '12:00 - 14:00', icon: '☀️' },
        'DINNER': { time: '19:00 - 21:00', icon: '🌙' }
    };
    
    // Clear existing schedule
    scheduleContainer.innerHTML = '';
    
    // Create schedule items for each meal type
    Object.keys(mealTimes).forEach(mealType => {
        const menuForMeal = todaysMenu.find(menu => menu.mealType === mealType);
        const bookingForMeal = bookingStats.find(stat => stat.mealType === mealType);
        
        const mealInfo = mealTimes[mealType];
        const hasMenu = menuForMeal && menuForMeal.menuItems && menuForMeal.menuItems.length > 0;
        const hasBookings = bookingForMeal && bookingForMeal.totalBookings > 0;
        
        // Determine status based on availability and bookings
        let status = 'pending';
        let statusText = 'Pending';
        
        if (hasMenu) {
            if (hasBookings) {
                status = 'ready';
                statusText = `Ready (${bookingForMeal.totalBookings} orders)`;
            } else {
                status = 'preparing';
                statusText = 'Ready (No orders)';
            }
        } else {
            status = 'unavailable';
            statusText = 'No Menu';
        }
        
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <span class="schedule-time">${mealInfo.time}</span>
            <span class="schedule-meal">
                <span class="meal-icon">${mealInfo.icon}</span>
                ${mealType.charAt(0) + mealType.slice(1).toLowerCase()}
            </span>
            <span class="schedule-status ${status}" title="${hasMenu ? menuForMeal.menuItems.length + ' items available' : 'No menu set'}">
                ${statusText}
            </span>
        `;
        
        scheduleContainer.appendChild(scheduleItem);
    });
    
    console.log('Today\'s schedule updated with real data');
}

function displayOverviewError() {
    // Reset stats to show error state
    document.getElementById('todays-meals').textContent = '--';
    document.getElementById('meals-served').textContent = '--';
    document.getElementById('low-stock-items').textContent = '--';
    document.getElementById('pending-feedback').textContent = '--';
    
    // Show error in schedule
    const scheduleContainer = document.getElementById('todays-schedule');
    if (scheduleContainer) {
        scheduleContainer.innerHTML = `
            <div class="schedule-error">
                <span class="error-icon">❌</span>
                <span class="error-message">Unable to load schedule data</span>
                <button onclick="loadOverviewData()" class="retry-btn">🔄 Retry</button>
            </div>
        `;
    }
}

// Staff Dashboard Overview Data Loading Functions
async function loadOverviewData() {
    try {
        showNotification('Loading dashboard data...', 'info');
        
        // Load multiple data sources in parallel
        const [bookingStats, todaysMenu] = await Promise.all([
            fetchTodaysBookingStats(),
            fetchTodaysMenu()
        ]);
        
        // Update overview statistics
        updateOverviewStats(bookingStats, todaysMenu);
        
        // Update today's schedule
        updateTodaysSchedule(todaysMenu, bookingStats);
        
        console.log('Overview data loaded successfully');
        
    } catch (error) {
        console.error('Error loading overview data:', error);
        showNotification('Error loading dashboard data', 'error');
        displayOverviewError();
    }
}

async function fetchTodaysBookingStats() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/menu/bookings/stats/${today}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                return []; // No bookings for today
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || [];
        
    } catch (error) {
        console.error('Error fetching booking stats:', error);
        return [];
    }
}

async function fetchTodaysMenu() {
    try {
        const response = await fetch('/api/menu/daily/today');
        
        if (!response.ok) {
            if (response.status === 404) {
                return []; // No menu for today
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || [];
        
    } catch (error) {
        console.error('Error fetching today\'s menu:', error);
        return [];
    }
}

function updateOverviewStats(bookingStats, todaysMenu) {
    // Calculate total meals booked today
    const totalMealsBooked = bookingStats.reduce((sum, stat) => sum + (stat.totalQuantity || 0), 0);
    
    // Calculate total unique menu items available today
    const totalMenuItems = todaysMenu.reduce((sum, menu) => sum + (menu.menuItems ? menu.menuItems.length : 0), 0);
    
    // Calculate total students who booked meals
    const totalStudentsBooked = bookingStats.reduce((sum, stat) => sum + (stat.totalBookings || 0), 0);
    
    // Update stat cards
    document.getElementById('todays-meals').textContent = totalMenuItems;
    document.getElementById('meals-served').textContent = totalMealsBooked; // Using booked as served for now
    document.getElementById('low-stock-items').textContent = '0'; // Placeholder - inventory feature
    document.getElementById('pending-feedback').textContent = '0'; // Placeholder - feedback feature
    
    console.log(`Overview stats updated: ${totalMenuItems} menu items, ${totalMealsBooked} meals booked, ${totalStudentsBooked} students`);
}

function updateTodaysSchedule(todaysMenu, bookingStats) {
    const scheduleContainer = document.getElementById('todays-schedule');
    
    if (!scheduleContainer) {
        console.error('Schedule container not found');
        return;
    }
    
    // Define meal times
    const mealTimes = {
        'BREAKFAST': { time: '07:00 - 09:00', icon: '🌅' },
        'LUNCH': { time: '12:00 - 14:00', icon: '☀️' },
        'DINNER': { time: '19:00 - 21:00', icon: '🌙' }
    };
    
    // Clear existing schedule
    scheduleContainer.innerHTML = '';
    
    // Create schedule items for each meal type
    Object.keys(mealTimes).forEach(mealType => {
        const menuForMeal = todaysMenu.find(menu => menu.mealType === mealType);
        const bookingForMeal = bookingStats.find(stat => stat.mealType === mealType);
        
        const mealInfo = mealTimes[mealType];
        const hasMenu = menuForMeal && menuForMeal.menuItems && menuForMeal.menuItems.length > 0;
        const hasBookings = bookingForMeal && bookingForMeal.totalBookings > 0;
        
        // Determine status based on availability and bookings
        let status = 'pending';
        let statusText = 'Pending';
        
        if (hasMenu) {
            if (hasBookings) {
                status = 'ready';
                statusText = `Ready (${bookingForMeal.totalBookings} orders)`;
            } else {
                status = 'preparing';
                statusText = 'Ready (No orders)';
            }
        } else {
            status = 'unavailable';
            statusText = 'No Menu';
        }
        
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <span class="schedule-time">${mealInfo.time}</span>
            <span class="schedule-meal">
                <span class="meal-icon">${mealInfo.icon}</span>
                ${mealType.charAt(0) + mealType.slice(1).toLowerCase()}
            </span>
            <span class="schedule-status ${status}" title="${hasMenu ? menuForMeal.menuItems.length + ' items available' : 'No menu set'}">
                ${statusText}
            </span>
        `;
        
        scheduleContainer.appendChild(scheduleItem);
    });
    
    console.log('Today\'s schedule updated with real data');
}

function displayOverviewError() {
    // Reset stats to show error state
    document.getElementById('todays-meals').textContent = '--';
    document.getElementById('meals-served').textContent = '--';
    document.getElementById('low-stock-items').textContent = '--';
    document.getElementById('pending-feedback').textContent = '--';
    
    // Show error in schedule
    const scheduleContainer = document.getElementById('todays-schedule');
    if (scheduleContainer) {
        scheduleContainer.innerHTML = `
            <div class="schedule-error">
                <span class="error-icon">❌</span>
                <span class="error-message">Unable to load schedule data</span>
                <button onclick="loadOverviewData()" class="retry-btn">🔄 Retry</button>
            </div>
        `;
    }
}

// Add navigation event listener to load overview data when section is activated
function handleSectionChange(sectionName) {
    if (sectionName === 'overview') {
        loadOverviewData();
    }
}