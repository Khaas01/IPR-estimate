function doGet(e) {
  return ContentService.createTextOutput("The web app is working correctly.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function getHeaderRow() {
  try {
    var ss = SpreadsheetApp.openById('1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw');
    var sheet = ss.getSheetByName('Form Responses');
    
    if (!sheet) {
      throw new Error('Database sheet not found');
    }
    
    var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Headers found: ' + headerRow.join(', '));
    
    return headerRow;
    
  } catch (error) {
    Logger.log('Error in getHeaderRow: ' + error.message);
    throw error;
  }
}

function findLastRowWithData(sheet) {
  // Get all data
  var data = sheet.getDataRange().getValues();
  var lastRow = data.length;
  
  // Look for the last row that contains any data
  for (var i = data.length - 1; i >= 0; i--) {
    if (data[i].some(cell => cell !== '' && cell !== null)) {
      lastRow = i + 1;
      break;
    }
  }
  
  Logger.log('Found last row using data scan: ' + lastRow);
  
  // Verify using a known required column (Owner Name)
  var headers = data[0];
  var ownerNameCol = headers.indexOf("Owner Name") + 1;
  if (ownerNameCol > 0) {
    var ownerNameLastRow = sheet.getRange(1, ownerNameCol, sheet.getLastRow())
                               .getValues()
                               .filter(String)
                               .length;
    Logger.log('Found last row using Owner Name column: ' + ownerNameLastRow);
    
    // Use the larger of the two values to be safe
    lastRow = Math.max(lastRow, ownerNameLastRow);
  }
  
  return lastRow;
}

function onFormSubmit(e) {
  try {
    // 1. Initialize both spreadsheets and get specific sheets
    var formWorkbook = SpreadsheetApp.openById('1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw');
    var estimateWorkbook = SpreadsheetApp.openById('1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8');
    
    // Get specific sheets from each workbook
    var formResponseSheet = formWorkbook.getSheetByName('Form Responses');
    var estimateSheet = estimateWorkbook.getSheetByName('Estimate');
    
    Logger.log("Form Workbook name: " + formWorkbook.getName());
    Logger.log("Estimate Workbook name: " + estimateWorkbook.getName());

    if (!formResponseSheet) {
      throw new Error('Form Responses sheet not found in form workbook');
    }
    if (!estimateSheet) {
      throw new Error('Estimate sheet not found in estimate workbook');
    }

    // 2. Get the last row and headers
    var lastRow = findLastRowWithData(formResponseSheet);
    Logger.log('Final determined last row: ' + lastRow);
    
    var headers = formResponseSheet.getRange(1, 1, 1, formResponseSheet.getLastColumn()).getValues()[0];
    
    Logger.log('Last Row: ' + lastRow);
    Logger.log('Headers: ' + headers.join(', '));

    // Rest of your code remains the same...

    // 3. Helper function for finding columns
    function getColumnByHeader(headerName) {
      var index = headers.indexOf(headerName);
      if (index === -1) {
        throw new Error(`Header "${headerName}" not found. Available headers: ${headers.join(', ')}`);
      }
      return index + 1;
    }

    // 4. Update Estimate sheet
    estimateSheet.getRange('K4').setValue(lastRow);

    // 5. Get client information
    var clientName = formResponseSheet.getRange(lastRow, getColumnByHeader("Owner Name")).getValue();
    var clientEmail = formResponseSheet.getRange(lastRow, getColumnByHeader("Owner Email")).getValue();
    var salesRepName = formResponseSheet.getRange(lastRow, getColumnByHeader("Sales Rep Name")).getValue();
    var companyType = formResponseSheet.getRange(lastRow, getColumnByHeader("Company Name")).getValue();
    var senderEmail = 'khaas@ironpeakroofing.com';

    // Log retrieved values
    Logger.log('Retrieved values:');
    Logger.log('Client Name: ' + clientName);
    Logger.log('Client Email: ' + clientEmail);
    Logger.log('Sales Rep Name: ' + salesRepName);
    Logger.log('Company Type: ' + companyType);

    // 6. Email content
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

    // 7. PDF Generation
    var folder = DriveApp.getFolderById('1FjTPRhC-1hUMioHZNTN6isYfzy_54c3M');
    var pdfFileName = clientName + ' - Roofing Estimate';
    
    var url = 'https://docs.google.com/spreadsheets/d/' + estimateWorkbook.getId() + '/export?';
    var exportOptions = {
      format: 'pdf',
      size: 'letter',
      portrait: true,
      fitw: false,     // Changed from true to false
      fith: true,      // Added fit to height
      scale: 1,        // Adjusted scale from 2 to 1 for better fitting
      sheetnames: false,
      printtitle: false,
      pagenumbers: false,
      gridlines: false,
      fzr: false,
      gid: estimateSheet.getSheetId(),
      top_margin: '0.25',
      bottom_margin: '0.25',
      left_margin: '0.25',
      right_margin: '0.25'
    };

    var fullUrl = url + Object.keys(exportOptions).map(function(key) {
      return key + '=' + exportOptions[key];
    }).join('&');
    Logger.log('PDF URL: ' + fullUrl);

    // 8. Generate PDF
    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(fullUrl, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    var pdfFile = folder.createFile(response.getBlob().setName(pdfFileName + ".pdf"));
    Logger.log('PDF created: ' + pdfFile.getUrl());

    // 9. Send email
    MailApp.sendEmail({
      to: senderEmail,
      cc: 'khaas@ironpeakroofing.com',
      subject: subject,
      body: emailBody,
      attachments: [pdfFile.getAs(MimeType.PDF)]
    });
    
    Logger.log('Email sent to: ' + senderEmail + ' CC: khaas@ironpeakroofing.com with attachment: ' + pdfFile.getUrl());

  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.message);
    MailApp.sendEmail({
      to: 'khaas@ironpeakroofing.com', 
      subject: 'Error in onFormSubmit',
      body: 'An error occurred: ' + error.message + '\n\nFull error details:\n' + error.stack
    });
  }
}
