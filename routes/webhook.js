const express = require('express');
const axios = require('axios');
const questionHandlers = require('../handlers/questionHandlers');
const { createMessagePayload } = require('../handlers/slackHandlers');

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
        const result = await handler(value); 
        processedResults[questionId] = result;
      } else {
        console.log("対応する処理が見つかりませんでした:", questionId);
      }
    }

    // processedResultsにhandoverFormが存在するなら、その値を渡し、なければnullを渡す
  const handoverForm = processedResults["01J3WX05BJ13FMBZTJ4NP1N6ZG"]?.handoverForm || null;
  const genre = processedResults["18a07f085caf"]?.genre;
  const userAttribute = processedResults["18943c0de28fb"]?.attribute;

  // getHandoverFormData関数を呼び出す
  const mention = await getHandoverFormData(userAttribute, genre, handoverForm);
  


    // Slack送信用の rowData を作る
    const rowData = [
      { submissionId: submissionId || null },
      { createdAtEpoch: createdAt || null },
      { formId: formId || null },
      { classification: processedResults["18a07f085caf"]?.genre || null },  // 一例
      { mention: mention || null }, // 一例
      { channel: 'slack-channel-id' }, // 一例
      { propertyName: processedResults["18943c0561c3cd"]?.name || processedResults["18943c0561c3cd"]?.id },
      { entryTimeIso: new Date(createdAt * 1000).toISOString() },
      { who: processedResults["01J3WWWKTBX8MQA8GG9ZS2SM2T"]?.reservationCode || null },
      { whatHappened: processedResults["01J3WWYF71WNHEHJP7A8TG1YTK"]?.content || null },
      { request: processedResults["01J3WWZK4NRHBEFTJVBP9FY821"]?.whatToDo || null },
      { handoverFormId: processedResults["01J3WX05BJ13FMBZTJ4NP1N6ZG"]?.handoverForm || null },
      { contractAttribute: processedResults["01J3WX05BJ13FMBZTJ4NP1N6ZG"]?.handoverForm || null }, // 例
      { inputBy: processedResults["189537a502913f"]?.username || null },          // 例
      { troubleUrl: processedResults["1894412eaf515"]?.troubleUrl || null },
      { reservationRoute: processedResults["18943c0561c3cd"]?.operation_type_ja || null },
      { checkinDate: processedResults["18943c0561c3cd"]?.checkinDate || null },   // 例
      { checkoutDate: processedResults["18943c0561c3cd"]?.checkoutDate || null },  // 例
      { m2mAdminUrl: null },
      { m2mCleanerUrl: null }
    ];

    // rowDataをログで確認
    console.log('rowData:', JSON.stringify(rowData, null, 2));

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
