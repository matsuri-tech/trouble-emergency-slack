// handlers/questionHandlers.js

const questionHandlers = {
    "18943c0561c3cd": (value) => {
      console.log("Listing IDの処理:", value);
      // listing_idから、listing_nameを検索して返す(BQ)
    },
    "189441cd23589": (value) => {
      console.log("Common Area IDの処理:", value);
      // commonarea_idから、commonarea_nameを検索して返す(BQ)
    },
    "18943c0de28fb": (value) => {
      console.log("User IDの処理:", value);
      // ?
    },
    "189537a502913f": (value) => {
      console.log("Usernameの処理:", value);
      // ?
    },
    "1894412eaf515": (value) => {
      console.log("Trouble IDの処理:", value);
      // ?
    },
    "18a07f085caf": (value) => {
      console.log("Genreの処理:", value);
      // ?
    },
    "01J3WWWKTBX8MQA8GG9ZS2SM2T": (value) => {
      console.log("Reservation Codeの処理:", value);
      // 予約経路と、チェックイン日、チェックアウト日を返す
    },
    "01J3WWYF71WNHEHJP7A8TG1YTK": (value) => {
      console.log("Contentの処理:", value);
      // ?
    },
    "01J3WWZK4NRHBEFTJVBP9FY821": (value) => {
      console.log("What to doの処理:", value);
      // ?
    },
    "01J3WX05BJ13FMBZTJ4NP1N6ZG": (value) => {
      console.log("Hand-over Formの処理:", value);
      // ?
    },
  };
  
  module.exports = questionHandlers;
  