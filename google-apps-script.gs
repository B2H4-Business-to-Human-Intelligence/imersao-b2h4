/* ============================================================
   GOOGLE APPS SCRIPT — recebe as inscrições da landing page
   e grava como nova linha numa planilha Google Sheets.

   COMO INSTALAR (faça isso UMA VEZ SÓ, não muda a cada turma):

   1. Crie uma planilha nova no Google Sheets (sheets.new).
      Dê o nome que quiser, ex: "Inscrições Imersão C-Level".

   2. Na primeira linha (linha 1), crie estas colunas, exatamente
      nesta ordem:
      A: Data/Hora | B: Nome | C: Empresa | D: Cargo | E: WhatsApp
      F: E-mail | G: Gargalo | H: Turma (data) | I: Status Turma | J: Origem

   3. No menu, clique em Extensões → Apps Script.

   4. Apague o conteúdo padrão (function myFunction(){}) e cole
      TODO o código abaixo no lugar.

   5. Clique no ícone de disquete (Salvar projeto).

   6. Clique em "Implantar" (Deploy) → "Nova implantação"
      (New deployment).

   7. Em "Tipo", escolha "App da Web" (Web app).

   8. Configure:
      - Executar como: Eu (seu e-mail)
      - Quem pode acessar: Qualquer pessoa (Anyone)

   9. Clique em "Implantar". O Google vai pedir permissão —
      autorize (é a sua própria planilha, é seguro).

   10. Copie a URL que aparece ("URL do app da Web"). Essa é a
       URL que você cola no campo "webhookUrl" do arquivo
       config.js da landing page.

   IMPORTANTE: se você editar este script depois, precisa criar
   uma NOVA implantação (ou editar a implantação existente) pra
   a mudança valer — só salvar o código não atualiza a URL já em uso.
   ============================================================ */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.nome || "",
      data.empresa || "",
      data.cargo || "",
      data.whatsapp || "",
      data.email || "",
      data.gargalo || "",
      data.turmaData || "",
      data.statusTurma || "",
      data.origem || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
