const scriptProperties = PropertiesService.getScriptProperties();
const CLIENT_ID = scriptProperties.getProperty('CLIENT_ID');
const CLIENT_SECRET = scriptProperties.getProperty('CLIENT_SECRET');

// Add OAuth handling
function getOAuthToken() {
  return OAuth2.createService('sheets')
      .setClientId(CLIENT_ID)
      .setClientSecret(CLIENT_SECRET)
      .setCallbackFunction('authCallback')
      .setPropertyStore(PropertiesService.getUserProperties())
      .setScope('https://www.googleapis.com/auth/spreadsheets')
      .setTokenHeaders({
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
      });
}

function doGet() {
  var sheet = SpreadsheetApp.openById("1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw").getSheetByName("Form Responses");
  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var pdfIdColumn = headers.indexOf('PDF_ID') + 1;
  var pdfId = sheet.getRange(lastRow, pdfIdColumn).getValue();
  
  return HtmlService
    .createHtmlOutput(`<script>window.top.location.href = "https://khaas01.github.io/IPR-estimate/review.html?id=${pdfId}";</script>`)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    // Parse form data with enhanced error checking
    let formData;
    try {
      if (e.parameter && e.parameter.data) {
        formData = JSON.parse(e.parameter.data);
      } else if (e.postData && e.postData.contents) {
        formData = JSON.parse(e.postData.contents);
      } else {
        throw new Error('No data received in request');
      }
      Logger.log('Raw form data received: ' + JSON.stringify(formData));
    } catch (parseError) {
      throw new Error('Failed to parse form data: ' + parseError.message);
    }

    // Open and validate required spreadsheets
    const formWorkbook = SpreadsheetApp.openById('1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw');
    const formResponseSheet = formWorkbook.getSheetByName('Form Responses');
    const estimateWorkbook = SpreadsheetApp.openById('1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8');
    const estimateSheet = estimateWorkbook.getSheetByName('Estimate');
    const databaseSheet = estimateWorkbook.getSheetByName('Database');
    
    if (!formResponseSheet || !estimateSheet || !databaseSheet) {
      throw new Error('Required sheets not found');
    }

    // Get and validate sheet headers
    const tableHeaders = formResponseSheet.getRange(1, 1, 1, formResponseSheet.getLastColumn()).getValues()[0];
    if (!tableHeaders || tableHeaders.length === 0) {
      throw new Error('No headers found in form response sheet');
    }
    Logger.log('Sheet headers: ' + JSON.stringify(tableHeaders));

    // Prepare row data
    const rowData = tableHeaders.map(header => {
      if (header === "Timestamp") return new Date();
      if (header === "User Login") return Session.getActiveUser().getEmail() || '';
      return (formData.data && formData.data[header] !== undefined) ? formData.data[header] : '';
    });

    let targetRow;
    // Check if this is an edit operation
    if (formData.editRow) {
      Logger.log('Edit operation detected for PDF_ID: ' + formData.editRow);
      const pdfIdColumn = tableHeaders.indexOf('PDF_ID') + 1;
      const dataRange = formResponseSheet.getRange(2, pdfIdColumn, formResponseSheet.getLastRow() - 1);
      const pdfIds = dataRange.getValues();
      
      for (let i = 0; i < pdfIds.length; i++) {
        if (pdfIds[i][0] === formData.editRow) {
          targetRow = i + 2;
          Logger.log('Found matching row: ' + targetRow);
          formResponseSheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
          break;
        }
      }
      
      if (!targetRow) {
        throw new Error('Could not find row to edit with PDF_ID: ' + formData.editRow);
      }
    } else {
      Logger.log('New entry detected');
      formResponseSheet.appendRow(rowData);
      targetRow = formResponseSheet.getLastRow();
      Logger.log('New row added at: ' + targetRow);
    }

    // Force the sheet to update
    SpreadsheetApp.flush();
    Logger.log('Sheet updated');
    
    // Update Estimate sheet with Database row
    Utilities.sleep(2000);
    const lastDatabaseRow = findLastRowWithData(databaseSheet);
    Logger.log('Last database row: ' + lastDatabaseRow);
    estimateSheet.getRange('K4').setValue(lastDatabaseRow);
    
    // Force another update
    SpreadsheetApp.flush();
    Utilities.sleep(1000);

    // Process form submission and generate PDF
    Logger.log('Preparing to generate PDF...');
    const submitResult = onFormSubmit({
      lastRow: lastDatabaseRow,
      clientName: formData.data["Owner Name"],
      clientData: formData.data,
      estimateWorkbook: estimateWorkbook
    });
    Logger.log('PDF generation result: ' + JSON.stringify(submitResult));

    if (submitResult && submitResult.pdfUrl) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        pdfUrl: submitResult.pdfUrl,
        fileId: submitResult.fileId,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    throw new Error('No preview URL generated');

  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    // Send error notification email with more details
    MailApp.sendEmail({
      to: 'khaas@ironpeakroofing.com',
      subject: 'Form Submission Error',
      body: `Error in doPost: ${error.message}
      
Stack trace:
${error.stack}

Form Data:
${JSON.stringify(formData, null, 2)}

Last Database Row: ${lastDatabaseRow}
Target Row: ${targetRow}`
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: 'Form submission failed. Please try again.',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
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
  var workbook = SpreadsheetApp.openById('1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8');
  var databaseSheet = workbook.getSheetByName('Database');
  
  Logger.log('Starting findLastRowWithData function...');
  
  // 2. Get the actual last row from Database sheet
  var lastRow = databaseSheet.getLastRow();
  Logger.log('Raw last row from Database sheet: ' + lastRow);
  
  // 3. Get the header row - FIXED: Use consistent row number
  const HEADER_ROW = 2400; // Define this as a constant
  var headers = databaseSheet.getRange(HEADER_ROW, 1, 1, databaseSheet.getLastColumn()).getValues()[0];
  var ownerNameCol = headers.indexOf("Owner Name") + 1;
  
  if (ownerNameCol === 0) {
    throw new Error('Owner Name column not found in headers');
  }
  
  // 4. Verify the data exists
  var currentRowValue = databaseSheet.getRange(lastRow, ownerNameCol).getValue();
  var maxAttempts = 5;  // Add safety limit for row checking
  var attempts = 0;
  
  while (!currentRowValue && attempts < maxAttempts) {
    lastRow--;
    attempts++;
    currentRowValue = databaseSheet.getRange(lastRow, ownerNameCol).getValue();
    Logger.log(`Checking row ${lastRow}, value: ${currentRowValue}`);
  }
  
  if (!currentRowValue) {
    throw new Error('Could not find valid row with Owner Name');
  }
  
  Logger.log('Final valid row found: ' + lastRow);
  return lastRow;
}
function findLastRowWithData() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Database');
  var lastRow = sheet.getLastRow();
  Logger.log('Last Row Number: ' + lastRow); // Log the last row number
  return lastRow;
}

function getLatestPdfId() {
  Logger.log('Starting getLatestPdfId function...');
  
  try {
    // Get the last row from the sheet
    var lastRow = findLastRowWithData();
    var sheet = SpreadsheetApp.getActive().getSheetByName('Database');
    
    // Get stored PDF ID from Script Properties
    var storedPdfId = PropertiesService.getScriptProperties().getProperty('latestPdfId');
    Logger.log('Stored PDF ID in Properties: ' + storedPdfId);

    // Get PDF ID from the last row of the sheet
    var pdfUrlCell = sheet.getRange(lastRow, 14).getValue(); // Adjust column number if needed
    Logger.log('Last row data: ' + pdfUrlCell);

    if (pdfUrlCell) {
      // If it's a URL, extract the ID
      if (pdfUrlCell.toString().includes('drive.google.com')) {
        var fileId = pdfUrlCell.toString().match(/[-\w]{25,}/);
        Logger.log('Extracted File ID from URL: ' + fileId);
        return fileId ? fileId[0] : null;
      }
      // If it's already an ID
      Logger.log('Using direct File ID: ' + pdfUrlCell);
      return pdfUrlCell;
    } else {
      Logger.log('No PDF URL/ID found in last row. Using stored ID: ' + storedPdfId);
      return storedPdfId;
    }
    
  } catch (error) {
    Logger.log('Error in getLatestPdfId: ' + error.toString());
    return null;
  }
}

// Test function to run and check logs
function testGetLatestPdfId() {
  Logger.log('Testing PDF ID retrieval...');
  var id = getLatestPdfId();
  Logger.log('Retrieved PDF ID: ' + id);
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
    var formResponsesSheet = SpreadsheetApp.openById("1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw").getSheetByName("Form Responses");
    
    Logger.log("Estimate Workbook name: " + estimateWorkbook.getName());
    Logger.log("Event object received: " + JSON.stringify(e));

    if (!databaseSheet || !estimateSheet || !formResponsesSheet) {
      throw new Error('Required sheets not found');
    }

    // 2. Get the last row from Database sheet
    var lastRow = e && e.lastRow ? e.lastRow : findLastRowWithData(databaseSheet);
    Logger.log('Using row number: ' + lastRow);
    
    // Update Estimate sheet again to ensure correct row
    estimateSheet.getRange('K4').setValue(lastRow);
    
    // 3. Get headers from Database sheet  
    const HEADER_ROW = 2400;
    var headers = databaseSheet.getRange(HEADER_ROW, 1, 1, databaseSheet.getLastColumn()).getValues()[0];
    Logger.log('Headers from Database: ' + headers.join(', '));

    function getColumnByHeader(headerName) {
      var index = headers.indexOf(headerName);
      if (index === -1) {
        throw new Error(`Header "${headerName}" not found. Available headers: ${headers.join(', ')}`);
      }
      return index + 1;
    }

    // 4. Get client information from Database sheet - MOVED THIS UP
    var clientName = databaseSheet.getRange(lastRow, getColumnByHeader("Owner Name")).getValue();
    var clientEmail = databaseSheet.getRange(lastRow, getColumnByHeader("Owner Email")).getValue();
    var salesRepName = databaseSheet.getRange(lastRow, getColumnByHeader("Sales Rep Name")).getValue();
    var companyType = databaseSheet.getRange(lastRow, getColumnByHeader("Company Name")).getValue();
    var senderEmail = 'khaas@ironpeakroofing.com';

    // Verify we have the client name before proceeding
    if (!clientName) {
      throw new Error('Client name not found in row ' + lastRow);
    }

    Logger.log('Retrieved values:');
    Logger.log('Client Name: ' + clientName);
    Logger.log('Client Email: ' + clientEmail);
    Logger.log('Sales Rep Name: ' + salesRepName);
    Logger.log('Company Type: ' + companyType);

    // 5. Email content
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

    // 6. PDF Generation
    var folder = DriveApp.getFolderById('13M5SRYJLVSspb9A5-KqrNMVdLsemcRaD');
    var pdfFileName = clientName + ' - Roofing Estimate';

    var url = 'https://docs.google.com/spreadsheets/d/' + estimateWorkbook.getId() + '/export?';
    var exportOptions = {
      format: 'pdf',
      size: 'letter',
      portrait: true,
      fitw: true,
      fith: true,
      scale: 4,
      sheetnames: false,
      printtitle: false,
      pagenumbers: false,
      gridlines: false,
      fzr: true,
      top_margin: 0.20,
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

    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(fullUrl, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    var pdfFile = folder.createFile(response.getBlob().setName(pdfFileName + ".pdf"));
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Get the file ID and create the embedded preview URL
    var fileId = pdfFile.getId();
    var viewUrl = 'https://drive.google.com/file/d/' + fileId + '/preview';
    Logger.log('Generated PDF URL: ' + viewUrl);

    // Save PDF ID to Form Responses sheet
    try {
      var formLastRow = formResponsesSheet.getLastRow();
      var formHeaders = formResponsesSheet.getRange(1, 1, 1, formResponsesSheet.getLastColumn()).getValues()[0];
      var pdfIdColumn = formHeaders.indexOf('PDF_ID') + 1;
      
      if (pdfIdColumn > 0) {
        formResponsesSheet.getRange(formLastRow, pdfIdColumn).setValue(fileId);
        Logger.log('Saved PDF ID to Form Responses sheet at column ' + pdfIdColumn + ', row ' + formLastRow);
      } else {
        Logger.log('PDF_ID column not found in Form Responses sheet');
      }
    } catch (pdfIdError) {
      Logger.log('Error saving PDF ID to Form Responses: ' + pdfIdError.toString());
    }

     //Send email with the PDF
     MailApp.sendEmail({
      to: senderEmail,
      cc: 'khaas@ironpeakroofing.com',
      subject: subject,
      body: emailBody,
      attachments: [pdfFile.getAs(MimeType.PDF)]
    });
    
    Logger.log('Email sent to: ' + senderEmail + ' CC: khaas@ironpeakroofing.com with attachment: ' + pdfFile.getUrl());

    return {
      success: true,
      message: 'Form submitted successfully',
      pdfUrl: viewUrl,
      fileId: fileId,
    };
   
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

// Add this helper function to get the latest PDF ID
function getLatestPdfId() {
  try {
    var sheet = SpreadsheetApp.openById("1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw").getSheetByName("Form Responses");
    var lastRow = sheet.getLastRow();
    
    // Find PDF_ID column
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var pdfIdColumn = headers.indexOf('PDF_ID') + 1;
    
    if (pdfIdColumn > 0) {
      var lastPdfId = sheet.getRange(lastRow, pdfIdColumn).getValue();
      Logger.log("Latest PDF ID retrieved: " + lastPdfId);
      return lastPdfId;
    } else {
      Logger.log("PDF_ID column not found");
      return null;
    }
  } catch (error) {
    Logger.log("Error getting latest PDF ID: " + error.toString());
    return null;
  }
}
