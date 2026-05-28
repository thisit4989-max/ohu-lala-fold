import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import CoupangBanner from "@/components/CoupangBanner";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import fs from "fs";
import path from "path";

// 1. static export를 위해 모든 포스트 경로(slug)를 미리 생성합니다.
export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.md$/, ""),
  }));
}

// 2. 검색 노출을 위한 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const post = getPostBySlug(resolvedParams.slug);
    return {
      title: `${post.title} | 성남시 생활 정보`,
      description: post.summary || `${post.title}에 관한 상세 정보 안내입니다.`,
      openGraph: {
        title: `${post.title} | 성남시 생활 정보`,
        description: post.summary || `${post.title}에 관한 상세 정보 안내입니다.`,
        type: "article",
        publishedTime: post.date,
        tags: post.tags,
      },
    };
  } catch (error) {
    return {
      title: "글을 찾을 수 없음 | 성남시 생활 정보",
    };
  }
}

export default async function BlogPostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  try {
    const post = getPostBySlug(resolvedParams.slug);

    // local-info.json에서 원문 출처 링크 가져오기
    const localInfoPath = path.join(process.cwd(), "public", "data", "local-info.json");
    let sourceLink = null;
    if (fs.existsSync(localInfoPath)) {
      const localInfoContent = fs.readFileSync(localInfoPath, "utf8");
      const localInfoData = JSON.parse(localInfoContent || "[]");
      // 제목이 포함되어 있거나 유사한 항목 매칭
      const matchedInfo = localInfoData.find(
        (item: any) => 
          (item.title || "").trim() === post.title.trim() || 
          post.title.includes(item.title || "")
      );
      if (matchedInfo && matchedInfo.link && matchedInfo.link !== "#") {
        sourceLink = matchedInfo.link;
      }
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "datePublished": post.date,
      "description": post.summary,
      "author": {
        "@type": "Organization",
        "name": "성남시 생활 정보",
      },
      "publisher": {
        "@type": "Organization",
        "name": "성남시 생활 정보",
      },
    };

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": "https://ohu-lala-fold.pages.dev/",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "블로그",
          "item": "https://ohu-lala-fold.pages.dev/blog/",
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": `https://ohu-lala-fold.pages.dev/blog/${resolvedParams.slug}/`,
        },
      ],
    };

    return (
      <div className="min-h-screen bg-[#f0f0f2] text-[#2d3748] font-sans flex items-center justify-center p-4 sm:p-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <div className="w-full md:w-[60vw] bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-[#e5e7eb] flex flex-col justify-between my-8">
          
          {/* 상단 네비게이션 & 제목 */}
          <header className="border-b border-[#eee] pb-6 mb-8">
            <Link href="/blog/" className="text-sm font-semibold text-[#334488] hover:underline">
              ← 블로그 목록으로
            </Link>
            <div className="mt-4 mb-2 flex items-center space-x-2 text-xs text-[#718096]">
              <span className="font-semibold text-[#334488] bg-[#f0f4f8] px-2 py-0.5 rounded">
                {post.category}
              </span>
              <span>•</span>
              <span>작성일: {post.date}</span>
              <span>•</span>
              <span className="text-slate-500 font-semibold">최종 업데이트: {post.date}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a202c] leading-tight mt-1">
              {post.title}
            </h1>
            
            {/* 태그 리스트 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-[#718096] bg-[#f7fafc] px-2 py-0.5 rounded border border-[#e2e8f0]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 블로그 포스트 본문 (react-markdown + tailwind css typography 플러그인 사용) */}
          <main className="prose prose-slate max-w-none prose-sm sm:prose-base mb-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>

            {/* 출처 명시 강화 영역 */}
            {sourceLink && (
              <div className="mt-8 p-4 bg-[#f9fafb] border border-[#eee] rounded-lg text-sm not-prose">
                <p className="font-bold text-[#1a202c] mb-1.5 flex items-center gap-1">
                  <span>🔗</span> 공식 원문 출처
                </p>
                <a 
                  href={sourceLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#334488] hover:underline break-all text-xs font-semibold"
                >
                  {sourceLink} 바로가기 →
                </a>
              </div>
            )}

            {/* AI 생성 정보 공개 안내 문구 */}
            <div className="mt-8 text-xs text-[#718096] leading-relaxed border-t border-[#eee] pt-4 not-prose">
              <p>⚠️ 이 글은 공공데이터포털(data.go.kr)의 정보를 바탕으로 AI가 작성하였습니다. 정확한 내용은 원문 링크를 통해 확인해주세요.</p>
            </div>

            <AdBanner slot="1234567890" />
            <CoupangBanner />
          </main>

          {/* 하단 제어 버튼 */}
          <footer className="border-t border-[#eee] pt-6 mt-8 flex justify-between items-center text-xs">
            <Link href="/blog/" className="text-[#334488] hover:text-[#223366] font-semibold hover:underline">
              ← 목록으로 돌아가기
            </Link>
            <p className="text-[#a0aec0]">© 2026 우리동네 생활정보.</p>
          </footer>

        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
