/* ═══════════════════════════════
   GLOBAL STATE
═══════════════════════════════ */
const bgAsset = { url: null };
const chars = [];
const COLORS = ['#FF5A5A','#FFD45A','#FF8C5A','#FF5A9D','#C45AFF','#5AFFB8'];
const MOODS = {
  dawn:'rgba(40,8,8,0.52)', morning:'rgba(60,25,10,0.30)',
  bright:'rgba(255,212,90,0.07)', night:'rgba(5,3,15,0.70)', end:'rgba(255,90,90,0.09)',
};
function nameToId(name) { return name.trim().toLowerCase().replace(/\s+/g, '_'); }

/* ═══════════════════════════════
   TEXT-TO-SPEECH
═══════════════════════════════ */
let availableVoices = [];
function loadVoices() {
  availableVoices = window.speechSynthesis.getVoices();
  if (availableVoices.length) {
    renderChars();
    const narrSel = document.getElementById('narr-voice');
    if (narrSel) {
      const curVal = narrSel.value;
      narrSel.innerHTML = '<option value="">🔇 None</option>';
      availableVoices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = v.name.length > 22 ? v.name.slice(0,20)+'…' : v.name;
        narrSel.appendChild(opt);
      });
      if (curVal) narrSel.value = curVal;
    }
  }
}
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

/* ═══════════════════════════════
   ASSET UPLOADS
═══════════════════════════════ */
function readFile(file, cb) { const r = new FileReader(); r.onload = e => cb(e.target.result); r.readAsDataURL(file); }
function setPreview(elId, url) { document.getElementById(elId).innerHTML = `<img src="${url}">`; }

document.getElementById('up-bg').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  readFile(f, url => { bgAsset.url = url; setPreview('prev-bg', url); });
});
document.getElementById('up-c1').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  readFile(f, url => { setPreview('prev-c1', url); if (chars[0]) { chars[0].imgUrl = url; renderChars(); } });
});
document.getElementById('up-c2').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  readFile(f, url => { setPreview('prev-c2', url); if (chars[1]) { chars[1].imgUrl = url; renderChars(); } });
});

/* ═══════════════════════════════
   CHARACTER MANAGER
═══════════════════════════════ */
function addChar(name='Character', color=null, side='left', imgUrl=null) {
  chars.push({ name, color: color||COLORS[chars.length%COLORS.length], side, imgUrl, talkFrames:[null,null,null,null], idleFrame:null });
  renderChars();
}
function removeChar(i) { chars.splice(i,1); renderChars(); }

function renderChars() {
  const list = document.getElementById('char-list');
  list.innerHTML = '';
  const selRow = document.createElement('div');
  selRow.className = 'char-sel-row';
  const label = document.createElement('span');
  label.className = 'char-sel-label';
  label.textContent = 'Select:';
  const sel = document.createElement('select');
  sel.className = 'char-select';
  chars.forEach((ch, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = `${ch.name} (${nameToId(ch.name)})`;
    sel.appendChild(o);
  });
  selRow.append(label, sel);
  list.appendChild(selRow);
  const detailDiv = document.createElement('div');
  detailDiv.className = 'char-detail';
  list.appendChild(detailDiv);

  function renderDetail() {
    const i = parseInt(sel.value);
    const ch = chars[i];
    if (!ch) { detailDiv.innerHTML = ''; return; }
    detailDiv.innerHTML = '';
    const thumb = document.createElement('div');
    thumb.className = 'cthumb';
    thumb.innerHTML = ch.imgUrl ? `<img src="${ch.imgUrl}">` : '👤';
    const nameInp = document.createElement('input');
    nameInp.type = 'text'; nameInp.value = ch.name; nameInp.placeholder = 'Name';
    nameInp.addEventListener('input', () => { ch.name = nameInp.value; sel.options[i].textContent = `${ch.name} (${nameToId(ch.name)})`; });
    const cdot = document.createElement('div');
    cdot.className = 'cdot'; cdot.style.background = ch.color;
    const cinp = document.createElement('input');
    cinp.type = 'color'; cinp.value = ch.color;
    cdot.addEventListener('click', () => cinp.click());
    cinp.addEventListener('input', () => { ch.color = cinp.value; cdot.style.background = ch.color; });
    const sideSel = document.createElement('select');
    sideSel.className = 'cside';
    ['left','right','center'].forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = s; if (s === ch.side) o.selected = true; sideSel.appendChild(o); });
    sideSel.addEventListener('change', () => { ch.side = sideSel.value; });
    const imgBtn = document.createElement('div');
    imgBtn.className = 'cimg-btn'; imgBtn.textContent = '📷 Img';
    const imgInp = document.createElement('input');
    imgInp.type = 'file'; imgInp.accept = 'image/*';
    imgInp.addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; readFile(f, url => { ch.imgUrl = url; thumb.innerHTML = `<img src="${url}">`; if (i===0) setPreview('prev-c1', url); if (i===1) setPreview('prev-c2', url); }); });
    imgBtn.appendChild(imgInp);
    const voiceSel = document.createElement('select');
    voiceSel.className = 'cvoice'; voiceSel.title = 'TTS Voice';
    const noOpt = document.createElement('option');
    noOpt.value = ''; noOpt.textContent = '🔇 No voice';
    voiceSel.appendChild(noOpt);
    availableVoices.forEach(v => { const opt = document.createElement('option'); opt.value = v.name; opt.textContent = v.name.length > 22 ? v.name.slice(0,20)+'…' : v.name; if (ch.voice && ch.voice === v.name) opt.selected = true; voiceSel.appendChild(opt); });
    if (ch.voice) voiceSel.value = ch.voice;
    voiceSel.addEventListener('change', () => { ch.voice = voiceSel.value || null; });
    const framesDiv = document.createElement('div');
    framesDiv.className = 'cframes';
    const setFrameImg = (btn, url) => {
      const img = document.createElement('img');
      img.src = url;
      const old = btn.querySelector('img, span');
      if (old) btn.replaceChild(img, old); else btn.appendChild(img);
    };
    for (let fi = 0; fi < 4; fi++) {
      const talkBtn = document.createElement('div');
      talkBtn.className = 'cframe-btn talk-frame'; talkBtn.title = `Talk frame ${fi+1}`;
      talkBtn.innerHTML = ch.talkFrames[fi] ? `<img src="${ch.talkFrames[fi]}">` : `<span>${fi+1}</span>`;
      const talkInp = document.createElement('input');
      talkInp.type = 'file'; talkInp.accept = 'image/*';
      const idx = fi;
      talkInp.addEventListener('change', e => {
        const file = e.target.files[0]; if (!file) return;
        e.target.value = '';
        readFile(file, url => { ch.talkFrames[idx] = url; setFrameImg(talkBtn, url); });
      });
      talkBtn.appendChild(talkInp);
      framesDiv.appendChild(talkBtn);
    }
    const idleBtn = document.createElement('div');
    idleBtn.className = 'cframe-btn idle-frame'; idleBtn.title = 'Idle frame (not talking)';
    idleBtn.innerHTML = ch.idleFrame ? `<img src="${ch.idleFrame}">` : `<span>😶</span>`;
    const idleInp = document.createElement('input');
    idleInp.type = 'file'; idleInp.accept = 'image/*';
    idleInp.addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      e.target.value = '';
      readFile(file, url => { ch.idleFrame = url; setFrameImg(idleBtn, url); });
    });
    idleBtn.appendChild(idleInp);
    framesDiv.append(idleBtn);
    const rem = document.createElement('button');
    rem.className = 'crem'; rem.textContent = '✕ Remove';
    rem.addEventListener('click', () => { removeChar(i); sel.value = chars.length > 0 ? 0 : ''; renderDetail(); });
    const row1 = document.createElement('div');
    row1.className = 'char-detail-row';
    row1.append(thumb, nameInp, cdot, cinp, sideSel, imgBtn);
    const row2 = document.createElement('div');
    row2.className = 'char-detail-row';
    row2.append(voiceSel, rem);
    const row3 = document.createElement('div');
    row3.className = 'char-detail-row frames-row';
    const framesLabel = document.createElement('span');
    framesLabel.className = 'frames-label';
    framesLabel.textContent = 'Talk / Idle';
    row3.append(framesLabel, framesDiv);
    detailDiv.append(row1, row2, row3);
  }
  sel.addEventListener('change', renderDetail);
  if (chars.length > 0) renderDetail();
}

addChar('Jamie','#FF5A5A','left');
addChar('Alex', '#FFD45A','right');
document.getElementById('add-char-btn').addEventListener('click', () => addChar());

/* ═══════════════════════════════
   SCRIPT PARSER
═══════════════════════════════ */
function parseScript(raw) {
  const errors = [], result = [];
  raw.split('\n').forEach((rawLine, lineNum) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) return;
    const colonIdx = line.indexOf(':');
    if (colonIdx < 1) { errors.push(`Line ${lineNum+1}: Missing colon. Use "speakerId: text"`); return; }
    const rawId = line.slice(0, colonIdx).trim();
    let text = line.slice(colonIdx + 1).trim();
    if (!text) { errors.push(`Line ${lineNum+1}: No text after the colon.`); return; }
    let mood = 'morning';
    text = text.replace(/\[mood\s*:\s*(\w+)\]/gi, (_, m) => { mood = m.toLowerCase(); return ''; }).trim();
    let bounce = false;
    text = text.replace(/\[bounce\]/gi, () => { bounce = true; return ''; }).trim();
    if (!text) { errors.push(`Line ${lineNum+1}: Text is empty after removing tags.`); return; }
    const sid = nameToId(rawId);
    const isNarr = sid === 'narr' || sid === 'narrator' || sid === '-';
    let speaker = null;
    if (!isNarr) {
      speaker = chars.find(c => nameToId(c.name) === sid);
      if (!speaker) { errors.push(`Line ${lineNum+1}: Unknown character "${rawId}".`); return; }
    }
    result.push({ speaker, text, mood, bounce });
  });
  return { result, errors };
}

/* ═══════════════════════════════
   RUN BUTTON
═══════════════════════════════ */
document.getElementById('run-btn').addEventListener('click', () => {
  const raw = document.getElementById('script-editor').value;
  const errBox = document.getElementById('script-error');
  if (!raw.trim()) { errBox.style.display = 'block'; errBox.textContent = '⚠ Script is empty!'; return; }
  const { result, errors } = parseScript(raw);
  if (errors.length) { errBox.style.display = 'block'; errBox.textContent = errors.join('\n'); return; }
  errBox.style.display = 'none';
  openModal(result);
});

document.getElementById('default-btn').addEventListener('click', () => {
  openModal([
    { speaker: chars[0], text:"Good morning… or so I'm told.", mood:'dawn', bounce:false },
    { speaker: chars[1], text:"You look terrible!", mood:'dawn', bounce:true },
    { speaker: chars[0], text:"Thanks. You look like you haven't slept.", mood:'dawn', bounce:false },
    { speaker: null, text:"The bus stop glistens in morning drizzle.", mood:'morning', bounce:false },
    { speaker: chars[1], text:"I'm getting a puppy today! 🐶", mood:'morning', bounce:true },
    { speaker: chars[0], text:"You can barely keep a cactus alive.", mood:'morning', bounce:false },
    { speaker: chars[1], text:"Cacti are boring. Dogs are motivating.", mood:'bright', bounce:true },
    { speaker: null, text:"They boarded the bus together. 🐾 THE END 🐾", mood:'end', bounce:false },
  ]);
});

/* ═══════════════════════════════
   MODAL GAME ENGINE
═══════════════════════════════ */
let modalScript = [], modalIndex = 0;
let modalTyping = false, modalTypeTimer = null, modalFullText = '';
let modalCharEls = {};
let modalTtsSpeaking = false, modalTtsRate = 1.0;
let modalAutoTimer = null, modalRingTimer = null;

const mBgEl = document.getElementById('mbg');
const mBgOverlay = document.getElementById('mbg-overlay');
const mCharCont = document.getElementById('mchar-container');
const mSpeakerEl = document.getElementById('mspeaker-name');
const mTextEl = document.getElementById('mtext-content');
const mCursorEl = document.getElementById('mdcursor');
const mPbar = document.getElementById('mpbar');
const mFlashEl = document.getElementById('mflash');
const mRingEl = document.getElementById('mautoplay-ring');
const mRingFill = document.getElementById('mring-fill');

function openModal(script) {
  modalScript = script; modalIndex = 0; modalCharEls = {};
  mCharCont.innerHTML = '';
  chars.forEach(ch => {
    const key = nameToId(ch.name);
    const wrap = document.createElement('div');
    wrap.className = 'character';
    if (ch.side === 'left') { wrap.style.left = '3%'; wrap.style.right = 'auto'; }
    else if (ch.side === 'right') { wrap.style.right = '3%'; wrap.style.left = 'auto'; }
    else { wrap.classList.add('center-pos'); }
    const bubble = document.createElement('div');
    bubble.className = 'nbubble'; bubble.style.background = ch.color; bubble.style.color = '#0E0A0A'; bubble.textContent = ch.name;
    const talkSrcs = (ch.talkFrames || []).filter(f => f);
    const baseSrc = ch.idleFrame || ch.imgUrl || talkSrcs[0] || null;
    if (baseSrc) {
      const idleImg = document.createElement('img');
      idleImg.className = 'char-idle'; idleImg.src = baseSrc; idleImg.alt = ch.name;
      wrap.appendChild(bubble); wrap.appendChild(idleImg);
      talkSrcs.forEach((src, fi) => {
        const t = document.createElement('img');
        t.className = 'char-talk'; t.dataset.index = fi; t.src = src;
        wrap.appendChild(t);
      });
    } else {
      const ph = document.createElement('div'); ph.innerHTML = '<span style="font-size:3rem">👤</span>'; wrap.append(bubble, ph);
    }
    mCharCont.appendChild(wrap);
    modalCharEls[key] = { wrap, bubble, talkFrames: ch.talkFrames, idleFrame: ch.idleFrame };
  });
  if (bgAsset.url) mBgEl.style.backgroundImage = `url('${bgAsset.url}')`;
  document.getElementById('game-modal').classList.remove('modal-hidden');
  setTimeout(() => modalShowLine(0), 300);
}

function closeModal() {
  document.getElementById('game-modal').classList.add('modal-hidden');
  modalClearAuto();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  modalTtsSpeaking = false; modalTyping = false;
  clearInterval(modalTypeTimer);
  mCharCont.innerHTML = '';
  const oldEnd = document.getElementById('modal-end-overlay');
  if (oldEnd) oldEnd.remove();
}

function modalSetCharState(line) {
  Object.values(modalCharEls).forEach(({ wrap, bubble }) => {
    wrap.classList.remove('bouncing','talking'); wrap.classList.add('visible'); wrap.classList.remove('dim'); bubble.classList.remove('on');
  });
  if (line.speaker) {
    const key = nameToId(line.speaker.name);
    Object.keys(modalCharEls).forEach(k => { if (k !== key) modalCharEls[k].wrap.classList.add('dim'); });
    const el = modalCharEls[key];
    if (el) { el.bubble.classList.add('on'); el.wrap.classList.add(line.bounce ? 'bouncing' : 'talking'); }
  }
}

let modalTalkIdx = 0, modalTalkInt = null, modalTalkChar = null;
function modalShowTalk(ck) {
  modalHideTalk();
  if (!ck || !modalCharEls[ck]) return;
  const el = modalCharEls[ck];
  const idle = el.wrap.querySelector('.char-idle');
  const talks = el.wrap.querySelectorAll('.char-talk');
  if (!talks.length) return;
  modalTalkChar = ck; modalTalkIdx = 0;
  if (idle) idle.classList.add('hidden');
  talks.forEach(f => f.classList.remove('active'));
  talks[0].classList.add('active');
  modalTalkInt = setInterval(() => {
    talks.forEach(f => f.classList.remove('active'));
    modalTalkIdx = (modalTalkIdx + 1) % talks.length;
    talks[modalTalkIdx].classList.add('active');
  }, 120);
}
function modalHideTalk() {
  if (modalTalkInt) { clearInterval(modalTalkInt); modalTalkInt = null; }
  if (modalTalkChar && modalCharEls[modalTalkChar]) {
    const el = modalCharEls[modalTalkChar];
    const idle = el.wrap.querySelector('.char-idle');
    const talks = el.wrap.querySelectorAll('.char-talk');
    if (idle) idle.classList.remove('hidden');
    talks.forEach(f => f.classList.remove('active'));
  }
  modalTalkChar = null; modalTalkIdx = 0;
}
function modalMaybeHideTalk() {
  if (!modalTyping && !modalTtsSpeaking) modalHideTalk();
}

function modalClearAuto() {
  clearTimeout(modalAutoTimer); modalAutoTimer = null;
  clearInterval(modalRingTimer); modalRingTimer = null;
  mRingEl.style.display = 'none';
  mRingFill.style.transition = 'none';
  mRingFill.style.strokeDashoffset = '38';
}

function modalScheduleAutoAdvance() {
  if (!mainAutoPlay) return;
  modalClearAuto();
  const gap = 900;
  mRingEl.style.display = 'block';
  const circumference = 31.4;
  mRingFill.style.strokeDasharray = circumference;
  mRingFill.style.strokeDashoffset = circumference;
  mRingFill.getBoundingClientRect();
  mRingFill.style.transition = `stroke-dashoffset ${gap}ms linear`;
  mRingFill.style.strokeDashoffset = '0';
  modalAutoTimer = setTimeout(() => {
    modalClearAuto();
    modalIndex++;
    modalShowLine(modalIndex);
  }, gap);
}

function modalOnDone() {
  if (modalTyping || modalTtsSpeaking) return;
  modalHideTalk();
  mCursorEl.style.display = 'inline-block';
  modalScheduleAutoAdvance();
}

function modalTypeText(text) {
  modalTyping = true; modalFullText = text; mTextEl.textContent = ''; mCursorEl.style.display = 'none';
  let i = 0;
  modalTypeTimer = setInterval(() => { mTextEl.textContent += text[i++]; if (i >= text.length) { clearInterval(modalTypeTimer); modalTyping = false; modalOnDone(); } }, 24);
}

function modalFinishTyping() {
  clearInterval(modalTypeTimer); modalTyping = false; mTextEl.textContent = modalFullText;
  modalClearAuto();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  modalTtsSpeaking = false; modalHideTalk(); mCursorEl.style.display = 'inline-block';
}

function modalSpeak(text, voiceName, charKey) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  if (voiceName) { const v = availableVoices.find(v => v.name === voiceName); if (v) utt.voice = v; }
  utt.rate = modalTtsRate; utt.pitch = 1; modalTtsSpeaking = true;
  if (charKey && modalTalkChar !== charKey) modalShowTalk(charKey);
  utt.onend = utt.onerror = () => { modalTtsSpeaking = false; modalOnDone(); };
  window.speechSynthesis.speak(utt);
}

function modalShowLine(idx) {
  if (idx >= modalScript.length) { modalEndGame(); return; }
  const line = modalScript[idx];
  modalClearAuto();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  modalTtsSpeaking = false; modalHideTalk();
  mPbar.style.width = ((idx / Math.max(modalScript.length - 1, 1)) * 100) + '%';
  mBgOverlay.style.background = MOODS[line.mood] || MOODS.morning;
  modalSetCharState(line);
  const isNarr = !line.speaker;
  mSpeakerEl.textContent = isNarr ? '— Narrator —' : line.speaker.name;
  mSpeakerEl.style.color = isNarr ? '#FF8C5A' : line.speaker.color;
  if (idx > 0 && line.mood === 'end') { mFlashEl.style.opacity = '.5'; setTimeout(() => mFlashEl.style.opacity = '0', 300); }
  if (line.speaker) modalShowTalk(nameToId(line.speaker.name));
  modalTypeText(line.text);
  if (line.speaker && line.speaker.voice) modalSpeak(line.text, line.speaker.voice, nameToId(line.speaker.name));
  else if (!line.speaker) { const nv = document.getElementById('narr-voice')?.value; if (nv) modalSpeak(line.text, nv, null); }
}

function modalAdvance() {
  if (modalTyping) { modalFinishTyping(); return; }
  modalClearAuto();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  modalTtsSpeaking = false; modalHideTalk();
  modalIndex++; modalShowLine(modalIndex);
}

function modalEndGame() {
  modalClearAuto();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  modalTtsSpeaking = false; modalHideTalk();
  const ov = document.createElement('div');
  ov.id = 'modal-end-overlay';
  ov.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;background:rgba(10,7,7,.92);backdrop-filter:blur(8px);z-index:20;';
  ov.innerHTML = `<div style="font-size:2rem">🎬✨</div><h2 style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:900;font-style:italic">The <span style="background:linear-gradient(135deg,#FF5A5A,#FFD45A);-webkit-background-clip:text;-webkit-text-fill-color:transparent">End</span></h2><p style="font-size:.72rem;color:rgba(245,237,232,0.5)">Your story has concluded.</p><button class="gbtn" id="modal-replay-btn">Play Again ↺</button>`;
  document.getElementById('modal-game').appendChild(ov);
  document.getElementById('modal-replay-btn').addEventListener('click', () => { ov.remove(); modalIndex = 0; mPbar.style.width = '0%'; modalShowLine(0); });
}

/* ── MODAL CONTROLS ── */
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', closeModal);
document.getElementById('mdialogue-box').addEventListener('click', modalAdvance);
document.getElementById('mskip-btn').addEventListener('click', () => { modalClearAuto(); if (modalTyping) modalFinishTyping(); else { modalIndex++; modalShowLine(modalIndex); } });
document.addEventListener('keydown', e => {
  if (!document.getElementById('game-modal').classList.contains('modal-hidden')) {
    if (['Space','ArrowRight','Enter'].includes(e.code)) { e.preventDefault(); modalAdvance(); }
    if (e.key === 'Escape') closeModal();
  }
});

/* ── MODAL RAIN ── */
(function() {
  const layer = document.getElementById('mrain-layer');
  for (let i = 0; i < 38; i++) {
    const d = document.createElement('div');
    d.className = 'rdrop';
    d.style.cssText = `left:${Math.random()*100}%;height:${13+Math.random()*18}px;animation-duration:${0.65+Math.random()*0.85}s;animation-delay:${Math.random()*2.5}s;top:0;`;
    layer.appendChild(d);
  }
})();

/* ── MAIN RAIN ── */
(function() {
  const layer = document.getElementById('rain-layer');
  for (let i = 0; i < 38; i++) {
    const d = document.createElement('div');
    d.className = 'rdrop';
    d.style.cssText = `left:${Math.random()*100}%;height:${13+Math.random()*18}px;animation-duration:${0.65+Math.random()*0.85}s;animation-delay:${Math.random()*2.5}s;top:0;`;
    layer.appendChild(d);
  }
})();

/* ═══════════════════════════════
   EXPORT TO MP4 (ffmpeg.wasm)
═══════════════════════════════ */
let ffmpegInstance = null;
let isExporting = false;

async function initFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  const { FFmpeg } = FFmpegWASM;
  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message));
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({ coreURL: `${baseURL}/ffmpeg-core.js`, wasmURL: `${baseURL}/ffmpeg-core.wasm` });
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

async function captureGameFrame(gameEl) {
  if (typeof html2canvas !== 'undefined') {
    return await html2canvas(gameEl, { backgroundColor: '#0E0A0A', useCORS: true, scale: 1, width: 860, height: 520 });
  }
  const canvas = document.createElement('canvas');
  canvas.width = 860; canvas.height = 520;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0E0A0A'; ctx.fillRect(0, 0, 860, 520);
  return canvas;
}

async function exportToMP4() {
  if (isExporting) return;
  if (!modalScript.length) { alert('Run a story first!'); return; }
  const exportBtn = document.getElementById('export-btn');
  const exportProgress = document.getElementById('export-progress');
  const exportStatus = document.getElementById('export-status');
  const exportFill = document.getElementById('export-progress-fill');
  isExporting = true; exportBtn.disabled = true; exportBtn.textContent = '⏳ Loading...';
  exportProgress.classList.remove('export-hidden'); exportStatus.textContent = 'Loading FFmpeg...'; exportFill.style.width = '0%';
  try {
    const ffmpeg = await initFFmpeg();
    exportBtn.textContent = '🎥 Exporting...';
    const savedIndex = modalIndex;
    const totalLines = modalScript.length;
    const frameFiles = [];
    for (let i = 0; i < totalLines; i++) {
      modalIndex = i; modalShowLine(i);
      await new Promise(r => setTimeout(r, 300));
      if (modalTyping) modalFinishTyping();
      await new Promise(r => setTimeout(r, 100));
      const canvas = await captureGameFrame(document.getElementById('modal-game'));
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const buf = new Uint8Array(await blob.arrayBuffer());
      const fileName = `frame${String(i).padStart(4, '0')}.png`;
      await ffmpeg.writeFile(fileName, buf); frameFiles.push(fileName);
      exportFill.style.width = ((i + 1) / totalLines * 50) + '%';
      exportStatus.textContent = `Frame ${i + 1}/${totalLines}`;
    }
    exportStatus.textContent = 'Encoding MP4...'; exportFill.style.width = '55%';
    await ffmpeg.exec(['-framerate','12','-i','frame%04d.png','-c:v','libx264','-pix_fmt','yuv420p','-preset','ultrafast','-crf','23','output.mp4']);
    exportFill.style.width = '90%'; exportStatus.textContent = 'Building download...';
    const outData = await ffmpeg.readFile('output.mp4');
    const outBlob = new Blob([outData.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(outBlob);
    const a = document.createElement('a'); a.href = url; a.download = `visual-novel-${Date.now()}.mp4`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    for (const f of frameFiles) { try { await ffmpeg.deleteFile(f); } catch (e) {} }
    try { await ffmpeg.deleteFile('output.mp4'); } catch (e) {}
    modalIndex = savedIndex; modalShowLine(modalIndex);
    exportFill.style.width = '100%'; exportStatus.textContent = 'Done!';
    setTimeout(() => { exportProgress.classList.add('export-hidden'); exportBtn.textContent = '🎥 Export to MP4'; exportBtn.disabled = false; isExporting = false; }, 2000);
  } catch (err) {
    console.error('Export failed:', err); exportStatus.textContent = 'Error: ' + err.message;
    exportBtn.textContent = '🎥 Export to MP4'; exportBtn.disabled = false; isExporting = false;
  }
}
document.getElementById('export-btn').addEventListener('click', exportToMP4);

/* ═══════════════════════════════
   POPOUT GAME WINDOW
═══════════════════════════════ */
document.getElementById('popout-btn').addEventListener('click', () => {
  if (!modalScript.length && !document.getElementById('script-editor').value.trim()) { alert('Run a story first!'); return; }
  const raw = document.getElementById('script-editor').value;
  let script = modalScript;
  if (!script.length) { const { result, errors } = parseScript(raw); if (errors.length) { alert('Fix script errors first!'); return; } script = result; }
  const popWin = window.open('', '_blank', 'width=900,height=600');
  popWin.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Visual Novel</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0A0707;display:flex;align-items:center;justify-content:center;min-height:100vh;overflow:hidden;font-family:"DM Sans",sans-serif}#game{position:relative;width:860px;height:520px;border-radius:1rem;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6)}#bg{position:absolute;inset:0;background:linear-gradient(145deg,#1a0808,#2d1010,#1a0808);background-size:cover;background-position:center}#bg-overlay{position:absolute;inset:0;transition:background 1.2s;pointer-events:none}#char-container{position:absolute;inset:0;pointer-events:none}.character{position:absolute;bottom:16%;width:170px;transition:opacity .5s,filter .5s;opacity:0;z-index:4}.character.visible{opacity:1}.character img{width:100%;height:auto;display:block;filter:drop-shadow(0 8px 24px rgba(0,0,0,.5))}.character.dim{filter:brightness(.35) saturate(.4)}.char-idle{position:relative;z-index:1;width:100%;height:auto;display:block;transition:opacity .1s}.char-idle.hidden{opacity:0}.char-talk{position:absolute;top:0;left:0;width:100%;height:auto;opacity:0;z-index:2;transition:opacity .08s}.char-talk.active{opacity:1}.nbubble{position:absolute;top:-28px;left:50%;transform:translateX(-50%);padding:.2rem .7rem;border-radius:1rem;font-size:.6rem;font-weight:700;white-space:nowrap;opacity:0;transition:opacity .3s,transform .3s;pointer-events:none;z-index:5;box-shadow:0 2px 12px rgba(0,0,0,.3)}.nbubble.on{opacity:1;transform:translateX(-50%) translateY(-4px)}#pbar-wrap{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:160px;height:2px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;z-index:10}#pbar{height:100%;background:linear-gradient(90deg,#FF5A5A,#FFD45A);border-radius:2px;transition:width .4s}#dialogue-wrap{position:absolute;bottom:0;left:0;right:0;padding:12px 14px 14px;z-index:6}#dialogue-box{background:rgba(14,10,10,.88);border:1px solid rgba(255,90,90,0.15);border-radius:1rem;padding:.8rem 1.1rem 1rem;min-height:80px;cursor:pointer;position:relative;overflow:hidden}#dialogue-box::before{content:"";position:absolute;top:0;left:1rem;right:1rem;height:1px;background:linear-gradient(90deg,transparent,rgba(255,212,90,0.4),transparent)}#speaker-name{font-family:"Playfair Display",serif;font-size:.78rem;font-weight:700;font-style:italic;letter-spacing:.03em;margin-bottom:.3rem;transition:color .3s}#dialogue-text{font-family:"DM Serif Display",serif;font-size:.88rem;color:#F5EDE8;line-height:1.65;min-height:2.2em}#dcursor{display:inline-block;width:2px;height:1em;background:#FF5A5A;margin-left:2px;vertical-align:text-bottom;animation:blink .6s step-end infinite}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}#click-hint{position:absolute;bottom:8px;right:12px;font-size:.55rem;color:rgba(255,90,90,0.35)}#flash{position:absolute;inset:0;background:#FF5A5A;opacity:0;pointer-events:none;z-index:15;transition:opacity .3s}</style></head><body><div id="game"><div id="bg"></div><div id="bg-overlay"></div><div id="char-container"></div><div id="pbar-wrap"><div id="pbar" style="width:0%"></div></div><div id="dialogue-wrap"><div id="dialogue-box"><div id="speaker-name"></div><div id="dialogue-text"><span id="text-content"></span><span id="dcursor"></span></div><div id="click-hint">▼ click to continue</div></div></div><div id="flash"></div></div><script>const MOODS={dawn:"rgba(40,8,8,0.52)",morning:"rgba(60,25,10,0.30)",bright:"rgba(255,212,90,0.07)",night:"rgba(5,3,15,0.70)",end:"rgba(255,90,90,0.09)"};let gs=[],li=0,typing=false,tt=null,ft="",ce={};const bg=document.getElementById("bg"),bgo=document.getElementById("bg-overlay"),cc=document.getElementById("char-container"),sp=document.getElementById("speaker-name"),tx=document.getElementById("text-content"),cu=document.getElementById("dcursor"),pb=document.getElementById("pbar"),fl=document.getElementById("flash");function n2i(n){return n.trim().toLowerCase().replace(/\\s+/g,"_")}function sMood(m){bgo.style.background=MOODS[m]||MOODS.morning}function dFlash(){fl.style.opacity=".5";setTimeout(()=>fl.style.opacity="0",300)}function cAnims(){Object.values(ce).forEach(({wrap})=>wrap.classList.remove("bouncing","talking"))}function sCharState(line){cAnims();Object.values(ce).forEach(({wrap,bubble})=>{wrap.classList.add("visible");wrap.classList.remove("dim");bubble.classList.remove("on")});if(line.speaker){const k=n2i(line.speaker.name);Object.keys(ce).forEach(q=>{if(q!==k)ce[q].wrap.classList.add("dim")});const e=ce[k];if(e){e.bubble.classList.add("on");e.wrap.classList.add(line.bounce?"bouncing":"talking")}}}let mTI=0,mTInt=null,mTCh=null;function sTalk(ck){hTalk();if(!ck||!ce[ck])return;const e=ce[ck];const id=e.wrap.querySelector(".char-idle"),tk=e.wrap.querySelectorAll(".char-talk");if(!tk.length)return;mTCh=ck;mTI=0;if(id)id.classList.add("hidden");tk.forEach(f=>f.classList.remove("active"));tk[0].classList.add("active");mTInt=setInterval(()=>{tk.forEach(f=>f.classList.remove("active"));mTI=(mTI+1)%tk.length;tk[mTI].classList.add("active")},120)}function hTalk(){if(mTInt){clearInterval(mTInt);mTInt=null}if(mTCh&&ce[mTCh]){const e=ce[mTCh];const id=e.wrap.querySelector(".char-idle"),tk=e.wrap.querySelectorAll(".char-talk");if(id)id.classList.remove("hidden");tk.forEach(f=>f.classList.remove("active"))}mTCh=null;mTI=0}let ttsS=false;function oDone(){hTalk();if(!typing&&!ttsS)cu.style.display="inline-block"}function tText(t){typing=true;ft=t;tx.textContent="";cu.style.display="none";let i=0;tt=setInterval(()=>{tx.textContent+=t[i++];if(i>=t.length){clearInterval(tt);typing=false;oDone()}},24)}function fType(){ clearInterval(tt);typing=false;tx.textContent=ft;if("speechSynthesis"in window)speechSynthesis.cancel();ttsS=false;hTalk();cu.style.display="inline-block"}function sLine(vn,ck){if(!("speechSynthesis"in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(vn);if(ck){const v=window.opener?.availableVoices?.find(v=>v.name===ck);if(v)u.voice=v}u.rate=1;u.pitch=1;ttsS=true;sTalk(ck);u.onend=u.onerror=()=>{ttsS=false;hTalk();oDone()};speechSynthesis.speak(u)}function showLine(idx){if(idx>=gs.length){endGame();return}const l=gs[idx];if("speechSynthesis"in window)speechSynthesis.cancel();ttsS=false;hTalk();pb.style.width=((idx/Math.max(gs.length-1,1))*100)+"%";sMood(l.mood);sCharState(l);const isN=!l.speaker;sp.textContent=isN?"— Narrator —":l.speaker.name;sp.style.color=isN?"#FF8C5A":l.speaker.color;if(idx>0&&l.mood==="end")dFlash();if(l.speaker)sTalk(n2i(l.speaker.name));tText(l.text)}function advance(){if(typing){fType();return}if("speechSynthesis"in window)speechSynthesis.cancel();ttsS=false;hTalk();li++;showLine(li)}function endGame(){if("speechSynthesis"in window)speechSynthesis.cancel();ttsS=false;hTalk();const ov=document.createElement("div");ov.style.cssText="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;background:rgba(10,7,7,.92);z-index:20";ov.innerHTML=\'<div style="font-size:2rem">🎬✨</div><h2 style="font-family:"Playfair Display",serif;font-size:1.3rem;font-weight:900;font-style:italic">The <span style="background:linear-gradient(135deg,#FF5A5A,#FFD45A);-webkit-background-clip:text;-webkit-text-fill-color:transparent">End</span></h2>\';document.getElementById("game").appendChild(ov)}document.getElementById("dialogue-box").addEventListener("click",advance);document.addEventListener("keydown",e=>{if(["Space","ArrowRight","Enter"].includes(e.code)){e.preventDefault();advance()}});setTimeout(()=>{gs=window.opener?.window._popData?.script||[];const ch=window.opener?.window._popData?.chars||[];cc.innerHTML="";ch.forEach(c=>{const k=n2i(c.name);const w=document.createElement("div");w.className="character";if(c.side==="left"){w.style.left="3%";w.style.right="auto"}else if(c.side==="right"){w.style.right="3%";w.style.left="auto"}else{w.style.left="50%";w.style.transform="translateX(-50%)"}const b=document.createElement("div");b.className="nbubble";b.style.background=c.color;b.style.color="#0E0A0A";b.textContent=c.name;const ts=(c.talkFrames||[]).filter(f=>f),bs=c.idleFrame||c.imgUrl||ts[0]||null;if(bs){const id=document.createElement("img");id.className="char-idle";id.src=bs;w.append(b,id);ts.forEach(src=>{const t=document.createElement("img");t.className="char-talk";t.src=src;w.appendChild(t)})}else{const p=document.createElement("div");p.innerHTML="<span style=font-size:3rem>👤</span>";w.append(b,p)}cc.appendChild(w);ce[k]={wrap:w,bubble:b,tf:c.talkFrames,idle:c.idleFrame}});if(window.opener?.window._popBg)bg.style.backgroundImage="url("+window.opener.window._popBg+")";showLine(0)},200);<\/script></body></html>');
  popWin.document.close();
  popWin.window._popData = {
    script,
    chars: chars.map(ch => ({ name: ch.name, color: ch.color, side: ch.side, imgUrl: ch.imgUrl, talkFrames: ch.talkFrames, idleFrame: ch.idleFrame, voice: ch.voice })),
    bgUrl: bgAsset.url
  };
});

/* ═══════════════════════════════
   AUTOPLAY TOGGLE
═══════════════════════════════ */
const toggleTrack = document.getElementById('toggle-track');
const toggleLbl = document.getElementById('toggle-lbl');
let mainAutoPlay = false;
document.getElementById('auto-toggle').addEventListener('click', () => {
  mainAutoPlay = !mainAutoPlay;
  toggleTrack.classList.toggle('on', mainAutoPlay);
  toggleLbl.textContent = mainAutoPlay ? 'Autoplay ON' : 'Autoplay';
});
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
speedSlider.addEventListener('input', () => {
  modalTtsRate = +speedSlider.value;
  speedVal.textContent = modalTtsRate.toFixed(1) + '×';
  const pct = ((modalTtsRate - 0.5) / (2 - 0.5)) * 100;
  speedSlider.style.background = `linear-gradient(90deg, var(--red) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
});
speedSlider.dispatchEvent(new Event('input'));
