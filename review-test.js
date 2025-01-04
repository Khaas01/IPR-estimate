// Configuration
// Configuration
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLGhLt_NP4a3jYi-SxErs2-e6IqWdA_Jz-6hQQBSEwx_ahm4zuPaxdv148sHmpmfl98A/exec';
const SHEET_ID = "1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw";
const SHEET_NAME = "Form Responses";

// Function to display PDF in iframe
// Function to display PDF in iframe
function displayPDF(pdfId) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame && pdfId) {
        const previewUrl = `https://drive.google.com/file/${pdfId}/preview`;
        console.log('Setting preview URL:', previewUrl);
        previewFrame.src = previewUrl;
    } else {
        console.error('Preview frame not found or invalid PDF ID');
        showError();
    }
}

// Function to show loading state
function showLoading() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        previewFrame.srcdoc = `
            <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="text-align: center;">Loading preview...</div>
            </body>
            </html>
        `;
    }
}

// Function to show error
function showError() {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        previewFrame.srcdoc = `
            <html>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="color: red; text-align: center;">
                    Error loading preview. Please try again.
                </div>
            </body>
            </html>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // First check if we already have an ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const pdfId = urlParams.get('id');
    
    if (pdfId) {
        // If we have an ID, display the PDF
        const previewFrame = document.getElementById('estimatePreviewFrame');
        if (previewFrame) {
            previewFrame.src = `https://drive.google.com/file/${pdfId}/preview`;
        }
    } else {
        // If we don't have an ID, redirect to the Apps Script
        window.location.href = 'https://script.google.com/macros/s/AKfycbyL6ioIoHwW9ydFNN8fD-Dfmospk11aWB-U8kgsKRpli_sdQ-AYt6gMBQsvquden91JsQ/exec';
    }
});
// Function to get latest PDF ID and display it
async function loadLatestPDF() {
    try {
        showLoading();

        // Make GET request to your Google Apps Script endpoint
        const response = await fetch(`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?sheetId=${SHEET_ID}&sheetName=${SHEET_NAME}`);
        const data = await response.json();

        if (data.success && data.pdfId) {
            displayPDF(data.pdfId);
        } else {
            showError();
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
        showError();
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, fetching latest PDF...');
    loadLatestPDF();
});
