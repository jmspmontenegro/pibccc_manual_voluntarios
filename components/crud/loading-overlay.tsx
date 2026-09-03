"use client";

export function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-8 py-6 shadow-xl">
        <span className="inline-block animate-spin text-4xl leading-none">⏳</span>
        <span className="text-sm font-medium text-muted-foreground">Aguarde...</span>
      </div>
    </div>
  );
}
