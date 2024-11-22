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
    'solar-detach-reset-section'
];

// Helper function to hide all sections
function hideAllSections() {
    document.querySelectorAll('div[id$="Section"]').forEach(section => {
        section.style.display = 'none';
    });
}

function showSection(sectionId) {
    if (!sectionId) return;
    
    // First hide all sections
    hideAllSections();
    
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
        console.error(`Section ${sectionId} not found`);
        return;
    }

    // Show target section
    targetSection.style.display = 'block';
    
    // Update history
    if (sectionHistory[sectionHistory.length - 1] !== sectionId) {
        sectionHistory.push(sectionId);
    }
    
    // Debug log
    console.log('Current section history:', sectionHistory);
}

function goBack() {
    if (sectionHistory.length > 1) {
        // First hide all sections
        hideAllSections();
        
        // Remove current section from history
        sectionHistory.pop();
        
        // Get previous section
        const previousSection = sectionHistory[sectionHistory.length - 1];
        
        // Show the previous section
        const targetSection = document.getElementById(previousSection);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Debug log
        console.log('Went back to:', previousSection);
        console.log('Current section history:', sectionHistory);
    }
}

// Keep all your existing code up to the DOMContentLoaded event listener

document.addEventListener('DOMContentLoaded', function() {
    // Show initial section
    hideAllSections();
    showSection(sectionHistory[0]);

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

    let nextSection;
    switch(selectedShingleType.value) {
        case 'Shingle Roof Repair':
            nextSection = 'shingle-repair-section';
            break;
        case 'Shingle Roof Replacement':
            nextSection = 'shingle-replacement-section';
            break;
        default:
            console.error("Unknown shingle type selected");
            return;
    }

    // Hide all sections first
    hideAllSections();

    // Show and update history for the next section
    const targetSection = document.getElementById(nextSection);
    if (targetSection) {
        targetSection.style.display = 'block';
        if (sectionHistory[sectionHistory.length - 1] !== nextSection) {
            sectionHistory.push(nextSection);
        }
    }

    // Debug logging
    console.log('Navigating to:', nextSection);
    console.log('Current section history:', sectionHistory);
}

    // Make functions available globally
    window.showSection = showSection;
    window.goBack = goBack;
    window.nextProjectTypeSection = nextProjectTypeSection;
    window.navigateFromRoofingType = navigateFromRoofingType;
    window.navigateFromShingleType = navigateFromShingleType;
});
