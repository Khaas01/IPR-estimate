let currentSection = 'salesRepSection';
const sectionHistory = [currentSection];

const sections = [
    'salesRepSection',
    'companySection',
    'propertyOwnerSection',
    'projectTypeSection',
    'insuranceInfoSection',
    'roofingTypeSection',
    'measureRoofSection',
    'asphalt-shingle-section',
    'shingle-repair-section',
    'shingle-replacement-section',
    'tile-roofing-section',
    'tile-repair-section',
    'tile-underlayment-section',
    'tile-remove-replace-section',
    'tile-roof-rr-section',
    'modified-bitumen-section',
    'coating-section',
    'secondary-roof-section',
    'secondary-roofing-type-section',
    'secondary-roof-type-shingles-section',
    'secondary-roof-type-tile-section',
    'secondary-roof-type-modified-bitumen-section',
    'secondary-roof-type-coating-section',
    'third-roof-type-section',
    'third-roof-type-style-section',
    'third-roof-type-shingles-section',
    'third-roof-type-tiles-section',
    'third-roof-type-modified-section',
    'third-roof-type-coatings-section',
    'additional-charges-section',
    'additional-charges-description-section',
    'additional-charges-price-section',
    'solar-section',
    'solar-detach-reset-section',
    'review-section' 
];

// Helper function to hide all sections
function hideAllSections() {
    document.querySelectorAll('div[id$="Section"], div[id*="-section"]').forEach(section => {
        section.style.display = 'none';
    });
}

function showSection(sectionId) {
    if (!sectionId) return;
    hideAllSections();
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
        console.error(`Section ${sectionId} not found`);
        return;
    }
    targetSection.style.display = 'block';
    if (sectionHistory[sectionHistory.length - 1] !== sectionId) {
        sectionHistory.push(sectionId);
    }
}

function goBack() {
    if (sectionHistory.length > 1) {
        hideAllSections();
        sectionHistory.pop();
        const previousSection = sectionHistory[sectionHistory.length - 1];
        const targetSection = document.getElementById(previousSection);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }
}

// Add the missing navigation functions
function nextProjectTypeSection() {
    const selectedProjectType = document.querySelector('input[name="projectType"]:checked');
    if (!selectedProjectType) {
        alert("Please select a project type.");
        return;
    }
    
    switch(selectedProjectType.value) {
        case 'Cash':
        case 'Finance':
            showSection('measureRoofSection');
            break;
        case 'Insurance':
            showSection('insuranceInfoSection');
            break;
        default:
            console.error("Unknown project type selected");
    }
}

function navigateFromRoofingType() {
    const selectedRoofingType = document.querySelector('input[name="roofingType"]:checked');
    
    if (!selectedRoofingType) {
        alert("Please select a roofing type.");
        return;
    }

    switch(selectedRoofingType.value) {
        case 'Asphalt Shingles':
            showSection('asphalt-shingle-section');
            break;
        case 'Tile':
            showSection('tile-roofing-section');
            break;
        case 'Modified Bitumen (Flat roof rolled roofing)':
            showSection('modified-bitumen-section');
            break;
        case 'Flat Roof Coating':
            showSection('coating-section');
            break;
        default:
            console.error("Unknown roofing type selected");
    }
}

function navigateFromShingleType() {
    const selectedShingleType = document.querySelector('input[name="shingleType"]:checked');
    
    if (!selectedShingleType) {
        alert("Please select a shingle roof type.");
        return;
    }

    switch(selectedShingleType.value) {
        case 'Shingle Roof Repair':
            showSection('shingle-repair-section');
            break;
        case 'Shingle Roof Replacement':
            showSection('shingle-replacement-section');
            break;
        default:
            console.error("Unknown shingle type selected");
    }
}

function navigateFromSecondaryRoof() {
    const selectedOption = document.querySelector('input[name="secondary-roof"]:checked');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    switch(selectedOption.value) {
        case 'Yes':
            showSection('secondary-roofing-type-section');
            break;
        case 'No':
            showSection('additional-charges-section');
            break;
        default:
            console.error("Unknown selection for secondary roof");
    }
}

function navigateFromAdditionalCharges() {
    const selectedOption = document.querySelector('input[name="additional-charges"]:checked');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    switch(selectedOption.value) {
        case 'Yes':
            showSection('additional-charges-description-section');
            break;
        case 'No':
            showSection('solar-section');
            break;
        default:
            console.error("Unknown selection for additional charges");
    }
}
function navigateFromSecondaryRoofingType() {
    const selectedRoofingType = document.querySelector('input[name="secondary-roofing-type"]:checked');
    
    if (!selectedRoofingType) {
        alert("Please select a roofing type.");
        return;
    }

    switch(selectedRoofingType.value) {
        case 'Shingles':
            showSection('secondary-roof-type-shingles-section');
            break;
        case 'Tiles':
            showSection('secondary-roof-type-tile-section');
            break;
        case 'Modified Bitumen':
            showSection('secondary-roof-type-modified-bitumen-section');
            break;
        case 'Coating':
            showSection('secondary-roof-type-coating-section');
            break;
        default:
            console.error("Unknown secondary roofing type selected");
    }
}

function navigateFromTileRoofingType() {
    const selectedTileType = document.querySelector('input[name="tile-roofing-type"]:checked');
    
    if (!selectedTileType) {
        alert("Please select a tile roofing type.");
        return;
    }

    switch(selectedTileType.value) {
        case 'Repair/Partial Roof':
            showSection('tile-repair-section');
            break;
        case 'Underlayment Replacement':
            showSection('tile-underlayment-section');
            break;
        case 'Remove and Replace':
            showSection('tile-remove-replace-section');
            break;
        default:
            console.error("Unknown tile roofing type selected");
    }
}

function navigateFromThirdRoof() {
    const selectedOption = document.querySelector('input[name="third-roof"]:checked');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    switch(selectedOption.value) {
        case 'Yes':
            showSection('third-roof-type-style-section');
            break;
        case 'No':
            showSection('additional-charges-section');
            break;
        default:
            console.error("Unknown selection for third roof");
    }
}

function navigateFromThirdRoofStyle() {
    const selectedRoofingType = document.querySelector('input[name="third-roof-style"]:checked');
    
    if (!selectedRoofingType) {
        alert("Please select a roofing type.");
        return;
    }

    switch(selectedRoofingType.value) {
        case 'Shingles':
            showSection('third-roof-type-shingles-section');
            break;
        case 'Tile':
            showSection('third-roof-type-tiles-section');
            break;
        case 'Modified':
            showSection('third-roof-type-modified-section');
            break;
        case 'Coating':
            showSection('third-roof-type-coatings-section');
            break;
        default:
            console.error("Unknown third roof style selected");
    }
}
function navigateFromSolar() {
    const selectedOption = document.querySelector('input[name="solar"]:checked');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    switch(selectedOption.value) {
        case 'yes':
            showSection('solar-detach-reset-section');
            break;
        case 'no':
            // This should be the final section or next logical section
            showSection('review-section');  // Assuming there's a review section
            break;
        default:
            console.error("Unknown selection for solar panels");
    }
}
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get all form data
    const formData = new FormData(document.getElementById('estimateForm'));
    const formObject = {};
    
    // Convert FormData to a regular object
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    
    // Add timestamp
    formObject.submittedAt = new Date().toISOString();
    
    // You can add validation here if needed
    if (validateForm(formObject)) {
        submitForm(formObject);
    }
}

function validateForm(formData) {
    // Add your validation logic here
    // Example validation:
    if (!formData.salesRepName || !formData.ownerName) {
        alert('Please fill in all required fields');
        return false;
    }
    return true;
}

function submitForm(formData) {
    // Here you would typically send the data to your server
    // For now, let's just log it and show a success message
    console.log('Form submitted:', formData);
    
    // Show success message
    alert('Estimate form submitted successfully!');
    
    // Optional: Reset form
    document.getElementById('estimateForm').reset();
    
    // Return to first section
    showSection('salesRepSection');
}
function displayReview() {
    console.log("displayReview function called"); // Debug log
    const reviewContent = document.getElementById('review-content');
    if (!reviewContent) {
        console.error("review-content element not found");
        return;
    }
    
    let reviewHTML = '<div class="review-summary">';
    
    // Format the current date/time
    const currentDate = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    
    reviewHTML += `
        <div class="review-header">
            <p><strong>Date Created:</strong> ${currentDate}</p>
            <p><strong>Created By:</strong> ${document.getElementById('salesRepName')?.value || 'Not specified'}</p>
        </div>
    `;

    // Collect and display all form data
    const formData = collectFormData();
    Object.entries(formData).forEach(([section, data]) => {
        if (Object.keys(data).length > 0) {
            reviewHTML += `
                <div class="review-section">
                    <h3>${section}</h3>
                    ${Object.entries(data).map(([key, value]) => 
                        `<p><strong>${key}:</strong> ${value || 'Not specified'}</p>`
                    ).join('')}
                </div>
            `;
        }
    });

    reviewHTML += '</div>';
    console.log("Review HTML:", reviewHTML); // Debug log
    reviewContent.innerHTML = reviewHTML;
}

function collectFormData() {
    return {
        "Sales Representative Information": {
            "Name": document.getElementById('salesRepName')?.value,
            "Email": document.getElementById('salesRepEmail')?.value,
            "Phone": document.getElementById('salesRepPhone')?.value
        },
        "Company Information": {
            "Company": document.getElementById('companyName')?.value
        },
        "Property Owner Information": {
            "Name": document.getElementById('ownerName')?.value,
            "Address": document.getElementById('ownerAddress')?.value,
            "City": document.getElementById('ownerCity')?.value,
            "State": document.getElementById('ownerState')?.value,
            "Zip": document.getElementById('ownerZip')?.value,
            "Phone": document.getElementById('ownerPhone')?.value,
            "Email": document.getElementById('ownerEmail')?.value
        },
        "Project Details": {
            "Project Type": document.querySelector('input[name="projectType"]:checked')?.value,
            "Primary Roofing Type": document.querySelector('input[name="roofingType"]:checked')?.value
        },
        "Insurance Information": document.querySelector('input[name="projectType"]:checked')?.value === 'Insurance' ? {
            "Insurance Company": document.getElementById('insuranceCompany')?.value,
            "Insurance Phone": document.getElementById('insurancePhone')?.value,
            "Claim Number": document.getElementById('claimNumber')?.value,
            "Policy Number": document.getElementById('policyNumber')?.value,
            "Date of Loss": document.getElementById('dateOfLoss')?.value
        } : {},
        "Secondary Roof Information": document.querySelector('input[name="secondary-roof"]:checked')?.value === 'Yes' ? {
            "Type": document.querySelector('input[name="secondary-roofing-type"]:checked')?.value
        } : {},
        "Third Roof Information": document.querySelector('input[name="third-roof"]:checked')?.value === 'Yes' ? {
            "Type": document.querySelector('input[name="third-roof-style"]:checked')?.value
        } : {},
        "Solar Panel Information": {
            "Solar Panels Present": document.querySelector('input[name="solar"]:checked')?.value,
            "Number of Panels": document.querySelector('input[name="solar"]:checked')?.value === 'yes' ? 
                document.getElementById('solar-detach-reset')?.value : 'N/A'
        }
    };
}
function submitForm() {
    // You can add form validation here
    const confirmSubmit = confirm('Are you sure you want to submit this estimate?');
    if (confirmSubmit) {
        // Here you would typically send the data to your server
        alert('Estimate submitted successfully!');
        // Optionally reset the form
        document.getElementById('estimateForm').reset();
        // Return to the first section
        showSection('salesRepSection');
    }
}

// In your navigateFromSolar function
function navigateFromSolar() {
    const selectedOption = document.querySelector('input[name="solar"]:checked');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    switch(selectedOption.value) {
        case 'yes':
            showSection('solar-detach-reset-section');
            break;
        case 'no':
            showSection('review-section');
            displayReview(); // Make sure this is called
            break;
        default:
            console.error("Unknown selection for solar panels");
    }
}

// Also update the solar-detach-reset-section navigation
// Make sure the button onclick calls both functions:
// <button type="button" onclick="showSection('review-section'); displayReview();">Next</button>
// Make ALL functions globally available
window.showSection = showSection;
window.goBack = goBack;
window.nextProjectTypeSection = nextProjectTypeSection;
window.navigateFromRoofingType = navigateFromRoofingType;
window.navigateFromShingleType = navigateFromShingleType;
window.navigateFromSecondaryRoof = navigateFromSecondaryRoof;
window.navigateFromAdditionalCharges = navigateFromAdditionalCharges;
window.navigateFromSecondaryRoofingType = navigateFromSecondaryRoofingType;
window.navigateFromTileRoofingType = navigateFromTileRoofingType;
window.navigateFromThirdRoof = navigateFromThirdRoof;
window.navigateFromThirdRoofStyle = navigateFromThirdRoofStyle;
window.navigateFromSolar = navigateFromSolar;
window.handleFormSubmit = handleFormSubmit;
window.submitForm = submitForm;
window.displayReview = displayReview;

const { google } = require('googleapis');
const sheets = google.sheets('v4');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const driveFileUrl = 'https://drive.google.com/uc?export=download&id=1GWYWz_m9tioH0y__3urwUbQQT87USAiR'; // replace YOUR_FILE_ID with the actual file ID
async function downloadServiceAccountFile(url, outputPath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function main() {
  const serviceAccountPath = path.join(__dirname, 'service-account-file.json');

  // Download the service account file
  await downloadServiceAccountFile(driveFileUrl, serviceAccountPath);

  // Authenticate with Google Sheets API
  const auth = await google.auth.getClient({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheetsApi = google.sheets({ version: 'v4', auth });

  // Define the ID of the Google Sheet and the data to be inserted
  const spreadsheetId = '1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw';
  const range = 'Sheet1!A1';
  const valueInputOption = 'RAW';
  const data = [
    ["salesRepSection", "salesRepName", "salesRepEmail", "salesRepPhone", "companySection", "companyName", "propertyOwnerSection", "ownerName", "ownerAddress", "ownerCity", "ownerState", "ownerZip", "ownerPhone", "ownerEmail", "projectTypeSection", "projectType", "insuranceInfoSection", "insuranceCompany", "insurancePhone", "claimNumber", "policyNumber", "dateOfLoss", "roofingTypeSection", "roofingType", "asphalt-shingle-section", "shingleType", "shingle-repair-section", "shingles-repaired", "repair-anything-else", "additional-charges", "shingle-replacement-section", "shingle-replacement", "tile-roofing-section", "tile-roofing-type", "tile-repair-section", "tile-repair-sq", "tile-underlayment-section", "tile-underlayment-sq", "tile-remove-replace-section", "tile-type", "tile-roof-rr", "tile-roof-rr-section", "tile-roof-rr", "modified-bitumen-section", "modified-bitumen-sq", "coating-section", "coating-squares", "secondary-roof-section", "secondary-roof", "secondary-roofing-type-section", "secondary-roofing-type", "secondary-roof-type-shingles-section", "shingles-squares", "secondary-roof-type-tile-section", "tile-underlayment-squares", "secondary-roof-type-modified-bitumen-section", "modified-bitumen-squares", "secondary-roof-type-coating-section", "coating-squares", "third-roof-type-section", "third-roof (third-roof-yes, third-roof-no)", "third-roof-type-style-section", "third-roof-style (third-roof-style-shingles, third-roof-style-tile, third-roof-style-modified, third-roof-style-coating)", "third-roof-type-shingles-section", "shingles-squares", "third-roof-type-tiles-section", "tiles-squares", "third-roof-type-modified-section", "modified-squares", "third-roof-type-coatings-section", "coatings-squares", "additional-charges-section", "additional-charges (additional-charges-yes, additional-charges-no)", "additional-charges-description-section", "additional-charges-description", "additional-charges-price-section", "additional-charges-price", "solar-section", "solar (solar-yes, solar-no)", "solar-detach-reset-section", "solar-detach-reset"]
  ];

  // Prepare the request body
  const resource = {
    values: data
  };

  // Use the Google Sheets API to update the sheet with the prepared data
  try {
    const response = await sheetsApi.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      resource
    });
    console.log(`${response.data.updates.updatedCells} cells updated.`);
  } catch (err) {
    console.error('The API returned an error:', err);
  }
}


main().catch(console.error);
// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    hideAllSections();
    showSection(sectionHistory[0]);
});
