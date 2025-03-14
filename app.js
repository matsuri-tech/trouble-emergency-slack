// app.js (例)
const express = require('express');
const app = express();

// ルーター読み込み
const webhookRouter = require('./routes/webhook');
app.use(express.json());
app.use('/', webhookRouter);

// Cloud Functionsのエントリーポイント
// 自分で app.listen() は書かない！
exports.troubleEmergencySlack = app;
