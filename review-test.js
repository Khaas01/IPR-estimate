// Configuration
// Add this constant at the top with your other configuration constants
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7X5KQvZe_M3i30mHZLNOsZX87r_mcqAio48Ik1kztAa7UA6HEKOM9dnIppOiyCF5uWQ/exec';
const API_KEY = 'AIzaSyDFVaRrTxOyR-fX3XAOp1tjoeg58mkj254';
const CLIENT_ID = '900437232674-krleqgjop3u7cl4sggmo20rkmrsl5vh5.apps.googleusercontent.c';
const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
].join(' ');

// Initialize Google APIs
async function initializeGoogleAPIs() {
    try {
        // Wait for the Google API client library to load
        await new Promise((resolve) => gapi.load('client', resolve));

        // Initialize GAPI client with only API key
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [
                'https://sheets.googleapis.com/$discovery/rest?version=v4',
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ]
        });

        console.log('APIs initialized successfully');
        
        // For testing: Generate a sample preview
        generatePreview();
    } catch (error) {
        console.error('API initialization error:', error);
        handleApiError(error);
    }
}

// Generate preview (test function)
function generatePreview() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    // Show loading state
    showLoading();

    // Make request to your Google Apps Script endpoint
    fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.pdfUrl) {
            displayPDFPreview(data.pdfUrl);
        } else {
            throw new Error('No PDF URL received');
        }
    })
    .catch(error => {
        console.error('Preview generation error:', error);
        showError();
    });
}

// Display PDF preview
function displayPDFPreview(pdfUrl) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    console.log('Setting preview URL:', pdfUrl);
    
    // Show loading state
    showLoading();
    
    previewFrame.onload = function() {
        hideLoading();
        console.log('Preview loaded successfully');
    };
    
    previewFrame.onerror = function(error) {
        console.error('Preview failed to load:', error);
        showError();
    };
    
    previewFrame.src = pdfUrl;
}

// Show loading indicator
function showLoading() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        previewFrame.srcdoc = `
            <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="text-align: center;">
                    <div style="margin-bottom: 20px;">Loading preview...</div>
                    <div class="spinner"></div>
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

// Show error message
function showError() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        previewFrame.srcdoc = `
            <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="color: red; text-align: center;">
                    Error loading preview. Please try again.<br>
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">Retry</button>
                </div>
            </body>
            </html>
        `;
    }
}

// Share estimate function
function shareEstimate() {
    // Implement sharing functionality
    alert('Share functionality will be implemented here');
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeGoogleAPIs);
