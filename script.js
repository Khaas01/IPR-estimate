// Part 1: Core Navigation and Section Management

// Constants
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIyR0GryUaBr7SRgLEPg5LPoI8B_t5KXTpTPea_wmw39lF3_85jhtdaiPtvr37PQW_pg/exec'; // Add your deployment URL here
let currentSection = 'salesRepSection';
const sectionHistory = [currentSection];

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


function submitForm(event) {
    if (event) {
        event.preventDefault();
    }
  showLoading('Submitting form...'); // Add this line to show loading overlay
    try {
        const formData = {
            data: {
                "Timestamp": new Date().toISOString(),
                "User Login": "", // This will be filled by Apps Script
                //Sales Rep Information
                "Sales Rep Name": document.getElementById('salesRepName').value,
                "Sales Rep Email": document.getElementById('salesRepEmail').value,
                "Sales Rep Phone": document.getElementById('salesRepPhone').value,
                // Company Information
                "Company Name": document.getElementById('companyName').value,
                // Property Owner Information
                "Owner Name": document.getElementById('ownerName').value,
                "Owner Address": document.getElementById('ownerAddress').value,
                "Owner City": document.getElementById('ownerCity').value,
                "Owner State": document.getElementById('ownerState').value,
                "Owner ZIP": document.getElementById('ownerZip').value,
                "Owner Phone": document.getElementById('ownerPhone').value,
                "Owner Email": document.getElementById('ownerEmail').value,
                 // Project Type Information
                "Project Type": document.querySelector('input[name="projectType"]:checked')?.value,
                // Insurance Information
                "Insurance Company": document.getElementById('insuranceCompany')?.value,
                "Insurance Phone": document.getElementById('insurancePhone')?.value,
                "Claim Number": document.getElementById('claimNumber')?.value,
                "Policy Number": document.getElementById('policyNumber')?.value,
                "Date of Loss": document.getElementById('dateOfLoss')?.value,
                // Roofing Type Information
                "Roofing Type": document.querySelector('input[name="roofingType"]:checked')?.value,
                 // Shingle Information
                "Shingle Type": document.querySelector('input[name="shingleType"]:checked')?.value,
                "Shingles Repaired": document.getElementById('shingles-repaired')?.value,
                "Additional Repairs": document.getElementById('repair-anything-else')?.value,
                "Shingle Replacement Squares": document.getElementById('shingle-replacement')?.value,
                // Tile Roofing Information
                "Tile Roofing Type": document.querySelector('input[name="tile-roofing-type"]:checked')?.value,
                "Tile Repair Squares": document.getElementById('tile-repair-sq')?.value,
                "Tile Underlayment Squares": document.getElementById('tile-underlayment-sq')?.value,
                "Tile Type": document.querySelector('input[name="tile-type"]:checked')?.value,
                "Tile Remove/Replace Squares": document.getElementById('tile-roof-rr')?.value,
                // Modified Bitumen Information
                "Modified Bitumen Squares": document.getElementById('modified-bitumen-sq')?.value,
                // Coating Information
                "Coating Squares": document.getElementById('coating-squares')?.value,
                // Secondary Roof Information
                "Has Secondary Roof": document.querySelector('input[name="secondary-roof"]:checked')?.value,
                "Secondary Roofing Type": document.querySelector('input[name="secondary-roofing-type"]:checked')?.value,
                "Secondary Shingles Squares": document.getElementById('shingles-squares')?.value,
                "Secondary Tile Underlayment Squares": document.getElementById('tile-underlayment-squares')?.value,
                "Secondary Modified Bitumen Squares": document.getElementById('modified-bitumen-squares')?.value,
                "Secondary Coating Squares": document.getElementById('coating-squares')?.value,
                // Third Roof Information
                "Has Third Roof": document.querySelector('input[name="third-roof"]:checked')?.value,
                "Third Roof Style": document.querySelector('input[name="third-roof-style"]:checked')?.value,
                "Third Shingles Squares": document.getElementById('shingles-squares')?.value,
                "Third Tiles Squares": document.getElementById('tiles-squares')?.value,
                "Third Modified Squares": document.getElementById('modified-squares')?.value,
                "Third Coating Squares": document.getElementById('coatings-squares')?.value,
                // Additional Charges Information
                "Has Additional Charges": document.querySelector('input[name="additional-charges"]:checked')?.value,
                "Additional Charges Description": document.getElementById('additional-charges-description')?.value,
                "Additional Charges Price": document.getElementById('additional-charges-price')?.value,
                "Has Solar Panels": document.querySelector('input[name="solar"]:checked')?.value,
                // Solar Panel Information
                "Solar Detach/Reset Cost": document.getElementById('solar-detach-reset')?.value,
                //Accounting Information
                "Amount Collected": "",  // If you have this field, add the value
                "Unforseen Additions": ""  // If you have this field, add the value
            }
        };

           // Create and submit form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GOOGLE_APPS_SCRIPT_URL;
        form.target = 'hidden_iframe';

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'data';
        hiddenInput.value = JSON.stringify(formData);
        form.appendChild(hiddenInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        return Promise.resolve();
    } catch (error) {
        hideLoading(); // Add this line to hide loading overlay on error
        console.error('Error:', error);
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
                if (response.success && response.pdfUrl) {
                    showSection('review-section');
                    displayPDFPreview(response.pdfUrl);
                } else {
                    throw new Error('Failed to generate PDF');
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

function displayPDFPreview(pdfUrl) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        // Convert Drive URL to preview URL
        const previewUrl = pdfUrl.replace(/\/view\?usp=sharing$/, '/preview');
        
        previewFrame.onload = function() {
            hideLoading();
        };
        
        previewFrame.onerror = function(error) {
            console.error('Preview failed to load:', error);
            hideLoading();
            
            // Fallback: Provide direct link
            const fallbackMessage = document.createElement('div');
            fallbackMessage.innerHTML = `
                <p>Preview not available. You can:</p>
                <a href="${pdfUrl}" target="_blank" class="pdf-link">
                    View PDF in new window
                </a>
            `;
            previewFrame.parentNode.appendChild(fallbackMessage);
        };
        
        previewFrame.src = previewUrl;
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
