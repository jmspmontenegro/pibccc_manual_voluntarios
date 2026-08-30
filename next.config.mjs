/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // O enumerador de arquivos do tsc (matchFiles) não funciona sobre o
    // caminho UNC \\wsl.localhost\... deste repo (mesma classe de bug do
    // npm.cmd e do watcher do "next dev") — "No inputs were found" mesmo
    // com os .ts/.tsx existindo. O Turbopack compila normalmente; só o
    // gate de type-check standalone do build fica desativado aqui. Rodar
    // `tsc --noEmit` direto num checkout fora da ponte UNC funciona.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
