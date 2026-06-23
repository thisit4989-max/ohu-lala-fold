export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    // 1. CHAT_KV 바인딩 확인
    if (!env.CHAT_KV) {
      return new Response(
        JSON.stringify({ error: "CHAT_KV binding not found in the environment." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. URL 파라미터에서 sender 추출
    const url = new URL(request.url);
    const filterSender = url.searchParams.get("sender");

    // 3. KV의 모든 메시지 목록 가져오기 ("msg_" 접두사 기준)
    const listResult = await env.CHAT_KV.list({ prefix: "msg_" });
    const keys = listResult.keys;

    const messages = [];
    for (const keyInfo of keys) {
      const rawValue = await env.CHAT_KV.get(keyInfo.name);
      if (rawValue) {
        try {
          const parsed = JSON.parse(rawValue);
          
          // ID(key) 부여가 누락된 경우 보완
          if (!parsed.id) {
            parsed.id = keyInfo.name;
          }

          // sender 필터 파라미터가 지정된 경우 필터 적용
          if (filterSender && parsed.sender !== filterSender) {
            continue;
          }

          messages.push(parsed);
        } catch (e) {
          console.error(`Failed to parse value for key: ${keyInfo.name}`, e);
        }
      }
    }

    // 4. 메시지를 타임스탬프 기준으로 정렬 (시간 오름차순 - 과거에서 최신 대화 순)
    messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    return new Response(
      JSON.stringify({ messages: messages }),
      { headers: { "Content-Type": "application/json;charset=UTF-8" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
