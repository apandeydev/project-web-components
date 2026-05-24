/* ========================
   SCREEN PAGE — script.js
======================== */

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
});


/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.scroll-reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));


/* ── In-memory comment store ──
   Structure: { [entryId]: [ { name, text, time, isAdmin } ] }
   Comments are shared across all visitors within the same session.
   (For true persistence you'd connect a backend/localStorage.)
*/
const commentStore = {};

// Pre-seed admin comment on one entry to demonstrate the highlight
commentStore['oppenheimer'] = [
    {
        name: 'Ayush',
        text: 'I watched this twice in theatres. The IMAX prologue alone is worth the price of entry. Nolan has never been this emotionally present in his own film.',
        time: formatTime(new Date(Date.now() - 1000 * 60 * 60 * 3)),
        isAdmin: true
    }
];


/* ── Format timestamp ── */
function formatTime(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}


/* ── Render comments into a .comment-section ── */
function renderComments(section) {
    const entryId = section.dataset.entry;
    const list = section.querySelector('.comments-list');
    const comments = commentStore[entryId] || [];

    list.innerHTML = '';

    if (comments.length === 0) {
        list.innerHTML = '<p class="comments-empty">No thoughts yet. Be the first.</p>';
        return;
    }

    comments.forEach(c => {
        const item = document.createElement('div');
        item.className = 'comment-item' + (c.isAdmin ? ' is-admin' : '');
        item.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(c.name)}</span>
                <span class="comment-time">${c.time}</span>
            </div>
            <p class="comment-body">${escapeHtml(c.text)}</p>
        `;
        list.appendChild(item);
    });
}


/* ── Post a comment ── */
function postComment(section) {
    const entryId = section.dataset.entry;
    const nameInput = section.querySelector('.comment-name');
    const textInput = section.querySelector('.comment-text');

    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) {
        flash(nameInput, !name);
        flash(textInput, !text);
        return;
    }

    if (!commentStore[entryId]) commentStore[entryId] = [];

    // Simple admin detection: name exactly "Ayush" (case-insensitive)
    const isAdmin = name.toLowerCase() === 'ayush';

    commentStore[entryId].push({
        name,
        text,
        time: 'just now',
        isAdmin
    });

    nameInput.value = '';
    textInput.value = '';

    renderComments(section);

    // Scroll to the newly added comment
    const list = section.querySelector('.comments-list');
    list.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


/* ── Flash invalid field ── */
function flash(el) {
    el.style.borderColor = 'rgba(180, 80, 80, 0.5)';
    setTimeout(() => { el.style.borderColor = ''; }, 1200);
}


/* ── Escape HTML ── */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/* ── Entry expand / collapse ── */
const entries = document.querySelectorAll('.entry');

entries.forEach(entry => {
    const mainRow = entry.querySelector('.entry-main');
    const commentSection = entry.querySelector('.comment-section');
    const submitBtn = entry.querySelector('.comment-submit');

    // Click entry row to open/close
    mainRow.addEventListener('click', () => {
        const isOpen = entry.classList.contains('open');

        // Close all others
        entries.forEach(e => e.classList.remove('open'));

        if (!isOpen) {
            entry.classList.add('open');
            renderComments(commentSection);
        }
    });

    // Prevent clicks inside expanded area from closing it
    entry.querySelector('.entry-expand').addEventListener('click', e => e.stopPropagation());

    // Submit button
    submitBtn.addEventListener('click', () => postComment(commentSection));

    // Enter in name field moves focus to textarea
    entry.querySelector('.comment-name').addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            entry.querySelector('.comment-text').focus();
        }
    });

    // Ctrl+Enter or Cmd+Enter posts from textarea
    entry.querySelector('.comment-text').addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            postComment(commentSection);
        }
    });
});


/* ── Filtering ── */
let activeType    = 'all';
let activeVerdict = 'all';

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const filter = btn.dataset.filter;

        // Deactivate sibling buttons in same row
        document.querySelectorAll(`.filter-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (group === 'type')    activeType    = filter;
        if (group === 'verdict') activeVerdict = filter;

        applyFilters();
    });
});

function applyFilters() {
    entries.forEach(entry => {
        const type    = entry.dataset.type;
        const verdict = entry.dataset.verdict;

        const typeMatch    = activeType    === 'all' || type    === activeType;
        const verdictMatch = activeVerdict === 'all' || verdict === activeVerdict;

        entry.style.display = (typeMatch && verdictMatch) ? '' : 'none';

        // Close expanded entries when filtered out
        if (!typeMatch || !verdictMatch) entry.classList.remove('open');
    });
}


/* ── Theme cycling (mirrors main site) ── */
const themes = ['noir', 'forest', 'navy', 'obsidian', 'ash', 'ivory'];
let themeIndex = 0;

const themeBtn = document.getElementById('theme-btn');
if (themeBtn) {
    // Read saved theme
    const saved = localStorage.getItem('nqa-theme');
    if (saved) {
        themeIndex = themes.indexOf(saved);
        if (themeIndex < 0) themeIndex = 0;
        document.documentElement.setAttribute('data-theme', themes[themeIndex]);
    }

    themeBtn.addEventListener('click', () => {
        themeIndex = (themeIndex + 1) % themes.length;
        const next = themes[themeIndex];
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('nqa-theme', next);
    });
}