// Configuration
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7X5KQvZe_M3i30mHZLNOsZX87r_mcqAio48Ik1kztAa7UA6HEKOM9dnIppOiyCF5uWQ/exec';

// Function to show review section
// In review-test.js
function showReviewSection(fileId) {
    // Show the review section
    const reviewSection = document.getElementById('review-section');
    if (reviewSection) {
        reviewSection.style.display = 'block';
        
        // Get the iframe
        const previewFrame = document.getElementById('estimatePreviewFrame');
        if (previewFrame && fileId) {
            // Set the iframe src with the file ID
            previewFrame.src = `https://drive.google.com/file/${fileId}/preview`;
            console.log('Preview URL set:', previewFrame.src);
        } else {
            console.error('Preview frame not found or no file ID provided');
        }
    } else {
        console.error('Review section not found');
    }
}

// Function to handle form submission response
function handleFormResponse(response) {
    if (response && response.fileId) {
        showReviewSection(response.fileId);
    } else {
        console.error('No file ID in response');
    }
}

// Function to go back
function goBack() {
    window.history.back();
}

// Function to generate preview
function generatePreview() {
    console.log('Generating preview...');
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    showLoading();

    // Make the request to get the PDF URL
    fetch(GOOGLE_APPS_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.pdfUrl) {
                displayPDFPreview(data.pdfUrl);
            } else {
                console.error('Failed to get PDF URL:', data.message);
                showError();
            }
        })
        .catch(error => {
            console.error('Error fetching preview:', error);
            showError();
        });
}

// Function to display PDF preview
function displayPDFPreview(pdfUrl) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    console.log('Setting preview URL:', pdfUrl);
    previewFrame.onload = hideLoading;
    previewFrame.onerror = showError;
    previewFrame.src = pdfUrl;
}

// Function to show loading indicator
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

// Function to hide loading indicator
function hideLoading() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame && previewFrame.srcdoc) {
        previewFrame.srcdoc = '';
    }
}

// Function to show error message
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

// Function to share estimate
function shareEstimate() {
    alert('Share functionality will be implemented');
}

// Function to go back
function goBack() {
    window.history.back();
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    showReviewSection();
    generatePreview();
});
