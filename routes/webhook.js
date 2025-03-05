// routes/webhook.js

const express = require('express');
const axios = require('axios'); // axiosをインポート
const questionHandlers = require('../handlers/questionHandlers'); // 先ほどのquestionHandlersをインポート

const router = express.Router();

// SlackのWebhook URL（実際のURLを設定する必要があります）
const slackWebhookUrl = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';

router.post('/webhook', (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Received webhook data:', webhookData);

    const { submissionId, formId, revision, createdAt, values } = webhookData;
    console.log('Submission ID:', submissionId);
    console.log('Form ID:', formId);
    console.log('Revision ID:', revision);
    console.log('Created At:', new Date(createdAt * 1000).toLocaleString());

    // Slackに送信するメッセージペイロードを作成
    let slackMessage = '';

    values.forEach(value => {
      console.log(`Question ID: ${value.questionId}`);
      console.log(`Answer: ${Array.isArray(value.value) ? value.value.join(', ') : value.value}`);

      const handler = questionHandlers[value.questionId];
      if (handler) {
        handler(value.value);  // 対応する処理を実行
      } else {
        console.log("対応する処理が見つかりませんでした:", value.questionId);
      }

      // Slackメッセージに追加
      slackMessage += `*Question ID: ${value.questionId}*\nAnswer: ${Array.isArray(value.value) ? value.value.join(', ') : value.value}\n\n`;
    });

    // Slackにメッセージを送信
    const payload = {
      text: 'Webhook Notification:',
      attachments: [
        {
          color: "#36a64f", // メッセージの色
          text: slackMessage, // メッセージの内容
        },
      ],
    };

    axios.post(slackWebhookUrl, payload)
      .then(response => {
        console.log('Message sent to Slack:', response.data);
      })
      .catch(error => {
        console.error('Error sending message to Slack:', error);
      });

    res.status(200).send('Webhook data received successfully');
  } catch (error) {
    console.error('Error processing webhook data:', error.message);
    res.status(500).send('Error processing webhook data');
  }
});

module.exports = router;
