const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors({
    origin: 'https://khaas01.github.io' // Allow requests from GitHub Pages
}));

app.use(express.json()); // Parse JSON request bodies

async function executeAppScript(formData) {
    // Assuming you have a way to execute the Google Apps Script and get the response
    const scriptId = 'YOUR_SCRIPT_ID';
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/script.projects']
    });
    const script = google.script({ version: 'v1', auth });

    const res = await script.scripts.run({
        scriptId: scriptId,
        resource: {
            function: 'doPost',
            parameters: [formData]
        }
    });

    if (res.data.error) {
        throw new Error(res.data.error.details[0].errorMessage);
    }

    return res.data.response.result;
}

app.post('/submit-form', async (req, res) => {
    try {
        const formData = req.body;
        const result = await executeAppScript(formData);
        res.json(result);
    } catch (error) {
        console.error('The API returned an error:', error);
        res.status(500).send('Error submitting form');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
