// Simplified JavaScript that works
const SHEET_ID = "1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw";
const SHEET_NAME = "Form Responses";
const API_KEY = 'AIzaSyDFVaRrTxOyR-fX3XAOp1tjoeg58mkj254';
const API_ENDPOINT = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}`;

async function getLatestPdfId() {
    try {
        const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`);
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

function displayPDF(pdfId) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    try {
        // Set up the frame with necessary attributes
        previewFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-top-navigation');
        previewFrame.setAttribute('loading', 'lazy');
        previewFrame.setAttribute('referrerpolicy', 'no-referrer');
        
        // Create the preview URL
        const previewUrl = `https://drive.google.com/file/d/${pdfId}/preview`;
        
        // Set up error handling before changing src
        previewFrame.onerror = (e) => {
            console.error('Frame loading error:', e);
            handlePreviewError();
        };

        previewFrame.onload = () => {
            console.log('Preview loaded successfully');
            // Add a class to indicate successful loading
            previewFrame.classList.add('loaded');
        };

        // Set the source
        previewFrame.src = previewUrl;
    } catch (error) {
        console.error('Error displaying PDF:', error);
        handlePreviewError();
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
