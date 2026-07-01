/* ============================================================
   APP.JS — lógica da landing page.
   Você não precisa editar este arquivo no dia a dia.
   Tudo que muda a cada turma fica em config.js.
   ============================================================ */

(function () {
  "use strict";

  const cfg = window.TURMA_CONFIG || {};

  /* ---------- Helpers de formatação ---------- */

  function formatarData(isoDate) {
    if (!isoDate) return "Em breve";
    const [ano, mes, dia] = isoDate.split("-").map(Number);
    const d = new Date(ano, mes - 1, dia);
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const diasSemana = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    return `${dia} de ${meses[mes - 1]} · ${diasSemana[d.getDay()]}`;
  }

  function vagasRestantes() {
    const total = Number(cfg.vagasTotais) || 0;
    const preenchidas = Number(cfg.vagasPreenchidas) || 0;
    return Math.max(total - preenchidas, 0);
  }

  function pctPreenchido() {
    const total = Number(cfg.vagasTotais) || 1;
    const preenchidas = Number(cfg.vagasPreenchidas) || 0;
    return Math.min(Math.round((preenchidas / total) * 100), 100);
  }

  /* ---------- Monta os valores para cada data-bind ---------- */

  function getBindValues() {
    const restantes = vagasRestantes();
    const status = cfg.status || "vagas_abertas";

    let vagasTexto, labelVagas, vagasTextoCurto, ctaInscricaoTexto, tituloInscricaoSecao, labelInscricaoSecao;

    if (status === "esgotada") {
      vagasTexto = "Turma esgotada";
      labelVagas = "Status";
      vagasTextoCurto = "Esgotada";
      ctaInscricaoTexto = "Entrar na lista de espera";
      tituloInscricaoSecao = "Turma esgotada. Entre na lista de espera.";
      labelInscricaoSecao = "Lista de espera";
    } else if (status === "sem_turma") {
      vagasTexto = "Em breve";
      labelVagas = "Próxima turma";
      vagasTextoCurto = "Em breve";
      ctaInscricaoTexto = "Avise-me da próxima turma";
      tituloInscricaoSecao = "Quero ser avisado da próxima turma.";
      labelInscricaoSecao = "Próxima turma";
    } else {
      vagasTexto = "Sujeito a aprovação";
      labelVagas = "Vagas Limitadas";
      vagasTextoCurto = "Vagas limitadas";
      ctaInscricaoTexto = "Garantir minha vaga";
      tituloInscricaoSecao = "Garanta sua vaga na imersão.";
      labelInscricaoSecao = "Próxima turma";
    }

    return {
      dataFormatada: (status === "sem_turma") ? "A definir" : formatarData(cfg.data),
      horario: (status === "sem_turma") ? "—" : (cfg.horario || "—"),
      local: (status === "sem_turma") ? "—" : (cfg.local || "—"),
      localMapUrl: (status === "sem_turma" || !cfg.localMapUrl) ? "" : cfg.localMapUrl,
      vagasTexto,
      labelVagas,
      vagasTextoCurto,
      ctaInscricaoTexto,
      tituloInscricaoSecao,
      labelInscricaoSecao,
      precoFormatado: (status === "sem_turma") ? "Sob consulta" : (cfg.preco || "Sob consulta"),
      progressFill: "",
      progressTrackVisibility: "",
    };
  }

  function aplicarBindings() {
    const values = getBindValues();
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const key = el.getAttribute("data-bind");
      if (key === "progressFill") {
        el.style.width = pctPreenchido() + "%";
        return;
      }
      if (key === "progressTrackVisibility") {
        el.style.display = (cfg.status === "vagas_abertas") ? "" : "none";
        return;
      }
      if (values.hasOwnProperty(key)) {
        el.textContent = values[key];
      }
    });
    // Seta href em elementos com data-bind-href
    document.querySelectorAll("[data-bind-href]").forEach((el) => {
      const key = el.getAttribute("data-bind-href");
      if (values.hasOwnProperty(key) && values[key]) {
        el.href = values[key];
      }
    });
  }

  /* ---------- Formulário de inscrição ---------- */

  function setupForm() {
    const form = document.getElementById("form-inscricao");
    const errorBox = document.getElementById("form-error");
    const successBox = document.getElementById("form-success");
    const submitBtn = document.getElementById("form-submit-btn");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      errorBox.hidden = true;

      // Honeypot check
      if (isBot(form)) return;

      const data = {
        nome: form.nome.value.trim(),
        empresa: form.empresa.value.trim(),
        cargo: form.cargo.value.trim(),
        whatsapp: form.whatsapp.value.trim(),
        email: form.email.value.trim(),
        gargalo: form.gargalo.value.trim(),
        cupom: (form.cupom.value || "").trim().toUpperCase(),
        turmaData: cfg.data || "",
        statusTurma: cfg.status || "",
        origem: "imersao.b2h4.ai",
        enviadoEm: new Date().toISOString(),
      };

      // Validação simples
      if (!data.nome || !data.empresa || !data.cargo || !data.whatsapp || !data.email || !data.gargalo) {
        showError("Preencha todos os campos antes de enviar.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showError("Digite um e-mail válido.");
        return;
      }

      const webhookUrl = cfg.webhookUrl;
      if (!webhookUrl || webhookUrl.indexOf("COLE_AQUI") !== -1) {
        showError("Formulário ainda não configurado. Veja o GUIA-ATUALIZACAO.md (seção Google Sheets).");
        console.warn("TURMA_CONFIG.webhookUrl não configurado.");
        return;
      }

      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>Enviando...</span>";

      try {
        // Google Apps Script Web Apps esperam 'text/plain' ou form-encoded
        // para evitar problemas de CORS com JSON + preflight.
        await fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
        });

        form.hidden = true;
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });

        // Incrementa otimisticamente e re-sincroniza com Sheets após 3s
        cfg.vagasPreenchidas = (Number(cfg.vagasPreenchidas) || 0) + 1;
        aplicarBindings();
        setTimeout(fetchVagasAoVivo, 3000);
      } catch (err) {
        console.error("Erro ao enviar formulário:", err);
        showError("Não conseguimos enviar agora. Tente novamente ou fale direto pelo contato@b2h4.ai.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });

    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.hidden = false;
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }


  /* ---------- Scroll Animations (IntersectionObserver) ---------- */

  function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  /* ---------- Countdown Timer ---------- */

  function setupCountdown() {
    const deadline = cfg.deadlineInscricao;
    if (!deadline) return;

    function updateCountdown() {
      const now = new Date();
      const target = new Date(deadline + 'T23:59:59');
      const diff = target - now;

      if (diff <= 0) {
        document.getElementById('cd-dias').textContent = '0';
        document.getElementById('cd-horas').textContent = '0';
        document.getElementById('cd-min').textContent = '0';
        document.getElementById('cd-seg').textContent = '0';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      document.getElementById('cd-dias').textContent = days;
      document.getElementById('cd-horas').textContent = hours;
      document.getElementById('cd-min').textContent = minutes;
      document.getElementById('cd-seg').textContent = seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ---------- Vagas ao vivo (Google Sheets via Apps Script) ---------- */

  async function fetchVagasAoVivo() {
    const url = cfg.webhookUrl;
    if (!url || url.indexOf("COLE_AQUI") !== -1) return;

    try {
      const turmaParam = cfg.data ? "?turma=" + encodeURIComponent(cfg.data) : "";
      const res = await fetch(url + turmaParam);
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok && typeof json.inscricoes === "number") {
        cfg.vagasPreenchidas = json.inscricoes;
        aplicarBindings();
      }
    } catch (_) {
      // Silently fail — mantém o valor de vagasPreenchidas do config.js
    }
  }

  /* ---------- Honeypot anti-spam ---------- */

  function isBot(form) {
    return form.website && form.website.value;
  }

  /* ---------- Init ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    aplicarBindings();
    setupForm();
    setupScrollAnimations();
    setupCountdown();
    fetchVagasAoVivo();
  });
})();
