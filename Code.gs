// Handle GET requests
function doGet(e) {
  return ContentService.createTextOutput("This web app is working correctly, but requires a POST request for form submissions.")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Handle POST requests
function doPost(e) {
  try {
    const jsonData = JSON.parse(e.parameter.data);
    
    Logger.log("Received submission at: " + new Date());
    Logger.log("From user: " + jsonData.userLogin);
    
    // Process the form data
    submitForm(jsonData.data);
    
    // Generate PDF and get URLs
    const pdfUrls = generateAndSendPDF(jsonData.data);
    
    // Send email with PDF
    sendEmailWithPDF(jsonData.data, pdfUrls);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Form submitted successfully',
      pdfViewUrl: pdfUrls.viewUrl,
      pdfEmbedUrl: pdfUrls.embedUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    Logger.log("Error: " + error.message);
    sendErrorEmail(error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// PDF generation function
function generateAndSendPDF(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const folder = DriveApp.getFolderById('13M5SRYJLVSspb9A5-KqrNMVdLsemcRaD');
  const clientName = data.ownerName;
  const pdfFileName = clientName + ' - Roofing Estimate';
  const estimateSheet = ss.getSheetByName('Estimate');

  const url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?';
  const exportOptions = {
    format: 'pdf',
    size: 'letter',
    portrait: true,
    fitw: true,
    scale: 4,
    sheetnames: false,
    printtitle: false,
    pagenumbers: false,
    gridlines: false,
    fzr: true,
    gid: estimateSheet.getSheetId(),
    top_margin: '0.25',
    bottom_margin: '0.25',
    left_margin: '0.25',
    right_margin: '0.25',
    horizontal_alignment: 'CENTER',
    vertical_alignment: 'TOP',
    scale_to_fit: true
  };

  const fullUrl = url + Object.keys(exportOptions).map(key => 
    `${key}=${exportOptions[key]}`).join('&');
  
  const token = ScriptApp.getOAuthToken();
  const response = UrlFetchApp.fetch(fullUrl, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });

  const pdfFile = folder.createFile(response.getBlob().setName(pdfFileName + ".pdf"));
  const pdfId = pdfFile.getId();
  
  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
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
}

// Form submission function
function submitForm(data) {
  const sheetId = '16GxQxqyPtp72HL22eTL39lYDiabphjNpmuodhF7pKUs';
  const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  const row = [
    new Date(),
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
    // ... (rest of your data fields)
  ];
  sheet.appendRow(row);
}

// Email sending function
function sendEmailWithPDF(data, pdfUrls) {
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
ROC # 355152`;

  const pdfFile = DriveApp.getFileById(pdfUrls.viewUrl.split('/')[5]);
  
  MailApp.sendEmail({
    to: data.salesRepEmail,
    cc: 'khaas@ironpeakroofing.com',
    subject: `${data.ownerName} - Roofing Estimate`,
    body: emailBody,
    attachments: [pdfFile.getAs(MimeType.PDF)]
  });
}

// Error email function
function sendErrorEmail(error) {
  const arizonaTime = Utilities.formatDate(new Date(), "America/Phoenix", "yyyy-MM-dd HH:mm:ss");
  MailApp.sendEmail({
    to: 'khaas@ironpeakroofing.com',
    subject: 'Error in Form Submission',
    body: `An error occurred: ${error.message}
    
Timestamp (AZ): ${arizonaTime}
User: Khaas01`
  });
}

// Create trigger if needed
function createTrigger() {
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();
}
