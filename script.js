// Part 1: Core Navigation and Section Management

// Constants
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxGBx27FiRPuEmPxkQxGMMM2AuW7ctVyuRDDSlFNaxqVY5c8s1MIDSjNZD65fiTRBnc/exec'; // Add your deployment URL here
let currentSection = 'salesRepSection';
const sectionHistory = [currentSection];

// Add this near the top of your script.js file
window.addEventListener('message', function(event) {
    if (event.data === 'success') {
        alert('Form submitted successfully!');
        document.getElementById('estimateForm').reset();
        showSection('salesRepSection');
    } else if (event.data.startsWith('error:')) {
        alert('Error submitting form: ' + event.data.substring(6));
    }
});

// List of all sections in order
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

// Core navigation functions
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

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
    hideAllSections();
    showSection(sectionHistory[0]);
});

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

// Part 2: Section-specific Navigation Functions and Metadata Handling

// Metadata handling
const formMetadata = {
    timestamp: '2024-11-25 23:47:09',
    userLogin: 'Khaas01',
    getTimestamp: function() {
        return new Date().toISOString();
    }
};

// Roofing Type Navigation
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

// Shingle Type Navigation
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

// Tile Roofing Navigation
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

// Secondary Roof Navigation
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

// Secondary Roofing Type Navigation
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

// Third Roof Navigation
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

// Third Roof Style Navigation
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

// Additional Charges Navigation
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

// Solar Panel Navigation
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
            displayReview();
            break;
        default:
            console.error("Unknown selection for solar panels");
    }
}

// Add this function before your submitForm function
function validateForm(formData) {
    // Required fields validation
    const requiredFields = [
        'salesRepName',
        'salesRepEmail',
        'salesRepPhone',
        'ownerName',
        'ownerAddress',
        'ownerCity',
        'ownerState',
        'ownerZip',
        'ownerPhone'
    ];

    for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === '') {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return false;
        }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.salesRepEmail)) {
        alert('Please enter a valid sales representative email address');
        return false;
    }

    // Phone number validation
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(formData.salesRepPhone)) {
        alert('Please enter a valid sales representative phone number');
        return false;
    }
    if (!phoneRegex.test(formData.ownerPhone)) {
        alert('Please enter a valid property owner phone number');
        return false;
    }

    // ZIP code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(formData.ownerZip)) {
        alert('Please enter a valid ZIP code');
        return false;
    }

    // Project type validation
    if (!document.querySelector('input[name="projectType"]:checked')) {
        alert('Please select a project type');
        return false;
    }

    // Validate insurance information if project type is Insurance
    if (formData.projectType === 'Insurance') {
        const insuranceFields = [
            'insuranceCompany',
            'insurancePhone',
            'claimNumber',
            'policyNumber',
            'dateOfLoss'
        ];

        for (const field of insuranceFields) {
            if (!formData[field] || formData[field].trim() === '') {
                alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }
    }

    // If all validations pass
    return true;
}

function submitForm(event) {
    if (event) {
        event.preventDefault();
    }

    // First confirm submission
    if (!confirm('Are you sure you want to submit this estimate?')) {
        return;
    }

    try {
        // Create all your form data
        const formData = {
            timestamp: new Date().toISOString(),
            userLogin: 'Khaas01',
            data: {
                // Sales Representative Information
                salesRepName: document.getElementById('salesRepName').value,
                salesRepEmail: document.getElementById('salesRepEmail').value,
                salesRepPhone: document.getElementById('salesRepPhone').value,
                
                // Company Information
                companyName: document.getElementById('companyName').value,
                
                // Property Owner Information
                ownerName: document.getElementById('ownerName').value,
                ownerAddress: document.getElementById('ownerAddress').value,
                ownerCity: document.getElementById('ownerCity').value,
                ownerState: document.getElementById('ownerState').value,
                ownerZip: document.getElementById('ownerZip').value,
                ownerPhone: document.getElementById('ownerPhone').value,
                ownerEmail: document.getElementById('ownerEmail').value,
                
                // Project Type Information
                projectType: document.querySelector('input[name="projectType"]:checked')?.value,
                
                // Insurance Information
                insuranceCompany: document.getElementById('insuranceCompany')?.value,
                insurancePhone: document.getElementById('insurancePhone')?.value,
                claimNumber: document.getElementById('claimNumber')?.value,
                policyNumber: document.getElementById('policyNumber')?.value,
                dateOfLoss: document.getElementById('dateOfLoss')?.value,
                
                // Roofing Type Information
                roofingType: document.querySelector('input[name="roofingType"]:checked')?.value,
                
                // Shingle Information
                shingleType: document.querySelector('input[name="shingleType"]:checked')?.value,
                shinglesRepaired: document.getElementById('shingles-repaired')?.value,
                repairAnythingElse: document.getElementById('repair-anything-else')?.value,
                shingleReplacement: document.getElementById('shingle-replacement')?.value,
                
                // Tile Roofing Information
                tileRoofingType: document.querySelector('input[name="tile-roofing-type"]:checked')?.value,
                tileRepairSq: document.getElementById('tile-repair-sq')?.value,
                tileUnderlaymentSq: document.getElementById('tile-underlayment-sq')?.value,
                tileType: document.querySelector('input[name="tile-type"]:checked')?.value,
                tileRoofRr: document.getElementById('tile-roof-rr')?.value,
                
                // Modified Bitumen Information
                modifiedBitumenSq: document.getElementById('modified-bitumen-sq')?.value,
                
                // Coating Information
                coatingSquares: document.getElementById('coating-squares')?.value,
                
                // Secondary Roof Information
                secondaryRoof: document.querySelector('input[name="secondary-roof"]:checked')?.value,
                secondaryRoofingType: document.querySelector('input[name="secondary-roofing-type"]:checked')?.value,
                secondaryShinglesSquares: document.getElementById('shingles-squares')?.value,
                secondaryTileUnderlaymentSquares: document.getElementById('tile-underlayment-squares')?.value,
                secondaryModifiedBitumenSquares: document.getElementById('modified-bitumen-squares')?.value,
                secondaryCoatingSquares: document.getElementById('coating-squares')?.value,
                
                // Third Roof Information
                thirdRoof: document.querySelector('input[name="third-roof"]:checked')?.value,
                thirdRoofStyle: document.querySelector('input[name="third-roof-style"]:checked')?.value,
                thirdShinglesSquares: document.getElementById('shingles-squares')?.value,
                thirdTilesSquares: document.getElementById('tiles-squares')?.value,
                thirdModifiedSquares: document.getElementById('modified-squares')?.value,
                thirdCoatingsSquares: document.getElementById('coatings-squares')?.value,
                
                // Additional Charges Information
                additionalCharges: document.querySelector('input[name="additional-charges"]:checked')?.value,
                additionalChargesDescription: document.getElementById('additional-charges-description')?.value,
                additionalChargesPrice: document.getElementById('additional-charges-price')?.value,
                
                // Solar Panel Information
                solar: document.querySelector('input[name="solar"]:checked')?.value,
                solarDetachReset: document.getElementById('solar-detach-reset')?.value
            }
        };

    // Validate form before submission
        if (!validateForm(formData.data)) {
            return;
        }

        // Create the form element
        const submitForm = document.createElement('form');
        submitForm.setAttribute('method', 'POST');
        submitForm.setAttribute('action', 'https://script.google.com/macros/s/AKfycbxGBx27FiRPuEmPxkQxGMMM2AuW7ctVyuRDDSlFNaxqVY5c8s1MIDSjNZD65fiTRBnc/exec');
        submitForm.setAttribute('target', 'hidden_iframe');

        // Create a hidden input for the JSON data
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'data';
        hiddenInput.value = JSON.stringify(formData);
        submitForm.appendChild(hiddenInput);

        // Append the form to the body
        document.body.appendChild(submitForm);

        // Submit the form
        submitForm.submit();

        // Remove the form after submission
        document.body.removeChild(submitForm);

    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting form: ' + error.message);
    }
}



function displayReview() {
    const timestamp = '2024-11-25 23:57:07';
    const userLogin = 'Khaas01';

    // Get the review section container
    const reviewSection = document.getElementById('review-section');
    const reviewContent = document.createElement('div');
    reviewContent.className = 'review-content';

    // Create review HTML structure
    let reviewHTML = `
        <h3>Estimate Review</h3>
        <div class="review-metadata">
            <p>Generated on: ${timestamp}</p>
            <p>Generated by: ${userLogin}</p>
        </div>

        <div class="review-section">
            <h4>Sales Representative Information</h4>
            <p>Name: ${document.getElementById('salesRepName')?.value || 'N/A'}</p>
            <p>Email: ${document.getElementById('salesRepEmail')?.value || 'N/A'}</p>
            <p>Phone: ${document.getElementById('salesRepPhone')?.value || 'N/A'}</p>
        </div>

        <div class="review-section">
            <h4>Company Information</h4>
            <p>Company Name: ${document.getElementById('companyName')?.value || 'N/A'}</p>
        </div>

        <div class="review-section">
            <h4>Property Owner Information</h4>
            <p>Name: ${document.getElementById('ownerName')?.value || 'N/A'}</p>
            <p>Address: ${document.getElementById('ownerAddress')?.value || 'N/A'}</p>
            <p>City: ${document.getElementById('ownerCity')?.value || 'N/A'}</p>
            <p>State: ${document.getElementById('ownerState')?.value || 'N/A'}</p>
            <p>ZIP: ${document.getElementById('ownerZip')?.value || 'N/A'}</p>
            <p>Phone: ${document.getElementById('ownerPhone')?.value || 'N/A'}</p>
            <p>Email: ${document.getElementById('ownerEmail')?.value || 'N/A'}</p>
        </div>

        <div class="review-section">
            <h4>Project Information</h4>
            <p>Project Type: ${document.querySelector('input[name="projectType"]:checked')?.value || 'N/A'}</p>
        </div>
    `;

    // Add Insurance Information if applicable
    if (document.querySelector('input[name="projectType"]:checked')?.value === 'Insurance') {
        reviewHTML += `
            <div class="review-section">
                <h4>Insurance Information</h4>
                <p>Insurance Company: ${document.getElementById('insuranceCompany')?.value || 'N/A'}</p>
                <p>Insurance Phone: ${document.getElementById('insurancePhone')?.value || 'N/A'}</p>
                <p>Claim Number: ${document.getElementById('claimNumber')?.value || 'N/A'}</p>
                <p>Policy Number: ${document.getElementById('policyNumber')?.value || 'N/A'}</p>
                <p>Date of Loss: ${document.getElementById('dateOfLoss')?.value || 'N/A'}</p>
            </div>
        `;
    }

    // Add Roofing Type Information
    const roofingType = document.querySelector('input[name="roofingType"]:checked')?.value;
    if (roofingType) {
        reviewHTML += `
            <div class="review-section">
                <h4>Primary Roof Information</h4>
                <p>Roofing Type: ${roofingType}</p>
        `;

        // Add specific roofing type details
        switch (roofingType) {
            case 'Asphalt Shingles':
                const shingleType = document.querySelector('input[name="shingleType"]:checked')?.value;
                if (shingleType === 'Shingle Roof Repair') {
                    reviewHTML += `
                        <p>Repair Type: Shingle Roof Repair</p>
                        <p>Shingles Repaired: ${document.getElementById('shingles-repaired')?.value || 'N/A'}</p>
                        <p>Additional Repairs: ${document.getElementById('repair-anything-else')?.value || 'N/A'}</p>
                    `;
                } else if (shingleType === 'Shingle Roof Replacement') {
                    reviewHTML += `
                        <p>Replacement Squares: ${document.getElementById('shingle-replacement')?.value || 'N/A'}</p>
                    `;
                }
                break;

            case 'Tile':
                const tileType = document.querySelector('input[name="tile-roofing-type"]:checked')?.value;
                reviewHTML += `
                    <p>Tile Roofing Type: ${tileType || 'N/A'}</p>
                    <p>Repair Squares: ${document.getElementById('tile-repair-sq')?.value || 'N/A'}</p>
                    <p>Underlayment Squares: ${document.getElementById('tile-underlayment-sq')?.value || 'N/A'}</p>
                    <p>Tile Type: ${document.querySelector('input[name="tile-type"]:checked')?.value || 'N/A'}</p>
                    <p>Remove and Replace Squares: ${document.getElementById('tile-roof-rr')?.value || 'N/A'}</p>
                `;
                break;

            case 'Modified Bitumen (Flat roof rolled roofing)':
                reviewHTML += `
                    <p>Modified Bitumen Squares: ${document.getElementById('modified-bitumen-sq')?.value || 'N/A'}</p>
                `;
                break;

            case 'Flat Roof Coating':
                reviewHTML += `
                    <p>Coating Squares: ${document.getElementById('coating-squares')?.value || 'N/A'}</p>
                `;
                break;
        }
        reviewHTML += '</div>';
    }

    // Add Secondary Roof Information
    const hasSecondaryRoof = document.querySelector('input[name="secondary-roof"]:checked')?.value;
    if (hasSecondaryRoof === 'Yes') {
        const secondaryRoofType = document.querySelector('input[name="secondary-roofing-type"]:checked')?.value;
        reviewHTML += `
            <div class="review-section">
                <h4>Secondary Roof Information</h4>
                <p>Roofing Type: ${secondaryRoofType || 'N/A'}</p>
        `;

        switch (secondaryRoofType) {
            case 'Shingles':
                reviewHTML += `
                    <p>Shingles Squares: ${document.getElementById('shingles-squares')?.value || 'N/A'}</p>
                `;
                break;
            case 'Tiles':
                reviewHTML += `
                    <p>Tile Underlayment Squares: ${document.getElementById('tile-underlayment-squares')?.value || 'N/A'}</p>
                `;
                break;
            case 'Modified Bitumen':
                reviewHTML += `
                    <p>Modified Bitumen Squares: ${document.getElementById('modified-bitumen-squares')?.value || 'N/A'}</p>
                `;
                break;
            case 'Coating':
                reviewHTML += `
                    <p>Coating Squares: ${document.getElementById('coating-squares')?.value || 'N/A'}</p>
                `;
                break;
        }
        reviewHTML += '</div>';
    }

    // Add Third Roof Information
    const hasThirdRoof = document.querySelector('input[name="third-roof"]:checked')?.value;
    if (hasThirdRoof === 'Yes') {
        const thirdRoofStyle = document.querySelector('input[name="third-roof-style"]:checked')?.value;
        reviewHTML += `
            <div class="review-section">
                <h4>Third Roof Information</h4>
                <p>Roofing Type: ${thirdRoofStyle || 'N/A'}</p>
        `;

        switch (thirdRoofStyle) {
            case 'Shingles':
                reviewHTML += `
                    <p>Shingles Squares: ${document.getElementById('shingles-squares')?.value || 'N/A'}</p>
                `;
                break;
            case 'Tile':
                reviewHTML += `
                    <p>Tiles Squares: ${document.getElementById('tiles-squares')?.value || 'N/A'}</p>
                `;
                break;
            case 'Modified':
                reviewHTML += `
                    <p>Modified Squares: ${document.getElementById('modified-squares')?.value || 'N/A'}</p>
                `;
                break;
            case 'Coating':
                reviewHTML += `
                    <p>Coating Squares: ${document.getElementById('coatings-squares')?.value || 'N/A'}</p>
                `;
                break;
        }
        reviewHTML += '</div>';
    }

    // Add Additional Charges Information
    const hasAdditionalCharges = document.querySelector('input[name="additional-charges"]:checked')?.value;
    if (hasAdditionalCharges === 'Yes') {
        reviewHTML += `
            <div class="review-section">
                <h4>Additional Charges</h4>
                <p>Description: ${document.getElementById('additional-charges-description')?.value || 'N/A'}</p>
                <p>Price: $${document.getElementById('additional-charges-price')?.value || 'N/A'}</p>
            </div>
        `;
    }

    // Add Solar Panel Information
    const hasSolar = document.querySelector('input[name="solar"]:checked')?.value;
    if (hasSolar === 'yes') {
        reviewHTML += `
            <div class="review-section">
                <h4>Solar Panel Information</h4>
                <p>Solar Detach/Reset Cost: $${document.getElementById('solar-detach-reset')?.value || 'N/A'}</p>
            </div>
        `;
    }

 // Add submission buttons
reviewHTML += `
    <div id="navigationButtons">
        <button type="button" id="backButton" onclick="goBack()">Back</button>
        <button type="button" onclick="submitForm()">Submit</button>
    </div>
`;
    // Update the review section content
    reviewContent.innerHTML = reviewHTML;
    
    // Clear existing content and append new review
    reviewSection.innerHTML = '';
    reviewSection.appendChild(reviewContent);
}
// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    hideAllSections();
    showSection(sectionHistory[0]);
});
