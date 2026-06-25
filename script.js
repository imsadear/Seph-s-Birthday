/* ============================================================
   WIKAPEDIA — script.js
   Vanilla JS only. No frameworks. No external libraries.
   All backend / AI functionality is simulated in the browser.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLanguageSearchAndFilters();
  initContributionForm();
  initAudioButtons();
  initDatasetDownloads();
  initContributionTypeCards();
});

/* ──────────────────────────────────────────────────────────
   1. NAVIGATION
   - Smooth scroll to section on nav link click
   - Offset for sticky header
   - Highlight active nav link on scroll
   - Mobile hamburger toggle
────────────────────────────────────────────────────────── */
function initNavigation() {
  const header     = document.getElementById('site-header');
  const navToggle  = document.getElementById('navToggle');
  const navLinks   = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');

  // ── Mobile hamburger ──
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Smooth scroll with header offset ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Active nav link on scroll ──
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const headerH = header ? header.offsetHeight : 0;
    const scrollY = window.scrollY + headerH + 32;

    let current = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollY) current = section.getAttribute('id');
    });

    allNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${current}`);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

/* ──────────────────────────────────────────────────────────
   2 & 3. LANGUAGE SEARCH + STATUS FILTERS
   - Real-time text search across name, region, status
   - Filter buttons (All / Developer-ready / Growing / Needs contributors)
   - Both work together
   - Shows / hides "no results" message
────────────────────────────────────────────────────────── */
function initLanguageSearchAndFilters() {
  const searchInput    = document.getElementById('languageSearch');
  const languageGrid   = document.getElementById('languageGrid');
  const noResults      = document.getElementById('noResultsMessage');
  const filterBtns     = document.querySelectorAll('.filter-btn');
  const cards          = languageGrid ? Array.from(languageGrid.querySelectorAll('.language-card')) : [];

  if (!searchInput || !languageGrid || cards.length === 0) return;

  let activeFilter = 'all';

  // ── Normalize status value for filter matching ──
  function normalizeStatus(rawStatus) {
    if (!rawStatus) return '';
    const s = rawStatus.toLowerCase().replace(/\s+/g, '-');
    // Treat "needs-reviewers" and "needs-audio" as "needs-contributors"
    if (s.startsWith('needs')) return 'needs-contributors';
    return s;
  }

  // ── Main filter function ──
  function filterCards() {
    const query = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    cards.forEach(card => {
      const language = (card.dataset.language || '').toLowerCase();
      const region   = (card.dataset.region   || '').toLowerCase();
      const status   = normalizeStatus(card.dataset.status);

      const matchesSearch =
        !query ||
        language.includes(query) ||
        region.includes(query) ||
        status.includes(query);

      const matchesFilter =
        activeFilter === 'all' || status === activeFilter;

      const visible = matchesSearch && matchesFilter;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    if (noResults) {
      noResults.classList.toggle('hidden', visibleCount > 0);
    }
  }

  // ── Search input event ──
  searchInput.addEventListener('input', filterCards);

  // ── Filter button events ──
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      filterCards();
    });
  });
}

/* ──────────────────────────────────────────────────────────
   4. PROGRESS BAR INITIALIZATION
   - Read verification % from displayed text in .lang-stat-value
   - Animate bars on page load with a slight delay for effect
   - Uses IntersectionObserver so bars animate on scroll-into-view
────────────────────────────────────────────────────────── */
function initProgressBars() {
  const bars = document.querySelectorAll('.lang-progress-fill, .mockup-progress-fill');

  function animateBar(bar) {
    const target = bar.style.width || '0%';
    bar.style.width = '0%';
    // Force reflow so transition fires
    void bar.offsetWidth;
    bar.style.transition = 'width .7s cubic-bezier(.4,0,.2,1)';
    bar.style.width = target;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateBar(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(bar => observer.observe(bar));
  } else {
    bars.forEach(animateBar);
  }
}

// Run progress bar init immediately (called inside DOMContentLoaded scope above)
document.addEventListener('DOMContentLoaded', initProgressBars);

/* ──────────────────────────────────────────────────────────
   5 & 6 & 7. CONTRIBUTION FORM + MOCK AI VERIFICATION + PIPELINE
────────────────────────────────────────────────────────── */
function initContributionForm() {
  const form               = document.getElementById('contributionForm');
  const verificationResult = document.getElementById('verificationResult');
  const pipelineSteps      = document.querySelectorAll('.pipeline-step');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const language    = form.querySelector('#languageSelect')?.value?.trim()    || '';
    const region      = form.querySelector('#regionDialect')?.value?.trim()     || '';
    const wordPhrase  = form.querySelector('#wordPhrase')?.value?.trim()        || '';
    const translation = form.querySelector('#englishTranslation')?.value?.trim() || '';
    const category    = form.querySelector('#category')?.value?.trim()          || '';
    const consent     = form.querySelector('#consentCheckbox')?.checked;

    // ── Validate ──
    const missing = [];
    if (!language)    missing.push('Language');
    if (!region)      missing.push('Region or dialect');
    if (!wordPhrase)  missing.push('Word or phrase');
    if (!translation) missing.push('English translation');
    if (!category)    missing.push('Category');
    if (!consent)     missing.push('Consent checkbox');

    if (missing.length > 0) {
      showVerificationResult(verificationResult, 'error',
        `<strong>Please complete the following required fields:</strong>
         <ul class="validation-list">${missing.map(f => `<li>${f}</li>`).join('')}</ul>`
      );
      return;
    }

    // ── Show loading state ──
    showVerificationResult(verificationResult, 'loading',
      `<span class="vr-loader" aria-live="polite">🤖 Running AI-assisted verification…</span>`
    );

    // ── Animate pipeline: Submitted step ──
    updatePipeline(pipelineSteps, 'submitted');

    // ── After 1 second, show mock result ──
    setTimeout(() => {
      updatePipeline(pipelineSteps, 'ai-checking');

      setTimeout(() => {
        runMockVerification({
          phrase:      wordPhrase,
          translation,
          language:    capitalize(language),
          category,
          region,
        }, verificationResult);

        updatePipeline(pipelineSteps, 'community-review');
      }, 900);

    }, 1000);
  });
}

/* ── Display verification result card ── */
function runMockVerification(data, container) {
  if (!container) return;

  const confidences = [87, 91, 92, 94, 96];
  const confidence  = confidences[Math.floor(Math.random() * confidences.length)];

  const html = `
    <div class="vr-card">
      <div class="vr-header">
        <span class="vr-badge ai-pill">AI Checked</span>
        <span class="vr-timestamp">${new Date().toLocaleTimeString()}</span>
      </div>

      <div class="vr-phrase-block">
        <p class="vr-phrase">"${escapeHtml(data.phrase)}"</p>
        <p class="vr-meta">${escapeHtml(data.language)} &nbsp;·&nbsp; ${escapeHtml(data.category)} &nbsp;·&nbsp; ${escapeHtml(data.region)}</p>
      </div>

      <ul class="vr-checks">
        <li class="vr-check vr-pass">
          <span class="vr-check-icon">✓</span>
          <span class="vr-check-label">Duplicate Check</span>
          <span class="vr-check-value">Passed</span>
        </li>
        <li class="vr-check vr-pass">
          <span class="vr-check-icon">✓</span>
          <span class="vr-check-label">Language Match</span>
          <span class="vr-check-value">Likely correct</span>
        </li>
        <li class="vr-check vr-pass">
          <span class="vr-check-icon">✓</span>
          <span class="vr-check-label">Translation Confidence</span>
          <span class="vr-check-value">${confidence}%</span>
        </li>
        <li class="vr-check vr-neutral">
          <span class="vr-check-icon">–</span>
          <span class="vr-check-label">Audio Clarity</span>
          <span class="vr-check-value">No audio provided</span>
        </li>
        <li class="vr-check vr-pass">
          <span class="vr-check-icon">✓</span>
          <span class="vr-check-label">Safety Check</span>
          <span class="vr-check-value">Passed</span>
        </li>
        <li class="vr-check vr-pending">
          <span class="vr-check-icon">⏳</span>
          <span class="vr-check-label">Human Review Needed</span>
          <span class="vr-check-value">Yes</span>
        </li>
      </ul>

      <p class="vr-note">
        🤝 AI helps check quality, but native speakers and trusted reviewers make the final decision.
      </p>
    </div>
  `;

  showVerificationResult(container, 'success', html);
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Helper: render into result container ── */
function showVerificationResult(container, type, html) {
  if (!container) return;
  container.innerHTML = html;
  container.className = `verification-result ${type}`;
  container.classList.remove('hidden');
}

/* ── Pipeline step updater ── */
function updatePipeline(steps, currentStage) {
  const order = ['submitted', 'ai-checking', 'community-review', 'verified', 'published'];
  const currentIndex = order.indexOf(currentStage);

  steps.forEach(step => {
    const stage = step.dataset.stage;
    const idx   = order.indexOf(stage);

    step.classList.remove('active', 'completed', 'pending');

    if (idx < currentIndex)       step.classList.add('completed');
    else if (idx === currentIndex) step.classList.add('active');
    else                          step.classList.add('pending');
  });
}

/* ──────────────────────────────────────────────────────────
   8. FAKE AUDIO PLAY BUTTONS
   - Change button text to "Playing..." for 1.5 s
   - Show inline demo notice near the button
────────────────────────────────────────────────────────── */
function initAudioButtons() {
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.playing === 'true') return;

      const originalText  = btn.textContent;
      const phrase        = btn.dataset.phrase || 'this phrase';
      btn.dataset.playing = 'true';
      btn.textContent     = '⏸ Playing…';
      btn.style.background = 'var(--teal)';

      // Inline demo notice
      const notice = document.createElement('span');
      notice.className    = 'audio-demo-notice';
      notice.textContent  = `Demo playback for "${phrase}"`;
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      btn.insertAdjacentElement('afterend', notice);

      setTimeout(() => {
        btn.textContent       = originalText;
        btn.style.background  = '';
        btn.dataset.playing   = 'false';
        notice.remove();
      }, 1500);
    });
  });
}

/* ──────────────────────────────────────────────────────────
   9 & 10. DATASET DOWNLOADS
   - Download JSON (Waray sample)
   - Download CSV (Waray phrases)
   - View API → scroll to API preview in developer section
────────────────────────────────────────────────────────── */
function initDatasetDownloads() {
  // Primary download button in the Developer section
  const dlSampleBtn = document.getElementById('downloadSampleData');
  if (dlSampleBtn) dlSampleBtn.addEventListener('click', downloadJSON);

  // Waray export section buttons
  const dlJSON = document.getElementById('downloadJSON');
  const dlCSV  = document.getElementById('downloadCSV');
  const viewAPI = document.getElementById('viewAPI');

  if (dlJSON)  dlJSON.addEventListener('click',  downloadJSON);
  if (dlCSV)   dlCSV.addEventListener('click',   downloadCSV);
  if (viewAPI) {
    viewAPI.addEventListener('click', e => {
      e.preventDefault();
      const apiPreview = document.querySelector('.api-preview-block');
      if (!apiPreview) return;
      const header = document.getElementById('site-header');
      const offset = header ? header.offsetHeight + 16 : 16;
      const top = apiPreview.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Brief highlight pulse
      apiPreview.style.transition = 'box-shadow .2s';
      apiPreview.style.boxShadow  = '0 0 0 3px var(--gold)';
      setTimeout(() => { apiPreview.style.boxShadow = ''; }, 1800);
    });
  }
}

function downloadJSON() {
  const data = buildWaraySampleData();
  const json = JSON.stringify(data, null, 2);
  triggerDownload(json, 'wikapedia-waray-sample.json', 'application/json');
}

function downloadCSV() {
  const data   = buildWaraySampleData();
  const header = ['waray', 'english', 'category', 'status', 'audio_available'];
  const rows   = data.entries.map(e => [
    csvEscape(e.waray),
    csvEscape(e.english),
    csvEscape(e.category),
    csvEscape(e.status),
    csvEscape(String(e.audio_available)),
  ]);

  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  triggerDownload(csv, 'wikapedia-waray-sample.csv', 'text/csv');
}

/* ── Shared Waray dataset object ── */
function buildWaraySampleData() {
  return {
    platform: 'Wikapedia',
    language: 'Waray',
    region:   'Eastern Visayas',
    license:  'CC BY 4.0',
    metadata: {
      entries_count:        4221,
      voice_samples:        891,
      verified_percentage:  64,
      intended_use: [
        'speech recognition',
        'text-to-speech',
        'translation',
        'education',
        'accessibility',
      ],
    },
    entries: [
      {
        waray:          'Maupay nga aga',
        english:        'Good morning',
        category:       'Greeting',
        status:         'community_verified',
        audio_available: true,
      },
      {
        waray:          'Kinahanglan ko hin bulig',
        english:        'I need help',
        category:       'Emergency',
        status:         'community_verified',
        audio_available: true,
      },
      {
        waray:          'Hain an sakayan?',
        english:        'Where is the ride or transport?',
        category:       'Transportation',
        status:         'ai_checked',
        audio_available: true,
      },
      {
        waray:          'Makadto ako ha merkado',
        english:        'I am going to the market',
        category:       'Daily Life',
        status:         'under_review',
        audio_available: true,
      },
    ],
  };
}

/* ── Trigger browser file download ── */
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ──────────────────────────────────────────────────────────
   11. CONTRIBUTION TYPE CARD SELECTION
   - Highlight selected contribution type
   - Could pre-fill the category field in the form
────────────────────────────────────────────────────────── */
function initContributionTypeCards() {
  const typeCards   = document.querySelectorAll('.contribution-type-card');
  const categoryEl  = document.getElementById('category');

  const typeToCategory = {
    word:          '',
    phrase:        '',
    translate:     '',
    record:        '',
    pronunciation: '',
    review:        '',
  };

  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      // Scroll form into view
      const form = document.getElementById('contributionForm');
      if (form) {
        const header = document.getElementById('site-header');
        const offset = header ? header.offsetHeight + 16 : 16;
        const top    = form.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ──────────────────────────────────────────────────────────
   UTILITIES
────────────────────────────────────────────────────────── */

/* Capitalize first letter */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* Escape HTML entities to prevent XSS in injected strings */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Wrap a CSV field in quotes if it contains commas, quotes, or newlines */
function csvEscape(value) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/* ──────────────────────────────────────────────────────────
   DYNAMIC STYLES
   Inject a small <style> block for JS-driven UI states
   (verification result card, pipeline active/completed,
   audio notice) so no CSS file edits are needed.
────────────────────────────────────────────────────────── */
(function injectDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ── Verification result card ── */
    .verification-result.loading {
      background: #F0F9FF;
      border-color: #7DD3FC;
      color: #0369A1;
      font-weight: 600;
      font-size: .9375rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .vr-loader::before {
      content: '';
      display: inline-block;
      width: 16px; height: 16px;
      border: 2px solid #7DD3FC;
      border-top-color: #0369A1;
      border-radius: 50%;
      animation: vrSpin .7s linear infinite;
      vertical-align: middle;
      margin-right: 8px;
    }

    @keyframes vrSpin { to { transform: rotate(360deg); } }

    .verification-result.success {
      background: var(--white);
      border: 1.5px solid #A7F3D0;
      border-radius: 12px;
      padding: 0;
      overflow: hidden;
    }

    .verification-result.error {
      background: #FFF5F5;
      border: 1.5px solid #FCA5A5;
      color: #991B1B;
    }

    .validation-list {
      margin-top: 8px;
      margin-left: 20px;
      list-style: disc;
      font-size: .9rem;
    }

    .vr-card { padding: 28px; }

    .vr-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .vr-badge {
      font-size: .75rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 999px;
    }

    .vr-timestamp {
      font-size: .8rem;
      color: var(--text-muted);
    }

    .vr-phrase-block {
      background: var(--gray-light);
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }

    .vr-phrase {
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--navy);
      margin-bottom: 4px;
    }

    .vr-meta {
      font-size: .8125rem;
      color: var(--text-muted);
    }

    .vr-checks {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin-bottom: 20px;
      border: 1px solid #E8EEF4;
      border-radius: 8px;
      overflow: hidden;
    }

    .vr-check {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 16px;
      border-bottom: 1px solid #F1F5F9;
      font-size: .9rem;
    }

    .vr-check:last-child { border-bottom: none; }

    .vr-check-icon {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: .75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .vr-pass .vr-check-icon  { background: #D1FAE5; color: #065F46; }
    .vr-neutral .vr-check-icon { background: #F1F5F9; color: #64748B; }
    .vr-pending .vr-check-icon { background: #FEF3C7; color: #92400E; }

    .vr-check-label {
      flex: 1;
      font-weight: 600;
      color: var(--text-dark);
    }

    .vr-check-value {
      font-size: .8125rem;
      color: var(--text-muted);
      text-align: right;
    }

    .vr-note {
      font-size: .875rem;
      color: var(--text-muted);
      line-height: 1.6;
      background: #FFFBEB;
      border-left: 3px solid var(--gold);
      padding: 10px 14px;
      border-radius: 0 6px 6px 0;
    }

    /* ── Pipeline active / completed / pending states ── */
    .pipeline-step.completed {
      background: #ECFDF5;
      border: 1.5px solid #6EE7B7;
    }

    .pipeline-step.completed .pipeline-step-label { color: #065F46; }

    .pipeline-step.active {
      background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
      border: 2px solid #60A5FA;
      box-shadow: 0 0 0 3px rgba(96,165,250,.2);
    }

    .pipeline-step.active .pipeline-step-label { color: #1D4ED8; }

    .pipeline-step.pending { opacity: .5; }

    /* ── Audio demo notice ── */
    .audio-demo-notice {
      display: inline-block;
      margin-left: 10px;
      font-size: .8rem;
      color: var(--teal);
      font-weight: 600;
      background: #F0FDFA;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid #99F6E4;
      animation: fadeSlideIn .2s ease;
      vertical-align: middle;
    }

    /* ── Contribution type card active state ── */
    .contribution-type-card.active {
      border-color: var(--teal);
      background: #F0FDFA;
      box-shadow: 0 0 0 3px rgba(42,157,143,.15);
    }
  `;
  document.head.appendChild(style);
})();
