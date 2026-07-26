import type { Transition } from "framer-motion";

/** Transição padrão usada por todos os elementos coordenados da experiência. */
export const SPRING: Transition = {
  type: "spring",
  duration: 1.2,
  bounce: 0.24,
};

/** Módulo sempre positivo. */
export function wrap(value: number, length: number): number {
  return ((value % length) + length) % length;
}

/**
 * Deslocamento com sinal do painel `index` em relação à posição contínua `position`,
 * escolhendo sempre o caminho mais curto. Resultado em [-length/2, length/2).
 *
 * É o que permite um carrossel infinito com apenas `length` elementos no DOM.
 */
export function panelOffset(index: number, position: number, length: number): number {
  return wrap(index - position + length / 2, length) - length / 2;
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
