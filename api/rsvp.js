const { google } = require('googleapis');

// Lee credenciales y Sheet ID desde variables de entorno
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

async function getSheetsClient() {
  const credentials = JSON.parse(SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function rsvpHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { nombre, apellido, email, telefono, respuesta, acompanantes } = req.body;

  // Validación básica
  if (!nombre || !apellido || !email || !telefono || !respuesta) {
    return res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
  }

  try {
    const sheets = await getSheetsClient();
    const timestamp = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          timestamp,
          nombre,
          apellido,
          email,
          telefono,
          respuesta,
          acompanantes ?? 0,
        ]],
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error al escribir en Google Sheets:', err.message);
    return res.status(500).json({ success: false, error: 'Error al guardar la respuesta' });
  }
}

module.exports = rsvpHandler;
