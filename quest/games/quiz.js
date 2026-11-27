(() => {
  let root, list, i, score, combo, cat;
  SJ.prepare = q => ({...q, opts: q.answers.map((t, k) => ({t, ok: k === q.correct})).sort(() => Math.random() - .5)});

  function menu() {
    root.innerHTML = `<div class="card"><h2>Quiz Arena</h2><p class="muted">Kies een categorie. Je krijgt tot 10 vragen.</p>
      <div class="topics" style="margin:16px 0">${["Alles", ...CATEGORIES].map(c => `<button class="btn" data-cat="${c}">${c}</button>`).join("")}</div>
      <button class="btn" data-back>Terug</button></div>`;
    root.onclick = e => { const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.cat) begin(b.dataset.cat); if ("back" in b.dataset) SJ.home(); };
  }
  function begin(c) {
    cat = c; list = SJ.pick(c === "Alles" ? {count: 10, game: "quiz"} : {category: c, count: 10, game: "quiz"}).map(SJ.prepare);
    if (!list.length) return SJ.toast("Nog geen vragen in deze categorie.");
    i = 0; score = 0; combo = 0; ask();
  }
  function ask() {
    if (i >= list.length) return end();
    const q = list[i];
    root.innerHTML = `<div class="card"><div class="game-head"><strong>Vraag ${i + 1} van ${list.length}</strong><span class="chip xp">${score} punten</span></div>
      <div class="bar"><i style="width:${i / list.length * 100}%"></i></div>
      <h2 style="margin:18px 0">${q.question}</h2>
      ${q.opts.map((o, k) => `<button class="answer" data-k="${k}">${o.t}</button>`).join("")}
      <div id="fb"></div></div>`;
    root.onclick = e => {
      const b = e.target.closest(".answer"); if (!b || b.disabled) return;
      const ok = q.opts[b.dataset.k].ok, btns = root.querySelectorAll(".answer");
      btns.forEach((x, k) => { x.disabled = true; if (q.opts[k].ok) x.classList.add("right"); });
      if (ok) { combo++; const gain = 10 + Math.min(combo - 1, 4) * 2; score += gain; SJ.addXp(gain, {right: true, combo}); SJ.beep(784); }
      else { b.classList.add("wrong"); combo = 0; SJ.beep(220, .25); }
      $fb(ok, q);
    };
  }
  function $fb(ok, q) {
    root.querySelector("#fb").innerHTML = `<div class="feedback"><strong>${ok ? "Juist!" : "Niet helemaal."}${ok && combo > 1 ? " Combo x" + combo : ""}</strong><p>${q.explanation}</p>
      <button class="btn primary" id="nx" style="margin-top:10px">${i + 1 < list.length ? "Volgende vraag" : "Bekijk resultaat"}</button></div>`;
    root.querySelector("#nx").onclick = () => { i++; ask(); };
  }
  function end() {
    const max = list.length * 10, pct = Math.round(score / max * 100);
    if (pct >= 80) SJ.confetti();
    root.innerHTML = `<div class="card" style="text-align:center"><h2>${pct >= 80 ? "Fantastisch!" : pct >= 50 ? "Goed gedaan!" : "Blijf oefenen!"}</h2>
      <p style="font-size:2.4rem;font-weight:700;color:var(--green);margin:12px 0">${score} punten</p>
      <p class="muted">Categorie: ${cat}. Combo's leveren extra punten op.</p>
      <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn primary" id="again">Opnieuw spelen</button><button class="btn" id="menu">Andere categorie</button><button class="btn" id="home">Startpagina</button></div></div>`;
    root.querySelector("#again").onclick = () => begin(cat);
    root.querySelector("#menu").onclick = menu;
    root.querySelector("#home").onclick = SJ.home;
  }
  SJ.registerGame("quiz", {start: r => { root = r; menu(); }});
})();
