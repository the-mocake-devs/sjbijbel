
const creditsButton = document.getElementById('creditsButton');
const creditsOverlay = document.getElementById('creditsOverlay');
const creditsClose = document.getElementById('creditsClose');

const privacyButton = document.getElementById('privacyButton');
const privacyOverlay = document.getElementById('privacyOverlay');
const privacyClose = document.getElementById('privacyClose');

function openModal(overlay) {
    if (overlay) {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
    }
}

function closeModal(overlay) {
    if (overlay) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }
}

if (creditsButton && creditsOverlay && creditsClose) {
    creditsButton.addEventListener('click', () => openModal(creditsOverlay));
    creditsClose.addEventListener('click', () => closeModal(creditsOverlay));
    
    creditsOverlay.addEventListener('click', (event) => {
        if (event.target === creditsOverlay) closeModal(creditsOverlay);
    });
}

if (privacyButton && privacyOverlay && privacyClose) {
    privacyButton.addEventListener('click', () => openModal(privacyOverlay));
    privacyClose.addEventListener('click', () => closeModal(privacyOverlay));
    
    privacyOverlay.addEventListener('click', (event) => {
        if (event.target === privacyOverlay) closeModal(privacyOverlay);
    });
}

// Escape-toets sluit alle actieve overlays
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal(creditsOverlay);
        closeModal(privacyOverlay);
    }
});
  

    const BIBLE_BOOKS = {
        'GEN': { abbr: 'Gen', chapters: 50, name: 'Genesis' },
        'EXO': { abbr: 'Exo', chapters: 40, name: 'Exodus' },
        'LEV': { abbr: 'Lev', chapters: 27, name: 'Leviticus' },
        'NUM': { abbr: 'Num', chapters: 36, name: 'Numeri' },
        'DEU': { abbr: 'Deu', chapters: 34, name: 'Deuteronomium' },
        'JOS': { abbr: 'Jos', chapters: 24, name: 'Jozua' },
        'JDG': { abbr: 'Jdg', chapters: 21, name: 'Rechters' },
        'RUT': { abbr: 'Rut', chapters: 4, name: 'Ruth' },
        '1SA': { abbr: '1Sa', chapters: 31, name: '1 Samuel' },
        '2SA': { abbr: '2Sa', chapters: 24, name: '2 Samuel' },
        '1KI': { abbr: '1Ki', chapters: 22, name: '1 Koningen' },
        '2KI': { abbr: '2Ki', chapters: 25, name: '2 Koningen' },
        '1CH': { abbr: '1Ch', chapters: 29, name: '1 Kronieken' },
        '2CH': { abbr: '2Ch', chapters: 36, name: '2 Kronieken' },
        'EZR': { abbr: 'Ezr', chapters: 10, name: 'Ezra' },
        'NEH': { abbr: 'Neh', chapters: 13, name: 'Nehemia' },
        'EST': { abbr: 'Est', chapters: 10, name: 'Ester' },
        'JOB': { abbr: 'Job', chapters: 42, name: 'Job' },
        'PSA': { abbr: 'Psa', chapters: 150, name: 'Psalmen' },
        'PRO': { abbr: 'Pro', chapters: 31, name: 'Spreuken' },
        'ECC': { abbr: 'Ecc', chapters: 12, name: 'Prediker' },
        'SNG': { abbr: 'Sng', chapters: 8, name: 'Hooglied' },
        'ISA': { abbr: 'Isa', chapters: 66, name: 'Jesaja' },
        'JER': { abbr: 'Jer', chapters: 52, name: 'Jeremia' },
        'LAM': { abbr: 'Lam', chapters: 5, name: 'Klaagliederen' },
        'EZK': { abbr: 'Ezk', chapters: 48, name: 'Ezechiël' },
        'DAN': { abbr: 'Dan', chapters: 12, name: 'Daniël' },
        'HOS': { abbr: 'Hos', chapters: 14, name: 'Hosea' },
        'JOL': { abbr: 'Jol', chapters: 3, name: 'Joël' },
        'AMO': { abbr: 'Amo', chapters: 9, name: 'Amos' },
        'OBA': { abbr: 'Oba', chapters: 1, name: 'Obadja' },
        'JON': { abbr: 'Jon', chapters: 4, name: 'Jona' },
        'MIC': { abbr: 'Mic', chapters: 7, name: 'Micha' },
        'NAM': { abbr: 'Nam', chapters: 3, name: 'Nahum' },
        'HAB': { abbr: 'Hab', chapters: 3, name: 'Habakuk' },
        'ZEP': { abbr: 'Zep', chapters: 3, name: 'Zefanja' },
        'HAG': { abbr: 'Hag', chapters: 2, name: 'Haggai' },
        'ZEC': { abbr: 'Zec', chapters: 14, name: 'Zacharia' },
        'MAL': { abbr: 'Mal', chapters: 4, name: 'Maleachi' },
        'MAT': { abbr: 'Mat', chapters: 28, name: 'Matteüs' },
        'MRK': { abbr: 'Mrk', chapters: 16, name: 'Marcus' },
        'LUK': { abbr: 'Luk', chapters: 24, name: 'Lucas' },
        'JHN': { abbr: 'Jhn', chapters: 21, name: 'Johannes' },
        'ACT': { abbr: 'Act', chapters: 28, name: 'Handelingen' },
        'ROM': { abbr: 'Rom', chapters: 16, name: 'Romeinen' },
        '1CO': { abbr: '1Co', chapters: 16, name: '1 Korintiërs' },
        '2CO': { abbr: '2Co', chapters: 13, name: '2 Korintiërs' },
        'GAL': { abbr: 'Gal', chapters: 6, name: 'Galaten' },
        'EPH': { abbr: 'Eph', chapters: 6, name: 'Efeziërs' },
        'PHP': { abbr: 'Php', chapters: 4, name: 'Filippenzen' },
        'COL': { abbr: 'Col', chapters: 4, name: 'Kolossenzen' },
        '1TH': { abbr: '1Th', chapters: 5, name: '1 Tessalonicenzen' },
        '2TH': { abbr: '2Th', chapters: 3, name: '2 Tessalonicenzen' },
        '1TI': { abbr: '1Ti', chapters: 6, name: '1 Timoteüs' },
        '2TI': { abbr: '2Ti', chapters: 4, name: '2 Timoteüs' },
        'TIT': { abbr: 'Tit', chapters: 3, name: 'Titus' },
        'PHM': { abbr: 'Phm', chapters: 1, name: 'Filemon' },
        'HEB': { abbr: 'Heb', chapters: 13, name: 'Hebreeën' },
        'JAS': { abbr: 'Jas', chapters: 5, name: 'Jakobus' },
        '1PE': { abbr: '1Pe', chapters: 5, name: '1 Petrus' },
        '2PE': { abbr: '2Pe', chapters: 3, name: '2 Petrus' },
        '1JN': { abbr: '1Jn', chapters: 5, name: '1 Johannes' },
        '2JN': { abbr: '2Jn', chapters: 1, name: '2 Johannes' },
        '3JN': { abbr: '3Jn', chapters: 1, name: '3 Johannes' },
        'JUD': { abbr: 'Jud', chapters: 1, name: 'Judas' },
        'REV': { abbr: 'Rev', chapters: 22, name: 'Openbaring' }
    };

    const modeBtns = document.querySelectorAll('.mode-btn');
    const searchBox = document.querySelector('.search-box');
    const searchHints = document.querySelector('.search-hints');
    const easyInputContainer = document.querySelector('.easy-input-container');

    function switchMode(mode) {
        modeBtns.forEach(b => {
            if (b.dataset.mode === mode) b.classList.add('active');
            else b.classList.remove('active');
        });

        if (mode === 'manual') {
            searchBox.classList.add('active');
            searchHints.classList.add('active');
            easyInputContainer.classList.remove('active');
        } else {
            searchBox.classList.remove('active');
            searchHints.classList.remove('active');
            easyInputContainer.classList.add('active');
            initializeEasyInput();
        }
    }

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    document.addEventListener('DOMContentLoaded', () => {
        const activeMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'easy';
        switchMode(activeMode);
    });

    function initializeEasyInput() {
        const bookSelect = document.getElementById('bookSelect');

        if (bookSelect.options.length <= 1) {
            Object.entries(BIBLE_BOOKS).forEach(([code, data]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = data.name;
                bookSelect.appendChild(option);
            });
        }
    }

    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const easyInputForm = document.getElementById('easyInputForm');
    const resultsDiv = document.getElementById('results');
    const resultsHeader = document.getElementById('resultsHeader');
    const emptyState = document.getElementById('emptyState');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const query = searchInput.value.trim();

        if (query) performSearch(query);
    });

    easyInputForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const bookCode = document.getElementById('bookSelect').value;
        const chapter = document.getElementById('chapterInput').value;
        const verse = document.getElementById('verseInput').value;

        if (!bookCode || !chapter) {
            alert('Vul alstublieft een boek en hoofdstuk in');
            return;
        }

        const bookData = BIBLE_BOOKS[bookCode];

        let query = `${bookData.name} ${chapter}`;

        if (verse) query += `:${verse}`;

        performSearch(query);
    });

    document.querySelectorAll('.hint').forEach(hint => {
        hint.addEventListener('click', () => {
            const query = hint.dataset.search;

            searchInput.value = query;

            performSearch(query);
        });
    });

    function performSearch(query) {
        const results = searchBibleBooks(query);

        displayResults(results);
    }

    function searchBibleBooks(query) {
        const results = [];

        Object.entries(BIBLE_BOOKS).forEach(([code, data]) => {
            const bookRegex = new RegExp(`(?:^|\\b)${data.name}|${code}(?:\\b|$)`, 'i');

            if (bookRegex.test(query)) {
                const remainingQuery = query.replace(bookRegex, '').trim();

                const chapterMatch = remainingQuery.match(/(\d+)(?::(\d+(?:-\d+)?)?)?/);

                if (chapterMatch) {
                    const chapter = parseInt(chapterMatch[1], 10);
                    const verses = chapterMatch[2] || null;

                    if (chapter >= 1 && chapter <= data.chapters) {
                        results.push({
                            bookName: data.name,
                            chapter,
                            verses,
                            abbr: data.abbr
                        });
                    }
                }
            }
        });

        return results;
    }

    function displayResults(results) {
        resultsDiv.innerHTML = '';

        resultsHeader.classList.remove('visible');
        emptyState.classList.remove('visible');

        if (results.length === 0) {
            emptyState.classList.add('visible');
            return;
        }

        resultsHeader.classList.add('visible');

        document.getElementById('resultsCount').textContent =
            `${results.length} resultaat${results.length !== 1 ? 'en' : ''}`;

        results.forEach(result => {
            const card = createResultCard(result);

            resultsDiv.appendChild(card);
        });
    }

    function createResultCard(result) {
        const { bookName, chapter, verses, abbr } = result;

        let url = `https://www.bible.com/nl/bible/75/${abbr}.${chapter}`;

        if (verses) {
            const versesPart = verses.replace('-', '%2D');

            url += `.${versesPart}`;
        }

        const card = document.createElement('a');

        card.href = url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'result-card';

        card.innerHTML = `
            <div class="result-left">
                <div class="book-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
                        <path d="M3 1h18v2H3V1zm0 20h18v2H3v-2z"/>
                    </svg>
                </div>

                <div>
                    <h3 class="result-book">${bookName}</h3>
                    <p class="result-reference">
                        Hoofdstuk ${chapter}${verses ? `, Vers ${verses}` : ''}
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
