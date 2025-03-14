// messageHandler.js

// 必要なユーティリティ関数をインポート（例: 日付をフォーマットする関数）
const { formatDate } = require('../utils/bqUtility');

/**
 * rowは以下のような配列を想定：
 *
 * [
 *   { "formId": "xxxxx" },
 *   { "classification": "自火報トラブル" },
 *   { "mention": "CX" },
 *   { "channel": "slack-channel-id" },
 *   { "propertyName": "新宿アパートメント" },
 *   { "entryTimeIso": "2023-01-01T10:00:00Z" },
 *   { "who": "予約コードABC999" },
 *   { "whatHappened": "火災報知器が鳴り止まない" },
 *   { "request": "すぐに止めてほしい" },
 *   { "handoverFormId": "9876" },
 *   { "contractAttribute": "短期賃貸" },
 *   { "inputBy": "管理者A" },
 *   { "troubleUrl": "https://example.com/trouble" },
 *   { "reservationRoute": "Booking.com" },
 *   { "checkinDate": "2023-02-15" },
 *   { "checkoutDate": "2023-02-18" },
 *   { "m2mAdminUrl": "https://example.com/admin123" },
 *   { "m2mCleanerUrl": "https://example.com/cleaner123" }
 * ]
 */


function convertISOToCustomFormat(isoString) {
  if (!isoString) return "";  // nullやundefinedなら空文字を返す

  const dateObj = new Date(isoString);

  // 日本時間に変換 (UTC+9)
  const jstOffset = 9 * 60;  // JSTはUTC+9
  dateObj.setMinutes(dateObj.getMinutes() + jstOffset);

  // フォーマット処理
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hour = String(dateObj.getHours()).padStart(2, "0");
  const min = String(dateObj.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hour}:${min}`;
};


function createMessagePayload(row) {
  // row 配列の中から、指定した key を持つオブジェクトを探して value を返すヘルパー
  const findValue = (key) => {
    // 例: { "classification": "自火報トラブル" } のように
    //   hasOwnProperty(key) で判定して、そのvalueを返す
    const item = row.find((obj) => obj.hasOwnProperty(key));
    return item ? item[key] : ""; // 見つからなければ空文字など
  };

  // 各種フィールドの取得
  const formId = findValue("submissionId");
  const classification = findValue("classification");
  const mention = findValue("mention");
  const channel = findValue("channel");
  const propertyName = findValue("propertyName");

  // ISO日時を任意の形式に変換
  const entryTimeIso = findValue("entryTimeIso");
  const entryTime = convertISOToCustomFormat(entryTimeIso);

  // "誰から"、"何が起きた"、"何をして欲しい" など
  const who = findValue("who");
  const whatHappened = findValue("whatHappened");
  const request = findValue("request");
  const handoverFormId = findValue("handoverFormId");
  const contractAttribute = findValue("contractAttribute");
  const inputBy = findValue("inputBy");
  const troubleUrl = findValue("troubleUrl");
  const reservationRoute = findValue("reservationRoute");

  // チェックイン・チェックアウトの日付
  const checkinDate = findValue("checkinDate");
  const checkoutDate = findValue("checkoutDate");

  // m2m関連
  const m2mAdminUrl = findValue("m2mAdminUrl");
  const m2mCleanerUrl = findValue("m2mCleanerUrl");

  // 滞在期間をフォーマット
  const stayPeriod = `${checkinDate}~${checkoutDate}`;

  // Slackのユーザーグループ(例)
  const user1 = "CX";
  const user2 = "TASK";

  //const user1 = "<!subteam^S07PPNZCB6V>";
  //const user2 = "<!subteam^S05NVPXMSNP>";

  // 色分けロジック
  const color =
    classification === "自火報トラブル" ||
    classification === "物理鍵トラブル" ||
    classification === "TTlockトラブル"
      ? "#ED1A3D"
      : mention === "CX"
      ? "#f2c744"
      : "#0000ff";

  // ここから Slack 向けのペイロード組み立て
  return {
    channel: channel,
    text: mention === "CX" ? user1 : user2, // "CX"の場合は user1、それ以外は user2
    attachments: [
      {
        color: color,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "⚠️緊急時用トラブル報告⚠️",
              emoji: true
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*物件名:*\n${propertyName}`
              },
              {
                type: "mrkdwn",
                text: `*契約属性:*\n${contractAttribute}`
              },
              {
                type: "mrkdwn",
                text: `*分類:*\n${classification}`
              },
              {
                type: "mrkdwn",
                text: `*フォームID:*\n${formId}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*誰から（予約コード）:*\n${who}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*何が起きた:*\n${whatHappened}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*何をして欲しい:*\n${request}`
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*予約経路:*\n${reservationRoute}`
              },
              {
                type: "mrkdwn",
                text: `*滞在期間:*\n${stayPeriod}`
              },
              {
                type: "mrkdwn",
                text: `*入力日時:*\n${entryTime}`
              },
              {
                type: "mrkdwn",
                text: `*入力者:*\n${inputBy}`
              },
              {
                type: "mrkdwn",
                text: `*トラブルURL:*\n${troubleUrl}`
              },
              {
                type: "mrkdwn",
                text: `*引き継ぎフォームID:*\n${handoverFormId}`
              },
              {
                type: "mrkdwn",
                text: `*m2m_管理者画面URL:*\n${m2mAdminUrl}`
              },
              {
                type: "mrkdwn",
                text: `*m2m_cleaner画面URL:*\n${m2mCleanerUrl}`
              }
            ]
          }
        ]
      }
    ]
  };
}

module.exports = { createMessagePayload, convertISOToCustomFormat };
