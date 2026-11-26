(() => {
  let root, pool, q, left, score, combo, best, right, t0, iv, lock;
  const TOTAL = 60;
  const refill = () => SJ.pick({}).map(SJ.prepare);
  function stop() { clearInterval(iv); iv = null; }

  function intro() {
    root.innerHTML = `<div class="card"><h2>Speed Quiz</h2>
      <p class="muted" style="margin:10px 0 16px">Je hebt ${TOTAL} seconden. Elk juist antwoord geeft 10 punten, +5 als je binnen 3 seconden antwoordt, en een combo-bonus bij meerdere juiste antwoorden na elkaar.</p>
      <button class="btn yellow" id="go">Start</button> <button class="btn" id="back">Terug</button></div>`;
    root.querySelector("#go").onclick = go; root.querySelector("#back").onclick = SJ.home;
  }
  function go() {
    pool = refill(); left = TOTAL; score = 0; combo = 0; best = 0; right = 0;
    next(); stop(); iv = setInterval(() => {
      left -= .1; const b = root.querySelector("#sp-bar"), t = root.querySelector("#sp-t");
      if (b) b.style.width = Math.max(left, 0) / TOTAL * 100 + "%";
      if (t) t.textContent = Math.max(Math.ceil(left), 0) + " s";
      if (left <= 0) end();
    }, 100);
  }
  function next() {
    if (!pool.length) pool = refill();
    q = pool.pop(); lock = false; t0 = Date.now();
    root.innerHTML = `<div class="card"><div class="game-head"><strong id="sp-t">${Math.ceil(left)} s</strong>
      <span><span class="chip xp pop">${score} punten</span> ${combo > 1 ? `<span class="chip">Combo x${combo}</span>` : ""}</span></div>
      <div class="bar"><i id="sp-bar" style="width:${left / TOTAL * 100}%"></i></div>
      <h2 style="margin:18px 0">${q.question}</h2>
      ${q.opts.map((o, k) => `<button class="answer" data-k="${k}">${o.t}</button>`).join("")}</div>`;
    root.onclick = e => {
      const b = e.target.closest(".answer"); if (!b || lock) return; lock = true;
      const ok = q.opts[b.dataset.k].ok;
      root.querySelectorAll(".answer").forEach((x, k) => { if (q.opts[k].ok) x.classList.add("right"); });
      if (ok) {
        combo++; right++; best = Math.max(best, combo);
        const fast = (Date.now() - t0) / 1000 < 3;
        score += 10 + (fast ? 5 : 0) + Math.min(combo - 1, 5) * 2;
        SJ.addXp(3, {right: true, combo}); SJ.beep(784);
      } else { b.classList.add("wrong"); combo = 0; SJ.beep(220, .25); }
      setTimeout(() => { if (iv) next(); }, ok ? 450 : 1200);
    };
  }
  function end() {
    stop(); if (score >= 150) SJ.confetti();
    root.innerHTML = `<div class="card" style="text-align:center"><h2>Tijd is om!</h2>
      <p style="font-size:2.4rem;font-weight:700;color:var(--green);margin:12px 0">${score} punten</p>
      <p class="muted">${right} juiste antwoorden · beste combo ${best}</p>
      <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn primary" id="again">Opnieuw spelen</button><button class="btn" id="home">Startpagina</button></div></div>`;
    root.querySelector("#again").onclick = go; root.querySelector("#home").onclick = SJ.home;
  }
  SJ.registerGame("speed", {start: r => { root = r; intro(); }, stop});
})();
