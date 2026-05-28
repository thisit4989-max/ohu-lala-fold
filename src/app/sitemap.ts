import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ohu-lala-fold.pages.dev";

  // 기본 정적 페이지 목록
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 블로그 글 목록을 읽어서 동적으로 추가
  const postsDirectory = path.join(process.cwd(), "src/content/posts");
  if (fs.existsSync(postsDirectory)) {
    const files = fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
    const postRoutes: MetadataRoute.Sitemap = files.map((file) => {
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(postsDirectory, file);
      const stats = fs.statSync(filePath);
      return {
        url: `${baseUrl}/blog/${slug}/`,
        lastModified: stats.mtime,
        changeFrequency: "weekly",
        priority: 0.6,
      };
    });
    routes.push(...postRoutes);
  }

  return routes;
}
