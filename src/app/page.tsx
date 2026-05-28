import fs from "fs";
import path from "path";
import Link from "next/link";

interface InfoItem {
  id: string;
  title: string;
  category: "행사" | "혜택";
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  description: string;
  link: string;
}

function getLocalInfo(): InfoItem[] {
  const filePath = path.join(process.cwd(), "public", "data", "local-info.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(jsonData);
}

export default function Home() {
  const data = getLocalInfo();
  const events = data.filter((item) => item.category === "행사");
  const benefits = data.filter((item) => item.category === "혜택");

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="min-h-screen bg-[#f0f0f2] text-[#2d3748] font-sans flex items-center justify-center p-4 sm:p-8">
      <div className="w-full md:w-[60vw] bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-[#e5e7eb] flex flex-col justify-between my-8">
        
        {/* 상단 타이틀 영역 */}
        <header className="border-b border-[#eee] pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a202c]">
            우리동네 생활정보
          </h1>
          <p className="text-sm text-[#718096] mt-1.5 opacity-80">
            성남시 소식을 투명하게 전해드립니다.
          </p>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="space-y-10">
          
          {/* 소개 섹션 */}
          <section className="opacity-80 text-sm leading-relaxed border-l-4 border-[#334488] pl-4 py-1 text-[#4a5568]">
            <p>
              이 도메인은 성남시의 주요 행사 및 복지 혜택을 수집하여 알려드리기 위해 만들어졌습니다. 
              최신 정보를 매일 아침 자동으로 갱신하여 편리하게 정보를 보실 수 있도록 돕습니다.
            </p>
          </section>

          {/* 행사 리스트 */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-[#1a202c] border-b border-[#eee] pb-2">
              🎉 이번 달 주요 행사
            </h2>
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="opacity-90">
                  <div className="flex items-center space-x-2 text-xs text-[#718096] mb-1">
                    <span className="font-semibold text-[#334488] bg-[#f0f4f8] px-2 py-0.5 rounded">
                      {event.category}
                    </span>
                    <span>•</span>
                    <span>{event.startDate} ~ {event.endDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#2d3748] mb-1.5">
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed mb-2 opacity-80">
                    {event.description}
                  </p>
                  <div className="flex space-x-4 text-xs text-[#718096] mb-3">
                    <span>📍 {event.location}</span>
                    <span>👥 {event.target}</span>
                  </div>
                  <div>
                    {/* 상세 페이지 링크로 변경 */}
                    <Link
                      href={`/info/${event.id}/`}
                      className="text-[#334488] hover:text-[#223366] text-xs font-semibold hover:underline"
                    >
                      상세 정보 확인하기 →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 혜택 리스트 */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-[#1a202c] border-b border-[#eee] pb-2">
              💰 지원금 & 혜택 정보
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="opacity-90">
                  <div className="flex items-center space-x-2 text-xs text-[#718096] mb-1">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {benefit.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#2d3748] mb-1.5">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed mb-2 opacity-80">
                    {benefit.description}
                  </p>
                  <div className="flex space-x-4 text-xs text-[#718096] mb-3">
                    <span>👥 대상: {benefit.target}</span>
                    <span>🏢 신청처: {benefit.location}</span>
                  </div>
                  <div>
                    {/* 상세 페이지 링크로 변경 */}
                    <Link
                      href={`/info/${benefit.id}/`}
                      className="text-[#334488] hover:text-[#223366] text-xs font-semibold hover:underline"
                    >
                      상세 정보 확인하기 →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* 푸터 영역 */}
        <footer className="border-t border-[#eee] pt-6 mt-10 text-xs text-[#a0aec0] flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="text-center sm:text-left opacity-85">
            <p className="font-semibold text-[#718096]">출처: 대한민국 공공데이터포털</p>
            <p>본 사이트의 데이터는 매일 오전 7시에 자동으로 업데이트됩니다.</p>
          </div>
          <div className="text-center sm:text-right opacity-85">
            <p>마지막 업데이트: {formattedDate}</p>
            <p className="mt-0.5 text-[10px]">© 2026 우리동네 생활정보.</p>
          </div>
        </footer>
        
      </div>
    </div>
  );
}
