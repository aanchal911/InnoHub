// JSONBin Configuration
const JSONBIN_API_KEY = '$2a$10$s9AZal23OUPcRVAVcXSFKuMFtoVK/BPXy/JpltDkUS/xraVS/7FkW'; // Your JSONBin API key
const BIN_ID = '68bc77e643b1c97be9392ca9'; // Your JSONBin ID
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const innovationsGrid = document.getElementById('innovations-grid');
const loading = document.getElementById('loading');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('category-filter');
const submitForm = document.getElementById('submit-form');

// State
let innovations = [];
let filteredInnovations = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        loadInnovations();
        initializeFilters();
    }
    
    if (window.location.pathname.includes('submit.html')) {
        initializeSubmitForm();
    }
    
    if (window.location.pathname.includes('about.html')) {
        updateStats();
    }
});

// Navigation
function initializeNavigation() {
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Load innovations from JSONBin
async function loadInnovations() {
    try {
        showLoading(true);
        
        // For demo purposes, use sample data if JSONBin is not configured
        if (BIN_ID === 'YOUR_BIN_ID_HERE') {
            innovations = getSampleData();
        } else {
            const response = await fetch(JSONBIN_URL, {
                headers: {
                    'X-Master-Key': JSONBIN_API_KEY
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                innovations = data.record.innovations || [];
            } else {
                innovations = getSampleData();
            }
        }
        
        filteredInnovations = [...innovations];
        displayInnovations();
        
    } catch (error) {
        console.error('Error loading innovations:', error);
        innovations = getSampleData();
        filteredInnovations = [...innovations];
        displayInnovations();
    } finally {
        showLoading(false);
    }
}

// Sample data for demo
function getSampleData() {
    return [
        {
            id: 1,
            title: "Phone Stand from Binder Clips",
            description: "Use two large binder clips to create an adjustable phone stand. Clip them to the edge of your desk and adjust the angle for perfect viewing. Works great for video calls and watching content.",
            category: "Tech",
            author: "Alex Chen",
            likes: 24,
            timestamp: new Date().toISOString()
        },
        {
            id: 2,
            title: "Ice Cube Plant Watering",
            description: "Place ice cubes on plant soil for slow, consistent watering. Perfect for vacation care or plants that need gradual hydration. The ice melts slowly, preventing overwatering.",
            category: "Environment",
            author: "Sarah Green",
            likes: 18,
            timestamp: new Date().toISOString()
        },
        {
            id: 3,
            title: "Rubber Band Cable Management",
            description: "Wrap rubber bands around the legs of your desk or chair to create instant cable holders. Slide cables through the bands to keep them organized and off the floor.",
            category: "Tech",
            author: "Mike Johnson",
            likes: 31,
            timestamp: new Date().toISOString()
        },
        {
            id: 4,
            title: "Frozen Grapes as Ice Cubes",
            description: "Use frozen grapes instead of ice cubes in drinks. They keep beverages cold without diluting them and add a subtle fruity flavor. Perfect for wine or sparkling water.",
            category: "Lifestyle",
            author: "Emma Wilson",
            likes: 42,
            timestamp: new Date().toISOString()
        }
    ];
}

// Display innovations
function displayInnovations() {
    if (!innovationsGrid) return;
    
    if (filteredInnovations.length === 0) {
        innovationsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    innovationsGrid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    
    const isListView = innovationsGrid.classList.contains('list-view');
    
    innovationsGrid.innerHTML = filteredInnovations.map((innovation, index) => `
        <div class="innovation-card ${isListView ? 'list-view' : ''}" style="animation-delay: ${index * 0.1}s">
            <div class="card-header">
                <div>
                    <h3 class="card-title">${escapeHtml(innovation.title)}</h3>
                    <span class="card-category">${escapeHtml(innovation.category)}</span>
                </div>
            </div>
            <p class="card-description">${escapeHtml(innovation.description)}</p>
            <div class="card-footer">
                <span class="card-author">by ${escapeHtml(innovation.author || 'Anonymous')}</span>
                <button class="like-button ${innovation.liked ? 'liked' : ''}" onclick="toggleLike(${innovation.id})">
                    <i class="fas fa-heart"></i>
                    <span>${innovation.likes || 0}</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Toggle like
function toggleLike(id) {
    const innovation = innovations.find(item => item.id === id);
    if (innovation) {
        if (innovation.liked) {
            innovation.likes = Math.max(0, (innovation.likes || 0) - 1);
            innovation.liked = false;
        } else {
            innovation.likes = (innovation.likes || 0) + 1;
            innovation.liked = true;
        }
        
        // Update filtered innovations
        const filteredItem = filteredInnovations.find(item => item.id === id);
        if (filteredItem) {
            filteredItem.likes = innovation.likes;
            filteredItem.liked = innovation.liked;
        }
        
        displayInnovations();
        
        // Save to JSONBin (if configured)
        saveInnovations();
    }
}

// Initialize filters
function initializeFilters() {
    if (searchInput) {
        searchInput.addEventListener('input', filterInnovations);
    }
    
    // Category filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterInnovations();
        });
    });
    
    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortInnovations);
    }
}

// Filter innovations
function filterInnovations() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const activeTab = document.querySelector('.filter-tab.active');
    const selectedCategory = activeTab ? activeTab.dataset.category : '';
    
    filteredInnovations = innovations.filter(innovation => {
        const matchesSearch = !searchTerm || 
            innovation.title.toLowerCase().includes(searchTerm) ||
            innovation.description.toLowerCase().includes(searchTerm) ||
            (innovation.author && innovation.author.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !selectedCategory || innovation.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    sortInnovations();
    updateResultsCount();
}

// Sort innovations
function sortInnovations() {
    const sortSelect = document.getElementById('sort-select');
    const sortBy = sortSelect ? sortSelect.value : 'newest';
    
    filteredInnovations.sort((a, b) => {
        switch (sortBy) {
            case 'popular':
                return (b.likes || 0) - (a.likes || 0);
            case 'title':
                return a.title.localeCompare(b.title);
            case 'newest':
            default:
                return new Date(b.timestamp) - new Date(a.timestamp);
        }
    });
    
    displayInnovations();
}

// Toggle view
function toggleView(view) {
    const grid = document.getElementById('innovations-grid');
    if (grid) {
        if (view === 'list') {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }
    }
}

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        const count = filteredInnovations.length;
        resultsCount.textContent = `${count} innovation${count !== 1 ? 's' : ''}`;
    }
}

// Initialize submit form
function initializeSubmitForm() {
    if (submitForm) {
        submitForm.addEventListener('submit', handleSubmit);
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(submitForm);
    const submitButton = submitForm.querySelector('button[type="submit"]');
    const buttonText = submitButton.querySelector('.btn-text');
    const buttonLoader = submitButton.querySelector('.btn-loader');
    
    // Show loading state
    submitButton.disabled = true;
    if (buttonText) buttonText.style.display = 'none';
    if (buttonLoader) buttonLoader.style.display = 'flex';
    
    try {
        const newInnovation = {
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            author: formData.get('author') || 'Anonymous',
            likes: 0,
            liked: false,
            timestamp: new Date().toISOString()
        };
        
        // Add to local array
        innovations.unshift(newInnovation);
        
        // Save to JSONBin (if configured)
        await saveInnovations();
        
        // Clear form and show success message
        submitForm.reset();
        showSuccessMessage();
        
    } catch (error) {
        console.error('Error submitting innovation:', error);
        alert('Error submitting innovation. Please try again.');
        
        // Reset button state on error
        submitButton.disabled = false;
        if (buttonText) buttonText.style.display = 'flex';
        if (buttonLoader) buttonLoader.style.display = 'none';
    }
}

// Save innovations to JSONBin
async function saveInnovations() {
    if (BIN_ID === 'YOUR_BIN_ID_HERE') return;
    
    try {
        await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({ innovations })
        });
    } catch (error) {
        console.error('Error saving to JSONBin:', error);
    }
}

// Show success message
function showSuccessMessage() {
    const form = document.querySelector('.innovation-form');
    const successMessage = document.getElementById('success-message');
    
    if (form && successMessage) {
        form.style.display = 'none';
        successMessage.style.display = 'block';
    }
}

// Update stats
function updateStats() {
    const heroInnovations = document.getElementById('hero-innovations');
    const heroLikes = document.getElementById('hero-likes');
    
    const innovationCount = innovations.length;
    const totalLikes = innovations.reduce((sum, innovation) => sum + (innovation.likes || 0), 0);
    
    if (heroInnovations) {
        animateCounter(heroInnovations, innovationCount);
    }
    
    if (heroLikes) {
        animateCounter(heroLikes, totalLikes);
    }
}

// Animate counter
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

// Show/hide loading
function showLoading(show) {
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
    if (innovationsGrid) {
        innovationsGrid.style.display = show ? 'none' : 'grid';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Smooth scroll for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'white';
            navbar.style.backdropFilter = 'none';
        }
    }
});