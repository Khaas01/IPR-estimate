// Add at the top of your file
const CONFIG = {
  FOLDER_ID: '13M5SRYJLVSspb9A5-KqrNMVdLsemcRaD',    // Folder for PDF storage
  SHEET_ID: '1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw',    // Form Responses sheet
  CC_EMAIL: 'khaas@ironpeakroofing.com',
  MAX_RETRIES: 3
};

function doGet(e) {
  return ContentService.createTextOutput("The web app is working correctly.")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Add retry logic
function retryOperation(operation, maxAttempts = CONFIG.MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      Utilities.sleep(1000 * attempt); // Exponential backoff
    }
  }
}

// Add input validation
function validateData(data) {
  const requiredFields = [
    'salesRepEmail',
    'ownerName',
    'ownerAddress',
    'ownerCity',
    'ownerState',
    'ownerZip'
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Add utility function for logging
function logToSheet(message, type = 'INFO') {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let logSheet = ss.getSheetByName('System Logs');
    
    if (!logSheet) {
      logSheet = ss.insertSheet('System Logs');
      logSheet.appendRow(['Timestamp', 'Type', 'Message']);
    }
    
    logSheet.appendRow([new Date(), type, message]);
  } catch (error) {
    Logger.log('Failed to log to sheet: ' + error.message);
  }
}

// Add success logging
function logSuccess(data, pdfUrls) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName('Logs') || ss.insertSheet('Logs');
  
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow([
      'Timestamp',
      'Sales Rep',
      'Client',
      'PDF URL',
      'Status'
    ]);
  }

  logSheet.appendRow([
    new Date(),
    data.salesRepEmail,
    data.ownerName,
    pdfUrls.viewUrl,
    'Success'
  ]);
}

// Add error email function
function sendErrorEmail(error) {
  try {
    MailApp.sendEmail({
      to: CONFIG.CC_EMAIL,
      subject: 'Error in Roofing Estimate Form',
      body: `An error occurred in the form submission:
      
Error Message: ${error.message}
Stack Trace: ${error.stack}
Timestamp: ${new Date().toISOString()}
      
Please check the Apps Script logs for more details.`
    });
  } catch (emailError) {
    Logger.log('Failed to send error email: ' + emailError.message);
  }
}

function submitForm(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID); // Form Responses sheet
    const sheet = ss.getSheetByName('Form Responses') || ss.getSheets()[0];
    
    if (!sheet) {
      throw new Error('Could not find target sheet');
    }

    Logger.log('Attempting to write to sheet: ' + ss.getName());

    const row = [
      new Date(),  // Timestamp
      data.salesRepEmail,
      data.companyName,
      data.salesRepName,
      data.ownerName,
      data.ownerAddress,
      data.ownerCity,
      data.ownerState,
      data.ownerZip,
      data.ownerPhone,
      data.ownerEmail,
      data.projectType,
      data.insuranceCompany || '',
      data.insurancePhone || '',
      data.claimNumber || '',
      data.policyNumber || '',
      data.dateOfLoss || '',
      data.roofingType || '',
      data.shingleType || '',
      data.shinglesRepaired || '',
      data.shingleReplacement || '',
      data.tileRoofingType || '',
      data.tileRepairSq || '',
      data.tileUnderlaymentSq || '',
      data.tileType || '',
      data.tileRoofRr || '',
      data.modifiedBitumenSq || '',
      data.coatingSquares || '',
      data.secondaryRoof || '',
      data.secondaryRoofingType || '',
      data.thirdRoof || '',
      data.thirdRoofStyle || '',
      data.additionalCharges || '',
      data.additionalChargesDescription || '',
      data.additionalChargesPrice || '',
      data.solar || '',
      data.solarDetachReset || ''
    ];

    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Sales Rep Email',
        'Company Name',
        'Sales Rep Name',
        'Owner Name',
        'Address',
        'City',
        'State',
        'Zip',
        'Phone',
        'Email',
        'Project Type',
        'Insurance Company',
        'Insurance Phone',
        'Claim Number',
        'Policy Number',
        'Date of Loss',
        'Roofing Type',
        'Shingle Type',
        'Shingles Repaired',
        'Shingle Replacement',
        'Tile Roofing Type',
        'Tile Repair Sq',
        'Tile Underlayment Sq',
        'Tile Type',
        'Tile Roof R&R',
        'Modified Bitumen Sq',
        'Coating Squares',
        'Secondary Roof',
        'Secondary Roofing Type',
        'Third Roof',
        'Third Roof Style',
        'Additional Charges',
        'Additional Charges Description',
        'Additional Charges Price',
        'Solar',
        'Solar Detach Reset'
      ];
      sheet.appendRow(headers);
    }

    // Append the data row
    sheet.appendRow(row);
    
    Logger.log(`Form submitted successfully for ${data.ownerName}`);
    
    return true;
  } catch (error) {
    Logger.log('Error in submitForm: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

// Update doPost with improved error handling
function doPost(e) {
  try {
    logToSheet("Starting doPost execution", "INFO");
    
    // Log the raw request data
    logToSheet("Raw request data: " + JSON.stringify(e), "DEBUG");
    
    if (!e || !e.parameter || !e.parameter.data) {
      throw new Error("No data received in request. Parameters: " + JSON.stringify(e && e.parameter));
    }

    let jsonData;
    try {
      jsonData = JSON.parse(e.parameter.data);
      logToSheet("Parsed data: " + JSON.stringify(jsonData), "DEBUG");
    } catch (parseError) {
      throw new Error("Failed to parse JSON data: " + parseError.message);
    }

    // Validate data before proceeding
    validateData(jsonData.data);

    // Try each operation separately with retry logic
    const submissionResult = retryOperation(() => submitForm(jsonData.data));
    logToSheet("Form submitted successfully", "INFO");

    const pdfUrls = retryOperation(() => generateAndSendPDF(jsonData.data));
    logToSheet("PDF generated successfully", "INFO");

    retryOperation(() => sendEmailWithPDF(jsonData.data, pdfUrls));
    logToSheet("Email sent successfully", "INFO");

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully',
      pdfViewUrl: pdfUrls.viewUrl,
      pdfEmbedUrl: pdfUrls.embedUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    const errorMessage = `Error in doPost: ${error.message}\nStack: ${error.stack}`;
    logToSheet(errorMessage, "ERROR");
    sendErrorEmail(error);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message,
      details: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
