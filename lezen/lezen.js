const API = "https://openvertaling.nl/api/endpoints/v1.php";
const KEY = window.BIJBEL_API_KEY;

const $ = (id) => document.getElementById(id);
const cache = new Map();
const state = { books: [], bookIndex: 0, chapter: 1, verses: [], fontSize: 20 };
const bookSelect = $("bookSelect"), chapterSelect = $("chapterSelect");

async function api(params) {
  const url = new URL(API);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }

  const response = await fetch(url, { headers: { "X-Api-Key": KEY } });
  const data = await response.json().catch(() => null);

  if (!response.ok || !data || data.result !== "1") {
    throw new Error(data?.message || data?.error || "De Bijbeltekst kon niet worden opgehaald.");
  }
  return data;
}

async function getBooks() {
  if (!cache.has("books")) {
    const data = await api({ req: "books" });
    const books = data.books.map((book) => ({
      id: book.slug,
      name: book.name,
      chapters: book.chapters,
    }));
    cache.set("books", books);
  }
  return cache.get("books");
}

async function getChapter(book, chapter) {
  const key = `${book.id}:${chapter}`;
  if (!cache.has(key)) {
    const data = await api({ req: "chapter", book: book.id, chapter });
    const verses = data.verses.map((verse) => ({
      number: verse.verse,
      text: verse.text,
    }));
    cache.set(key, verses);
  }
  return cache.get(key);
}

function getParams() {
  const params = new URLSearchParams(location.search);
  return {
    book: params.get("boek"),
    chapter: Number(params.get("hoofdstuk")) || null,
    verse: Number(params.get("vers")) || null,
  };
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
  for (const chapter of book.chapters) {
    const option = document.createElement("option");
    option.value = chapter;
    option.textContent = `Hoofdstuk ${chapter}`;
    chapterSelect.append(option);
  }
  chapterSelect.value = String(state.chapter);
}

function renderVerses(filter = "") {
  const target = $("verses");
  target.replaceChildren();
  const query = filter.trim().toLocaleLowerCase("nl");

  for (const verse of state.verses) {
    const text = String(verse.text || "");
    if (query && !text.toLocaleLowerCase("nl").includes(query)) continue;

    const number = document.createElement("a");
    number.className = "verse-number";
    number.href = `#vers-${verse.number}`;
    number.textContent = verse.number;
    number.setAttribute("aria-label", `Vers ${verse.number}`);

    const span = document.createElement("span");
    span.className = "verse";
    span.id = `vers-${verse.number}`;
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
    state.verses = await getChapter(book, state.chapter);
    renderVerses($("searchInput").value);
    $("status").textContent = `${state.verses.length} verzen`;

    const verse = getParams().verse;
    updateURL(verse);
    if (verse) {
      setTimeout(() => document.getElementById(`vers-${verse}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
    }
  } catch (error) {
    state.verses = [];
    $("verses").replaceChildren();
    $("error").hidden = false;
    $("error").textContent = error.message;
    $("status").textContent = "Tekst niet beschikbaar";
  }
}

function stepChapter(direction) {
  const book = state.books[state.bookIndex];
  const index = book.chapters.indexOf(state.chapter);
  const nextIndex = index + direction;

  if (nextIndex >= 0 && nextIndex < book.chapters.length) {
    state.chapter = book.chapters[nextIndex];
  } else {
    const nextBook = state.bookIndex + direction;
    if (nextBook < 0 || nextBook >= state.books.length) return;
    state.bookIndex = nextBook;
    const target = state.books[nextBook];
    state.chapter = direction > 0 ? target.chapters[0] : target.chapters[target.chapters.length - 1];
    bookSelect.value = target.id;
  }

  $("searchInput").value = "";
  loadChapter();
}

async function init() {
  try {
    state.books = await getBooks();
    const params = getParams();

    const index = state.books.findIndex((book) => book.id === params.book);
    state.bookIndex = index >= 0 ? index : 0;
    const book = state.books[state.bookIndex];
    state.chapter = book.chapters.includes(params.chapter) ? params.chapter : book.chapters[0];

    for (const item of state.books) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      bookSelect.append(option);
    }
    bookSelect.value = book.id;

    await loadChapter();
  } catch (error) {
    $("status").textContent = "Kon de boekenlijst niet laden.";
    $("error").hidden = false;
    $("error").textContent = error.message;
  }
}

bookSelect.addEventListener("change", () => {
  state.bookIndex = state.books.findIndex((book) => book.id === bookSelect.value);
  state.chapter = state.books[state.bookIndex].chapters[0];
  $("searchInput").value = "";
  loadChapter();
});

chapterSelect.addEventListener("change", () => {
  state.chapter = Number(chapterSelect.value);
  $("searchInput").value = "";
  loadChapter();
});

$("searchInput").addEventListener("input", (event) => renderVerses(event.target.value));
$("prevChapter").addEventListener("click", () => stepChapter(-1));
$("nextChapter").addEventListener("click", () => stepChapter(1));

$("fontDown").addEventListener("click", () => {
  state.fontSize = Math.max(15, state.fontSize - 1);
  $("verses").style.fontSize = `${state.fontSize}px`;
});

$("fontUp").addEventListener("click", () => {
  state.fontSize = Math.min(30, state.fontSize + 1);
  $("verses").style.fontSize = `${state.fontSize}px`;
});

init();
