// Admin Dashboard JavaScript

// Data arrays - will be populated from real user interactions
let users = [];
let complaints = [];
let feedback = [];
let menus = [];

// Data persistence functions
function loadDataFromStorage() {
    const savedData = localStorage.getItem('messmate_admin_data');
    console.log('Loading data from localStorage:', savedData);
    
    if (savedData) {
        const data = JSON.parse(savedData);
        console.log('Parsed data:', data);
        users = data.users || users;
        complaints = data.complaints || complaints;
        feedback = data.feedback || feedback;
        menus = data.menus || menus;
        
        // Remove duplicate users based on email
        users = removeDuplicateUsers(users);
        
        console.log('Loaded users:', users);
    } else {
        console.log('No saved data found');
    }
}

// Helper function to remove duplicate users
function removeDuplicateUsers(userArray) {
    const seenEmails = new Set();
    const seenRolls = new Set();
    const uniqueUsers = [];
    
    userArray.forEach(user => {
        // Skip if email or roll number already exists
        if (!seenEmails.has(user.email) && (!user.rollNumber || !seenRolls.has(user.rollNumber))) {
            seenEmails.add(user.email);
            if (user.rollNumber && user.rollNumber !== 'Not Assigned') {
                seenRolls.add(user.rollNumber);
            }
            uniqueUsers.push(user);
        } else {
            console.warn('Duplicate user found and removed:', user);
        }
    });
    
    // If duplicates were found, save the cleaned data
    if (uniqueUsers.length !== userArray.length) {
        console.log(`Removed ${userArray.length - uniqueUsers.length} duplicate users`);
        // Update the saved data with cleaned users
        const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
        adminData.users = uniqueUsers;
        adminData.lastUpdated = new Date().toISOString();
        localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
    }
    
    return uniqueUsers;
}

function saveDataToStorage() {
    const data = {
        users: users,
        complaints: complaints,
        feedback: feedback,
        menus: menus,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('messmate_admin_data', JSON.stringify(data));
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage(); // Load persisted data first
    initializeAdminDashboard();
    setupNavigation();
    loadAdminInfo();
    loadAdminProfile(); // Load admin profile from database
    updateStats();
    loadMenus();
    loadUsers();
    loadComplaints();
    
    // Test API connectivity first
    testFeedbackAPI().then(() => {
        loadFeedback();
    });
    
    loadStudentDetails();
    loadStaffManagement();
    setupAdminChangePasswordForm();
    
    // Setup event listeners for staff management
    document.getElementById('staff-form').addEventListener('submit', saveStaff);
    document.getElementById('staff-status-filter').addEventListener('change', filterStaff);
    document.getElementById('staff-shift-filter').addEventListener('change', filterStaff);
    document.getElementById('staff-search').addEventListener('input', searchStaff);
    
    // User management will only show all users - no filtering needed
    
    // Set today's date as default
    document.getElementById('menu-date').value = new Date().toISOString().split('T')[0];
    
    // Add event listeners
    document.getElementById('menu-form').addEventListener('submit', addMenu);
    
    // Add feedback filter event listeners
    const feedbackRatingFilter = document.getElementById('feedback-rating-filter');
    const feedbackDateFilter = document.getElementById('feedback-date-filter');
    
    if (feedbackRatingFilter) {
        feedbackRatingFilter.addEventListener('change', filterFeedback);
    }
    if (feedbackDateFilter) {
        feedbackDateFilter.addEventListener('change', filterFeedback);
    }
    document.getElementById('user-search').addEventListener('input', searchUsers);
    document.getElementById('complaint-status-filter').addEventListener('change', filterComplaints);
    document.getElementById('complaint-priority-filter').addEventListener('change', filterComplaints);
    document.getElementById('student-search').addEventListener('input', searchStudents);
    
    // Auto-update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Listen for storage changes (if multiple tabs are open)
    window.addEventListener('storage', function(e) {
        if (e.key === 'messmate_admin_data') {
            loadDataFromStorage();
            updateStats();
        }
    });
});

function initializeAdminDashboard() {
    // Check if admin is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(loggedInUser);
    if (user.userType !== 'ADMIN') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'login.html';
        return;
    }
}

function loadAdminInfo() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        document.getElementById('admin-display-name').textContent = user.name;
        document.getElementById('admin-email').textContent = user.email;
        
        // Update avatar with first letter of name
        const avatarText = user.name.charAt(0).toUpperCase();
        document.getElementById('admin-avatar').textContent = avatarText;
    }
}

// Setup navigation functionality (same as student dashboard)
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

// Switch between sections (same as student dashboard)
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
        'overview': 'Admin Dashboard Overview',
        'menu-management': 'Daily Menu Management',
        'user-management': 'User Management',
        'student-orders': 'Student Orders Management',
        'complaint-management': 'Complaint Management',
        'feedback-management': 'Student Feedback',
        'staff-management': 'Staff Management',
        'student-details': 'Student Details',
        'reports': 'Reports & Analytics'
    };
    
    sectionTitle.textContent = titles[sectionName] || 'Admin Dashboard';
    
    // Load section-specific data
    if (sectionName === 'student-orders') {
        // Set today's date as default
        const bookingDateSelector = document.getElementById('booking-date-selector');
        if (bookingDateSelector) {
            bookingDateSelector.value = new Date().toISOString().split('T')[0];
        }
        loadAllBookingStats();
    }
}

function updateStats() {
    // Update overview stats
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('pending-complaints').textContent = complaints.filter(c => c.status === 'pending').length;
    
    // Get real booking quantity data for today
    updateTodaysBookingStats();
    
    // Handle empty feedback array
    const avgRating = feedback.length > 0 ? 
        (feedback.reduce((sum, f) => sum + f.foodRating, 0) / feedback.length).toFixed(1) : '0.0';
    document.getElementById('avg-rating').textContent = avgRating;
    
    // Update user stats
    document.getElementById('student-count').textContent = users.filter(u => u.userType === 'STUDENT').length;
    document.getElementById('staff-count').textContent = users.filter(u => u.userType === 'STAFF').length;
    document.getElementById('admin-count').textContent = users.filter(u => u.userType === 'ADMIN').length;
    
    // Update complaint stats
    document.getElementById('pending-count').textContent = complaints.filter(c => c.status === 'pending').length;
    document.getElementById('inprogress-count').textContent = complaints.filter(c => c.status === 'in-progress').length;
    document.getElementById('solved-count').textContent = complaints.filter(c => c.status === 'solved').length;
    
    // Update feedback stats
    document.getElementById('total-feedback').textContent = feedback.length;
    const avgFoodRating = feedback.length > 0 ? 
        (feedback.reduce((sum, f) => sum + f.foodRating, 0) / feedback.length).toFixed(1) : '0.0';
    const avgServiceRating = feedback.length > 0 ? 
        (feedback.reduce((sum, f) => sum + f.serviceRating, 0) / feedback.length).toFixed(1) : '0.0';
    document.getElementById('avg-food-rating').textContent = avgFoodRating;
    document.getElementById('avg-service-rating').textContent = avgServiceRating;
}

async function addMenu(event) {
    event.preventDefault();
    
    const menuItemsText = document.getElementById('menu-items').value;
    const menuItemsArray = menuItemsText.split(',').map(item => item.trim()).filter(item => item);
    
    try {
        // First, create menu items if they don't exist
        const createdItems = [];
        for (const itemName of menuItemsArray) {
            const menuItemData = {
                name: itemName,
                description: itemName + ' - Added by admin',
                price: parseFloat(document.getElementById('menu-price').value) || 0.0,
                mealType: document.getElementById('meal-type').value.toUpperCase(),
                category: 'MAIN_COURSE',
                isAvailable: true,
                isVegetarian: true
            };
            
            const itemResponse = await fetch('/api/menu/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(menuItemData)
            });
            
            const itemResult = await itemResponse.json();
            if (itemResponse.ok && itemResult.success) {
                createdItems.push(itemResult.data);
            }
        }
        
        // Then create daily menu with these items
        if (createdItems.length > 0) {
            const dailyMenuData = {
                menuDate: document.getElementById('menu-date').value,
                mealType: document.getElementById('meal-type').value.toUpperCase(),
                menuItems: createdItems.map(item => ({ id: item.id })),
                isActive: true
            };
            
            const dailyResponse = await fetch('/api/menu/daily', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dailyMenuData)
            });
            
            const dailyResult = await dailyResponse.json();
            
            if (dailyResponse.ok && dailyResult.success) {
                // Clear form
                document.getElementById('menu-form').reset();
                document.getElementById('menu-date').value = new Date().toISOString().split('T')[0];
                
                // Reload menus
                await loadMenus();
                
                alert('Menu added successfully to database and will appear in all dashboards!');
            } else {
                alert('Error creating daily menu: ' + (dailyResult.message || 'Unknown error'));
            }
        } else {
            alert('No menu items were created. Please check your input.');
        }
        
    } catch (error) {
        console.error('Error adding menu:', error);
        alert('Network error. Please check if the server is running and try again.');
    }
}

async function loadMenus() {
    try {
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        
        const startDate = weekStart.toISOString().split('T')[0];
        const endDate = weekEnd.toISOString().split('T')[0];
        
        const response = await fetch(`/api/menu/daily/weekly?startDate=${startDate}&endDate=${endDate}`);
        const result = await response.json();
        
        const menuList = document.getElementById('menu-list');
        
        if (!response.ok || !result.success || !result.data || result.data.length === 0) {
            menuList.innerHTML = '<div class=\"empty-state\">No menus found for this week</div>';
            return;
        }
        
        menuList.innerHTML = result.data.map(menu => {
            const menuItemsHtml = menu.menuItems && menu.menuItems.length > 0 ? 
                menu.menuItems.map(item => `
                    <div class="menu-item-detail">
                        <span class="item-name">${item.name}</span>
                        <span class="item-price">₹${item.price}</span>
                        <span class="item-category">${item.category}</span>
                        ${item.isVegetarian ? '<span class="veg-badge">🌱</span>' : '<span class="non-veg-badge">🍖</span>'}
                    </div>
                `).join('') : '<div class="no-items">No items added yet</div>';
            
            const totalPrice = menu.menuItems ? menu.menuItems.reduce((sum, item) => sum + (item.price || 0), 0) : 0;
            const itemCount = menu.menuItems ? menu.menuItems.length : 0;
            
            return `
                <div class=\"menu-card\">
                    <div class=\"menu-card-header\">
                        <span class=\"menu-date\">${formatDate(menu.menuDate)}</span>
                        <span class=\"meal-type-badge\">${menu.mealType}</span>
                        <span class=\"item-count\">${itemCount} items</span>
                    </div>
                    <div class=\"menu-items-container\">
                        ${menuItemsHtml}
                    </div>
                    <div class=\"menu-footer\">
                        <div class=\"menu-price\">Total: ₹${totalPrice.toFixed(2)}</div>
                        <button class="view-details-btn" onclick="viewMenuDetails(${menu.id})">View Details</button>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading menus:', error);
        const menuList = document.getElementById('menu-list');
        menuList.innerHTML = '<div class=\"empty-state\">Error loading menus. Please try again.</div>';
    }
}

async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    
    try {
        // Show loading state
        tbody.innerHTML = '<tr><td colspan="7" class="loading-state">🔄 Loading users from database...</td></tr>';
        
        console.log('🚀 Fetching users from database...');
        
        // Fetch users from database
        const response = await fetch('/api/users/all', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('📡 Users API response:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Users data received:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            const users = result.data;
            
            // Update user statistics
            await loadUserStats();
            
            // Display users in table
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>
                        <div class="user-info">
                            <strong>${user.name}</strong>
                            ${user.phone ? `<small>${user.phone}</small>` : ''}
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td><span class="user-type-badge ${user.userType.toLowerCase()}">${user.userType}</span></td>
                    <td>${user.rollNumber || '-'}</td>
                    <td>${user.hostel || '-'}</td>
                    <td>${user.room || '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewUser(${user.id})" title="View Details">👁️</button>
                            <button class="action-btn edit-btn" onclick="editUser(${user.id})" title="Edit User">✏️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            console.log(`📊 Loaded ${users.length} users successfully`);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div>
                            <h3>👥 No users found</h3>
                            <p>No users are registered in the system yet.</p>
                            <button onclick="loadUsers()" class="btn btn-primary">🔄 Refresh</button>
                            <button onclick="ensureAdminExists()" class="btn btn-success">➕ Create Sample Users</button>
                        </div>
                    </td>
                </tr>
            `;
        }
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="error-state">
                    <div>
                        <h3>⚠️ Error Loading Users</h3>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p>Make sure the Spring Boot application is running and the database is connected.</p>
                        <button onclick="loadUsers()" class="btn btn-primary">🔄 Try Again</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Function to load user statistics
async function loadUserStats() {
    try {
        console.log('📊 Loading user statistics...');
        
        const response = await fetch('/api/users/stats', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('📊 User stats received:', result);
            
            if (result.success && result.data) {
                const stats = result.data;
                
                // Update stat counters
                const studentCountEl = document.getElementById('student-count');
                const staffCountEl = document.getElementById('staff-count');
                const adminCountEl = document.getElementById('admin-count');
                
                if (studentCountEl) studentCountEl.textContent = stats.students || 0;
                if (staffCountEl) staffCountEl.textContent = stats.staff || 0;
                if (adminCountEl) adminCountEl.textContent = stats.admins || 0;
                
                console.log(`📊 Stats updated - Students: ${stats.students}, Staff: ${stats.staff}, Admins: ${stats.admins}`);
            }
        } else {
            console.warn('⚠️ Failed to load user statistics');
        }
    } catch (error) {
        console.error('❌ Error loading user statistics:', error);
    }
}

// Function to filter users by type
async function filterUsers() {
    const filterValue = document.getElementById('user-type-filter').value;
    const tbody = document.getElementById('users-table-body');
    
    try {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-state">🔄 Filtering users...</td></tr>';
        
        console.log('🔍 Filtering users by type:', filterValue || 'ALL');
        console.log('🔍 Filter value details:', {
            value: filterValue,
            type: typeof filterValue,
            length: filterValue ? filterValue.length : 0
        });
        
        let url = '/api/users/all';
        if (filterValue && filterValue.trim() !== '') {
            url = `/api/users/by-type/${filterValue.trim()}`;
        }
        
        console.log('🌐 Making request to:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.json();
            console.log('🔍 Filtered users result:', result);
            console.log('🔍 Data array length:', result.data ? result.data.length : 'No data');
            
            if (result.success && result.data) {
                if (result.data.length > 0) {
                    displayUsersInTable(result.data);
                    console.log(`✅ Displayed ${result.data.length} users for filter: ${filterValue || 'ALL'}`);
                } else {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="7" class="empty-state">
                                <div>
                                    <h3>👥 No ${filterValue ? filterValue.toLowerCase() + 's' : 'users'} found</h3>
                                    <p>No users match the selected filter "${filterValue || 'ALL'}".</p>
                                    <button onclick="loadUsers()" class="btn btn-primary">🔄 Show All Users</button>
                                    <button onclick="testUserAPI('${filterValue}')" class="btn btn-info">🔧 Test Filter API</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }
            } else {
                console.error('❌ API returned unsuccessful result:', result);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="error-state">
                            <div>
                                <h3>⚠️ API Error</h3>
                                <p>API returned: ${result.message || 'Unknown error'}</p>
                                <button onclick="loadUsers()" class="btn btn-primary">🔄 Show All Users</button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        } else {
            const errorText = await response.text();
            console.error('❌ HTTP Error Response:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Error filtering users:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="error-state">
                    <div>
                        <h3>⚠️ Filter Error</h3>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p><strong>Filter:</strong> ${filterValue || 'ALL'}</p>
                        <button onclick="loadUsers()" class="btn btn-primary">🔄 Show All Users</button>
                        <button onclick="testUserAPI('${filterValue}')" class="btn btn-info">🔧 Test API</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Function to search users
async function searchUsers() {
    const searchQuery = document.getElementById('user-search').value.trim();
    const tbody = document.getElementById('users-table-body');
    
    if (searchQuery.length < 2) {
        loadUsers(); // Load all users if search query is too short
        return;
    }
    
    try {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-state">🔍 Searching users...</td></tr>';
        
        console.log('🔍 Searching users with query:', searchQuery);
        
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('🔍 Search results:', result);
            
            if (result.success && result.data && result.data.length > 0) {
                displayUsersInTable(result.data);
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-state">
                            <div>
                                <h3>🔍 No results found</h3>
                                <p>No users found matching "${searchQuery}"</p>
                                <button onclick="loadUsers()" class="btn btn-primary">🔄 Show All Users</button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Error searching users:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="error-state">
                    <div>
                        <h3>⚠️ Search Error</h3>
                        <p>Error: ${error.message}</p>
                        <button onclick="loadUsers()" class="btn btn-primary">🔄 Try Again</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Helper function to display users in table
function displayUsersInTable(users) {
    const tbody = document.getElementById('users-table-body');
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-info">
                    <strong>${user.name}</strong>
                    ${user.phone ? `<small>${user.phone}</small>` : ''}
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="user-type-badge ${user.userType.toLowerCase()}">${user.userType}</span></td>
            <td>${user.rollNumber || '-'}</td>
            <td>${user.hostel || '-'}</td>
            <td>${user.room || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewUser(${user.id})" title="View Details">👁️</button>
                    <button class="action-btn edit-btn" onclick="editUser(${user.id})" title="Edit User">✏️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function loadComplaints() {
    const container = document.getElementById('complaints-list');
    console.log('Loading complaints:', complaints);
    
    if (complaints.length === 0) {
        container.innerHTML = '<div class="empty-state">No complaints submitted yet</div>';
        return;
    }
    
    container.innerHTML = complaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status}">${complaint.status.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="complaint-meta">
                <span><strong>Student:</strong> ${complaint.student}</span>
                <span><strong>Priority:</strong> ${complaint.priority.toUpperCase()}</span>
                <span><strong>Date:</strong> ${formatDate(complaint.createdAt || complaint.date)}</span>
            </div>
            <div class="complaint-description">${complaint.description}</div>
            <div class="complaint-actions">
                <button class="status-btn pending" onclick="updateComplaintStatus(${complaint.id}, 'pending')">Mark Pending</button>
                <button class="status-btn in-progress" onclick="updateComplaintStatus(${complaint.id}, 'in-progress')">In Progress</button>
                <button class="status-btn solved" onclick="updateComplaintStatus(${complaint.id}, 'solved')">Mark Solved</button>
            </div>
        </div>
    `).join('');
}

async function loadFeedback() {
    const container = document.getElementById('feedback-list');
    
    if (!container) {
        console.error('Feedback container not found!');
        return;
    }
    
    try {
        // Show loading state
        container.innerHTML = '<div class="loading-state">🔄 Loading feedback from database...</div>';
        
        console.log('🚀 Starting to fetch feedback from API...');
        
        // Fetch feedback from database
        const response = await fetch('/api/feedback/all', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response received:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Feedback API response:', result);
        console.log('📊 Response success:', result.success);
        console.log('📋 Response data:', result.data);
        console.log('📈 Data length:', result.data ? result.data.length : 0);
        
        if (result.success && result.data && result.data.length > 0) {
            const feedbackData = result.data;
            
            // Update feedback stats
            updateFeedbackStats(feedbackData);
            
            container.innerHTML = feedbackData.map(fb => `
                <div class="feedback-card">
                    <div class="feedback-header">
                        <div class="feedback-student-info">
                            <span class="feedback-student">${fb.studentName || 'Unknown Student'}</span>
                            <span class="feedback-email">${fb.studentEmail || ''}</span>
                        </div>
                        <div class="feedback-meta">
                            <span class="feedback-type">${fb.feedbackType || 'GENERAL'}</span>
                            <span class="feedback-date">${formatDate(fb.createdAt)}</span>
                        </div>
                    </div>
                    <div class="feedback-rating">
                        <span class="rating-label">Rating:</span>
                        <span class="star-display">${'★'.repeat(fb.rating)}${'☆'.repeat(5-fb.rating)}</span>
                        <span class="rating-number">(${fb.rating}/5)</span>
                    </div>
                    <div class="feedback-message">"${fb.message || 'No message provided'}"</div>
                    <div class="feedback-status">
                        <span class="status-badge status-${fb.status.toLowerCase()}">${fb.status}</span>
                        ${fb.staffReply ? `<div class="staff-reply"><strong>Staff Reply:</strong> ${fb.staffReply}</div>` : ''}
                    </div>
                    <div class="feedback-actions">
                        ${fb.status === 'PENDING' ? `
                            <button onclick="updateFeedbackStatus(${fb.id}, 'REVIEWED')" class="action-btn review-btn">Mark as Reviewed</button>
                            <button onclick="replyToFeedback(${fb.id})" class="action-btn reply-btn">Reply</button>
                        ` : ''}
                        ${fb.status === 'REVIEWED' ? `
                            <button onclick="updateFeedbackStatus(${fb.id}, 'RESOLVED')" class="action-btn resolve-btn">Mark as Resolved</button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>📭 No feedback found</h3>
                    <p>No feedback has been submitted yet, or there might be a database connection issue.</p>
                    <button onclick="loadFeedback()" class="btn btn-primary">🔄 Try Again</button>
                    <button onclick="testFeedbackAPI()" class="btn btn-info">🔧 Test Connection</button>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('❌ Error loading feedback:', error);
        console.error('🔍 Error details:', error.message);
        console.error('🌐 Make sure the Spring Boot application is running on http://localhost:8080');
        
        container.innerHTML = `
            <div class="error-state">
                <h3>⚠️ Connection Error</h3>
                <p><strong>Error:</strong> ${error.message}</p>
                <p>Make sure:</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Spring Boot application is running</li>
                    <li>Database is connected</li>
                    <li>API endpoint /api/feedback/all is accessible</li>
                </ul>
                <button onclick="loadFeedback()" class="btn btn-primary">🔄 Retry</button>
                <button onclick="testFeedbackAPI()" class="btn btn-info">🔧 Test API</button>
            </div>
        `;
    }
}

// Test function to check API connectivity
async function testFeedbackAPI() {
    console.log('Testing feedback API connectivity...');
    try {
        // First test basic API connectivity
        console.log('Step 1: Testing basic API...');
        const helloResponse = await fetch('/api/test/hello');
        console.log('Hello API Response:', helloResponse.status);
        
        if (helloResponse.ok) {
            const helloResult = await helloResponse.json();
            console.log('Hello API Success:', helloResult);
        }
        
        // Test database connectivity
        console.log('Step 2: Testing database connectivity...');
        const dbResponse = await fetch('/api/test/database-status');
        console.log('Database API Response:', dbResponse.status);
        
        if (dbResponse.ok) {
            const dbResult = await dbResponse.json();
            console.log('Database API Success:', dbResult);
        }
        
        // Test feedback API
        console.log('Step 3: Testing feedback API...');
        const response = await fetch('/api/feedback/all');
        console.log('Feedback API - Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Feedback API - Success! Data:', result);
            return result;
        } else {
            console.error('Feedback API - Failed with status:', response.status);
            const errorText = await response.text();
            console.error('Feedback API - Error response:', errorText);
        }
    } catch (error) {
        console.error('API Test - Network error:', error);
        console.error('Make sure the Spring Boot application is running on http://localhost:8080');
    }
}

// Function to manually test API from browser console
window.testAPI = testFeedbackAPI;

// Function to create sample feedback data
async function createSampleFeedback() {
    try {
        console.log('🎯 Creating sample feedback data...');
        const response = await fetch('/api/test/create-sample-feedback', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Sample feedback creation result:', result);
            alert('Sample feedback data creation attempted. Check console for details.');
            // Reload feedback after creating sample data
            loadFeedback();
        } else {
            console.error('❌ Failed to create sample feedback');
        }
    } catch (error) {
        console.error('❌ Error creating sample feedback:', error);
    }
}

// Make it available globally
window.createSampleFeedback = createSampleFeedback;

// Function to update feedback statistics
function updateFeedbackStats(feedbackData) {
    const totalFeedback = feedbackData.length;
    const avgRating = feedbackData.length > 0 ? 
        (feedbackData.reduce((sum, fb) => sum + fb.rating, 0) / feedbackData.length).toFixed(1) : 0;
    
    // Update stats in the UI
    const totalFeedbackElement = document.getElementById('total-feedback');
    if (totalFeedbackElement) {
        totalFeedbackElement.textContent = totalFeedback;
    }
    
    // Update average ratings by type
    const foodFeedback = feedbackData.filter(fb => fb.feedbackType === 'FOOD_QUALITY');
    const serviceFeedback = feedbackData.filter(fb => fb.feedbackType === 'SERVICE');
    
    const avgFoodRating = foodFeedback.length > 0 ? 
        (foodFeedback.reduce((sum, fb) => sum + fb.rating, 0) / foodFeedback.length).toFixed(1) : 0;
    const avgServiceRating = serviceFeedback.length > 0 ? 
        (serviceFeedback.reduce((sum, fb) => sum + fb.rating, 0) / serviceFeedback.length).toFixed(1) : 0;
    
    const avgFoodElement = document.getElementById('avg-food-rating');
    const avgServiceElement = document.getElementById('avg-service-rating');
    
    if (avgFoodElement) avgFoodElement.textContent = avgFoodRating;
    if (avgServiceElement) avgServiceElement.textContent = avgServiceRating;
}

// Function to update feedback status
async function updateFeedbackStatus(feedbackId, newStatus) {
    try {
        const response = await fetch(`/api/feedback/${feedbackId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert(`Feedback status updated to ${newStatus}`);
                loadFeedback(); // Reload feedback list
            } else {
                alert('Failed to update feedback status: ' + result.message);
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating feedback status:', error);
        alert('Error updating feedback status. Please try again.');
    }
}

// Function to reply to feedback
async function replyToFeedback(feedbackId) {
    const reply = prompt('Enter your reply to this feedback:');
    if (!reply) return;
    
    // Get admin email from session or use default
    const adminEmail = 'admin@messmate.com'; // You might want to get this from session
    
    try {
        const response = await fetch(`/api/feedback/${feedbackId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                staffEmail: adminEmail,
                reply: reply 
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('Reply sent successfully!');
                loadFeedback(); // Reload feedback list
            } else {
                alert('Failed to send reply: ' + result.message);
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error sending reply:', error);
        alert('Error sending reply. Please try again.');
    }
}

// Function to filter feedback based on rating and date
async function filterFeedback() {
    const ratingFilter = document.getElementById('feedback-rating-filter')?.value;
    const dateFilter = document.getElementById('feedback-date-filter')?.value;
    
    try {
        let url = '/api/feedback/all';
        const params = new URLSearchParams();
        
        // Apply rating filter if selected
        if (ratingFilter) {
            url = `/api/feedback/rating/${ratingFilter}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Filtered feedback API response:', result);
        
        if (result.success && result.data) {
            let feedbackData = result.data;
            
            // Apply date filter if selected
            if (dateFilter) {
                const filterDate = new Date(dateFilter);
                feedbackData = feedbackData.filter(fb => {
                    const feedbackDate = new Date(fb.createdAt);
                    return feedbackDate.toDateString() === filterDate.toDateString();
                });
            }
            
            // Update feedback stats and display
            updateFeedbackStats(feedbackData);
            displayFilteredFeedback(feedbackData);
        } else {
            document.getElementById('feedback-list').innerHTML = '<div class="empty-state">No feedback found matching the filters</div>';
        }
        
    } catch (error) {
        console.error('Error filtering feedback:', error);
        document.getElementById('feedback-list').innerHTML = '<div class="error-state">Error filtering feedback. Please try again.</div>';
    }
}

// Function to display filtered feedback (similar to loadFeedback but without API call)
function displayFilteredFeedback(feedbackData) {
    const container = document.getElementById('feedback-list');
    
    if (feedbackData.length === 0) {
        container.innerHTML = '<div class="empty-state">No feedback found matching the filters</div>';
        return;
    }
    
    container.innerHTML = feedbackData.map(fb => `
        <div class="feedback-card">
            <div class="feedback-header">
                <div class="feedback-student-info">
                    <span class="feedback-student">${fb.studentName || 'Unknown Student'}</span>
                    <span class="feedback-email">${fb.studentEmail || ''}</span>
                </div>
                <div class="feedback-meta">
                    <span class="feedback-type">${fb.feedbackType || 'GENERAL'}</span>
                    <span class="feedback-date">${formatDate(fb.createdAt)}</span>
                </div>
            </div>
            <div class="feedback-rating">
                <span class="rating-label">Rating:</span>
                <span class="star-display">${'★'.repeat(fb.rating)}${'☆'.repeat(5-fb.rating)}</span>
                <span class="rating-number">(${fb.rating}/5)</span>
            </div>
            <div class="feedback-message">"${fb.message || 'No message provided'}"</div>
            <div class="feedback-status">
                <span class="status-badge status-${fb.status.toLowerCase()}">${fb.status}</span>
                ${fb.staffReply ? `<div class="staff-reply"><strong>Staff Reply:</strong> ${fb.staffReply}</div>` : ''}
            </div>
            <div class="feedback-actions">
                ${fb.status === 'PENDING' ? `
                    <button onclick="updateFeedbackStatus(${fb.id}, 'REVIEWED')" class="action-btn review-btn">Mark as Reviewed</button>
                    <button onclick="replyToFeedback(${fb.id})" class="action-btn reply-btn">Reply</button>
                ` : ''}
                ${fb.status === 'REVIEWED' ? `
                    <button onclick="updateFeedbackStatus(${fb.id}, 'RESOLVED')" class="action-btn resolve-btn">Mark as Resolved</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function loadStudentDetails() {
    const container = document.getElementById('student-details-list');
    const students = users.filter(user => user.userType === 'STUDENT');
    
    container.innerHTML = students.map(student => {
        const studentComplaints = complaints.filter(c => c.studentId === student.id);
        const studentFeedback = feedback.filter(f => f.studentId === student.id);
        
        return `
            <div class="student-detail-card">
                <div class="student-card-header">
                    <div class="student-card-avatar">${student.name.charAt(0).toUpperCase()}</div>
                    <div class="student-card-info">
                        <h4>${student.name}</h4>
                        <p>${student.rollNumber}</p>
                    </div>
                </div>
                <div class="student-card-details">
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${student.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Hostel:</span>
                        <span class="detail-value">${student.hostel}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Room:</span>
                        <span class="detail-value">${student.room}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${student.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Complaints:</span>
                        <span class="detail-value">${studentComplaints.length}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Feedback Given:</span>
                        <span class="detail-value">${studentFeedback.length}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateComplaintStatus(complaintId, newStatus) {
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
        complaint.status = newStatus;
        saveDataToStorage(); // Save to localStorage
        loadComplaints();
        updateStats(); // Update stats when complaint status changes
        alert(`Complaint status updated to ${newStatus.replace('-', ' ')}`);
    }
}

// Function to add new user
function addNewUser(userData) {
    // Check if user with this email already exists
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
        alert('A user with this email already exists.');
        return null;
    }

    // Check if roll number already exists (if provided)
    if (userData.rollNumber) {
        const existingRoll = users.find(user => user.rollNumber === userData.rollNumber);
        if (existingRoll) {
            alert('A user with this roll number already exists.');
            return null;
        }
    }

    // Generate unique ID
    const generateUniqueId = () => {
        let maxId = 0;
        users.forEach(user => {
            if (user.id > maxId) maxId = user.id;
        });
        return maxId + 1;
    };
    
    const newUser = {
        id: generateUniqueId(),
        name: userData.name,
        email: userData.email,
        userType: userData.userType || 'STUDENT',
        rollNumber: userData.rollNumber || `ID${Date.now()}`,
        hostel: userData.hostel || 'Not Assigned',
        room: userData.room || 'Not Assigned',
        phone: userData.phone || 'Not Provided',
        password: userData.password || 'temp123', // Default password if not provided
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveDataToStorage(); // Save to localStorage
    
    // Auto-refresh user management table
    loadUsers();
    loadUserStats(); // Update user statistics
    updateStats(); // Update general stats
    
    console.log('✅ New user added and user management refreshed');
    return newUser;
}

// Function to add new complaint
function addNewComplaint(complaintData) {
    const newComplaint = {
        id: complaints.length + 1,
        title: complaintData.title,
        student: complaintData.studentName,
        description: complaintData.description,
        status: 'pending',
        priority: complaintData.priority || 'medium',
        date: new Date().toISOString().split('T')[0],
        studentId: complaintData.studentId
    };
    
    complaints.push(newComplaint);
    saveDataToStorage(); // Save to localStorage
    loadComplaints();
    updateStats(); // Update stats when new complaint is added
    return newComplaint;
}

// Function to add new feedback
function addNewFeedback(feedbackData) {
    const newFeedback = {
        id: feedback.length + 1,
        student: feedbackData.studentName,
        foodRating: feedbackData.foodRating,
        serviceRating: feedbackData.serviceRating,
        comment: feedbackData.comment,
        date: new Date().toISOString().split('T')[0],
        studentId: feedbackData.studentId
    };
    
    feedback.push(newFeedback);
    saveDataToStorage(); // Save to localStorage
    loadFeedback();
    updateStats(); // Update stats when new feedback is added
    return newFeedback;
}

function filterUsers() {
    const filterValue = document.getElementById('user-type-filter').value;
    const searchValue = document.getElementById('user-search').value.toLowerCase();
    
    let filteredUsers = users;
    
    if (filterValue) {
        filteredUsers = filteredUsers.filter(user => user.userType === filterValue);
    }
    
    if (searchValue) {
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchValue) || 
            user.email.toLowerCase().includes(searchValue) ||
            (user.rollNumber && user.rollNumber.toLowerCase().includes(searchValue))
        );
    }
    
    displayFilteredUsers(filteredUsers);
}

function searchUsers() {
    filterUsers();
}

function displayFilteredUsers(filteredUsers) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="user-type-badge">${user.userType}</span></td>
            <td>${user.rollNumber || '-'}</td>
            <td>${user.hostel || '-'}</td>
            <td>${user.room || '-'}</td>
            <td>
                <button class="action-button" onclick="viewUser(${user.id})">View</button>
                <button class="action-button" onclick="editUser(${user.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function filterComplaints() {
    const statusFilter = document.getElementById('complaint-status-filter').value;
    const priorityFilter = document.getElementById('complaint-priority-filter').value;
    
    let filteredComplaints = complaints;
    
    if (statusFilter) {
        filteredComplaints = filteredComplaints.filter(complaint => complaint.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredComplaints = filteredComplaints.filter(complaint => complaint.priority === priorityFilter);
    }
    
    displayFilteredComplaints(filteredComplaints);
}

function displayFilteredComplaints(filteredComplaints) {
    const container = document.getElementById('complaints-list');
    container.innerHTML = filteredComplaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status}">${complaint.status.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="complaint-meta">
                <span><strong>Student:</strong> ${complaint.student}</span>
                <span><strong>Priority:</strong> ${complaint.priority.toUpperCase()}</span>
                <span><strong>Date:</strong> ${formatDate(complaint.date)}</span>
            </div>
            <div class="complaint-description">${complaint.description}</div>
            <div class="complaint-actions">
                <button class="status-btn pending" onclick="updateComplaintStatus(${complaint.id}, 'pending')">Mark Pending</button>
                <button class="status-btn in-progress" onclick="updateComplaintStatus(${complaint.id}, 'in-progress')">In Progress</button>
                <button class="status-btn solved" onclick="updateComplaintStatus(${complaint.id}, 'solved')">Mark Solved</button>
            </div>
        </div>
    `).join('');
}

function filterFeedback() {
    const ratingFilter = document.getElementById('feedback-rating-filter').value;
    const dateFilter = document.getElementById('feedback-date-filter').value;
    
    let filteredFeedback = feedback;
    
    if (ratingFilter) {
        filteredFeedback = filteredFeedback.filter(fb => 
            fb.foodRating == ratingFilter || fb.serviceRating == ratingFilter
        );
    }
    
    if (dateFilter) {
        filteredFeedback = filteredFeedback.filter(fb => fb.date === dateFilter);
    }
    
    displayFilteredFeedback(filteredFeedback);
}

function displayFilteredFeedback(filteredFeedback) {
    const container = document.getElementById('feedback-list');
    container.innerHTML = filteredFeedback.map(fb => `
        <div class="feedback-card">
            <div class="feedback-header">
                <span class="feedback-student">${fb.student}</span>
                <span class="feedback-date">${formatDate(fb.date)}</span>
            </div>
            <div class="feedback-ratings">
                <div class="rating-item">
                    <span class="rating-label">Food:</span>
                    <span class="star-display">${'★'.repeat(fb.foodRating)}${'☆'.repeat(5-fb.foodRating)}</span>
                </div>
                <div class="rating-item">
                    <span class="rating-label">Service:</span>
                    <span class="star-display">${'★'.repeat(fb.serviceRating)}${'☆'.repeat(5-fb.serviceRating)}</span>
                </div>
            </div>
            <div class="feedback-comment">"${fb.comment}"</div>
        </div>
    `).join('');
}

function searchStudents() {
    const searchValue = document.getElementById('student-search').value.toLowerCase();
    const students = users.filter(user => user.userType === 'STUDENT');
    
    let filteredStudents = students;
    if (searchValue) {
        filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(searchValue) || 
            student.email.toLowerCase().includes(searchValue) ||
            (student.rollNumber && student.rollNumber.toLowerCase().includes(searchValue)) ||
            (student.hostel && student.hostel.toLowerCase().includes(searchValue))
        );
    }
    
    displayFilteredStudents(filteredStudents);
}

function displayFilteredStudents(filteredStudents) {
    const container = document.getElementById('student-details-list');
    
    container.innerHTML = filteredStudents.map(student => {
        const studentComplaints = complaints.filter(c => c.studentId === student.id);
        const studentFeedback = feedback.filter(f => f.studentId === student.id);
        
        return `
            <div class="student-detail-card">
                <div class="student-card-header">
                    <div class="student-card-avatar">${student.name.charAt(0).toUpperCase()}</div>
                    <div class="student-card-info">
                        <h4>${student.name}</h4>
                        <p>${student.rollNumber}</p>
                    </div>
                </div>
                <div class="student-card-details">
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${student.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Hostel:</span>
                        <span class="detail-value">${student.hostel}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Room:</span>
                        <span class="detail-value">${student.room}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${student.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Complaints:</span>
                        <span class="detail-value">${studentComplaints.length}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Feedback Given:</span>
                        <span class="detail-value">${studentFeedback.length}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Report generation functions
async function generateDailyReport() {
    try {
        const response = await fetch('http://localhost:8080/api/orders');
        const result = await response.json();
        if (result.success) {
            const orders = result.data;
            const today = new Date().toDateString();
            const todayOrders = orders.filter(order => 
                new Date(order.createdAt).toDateString() === today
            );
            
            const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            alert(`Daily Report Generated!\n\nDate: ${today}\nTotal Orders: ${todayOrders.length}\nTotal Revenue: ₹${totalRevenue}\n\nDetailed report would be exported to PDF.`);
        }
    } catch (error) {
        alert('Error generating daily report. Please try again.');
    }
}

async function generateUserReport() {
    try {
        const response = await fetch('http://localhost:8080/api/students/all');
        const result = await response.json();
        if (result.success) {
            const students = result.data;
            const totalUsers = students.length;
            const activeUsers = students.filter(s => s.isActive).length;
            alert(`User Registration Report!\n\nTotal Students: ${totalUsers}\nActive Students: ${activeUsers}\nInactive Students: ${totalUsers - activeUsers}\n\nDetailed demographics would be exported to PDF.`);
        }
    } catch (error) {
        alert('Error generating user report. Please try again.');
    }
}

async function generateFeedbackReport() {
    try {
        // This would connect to a feedback API when implemented
        alert('Feedback Analysis Report!\n\nAverage Rating: 4.2/5\nTotal Feedback: 156\nPositive: 78%\nNegative: 22%\n\nDetailed analysis would be exported to PDF.');
    } catch (error) {
        alert('Error generating feedback report. Please try again.');
    }
}

async function generateComplaintReport() {
    try {
        // This would connect to a complaints API when implemented
        alert('Complaint Summary Report!\n\nTotal Complaints: 23\nResolved: 18\nPending: 5\nAverage Resolution Time: 2.3 days\n\nDetailed report would be exported to PDF.');
    } catch (error) {
        alert('Error generating complaint report. Please try again.');
    }
}

// Utility functions
function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nType: ${user.userType}\nRoll/ID: ${user.rollNumber}\nHostel: ${user.hostel}\nRoom: ${user.room}\nPhone: ${user.phone}`);
    }
}

function editUser(userId) {
    alert('Edit user functionality will be implemented with a proper modal dialog.');
}

async function viewMenuDetails(menuId) {
    try {
        // Find the menu in our loaded data or fetch it specifically
        const response = await fetch(`/api/menu/daily/weekly?startDate=2025-09-01&endDate=2025-12-31`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const menu = result.data.find(m => m.id === menuId);
            if (menu) {
                const itemsList = menu.menuItems && menu.menuItems.length > 0 
                    ? menu.menuItems.map(item => 
                        `• ${item.name} - ₹${item.price} (${item.category}) ${item.isVegetarian ? '🌱' : '🍖'}`
                      ).join('\n')
                    : 'No items added yet';
                
                const totalPrice = menu.menuItems ? menu.menuItems.reduce((sum, item) => sum + (item.price || 0), 0) : 0;
                
                alert(`Menu Details:\n\nDate: ${formatDate(menu.menuDate)}\nMeal Type: ${menu.mealType}\nItems Count: ${menu.menuItems ? menu.menuItems.length : 0}\n\nMenu Items:\n${itemsList}\n\nTotal Price: ₹${totalPrice.toFixed(2)}\nStatus: ${menu.isActive ? 'Active' : 'Inactive'}\nCreated: ${formatDate(menu.createdAt)}`);
            }
        }
    } catch (error) {
        console.error('Error viewing menu details:', error);
        alert('Error loading menu details. Please try again.');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Staff Management Functions
let staffMembers = [];

function loadStaffManagement() {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { staff: [] };
    staffMembers = adminData.staff || [];
    loadStaffList();
    updateStaffStats();
}

function loadStaffList() {
    const container = document.getElementById('staff-list');
    
    if (staffMembers.length === 0) {
        container.innerHTML = '<div class="empty-state">No staff members added yet. Click "Add New Staff" to get started.</div>';
        return;
    }
    
    container.innerHTML = staffMembers.map(staff => `
        <div class="staff-card">
            <div class="staff-header-card">
                <div class="staff-info">
                    <h4>${staff.name}</h4>
                    <div class="staff-id">ID: ${staff.staffId}</div>
                    <div class="staff-role">${staff.role || 'Kitchen Staff'}</div>
                </div>
                <span class="staff-status ${staff.status}">${staff.status}</span>
            </div>
            
            <div class="staff-details">
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Email:</span>
                    <span class="staff-detail-value">${staff.email}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Phone:</span>
                    <span class="staff-detail-value">${staff.phone || 'N/A'}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Shift:</span>
                    <span class="staff-shift">${getShiftDisplayName(staff.shift)}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Created:</span>
                    <span class="staff-detail-value">${formatDate(staff.createdAt)}</span>
                </div>
            </div>
            
            <div class="staff-actions">
                <button onclick="editStaff(${staff.id})" class="edit-staff-btn">Edit</button>
                <button onclick="toggleStaffStatus(${staff.id})" class="toggle-staff-btn">
                    ${staff.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button onclick="deleteStaff(${staff.id})" class="delete-staff-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateStaffStats() {
    const totalStaff = staffMembers.length;
    const activeStaff = staffMembers.filter(s => s.status === 'active').length;
    const morningShift = staffMembers.filter(s => s.shift === 'morning' && s.status === 'active').length;
    const eveningShift = staffMembers.filter(s => s.shift === 'evening' && s.status === 'active').length;
    
    document.getElementById('total-staff').textContent = totalStaff;
    document.getElementById('active-staff').textContent = activeStaff;
    document.getElementById('morning-shift').textContent = morningShift;
    document.getElementById('evening-shift').textContent = eveningShift;
}

function openAddStaffModal() {
    document.getElementById('staff-modal-title').textContent = 'Add New Staff';
    document.getElementById('staff-form').reset();
    document.getElementById('staff-id').value = generateStaffId();
    generateStaffPassword();
    document.getElementById('staff-form').removeAttribute('data-edit-id');
    document.getElementById('staff-modal').style.display = 'block';
}

function generateStaffId() {
    const prefix = 'STF';
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${year}${randomNum}`;
}

function generateStaffPassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('staff-password').value = password;
}

function saveStaff(e) {
    e.preventDefault();
    
    console.log('saveStaff function called');
    
    const editId = document.getElementById('staff-form').getAttribute('data-edit-id');
    const staffData = {
        id: editId ? parseInt(editId) : Date.now(),
        staffId: document.getElementById('staff-id').value,
        name: document.getElementById('staff-name').value,
        email: document.getElementById('staff-email').value,
        phone: document.getElementById('staff-phone').value,
        shift: document.getElementById('staff-shift').value,
        password: document.getElementById('staff-password').value,
        status: document.getElementById('staff-status').value,
        role: document.getElementById('staff-role').value,
        userType: 'STAFF',
        createdAt: editId ? staffMembers.find(s => s.id == editId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    console.log('Staff data to save:', staffData);
    
    // Validate staff ID uniqueness
    const existingStaff = staffMembers.find(s => s.staffId === staffData.staffId && s.id != staffData.id);
    if (existingStaff) {
        alert('Staff ID already exists. Please generate a new one.');
        return;
    }
    
    // Validate email uniqueness
    const existingEmail = staffMembers.find(s => s.email === staffData.email && s.id != staffData.id);
    if (existingEmail) {
        alert('Email already exists. Please use a different email.');
        return;
    }
    
    if (editId) {
        // Update existing staff
        const index = staffMembers.findIndex(s => s.id == editId);
        if (index !== -1) {
            staffMembers[index] = staffData;
        }
    } else {
        // Add new staff
        staffMembers.push(staffData);
        console.log('Added new staff, total staff members:', staffMembers.length);
    }
    
    // Save to database first
    if (!editId) {
        // For new staff, create in database
        createStaffInDatabase(staffData);
    } else {
        // For existing staff, just save to localStorage for now
        saveStaffData();
        loadStaffList();
        updateStaffStats();
        closeStaffModal();
        alert(`Staff updated successfully!`);
    }
}

function editStaff(staffId) {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return;
    
    document.getElementById('staff-modal-title').textContent = 'Edit Staff';
    document.getElementById('staff-name').value = staff.name;
    document.getElementById('staff-email').value = staff.email;
    document.getElementById('staff-phone').value = staff.phone || '';
    document.getElementById('staff-shift').value = staff.shift;
    document.getElementById('staff-id').value = staff.staffId;
    document.getElementById('staff-password').value = staff.password;
    document.getElementById('staff-status').value = staff.status;
    document.getElementById('staff-role').value = staff.role || '';
    
    document.getElementById('staff-form').setAttribute('data-edit-id', staffId);
    document.getElementById('staff-modal').style.display = 'block';
}

function toggleStaffStatus(staffId) {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return;
    
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${action} ${staff.name}?`)) {
        staff.status = newStatus;
        staff.updatedAt = new Date().toISOString();
        
        saveStaffData();
        loadStaffList();
        updateStaffStats();
        
        alert(`Staff ${action}d successfully!`);
    }
}

function deleteStaff(staffId) {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff) return;
    
    if (confirm(`Are you sure you want to delete ${staff.name}? This action cannot be undone.`)) {
        staffMembers = staffMembers.filter(s => s.id !== staffId);
        
        saveStaffData();
        loadStaffList();
        updateStaffStats();
        
        alert('Staff deleted successfully!');
    }
}

function filterStaff() {
    const statusFilter = document.getElementById('staff-status-filter').value;
    const shiftFilter = document.getElementById('staff-shift-filter').value;
    
    let filtered = staffMembers;
    
    if (statusFilter) {
        filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    if (shiftFilter) {
        filtered = filtered.filter(s => s.shift === shiftFilter);
    }
    
    displayFilteredStaff(filtered);
}

function searchStaff() {
    const searchTerm = document.getElementById('staff-search').value.toLowerCase();
    
    if (!searchTerm) {
        loadStaffList();
        return;
    }
    
    const filtered = staffMembers.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm) ||
        staff.staffId.toLowerCase().includes(searchTerm) ||
        staff.email.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredStaff(filtered);
}

function displayFilteredStaff(filtered) {
    const container = document.getElementById('staff-list');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No staff members match your search criteria.</div>';
        return;
    }
    
    container.innerHTML = filtered.map(staff => `
        <div class="staff-card">
            <div class="staff-header-card">
                <div class="staff-info">
                    <h4>${staff.name}</h4>
                    <div class="staff-id">ID: ${staff.staffId}</div>
                    <div class="staff-role">${staff.role || 'Kitchen Staff'}</div>
                </div>
                <span class="staff-status ${staff.status}">${staff.status}</span>
            </div>
            
            <div class="staff-details">
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Email:</span>
                    <span class="staff-detail-value">${staff.email}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Phone:</span>
                    <span class="staff-detail-value">${staff.phone || 'N/A'}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Shift:</span>
                    <span class="staff-shift">${getShiftDisplayName(staff.shift)}</span>
                </div>
                <div class="staff-detail-row">
                    <span class="staff-detail-label">Created:</span>
                    <span class="staff-detail-value">${formatDate(staff.createdAt)}</span>
                </div>
            </div>
            
            <div class="staff-actions">
                <button onclick="editStaff(${staff.id})" class="edit-staff-btn">Edit</button>
                <button onclick="toggleStaffStatus(${staff.id})" class="toggle-staff-btn">
                    ${staff.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button onclick="deleteStaff(${staff.id})" class="delete-staff-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

function closeStaffModal() {
    document.getElementById('staff-modal').style.display = 'none';
    document.getElementById('staff-form').reset();
    document.getElementById('staff-form').removeAttribute('data-edit-id');
}

function getShiftDisplayName(shift) {
    const shiftNames = {
        'morning': 'Morning (6 AM - 2 PM)',
        'evening': 'Evening (2 PM - 10 PM)',
        'full': 'Full Day (6 AM - 10 PM)'
    };
    return shiftNames[shift] || shift;
}

function saveStaffData() {
    const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || { staff: [] };
    adminData.staff = staffMembers;
    adminData.lastUpdated = new Date().toISOString();
    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
    console.log('Staff data saved:', adminData.staff);
}

async function createStaffInDatabase(staffData) {
    try {
        // Prepare data for the signup API
        const signupData = {
            name: staffData.name,
            email: staffData.email,
            password: staffData.password,
            rollNumber: staffData.staffId,
            hostel: "Staff Quarter",
            room: "SQ" + staffData.staffId.slice(-2),
            phone: staffData.phone,
            userType: "STAFF"
        };
        
        console.log('Sending staff data to database:', signupData);
        
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('Staff created in database successfully:', result.data);
            
            // Now save to localStorage
            saveStaffData();
            
            // Refresh UI
            loadStaffList();
            updateStaffStats();
            closeStaffModal();
            
            alert('Staff created successfully and can now login!');
        } else {
            console.error('Failed to create staff in database:', result.message);
            alert('Error creating staff: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Network error creating staff:', error);
        alert('Network error. Please check if the server is running and try again.');
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('staff-modal');
    if (event.target === modal) {
        closeStaffModal();
    }
});

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }
}

// Setup admin change password form
function setupAdminChangePasswordForm() {
    const changePasswordForm = document.getElementById('admin-change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('admin-current-password').value;
            const newPassword = document.getElementById('admin-new-password').value;
            const confirmPassword = document.getElementById('admin-confirm-password').value;
            
            // Validate passwords
            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match!', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('Password must be at least 6 characters long!', 'error');
                return;
            }
            
            // Get current admin email (default or from localStorage)
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
            const adminEmail = loggedInUser.email || 'admin@messmate.com';
            
            // Call API to change password
            await changeAdminPassword(adminEmail, currentPassword, newPassword, changePasswordForm);
        });
    }
}

// Function to change admin password via API
async function changeAdminPassword(email, currentPassword, newPassword, form) {
    try {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '🔄 Changing Password...';
        submitBtn.disabled = true;
        
        console.log('🔐 Attempting to change admin password for:', email);
        
        const response = await fetch('/api/admin/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        console.log('📡 Password change response:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Password change result:', result);
        
        if (result.success) {
            // Update localStorage with new password
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
            loggedInUser.password = newPassword;
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            
            // Clear form
            form.reset();
            
            // Show success message
            showNotification('✅ Password changed successfully in database!', 'success');
            
            console.log('🎉 Admin password updated successfully in database');
        } else {
            showNotification('❌ ' + (result.message || 'Failed to change password'), 'error');
        }
        
    } catch (error) {
        console.error('❌ Error changing password:', error);
        showNotification('❌ Error: ' + error.message, 'error');
    } finally {
        // Restore button state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Change Password';
        submitBtn.disabled = false;
    }
}

// Function to load admin profile from database
async function loadAdminProfile() {
    try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        const adminEmail = loggedInUser.email || 'admin@messmate.com';
        
        console.log('📋 Loading admin profile for:', adminEmail);
        
        const response = await fetch(`/api/admin/profile/${adminEmail}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Admin profile loaded:', result);
            
            if (result.success && result.data) {
                const profile = result.data;
                
                // Update profile form fields
                const nameField = document.getElementById('admin-name');
                const emailField = document.getElementById('admin-email');
                const roleField = document.getElementById('admin-role');
                
                if (nameField) nameField.value = profile.name || 'Admin User';
                if (emailField) emailField.value = profile.email || 'admin@messmate.com';
                if (roleField) roleField.value = 'System Administrator';
                
                // Update sidebar info
                const displayName = document.getElementById('admin-display-name');
                const displayEmail = document.getElementById('admin-email');
                
                if (displayName) displayName.textContent = profile.name || 'System Administrator';
                
                console.log('🎯 Admin profile updated in UI');
            }
        } else {
            console.warn('⚠️ Failed to load admin profile, using defaults');
        }
    } catch (error) {
        console.error('❌ Error loading admin profile:', error);
        // Use default values if API fails
    }
}

// Function to test admin API connectivity
async function testAdminAPI() {
    try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        const adminEmail = loggedInUser.email || 'admin@messmate.com';
        
        console.log('🧪 Testing admin API for:', adminEmail);
        
        const response = await fetch(`/api/admin/profile/${adminEmail}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Admin API test successful:', result);
            showNotification('✅ Admin API is working correctly!', 'success');
        } else {
            console.error('❌ Admin API test failed:', response.status);
            showNotification('❌ Admin API test failed: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Admin API test error:', error);
        showNotification('❌ Admin API error: ' + error.message, 'error');
    }
}

// Function to debug admin user data
async function debugAdminUser() {
    try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        const adminEmail = loggedInUser.email || 'admin@messmate.com';
        
        console.log('🔍 Debugging admin user:', adminEmail);
        
        const response = await fetch(`/api/admin/debug/${adminEmail}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('🔍 Admin debug info:', result);
            
            if (result.success) {
                showNotification('✅ Debug info retrieved - check console', 'success');
                console.table(result.data);
            } else {
                showNotification('❌ ' + result.message, 'error');
            }
        } else {
            showNotification('❌ Debug request failed: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Debug error:', error);
        showNotification('❌ Debug error: ' + error.message, 'error');
    }
}

// Function to verify password
async function verifyAdminPassword() {
    try {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
        const adminEmail = loggedInUser.email || 'admin@messmate.com';
        const testPassword = prompt('Enter password to verify (default: admin123):') || 'admin123';
        
        console.log('🔐 Verifying password for:', adminEmail);
        
        const response = await fetch('/api/admin/verify-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: adminEmail,
                password: testPassword
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('🔐 Password verification result:', result);
            
            if (result.success && result.data.passwordMatches) {
                showNotification('✅ Password is correct!', 'success');
            } else {
                showNotification('❌ Password is incorrect', 'error');
            }
        } else {
            showNotification('❌ Verification request failed: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Verification error:', error);
        showNotification('❌ Verification error: ' + error.message, 'error');
    }
}

// Function to ensure admin user exists
async function ensureAdminExists() {
    try {
        console.log('🔧 Ensuring admin user exists...');
        
        const response = await fetch('/api/admin/ensure-admin-exists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('🔧 Admin existence check result:', result);
            
            if (result.success) {
                showNotification('✅ Admin user verified and ready!', 'success');
                console.table(result.data);
                
                // Reload profile after ensuring admin exists
                await loadAdminProfile();
            } else {
                showNotification('❌ ' + result.message, 'error');
            }
        } else {
            showNotification('❌ Admin check failed: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('❌ Admin existence check error:', error);
        showNotification('❌ Error: ' + error.message, 'error');
    }
}

// User management functions
async function viewUser(userId) {
    try {
        console.log('👁️ Viewing user:', userId);
        
        const response = await fetch(`/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('👁️ User details:', result);
            
            if (result.success && result.data) {
                const user = result.data;
                alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nType: ${user.userType}\nRoll/ID: ${user.rollNumber || 'N/A'}\nHostel: ${user.hostel || 'N/A'}\nRoom: ${user.room || 'N/A'}\nPhone: ${user.phone || 'N/A'}\nCreated: ${formatDate(user.createdAt)}`);
            } else {
                showNotification('❌ User not found', 'error');
            }
        } else {
            showNotification('❌ Failed to load user details', 'error');
        }
    } catch (error) {
        console.error('❌ Error viewing user:', error);
        showNotification('❌ Error: ' + error.message, 'error');
    }
}

async function editUser(userId) {
    showNotification('✏️ Edit user functionality coming soon!', 'info');
    console.log('✏️ Edit user:', userId);
    // TODO: Implement edit user modal/form
}

// Function to test user API
async function testUserAPI(filterType = '') {
    try {
        console.log('🧪 Testing User API...');
        
        // Test all users endpoint
        console.log('📋 Testing /api/users/all');
        const allResponse = await fetch('/api/users/all');
        const allResult = await allResponse.json();
        console.log('📋 All users result:', allResult);
        
        if (allResult.success && allResult.data) {
            console.log('👥 Users in database:');
            allResult.data.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email}) - Type: ${user.userType}`);
            });
        }
        
        // Test stats endpoint
        console.log('📊 Testing /api/users/stats');
        const statsResponse = await fetch('/api/users/stats');
        const statsResult = await statsResponse.json();
        console.log('📊 Stats result:', statsResult);
        
        // Test all filter types
        const userTypes = ['STUDENT', 'STAFF', 'ADMIN'];
        for (const type of userTypes) {
            console.log(`🔍 Testing /api/users/by-type/${type}`);
            try {
                const filterResponse = await fetch(`/api/users/by-type/${type}`);
                const filterResult = await filterResponse.json();
                console.log(`🔍 ${type} filter result:`, filterResult);
                if (filterResult.success && filterResult.data) {
                    console.log(`   Found ${filterResult.data.length} ${type.toLowerCase()}(s)`);
                }
            } catch (err) {
                console.error(`❌ Error testing ${type} filter:`, err);
            }
        }
        
        // Test specific filter if provided
        if (filterType) {
            console.log(`🎯 Specific test for ${filterType}`);
            const filterResponse = await fetch(`/api/users/by-type/${filterType}`);
            const filterResult = await filterResponse.json();
            console.log(`🎯 Specific filter result for ${filterType}:`, filterResult);
        }
        
        showNotification('✅ User API test completed - check console for details', 'success');
        
    } catch (error) {
        console.error('❌ User API test failed:', error);
        showNotification('❌ User API test failed: ' + error.message, 'error');
    }
}

// Manual test functions for debugging
async function testStudentFilter() {
    console.log('🎓 Testing STUDENT filter manually...');
    document.getElementById('user-type-filter').value = 'STUDENT';
    await filterUsers();
}

async function testStaffFilter() {
    console.log('👨‍💼 Testing STAFF filter manually...');
    document.getElementById('user-type-filter').value = 'STAFF';
    await filterUsers();
}

async function testAdminFilter() {
    console.log('👑 Testing ADMIN filter manually...');
    document.getElementById('user-type-filter').value = 'ADMIN';
    await filterUsers();
}

// Make functions available globally
window.loadAdminProfile = loadAdminProfile;
window.testAdminAPI = testAdminAPI;
window.debugAdminUser = debugAdminUser;
window.verifyAdminPassword = verifyAdminPassword;
window.ensureAdminExists = ensureAdminExists;
window.viewUser = viewUser;
window.editUser = editUser;
window.loadUsers = loadUsers;
window.loadUserStats = loadUserStats;

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease',
        background: type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 
                   type === 'error' ? 'linear-gradient(135deg, #f44336, #da190b)' : 
                   'linear-gradient(135deg, #2196f3, #0b7dda)'
    });
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Admin Student Orders Management Functions
function setupAdminOrdersDatePicker() {
    const dateInput = document.getElementById('admin-orders-date');
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
}

async function loadAllStudentOrders() {
    const selectedDate = document.getElementById('admin-orders-date').value || new Date().toISOString().split('T')[0];
    
    try {
        // Get all orders for all meal types
        const orderPromises = ['BREAKFAST', 'LUNCH', 'DINNER'].map(mealType => 
            fetch(`/api/orders/today/${mealType}`)
                .then(response => response.json())
                .then(result => ({ mealType, result }))
        );
        
        const orderResults = await Promise.all(orderPromises);
        
        let allOrders = [];
        let totalRevenue = 0;
        let statusCounts = { PENDING: 0, CONFIRMED: 0, READY: 0, DELIVERED: 0, CANCELLED: 0 };
        
        // Collect all orders
        orderResults.forEach(({ mealType, result }) => {
            if (result.success && result.data) {
                const filteredOrders = result.data.filter(order => {
                    return order.createdAt && order.createdAt.startsWith(selectedDate);
                });
                allOrders = allOrders.concat(filteredOrders);
            }
        });
        
        // Calculate statistics
        allOrders.forEach(order => {
            totalRevenue += parseFloat(order.totalAmount || 0);
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        
        // Update summary cards
        document.getElementById('admin-total-orders-count').textContent = allOrders.length;
        document.getElementById('admin-pending-orders-count').textContent = statusCounts.PENDING;
        document.getElementById('admin-confirmed-orders-count').textContent = statusCounts.CONFIRMED;
        document.getElementById('admin-total-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        
        // Display orders in table
        displayAdminOrdersTable(allOrders);
        
    } catch (error) {
        console.error('Error loading student orders:', error);
        showNotification('Error loading student orders. Please try again.', 'error');
        
        // Reset counts to 0
        document.getElementById('admin-total-orders-count').textContent = '0';
        document.getElementById('admin-pending-orders-count').textContent = '0';
        document.getElementById('admin-confirmed-orders-count').textContent = '0';
        document.getElementById('admin-total-revenue').textContent = '₹0';
    }
}

function displayAdminOrdersTable(orders) {
    const tableBody = document.getElementById('admin-orders-table-body');
    
    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data">No orders found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = orders.map(order => `
        <tr class="order-row status-${order.status.toLowerCase()}">
            <td>#${order.id}</td>
            <td>${order.user ? order.user.email : 'Unknown'}</td>
            <td><span class="meal-type-badge ${order.mealType.toLowerCase()}">${order.mealType}</span></td>
            <td class="items-cell">
                ${order.menuItems ? order.menuItems.map(item => item.name).join(', ') : 'No items'}
            </td>
            <td class="amount-cell">₹${order.totalAmount}</td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td class="time-cell">${new Date(order.createdAt).toLocaleTimeString()}</td>
            <td class="actions-cell">
                <select onchange="updateAdminOrderStatus(${order.id}, this.value)" class="status-select">
                    <option value="">Change Status</option>
                    <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                    <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                    <option value="READY" ${order.status === 'READY' ? 'selected' : ''}>Ready</option>
                    <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                    <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

async function updateAdminOrderStatus(orderId, newStatus) {
    if (!newStatus) return;
    
    try {
        const response = await fetch(`/api/orders/${orderId}/status?status=${newStatus}`, {
            method: 'PUT'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
            loadAllStudentOrders(); // Reload orders to reflect changes
        } else {
            showNotification(`Error updating order status: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status. Please try again.', 'error');
    }
}

function applyOrdersFilter() {
    const mealTypeFilter = document.getElementById('meal-type-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    const rows = document.querySelectorAll('#admin-orders-table-body .order-row');
    
    rows.forEach(row => {
        const mealType = row.querySelector('.meal-type-badge').textContent.trim();
        const status = row.querySelector('.status-badge').textContent.trim();
        
        const mealTypeMatch = !mealTypeFilter || mealType === mealTypeFilter;
        const statusMatch = !statusFilter || status === statusFilter;
        
        if (mealTypeMatch && statusMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Update today's booking statistics in overview section
async function updateTodaysBookingStats() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/menu/bookings/stats/${today}`);
        
        if (response.ok) {
            const apiResponse = await response.json();
            const todaysStats = apiResponse.data || [];
            
            // Calculate total quantity for today
            const totalQuantity = todaysStats.reduce((sum, stat) => sum + (stat.totalQuantity || 0), 0);
            document.getElementById('todays-bookings').textContent = totalQuantity;
        } else {
            // If no data for today, show 0
            document.getElementById('todays-bookings').textContent = '0';
        }
    } catch (error) {
        console.error('Error updating todays booking stats:', error);
        document.getElementById('todays-bookings').textContent = '0';
    }
}

// Booking Statistics Functions
async function loadBookingStats(selectedDate = null) {
    try {
        let dateParam;
        if (selectedDate) {
            dateParam = selectedDate;
        } else {
            const dateSelector = document.getElementById('booking-date-selector');
            dateParam = dateSelector?.value || new Date().toISOString().split('T')[0];
        }
        console.log('Loading booking stats for date:', dateParam);
        
        const response = await fetch(`/api/menu/bookings/stats/${dateParam}`);
        if (!response.ok) {
            if (response.status === 404) {
                displayEmptyBookingStats();
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        console.log('Booking stats received:', apiResponse);
        
        const stats = apiResponse.data || [];
        updateBookingSummaryCards(stats);
        updateBookingStatsTable(stats);
        
    } catch (error) {
        console.error('Error loading booking stats:', error);
        displayBookingStatsError('Failed to load booking statistics');
    }
}

async function loadAllBookingStats() {
    try {
        console.log('Loading all booking stats');
        
        const response = await fetch('/api/menu/bookings/stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        console.log('All booking stats received:', apiResponse);
        
        const allStats = apiResponse.data || [];
        if (allStats.length === 0) {
            displayEmptyBookingStats();
            return;
        }
        
        // Calculate totals for summary cards
        const totals = {
            BREAKFAST: { totalQuantity: 0, totalBookings: 0 },
            LUNCH: { totalQuantity: 0, totalBookings: 0 },
            DINNER: { totalQuantity: 0, totalBookings: 0 }
        };
        
        allStats.forEach(stat => {
            const mealType = stat.mealType.toUpperCase();
            if (totals[mealType]) {
                totals[mealType].totalQuantity += stat.totalQuantity;
                totals[mealType].totalBookings += stat.totalBookings;
            }
        });
        
        updateBookingSummaryCards(totals);
        updateBookingStatsTable(allStats);
        
    } catch (error) {
        console.error('Error loading all booking stats:', error);
        displayBookingStatsError('Failed to load booking statistics');
    }
}

function updateBookingSummaryCards(stats) {
    const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'];
    
    mealTypes.forEach(mealType => {
        const mealData = stats[mealType] || stats.find(s => s.mealType?.toUpperCase() === mealType);
        const quantity = mealData?.totalQuantity || 0;
        const bookings = mealData?.totalBookings || 0;
        
        const card = document.querySelector(`.booking-card.${mealType.toLowerCase()}`);
        if (card) {
            const quantityElement = card.querySelector('.booking-stat-value');
            const bookingsElement = card.querySelectorAll('.booking-stat-value')[1];
            
            if (quantityElement) {
                quantityElement.textContent = quantity;
                // Add animation effect
                quantityElement.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    quantityElement.style.transform = 'scale(1)';
                }, 200);
            }
            
            if (bookingsElement) {
                bookingsElement.textContent = bookings;
            }
        }
    });
}

function updateBookingStatsTable(statsArray) {
    const tbody = document.getElementById('booking-stats-table-body');
    
    if (!statsArray || statsArray.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3>No booking data available</h3>
                    <p>No meal bookings found for the selected criteria</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first) and then by meal type
    const sortedStats = statsArray.sort((a, b) => {
        const dateCompare = new Date(b.menuDate) - new Date(a.menuDate);
        if (dateCompare !== 0) return dateCompare;
        
        const mealOrder = { 'BREAKFAST': 1, 'LUNCH': 2, 'DINNER': 3 };
        return mealOrder[a.mealType] - mealOrder[b.mealType];
    });
    
    tbody.innerHTML = sortedStats.map(stat => `
        <tr>
            <td>${formatDate(stat.menuDate)}</td>
            <td>
                <span class="meal-type-badge ${stat.mealType.toLowerCase()}">
                    ${stat.mealType}
                </span>
            </td>
            <td>
                <span class="quantity-value">${stat.totalQuantity}</span>
            </td>
            <td>
                <span class="bookings-count">${stat.totalBookings}</span>
            </td>
        </tr>
    `).join('');
}

function displayEmptyBookingStats() {
    // Clear summary cards
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    mealTypes.forEach(mealType => {
        const card = document.querySelector(`.booking-card.${mealType}`);
        if (card) {
            const quantityElements = card.querySelectorAll('.booking-stat-value');
            quantityElements.forEach(el => el.textContent = '0');
        }
    });
    
    // Show empty state in table
    updateBookingStatsTable([]);
}

function displayBookingStatsError(message) {
    const tbody = document.getElementById('booking-stats-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Error Loading Data</h3>
                <p>${message}</p>
            </td>
        </tr>
    `;
}

function refreshBookingStats() {
    const dateSelector = document.getElementById('booking-date-selector');
    const selectedDate = dateSelector?.value;
    
    if (selectedDate) {
        loadBookingStats(selectedDate);
    } else {
        loadAllBookingStats();
    }
}

function exportBookingStats() {
    const table = document.querySelector('#booking-stats-table table');
    if (!table) return;
    
    // Simple CSV export
    const rows = Array.from(table.querySelectorAll('tr'));
    const csvContent = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        return cells.map(cell => cell.textContent.trim()).join(',');
    }).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Event listeners for booking statistics
document.addEventListener('DOMContentLoaded', function() {
    // Date selector change event
    const dateSelector = document.getElementById('booking-date-selector');
    if (dateSelector) {
        dateSelector.addEventListener('change', function() {
            if (this.value) {
                loadBookingStats(this.value);
            } else {
                loadAllBookingStats();
            }
        });
    }
    
    // Quick action buttons
    const refreshBtn = document.querySelector('.quick-btn.refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshBookingStats);
    }
    
    const exportBtn = document.querySelector('.quick-btn.export');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportBookingStats);
    }
    
    // Load initial booking stats when admin dashboard is opened
    if (document.getElementById('booking-stats-table-body')) {
        loadAllBookingStats();
    }
});