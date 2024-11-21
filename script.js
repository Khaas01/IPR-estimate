let currentSection = 'salesRepSection'; // Set to the ID of the sales rep section

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
    const sections = document.querySelectorAll('div[id$="Section"]');
    sections.forEach(section => {
        section.style.display = (section.id === sectionId) ? 'block' : 'none';
    });
}
document.querySelectorAll('input[name="projectType"]').forEach(input => {
    input.addEventListener('change', function() {
        document.getElementById('nextToRoofing').style.display = (this.value === 'Cash' || this.value === 'Finance') ? 'inline-block' : 'none';
        document.getElementById('nextToInsurance').style.display = (this.value === 'Insurance') ? 'inline-block' : 'none';
    });
});

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
