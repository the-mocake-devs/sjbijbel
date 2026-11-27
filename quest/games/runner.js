/* FAITH RUNNER — pseudo-3D endless runner met vraag-poorten. */
(() => {
  const W = 420, H = 720, CX = W / 2;
  const HORIZON = H * 0.30, GROUND = H * 0.90, FOCAL = 260, LANE_W = 108;
  const SPAWN_Z = 640, GATE_Z = 620;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  let root, cv, c, raf, last, S, running = false, paused = false, best = 0, msgT, audio;
  const $ = s => root.querySelector(s);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

  /* --- perspectief: z = afstand voor de speler, 0 = bij de speler --- */
  const K = z => FOCAL / (FOCAL + Math.max(z, -FOCAL * .55));
  const PY = z => HORIZON + (GROUND - HORIZON) * K(z);
  const PX = (coord, z) => CX + coord * LANE_W * K(z);

  /* --- audio: rijkere geluiden dan SJ.beep, maar zelfde aan/uit-schakelaar --- */
  function tone(freq, dur = .1, delay = 0, type = "sine", vol = .05, slide = 0) {
    if (!SJ.state.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime + delay, o = audio.createOscillator(), g = audio.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
      g.gain.setValueAtTime(.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + .012);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + dur + .02);
    } catch (e) { /* audio niet beschikbaar */ }
  }
  const sfx = {
    jump:   () => { tone(380, .13, 0, "triangle", .05, 260); },
    land:   () => { tone(150, .08, 0, "sine", .04); },
    coin:   () => { tone(880, .07, 0, "square", .025); tone(1320, .09, .06, "square", .02); },
    power:  () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, .12, i * .07, "triangle", .035)); },
    hurt:   () => { tone(200, .28, 0, "sawtooth", .045, -120); },
    right:  () => { [660, 880, 1170].forEach((f, i) => tone(f, .13, i * .07, "triangle", .04)); },
    wrong:  () => { tone(240, .22, 0, "square", .035, -90); },
    near:   () => { tone(1200, .05, 0, "sine", .02); }
  };

  const CSS = `.rn{max-width:420px;margin:0 auto}
  .rn-hud{display:flex;align-items:center;gap:12px;margin-bottom:10px}
  .rn-score{background:linear-gradient(145deg,#0d294b,#153c6b);color:#fff;border-radius:16px;padding:8px 16px;min-width:104px;box-shadow:0 8px 24px rgba(13,41,75,.22)}
  .rn-score span{display:block;font:700 .62rem "Space Grotesk",sans-serif;letter-spacing:.18em;color:#8fbbe0}
  .rn-score strong{display:block;font:700 1.5rem "Space Grotesk",sans-serif;line-height:1.1;color:var(--yellow)}
  .rn-energy{flex:1}
  .rn-energy-top{display:flex;justify-content:space-between;font:700 .7rem "DM Sans",sans-serif;color:var(--blue);margin-bottom:5px;letter-spacing:.06em}
  .rn-bar{height:12px;background:#dbe6f1;box-shadow:inset 0 1px 3px rgba(13,41,75,.12)}
  .rn-bar i{background:linear-gradient(90deg,#3f806d,#8fd07f 60%,#f4c542);height:100%;border-radius:99px;transition:width .25s}
  .rn-pause{flex:0 0 42px;width:42px;height:42px;border-radius:13px;box-shadow:0 6px 18px rgba(13,41,75,.12)}
  .rn-wrap{position:relative;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(13,41,75,.28);background:#eaf2fb;border:3px solid #fff}
  #rn-c{display:block;width:100%;height:auto;touch-action:none}
  .rn-badges{position:absolute;bottom:12px;right:10px;display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:none}
  .rn-badge{font:700 .78rem "DM Sans",sans-serif;padding:5px 10px;border-radius:99px;background:rgba(255,255,255,.92);color:var(--blue-dark);box-shadow:0 4px 14px rgba(13,41,75,.18);animation:rnin .25s ease}
  .rn-badge.combo{background:linear-gradient(135deg,#f4c542,#ffdf7a);color:#6b4a00}
  .rn-badge.shield{background:linear-gradient(135deg,#bdeef5,#e8fbff);color:#125b69}
  .rn-badge.star{background:linear-gradient(135deg,#ffe07a,#fff2bd);color:#7a5b00}
  @keyframes rnin{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
  .rn-m .rn-qhead{display:block;font:700 .58rem "Space Grotesk",sans-serif;letter-spacing:.18em;color:var(--blue);margin-bottom:4px}
  .rn-m .rn-opts{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin-top:8px}
  .rn-m .rn-opt{flex:1 1 30%;min-width:0;display:flex;align-items:center;gap:5px;text-align:left;background:var(--blue-light);border-radius:9px;padding:6px;font:600 .75rem/1.2 "DM Sans",sans-serif;color:var(--blue-dark)}
  .rn-m .rn-opt b{flex:0 0 auto;display:grid;place-items:center;width:18px;height:18px;border-radius:5px;background:var(--yellow);color:#3b2a00;font:700 .68rem "Space Grotesk",sans-serif}
  .rn-m{position:absolute;left:10px;right:10px;top:8px;background:rgba(255,255,255,.96);border:2px solid var(--yellow);border-radius:16px;padding:10px 12px;text-align:center;display:none;font-size:.88rem;font-weight:700;color:var(--blue-dark);box-shadow:0 10px 30px rgba(13,41,75,.2);animation:rnin .2s ease}
  .rn-ov{position:absolute;inset:0;background:linear-gradient(160deg,rgba(10,30,56,.93),rgba(21,60,107,.9));display:flex;align-items:center;justify-content:center;padding:22px;text-align:center;color:#fff;backdrop-filter:blur(4px)}
  .rn-ov>div{max-width:330px}
  .rn-ov h2{font:700 2.1rem "Space Grotesk",sans-serif;color:#fff;margin-bottom:6px;letter-spacing:-.02em}
  .rn-ov h2 b{color:var(--yellow)}
  .rn-ov .rn-kicker{font:700 .62rem "Space Grotesk",sans-serif;letter-spacing:.28em;color:#8fbbe0;margin-bottom:10px}
  .rn-ov p{font-size:.86rem;color:#d8e6f5;margin-bottom:12px;line-height:1.55}
  .rn-ov .rn-keys{display:inline-flex;gap:5px;flex-wrap:wrap;justify-content:center;margin:6px 0 14px}
  .rn-ov kbd{font:700 .72rem "DM Sans",sans-serif;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-bottom-width:3px;border-radius:7px;padding:3px 8px;color:#fff}
  .rn-ov .btn{display:inline-block;margin:5px 4px 0;padding:12px 20px;border-radius:14px;border:2px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);color:#fff;font-weight:700;cursor:pointer;transition:.18s}
  .rn-ov .btn:hover{transform:translateY(-2px);background:rgba(255,255,255,.16)}
  .rn-ov .btn.primary{background:var(--yellow);border-color:var(--yellow);color:#3b2a00;box-shadow:0 8px 22px rgba(244,197,66,.3)}
  .rn-ov .btn.primary:hover{background:#ffdc72}
  .rn-ov .rn-best{color:var(--yellow);font-weight:700}
  .rn-ov .rn-stat{font:700 2.6rem "Space Grotesk",sans-serif;color:var(--yellow);margin:8px 0}
  .rn-tip{text-align:center;color:var(--muted);font-size:.75rem;margin-top:9px}
  .rn-energy-top .lni{font-size:13px;vertical-align:-1px;margin-right:3px}
  .rn-keys .lni{font-size:14px;vertical-align:0}
  .rn-best .lni,.rn-m .lni{font-size:1em;vertical-align:-.12em;margin-right:4px}
  .rn-badge .lni{font-size:.9em;vertical-align:-.1em;margin-right:3px}
  .rn-tip .lni{font-size:1em;vertical-align:-.12em}
  @media (prefers-reduced-motion:reduce){.rn-badge,.rn-m{animation:none}}`;

  function ensureCss() {
    if (document.getElementById("rn-css")) return;
    const s = document.createElement("style"); s.id = "rn-css"; s.textContent = CSS;
    document.head.appendChild(s);
  }
  function cleanup() {
    running = false; cancelAnimationFrame(raf);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", onHide);
  }
  function start(r) {
    cleanup(); root = r; ensureCss();
    root.innerHTML = `<div class="rn">
      <div class="rn-hud">
        <div class="rn-score"><span>SCORE</span><strong id="rn-s">0</strong></div>
        <div class="rn-energy"><div class="rn-energy-top"><span>${SJ.ico("bolt-2")} ENERGIE</span><span id="rn-ep">100%</span></div><div class="bar rn-bar"><i id="rn-e" style="width:100%"></i></div></div>
        <button class="icon-btn rn-pause" id="rn-p" aria-label="Pauze">⏸</button>
      </div>
      <div class="rn-wrap">
        <canvas id="rn-c"></canvas>
        <div id="rn-badges" class="rn-badges"></div>
        <div id="rn-m" class="rn-m"></div>
        <div id="rn-ov" class="rn-ov"></div>
      </div>
      <p class="rn-tip">Pijltjes / A D om te wisselen · ${SJ.ico("arrow-upward")} of spatie om te springen · veeg op touch</p>
    </div>`;
    cv = $("#rn-c");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr;
    c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onHide);
    let sx, sy;
    cv.onpointerdown = e => { sx = e.clientX; sy = e.clientY; };
    cv.onpointerup = e => {
      if (sx == null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1);
      else if (dy < -28) jump(); else jump();
    };
    cv.onpointercancel = () => { sx = null; };
    $("#rn-p").onclick = togglePause;
    menu();
  }

  /* ---场面 elementen (eens per sessie gegenereerd)--- */
  let skyline = [], clouds = [];
  function makeScenery() {
    skyline = Array.from({ length: 42 }, (_, i) => ({ x: i * 48, w: rand(28, 54), h: rand(24, 105), lit: Math.random() < .55 }));
    clouds = Array.from({ length: 7 }, () => ({ x: rand(0, W + 300), y: rand(18, HORIZON - 12), s: rand(.6, 1.5), a: rand(.14, .4) }));
  }

  const ov = html => { const o = $("#rn-ov"); o.style.display = html ? "flex" : "none"; if (html) o.innerHTML = `<div>${html}</div>`; };
  function menu() {
    ov(`<div class="rn-kicker">SJBIBEL GAME</div><h2>FAITH <b>RUNNER</b></h2>
      <p>Ren door de stad, verzamel munten en kies de juiste baan bij elke vraag.</p>
      <div class="rn-keys"><kbd>${SJ.ico("arrow-left")}</kbd><kbd>${SJ.ico("arrow-right")}</kbd><kbd>${SJ.ico("arrow-upward")}</kbd><kbd>SPACE</kbd></div>
      <p><span class="rn-best">${SJ.ico("trophy-1")} Sessierecord: ${best}</span></p>
      <button class="btn primary" id="go">Start de run</button><button class="btn" id="back">Terug</button>`);
    $("#go").onclick = begin; $("#back").onclick = () => SJ.home();
  }
  function begin() {
    clearTimeout(msgT);
    makeScenery();
    S = {
      t: 0, dist: 0, score: 0, energy: 100, lane: 1, vx: 0, jz: 0, vz: 0,
      inv: 0, dbl: 0, shake: 0, squash: 0, shield: 0, streak: 0, correct: 0, coins: 0,
      obs: [], picks: [], gate: null, spawn: 190, qt: 8,
      parts: [], labels: [], lastBadges: "", train: 0
    };
    ov(null); $("#rn-m").style.display = "none";
    paused = false; running = true; last = performance.now();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    sfx.power();
  }

  /* --- invoer --- */
  function move(d) { if (running && !paused) { S.lane = clamp(S.lane + d, 0, 2); tone(560, .04, 0, "sine", .018); } }
  function jump() { if (running && !paused && S.jz === 0) { S.vz = 660; sfx.jump(); } }
  function onKey(e) {
    if (!running) return;
    const k = e.key.toLowerCase();
    if (k === "escape" || k === "p") { e.preventDefault(); return togglePause(); }
    if (!["arrowleft", "arrowright", "arrowup", " ", "a", "d", "w"].includes(k)) return;
    e.preventDefault();
    if (k === "arrowleft" || k === "a") move(-1);
    else if (k === "arrowright" || k === "d") move(1);
    else jump();
  }
  const onHide = () => { if (document.hidden && running && !paused) togglePause(); };
  function togglePause() {
    if (!running) return;
    paused = !paused;
    $("#rn-p").textContent = paused ? "▶" : "⏸";
    $("#rn-p").setAttribute("aria-label", paused ? "Hervatten" : "Pauze");
    if (paused) {
      ov(`<div class="rn-kicker">PAUZE</div><h2>Even <b>rust</b></h2><p>Je run staat klaar.</p>
        <button class="btn primary" id="rs">Hervatten</button><button class="btn" id="qt">Stoppen</button>`);
      $("#rs").onclick = togglePause;
      $("#qt").onclick = () => { running = false; paused = false; $("#rn-p").textContent = "⏸"; menu(); };
    } else { ov(null); last = performance.now(); }
  }
  function msg(t, ms = 1400) {
    const m = $("#rn-m"); m.innerHTML = t; m.style.display = "block";
    clearTimeout(msgT); msgT = setTimeout(() => { if (m) m.style.display = "none"; }, ms);
  }

  /* --- spawnen --- */
  function spawnRow() {
    const two = S.t > 22 && Math.random() < .4;
    const blocked = shuffle([0, 1, 2]).slice(0, two ? 2 : 1);
    const free = [0, 1, 2].filter(i => !blocked.includes(i));
    blocked.forEach(i => S.obs.push({ coord: i - 1, z: SPAWN_Z, type: Math.random() < .5 ? "low" : "high", hit: false, passed: false, seed: rand(0, 9) }));
    const lane = free[Math.floor(Math.random() * free.length)] - 1, r = Math.random();
    if (r < .62) for (let k = 0; k < 4; k++) S.picks.push({ coord: lane, z: SPAWN_Z + k * 54, type: "coin", ph: rand(0, 6), got: false });
    else if (r < .8) S.picks.push({ coord: lane, z: SPAWN_Z, type: Math.random() < .55 ? "shield" : "star", ph: rand(0, 6), got: false });
    else if (r < .9) S.picks.push({ coord: lane, z: SPAWN_Z, type: "life", ph: rand(0, 6), got: false });
    S.spawn = 235 - Math.min(S.t * 1.4, 75);
  }
  function spawnGate() {
    const q = SJ.pick({ count: 1, game: "faithrunner" })[0];
    if (!q) { S.qt = 18; return; }
    const wrong = shuffle(q.answers.filter((_, i) => i !== q.correct)).slice(0, 2);
    const opts = shuffle([{ t: q.answers[q.correct], ok: true }, ...wrong.map(t => ({ t, ok: false }))]);
    // Vaste 7 seconden van spawn tot antwoord, ongeacht de loopsnelheid.
    S.gate = { z: GATE_Z, speed: (GATE_Z - 14) / 7, opts, q, done: false, pick: -1 };
    msg(`<span class="rn-qhead">KIES JE STROOK</span><b>${q.question}</b>
      <div class="rn-opts">${opts.map((o, i) => `<span class="rn-opt"><b>${"ABC"[i]}</b>${o.t}</span>`).join("")}</div>`, 7200);
    sfx.power();
  }
  const burst = (x, y, color, n = 12, type = "dot") => {
    if (reduce) return;
    for (let i = 0; i < n && S.parts.length < 180; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(40, 190);
      S.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: rand(.4, .9), max: .9, color, size: rand(2, 5), type });
    }
  };
  const label = (text, x, y, color = "#f4c542", size = 18) => S.labels.push({ text, x, y, color, size, life: 1.15 });

  /* --- spelregels --- */
  function hurt() {
    if (S.inv > 0) return;
    if (S.shield) { S.shield = 0; S.inv = 1; msg(SJ.ico("shield-2") + " Schild gebroken!"); burst(CX, GROUND - 40, "#5fd0e0", 18); sfx.power(); return; }
    S.energy -= 20; S.inv = 1.2; S.shake = .35; sfx.hurt();
    burst(CX, GROUND - 30, "#c0504d", 14);
    if (S.energy <= 0) over();
  }
  function resolve(g) {
    g.done = true; g.pick = clamp(Math.round(S.vx) + 1, 0, 2);
    if (g.opts[g.pick].ok) {
      S.streak++; S.correct++;
      const bonus = 100 + Math.min(S.streak - 1, 4) * 25;
      S.score += bonus; S.energy = Math.min(100, S.energy + 15);
      SJ.addXp(5, { right: true, combo: S.streak }); sfx.right();
      label(`+${bonus}  JUIST!`, PX(g.pick - 1, 0), GROUND - 120, "#2e7d63", 22);
      msg(`${SJ.ico("spark")} Juist! +${bonus} punten${S.streak > 1 ? " · reeks x" + S.streak : ""}`, 1600);
      burst(CX, GROUND - 100, "#f4c542", 24);
      if (S.streak === 3) SJ.confetti();
    } else {
      S.streak = 0; S.energy -= 20; S.shake = .35; sfx.wrong();
      msg(`<b>Juiste antwoord:</b> ${g.opts.find(o => o.ok).t}<br><small>${g.q.explanation}</small>`, 4200);
      label("MIS!", PX(g.pick - 1, 0), GROUND - 120, "#c0504d", 22);
      if (S.energy <= 0) over();
    }
  }

  function update(dt) {
    S.t += dt;
    const speed = 145 + Math.min(S.t * 1.8, 105);
    const v = speed * (S.gate && !S.gate.done ? .85 : 1) * dt;
    S.dist += v; S.score += v * .07 * (S.dbl > 0 ? 2 : 1);

    S.vx += ((S.lane - 1) - S.vx) * Math.min(1, dt * 13);
    if (S.jz > 0 || S.vz > 0) {
      S.vz -= 1900 * dt; S.jz += S.vz * dt;
      if (S.jz <= 0) { S.jz = 0; S.vz = 0; S.squash = .22; sfx.land(); burst(CX, GROUND, "#b9c9da", 7, "dust"); }
    }
    S.inv = Math.max(0, S.inv - dt); S.dbl = Math.max(0, S.dbl - dt);
    S.shake = Math.max(0, S.shake - dt); S.squash = Math.max(0, S.squash - dt * 1.8);

    if (!S.gate) {
      S.qt -= dt;
      if (S.qt <= 0) { if (!S.obs.some(o => o.z > 320)) spawnGate(); }
      else { S.spawn -= v; if (S.spawn <= 0) spawnRow(); }
    }

    for (const o of S.obs) {
      o.z -= v;
      if (!o.passed && o.z <= 0) {
        o.passed = true;
        if (!o.hit && Math.abs(Math.abs(S.vx - o.coord) - 1) < .08 && S.energy > 0) {
          S.score += 8; label("BIJNA!", PX(o.coord, 0), GROUND - 60, "#1d6fa5", 14); sfx.near();
        }
      }
      if (!o.hit && o.z < 18 && o.z > -22 && Math.abs(S.vx - o.coord) < .42) {
        if (o.type === "low" && S.jz > 30) continue;
        o.hit = true; hurt();
      }
    }
    S.obs = S.obs.filter(o => o.z > -140);

    for (const p of S.picks) {
      p.z -= v;
      if (!p.got && p.z < 22 && p.z > -22 && Math.abs(S.vx - p.coord) < .48) {
        p.got = true;
        if (p.type === "coin") { S.coins++; S.score += 10 * (S.dbl > 0 ? 2 : 1); sfx.coin(); burst(PX(p.coord, 0), GROUND - 50, "#f4c542", 6); }
        else if (p.type === "shield") { S.shield = 1; msg(SJ.ico("shield-2") + " Schild geactiveerd!"); sfx.power(); }
        else if (p.type === "life") { S.energy = Math.min(100, S.energy + 25); msg(SJ.ico("heart") + " Energie +25"); sfx.power(); }
        else { S.dbl = 8; msg(SJ.ico("star-fat") + " Dubbele punten (8s)!"); sfx.power(); }
      }
    }
    S.picks = S.picks.filter(p => p.z > -140 && !p.got);

    const g = S.gate;
    if (g) {
      g.z -= g.speed * dt;
      if (!g.done && g.z <= 14) resolve(g);
      if (g.z < -150) { S.gate = null; S.qt = rand(10, 15); S.spawn = 200; }
    }

    for (const p of S.parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; }
    S.parts = S.parts.filter(p => p.life > 0);
    for (const l of S.labels) { l.life -= dt; l.y -= 46 * dt; }
    S.labels = S.labels.filter(l => l.life > 0);

    $("#rn-s").textContent = Math.floor(S.score).toLocaleString("nl-NL");
    $("#rn-e").style.width = Math.max(0, S.energy) + "%";
    $("#rn-ep").textContent = Math.max(0, Math.ceil(S.energy)) + "%";
    let b = "";
    if (S.streak > 1) b += `<span class="rn-badge combo">${SJ.ico("fireworks")} x${S.streak}</span>`;
    if (S.shield) b += `<span class="rn-badge shield">${SJ.ico("shield-2")} Schild</span>`;
    if (S.dbl > 0) b += `<span class="rn-badge star">${SJ.ico("star-fat")} ${Math.ceil(S.dbl)}s</span>`;
    if (b !== S.lastBadges) { $("#rn-badges").innerHTML = b; S.lastBadges = b; }
  }
  const loop = now => {
    const dt = Math.min((now - last) / 1000, .05); last = now;
    if (!paused && running) update(dt);
    draw();
    if (running) raf = requestAnimationFrame(loop);
  };

  function over() {
    running = false; cancelAnimationFrame(raf); draw();
    $("#rn-badges").innerHTML = ""; S.lastBadges = "";
    const sc = Math.floor(S.score), isBest = sc > best; if (isBest) best = sc;
    SJ.addXp(Math.floor(sc / 20));
    if (isBest && sc > 50) SJ.confetti();
    sfx.wrong();
    ov(`<div class="rn-kicker">RUN AFGELOPEN</div><h2>Game <b>over</b></h2>
      <div class="rn-stat">${sc}</div>
      <p>${isBest ? `${SJ.ico("trophy-1")} Nieuw sessierecord!` : `${SJ.ico("trophy-1")} Record: ${best}`}<br>${S.correct} juiste antwoorden · ${S.coins} munten</p>
      <button class="btn primary" id="again">Opnieuw</button><button class="btn" id="home">Startpagina</button>`);
    $("#again").onclick = begin; $("#home").onclick = () => SJ.home();
  }

  /* --- tekenen --- */
  function rr(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r);
    else { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  }
  function starPath(x, y, r1, r2) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r2 : r1;
      const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath();
  }
  /* Iconen in de canvas worden als lijnen getekend, niet als tekstglyfen. */
  function crossMark(x, y, r, color, w) {
    c.strokeStyle = color; c.lineWidth = w; c.lineCap = "round";
    c.beginPath(); c.moveTo(x, y - r); c.lineTo(x, y + r);
    c.moveTo(x - r * .62, y - r * .22); c.lineTo(x + r * .62, y - r * .22); c.stroke();
  }
  function shieldMark(x, y, r, color, w) {
    c.strokeStyle = color; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r * .85, y - r * .5);
    c.lineTo(x + r * .85, y + r * .18);
    c.quadraticCurveTo(x + r * .85, y + r * .72, x, y + r);
    c.quadraticCurveTo(x - r * .85, y + r * .72, x - r * .85, y + r * .18);
    c.lineTo(x - r * .85, y - r * .5); c.closePath(); c.stroke();
  }
  function checkMark(x, y, r, color, w) {
    c.strokeStyle = color; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); c.moveTo(x - r, y); c.lineTo(x - r * .2, y + r * .7);
    c.lineTo(x + r, y - r * .8); c.stroke();
  }
  function xMark(x, y, r, color, w) {
    c.strokeStyle = color; c.lineWidth = w; c.lineCap = "round";
    c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r);
    c.moveTo(x + r, y - r); c.lineTo(x - r, y + r); c.stroke();
  }
  function wrap(text, maxW) {
    const lines = []; let cur = "";
    for (const w of text.split(" ")) {
      const tr = cur ? cur + " " + w : w;
      if (c.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr;
    }
    lines.push(cur); return lines;
  }

  function drawSky() {
    const g = c.createLinearGradient(0, 0, 0, HORIZON + 70);
    g.addColorStop(0, "#0c2548"); g.addColorStop(.55, "#3c7cb7"); g.addColorStop(1, "#eaf3fb");
    c.fillStyle = g; c.fillRect(0, 0, W, HORIZON + 70);

    const sun = c.createRadialGradient(W * .74, HORIZON * .42, 2, W * .74, HORIZON * .42, 120);
    sun.addColorStop(0, "rgba(255,247,205,.95)"); sun.addColorStop(.18, "rgba(255,230,150,.5)"); sun.addColorStop(1, "rgba(255,230,150,0)");
    c.fillStyle = sun; c.fillRect(0, 0, W, HORIZON + 70);

    for (const cl of clouds) {
      const span = W + 320;
      const x = ((cl.x - S.dist * .012) % span + span) % span - 160;
      c.fillStyle = `rgba(255,255,255,${cl.a})`;
      c.beginPath(); c.ellipse(x, cl.y, 42 * cl.s, 12 * cl.s, 0, 0, 7);
      c.ellipse(x + 24 * cl.s, cl.y + 3 * cl.s, 28 * cl.s, 9 * cl.s, 0, 0, 7);
      c.ellipse(x - 22 * cl.s, cl.y + 4 * cl.s, 26 * cl.s, 8 * cl.s, 0, 0, 7); c.fill();
    }
    // skyline: twee parallax-lagen
    const total = skyline.length * 48;
    [[.012, "rgba(21,60,107,.28)", HORIZON + 12, false], [.03, "rgba(13,41,75,.55)", HORIZON + 8, true]].forEach(([f, col, base, lit]) => {
      const off = (S.dist * f) % total;
      c.fillStyle = col;
      for (let rep = -1; rep <= 1; rep++) for (const b of skyline) {
        const x = b.x - off + rep * total;
        if (x > W + 60 || x + b.w < -60) continue;
        c.fillRect(x, base - b.h, b.w, b.h + 10);
        if (lit && b.lit) {
          c.fillStyle = "rgba(255,226,140,.22)";
          for (let wy = base - b.h + 8; wy < base - 6; wy += 12)
            for (let wx = x + 6; wx < x + b.w - 4; wx += 11) c.fillRect(wx, wy, 4, 5);
          c.fillStyle = col;
        }
      }
    });
    const hz = c.createLinearGradient(0, HORIZON - 22, 0, HORIZON + 55);
    hz.addColorStop(0, "rgba(255,255,255,.7)"); hz.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = hz; c.fillRect(0, HORIZON - 22, W, 78);
  }

  function drawTrack() {
    const gg = c.createLinearGradient(0, HORIZON, 0, H);
    gg.addColorStop(0, "#dce9f4"); gg.addColorStop(.3, "#f0f6fb"); gg.addColorStop(1, "#d3e0ed");
    c.fillStyle = gg; c.fillRect(0, HORIZON, W, H - HORIZON);

    const zF = 900, zN = -80;
    c.fillStyle = "#ccd9e7"; c.beginPath();
    c.moveTo(PX(-1.55, zF), PY(zF)); c.lineTo(PX(1.55, zF), PY(zF));
    c.lineTo(PX(1.72, zN), PY(zN)); c.lineTo(PX(-1.72, zN), PY(zN)); c.closePath(); c.fill();

    // dwarsliggers bewegen naar de speler (z wordt kleiner), niet naar de horizon
    const sp = 84, off = -(S.dist % sp);
    for (let z = -84 + off; z < zF; z += sp) {
      const y = PY(z), th = Math.max(1.5, 9 * K(z));
      c.fillStyle = "rgba(105,132,162,.42)"; c.beginPath();
      c.moveTo(PX(-1.48, z), y - th / 2); c.lineTo(PX(1.48, z), y - th / 2);
      c.lineTo(PX(1.48, z), y + th / 2); c.lineTo(PX(-1.48, z), y + th / 2); c.closePath(); c.fill();
      c.fillStyle = "rgba(255,255,255,.35)";
      c.fillRect(PX(-1.48, z), y - th / 2, PX(1.48, z) - PX(-1.48, z), Math.max(.7, 1.6 * K(z)));
    }
    for (const coord of [-1.5, -.5, .5, 1.5]) {
      const grad = c.createLinearGradient(0, PY(zF), 0, PY(zN));
      grad.addColorStop(0, "rgba(120,145,170,.25)"); grad.addColorStop(1, "rgba(70,95,125,.75)");
      c.strokeStyle = grad; c.lineWidth = 3;
      c.beginPath(); c.moveTo(PX(coord, zF), PY(zF)); c.lineTo(PX(coord, zN), PY(zN)); c.stroke();
      c.strokeStyle = "rgba(255,255,255,.6)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(PX(coord, zF) - 1, PY(zF)); c.lineTo(PX(coord, zN) - 1, PY(zN)); c.stroke();
      if (Math.abs(coord) === 1.5) {
        c.strokeStyle = "rgba(244,197,66,.65)"; c.lineWidth = 2;
        c.beginPath(); c.moveTo(PX(coord, zF), PY(zF)); c.lineTo(PX(coord, zN), PY(zN)); c.stroke();
      }
    }
    // speed lines
    const vm = Math.min(1, Math.max(0, Math.min(S.t * 1.8, 105) / 105));
    if (!reduce && vm > .08) for (let i = 0; i < 12; i++) {
      const seed = i * 977 + Math.floor(S.dist / 38) * 131;
      const x = seed % W, y = HORIZON + (seed * 7) % (H - HORIZON);
      c.strokeStyle = `rgba(255,255,255,${.05 + vm * .16})`; c.lineWidth = 1 + vm;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 26 + vm * 55); c.stroke();
    }
  }

  function drawObstacle(o) {
    const s = K(o.z), x = PX(o.coord, o.z), y = PY(o.z);
    c.fillStyle = "rgba(12,34,60,.2)"; c.beginPath(); c.ellipse(x, y + 3 * s, 48 * s, 12 * s, 0, 0, 7); c.fill();
    if (o.type === "low") {
      const w = 94 * s, h = 36 * s, d = 17 * s, top = y - h;
      c.fillStyle = "#ffe9a0"; c.beginPath();
      c.moveTo(x - w / 2, top); c.lineTo(x - w / 2 + d * .5, top - d * .7);
      c.lineTo(x + w / 2 + d * .5, top - d * .7); c.lineTo(x + w / 2, top); c.closePath(); c.fill();
      const fg = c.createLinearGradient(0, top, 0, y);
      fg.addColorStop(0, "#ffe38a"); fg.addColorStop(1, "#e8ad2c");
      rr(x - w / 2, top, w, h, 4 * s); c.fillStyle = fg; c.fill();
      c.save(); rr(x - w / 2, top, w, h, 4 * s); c.clip();
      c.fillStyle = "rgba(21,60,107,.85)";
      for (let sx = x - w / 2 - 20 * s; sx < x + w / 2 + 20 * s; sx += 18 * s) {
        c.beginPath(); c.moveTo(sx, y); c.lineTo(sx + 10 * s, y); c.lineTo(sx + 22 * s, top); c.lineTo(sx + 12 * s, top); c.closePath(); c.fill();
      }
      c.restore();
      c.fillStyle = "#0d294b"; c.fillRect(x - w / 2 + 3 * s, top, 5 * s, h); c.fillRect(x + w / 2 - 8 * s, top, 5 * s, h);
    } else {
      const w = 104 * s, h = 110 * s, d = 32 * s, top = y - h;
      c.fillStyle = "rgba(13,41,75,.35)"; c.beginPath();
      c.moveTo(x + w / 2, top); c.lineTo(x + w / 2 + d * .8, top - d * .55);
      c.lineTo(x + w / 2 + d * .8, y - d * .55); c.lineTo(x + w / 2, y); c.closePath(); c.fill();
      const fg = c.createLinearGradient(0, top, 0, y);
      fg.addColorStop(0, "#4b8bc9"); fg.addColorStop(.5, "#235a94"); fg.addColorStop(1, "#153c6b");
      rr(x - w / 2, top, w, h, 8 * s); c.fillStyle = fg; c.fill();
      c.fillStyle = "#9cc6e6"; c.beginPath();
      c.moveTo(x - w / 2, top + 4 * s); c.lineTo(x - w / 2 + d * .6, top - d * .45);
      c.lineTo(x + w / 2 + d * .6, top - d * .45); c.lineTo(x + w / 2, top + 4 * s); c.closePath(); c.fill();
      c.fillStyle = "rgba(222,240,255,.85)";
      for (let i = 0; i < 2; i++) rr(x - w / 2 + 12 * s, top + 17 * s + i * 36 * s, w - 24 * s, 23 * s, 5 * s), c.fill();
      c.strokeStyle = "rgba(10,30,55,.4)"; c.lineWidth = 2 * s;
      c.beginPath(); c.moveTo(x, top + 6 * s); c.lineTo(x, y); c.stroke();
      c.fillStyle = "#f4c542"; c.fillRect(x - w / 2, top + 61 * s, w, 4 * s);
      c.fillStyle = "#fff3b0"; c.beginPath();
      c.arc(x - w / 2 + 15 * s, y - 13 * s, 4 * s, 0, 7); c.arc(x + w / 2 - 15 * s, y - 13 * s, 4 * s, 0, 7); c.fill();
    }
  }

  function drawPickup(p) {
    const s = K(p.z), x = PX(p.coord, p.z), gy = PY(p.z);
    const y = gy - (44 + Math.sin(S.t * 4 + p.ph) * 7) * s;
    c.fillStyle = "rgba(12,34,60,.16)"; c.beginPath(); c.ellipse(x, gy + 2 * s, 17 * s, 6 * s, 0, 0, 7); c.fill();
    const tint = p.type === "shield" ? "120,220,235" : p.type === "life" ? "130,220,150" : "255,220,130";
    const glow = c.createRadialGradient(x, y, 1, x, y, 32 * s);
    glow.addColorStop(0, `rgba(${tint},.5)`); glow.addColorStop(1, `rgba(${tint},0)`);
    c.fillStyle = glow; c.beginPath(); c.arc(x, y, 32 * s, 0, 7); c.fill();
    const spin = Math.max(.2, Math.abs(Math.cos(S.t * 5 + p.ph)));
    c.save(); c.translate(x, y); c.scale(spin, 1);
    if (p.type === "coin") {
      const cg = c.createLinearGradient(-14 * s, -14 * s, 14 * s, 14 * s);
      cg.addColorStop(0, "#fff0a5"); cg.addColorStop(.5, "#f4c542"); cg.addColorStop(1, "#c28615");
      c.beginPath(); c.arc(0, 0, 14 * s, 0, 7); c.fillStyle = cg; c.fill();
      c.strokeStyle = "#fff6c8"; c.lineWidth = 2 * s; c.stroke();
      crossMark(0, 0, 9 * s, "#a06e10", 2.4 * s);
    } else if (p.type === "shield") {
      c.fillStyle = "rgba(95,208,224,.3)"; c.beginPath(); c.arc(0, 0, 17 * s, 0, 7); c.fill();
      c.strokeStyle = "#5fd0e0"; c.lineWidth = 3 * s; c.stroke();
      shieldMark(0, 0, 12 * s, "#eaffff", 2 * s);
    } else if (p.type === "life") {
      c.fillStyle = "#3f806d"; c.beginPath(); c.arc(0, 0, 16 * s, 0, 7); c.fill();
      c.strokeStyle = "#d6f5e4"; c.lineWidth = 2 * s; c.stroke();
      c.fillStyle = "#fff"; c.fillRect(-2 * s, -9 * s, 4 * s, 18 * s); c.fillRect(-9 * s, -2 * s, 18 * s, 4 * s);
    } else {
      c.rotate(S.t * 1.6 + p.ph);
      starPath(0, 0, 18 * s, 8 * s); c.fillStyle = "#ffe07a"; c.fill(); c.strokeStyle = "#d19b20"; c.lineWidth = 2 * s; c.stroke();
    }
    c.restore();
  }

  function drawGate(g) {
    const s = K(g.z), y = PY(g.z);
    c.fillStyle = "rgba(13,41,75,.16)"; c.beginPath(); c.ellipse(CX, y + 4 * s, 170 * s, 18 * s, 0, 0, 7); c.fill();
    const beam = c.createLinearGradient(0, y - 76 * s, 0, y - 72 * s);
    beam.addColorStop(0, "rgba(244,197,66,.15)"); beam.addColorStop(1, "rgba(244,197,66,.85)");
    c.fillStyle = beam; c.fillRect(PX(-1.45, g.z), y - 76 * s, PX(1.45, g.z) - PX(-1.45, g.z), 4 * s);
    g.opts.forEach((o, i) => {
      const x = PX(i - 1, g.z), w = 120 * s, h = 74 * s, top = y - 74 * s;
      let border = "#153c6b", bg = "rgba(255,255,255,.98)";
      if (g.done) {
        if (o.ok) { border = "#3f806d"; bg = "#e6f3ee"; }
        else if (i === g.pick) { border = "#c0504d"; bg = "#fbeaea"; }
        else { border = "#cbd5df"; bg = "rgba(255,255,255,.75)"; }
      }
      rr(x - w / 2, top, w, h, 10 * s); c.fillStyle = bg; c.fill();
      c.strokeStyle = border; c.lineWidth = Math.max(2, 3 * s); c.stroke();
      // Alleen A / B / C op het speelveld — de tekst staat in de toast.
      c.fillStyle = border; c.font = `700 ${Math.max(18, 34 * s)}px "Space Grotesk",sans-serif`;
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText("ABC"[i], x, top + h * .5);
      if (g.done && o.ok) checkMark(x + w / 2 - 16 * s, top + 15 * s, 6 * s, "#3f806d", 2.6 * s);
      if (g.done && i === g.pick && !o.ok) xMark(x + w / 2 - 16 * s, top + 15 * s, 5 * s, "#c0504d", 2.6 * s);
    });
  }

  function drawPlayer() {
    const x = CX + S.vx * LANE_W, y = GROUND - S.jz;
    const air = S.jz > 2, cycle = S.t * 12;
    const bob = air ? 0 : Math.abs(Math.sin(cycle)) * 2.5;
    const lean = air ? -.09 : Math.sin(cycle) * .03 + S.vx * .012;
    const sc = 1.2, sq = S.squash || 0;

    // schaduw op de grond
    const sh = clamp(1 - S.jz / 170, .4, 1);
    c.fillStyle = `rgba(12,34,60,${.24 * sh})`;
    c.beginPath(); c.ellipse(x, GROUND + 4, 23 * sh, 9 * sh, 0, 0, 7); c.fill();

    if (S.inv > 0 && Math.floor(S.inv * 14) % 2) return;

    const limb = (x1, y1, x2, y2, w, col) => {
      c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    };
    const sw = air ? 0 : Math.sin(cycle);

    c.save(); c.translate(x, y - bob);
    c.scale(sc * (1 + sq * .4), sc * (1 - sq * .4)); c.rotate(lean);

    // benen met kniebuiging
    [-1, 1].forEach(phase => {
      const hx = phase * 7, hy = -26;
      let kx, ky, fx, fy, tilt;
      if (air) {
        const tuck = phase > 0 ? 1 : .6;
        kx = hx + phase * 5; ky = hy + 12 * tuck;
        fx = kx + phase * 13; fy = ky + 4 * tuck; tilt = phase * .35;
      } else {
        const a = sw * phase;
        kx = hx + Math.sin(a) * 12; ky = hy + Math.cos(a) * 14;
        const b = a - Math.max(0, a) * .9 + Math.max(0, -a) * .55;
        fx = kx + Math.sin(b) * 12; fy = ky + Math.cos(b) * 13;
        tilt = -b * .5;
      }
      limb(hx, hy, kx, ky, 10, "#285085");
      limb(kx, ky, fx, fy, 8, "#1d3f6e");
      c.save(); c.translate(fx, fy); c.rotate(tilt);
      c.fillStyle = "#f4c542"; rr(-6, -3, 14, 7, 3); c.fill(); c.restore();
    });

    // armen (tegenovergestelde zwaai)
    [-1, 1].forEach(phase => {
      const sx = phase * 15, sy = -48;
      let hx, hy, ex, ey;
      if (air) { hx = sx + phase * 4; hy = sy - 10; ex = hx + phase * 6; ey = hy - 11; }
      else {
        const a = -sw * phase * 1.15;
        hx = sx + Math.sin(a) * 9; hy = sy + Math.cos(a) * 11;
        ex = hx + Math.sin(a * 1.6) * 8; ey = hy + Math.cos(a * 1.6) * 9;
      }
      limb(sx, sy, hx, hy, 8, "#2f7b69");
      limb(hx, hy, ex, ey, 7, "#2f7b69");
      c.fillStyle = "#e8b58f"; c.beginPath(); c.arc(ex, ey, 4.5, 0, 7); c.fill();
    });

    // romp + rugzak
    const bg = c.createLinearGradient(-16, -56, 16, -20);
    bg.addColorStop(0, "#57a38c"); bg.addColorStop(1, "#1b5b4c");
    rr(-16, -56, 32, 34, 11); c.fillStyle = bg; c.fill();
    c.fillStyle = "rgba(255,255,255,.14)"; rr(-16, -56, 9, 34, 5), c.fill();
    c.fillStyle = "#153c6b"; rr(-21, -51, 8, 21, 4), c.fill();
    c.fillRect(-16, -27, 32, 4);

    // sjaal met wapperende punt
    c.fillStyle = "#f4c542"; rr(-17, -56, 34, 7, 3.5), c.fill();
    const flap = Math.sin(S.t * 10) * 4;
    c.beginPath(); c.moveTo(10, -54); c.quadraticCurveTo(25 + flap, -48, 21 + flap, -39);
    c.lineTo(8, -49); c.closePath(); c.fill();

    // hoofd
    c.fillStyle = "#e8b58f"; c.beginPath(); c.arc(0, -70, 13, 0, 7); c.fill();
    c.fillStyle = "#dca47d"; c.beginPath(); c.arc(12, -69, 3, 0, 7); c.fill();
    c.fillStyle = "#153c6b"; c.beginPath(); c.arc(0, -72, 13.5, Math.PI, 0); c.fill();
    rr(-14, -76, 28, 5, 2.5), c.fill();
    c.fillStyle = "#f4c542"; c.fillRect(-14, -75, 28, 3);
    c.fillStyle = "#172231"; c.beginPath(); c.arc(-4, -70, 1.6, 0, 7); c.arc(5, -70, 1.6, 0, 7); c.fill();
    c.strokeStyle = "#a86b50"; c.lineWidth = 1.5; c.beginPath(); c.arc(0, -65, 4, .2, Math.PI - .2); c.stroke();
    c.restore();

    // schild / bonusrand over het personage heen
    if (S.shield) {
      c.strokeStyle = "rgba(95,208,224,.9)"; c.lineWidth = 3;
      c.fillStyle = "rgba(150,235,245,.1)";
      c.beginPath(); c.arc(x, y - 36, 42, 0, 7); c.fill(); c.stroke();
    }
    if (S.dbl > 0) {
      c.strokeStyle = "rgba(244,197,66,.45)"; c.lineWidth = 2;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x, y - 36, 48 + i * 6 + Math.sin(S.t * 6 + i) * 3, 0, 7); c.stroke(); }
    }
  }

  function drawEffects() {
    for (const p of S.parts) {
      const a = clamp(p.life / p.max, 0, 1);
      c.globalAlpha = a;
      if (p.type === "dust") { c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.size * (1.6 - a), 0, 7); c.fill(); }
      else { c.fillStyle = p.color; c.fillRect(p.x, p.y, p.size, p.size); }
    }
    c.globalAlpha = 1;
    for (const l of S.labels) {
      c.globalAlpha = clamp(l.life, 0, 1);
      c.font = `700 ${l.size}px "Space Grotesk",sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
      c.lineWidth = 4; c.strokeStyle = "rgba(255,255,255,.9)"; c.strokeText(l.text, l.x, l.y);
      c.fillStyle = l.color; c.fillText(l.text, l.x, l.y);
    }
    c.globalAlpha = 1;
  }

  function draw() {
    if (!S) return;
    c.save();
    if (S.shake > 0) c.translate(rand(-S.shake * 9, S.shake * 9), rand(-S.shake * 9, S.shake * 9));
    drawSky(); drawTrack();
    const items = [
      ...S.obs.map(o => ({ z: o.z, after: false, f: () => drawObstacle(o) })),
      ...S.picks.map(p => ({ z: p.z, after: false, f: () => drawPickup(p) })),
      ...(S.gate ? [{ z: S.gate.z, after: !S.gate.done, f: () => drawGate(S.gate) }] : [])
    ].sort((a, b) => b.z - a.z);
    for (const it of items) if (!it.after) it.f();
    drawPlayer();
    for (const it of items) if (it.after) it.f();
    drawEffects();
    const vg = c.createRadialGradient(CX, H * .55, H * .28, CX, H * .55, H * .85);
    vg.addColorStop(0, "rgba(10,30,56,0)"); vg.addColorStop(1, "rgba(10,30,56,.16)");
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    c.restore();
  }

  SJ.registerGame("runner", { start, stop: cleanup });
})();
