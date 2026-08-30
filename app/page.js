import Script from "next/script";
import { manualBodyHtml } from "../lib/manualBody";

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: manualBodyHtml }} />
      <Script src="/manual-script.js" strategy="afterInteractive" />
    </>
  );
}
