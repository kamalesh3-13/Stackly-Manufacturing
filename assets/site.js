gsap.registerPlugin(ScrollTrigger);

/* ---- HUD preloader with live percentage counter ---- */
(function(){
  const pre = document.getElementById('preloader');
  if(!pre) return;
  document.documentElement.classList.add('is-loading');
  const MIN_MS = 1300;
  const shownAt = Date.now();
  const bar = pre.querySelector('.pl-bar span');
  const label = pre.querySelector('.pl-label');
  let pct = 0;
  let loaded = false;

  function setPct(v){
    pct = Math.max(pct, Math.min(100, v));
    if(bar) bar.style.width = pct + '%';
    if(label) label.setAttribute('data-pct', Math.round(pct) + '%');
  }
  setPct(0);

  // Ease progress up toward ~90% while real resources are still loading
  const ticker = setInterval(function(){
    if(pct < 90){
      setPct(pct + (90 - pct) * 0.12 + 0.6);
    }
  }, 90);

  function finish(){
    if(loaded) return;
    loaded = true;
    clearInterval(ticker);
    setPct(100);
    const wait = Math.max(250, MIN_MS - (Date.now() - shownAt));
    setTimeout(()=>{
      pre.classList.add('done');
      document.documentElement.classList.remove('is-loading');
      setTimeout(()=> pre.remove(), 650);
    }, wait);
  }
  if(document.readyState === 'complete'){ finish(); }
  else{ window.addEventListener('load', finish); }
})();

/* ---- Active page highlight — header nav, mobile nav, footer columns ---- */
(function(){
  let current = location.pathname.split('/').pop();
  if(current === '') current = 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a, .foot-col a').forEach(a=>{
    const href = (a.getAttribute('href') || '').split('/').pop();
    if(href && href === current){ a.classList.add('active'); }
  });
})();

/* Header shrinks + gains a shadow once the page scrolls */
const siteHeader = document.querySelector('header');
window.addEventListener('scroll', ()=>{
  siteHeader.classList.toggle('scrolled', window.scrollY > 40);
}, {passive:true});

/* Hero headline reveals word-by-word instead of one flat fade */
const heroH1 = document.querySelector('.hero h1');
if(heroH1){
  const words = heroH1.innerHTML.split(/(<br>)/).flatMap(chunk =>
    chunk === '<br>' ? ['<br>'] : chunk.split(' ').filter(w=>w.length)
  );
  heroH1.innerHTML = words.map(w => w === '<br>' ? '<br>' : `<span class="word" style="display:inline-block; opacity:0; transform:translateY(100%);">${w}</span>`).join(' ');
  heroH1.style.opacity = 1;
  heroH1.style.transform = 'none';
}

/* Hero load-in sequence — the one orchestrated moment */
gsap.timeline({defaults:{ease:'power3.out'}})
  .to('.hero h1 .word', {opacity:1, y:'0%', duration:0.7, stagger:0.045})
  .to('.hero p', {opacity:1, y:0, duration:0.8}, '-=0.4')
  .to('.hero-actions', {opacity:1, y:0, duration:0.7}, '-=0.5')
  .from('.polaroid', {opacity:0, y:40, scale:0.85, stagger:0.08, duration:0.8}, '-=0.35');

/* Section reveals on scroll */
document.querySelectorAll('.split h2, .stats h3, .whole h2, .system h2, .materials h2, .flow h2, .flow-sub, .industries h2, .vis-grid h2, .voices h2, .obvious, .notes-head h3, .faq-box, .final h2, .final p').forEach(el=>{
  gsap.fromTo(el, {opacity:0, y:30}, {
    opacity:1, y:0, duration:0.8, ease:'power2.out',
    scrollTrigger:{ trigger: el, start:'top 85%' }
  });
});

/* Split media — zoom in on scroll (distinct from its own hover zoom) */
document.querySelectorAll('.split-media, .vis-media').forEach(el=>{
  gsap.fromTo(el, {opacity:0, scale:0.86}, {
    opacity:1, scale:1, duration:0.9, ease:'power2.out',
    scrollTrigger:{ trigger: el, start:'top 85%' }
  });
});

/* Staggered groups — each section gets its own kind of motion */

/* Stats — flip in on the Y axis */
gsap.utils.toArray('.stat-grid').forEach(group=>{
  const items = group.querySelectorAll('.stat-card, .stat-illustration');
  gsap.fromTo(items, {opacity:0, rotateY:65, transformPerspective:800, transformOrigin:'left center'}, {
    opacity:1, rotateY:0, duration:0.7, stagger:0.09, ease:'power2.out',
    scrollTrigger:{ trigger: group, start:'top 82%' }
  });
});

/* Whole-picture grid — "flop" in from the top (rotate on X) */
gsap.utils.toArray('.grid-3').forEach(group=>{
  const items = group.querySelectorAll('.cell');
  gsap.fromTo(items, {opacity:0, rotateX:55, transformPerspective:800, transformOrigin:'top center'}, {
    opacity:1, rotateX:0, duration:0.65, stagger:0.07, ease:'power2.out',
    scrollTrigger:{ trigger: group, start:'top 82%' }
  });
});

/* Materials — zoom in with a slight overshoot, label wipes in right after */
gsap.utils.toArray('.mat-grid').forEach(group=>{
  const items = group.querySelectorAll('.mat-card');
  gsap.fromTo(items, {opacity:0, scale:0.78}, {
    opacity:1, scale:1, duration:0.7, stagger:0.1, ease:'back.out(1.6)',
    scrollTrigger:{ trigger: group, start:'top 82%' },
    onComplete(){ items.forEach(it => it.classList.add('in-view')); }
  });
});

/* Flow — cards bounce in elastically instead of just floating up on hover */
gsap.utils.toArray('.flow-card').forEach((card, i)=>{
  gsap.fromTo(card, {opacity:0, scale:0.6}, {
    opacity:1, scale:1, duration:0.9, delay:i*0.12, ease:'elastic.out(1, 0.55)',
    scrollTrigger:{ trigger:'.flow-row', start:'top 82%' }
  });
});

/* One system list — alternating left/right slide-in */
gsap.utils.toArray('.system-row').forEach((row, i)=>{
  gsap.fromTo(row, {opacity:0, x: i % 2 === 0 ? -60 : 60}, {
    opacity:1, x:0, duration:0.7, ease:'power2.out',
    scrollTrigger:{ trigger: row, start:'top 88%' }
  });
});

/* Field notes side list — staggered slide-in from the right, on top of the CSS hover zoom */
gsap.utils.toArray('.note-side').forEach(group=>{
  const items = group.querySelectorAll('.note-small');
  gsap.fromTo(items, {opacity:0, x:30}, {
    opacity:1, x:0, duration:0.6, stagger:0.1, ease:'power2.out',
    scrollTrigger:{ trigger: group, start:'top 85%' }
  });
});

/* Voice cards — simple rise-and-fade */
gsap.utils.toArray('.voice-grid').forEach(group=>{
  const items = group.querySelectorAll('.voice-card');
  gsap.fromTo(items, {opacity:0, y:24}, {
    opacity:1, y:0, duration:0.6, stagger:0.08, ease:'power2.out',
    scrollTrigger:{ trigger: group, start:'top 82%' }
  });
});

/* Floating signal words drift */
gsap.utils.toArray('.signal-word').forEach((w,i)=>{
  gsap.fromTo(w, {opacity:0, y:20}, {
    opacity:1, y:0, duration:1, delay:i*0.08,
    scrollTrigger:{ trigger:'.signals', start:'top 70%' }
  });
  gsap.to(w, { y:'+=14', duration: 3 + i*0.4, repeat:-1, yoyo:true, ease:'sine.inOut' });
});
gsap.fromTo('.signals-headline', {opacity:0, scale:0.94}, {
  opacity:1, scale:1, duration:1, ease:'power3.out',
  scrollTrigger:{ trigger:'.signals', start:'top 65%' }
});

/* Signals — the whole word-field drifts with scroll (parallax) */
gsap.to('.signals-field', {
  yPercent:-12, ease:'none',
  scrollTrigger:{ trigger:'.signals', start:'top bottom', end:'bottom top', scrub:0.6 }
});

/* Split + Notes feature — tilt toward the cursor */
function attachTilt(selector, strength){
  document.querySelectorAll(selector).forEach(el=>{
    el.addEventListener('mousemove', e=>{
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: px * strength, rotateX: -py * strength, duration:0.4, ease:'power2.out', transformPerspective:800 });
    });
    el.addEventListener('mouseleave', ()=>{
      gsap.to(el, { rotateY:0, rotateX:0, duration:0.6, ease:'power2.out' });
    });
  });
}
attachTilt('.split-media', 8);
attachTilt('.note-feature', 6);
attachTilt('.stat-card', 6);
attachTilt('.mat-card', 8);
attachTilt('.voice-card', 5);
attachTilt('.flow-card', 6);
attachTilt('.grid-3 .cell', 5);

/* ---- Spotlight cursor, one per section, follows the mouse ---- */
document.querySelectorAll('section').forEach(sec=>{
  const spot = document.createElement('div');
  spot.className = 'fx-spotlight';
  sec.insertBefore(spot, sec.firstChild);
  sec.addEventListener('mousemove', e=>{
    const r = sec.getBoundingClientRect();
    sec.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
    sec.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* ---- Magnetic buttons — pull toward the cursor within their own box ---- */
/* Mobile nav drawer */
const burgerBtn = document.getElementById('burgerBtn');
const mobileNav = document.getElementById('mobileNav');
const mobileNavScrim = document.getElementById('mobileNavScrim');
function closeMobileNav(){
  burgerBtn.classList.remove('open');
  mobileNav.classList.remove('open');
  mobileNavScrim.classList.remove('show');
}
if(burgerBtn){
  burgerBtn.addEventListener('click', ()=>{
    const isOpen = mobileNav.classList.toggle('open');
    burgerBtn.classList.toggle('open', isOpen);
    mobileNavScrim.classList.toggle('show', isOpen);
  });
  mobileNavScrim.addEventListener('click', closeMobileNav);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
}

document.querySelectorAll('.btn, .nav-cta, .read-link').forEach(btn=>{
  btn.addEventListener('mousemove', e=>{
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', ()=>{
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
});

/* ---- Text splitting — headline words fly in individually, not just as a block ---- */
function splitWords(el){
  if(el.dataset.split) return;
  el.dataset.split = '1';
  const words = el.innerHTML.split(/(<br>)/).flatMap(chunk =>
    chunk === '<br>' ? ['<br>'] : chunk.split(' ').filter(w=>w.length)
  );
  el.innerHTML = words.map(w => w === '<br>' ? '<br>' : `<span class="split-word">${w}</span>`).join(' ');
}
['.stats h3', '.whole h2', '.system h2', '.materials h2', '.industries h2', '.vis-grid h2', '.voices h2', '.notes-head h3', '.final h2'].forEach(sel=>{
  document.querySelectorAll(sel).forEach(el=>{
    splitWords(el);
    gsap.to(el.querySelectorAll('.split-word'), {
      opacity:1, y:'0%', rotate:0, duration:0.7, stagger:0.035, ease:'power2.out',
      scrollTrigger:{ trigger: el, start:'top 85%' }
    });
  });
});

/* ---- Image masking — wipe reveal on scroll instead of a plain fade ---- */
document.querySelectorAll('.split-media, .vis-media, .stat-illustration, .note-feature').forEach(el=>{
  el.classList.add('mask-reveal');
  ScrollTrigger.create({ trigger: el, start:'top 90%', once:true, onEnter: ()=> el.classList.add('in-view') });
});
document.querySelectorAll('.mat-card').forEach(el=>{
  el.classList.add('mask-reveal-x');
  ScrollTrigger.create({ trigger: el, start:'top 90%', once:true, onEnter: ()=> el.classList.add('in-view') });
});
document.querySelectorAll('.map-frame').forEach(el=>{
  el.classList.add('mask-reveal');
  ScrollTrigger.create({ trigger: el, start:'top 88%', once:true, onEnter: ()=> el.classList.add('in-view') });
});

/* ---- Animated conic border — flag key feature cards to carry it ---- */
document.querySelectorAll('.flow-card.intel, .flow-card.action, .voice-card.dark, .voice-card.light').forEach(el=>{
  el.classList.add('fx-border');
});

/* Section "light" glow reveals */
document.querySelectorAll('.glow span').forEach(sp=>{
  gsap.to(sp, {
    opacity:0.55, duration:1.6, ease:'power2.out',
    scrollTrigger:{ trigger: sp.closest('section'), start:'top 75%' }
  });
  gsap.to(sp, { x:'+=40', y:'+=30', duration:8, repeat:-1, yoyo:true, ease:'sine.inOut' });
});

/* Animated counters */
document.querySelectorAll('[data-count]').forEach(el=>{
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const obj = {v:0};
  ScrollTrigger.create({
    trigger: el, start:'top 88%', once:true,
    onEnter: ()=> gsap.to(obj, {
      v: target, duration:1.6, ease:'power2.out',
      onUpdate: ()=>{ el.textContent = prefix + obj.v.toFixed(1).replace('.0','') + suffix; }
    })
  });
});

/* Compare slider fill — the "After" number flashes once the bar finishes */
if(document.querySelector('.compare')){
  ScrollTrigger.create({
    trigger:'.compare', start:'top 85%', once:true,
    onEnter: ()=> gsap.to('#compare-fill', {width: document.getElementById('compare-fill')?.dataset.fill || '96.8%', duration:1.6, ease:'power2.out', onComplete(){
      const afterNum = document.querySelector('.compare-labels div:last-child .num');
      if(afterNum){ afterNum.classList.add('flash'); }
    }})
  });
}

/* Generic reveal-up — any element on any page can opt in with class="reveal-up" */
gsap.utils.toArray('.reveal-up').forEach((el,i)=>{
  gsap.fromTo(el, {opacity:0, y:30}, {
    opacity:1, y:0, duration:0.8, delay:(i%4)*0.06, ease:'power2.out',
    scrollTrigger:{ trigger: el, start:'top 88%' }
  });
});

/* Generic staggered group reveal — wrap a group in class="reveal-group", items get [data-reveal-item] */
gsap.utils.toArray('.reveal-group').forEach(group=>{
  const items = group.querySelectorAll(':scope > *');
  gsap.fromTo(items, {opacity:0, y:26}, {
    opacity:1, y:0, duration:0.6, stagger:0.09, ease:'power2.out',
    scrollTrigger:{ trigger: group, start:'top 85%' }
  });
});

/* Sparkline draw-in */
document.querySelectorAll('.spark path, .line-mini path, .mini-chart path').forEach(p=>{
  const len = p.getTotalLength();
  gsap.set(p, {strokeDasharray:len, strokeDashoffset:len});
  ScrollTrigger.create({
    trigger:p.closest('svg'), start:'top 90%', once:true,
    onEnter: ()=> gsap.to(p, {strokeDashoffset:0, duration:1.2, ease:'power2.out'})
  });
});

/* Bars grow-in */
document.querySelectorAll('.bar-row div').forEach(b=>{
  const h = b.style.height;
  gsap.set(b, {height:'0%'});
  ScrollTrigger.create({
    trigger:b.closest('.bar-row'), start:'top 90%', once:true,
    onEnter: ()=> gsap.to(b, {height:h, duration:0.8, ease:'power2.out'})
  });
});

/* Industry tabs */
const tabs = document.querySelectorAll('.ind-tab');
const imgs = document.querySelectorAll('.ind-media img');
const badge = document.getElementById('ind-badge');
const names = ['Automotive','Electronics','Aerospace','Pharma','Food','Heavy Industry'];
tabs.forEach(tab=>{
  tab.addEventListener('click', ()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const i = tab.dataset.industry;
    imgs.forEach(img=> img.classList.toggle('active', img.dataset.i === i));
    gsap.fromTo(badge, {opacity:0, y:10}, {opacity:1, y:0, duration:0.4});
    badge.textContent = names[i];
  });
});

/* Newsletter forms (footer + any inline subscribe forms) — after the browser
   validates the email field, send the visitor to 404.html */
document.querySelectorAll('.newsletter-form').forEach(form=>{
  form.addEventListener('submit', e=>{
    e.preventDefault();
    window.location.href = '404.html';
  });
});

/* Password fields — eye icon toggles between hidden and visible text */
document.querySelectorAll('.pw-toggle').forEach(btn=>{
  const input = document.getElementById(btn.dataset.target);
  if(!input) return;
  btn.addEventListener('click', ()=>{
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.setAttribute('aria-pressed', showing ? 'false' : 'true');
    btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });
});

/* Material cards — click (or tap) to flip and reveal detail text */
document.querySelectorAll('.mat-card').forEach(card=>{
  const toggle = ()=>{
    const nowFlipped = card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', nowFlipped ? 'true' : 'false');
  };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', e=>{
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
  });
});

/* FAQ accordion */
document.querySelectorAll('.faq-item').forEach(item=>{
  const a = item.querySelector('.faq-a');
  if(item.classList.contains('open')) a.style.maxHeight = a.scrollHeight + 'px';
  item.querySelector('.faq-q').addEventListener('click', ()=>{
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o=>{
      o.classList.remove('open');
      o.querySelector('.faq-a').style.maxHeight = null;
    });
    if(!isOpen){
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

/* Auto-cycling split-media slideshow (e.g. "Why We Started Here" on About) */
document.querySelectorAll('.split-media.auto-slide').forEach(slider=>{
  const imgs = Array.from(slider.querySelectorAll('img'));
  const dots = Array.from(slider.querySelectorAll('.slide-dots span'));
  if(imgs.length < 2) return;
  let idx = imgs.findIndex(img=>img.classList.contains('active'));
  if(idx < 0) idx = 0;
  setInterval(()=>{
    imgs[idx].classList.remove('active');
    if(dots[idx]) dots[idx].classList.remove('active');
    idx = (idx + 1) % imgs.length;
    imgs[idx].classList.add('active');
    if(dots[idx]) dots[idx].classList.add('active');
  }, 3200);
});
