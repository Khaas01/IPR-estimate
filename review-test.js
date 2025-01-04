// Configuration
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7X5KQvZe_M3i30mHZLNOsZX87r_mcqAio48Ik1kztAa7UA6HEKOM9dnIppOiyCF5uWQ/exec';

// Initialize Google APIs
async function initializeGoogleAPIs() {
    try {
        // No need for OAuth since we're using service account
        console.log('APIs initialized successfully');
        // We'll call generatePreview only when needed, not automatically
    } catch (error) {
        console.error('API initialization error:', error);
        handleApiError(error);
    }
}

// Generate preview
function generatePreview() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    showLoading();

    // Use JSONP to handle the cross-origin request
    const script = document.createElement('script');
    const callbackName = 'handlePreviewResponse_' + Date.now();

    // Define the callback function
    window[callbackName] = function(response) {
        if (response.success && response.pdfUrl) {
            displayPDFPreview(response.pdfUrl);
        } else {
            console.error('Failed to get PDF URL:', response.message);
            showError();
        }
        // Clean up
        document.body.removeChild(script);
        delete window[callbackName];
    };

    // Construct URL with callback
    script.src = `${GOOGLE_APPS_SCRIPT_URL}?callback=${callbackName}`;
    document.body.appendChild(script);
}

// Display PDF preview
function displayPDFPreview(pdfUrl) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    console.log('Setting preview URL:', pdfUrl);
    
    previewFrame.onload = hideLoading;
    previewFrame.onerror = showError;
    
    // Set the src to the Google Drive preview URL
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
                    <button onclick="window.parent.location.reload()" style="margin-top: 20px; padding: 10px 20px;">Retry</button>
                </div>
            </body>
            </html>
        `;
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeGoogleAPIs);

// Add this function to be called when showing the review section
function showReviewSection() {
    document.getElementById('review-section').style.display = 'block';
    generatePreview();
}
