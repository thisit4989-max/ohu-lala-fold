const fs = require("fs");
const path = require("path");

const localInfoPath = path.join(__dirname, "../public/data/local-info.json");

async function run() {
  try {
    const apiKey = process.env.PUBLIC_DATA_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("PUBLIC_DATA_API_KEY 환경변수가 없습니다.");
      process.exit(1);
    }
    if (!geminiKey) {
      console.error("GEMINI_API_KEY 환경변수가 없습니다.");
      process.exit(1);
    }

    // 1단계: 공공데이터포털 API에서 데이터 가져오기
    const page = 1;
    const perPage = 20;
    const returnType = "JSON";
    const odcloudUrl = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=${page}&perPage=${perPage}&returnType=${returnType}&serviceKey=${encodeURIComponent(apiKey)}`;

    const response = await fetch(odcloudUrl, {
      method: "GET",
      headers: {
        "Authorization": `Infuser ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`공공데이터 API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const resJson = await response.json();
    const items = resJson.data || [];

    if (items.length === 0) {
      console.log("가져온 공공데이터가 비어 있습니다.");
      return;
    }

    // 필터링 적용 (성남 -> 경기 -> 전체 순)
    let filtered = items.filter((item) => {
      const text = `${item.서비스명 || ""} ${item.서비스목적요약 || ""} ${item.지원대상 || ""} ${item.소관기관명 || ""}`;
      return text.includes("성남");
    });

    if (filtered.length === 0) {
      filtered = items.filter((item) => {
        const text = `${item.서비스명 || ""} ${item.서비스목적요약 || ""} ${item.지원대상 || ""} ${item.소관기관명 || ""}`;
        return text.includes("경기");
      });
    }

    if (filtered.length === 0) {
      filtered = items;
    }

    // 2단계: 기존 데이터와 비교 (name 기준 중복 제거)
    if (!fs.existsSync(localInfoPath)) {
      fs.writeFileSync(localInfoPath, "[]", "utf8");
    }

    const existingContent = fs.readFileSync(localInfoPath, "utf8");
    const existingData = JSON.parse(existingContent || "[]");
    
    // 기존 데이터의 title 또는 name 추출
    const existingNames = existingData.map((item) => (item.title || item.name || "").trim());

    // 중복되지 않은 새 데이터만 선별
    const newItems = filtered.filter((item) => {
      const serviceName = (item.서비스명 || "").trim();
      return serviceName && !existingNames.includes(serviceName);
    });

    if (newItems.length === 0) {
      console.log("새로운 데이터가 없습니다");
      return;
    }

    // 3단계: 새 항목 1개 선정 후 Gemini AI로 가공
    const targetItem = newItems[0];
    const todayStr = new Date().toISOString().split("T")[0];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    
    const promptText = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜인 '${todayStr}'을 넣고, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

[공공데이터 항목]
서비스명: ${targetItem.서비스명 || ""}
소관기관명: ${targetItem.소관기관명 || ""}
지원대상: ${targetItem.지원대상 || ""}
서비스목적요약: ${targetItem.서비스목적요약 || ""}
신청방법: ${targetItem.신청방법 || ""}
상세조회URL: ${targetItem.상세조회URL || ""}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API 호출 실패: ${geminiResponse.status} ${geminiResponse.statusText}`);
    }

    const geminiJson = await geminiResponse.json();
    let responseText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 마크다운 코드블록 제거
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedItem = JSON.parse(responseText);

    // 기존 로컬 데이터 형식에 맞춰 변환 후 추가
    const formattedItem = {
      id: String(existingData.length + 1),
      title: parsedItem.name || targetItem.서비스명,
      category: parsedItem.category === "행사" ? "행사" : "혜택",
      startDate: parsedItem.startDate || todayStr,
      endDate: parsedItem.endDate || "상시",
      location: parsedItem.location || targetItem.소관기관명 || "미정",
      target: parsedItem.target || targetItem.지원대상 || "상세내용 참고",
      description: parsedItem.summary || targetItem.서비스목적요약 || "",
      link: parsedItem.link || targetItem.상세조회URL || "#"
    };

    existingData.push(formattedItem);

    // 4단계: 기존 데이터에 추가 저장
    fs.writeFileSync(localInfoPath, JSON.stringify(existingData, null, 2), "utf8");
    console.log(`새로운 데이터 추가 완료: ${formattedItem.title}`);

  } catch (error) {
    console.error("오류 발생:", error);
    // 에러 발생 시 기존 파일을 변경하지 않음
  }
}

run();
