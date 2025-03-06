// routes/webhook.js

const express = require('express');
const axios = require('axios');
const questionHandlers = require('../handlers/questionHandlers');
const { createMessagePayload } = require('../handlers/slackHandler');

const router = express.Router();

// SlackのWebhook URL（実際のURLを設定する必要があります）
const slackWebhookUrl = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';

router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Received webhook data:', webhookData);

    // webhookDataには submissionId, formId, createdAt, valuesなどがある想定
    const { submissionId, formId, createdAt, values } = webhookData;

    // すべての質問回答を処理し、その結果をまとめるオブジェクト
    const processedResults = {};

    // values の各回答を処理する
    for (let valueObj of values) {
      const { questionId, value } = valueObj;
      const handler = questionHandlers[questionId];
      
      if (handler) {
        // 非同期なら await handler(value)
        const result = handler(value); 
        processedResults[questionId] = result;
      } else {
        console.log("対応する処理が見つかりませんでした:", questionId);
      }
    }

    // Slack送信用の rowData を作る
    // "ここ" で webhookData の値を使えばよい
    const rowData = [
      // Webhookのトップレベルにある値をそのまま取り込む
      { submissionId: submissionId || 'N/A' },
      { createdAtEpoch: createdAt || 0 },
      
      // 既存のもの
      { formId: formId || 'N/A' },
      { classification: '自火報トラブル' },  // 一例
      { sColumnValue: 'CX' },                // 一例
      { channel: 'slack-channel-id' },       // 一例
      { propertyName: processedResults["18943c0561c3cd"]?.listingName || '物件名不明' },
      { entryTimeIso: new Date(createdAt * 1000).toISOString() },
      { who: processedResults["18943c0de28fb"]?.userName || '予約者名未取得' },
      { whatHappened: processedResults["01J3WWYF71WNHEHJP7A8TG1YTK"]?.content || '内容未取得' },
      { request: processedResults["01J3WWZK4NRHBEFTJVBP9FY821"]?.whatToDo || 'リクエスト不明' },
      { handoverFormId: processedResults["01J3WX05BJ13FMBZTJ4NP1N6ZG"]?.handoverForm || '---' },
      { contractAttribute: '短期賃貸' }, // 例
      { inputBy: '管理者A' },          // 例
      { troubleUrl: 'https://example.com/trouble' },
      { reservationRoute: processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.reservationRoute || 'Airbnb' },
      { checkinDate: '2023-02-15' },   // 例
      { checkoutDate: '2023-02-18' },  // 例
      { m2mAdminUrl: 'https://example.com/admin123' },
      { m2mCleanerUrl: 'https://example.com/cleaner123' }
    ];

    // Slackに送信するpayloadを生成
    const slackPayload = createMessagePayload(rowData);

    // Slackに通知
    await axios.post(slackWebhookUrl, slackPayload);
    console.log('Message sent to Slack');

    res.status(200).send('Webhook data received successfully');
  } catch (error) {
    console.error('Error processing webhook data:', error.message);
    res.status(500).send('Error processing webhook data');
  }
});

module.exports = router;
