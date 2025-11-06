// Check if user is logged in
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/';
}

// Load user profile
async function loadProfile() {
    try {
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        const data = await response.json();
        
        if (data.success) {
            const user = data.user;
            
            // Update display
            document.getElementById('userName').textContent = user.fullName || user.email.split('@')[0];
            document.getElementById('displayEmail').textContent = user.email;
            document.getElementById('displayFullName').textContent = user.fullName || 'Not set';
            document.getElementById('displayPhone').textContent = user.phone || 'Not set';
            
            // Format date
            if (user.createdAt) {
                const date = new Date(user.createdAt);
                document.getElementById('displayCreatedAt').textContent = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            
            // Pre-fill form
            document.getElementById('fullName').value = user.fullName || '';
            document.getElementById('phone').value = user.phone || '';
        } else {
            if (response.status === 401 || response.status === 403) {
                // Token is invalid, logout
                logout();
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Edit profile
document.getElementById('editBtn').addEventListener('click', () => {
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'block';
});

// Cancel edit
document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('profileView').style.display = 'block';
    document.getElementById('profileEdit').style.display = 'none';
    document.getElementById('updateMessage').textContent = '';
    document.getElementById('updateMessage').classList.remove('show');
    document.getElementById('updateError').textContent = '';
    document.getElementById('updateError').classList.remove('show');
});

// Update profile
document.getElementById('updateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const updateMessage = document.getElementById('updateMessage');
    const updateError = document.getElementById('updateError');
    
    // Clear previous messages
    updateMessage.textContent = '';
    updateMessage.classList.remove('show');
    updateError.textContent = '';
    updateError.classList.remove('show');
    
    // Disable submit button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        const response = await fetch('/api/user/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ fullName, phone }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateMessage.textContent = 'Profile updated successfully!';
            updateMessage.classList.add('show');
            
            // Reload profile after short delay
            setTimeout(() => {
                loadProfile();
                document.getElementById('profileView').style.display = 'block';
                document.getElementById('profileEdit').style.display = 'none';
                updateMessage.textContent = '';
                updateMessage.classList.remove('show');
            }, 1500);
        } else {
            updateError.textContent = data.message || 'Update failed';
            updateError.classList.add('show');
        }
    } catch (error) {
        updateError.textContent = 'An error occurred. Please try again.';
        updateError.classList.add('show');
        console.error('Update error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Load profile on page load
loadProfile();
