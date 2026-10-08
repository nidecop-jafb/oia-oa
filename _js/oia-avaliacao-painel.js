/* oia-avaliacao-painel.js — painel ao vivo da avaliacao (equipe). Gerado por gerar_site_oia.py.
   A chave da equipe e digitada aqui (ou chega 1 vez por #chave=, do instalador do pen drive) e fica salva
   neste aparelho (localStorage), como na chamada do professor: nunca vai no site. 'sair' limpa. */
(function () {
  var URL_EXEC = window.OIA_COLETA || '', D = window.OIA_AVA || {}, linhas = [], timer = null;
  function $(id) { return document.getElementById(id); }
  function esc(s) { var d = document.createElement('div'); d.textContent = String(s == null ? '' : s); return d.innerHTML; }
  function chave() { try { return sessionStorage.getItem('oia-chave') || localStorage.getItem('oia-chave') || ''; } catch (e) { return ''; } }
  function provisoria(k) { try { sessionStorage.setItem('oia-chave', k); } catch (e) { /* sem sessionStorage */ } }
  function gravar(k) { try { localStorage.setItem('oia-chave', k); } catch (e) { /* sem localStorage */ } }
  function limpar() { try { localStorage.removeItem('oia-chave'); sessionStorage.removeItem('oia-chave'); } catch (e) { /* nada */ } }
  function media(xs) { return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : 0; }
  function f1(x) { return x.toFixed(1).replace('.', ','); }
  function validas() { return linhas.filter(function (l) { return $('avaTeste').checked || !l.teste; }); }

  function barra(rot, xs, cl) {
    var m = media(xs);
    return '<div class="ava-item"><p>' + esc(rot) + ' <strong>' + (xs.length ? f1(m) : '–') + '</strong></p>' +
           '<div class="ava-bar' + (cl || '') + '" role="img" aria-label="' + esc(rot) + ': média ' + f1(m) + ' de 5">' +
           '<span style="width:' + (m / 5 * 100) + '%"></span></div></div>';
  }
  function contagem(rot, ls, campo, opcoes) {
    var c = {}; ls.forEach(function (l) { c[l[campo]] = (c[l[campo]] || 0) + 1; });
    return '<p>' + esc(rot) + ': ' + opcoes.map(function (o) { return esc(o[1]) + ' <strong>' + (c[o[0]] || 0) + '</strong>'; })
      .join(' · ') + '</p>';
  }
  function desenhar() {
    var ls = validas(), n = ls.length, h = '';
    h += '<p><span class="ava-n">' + n + '</span> resposta' + (n === 1 ? '' : 's') + '</p>';
    if (!n) { $('avaRes').innerHTML = h + '<p class="nota">Ainda não há respostas.</p>'; return; }
    D.grupos.forEach(function (g) {
      h += '<h2>' + esc(g[0]) + '</h2>';
      if (g[0] === 'Antes e agora') {
        var a = ls.map(function (l) { return l.notas.a1; }), b = ls.map(function (l) { return l.notas.a2; });
        h += barra(g[4][0][1], a) + barra(g[4][1][1], b, ' b') +
             '<p class="ava-sub">Diferença média: <strong>' + (media(b) - media(a) >= 0 ? '+' : '') + f1(media(b) - media(a)) +
             '</strong> ponto (escala de 1 a 5).</p>';
        return;
      }
      g[4].forEach(function (it) {
        var xs = ls.map(function (l) { return l.notas[it[0]]; }), usou = xs.filter(function (x) { return x > 0; });
        h += barra(it[1], usou);
        if (g[3]) { h += '<p class="ava-sub">Não usei: ' + (xs.length - usou.length) + '</p>'; }
      });
    });
    h += '<h2>Escolhas</h2>' + D.escolhas.map(function (e) { return contagem(e[1], ls, e[0], D.opcoes); }).join('');
    h += '<h2>Perfil</h2>' + contagem('Curso', ls, 'curso', D.cursos.map(function (c) { return [c, c]; })) +
         contagem('Ano', ls, 'serie', D.anos) + contagem('Sessões', ls, 'sessoes', D.sessoes);
    D.abertas.forEach(function (ab) {
      var t = ls.map(function (l) { return String(l[ab[0]] || '').trim(); }).filter(Boolean);
      h += '<h2>' + esc(ab[1]) + ' <span class="ava-sub">(' + t.length + ')</span></h2>' +
           (t.length ? '<ul class="ava-abertas">' + t.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'
                     : '<p class="nota">Nenhuma ainda.</p>');
    });
    $('avaRes').innerHTML = h;
  }
  function carregar() {
    var k = chave();
    if (!k) { return; }
    $('avaStatus').textContent = 'Atualizando…';
    fetch(URL_EXEC + '?avaliacao_oia=1&chave=' + encodeURIComponent(k)).then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) { throw new Error(res.erro || 'Falha'); }
        gravar(k); linhas = res.linhas; $('avaChaveBox').hidden = true; $('avaPainel').hidden = false; desenhar(); janela(res);
        $('avaStatus').textContent = 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5) + ' · a cada 30 s';
      })
      .catch(function (e) {
        if (String(e.message).indexOf('Chave') === 0) {
          var salva = ''; try { salva = localStorage.getItem('oia-chave') || ''; sessionStorage.removeItem('oia-chave'); } catch (x) { /* nada */ }
          if (salva && salva !== k) { carregar(); return; }
          limpar();
          clearInterval(timer); $('avaPainel').hidden = true; $('avaChaveBox').hidden = false;
          $('avaChaveErro').textContent = 'Chave inválida.'; $('avaChaveErro').hidden = false; return;
        }
        $('avaStatus').textContent = 'Sem conexão agora; tento de novo em 30 s.';
      });
  }
  /* Janela da avaliacao (F28): aberta ate a equipe fechar; o QR grande so aparece com ela aberta. */
  function janela(res) {
    var h = res.desde ? String(res.desde).slice(11, 16) : '';
    $('avaJanela').innerHTML = res.aberta ? '<strong>Avaliação aberta</strong>' + (h ? ' desde ' + h : '') + '.'
                                          : '<strong>Avaliação fechada.</strong> Os participantes veem o aviso de espera.';
    $('btnAvaAbrir').hidden = !!res.aberta; $('btnAvaFechar').hidden = !res.aberta; $('avaQr').hidden = !res.aberta;
  }
  function mudarJanela(acao) {
    $('btnAvaAbrir').disabled = $('btnAvaFechar').disabled = true;
    fetch(URL_EXEC, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                      body: JSON.stringify({ tipo: 'AVALIACAO_JANELA', chave: chave(), acao: acao }) })
      .then(function (r) { return r.json(); })
      .then(function (res) { if (!res.ok) { throw new Error(res.erro); } janela(res); })
      .catch(function () { carregar(); })   /* a volta do POST pode vir em HTML: o GET confirma o estado */
      .then(function () { $('btnAvaAbrir').disabled = $('btnAvaFechar').disabled = false; });
  }
  function entrar() {
    var k = $('avaChave').value.trim();
    if (!k) { return; }
    provisoria(k); $('avaChaveErro').hidden = true; iniciar();
  }
  function iniciar() { clearInterval(timer); carregar(); timer = setInterval(carregar, 30000); }
  function csv() {
    var cab = ['recebida', 'curso', 'ano', 'sessoes'].concat(D.notas).concat(['continuar', 'recomenda', 'ajudou', 'mudar', 'teste']);
    var q = function (v) { v = String(v == null ? '' : v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var corpo = validas().map(function (l) {
      return [l.data, l.curso, l.serie, l.sessoes].concat(D.notas.map(function (k) { return l.notas[k]; }))
        .concat([l.continuar, l.recomenda, l.ajudou, l.mudar, l.teste ? 'sim' : '']).map(q).join(';');
    });
    var blob = new Blob(['﻿' + [cab.join(';')].concat(corpo).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'oia-avaliacao-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  /* Projetar: tela cheia so com o resultado (e o QR, se a avaliacao estiver aberta), letra grande; Esc ou o botao saem. */
  function projetar(on) {
    document.body.classList.toggle('projetando', on);
    $('btnAvaSairProj').hidden = !on;
    var de = document.documentElement;
    if (on && !document.fullscreenElement && de.requestFullscreen) { de.requestFullscreen().catch(function () { /* sem tela cheia */ }); }
    if (!on && document.fullscreenElement && document.exitFullscreen) { document.exitFullscreen(); }
    window.scrollTo(0, 0);
  }
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && document.body.classList.contains('projetando')) { projetar(false); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { projetar(false); } });
  document.addEventListener('DOMContentLoaded', function () {
    $('btnAvaProjetar').addEventListener('click', function () { projetar(true); });
    $('btnAvaSairProj').addEventListener('click', function () { projetar(false); });
    $('btnAvaChave').addEventListener('click', entrar);
    $('avaChave').addEventListener('keydown', function (e) { if (e.key === 'Enter') { entrar(); } });
    $('btnAvaCsv').addEventListener('click', csv);
    $('btnAvaAbrir').addEventListener('click', function () { mudarJanela('abrir'); });
    $('btnAvaFechar').addEventListener('click', function () {
      if (confirm('Fechar a avaliação? Quem ainda não enviou não vai conseguir enviar.')) { mudarJanela('fechar'); }
    });
    $('btnAvaAtualizar').addEventListener('click', carregar);
    $('avaTeste').addEventListener('change', desenhar);
    $('btnAvaSair').addEventListener('click', function (e) { e.preventDefault(); limpar(); location.reload(); });
    /* 1.o acesso pelo instalador do pen drive: #chave=... (o fragmento nao vai ao servidor); limpa o endereco */
    var hc = (location.hash.match(/[#&]chave=([^&]+)/) || [])[1];
    if (hc) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* nada */ }
      try { hc = decodeURIComponent(hc).trim(); } catch (e) { hc = ''; }
      if (hc) { provisoria(hc); }
    }
    if (chave()) { iniciar(); }
  });
})();
