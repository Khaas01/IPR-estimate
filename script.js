// Global variables
let tokenClient;
let gapiInited = false;
let gisInited = false;
let sectionHistory = []; // Initialize sectionHistory

// API configuration constants
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCghxJL8Upfc5GF-6RcZPzQCC1ZAJv12dcShQBeCF5P8ri8Q8bIkihr9pa386mt-qWNA/exec';
const API_KEY = 'AIzaSyDFVaRrTxOyR-fX3XAOp1tjoeg58mkj254';
const CLIENT_ID = '900437232674-krleqgjop3u7cl4sggmo20rkmrsl5vh5.apps.googleusercontent.com';
const REDIRECT_URI = 'https://khaas01.github.io'; 
const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
].join(' ');

// Function to fetch and decode the Base64-encoded service account content
async function getDecodedServiceAccountCredentials() {
    try {
        const response = await fetch('service-account-base64.txt'); // Path to the file
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const base64Content = await response.text();
        const jsonContent = atob(base64Content);
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error('Error fetching or decoding service account credentials:', error);
        throw error;
    }
}

async function initializeGoogleAPIs() {
    try {
        const credentials = await getDecodedServiceAccountCredentials();

        // Wait for the Google API client library to load
        await new Promise((resolve) => gapi.load('client', resolve));

        // Initialize GAPI client
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [
                'https://sheets.googleapis.com/$discovery/rest?version=v4',
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ]
        });

        // Initialize GIS
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: credentials.client_id,
            scope: SCOPES,
            callback: handleAuthResponse
        });

        gapiInited = true;
        gisInited = true;
        console.log('APIs initialized successfully');

        // Attempt authentication
        handleAuthClick();
        return true;
    } catch (error) {
        console.error('API initialization error:', error);
        handleApiError(error);
        return false;
    }
}

function handleApiError(error) {
    console.error('An error occurred:', error);
    alert('An error occurred. Please try again later.');
}

function handleAuthClick() {
    if (gapi.client.getToken() === null) {
        try {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (error) {
            console.error('Popup window blocked:', error);
            alert('Popup window blocked. Please allow popups for this site to proceed with authentication.');
        }
    } else {
        try {
            tokenClient.requestAccessToken({ prompt: '' });
        } catch (error) {
            console.error('Popup window blocked:', error);
            alert('Popup window blocked. Please allow popups for this site to proceed with authentication.');
        }
    }
}

function handleAuthResponse(response) {
    if (response.error !== undefined) {
        console.error('Auth error:', response.error);
        alert('Authentication failed. Please try again.');
        return;
    }
    console.log('Successfully authenticated');
    updateSignInStatus(true);
}

function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        console.log('User is signed in');
        // Add your post-authentication logic here
    } else {
        console.log('User is not signed in');
    }
}


// Update UI based on sign-in status
function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        console.log('User is signed in');
        // Add your post-authentication logic here
    } else {
        console.log('User is not signed in');
    }
}
// Event listener for DOMContentLoaded to initialize the form and Google APIs
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the section history with the actual first section ID
    sectionHistory.push('salesRepSection'); // Corrected section ID

    // Initialize Google APIs
    if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
        initializeGoogleAPIs();
    } else {
        console.error('Google APIs are not loaded correctly');
        handleApiError(new Error('Google APIs failed to load'));
    }

    // Initialize form sections
    hideAllSections();
    showSection(sectionHistory[0]);

    // Setup solar section radio buttons
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
                        <button type="button" onclick="nextFromSolar()" class="next-button">Next</button>
                    `;
                }
            }
        });
    });
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
                        <button type="button" onclick="nextFromSolar()" class="next-button">Next</button>
                    `;
                }
            }
        });
    });

// Event listener for receiving messages (PDF URL) from Google Apps Script
window.addEventListener('message', function(event) {
    try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data.success) {
            hideLoading();
            
            if (data.pdfUrl) {
                console.log('Received PDF URL:', data.pdfUrl);
                showSection('review-section');
                const previewFrame = document.getElementById('estimatePreviewFrame');
                if (previewFrame) {
                    showLoading('Loading preview...');
                    previewFrame.src = data.pdfUrl;  // Direct URL assignment
                    previewFrame.onload = function() {
                        hideLoading();
                        console.log('Preview loaded successfully');
                    };
                }
            } else {
                console.error('No PDF URL in response');
                alert('Error: No PDF URL received');
            }
        } else {
            hideLoading();
            alert('Error: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        hideLoading();
        console.error('Error processing message:', error);
        alert('Error processing response. Please try again.');
    }
});
// Hide all sections
function hideAllSections() {
    document.querySelectorAll('div[id$="Section"], div[id*="-section"]').forEach(section => {
        section.style.display = 'none';
    });
}

// Show a specific section
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
// Collect form data from all input fields
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

// Validate the collected form data
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

// Global submission state
let isSubmitting = false;

// Handle form submission
function submitForm() {
    if (isSubmitting) return Promise.reject(new Error('Form is already being submitted'));
    
    return checkAuthBeforeSubmit()
        .then(() => {
            isSubmitting = true;
            showLoading('Submitting form...');
            
            try {
                const rawFormData = collectFormData();
                
                // Structured form data matching the Form Responses sheet headers
                const formData = {
                    data: {
                        "Timestamp": rawFormData.timestamp,
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
                        "Secondary Shingles Squares": rawFormData.secondaryShingleSquares,
                        "Secondary Tile Underlayment Squares": rawFormData.secondaryTileSquares,
                        "Secondary Modified Bitumen Squares": rawFormData.secondaryModifiedBitumenSq,
                        "Secondary Coating Squares": rawFormData.secondaryCoatingSquares,
                        "Has Third Roof": rawFormData.thirdRoof,
                        "Third Roof Style": rawFormData.thirdRoofStyle,
                        "Third Shingles Squares": rawFormData.thirdShingleSquares,
                        "Third Tiles Squares": rawFormData.thirdTileSquares,
                        "Third Modified Squares": rawFormData.thirdModifiedSquares,
                        "Third Coating Squares": rawFormData.thirdCoatingSquares,
                        "Has Additional Charges": rawFormData.additionalCharges,
                        "Additional Charges Description": rawFormData.additionalChargesDescription,
                        "Additional Charges Price": rawFormData.additionalChargesPrice,
                        "Has Solar Panels": rawFormData.solar,
                        "Solar Detach/Reset Cost": rawFormData.solarDetachReset,
                        "Amount Collected": "",  // Optional field
                        "Unforseen Additions": ""  // Optional field
                    }
                };

                console.log('Sending structured form data:', formData);

                return fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    credentials: 'omit',
    redirect: 'follow',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        timestamp: new Date().toISOString(),
        user: 'Khaas01',
        data: formData
    })
}) // <-- Add closing parenthesis here
.then(response => {
    hideLoading();
    if (response.success) {
        // Redirect to review page with file ID
        window.location.href = `review-test.html?id=${response.fileId}`;
    }
    return response;
})
.catch(error => {
    console.error('Error:', error);
    hideLoading();
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
        })
        .catch(error => {
            hideLoading();
            alert(error.message);
            return Promise.reject(error);
        });
}

// Display PDF preview in the iframe
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
// Navigate from Project Type section
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

// Navigate from Roofing Type section
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

// Navigate from Shingle Type section
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

// Navigate from Tile Roofing Type section
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

// Navigate from Secondary Roof section
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

// Navigate from Secondary Roofing Type section
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

// Navigate from Third Roof section
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

// Navigate from Third Roof Style section
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

// Navigate from Additional Charges section
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

// Navigate from Solar section
function nextFromSolar() {
    submitForm()
        .then(() => {
            showReviewSection(); // Change this to call showReviewSection instead of showSection
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again.');
        });
}
// Show loading indicator
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

// Check authentication before form submission
function checkAuthBeforeSubmit() {
    if (!gapi.auth2?.getAuthInstance()?.isSignedIn.get()) {
        return gapi.auth2.getAuthInstance().signIn().then(() => {
            return true;
        }).catch((error) => {
            console.error('Authentication failed:', error);
            throw new Error('Authentication failed. Please try again.');
        });
    }
    return Promise.resolve(true);
}
