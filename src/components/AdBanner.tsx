"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
  format?: string;
  responsive?: string;
}

export default function AdBanner({ slot, format = "auto", responsive = "true" }: AdBannerProps) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const showAds = adsenseId && adsenseId !== "나중에_입력" && adsenseId.trim() !== "";

  useEffect(() => {
    if (showAds) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [showAds]);

  if (!showAds) return null;

  return (
    <div className="w-full my-6 flex justify-center overflow-hidden min-h-[90px] bg-slate-50 border border-slate-100 rounded-lg p-2">
      <ins
        className="adsbygoogle"
        style={{ display: "block", minWidth: "250px" }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
