/* Estilo de aprendizagem da Oficina IA: questionario, resultado e painel do grupo.
   Gerado por gerar_site_oia.py. O servidor (Apps Script LME-6) recalcula os escores; o painel so traz contagens. */
(function () {
  var URL_EXEC = window.OIA_ESTILO_URL || '', D = window.OIA_ESTILO || { dim: [], dicas: {} }, enviando = false;
  function $(id) { return document.getElementById(id); }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem localStorage */ } }
  function ler(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function erro(id, m) { var e = $(id); e.textContent = m || ''; e.hidden = !m; }
  function online() { return URL_EXEC && location.protocol.indexOf('http') === 0; }
  function esc(s) { var d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
  function grau(v) { var a = Math.abs(v); return a >= 5 ? 'forte' : a >= 3 ? 'moderado' : 'equilibrado'; }

  function respostas() {
    var s = '';
    for (var i = 1; i <= 20; i++) {
      var r = document.querySelector('input[name="q' + i + '"]:checked');
      s += r ? r.value : '-';
    }
    return s;
  }
  function contar() {
    var s = respostas(), n = s.replace(/-/g, '').length;
    for (var i = 1; i <= 20; i++) { $('fq' + i).classList.toggle('ok', s.charAt(i - 1) !== '-'); }
    $('estConta').textContent = n + '/20 respondidas';
    $('btnEstEnviar').disabled = n < 20 || enviando;
  }
  function ident() {
    var ra = $('estRA').value.replace(/\D/g, ''), curso = $('estCurso').value, ano = $('estAno').value;
    if (ra.length < 4 || ra.length > 14) { return { erro: 'Digite o seu RA (só os números).' }; }
    if (!curso || !ano) { return { erro: 'Escolha o seu curso e o seu ano.' }; }
    guardar('oia-estilo-ra', ra); guardar('oia-estilo-curso', curso); guardar('oia-estilo-ano', ano);
    return { ra: ra, turma: curso + ' ' + ano };
  }

  function barras(e) {
    return D.dim.map(function (d, k) {
      var v = e[k], pct = Math.abs(v) / 5 * 50, lado = v > 0 ? d[1] : d[2];
      var span = v > 0 ? '<span style="right:50%;width:' + pct + '%"></span>'
                       : '<span class="b" style="left:50%;width:' + pct + '%"></span>';
      var txt = grau(v) === 'equilibrado' ? 'Equilibrado, pende levemente para ' + lado
                                          : lado + ' — ' + grau(v);
      return '<div class="dim"><div class="dim-polos"><span>' + d[1] + '</span><span>' + d[2] + '</span></div>' +
             '<div class="dim-barra" role="img" aria-label="' + esc(txt) + '">' + span + '</div>' +
             '<div class="dim-grau">' + esc(txt) + ' (' + Math.abs(v) + ' de 5)</div></div>';
    }).join('');
  }
  /* Prompts: polo forte = Aproveite, polo fraco = Equilibre; equilibrado = 2 de cada polo. */
  var ultimo = null;
  function tema() {
    var s = $('estTema').value, t = s === '*' ? $('estTemaOutro').value.trim() : s;
    return t || '[o tema da aula]';
  }
  function bloco(rotulo, polo) {
    var t = tema();
    return '<p class="p-rot">' + rotulo + '</p>' + D.prompts[polo].map(function (x) {
      return '<div class="prompt"><p>' + esc(x.replace(/\{tema\}/g, t)) + '</p>' +
             '<button type="button" class="copiar">Copiar</button></div>';
    }).join('');
  }
  function dicas(e) {
    return D.dim.map(function (d, k) {
      var v = e[k];
      if (Math.abs(v) <= 1) {
        return '<h3 class="p-dim">' + d[1] + ' e ' + d[2] + ' <span>(equilibrado)</span></h3>' +
               bloco('Mantenha o ' + d[1] + ':', d[1]) + bloco('Mantenha o ' + d[2] + ':', d[2]);
      }
      var p = v > 0 ? d[1] : d[2], o = v > 0 ? d[2] : d[1];
      return '<h3 class="p-dim">' + p + ' <span>(' + grau(v) + ')</span></h3>' +
             bloco('Aproveite o seu lado ' + p + ':', p) + bloco('Equilibre: treine o lado ' + o + ':', o);
    }).join('');
  }
  function redesenhar() {
    $('estTemaOutro').hidden = $('estTema').value !== '*';
    guardar('oia-estilo-tema', $('estTema').value); guardar('oia-estilo-tema-outro', $('estTemaOutro').value);
    if (ultimo) { $('estDicas').innerHTML = dicas(ultimo); }
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
  function curto(v, d) { return (v > 0 ? d[3] : d[4]) + ' ' + Math.abs(v); }
  function historico(h) {
    if (!h || !h.length) { return '<p class="nota">Ainda não há envios guardados para este RA.</p>'; }
    var linhas = h.map(function (x) {
      return '<tr><td>' + esc(String(x.data).slice(0, 16)) + '</td>' +
             D.dim.map(function (d, k) { return '<td>' + curto(x.escores[k], d) + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<table class="hist"><thead><tr><th>Data</th>' +
           D.dim.map(function (d) { return '<th>' + d[3] + '/' + d[4] + '</th>'; }).join('') +
           '</tr></thead><tbody>' + linhas + '</tbody></table>' +
           '<p class="nota">' + D.dim.map(function (d) { return d[3] + ' = ' + d[1] + ', ' + d[4] + ' = ' + d[2]; })
             .join(' · ') + '. O número vai de 1 (equilibrado) a 5 (forte).</p>';
  }
  function mostrar(e, h) {
    $('estRes').innerHTML = barras(e);
    ultimo = e;
    guardar('oia-estilo', JSON.stringify(e));   /* lido pelo cronometro do Metodo (oia-metodo.js) */
    $('estDicas').innerHTML = dicas(e);
    $('estHist').innerHTML = historico(h);
    $('resultado').hidden = false;
    $('resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function getJSON(q) {
    return fetch(URL_EXEC + '?' + q).then(function (r) { return r.json(); });
  }
  function enviar() {
    if (enviando) { return; }
    erro('estErro', ''); erro('estErroId', '');
    var id = ident();
    if (id.erro) { erro('estErro', id.erro + ' (lá em cima, no passo 1)'); return; }
    var resp = respostas();
    if (resp.indexOf('-') >= 0) { erro('estErro', 'Responda as 20 perguntas antes de enviar.'); return; }
    if (!online()) { erro('estErro', 'Para enviar, abra o site com internet.'); return; }
    enviando = true; contar(); $('btnEstEnviar').textContent = 'Enviando…';
    fetch(URL_EXEC, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                      body: JSON.stringify({ tipo_msg: 'ESTILO', disciplina: 'OIA', ra: id.ra, turma: id.turma,
                                             respostas: resp }) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) { throw new Error(res.erro || 'Envio recusado. Tente de novo.'); }
        mostrar(res.escores, res.historico);
        carregarGrupo();
      })
      .catch(function (e) { erro('estErro', (e && e.message) || 'Falha de conexão. Confira a internet e tente de novo.'); })
      .then(function () { enviando = false; $('btnEstEnviar').textContent = 'Enviar e ver o meu resultado'; contar(); });
  }
  function meus() {
    erro('estErroId', '');
    var ra = $('estRA').value.replace(/\D/g, '');
    if (ra.length < 4) { erro('estErroId', 'Digite o seu RA (só os números).'); return; }
    if (!online()) { erro('estErroId', 'Para consultar, abra o site com internet.'); return; }
    guardar('oia-estilo-ra', ra);
    getJSON('estilo=1&disciplina=OIA&ra=' + encodeURIComponent(ra)).then(function (res) {
      if (!res.ok) { throw new Error(res.erro); }
      if (!res.historico.length) { erro('estErroId', 'Ainda não há respostas com este RA. Responda o questionário abaixo.'); return; }
      mostrar(res.historico[res.historico.length - 1].escores, res.historico);
    }).catch(function (e) { erro('estErroId', (e && e.message) || 'Falha de conexão. Tente de novo.'); });
  }

  function carregarGrupo() {
    if (!online()) { $('estGrupo').innerHTML = '<p class="nota">O painel do grupo aparece com internet.</p>'; return; }
    var sel = $('estTurma'), t = sel.value;
    getJSON('estilo_painel=1&disciplina=OIA' + (t ? '&turma=' + encodeURIComponent(t) : '')).then(function (res) {
      if (!res.ok) { throw new Error(res.erro); }
      var nomes = Object.keys(res.turmas).sort();
      while (sel.options.length > 1) { sel.remove(1); }
      nomes.forEach(function (n) { var o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); });
      sel.value = t;
      if (!res.n) { $('estGrupo').innerHTML = '<p class="nota">Ainda não há respostas' + (t ? ' desta turma' : '') + '.</p>'; return; }
      $('estGrupo').innerHTML = '<p><strong>' + res.n + '</strong> participante' + (res.n > 1 ? 's' : '') + '.</p>' +
        D.dim.map(function (d) {
          var c = res.dist[d[0]], fa = c['5'], ma = c['3'], eq = c['1'] + c['-1'], mb = c['-3'], fb = c['-5'];
          var seg = function (cl, x) { return x ? '<span class="' + cl + '" style="width:' + (x / res.n * 100) + '%"></span>' : ''; };
          return '<div class="dim"><div class="dim-polos"><span>' + d[1] + '</span><span>' + d[2] + '</span></div>' +
                 '<div class="grupo-barra" role="img" aria-label="' + d[1] + ' ' + (fa + ma) + ', equilibrado ' + eq + ', ' +
                 d[2] + ' ' + (mb + fb) + '">' + seg('fa', fa) + seg('ma', ma) + seg('eq', eq) + seg('mb', mb) + seg('fb', fb) +
                 '</div><p class="grupo-leg">' + d[1] + ': ' + (fa + ma) + ' (forte ' + fa + ' · moderado ' + ma + ') · ' +
                 'equilibrado: ' + eq + ' · ' + d[2] + ': ' + (mb + fb) + ' (moderado ' + mb + ' · forte ' + fb + ')</p></div>';
        }).join('') + '<p class="nota">Cor cheia = forte; cor clara = moderado; cinza = equilibrado.</p>';
    }).catch(function () { $('estGrupo').innerHTML = '<p class="nota">Não foi possível carregar o painel agora.</p>'; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('estRA').value = ler('oia-estilo-ra');
    $('estCurso').value = ler('oia-estilo-curso');
    $('estAno').value = ler('oia-estilo-ano');
    $('estForm').addEventListener('change', contar);
    $('btnEstEnviar').addEventListener('click', enviar);
    $('btnEstMeus').addEventListener('click', meus);
    $('estTurma').addEventListener('change', carregarGrupo);
    $('estTema').value = ler('oia-estilo-tema'); if ($('estTema').selectedIndex < 0) { $('estTema').value = ''; }
    $('estTemaOutro').value = ler('oia-estilo-tema-outro');
    $('estTemaOutro').hidden = $('estTema').value !== '*';
    $('estTema').addEventListener('change', redesenhar);
    $('estTemaOutro').addEventListener('input', redesenhar);
    $('estDicas').addEventListener('click', function (ev) { if (ev.target.classList.contains('copiar')) { copiar(ev.target); } });
    contar();
    carregarGrupo();
  });
})();
