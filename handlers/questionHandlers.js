// handlers/questionHandlers.js
// handlers/questionHandlers.js
const { runQuery } = require('../utils/bqUtility');

// Listingの処理
async function fetchListingNameFromBQ(listingId) {
  console.log('fetchListingNameFromBQ開始:', listingId);

  // 追加：listingIdがnullならクエリせずにnullを返す
  if (listingId == null) {
    console.log("listingIdがnullのため、クエリを実行しません。");
    return null;
  }

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
    const { id, name, operation_type_ja } = rows[0];
    console.log('fetchListingNameFromBQ結果:', { id, name, operation_type_ja });
    return {
      id,
      name,
      operation_type_ja
    };
  }
  console.log('fetchListingNameFromBQ結果なし');
  return null;
}

// Commonareaの処理
async function fetchCommonareaNameFromBQ(commonAreaId) {
  console.log('fetchCommonareaNameFromBQ開始:', commonAreaId);

  // 追加：commonAreaIdがnullならクエリを実行せずnull
  if (commonAreaId == null) {
    console.log("commonAreaIdがnullのため、クエリを実行しません。");
    return null;
  }

  const query = `
    SELECT id, name
    FROM \`m2m-core.m2m_core_prod.common_area_records\`
    WHERE id = @commonAreaId
    LIMIT 1
  `;
  const rows = await runQuery(query, { commonAreaId });
  if (rows.length > 0) {
    console.log('fetchCommonareaNameFromBQ結果:', rows[0].name);
    return rows[0].name;
  }
  console.log('fetchCommonareaNameFromBQ結果なし');
  return null;
}

// Reservationの処理
async function fetchReservationDataFromBQ(reservationCode) {
  console.log('fetchReservationDataFromBQ開始:', reservationCode);

  // 追加：reservationCodeがnullならスキップ
  if (reservationCode == null) {
    console.log("reservationCodeがnullのため、クエリを実行しません。");
    return null;
  }

  const query = `
    SELECT id_on_ota, ota_type, start_date, end_date
    FROM \`m2m-core.m2m_core_prod.reservation\`
    WHERE id_on_ota = @reservationCode
    LIMIT 1
  `;
  const rows = await runQuery(query, { reservationCode });
  if (rows.length > 0) {
    const { id_on_ota, ota_type, start_date, end_date } = rows[0];
    console.log('fetchReservationDataFromBQ結果:', { id_on_ota, ota_type, start_date, end_date });
    return {
      id_on_ota,
      ota_type,
      start_date,
      end_date
    };
  }
  console.log('fetchReservationDataFromBQ結果なし');
  return null;
}

// Userの処理
async function fetchUserDataFromBQ(userId) {
  console.log('fetchUserDataFromBQ開始:', userId);

  // 追加：userIdがnullならスキップ
  if (userId == null) {
    console.log("userIdがnullのため、クエリを実行しません。");
    return null;
  }

  const query = `
  SELECT 
    CASE 
        WHEN name LIKE '%WO%' THEN 'WO表記がある社員'
        ELSE attribute
    END AS attribute
FROM \`m2m-core.su_wo.field_worker_native\`
WHERE cleaner_id = @userId
LIMIT 1
`
  ;
  const rows = await runQuery(query, { userId });
  if (rows.length > 0) {
    const { attribute } = rows[0];
    console.log('fetchUserDataFromBQ結果:', { attribute });
    return {
      attribute: attribute
    };
  }
  console.log('fetchUserDataFromBQ結果なし');
  return null;
}

// Hand-over Formの処理
const handleHandoverForm = async (value) => {
  console.log('handleHandoverForm開始:', value);

  if (!value || value.trim() === "") {
    console.log("handoverFormは空白です");
    return { handoverForm: null, message: "Hand-over form is empty" };
  } else {
    console.log("handoverFormに値があります:", value);
    return { handoverForm: value };
  }
};

// HandoverFormがnullの場合の処理
async function fetchHandoverFormNotExists(genre, attribute) {
  console.log('fetchHandoverFormNotExists開始:', genre, attribute);

  // 追加：genreやattributeがnullならスキップ
  if (genre == null || attribute == null) {
    console.log("genreまたはattributeがnullのため、クエリを実行しません。");
    return { mention: null };
  }

  const query = `
    SELECT handoverForm_NOT_EXISTS
    FROM \`m2m-core.su_wo.trouble_genre_and_attribute_for_slack_mention\`
    WHERE genre = @genre
    AND attribute = @attribute
  `;
  const rows = await runQuery(query, { genre, attribute });

  if (rows.length > 0) {
    console.log('fetchHandoverFormNotExists結果:', rows[0].handoverForm_NOT_EXISTS);
    return { mention: rows[0].handoverForm_NOT_EXISTS };
  }
  console.log('fetchHandoverFormNotExists結果なし');
  return { mention: null };
}

// HandoverFormが存在する場合の処理
async function fetchHandoverFormExists(genre, attribute) {
  console.log('fetchHandoverFormExists開始:', genre, attribute);

  // 追加：genreやattributeがnullならスキップ
  if (genre == null || attribute == null) {
    console.log("genreまたはattributeがnullのため、クエリを実行しません。");
    return { mention: null };
  }

  const query = `
    SELECT handoverForm_EXISTS
    FROM \`m2m-core.su_wo.trouble_genre_and_attribute_for_slack_mention\`
    WHERE genre = @genre
    AND attribute = @attribute
  `;
  const rows = await runQuery(query, { genre, attribute });

  if (rows.length > 0) {
    console.log('fetchHandoverFormExists結果:', rows[0].handoverForm_EXISTS);
    return { mention: rows[0].handoverForm_EXISTS };
  }
  console.log('fetchHandoverFormExists結果なし');
  return { mention: null };
}

// valueを取得するためのヘルパー関数
function getValueForQuestionId(questionId) {
  console.log('getValueForQuestionId開始:', questionId);
  const question = formData.values.find(q => q.questionId === questionId);
  if (question) {
    console.log('getValueForQuestionId結果:', question.value);
  } else {
    console.log('該当する質問が見つかりませんでした:', questionId);
  }
  return question ? question.value : null;
}

// getHandoverFormData関数を修正
async function getHandoverFormData(userAttribute, genre, handoverForm) {
  console.log("getHandoverFormData開始:", userAttribute, genre, handoverForm);

  // handoverFormがnullの場合とそうでない場合で処理を分岐
  if (handoverForm === null) {
    console.log("handoverFormが空白です");

    // handoverFormがnullの場合、SQLを実行して結果を取得
    const handoverFormNotExists = await fetchHandoverFormNotExists(genre, userAttribute);

    const mention = handoverFormNotExists.mention;

    console.log("handoverForm_NOT_EXISTS:", mention);

    return {
      userId: userAttribute ? userAttribute.userId : null,
      mention: mention,
      message: "Hand-over form is empty",
      genre: genre
    };
  } else {
    console.log("handoverFormに値があります");

    // handoverFormがnullでない場合、SQLを実行して結果を取得
    const handoverFormExists = await fetchHandoverFormExists(genre, userAttribute);

    const mention = handoverFormExists.mention;

    console.log("handoverForm_EXISTS:", mention);

    return {
      
      userId: userAttribute ? userAttribute.userId : null,
      mention: mention,
      message: "Hand-over form exists",
      genre: genre
    };
  }
}

// バリデーションなどは既存通り
function validateValue(value) {
  // valueがnull、undefined、または空白の場合、nullを返す
  if (!value || value.trim() === "") {
    return null;
  }
  return value;  // バリデーション通過ならそのまま返す
}

function extractSingleValueFromArray(value) {
  if (!Array.isArray(value)) {
    console.log("extractSingleValueFromArray: 配列ではありません:", value);
    return null;
  }
  if (value.length === 0) {
    console.log("extractSingleValueFromArray: 空配列です");
    return null;
  }
  return value[0];
}
  
function normalizeValue(value) {
  // 空文字や null でないことを確認
  if (value && typeof value === 'string') {
    // 前後の空白や改行を削除し、連続した空白や改行を1つにまとめる
    return value.replace(/\s+/g, ' ').trim(); 
  }
  return value;  // 値がnullや空文字ならそのまま返す
}
// -------------------------------------------
// ここから下が questionHandlers の定義
// -------------------------------------------
const questionHandlers = {
    // listing
    "18943c0561c3cd": async (value) => {
      // バリデーション
      const validatedValue = validateValue(value);
      if (validatedValue === null) {
        return { id: null, name: null, operation_type_ja: null };
      }
  
      const listingData = await fetchListingNameFromBQ(validatedValue);
      if (listingData) {
        const { id, name, operation_type_ja } = listingData;
        return { id, name, operation_type_ja };
      }
      return { id: null, name: null, operation_type_ja: null };
    },
  
    // commonarea
    "189441cd23589": async (value) => {
      // バリデーション
      const validatedValue = validateValue(value);
      if (validatedValue === null) {
        return { commonareaName: null };
      }
  
      const commonareaName = await fetchCommonareaNameFromBQ(validatedValue);
      return { commonareaName: commonareaName };
    },
  
    // userID
    "18943c0de28fb": async (value) => {
      // バリデーション
      const validatedValue = validateValue(value);
      if (validatedValue === null) {
        return { userId: null, attribute: null };
      }
  
      console.log("User IDの処理:", validatedValue);
      const attribute = await fetchUserDataFromBQ(validatedValue);
      return { userId: validatedValue, attribute: attribute };
    },
  
    // userName
    "189537a502913f": async (value) => {
      // バリデーション
      const validatedValue = validateValue(value);
      if (validatedValue === null) {
        return { userName: null };
      }
  
      console.log("Usernameの処理:", validatedValue);
      return { userName: validatedValue };
    },
  
    // troubleID
    "1894412eaf515": async (value) => {
      // バリデーション
      const validatedValue = validateValue(value);
      if (validatedValue === null) {
        return { troubleId: null, troubleUrl: null };
      }
  
      console.log("Trouble IDの処理:", validatedValue);
      const troubleUrl = validatedValue.trim() !== "" 
        ? `https://manager-cleaning.m2msystems.cloud/trouble/${validatedValue}` 
        : null;
  
      return { troubleId: validatedValue, troubleUrl: troubleUrl };
    },
  
    // Genre
    "18a07f085caf": async (value) => {
      // 配列から単一値を取り出す
      const singleValue = extractSingleValueFromArray(value);
      if (singleValue === null) {
        return { genre: null };
      }

      // ここでは singleValue は文字列と想定
      console.log("Genreの配列の1つ目要素:", singleValue);
      // もしvalidateValueを使いたいなら
      // const validatedValue = validateValue(singleValue);
      return { genre: singleValue };
    },

  
    // reservation
    "01J3WWWKTBX8MQA8GG9ZS2SM2T": async (value) => {
      // バリデーションと正規化
      const validatedValue = normalizeValue(value);
      
      // 正規化後の値がnullや空文字ならスキップ
      if (!validatedValue) {
        return { reservationCode: null, reservationRoute: null, checkinDate: null, checkoutDate: null };
      }

      const reservationData = await fetchReservationDataFromBQ(validatedValue);
      if (reservationData) {
        return {
          reservationCode: validatedValue,
          reservationRoute: reservationData.ota_type,  // ota_type の返却
          checkinDate: reservationData.start_date,    // start_date の返却
          checkoutDate: reservationData.end_date      // end_date の返却
        };
      }
      return {
        reservationCode: validatedValue,
        reservationRoute: null,
        checkinDate: null,
        checkoutDate: null
      };
 },
  
    // content
    "01J3WWYF71WNHEHJP7A8TG1YTK": async (value) => {
      // バリデーション
      const validatedValue = validateValue(value);
      if (validatedValue === null) {
        return { content: null };
      }
  
      console.log("Contentの処理:", validatedValue);
      return { content: validatedValue };
    },
  
    // what to do
    "01J3WWZK4NRHBEFTJVBP9FY821": async (value) => {
      // バリデーション
      const validatedValue = validateValue(value);
      if (validatedValue === null) {
        return { whatToDo: null };
      }
  
      console.log("What to doの処理:", validatedValue);
      return { whatToDo: validatedValue };
    },
  
    // Hand-over (引き継ぎ) Form
    "01J3WX05BJ13FMBZTJ4NP1N6ZG": async (value) => {
      // バリデーション
      const validatedValue = validateValue(value);
      if (validatedValue === null) {
        return { handoverForm: null };
      }
  
      console.log("Hand-over Formの処理:", validatedValue);
      return { handoverForm: validatedValue };
    }
  };
  
  module.exports = {
    fetchListingNameFromBQ,
    fetchCommonareaNameFromBQ,
    fetchReservationDataFromBQ,
    fetchHandoverFormExists,
    fetchHandoverFormNotExists,
    getValueForQuestionId,
    handleHandoverForm,
    fetchUserDataFromBQ,
    getHandoverFormData,
    questionHandlers
  };
