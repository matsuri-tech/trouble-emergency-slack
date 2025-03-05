// app.js

const express = require('express');
const bodyParser = require('body-parser');
const webhookRouter = require('./routes/webhook');  // webhookのルートをインポート

const app = express();

// JSONリクエストボディを解析するミドルウェアを使用
app.use(bodyParser.json());  // express.json()を使う代わりにbody-parserを使っています

// Webhookのルーティングを設定
app.use('/api', webhookRouter);

// Cloud Runは8080ポートでリッスンする
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
