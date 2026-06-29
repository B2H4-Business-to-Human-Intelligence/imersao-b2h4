/* ============================================================
   CONFIGURAÇÃO DA TURMA — IMERSÃO C-LEVEL B2H4
   ============================================================
   ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR A CADA NOVA TURMA.

   Veja o GUIA-ATUALIZACAO.md para o passo a passo completo.
   Depois de editar, salve o arquivo e suba ele de novo no servidor
   (ou no GitHub, se publicar por lá) — só este arquivo, não precisa
   tocar em mais nada.
   ============================================================ */

window.TURMA_CONFIG = {

  // -----------------------------------------------------------
  // 1. STATUS DA TURMA
  // -----------------------------------------------------------
  // Escolha UMA das três opções abaixo (sem aspas erradas, copie
  // exatamente como está, só troque o texto entre as aspas):
  //
  //   "vagas_abertas"  → mostra data, vagas restantes e CTA de inscrição
  //   "esgotada"       → mostra "Turma esgotada" e CTA de lista de espera
  //   "sem_turma"      → esconde data/preço, CTA fica "Avise-me da próxima turma"
  //
  status: "vagas_abertas",

  // -----------------------------------------------------------
  // 2. DATA E LOCAL
  // -----------------------------------------------------------
  // Formato da data: "AAAA-MM-DD" (ano-mês-dia). Exemplo: 15 de agosto de 2026 = "2026-08-15"
  data: "2026-07-24",

  // Horário, como texto livre (aparece exatamente como você escrever)
  horario: "13h às 18h",

  // Local, como texto livre
  local: "Pobre Juan Morumbi · São Paulo, SP",

  // URL do Google Maps para o local (aparece ao clicar no campo "Local")
  // Deixe "" para desativar o link
  localMapUrl: "https://maps.google.com/?q=Pobre+Juan+Morumbi+São+Paulo",

  // -----------------------------------------------------------
  // 3. VAGAS
  // -----------------------------------------------------------
  // Total de vagas da turma (a imersão é desenhada para até 12)
  vagasTotais: 12,

  // Valor de fallback — exibido enquanto o site busca a contagem real.
  // Quando o webhookUrl estiver configurado, o site busca automaticamente
  // quantas linhas existem na planilha para esta turma (filtrando por data)
  // e atualiza este número ao carregar a página. Você não precisa mais
  // editar este campo manualmente — mas pode deixar um valor razoável
  // aqui caso o Sheets esteja fora do ar.
  vagasPreenchidas: 0,

  // -----------------------------------------------------------
  // 4. PREÇO
  // -----------------------------------------------------------
  // Preço da turma. Escreva como texto, já formatado em R$.
  preco: "R$ 2.500",

  // -----------------------------------------------------------
  // 5. PRAZO DE INSCRIÇÃO
  // -----------------------------------------------------------
  // Data limite para se inscrever nesta turma (mesmo formato AAAA-MM-DD)
  deadlineInscricao: "2026-07-20",

  // -----------------------------------------------------------
  // 6. ENVIO DO FORMULÁRIO (Google Sheets)
  // -----------------------------------------------------------
  // Cole aqui a URL do seu Google Apps Script publicado como Web App.
  // Veja o GUIA-ATUALIZACAO.md, seção "Como configurar o Google Sheets",
  // para o passo a passo de como gerar essa URL (é feito uma vez só,
  // não muda a cada turma).
  webhookUrl: "https://script.google.com/macros/s/AKfycbxxKxWFbt2IATfZmVnTxdjQwmuKbtOO8nwCFAUKek0IM_5o-EVSjT6ruJEW5Y0sqbEy/exec",

  // -----------------------------------------------------------
  // 7. DEPOIMENTOS
  // -----------------------------------------------------------
  // Pode adicionar quantos quiser. Cada um precisa de: texto, nome, cargo.
  depoimentos: [
    {
      texto: "Saí do curso usando IA para analisar balanços de bancos em tempo real.",
      nome: "Hélio Magalhães",
      cargo: "Conselheiro C-Level · participante"
    }
    // Para adicionar outro depoimento, copie o bloco abaixo (descomentando)
    // e cole depois da vírgula do depoimento anterior:
    //
    // ,{
    //   texto: "Texto do depoimento aqui.",
    //   nome: "Nome da pessoa",
    //   cargo: "Cargo · Empresa"
    // }
  ],

};
