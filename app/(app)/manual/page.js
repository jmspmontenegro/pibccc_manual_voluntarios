import Script from "next/script";
import { manualBodyHtml } from "@/lib/manualBody";

export default function ManualPage() {
  return (
    <>
      <a
        href="/"
        className="fixed top-3 right-3 z-[200] rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg"
      >
        ← Início
      </a>
      <div className="manual-scope" dangerouslySetInnerHTML={{ __html: manualBodyHtml }} />
      <Script src="/manual-script.js" strategy="afterInteractive" />
    </>
  );
}
