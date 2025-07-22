const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/dist/yn'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/dist/yn/index.html'));
});

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
