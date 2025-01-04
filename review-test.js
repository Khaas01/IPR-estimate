// Configuration
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCghxJL8Upfc5GF-6RcZPzQCC1ZAJv12dcShQBeCF5P8ri8Q8bIkihr9pa386mt-qWNA/exec';

// Function to handle the PDF display
function displayEstimate(response) {
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (!previewFrame) {
        console.error('Preview frame not found');
        return;
    }

    showLoading();

    if (response && response.success) {
        if (response.pdfUrl) {
            console.log('Setting preview URL:', response.pdfUrl);
            previewFrame.src = response.pdfUrl;
        } else if (response.fileId) {
            const previewUrl = `https://drive.google.com/file/d/${response.fileId}/preview`;
            console.log('Setting preview URL from fileId:', previewUrl);
            previewFrame.src = previewUrl;
        } else {
            showError();
        }
    } else {
        showError();
    }
}

// Function to handle form submission response
async function handleFormSubmissionResponse(formData) {
    try {
        showLoading();
        console.log('Handling form submission response...');

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Response from Apps Script:', data);

        if (data.success) {
            displayEstimate(data);
        } else {
            console.error('Form submission failed:', data.message);
            showError();
        }
    } catch (error) {
        console.error('Error handling form submission:', error);
        showError();
    } finally {
        hideLoading();
    }
}

// Function to show review section
function showReviewSection() {
    const reviewSection = document.getElementById('review-section');
    if (reviewSection) {
        reviewSection.style.display = 'block';
        // Try to display the latest PDF
        handleFormSubmissionResponse({ action: 'getLatestPDF' });
    }
}

// Function to go back
function goBack() {
    window.history.back();
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
function getLatestPdfFromSheet() {
  // Get the Form Responses sheet
  var sheet = SpreadsheetApp.openById("1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw").getSheetByName("Form Responses");
  
  // Get last row and find PDF_ID column
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var pdfIdColumn = headers.indexOf('PDF_ID') + 1;
  
  // Get the ID from the last row of the PDF_ID column
  var pdfId = sheet.getRange(lastRow, pdfIdColumn).getValue();
  
  return pdfId;
}
// In review-test.js
function loadLatestPDF() {
  showLoading(); // Add a loading indicator if you have one
  
  google.script.run
    .withSuccessHandler(function(result) {
      if (result.success && result.fileId) {
        const previewFrame = document.getElementById('estimatePreviewFrame');
        if (previewFrame) {
          previewFrame.src = result.previewUrl;
          console.log('Loading PDF preview:', result.previewUrl);
        }
      } else {
        console.error('Failed to get PDF ID:', result.message);
        // Handle error - maybe show an error message to user
      }
    })
    .withFailureHandler(function(error) {
      console.error('Error loading PDF:', error);
      // Handle error - maybe show an error message to user
    })
    .getLatestPdfId();
}

// Load PDF when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadLatestPDF();
});

// Optionally, add a refresh button
function addRefreshButton() {
  const refreshButton = document.createElement('button');
  refreshButton.textContent = 'Refresh PDF';
  refreshButton.onclick = loadLatestPDF;
  document.getElementById('review-section').prepend(refreshButton);
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
    
    // Add event listener for iframe load
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        previewFrame.onload = hideLoading;
        previewFrame.onerror = showError;
    }

    // Add form submission handler
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Gather form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => data[key] = value);
            
            // Submit form and handle response
            await handleFormSubmissionResponse({ data: data });
        });
    }
});
