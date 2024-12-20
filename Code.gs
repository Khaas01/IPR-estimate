// Add at the top of your file
const CONFIG = {
  FOLDER_ID: '13M5SRYJLVSspb9A5-KqrNMVdLsemcRaD',
  SHEET_ID: '16GxQxqyPtp72HL22eTL39lYDiabphjNpmuodhF7pKUs',
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

// Update doPost with improved error handling
function doPost(e) {
  try {
    const jsonData = JSON.parse(e.parameter.data);
    
    Logger.log("Received submission at: " + new Date());
    Logger.log("From user: " + jsonData.userLogin);
    
    // Validate input data
    validateData(jsonData.data);
    
    // Use retry logic for critical operations
    const pdfUrls = retryOperation(() => generateAndSendPDF(jsonData.data));
    retryOperation(() => submitForm(jsonData.data));
    retryOperation(() => sendEmailWithPDF(jsonData.data, pdfUrls));
    
    // Log successful submission
    logSuccess(jsonData.data, pdfUrls);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully',
      pdfViewUrl: pdfUrls.viewUrl,
      pdfEmbedUrl: pdfUrls.embedUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    Logger.log("Error: " + error.message);
    Logger.log("Stack: " + error.stack);
    sendErrorEmail(error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message
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
