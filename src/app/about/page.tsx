import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f2] text-[#2d3748] font-sans flex items-center justify-center p-4 sm:p-8">
      {/* 깔끔한 60vw 카드 컨테이너 */}
      <div className="w-full md:w-[60vw] bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-[#e5e7eb] flex flex-col justify-between my-8">
        
        {/* 상단 헤더 */}
        <header className="border-b border-[#eee] pb-6 mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold text-[#334488] hover:underline">
              ← 홈으로
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a202c] mt-2">
              서비스 소개 (About)
            </h1>
          </div>
        </header>

        {/* 소개 본문 내용 (E-E-A-T 준수) */}
        <main className="space-y-8 text-sm sm:text-base leading-relaxed text-[#4a5568]">
          
          {/* 1. 운영 목적 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1a202c] border-b border-[#eee] pb-2">
              🏡 사이트 운영 목적
            </h2>
            <p>
              <strong>‘우리동네 생활정보’</strong>는 바쁜 일상 속에서 지역 주민들이 정부나 지자체의 유용한 혜택과 즐거운 지역 축제 정보를 놓치지 않도록 돕기 위해 만들어진 1인 공익 정보 대시보드입니다.
            </p>
            <p>
              특히 성남시를 중심으로 꼭 필요한 실생활 밀착형 지원금 및 문화 행사를 엄선하여 투명하고 읽기 쉽게 가공해 제공하고 있습니다.
            </p>
          </section>

          {/* 2. 데이터 출처 투명성 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1a202c] border-b border-[#eee] pb-2">
              📊 신뢰할 수 있는 데이터 출처
            </h2>
            <p>
              본 사이트에 게재되는 모든 생활 정보 및 혜택 자료는 대한민국 정부 공식 창구인 <strong>행정안전부 공공데이터포털(data.go.kr)</strong>의 API 및 지방자치단체(성남시 등)의 공공데이터를 기반으로 수집됩니다.
            </p>
            <p>
              정보의 임의 왜곡을 방지하기 위해 가공되지 않은 공식 원문 출처(상세 링크)를 각 본문 하단에 투명하게 명시하여 사용자가 직접 2차 검증을 진행할 수 있도록 조치하였습니다.
            </p>
          </section>

          {/* 3. 콘텐츠 생성 방식 및 AI 활용 고지 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1a202c] border-b border-[#eee] pb-2">
              🤖 콘텐츠 생성 및 검수 정책 (AI 활용 고지)
            </h2>
            <p>
              본 사이트는 매일 아침 공공 API를 통해 수집된 정부24 공공데이터 중 최신 항목을 자동으로 선별합니다. 
              선별된 데이터의 1차 텍스트화 및 요약은 <strong>Google Gemini AI</strong> 기술을 활용하여 초안을 작성합니다.
            </p>
            <p>
              생성된 초안은 수집된 원본 API 규격 문서와 교차 검증을 진행하여 잘못된 내용(환각 현상 등)이 포함되지 않도록 검수 및 팩트체크 단계를 거친 후에 최종 발행됩니다.
            </p>
          </section>

        </main>

        {/* 하단 푸터 */}
        <footer className="border-t border-[#eee] pt-6 mt-10 text-xs text-[#a0aec0] flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="text-center sm:text-left opacity-85">
            <p className="font-semibold text-[#718096]">우리동네 생활정보 운영진</p>
            <p>주민을 위한 유익한 생활 정보 전달을 위해 노력하겠습니다.</p>
          </div>
          <div className="text-center sm:text-right opacity-85">
            <p>© 2026 우리동네 생활정보.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
