# AERO — Experiência Interativa de Produto

Landing page interativa conceitual de uma lata de bebida, desenvolvida como projeto independente de estudo e portfólio, apresentada em três variações visuais inspiradas em marcas conhecidas: Adidas, Nike e Puma.

A experiência ocupa 100% da viewport, não tem scroll, e a interação principal é girar a lata horizontalmente para revelar cada rótulo. Fundo, título gigante, logos e elementos decorativos se movem de forma coordenada durante a troca.

## Interações

| Ação | Resultado |
| --- | --- |
| Arrastar a lata para a esquerda | Próxima marca |
| Arrastar a lata para a direita | Marca anterior |
| Clicar na lata | Avança uma marca |
| `←` / `→` | Marca anterior / próxima |
| Mover o mouse | Parallax sutil nas camadas |

O drag funciona com mouse e touch. Se o gesto não passar do threshold, a lata volta suavemente para a posição original em vez de trocar de marca.

## Stack

- [Next.js 16](https://nextjs.org) com App Router
- TypeScript em modo `strict`
- [Framer Motion](https://motion.dev) para as animações
- [Tailwind CSS v4](https://tailwindcss.com)
- Canvas 2D para o rótulo aplicado sobre a lata
- Fontes `Anton` (display) e `Geist` via `next/font`

## Rodando o projeto

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de produção
npm run start   # servir o build
npm run lint    # ESLint
```

## Estrutura

```
app/
├── components/
│   ├── Background.tsx           # painéis de fundo que deslizam + transição de cor
│   ├── BrandTitle.tsx           # título gigante atrás da lata
│   ├── CanStage.tsx             # posicionamento, drag e parallax da lata
│   ├── CanCanvas.tsx            # renderização da lata e do rótulo no canvas
│   ├── DecorativeElements.tsx   # grafismos flutuantes com enter/exit direcional
│   └── BrandHud.tsx             # interface: logo, tagline, navegação
├── data/
│   ├── brands.ts                # cores, rótulos, títulos e decorativos
│   └── can.ts                   # geometria medida do asset da lata
├── hooks/
│   ├── useBrandCarousel.ts      # estado do carrossel (posição contínua + índice)
│   └── usePointerParallax.ts    # posição do cursor amortecida por springs
├── lib/
│   ├── canTexture.ts            # recorte da lata e montagem da faixa de rótulos
│   ├── motion.ts                # transição padrão e utilitários de wrap
│   └── color.ts
└── page.tsx
```

Os dados das marcas ficam separados da lógica de animação: nenhum componente conhece cor, posição ou nome de marca — tudo vem de `app/data/brands.ts`.

## Como o giro da lata funciona

O efeito não é um crossfade entre imagens. Os três rótulos são compostos em uma **faixa horizontal contínua** na ordem `[adidas, nike, puma, adidas]`, e a face visível da lata é redesenhada a cada frame em fatias verticais de ~4px.

A posição de cada fatia na tela é convertida em posição no rótulo através de `asin()`, o que reproduz a projeção de um cilindro: o centro aparece ampliado cerca de 1,4× e as laterais comprimem em direção à silhueta. É isso que impede o rótulo vizinho de surgir como uma barra reta durante a transição — ele entra comprimido pela borda, como aconteceria numa lata real.

A faixa é aplicada sobre a foto da lata em modo `multiply`, então o sombreamento e o brilho metálico do próprio objeto atravessam a arte em vez de serem cobertos por ela.

Dois detalhes do asset exigiram tratamento em runtime:

**O PNG da lata tem fundo branco opaco.** Para poder aparecer sobre as cores das marcas, a silhueta é recortada varrendo cada linha da imagem a partir das duas laterais até encontrar o primeiro pixel que não é branco. Um chroma key comum apagaria também o corpo branco da lata; a varredura por linha preserva tudo que está entre as bordas. Em seguida a imagem é cortada na silhueta, já que o arquivo original é cerca de 74% de margem vazia.

**A lata afina no topo e na base.** A faixa do rótulo é retangular e transborda de propósito nessas duas pontas; depois de aplicada, a silhueta é reaplicada em `destination-in` para aparar o excesso. O resultado é a arte acompanhando o afunilamento real do corpo, sem falhas e sem invadir o aro nem o fundo de alumínio.

O carrossel é infinito usando apenas três elementos no DOM: cada painel calcula seu deslocamento pelo caminho mais curto em relação à posição contínua, e o índice da marca sai de um módulo, o que garante que ele nunca saia do intervalo válido.

## Personalização

Praticamente todo o visual é editável sem tocar em lógica de animação.

**`app/data/brands.ts`** — cor de fundo, cor de destaque, cor e tamanho do título, textos e a lista de elementos decorativos de cada marca. Cada decorativo aceita posição, largura, blur, rotação, opacidade e `depth` (intensidade do parallax):

```ts
{ src: "/nike.png", x: "12%", y: "29%", width: 270, rotation: -8, opacity: 0.18, depth: 1 }
```

**`app/data/can.ts`** — geometria da lata, medida em pixels do asset original: a janela da silhueta, a área imprimível do rótulo, a largura das fatias, a curvatura do cilindro e o fade das bordas.

**`app/lib/motion.ts`** — a transição `SPRING` compartilhada por todos os elementos coordenados.

## Assets

Todas as imagens ficam em `public/` e são referenciadas pela raiz. O arquivo da lata está salvo como `lata-website.png.png`, e os rótulos usam a grafia `lable-` — os nomes reais estão centralizados em constantes para não se espalharem pelo código.
