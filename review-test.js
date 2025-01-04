// Configuration (though we won't need this anymore)
 const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7X5KQvZe_M3i30mHZLNOsZX87r_mcqAio48Ik1kztAa7UA6HEKOM9dnIppOiyCF5uWQ/exec';

// Function to display estimate based on file ID input
function displayEstimate() {
    const fileIdInput = document.getElementById('fileIdInput');
    if (!fileIdInput) {
        console.error('File ID input not found');
        return;
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

    // Show loading state
    showLoading();

    // Set the iframe properties
    previewFrame.width = '100%';
    previewFrame.height = '600px';
    previewFrame.style.border = 'none';
    previewFrame.style.display = 'block'; // Ensure iframe is visible
    
    // Construct and set the URL
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    console.log('Setting preview URL:', previewUrl);
    previewFrame.src = previewUrl;
}

// Make sure your HTML iframe has these attributes:
// <iframe id="estimatePreviewFrame" 
//         width="100%" 
//         height="600px" 
//         style="border: none; display: block;" 
//         allowfullscreen>
// </iframe>
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
