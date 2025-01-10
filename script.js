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

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize section history
    sectionHistory.push('salesRepSection');

    // Show review section and loading indicator immediately
    showSection('salesRepSection');
    showLoading('Loading latest estimate...');
    
    // Add a delay before fetching the PDF ID
    setTimeout(async () => {
        try {
            const pdfId = await getLatestPdfId();
            console.log('Initial PDF ID fetch:', pdfId);
            
            if (pdfId) {
                displayPDF(pdfId);
            } else {
                console.error('No PDF ID found on initial load');
                showError();
            }
        } catch (error) {
            console.error('Error during initial PDF load:', error);
            showError();
        } finally {
            if (!document.getElementById('estimatePreviewFrame').src) {
                hideLoading();
            }
        }
    }, 2000); // 2 second delay before fetching
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
        
        // Clear iframe content when showing review section
        if (sectionId === 'review-section') {
            const previewFrame = document.getElementById('estimatePreviewFrame');
            if (previewFrame) {
                previewFrame.src = 'about:blank';
                showLoading();
            }
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
        
        // Project Type
        "Project Type": document.querySelector('input[name="projectType"]:checked')?.value || '',
        
        // Insurance Information
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
        
        // Modified Bitumen
        "Modified Bitumen Squares": document.getElementById('modified-bitumen-sq')?.value || '',
        
        // Coating
        "Coating Squares": document.getElementById('coating-squares')?.value || '',
        
        // Secondary Roof
        "Has Secondary Roof": document.querySelector('input[name="secondary-roof"]:checked')?.value || '',
        "Secondary Roofing Type": document.querySelector('input[name="secondary-roofing-type"]:checked')?.value || '',
        "Secondary Shingles Squares": document.getElementById('shingles-squares')?.value || '',
        "Secondary Tile Underlayment Squares": document.getElementById('tile-underlayment-squares')?.value || '',
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
        
        // Solar Panels
        "Has Solar Panels": document.querySelector('input[name="solar"]:checked')?.value || '',
        "Solar Detach/Reset Cost": document.getElementById('solar-detach-reset')?.value || '',
        
        // Misc
        "Amount Collected": '',  // Optional field
        "Unforseen Additions": '',  // Optional field
        "PDF_ID": ''  // Optional field
    };
    
    // Add timestamp and user login
    formData["Timestamp"] = new Date().toISOString();

    
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
    try {
        const estimatePreviewFrame = document.getElementById('estimatePreviewFrame');
        if (estimatePreviewFrame && pdfId) {
            const cleanPdfId = pdfId.replace(/^["'\s]+|["'\s]+$/g, '').trim();
            const embedUrl = `https://drive.google.com/file/d/${cleanPdfId}/preview`;
            
            console.log('Clean PDF ID:', cleanPdfId);
            console.log('Setting embed URL:', embedUrl);

            // Show loading state while PDF is loading
            showLoading();

            // Set up load event listener before changing src
            estimatePreviewFrame.onload = () => {
                hideLoading();
            };

            // Remove any existing srcdoc and sandbox attribute
            estimatePreviewFrame.removeAttribute('srcdoc');
            
            // Set more restrictive sandbox permissions
            estimatePreviewFrame.setAttribute('sandbox', 'allow-scripts allow-popups allow-forms allow-downloads allow-same-origin');
            
            // Add additional security attributes
            estimatePreviewFrame.setAttribute('allow', 'autoplay; encrypted-media');
            estimatePreviewFrame.setAttribute('allowfullscreen', 'true');
            estimatePreviewFrame.setAttribute('crossorigin', 'anonymous');
            
            // Set the source
            estimatePreviewFrame.src = embedUrl;
        }
    } catch (error) {
        console.error('Error in displayPDF:', error);
        handlePdfError();
    }
}
// Updated error handler
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

// Simplified error handling
function showError() {
    const estimatePreviewFrame = document.getElementById('estimatePreviewFrame');
    if (estimatePreviewFrame) {
        estimatePreviewFrame.src = 'about:blank';
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = 'Error loading PDF. Please try again.';
        estimatePreviewFrame.parentNode.insertBefore(errorDiv, estimatePreviewFrame);
    }
}
function submitForm() {
    if (isSubmitting) return Promise.reject(new Error('Form is already being submitted'));
    
    try {
        isSubmitting = true;
        showLoading('Submitting form...');

        const formData = collectFormData();
        
        // Matching EXACTLY with the Form Responses sheet headers
        const submissionData = {
                "Timestamp": formData.timestamp,
                "User Login": "Khaas01",
                "Sales Rep Name": formData.salesRepName,
                "Sales Rep Email": formData.salesRepEmail,
                "Sales Rep Phone": formData.salesRepPhone,
                "Company Name": formData.companyName,
                "Owner Name": formData.ownerName,
                "Owner Address": formData.ownerAddress,
                "Owner City": formData.ownerCity,
                "Owner State": formData.ownerState,
                "Owner ZIP": formData.ownerZip,
                "Owner Phone": formData.ownerPhone,
                "Owner Email": formData.ownerEmail,
                "Project Type": formData.projectType,
                "Insurance Company": formData.insuranceCompany,
                "Insurance Phone": formData.insurancePhone,
                "Claim Number": formData.claimNumber,
                "Policy Number": formData.policyNumber,
                "Date of Loss": formData.dateOfLoss,
                "Roofing Type": formData.roofingType,
                "Shingle Type": formData.shingleType,
                "Shingles Repaired": formData.shinglesRepaired,
                "Additional Repairs": formData.additionalRepairs,
                "Shingle Replacement Squares": formData.shingleReplacement,
                "Tile Roofing Type": formData.tileRoofingType,
                "Tile Repair Squares": formData.tileRepairSq,
                "Tile Underlayment Squares": formData.tileUnderlaymentSq,
                "Tile Type": formData.tileType,
                "Tile Remove/Replace Squares": formData.tileRoofRR,
                "Modified Bitumen Squares": formData.modifiedBitumenSq,
                "Coating Squares": formData.coatingSquares,
                "Has Secondary Roof": formData.secondaryRoof,
                "Secondary Roofing Type": formData.secondaryRoofingType,
                "Secondary Shingles Squares": formData.secondaryShingleSquares,
                "Secondary Tile Underlayment Squares": formData.secondaryTileSquares,
                "Secondary Modified Bitumen Squares": formData.secondaryModifiedBitumenSq,
                "Secondary Coating Squares": formData.secondaryCoatingSquares,
                "Has Third Roof": formData.thirdRoof,
                "Third Roof Style": formData.thirdRoofStyle,
                "Third Shingles Squares": formData.thirdShingleSquares,
                "Third Tiles Squares": formData.thirdTileSquares,
                "Third Modified Squares": formData.thirdModifiedSquares,
                "Third Coating Squares": formData.thirdCoatingSquares,
                "Has Additional Charges": formData.additionalCharges,
                "Additional Charges Description": formData.additionalChargesDescription,
                "Additional Charges Price": formData.additionalChargesPrice,
                "Has Solar Panels": formData.solar,
                "Solar Detach/Reset Cost": formData.solarDetachReset,
                "Amount Collected": "",  // Optional field
                "Unforseen Additions": ""  // Optional field
        };

            console.log('Sending structured form data:', formData);

        return fetch(API_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    redirect: 'follow',
    headers: {
        'Content-Type': 'application/json',
    },
  body: JSON.stringify({values: [Object.values(formData)]})
})
        .then(response => {
            // With no-cors, we can't read the response
            // Instead, we'll get the PDF ID from the spreadsheet with retries
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 3;
                const delay = 3000; // 3 seconds between attempts

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

                // Start the first attempt
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
function showLoading() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        const loadingHtml = `
            <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="text-align: center;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
                    <p style="color: #666;">Generating your estimate...</p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </body>
            </html>
        `;
        previewFrame.srcdoc = loadingHtml;
    }
    console.log('Loading...');
}

function hideLoading() {
    // Clear any loading states if needed
    console.log('Loading complete');
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
