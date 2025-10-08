// Global variables
let isSubmitting = false;
let sectionHistory = []; // Initialize sectionHistory
let currentEditRow = null;

// Centralized API configuration
const SHEET_ID = "1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw";
const SHEET_NAME = "Form Responses";

const API_CONFIG = {
  GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzzZvXF4NQS1sOHfiYd9gUoYMFoRIfI7i25qVxVylVxVfExG79wFIV8ogj0KEYYkx0R/exec',
  API_KEY: 'AIzaSyDFVaRrTxOyR-fX3XAOp1tjoeg58mkj254',
  CLIENT_ID: '900437232674-krleqgjop3u7cl4sggmo20rkmrsl5vh5.apps.googleusercontent.com',
  REDIRECT_URI: 'https://khaas01.github.io/IPR-estimate/',
  SHEET_ID: SHEET_ID,
  SHEET_NAME: SHEET_NAME,
  API_ENDPOINT: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}`,
  SCOPES: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
  ].join(' ')
};

// ——— IFRAME RESET ———
function resetIframes() {
  const measurementFrame = document.getElementById('measurementToolIframe');
  if (measurementFrame) measurementFrame.src = measurementFrame.src;
  const financeFrame = document.getElementById('financeMarketplaceIframe');
  if (financeFrame) financeFrame.src = financeFrame.src;
}

document.addEventListener('DOMContentLoaded', function () {
  sectionHistory.push('salesRepSection');
  showSection('salesRepSection');
  resetIframes();
});
window.addEventListener('load', resetIframes);

// ——— GOOGLE APIS INIT ———
async function initializeGoogleAPIs() {
  try {
    if (typeof gapi === 'undefined') {
      console.error('Google API client library not loaded');
      return false;
    }
    await new Promise((resolve) => gapi.load('client', resolve));
    await gapi.client.init({
      apiKey: API_CONFIG.API_KEY,
      discoveryDocs: [
        'https://sheets.googleapis.com/$discovery/rest?version=v4',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
      ]
    });
    console.log('APIs initialized successfully');
    return true;
  } catch (error) {
    console.error('API initialization error:', error);
    return false;
  }
}

// ——— MAPS AUTOCOMPLETE ———
function initMap() {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', initMap);
    return;
  }
  const addressInput = document.getElementById('ownerAddress');
  if (!addressInput) {
    console.warn('Address input not found');
    return;
  }
  try {
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry']
    });

    autocomplete.addListener('place_changed', function () {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      let streetNumber = '';
      let streetName = '';

      for (const component of place.address_components) {
        const type = component.types[0];
        switch (type) {
          case 'street_number': streetNumber = component.long_name; break;
          case 'route': streetName = component.long_name; break;
          case 'locality': document.getElementById('ownerCity').value = component.long_name; break;
          case 'administrative_area_level_1': document.getElementById('ownerState').value = component.short_name; break;
          case 'postal_code': document.getElementById('ownerZip').value = component.short_name; break;
        }
      }

      streetName = streetName
        .replace(/^North /i, 'N ').replace(/^South /i, 'S ')
        .replace(/^East /i, 'E ').replace(/^West /i, 'W ')
        .replace(/ North /i, ' N ').replace(/ South /i, ' S ')
        .replace(/ East /i, ' E ').replace(/ West /i, ' W ')
        .replace(/ Street$/i, ' St').replace(/ Avenue$/i, ' Ave')
        .replace(/ Road$/i, ' Rd').replace(/ Boulevard$/i, ' Blvd')
        .replace(/ Lane$/i, ' Ln').replace(/ Drive$/i, ' Dr')
        .replace(/ Court$/i, ' Ct').replace(/ Circle$/i, ' Cir')
        .replace(/ Place$/i, ' Pl').replace(/ Square$/i, ' Sq')
        .replace(/ Parkway$/i, ' Pkwy').replace(/ Highway$/i, ' Hwy')
        .trim();

      document.getElementById('ownerAddress').value = `${streetNumber} ${streetName}`.trim();
    });
  } catch (error) {
    console.error('Failed to initialize Places Autocomplete:', error);
    handleMapError();
  }
}
window.initMap = initMap;

// ——— NAV MENU ———
function toggleMenu() {
  const navMenu = document.querySelector('.nav-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  if (navMenu && menuToggle) {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
    const isExpanded = navMenu.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', isExpanded);
  }
}
document.addEventListener('click', function (event) {
  const navMenu = document.querySelector('.nav-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  if (navMenu && menuToggle) {
    const isClickInside = navMenu.contains(event.target) || menuToggle.contains(event.target);
    if (!isClickInside && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }
});

// ——— PREVIEW HEIGHT ———
function adjustIframeHeight() {
  const container = document.querySelector('.estimate-preview-container');
  const iframe = document.getElementById('estimatePreviewFrame');
  if (!container || !iframe) return;

  container.style.height = 'auto';
  iframe.onload = function () {
    try {
      // Clear any error overlay once the PDF is loaded
      const err1 = document.getElementById('pdf-error-message');
      if (err1) err1.remove();
      const err2 = document.querySelector('.preview-error');
      if (err2) err2.remove();

      const pdfHeight = iframe.contentWindow.document.body.scrollHeight;
      const pdfWidth = iframe.contentWindow.document.body.scrollWidth;
      const aspectRatio = pdfWidth / pdfHeight;
      const maxWidth = Math.min(800, window.innerWidth - 40);
      container.style.width = maxWidth + 'px';
      const height = maxWidth / aspectRatio;
      container.style.height = height + 'px';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
    } catch (e) {
      console.error('Failed to adjust iframe dimensions:', e);
    }
  };
}
window.addEventListener('load', adjustIframeHeight);
window.addEventListener('resize', adjustIframeHeight);

// ——— SECTION NAV ———
document.addEventListener('DOMContentLoaded', async function () {
  sectionHistory.push('salesRepSection');
  showSection('salesRepSection');
});

// unified message listeners (ignore Drive internal)
window.addEventListener('message', function (event) {
  try {
    if (typeof event.data === 'string' && event.data.startsWith('!')) return;
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    if (data.f && data.f.startsWith('apiproxy')) return;

    if (data.success && data.pdfUrl) {
      hideLoading();
      showSection('review-section');
      const fileId = data.fileId || data.pdfUrl.match(/\/d\/(.+?)\/|id=(.+?)(&|$)/)?.[1];
      if (fileId) displayPDF(fileId);
      else { console.error('Could not extract file ID from URL:', data.pdfUrl); showError(); }
    } else if (data.type === 'form_submission') {
      hideLoading();
      console.error('Form submission failed:', data);
      showError();
    }
  } catch (error) {
    if (typeof event.data === 'string' && !event.data.startsWith('!')) {
      console.error('Error processing message:', error);
      hideLoading();
      showError();
    }
  }
});

// Solar radio UI tweaks
const solarRadios = document.querySelectorAll('input[name="solar"]');
const navigationButtons = document.querySelector('#solar-section #navigationButtons');
solarRadios.forEach(radio => {
  radio.addEventListener('change', function () {
    if (!navigationButtons) return;
    navigationButtons.innerHTML = (this.value === 'no')
      ? `<button type="button" onclick="goBack()">Back</button>
         <button type="button" onclick="nextFromSolar()" class="submit-button">Submit</button>`
      : `<button type="button" onclick="goBack()">Back</button>
         <button type="button" onclick="showSection('solar-detach-reset-section')" class="next-button">Next</button>`;
  });
});

function handleMapError() {
  const addressInput = document.getElementById('ownerAddress');
  if (addressInput) {
    addressInput.setAttribute('placeholder', 'Enter address manually');
    addressInput.setAttribute('autocomplete', 'off');
  }
}

// formatting helpers
document.addEventListener('DOMContentLoaded', function () {
  function capitalizeWords(str) {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  const salesRepInput = document.getElementById('salesRepName');
  salesRepInput && salesRepInput.addEventListener('blur', function () { this.value = capitalizeWords(this.value); });
  const ownerNameInput = document.getElementById('ownerName');
  ownerNameInput && ownerNameInput.addEventListener('blur', function () { this.value = capitalizeWords(this.value); });
  const cityInput = document.getElementById('ownerCity');
  cityInput && cityInput.addEventListener('blur', function () { this.value = capitalizeWords(this.value); });
  const stateInput = document.getElementById('ownerState');
  stateInput && stateInput.addEventListener('blur', function () { this.value = this.value.toUpperCase(); });
  const insuranceCompanyInput = document.getElementById('insuranceCompany');
  insuranceCompanyInput && insuranceCompanyInput.addEventListener('blur', function () { this.value = capitalizeWords(this.value); });

  const claimNumberInput = document.getElementById('claimNumber');
  const policyNumberInput = document.getElementById('policyNumber');
  [claimNumberInput, policyNumberInput].forEach(input => {
    if (input) {
      input.addEventListener('blur', function () {
        this.value = this.value.replace(/[^A-Za-z0-9\-_]/g, '');
      });
    }
  });

  const dateOfLossInput = document.getElementById('dateOfLoss');
  if (dateOfLossInput) {
    dateOfLossInput.addEventListener('blur', function () {
      if (this.value) {
        const date = new Date(this.value);
        if (date instanceof Date && !isNaN(date)) {
          const yyyy = date.getFullYear();
          let mm = date.getMonth() + 1;
          let dd = date.getDate();
          if (dd < 10) dd = '0' + dd;
          if (mm < 10) mm = '0' + mm;
          this.value = `${yyyy}-${mm}-${dd}`;
        }
      }
    });
  }
});

// hide/show helpers
function hideAllSections() {
  document.querySelectorAll('div[id$="Section"], div[id*="-section"]').forEach(section => {
    section.style.display = 'none';
  });
}
function showSection(sectionId) {
  hideAllSections();
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
    if (sectionHistory[sectionHistory.length - 1] !== sectionId) sectionHistory.push(sectionId);
    if (sectionId === 'measureRoofSection') {
      const measurementFrame = document.getElementById('measurementToolIframe');
      if (measurementFrame) measurementFrame.src = measurementFrame.src;
    } else if (sectionId === 'financeSection') {
      const financeFrame = document.getElementById('financeMarketplaceIframe');
      if (financeFrame) financeFrame.src = financeFrame.src;
    }
  } else {
    console.error('Target section not found:', sectionId);
  }
}
function showLoading(message = 'Loading...') {
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingMessage = document.getElementById('loading-message');
  if (loadingOverlay && loadingMessage) {
    loadingMessage.textContent = message;
    loadingOverlay.style.display = 'flex';
  }
}
function hideLoading() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) loadingOverlay.style.display = 'none';
}
function goBack() {
  if (sectionHistory.length > 1) {
    hideAllSections();
    sectionHistory.pop();
    const previousSection = sectionHistory[sectionHistory.length - 1];
    const targetSection = document.getElementById(previousSection);
    if (targetSection) targetSection.style.display = 'block';
  }
}

// ——— FORM DATA ———
function collectFormData() {
  // Try to grab a Drive fileId from the preview iframe (if already showing one)
  const frame = document.getElementById('estimatePreviewFrame');
  const src = frame?.src || '';
  const idMatch = typeof src === 'string' ? src.match(/\/d\/([^/]+)/) : null;
  const previewFileId = idMatch ? idMatch[1] : '';

  // Determine which project type is selected
  const projectType = document.querySelector('input[name="projectType"]:checked')?.value || '';

  // Put the preview file id (if any) into the appropriate column
  const estimateId  = projectType === 'Insurance' ? '' : (previewFileId || '');
  const insuranceId = projectType === 'Insurance' ? (previewFileId || '') : '';

  // Read signatures from hidden inputs (Base64 data URLs)
  const customerSig   = document.getElementById('customerSignatureDataUrl')?.value || '';
  const contractorSig = document.getElementById('contractorSignatureDataUrl')?.value || '';

  const formData = {
    // System fields
    "Timestamp": new Date().toISOString(),
    "User Login": "Khaas01",

    // Sales Rep
    "Sales Rep Name": document.getElementById('salesRepName')?.value || '',
    "Sales Rep Email": document.getElementById('salesRepEmail')?.value || '',
    "Sales Rep Phone": document.getElementById('salesRepPhone')?.value || '',
    "Company Name": document.getElementById('companyName')?.value || '',

    // Owner
    "Owner Name": document.getElementById('ownerName')?.value || '',
    "Owner Address": document.getElementById('ownerAddress')?.value || '',
    "Owner City": document.getElementById('ownerCity')?.value || '',
    "Owner State": document.getElementById('ownerState')?.value || '',
    "Owner ZIP": document.getElementById('ownerZip')?.value || '',
    "Owner Phone": document.getElementById('ownerPhone')?.value || '',
    "Owner Email": document.getElementById('ownerEmail')?.value || '',

    // Project
    "Project Type": projectType,

    // Insurance details
    "Insurance Company": document.getElementById('insuranceCompany')?.value || '',
    "Insurance Phone": document.getElementById('insurancePhone')?.value || '',
    "Claim Number": document.getElementById('claimNumber')?.value || '',
    "Policy Number": document.getElementById('policyNumber')?.value || '',
    "Date of Loss": document.getElementById('dateOfLoss')?.value || '',

    // Roofing details
    "Roofing Type": document.querySelector('input[name="roofingType"]:checked')?.value || '',
    "Shingle Type": document.querySelector('input[name="shingleType"]:checked')?.value || '',
    "Shingles Repaired": document.getElementById('shingles-repaired')?.value || '',
    "Additional Repairs": document.getElementById('repair-anything-else')?.value || '',
    "Shingle Replacement Squares": document.getElementById('shingle-replacement')?.value || '',

    // Tile
    "Tile Roofing Type": document.querySelector('input[name="tile-roofing-type"]:checked')?.value || '',
    "Tile Repair Squares": document.getElementById('tile-repair-sq')?.value || '',
    "Tile Underlayment Squares": document.getElementById('tile-underlayment-sq')?.value || '',
    "Tile Type": document.querySelector('input[name="tile-type"]:checked')?.value || '',
    "Tile Remove/Replace Squares": document.getElementById('tile-roof-rr')?.value || '',

    // Flat / coating
    "Modified Bitumen Squares": document.getElementById('modified-bitumen-sq')?.value || '',
    "Coating Squares": document.getElementById('coating-squares')?.value || '',

    // Secondary roof
    "Has Secondary Roof": document.querySelector('input[name="secondary-roof"]:checked')?.value || '',
    "Secondary Roofing Type": document.querySelector('input[name="secondary-roofing-type"]:checked')?.value || '',
    "Secondary Shingles Squares": document.getElementById('shingles-squares')?.value || '',
    "Secondary Tile Underlayment Squares": document.getElementById('tiles-squares')?.value || '',
    "Secondary Modified Bitumen Squares": document.getElementById('modified-bitumen-squares')?.value || '',
    "Secondary Coating Squares": document.getElementById('coating-squares')?.value || '',

    // Third roof
    "Has Third Roof": document.querySelector('input[name="third-roof"]:checked')?.value || '',
    "Third Roof Style": document.querySelector('input[name="third-roof-style"]:checked')?.value || '',
    "Third Shingles Squares": document.getElementById('shingles-squares')?.value || '',
    "Third Tiles Squares": document.getElementById('tiles-squares')?.value || '',
    "Third Modified Squares": document.getElementById('modified-squares')?.value || '',
    "Third Coating Squares": document.getElementById('coatings-squares')?.value || '',

    // Extras
    "Has Additional Charges": document.querySelector('input[name="additional-charges"]:checked')?.value || '',
    "Additional Charges Description": document.getElementById('additional-charges-description')?.value || '',
    "Additional Charges Price": document.getElementById('additional-charges-price')?.value || '',

    // Solar
    "Has Solar Panels": document.querySelector('input[name="solar"]:checked')?.value || '',
    "Solar Detach/Reset Cost": document.getElementById('solar-detach-reset')?.value || '',

    // New: IDs + Signatures
    "Estimate ID": estimateId,
    "Insurance ID": insuranceId,
    "Customer Signature": customerSig,
    "Contractor Signature": contractorSig,

    // Legacy / optional
    "Amount Collected": '',
    "Unforseen Additions": '',
    "PDF_ID": '' // legacy
  };

  return formData;
}

function validateForm(formData) {
  const requiredFields = [
    'salesRepName', 'salesRepEmail', 'salesRepPhone',
    'ownerName', 'ownerAddress', 'ownerCity', 'ownerState', 'ownerZip', 'ownerPhone'
  ];
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].trim() === '') {
      alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      return false;
    }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.salesRepEmail)) { alert('Please enter a valid sales representative email address'); return false; }
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (!phoneRegex.test(formData.salesRepPhone)) { alert('Please enter a valid sales representative phone number'); return false; }
  if (!phoneRegex.test(formData.ownerPhone)) { alert('Please enter a valid property owner phone number'); return false; }
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!formData.ownerZip || !zipRegex.test(formData.ownerZip)) { alert('Please enter a valid ZIP code'); return false; }
  if (!formData.projectType) { alert('Please select a project type'); return false; }

  if (formData.projectType === 'Insurance') {
    const insuranceFields = ['insuranceCompany', 'insurancePhone', 'claimNumber', 'policyNumber', 'dateOfLoss'];
    for (const field of insuranceFields) {
      if (!formData[field] || formData[field].trim() === '') {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
  }
  return true;
}

let currentPdfId = null;

function editForm() {
  const previewFrame = document.getElementById('estimatePreviewFrame');
  if (previewFrame && previewFrame.src) {
    const pdfId = previewFrame.src.match(/\/d\/(.+?)\/preview/)?.[1];
    if (pdfId) currentEditRow = pdfId;
  }
  hideAllSections();
  sectionHistory = ['salesRepSection'];
  const firstSection = document.getElementById('salesRepSection');
  if (firstSection) firstSection.style.display = 'block';
}

function displayPDF(pdfId) {
  const previewFrame = document.getElementById('estimatePreviewFrame');
  if (!(previewFrame && pdfId)) {
    console.error('Preview frame not found or invalid PDF ID');
    hideLoading();
    handlePreviewError();
    return;
  }

  const cleanPdfId = pdfId.replace(/["\s–]/g, '').trim();
  const previewUrl = `https://drive.google.com/file/d/${cleanPdfId}/preview`;

  previewFrame.setAttribute('allowfullscreen', 'true');
  previewFrame.setAttribute('allow', 'autoplay');

  previewFrame.onerror = () => {
    console.error('Failed to load preview frame');
    hideLoading();
    handlePreviewError();
  };

  previewFrame.onload = () => {
    console.log('Preview frame loaded successfully');
    hideLoading();
    const err1 = document.getElementById('pdf-error-message'); if (err1) err1.remove();
    const err2 = document.querySelector('.preview-error'); if (err2) err2.remove();
  };

  // also proactively nuke any visible error block before navigating
  const oldError = previewFrame.parentNode.querySelector('.preview-error');
  if (oldError) oldError.remove();

  if (previewFrame.src !== previewUrl) previewFrame.src = previewUrl;
}

function handlePdfError() {
  const estimatePreviewFrame = document.getElementById('estimatePreviewFrame');
  if (estimatePreviewFrame) {
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: white; padding: 20px; border-radius: 5px; text-align: center; z-index: 1000;
    `;
    errorMessage.innerHTML = 'Unable to load PDF preview. Please try refreshing the page.';
    estimatePreviewFrame.parentNode.appendChild(errorMessage);
  }
}

// Minimal showError: never show the old overlay anymore
function showError() {
  const err1 = document.getElementById('pdf-error-message'); if (err1) err1.remove();
  const err2 = document.querySelector('.preview-error'); if (err2) err2.remove();
}

// ——— SUBMIT ———
function submitForm() {
  if (isSubmitting) return Promise.reject(new Error('Form is already being submitted'));
  try {
    isSubmitting = true;
    showLoading('Creating your estimate, hang on......');

    const formData = collectFormData();

    const submissionData = {
      action: 'submit', // NEW: tells GAS to process a submission
      data: {
        "Timestamp": formData["Timestamp"],
        "User Login": formData["User Login"],
        "Sales Rep Name": formData["Sales Rep Name"],
        "Sales Rep Email": formData["Sales Rep Email"],
        "Sales Rep Phone": formData["Sales Rep Phone"],
        "Company Name": formData["Company Name"],
        "Owner Name": formData["Owner Name"],
        "Owner Address": formData["Owner Address"],
        "Owner City": formData["Owner City"],
        "Owner State": formData["Owner State"],
        "Owner ZIP": formData["Owner ZIP"],
        "Owner Phone": formData["Owner Phone"],
        "Owner Email": formData["Owner Email"],
        "Project Type": formData["Project Type"],
        "Insurance Company": formData["Insurance Company"],
        "Insurance Phone": formData["Insurance Phone"],
        "Claim Number": formData["Claim Number"],
        "Policy Number": formData["Policy Number"],
        "Date of Loss": formData["Date of Loss"],
        "Roofing Type": formData["Roofing Type"],
        "Shingle Type": formData["Shingle Type"],
        "Shingles Repaired": formData["Shingles Repaired"],
        "Additional Repairs": formData["Additional Repairs"],
        "Shingle Replacement Squares": formData["Shingle Replacement Squares"],
        "Tile Roofing Type": formData["Tile Roofing Type"],
        "Tile Repair Squares": formData["Tile Repair Squares"],
        "Tile Underlayment Squares": formData["Tile Underlayment Squares"],
        "Tile Type": formData["Tile Type"],
        "Tile Remove/Replace Squares": formData["Tile Remove/Replace Squares"],
        "Modified Bitumen Squares": formData["Modified Bitumen Squares"],
        "Coating Squares": formData["Coating Squares"],
        "Has Secondary Roof": formData["Has Secondary Roof"],
        "Secondary Roofing Type": formData["Secondary Roofing Type"],
        "Secondary Shingles Squares": formData["Secondary Shingles Squares"],
        "Secondary Tile Underlayment Squares": formData["Secondary Tile Underlayment Squares"],
        "Secondary Modified Bitumen Squares": formData["Secondary Modified Bitumen Squares"],
        "Secondary Coating Squares": formData["Secondary Coating Squares"],
        "Has Third Roof": formData["Has Third Roof"],
        "Third Roof Style": formData["Third Roof Style"],
        "Third Shingles Squares": formData["Third Shingles Squares"],
        "Third Tiles Squares": formData["Third Tiles Squares"],
        "Third Modified Squares": formData["Third Modified Squares"],
        "Third Coating Squares": formData["Third Coating Squares"],
        "Has Additional Charges": formData["Has Additional Charges"],
        "Additional Charges Description": formData["Additional Charges Description"],
        "Additional Charges Price": formData["Additional Charges Price"],
        "Has Solar Panels": formData["Has Solar Panels"],
        "Solar Detach/Reset Cost": formData["Solar Detach/Reset Cost"],
        "Amount Collected": formData["Amount Collected"],
        "Unforseen Additions": formData["Unforseen Additions"],
        "Estimate ID": currentEditRow || "", // GAS will overwrite with new ID(s)
        "Insurance ID": "",
        "Customer Signature": "",
        "Contractor Signature": ""
      },
      editRow: currentEditRow || ""
    };

    console.log('Sending structured form data:', submissionData);

    return fetch(API_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(submissionData)
    })
      .then(response => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 3;
          const delay = 3000;

          const tryGetPdfId = async () => {
            attempts++;
            const pdfId = await getLatestPdfId(); // now auto-picks Estimate vs Insurance
            if (pdfId) {
              showSection('review-section');
              displayPDF(pdfId);
              resolve({ success: true });
            } else if (attempts < maxAttempts) {
              console.log(`Attempt ${attempts} failed, retrying in ${delay / 1000} seconds...`);
              setTimeout(tryGetPdfId, delay);
            } else {
              reject(new Error('Could not retrieve PDF ID after multiple attempts'));
            }
          };
          tryGetPdfId();
        });
      })
      .catch(error => {
        console.error('Form submission error:', error);
        throw error;
      })
      .finally(() => {
        isSubmitting = false;
        hideLoading();
      });
  } catch (error) {
    isSubmitting = false;
    hideLoading();
    return Promise.reject(error);
  }
}

// choose column by radio (Cash → "Estimate ID", Insurance → "Insurance ID")
async function getLatestPdfId() {
  try {
    const url = `${API_CONFIG.API_ENDPOINT}?key=${API_CONFIG.API_KEY}&_=${Date.now()}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.values || data.values.length === 0) return null;

    const headers = data.values[0].map(h => String(h).trim());
    const selectedType = document.querySelector('input[name="projectType"]:checked')?.value;
    const targetHeader = (selectedType === 'Insurance') ? 'insurance id' : 'estimate id';

    let colIdx = headers.findIndex(h => h.toLowerCase() === targetHeader);
    // legacy fallback
    if (colIdx === -1 && selectedType !== 'Insurance') {
      colIdx = headers.findIndex(h => h.toLowerCase() === 'pdf_id');
    }
    if (colIdx === -1) throw new Error(`Column not found: ${targetHeader}`);

    for (let i = data.values.length - 1; i >= 1; i--) {
      const row = data.values[i] || [];
      const val = (row[colIdx] || '').toString().trim();
      if (val) return val;
    }
    return null;
  } catch (err) {
    console.error('Error fetching latest PDF ID:', err);
    return null;
  }
}

async function getDecodedServiceAccountCredentials() {
  try {
    const response = await fetch('service-account-base64.txt');
    if (!response.ok) throw new Error(`Failed to fetch credentials: ${response.status} ${response.statusText}`);
    const base64Content = await response.text();
    const jsonContent = atob(base64Content);
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Service account credentials error:', error);
    throw new Error('Failed to initialize service account credentials');
  }
}

// preview error block creator (kept for completeness)
function handlePreviewError() {
  const previewFrame = document.getElementById('estimatePreviewFrame');
  const errorMessage = document.createElement('div');
  errorMessage.className = 'preview-error';
  errorMessage.innerHTML = `
        <p>Unable to load preview. Please try:</p>
        <ul>
            <li>Refreshing the page</li>
            <li>Checking your internet connection</li>
            <li>Ensuring you have access to this document</li>
        </ul>
    `;
  previewFrame.parentNode.insertBefore(errorMessage, previewFrame);
}

// share button
function shareEstimate() {
  const previewFrame = document.getElementById('estimatePreviewFrame');
  if (previewFrame && previewFrame.src) {
    let previewUrl = previewFrame.src;
    previewUrl = previewUrl.replace('/preview', '/view');
    window.open(previewUrl, '_blank');
  } else {
    console.error('No preview URL found');
    alert('Unable to share at this time. Please try again later.');
  }
}

// project-type routing (unchanged)
function nextProjectTypeSection() {
  const selectedProjectType = document.querySelector('input[name="projectType"]:checked');
  if (!selectedProjectType) { alert("Please select a project type."); return; }
  switch (selectedProjectType.value) {
    case 'Cash':
    case 'Finance':
      showSection('measureRoofSection'); break;
    case 'Insurance':
      showSection('insuranceInfoSection'); break;
    default:
      console.error("Unknown project type selected");
  }
}
function navigateFromRoofingType() {
  const selectedRoofingType = document.querySelector('input[name="roofingType"]:checked');
  if (!selectedRoofingType) { alert("Please select a roofing type."); return; }
  switch (selectedRoofingType.value) {
    case 'Asphalt Shingles': showSection('asphalt-shingle-section'); break;
    case 'Tile': showSection('tile-roofing-section'); break;
    case 'Modified Bitumen (Flat roof rolled roofing)': showSection('modified-bitumen-section'); break;
    case 'Flat Roof Coating': showSection('coating-section'); break;
    default: console.error("Unknown roofing type selected");
  }
}
function navigateFromShingleType() {
  const selectedShingleType = document.querySelector('input[name="shingleType"]:checked');
  if (!selectedShingleType) { alert("Please select a shingle roof type."); return; }
  switch (selectedShingleType.value) {
    case 'Shingle Roof Repair': showSection('shingle-repair-section'); break;
    case 'Shingle Roof Replacement': showSection('shingle-replacement-section'); break;
    default: console.error("Unknown shingle type selected");
  }
}
function navigateFromTileRoofingType() {
  const selectedTileType = document.querySelector('input[name="tile-roofing-type"]:checked');
  if (!selectedTileType) { alert("Please select a tile roofing type."); return; }
  switch (selectedTileType.value) {
    case 'Repair/Partial Roof': showSection('tile-repair-section'); break;
    case 'Underlayment Replacement': showSection('tile-underlayment-section'); break;
    case 'Remove and Replace': showSection('tile-remove-replace-section'); break;
    default: console.error("Unknown tile roofing type selected");
  }
}
function navigateFromSecondaryRoof() {
  const selectedOption = document.querySelector('input[name="secondary-roof"]:checked');
  if (!selectedOption) { alert("Please select Yes or No."); return; }
  switch (selectedOption.value) {
    case 'Yes': showSection('secondary-roofing-type-section'); break;
    case 'No': showSection('additional-charges-section'); break;
    default: console.error("Unknown selection for secondary roof");
  }
}
function navigateFromSecondaryRoofingType() {
  const selectedRoofingType = document.querySelector('input[name="secondary-roofing-type"]:checked');
  if (!selectedRoofingType) { alert("Please select a roofing type."); return; }
  switch (selectedRoofingType.value) {
    case 'Shingles': showSection('secondary-roof-type-shingles-section'); break;
    case 'Tiles': showSection('secondary-roof-type-tile-section'); break;
    case 'Modified Bitumen': showSection('secondary-roof-type-modified-bitumen-section'); break;
    case 'Coating': showSection('secondary-roof-type-coating-section'); break;
    default: console.error("Unknown secondary roofing type selected");
  }
}
function navigateFromThirdRoof() {
  const selectedOption = document.querySelector('input[name="third-roof"]:checked');
  if (!selectedOption) { alert("Please select Yes or No."); return; }
  switch (selectedOption.value) {
    case 'Yes': showSection('third-roof-type-style-section'); break;
    case 'No': showSection('additional-charges-section'); break;
    default: console.error("Unknown selection for third roof");
  }
}
function navigateFromThirdRoofStyle() {
  const selectedRoofingType = document.querySelector('input[name="third-roof-style"]:checked');
  if (!selectedRoofingType) { alert("Please select a roofing type."); return; }
  switch (selectedRoofingType.value) {
    case 'Shingles': showSection('third-roof-type-shingles-section'); break;
    case 'Tile': showSection('third-roof-type-tiles-section'); break;
    case 'Modified': showSection('third-roof-type-modified-section'); break;
    case 'Coating': showSection('third-roof-type-coatings-section'); break;
    default: console.error("Unknown third roof style selected");
  }
}
function navigateFromAdditionalCharges() {
  const selectedOption = document.querySelector('input[name="additional-charges"]:checked');
  if (!selectedOption) { alert("Please select Yes or No."); return; }
  switch (selectedOption.value) {
    case 'Yes': showSection('additional-charges-description-section'); break;
    case 'No': showSection('solar-section'); break;
    default: console.error("Unknown selection for additional charges");
  }
}

function nextFromSolar() {
  const solarValue = document.querySelector('input[name="solar"]:checked')?.value;
  if (!solarValue) { alert("Please select Yes or No."); return; }
  if (solarValue === 'yes') {
    showSection('solar-detach-reset-section');
  } else {
    showSection('review-section');
    submitForm()
      .then(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const pdfId = await getLatestPdfId();
        if (pdfId) displayPDF(pdfId); else throw new Error('No PDF ID found');
      })
      .catch(error => { console.error('Error:', error); showError(); })
      .finally(hideLoading);
  }
}
function nextFromSolarDetachReset() {
  showSection('review-section');
  submitForm()
    .then(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const pdfId = await getLatestPdfId();
      if (pdfId) displayPDF(pdfId); else throw new Error('No PDF ID found');
    })
    .catch(error => { console.error('Error:', error); showError(); })
    .finally(hideLoading);
}
