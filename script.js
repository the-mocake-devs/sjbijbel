const $ = (id) => document.getElementById(id);

const overlays = [
    [$("creditsButton"), $("creditsOverlay"), $("creditsClose")],
    [$("privacyButton"), $("privacyOverlay"), $("privacyClose")],
];

function openModal(overlay) {
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
}

function closeModal(overlay) {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
}

for (const [button, overlay, close] of overlays) {
    if (!button || !overlay || !close) continue;

    button.addEventListener("click", () => openModal(overlay));
    close.addEventListener("click", () => closeModal(overlay));
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeModal(overlay);
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") overlays.forEach(([, overlay]) => closeModal(overlay));
});

const BIBLE_BOOKS = {
    'GEN': { abbr: 'Gen', name: 'Genesis' },
    'EXO': { abbr: 'Exo', name: 'Exodus' },
    'LEV': { abbr: 'Lev', name: 'Leviticus' },
    'NUM': { abbr: 'Num', name: 'Numeri' },
    'DEU': { abbr: 'Deu', name: 'Deuteronomium' },
    'JOS': { abbr: 'Jos', name: 'Jozua' },
    'JDG': { abbr: 'Jdg', name: 'Rechters' },
    'RUT': { abbr: 'Rut', name: 'Ruth' },
    '1SA': { abbr: '1Sa', name: '1 Samuel' },
    '2SA': { abbr: '2Sa', name: '2 Samuel' },
    '1KI': { abbr: '1Ki', name: '1 Koningen' },
    '2KI': { abbr: '2Ki', name: '2 Koningen' },
    '1CH': { abbr: '1Ch', name: '1 Kronieken' },
    '2CH': { abbr: '2Ch', name: '2 Kronieken' },
    'EZR': { abbr: 'Ezr', name: 'Ezra' },
    'NEH': { abbr: 'Neh', name: 'Nehemia' },
    'EST': { abbr: 'Est', name: 'Ester' },
    'JOB': { abbr: 'Job', name: 'Job' },
    'PSA': { abbr: 'Psa', name: 'Psalmen' },
    'PRO': { abbr: 'Pro', name: 'Spreuken' },
    'ECC': { abbr: 'Ecc', name: 'Prediker' },
    'SNG': { abbr: 'Sng', name: 'Hooglied' },
    'ISA': { abbr: 'Isa', name: 'Jesaja' },
    'JER': { abbr: 'Jer', name: 'Jeremia' },
    'LAM': { abbr: 'Lam', name: 'Klaagliederen' },
    'EZK': { abbr: 'Ezk', name: 'Ezechiël' },
    'DAN': { abbr: 'Dan', name: 'Daniël' },
    'HOS': { abbr: 'Hos', name: 'Hosea' },
    'JOL': { abbr: 'Jol', name: 'Joël' },
    'AMO': { abbr: 'Amo', name: 'Amos' },
    'OBA': { abbr: 'Oba', name: 'Obadja' },
    'JON': { abbr: 'Jon', name: 'Jona' },
    'MIC': { abbr: 'Mic', name: 'Micha' },
    'NAM': { abbr: 'Nam', name: 'Nahum' },
    'HAB': { abbr: 'Hab', name: 'Habakuk' },
    'ZEP': { abbr: 'Zep', name: 'Zefanja' },
    'HAG': { abbr: 'Hag', name: 'Haggai' },
    'ZEC': { abbr: 'Zec', name: 'Zacharia' },
    'MAL': { abbr: 'Mal', name: 'Maleachi' },
    'MAT': { abbr: 'Mat', name: 'Matteüs' },
    'MRK': { abbr: 'Mrk', name: 'Marcus' },
    'LUK': { abbr: 'Luk', name: 'Lucas' },
    'JHN': { abbr: 'Jhn', name: 'Johannes' },
    'ACT': { abbr: 'Act', name: 'Handelingen' },
    'ROM': { abbr: 'Rom', name: 'Romeinen' },
    '1CO': { abbr: '1Co', name: '1 Korintiërs' },
    '2CO': { abbr: '2Co', name: '2 Korintiërs' },
    'GAL': { abbr: 'Gal', name: 'Galaten' },
    'EPH': { abbr: 'Eph', name: 'Efeziërs' },
    'PHP': { abbr: 'Php', name: 'Filippenzen' },
    'COL': { abbr: 'Col', name: 'Kolossenzen' },
    '1TH': { abbr: '1Th', name: '1 Tessalonicenzen' },
    '2TH': { abbr: '2Th', name: '2 Tessalonicenzen' },
    '1TI': { abbr: '1Ti', name: '1 Timoteüs' },
    '2TI': { abbr: '2Ti', name: '2 Timoteüs' },
    'TIT': { abbr: 'Tit', name: 'Titus' },
    'PHM': { abbr: 'Phm', name: 'Filemon' },
    'HEB': { abbr: 'Heb', name: 'Hebreeën' },
    'JAS': { abbr: 'Jas', name: 'Jakobus' },
    '1PE': { abbr: '1Pe', name: '1 Petrus' },
    '2PE': { abbr: '2Pe', name: '2 Petrus' },
    '1JN': { abbr: '1Jn', name: '1 Johannes' },
    '2JN': { abbr: '2Jn', name: '2 Johannes' },
    '3JN': { abbr: '3Jn', name: '3 Johannes' },
    'JUD': { abbr: 'Jud', name: 'Judas' },
    'REV': { abbr: 'Rev', name: 'Openbaring' }
};

const modeBtns = document.querySelectorAll(".mode-btn");
const searchBox = document.querySelector(".search-box");
const searchHints = document.querySelector(".search-hints");
const easyInputContainer = document.querySelector(".easy-input-container");
const bookSelect = $("bookSelect");
const searchInput = $("searchInput");
const resultsDiv = $("results");
const resultsHeader = $("resultsHeader");
const emptyState = $("emptyState");

function switchMode(mode) {
    modeBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    const manual = mode === "manual";
    searchBox.classList.toggle("active", manual);
    searchHints.classList.toggle("active", manual);
    easyInputContainer.classList.toggle("active", !manual);

    if (!manual && bookSelect.options.length <= 1) {
        Object.values(BIBLE_BOOKS).forEach((book) => {
            const option = document.createElement("option");
            option.value = book.name;
            option.textContent = book.name;
            bookSelect.append(option);
        });
    }
}

modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode));
});

switchMode(document.querySelector(".mode-btn.active")?.dataset.mode || "easy");

function findReference(query) {
    const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    for (const [code, book] of Object.entries(BIBLE_BOOKS)) {
        for (const name of [book.name, book.abbr, code]) {
            const pattern = new RegExp(`(?:^|\\b)${escaped(name)}(?:\\b|$)`, "i");
            if (!pattern.test(query)) continue;

            const rest = query.replace(pattern, "").trim();
            const match = rest.match(/^(\d+)(?::(\d+(?:[-–]\d+)?))?/);
            if (!match) continue;

            return {
                bookName: book.name,
                chapter: Number(match[1]),
                verses: match[2] ? match[2].replace("–", "-") : null,
            };
        }
    }
    return null;
}

function resultCard(reference) {
    const params = new URLSearchParams({
        boek: reference.bookName,
        hoofdstuk: reference.chapter,
    });
    if (reference.verses) params.set("vers", reference.verses);

    const card = document.createElement("a");
    card.href = `/lezen/?${params}`;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "result-card";
    card.innerHTML = `
        <div class="result-left">
            <div class="book-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
                    <path d="M3 1h18v2H3V1zm0 20h18v2H3v-2z"/>
                </svg>
            </div>
            <div>
                <h3 class="result-book">${reference.bookName}</h3>
                <p class="result-reference">
                    Hoofdstuk ${reference.chapter}${reference.verses ? `, Vers ${reference.verses}` : ""}
                </p>
            </div>
        </div>
        <div class="result-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
        </div>
    `;
    return card;
}

function performSearch(query) {
    resultsDiv.replaceChildren();
    resultsHeader.classList.remove("visible");
    emptyState.classList.remove("visible");

    const reference = findReference(query);
    if (!reference) {
        emptyState.classList.add("visible");
        return;
    }

    resultsHeader.classList.add("visible");
    resultsDiv.append(resultCard(reference));
}

$("searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query) performSearch(query);
});

$("easyInputForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const bookName = bookSelect.value;
    const chapter = $("chapterInput").value;
    const verse = $("verseInput").value;

    if (!bookName || !chapter) {
        alert("Vul alstublieft een boek en hoofdstuk in");
        return;
    }

    let query = `${bookName} ${chapter}`;
    if (verse) query += `:${verse}`;
    performSearch(query);
});

document.querySelectorAll(".hint").forEach((hint) => {
    hint.addEventListener("click", () => {
        const query = hint.dataset.search;
        searchInput.value = query;
        performSearch(query);
    });
});
