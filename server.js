const express    = require('express');
const path       = require('path');
const rsvpHandler = require('./api/rsvp');

const app  = express();
const PORT = process.env.PORT || 3000;

// Parsear JSON en el body
app.use(express.json());

// Archivos estáticos desde la raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Endpoint RSVP
app.post('/api/rsvp', rsvpHandler);

// Cualquier otra ruta → index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
