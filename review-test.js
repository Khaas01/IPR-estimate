// Simplified JavaScript that works
const SHEET_ID = "1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw";
const SHEET_NAME = "Form Responses";
const API_KEY = 'AIzaSyDFVaRrTxOyR-fX3XAOp1tjoeg58mkj254';
const API_ENDPOINT = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}`;

async function getLatestPdfId() {
    try {
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        };

        const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // ... rest of your existing code
    } catch (error) {
        console.error('Error fetching PDF ID:', error);
        throw error;
    }
}

function displayPDF(pdfId) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame && pdfId) {
        // Add sandbox attributes to prevent additional resource loading
        previewFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
        
        // Remove any existing event listeners
        previewFrame.onload = null;
        previewFrame.onerror = null;
        
        // Clear any existing content
        previewFrame.src = 'about:blank';
        
        // Set up minimal attributes
        previewFrame.setAttribute('loading', 'lazy');
        previewFrame.setAttribute('referrerpolicy', 'no-referrer');
        
        // Small delay before setting the actual URL to ensure clean state
        setTimeout(() => {
            const previewUrl = `https://drive.google.com/file/d/${pdfId}/preview`;
            previewFrame.src = previewUrl;
            
            previewFrame.onload = () => {
                console.log('Preview loaded successfully');
                // Remove any Google-specific scripts that might have been injected
                try {
                    const frame = previewFrame.contentWindow;
                    if (frame) {
                        frame.stop(); // Stop any pending resource loads
                    }
                } catch (e) {
                    // Ignore cross-origin errors
                }
            };
        }, 100);
    }
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

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const pdfId = await getLatestPdfId();
        if (pdfId) {
            displayPDF(pdfId);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
