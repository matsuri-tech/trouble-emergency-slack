const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');  // Slack通知を送るためにaxiosをインポート
const webhookRouter = require('./routes/webhook');  // webhookのルートをインポート

const app = express();

// SlackのWebhook URL
const slackWebhookUrl = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';  // 実際のURLをここに設定

// JSONリクエストボディを解析するミドルウェアを使用
app.use(bodyParser.json());  // express.json()を使う代わりにbody-parserを使っています

// Webhookのルーティングを設定
app.use('/api', webhookRouter);

// Slack通知を送る関数
function sendSlackNotification(message) {
  const payload = {
    text: 'Webhook Notification',
    attachments: [
      {
        color: "#36a64f",  // メッセージの色
        text: message,  // 通知メッセージの内容
      }
    ]
  };

  axios.post(slackWebhookUrl, payload)
    .then(response => {
      console.log('Message sent to Slack:', response.data);
    })
    .catch(error => {
      console.error('Error sending message to Slack:', error);
    });
}

// Webhook処理後にSlack通知を送る処理を追加
app.post('/notify-slack', (req, res) => {
  const message = req.body.message || 'No message provided';

  // Slack通知を送る
  sendSlackNotification(message);

  // 正常に処理が完了したことを通知
  res.status(200).send('Slack notification sent successfully');
});

// Cloud Runは8080ポートでリッスンする
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
