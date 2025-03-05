// messageHandler.js

// 必要なユーティリティ関数（例: 日付をフォーマットする関数）もインポート
const { formatDate, convertISOToCustomFormat } = require('../utils/dateUtils'); 

function createMessagePayload(row, classification, sColumnValue, channel, propertyName) { 
  const stayPeriod = `${formatDate(row[16])}~${formatDate(row[17])}`;
  const entryTime = convertISOToCustomFormat(row[1]);
  const user1 = "<!subteam^S07PPNZCB6V>";
  const user2 = "<!subteam^S05NVPXMSNP>";
  const color = classification === "自火報トラブル" || classification === "物理鍵トラブル" || classification === "TTlockトラブル" ? "#ED1A3D"
    : sColumnValue === "CX" ? "#f2c744"
      : "#0000ff";

  return {
    "channel": channel,
    "text": (sColumnValue === "CX") ? user1 : user2,
    "attachments": [
      {
        "color": color,
        "blocks": [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "❗️トラブル報告❗️",
              "emoji": true
            }
          },
          {
            "type": "section",
            "fields": [
              {
                "type": "mrkdwn",
                "text": `*物件名:*\n${propertyName}`
              },
              {
                "type": "mrkdwn",
                "text": `*契約属性:*\n${row[9]}`
              },
              {
                "type": "mrkdwn",
                "text": `*分類:*\n${classification}`
              },
              {
                "type": "mrkdwn",
                "text": `*フォームID:*\n${row[0]}`
              }
            ]
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*誰から（予約コード）:*\n${row[3]}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*何が起きた:*\n${row[4]}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*何をして欲しい:*\n${row[5]}`
            }
          },
          {
            "type": "section",
            "fields": [
              {
                "type": "mrkdwn",
                "text": `*予約経路:*\n${row[15]}`
              },
              {
                "type": "mrkdwn",
                "text": `*滞在期間:*\n${stayPeriod}`
              },
              {
                "type": "mrkdwn",
                "text": `*入力日時:*\n${entryTime}`
              },
              {
                "type": "mrkdwn",
                "text": `*入力者:*\n${row[13]}`
              },
              {
                "type": "mrkdwn",
                "text": `*トラブルURL:*\n${row[14]}`
              },
              {
                "type": "mrkdwn",
                "text": `*引き継ぎフォームID:*\n${row[6]}`
              },
              {
                "type": "mrkdwn",
                "text": `*m2m_管理者画面URL:*\n${row[22]}`
              },   
              {
                "type": "mrkdwn",
                "text": `*m2m_cleaner画面URL:*\n${row[23]}`
              }                   
            ]
          }
        ]
      }
    ]
  };
}

module.exports = { createMessagePayload };
