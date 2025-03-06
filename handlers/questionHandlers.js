// handlers/questionHandlers.js
const { runQuery } = require('../utils/bqUtility');
/**
 * listing_id を受け取り、listingテーブルと room_operation_type_ja テーブルを結合して情報を取得
 */
async function fetchListingNameFromBQ(listingId) {
  const query = `
    SELECT 
      a.id,
      a.name,
      b.operation_type_ja
    FROM \`m2m-core.m2m_core_prod.listing\` AS a
    LEFT OUTER JOIN \`m2m-core.dx_001_room.room_operation_type_ja\` AS b
      ON a.id = b.room_id
    WHERE a.id = @listingId
    LIMIT 1
  `;
  const rows = await runQuery(query, { listingId });
  
  if (rows.length > 0) {
    // クエリ結果から必要なフィールドを取得し、オブジェクトとして返す
    const { id, name, operation_type_ja } = rows[0];
    return {
      id,
      name,
      operation_type_ja
    };
  }

  return null; // 見つからなかった場合
}

/**
 * common_area_id を受け取り、common_area_recordsテーブルから name を取得
 */
async function fetchCommonareaNameFromBQ(commonAreaId) {
  const query = `
    SELECT id, name
    FROM \`m2m-core.m2m_core_prod.common_area_records\`
    WHERE id = @commonAreaId
    LIMIT 1
  `;
  const rows = await runQuery(query, { commonAreaId });
  if (rows.length > 0) {
    return rows[0].name;
  }
  return null;
}

/**
 * reservation_code を受け取り、reservationテーブルから予約情報を取得
 */
async function fetchReservationDataFromBQ(reservationCode) {
  const query = `
    SELECT id_on_ota, ota_type, start_date, end_date
    FROM \`m2m-core.m2m_core_prod.reservation\`
    WHERE id_on_ota = @reservationCode
    LIMIT 1
  `;
  const rows = await runQuery(query, { reservationCode });
  if (rows.length > 0) {
    const { id_on_ota, ota_type, start_date, end_date } = rows[0];
    return {
      id_on_ota,
      ota_type,
      start_date,
      end_date
    };
  }
  return null;
}

/**
 * user_id を受け取り、fieled_workerテーブルから属性を取得
 */
async function fetchUserDataFromBQ(userId) {
    const query = `
      SELECT id_on_ota, ota_type, start_date, end_date
      FROM \`m2m-core.m2m_core_prod.reservation\`
      WHERE id_on_ota = @reservationCode
      LIMIT 1
    `;
    const rows = await runQuery(query, { userId });
    if (rows.length > 0) {
      const { id_on_ota, ota_type, start_date, end_date } = rows[0];
      return {
        id_on_ota,
        ota_type,
        start_date,
        end_date
      };
    }
    return null;
  }

  // Hand-over Formの処理を行う関数
const handleHandoverForm = async (value) => {
    console.log("Hand-over Formの処理:", value);
  
    if (!value || value.trim() === "") {
      console.log("handoverFormは空白です");
      return { handoverForm: null, message: "Hand-over form is empty" };
    } else {
      console.log("handoverFormに値があります");
      return { handoverForm: value };
    }
  };
  
// valueを取得するためのヘルパー関数
function getValueForQuestionId(questionId) {
    const question = formData.values.find(q => q.questionId === questionId);
    return question ? question.value : null; // 該当するquestionIdが見つかればvalueを返す
  }


module.exports = {
  fetchListingNameFromBQ,
  fetchCommonareaNameFromBQ,
  fetchReservationDataFromBQ
};

  

// -------------------------------------------
// ここから下が questionHandlers の定義
// -------------------------------------------
const questionHandlers = {
  // listing
  "18943c0561c3cd": async (value) => {
    const listingData = await fetchListingNameFromBQ(value);
    if (listingData) {
      const { id, name, operation_type_ja } = listingData;
      return { id, name, operation_type_ja };
    }
    return { id: null, name: null, operation_type_ja: null };
  },

  // commonarea
  "189441cd23589": async (value) => {
    const commonareaName = await fetchCommonareaNameFromBQ(value);
    return { commonareaName };
  },

  // userID
  "18943c0de28fb": async (value) => {
  console.log("User IDの処理:", value);

  // handoverFormの処理を呼び出して結果を取得
  const handoverResult = await handleHandoverForm(getValueForQuestionId("01J3WX05BJ13FMBZTJ4NP1N6ZG")); 

  // genreの処理を呼び出して結果を取得
  const genreResult = await questionHandlers["18a07f085caf"](getValueForQuestionId("18a07f085caf")); 

  const userAttribute = await fetchUserDataFromBQ(value);

  // 取得した結果を使用
  console.log("handoverForm結果:", handoverResult);
  console.log("genre結果:", genreResult);
  console.log("userdata結果:", userAttribute);

  // handoverFormがnullの場合とそうでない場合で処理を分岐
  if (handoverResult.handoverForm === null) {
    console.log("handoverFormが空白です");
    // handoverFormがnullの場合の処理
    return { userId: value, handoverForm: null, message: handoverResult.message, genre: genreResult.genre };
  } else {
    console.log("handoverFormに値があります");
    // handoverFormがnullでない場合の処理
    return { userId: value, handoverForm: handoverResult.handoverForm, message: handoverResult.message, genre: genreResult.genre };
  }
},



  // userName
  "189537a502913f": async (value) => {
    console.log("Usernameの処理:", value);
    // ...
    return { userName: value };
  },

  // troubleID
  "1894412eaf515": async (value) => {
    console.log("Trouble IDの処理:", value);
    return { troubleId: value };
  },

  // Genre
  "18a07f085caf": async (value) => {
    console.log("Genreの処理:", value);
    return { genre: value };
  },

  // reservation
  "01J3WWWKTBX8MQA8GG9ZS2SM2T": async (value) => {
    const reservationData = await fetchReservationDataFromBQ(value);
    if (reservationData) {
      // 予約データを取得して、それを返す
      return {
        reservationRoute: reservationData.ota_type,  // ota_type の返却
        checkinDate: reservationData.start_date,    // start_date の返却
        checkoutDate: reservationData.end_date      // end_date の返却
      };
    }
    return {
      reservationRoute: null,
      checkinDate: null,
      checkoutDate: null
    };
  },

  // content
  "01J3WWYF71WNHEHJP7A8TG1YTK": async (value) => {
    console.log("Contentの処理:", value);
    return { content: value };
  },

  // what to do
  "01J3WWZK4NRHBEFTJVBP9FY821": async (value) => {
    console.log("What to doの処理:", value);
    return { whatToDo: value };
  },

  // Hand-over (引き継ぎ) Form
  "01J3WX05BJ13FMBZTJ4NP1N6ZG": async (value) => {
    console.log("Hand-over Formの処理:", value);
    return { handoverForm: value };
  }
};

module.exports = questionHandlers;
