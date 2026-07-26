import { CAN_ASSET, PANEL_TEXTURE_WIDTH } from "../data/can";
import type { BrandConfig } from "../data/brands";

export type CanTexture = {
  /** Lata recortada do fundo branco original e reduzida à sua silhueta. */
  can: HTMLCanvasElement;
  /** Faixa horizontal contínua com os rótulos, na ordem [0, 1, 2, 0]. */
  strip: HTMLCanvasElement;
  /** Largura de um painel dentro da faixa. */
  panelWidth: number;
  /** Altura da faixa. */
  panelHeight: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Não foi possível carregar ${src}`));
    image.src = src;
  });
}

/**
 * O PNG da lata tem fundo branco opaco, então precisa ser recortado antes de
 * aparecer sobre as cores das marcas.
 *
 * A lata é um objeto vertical e convexo, então basta varrer cada linha a partir
 * das duas laterais até encontrar o primeiro pixel que não é branco. Tudo entre
 * os dois limites é lata — inclusive o corpo branco, que um chroma key comum
 * apagaria junto com o fundo.
 */
function cutOutCan(image: HTMLImageElement): HTMLCanvasElement {
  const { width, height } = image;
  const { top, bottom, feather, threshold } = CAN_ASSET.silhouette;

  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  if (!sourceCtx) return source;

  sourceCtx.drawImage(image, 0, 0);
  const imageData = sourceCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const isCan = (offset: number) =>
    255 - Math.min(data[offset], data[offset + 1], data[offset + 2]) > threshold;

  const leftEdge = new Int32Array(height).fill(-1);
  const rightEdge = new Int32Array(height).fill(-1);

  for (let y = top; y <= bottom; y += 1) {
    const row = y * width * 4;

    let left = -1;
    for (let x = 0; x < width; x += 1) {
      if (isCan(row + x * 4)) {
        left = x;
        break;
      }
    }
    if (left < 0) continue;

    let right = left;
    for (let x = width - 1; x > left; x -= 1) {
      if (isCan(row + x * 4)) {
        right = x;
        break;
      }
    }

    // Descarta o pixel mais externo: é a transição anti-aliased com o branco.
    leftEdge[y] = left + 1;
    rightEdge[y] = right - 1;
  }

  const fadeStart = bottom - 10;

  for (let y = 0; y < height; y += 1) {
    const left = leftEdge[y];
    const right = rightEdge[y];
    const rowAlpha = y > fadeStart ? Math.max(0, (bottom - y) / 10) : 1;
    const row = y * width * 4;

    for (let x = 0; x < width; x += 1) {
      const alphaOffset = row + x * 4 + 3;
      if (left < 0 || x < left || x > right) {
        data[alphaOffset] = 0;
        continue;
      }
      const distanceToEdge = Math.min(x - left, right - x);
      const edgeAlpha = Math.min(1, (distanceToEdge + 1) / feather);
      data[alphaOffset] = Math.round(edgeAlpha * rowAlpha * 255);
    }
  }

  sourceCtx.putImageData(imageData, 0, 0);

  // Recorta a margem vazia para a lata poder ocupar toda a moldura na tela.
  const { crop } = CAN_ASSET;
  const cropped = document.createElement("canvas");
  cropped.width = crop.width;
  cropped.height = crop.height;
  const croppedCtx = cropped.getContext("2d");
  croppedCtx?.drawImage(
    source,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return cropped;
}

/**
 * Monta a faixa contínua de rótulos.
 *
 * A faixa repete o primeiro painel no fim ([0, 1, 2, 0]) para que o carrossel
 * dê a volta sem emenda visível e para que nenhuma fatia precise ser amostrada
 * em dois pedaços.
 */
function buildStrip(labels: HTMLImageElement[]): HTMLCanvasElement {
  const { band, crop } = CAN_ASSET;
  const bandAspect =
    ((band.bottom - band.top) * crop.height) / ((band.right - band.left) * crop.width);

  const panelWidth = PANEL_TEXTURE_WIDTH;
  const panelHeight = Math.round(panelWidth * bandAspect);

  const canvas = document.createElement("canvas");
  canvas.width = panelWidth * (labels.length + 1);
  canvas.height = panelHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingQuality = "high";

  [...labels, labels[0]].forEach((label, index) => {
    const x = index * panelWidth;

    // O corpo da lata é mais alto que a arte. Em vez de esticar o rótulo em
    // ~26% (o que deforma o logo), a arte fica centralizada na proporção
    // original e as sobras são preenchidas esticando a primeira e a última
    // linha de pixels — que nos três rótulos são de cor chapada.
    const artHeight = Math.round((panelWidth * label.height) / label.width);
    const top = Math.round((panelHeight - artHeight) / 2);

    if (top > 0) {
      ctx.drawImage(label, 0, 0, label.width, 1, x, 0, panelWidth, top);
      ctx.drawImage(
        label,
        0,
        label.height - 1,
        label.width,
        1,
        x,
        top + artHeight,
        panelWidth,
        panelHeight - top - artHeight,
      );
    }

    ctx.drawImage(label, x, top, panelWidth, artHeight);
  });

  return canvas;
}

export async function loadCanTexture(brands: BrandConfig[]): Promise<CanTexture> {
  const [canImage, ...labels] = await Promise.all([
    loadImage(CAN_ASSET.src),
    ...brands.map((brand) => loadImage(brand.label)),
  ]);

  const strip = buildStrip(labels);

  return {
    can: cutOutCan(canImage),
    strip,
    panelWidth: PANEL_TEXTURE_WIDTH,
    panelHeight: strip.height,
  };
}
