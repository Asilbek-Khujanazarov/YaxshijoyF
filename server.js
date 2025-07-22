const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// TO‘G‘RI YO‘L: dist/yn/browser
const distPath = path.join(__dirname, 'dist', 'yn', 'browser');

// Static fayllarni serve qilish
app.use(express.static(distPath));

// Har qanday route uchun index.html yuborish
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Serverni ishga tushurish
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
