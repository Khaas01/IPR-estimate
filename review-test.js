// Configuration
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7X5KQvZe_M3i30mHZLNOsZX87r_mcqAio48Ik1kztAa7UA6HEKOM9dnIppOiyCF5uWQ/exec';

// When the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, generating preview...');
    generatePreview();
});

// Generate preview
async function generatePreview() {
    console.log('Generating preview...');
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    showLoading();

    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
        const data = await response.json();
        
        if (data.success && data.pdfUrl) {
            displayPDFPreview(data.pdfUrl);
        } else {
            console.error('Failed to get PDF URL:', data.message);
            showError();
        }
    } catch (error) {
        console.error('Error fetching preview:', error);
        showError();
    }
}

// Rest of the code remains the same...
