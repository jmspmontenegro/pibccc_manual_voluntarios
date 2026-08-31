import "./globals.css";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Manual do Voluntário — Start",
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export default async function RootLayout({ children }) {
  let primaryColor = null;
  try {
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from("app_settings")
      .select("primary_color")
      .single();
    if (settings?.primary_color && HEX_COLOR.test(settings.primary_color)) {
      primaryColor = settings.primary_color;
    }
  } catch {
    // sem sessão/config disponível (ex: página pública de login) - usa a cor padrão do CSS
  }

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap"
          rel="stylesheet"
        />
        {primaryColor && (
          <style>{`:root { --orange: ${primaryColor}; }`}</style>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
