// Database Viewer JavaScript
let currentTab = 'overview';
let usersData = [];
let caseStudiesData = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    // Load initial data
    loadOverview();
});

// Tab switching functionality
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    currentTab = tabName;
    
    // Load data for the selected tab
    switch(tabName) {
        case 'overview':
            loadOverview();
            break;
        case 'users':
            loadUsers();
            break;
        case 'case-studies':
            loadCaseStudies();
            break;
    }
}

// Load overview data
async function loadOverview() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/database/overview', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayOverview(data.overview);
        } else {
            showError('overview-stats', data.message);
        }
    } catch (error) {
        console.error('Error loading overview:', error);
        showError('overview-stats', 'Failed to load overview data');
    }
}

// Display overview data
function displayOverview(overview) {
    const statsContainer = document.getElementById('overview-stats');
    
    let statusStats = '';
    if (overview.caseStudies.byStatus) {
        statusStats = Object.entries(overview.caseStudies.byStatus)
            .map(([status, count]) => `
                <div class="stat-card">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">${status}</div>
                </div>
            `).join('');
    }
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${overview.users.total}</div>
            <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${overview.caseStudies.total}</div>
            <div class="stat-label">Total Case Studies</div>
        </div>
        ${statusStats}
    `;
}

// Load users data
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/database/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            usersData = data.users;
            displayUsers(data.users);
        } else {
            showError('users-content', data.message);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('users-content', 'Failed to load users data');
    }
}

// Display users data
function displayUsers(users) {
    const container = document.getElementById('users-content');
    
    if (users.length === 0) {
        container.innerHTML = '<div class="loading">No users found</div>';
        return;
    }
    
    const usersHtml = users.map(user => `
        <div class="record-item">
            <div class="record-title">${user.email}</div>
            <div class="record-meta">
                ID: ${user.id} | 
                Created: ${formatDate(user.createdAt)} | 
                Last Edited: ${formatDate(user.lastEditedTime)}
            </div>
            <div class="record-details">
                <div class="detail-item">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">${user.fullName || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${user.phone || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Notion Page</div>
                    <div class="detail-value">
                        <a href="${user.url}" target="_blank" class="notion-link">View in Notion</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = usersHtml;
}

// Load case studies data
async function loadCaseStudies() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/database/case-studies', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            caseStudiesData = data.caseStudies;
            displayCaseStudies(data.caseStudies);
        } else {
            showError('case-studies-content', data.message);
        }
    } catch (error) {
        console.error('Error loading case studies:', error);
        showError('case-studies-content', 'Failed to load case studies data');
    }
}

// Display case studies data
function displayCaseStudies(caseStudies) {
    const container = document.getElementById('case-studies-content');
    
    if (caseStudies.length === 0) {
        container.innerHTML = '<div class="loading">No case studies found</div>';
        return;
    }
    
    const caseStudiesHtml = caseStudies.map(cs => `
        <div class="record-item">
            <div class="record-header">
                ${cs.coverImage ? `<img src="${cs.coverImage}" alt="Cover" class="cover-image">` : ''}
                <div style="flex: 1;">
                    <div class="record-title">${cs.name}</div>
                    <div class="record-meta">
                        ID: ${cs.id} | 
                        Created: ${formatDate(cs.createdAt)} | 
                        Last Edited: ${formatDate(cs.lastEditedTime)}
                    </div>
                </div>
                <span class="status-badge status-${cs.status.toLowerCase().replace(' ', '-')}">${cs.status}</span>
            </div>
            <div class="record-details">
                <div class="detail-item">
                    <div class="detail-label">Project Details</div>
                    <div class="detail-value">${cs.projectDetails || 'No details provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Tags</div>
                    <div class="detail-value">
                        ${cs.tags.length > 0 ? 
                            `<div class="tags">${cs.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : 
                            'No tags'
                        }
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Cover Image</div>
                    <div class="detail-value">${cs.coverImage ? `<a href="${cs.coverImage}" target="_blank" class="notion-link">View Image</a>` : 'No image'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Notion Page</div>
                    <div class="detail-value">
                        <a href="${cs.url}" target="_blank" class="notion-link">View in Notion</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = caseStudiesHtml;
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showError(containerId, message) {
    document.getElementById(containerId).innerHTML = `
        <div class="error">
            <strong>Error:</strong> ${message}
        </div>
    `;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}