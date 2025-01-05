const SHEET_ID = "1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw";
const SHEET_NAME = "Form Responses";
const API_KEY = 'AIzaSyDFVaRrTxOyR-fX3XAOp1tjoeg58mkj254';
const API_ENDPOINT = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}`;

// Function to get the PDF ID directly from Google Sheets
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

// Function to display the PDF
// Function to display the PDF
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

// Rest of your code remains the same...
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

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Page loaded, fetching latest PDF...');
    showLoading();
    
    try {
        const pdfId = await getLatestPdfId();
        console.log('Retrieved PDF ID:', pdfId); // Debug log
        
        if (pdfId) {
            displayPDF(pdfId);
        } else {
            throw new Error('Could not retrieve PDF ID');
        }
    } catch (error) {
        console.error('Error:', error);
        showError();
    }
});
