/* Envio da sugestao da Oficina IA: anonima; audio so com o aviso marcado. Gerado por gerar_site_oia.py. */
(function () {
  var URL_EXEC = window.OIA_COLETA || '', MAX_SEG = 120, MAX_BYTES = 4 * 1024 * 1024;
  var rec = null, pedacos = [], timer = null, inicio = 0, audio = null, mime = '', enviando = false;
  function $(id) { return document.getElementById(id); }
  function erro(m) { var e = $('sugErro'); e.textContent = m || ''; e.hidden = !m; }
  function tipoOk() {
    if (!window.MediaRecorder) { return null; }
    var t = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
    for (var i = 0; i < t.length; i++) { if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t[i])) { return t[i]; } }
    return '';
  }
  function liberarAudio() { $('btnGravar').disabled = !$('chkResp').checked; }
  function gravar() {
    erro('');
    if (!navigator.mediaDevices || !window.MediaRecorder) { erro('Este navegador não grava áudio. Escreva a sugestão.'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
      var m = tipoOk();
      try { rec = m ? new MediaRecorder(st, { mimeType: m }) : new MediaRecorder(st); } catch (e) { rec = new MediaRecorder(st); }
      mime = rec.mimeType || m || 'audio/webm'; pedacos = [];
      rec.ondataavailable = function (ev) { if (ev.data && ev.data.size) { pedacos.push(ev.data); } };
      rec.onstop = function () { st.getTracks().forEach(function (t) { t.stop(); }); pronto(); };
      rec.start(); inicio = Date.now();
      $('btnGravar').hidden = true; $('btnParar').hidden = false; $('audioPrev').hidden = true;
      timer = setInterval(function () {
        var s = Math.floor((Date.now() - inicio) / 1000);
        $('gravTempo').textContent = 'Gravando… ' + Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2) + ' (até 2:00)';
        if (s >= MAX_SEG) { parar(); }
      }, 250);
    }).catch(function () { erro('Sem acesso ao microfone. Autorize o microfone ou escreva a sugestão.'); });
  }
  function parar() {
    if (rec && rec.state !== 'inactive') { rec.stop(); }
    clearInterval(timer); $('btnParar').hidden = true; $('gravTempo').textContent = '';
  }
  function pronto() {
    audio = new Blob(pedacos, { type: mime }); pedacos = [];
    $('btnGravar').hidden = false;
    if (audio.size > MAX_BYTES) { audio = null; erro('O áudio ficou grande demais. Grave de novo, mais curto.'); return; }
    $('audioPrev').src = URL.createObjectURL(audio); $('audioPrev').hidden = false;
    $('btnGravar').textContent = 'Gravar de novo'; $('btnDescartar').hidden = false;
  }
  function descartar() {
    audio = null; $('audioPrev').hidden = true; $('audioPrev').removeAttribute('src');
    $('btnDescartar').hidden = true; $('btnGravar').textContent = 'Gravar áudio';
  }
  function b64(blob) {
    return new Promise(function (ok, falha) {
      var fr = new FileReader();
      fr.onload = function () { ok(String(fr.result).split(',')[1] || ''); };
      fr.onerror = falha; fr.readAsDataURL(blob);
    });
  }
  function enviar() {
    if (enviando) { return; }
    erro('');
    var texto = $('sugTexto').value.trim();
    if (!texto && !audio) { erro('Escreva a sugestão ou grave um áudio.'); return; }
    if (audio && !$('chkResp').checked) { erro('Marque o aviso para enviar o áudio.'); return; }
    if (!URL_EXEC || location.protocol.indexOf('http') !== 0) { erro('Para enviar, abra o site com internet.'); return; }
    enviando = true; $('btnEnviar').disabled = true; $('btnEnviar').textContent = 'Enviando…';
    var dados = { tipo: 'SUGESTAO', origem: 'OIA', trilha: 'Geral', texto: texto, hp: $('sugHp').value,
                  papel: 'Participante (OIA)' };
    (audio ? b64(audio).then(function (x) { dados.audio_b64 = x; dados.audio_mime = mime.split(';')[0]; }) : Promise.resolve())
      .then(function () {
        return fetch(URL_EXEC, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                                 body: JSON.stringify(dados) });
      })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) { throw new Error(res.erro || 'Envio recusado. Tente de novo.'); }
        $('sugForm').hidden = true; $('sugOk').hidden = false;
      })
      .catch(function (e) {
        erro((e && e.message) || 'Falha de conexão. Confira a internet e tente de novo.');
        $('btnEnviar').disabled = false; $('btnEnviar').textContent = 'Enviar sugestão';
      })
      .then(function () { enviando = false; });
  }
  document.addEventListener('DOMContentLoaded', function () {
    $('chkResp').addEventListener('change', liberarAudio);
    $('btnGravar').addEventListener('click', gravar);
    $('btnParar').addEventListener('click', parar);
    $('btnDescartar').addEventListener('click', descartar);
    $('btnEnviar').addEventListener('click', enviar);
    liberarAudio();
  });
})();
