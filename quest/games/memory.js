(() => {
const FALLBACK = [
  { antwoord: "Doopsel",        vraag: "Je wordt lid van de Kerk",              categorie: "Sacramenten" },
  { antwoord: "Eucharistie",    vraag: "Brood en wijn worden Christus' lichaam", categorie: "Sacramenten" },
  { antwoord: "Vormsel",        vraag: "Je ontvangt de Heilige Geest",           categorie: "Sacramenten" },
  { antwoord: "Biecht",         vraag: "Sacrament van vergeving",                categorie: "Sacramenten" },
  { antwoord: "Advent",         vraag: "Voorbereiding op Kerstmis",              categorie: "Feesten" },
  { antwoord: "Pinksteren",     vraag: "Komst van de Heilige Geest",             categorie: "Feesten" },
  { antwoord: "Pasen",          vraag: "Viering van de opstanding",              categorie: "Feesten" },
  { antwoord: "Kaaba",          vraag: "Heilige plaats in Mekka",                categorie: "Wereldgodsdiensten" },
  { antwoord: "Koran",          vraag: "Heilig boek van de islam",               categorie: "Wereldgodsdiensten" },
  { antwoord: "Ster van David", vraag: "Joods symbool",                          categorie: "Symbolen" },
  { antwoord: "Verloren zoon",  vraag: "Parabel over vergeving",                 categorie: "Parabels" },
  { antwoord: "Noach",          vraag: "Bouwde de ark",                          categorie: "Bijbel" }
];

const getPairs = () => {
  const list = (typeof questions !== "undefined" && Array.isArray(questions))
    ? questions.filter(q => Array.isArray(q.suitable) && q.suitable.includes("memory"))
        .map(q => ({ vraag: q.question, antwoord: q.answers[q.correct], categorie: q.category }))
    : [];
  return list.length >= 10 ? list : FALLBACK;
};
  const LEVELS = [
    [6, "Makkelijk", "12 kaarten · 6 paren"],
    [8, "Gemiddeld", "16 kaarten · 8 paren"],
    [10, "Moeilijk", "20 kaarten · 10 paren"]
  ];

  let root, S, flipT, tickT, resultT, audio;
  const best = {6: 0, 8: 0, 10: 0};
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = s => root.querySelector(s);
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const fmt = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

  function tone(freq, dur = .1, delay = 0, type = "sine", vol = .045, slide = 0) {
    if (!SJ.state.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime + delay, o = audio.createOscillator(), g = audio.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
      g.gain.setValueAtTime(.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + dur + .02);
    } catch (e) {}
  }
  const sfx = {
    flip:  () => tone(520, .06, 0, "triangle", .025),
    match: () => { tone(660, .1, 0, "sine", .035); tone(990, .14, .08, "sine", .03); },
    miss:  () => tone(220, .16, 0, "sine", .03, -60),
    combo: () => [660, 880, 1170].forEach((f, i) => tone(f, .1, i * .06, "triangle", .03)),
    win:   () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .18, i * .11, "triangle", .04))
  };

  const CSS = `.mm{max-width:740px;margin:0 auto}
  .mm-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap}
  .mm-stat{background:linear-gradient(145deg,#0d294b,#153c6b);color:#fff;border-radius:15px;padding:8px 15px;min-width:88px;box-shadow:0 8px 22px rgba(13,41,75,.2)}
  .mm-stat span{display:block;font:700 .6rem "Space Grotesk",sans-serif;letter-spacing:.17em;color:#8fbbe0}
  .mm-stat strong{display:block;font:700 1.35rem "Space Grotesk",sans-serif;line-height:1.15;color:var(--yellow)}
  .mm-stat.down strong{color:#fff}
  .mm-head .btn{margin-left:auto;padding:9px 15px;border-radius:12px;font-size:.85rem}
  .mm-progress{display:flex;align-items:center;gap:12px;margin-bottom:14px}
  .mm-progress .bar{flex:1}
  .mm-combo{font:700 .85rem "Space Grotesk",sans-serif;color:#b8860b;min-width:74px;display:flex;align-items:center;justify-content:flex-end;gap:4px}
  .mm-combo .lni{font-size:16px;vertical-align:0}
  .mm-mark .lni{font-size:28px;vertical-align:0}
  .mm-wrap{position:relative}
  .mm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:10px}
  .mm-card{position:relative;aspect-ratio:1/.92;border:0;padding:0;background:none;cursor:pointer;perspective:800px;font:inherit;transition:transform .18s;border-radius:15px}
  .mm-card:hover:not(.done):not(:disabled){transform:translateY(-3px)}
  .mm-card:focus-visible{outline:3px solid var(--yellow);outline-offset:3px}
  .mm-inner{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .45s cubic-bezier(.2,.8,.25,1)}
  .mm-card.open .mm-inner{transform:rotateY(180deg)}
  .mm-back,.mm-face{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:9px;border-radius:15px;backface-visibility:hidden;-webkit-backface-visibility:hidden;text-align:center;overflow:hidden}
  .mm-back{background:linear-gradient(145deg,#1c5791,#0d294b);border:2px solid rgba(255,255,255,.18);box-shadow:0 8px 20px rgba(13,41,75,.22),inset 0 0 0 6px rgba(255,255,255,.04)}
  .mm-back::before{content:"";position:absolute;width:70px;height:70px;border:1px solid rgba(255,255,255,.13);border-radius:50%}
  .mm-mark{color:var(--yellow);font:700 1.7rem "Space Grotesk",sans-serif;z-index:1}
  .mm-brand{color:rgba(255,255,255,.45);font:700 .55rem "Space Grotesk",sans-serif;letter-spacing:.18em;z-index:1}
  .mm-face{transform:rotateY(180deg);background:#fff;border:2px solid var(--border);box-shadow:0 8px 20px rgba(13,41,75,.14)}
  .mm-face small{color:var(--green);font:700 .58rem "Space Grotesk",sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.85}
  .mm-face b{color:var(--blue-dark);font:700 .84rem/1.25 "DM Sans",sans-serif;overflow-wrap:anywhere}
  .mm-card.done .mm-face{border-color:var(--green);background:#eef8f3;box-shadow:0 0 0 3px rgba(63,128,109,.18)}
  .mm-card.done .mm-face small{opacity:0}
  .mm-card.bad .mm-face{border-color:var(--red);background:#fff1f1;animation:mm-shake .3s}
  @keyframes mm-shake{25%{transform:rotateY(180deg) translateX(-4px)}75%{transform:rotateY(180deg) translateX(4px)}}
  .mm-float{position:absolute;z-index:5;pointer-events:none;font:700 1.05rem "Space Grotesk",sans-serif;color:var(--green);text-shadow:0 2px 0 #fff;animation:mm-float .9s ease forwards}
  @keyframes mm-float{from{opacity:0;transform:translate(-50%,0) scale(.8)}25%{opacity:1;transform:translate(-50%,-12px) scale(1.1)}to{opacity:0;transform:translate(-50%,-46px) scale(1)}}
  .mm-tip{text-align:center;color:var(--muted);font-size:.78rem;margin-top:14px}
  .mm-menu,.mm-result{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow);padding:clamp(20px,4vw,34px);text-align:center}
  .mm-kicker{font:700 .62rem "Space Grotesk",sans-serif;letter-spacing:.26em;color:var(--green);margin-bottom:8px}
  .mm-menu h2,.mm-result h2{font-size:clamp(1.6rem,4vw,2.2rem);margin-bottom:8px}
  .mm-menu p,.mm-result p{color:var(--muted);margin-bottom:18px;font-size:.92rem}
  .mm-levels{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:14px}
  .mm-level{display:block;padding:16px 14px;border:2px solid var(--border);border-radius:16px;background:#fff;cursor:pointer;font:inherit;text-align:left;transition:.18s}
  .mm-level:hover{border-color:var(--green);transform:translateY(-3px)}
  .mm-level b{display:block;color:var(--blue-dark);font:700 1.05rem "Space Grotesk",sans-serif;margin-bottom:3px}
  .mm-level small{color:var(--muted)}
  .mm-level em{display:block;margin-top:8px;color:var(--green);font:700 .75rem "DM Sans",sans-serif;font-style:normal}
  .mm-big{font:700 3.2rem "Space Grotesk",sans-serif;color:var(--green);margin:6px 0}
  .mm-stats{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin:10px 0 20px;color:var(--blue-dark);font-weight:600;font-size:.88rem}
  .mm-result .btn{margin:4px}
  .mm-pause{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(255,255,255,.92);border-radius:18px;backdrop-filter:blur(3px)}
  .mm-pause h3{font-size:1.5rem}
  .mm-pause[hidden]{display:none}
  @media (prefers-reduced-motion:reduce){.mm-inner,.mm-card,.mm-float{transition:none;animation:none}}`;

  function ensureCss() {
    if (document.getElementById("mm-css")) return;
    const s = document.createElement("style"); s.id = "mm-css"; s.textContent = CSS;
    document.head.appendChild(s);
  }
  function cleanup() {
    clearTimeout(flipT); clearTimeout(resultT); clearInterval(tickT);
    document.removeEventListener("visibilitychange", onHide);
  }
  function mount(html) { root.innerHTML = `<div class="mm">${html}</div>`; }

  function start(r) {
    cleanup(); root = r; ensureCss();
    document.addEventListener("visibilitychange", onHide);
    menu();
  }
  function menu() {
    S = null;
    mount(`<div class="mm-menu">
      <div class="mm-kicker">SJBQUEST</div>
      <h2>Memory Challenge</h2>
      <p>Klik twee kaarten open. Koppel het begrip aan de juiste betekenis — hoe minder zetten, hoe meer punten.</p>
      <div class="mm-levels">${LEVELS.map(([n, name, desc]) => `
        <button class="mm-level" data-level="${n}"><b>${name}</b><small>${desc}</small>
          <em>Record: ${best[n] || "—"}</em></button>`).join("")}</div>
      <button class="btn" id="mm-back">Terug</button>
    </div>`);
    root.querySelectorAll("[data-level]").forEach(b => b.onclick = () => begin(+b.dataset.level));
    $("#mm-back").onclick = () => SJ.home();
  }

  function begin(n) {
    const deck = shuffle(getPairs()).slice(0, n);
    const cards = shuffle(deck.flatMap((p, pair) => [
      { pair, side: "antwoord", text: p.antwoord, categorie: p.categorie },
      { pair, side: "vraag",    text: p.vraag,    categorie: p.categorie }
    ]));
    S = { n, cards, open: [], matched: 0, moves: 0, combo: 0, bestCombo: 0,
          score: 0, lock: false, start: 0, elapsed: 0, paused: false, done: false };
    mount(`<div class="mm-head">
      <div class="mm-stat"><span>SCORE</span><strong id="mm-score">0</strong></div>
      <div class="mm-stat down"><span>ZETTEN</span><strong id="mm-moves">0</strong></div>
      <div class="mm-stat down"><span>TIJD</span><strong id="mm-time">0:00</strong></div>
      <button class="btn" id="mm-home">Terug</button>
    </div>
    <div class="mm-progress"><div class="bar"><i id="mm-bar" style="width:0%"></i></div><div class="mm-combo" id="mm-combo"></div></div>
    <div class="mm-wrap"><div class="mm-grid" id="mm-grid">
      ${cards.map((c, i) => `<button class="mm-card" data-i="${i}" aria-label="Dichtgeklapte kaart ${i + 1}" aria-pressed="false">
        <span class="mm-inner"><span class="mm-back"><span class="mm-mark"><i class="lni lni-plus" aria-hidden="true"></i></span><span class="mm-brand">SJBQUEST</span></span>
        <span class="mm-face"><small>${c.categorie}</small><b>${c.text}</b></span></span></button>`).join("")}
    </div><div class="mm-pause" id="mm-pause" hidden><h3>Even rust</h3><p>Je tijd staat stil.</p><button class="btn primary" id="mm-resume">Hervatten</button><button class="btn" id="mm-stop">Stoppen</button></div></div>
    <p class="mm-tip">Pijltjestoetsen navigeren · Enter of spatie klapt een kaart open.</p>`);

    const grid = $("#mm-grid");
    grid.addEventListener("click", e => { const card = e.target.closest(".mm-card"); if (card) flip(card); });
    grid.addEventListener("keydown", e => {
      const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key];
      if (!step) return;
      e.preventDefault();
      const list = [...grid.querySelectorAll(".mm-card")], i = list.indexOf(document.activeElement);
      if (i >= 0 && i + step >= 0 && i + step < list.length) list[i + step].focus();
    });
    $("#mm-home").onclick = () => SJ.home();
    $("#mm-resume").onclick = resume;
    $("#mm-stop").onclick = () => { S.done = true; menu(); };
  }

  function tick() {
    if (!S || S.done || S.paused) return;
    $("#mm-time").textContent = fmt((Date.now() - S.start) / 1000);
  }
  function updateHud() {
    if (!S) return;
    $("#mm-score").textContent = S.score;
    $("#mm-moves").textContent = S.moves;
    $("#mm-bar").style.width = (S.matched / S.n * 100) + "%";
    const c = $("#mm-combo");
    c.innerHTML = S.combo > 1 ? `${SJ.ico("fireworks")} combo x${S.combo}` : "";
  }
  function pop(el, text) {
    if (reduce) return;
    const wrap = $(".mm-wrap"), s = document.createElement("span");
    s.className = "mm-float"; s.textContent = text;
    s.style.left = el.offsetLeft + el.offsetWidth / 2 + "px";
    s.style.top = el.offsetTop + "px";
    wrap.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }

  function flip(el) {
    if (!S || S.done || S.paused || S.lock || el.classList.contains("open") || el.classList.contains("done")) return;
    const c = S.cards[+el.dataset.i];
    el.classList.add("open"); el.setAttribute("aria-pressed", "true");
    el.setAttribute("aria-label", (c.side === "antwoord" ? "Begrip: " : "Betekenis: ") + c.text);
    sfx.flip();
    if (!S.start) { S.start = Date.now(); tickT = setInterval(tick, 250); }
    S.open.push(el);
    if (S.open.length === 2) { S.moves++; S.lock = true; check(); }
    updateHud();
  }

  function check() {
    const [a, b] = S.open;
    const ca = S.cards[+a.dataset.i], cb = S.cards[+b.dataset.i];
    if (ca.pair === cb.pair) {
      S.matched++; S.combo++;
      S.bestCombo = Math.max(S.bestCombo, S.combo);
      const gain = 50 + Math.min(S.combo - 1, 4) * 15;
      S.score += gain;
      SJ.addXp(5, { right: true, combo: S.combo });
      a.classList.add("done"); b.classList.add("done");
      pop(b, `+${gain}`);
      S.combo > 1 ? sfx.combo() : sfx.match();
      S.open = []; S.lock = false;
      updateHud();
      if (S.matched === S.n) win();
    } else {
      S.combo = 0; sfx.miss();
      a.classList.add("bad"); b.classList.add("bad");
      flipT = setTimeout(() => {
        [a, b].forEach(el => {
          el.classList.remove("open", "bad"); el.setAttribute("aria-pressed", "false");
          el.setAttribute("aria-label", "Kaart dichtgeklapt");
        });
        S.open = []; S.lock = false; updateHud();
      }, reduce ? 1000 : 1500);
    }
  }

  function win() {
    clearInterval(tickT);
    S.done = true; S.elapsed = (Date.now() - S.start) / 1000;
    const timeBonus = Math.max(0, Math.round((S.n * 25 - S.elapsed) * 2));
    const moveBonus = Math.max(0, (S.n * 2 - S.moves) * 15);
    S.score += timeBonus + moveBonus;
    SJ.addXp(Math.max(5, Math.round(S.score / 30)));
    best[S.n] = Math.max(best[S.n], S.score);
    sfx.win();
    if (S.score >= S.n * 90) SJ.confetti();
    updateHud();
    resultT = setTimeout(() => {
      mount(`<div class="mm-result">
        <div class="mm-kicker">MEMORY CHALLENGE · ${S.n} PAREN</div>
        <h2>${S.score >= S.n * 90 ? "Scherp geheugen!" : S.score >= S.n * 65 ? "Goed gedaan!" : "Weer wat geoefend."}</h2>
        <div class="mm-big">${S.score}</div>
        <p>${S.moves} zetten · ${fmt(S.elapsed)} · beste combo x${S.bestCombo}</p>
        <p class="small">Tijdbonus +${timeBonus} · zettenbonus +${moveBonus}</p>
        <button class="btn primary" id="mm-again">Opnieuw</button>
        <button class="btn" id="mm-other">Andere moeilijkheid</button>
        <button class="btn" id="mm-home2">Startpagina</button>
      </div>`);
      $("#mm-again").onclick = () => begin(S.n);
      $("#mm-other").onclick = menu;
      $("#mm-home2").onclick = () => SJ.home();
    }, reduce ? 100 : 600);
  }

  const onHide = () => {
    if (!S || S.done || !S.start) return;
    if (document.hidden && !S.paused) {
      S.paused = true; clearInterval(tickT);
      S.elapsed = (Date.now() - S.start) / 1000;
      $("#mm-pause").hidden = false;
    }
  };
  function resume() {
    if (!S || !S.paused) return;
    S.paused = false; S.start = Date.now() - S.elapsed * 1000;
    $("#mm-pause").hidden = true;
    tickT = setInterval(tick, 250);
  }

  SJ.registerGame("memory", { start, stop: cleanup });
})();
