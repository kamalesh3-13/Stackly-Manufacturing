/* Stackly Dashboard FX — shared by both dashboard pages
   3D tilt + spotlight-cursor tracking on cards, magnetic pull on buttons.
   Purely additive: never touches dashboard.js rendering logic. */
(function(){
  function initCardFX(root){
    root.querySelectorAll('.card').forEach(card=>{
      if(card.dataset.fxInit) return;
      card.dataset.fxInit = '1';
      card.addEventListener('mousemove', e=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px*100) + '%');
        card.style.setProperty('--my', (py*100) + '%');
        const rx = (0.5 - py) * 7;
        const ry = (px - 0.5) * 7;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', ()=>{
        card.style.transform = '';
      });
    });
  }

  const sectionRoot = document.getElementById('section-root');
  if(sectionRoot){
    initCardFX(sectionRoot);
    new MutationObserver(()=> initCardFX(sectionRoot)).observe(sectionRoot, {childList:true, subtree:true});
  }

  /* Magnetic pull on small interactive controls */
  document.querySelectorAll('.icon-btn, .range-chip, .menu-toggle').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      btn.style.transform = `translate(${(x*0.22).toFixed(1)}px, ${(y*0.22).toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform = ''; });
  });
})();
