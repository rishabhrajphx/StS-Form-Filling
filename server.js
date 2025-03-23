import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for OpenAI token generation
app.get("/api/get-token", async (req, res) => {
  console.log('Token request received');
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-realtime-preview",
      }),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.error('OpenAI error:', text);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Client Secret being used (frontend):", data.client_secret);
    
    if (!data.client_secret) {
      throw new Error('No client_secret in OpenAI response');
    }

    res.json({ clientSecret: data.client_secret });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Google Sheets API setup
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH || 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

// Form data processing and storing in Google Sheets
app.post("/api/submit-form", async (req, res) => {
  const formData = req.body;
  console.log('Form data received:', formData);
  
  try {
    // Initialize Google Sheets client
    const sheets = await getGoogleSheetsClient();
    
    // Create a new Google Sheet or use existing one
    let spreadsheetId = process.env.GOOGLE_SHEET_ID;
    let sheetResponse;
    
    if (!spreadsheetId) {
      // Create a new spreadsheet if no ID is provided
      sheetResponse = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Form Responses - ${new Date().toLocaleDateString()}`,
          },
          sheets: [
            {
              properties: {
                title: 'Responses',
              }
            }
          ]
        },
      });
      spreadsheetId = sheetResponse.data.spreadsheetId;
      console.log(`Created new Google Sheet with ID: ${spreadsheetId}`);
      
      // Set up headers on first use
      const headers = ['Timestamp', ...Object.keys(formData)];
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Responses!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers]
        }
      });
    }
    
    // Format the form data for insertion
    const timestamp = new Date().toLocaleString();
    const rowData = [timestamp, ...Object.values(formData)];
    
    // Append data to the spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Responses!A2',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData]
      }
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'Form data successfully stored in Google Sheets',
      spreadsheetId: spreadsheetId
    });
  } catch (error) {
    console.error('Error storing form data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Serve the HTML form page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 