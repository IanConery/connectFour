const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use('/', express.static(path.join(__dirname, 'client')));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});