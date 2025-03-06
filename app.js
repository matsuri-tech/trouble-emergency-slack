// app.js
const express = require('express');
const bodyParser = require('body-parser');
const webhookRouter = require('./routes/webhook');  // 先ほどのwebhookをimport

const app = express();
app.use(bodyParser.json());

// /api/webhook のルーティング
app.use('/api', webhookRouter);

// Cloud Runは8080ポート
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
