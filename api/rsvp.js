const { google } = require('googleapis');

async function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON no está definida');

  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON no es un JSON válido');
  }

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

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return res.status(500).json({ success: false, error: 'GOOGLE_SHEET_ID no está definida' });
  }

  const { nombre, apellido, telefono, respuesta, acompanantes } = req.body || {};

  if (!nombre || !apellido || !telefono || !respuesta) {
    return res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
  }

  try {
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Hoja 1!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          nombre,
          apellido,
          telefono,
          respuesta,
          acompanantes ?? 0,
        ]],
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error al escribir en Google Sheets:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = rsvpHandler;
