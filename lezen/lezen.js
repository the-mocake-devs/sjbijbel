const $ = (id) => document.getElementById(id);
const state = { books: [], bookIndex: 0, chapter: 1, verses: [], fontSize: 20 };
const bookSelect = $("bookSelect"), chapterSelect = $("chapterSelect");

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Bestand niet gevonden: ${url}`);
  return response.json();
}
function getParams() {
  const params = new URLSearchParams(location.search);
  return { book: params.get("boek"), chapter: Number(params.get("hoofdstuk")) || 1, verse: Number(params.get("vers")) || null };
}
function updateURL(verse = null) {
  const book = state.books[state.bookIndex];
  const params = new URLSearchParams({ boek: book.id, hoofdstuk: state.chapter });
  if (verse) params.set("vers", verse);
  history.replaceState({}, "", `${location.pathname}?${params}`);
}
function renderChapters() {
  const book = state.books[state.bookIndex];
  chapterSelect.innerHTML = "";
  for (let i = 1; i <= book.chapters; i++) {
    const option = document.createElement("option");
    option.value = i; option.textContent = `Hoofdstuk ${i}`;
    chapterSelect.append(option);
  }
  chapterSelect.value = state.chapter;
}
function renderVerses(filter = "") {
  const target = $("verses");
  target.replaceChildren();
  const query = filter.trim().toLocaleLowerCase("nl");
  for (const verse of state.verses) {
    const text = String(verse.text || "");
    if (query && !text.toLocaleLowerCase("nl").includes(query)) continue;
    const number = document.createElement("a");
    number.className = "verse-number"; number.href = `#vers-${verse.number}`;
    number.textContent = verse.number; number.setAttribute("aria-label", `Vers ${verse.number}`);
    const span = document.createElement("span");
    span.className = "verse"; span.id = `vers-${verse.number}`;
    span.append(number, document.createTextNode(text + " "));
    target.append(span);
  }
  if (!target.childNodes.length) target.textContent = "Geen verzen gevonden in dit hoofdstuk.";
}
async function loadChapter() {
  const book = state.books[state.bookIndex];
  $("error").hidden = true;
  $("status").textContent = `${book.name} ${state.chapter} laden…`;
  $("passageTitle").textContent = `${book.name} ${state.chapter}`;
  renderChapters();
  try {
    const data = await getJSON(`/lezen/data/chapters/${book.id}/${state.chapter}.json`);
    state.verses = data.verses || [];
    renderVerses($("searchInput").value);
    $("status").textContent = `${state.verses.length} verzen`;
    updateURL(getParams().verse);
    const wantedVerse = getParams().verse;
    if (wantedVerse) setTimeout(() => document.getElementById(`vers-${wantedVerse}`)?.scrollIntoView({behavior:"smooth",block:"center"}), 60);
  } catch (error) {
    state.verses = []; $("verses").replaceChildren();
    $("error").hidden = false;
    $("error").textContent = "Dit hoofdstuk staat nog niet in de lokale databestanden. Importeer eerst de Open Vertaling-data volgens README-IMPORT.md.";
    $("status").textContent = "Tekst niet beschikbaar";
  }
}
async function init() {
  try {
    state.books = await getJSON("/lezen/data/books.json");
    const params = getParams();
    state.bookIndex = Math.max(0, state.books.findIndex(b => b.id === params.book));
    state.chapter = Math.min(state.books[state.bookIndex].chapters, Math.max(1, params.chapter));
    for (const book of state.books) {
      const option = document.createElement("option"); option.value = book.id; option.textContent = book.name; bookSelect.append(option);
    }
    bookSelect.value = state.books[state.bookIndex].id;
    await loadChapter();
  } catch (error) { $("status").textContent = "Kon de boekenlijst niet laden."; $("error").hidden = false; $("error").textContent = error.message; }
}
bookSelect.addEventListener("change", () => { state.bookIndex = state.books.findIndex(b => b.id === bookSelect.value); state.chapter = 1; $("searchInput").value = ""; loadChapter(); });
chapterSelect.addEventListener("change", () => { state.chapter = Number(chapterSelect.value); $("searchInput").value = ""; loadChapter(); });
$("searchInput").addEventListener("input", e => renderVerses(e.target.value));
$("prevChapter").addEventListener("click", () => {
  if (state.chapter > 1) state.chapter--;
  else if (state.bookIndex > 0) { state.bookIndex--; state.chapter = state.books[state.bookIndex].chapters; bookSelect.value = state.books[state.bookIndex].id; }
  else return; loadChapter();
});
$("nextChapter").addEventListener("click", () => {
  if (state.chapter < state.books[state.bookIndex].chapters) state.chapter++;
  else if (state.bookIndex < state.books.length - 1) { state.bookIndex++; state.chapter = 1; bookSelect.value = state.books[state.bookIndex].id; }
  else return; loadChapter();
});
$("fontDown").addEventListener("click", () => { state.fontSize = Math.max(15, state.fontSize - 1); $("verses").style.fontSize = `${state.fontSize}px`; });
$("fontUp").addEventListener("click", () => { state.fontSize = Math.min(30, state.fontSize + 1); $("verses").style.fontSize = `${state.fontSize}px`; });
init();
