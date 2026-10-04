/* oia-abas.js — abas laterais, A-/A+ e tema. Gerado por _site/gerar_site_oia.py. */
(function () {
  var toggles = [].slice.call(document.querySelectorAll('.aba-toggle'));
  function painel(t) { return document.getElementById(t.id.replace(/T$/, '')); }
  function empilhar() {
    /* 9 abas: se nao couberem na altura da tela, a letra das linguetas diminui */
    document.body.classList.remove('abas-compactas');
    function pos(gap) { var y = 56; toggles.forEach(function (t) { t.style.top = y + 'px'; y += t.offsetHeight + gap; }); return y; }
    if (pos(10) > window.innerHeight) { document.body.classList.add('abas-compactas'); pos(4); }
  }
  function fechar() {
    toggles.forEach(function (t) { t.classList.remove('ativa'); painel(t).classList.remove('open'); });
  }
  toggles.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      var abrir = !painel(t).classList.contains('open');
      fechar();
      if (abrir) { painel(t).classList.add('open'); t.classList.add('ativa'); }
    });
  });
  [].slice.call(document.querySelectorAll('.aba-painel')).forEach(function (p) {
    p.addEventListener('click', function (e) { if (!e.target.closest('a')) { e.stopPropagation(); } });
  });
  document.addEventListener('click', fechar);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fechar(); } });
  empilhar();
  window.addEventListener('resize', empilhar);
})();

/* A-/A+: 3 tamanhos (normal, g, gg); a escolha vem do <head> e fica em oia-letra. */
(function () {
  var h = document.documentElement, menos = document.getElementById('letraMenos'),
      mais = document.getElementById('letraMais'), passos = ['', 'g', 'gg'];
  if (!menos || !mais) { return; }
  function atual() { return Math.max(0, passos.indexOf(h.getAttribute('data-letra') || '')); }
  function mostrar() { var i = atual(); menos.disabled = i === 0; mais.disabled = i === passos.length - 1; }
  function mudar(d, e) {
    e.stopPropagation();
    var i = Math.min(passos.length - 1, Math.max(0, atual() + d));
    if (passos[i]) { h.setAttribute('data-letra', passos[i]); } else { h.removeAttribute('data-letra'); }
    try { localStorage.setItem('oia-letra', passos[i]); } catch (err) { /* sem localStorage */ }
    mostrar();
    window.dispatchEvent(new Event('resize'));
  }
  menos.addEventListener('click', function (e) { mudar(-1, e); });
  mais.addEventListener('click', function (e) { mudar(1, e); });
  mostrar();
})();

/* Tema (sol/lua): o inicial vem do <head> (escolha guardada ou o do aparelho). */
(function () {
  var b = document.getElementById('temaBtn'), h = document.documentElement;
  if (!b) { return; }
  function rotulo() {
    var r = h.getAttribute('data-tema') === 'claro' ? 'Mudar para o modo escuro' : 'Mudar para o modo claro';
    b.setAttribute('aria-label', r); b.title = r;
  }
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    var novo = h.getAttribute('data-tema') === 'claro' ? 'escuro' : 'claro';
    h.setAttribute('data-tema', novo);
    try { localStorage.setItem('oia-tema', novo); } catch (err) { /* sem localStorage */ }
    rotulo();
  });
  rotulo();
})();
