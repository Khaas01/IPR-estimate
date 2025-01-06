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
        const previewUrl = `https://drive.google.com/file/d/${pdfId}/preview`;
        previewFrame.src = previewUrl;
        
        // Simple load handler
        previewFrame.onload = () => {
            console.log('Preview loaded successfully');
        };
    }
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
