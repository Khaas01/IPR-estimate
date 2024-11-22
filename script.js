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

function hideAllSections() {
    document.querySelectorAll('div[id$="Section"], div[id$="-section"]').forEach(section => {
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

document.addEventListener('DOMContentLoaded', function() {
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

    // Make functions available globally
    window.showSection = showSection;
    window.goBack = goBack;
    window.nextProjectTypeSection = nextProjectTypeSection;
    window.navigateFromRoofingType = navigateFromRoofingType;
    window.navigateFromShingleType = navigateFromShingleType;
});
