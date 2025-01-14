// Global variables
let isSubmitting = false;
let sectionHistory = []; // Initialize sectionHistory

// Centralized API configuration

const SHEET_ID = "1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw";
const SHEET_NAME = "Form Responses";

const API_CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwOCAIWr3ohEsDE91BGXMP4tHz9wagzaILi6Z_qeIZ_bJixP_SG7YHQjxugyojXTuQ5Uw/exec',
    API_KEY: 'AIzaSyDFVaRrTxOyR-fX3XAOp1tjoeg58mkj254',
    CLIENT_ID: '900437232674-krleqgjop3u7cl4sggmo20rkmrsl5vh5.apps.googleusercontent.com',
    REDIRECT_URI: 'https://khaas01.github.io/IPR-estimate/',
    SHEET_ID: SHEET_ID,
    SHEET_NAME: SHEET_NAME,
    API_ENDPOINT: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}`,
    SCOPES: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
    ].join(' ')
};

async function initializeGoogleAPIs() {
    try {
        if (typeof gapi === 'undefined') {
            console.error('Google API client library not loaded');
            return false;
        }

        await new Promise((resolve) => {
            gapi.load('client', resolve);
        });

        await gapi.client.init({
            apiKey: API_CONFIG.API_KEY,
            discoveryDocs: [
                'https://sheets.googleapis.com/$discovery/rest?version=v4',
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ]
        });

        console.log('APIs initialized successfully');
        return true;
    } catch (error) {
        console.error('API initialization error:', error);
        // Don't call handleApiError, just log the error
        console.error('Failed to initialize Google APIs:', error);
        return false;
    }
}
function adjustIframeHeight() {
    const container = document.querySelector('.estimate-preview-container');
    const iframe = document.getElementById('estimatePreviewFrame');
    
    if (!container || !iframe) return;

    // Reset any previous height settings
    container.style.height = 'auto';
    
    iframe.onload = function() {
        try {
            // Get the natural dimensions of the PDF
            const pdfHeight = iframe.contentWindow.document.body.scrollHeight;
            const pdfWidth = iframe.contentWindow.document.body.scrollWidth;
            
            // Calculate the aspect ratio
            const aspectRatio = pdfWidth / pdfHeight;
            
            // Set container width based on viewport
            const maxWidth = Math.min(800, window.innerWidth - 40); // 40px for padding
            container.style.width = maxWidth + 'px';
            
            // Set height based on aspect ratio
            const height = maxWidth / aspectRatio;
            container.style.height = height + 'px';
            
            // Ensure iframe fills container
            iframe.style.width = '100%';
            iframe.style.height = '100%';
        } catch (e) {
            console.error('Failed to adjust iframe dimensions:', e);
        }
    };
}

// Call on load and resize
window.addEventListener('load', adjustIframeHeight);
window.addEventListener('resize', adjustIframeHeight);
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize section history
    sectionHistory.push('salesRepSection');
    // Show initial sales rep section only
    showSection('salesRepSection');
});

window.addEventListener('message', function(event) {
    try {
        // Ignore messages that start with '!' as they are internal Google Drive messages
        if (typeof event.data === 'string' && event.data.startsWith('!')) {
            return;
        }

        // Only try to parse JSON if it's a string and doesn't start with '!'
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('Received message data:', data);

        // Ignore Google API initialization messages
        if (data.f && data.f.startsWith('apiproxy')) {
            return;
        }

        if (data.success && data.pdfUrl) {
            hideLoading();
            showSection('review-section');
            // Extract file ID from Google Drive URL
            const fileId = data.fileId || data.pdfUrl.match(/\/d\/(.+?)\/|id=(.+?)(&|$)/)?.[1];
            if (fileId) {
                displayPDF(fileId);
            } else {
                console.error('Could not extract file ID from URL:', data.pdfUrl);
                showError();
            }
        } else if (data.type === 'form_submission') {
            hideLoading();
            console.error('Form submission failed:', data);
            showError();
        }
    } catch (error) {
        // Only log errors for non-Google Drive internal messages
        if (typeof event.data === 'string' && !event.data.startsWith('!')) {
            console.error('Error processing message:', error);
            hideLoading();
            showError();
        }
    }
});
const solarRadios = document.querySelectorAll('input[name="solar"]');
const navigationButtons = document.querySelector('#solar-section #navigationButtons');

solarRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (navigationButtons) {
            if (this.value === 'no') {
                navigationButtons.innerHTML = `
                    <button type="button" onclick="goBack()">Back</button>
                    <button type="button" onclick="nextFromSolar()" class="submit-button">Submit</button>
                `;
            } else {
                navigationButtons.innerHTML = `
                    <button type="button" onclick="goBack()">Back</button>
                    <button type="button" onclick="showSection('solar-detach-reset-section')" class="next-button">Next</button>
                `;
            }
        }
    });
});
function initializeAutocomplete() {
    const addressInput = document.getElementById('ownerAddress');
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        // Restrict to getting just address components
        types: ['address'],
        // Restrict to USA addresses
        componentRestrictions: { country: 'us' }
    });
    
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }
        
        // Get only street address components
        let streetNumber = '';
        let streetName = '';
        
        for (const component of place.address_components) {
            const type = component.types[0];
            
            if (type === 'street_number') {
                streetNumber = component.long_name;
            }
            if (type === 'route') {
                streetName = component.long_name;
            }
            // Still fill in the other fields
            if (type === 'locality') {
                document.getElementById('ownerCity').value = component.long_name;
            }
            if (type === 'administrative_area_level_1') {
                document.getElementById('ownerState').value = component.short_name;
            }
            if (type === 'postal_code') {
                document.getElementById('ownerZip').value = component.long_name;
            }
        }
        
        // Set only the street address in the address field
        const streetAddress = `${streetNumber} ${streetName}`.trim();
        addressInput.value = streetAddress;
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeAutocomplete);

// Helper function to fill in address components
function fillInAddress(place) {
    const componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',                 // City
        administrative_area_level_1: 'short_name', // State
        postal_code: 'short_name'              // ZIP code
    };

    // Clear existing values
    document.getElementById('ownerCity').value = '';
    document.getElementById('ownerState').value = '';
    document.getElementById('ownerZip').value = '';

    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (const component of place.address_components) {
        const addressType = component.types[0];
        if (componentForm[addressType]) {
            const val = component[componentForm[addressType]];
            if (addressType === 'locality') {
                document.getElementById('ownerCity').value = val;
            }
            if (addressType === 'administrative_area_level_1') {
                document.getElementById('ownerState').value = val;
            }
            if (addressType === 'postal_code') {
                document.getElementById('ownerZip').value = val;
            }
        }
    }
}

// Initialize autocomplete when page loads
document.addEventListener('DOMContentLoaded', initializeAutocomplete);
// Function to hide all sections - keep it simple and efficient
function hideAllSections() {
    console.log('Hiding all sections');
    document.querySelectorAll('div[id$="Section"], div[id*="-section"]').forEach(section => {
        section.style.display = 'none';
        console.log('Hidden section:', section.id);
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // Function to properly capitalize words
    function capitalizeWords(str) {
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // Sales Rep Name formatting
    const salesRepInput = document.getElementById('salesRepName');
    salesRepInput.addEventListener('blur', function() {
        this.value = capitalizeWords(this.value);
    });

    // Property Owner Name formatting
    const ownerNameInput = document.getElementById('ownerName');
    ownerNameInput.addEventListener('blur', function() {
        this.value = capitalizeWords(this.value);
    });

    // City formatting
    const cityInput = document.getElementById('ownerCity');
    cityInput.addEventListener('blur', function() {
        this.value = capitalizeWords(this.value);
    });

    // State formatting
    const stateInput = document.getElementById('ownerState');
    stateInput.addEventListener('blur', function() {
        this.value = this.value.toUpperCase();
    });

    // Insurance Company formatting
    const insuranceCompanyInput = document.getElementById('insuranceCompany');
    insuranceCompanyInput.addEventListener('blur', function() {
        this.value = capitalizeWords(this.value);
    });

    // Claim and Policy number formatting (preserve case)
    const claimNumberInput = document.getElementById('claimNumber');
    const policyNumberInput = document.getElementById('policyNumber');
    [claimNumberInput, policyNumberInput].forEach(input => {
        if (input) {
            input.addEventListener('blur', function() {
                // Clean but preserve case
                this.value = this.value.replace(/[^A-Za-z0-9\-_]/g, '');
            });
        }
    });

    // Date formatting
    const dateOfLossInput = document.getElementById('dateOfLoss');
    if (dateOfLossInput) {
        dateOfLossInput.addEventListener('blur', function() {
            // Ensure date is in correct format
            if (this.value) {
                const date = new Date(this.value);
                if (date instanceof Date && !isNaN(date)) {
                    const yyyy = date.getFullYear();
                    let mm = date.getMonth() + 1;
                    let dd = date.getDate();
                    if (dd < 10) dd = '0' + dd;
                    if (mm < 10) mm = '0' + mm;
                    this.value = `${yyyy}-${mm}-${dd}`;
                }
            }
        });
    }
});

   
function hideAllSections() {
    console.group('Hiding Sections');
    document.querySelectorAll('div[id$="Section"], div[id*="-section"]').forEach(section => {
        const previousDisplay = section.style.display;
        section.style.display = 'none';
        console.log(`${section.id}: ${previousDisplay} -> none`);
    });
    console.groupEnd();
}
// Main section display function - restored to working version with added logging
function showSection(sectionId) {
    console.group('Section Navigation');
    console.log('Current section:', sectionId);
    console.log('Section history before:', [...sectionHistory]);
    
    hideAllSections();
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        if (sectionHistory[sectionHistory.length - 1] !== sectionId) {
            sectionHistory.push(sectionId);
        }
        console.log('Section history after:', [...sectionHistory]);
        console.log('Target section visibility:', targetSection.style.display);
    } else {
        console.error('Target section not found:', sectionId);
    }
    console.groupEnd();
}
function showLoading(message = 'Loading...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMessage = document.getElementById('loading-message');
    
    if (loadingOverlay && loadingMessage) {
        loadingMessage.textContent = message;
        loadingOverlay.style.display = 'flex';
    }
    console.log('Loading started:', message);
}
function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    console.log('Loading complete');
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
function collectFormData() {
    const formData = {
        // Required fixed fields - these must be set by the system
        "Timestamp": new Date().toISOString(),
        "User Login": "Khaas01",
        
        // Sales Rep Information
        "Sales Rep Name": document.getElementById('salesRepName')?.value || '',
        "Sales Rep Email": document.getElementById('salesRepEmail')?.value || '',
        "Sales Rep Phone": document.getElementById('salesRepPhone')?.value || '',
        
        // Company Information
        "Company Name": document.getElementById('companyName')?.value || '',
        
        // Property Owner Information
        "Owner Name": document.getElementById('ownerName')?.value || '',
        "Owner Address": document.getElementById('ownerAddress')?.value || '',
        "Owner City": document.getElementById('ownerCity')?.value || '',
        "Owner State": document.getElementById('ownerState')?.value || '',
        "Owner ZIP": document.getElementById('ownerZip')?.value || '',
        "Owner Phone": document.getElementById('ownerPhone')?.value || '',
        "Owner Email": document.getElementById('ownerEmail')?.value || '',
        
        // Project Type and Insurance
        "Project Type": document.querySelector('input[name="projectType"]:checked')?.value || '',
        "Insurance Company": document.getElementById('insuranceCompany')?.value || '',
        "Insurance Phone": document.getElementById('insurancePhone')?.value || '',
        "Claim Number": document.getElementById('claimNumber')?.value || '',
        "Policy Number": document.getElementById('policyNumber')?.value || '',
        "Date of Loss": document.getElementById('dateOfLoss')?.value || '',
        
        // Roofing Details
        "Roofing Type": document.querySelector('input[name="roofingType"]:checked')?.value || '',
        "Shingle Type": document.querySelector('input[name="shingleType"]:checked')?.value || '',
        "Shingles Repaired": document.getElementById('shingles-repaired')?.value || '',
        "Additional Repairs": document.getElementById('repair-anything-else')?.value || '',
        "Shingle Replacement Squares": document.getElementById('shingle-replacement')?.value || '',
        
        // Tile Details
        "Tile Roofing Type": document.querySelector('input[name="tile-roofing-type"]:checked')?.value || '',
        "Tile Repair Squares": document.getElementById('tile-repair-sq')?.value || '',
        "Tile Underlayment Squares": document.getElementById('tile-underlayment-sq')?.value || '',
        "Tile Type": document.querySelector('input[name="tile-type"]:checked')?.value || '',
        "Tile Remove/Replace Squares": document.getElementById('tile-roof-rr')?.value || '',
        
        // Modified Bitumen and Coating
        "Modified Bitumen Squares": document.getElementById('modified-bitumen-sq')?.value || '',
        "Coating Squares": document.getElementById('coating-squares')?.value || '',
        
        // Secondary Roof
        "Has Secondary Roof": document.querySelector('input[name="secondary-roof"]:checked')?.value || '',
        "Secondary Roofing Type": document.querySelector('input[name="secondary-roofing-type"]:checked')?.value || '',
        "Secondary Shingles Squares": document.getElementById('shingles-squares')?.value || '',
        "Secondary Tile Underlayment Squares": document.getElementById('tiles-squares')?.value || '',
        "Secondary Modified Bitumen Squares": document.getElementById('modified-bitumen-squares')?.value || '',
        "Secondary Coating Squares": document.getElementById('coating-squares')?.value || '',
        
        // Third Roof
        "Has Third Roof": document.querySelector('input[name="third-roof"]:checked')?.value || '',
        "Third Roof Style": document.querySelector('input[name="third-roof-style"]:checked')?.value || '',
        "Third Shingles Squares": document.getElementById('shingles-squares')?.value || '',
        "Third Tiles Squares": document.getElementById('tiles-squares')?.value || '',
        "Third Modified Squares": document.getElementById('modified-squares')?.value || '',
        "Third Coating Squares": document.getElementById('coatings-squares')?.value || '',
        
        // Additional Charges
        "Has Additional Charges": document.querySelector('input[name="additional-charges"]:checked')?.value || '',
        "Additional Charges Description": document.getElementById('additional-charges-description')?.value || '',
        "Additional Charges Price": document.getElementById('additional-charges-price')?.value || '',
        
        // Solar Details
        "Has Solar Panels": document.querySelector('input[name="solar"]:checked')?.value || '',
        "Solar Detach/Reset Cost": document.getElementById('solar-detach-reset')?.value || '',
        
        // Optional fields
        "Amount Collected": '',
        "Unforseen Additions": '',
        "PDF_ID": ''
    };
    
    return formData;
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

function displayPDF(pdfId) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame && pdfId) {
        // Clean up the PDF ID
        const cleanPdfId = pdfId.replace(/["\s–]/g, '').trim();
        const previewUrl = `https://drive.google.com/file/d/${cleanPdfId}/preview`;
        
        console.log('Clean PDF ID:', cleanPdfId);
        console.log('Setting preview URL:', previewUrl);

        // Set necessary attributes for Google Drive embedding
        previewFrame.setAttribute('allowfullscreen', 'true');
        previewFrame.setAttribute('allow', 'autoplay');
        
        // Remove any previous content and listeners
        previewFrame.onload = null;
        previewFrame.onerror = null;
        
        // Set new event listeners
        previewFrame.onerror = () => {
            console.error('Failed to load preview frame');
            hideLoading();
            showError();
        };
        
        previewFrame.onload = () => {
            console.log('Preview frame loaded successfully');
            hideLoading(); // Only hide loading when PDF is actually loaded
        };

        // Set the source directly
        if (previewFrame.src !== previewUrl) {
            previewFrame.src = previewUrl;
        }
    } else {
        console.error('Preview frame not found or invalid PDF ID');
        hideLoading();
        showError();
    }
}
function handlePdfError() {
    const estimatePreviewFrame = document.getElementById('estimatePreviewFrame');
    if (estimatePreviewFrame) {
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
            z-index: 1000;
        `;
        errorMessage.innerHTML = 'Unable to load PDF preview. Please try refreshing the page.';
        estimatePreviewFrame.parentNode.appendChild(errorMessage);
    }
}

// Updated message handler
window.addEventListener('message', function(event) {
    try {
        // Only process messages from Google Drive domain
        if (!event.origin.includes('drive.google.com')) {
            return;
        }

        const data = event.data;
        // Check if data is a string before parsing
        if (typeof data === 'string' && !data.startsWith('!_')) {
            const parsedData = JSON.parse(data);
            // Handle the parsed data
            console.log('Received valid message:', parsedData);
        }
    } catch (error) {
        // Don't log parsing errors for Google Drive internal messages
        if (!error.message.includes('Unexpected token')) {
            console.error('Error processing message:', error);
        }
    }
});


function showError() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        // Clear the iframe
        previewFrame.src = 'about:blank';
        
        // Create error message outside the iframe
        let errorDiv = document.getElementById('pdf-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'pdf-error-message';
            errorDiv.innerHTML = `
                <div style="color: red; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    <p>Error loading PDF preview.</p>
                    <p>Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            `;
            previewFrame.parentNode.insertBefore(errorDiv, previewFrame.nextSibling);
        }
        errorDiv.style.display = 'block';
    }
}


function submitForm() {
    if (isSubmitting) return Promise.reject(new Error('Form is already being submitted'));
    
    try {
        isSubmitting = true;
        showLoading('Submitting form...');

        const formData = collectFormData();
        
        // Create submission data structure that exactly matches the Google Sheet headers
        const submissionData = {
            data: {
                "Timestamp": formData["Timestamp"],
                "User Login": formData["User Login"],
                "Sales Rep Name": formData["Sales Rep Name"],
                "Sales Rep Email": formData["Sales Rep Email"],
                "Sales Rep Phone": formData["Sales Rep Phone"],
                "Company Name": formData["Company Name"],
                "Owner Name": formData["Owner Name"],
                "Owner Address": formData["Owner Address"],
                "Owner City": formData["Owner City"],
                "Owner State": formData["Owner State"],
                "Owner ZIP": formData["Owner ZIP"],
                "Owner Phone": formData["Owner Phone"],
                "Owner Email": formData["Owner Email"],
                "Project Type": formData["Project Type"],
                "Insurance Company": formData["Insurance Company"],
                "Insurance Phone": formData["Insurance Phone"],
                "Claim Number": formData["Claim Number"],
                "Policy Number": formData["Policy Number"],
                "Date of Loss": formData["Date of Loss"],
                "Roofing Type": formData["Roofing Type"],
                "Shingle Type": formData["Shingle Type"],
                "Shingles Repaired": formData["Shingles Repaired"],
                "Additional Repairs": formData["Additional Repairs"],
                "Shingle Replacement Squares": formData["Shingle Replacement Squares"],
                "Tile Roofing Type": formData["Tile Roofing Type"],
                "Tile Repair Squares": formData["Tile Repair Squares"],
                "Tile Underlayment Squares": formData["Tile Underlayment Squares"],
                "Tile Type": formData["Tile Type"],
                "Tile Remove/Replace Squares": formData["Tile Remove/Replace Squares"],
                "Modified Bitumen Squares": formData["Modified Bitumen Squares"],
                "Coating Squares": formData["Coating Squares"],
                "Has Secondary Roof": formData["Has Secondary Roof"],
                "Secondary Roofing Type": formData["Secondary Roofing Type"],
                "Secondary Shingles Squares": formData["Secondary Shingles Squares"],
                "Secondary Tile Underlayment Squares": formData["Secondary Tile Underlayment Squares"],
                "Secondary Modified Bitumen Squares": formData["Secondary Modified Bitumen Squares"],
                "Secondary Coating Squares": formData["Secondary Coating Squares"],
                "Has Third Roof": formData["Has Third Roof"],
                "Third Roof Style": formData["Third Roof Style"],
                "Third Shingles Squares": formData["Third Shingles Squares"],
                "Third Tiles Squares": formData["Third Tiles Squares"],
                "Third Modified Squares": formData["Third Modified Squares"],
                "Third Coating Squares": formData["Third Coating Squares"],
                "Has Additional Charges": formData["Has Additional Charges"],
                "Additional Charges Description": formData["Additional Charges Description"],
                "Additional Charges Price": formData["Additional Charges Price"],
                "Has Solar Panels": formData["Has Solar Panels"],
                "Solar Detach/Reset Cost": formData["Solar Detach/Reset Cost"],
                "Amount Collected": formData["Amount Collected"],
                "Unforseen Additions": formData["Unforseen Additions"],
                "PDF_ID": formData["PDF_ID"]
            }
        };

        console.log('Sending structured form data:', submissionData);

        return fetch(API_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(submissionData)
        })
        .then(response => {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 3;
                const delay = 3000;

                const tryGetPdfId = async () => {
                    attempts++;
                    const pdfId = await getLatestPdfId();
                    
                    if (pdfId) {
                        showSection('review-section');
                        displayPDF(pdfId);
                        resolve({ success: true });
                    } else if (attempts < maxAttempts) {
                        console.log(`Attempt ${attempts} failed, retrying in ${delay/1000} seconds...`);
                        setTimeout(tryGetPdfId, delay);
                    } else {
                        reject(new Error('Could not retrieve PDF ID after multiple attempts'));
                    }
                };

                tryGetPdfId();
            });
        })
        .catch(error => {
            console.error('Form submission error:', error);
            throw error;
        })
        .finally(() => {
            isSubmitting = false;
            hideLoading();
        });
    } catch (error) {
        isSubmitting = false;
        hideLoading();
        return Promise.reject(error);
    }
}

window.addEventListener('message', function(event) {
    try {
        // Ignore messages that start with '!' as they are internal Google Drive messages
        if (typeof event.data === 'string' && event.data.startsWith('!')) {
            return;
        }

        // Only try to parse JSON if it's a string and doesn't start with '!'
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('Received message data:', data);

        // Ignore Google API initialization messages
        if (data.f && data.f.startsWith('apiproxy')) {
            return;
        }

        if (data.success && data.pdfUrl) {
            hideLoading();
            showSection('review-section');
            // Extract file ID from Google Drive URL
            const fileId = data.fileId || data.pdfUrl.match(/\/d\/(.+?)\/|id=(.+?)(&|$)/)?.[1];
            if (fileId) {
                displayPDF(fileId);
            } else {
                console.error('Could not extract file ID from URL:', data.pdfUrl);
                showError();
            }
        } else if (data.type === 'form_submission') {
            hideLoading();
            console.error('Form submission failed:', data);
            showError();
        }
    } catch (error) {
        // Only log errors for non-Google Drive internal messages
        if (typeof event.data === 'string' && !event.data.startsWith('!')) {
            console.error('Error processing message:', error);
            hideLoading();
            showError();
        }
    }
});


function handlePreviewError() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'preview-error';
    errorMessage.innerHTML = `
        <p>Unable to load preview. Please try:</p>
        <ul>
            <li>Refreshing the page</li>
            <li>Checking your internet connection</li>
            <li>Ensuring you have access to this document</li>
        </ul>
    `;
    previewFrame.parentNode.insertBefore(errorMessage, previewFrame);
}

function showError() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        previewFrame.srcdoc = `
            <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="color: red; text-align: center;">
                    <p>Error loading PDF preview.</p>
                    <p>Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            </body>
            </html>
        `;
    }
}

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
function nextFromSolar() {
    const solarValue = document.querySelector('input[name="solar"]:checked')?.value;
    if (!solarValue) {
        alert("Please select Yes or No.");
        return;
    }

    if (solarValue === 'yes') {
        showSection('solar-detach-reset-section');
    } else {
        // Clear any existing preview and show loading state
        showSection('review-section');
        
        submitForm()
            .then(async () => {
                // Add a small delay before fetching the new PDF ID
                await new Promise(resolve => setTimeout(resolve, 2000));
                const pdfId = await getLatestPdfId();
                if (pdfId) {
                    displayPDF(pdfId);
                } else {
                    throw new Error('No PDF ID found');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError();
            })
            .finally(() => {
                hideLoading();
            });
    }
}
function nextFromSolarDetachReset() {
    // Clear any existing preview and show loading state
    showSection('review-section');
    
    submitForm()
        .then(async () => {
            // Add a small delay before fetching the new PDF ID
            await new Promise(resolve => setTimeout(resolve, 2000));
            const pdfId = await getLatestPdfId();
            if (pdfId) {
                displayPDF(pdfId);
            } else {
                throw new Error('No PDF ID found');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError();
        })
        .finally(() => {
            hideLoading();
        });
}
function handleApiError(error) {
    console.error('API Error:', error);
    
    // Don't show alert, just log to console
    if (error && error.details) {
        console.error('Error details:', error.details);
    } else if (error && error.message) {
        console.error('Error message:', error.message);
    } else {
        console.error('Unknown error occurred during API initialization');
    }
    
    // Return false instead of showing alert
    return false;
}
async function getLatestPdfId() {
    try {
        const response = await fetch(`${API_CONFIG.API_ENDPOINT}?key=${API_CONFIG.API_KEY}`);
        const data = await response.json();
        
        if (data.values && data.values.length > 0) {
            const headers = data.values[0];
            const pdfIdColumnIndex = headers.indexOf('PDF_ID');
            
            if (pdfIdColumnIndex !== -1) {
                const lastRow = data.values[data.values.length - 1];
                return lastRow[pdfIdColumnIndex];
            }
        }
        throw new Error('PDF ID not found in spreadsheet');
    } catch (error) {
        console.error('Error fetching PDF ID:', error);
        return null;
    }
}
async function getDecodedServiceAccountCredentials() {
    try {
        // Fetch the encoded credentials file
        const response = await fetch('service-account-base64.txt');
        if (!response.ok) {
            throw new Error(`Failed to fetch credentials: ${response.status} ${response.statusText}`);
        }

        // Decode the content
        const base64Content = await response.text();
        const jsonContent = atob(base64Content);
        
        // Parse and return the credentials
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error('Service account credentials error:', error);
        throw new Error('Failed to initialize service account credentials');
    }
}
