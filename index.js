const express = require('express');
const app = express();

// JSONリクエストボディを解析するミドルウェアを使用
app.use(express.json());

// Webhookエンドポイントを作成
app.post('/webhook', (req, res) => {
  try {
    const webhookData = req.body;

    // データをコンソールに出力（デバッグ用）
    console.log('Received webhook data:', webhookData);

    // ここでデータを処理するロジックを追加
    const { submissionId, formId, revision, createdAt, values } = webhookData;

    console.log('Submission ID:', submissionId);
    console.log('Form ID:', formId);
    console.log('Revision ID:', revision);
    console.log('Created At:', new Date(createdAt * 1000).toLocaleString());

    values.forEach(value => {
      console.log(`Question ID: ${value.questionId}`);
      console.log(`Answer: ${Array.isArray(value.value) ? value.value.join(', ') : value.value}`);
    });

    // 正常に処理したことを通知
    res.status(200).send('Webhook data received successfully');
  } catch (error) {
    console.error('Error processing webhook data:', error.message);
    res.status(500).send('Error processing webhook data');
  }
});

// Cloud Runは8080ポートでリッスンする
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// **エクスポート**を修正
module.exports = app;  // Expressアプリケーション（app）をエクスポート
