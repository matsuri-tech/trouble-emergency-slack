// test.js
const { questionHandlers } = require('../handlers/questionHandlers');

// テストデータを用意
const testData = {
  "18943c0561c3cd": "6ea3e309-19e1-4cf6-afc2-f8e78fbd6be9", // 物件ID
  "189441cd23589": "", // 共用部ID:*/
  "18943c0de28fb": "b2e1d9eb-e905-40e1-bdb4-1fd56a74f177", // ユーザーID*/
  "189537a502913f": "村田 和輝", // ユーザー名
  "1894412eaf515": "96995eb0-3207-4943-9fc7-b48861d37c73", // トラブルID
  "18a07f085caf": "部屋/建物不備・インフラ/wifiトラブル", // 問題内容
  "01J3WWWKTBX8MQA8GG9ZS2SM2T": "4321228269", // 予約コード
  "01J3WWYF71WNHEHJP7A8TG1YTK": "トイレのドアノブが破損しておりますので修繕願います。", // 何のトラブル
  "01J3WWZK4NRHBEFTJVBP9FY821": "修繕願います。", // 何をして欲しいか
  "01J3WX05BJ13FMBZTJ4NP1N6ZG": "viduo" // 引き継ぎフォーム
};

// 各関数を順番にテスト
async function test() {
  // listing
  const listingResult = await questionHandlers["18943c0561c3cd"](testData["18943c0561c3cd"]);
  console.log('Listing Data:', listingResult);

  // commonarea
  const commonareaResult = await questionHandlers["189441cd23589"](testData["189441cd23589"]);
  console.log('Common Area Data:', commonareaResult);

  // userID
  const userResult = await questionHandlers["18943c0de28fb"](testData["18943c0de28fb"]);
  console.log('User Data:', userResult);

  // username
  const usernameResult = await questionHandlers["189537a502913f"](testData["189537a502913f"]);
  console.log('Username:', usernameResult);

  // troubleID
  const troubleResult = await questionHandlers["1894412eaf515"](testData["1894412eaf515"]);
  console.log('Trouble ID and URL:', troubleResult);

  // genre
  const genreResult = await questionHandlers["18a07f085caf"](testData["18a07f085caf"]);
  console.log('Genre:', genreResult);

  // reservation
  const reservationResult = await questionHandlers["01J3WWWKTBX8MQA8GG9ZS2SM2T"](testData["01J3WWWKTBX8MQA8GG9ZS2SM2T"]);
  console.log('Reservation:', reservationResult);

  // content
  const contentResult = await questionHandlers["01J3WWYF71WNHEHJP7A8TG1YTK"](testData["01J3WWYF71WNHEHJP7A8TG1YTK"]);
  console.log('Content:', contentResult);

  // whatToDo
  const whatToDoResult = await questionHandlers["01J3WWZK4NRHBEFTJVBP9FY821"](testData["01J3WWZK4NRHBEFTJVBP9FY821"]);
  console.log('What To Do:', whatToDoResult);

  // handoverForm
  const handoverFormResult = await questionHandlers["01J3WX05BJ13FMBZTJ4NP1N6ZG"](testData["01J3WX05BJ13FMBZTJ4NP1N6ZG"]);
  console.log('Handover Form:', handoverFormResult);
}

test();
