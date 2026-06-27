# HANDOFF — Landing Page Imersão C-Level B2H4

Contexto para o agente que for continuar este projeto. Leia isto antes de
tocar em qualquer arquivo.

## O que é este projeto

Landing page de conversão para a "Imersão C-Level" da B2H4.ai (BPO Agentic /
Business to Human Intelligence). Vai ser publicada em `imersao.b2h4.ai`,
**separada** do site institucional (`b2h4.ai`), e é orientada a turma —
ou seja, tem data, vagas e preço reais de uma turma específica, que mudam
a cada novo lote.

## Stack

HTML + CSS + JS puro (vanilla), sem framework, sem build step. Arquivos:

- `index.html` — toda a estrutura e copy da página.
- `styles.css` — design system completo (CSS variables no `:root`).
- `app.js` — lógica: lê `config.js`, popula a página via `data-bind`,
  controla os 3 estados de turma, valida e envia o formulário.
- `config.js` — **dados que mudam a cada turma**. Único arquivo que o
  cliente (não-técnico) edita no dia a dia.
- `google-apps-script.gs` — script para colar no Google Sheets, recebe
  o POST do formulário e grava como linha na planilha.
- `GUIA-ATUALIZACAO.md` — manual de uso para o cliente (não-técnico).

## Decisões de design já tomadas (não revisitar sem necessidade)

- **Paleta**: extraída por amostragem de pixel de um screenshot real do
  site institucional (não inventada). Valores exatos em `:root` no topo
  do `styles.css` — `--bg: #070A12`, `--cyan-cta: #53B2C8`,
  `--cyan-bright: #98E4F3`, etc. Manter consistência com isso.
- **Tipografia**: Space Grotesk (display/títulos) + Inter (corpo) +
  JetBrains Mono (labels/eyebrows). Carregadas via Google Fonts no `<head>`.
- **Tom de voz**: herdado do manifesto institucional da B2H4 — direto,
  anti-hype, "menos PowerPoint, mais produção". Evitar copy genérico de
  "curso de IA".
- **Signature element**: o painel "turma ao vivo" no hero (data + local +
  vagas restantes + barra de progresso) é o elemento de diferenciação da
  página — não é decoração, é o argumento de urgência. Não remover.
- **Estados de turma**: a página tem 3 modos controlados por
  `TURMA_CONFIG.status` (`vagas_abertas` / `esgotada` / `sem_turma`).
  Qualquer nova seção/feature precisa considerar como se comporta nos
  3 estados, não só no "feliz".

## Bugs já corrigidos nesta sessão (não reintroduzir)

1. **`config.js` deve usar `window.TURMA_CONFIG = {...}`, nunca
   `const TURMA_CONFIG = {...}`.** Uma `const`/`let` no top-level de um
   script clássico NÃO se torna propriedade de `window` — isso quebra
   silenciosamente a leitura em `app.js` (`window.TURMA_CONFIG` vira
   `undefined`, tudo cai pra "0 vagas" / "undefined"). Já corrigido, mas
   é fácil reintroduzir esse erro sem perceber.
2. **Elementos de grid CSS precisam ter exatamente o número de filhos
   diretos esperado pelas colunas definidas.** O bug original: um
   `.bloco-item` tinha `grid-template-columns: 140px 1fr` mas 3 filhos
   diretos (`span`, `h3`, `p`) — o `p` "vazava" pra uma linha implícita
   e ficava espremido em 140px. Fix: agrupar `h3`+`p` num
   `.bloco-content` wrapper, mantendo 2 filhos diretos = 2 colunas.
   Vale revisar qualquer outro grid de 2+ colunas no CSS com esse
   mesmo cuidado antes de adicionar conteúdo.
3. O SVG decorativo do hero (`.sigil`) tem `width`/`height` travados
   inline na própria tag (não só via CSS), para não colapsar/expandir
   de forma estranha em contextos sem CSS carregado (ex: visualizadores
   de arquivo que ignoram `<link rel="stylesheet">`).

## O que falta fazer (pendências reais)

- [ ] **Setup do Google Sheets**: o cliente ainda não gerou a URL do
  Apps Script. `config.js.webhookUrl` está com placeholder
  `"COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT"` — o formulário detecta isso e
  mostra erro amigável em vez de falhar silenciosamente, mas precisa
  ser configurado antes de ir para produção.
- [ ] **Teste end-to-end do envio do formulário** contra um Sheets real
  (o `fetch` usa `mode: "no-cors"` porque Apps Script Web Apps têm
  comportamento particular de CORS — validar que a linha realmente
  chega na planilha).
- [ ] **Revisão visual final em viewport real** — já testado via
  Playwright (mobile 390px e desktop 1440px), mas vale revisar em
  tablet (768px) e em dispositivos reais antes do go-live.
- [ ] **Dados reais da primeira turma** — `config.js` está com dados de
  exemplo (`"2026-08-15"`, R$ 4.900, 7/12 vagas preenchidas). Substituir
  pelos dados reais antes de publicar.
- [ ] **Depoimentos adicionais** — só há 1 depoimento (Hélio Magalhães,
  vindo do material institucional). Cliente pode querer adicionar mais
  conforme rodar turmas.
- [ ] **Favicon real** — está com `<link rel="icon" href="data:,">`
  (favicon vazio/placeholder). Vale gerar um favicon de verdade a
  partir do logo da B2H4.
- [ ] **Hospedagem**: arquivos são estáticos, prontos para qualquer
  host (Vercel/Netlify/Cloudflare Pages). Nenhum build necessário.

## Como validar mudanças (recomendado)

Não há test suite automatizado. Para qualquer alteração visual ou de
lógica, validar com Playwright (já usado nesta sessão) ou abrindo num
navegador real via servidor HTTP local — nunca via `file://` direto,
e nunca via visualizador de arquivo de app mobile (ambos pulam o CSS
externo e dão falsos negativos visuais).

```bash
python3 -m http.server 8088
# depois abrir http://localhost:8088/index.html
```

Pontos a checar depois de qualquer mudança em `config.js` ou na lógica
de `app.js`: vagas restantes calculando certo, os 3 estados de turma
renderizando como esperado, e formulário validando + enviando.
