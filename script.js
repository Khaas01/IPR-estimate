let currentSection = 0;
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
function nextSection() {
    const projectType = document.querySelector('input[name="projectType"]:checked')?.value;
    const selectedCompany = document.getElementById('companyName').value;

    switch (sections[currentSection]) {
       case 'salesRepSection':
            currentSection = sections.indexOf('companySection');
            break; 
        case 'companySection':
            if (selectedCompany === 'Iron Peak Roofing') {
                currentSection = sections.indexOf('propertyOwnerSection');
            } else {
                currentSection = sections.indexOf('someOtherSection'); // Adjust based on your sections
            }
            break;
        case 'propertyOwnerSection':
            currentSection = sections.indexOf('projectTypeSection');
            break;
        case 'projectTypeSection':
            if (projectType === 'Cash' || projectType === 'Finance') {
                currentSection = sections.indexOf('roofingTypeSection');
            } else if (projectType === 'Insurance') {
                currentSection = sections.indexOf('insuranceInfoSection');
            } else {
                currentSection++;
            }
            break;
        default:
            currentSection++;
            break;
    }

    showSection(currentSection);
    scrollToTop();
}

function showSection(index) {
    sections.forEach((sectionId, i) => {
        document.getElementById(sectionId).style.display = (i === index) ? 'block' : 'none';
    });

    document.getElementById('backButton').style.display = (index > 0) ? 'inline-block' : 'none';
    document.getElementById('nextButton').textContent = (index === sections.length - 1) ? 'Submit' : 'Next';

    if (sections[index] === 'measureRoofSection') {
        getLocation();
    }
}

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
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
                document.getElementById('locationStatus').innerHTML = address; // Updating the locationStatus with the address
            } else {
                console.error('Unable to fetch address:', data);
            }
        })
        .catch(error => console.error('Error fetching address:', error));
}

function accessStoredLocation() {
    const locationStatus = document.getElementById("locationStatus");
    if (storedLocation.latitude && storedLocation.longitude) {
        fetchAddressFromCoordinates(storedLocation.latitude, storedLocation.longitude);
    } else {
        locationStatus.innerHTML = "Location not available.";
    }
}

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

document.getElementById('nextButton').addEventListener('click', function() {
    nextSection();
});

document.getElementById('backButton').addEventListener('click', function() {
    if (currentSection > 0) {
        currentSection--;
        showSection(currentSection);
        scrollToTop();
    }
});

document.getElementById('estimateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    console.log('Form submitted successfully!', data);
    // Replace this with your actual form submission logic
});

document.getElementById('accessLocationButton').addEventListener('click', accessStoredLocation);

showSection(currentSection);
