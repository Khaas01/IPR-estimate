// Add at the top of your file
const CONFIG = {
  FOLDER_ID: '13M5SRYJLVSspb9A5-KqrNMVdLsemcRaD',    // Folder for PDF storage
  SHEET_ID: '1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw',    // Form Responses sheet
  CC_EMAIL: 'khaas@ironpeakroofing.com',
  MAX_RETRIES: 3
};

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
    Logger.log("Starting doPost execution");
    Logger.log("Request parameters: " + JSON.stringify(e.parameter));

    if (!e.parameter.data) {
      throw new Error("No data received in request");
    }

    const jsonData = JSON.parse(e.parameter.data);
    Logger.log("Parsed JSON data: " + JSON.stringify(jsonData));

    // Validate the data structure
    if (!jsonData.data) {
      throw new Error("Invalid data structure received");
    }

    Logger.log("Attempting to submit form data");
    const submissionResult = submitForm(jsonData.data);
    Logger.log("Form submission result: " + submissionResult);

    Logger.log("Generating PDF");
    const pdfUrls = generateAndSendPDF(jsonData.data);
    Logger.log("PDF URLs generated: " + JSON.stringify(pdfUrls));

    Logger.log("Sending email");
    sendEmailWithPDF(jsonData.data, pdfUrls);
    Logger.log("Email sent successfully");

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully',
      pdfViewUrl: pdfUrls.viewUrl,
      pdfEmbedUrl: pdfUrls.embedUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    Logger.log("Error in doPost: " + error.message);
    Logger.log("Error stack: " + error.stack);
    sendErrorEmail(error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message,
      details: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
// Update generateAndSendPDF with better error handling
function generateAndSendPDF(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    const clientName = data.ownerName;
    const pdfFileName = `${clientName} - Roofing Estimate - ${new Date().toISOString().split('T')[0]}`;
    const estimateSheet = ss.getSheetByName('Estimate');

    if (!estimateSheet) {
      throw new Error('Estimate sheet not found');
    }

    // Rest of your existing generateAndSendPDF code...
    
    // Add error handling for file creation
    if (!pdfFile) {
      throw new Error('Failed to create PDF file');
    }

    const urls = {
      viewUrl: "https://drive.google.com/file/d/" + pdfId + "/view?usp=drivesdk",
      embedUrl: "https://drive.google.com/file/d/" + pdfId + "/preview"
    };

    // Update review sheet if it exists
    const reviewSheet = ss.getSheetByName('Review');
    if (reviewSheet) {
      reviewSheet.getRange('A1').setValue(urls.embedUrl);
    }

    return urls;
  } catch (error) {
    Logger.log('PDF Generation Error: ' + error.message);
    throw error; // Re-throw to be handled by retry logic
  }
}

// Update sendEmailWithPDF with better error handling
function sendEmailWithPDF(data, pdfUrls) {
  try {
    const pdfId = pdfUrls.viewUrl.split('/')[5];
    const pdfFile = DriveApp.getFileById(pdfId);
    
    if (!pdfFile) {
      throw new Error('PDF file not found');
    }

    const emailBody = `Dear ${data.ownerName},

Thank you for allowing us the opportunity to assist you with your roofing needs.

Attached is our detailed estimate that addresses the roof repairs as specified. It includes a breakdown of the repairs and the costs to restore the roof's integrity.

If you have any questions or need clarification, please do not hesitate to reach out. My contact information is below. I am here to assist you in any way we can.

We look forward to working with you on this project and ensuring your roofing needs are met with the highest level of quality and service.

Best regards,

Kris Haas
General Manager
Iron Peak Roofing
(602) 698-3840
www.ironpeakroofing.com
khaas@ironpeakroofing.com
ROC # 355152

View your estimate online: ${pdfUrls.viewUrl}`;

    MailApp.sendEmail({
      to: data.salesRepEmail,
      cc: CONFIG.CC_EMAIL,
      subject: `${data.ownerName} - Roofing Estimate`,
      body: emailBody,
      attachments: [pdfFile.getAs(MimeType.PDF)]
    });
  } catch (error) {
    Logger.log('Email Sending Error: ' + error.message);
    throw error; // Re-throw to be handled by retry logic
  }
}
