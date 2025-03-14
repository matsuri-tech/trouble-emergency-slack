const express = require('express');
const app = express();

// webhook.js をインポート
const webhookRouter = require('./routes/webhook');

// JSON形式のリクエストボディをパースするミドルウェア
app.use(express.json());

// webhook.js に定義されたルートを /api/webhook で処理
app.use('/api', webhookRouter);

// Cloud Functions用にエクスポートする関数名を修正
exports.troubleEmergencySlack = app;
