const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors({
    origin: 'https://khaas01.github.io'
}));

async function getDecodedServiceAccountCredentials() {
    const base64Content = fs.readFileSync(path.resolve(__dirname, 'service-account-base64.txt'), 'utf8');
    const jsonContent = Buffer.from(base64Content, 'base64').toString('utf8');
    return JSON.parse(jsonContent);
}

async function listFiles() {
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

    return res.data.files;
}

app.get('/', (req, res) => {
    res.send('Welcome to the IPR Roofing Estimate Form API');
});

app.get('/files', async (req, res) => {
    try {
        const files = await listFiles();
        res.json(files);
    } catch (error) {
        console.error('The API returned an error:', error);
        res.status(500).send('Error fetching files');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
