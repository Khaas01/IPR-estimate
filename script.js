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
      button.addEventListener('click', nextProjectTypeSection);
     
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
function navigateToRoofingTypeSection() {
    const selectedRoofingType = document.querySelector('input[name="roofingType"]:checked');
    if (selectedRoofingType) {
        const roofingTypeValue = selectedRoofingType.value;
        console.log(`Selected roofing type: ${roofingTypeValue}`);
        if (roofingTypeValue === 'Asphalt Shingles') {
            showSection('asphalt-shingle-section');
        } else if (roofingTypeValue === 'Tile') {
            showSection('tile-roofing-section');
        } else if (roofingTypeValue === 'Modified Bitumen (Flat roof rolled roofing)') {
            showSection('modified-bitumen-section');
        } else if (roofingTypeValue === 'Flat Roof Coating') {
            showSection('coating-section');
        } else {
            console.error('Unknown roofing type:', roofingTypeValue);
        }
    } else {
        console.error('No roofing type selected');
    }
}


let storedLocation = {};

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(storePosition, showError);
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

function storePosition(position) {
    storedLocation.latitude = position.coords.latitude;
    storedLocation.longitude = position.coords.longitude;
    console.log('Location stored:', storedLocation);
}

function fetchAddressFromCoordinates(latitude, longitude) {
    const geocodingAPI = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    fetch(geocodingAPI)
        .then(response => response.json())
        .then(data => {
            if (data && data.address) {
                const address = `${data.address.house_number} ${data.address.road}, ${data.address.city}, ${data.address.state}, ${data.address.postcode}`;
                document.getElementById('locationStatus').innerHTML = address;
            } else {
                console.error('Unable to fetch address:', data);
            }
        })
        .catch(error => console.error('Error fetching address:', error));
}

function accessStoredLocation() {
    if (storedLocation.latitude && storedLocation.longitude) {
        fetchAddressFromCoordinates(storedLocation.latitude, storedLocation.longitude);
    } else {
        document.getElementById("locationStatus").innerHTML = "Location not available.";
    }
}

document.getElementById('accessLocationButton').addEventListener('click', function() {
    getLocation(); // Ensure location request is triggered
    accessStoredLocation();
});

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.error("An unknown error occurred.");
            break;
    }
}

document.getElementById('estimateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    console.log('Form submitted successfully!', data);
});

showSection(currentSection); // Show the initial section
     });

