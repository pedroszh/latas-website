"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";

import {
  BAND_SAG_BOTTOM_RATIO,
  BAND_SAG_TOP_RATIO,
  CAN_ASSET,
  CURVATURE,
  EDGE_FADE_MAX,
  EDGE_FADE_RATIO,
  EDGE_FADE_STRENGTH,
  SLICE_WIDTH,
} from "../data/can";
import type { BrandConfig } from "../data/brands";
import { loadCanTexture, type CanTexture } from "../lib/canTexture";
import { wrap } from "../lib/motion";

type Size = { width: number; height: number };

type CanCanvasProps = {
  brands: BrandConfig[];
  /** Posição contínua do carrossel, em painéis. */
  panel: MotionValue<number>;
  onReady?: () => void;
};

const ASIN_MAX = Math.asin(CURVATURE);

/**
 * Mapeia a posição horizontal na face visível (0–1) para a coordenada do
 * rótulo desenrolado (0–1).
 *
 * É a projeção de um cilindro: o centro aparece esticado e as laterais
 * comprimidas, exatamente como um rótulo envolvendo a lata.
 */
function faceToLabel(t: number): number {
  return 0.5 + (0.5 * Math.asin((2 * t - 1) * CURVATURE)) / ASIN_MAX;
}

export default function CanCanvas({ brands, panel, onReady }: CanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bandRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<CanTexture | null>(null);
  const sizeRef = useRef<Size>({ width: 0, height: 0 });
  const dprRef = useRef(1);

  /** Desenha a faixa do rótulo (fatiada e curvada) em um canvas offscreen. */
  const renderBand = useCallback(
    (position: number, width: number, height: number, texture: CanTexture) => {
      const dpr = dprRef.current;
      const band = (bandRef.current ??= document.createElement("canvas"));

      const pixelWidth = Math.max(1, Math.round(width * dpr));
      const pixelHeight = Math.max(1, Math.round(height * dpr));
      if (band.width !== pixelWidth || band.height !== pixelHeight) {
        band.width = pixelWidth;
        band.height = pixelHeight;
      }

      const ctx = band.getContext("2d");
      if (!ctx) return band;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // 1. Fatias de ~4px amostradas ao longo da faixa contínua de rótulos.
      const base = wrap(position, brands.length);
      const stripWidth = texture.strip.width;

      for (let x = 0; x < width; x += SLICE_WIDTH) {
        const nextX = Math.min(x + SLICE_WIDTH, width);
        const from = (base + faceToLabel(x / width)) * texture.panelWidth;
        const to = Math.min(stripWidth, (base + faceToLabel(nextX / width)) * texture.panelWidth);
        ctx.drawImage(
          texture.strip,
          from,
          0,
          Math.max(0.01, to - from),
          texture.panelHeight,
          x,
          0,
          nextX - x,
          height,
        );
      }

      // 2. Sombreamento cilíndrico: laterais escurecidas, centro preservado.
      ctx.globalCompositeOperation = "multiply";
      const shading = ctx.createLinearGradient(0, 0, width, 0);
      shading.addColorStop(0, "rgb(104,104,116)");
      shading.addColorStop(0.12, "rgb(186,186,196)");
      shading.addColorStop(0.34, "rgb(255,255,255)");
      shading.addColorStop(0.62, "rgb(246,246,250)");
      shading.addColorStop(0.88, "rgb(176,176,188)");
      shading.addColorStop(1, "rgb(98,98,110)");
      ctx.fillStyle = shading;
      ctx.fillRect(0, 0, width, height);

      // 3. Brilho especular suave, deslocado para a esquerda como na foto da lata.
      ctx.globalCompositeOperation = "lighter";
      const highlight = ctx.createLinearGradient(0, 0, width, 0);
      highlight.addColorStop(0.14, "rgba(255,255,255,0)");
      highlight.addColorStop(0.3, "rgba(255,255,255,0.1)");
      highlight.addColorStop(0.48, "rgba(255,255,255,0)");
      ctx.fillStyle = highlight;
      ctx.fillRect(0, 0, width, height);

      // 4. Recorte com as bordas curvadas — o rótulo acompanha o topo e a base
      //    elípticos do cilindro em vez de terminar em uma barra reta.
      const sagTop = width * BAND_SAG_TOP_RATIO;
      const sagBottom = width * BAND_SAG_BOTTOM_RATIO;
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(width / 2, 2 * sagTop, width, 0);
      ctx.lineTo(width, height - sagBottom);
      ctx.quadraticCurveTo(width / 2, height + sagBottom, 0, height - sagBottom);
      ctx.closePath();
      ctx.fill();

      // 5. Fade nas bordas, para o rótulo desaparecer na silhueta da lata.
      const fade = Math.min(EDGE_FADE_MAX, width * EDGE_FADE_RATIO);
      ctx.globalCompositeOperation = "destination-out";

      const left = ctx.createLinearGradient(0, 0, fade, 0);
      left.addColorStop(0, `rgba(0,0,0,${EDGE_FADE_STRENGTH})`);
      left.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = left;
      ctx.fillRect(0, 0, fade, height);

      const right = ctx.createLinearGradient(width - fade, 0, width, 0);
      right.addColorStop(0, "rgba(0,0,0,0)");
      right.addColorStop(1, `rgba(0,0,0,${EDGE_FADE_STRENGTH})`);
      ctx.fillStyle = right;
      ctx.fillRect(width - fade, 0, fade, height);

      ctx.globalCompositeOperation = "source-over";
      return band;
    },
    [brands.length],
  );

  const draw = useCallback(
    (position: number) => {
      const canvas = canvasRef.current;
      const texture = textureRef.current;
      const { width, height } = sizeRef.current;
      if (!canvas || !texture || width === 0 || height === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = dprRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(texture.can, 0, 0, width, height);

      const { band } = CAN_ASSET;
      const bandX = band.left * width;
      const bandY = band.top * height;
      const bandWidth = (band.right - band.left) * width;
      const bandHeight = (band.bottom - band.top) * height;

      const strip = renderBand(position, bandWidth, bandHeight, texture);

      // Multiply preserva o sombreamento e o brilho metálico da própria lata.
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(strip, bandX, bandY, bandWidth, bandHeight);

      // A faixa é retangular, mas a lata afina no topo e na base. Reaplicar a
      // silhueta apara o transbordo e faz o rótulo acompanhar o formato real.
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(texture.can, 0, 0, width, height);

      ctx.globalCompositeOperation = "source-over";
    },
    [renderBand],
  );

  // Mede o canvas e mantém o backing store alinhado ao devicePixelRatio.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const applySize = (width: number, height: number) => {
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      dprRef.current = dpr;
      sizeRef.current = { width, height };

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      draw(panel.get());
    };

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      applySize(rect.width, rect.height);
    });
    observer.observe(canvas);

    const rect = canvas.getBoundingClientRect();
    applySize(rect.width, rect.height);

    return () => observer.disconnect();
  }, [draw, panel]);

  // Carrega e prepara as texturas uma única vez.
  useEffect(() => {
    let cancelled = false;

    loadCanTexture(brands)
      .then((texture) => {
        if (cancelled) return;
        textureRef.current = texture;
        draw(panel.get());
        onReady?.();
      })
      .catch((error) => {
        console.error("Falha ao preparar as texturas da lata:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [brands, draw, panel, onReady]);

  // Redesenha a cada frame em que o carrossel se move (sem re-render do React).
  useEffect(() => panel.on("change", draw), [panel, draw]);

  return <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />;
}
