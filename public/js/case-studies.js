// Case Studies Management JavaScript

let currentCaseStudies = [];
let editingCaseStudyId = null;
let currentTags = [];

// DOM Elements
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const caseStudiesGrid = document.getElementById('caseStudiesGrid');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('caseStudyModal');
const modalTitle = document.getElementById('modalTitle');
const caseStudyForm = document.getElementById('caseStudyForm');
const addCaseStudyBtn = document.getElementById('addCaseStudyBtn');
const addFirstCaseStudyBtn = document.getElementById('addFirstCaseStudyBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');
const tagsInput = document.getElementById('tagsInput');
const tagInput = document.getElementById('tagInput');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadCaseStudies();
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
    addCaseStudyBtn.addEventListener('click', () => openModal());
    addFirstCaseStudyBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', closeModalHandler);
    cancelBtn.addEventListener('click', closeModalHandler);
    caseStudyForm.addEventListener('submit', handleFormSubmit);
    
    // Tags input handling
    tagInput.addEventListener('keydown', handleTagInput);
    tagsInput.addEventListener('click', () => tagInput.focus());
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
    });
}

// Load case studies from API
async function loadCaseStudies() {
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
            currentCaseStudies = data.caseStudies;
            displayCaseStudies();
        } else {
            showError(data.message || 'Failed to load case studies');
        }
    } catch (error) {
        console.error('Error loading case studies:', error);
        showError('Failed to load case studies. Please try again.');
    }
}

// Display case studies in grid
function displayCaseStudies() {
    hideLoading();
    hideError();
    
    if (currentCaseStudies.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    caseStudiesGrid.style.display = 'grid';
    
    caseStudiesGrid.innerHTML = currentCaseStudies.map(caseStudy => `
        <div class="case-study-card" onclick="viewCaseStudy('${caseStudy.id}')" style="cursor: pointer;">
            <div class="case-study-image">
                ${caseStudy.coverImage ? 
                    `<img src="${caseStudy.coverImage}" alt="${caseStudy.name}" onerror="this.parentElement.innerHTML='<span>No Image</span>'">` : 
                    '<span>No Image</span>'
                }
            </div>
            <div class="case-study-content">
                <div class="case-study-title">${escapeHtml(caseStudy.name)}</div>
                <div class="case-study-details">${escapeHtml(caseStudy.projectDetails || 'No details provided')}</div>
                <div class="case-study-tags">
                    ${caseStudy.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="case-study-footer">
                    <span class="status ${getStatusClass(caseStudy.status)}">${caseStudy.status}</span>
                    <div class="case-study-actions" onclick="event.stopPropagation();">
                        <button class="btn-small btn-view" onclick="viewCaseStudy('${caseStudy.id}')">View</button>
                        <button class="btn-small btn-edit" onclick="editCaseStudy('${caseStudy.id}')">Edit</button>
                        <button class="btn-small btn-delete" onclick="deleteCaseStudy('${caseStudy.id}')">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Get CSS class for status
function getStatusClass(status) {
    switch (status) {
        case 'Not Started': return 'not-started';
        case 'In Progress': return 'in-progress';
        case 'Completed': return 'completed';
        default: return 'not-started';
    }
}

// Open modal for adding/editing
function openModal(caseStudy = null) {
    editingCaseStudyId = caseStudy ? caseStudy.id : null;
    modalTitle.textContent = caseStudy ? 'Edit Case Study' : 'Add Case Study';
    submitBtn.textContent = caseStudy ? 'Update Case Study' : 'Save Case Study';
    
    // Reset form
    caseStudyForm.reset();
    currentTags = [];
    updateTagsDisplay();
    
    // Fill form if editing
    if (caseStudy) {
        document.getElementById('name').value = caseStudy.name;
        document.getElementById('projectDetails').value = caseStudy.projectDetails || '';
        document.getElementById('coverImageUrl').value = caseStudy.coverImage || '';
        document.getElementById('status').value = caseStudy.status;
        currentTags = [...caseStudy.tags];
        updateTagsDisplay();
    }
    
    modal.style.display = 'block';
    document.getElementById('name').focus();
}

// Close modal
function closeModalHandler() {
    modal.style.display = 'none';
    editingCaseStudyId = null;
    currentTags = [];
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(caseStudyForm);
    const caseStudyData = {
        name: formData.get('name').trim(),
        projectDetails: formData.get('projectDetails').trim(),
        tags: currentTags,
        status: formData.get('status')
    };
    
    const coverImageUrl = formData.get('coverImageUrl').trim();
    if (coverImageUrl) {
        caseStudyData.coverImage = {
            url: coverImageUrl,
            name: 'cover-image'
        };
    }
    
    if (!caseStudyData.name) {
        showError('Project name is required');
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = editingCaseStudyId ? 'Updating...' : 'Saving...';
        
        const token = localStorage.getItem('token');
        const url = editingCaseStudyId ? 
            `/api/case-studies/${editingCaseStudyId}` : 
            '/api/case-studies';
        const method = editingCaseStudyId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(caseStudyData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModalHandler();
            loadCaseStudies(); // Reload to get updated data
            showSuccess(data.message);
        } else {
            showError(data.message || 'Failed to save case study');
        }
    } catch (error) {
        console.error('Error saving case study:', error);
        showError('Failed to save case study. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingCaseStudyId ? 'Update Case Study' : 'Save Case Study';
    }
}

// Edit case study
function editCaseStudy(id) {
    const caseStudy = currentCaseStudies.find(cs => cs.id === id);
    if (caseStudy) {
        openModal(caseStudy);
    }
}

// Delete case study
async function deleteCaseStudy(id) {
    const caseStudy = currentCaseStudies.find(cs => cs.id === id);
    if (!caseStudy) return;
    
    if (!confirm(`Are you sure you want to delete "${caseStudy.name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/case-studies/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadCaseStudies(); // Reload to get updated data
            showSuccess(data.message);
        } else {
            showError(data.message || 'Failed to delete case study');
        }
    } catch (error) {
        console.error('Error deleting case study:', error);
        showError('Failed to delete case study. Please try again.');
    }
}

// Handle tag input
function handleTagInput(e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag();
    } else if (e.key === 'Backspace' && e.target.value === '' && currentTags.length > 0) {
        removeTag(currentTags.length - 1);
    }
}

// Add tag
function addTag() {
    const tagValue = tagInput.value.trim();
    if (tagValue && !currentTags.includes(tagValue)) {
        currentTags.push(tagValue);
        tagInput.value = '';
        updateTagsDisplay();
    }
}

// Remove tag
function removeTag(index) {
    currentTags.splice(index, 1);
    updateTagsDisplay();
}

// Update tags display
function updateTagsDisplay() {
    const existingTags = tagsInput.querySelectorAll('.tag-item');
    existingTags.forEach(tag => tag.remove());
    
    currentTags.forEach((tag, index) => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${escapeHtml(tag)}
            <button type="button" class="tag-remove" onclick="removeTag(${index})">&times;</button>
        `;
        tagsInput.insertBefore(tagElement, tagInput);
    });
}

// Utility functions
function showLoading() {
    loadingMessage.style.display = 'block';
    caseStudiesGrid.style.display = 'none';
    emptyState.style.display = 'none';
}

function hideLoading() {
    loadingMessage.style.display = 'none';
}

function showEmptyState() {
    emptyState.style.display = 'block';
    caseStudiesGrid.style.display = 'none';
}

function hideEmptyState() {
    emptyState.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showSuccess(message) {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'error'; // Reuse error styles but with success colors
    successDiv.style.background = '#d1fae5';
    successDiv.style.color = '#059669';
    successDiv.style.borderColor = '#a7f3d0';
    successDiv.textContent = message;
    
    errorMessage.parentNode.insertBefore(successDiv, errorMessage);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// View case study details
function viewCaseStudy(id) {
    window.location.href = `case-study-detail.html?id=${id}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}