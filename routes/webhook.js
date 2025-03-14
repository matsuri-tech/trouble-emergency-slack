// routes/webhook.js
const express = require('express');
const axios = require('axios');
const { questionHandlers, getHandoverFormData } = require('../handlers/questionHandlers');
const { createMessagePayload } = require('../handlers/slackHandlers');
require('dotenv').config();  // ローカル開発用

const router = express.Router();

// SlackトークンやURLを環境変数から読み込み
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL = 'C08GVJTJMAB';
// URLも環境変数化してもOK。今回は固定
const slackApiUrl = process.env.SLACK_API_URL;
// Slackトークンが無ければ警告
if (!SLACK_TOKEN) {
  console.error('SLACK_TOKEN is missing. Please check your environment variables.');
  // process.exit(1); // Cloud Functionsだと落ちすぎないように注意
}

// Webhook用のエンドポイント
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Received webhook data:', webhookData);

    const { submissionId, formId, createdAt, values } = webhookData;
    const processedResults = {};

    // 各question回答を処理
    for (let valueObj of values) {
      const { questionId, value } = valueObj;
      const handler = questionHandlers[questionId];

      if (handler) {
        const result = await handler(value);
        processedResults[questionId] = result;
      } else {
        console.log("対応する処理が見つかりませんでした:", questionId);
      }
    }

    // handoverForm, genreなどの取得
    const handoverForm = processedResults["01J3WX05BJ13FMBZTJ4NP1N6ZG"]?.handoverForm || null;
    const genre = processedResults["18a07f085caf"]?.genre;

    // userAttribute
    const userAttributeObj = processedResults["18943c0de28fb"]?.attribute || null;
    const userAttributeString = userAttributeObj?.attribute || null;

    const mentionData = await getHandoverFormData(userAttributeString, genre, handoverForm);

    // Slack送信用のペイロード組み立て
    const rowData = [
      { submissionId: submissionId || "" },
      { createdAtEpoch: createdAt || "" },
      { formId: formId || "" },
      { classification: genre || "" },
      { mention: mentionData && typeof mentionData.mention === "string" ? mentionData.mention : "" },
      { channel: SLACK_CHANNEL },
      {
        propertyName:
          processedResults["18943c0561c3cd"]?.name ||
          processedResults["189441cd23589"]?.commonareaName ||
          ""
      },
      { entryTimeIso: new Date(createdAt * 1000).toISOString() },
      { who: processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.reservationCode || "" },
      { whatHappened: processedResults["01J3WWYF71WNHEHJP7A8TG1YTK"]?.content || "" },
      { request: processedResults["01J3WWZK4NRHBEFTJVBP9FY821"]?.whatToDo || "" },
      { handoverFormId: handoverForm || "" },
      { contractAttribute: processedResults["18943c0561c3cd"]?.operation_type_ja || "" },
      { inputBy: processedResults["189537a502913f"]?.userName || "" },
      { troubleUrl: processedResults["1894412eaf515"]?.troubleUrl || "" },
      { reservationRoute: processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.reservationRoute || "" },
      { checkinDate: processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.checkinDate || "" },
      { checkoutDate: processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.checkoutDate || "" },
      { m2mAdminUrl: "" },
      { m2mCleanerUrl: "" }
    ];

    console.log('rowData:', JSON.stringify(rowData, null, 2));
    const slackPayload = createMessagePayload(rowData);

    // Slack リクエスト
    const headers = {
      'Authorization': `Bearer ${SLACK_TOKEN}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(slackApiUrl, slackPayload, { headers });
      if (response.data.ok) {
        console.log('Message sent to Slack:', response.data);
      } else {
        console.error('Failed to send message to Slack:', response.data.error);
      }
    } catch (error) {
      console.error('Error sending message to Slack:', error.response ? error.response.data : error.message);
    }

    res.status(200).send('Webhook data received successfully');
  } catch (error) {
    console.error('Error processing webhook data:', error.message);
    res.status(500).send('Error processing webhook data');
  }
});

// このファイルはあくまでルータをエクスポート
module.exports = router;
