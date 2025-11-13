/* script.js — interactive behaviors, GitHub fetch, particles, typing intro, tilt effects */

const username = 'jacobmiller9826'; // your GitHub username

/* ---------------------------
   Typing intro
   --------------------------- */
const typingEl = document.getElementById('typing');
const introText = "Building worlds. One repo at a time.";
let i = 0;
function typeIntro(){
  if(i <= introText.length){
    typingEl.textContent = introText.slice(0,i);
    i++;
    setTimeout(typeIntro, 36);
  }
}
setTimeout(typeIntro, 600);

/* ---------------------------
   Theme toggle
   --------------------------- */
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
});

/* ---------------------------
   Sections nav
   --------------------------- */
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const id = item.dataset.target;
    sections.forEach(s => {
      if(s.id === id){ s.classList.add('visible'); s.scrollTop = 0; }
      else s.classList.remove('visible');
    });
  });
});

/* ---------------------------
   Repo section mapping
   (you can tweak names below or add new ones)
   --------------------------- */
const sectionMap = {
  foundation: [
    "TributePage","surveyForm","exampleLandingPage"
  ],
  fullstack: [
    "MBM-HandyMan-Services","modern-cuts-site","Paint-estimator-"
  ],
  security: [
    "Neighborhood-watch","security-scripts"
  ],
  realestate: [
    "trailer-park-sales-model-","Royal-Shelter-Society-","Tucson-Permit-Assistant"
  ],
  blockchain: [
    "Desert-Ledger","Day-Zero","crypto-experiments"
  ],
  capstone: [
    "final-creative-build","THE-BLOKK","portfolio-site"
  ]
};

/* ---------------------------
   Fetch GitHub repos and populate grids
   --------------------------- */
async function fetchRepos(){
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=200`);
    if(!res.ok) throw new Error('GitHub API error: '+res.status);
    const repos = await res.json();

    // index repos by name for quick lookup
    const repoMap = {};
    repos.forEach(r => repoMap[r.name] = r);

    // for each section, map and display
    for(const [section, names] of Object.entries(sectionMap)){
      const grid = document.getElementById(section + 'Grid');
      if(!grid) continue;

      // find repos by name; if none found, supplement from recent repos
      let found = names.map(n => repoMap[n]).filter(Boolean);
      if(found.length === 0){
        // grab first 6 repos as fallback
        found = repos.slice(0,6);
      }

      // create cards with staggered animation
      found.forEach((r, idx) => {
        const card = document.createElement('a');
        card.className = 'card';
        card.href = r.html_url;
        card.target = '_blank';
        card.rel = 'noopener';

        const desc = r.description ? r.description : '— no description —';
        const created = new Date(r.created_at).toLocaleDateString();

        card.innerHTML = `
          <h3>${r.name}</h3>
          <p>${escapeHtml(desc)}</p>
          <div class="repo-meta">
            <span class="tag">${r.language || 'misc'}</span>
            <small class="muted">created ${created}</small>
          </div>
        `;

        // tilt effect
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `rotateX(${(-y * 6)}deg) rotateY(${(x * 8)}deg) translateZ(6px)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });

        // staggered fade-in
        card.style.opacity = 0;
        card.style.transform += ' translateY(8px)';
        grid.appendChild(card);
        setTimeout(()=>{ card.style.opacity = 1; card.style.transform = card.style.transform.replace(' translateY(8px)',''); }, 120 * idx);
      });
    }

    // set Download PDF link to the file from earlier generation (if you upload to repo root)
    const pdfLink = document.getElementById('downloadPdf');
    pdfLink.href = './Jacob_Miller_GitHub_Curriculum.pdf';

  } catch(err){
    console.error(err);
    // graceful fallback: show message in each grid
    Object.keys(sectionMap).forEach(section => {
      const grid = document.getElementById(section + 'Grid');
      if(grid && grid.children.length === 0){
        const note = document.createElement('div');
        note.className = 'card';
        note.innerHTML = `<h3>Unable to load repos</h3><p class="muted">GitHub rate limit or network issue. Try again later.</p>`;
        grid.appendChild(note);
      }
    });
  }
}
function escapeHtml(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
fetchRepos();

/* ---------------------------
   Particle system (cursor trails)
   lightweight, subtle
   --------------------------- */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = innerWidth;
let h = canvas.height = innerHeight;
const particles = [];
const maxParticles = 120;
const colors = [
  'rgba(141,106,255,0.9)',
  'rgba(58,224,255,0.85)',
  'rgba(255,138,91,0.85)'
];

window.addEventListener('resize', () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; });

let mouse = {x: w/2, y: h/2, down: false};
window.addEventListener('mousemove', (e)=>{ mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', ()=> mouse.down = true);
window.addEventListener('mouseup', ()=> mouse.down = false);

function rand(min,max){ return Math.random()*(max-min)+min; }

function spawnParticle(x,y){
  if(particles.length > maxParticles) particles.shift();
  particles.push({
    x, y,
    vx: rand(-0.6,0.6), vy: rand(-0.6,0.6),
    life: rand(40,110),
    size: rand(1,3),
    color: colors[Math.floor(Math.random()*colors.length)]
  });
}

function updateParticles(){
  // spawn based on mouse speed slightly
  spawnParticle(mouse.x + rand(-8,8), mouse.y + rand(-8,8));
  ctx.clearRect(0,0,w,h);
  for(let i = particles.length -1; i>=0; i--){
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.99; p.vy *= 0.99;
    p.life--;
    if(p.life <= 0){ particles.splice(i,1); continue; }
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0.04, p.life / 120);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(updateParticles);
}
updateParticles();

/* ---------------------------
   small accessibility: keyboard nav for sections (1..6)
   --------------------------- */
window.addEventListener('keydown', (e) => {
  if(e.key >= '1' && e.key <= '6'){
    const idx = Number(e.key) - 1;
    if(navItems[idx]) navItems[idx].click();
  }
});

/* ---------------------------
   small UX: click outside to reset tilt transforms on all cards
   --------------------------- */
document.addEventListener('mousemove', ()=> {
  // gentle reset for cards far away from cursor (keeps UI tidy on small screens)
  const cards = document.querySelectorAll('.card');
  cards.forEach(c => {
    // if no transform set, leave alone
    if(!c.matches(':hover')) {
      c.style.transform = '';
    }
  });
});
