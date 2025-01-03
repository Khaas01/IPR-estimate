const { google } = require('googleapis');

// Example function to list the names and IDs of the first 10 files in Google Drive
async function listFiles() {
    const auth = new google.auth.GoogleAuth({
        // Path to your service account key file
        keyFile: 'path/to/your-service-account-file.json',
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    try {
        const res = await drive.files.list({
            pageSize: 10,
            fields: 'files(id, name)',
        });
        console.log('Files:');
        res.data.files.forEach(file => {
            console.log(`${file.name} (${file.id})`);
        });
    } catch (error) {
        console.error('The API returned an error:', error);
    }
}

listFiles();
