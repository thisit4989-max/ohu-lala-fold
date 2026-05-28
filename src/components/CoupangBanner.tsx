"use client";

export default function CoupangBanner() {
  const partnerId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID;
  const showBanner = partnerId && partnerId !== "나중에_입력" && partnerId.trim() !== "";

  if (!showBanner) return null;

  return (
    <div className="w-full my-6 flex justify-center overflow-hidden border border-slate-100 rounded-lg p-2 bg-slate-50">
      <iframe
        src={`https://ads-partners.coupang.com/widgets.html?id=${partnerId}&template=carousel&trackingCode=AF1234567&subId=`}
        width="100%"
        height="140"
        frameBorder="0"
        scrolling="no"
        referrerPolicy="unsafe-url"
      />
    </div>
  );
}
