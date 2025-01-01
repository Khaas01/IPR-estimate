// Part 1: Core Navigation and Section Management

// Constants
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEhaQ4K4YuoCohRE4AGNTY5Wf_JiwhEVJF1LmWPpB7-tuU22YYyU8766E4QlwBg8gHyQ/exec'; // Add your deployment URL here
let currentSection = 'salesRepSection';
const sectionHistory = [currentSection];
let isSubmitting = false;
window.addEventListener('message', function(event) {
    console.log('Raw message event:', event);
    
    try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('Parsed response data:', data);

        if (data.success) {
            hideLoading();
            
            if (data.previewUrl) {
                console.log('Received preview URL:', data.previewUrl);
                
                showSection('review-section');
                const previewFrame = document.getElementById('estimatePreviewFrame');
                if (previewFrame) {
                    showLoading('Loading preview...');
                    
                    previewFrame.onload = function() {
                        hideLoading();
                        console.log('Preview loaded successfully');
                    };
                    
                    previewFrame.onerror = function(e) {
                        hideLoading();
                        console.error('Preview failed to load:', e);
                        // Show a user-friendly message with the PDF link as fallback
                        const viewUrl = data.previewUrl.replace('/preview', '/view');
                        alert('Preview could not be loaded. You can view the PDF directly at: ' + viewUrl);
                    };
                    
                    // Set the preview URL
                    previewFrame.src = data.previewUrl;
                }
            }
        } else {
            hideLoading();
            alert('Error submitting form: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        hideLoading();
        console.error('Error processing response:', error);
        alert('Error processing response. Please try again.');
    }
});
// List of all sections in order
const sections = [
    'salesRepSection',
    'companySection',
    'propertyOwnerSection',
    'projectTypeSection',
    'insuranceInfoSection',
    'roofingTypeSection',
    'measureRoofSection',
    'asphalt-shingle-section',
    'shingle-repair-section',
    'shingle-replacement-section',
    'tile-roofing-section',
    'tile-repair-section',
    'tile-underlayment-section',
    'tile-remove-replace-section',
    'tile-roof-rr-section',
    'modified-bitumen-section',
    'coating-section',
    'secondary-roof-section',
    'secondary-roofing-type-section',
    'secondary-roof-type-shingles-section',
    'secondary-roof-type-tile-section',
    'secondary-roof-type-modified-bitumen-section',
    'secondary-roof-type-coating-section',
    'third-roof-type-section',
    'third-roof-type-style-section',
    'third-roof-type-shingles-section',
    'third-roof-type-tiles-section',
    'third-roof-type-modified-section',
    'third-roof-type-coatings-section',
    'additional-charges-section',
    'additional-charges-description-section',
    'additional-charges-price-section',
    'solar-section',
    'solar-detach-reset-section',
    'review-section'
];

// Core navigation functions
function hideAllSections() {
    document.querySelectorAll('div[id$="Section"], div[id*="-section"]').forEach(section => {
        section.style.display = 'none';
    });
}

function showSection(sectionId) {
    if (!sectionId) return;
    hideAllSections();
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
        console.error(`Section ${sectionId} not found`);
        return;
    }
    targetSection.style.display = 'block';
    if (sectionHistory[sectionHistory.length - 1] !== sectionId) {
        sectionHistory.push(sectionId);
    }
}

function goBack() {
    if (sectionHistory.length > 1) {
        hideAllSections();
        sectionHistory.pop();
        const previousSection = sectionHistory[sectionHistory.length - 1];
        const targetSection = document.getElementById(previousSection);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }
}

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
    hideAllSections();
    showSection(sectionHistory[0]);
 const solarRadios = document.querySelectorAll('input[name="solar"]');
    const navigationButtons = document.querySelector('#solar-section #navigationButtons');
    
    solarRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (navigationButtons) {
                if (this.value === 'no') {
                    navigationButtons.innerHTML = `
                        <button type="button" onclick="goBack()">Back</button>
                        <button type="button" onclick="navigateFromSolar()" class="submit-button">Submit</button>
                    `;
                } else {
                    navigationButtons.innerHTML = `
                        <button type="button" onclick="goBack()">Back</button>
                        <button type="button" onclick="navigateFromSolar()" class="next-button">Next</button>
                    `;
                }
            }
        });
    });
});

// Add the missing navigation functions
function nextProjectTypeSection() {
    const selectedProjectType = document.querySelector('input[name="projectType"]:checked');
    if (!selectedProjectType) {
        alert("Please select a project type.");
        return;
    }
    
    switch(selectedProjectType.value) {
        case 'Cash':
        case 'Finance':
            showSection('measureRoofSection');
            break;
        case 'Insurance':
            showSection('insuranceInfoSection');
            break;
        default:
            console.error("Unknown project type selected");
    }
}

// Part 2: Section-specific Navigation Functions and Metadata Handling

// Metadata handling
const formMetadata = {
    getTimestamp: function() {
        return new Date().toISOString();
    }
};

// Roofing Type Navigation
function navigateFromRoofingType() {
    const selectedRoofingType = document.querySelector('input[name="roofingType"]:checked');
    
    if (!selectedRoofingType) {
        alert("Please select a roofing type.");
        return;
    }

    switch(selectedRoofingType.value) {
        case 'Asphalt Shingles':
            showSection('asphalt-shingle-section');
            break;
        case 'Tile':
            showSection('tile-roofing-section');
            break;
        case 'Modified Bitumen (Flat roof rolled roofing)':
            showSection('modified-bitumen-section');
            break;
        case 'Flat Roof Coating':
            showSection('coating-section');
            break;
        default:
            console.error("Unknown roofing type selected");
    }
}

// Shingle Type Navigation
function navigateFromShingleType() {
    const selectedShingleType = document.querySelector('input[name="shingleType"]:checked');
    
    if (!selectedShingleType) {
        alert("Please select a shingle roof type.");
        return;
    }

    switch(selectedShingleType.value) {
        case 'Shingle Roof Repair':
            showSection('shingle-repair-section');
            break;
        case 'Shingle Roof Replacement':
            showSection('shingle-replacement-section');
            break;
        default:
            console.error("Unknown shingle type selected");
    }
}

// Tile Roofing Navigation
function navigateFromTileRoofingType() {
    const selectedTileType = document.querySelector('input[name="tile-roofing-type"]:checked');
    
    if (!selectedTileType) {
        alert("Please select a tile roofing type.");
        return;
    }

    switch(selectedTileType.value) {
        case 'Repair/Partial Roof':
            showSection('tile-repair-section');
            break;
        case 'Underlayment Replacement':
            showSection('tile-underlayment-section');
            break;
        case 'Remove and Replace':
            showSection('tile-remove-replace-section');
            break;
        default:
            console.error("Unknown tile roofing type selected");
    }
}

// Secondary Roof Navigation
function navigateFromSecondaryRoof() {
    const selectedOption = document.querySelector('input[name="secondary-roof"]:checked');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    switch(selectedOption.value) {
        case 'Yes':
            showSection('secondary-roofing-type-section');
            break;
        case 'No':
            showSection('additional-charges-section');
            break;
        default:
            console.error("Unknown selection for secondary roof");
    }
}

// Secondary Roofing Type Navigation
function navigateFromSecondaryRoofingType() {
    const selectedRoofingType = document.querySelector('input[name="secondary-roofing-type"]:checked');
    
    if (!selectedRoofingType) {
        alert("Please select a roofing type.");
        return;
    }

    switch(selectedRoofingType.value) {
        case 'Shingles':
            showSection('secondary-roof-type-shingles-section');
            break;
        case 'Tiles':
            showSection('secondary-roof-type-tile-section');
            break;
        case 'Modified Bitumen':
            showSection('secondary-roof-type-modified-bitumen-section');
            break;
        case 'Coating':
            showSection('secondary-roof-type-coating-section');
            break;
        default:
            console.error("Unknown secondary roofing type selected");
    }
}

// Third Roof Navigation
function navigateFromThirdRoof() {
    const selectedOption = document.querySelector('input[name="third-roof"]:checked');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    switch(selectedOption.value) {
        case 'Yes':
            showSection('third-roof-type-style-section');
            break;
        case 'No':
            showSection('additional-charges-section');
            break;
        default:
            console.error("Unknown selection for third roof");
    }
}

// Third Roof Style Navigation
function navigateFromThirdRoofStyle() {
    const selectedRoofingType = document.querySelector('input[name="third-roof-style"]:checked');
    
    if (!selectedRoofingType) {
        alert("Please select a roofing type.");
        return;
    }

    switch(selectedRoofingType.value) {
        case 'Shingles':
            showSection('third-roof-type-shingles-section');
            break;
        case 'Tile':
            showSection('third-roof-type-tiles-section');
            break;
        case 'Modified':
            showSection('third-roof-type-modified-section');
            break;
        case 'Coating':
            showSection('third-roof-type-coatings-section');
            break;
        default:
            console.error("Unknown third roof style selected");
    }
}

// Additional Charges Navigation
function navigateFromAdditionalCharges() {
    const selectedOption = document.querySelector('input[name="additional-charges"]:checked');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    switch(selectedOption.value) {
        case 'Yes':
            showSection('additional-charges-description-section');
            break;
        case 'No':
            showSection('solar-section');
            break;
        default:
            console.error("Unknown selection for additional charges");
    }
}
function validateForm(formData) {
    // Required fields validation
    const requiredFields = [
        'salesRepName',
        'salesRepEmail',
        'salesRepPhone',
        'ownerName',
        'ownerAddress',
        'ownerCity',
        'ownerState',
        'ownerZip',
        'ownerPhone'
    ];

    for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === '') {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return false;
        }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.salesRepEmail)) {
        alert('Please enter a valid sales representative email address');
        return false;
    }

    // Phone number validation
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(formData.salesRepPhone)) {
        alert('Please enter a valid sales representative phone number');
        return false;
    }
    if (!phoneRegex.test(formData.ownerPhone)) {
        alert('Please enter a valid property owner phone number');
        return false;
    }

    // ZIP code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!formData.ownerZip || !zipRegex.test(formData.ownerZip)) {
        alert('Please enter a valid ZIP code');
        return false;
    }

    // Project type validation
    if (!formData.projectType) {
        alert('Please select a project type');
        return false;
    }

    // Validate insurance information if project type is Insurance
    if (formData.projectType === 'Insurance') {
        const insuranceFields = [
            'insuranceCompany',
            'insurancePhone',
            'claimNumber',
            'policyNumber',
            'dateOfLoss'
        ];

        for (const field of insuranceFields) {
            if (!formData[field] || formData[field].trim() === '') {
                alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }
    }

    return true;
}


function submitForm() {
    // Prevent multiple submissions
    if (isSubmitting) return Promise.reject(new Error('Form is already being submitted'));
    
    try {
        // Set submission flag and show loading state
        isSubmitting = true;
        showLoading('Submitting form...');

        // Collect form data (assuming you have this function already)
        const formData = collectFormData();
        
        // Make the fetch request to your Google Apps Script URL
        return fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ data: formData }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            // Check if the response is ok (status in 200-299 range)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            // Log and rethrow any fetch or parsing errors
            console.error('Fetch error:', error);
            throw error;
        })
        .finally(() => {
            // Always clean up, regardless of success or failure
            isSubmitting = false;
            hideLoading();
        });

    } catch (error) {
        // Handle any synchronous errors
        isSubmitting = false;
        hideLoading();
        return Promise.reject(error);
    }
}
// Solar Panel Navigation
function navigateFromSolar() {
    const selectedOption = document.querySelector('input[name="solar"]:checked');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    if (selectedOption.value === 'yes') {
        showSection('solar-detach-reset-section');
    } else {
        showLoading('Generating estimate...');
        submitForm()
            .then(response => {
                // First check if response exists
                if (!response) {
                    throw new Error('No response received from server');
                }
                
                // Parse response if it's a string
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                
                if (data.success && (data.previewUrl || data.pdfUrl)) {
                    showSection('review-section');
                    displayPDFPreview(data.previewUrl || data.pdfUrl);
                } else {
                    throw new Error(data.message || 'Failed to generate PDF preview');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error generating estimate: ' + error.message);
            })
            .finally(() => {
                hideLoading();
            });
    }
}

function displayPDFPreview(url) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    showLoading('Loading preview...');

    // Convert Drive URL to preview URL if needed
    const previewUrl = url.includes('/preview') ? url : url.replace(/\/view.*$/, '/preview');

    previewFrame.onload = function() {
        hideLoading();
        console.log('Preview loaded successfully');
    };

    previewFrame.onerror = function(error) {
        console.error('Preview failed to load:', error);
        hideLoading();
        
        // Create fallback container
        const fallbackContainer = document.createElement('div');
        fallbackContainer.className = 'preview-fallback';
        fallbackContainer.innerHTML = `
            <p>Preview not available. You can:</p>
            <a href="${url}" target="_blank" class="pdf-link">
                View PDF in new window
            </a>
            <p>Or try refreshing the page.</p>
        `;
        
        // Replace iframe with fallback
        previewFrame.parentNode.replaceChild(fallbackContainer, previewFrame);
    };

    try {
        previewFrame.src = previewUrl;
    } catch (error) {
        console.error('Error setting preview URL:', error);
        previewFrame.onerror(error);
    }
}


function nextFromSolar() {
    submitForm()
        .then(() => {
            showSection('review-section');
            // displayReview will be called by the message event listener
            // when it receives the preview ID from Apps Script
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again.');
        });
}


// Add these utility functions for the loading indicator
function showLoading(message = 'Processing your estimate...') {
    const loadingOverlay = document.querySelector('.loading-overlay');
    const loadingText = loadingOverlay.querySelector('.loading-text');
    loadingText.textContent = message;
    loadingOverlay.style.display = 'flex';
    console.log('Loading overlay shown:', message); // Debug log
}

function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    loadingOverlay.style.display = 'none';
    console.log('Loading overlay hidden'); // Debug log
}

// Update the displayReview function
function displayReview() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        showLoading('Loading preview...');
        
        previewFrame.onload = function() {
            hideLoading();
            console.log('Preview loaded successfully');
        };
        
        previewFrame.onerror = function(error) {
            console.error('Preview failed to load:', error);
            hideLoading();
            alert('Error loading preview. Please try again.');
        };
    }
}
