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
  // 1. First, get the correct sheet
  var workbook = SpreadsheetApp.openById('1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8'); // Your IPR- WebApp Sheets workbook
  var databaseSheet = workbook.getSheetByName('Database');
  
  Logger.log('Checking Database sheet last row...');
  
  // 2. Get the actual last row from Database sheet
  var lastRow = databaseSheet.getLastRow();
  Logger.log('Raw last row from Database sheet: ' + lastRow);
  
  // 3. Verify data exists at this row
  var headers = databaseSheet.getRange(2225, 1, 1, databaseSheet.getLastColumn()).getValues()[0];
  var ownerNameCol = headers.indexOf("Owner Name") + 1;
  var ownerName = databaseSheet.getRange(lastRow, ownerNameCol).getValue();
  
  Logger.log('Owner Name at last row: ' + ownerName);
  
  return lastRow;
}
function testRowNumbers() {
  var formWorkbook = SpreadsheetApp.openById('1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw');
  var formResponseSheet = formWorkbook.getSheetByName('Form Responses');
  
  Logger.log('Testing row numbers...');
  Logger.log('Sheet name: ' + formResponseSheet.getName());
  Logger.log('Total rows in sheet: ' + formResponseSheet.getMaxRows());
  Logger.log('Last row from getLastRow(): ' + formResponseSheet.getLastRow());
  
  var lastRow = findLastRowWithData(formResponseSheet);
  Logger.log('Final adjusted last row: ' + lastRow);
  
  // Verify the content
  var headers = formResponseSheet.getRange(1, 1, 1, formResponseSheet.getLastColumn()).getValues()[0];
  var ownerNameCol = headers.indexOf("Owner Name") + 1;
  var ownerName = formResponseSheet.getRange(lastRow, ownerNameCol).getValue();
  Logger.log('Owner Name at last row: ' + ownerName);
  
  return {
    lastRow: lastRow,
    ownerName: ownerName
  };
}
function onFormSubmit(e) {
  try {
    // 1. Initialize workbooks and get specific sheets
    var estimateWorkbook = SpreadsheetApp.openById('1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8');
    var databaseSheet = estimateWorkbook.getSheetByName('Database');
    var estimateSheet = estimateWorkbook.getSheetByName('Estimate');
    
    Logger.log("Estimate Workbook name: " + estimateWorkbook.getName());

    if (!databaseSheet) {
      throw new Error('Database sheet not found in workbook');
    }
    if (!estimateSheet) {
      throw new Error('Estimate sheet not found in workbook');
    }

    // 2. Get the last row from Database sheet
    var lastRow = findLastRowWithData(databaseSheet);
    Logger.log('Final determined last row from Database: ' + lastRow);
    
    // 3. Get headers from Database sheet (starting at row 2225)
    var headers = databaseSheet.getRange(2225, 1, 1, databaseSheet.getLastColumn()).getValues()[0];
    Logger.log('Headers from Database: ' + headers.join(', '));

    // Helper function for finding columns
    function getColumnByHeader(headerName) {
      var index = headers.indexOf(headerName);
      if (index === -1) {
        throw new Error(`Header "${headerName}" not found. Available headers: ${headers.join(', ')}`);
      }
      return index + 1;
    }

    // 4. Update Estimate sheet with the correct row number
    estimateSheet.getRange('K4').setValue(lastRow);

    // 5. Get client information from Database sheet
    var clientName = databaseSheet.getRange(lastRow, getColumnByHeader("Owner Name")).getValue();
    var clientEmail = databaseSheet.getRange(lastRow, getColumnByHeader("Owner Email")).getValue();
    var salesRepName = databaseSheet.getRange(lastRow, getColumnByHeader("Sales Rep Name")).getValue();
    var companyType = databaseSheet.getRange(lastRow, getColumnByHeader("Company Name")).getValue();
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

  // 7. PDF Generation with adjusted settings
var folder = DriveApp.getFolderById('1FjTPRhC-1hUMioHZNTN6isYfzy_54c3M');
var pdfFileName = clientName + ' - Roofing Estimate';

var url = 'https://docs.google.com/spreadsheets/d/' + estimateWorkbook.getId() + '/export?';
var exportOptions = {
  format: 'pdf',
  size: 'letter',
  portrait: true,
  fitw: true,        // Fit to width
  fith: true,        // Fit to height
  scale: 4,          // Adjusted scale to fit content
  sheetnames: false,
  printtitle: false,
  pagenumbers: false,
  gridlines: false,
  fzr: true,         // Freeze rows
  top_margin: 0.20,  // Reduced margins
  bottom_margin: 0.20,
  left_margin: 0.20,
  right_margin: 0.20,
  horizontal_alignment: 'CENTER',
  vertical_alignment: 'TOP',
  gid: estimateSheet.getSheetId()
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
