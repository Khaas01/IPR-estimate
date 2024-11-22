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
    console.log(`Navigating to section: ${sectionId}`);
    const sections = document.querySelectorAll('div[id$="Section"]');
    sections.forEach(section => {
        section.style.display = (section.id === sectionId) ? 'block' : 'none';
    });
    if (sectionHistory[sectionHistory.length - 1] !== sectionId) {
        sectionHistory.push(sectionId); // Add the new section to the history stack
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
        const selectedProjectTypeElement = document.querySelector('input[name="projectType"]:checked');
        if (selectedProjectTypeElement) {
            const selectedProjectType = selectedProjectTypeElement.value;
            if (selectedProjectType === 'Cash' || selectedProjectType === 'Finance') {
                showSection('roofingTypeSection');
            } else if (selectedProjectType === 'Insurance') {
                showSection('insuranceInfoSection');
            }
        } else {
            console.error("No project type selected.");
            alert("Please select a project type.");
        }
    }

    function showSection(sectionId) {
        console.log(`Navigating to section: ${sectionId}`);
        const sections = document.querySelectorAll('div[id$="Section"]');
        sections.forEach(section => {
            section.style.display = (section.id === sectionId) ? 'block' : 'none';
        });
    }

    function goBack() {
        sectionHistory.pop(); // Remove the current section
        const previousSection = sectionHistory[sectionHistory.length - 1]; // Get the previous section
        showSection(previousSection); // Show the previous section
    }

    const sectionHistory = ['salesRepSection']; // Initial section

    showSection(sectionHistory[0]); // Show the initial section
});

