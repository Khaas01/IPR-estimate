function doGet(e) {
  return ContentService.createTextOutput('The web app is working correctly!')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
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
    
    const formWorkbook = SpreadsheetApp.openById('1fM11c84e-D01z3hbpjLLl2nRaL2grTkDEl5iGsJDLPw');
    const formResponseSheet = formWorkbook.getSheetByName('Form Responses');
    const estimateWorkbook = SpreadsheetApp.openById('1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8');
    const estimateSheet = estimateWorkbook.getSheetByName('Estimate');
    const databaseSheet = estimateWorkbook.getSheetByName('Database');
    
    if (!formResponseSheet || !estimateSheet || !databaseSheet) {
      throw new Error('Required sheets not found');
    }

    const headers = formResponseSheet.getRange(1, 1, 1, formResponseSheet.getLastColumn()).getValues()[0];
    if (!headers || headers.length === 0) {
      throw new Error('No headers found in form response sheet');
    }

    // Key change: formData.data is the actual form data
    const formDataObj = formData.data || formData;

    const rowData = headers.map(header => {
      if (header === "Timestamp") return new Date();
      if (header === "User Login") return Session.getActiveUser().getEmail() || '';
      return formDataObj[header] !== undefined ? formDataObj[header] : '';
    });

    formResponseSheet.appendRow(rowData);
    Utilities.sleep(5000);
    
    const lastDatabaseRow = findLastRowWithData(databaseSheet);
    estimateSheet.getRange('K4').setValue(lastDatabaseRow);

    const submitResult = onFormSubmit({
      lastRow: lastDatabaseRow,
      clientName: formDataObj["ownerName"],  // Changed from Owner Name to match the form field
      clientData: formDataObj,
      estimateWorkbook: estimateWorkbook
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Form submitted successfully',
      previewUrl: submitResult.previewUrl,
      pdfUrl: submitResult.pdfUrl,
      fileId: submitResult.fileId,
      estimateId: lastDatabaseRow,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    MailApp.sendEmail({
      to: 'khaas@ironpeakroofing.com',
      subject: 'Form Submission Error',
      body: 'Error in doPost: ' + error.message + '\n\nStack trace:\n' + error.stack
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
  var workbook = SpreadsheetApp.openById('1fDIDwFk3cHU_LkgNJiDf_JKjDn0FGrwxRVD6qI7qNW8');
  var databaseSheet = workbook.getSheetByName('Database');
  
  Logger.log('Starting findLastRowWithData function...');
  
  var lastRow = databaseSheet.getLastRow();
  var headers = databaseSheet.getRange(2225, 1, 1, databaseSheet.getLastColumn()).getValues()[0];
  var ownerNameCol = headers.indexOf("Owner Name") + 1;
  
  var ownerName = databaseSheet.getRange(lastRow, ownerNameCol).getValue();
  
  var currentRowValue = databaseSheet.getRange(lastRow, ownerNameCol).getValue();
  if (!currentRowValue) {
    lastRow = lastRow - 1;
    currentRowValue = databaseSheet.getRange(lastRow, ownerNameCol).getValue();
    if (!currentRowValue) {
      lastRow = lastRow + 1;
    }
  }
  
  Logger.log('Final row number being returned: ' + lastRow);
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
    Logger.log("Event object received: " + JSON.stringify(e));

    if (!databaseSheet || !estimateSheet) {
      throw new Error('Required sheets not found');
    }

    // 2. Get the last row from Database sheet
    var lastRow = e && e.lastRow ? e.lastRow : findLastRowWithData(databaseSheet);
    Logger.log('Using row number: ' + lastRow);
    
    // Update Estimate sheet again to ensure correct row
    estimateSheet.getRange('K4').setValue(lastRow);
    
    // 3. Get headers from Database sheet (starting at row 2225)
    var headers = databaseSheet.getRange(2225, 1, 1, databaseSheet.getLastColumn()).getValues()[0];
    Logger.log('Headers from Database: ' + headers.join(', '));

    function getColumnByHeader(headerName) {
      var index = headers.indexOf(headerName);
      if (index === -1) {
        throw new Error(`Header "${headerName}" not found. Available headers: ${headers.join(', ')}`);
      }
      return index + 1;
    }

    // 4. Get client information from Database sheet
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

    var fileId = pdfFile.getId();
    var viewUrl = 'https://drive.google.com/file/d/' + fileId + '/preview?embedded=true';
    Logger.log('PDF Preview URL: ' + viewUrl);

    // Send email with the PDF
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
      previewUrl: viewUrl,
      pdfUrl: pdfFile.getUrl(),
      fileId: fileId,
      estimateId: lastRow,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    throw error;
  }
}
