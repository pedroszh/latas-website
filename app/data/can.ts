import { CAN_IMAGE } from "./brands";

/**
 * Geometria real do asset /lata-website.png.png (1024 × 1536).
 *
 * Os valores abaixo foram medidos diretamente nos pixels da imagem: o corpo
 * cilíndrico ocupa x 375–647 e y 527–1177, e abaixo disso existe apenas a
 * sombra projetada sobre o fundo branco original.
 */
const SOURCE_WIDTH = 1024;
const SOURCE_HEIGHT = 1536;

/** Recorte aplicado ao asset — o PNG original é quase todo margem vazia. */
const CROP = { x: 368, y: 518, width: 288, height: 664 } as const;

/**
 * Área imprimível do rótulo, em pixels do asset original.
 *
 * Cobre todo o corpo da lata: começa em y 544, encostando no aro escuro do
 * topo (que termina em y 543), e termina em y 1172, onde começa a base
 * prateada. Nas duas pontas o corpo é mais estreito que 376–646, então a faixa
 * transborda de propósito e é aparada pela silhueta na hora de compor.
 */
const LABEL_BOX = { left: 376, right: 646, top: 544, bottom: 1172 } as const;

export const CAN_ASSET = {
  src: CAN_IMAGE,
  width: SOURCE_WIDTH,
  height: SOURCE_HEIGHT,
  crop: CROP,

  /** Proporção largura/altura da lata já recortada. */
  aspect: CROP.width / CROP.height,

  /** Parâmetros do recorte da silhueta sobre o fundo branco do PNG. */
  silhouette: {
    /** Primeira linha que contém a lata. */
    top: 520,
    /** Última linha antes da sombra projetada. */
    bottom: 1177,
    /** Suavização da borda, em px do asset original. */
    feather: 2.5,
    /** Quanto o fundo pode se afastar do branco puro antes de virar "lata". */
    threshold: 10,
  },

  /** Faixa do rótulo, normalizada em relação ao recorte. */
  band: {
    left: (LABEL_BOX.left - CROP.x) / CROP.width,
    right: (LABEL_BOX.right - CROP.x) / CROP.width,
    top: (LABEL_BOX.top - CROP.y) / CROP.height,
    bottom: (LABEL_BOX.bottom - CROP.y) / CROP.height,
  },
} as const;

/** Largura, em px, de cada painel do rótulo desenrolado dentro da faixa offscreen. */
export const PANEL_TEXTURE_WIDTH = 384;

/** Largura de cada fatia vertical desenhada no canvas (px CSS). */
export const SLICE_WIDTH = 4;

/**
 * Quanto da curvatura do cilindro é simulada.
 * 1 seria a borda exata (derivada infinita, vira borrão); 0.985 mantém a
 * compressão convincente nas laterais sem destruir a nitidez.
 */
export const CURVATURE = 0.985;

/**
 * Fade nas bordas: ~30px, mas nunca mais que 12% da largura da faixa.
 * `EDGE_FADE_STRENGTH` < 1 mantém um resto de rótulo colado na silhueta — sem
 * isso a lata ganha duas faixas brancas e o rótulo parece um adesivo.
 */
export const EDGE_FADE_MAX = 30;
export const EDGE_FADE_RATIO = 0.12;
export const EDGE_FADE_STRENGTH = 0.82;

/**
 * Curvatura vertical das bordas do rótulo (fração da largura da faixa).
 *
 * O topo é reto: qualquer curva ali empurra o centro da arte para baixo e
 * reabre a faixa clara entre o aro e o rótulo. A base mantém a curva, onde ela
 * só arredonda o encontro com o fundo prateado e não deixa falha visível.
 */
export const BAND_SAG_TOP_RATIO = 0;
export const BAND_SAG_BOTTOM_RATIO = 0.022;
