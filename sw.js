/* sw.js — service worker do oia-oa. Gerado por _site/gerar_site_oia.py — nao editar a mao.
 * Rede primeiro, cache so para o aparelho sem internet (molde rif-oa). */
var CACHE = 'oia-oa-20261004105231';

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(['./', './index.html', './manifest.webmanifest', './_css/oia.css', './_js/oia-abas.js',
                     './_icones/icon-oia-192.png', './_icones/icon-oia-512.png']);
  }).catch(function () { /* sem rede na instalacao: segue sem cache */ }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== CACHE; })
                            .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') { return; }
  if (new URL(e.request.url).origin !== self.location.origin) { return; }
  /* O GitHub Pages manda max-age=600 no HTML: sem furar o cache do navegador, o fetch
     "de rede" devolveria a copia velha (LESSONS 2026-09-16). */
  var furar = e.request.url + (e.request.url.indexOf('?') < 0 ? '?' : '&') + '_sw=' + Date.now();
  e.respondWith(
    fetch(furar, { cache: 'no-store' }).then(function (resp) {
      if (resp && resp.ok && resp.type === 'basic') {
        var copia = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      }
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('./'); });
    })
  );
});
