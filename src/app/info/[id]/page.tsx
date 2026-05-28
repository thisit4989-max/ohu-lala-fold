import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

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

// 1. static export를 위해 모든 상세 페이지 경로(ID)를 미리 생성합니다.
export async function generateStaticParams() {
  const data = getLocalInfo();
  return data.map((item) => ({
    id: item.id,
  }));
}

// 2. 상세 페이지 본문 컴포넌트입니다.
export default async function InfoDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = getLocalInfo();
  const item = data.find((x) => x.id === resolvedParams.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f0f0f2] text-[#2d3748] font-sans flex items-center justify-center p-4 sm:p-8">
      {/* 메인 페이지의 example.com 미니멀 레이아웃과 일치하는 60vw 카드 컨테이너 */}
      <div className="w-full md:w-[60vw] bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-[#e5e7eb] flex flex-col justify-between my-8">
        
        {/* 상단 헤더 & 카테고리 표시 */}
        <header className="border-b border-[#eee] pb-6 mb-8">
          <div className="mb-3">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded border ${
              item.category === "행사" 
                ? "bg-[#f0f4f8] text-[#334488] border-[#334488]/20" 
                : "bg-emerald-50 text-emerald-800 border-emerald-800/10"
            }`}>
              {item.category} 정보
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a202c] leading-tight">
            {item.title}
          </h1>
        </header>

        {/* 상세 안내 정보 표 */}
        <main className="space-y-8">
          <section className="bg-[#f9fafb] p-6 rounded-lg border border-[#eee] space-y-3.5 text-sm">
            {item.category === "행사" && (
              <div className="flex flex-col sm:flex-row sm:border-b sm:border-[#eee] sm:pb-3">
                <span className="font-bold text-[#718096] w-24 mb-1 sm:mb-0">📅 행사 기간</span>
                <span className="text-[#2d3748]">{item.startDate} ~ {item.endDate}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:border-b sm:border-[#eee] sm:pb-3">
              <span className="font-bold text-[#718096] w-24 mb-1 sm:mb-0">📍 {item.category === "행사" ? "행사 장소" : "신청 장소"}</span>
              <span className="text-[#2d3748]">{item.location}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-bold text-[#718096] w-24 mb-1 sm:mb-0">👥 지원 대상</span>
              <span className="text-[#2d3748]">{item.target}</span>
            </div>
          </section>

          {/* 상세 설명 전문 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#1a202c] border-b border-[#eee] pb-2">
              📝 상세 안내
            </h2>
            <p className="text-sm sm:text-base text-[#4a5568] leading-relaxed whitespace-pre-wrap opacity-95">
              {item.description}
            </p>
          </section>

          {/* 외부 링크 버튼 및 목록 버튼 */}
          <section className="pt-6 border-t border-[#eee] flex flex-col sm:flex-row gap-4 sm:justify-between items-center">
            {/* 목록으로 이동 (example.com 스타일의 청보라색 링크) */}
            <Link
              href="/"
              className="text-[#334488] hover:text-[#223366] text-sm font-semibold hover:underline py-2"
            >
              ← 목록으로 돌아가기
            </Link>

            {/* 공식 사이트 바로가기 버튼 */}
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center bg-white hover:bg-[#F3F4F6] text-[#334488] font-bold py-2.5 px-6 rounded-lg text-xs border border-[#CBD5E1] transition"
            >
              자세히 보기 →
            </a>
          </section>
        </main>

        {/* 푸터 영역 */}
        <footer className="border-t border-[#eee] pt-6 mt-12 text-xs text-[#a0aec0] flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="text-center sm:text-left opacity-85">
            <p className="font-semibold text-[#718096]">출처: 대한민국 공공데이터포털</p>
            <p>본 사이트의 데이터는 실제 정보와 다를 수 있으니 공공기관의 공식 안내를 확인하십시오.</p>
          </div>
          <div className="text-center sm:text-right opacity-85">
            <p className="mt-0.5 text-[10px]">© 2026 우리동네 생활정보.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
