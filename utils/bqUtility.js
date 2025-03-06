// utils/bqUtility.js
const { BigQuery } = require('@google-cloud/bigquery');

// BigQueryクライアント初期化（必要に応じて資格情報やprojectIdを指定）
const bigquery = new BigQuery({
  // projectId: 'your-project-id',
  // keyFilename: 'path/to/service_account.json'
});

/**
 * 任意のクエリとパラメータを受け取って実行し、結果を返す関数。
 * @param {string} query - 実行するSQL
 * @param {object} params - クエリパラメータ
 * @return {array} rows - クエリ結果
 */
async function runQuery(query, params = {}) {
  const [rows] = await bigquery.query({
    query,
    params
  });
  return rows;
}

module.exports = { runQuery };
