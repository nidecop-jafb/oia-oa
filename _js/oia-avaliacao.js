/* oia-avaliacao.js — avaliacao ANONIMA da oficina (encerramento). Gerado por gerar_site_oia.py.
   Coletor FC1 F27 (tipo AVALIACAO, origem OIA). Sem RA, sem nome. Sem internet: fica na fila do aparelho. */
(function () {
  var URL_EXEC = window.OIA_COLETA || '', D = window.OIA_AVA || { notas: [], escolhas: [] }, enviando = false;
  var K_FEITA = 'oia-avaliou', K_FILA = 'oia-avaliacao-fila';
  function $(id) { return document.getElementById(id); }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem localStorage */ } }
  function ler(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function tirar(k) { try { localStorage.removeItem(k); } catch (e) { /* sem localStorage */ } }
  function erro(m) { var e = $('avaErro'); e.textContent = m || ''; e.hidden = !m; }
  function online() { return URL_EXEC && location.protocol.indexOf('http') === 0; }
  function marcado(nome) { var r = document.querySelector('input[name="' + nome + '"]:checked'); return r ? r.value : ''; }
  var obrig = function () { return D.notas.concat(D.escolhas); };

  function contar() {
    var n = 0;
    obrig().forEach(function (k) { var ok = !!marcado(k); if (ok) { n++; } $('fa-' + k).classList.toggle('ok', ok); });
    var perfil = $('avaCurso').value && $('avaAno').value && $('avaSessoes').value;
    $('avaConta').textContent = n + '/' + obrig().length + ' respondidas' + (perfil ? '' : ' · falta o passo 1');
    $('btnAvaEnviar').disabled = enviando;
  }
  function dados() {
    var notas = {};
    D.notas.forEach(function (k) { notas[k] = Number(marcado(k)); });
    return { tipo: 'AVALIACAO', origem: 'OIA', id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
             hp: $('avaHp').value, curso: $('avaCurso').value, serie: $('avaAno').value, sessoes: $('avaSessoes').value,
             notas: notas, continuar: marcado('continuar'), recomenda: marcado('recomenda'),
             ajudou: $('avaAjudou').value.trim(), mudar: $('avaMudar').value.trim() };
  }
  function pronto(fila) {
    guardar(K_FEITA, '1');
    $('avaForm').hidden = true; $('avaOk').hidden = false; $('avaFila').hidden = !fila;
    window.scrollTo(0, 0);
  }
  /* O Google as vezes devolve HTML no POST mesmo tendo gravado: confirma pelo id (molde F19b). */
  function confirmar(id) {
    return fetch(URL_EXEC + '?avaliacao_oia_id=' + encodeURIComponent(id)).then(function (r) { return r.json(); })
      .then(function (res) { if (!res.recebida) { throw new Error('nao gravou'); } return res; });
  }
  function postar(d) {
    return fetch(URL_EXEC, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().catch(function () { return confirmar(d.id).then(function () { return { ok: true }; }); }); })
      .then(function (res) { if (!res.ok) { var e = new Error(res.erro || 'Envio recusado.'); e.recusa = true; throw e; } return res; });
  }
  function esvaziarFila() {
    var x = ler(K_FILA);
    if (!x || !online()) { return; }
    var d; try { d = JSON.parse(x); } catch (e) { tirar(K_FILA); return; }
    postar(d).then(function () { tirar(K_FILA); if ($('avaFila')) { $('avaFila').hidden = true; } })
      .catch(function (e) { if (e && e.recusa) { tirar(K_FILA); } });
  }
  function enviar() {
    if (enviando) { return; }
    erro('');
    if (!$('avaCurso').value || !$('avaAno').value || !$('avaSessoes').value) {
      erro('Escolha o seu curso, o seu ano e quantas sessões você fez (lá em cima, no passo 1).'); return;
    }
    var falta = obrig().filter(function (k) { return !marcado(k); });
    if (falta.length) {
      erro('Falta responder ' + falta.length + (falta.length > 1 ? ' itens' : ' item') + ' (marcados sem a borda verde).');
      $('fa-' + falta[0]).scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
    }
    var d = dados();
    if (!online()) { guardar(K_FILA, JSON.stringify(d)); pronto(true); return; }
    enviando = true; $('btnAvaEnviar').textContent = 'Enviando…'; contar();
    postar(d).then(function () { pronto(false); })
      .catch(function (e) {
        if (e && e.recusa) { erro(e.message); return; }
        guardar(K_FILA, JSON.stringify(d)); pronto(true);   /* sem conexao: reenvia depois */
      })
      .then(function () { enviando = false; $('btnAvaEnviar').textContent = 'Enviar a avaliação'; contar(); });
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (ler(K_FEITA) === '1') { $('avaForm').hidden = true; $('avaOk').hidden = false; $('avaFila').hidden = !ler(K_FILA); }
    $('avaForm').addEventListener('change', contar);
    $('btnAvaEnviar').addEventListener('click', enviar);
    window.addEventListener('online', esvaziarFila);
    contar();
    esvaziarFila();
  });
})();
