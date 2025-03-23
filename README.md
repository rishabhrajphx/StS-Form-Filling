# StS Form Assistant

A web application that uses OpenAI's Realtime API to help users fill out forms and stores the submitted data in Google Sheets.

## Features

- Interactive form with AI assistant chat interface
- Real-time form filling with OpenAI's GPT models
- Automatic storage of form data in Google Sheets
- Clean, modern UI with responsive design

## Prerequisites

- Node.js (v14.x or higher)
- OpenAI API key with access to Realtime API
- Google Cloud project with Google Sheets API enabled

## Setup

1. Clone this repository:
   ```
   git clone <repository-url>
   cd Mnemosyne-Form-Filling
   ```

2. Install dependencies:
   ```
   npm install express cors dotenv googleapis
   ```

3. Set up Google Cloud credentials:
   - Create a project in the Google Cloud Console
   - Enable the Google Sheets API
   - Create a service account
   - Download the JSON credentials file
   - Save it as `credentials.json` in the project root or specify a path in the `.env` file

4. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your OpenAI API key
   - Set the path to your Google credentials file
   - Optionally, specify an existing Google Sheet ID to append to

5. Start the server:
   ```
   node server.js
   ```

6. Access the application in your browser:
   ```
   http://localhost:3000
   ```

## How It Works

1. The user interacts with the form and can chat with the AI assistant.
2. The OpenAI Realtime API processes the user's messages and helps fill out the form.
3. When the form is submitted, the data is sent to the server.
4. The server uses the Google Sheets API to store the form data in a spreadsheet with:
   - A timestamp of the submission
   - All form fields organized in columns
   - Each submission added as a new row

## Configuration Options

- Set `PORT` in the `.env` file to change the server port
- Set `GOOGLE_SHEET_ID` to use a specific Google Sheet instead of creating a new one
- Customize the form fields in `public/index.html`

## Troubleshooting

- Check the console logs for detailed error information
- Ensure your OpenAI API key has access to the Realtime API
- Verify that your Google service account has permission to create/edit spreadsheets 
