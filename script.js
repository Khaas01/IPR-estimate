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
            showSection('roofingTypeSection');
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
    const reviewContent = document.getElementById('review-content');
    let reviewHTML = '<div class="review-summary">';
    
    // Add timestamp and user info
    const currentDate = new Date().toISOString();
    reviewHTML += `<p><strong>Date Created:</strong> ${currentDate}</p>`;
    
    // Sales Rep Information
    reviewHTML += '<h3>Sales Representative Information</h3>';
    reviewHTML += `<p><strong>Name:</strong> ${document.getElementById('salesRepName').value}</p>`;
    reviewHTML += `<p><strong>Email:</strong> ${document.getElementById('salesRepEmail').value}</p>`;
    reviewHTML += `<p><strong>Phone:</strong> ${document.getElementById('salesRepPhone').value}</p>`;

    // Company Information
    reviewHTML += '<h3>Company Information</h3>';
    reviewHTML += `<p><strong>Company:</strong> ${document.getElementById('companyName').value}</p>`;

    // Property Owner Information
    reviewHTML += '<h3>Property Owner Information</h3>';
    reviewHTML += `<p><strong>Name:</strong> ${document.getElementById('ownerName').value}</p>`;
    reviewHTML += `<p><strong>Address:</strong> ${document.getElementById('ownerAddress').value}</p>`;
    reviewHTML += `<p><strong>City:</strong> ${document.getElementById('ownerCity').value}</p>`;
    reviewHTML += `<p><strong>State:</strong> ${document.getElementById('ownerState').value}</p>`;
    reviewHTML += `<p><strong>Zip:</strong> ${document.getElementById('ownerZip').value}</p>`;
    reviewHTML += `<p><strong>Phone:</strong> ${document.getElementById('ownerPhone').value}</p>`;
    reviewHTML += `<p><strong>Email:</strong> ${document.getElementById('ownerEmail').value}</p>`;

    // Project Type
    const projectType = document.querySelector('input[name="projectType"]:checked');
    if (projectType) {
        reviewHTML += '<h3>Project Type</h3>';
        reviewHTML += `<p><strong>Type:</strong> ${projectType.value}</p>`;
    }

    // Insurance Information (if applicable)
    if (projectType && projectType.value === 'Insurance') {
        reviewHTML += '<h3>Insurance Information</h3>';
        reviewHTML += `<p><strong>Insurance Company:</strong> ${document.getElementById('insuranceCompany').value}</p>`;
        reviewHTML += `<p><strong>Insurance Phone:</strong> ${document.getElementById('insurancePhone').value}</p>`;
        reviewHTML += `<p><strong>Claim Number:</strong> ${document.getElementById('claimNumber').value}</p>`;
        reviewHTML += `<p><strong>Policy Number:</strong> ${document.getElementById('policyNumber').value}</p>`;
        reviewHTML += `<p><strong>Date of Loss:</strong> ${document.getElementById('dateOfLoss').value}</p>`;
    }

    // Roofing Information
    const roofingType = document.querySelector('input[name="roofingType"]:checked');
    if (roofingType) {
        reviewHTML += '<h3>Roofing Information</h3>';
        reviewHTML += `<p><strong>Primary Roofing Type:</strong> ${roofingType.value}</p>`;
    }

    // Secondary Roof Information
    const secondaryRoof = document.querySelector('input[name="secondary-roof"]:checked');
    if (secondaryRoof && secondaryRoof.value === 'Yes') {
        const secondaryRoofType = document.querySelector('input[name="secondary-roofing-type"]:checked');
        if (secondaryRoofType) {
            reviewHTML += '<h3>Secondary Roof Information</h3>';
            reviewHTML += `<p><strong>Secondary Roofing Type:</strong> ${secondaryRoofType.value}</p>`;
        }
    }

    // Third Roof Information
    const thirdRoof = document.querySelector('input[name="third-roof"]:checked');
    if (thirdRoof && thirdRoof.value === 'Yes') {
        const thirdRoofStyle = document.querySelector('input[name="third-roof-style"]:checked');
        if (thirdRoofStyle) {
            reviewHTML += '<h3>Third Roof Information</h3>';
            reviewHTML += `<p><strong>Third Roofing Type:</strong> ${thirdRoofStyle.value}</p>`;
        }
    }

    // Additional Charges
    const additionalCharges = document.querySelector('input[name="additional-charges"]:checked');
    if (additionalCharges && additionalCharges.value === 'Yes') {
        reviewHTML += '<h3>Additional Charges</h3>';
        reviewHTML += `<p><strong>Description:</strong> ${document.getElementById('additional-charges-description').value}</p>`;
        reviewHTML += `<p><strong>Amount:</strong> $${document.getElementById('additional-charges-price').value}</p>`;
    }

    // Solar Information
    const solar = document.querySelector('input[name="solar"]:checked');
    if (solar) {
        reviewHTML += '<h3>Solar Panel Information</h3>';
        reviewHTML += `<p><strong>Solar Panels Present:</strong> ${solar.value}</p>`;
        if (solar.value === 'yes') {
            reviewHTML += `<p><strong>Panels to Remove:</strong> ${document.getElementById('solar-detach-reset').value}</p>`;
        }
    }

    reviewHTML += '</div>';
    reviewContent.innerHTML = reviewHTML;
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

// Modify the navigateFromSolar function to call displayReview
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
            displayReview(); // Add this call
            break;
        default:
            console.error("Unknown selection for solar panels");
    }
}

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

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    hideAllSections();
    showSection(sectionHistory[0]);
});
