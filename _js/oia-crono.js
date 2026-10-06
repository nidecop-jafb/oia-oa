/* oia-crono.js — icone do cronometro no topo: abre o Resumo em Audio do metodo. Gerado por gerar_site_oia.py. */
(function () {
  var b = document.getElementById('cronoBtn');
  if (!b) { return; }
  var AUDIOS = [];
  var base = (document.currentScript && document.currentScript.src) || location.href;
  b.addEventListener('click', function () {
    var d = document.createElement('dialog');
    d.className = 'crono-dlg';
    d.setAttribute('aria-labelledby', 'cronoTit');
    d.innerHTML = '<h2 id="cronoTit">Resumo em Áudio</h2><div class="texto"></div>' +
                  '<div class="acoes"><button type="button">Fechar</button></div>';
    var caixa = d.querySelector('.texto'), p = document.createElement('p');
    p.textContent = 'Cada sessão de estudo tem 30 minutos: Aquecimento (até 10), Estudo focado (até 15) e ' +
                    'Atividade final (até 5). Ouça a versão rápida e, em seguida, a curta.';
    caixa.appendChild(p);
    if (AUDIOS.length) {
      var au = document.createElement('div'); au.className = 'crono-audio';
      AUDIOS.forEach(function (x) {
        var r = document.createElement('p'), a = document.createElement('audio');
        r.textContent = x[0]; a.controls = true; a.preload = 'none'; a.src = new URL(x[1], base).href;
        a.addEventListener('play', function () {
          [].forEach.call(au.querySelectorAll('audio'), function (o) { if (o !== a) { o.pause(); } });
        });
        au.appendChild(r); au.appendChild(a);
      });
      caixa.appendChild(au);
    } else {
      var e = document.createElement('p'); e.textContent = 'O áudio chega em breve.'; caixa.appendChild(e);
    }
    function sair() {
      [].forEach.call(d.querySelectorAll('audio'), function (a) { a.pause(); });
      if (d.open && d.close) { d.close(); }
      d.remove();
    }
    d.querySelector('.acoes button').addEventListener('click', sair);
    d.addEventListener('close', sair);
    d.addEventListener('click', function (ev) { if (ev.target === d) { sair(); } });
    document.body.appendChild(d);
    if (d.showModal) { d.showModal(); } else { d.setAttribute('open', ''); }
  });
})();
