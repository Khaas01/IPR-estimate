const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function getDecodedServiceAccountCredentials() {
    try {
        const base64Content = fs.readFileSync(path.resolve(__dirname, 'service-account-base64.txt'), 'utf8');
        const jsonContent = Buffer.from(base64Content, 'base64').toString('utf8');
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error('Error fetching or decoding service account credentials:', error);
        throw error;
    }
}

async function listFiles() {
    try {
        const credentials = await getDecodedServiceAccountCredentials();
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });

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
