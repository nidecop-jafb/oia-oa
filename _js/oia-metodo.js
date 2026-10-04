/* oia-metodo.js — cronometro da sessao de 30 min (aba Metodo, botoes Comecar das abas Fisica).
   Gerado por _scripts/gerar_site_oia.py — nao editar a mao. ?rapido=1: 1 min vira 1 s (teste). */
(function () {
  var D = {"etapas": [["Antes", 5, "Leia o objetivo e os títulos dos marcadores da sessão, sem estudar ainda. A partir da 2.ª sessão do tema, use os 2 primeiros minutos para lembrar, sem olhar o livro, o que estudou na sessão anterior.", "Vou estudar {tema} no livro Física Identidade, páginas {paginas}. Os subtítulos são: {marcadores}. Antes de eu ler, faça 3 perguntas curtas sobre o que eu já sei desse assunto e diga, em 2 linhas, que ideia liga esses subtítulos. Não explique o conteúdo ainda."], ["Durante", 20, "Leitura ativa das páginas da sessão: anote as ideias principais, refaça os exemplos resolvidos e marque o que não entendeu. A IA entra só quando você travar.", "Estou lendo {tema} (páginas {paginas}). Vou colar um trecho ou exemplo que não entendi: explique com um exemplo da mineração ou do dia a dia e me faça uma pergunta para checar se entendi. Não resolva os exercícios por mim. Trecho: [cole aqui]"], ["Depois", 5, "Escreva um resumo de 3 linhas e resolva 1 questão. Na última sessão do tema, faça as Atividades finais do livro.", "Acabei de estudar {tema} (páginas {paginas}). Meu resumo em 3 linhas: [escreva aqui]. Corrija o que estiver errado ou faltando, sem reescrever tudo, e me dê 1 questão curta para eu resolver agora. Depois confira a minha resposta, com as unidades."]], "recordar": "Na sessão anterior deste tema, lembro sem olhar o livro que: [escreva aqui]. Aponte o que ficou faltando. ", "ultima": " Esta é a última sessão do tema: a questão deve ser no estilo das Atividades finais do livro.", "ajuste": {"Ativo": "Aprendo melhor fazendo: inclua uma tarefa prática ou um desafio rápido.", "Reflexivo": "Aprendo melhor pensando sozinho primeiro: faça perguntas em vez de explicar direto.", "Sensorial": "Aprendo melhor com exemplos concretos, com números e unidades.", "Intuitivo": "Aprendo melhor pela ideia geral e pelas conexões com outros assuntos.", "Visual": "Aprendo melhor com figuras: descreva um desenho ou esquema que eu possa fazer no caderno.", "Verbal": "Aprendo melhor com explicações em palavras, curtas e claras.", "Sequencial": "Aprendo melhor passo a passo, uma etapa de cada vez.", "Global": "Aprendo melhor vendo o quadro geral antes dos detalhes."}, "dim": [["AR", "Ativo", "Reflexivo", "At", "Rf"], ["SI", "Sensorial", "Intuitivo", "Se", "In"], ["VV", "Visual", "Verbal", "Vi", "Ve"], ["SG", "Sequencial", "Global", "Sq", "Gl"]]};
  var RAPIDO = /[?&]rapido=1/.test(location.search), MIN = RAPIDO ? 1000 : 60000;
  function esc(s) { var d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
  function estilo() {
    try {
      var e = JSON.parse(localStorage.getItem('oia-estilo') || 'null'), k = -1, m = 1;
      if (!e) { return ''; }
      e.forEach(function (v, i) { if (Math.abs(v) > m) { m = Math.abs(v); k = i; } });
      return k < 0 ? '' : (e[k] > 0 ? D.dim[k][1] : D.dim[k][2]);
    } catch (x) { return ''; }
  }
  function prompt(i, s) {
    var p = D.etapas[i][3].replace(/\{tema\}/g, s.tema).replace(/\{paginas\}/g, s.pag).replace(/\{marcadores\}/g, s.marc);
    if (i === 0 && s.sess > 1) { p = D.recordar + p; }
    if (i === 2 && s.sess === s.total && s.total > 1) { p += D.ultima; }
    var polo = estilo();
    return polo ? p + ' ' + D.ajuste[polo] : p;
  }
  function copiar(btn) {
    var txt = btn.previousElementSibling.textContent;
    function ok() { btn.textContent = 'Copiado!'; setTimeout(function () { btn.textContent = 'Copiar'; }, 1800); }
    function velho() {
      var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { btn.textContent = 'Selecione e copie'; }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(txt).then(ok, velho); } else { velho(); }
  }
  /* Tempo pelo relogio (Date.now), nao por ticks: continua certo com a tela bloqueada. */
  var box = null, s = null, fim = 0, etapa = 0, pausa = 0, tick = null;
  function dur(i) { return D.etapas[i][1] * MIN; }
  function desenhar() {
    var resta = Math.max(0, (pausa || fim) - (pausa ? 0 : Date.now()));
    if (pausa) { resta = pausa; }
    var seg = Math.ceil(resta / (RAPIDO ? 1000 / 60 : 1000)), mm = Math.floor(seg / 60), ss = seg % 60;
    box.querySelector('.c-relogio').textContent = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
  }
  function mostrarEtapa() {
    var e = D.etapas[etapa];
    box.querySelector('.c-etapas').innerHTML = D.etapas.map(function (x, i) {
      return '<span class="' + (i === etapa ? 'on' : i < etapa ? 'ok' : '') + '">' + x[0] + ' · ' + x[1] + ' min</span>';
    }).join('');
    box.querySelector('.c-txt').textContent = e[2];
    box.querySelector('.c-prompt').innerHTML = '<p>' + esc(prompt(etapa, s)) + '</p><button type="button" class="copiar">Copiar</button>';
    desenhar();
  }
  function passo() {
    if (pausa) { return; }
    if (Date.now() >= fim) {
      if (etapa === D.etapas.length - 1) { concluir(); return; }
      etapa += 1; fim += dur(etapa); avisar(); mostrarEtapa();
    }
    desenhar();
  }
  function avisar() {
    box.classList.remove('troca'); void box.offsetWidth; box.classList.add('troca');
    try { if (navigator.vibrate) { navigator.vibrate([300, 150, 300]); } } catch (x) { /* sem vibracao */ }
  }
  function concluir() {
    clearInterval(tick); avisar();
    box.querySelector('.c-relogio').textContent = '00:00';
    box.querySelector('.c-etapas').innerHTML = D.etapas.map(function (x) { return '<span class="ok">' + x[0] + ' ✓</span>'; }).join('');
    box.querySelector('.c-txt').textContent = s.sess < s.total
      ? 'Sessão concluída. A próxima sessão deste tema fica para outro dia.'
      : 'Sessão concluída: você terminou este tema.';
    box.querySelector('.c-pausa').hidden = true; box.querySelector('.c-pular').hidden = true;
  }
  function abrir(b) {
    s = { tema: b.getAttribute('data-tema'), pag: b.getAttribute('data-pag'), marc: b.getAttribute('data-marc'),
          sess: +b.getAttribute('data-sess'), total: +b.getAttribute('data-total') };
    box = document.createElement('div');
    box.className = 'crono'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Cronômetro da sessão');
    box.innerHTML = '<div class="crono-in"><h2>' + esc(s.tema) + '</h2><p class="c-sub">Sessão ' + s.sess + ' de ' + s.total +
      ' · páginas ' + esc(s.pag) + '<br>' + esc(s.marc) + '</p><div class="c-etapas"></div>' +
      '<div class="c-relogio" aria-live="off"></div><p class="c-txt" aria-live="polite"></p><div class="prompt c-prompt"></div>' +
      '<div class="c-acoes"><button type="button" class="c-pausa">Pausar</button><button type="button" class="c-pular">Próxima etapa</button>' +
      '<button type="button" class="c-sair">Encerrar</button></div>' + (RAPIDO ? '<p class="c-sub">Modo de teste: 1 min = 1 s.</p>' : '') + '</div>';
    document.body.appendChild(box);
    etapa = 0; pausa = 0; fim = Date.now() + dur(0);
    mostrarEtapa();
    tick = setInterval(passo, RAPIDO ? 100 : 500);
    box.addEventListener('click', function (ev) {
      var c = ev.target.classList;
      if (c.contains('copiar')) { copiar(ev.target); }
      else if (c.contains('c-pausa')) {
        if (pausa) { fim = Date.now() + pausa; pausa = 0; ev.target.textContent = 'Pausar'; }
        else { pausa = Math.max(1, fim - Date.now()); ev.target.textContent = 'Continuar'; }
        desenhar();
      } else if (c.contains('c-pular')) { fim = Date.now(); pausa = 0; box.querySelector('.c-pausa').textContent = 'Pausar'; passo(); }
      else if (c.contains('c-sair')) { clearInterval(tick); document.body.removeChild(box); box = null; }
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    [].slice.call(document.querySelectorAll('button.comecar')).forEach(function (b) {
      b.addEventListener('click', function () { abrir(b); });
    });
    [].slice.call(document.querySelectorAll('#abaMetodo .copiar')).forEach(function (b) {
      b.addEventListener('click', function () { copiar(b); });
    });
    var polo = estilo(), el = document.querySelector('#abaMetodo .met-estilo');
    if (el && polo) { el.textContent = 'Seu estilo (aba Estilo): ' + polo + '. Os prompts do cronômetro ganham uma linha para ele: ' + D.ajuste[polo]; el.hidden = false; }
  });
})();
