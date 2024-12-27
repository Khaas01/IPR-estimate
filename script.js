// Part 1: Core Navigation and Section Management

// Constants
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxMZWFLdz1aBHHfB1TP4l_xtpm9zKXEG6QlnhXyMxwhT65O8qg1jXOGwugmAJfW9-zVVw/exec'; // Add your deployment URL here
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
    const navigationButtons = document.querySelector('#solar-section #navigationButtons');
    
    if (!selectedOption) {
        alert("Please select Yes or No.");
        return;
    }

    // Update the buttons based on selection
    if (selectedOption.value === 'yes') {
        // If Yes is selected, show next section normally
        showSection('solar-detach-reset-section');
    } else {
        // If No is selected:
        // 1. First submit the form to populate the Estimate sheet
        submitForm()
            .then(() => {
                // 2. Then show the review section with the populated preview
                showSection('review-section');
                displayReview();
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('There was an error submitting the form. Please try again.');
            });
    }
}

// Update the solar section radio button event listeners
document.addEventListener('DOMContentLoaded', function() {
    const solarRadios = document.querySelectorAll('input[name="solar"]');
    const navigationButtons = document.querySelector('#solar-section #navigationButtons');
    
    solarRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (navigationButtons) {
                if (this.value === 'no') {
                    navigationButtons.innerHTML = `
                        <button type="button" onclick="goBack()">Back</button>
                        <button type="button" onclick="navigateFromSolar()" class="submit-button">Submit</button>
                    `;
                } else {
                    navigationButtons.innerHTML = `
                        <button type="button" onclick="goBack()">Back</button>
                        <button type="button" onclick="navigateFromSolar()" class="next-button">Next</button>
                    `;
                }
            }
        });
    });
});
// Add this new function to handle navigation from solar detach reset section
function nextFromSolar() {
    submitForm()
        .then(() => {
            showSection('review-section');
            displayReview();
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again.');
        });
}
function shareEstimate() {
    // Get the estimate workbook ID
    const estimateSheetId = '1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8';
    
    // Create the sharing URL
    const sharingUrl = `https://docs.google.com/spreadsheets/d/${estimateSheetId}/export?format=pdf`;
    
    // Open email client with pre-filled subject
    const emailSubject = 'Roofing Estimate';
    const emailBody = 'Please find your roofing estimate attached.';
    window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
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

    try {
        // Create all your form data with current timestamp
        const formData = {
            timestamp: new Date().toISOString(),
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
        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', GOOGLE_APPS_SCRIPT_URL);
        form.setAttribute('target', 'hidden_iframe');

        // Create a hidden input for the JSON data
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'data';
        hiddenInput.value = JSON.stringify(formData);
        form.appendChild(hiddenInput);

        // Append the form to the body
        document.body.appendChild(form);

        // Submit the form
        form.submit();

        // Remove the form after submission
        document.body.removeChild(form);

        return Promise.resolve();

    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting form: ' + error.message);
        return Promise.reject(error);
    }
}
function displayReview() {
    // Get the estimate workbook ID
    const estimateSheetId = '1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8';
    
    // Construct the PDF preview URL with the same export options we use for the final PDF
    const exportOptions = {
        format: 'pdf',
        size: 'letter',
        portrait: true,
        fitw: true,
        fith: true,
        scale: 4,
        sheetnames: false,
        printtitle: false,
        pagenumbers: false,
        gridlines: false,
        fzr: true,
        top_margin: 0.20,
        bottom_margin: 0.20,
        left_margin: 0.20,
        right_margin: 0.20,
        horizontal_alignment: 'CENTER',
        vertical_alignment: 'TOP'
    };

    // Build the URL
    const baseUrl = `https://docs.google.com/spreadsheets/d/${estimateSheetId}/export?`;
    const queryString = Object.entries(exportOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    
    // Set the iframe source
    const previewFrame = document.getElementById('estimatePreviewFrame');
    if (previewFrame) {
        previewFrame.src = baseUrl + queryString;
    }
}

// Initialize the form (keep this part)
document.addEventListener('DOMContentLoaded', function() {
    hideAllSections();
    showSection(sectionHistory[0]);
});
