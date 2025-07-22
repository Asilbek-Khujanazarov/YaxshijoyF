const express = require('express');
const path = require('path');
const app = express();

// To‘g‘ri yo‘l: dist/yn/
const distFolder = path.join(__dirname, 'dist/yn/browser/');

app.use(express.static(distFolder));

app.get('*', (req, res) => {
  res.sendFile(path.join(distFolder, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
