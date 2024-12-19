// Handle GET requests
function doGet(e) {
  return ContentService.createTextOutput("This web app is working correctly, but requires a POST request for form submissions.")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Handle POST requests from your form
function doPost(e) {
  try {
    const jsonData = JSON.parse(e.parameter.data);
    
    // Log the incoming data for debugging
    Logger.log("Received submission at: " + new Date());
    Logger.log("From user: " + jsonData.userLogin);
    
    // Process the form data
    submitForm(jsonData.data); // Pass the form data to submitForm
    onFormSubmit(e); // Call onFormSubmit for PDF generation and email
    
    return ContentService.createTextOutput("success")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch(error) {
    Logger.log("Error: " + error.message);
    return ContentService.createTextOutput("error:" + error.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Function to submit form data to spreadsheet
function submitForm(data) {
    const sheetId = '16GxQxqyPtp72HL22eTL39lYDiabphjNpmuodhF7pKUs';
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();

    // Prepare the row of data
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
        // Add other fields as needed
    ];

    // Append the row to the sheet
    sheet.appendRow(row);
}

// Function to handle form submission, generate PDF and send email
function onFormSubmit(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var databaseSheet = ss.getSheetByName('Database');
    var lastRow = databaseSheet.getLastRow();
    
    // Get Arizona time and user login
    var arizonaTime = Utilities.formatDate(new Date(), "America/Phoenix", "yyyy-MM-dd HH:mm:ss");
    var currentUser = "Khaas01";
    
    Logger.log('Arizona Time: ' + arizonaTime);
    Logger.log('Current User: ' + currentUser);

    // Get the header row from row 2225
    var headers = databaseSheet.getRange(2225, 1, 1, databaseSheet.getLastColumn()).getValues()[0];
    
    // Function to get column by header
    function getColumnByHeader(headerName) {
      var columnIndex = headers.indexOf(headerName);
      if (columnIndex === -1) {
        throw new Error('Header not found: ' + headerName);
      }
      return columnIndex + 1;
    }

    // Update estimate sheet
    var estimateSheet = ss.getSheetByName('Estimate');
    estimateSheet.getRange('K4').setValue(lastRow);

    // Fetch client details
    var clientName = databaseSheet.getRange(lastRow, getColumnByHeader("Owner Name")).getValue();
    var clientEmail = databaseSheet.getRange(lastRow, getColumnByHeader("Owner Email")).getValue();
    var salesRepName = databaseSheet.getRange(lastRow, getColumnByHeader("Sales Rep Name")).getValue();
    var companyType = databaseSheet.getRange(lastRow, getColumnByHeader("Company Name")).getValue();
    var senderEmail = databaseSheet.getRange(lastRow, getColumnByHeader("Sales Rep Email")).getValue();

    // Set email subject and body
    var subject = clientName + ' - Roofing Estimate';
    var emailBody = 'Dear ' + clientName + ',\n\n' +
                   'Thank you for allowing us the opportunity to assist you with your roofing needs.\n\n' +
                   'Attached is our detailed estimate that addresses the roof repairs as specified. ' +
                   'It includes a breakdown of the repairs and the costs to restore the roof\'s integrity.\n\n' +
                   'If you have any questions or need clarification, please do not hesitate to reach out. My contact information is below. I am here to assist you in any way we can.\n\n' +
                   'We look forward to working with you on this project and ensuring your roofing needs are met with the highest level of quality and service.\n\n' +
                   'Best regards,\n\n' +
                   'Kris Haas\n' +
                   'General Manager\n' +
                   'Iron Peak Roofing\n' +
                   '(602) 698-3840\n' +
                   'www.ironpeakroofing.com\n' +
                   'khaas@ironpeakroofing.com\n' +
                   'ROC # 355152';

    // Generate and save PDF
    var folder = DriveApp.getFolderById('13M5SRYJLVSspb9A5-KqrNMVdLsemcRaD');
    var pdfFileName = clientName + ' - Roofing Estimate';

    // Create PDF export options
    var url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?';
    var exportOptions = {
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

    // Generate PDF
    var fullUrl = url + Object.keys(exportOptions).map(function(key) {
      return key + '=' + exportOptions[key];
    }).join('&');
    
    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(fullUrl, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    // Save PDF and create URLs
    var pdfFile = folder.createFile(response.getBlob().setName(pdfFileName + ".pdf"));
    var pdfId = pdfFile.getId();
    var pdfViewUrl = "https://drive.google.com/file/d/" + pdfId + "/view?usp=drivesdk";
    var pdfEmbedUrl = "https://drive.google.com/file/d/" + pdfId + "/preview";

    // Update review sheet if it exists
    var reviewSheet = ss.getSheetByName('Review');
    if (reviewSheet) {
        reviewSheet.getRange('A1').setValue(pdfEmbedUrl);
    }

    // Send email
    MailApp.sendEmail({
      to: senderEmail,
      cc: 'khaas@ironpeakroofing.com',
      subject: subject,
      body: emailBody,
      attachments: [pdfFile.getAs(MimeType.PDF)]
    });

  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.message);
    MailApp.sendEmail({
      to: 'khaas@ironpeakroofing.com',
      subject: 'Error in onFormSubmit',
      body: 'An error occurred: ' + error.message + 
            '\n\nTimestamp (AZ): ' + arizonaTime + 
            '\nUser: ' + currentUser
    });
  }
}

// Create trigger if needed
function createTrigger() {
  ScriptApp.newTrigger('onFormSubmit')
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onFormSubmit()
      .create();
}
