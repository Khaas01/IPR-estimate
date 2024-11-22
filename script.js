let currentSection = 'salesRepSection'; // Set to the ID of the sales rep section
const sectionHistory = [currentSection]; // History stack to keep track of visited sections

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
    'solar-detach-reset-section'
];

function showSection(sectionId) {
    if (!sectionId) return;
    
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
        console.error(`Section ${sectionId} not found`);
        return;
    }

    // Hide all sections
    document.querySelectorAll('div[id$="Section"]').forEach(section => {
        section.style.display = 'none';
    });

    // Show target section
    targetSection.style.display = 'block';
    
    // Update history
    if (sectionHistory[sectionHistory.length - 1] !== sectionId) {
        sectionHistory.push(sectionId);
    }
}

function goBack() {
    sectionHistory.pop(); // Remove the current section
    const previousSection = sectionHistory[sectionHistory.length - 1]; // Get the previous section
    showSection(previousSection); // Show the previous section
}

document.querySelectorAll('input[name="projectType"]').forEach(input => {
    input.addEventListener('change', function() {
        document.getElementById('nextToRoofing').style.display = (this.value === 'Cash' || this.value === 'Finance') ? 'inline-block' : 'none';
        document.getElementById('nextToInsurance').style.display = (this.value === 'Insurance') ? 'inline-block' : 'none';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('nextButton');
    if (button) { // Add a null check to ensure the button exists
        button.addEventListener('click', nextProjectTypeSection);
    } else {
        console.error("No button with ID 'nextButton' found.");
    }

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

 window.nextProjectTypeSection = nextProjectTypeSection;
    window.goBack = goBack;

    // Add the navigateFromRoofingType function
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

    // Make the function available globally
    window.navigateFromRoofingType = navigateFromRoofingType;
    window.goBack = goBack;

});
showSection(sectionHistory[0]); // Show the initial section
