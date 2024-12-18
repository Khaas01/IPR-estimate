function onFormSubmit(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var databaseSheet = ss.getSheetByName('Database');
    var lastRow = databaseSheet.getLastRow(); // Get the last row (newly added row)
    Logger.log('Last Row: ' + lastRow); // Log the last row number

    // Update cell K4 in the 'Estimate' sheet with the new row number
    var estimateSheet = ss.getSheetByName('Estimate');
    estimateSheet.getRange('K4').setValue(lastRow); // Update K4 with the last row number from the Database

    // Fetch client and other details from the "Database" sheet
    var clientName = databaseSheet.getRange(lastRow, 5).getValue(); // Column E for client name
    var clientEmail = databaseSheet.getRange(lastRow, 11).getValue(); // Column K for client email
    var salesRepName = databaseSheet.getRange(lastRow, 4).getValue(); // Column D for sales rep name
    var companyType = databaseSheet.getRange(lastRow, 3).getValue(); // Column C for company name

    Logger.log('Client Name: ' + clientName);
    Logger.log('Client Email: ' + clientEmail);
    Logger.log('Sales Rep Name: ' + salesRepName);
    Logger.log('Company Type: ' + companyType);

    // Set sender's contact information based on the company type
    var logoSheet = ss.getSheetByName('Logo');
    var phoneNumber, senderEmail;

    // Fetch sender email from the "Database" sheet, Column B
    senderEmail = databaseSheet.getRange(lastRow, 2).getValue(); // Column B for sender's email
    Logger.log('Sender Email: ' + senderEmail);

    // Set the phone number based on the company type
    if (companyType === 'Iron Peak Roofing') {
      phoneNumber = logoSheet.getRange('G2').getValue(); // Phone number for Iron Peak Roofing
    } else {
      // Fallback phone number for other companies
      phoneNumber = logoSheet.getRange('G3').getValue();
    }

    // Set the subject line
    var subject = clientName + ' - Roofing Estimate';

    // Email body with dynamic content
var emailBody = 'Dear ' + clientName + ',\n\n' +
                'Thank you for allowing us the opportunity to assist you with your roofing needs.\n\n' +
                'Attached is our detailed estimate that addresses the roof repairs as specified. ' +
                'It includes a breakdown of the repairs and the costs to restore the roof\'s integrity.\n\n' +
                'If you have any questions or need clarification, please don’t hesitate to reach out. My contact information is below. I am here to assist you in any way we can.\n\n' +
                'We look forward to working with you on this project and ensuring your roofing needs are met with the highest level of quality and service.\n\n' +
                'Best regards,\n\n' +
                'Kris Haas\n' +
                'General Manager\n' +
                'Iron Peak Roofing\n' +
                '(602) 698-3840\n' +
                'www.ironpeakroofing.com\n' +
                'khaas@ironpeakroofing.com\n' +
                'ROC # 355152';

    // Generate PDF from the 'Estimate' sheet
    var folder = DriveApp.getFolderById('1FjTPRhC-1hUMioHZNTN6isYfzy_54c3M'); // Folder to store PDFs
    var pdfFileName = clientName + ' - Roofing Estimate'; // PDF name

    // Construct the URL for exporting the 'Estimate' sheet as PDF
    var url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?';
    var exportOptions = {
      format: 'pdf',
      size: 'letter',
      portrait: true,
      fitw: true,
      scale: 2,
      sheetnames: false,
      printtitle: false,
      pagenumbers: false,
      gridlines: false,
      fzr: false,
      gid: estimateSheet.getSheetId(), // Sheet ID of the 'Estimate' sheet
      top_margin: '0.25',
      bottom_margin: '0.25',
      left_margin: '0.25',
      right_margin: '0.25'
    };

    // Construct the full URL for exporting the sheet as PDF
    var fullUrl = url + Object.keys(exportOptions).map(function(key) {
      return key + '=' + exportOptions[key];
    }).join('&');
    Logger.log('PDF URL: ' + fullUrl); // Log the constructed URL

    // Fetch the PDF using OAuth token
    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(fullUrl, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    // Create the PDF file in the Drive folder
    var pdfFile = folder.createFile(response.getBlob().setName(pdfFileName + ".pdf"));
    Logger.log('PDF created: ' + pdfFile.getUrl());

    // Send the email with the PDF attached to the company
    MailApp.sendEmail({
      to: senderEmail, // Send to the rep's email
      cc: 'khaas@ironpeakroofing.com,',// CC your company email
      subject: subject,
      body: emailBody, // Insert email body template
      attachments: [pdfFile.getAs(MimeType.PDF)] // Attach the PDF file
    });
    
    Logger.log('Email sent to: ' + senderEmail + ' CC: khaas@ironpeakroofing.com with attachment: ' + pdfFile.getUrl());

  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.message);
    // Optionally, send an email to yourself about the error
    MailApp.sendEmail({
      to: 'khaas@ironpeakroofing.com', 
      subject: 'Error in onFormSubmit',
      body: 'An error occurred: ' + error.message
    });
  }
}
