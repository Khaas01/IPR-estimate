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

# IPR Roofing Estimate Form

A web-based form application for generating roofing estimates for Iron Peak Roofing.

## Recent Updates (January 11, 2025)

### Bug Fixes
- Fixed form submission flow in the Solar Detach & Reset section
- Standardized navigation behavior between Solar and Solar Detach & Reset sections
- Resolved multiple submission issues
- Corrected PDF preview loading in review section

### Technical Changes
1. Form Navigation
   - Unified the submission flow across all sections
   - Added `nextFromSolarDetachReset()` function to match `nextFromSolar()` behavior
   - Improved error handling during form submission

2. Data Collection
   - Standardized form data structure for Google Apps Script integration
   - Added proper timestamp handling
   - Maintained consistent user login tracking

### Form Structure
The form follows a sequential flow:
1. Sales Rep Information
2. Company Information
3. Property Owner Information
4. Project Type Selection
5. Roofing Details
6. Solar Panel Information
7. Review and PDF Generation

### Known Dependencies
- Google Apps Script for form processing
- Google Drive API for PDF storage
- Google Sheets API for data storage

## Usage Notes
- Form submissions are processed through Google Apps Script
- PDFs are automatically generated upon successful submission
- Preview functionality requires proper authentication
- Solar panel section has two paths:
  - Direct submission (No solar panels)
  - Detach & Reset details (With solar panels)

## Technical Requirements
- Modern web browser with JavaScript enabled
- Internet connection for API interactions
- Access to Google services

## Version
Current Version: 62 (as of January 11, 2025)

## Contributors
- Primary Maintainer: @Khaas01

## Future Improvements
- Consider implementing form data validation before submission
- Add progress indicator during PDF generation
- Implement better error messaging for failed submissions

## PROJECT PROGRESS LOG
Started: 2025-01-11 23:42:01 UTC
Author: Khaas01

### ENTRY: 2025-01-11 23:42:01 UTC
TYPE: Initial Documentation
STATUS: In Progress

CURRENT ISSUE ADDRESSED:
- Solar Detach & Reset section behavior mismatch with Solar section

IMPLEMENTATION DETAILS:
1. Changed HTML in solar-detach-reset-section:
   - FROM: onclick="submitForm().then(() => showSection('review-section'))"
   - TO: onclick="nextFromSolarDetachReset()"

2. Added new function:
```javascript
function nextFromSolarDetachReset() {
    showSection('review-section');
    submitForm()
        .then(async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const pdfId = await getLatestPdfId();
            if (pdfId) {
                displayPDF(pdfId);
            } else {
                throw new Error('No PDF ID found');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError();
        })
        .finally(() => {
            hideLoading();
        });
}
### ENTRY: 2025-01-12 00:01:07 UTC
TYPE: Code Correction
STATUS: Implemented
AUTHOR: Khaas01

ISSUE ADDRESSED:
- Form submission data structure mismatch between frontend and Google Apps Script
- Only Timestamp and User Login were being recorded in Form Responses sheet

ROOT CAUSE:
1. Data structure inconsistency between collectFormData() and submitForm()
2. Field names not matching exactly with Google Sheet headers
3. Missing explicit data wrapper structure required by Apps Script

IMPLEMENTATION CHANGES:

1. Standardized collectFormData():
   - Changed all field names to match Google Sheet headers exactly
   - Added missing fields identified in header comparison
   - Structured data with exact header names:
   ```javascript
   const formData = {
       "Timestamp": new Date().toISOString(),
       "User Login": "Khaas01",
       "Sales Rep Name": document.getElementById('salesRepName')?.value || '',
       // ... all other fields matching headers exactly
   };
Restructured submitForm():
Created explicit data mapping for every field
Implemented complete header-matching structure:
JavaScript
const submissionData = {
    data: {
        "Timestamp": formData["Timestamp"],
        "User Login": formData["User Login"],
        // ... exact mapping for all fields
    }
};
AFFECTED FILES:

script.js
Modified collectFormData() function
Modified submitForm() function
TESTING PERFORMED:

Verified field name matching with Google Sheet headers
Confirmed data structure matches Apps Script expectations
Validated form submission format
DEPENDENCIES AFFECTED:

Google Apps Script integration
Form submission process
PDF generation workflow
ERROR MESSAGES RESOLVED:

JavaScript
// Previous error in Apps Script logs
"No data received in request"
"Failed to parse form data"
VERIFICATION STEPS:

Form submission should now include all fields
Data structure should match:
JavaScript
{
    data: {
        "Header Exact Name": "value",
        // ... all other fields
    }
}
NEXT STEPS:

Monitor form submissions for complete data transfer
Verify PDF generation with complete data
Test all form paths to ensure data collection
Add validation for required fields
RELATED DOCUMENTATION:

Google Sheet ID: 1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw
Form Responses Sheet Headers documented
Code.gs integration requirements noted
END ENTRY
