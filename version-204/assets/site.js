(function(){
  const qs = (s, p=document)=>p.querySelector(s);
  const qsa = (s, p=document)=>Array.from(p.querySelectorAll(s));

  function basePath(){
    return document.body?.dataset?.base || '';
  }

  function initNav(){
    const btn = qs('[data-mobile-toggle]');
    const links = qs('[data-nav-links]');
    if(btn && links){
      btn.addEventListener('click', () => links.classList.toggle('open'));
    }
    const search = qs('[data-header-search]');
    if(search){
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if(q && !search.value) search.value = q;
      search.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter'){
          const dest = `${basePath()}library.html?q=${encodeURIComponent(search.value.trim())}`;
          location.href = dest;
        }
      });
    }
  }

  function initHero(){
    const slider = qs('[data-hero-slider]');
    if(!slider) return;
    const slides = qsa('.hero-slide', slider);
    const dots = qsa('[data-hero-dot]');
    let idx = 0, timer;
    const show = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((el,i)=>el.classList.toggle('active', i===idx));
      dots.forEach((el,i)=>el.classList.toggle('active', i===idx));
    };
    const start = () => { timer = setInterval(()=>show(idx+1), 5000); };
    const stop = () => { if(timer) clearInterval(timer); };
    dots.forEach((el,i)=>el.addEventListener('click', ()=>{ stop(); show(i); start(); }));
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0); start();
  }

  function filterCards(scope){
    const input = qs('[data-search-input]', scope);
    const region = qs('[data-region-filter]', scope);
    const type = qs('[data-type-filter]', scope);
    const year = qs('[data-year-filter]', scope);
    const cards = qsa('[data-card]', scope);
    const counter = qs('[data-result-count]', scope);
    const pager = qs('[data-pagination]', scope);
    const pageSize = parseInt(scope.getAttribute('data-page-size') || '60', 10);
    let current = 1;

    const params = new URLSearchParams(location.search);
    if(input && !input.value && params.get('q')) input.value = params.get('q');

    const apply = () => {
      const q = (input?.value || '').trim().toLowerCase();
      const rg = (region?.value || '').trim().toLowerCase();
      const tp = (type?.value || '').trim().toLowerCase();
      const yr = (year?.value || '').trim().toLowerCase();
      const filtered = cards.filter(card => {
        const hay = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.tags, card.dataset.bucket, card.dataset.type].join(' ').toLowerCase();
        const okq = !q || hay.includes(q);
        const okr = !rg || card.dataset.region.toLowerCase().includes(rg);
        const okt = !tp || card.dataset.type.toLowerCase().includes(tp);
        const oky = !yr || card.dataset.year.toLowerCase().includes(yr);
        return okq && okr && okt && oky;
      });
      const total = filtered.length;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      current = Math.min(current, pages);
      cards.forEach(c=>c.style.display='none');
      filtered.slice((current-1)*pageSize, current*pageSize).forEach(c=>c.style.display='block');
      if(counter) counter.textContent = `共 ${total} 部影片 · 第 ${current}/${pages} 页`;
      if(pager){
        pager.innerHTML = '';
        const mk = (label, page, cls='') => {
          const b = document.createElement('button');
          b.textContent = label;
          if(cls) b.className = cls;
          b.disabled = page<1 || page>pages;
          b.addEventListener('click', ()=>{ current = page; apply(); window.scrollTo({top:0, behavior:'smooth'}); });
          pager.appendChild(b);
        };
        mk('上一页', current-1);
        const start = Math.max(1, current-2), end = Math.min(pages, current+2);
        for(let p=start;p<=end;p++) mk(String(p), p, p===current ? 'active' : '');
        mk('下一页', current+1);
      }
      if(total === 0 && counter) counter.textContent = '未找到匹配影片';
    };
    [input, region, type, year].forEach(el => el && el.addEventListener('input', ()=>{ current = 1; apply(); }));
    apply();
  }

  function initLibrary(){
    qsa('[data-filter-scope]').forEach(filterCards);
  }

  function initPlayer(){
    const player = qs('[data-player]');
    if(!player) return;
    const video = qs('video', player);
    const overlay = qs('[data-play-overlay]', player);
    const btn = qs('[data-play-button]', player);
    if(!video || !overlay || !btn) return;
    const m3u8 = player.getAttribute('data-hls');
    const mp4 = player.getAttribute('data-mp4');
    const setupSource = () => {
      if (m3u8 && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
      } else if (mp4) {
        video.src = mp4;
      } else if (m3u8) {
        video.src = m3u8;
      }
    };
    setupSource();
    const start = () => {
      overlay.classList.add('hidden');
      video.play().catch(()=>{});
    };
    btn.addEventListener('click', start);
    video.addEventListener('play', ()=>overlay.classList.add('hidden'));
    video.addEventListener('pause', ()=>overlay.classList.remove('hidden'));
    video.addEventListener('ended', ()=>overlay.classList.remove('hidden'));
  }

  document.addEventListener('DOMContentLoaded', ()=>{ initNav(); initHero(); initLibrary(); initPlayer(); });
})();
