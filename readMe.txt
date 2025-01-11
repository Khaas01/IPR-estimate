# Iron Peak Roofing - Estimate Form
Current Version: 62
Last Updated: January 11, 2025

## Project Timeline & Milestones

### Working Versions
1. January 1, 2025 (8:12:01 - 8:12:12)
   - Successful implementation with form submission to Google Sheets
   - PDF generation and preview working
   - Email notifications functioning

### Project Structure

```javascript
project/
├── index.html              // Main form interface
├── script.js               // Core form functionality
├── Code.gs                 // Google Apps Script backend
├── review-test.js         // PDF preview handling
├── server.js              // Node.js server (archived)
├── styles.css             // Form styling
└── service/
    └── config.js          // API configuration
Data Flow Architecture

Frontend to Backend Flow

Form Data Collection (script.js)
JavaScript
const requestData = {
    data: {
        "Timestamp": formData.timestamp,
        "User Login": "Khaas01",
        "Sales Rep Name": formData.salesRepName,
        // ... other fields
    }
};
Data Submission
JavaScript
fetch(API_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
})
Backend Processing (Code.gs)

Form Response Sheet: 1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw
Estimate Sheet: 1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8
PDF Storage Folder: 13M5SRYJLVSspb9A5-KqrNMVdLsemcRaD
Critical Implementation Details

1. Form Data Structure

Must include data wrapper object
Required fields:
Timestamp (ISO format)
User Login (hardcoded as "Khaas01")
All form fields must match Google Sheet headers exactly
2. PDF Generation Process

JavaScript
var exportOptions = {
    format: 'pdf',
    size: 'letter',
    portrait: true,
    scale: 4,
    margins: {
        top: 0.20,
        bottom: 0.20,
        left: 0.20,
        right: 0.20
    }
};
3. Integration Points

Google Sheets

Form Responses sheet for data storage
Database sheet for calculations
Estimate sheet for PDF generation
Google Drive

PDF storage and sharing
Preview generation
Gmail

Automated notifications
PDF attachments
Attempted Solutions & Outcomes

1. Form Submission Methods

A. Direct POST (Failed)

Issue: CORS restrictions
Attempted: December 2024
Outcome: Replaced with no-cors mode
B. Hidden iframe (Successful - Jan 1, 2025)

JavaScript
submitForm.setAttribute('target', 'hidden_iframe');
submitForm.setAttribute('action', GOOGLE_APPS_SCRIPT_URL);
C. Fetch API with structured data (Current)

Implemented: January 2025
Benefits: Better error handling and response processing
2. PDF Preview Solutions

A. Direct Drive Embed (Failed)

Issue: Authentication problems
Attempted: December 2024
B. Preview URL with clean ID (Successful)

JavaScript
const cleanPdfId = pdfId.replace(/["\s–]/g, '').trim();
const previewUrl = `https://drive.google.com/file/d/${cleanPdfId}/preview`;
Known Issues & Workarounds

PDF Generation Delay

Issue: IMPORTRANGE formula delay
Workaround: 5-second sleep before processing
JavaScript
Utilities.sleep(5000); // Wait for IMPORTRANGE
Form Data Validation

Current: Basic required field checks
Planned: Enhanced validation with error messages
Configuration Requirements

1. Google Apps Script

JavaScript
const scriptProperties = PropertiesService.getScriptProperties();
const CLIENT_ID = scriptProperties.getProperty('CLIENT_ID');
const CLIENT_SECRET = scriptProperties.getProperty('CLIENT_SECRET');
2. Frontend Configuration

JavaScript
const API_CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'YOUR_SCRIPT_URL',
    PDF_PREVIEW_DELAY: 3000,
    MAX_RETRY_ATTEMPTS: 3
};
Testing

Automated Tests

review-test.js for PDF preview
testGetLatestPdfId() for PDF ID retrieval
testRowNumbers() for sheet operations
Manual Testing Points

Form submission with all field combinations
PDF generation with various data sets
Email notification delivery
Preview functionality across browsers
Deployment

Current Production Setup

Frontend: GitHub Pages
Backend: Google Apps Script
Data: Google Sheets
Storage: Google Drive
Contact & Support

Developer: Kris Haas
Email: khaas@ironpeakroofing.com
Company: Iron Peak Roofing
ROC #: 355152
Version History

v62 (Current): Enhanced error handling and PDF preview
v61: Updated form structure and validation
v60: Initial working version (Jan 1, 2025)
