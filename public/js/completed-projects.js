// Completed Projects Showcase JavaScript

let completedProjects = [];
let allTags = new Set();
let currentFilter = 'all';
let autoRefreshInterval;
let lastRefreshTime = null;

// Auto-refresh configuration (2-6 hours in milliseconds)
const MIN_REFRESH_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
const MAX_REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

// DOM Elements
const loadingContainer = document.getElementById('loadingContainer');
const projectsGrid = document.getElementById('projectsGrid');
const emptyState = document.getElementById('emptyState');
const filterControls = document.getElementById('filterControls');
const totalProjectsEl = document.getElementById('totalProjects');
const totalTagsEl = document.getElementById('totalTags');
const lastUpdatedEl = document.getElementById('lastUpdated');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadCompletedProjects();
    setupAutoRefresh();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter button event delegation
    filterControls.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            handleFilterClick(e.target);
        }
    });
}

// Handle filter button clicks
function handleFilterClick(button) {
    // Remove active class from all buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    button.classList.add('active');
    
    // Update current filter
    currentFilter = button.dataset.filter;
    
    // Filter and display projects
    filterProjects();
}

// Load completed projects from API
async function loadCompletedProjects() {
    try {
        showLoading();
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/case-studies', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        
        if (data.success) {
            // Filter only completed projects
            completedProjects = data.caseStudies.filter(project => 
                project.status === 'Done'
            );
            
            // Extract all unique tags
            allTags.clear();
            completedProjects.forEach(project => {
                if (project.tags && Array.isArray(project.tags)) {
                    project.tags.forEach(tag => allTags.add(tag));
                }
            });
            
            updateStats();
            createFilterButtons();
            displayProjects();
            updateLastRefreshTime();
        } else {
            showError(data.message || 'Failed to load completed projects');
        }
    } catch (error) {
        console.error('Error loading completed projects:', error);
        showError('Failed to load completed projects. Please try again.');
    }
}

// Update statistics
function updateStats() {
    totalProjectsEl.textContent = completedProjects.length;
    totalTagsEl.textContent = allTags.size;
}

// Create filter buttons dynamically
function createFilterButtons() {
    // Clear existing buttons except "All Projects"
    const existingButtons = filterControls.querySelectorAll('.filter-btn:not([data-filter="all"])');
    existingButtons.forEach(btn => btn.remove());
    
    // Add tag-based filter buttons
    allTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.dataset.filter = tag.toLowerCase();
        button.textContent = tag;
        filterControls.appendChild(button);
    });
}

// Filter projects based on current filter
function filterProjects() {
    let filteredProjects = completedProjects;
    
    if (currentFilter !== 'all') {
        filteredProjects = completedProjects.filter(project => 
            project.tags && project.tags.some(tag => 
                tag.toLowerCase() === currentFilter
            )
        );
    }
    
    displayFilteredProjects(filteredProjects);
}

// Display projects in grid
function displayProjects() {
    filterProjects(); // This will call displayFilteredProjects
}

// Display filtered projects
function displayFilteredProjects(projects) {
    hideLoading();
    
    if (projects.length === 0) {
        if (currentFilter === 'all') {
            showEmptyState();
        } else {
            showNoResultsState();
        }
        return;
    }
    
    hideEmptyState();
    projectsGrid.style.display = 'grid';
    projectsGrid.innerHTML = '';
    
    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsGrid.appendChild(projectCard);
    });
    
    // Animate cards
    animateCards();
}

// Create project card element
function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Format date
    const createdDate = project.createdAt ? 
        new Date(project.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : 'Unknown';
    
    // Create tags HTML
    const tagsHTML = project.tags && project.tags.length > 0 ? 
        project.tags.map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`).join('') : 
        '<span class="project-tag">No tags</span>';
    
    // Create cover image HTML
    const coverImageHTML = project.coverImage && project.coverImage.url ? 
        `<div class="project-image">
            <img src="${escapeHtml(project.coverImage.url)}" alt="${escapeHtml(project.name)}" loading="lazy">
            <div class="project-overlay">
                <div class="project-status completed">✓ Completed</div>
            </div>
        </div>` : 
        `<div class="project-image placeholder">
            <div class="placeholder-icon">🎨</div>
            <div class="project-overlay">
                <div class="project-status completed">✓ Completed</div>
            </div>
        </div>`;
    
    card.innerHTML = `
        ${coverImageHTML}
        <div class="project-content">
            <h3 class="project-title">${escapeHtml(project.name)}</h3>
            <p class="project-description">${escapeHtml(project.projectDetails || 'No description available')}</p>
            <div class="project-tags">
                ${tagsHTML}
            </div>
            <div class="project-meta">
                <span class="project-date">Completed: ${createdDate}</span>
            </div>
        </div>
    `;
    
    // Add click event for card interaction
    card.addEventListener('click', () => {
        card.classList.add('clicked');
        setTimeout(() => card.classList.remove('clicked'), 200);
    });
    
    return card;
}

// Animate cards on load
function animateCards() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
}

// Setup auto-refresh functionality
function setupAutoRefresh() {
    // Generate random interval between 2-6 hours
    const randomInterval = Math.floor(Math.random() * (MAX_REFRESH_INTERVAL - MIN_REFRESH_INTERVAL + 1)) + MIN_REFRESH_INTERVAL;
    
    console.log(`Auto-refresh set for ${Math.round(randomInterval / (1000 * 60 * 60))} hours`);
    
    autoRefreshInterval = setInterval(() => {
        console.log('Auto-refreshing completed projects...');
        loadCompletedProjects();
    }, randomInterval);
    
    // Also refresh when page becomes visible again (if user was away)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && lastRefreshTime) {
            const timeSinceLastRefresh = Date.now() - lastRefreshTime;
            // If more than 2 hours have passed, refresh
            if (timeSinceLastRefresh > MIN_REFRESH_INTERVAL) {
                console.log('Page visible again, refreshing due to time elapsed...');
                loadCompletedProjects();
            }
        }
    });
}

// Update last refresh time
function updateLastRefreshTime() {
    lastRefreshTime = Date.now();
    const timeString = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    lastUpdatedEl.textContent = timeString;
}

// Show loading state
function showLoading() {
    loadingContainer.style.display = 'flex';
    projectsGrid.style.display = 'none';
    emptyState.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingContainer.style.display = 'none';
}

// Show empty state
function showEmptyState() {
    emptyState.style.display = 'flex';
    projectsGrid.style.display = 'none';
}

// Show no results state
function showNoResultsState() {
    emptyState.style.display = 'flex';
    projectsGrid.style.display = 'none';
    
    // Temporarily change empty state content
    const emptyIcon = emptyState.querySelector('.empty-icon');
    const emptyTitle = emptyState.querySelector('.empty-title');
    const emptyDescription = emptyState.querySelector('.empty-description');
    
    const originalIcon = emptyIcon.textContent;
    const originalTitle = emptyTitle.textContent;
    const originalDescription = emptyDescription.textContent;
    
    emptyIcon.textContent = '🔍';
    emptyTitle.textContent = 'No Projects Found';
    emptyDescription.textContent = `No completed projects found for "${currentFilter}" category.`;
    
    // Reset after 3 seconds if filter changes
    setTimeout(() => {
        if (currentFilter !== 'all') {
            emptyIcon.textContent = originalIcon;
            emptyTitle.textContent = originalTitle;
            emptyDescription.textContent = originalDescription;
        }
    }, 3000);
}

// Hide empty state
function hideEmptyState() {
    emptyState.style.display = 'none';
}

// Show error message
function showError(message) {
    console.error('Error:', message);
    // Create a temporary error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});