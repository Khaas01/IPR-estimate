// Global variables
let isSubmitting = false;
let sectionHistory = []; // Initialize sectionHistory

// Centralized API configuration

const SHEET_ID = "1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw";
const SHEET_NAME = "Form Responses";

const API_CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyL6ioIoHwW9ydFNN8fD-Dfmospk11aWB-U8kgsKRpli_sdQ-AYt6gMBQsvquden91JsQ/exec',
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

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize section history
    sectionHistory.push('salesRepSection');

    // Initialize Google APIs with simpler check
    if (typeof gapi !== 'undefined') {
        initializeGoogleAPIs();
    } else {
        console.error('Google API client library not loaded');
    }

    // Initialize form sections
    hideAllSections();
    showSection(sectionHistory[0]);
});

window.addEventListener('message', function(event) {
    try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('Received message data:', data); // Add this line to see what data we're receiving

        if (data.success) {
            hideLoading();
            
            if (data.pdfUrl) {
                console.log('Received PDF URL:', data.pdfUrl);
                showSection('review-section');
                const previewFrame = document.getElementById('estimatePreviewFrame');
                if (previewFrame) {
                    showLoading('Loading preview...');
                    previewFrame.src = data.pdfUrl;
                    previewFrame.onload = function() {
                        hideLoading();
                        console.log('Preview loaded successfully');
                    };
                }
            } else {
                console.log('Response successful but no PDF URL provided:', data); // Changed to console.log
            }
        } else {
            hideLoading();
            console.log('Response indicated failure. Full response:', data); // Changed to help debug
        }
    } catch (error) {
        hideLoading();
        console.log('Error processing message. Event data:', event.data); // Changed to help debug
    }
});

   // Original working version for solar section radio buttons
const solarRadios = document.querySelectorAll('input[name="solar"]');
const navigationButtons = document.querySelector('#solar-section #navigationButtons');

solarRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (navigationButtons) {
            if (this.value === 'no') {
                navigationButtons.innerHTML = `
                    <button type="button" onclick="goBack()">Back</button>
                    <button type="button" onclick="showSection('review-section'); displayReview();" class="submit-button">Submit</button>
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
 function hideAllSections() {
    document.querySelectorAll('div[id$="Section"], div[id*="-section"]').forEach(section => {
        section.style.display = 'none';
    });
}

// Show a specific section
function showSection(sectionId) {
    hideAllSections();
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Add this block for the review section
        if (sectionId === 'review-section') {
            console.log('Review section shown, getting PDF ID...');
            getLatestPdfId()
                .then(pdfId => {
                    if (pdfId) {
                        console.log('Got PDF ID, displaying...');
                        displayPDF(pdfId);
                    } else {
                        console.error('No PDF ID returned');
                        showError();
                    }
                })
                .catch(error => {
                    console.error('Error getting PDF ID:', error);
                    showError();
                });
        }
    }
    if (sectionHistory[sectionHistory.length - 1] !== sectionId) {
        sectionHistory.push(sectionId);
    }
}

// Go back to the previous section
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
        // Sales Rep Information
        salesRepName: document.getElementById('salesRepName')?.value || '',
        salesRepEmail: document.getElementById('salesRepEmail')?.value || '',
        salesRepPhone: document.getElementById('salesRepPhone')?.value || '',
        
        // Company Information
        companyName: document.getElementById('companyName')?.value || '',
        
        // Property Owner Information
        ownerName: document.getElementById('ownerName')?.value || '',
        ownerAddress: document.getElementById('ownerAddress')?.value || '',
        ownerCity: document.getElementById('ownerCity')?.value || '',
        ownerState: document.getElementById('ownerState')?.value || '',
        ownerZip: document.getElementById('ownerZip')?.value || '',
        ownerPhone: document.getElementById('ownerPhone')?.value || '',
        ownerEmail: document.getElementById('ownerEmail')?.value || '',
        
        // Project Type
        projectType: document.querySelector('input[name="projectType"]:checked')?.value || '',
        
        // Insurance Information
        insuranceCompany: document.getElementById('insuranceCompany')?.value || '',
        insurancePhone: document.getElementById('insurancePhone')?.value || '',
        claimNumber: document.getElementById('claimNumber')?.value || '',
        policyNumber: document.getElementById('policyNumber')?.value || '',
        dateOfLoss: document.getElementById('dateOfLoss')?.value || '',
        
        // Roofing Details
        roofingType: document.querySelector('input[name="roofingType"]:checked')?.value || '',
        shingleType: document.querySelector('input[name="shingleType"]:checked')?.value || '',
        shinglesRepaired: document.getElementById('shingles-repaired')?.value || '',
        shingleReplacement: document.getElementById('shingle-replacement')?.value || '',
        
        // Tile Details
        tileRoofingType: document.querySelector('input[name="tile-roofing-type"]:checked')?.value || '',
        tileRepairSq: document.getElementById('tile-repair-sq')?.value || '',
        tileUnderlaymentSq: document.getElementById('tile-underlayment-sq')?.value || '',
        tileType: document.querySelector('input[name="tile-type"]:checked')?.value || '',
        tileRoofRR: document.getElementById('tile-roof-rr')?.value || '',
        
        // Modified Bitumen
        modifiedBitumenSq: document.getElementById('modified-bitumen-sq')?.value || '',
        
        // Coating
        coatingSquares: document.getElementById('coating-squares')?.value || '',
        
        // Secondary Roof
        secondaryRoof: document.querySelector('input[name="secondary-roof"]:checked')?.value || '',
        secondaryRoofingType: document.querySelector('input[name="secondary-roofing-type"]:checked')?.value || '',
        
        // Third Roof
        thirdRoof: document.querySelector('input[name="third-roof"]:checked')?.value || '',
        thirdRoofStyle: document.querySelector('input[name="third-roof-style"]:checked')?.value || '',
        
        // Additional Charges
        additionalCharges: document.querySelector('input[name="additional-charges"]:checked')?.value || '',
        additionalChargesDescription: document.getElementById('additional-charges-description')?.value || '',
        additionalChargesPrice: document.getElementById('additional-charges-price')?.value || '',
        
        // Solar Panels
        solar: document.querySelector('input[name="solar"]:checked')?.value || '',
        solarDetachReset: document.getElementById('solar-detach-reset')?.value || ''
    };
    
    // Add timestamp
    formData.timestamp = new Date().toISOString();
    
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
function submitForm() {
    if (isSubmitting) return Promise.reject(new Error('Form is already being submitted'));
    
    return new Promise((resolve, reject) => {
        isSubmitting = true;
        showLoading('Submitting form...');
        
        try {
            const rawFormData = collectFormData();
            
            // Create the properly formatted data object
            const formData = {
                timestamp: new Date().toISOString(),
                user: 'Khaas01',
                data: {
                    Timestamp: rawFormData.timestamp,
                    "User Login": "Khaas01",
                    "Sales Rep Name": rawFormData.salesRepName,
                    "Sales Rep Email": rawFormData.salesRepEmail,
                    "Sales Rep Phone": rawFormData.salesRepPhone,
                    "Company Name": rawFormData.companyName,
                    "Owner Name": rawFormData.ownerName,
                    "Owner Address": rawFormData.ownerAddress,
                    "Owner City": rawFormData.ownerCity,
                    "Owner State": rawFormData.ownerState,
                    "Owner ZIP": rawFormData.ownerZip,
                    "Owner Phone": rawFormData.ownerPhone,
                    "Owner Email": rawFormData.ownerEmail,
                    "Project Type": rawFormData.projectType,
                    "Insurance Company": rawFormData.insuranceCompany,
                    "Insurance Phone": rawFormData.insurancePhone,
                    "Claim Number": rawFormData.claimNumber,
                    "Policy Number": rawFormData.policyNumber,
                    "Date of Loss": rawFormData.dateOfLoss,
                    "Roofing Type": rawFormData.roofingType,
                    "Shingle Type": rawFormData.shingleType,
                    "Shingles Repaired": rawFormData.shinglesRepaired,
                    "Additional Repairs": rawFormData.additionalRepairs,
                    "Shingle Replacement Squares": rawFormData.shingleReplacement,
                    "Tile Roofing Type": rawFormData.tileRoofingType,
                    "Tile Repair Squares": rawFormData.tileRepairSq,
                    "Tile Underlayment Squares": rawFormData.tileUnderlaymentSq,
                    "Tile Type": rawFormData.tileType,
                    "Tile Remove/Replace Squares": rawFormData.tileRoofRR,
                    "Modified Bitumen Squares": rawFormData.modifiedBitumenSq,
                    "Coating Squares": rawFormData.coatingSquares,
                    "Has Secondary Roof": rawFormData.secondaryRoof,
                    "Secondary Roofing Type": rawFormData.secondaryRoofingType,
                    "Has Third Roof": rawFormData.thirdRoof,
                    "Third Roof Style": rawFormData.thirdRoofStyle,
                    "Has Additional Charges": rawFormData.additionalCharges,
                    "Additional Charges Description": rawFormData.additionalChargesDescription,
                    "Additional Charges Price": rawFormData.additionalChargesPrice,
                    "Has Solar Panels": rawFormData.solar,
                    "Solar Detach/Reset Cost": rawFormData.solarDetachReset,
                    "Amount Collected": "",
                    "Unforseen Additions": ""
                }
            };

            fetch(API_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData.data)
            })
            .then(response => {
                hideLoading();
                resolve(response);
            })
            .catch(error => {
                console.error('Error:', error);
                hideLoading();
                reject(error);
            })
            .finally(() => {
                isSubmitting = false;
            });

        } catch (error) {
            isSubmitting = false;
            hideLoading();
            reject(error);
        }
    });
}
async function getLatestPdfId() {
    try {
        console.log('Fetching from:', `${API_CONFIG.API_ENDPOINT}?key=${API_CONFIG.API_KEY}`);
        const response = await fetch(`${API_CONFIG.API_ENDPOINT}?key=${API_CONFIG.API_KEY}`);
        const data = await response.json();
        
        if (data.values && data.values.length > 0) {
            const headers = data.values[0];
            const pdfIdColumnIndex = headers.indexOf('PDF_ID');
            
            if (pdfIdColumnIndex !== -1) {
                const lastRow = data.values[data.values.length - 1];
                console.log('Found PDF ID:', lastRow[pdfIdColumnIndex]); // Add this log
                return lastRow[pdfIdColumnIndex];
            }
        }
        throw new Error('PDF ID not found in spreadsheet');
    } catch (error) {
        console.error('Error fetching PDF ID:', error);
        return null;
    }
}

// Update the displayPDF function
function displayPDF(pdfId) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame && pdfId) {
        console.log('Attempting to display PDF with ID:', pdfId);
        const cleanPdfId = pdfId.replace(/["\s–]/g, '').trim();
        const previewUrl = `https://drive.google.com/file/d/${cleanPdfId}/preview`;
        
        console.log('Preview URL:', previewUrl);
        
        // Set the source directly
        previewFrame.src = previewUrl;
        
        // Basic error handling
        previewFrame.onerror = () => {
            console.error('Failed to load preview');
            showError();
        };
    } else {
        console.error('Preview frame not found or invalid PDF ID');
        showError();
    }
}

function displayPDFPreview(pdfUrl) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    console.log('Setting preview URL:', pdfUrl);
    
    // Show loading state while PDF loads
    showLoading('Loading preview...');
    
    previewFrame.onload = function() {
        // Hide loading only after PDF is loaded
        hideLoading();
        console.log('Preview loaded successfully');
    };
    
    previewFrame.onerror = function(error) {
        console.error('Preview failed to load:', error);
        previewFrame.srcdoc = `
            <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="color: red; text-align: center;">
                    Error loading preview. Please try again.<br>
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">Try Again</button>
                </div>
            </body>
            </html>
        `;
    };
    
    previewFrame.src = pdfUrl;
}
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
function showLoading(message = 'Processing your estimate...') {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        previewFrame.srcdoc = `
            <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; background-color: white;">
                <div style="text-align: center;">
                    <div style="margin-bottom: 20px; font-size: 16px;">${message}</div>
                    <div class="spinner" style="border: 5px solid #f3f3f3; border-radius: 50%; border-top: 5px solid #3498db; width: 50px; height: 50px; margin: 0 auto;">
                        <style>
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                            .spinner {
                                animation: spin 1s linear infinite;
                            }
                        </style>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

// Hide loading indicator
function hideLoading() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame && previewFrame.srcdoc) {
        previewFrame.srcdoc = '';
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
        submitForm()
            .then(() => {
                showLoading('Generating PDF preview...');
                // Add delay to allow form processing
                return new Promise(resolve => setTimeout(resolve, 2000))
                    .then(() => getLatestPdfId());
            })
            .then(pdfId => {
                if (pdfId) {
                    showSection('review-section');
                    displayPDF(pdfId);
                } else {
                    throw new Error('Could not get PDF ID');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError();
            });
    }
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
