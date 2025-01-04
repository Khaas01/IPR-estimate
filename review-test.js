// Configuration (though we won't need this anymore)
 const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXqfOtVpNsmkk1U6LsBU1FtmsR_6BK8tcgr00lRFD_LLsAvmWXB0bJVCEPfS9blbVFoQ/exec';

// Function to display estimate based on file ID input
// Add this function to review-test.js
function getPDFUrlFromLog(executionLog) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    // Extract the file ID from the execution log
    // Assuming the log contains the file ID in some format
    const fileId = executionLog.fileId; // Adjust based on your log structure
    
    if (fileId) {
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        console.log('Setting preview URL:', previewUrl);
        previewFrame.src = previewUrl;
    } else {
        showError();
    }
}

// Add this to review-test.js
function handleAppScriptResponse(response) {
    if (response && response.success && response.fileId) {
        getPDFUrlFromLog({fileId: response.fileId});
    } else {
        showError();
    }
}

function displayEstimate(response) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    if (response && response.success) {
        // Use the pdfUrl directly from the response
        console.log('Setting preview URL:', response.pdfUrl);
        previewFrame.src = response.pdfUrl;
    } else {
        showError();
    }
}

// Add this function to handle the form submission response
function handleFormSubmissionResponse(responseText) {
    try {
        const response = JSON.parse(responseText);
        if (response.success) {
            displayEstimate(response);
        } else {
            console.error('Form submission failed:', response.message);
            showError();
        }
    } catch (error) {
        console.error('Error parsing response:', error);
        showError();
    }
}
    const fileId = fileIdInput.value.trim();
    if (!fileId) {
        alert('Please enter a file ID');
        return;
    }

    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    // Directly set the src attribute with the Google Drive URL
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    console.log('Setting preview URL:', previewUrl);
    previewFrame.src = previewUrl;
}

// Function to go back
function goBack() {
    window.history.back();
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
});

// Function to show review section and set up the iframe
function showReviewSection() {
    const reviewSection = document.getElementById('review-section');
    if (reviewSection) {
        reviewSection.style.display = 'block';
    }
}

// Function to go back
function goBack() {
    window.history.back();
}

// Function to share estimate
function shareEstimate() {
    const fileIdInput = document.getElementById('fileIdInput');
    const fileId = fileIdInput.value.trim();
    
    if (fileId) {
        // Implement share functionality here
        alert('Share functionality will be implemented');
    } else {
        alert('Please load an estimate first');
    }
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

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    showReviewSection();
    
    // Add event listener for iframe load
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        previewFrame.onload = hideLoading;
        previewFrame.onerror = showError;
    }
});
