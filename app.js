
(function(){
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.dataset.nav === page) a.classList.add('active');
  });

  const esc = (s) => String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'","&#039;");

  const reportedCount = (card, key) => (card.variants[key]?.reported || []).length;

  function updateHome(){
    const blackTotal = CARDS.length;
    const blackReported = CARDS.reduce((n,c)=>n+(reportedCount(c,'blackQuartz')>0?1:0),0);
    const goldTotal = CARDS.length * 10;
    const goldReported = CARDS.reduce((n,c)=>n+reportedCount(c,'goldQuartz'),0);
    document.getElementById('blackReported').textContent = blackReported;
    document.getElementById('blackTotal').textContent = blackTotal;
    document.getElementById('goldReported').textContent = goldReported;
    document.getElementById('goldTotal').textContent = goldTotal;
    document.getElementById('blackProgress').style.width = `${blackTotal ? blackReported/blackTotal*100 : 0}%`;
    document.getElementById('goldProgress').style.width = `${goldTotal ? goldReported/goldTotal*100 : 0}%`;
  }

  function updateTracker(){
    const body = document.getElementById('trackerBody');
    const search = document.getElementById('searchInput');
    const category = document.getElementById('categoryFilter');
    const black = document.getElementById('blackFilter');
    const gold = document.getElementById('goldFilter');
    const count = document.getElementById('resultCount');
    const countBottom = document.getElementById('resultCountBottom');
    const empty = document.getElementById('emptyState');

    [...new Set(CARDS.map(c=>c.category))].forEach(cat=>{
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat; category.appendChild(opt);
    });

    function render(){
      const q = search.value.trim().toLowerCase();
      const rows = CARDS.filter(c=>{
        const blackN = reportedCount(c,'blackQuartz');
        const goldN = reportedCount(c,'goldQuartz');
        if(q && !(`${c.number} ${c.name}`.toLowerCase().includes(q))) return false;
        if(category.value && c.category !== category.value) return false;
        if(black.value === 'reported' && blackN === 0) return false;
        if(black.value === 'not' && blackN > 0) return false;
        if(gold.value === 'none' && goldN !== 0) return false;
        if(gold.value === 'partial' && !(goldN > 0 && goldN < 10)) return false;
        if(gold.value === 'complete' && goldN !== 10) return false;
        return true;
      });
      body.innerHTML = rows.map(c=>{
        const b = reportedCount(c,'blackQuartz') > 0;
        const g = reportedCount(c,'goldQuartz');
        return `<tr>
          <td class="card-num">${String(c.number).padStart(3,'0')}</td>
          <td class="card-name"><a href="card.html?card=${c.number}">${esc(c.name)}</a></td>
          <td class="category">${esc(c.category)}</td>
          <td><span class="status ${b?'reported':'not-reported'}">${b?'Reported':'Not reported'}</span></td>
          <td>
            <div class="gold-stack">
              <div class="gold-progress-wrap" title="${g} Gold Quartz reported">
                <span class="mini-progress"><span style="width:${g*10}%"></span></span>
                <span class="progress-value">${g}</span>
              </div>
            </div>
          </td>
          <td><a class="view-link" href="card.html?card=${c.number}">View</a></td>
        </tr>`;
      }).join('');
      count.textContent = `${rows.length} card${rows.length===1?'':'s'}`;
      countBottom.textContent = `Showing ${rows.length} card${rows.length===1?'':'s'}`;
      empty.hidden = rows.length > 0;
    }

    [search,category,black,gold].forEach(el=>el.addEventListener('input',render));
    document.getElementById('resetFilters').addEventListener('click',()=>{
      search.value=''; category.value=''; black.value=''; gold.value=''; render();
    });
    render();
  }

  function updateDetail(){
    const params = new URLSearchParams(location.search);
    const n = Number(params.get('card'));
    const c = CARDS.find(x=>x.number===n);
    const root = document.getElementById('detailRoot');
    if(!c){
      root.innerHTML = `<div class="detail-panel"><h1 class="detail-title">Card not found</h1><p class="muted">Return to the tracker and choose a card.</p></div>`;
      return;
    }
    document.title = `#${c.number} ${c.name} · ALWAYS Tracker`;

    const blackReported = reportedCount(c,'blackQuartz') > 0;
    const goldReported = new Set(c.variants.goldQuartz.reported || []);
    const front = c.images?.blackQuartz?.front;
    const back = c.images?.blackQuartz?.back;

    const serials = Array.from({length:10},(_,i)=>i+1).map(i=>`
      <div class="serial-chip ${goldReported.has(i)?'reported':''}">
        <strong>${i}/10</strong>${goldReported.has(i)?'Reported':'Not reported'}
      </div>`).join('');

    const frontBox = front
      ? `<a class="photo-box" href="${esc(front)}" target="_blank"><img src="${esc(front)}" alt="Front photograph of Black Quartz 1/1 for #${c.number} ${esc(c.name)}"></a>`
      : `<div class="photo-box">Front photo<br>not available</div>`;
    const backBox = back
      ? `<a class="photo-box" href="${esc(back)}" target="_blank"><img src="${esc(back)}" alt="Back photograph of Black Quartz 1/1 for #${c.number} ${esc(c.name)}"></a>`
      : `<div class="photo-box">Back photo<br>not available</div>`;

    root.innerHTML = `
      <div class="detail-wrap">
        <article class="detail-panel">
          <div class="detail-title-row">
            <div>
              <div class="detail-number">CARD #${String(c.number).padStart(3,'0')}</div>
              <h1 class="detail-title">${esc(c.name)}</h1>
              <span class="badge">${esc(c.category)}</span>
            </div>
          </div>

          <section class="variant-block">
            <div class="variant-head">
              <div class="black-head"><span class="variant-icon-wrap"><img class="variant-icon" src="assets/black-quartz.png" alt=""></span><h2>Black Quartz 1/1</h2></div>
              <span class="status ${blackReported?'reported':'not-reported'}">${blackReported?'Reported':'Not reported'}</span>
            </div>
            ${blackReported ? `<div class="photos">${frontBox}${backBox}</div>` : `<p class="muted">No copy is currently recorded as reported.</p>`}
          </section>

          <section class="variant-block">
            <div class="variant-head">
              <div class="gold-head"><span class="variant-icon-wrap"><img class="variant-icon" src="assets/gold-quartz.png" alt=""></span><h2>Gold Quartz /10</h2></div>
              <span class="serial-count">${goldReported.size} / 10 reported</span>
            </div>
            <div class="serial-grid">${serials}</div>
          </section>
        </article>

        <aside class="side-panel">
          <h3>Card information</h3>
          <div class="side-row"><span>Number</span><strong>#${c.number}</strong></div>
          <div class="side-row"><span>Category</span><strong>${esc(c.category)}</strong></div>
          <div class="side-row"><span>Black Quartz</span><strong>1/1</strong></div>
          <div class="side-row"><span>Gold Quartz</span><strong>1/10–10/10</strong></div>
          <div class="side-row"><span>Total tracked copies</span><strong>11</strong></div>
        </aside>
      </div>`;
  }

  if(page==='home') updateHome();
  if(page==='tracker') updateTracker();
  if(page==='detail') updateDetail();
})();
