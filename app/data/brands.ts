/**
 * Configuração das marcas.
 *
 * Este arquivo é a ÚNICA fonte de verdade visual da experiência: cores, rótulos,
 * títulos e elementos decorativos. Nenhuma lógica de animação vive aqui — os
 * componentes apenas consomem estes dados.
 *
 * Todos os caminhos apontam para arquivos reais existentes em /public.
 */

export type DecorativeElement = {
  /** Caminho do asset em /public. */
  src: string;
  /** Posição horizontal (qualquer unidade CSS, ex.: "14%"). */
  x: string;
  /** Posição vertical (qualquer unidade CSS, ex.: "24%"). */
  y: string;
  /** Largura de referência em px para uma viewport de 1440px (escala sozinha). */
  width: number;
  /** Desfoque em px — usado para criar profundidade. */
  blur?: number;
  /** Rotação estática em graus. */
  rotation?: number;
  /** Opacidade final (0–1). */
  opacity?: number;
  /** Intensidade do parallax: 1 = padrão, <1 mais ao fundo, >1 mais à frente. */
  depth?: number;
};

export type BrandConfig = {
  id: string;
  name: string;
  /** Cor de fundo principal da marca. */
  background: string;
  /** Cor de destaque usada no brilho/gradiente do painel de fundo. */
  accent: string;
  /** Rótulo aplicado sobre a lata (usado no <canvas>). */
  label: string;
  /** Imagem principal da lata. */
  canImage: string;
  /** Logo da marca (também usado nos elementos decorativos). */
  logo?: string;
  /** Texto do título gigante ao fundo. */
  title: string;
  /** Tamanho do título gigante (CSS font-size, responsivo). */
  titleSize: string;
  /** Cor do título gigante ao fundo. */
  titleColor: string;
  eyebrow: string;
  tagline: string;
  decorativeElements?: DecorativeElement[];
};

/**
 * Nome real do arquivo em /public — o asset foi salvo com extensão dupla.
 * Mantido em uma constante para não repetir a peculiaridade pelo código.
 */
export const CAN_IMAGE = "/lata-website.png.png";

export const BRANDS: BrandConfig[] = [
  {
    id: "adidas",
    name: "Adidas",
    background: "#0A2464",
    accent: "#2B62F0",
    label: "/lable-adidas.png",
    canImage: CAN_IMAGE,
    logo: "/adidas.png",
    title: "ADIDAS",
    titleSize: "min(23vw, 44vh)",
    titleColor: "#FFFFFF",
    eyebrow: "Originals Footwear",
    tagline: "Designed for movement",
    decorativeElements: [
      { src: "/adidas.png", x: "13%", y: "26%", width: 200, rotation: -12, opacity: 0.5, depth: 1 },
      { src: "/adidas.png", x: "86%", y: "19%", width: 132, rotation: 14, opacity: 0.34, blur: 5, depth: 0.5 },
      { src: "/adidas.png", x: "79%", y: "73%", width: 240, rotation: -6, opacity: 0.55, depth: 1.3 },
      { src: "/adidas.png", x: "21%", y: "79%", width: 156, rotation: 9, opacity: 0.3, blur: 4, depth: 0.7 },
      { src: "/adidas.png", x: "50%", y: "9%", width: 112, rotation: 0, opacity: 0.22, blur: 6, depth: 0.35 },
    ],
  },
  {
    id: "nike",
    name: "Nike",
    background: "#0B0B0D",
    accent: "#F5F5F7",
    label: "/lable-nike.png",
    canImage: CAN_IMAGE,
    logo: "/nike.png",
    title: "NIKE",
    titleSize: "min(32vw, 46vh)",
    titleColor: "#FFFFFF",
    eyebrow: "Performance Footwear",
    tagline: "Engineered for speed",
    decorativeElements: [
      { src: "/nike.png", x: "12%", y: "29%", width: 270, rotation: -8, opacity: 0.18, depth: 1 },
      { src: "/nike.png", x: "88%", y: "21%", width: 176, rotation: 12, opacity: 0.12, blur: 5, depth: 0.5 },
      { src: "/nike.png", x: "80%", y: "74%", width: 310, rotation: -4, opacity: 0.22, depth: 1.3 },
      { src: "/nike.png", x: "20%", y: "80%", width: 206, rotation: 8, opacity: 0.1, blur: 4, depth: 0.7 },
      { src: "/nike.png", x: "50%", y: "10%", width: 144, rotation: 0, opacity: 0.08, blur: 6, depth: 0.35 },
    ],
  },
  {
    id: "puma",
    name: "Puma",
    background: "#7A0D07",
    accent: "#F0231A",
    label: "/lable-puma.png",
    canImage: CAN_IMAGE,
    logo: "/puma.png",
    title: "PUMA",
    titleSize: "min(30vw, 46vh)",
    titleColor: "#FFFFFF",
    eyebrow: "Originals Footwear",
    tagline: "Crafted for everyday performance",
    decorativeElements: [
      { src: "/puma.png", x: "13%", y: "27%", width: 228, rotation: -10, opacity: 0.5, depth: 1 },
      { src: "/puma.png", x: "87%", y: "20%", width: 152, rotation: 12, opacity: 0.34, blur: 5, depth: 0.5 },
      { src: "/puma.png", x: "79%", y: "74%", width: 264, rotation: -5, opacity: 0.6, depth: 1.3 },
      { src: "/puma.png", x: "21%", y: "80%", width: 184, rotation: 8, opacity: 0.3, blur: 4, depth: 0.7 },
      { src: "/puma.png", x: "50%", y: "9%", width: 124, rotation: 0, opacity: 0.24, blur: 6, depth: 0.35 },
    ],
  },
];
