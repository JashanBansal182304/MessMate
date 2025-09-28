// Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    setupNavigation();
    setupDatePicker();
    setupFeedbackRating();
    setupForms();
    setupChangePasswordForm();
    loadUserData();
    
    // Load meal data when meal-booking section is accessed
    refreshMealData();
});

// Initialize dashboard functionality
function initializeDashboard() {
    // Check if user is logged in
    const user = localStorage.getItem('loggedInUser');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Parse user data
    const userData = JSON.parse(user);
    displayUserInfo(userData);
}

// Display user information in sidebar
function displayUserInfo(userData) {
    document.getElementById('student-name').textContent = userData.name || 'Student Name';
    document.getElementById('student-roll').textContent = `Roll: ${userData.rollNumber || 'N/A'}`;
    document.getElementById('student-hostel').textContent = `Hostel: ${userData.hostel || 'N/A'}`;
    
    // Set avatar initial
    const avatar = document.getElementById('student-avatar');
    avatar.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : '👤';
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
    
    // Quick action button handlers
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionName = button.dataset.section;
            const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
            switchSection(sectionName, targetNavItem, sections, sectionTitle);
        });
    });
    
    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// Switch between dashboard sections
function switchSection(sectionName, navItem, sections, sectionTitle) {
    // Update active navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    navItem.classList.add('active');
    
    // Update active section
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Update section title
    const titles = {
        'overview': 'Dashboard Overview',
        'meal-booking': 'Meal Booking',
        'feedback': 'Share Feedback',
        'complaint': 'File Complaint',
        'profile': 'Profile Settings'
    };
    sectionTitle.textContent = titles[sectionName] || 'Dashboard';
    
    // Refresh meal data when accessing meal-booking section
    if (sectionName === 'meal-booking') {
        setTimeout(refreshMealData, 100); // Small delay to ensure section is visible
    }
}

// Setup date picker with constraints
function setupDatePicker() {
    const dateInput = document.getElementById('booking-date');
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7); // Allow booking up to 7 days in advance
    
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    dateInput.value = today.toISOString().split('T')[0];
    
    // Load meal bookings when date changes
    dateInput.addEventListener('change', loadMealBookings);
    
    // Load initial bookings
    loadMealBookings();
}

// Setup feedback rating system
function setupFeedbackRating() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('feedback-rating');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            ratingInput.value = rating;
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        star.addEventListener('mouseover', () => {
            const rating = star.dataset.rating;
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.opacity = '1';
                } else {
                    s.style.opacity = '0.3';
                }
            });
        });
    });
    
    // Reset on mouse leave
    document.querySelector('.rating-container').addEventListener('mouseleave', () => {
        const currentRating = ratingInput.value;
        stars.forEach((s, index) => {
            if (index < currentRating) {
                s.style.opacity = '1';
            } else {
                s.style.opacity = '0.3';
            }
        });
    });
}

// Setup form handlers
function setupForms() {
    // Meal booking form
    document.getElementById('save-bookings').addEventListener('click', saveMealBookings);
    
    // Feedback form
    document.getElementById('feedback-form').addEventListener('submit', submitFeedback);
    
    // Complaint form
    document.getElementById('complaint-form').addEventListener('submit', submitComplaint);
    
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
}

// Load user data into profile form
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-roll').value = user.rollNumber || '';
        document.getElementById('profile-hostel').value = user.hostel || '';
        document.getElementById('profile-room').value = user.room || '';
        document.getElementById('profile-phone').value = user.phone || '';
    }
}

// Refresh meal data from admin dashboard
function refreshMealData() {
    console.log('Refreshing meal data from admin dashboard...');
    loadMealBookings();
}

// Load meal bookings for selected date
async function loadMealBookings() {
    const selectedDate = document.getElementById('booking-date').value;
    console.log('Loading meal bookings for date:', selectedDate);
    
    try {
        // Get menu data from backend
        const response = await fetch(`/api/menu/daily/date/${selectedDate}`);
        const result = await response.json();
        
        let dayMenus = [];
        if (response.ok && result.success && result.data) {
            // Transform backend data to match frontend format
            dayMenus = result.data.map(dailyMenu => ({
                date: selectedDate,
                mealType: dailyMenu.mealType.toLowerCase(),
                items: dailyMenu.menuItems ? dailyMenu.menuItems.map(item => item.name).join(', ') : 'No items available',
                price: dailyMenu.menuItems ? dailyMenu.menuItems.reduce((sum, item) => sum + (item.price || 0), 0) : 0
            }));
        }
        
        console.log('Available menus from backend:', dayMenus);
        
        // Get existing bookings from database
        const bookings = await loadExistingBookings(selectedDate);
        
        // Update each meal section
        updateMealSection('breakfast', dayMenus, bookings);
        updateMealSection('lunch', dayMenus, bookings);
        updateMealSection('dinner', dayMenus, bookings);
        
    } catch (error) {
        console.error('Error loading menus from backend:', error);
        // Fallback to empty menus
        const dayMenus = [];
        const bookings = {};
        
        updateMealSection('breakfast', dayMenus, bookings);
        updateMealSection('lunch', dayMenus, bookings);
        updateMealSection('dinner', dayMenus, bookings);
    }
}

// Load existing bookings from database
async function loadExistingBookings(selectedDate) {
    try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user || !user.email) {
            return {};
        }
        
        const response = await fetch(`/api/orders/user/${user.email}`);
        const result = await response.json();
        
        if (response.ok && result.success && result.data) {
            const orders = result.data;
            const bookings = {};
            
            // Filter orders for the selected date and create booking map
            orders.forEach(order => {
                // Check if order is for the selected date (you might need to adjust this based on your date format)
                if (order.createdAt && order.createdAt.startsWith(selectedDate)) {
                    const mealType = order.mealType.toLowerCase();
                    bookings[mealType] = true;
                }
            });
            
            return bookings;
        }
        
        return {};
    } catch (error) {
        console.error('Error loading existing bookings:', error);
        return {};
    }
}

// Update individual meal section based on available menu
function updateMealSection(mealType, dayMenus, bookings) {
    console.log(`Updating ${mealType} section...`);
    const mealMenu = dayMenus.find(menu => menu.mealType === mealType);
    console.log(`Menu found for ${mealType}:`, mealMenu);
    
    const checkbox = document.getElementById(`${mealType}-book`);
    const mealCard = checkbox.closest('.meal-card');
    const mealContent = mealCard.querySelector('.meal-content');
    const staticMenuElement = mealCard.querySelector('.meal-menu');
    
    if (mealMenu) {
        console.log(`Enabling ${mealType} booking with menu:`, mealMenu);
        // Menu available - show meal details and enable booking
        checkbox.disabled = false;
        checkbox.checked = bookings[mealType] || false;
        
        // Update the static menu text with dynamic content
        if (staticMenuElement) {
            staticMenuElement.innerHTML = `${mealMenu.items} <strong>(₹${mealMenu.price.toFixed(2)})</strong>`;
        }
        
        // Remove any "not available" message
        const notAvailable = mealCard.querySelector('.not-available');
        if (notAvailable) {
            notAvailable.remove();
        }
        
        // Make sure meal card is not disabled
        mealCard.classList.remove('meal-disabled');
        
    } else {
        console.log(`No menu found for ${mealType}, disabling booking`);
        // No menu available - disable booking and show message
        checkbox.disabled = true;
        checkbox.checked = false;
        
        // Update the static menu text to show unavailable
        if (staticMenuElement) {
            staticMenuElement.innerHTML = 'No menu available for this meal today';
        }
        
        // Add or update "not available" message
        let notAvailable = mealCard.querySelector('.not-available');
        if (!notAvailable) {
            notAvailable = document.createElement('div');
            notAvailable.className = 'not-available';
            mealContent.appendChild(notAvailable);
        }
        
        notAvailable.innerHTML = `
            <div class="no-menu-message">
                <p>❌ Please contact admin or check back later</p>
            </div>
        `;
        
        // Add disabled class to meal card
        mealCard.classList.add('meal-disabled');
    }
}

// Save meal bookings
async function saveMealBookings() {
    const selectedDate = document.getElementById('booking-date').value;
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!user || !user.email) {
        showNotification('Please log in to book meals.', 'error');
        return;
    }
    
    // Only save bookings for enabled (available) meals
    const bookings = {};
    const selectedMeals = [];
    
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const checkbox = document.getElementById(`${mealType}-book`);
        if (!checkbox.disabled && checkbox.checked) {
            bookings[mealType] = true;
            selectedMeals.push(mealType);
        }
    });
    
    if (selectedMeals.length === 0) {
        showNotification('No meals selected. Please select available meals to book.', 'info');
        return;
    }
    
    // Save to local storage first
    localStorage.setItem(`bookings_${selectedDate}`, JSON.stringify(bookings));
    
    // Get the daily menu data to find menu item IDs for selected meals
    try {
        const response = await fetch(`/api/menu/daily/date/${selectedDate}`);
        const result = await response.json();
        
        if (!response.ok || !result.success || !result.data) {
            showNotification('Unable to load menu data for booking.', 'error');
            return;
        }
        
        const dailyMenus = result.data;
        const orderPromises = [];
        
        // Create separate orders for each meal type
        for (const mealType of selectedMeals) {
            const dailyMenu = dailyMenus.find(menu => menu.mealType.toLowerCase() === mealType);
            
            if (dailyMenu && dailyMenu.menuItems && dailyMenu.menuItems.length > 0) {
                // Debug logging
                console.log('Booking meal for:', mealType);
                console.log('Daily menu:', dailyMenu);
                console.log('User:', user.email);
                
                // Create booking using the meal booking endpoint
                const bookingData = {
                    dailyMenuId: dailyMenu.id,
                    quantity: 1,
                    specialInstructions: `Meal booking for ${selectedDate} - ${mealType}`
                };
                
                const orderPromise = fetch('/api/menu/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData)
                });
                
                orderPromises.push(orderPromise);
            }
        }
        
        // Wait for all orders to complete
        const responses = await Promise.all(orderPromises);
        const results = await Promise.all(responses.map(r => r.json()));
        
        // Check if all orders were successful
        const successfulOrders = results.filter(r => r.success);
        const failedOrders = results.filter(r => !r.success);
        
        if (successfulOrders.length > 0) {
            showNotification(`Meal bookings saved successfully for: ${selectedMeals.join(', ')}!`, 'success');
        }
        
        if (failedOrders.length > 0) {
            console.error('Some orders failed:', failedOrders);
            showNotification(`Some bookings failed. Please try again.`, 'warning');
        }
        
    } catch (error) {
        console.error('Error saving bookings:', error);
        showNotification('Error saving bookings. Please try again.', 'error');
    }
}

// Submit feedback
async function submitFeedback(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    console.log('User data from localStorage:', user);
    
    // For testing purposes, use admin email if no user is logged in
    const userEmail = (user && (user.email || user.studentEmail)) || 'admin@messmate.com';
    console.log('Using email for feedback:', userEmail);
    
    const feedbackData = {
        feedbackType: document.getElementById('feedback-type').value,
        rating: parseInt(document.getElementById('feedback-rating').value),
        message: document.getElementById('feedback-message').value,
        studentEmail: userEmail
    };
    
    // Validate rating
    if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
        showNotification('Please provide a valid rating (1-5)', 'error');
        return;
    }
    
    // Validate message
    if (!feedbackData.message.trim()) {
        showNotification('Please provide feedback message', 'error');
        return;
    }
    
    try {
        console.log('Sending feedback data:', feedbackData);
        const response = await fetch('/api/feedback/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Reset form and show success
            document.getElementById('feedback-form').reset();
            document.getElementById('feedback-rating').value = '';
            document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
            
            showNotification('Feedback submitted successfully!', 'success');
            
            // Optionally load user's feedback history
            await loadUserFeedbackHistory();
        } else {
            const error = await response.json();
            console.error('API Error Response:', error);
            showNotification(error.message || 'Failed to submit feedback', 'error');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Load user's feedback history
async function loadUserFeedbackHistory() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user) return;
    
    try {
        const response = await fetch(`/api/feedback/user/${user.id || user.rollNumber}`);
        if (response.ok) {
            const feedbackHistory = await response.json();
            displayFeedbackHistory(feedbackHistory);
        }
    } catch (error) {
        console.error('Error loading feedback history:', error);
    }
}

// Display feedback history (optional - can be used to show user's previous feedback)
function displayFeedbackHistory(feedbackList) {
    // This function can be implemented if you want to show feedback history
    // in a dedicated section of the student dashboard
    console.log('User feedback history:', feedbackList);
}

// Submit complaint
function submitComplaint(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const complaintData = {
        id: Date.now(),
        studentName: user.name,
        studentId: user.id || user.rollNumber,
        studentEmail: user.email,
        title: document.getElementById('complaint-subject').value,
        description: document.getElementById('complaint-description').value,
        category: document.getElementById('complaint-category').value,
        priority: document.getElementById('complaint-priority').value,
        status: 'pending',
        student: user.name,
        createdAt: new Date().toISOString()
    };
    
    // Save complaint to admin dashboard data
    let adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {
        users: [],
        complaints: [],
        feedback: [],
        menus: []
    };
    
    adminData.complaints.push(complaintData);
    adminData.lastUpdated = new Date().toISOString();
    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
    
    // Reset form and show success
    document.getElementById('complaint-form').reset();
    showNotification('Complaint submitted successfully! You will receive updates soon.', 'success');
}

// Update profile
function updateProfile(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const updatedUser = {
        ...user,
        hostel: document.getElementById('profile-hostel').value,
        room: document.getElementById('profile-room').value,
        phone: document.getElementById('profile-phone').value
    };
    
    // Update user data
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update displayed info
    displayUserInfo(updatedUser);
    
    showNotification('Profile updated successfully!', 'success');
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('rememberMe');
        window.location.href = 'login.html';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
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

// Update stats (placeholder data for now)
function updateDashboardStats() {
    // In a real application, this would fetch data from the backend
    const today = new Date().toISOString().split('T')[0];
    const bookings = JSON.parse(localStorage.getItem(`bookings_${today}`)) || {};
    
    const bookedCount = Object.values(bookings).filter(Boolean).length;
    document.getElementById('todays-meals').textContent = `${bookedCount} Booked`;
    
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    document.getElementById('feedback-count').textContent = `${feedbacks.length} Reviews`;
}

// Call updateDashboardStats when the page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateDashboardStats, 500);
});

// Setup change password form
function setupChangePasswordForm() {
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
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
            if (!loggedInUser) {
                showNotification('User not found!', 'error');
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
            
            // Update in users array if it exists
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === loggedInUser.email);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update in admin data if it exists
            const adminData = JSON.parse(localStorage.getItem('messmate_admin_data')) || {};
            if (adminData.students) {
                const studentIndex = adminData.students.findIndex(s => s.email === loggedInUser.email);
                if (studentIndex !== -1) {
                    adminData.students[studentIndex].password = newPassword;
                    localStorage.setItem('messmate_admin_data', JSON.stringify(adminData));
                }
            }
            
            // Clear form
            changePasswordForm.reset();
            
            showNotification('Password changed successfully!', 'success');
        });
    }
}