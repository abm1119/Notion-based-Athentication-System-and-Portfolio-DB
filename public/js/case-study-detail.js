// Case Study Detail JavaScript

let currentCaseStudy = null;

// DOM Elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const caseStudyContent = document.getElementById('caseStudyContent');
const breadcrumbTitle = document.getElementById('breadcrumbTitle');
const caseStudyTitle = document.getElementById('caseStudyTitle');
const caseStudyStatus = document.getElementById('caseStudyStatus');
const caseStudyTags = document.getElementById('caseStudyTags');
const caseStudyCover = document.getElementById('caseStudyCover');
const caseStudyDetails = document.getElementById('caseStudyDetails');
const editButton = document.getElementById('editButton');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadCaseStudy();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
}

// Get case study ID from URL parameters
function getCaseStudyIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load case study from API
async function loadCaseStudy() {
    const caseStudyId = getCaseStudyIdFromUrl();
    
    if (!caseStudyId) {
        showError('No case study ID provided');
        return;
    }
    
    try {
        showLoading();
        const token = localStorage.getItem('token');
        
        // First load basic case study data
        const response = await fetch(`/api/case-studies/${caseStudyId}`, {
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
            currentCaseStudy = data.caseStudy;
            displayCaseStudy();
            
            // Load detailed content with blocks
            await loadDetailedContent(caseStudyId, token);
        } else {
            showError(data.message || 'Failed to load case study');
        }
    } catch (error) {
        console.error('Error loading case study:', error);
        showError('Failed to load case study. Please check your connection and try again.');
    }
}

// Load detailed content with Notion blocks
async function loadDetailedContent(caseStudyId, token) {
    try {
        const notionContentSection = document.getElementById('notionContentSection');
        const contentLoading = document.getElementById('contentLoading');
        const contentError = document.getElementById('contentError');
        const notionBlocks = document.getElementById('notionBlocks');
        
        // Show the detailed content section
        notionContentSection.style.display = 'block';
        contentLoading.style.display = 'block';
        contentError.style.display = 'none';
        notionBlocks.innerHTML = '';
        
        const response = await fetch(`/api/case-studies/${caseStudyId}?includeContent=true`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.success && data.caseStudy.blocks) {
            contentLoading.style.display = 'none';
            
            if (data.caseStudy.blocks.length > 0) {
                renderNotionBlocks(data.caseStudy.blocks, notionBlocks);
            } else {
                notionBlocks.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No detailed content available for this case study.</p>';
            }
        } else {
            throw new Error('Failed to load detailed content');
        }
    } catch (error) {
        console.error('Error loading detailed content:', error);
        const contentLoading = document.getElementById('contentLoading');
        const contentError = document.getElementById('contentError');
        const contentErrorMessage = document.getElementById('contentErrorMessage');
        
        contentLoading.style.display = 'none';
        contentError.style.display = 'block';
        contentErrorMessage.textContent = 'Failed to load detailed content. The case study may not have additional content.';
    }
}

// Display case study details
function displayCaseStudy() {
    if (!currentCaseStudy) {
        showError('No case study data available');
        return;
    }
    
    hideLoading();
    hideError();
    
    // Update page title
    document.title = `${currentCaseStudy.name} - Case Study Details`;
    
    // Update breadcrumb
    breadcrumbTitle.textContent = currentCaseStudy.name;
    
    // Update header
    caseStudyTitle.textContent = currentCaseStudy.name;
    
    // Update status
    caseStudyStatus.textContent = currentCaseStudy.status;
    caseStudyStatus.className = `status-badge ${getStatusClass(currentCaseStudy.status)}`;
    
    // Update tags
    if (currentCaseStudy.tags && currentCaseStudy.tags.length > 0) {
        caseStudyTags.innerHTML = currentCaseStudy.tags
            .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
            .join('');
    } else {
        caseStudyTags.innerHTML = '<span class="tag">No tags</span>';
    }
    
    // Update cover image
    if (currentCaseStudy.coverImage) {
        caseStudyCover.innerHTML = `
            <img src="${currentCaseStudy.coverImage}" 
                 alt="${escapeHtml(currentCaseStudy.name)}" 
                 onerror="this.parentElement.className='case-study-cover no-image'; this.parentElement.innerHTML='<span>Image failed to load</span>'">
        `;
    } else {
        caseStudyCover.className = 'case-study-cover no-image';
        caseStudyCover.innerHTML = '<span>No cover image</span>';
    }
    
    // Update project details
    if (currentCaseStudy.projectDetails && currentCaseStudy.projectDetails.trim()) {
        caseStudyDetails.textContent = currentCaseStudy.projectDetails;
    } else {
        caseStudyDetails.textContent = 'No project details provided.';
        caseStudyDetails.style.fontStyle = 'italic';
        caseStudyDetails.style.color = 'var(--text-secondary)';
    }
    
    // Update edit button
    editButton.href = `case-studies.html?edit=${currentCaseStudy.id}`;
    
    // Show content
    caseStudyContent.style.display = 'block';
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

// Show loading state
function showLoading() {
    loadingState.style.display = 'flex';
    errorState.style.display = 'none';
    caseStudyContent.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingState.style.display = 'none';
}

// Show error state
function showError(message) {
    hideLoading();
    errorMessage.textContent = message;
    errorState.style.display = 'flex';
    caseStudyContent.style.display = 'none';
}

// Hide error state
function hideError() {
    errorState.style.display = 'none';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Render Notion blocks to HTML
function renderNotionBlocks(blocks, container) {
    if (!blocks || blocks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No content available.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    blocks.forEach(block => {
        const blockElement = createBlockElement(block);
        if (blockElement) {
            container.appendChild(blockElement);
        }
    });
}

// Create HTML element for a Notion block
function createBlockElement(block) {
    const blockDiv = document.createElement('div');
    blockDiv.className = 'notion-block';
    blockDiv.setAttribute('data-block-id', block.id);
    
    switch (block.type) {
        case 'paragraph':
            blockDiv.appendChild(createParagraphElement(block));
            break;
        case 'heading_1':
            blockDiv.appendChild(createHeadingElement(block, 1));
            break;
        case 'heading_2':
            blockDiv.appendChild(createHeadingElement(block, 2));
            break;
        case 'heading_3':
            blockDiv.appendChild(createHeadingElement(block, 3));
            break;
        case 'bulleted_list_item':
            blockDiv.appendChild(createListItemElement(block, 'ul'));
            break;
        case 'numbered_list_item':
            blockDiv.appendChild(createListItemElement(block, 'ol'));
            break;
        case 'to_do':
            blockDiv.appendChild(createTodoElement(block));
            break;
        case 'toggle':
            blockDiv.appendChild(createToggleElement(block));
            break;
        case 'code':
            blockDiv.appendChild(createCodeElement(block));
            break;
        case 'quote':
            blockDiv.appendChild(createQuoteElement(block));
            break;
        case 'callout':
            blockDiv.appendChild(createCalloutElement(block));
            break;
        case 'divider':
            blockDiv.appendChild(createDividerElement());
            break;
        case 'image':
            blockDiv.appendChild(createImageElement(block));
            break;
        case 'video':
            blockDiv.appendChild(createVideoElement(block));
            break;
        case 'bookmark':
            blockDiv.appendChild(createBookmarkElement(block));
            break;
        case 'embed':
            blockDiv.appendChild(createEmbedElement(block));
            break;
        case 'table':
            blockDiv.appendChild(createTableElement(block));
            break;
        case 'table_row':
            return createTableRowElement(block);
        default:
            // For unsupported block types, show a placeholder
            blockDiv.appendChild(createUnsupportedBlockElement(block));
            break;
    }
    
    // Handle children blocks
    if (block.children && block.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'notion-block-children';
        childrenContainer.style.marginLeft = '20px';
        renderNotionBlocks(block.children, childrenContainer);
        blockDiv.appendChild(childrenContainer);
    }
    
    return blockDiv;
}

// Create paragraph element
function createParagraphElement(block) {
    const p = document.createElement('p');
    p.className = 'notion-paragraph';
    p.appendChild(renderRichText(block.content.rich_text));
    return p;
}

// Create heading element
function createHeadingElement(block, level) {
    const heading = document.createElement(`h${level}`);
    heading.className = `notion-heading-${level}`;
    heading.appendChild(renderRichText(block.content.rich_text));
    
    if (block.content.is_toggleable) {
        heading.style.cursor = 'pointer';
        heading.addEventListener('click', () => {
            // Toggle functionality can be added here
        });
    }
    
    return heading;
}

// Create list item element
function createListItemElement(block, listType) {
    const li = document.createElement('li');
    li.className = 'notion-list-item';
    li.appendChild(renderRichText(block.content.rich_text));
    return li;
}

// Create todo element
function createTodoElement(block) {
    const todoDiv = document.createElement('div');
    todoDiv.className = `notion-todo ${block.content.checked ? 'checked' : ''}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'notion-todo-checkbox';
    checkbox.checked = block.content.checked;
    checkbox.disabled = true; // Read-only
    
    const textDiv = document.createElement('div');
    textDiv.className = 'notion-todo-text';
    textDiv.appendChild(renderRichText(block.content.rich_text));
    
    todoDiv.appendChild(checkbox);
    todoDiv.appendChild(textDiv);
    
    return todoDiv;
}

// Create toggle element
function createToggleElement(block) {
    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'notion-toggle';
    
    const header = document.createElement('div');
    header.className = 'notion-toggle-header';
    
    const icon = document.createElement('span');
    icon.className = 'notion-toggle-icon';
    icon.textContent = '▶';
    
    const text = document.createElement('span');
    text.appendChild(renderRichText(block.content.rich_text));
    
    header.appendChild(icon);
    header.appendChild(text);
    
    const content = document.createElement('div');
    content.className = 'notion-toggle-content';
    
    header.addEventListener('click', () => {
        toggleDiv.classList.toggle('open');
    });
    
    toggleDiv.appendChild(header);
    toggleDiv.appendChild(content);
    
    return toggleDiv;
}

// Create code element
function createCodeElement(block) {
    const pre = document.createElement('pre');
    pre.className = 'notion-code';
    
    const code = document.createElement('code');
    code.textContent = block.content.rich_text.map(rt => rt.plain_text).join('');
    
    if (block.content.language) {
        code.setAttribute('data-language', block.content.language);
    }
    
    pre.appendChild(code);
    return pre;
}

// Create quote element
function createQuoteElement(block) {
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'notion-quote';
    blockquote.appendChild(renderRichText(block.content.rich_text));
    return blockquote;
}

// Create callout element
function createCalloutElement(block) {
    const calloutDiv = document.createElement('div');
    calloutDiv.className = 'notion-callout';
    
    if (block.content.icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'notion-callout-icon';
        
        if (block.content.icon.type === 'emoji') {
            iconSpan.textContent = block.content.icon.emoji;
        } else if (block.content.icon.type === 'external') {
            const img = document.createElement('img');
            img.src = block.content.icon.external.url;
            img.alt = 'Icon';
            img.style.width = '20px';
            img.style.height = '20px';
            iconSpan.appendChild(img);
        }
        
        calloutDiv.appendChild(iconSpan);
    }
    
    const textDiv = document.createElement('div');
    textDiv.appendChild(renderRichText(block.content.rich_text));
    calloutDiv.appendChild(textDiv);
    
    return calloutDiv;
}

// Create divider element
function createDividerElement() {
    const hr = document.createElement('hr');
    hr.className = 'notion-divider';
    return hr;
}

// Create image element
function createImageElement(block) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'notion-image-container';
    
    const img = document.createElement('img');
    img.className = 'notion-image';
    img.src = block.content.url;
    img.alt = block.content.caption ? block.content.caption.map(c => c.plain_text).join('') : 'Image';
    
    img.onerror = function() {
        this.style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.style.padding = '20px';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.color = 'var(--text-secondary)';
        errorDiv.style.border = '1px dashed var(--border)';
        errorDiv.style.borderRadius = '8px';
        errorDiv.textContent = 'Image failed to load';
        imageDiv.appendChild(errorDiv);
    };
    
    imageDiv.appendChild(img);
    
    if (block.content.caption && block.content.caption.length > 0) {
        const caption = document.createElement('div');
        caption.className = 'notion-image-caption';
        caption.appendChild(renderRichText(block.content.caption));
        imageDiv.appendChild(caption);
    }
    
    return imageDiv;
}

// Create video element
function createVideoElement(block) {
    const videoDiv = document.createElement('div');
    videoDiv.className = 'notion-video-container';
    
    const video = document.createElement('video');
    video.className = 'notion-video';
    video.src = block.content.url;
    video.controls = true;
    
    videoDiv.appendChild(video);
    
    if (block.content.caption && block.content.caption.length > 0) {
        const caption = document.createElement('div');
        caption.className = 'notion-image-caption';
        caption.appendChild(renderRichText(block.content.caption));
        videoDiv.appendChild(caption);
    }
    
    return videoDiv;
}

// Create bookmark element
function createBookmarkElement(block) {
    const bookmarkDiv = document.createElement('div');
    bookmarkDiv.className = 'notion-bookmark';
    
    const link = document.createElement('a');
    link.className = 'notion-bookmark-url';
    link.href = block.content.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = block.content.url;
    
    bookmarkDiv.appendChild(link);
    
    if (block.content.caption && block.content.caption.length > 0) {
        const caption = document.createElement('div');
        caption.style.marginTop = '8px';
        caption.style.fontSize = '14px';
        caption.style.color = 'var(--text-secondary)';
        caption.appendChild(renderRichText(block.content.caption));
        bookmarkDiv.appendChild(caption);
    }
    
    return bookmarkDiv;
}

// Create embed element
function createEmbedElement(block) {
    const embedDiv = document.createElement('div');
    embedDiv.className = 'notion-embed';
    
    const iframe = document.createElement('iframe');
    iframe.src = block.content.url;
    iframe.style.width = '100%';
    iframe.style.height = '400px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    
    embedDiv.appendChild(iframe);
    
    return embedDiv;
}

// Create table element
function createTableElement(block) {
    const table = document.createElement('table');
    table.className = 'notion-table';
    return table;
}

// Create table row element
function createTableRowElement(block) {
    const tr = document.createElement('tr');
    
    block.content.cells.forEach((cell, index) => {
        const td = document.createElement('td');
        td.appendChild(renderRichText(cell));
        tr.appendChild(td);
    });
    
    return tr;
}

// Create unsupported block element
function createUnsupportedBlockElement(block) {
    const div = document.createElement('div');
    div.style.padding = '12px';
    div.style.background = '#f8f9fa';
    div.style.border = '1px solid #e9ecef';
    div.style.borderRadius = '4px';
    div.style.color = '#6c757d';
    div.style.fontSize = '14px';
    div.textContent = `Unsupported block type: ${block.type}`;
    return div;
}

// Render rich text with formatting
function renderRichText(richTextArray) {
    if (!richTextArray || richTextArray.length === 0) {
        return document.createTextNode('');
    }
    
    const fragment = document.createDocumentFragment();
    
    richTextArray.forEach(richText => {
        let element;
        
        if (richText.href) {
            element = document.createElement('a');
            element.href = richText.href;
            element.className = 'rich-text-link';
            element.target = '_blank';
            element.rel = 'noopener noreferrer';
        } else {
            element = document.createElement('span');
        }
        
        element.textContent = richText.plain_text || richText.text?.content || '';
        
        // Apply formatting
        if (richText.annotations) {
            const annotations = richText.annotations;
            
            if (annotations.bold) {
                element.classList.add('rich-text-bold');
            }
            if (annotations.italic) {
                element.classList.add('rich-text-italic');
            }
            if (annotations.underline) {
                element.classList.add('rich-text-underline');
            }
            if (annotations.strikethrough) {
                element.classList.add('rich-text-strikethrough');
            }
            if (annotations.code) {
                element.classList.add('rich-text-code');
            }
            if (annotations.color && annotations.color !== 'default') {
                element.style.color = getNotionColor(annotations.color);
            }
        }
        
        fragment.appendChild(element);
    });
    
    return fragment;
}

// Get CSS color for Notion color
function getNotionColor(notionColor) {
    const colorMap = {
        'gray': '#9b9a97',
        'brown': '#64473a',
        'orange': '#d9730d',
        'yellow': '#dfab01',
        'green': '#0f7b6c',
        'blue': '#0b6e99',
        'purple': '#6940a5',
        'pink': '#ad1a72',
        'red': '#e03e3e',
        'gray_background': '#ebeced',
        'brown_background': '#e9e5e3',
        'orange_background': '#faebdd',
        'yellow_background': '#fbf3db',
        'green_background': '#ddedea',
        'blue_background': '#ddebf1',
        'purple_background': '#eae4f2',
        'pink_background': '#f4dfeb',
        'red_background': '#fbe4e4'
    };
    
    return colorMap[notionColor] || '#000000';
}

// Handle browser back button
window.addEventListener('popstate', function(event) {
    // If user navigates back, reload the case study
    loadCaseStudy();
});

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    // ESC key to go back
    if (event.key === 'Escape') {
        window.location.href = 'case-studies.html';
    }
    
    // E key to edit (when not in input field)
    if (event.key === 'e' && !event.target.matches('input, textarea')) {
        if (currentCaseStudy) {
            window.location.href = `case-studies.html?edit=${currentCaseStudy.id}`;
        }
    }
});