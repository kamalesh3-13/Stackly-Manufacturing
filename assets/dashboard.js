/* Stackly Dashboard Renderer — shared by both dashboard pages
   Expects window.STACKLY_CONFIG = { title, subtitle, menus:[{id,label,icon,count}], data:{ [menuId]: [7 section objects] } }
*/
(function(){
  const cfg = window.STACKLY_CONFIG;
  if(!cfg) return;

  const ICONS = {
    overview: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l2.5 2.5L16 9"/>',
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    leaf: '<path d="M4 20c8 0 14-6 16-16-10 0-16 6-16 16z"/><path d="M4 20c2-6 6-10 12-13"/>',
    asset: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/>',
    order: '<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 9v5"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/>',
    box: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9.5" r="2.4"/><path d="M15.3 20c.3-2.5 1.9-4.5 4-5.3"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M8.5 11h7M8.5 15h7"/>',
    shield: '<path d="M12 3l7 3v6c0 5-3.4 8-7 9-3.6-1-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/>'
  };

  function svgIcon(name){
    return `<svg viewBox="0 0 24 24">${ICONS[name] || ICONS.overview}</svg>`;
  }

  /* ---------- Build sidebar ---------- */
  const sidebar = document.getElementById('sidebar');
  const navEl = document.createElement('div');
  navEl.className = 'sidebar-nav';
  cfg.menus.forEach((m, i) => {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'nav-item' + (i === 0 ? ' active' : '');
    a.dataset.menu = m.id;
    a.innerHTML = `${svgIcon(m.icon)}<span>${m.label}</span>${m.count ? `<span class="count">${m.count}</span>` : ''}`;
    a.addEventListener('click', (e) => { e.preventDefault(); setActive(m.id); });
    navEl.appendChild(a);
  });
  sidebar.querySelector('.sidebar-head').after(navEl);

  /* ---------- Mobile menu toggle ---------- */
  const scrim = document.getElementById('sidebarScrim');
  document.querySelectorAll('.menu-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{ sidebar.classList.add('open'); scrim.classList.add('show'); });
  });
  if(scrim) scrim.addEventListener('click', ()=>{ sidebar.classList.remove('open'); scrim.classList.remove('show'); });

  /* ---------- Chart helpers ---------- */
  function sparkPath(values, w, h, pad=4){
    const min = Math.min(...values), max = Math.max(...values);
    const range = (max - min) || 1;
    const step = (w - pad*2) / (values.length - 1);
    return values.map((v,i)=>{
      const x = pad + i*step;
      const y = h - pad - ((v-min)/range)*(h-pad*2);
      return (i===0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
  }

  function renderCard(sec){
    const div = document.createElement('div');
    div.className = 'card ' + sec.type;
    if(sec.span) div.style.gridColumn = 'span ' + sec.span;

    if(sec.type === 'stat'){
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        <div>
          <div class="value" data-count="${sec.value}" data-suffix="${sec.suffix||''}" data-prefix="${sec.prefix||''}" data-plus="${sec.plus?'1':''}">0${sec.suffix||''}</div>
          <div class="delta ${sec.deltaDir||''}">${sec.delta||''}</div>
        </div>
        <svg class="spark" viewBox="0 0 200 32" preserveAspectRatio="none"><path d="${sparkPath(sec.series,200,32)}"/></svg>`;
    }

    if(sec.type === 'trend'){
      const w=560,h=140;
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#E1512B';
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        <svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${accent}" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
          </linearGradient></defs>
          <path class="fill" d="${sparkPath(sec.series,w,h,6)} L${w-6},${h} L6,${h} Z"/>
          <path class="line" d="${sparkPath(sec.series,w,h,6)}"/>
        </svg>
        <div class="axis">${sec.labels.map(l=>`<span>${l}</span>`).join('')}</div>`;
    }

    if(sec.type === 'gauge'){
      const r = 44, c = 2*Math.PI*r;
      const pct = Math.min(100, Math.max(0, sec.value));
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3></div>
        <svg viewBox="0 0 104 104">
          <circle class="g-bg" cx="52" cy="52" r="${r}"/>
          <circle class="g-fill" cx="52" cy="52" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-target="${c - (pct/100)*c}"/>
          <text x="52" y="48" text-anchor="middle" class="g-num">${sec.display||pct+'%'}</text>
        </svg>
        <div class="g-sub">${sec.sub||''}</div>`;
    }

    if(sec.type === 'barlist'){
      const max = Math.max(...sec.items.map(i=>i.value));
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        ${sec.items.map(it=>`
          <div class="blist-row">
            <span class="label">${it.label}</span><span class="value">${it.display}</span>
            <div class="blist-track"><div class="blist-fill" data-target="${(it.value/max*100).toFixed(0)}"></div></div>
          </div>`).join('')}`;
    }

    if(sec.type === 'tablecard'){
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        <table class="dtable">
          <thead><tr>${sec.cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${sec.rows.map(r=>`<tr>${r.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`;
    }

    if(sec.type === 'alerts'){
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        ${sec.items.map(it=>`
          <div class="alert-row">
            <span class="alert-dot ${it.level}"></span>
            <div><div class="txt">${it.text}</div><div class="time">${it.time}</div></div>
          </div>`).join('')}`;
    }

    if(sec.type === 'progress'){
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        ${sec.items.map(it=>`
          <div class="prog-row">
            <div class="p-top"><span class="label">${it.label}</span><span class="pct">${it.value}%</span></div>
            <div class="prog-track"><div class="prog-fill" data-target="${it.value}"></div></div>
          </div>`).join('')}`;
    }

    if(sec.type === 'donut'){
      // theme-colour segments only — cycles through the accent + semantic palette
      const palette = ['var(--accent)','var(--sage)','var(--amber)','var(--accent-deep)','var(--steel, var(--ink-soft))'];
      const total = sec.items.reduce((s,i)=>s+i.value, 0) || 1;
      let acc = 0;
      const stops = sec.items.map((it,i)=>{
        const start = (acc/total)*360; acc += it.value;
        const end = (acc/total)*360;
        return `${palette[i % palette.length]} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
      }).join(', ');
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        <div class="donut-body">
          <div class="donut-ring" style="background:conic-gradient(${stops});"></div>
          <div class="donut-legend">
            ${sec.items.map((it,i)=>`
              <div class="d-row">
                <span class="swatch" style="background:${palette[i % palette.length]};"></span>
                <span class="d-label">${it.label}</span>
                <span class="d-value">${it.display || it.value}</span>
              </div>`).join('')}
          </div>
        </div>`;
    }

    if(sec.type === 'bars'){
      // true column bar chart — distinct from the trend line chart and the bar-list rows
      const max = Math.max(...sec.items.map(i=>i.value));
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        <div class="bars-chart">
          ${sec.items.map(it=>`
            <div class="bar-col">
              <span class="bar-value">${it.display}</span>
              <div class="bar-shape" data-target="${(it.value/max*100).toFixed(0)}"></div>
              <span class="bar-label">${it.label}</span>
            </div>`).join('')}
        </div>`;
    }

    if(sec.type === 'metrics'){
      // compact KPI grid — several small numbers in one card, a different rhythm than single stat cards
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        <div class="metrics-grid">
          ${sec.items.map(it=>`
            <div class="metric-cell">
              <div class="m-label">${it.label}</div>
              <div class="m-value" data-count="${it.value}" data-suffix="${it.suffix||''}" data-prefix="${it.prefix||''}">0${it.suffix||''}</div>
              <div class="m-delta ${it.deltaDir||''}">${it.delta||''}</div>
            </div>`).join('')}
        </div>`;
    }

    if(sec.type === 'rank'){
      // leaderboard — numbered rows with an inline track, alternative to the bar-list
      const max = Math.max(...sec.items.map(i=>i.value));
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        ${sec.items.map((it,i)=>`
          <div class="rank-row">
            <span class="rank-badge">${i+1}</span>
            <div class="rank-info">
              <div class="r-label">${it.label}</div>
              <div class="r-track"><div class="r-fill" data-target="${(it.value/max*100).toFixed(0)}"></div></div>
            </div>
            <span class="rank-value">${it.display}</span>
          </div>`).join('')}`;
    }

    if(sec.type === 'heatstrip'){
      // day-by-day intensity strip — a compact alternative to the trend line for at-a-glance risk
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        <div class="heat-row">
          ${sec.items.map(it=>`
            <div class="heat-col">
              <div class="heat-cell" data-target="${Math.min(100,Math.max(4,it.value))}"></div>
              <div class="heat-label">${it.label}</div>
            </div>`).join('')}
        </div>`;
    }

    if(sec.type === 'timeline'){
      div.innerHTML = `
        <div class="card-head"><h3>${sec.title}</h3><span class="meta">${sec.meta||''}</span></div>
        ${sec.items.map(it=>`
          <div class="tl-row">
            <span class="tl-dot ${it.state||'pending'}"></span>
            <div><div class="tl-time">${it.time}</div><div class="tl-label">${it.label}</div></div>
          </div>`).join('')}`;
    }

    return div;
  }

  function animateIn(root){
    // counters
    root.querySelectorAll('[data-count]').forEach(el=>{
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const showPlus = el.dataset.plus === '1' && target > 0;
      const decimals = (Math.abs(target) < 20 && target % 1 !== 0) ? 1 : 0;
      const obj = {v:0};
      gsap.to(obj, { v: target, duration:0.9, ease:'power2.out', onUpdate:()=>{
        el.textContent = prefix + (showPlus ? '+' : '') + obj.v.toFixed(decimals) + suffix;
      }, onComplete:()=>{ el.textContent = prefix + (showPlus ? '+' : '') + target + suffix; } });
    });
    // sparks / trend lines draw-in
    root.querySelectorAll('.spark path, .chart path.line').forEach(p=>{
      const len = p.getTotalLength ? p.getTotalLength() : 300;
      gsap.set(p, {strokeDasharray:len, strokeDashoffset:len});
      gsap.to(p, {strokeDashoffset:0, duration:1, ease:'power2.out', delay:0.1});
    });
    root.querySelectorAll('.chart path.fill').forEach(p=>{
      gsap.fromTo(p, {opacity:0}, {opacity:0.5, duration:0.8, delay:0.3});
    });
    // gauges
    root.querySelectorAll('.g-fill').forEach(g=>{
      gsap.to(g, { strokeDashoffset: g.dataset.target, duration:1.1, ease:'power2.out' });
    });
    // bar lists + progress
    root.querySelectorAll('.blist-fill, .prog-fill').forEach(b=>{
      gsap.to(b, { width: b.dataset.target + '%', duration:0.9, ease:'power2.out' });
    });
    // donuts
    root.querySelectorAll('.donut-ring').forEach(d=>{
      gsap.fromTo(d, {opacity:0, scale:0.7}, {opacity:1, scale:1, duration:0.7, ease:'back.out(1.6)'});
    });
    // timelines
    root.querySelectorAll('.tl-row').forEach((r,i)=>{
      gsap.fromTo(r, {opacity:0, x:-10}, {opacity:1, x:0, duration:0.5, delay:i*0.06, ease:'power2.out'});
    });
    // column bar charts
    root.querySelectorAll('.bar-shape').forEach((b,i)=>{
      gsap.to(b, { height: b.dataset.target + '%', duration:0.8, delay:i*0.05, ease:'power2.out' });
    });
    // leaderboard tracks
    root.querySelectorAll('.r-fill').forEach(b=>{
      gsap.to(b, { width: b.dataset.target + '%', duration:0.9, ease:'power2.out' });
    });
    // heat strips
    root.querySelectorAll('.heat-cell').forEach((h,i)=>{
      const t = parseFloat(h.dataset.target);
      gsap.fromTo(h, {opacity:0, scale:0.6}, {opacity: 0.15 + (t/100)*0.85, scale:1, duration:0.5, delay:i*0.05, ease:'back.out(1.6)'});
    });
  }

  /* ---------- Menu switching (single orchestrated transition) ---------- */
  const root = document.getElementById('section-root');
  const titleEl = document.getElementById('sectionTitle');
  const subEl = document.getElementById('sectionSub');
  let switching = false;

  function buildGrid(menuId){
    const grid = document.createElement('div');
    grid.className = 'section-grid';
    cfg.data[menuId].forEach(sec => grid.appendChild(renderCard(sec)));
    return grid;
  }

  function setActive(menuId, skipAnim){
    if(switching) return;
    const menu = cfg.menus.find(m=>m.id===menuId);
    if(!menu) return;
    document.querySelectorAll('.nav-item').forEach(n=> n.classList.toggle('active', n.dataset.menu===menuId));
    sidebar.classList.remove('open'); scrim.classList.remove('show');

    const newGrid = buildGrid(menuId);
    if(skipAnim){
      root.appendChild(newGrid);
      titleEl.textContent = menu.label;
      subEl.textContent = menu.sub || cfg.subtitle;
      animateIn(newGrid);
      return;
    }
    switching = true;
    const old = root.querySelector('.section-grid');
    const tl = gsap.timeline({ onComplete:()=>{ switching=false; } });
    if(old){
      tl.to(old, { opacity:0, y:-10, duration:0.25, ease:'power1.in', onComplete:()=> old.remove() });
    }
    tl.call(()=>{
      titleEl.textContent = menu.label;
      subEl.textContent = menu.sub || cfg.subtitle;
      root.appendChild(newGrid);
      gsap.set(newGrid, {opacity:0, y:10});
    });
    tl.to(newGrid, { opacity:1, y:0, duration:0.35, ease:'power2.out' });
    tl.call(()=> animateIn(newGrid));
  }

  /* ---------- Init ---------- */
  document.getElementById('pageTitle').textContent = cfg.title;
  gsap.from('.nav-item', { opacity:0, x:-12, duration:0.5, stagger:0.04, ease:'power2.out' });
  setActive(cfg.menus[0].id, true);
})();
