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
    if (previewFrame && pdfId) {
        // Clean up the PDF ID by removing any extra characters
        const cleanPdfId = pdfId.replace(/["\s–]/g, '').trim();
        const previewUrl = `https://drive.google.com/file/d/${cleanPdfId}/preview`;
        
        console.log('Clean PDF ID:', cleanPdfId);
        console.log('Setting preview URL:', previewUrl);
        
        // Set the source and add error handling
        previewFrame.onerror = () => {
            console.error('Failed to load preview frame');
            showError();
        };
        
        previewFrame.onload = () => {
            console.log('Preview frame loaded successfully');
            // Remove loading message if present
            previewFrame.srcdoc = '';
        };

        previewFrame.src = previewUrl;
    } else {
        console.error('Preview frame not found or invalid PDF ID');
        showError();
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
