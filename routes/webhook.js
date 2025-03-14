// routes/webhook.js
const express = require('express');
const axios = require('axios');
const { questionHandlers, getHandoverFormData } = require('../handlers/questionHandlers');
const { createMessagePayload } = require('../handlers/slackHandlers');

const router = express.Router();

const slackWebhookUrl = 'https://hooks.slack.com/services/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';

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

    // handoverForm, genre
    const handoverForm = processedResults["01J3WX05BJ13FMBZTJ4NP1N6ZG"]?.handoverForm || null;
    const genre = processedResults["18a07f085caf"]?.genre;

    // userAttributeObj は必ずオブジェクトという前提
    const userAttributeObj = processedResults["18943c0de28fb"]?.attribute || null;

    // オブジェクトと想定される userAttributeObj の attribute フィールドを取り出す
    // 例: userAttributeObj = { attribute: '社員' }
    const userAttributeString = userAttributeObj?.attribute || null;

    // getHandoverFormData関数を呼び出す
    const mentionData = await getHandoverFormData(userAttributeString, genre, handoverForm);


    // Slack送信用の rowData を作る
    const rowData = [
      { submissionId: submissionId || "" }, // null の場合は空文字
      { createdAtEpoch: createdAt || "" },  // null の場合は空文字
      { formId: formId || "" },             // null の場合は空文字
      { classification: genre || "" },       // null の場合は空文字
      { mention: mentionData && typeof mentionData.mention === "string" ? mentionData.mention : "" }, // null の場合は空文字
    
      { channel: 'slack-channel-id' },
      {
        propertyName:
          processedResults["18943c0561c3cd"]?.name ||
          processedResults["189441cd23589"]?.commonareaName || "" // null の場合は空文字
      },
      { entryTimeIso: new Date(createdAt * 1000).toISOString() },
      {
        who: processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.reservationCode || "" // null の場合は空文字
      },
      {
        whatHappened: processedResults["01J3WWYF71WNHEHJP7A8TG1YTK"]?.content || "" // null の場合は空文字
      },
      {
        request: processedResults["01J3WWZK4NRHBEFTJVBP9FY821"]?.whatToDo || "" // null の場合は空文字
      },
      {
        handoverFormId:
          processedResults["01J3WX05BJ13FMBZTJ4NP1N6ZG"]?.handoverForm || "" // null の場合は空文字
      },
      {
        contractAttribute:
          processedResults["18943c0561c3cd"]?.operation_type_ja || "" // null の場合は空文字
      },
      {
        inputBy: processedResults["189537a502913f"]?.userName || "" // null の場合は空文字
      },
      {
        troubleUrl: processedResults["1894412eaf515"]?.troubleUrl || "" // null の場合は空文字
      },
      {
        reservationRoute:
          processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.reservationRoute || "" // null の場合は空文字
      },
      {
        checkinDate: processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.checkinDate || "" // null の場合は空文字
      },
      {
        checkoutDate: processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.checkoutDate || "" // null の場合は空文字
      },
      { m2mAdminUrl: "" },  // null の場合は空文字
      { m2mCleanerUrl: "" } // null の場合は空文字
    ];
    

    console.log('rowData:', JSON.stringify(rowData, null, 2));
    const slackPayload = createMessagePayload(rowData);

  

    try {
      const response = await axios.post(slackWebhookUrl, slackPayload);
      console.log('Message sent to Slack:', response.data);
    } catch (error) {
      console.error('Error sending message to Slack:', error.response ? error.response.data : error.message);
    }
    


    res.status(200).send('Webhook data received successfully');
  } catch (error) {
    console.error('Error processing webhook data:', error.message);
    res.status(500).send('Error processing webhook data');
  }
});

module.exports = router;
