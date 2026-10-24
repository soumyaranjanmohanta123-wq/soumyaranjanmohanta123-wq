// ===========================
// UTILITY: Animated Counter
// ===========================
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(ease * target);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ===========================
// CONTRIBUTION GRAPH
// ===========================
function buildContribGraph() {
  const graph = document.getElementById('contrib-graph');
  if (!graph) return;
  graph.innerHTML = '';

  const weeks = 53;
  const days = 7;
  const seed = (x, y) => {
    const v = Math.sin(x * 13.7 + y * 7.3) * 43758.5453;
    return v - Math.floor(v);
  };

  for (let w = 0; w < weeks; w++) {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'contrib-week';
    for (let d = 0; d < days; d++) {
      const cell = document.createElement('div');
      cell.className = 'contrib-cell';
      const r = seed(w, d);
      let level = 0;
      if (r > 0.3) level = 1;
      if (r > 0.55) level = 2;
      if (r > 0.75) level = 3;
      if (r > 0.90) level = 4;
      cell.setAttribute('data-level', level);

      // Animate in
      const delay = w * 12 + d * 20;
      cell.style.opacity = '0';
      cell.style.transform = 'scale(0.3)';
      cell.style.transition = `opacity 0.3s ${delay}ms, transform 0.4s ${delay}ms cubic-bezier(0.34,1.56,0.64,1)`;

      weekDiv.appendChild(cell);
    }
    graph.appendChild(weekDiv);
  }

  // Trigger animation after mount
  requestAnimationFrame(() => {
    document.querySelectorAll('.contrib-cell').forEach(cell => {
      cell.style.opacity = '1';
      cell.style.transform = 'scale(1)';
    });
  });
}

// ===========================
// LANGUAGE DONUT CHART
// ===========================
const LANG_DATA = [
  { name: 'TypeScript', pct: 38, color: '#3178c6' },
  { name: 'JavaScript', pct: 22, color: '#f0db4f' },
  { name: 'Python',     pct: 15, color: '#3572A5' },
  { name: 'Rust',       pct: 10, color: '#e34c26' },
  { name: 'Go',         pct: 8,  color: '#00ADD8' },
  { name: 'CSS',        pct: 5,  color: '#563d7c' },
  { name: 'Other',      pct: 2,  color: '#6b7280' },
];

function drawDonut() {
  const canvas = document.getElementById('langDonut');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const outerR = 90;
  const innerR = 58;

  let startAngle = -Math.PI / 2;
  const gap = 0.02;

  LANG_DATA.forEach(lang => {
    const slice = (lang.pct / 100) * (2 * Math.PI - gap * LANG_DATA.length);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startAngle + gap / 2, startAngle + slice - gap / 2);
    ctx.arc(cx, cy, innerR, startAngle + slice - gap / 2, startAngle + gap / 2, true);
    ctx.closePath();
    ctx.fillStyle = lang.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = lang.color;
    ctx.fill();
    startAngle += slice;
  });

  // Build legend
  const legend = document.getElementById('lang-legend');
  if (legend) {
    legend.innerHTML = '';
    LANG_DATA.forEach(l => {
      const item = document.createElement('div');
      item.className = 'lang-legend-item';
      item.innerHTML = `
        <span class="lang-legend-dot" style="background:${l.color}"></span>
        <span>${l.name}</span>
        <span class="lang-legend-pct">${l.pct}%</span>
      `;
      legend.appendChild(item);
    });
  }
}

// ===========================
// SKILL BARS ANIMATION
// ===========================
function animateSkillBars() {
  document.querySelectorAll('.skill-bar-fill').forEach(bar => {
    const pct = bar.dataset.pct;
    bar.style.width = pct + '%';
  });
}

// ===========================
// STREAK BAR
// ===========================
function animateStreakBar() {
  const best = 91;
  const current = 47;
  const pct = (current / best) * 100;
  const bar = document.getElementById('streak-progress');
  if (bar) {
    setTimeout(() => { bar.style.width = pct + '%'; }, 600);
  }
}

// ===========================
// STAR TOGGLE
// ===========================
const starredRepos = new Set();

function toggleStar(btn, countId, base) {
  const id = btn.id;
  const countEl = document.getElementById(countId);
  if (starredRepos.has(id)) {
    starredRepos.delete(id);
    btn.classList.remove('starred');
    countEl.textContent = base >= 1000
      ? (base / 1000).toFixed(1) + 'k'
      : base.toLocaleString();
  } else {
    starredRepos.add(id);
    btn.classList.add('starred');
    const n = base + 1;
    countEl.textContent = n >= 1000
      ? (n / 1000).toFixed(1) + 'k'
      : n.toLocaleString();
    // Micro animation
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  }
}

// ===========================
// YEAR SELECTOR
// ===========================
function setupYearSelector() {
  document.querySelectorAll('.year-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const year = btn.dataset.year;
      const counts = { '2026': '1,847', '2025': '2,341', '2024': '1,982' };
      const el = document.getElementById('contrib-count');
      if (el) el.textContent = counts[year] || '1,847';
      buildContribGraph();
    });
  });
}

// ===========================
// FOLLOW BUTTON
// ===========================
function setupFollowBtn() {
  const btn = document.getElementById('btn-follow');
  if (!btn) return;
  let following = false;
  btn.addEventListener('click', () => {
    following = !following;
    btn.textContent = following ? '? Following' : 'Follow';
    btn.style.background = following ? '#22c55e' : '';
    btn.style.transform = 'scale(1.08)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
}

// ===========================
// SCROLL ANIMATIONS (IntersectionObserver)
// ===========================
function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-visible');
        observer.unobserve(entry.target);

        // Trigger counters when visible
        entry.target.querySelectorAll('.counter').forEach(c => animateCounter(c));

        // Skills
        if (entry.target.querySelector('.skill-bar-fill')) {
          animateSkillBars();
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.stat-card, .repo-card, .achievement-badge, .skill-list, .streak-card, .activity-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// Make visible
const style = document.createElement('style');
style.textContent = `.anim-visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ===========================
// NAVBAR SCROLL EFFECT
// ===========================
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    if (window.scrollY > 40) {
      nav.style.borderBottomColor = 'rgba(139,92,246,0.2)';
    } else {
      nav.style.borderBottomColor = '';
    }
  }
}, { passive: true });

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  buildContribGraph();
  drawDonut();
  animateStreakBar();
  setupYearSelector();
  setupFollowBtn();

  // Hero counters fire immediately
  document.querySelectorAll('.stat-value.counter, .streak-days .counter').forEach(c => {
    animateCounter(c);
  });

  // Stagger card animations
  setTimeout(setupScrollAnimations, 200);
});
