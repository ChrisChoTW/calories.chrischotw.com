// ===== 狀態 =====
let members = [{ id: 1, name: '我', cart: new Map() }];
let activeMemberId = 1;
let memberIdSeq = 2;
let visibleKeys = new Set(FIELDS.filter(f => f.default).map(f => f.key));
let currentCat = '全部';
let searchTerm = '';
let multiMode = false;

// ===== SweetAlert2 封裝：統一視覺與回傳 =====
const bkSwalTheme = {
  confirmButtonColor: '#d62300',
  cancelButtonColor: '#7a5638',
  background: '#fff8ea',
  color: '#3b1a0a'
};
async function bkAlert(text, opts = {}) {
  return Swal.fire({ ...bkSwalTheme, icon: opts.icon || 'info', title: opts.title || '', text, ...opts });
}
async function bkConfirm(text, { title = '確認', confirmText = '確定', cancelText = '取消' } = {}) {
  const r = await Swal.fire({
    ...bkSwalTheme,
    title, text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  });
  return r.isConfirmed;
}
async function bkPrompt(title, defaultValue = '') {
  const r = await Swal.fire({
    ...bkSwalTheme,
    title,
    input: 'text',
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    inputAttributes: { maxlength: '16' }
  });
  return r.isConfirmed ? (r.value || '').trim() : null;
}

function activeMember() { return members.find(m => m.id === activeMemberId); }

function sumCart(cart) {
  const t = { k:0, p:0, f:0, sf:0, tf:0, c:0, sg:0, s:0 };
  cart.forEach((v, name) => {
    const it = findItem(name);
    if (!it) return;
    for (const k in t) t[k] += (it[k] || 0) * v.qty;
  });
  return t;
}

// ===== 頂部：營養素勾選 =====
function renderFieldToggles() {
  const host = document.getElementById('fieldToggles');
  host.querySelectorAll('label').forEach(el => el.remove());
  FIELDS.forEach(f => {
    const lbl = document.createElement('label');
    lbl.innerHTML = `<input type="checkbox" data-key="${f.key}" ${visibleKeys.has(f.key) ? 'checked' : ''}>${f.label}`;
    lbl.querySelector('input').addEventListener('change', e => {
      if (e.target.checked) visibleKeys.add(f.key);
      else visibleKeys.delete(f.key);
      renderSidebar();
    });
    host.appendChild(lbl);
  });
}

// ===== 成員 tabs =====
function renderMembersBar() {
  const bar = document.getElementById('membersBar');
  bar.innerHTML = members.map(m => `
    <div class="member-tab ${m.id === activeMemberId ? 'active' : ''}" data-id="${m.id}">
      ${escapeHtml(m.name)}<span class="count">${m.cart.size}</span>
    </div>`).join('');
  bar.querySelectorAll('.member-tab').forEach(el => {
    el.onclick = () => {
      activeMemberId = parseInt(el.dataset.id);
      renderMembersBar(); renderMenu();
    };
  });
}

// ===== 分類 tabs =====
function renderCatTabs() {
  const host = document.getElementById('catTabs');
  const cats = ['全部', ...Object.keys(MENU)];
  host.innerHTML = cats.map(c =>
    `<div class="cat-tab ${c === currentCat ? 'active' : ''}" data-cat="${c}">${c}</div>`
  ).join('');
  host.querySelectorAll('.cat-tab').forEach(el => {
    el.onclick = () => { currentCat = el.dataset.cat; renderCatTabs(); renderMenu(); };
  });
}

// ===== 左側品項 =====
function renderMenu() {
  const menu = document.getElementById('menu');
  const term = searchTerm.trim().toLowerCase();
  const groups = currentCat === '全部'
    ? Object.entries(MENU)
    : [[currentCat, MENU[currentCat]]];
  const cart = activeMember().cart;
  let html = '';
  let hasResult = false;
  groups.forEach(([cat, items]) => {
    const filtered = items.filter(it => !term || it.n.toLowerCase().includes(term));
    if (!filtered.length) return;
    hasResult = true;
    html += `<div class="item-group"><h3>${cat}</h3><div class="item-list">`;
    filtered.forEach(it => {
      const sel = cart.has(it.n);
      html += `
        <div class="item ${sel ? 'selected' : ''}" data-name="${escapeAttr(it.n)}">
          <div style="flex:1; min-width:0;">
            <div class="item-name">${highlight(it.n, term)}</div>
            <div class="item-meta">${it.k} Kcal · 鈉 ${it.s} mg</div>
          </div>
          <div class="item-badge">${sel ? '✓' : '＋'}</div>
        </div>`;
    });
    html += `</div></div>`;
  });
  menu.innerHTML = hasResult ? html : `<div class="no-result">😢 找不到符合「${escapeHtml(searchTerm)}」的品項</div>`;
  menu.querySelectorAll('.item').forEach(el => {
    el.onclick = () => toggleItem(el.dataset.name);
  });
}

// ===== 右側即時預覽 =====
function renderSidebar() {
  const side = document.getElementById('sidebar');
  side.innerHTML = members.map(m => memberPreviewHtml(m)).join('') + aggPreviewHtml();
  bindSidebarEvents();
}
function memberPreviewHtml(m) {
  const totals = sumCart(m.cart);
  const nameHtml = multiMode
    ? `<input class="member-name" value="${escapeAttr(m.name)}" data-mid="${m.id}" maxlength="16">`
    : `<div class="member-name" style="cursor:default">🧑 我的點餐</div>`;
  const delBtn = (multiMode && members.length > 1)
    ? `<button class="del-member" data-mid="${m.id}">刪除</button>`
    : '';
  return `
    <div class="member-card" data-mid="${m.id}">
      <div class="member-head">
        ${nameHtml}
        ${delBtn}
      </div>
      <div class="totals-grid">${renderChips(totals)}</div>
      <div class="selected-list">${renderItemRows(m)}</div>
    </div>`;
}
function aggPreviewHtml() {
  if (!multiMode || members.length < 2) return '';
  const agg = { k:0, p:0, f:0, sf:0, tf:0, c:0, sg:0, s:0 };
  members.forEach(m => {
    const t = sumCart(m.cart);
    for (const k in agg) agg[k] += t[k];
  });
  return `
    <div class="member-card agg">
      <div class="member-head">
        <div class="member-name" style="color:var(--bk-brown)">👥 全員合計（${members.length} 人）</div>
      </div>
      <div class="totals-grid">${renderChips(agg)}</div>
    </div>`;
}
function renderChips(totals) {
  return FIELDS.filter(f => visibleKeys.has(f.key)).map(f => {
    const v = totals[f.key];
    const cls = f.emph === 1 ? 'emph' : f.emph === 2 ? 'emph2' : '';
    const shown = f.unit === 'mg' ? v.toFixed(0) : v.toFixed(1);
    return `<div class="total-chip ${cls}">
      <div class="total-chip-label">${f.label}</div>
      <div class="total-chip-value">${shown}</div>
      <div class="total-chip-unit">${f.unit}</div>
    </div>`;
  }).join('');
}
function renderItemRows(m) {
  if (!m.cart.size) return '<div class="empty">尚未選餐點</div>';
  let html = '';
  m.cart.forEach((v, name) => {
    html += `<div class="selected-item">
      <div class="name" title="${escapeAttr(name)}">${escapeHtml(name)}</div>
      <div class="qty-ctrl">
        <button data-act="dec" data-mid="${m.id}" data-name="${escapeAttr(name)}">−</button>
        <span class="qty">${v.qty}</span>
        <button data-act="inc" data-mid="${m.id}" data-name="${escapeAttr(name)}">＋</button>
      </div>
      <button class="remove-btn" data-act="rm" data-mid="${m.id}" data-name="${escapeAttr(name)}">×</button>
    </div>`;
  });
  return html;
}
function bindSidebarEvents() {
  document.querySelectorAll('.member-name').forEach(el => {
    el.addEventListener('change', e => {
      const mid = parseInt(e.target.dataset.mid);
      const m = members.find(x => x.id === mid);
      if (m) { m.name = e.target.value.trim() || '未命名'; renderMembersBar(); }
    });
  });
  document.querySelectorAll('.del-member').forEach(el => {
    el.onclick = async () => {
      const mid = parseInt(el.dataset.mid);
      if (members.length <= 1) return;
      const m = members.find(x => x.id === mid);
      const ok = await bkConfirm(`「${m.name}」的所有點餐都會一起刪除`, { title: '刪除這個成員？', confirmText: '刪除' });
      if (!ok) return;
      members = members.filter(x => x.id !== mid);
      if (activeMemberId === mid) activeMemberId = members[0].id;
      renderAll();
    };
  });
  document.querySelectorAll('[data-act]').forEach(el => {
    el.onclick = () => {
      const mid = parseInt(el.dataset.mid);
      const name = el.dataset.name;
      const m = members.find(x => x.id === mid);
      if (!m) return;
      const act = el.dataset.act;
      if (act === 'rm') m.cart.delete(name);
      else if (act === 'inc') { const it = m.cart.get(name); if (it) it.qty++; }
      else if (act === 'dec') { const it = m.cart.get(name); if (it) it.qty = Math.max(1, it.qty - 1); }
      renderAll();
    };
  });
}

function toggleItem(name) {
  const m = activeMember();
  if (m.cart.has(name)) m.cart.delete(name);
  else m.cart.set(name, { qty: 1 });
  renderAll();
}
async function addMember() {
  const fallback = `成員 ${members.length + 1}`;
  const name = await bkPrompt('新成員名字', fallback);
  if (name === null) return;
  members.push({ id: memberIdSeq++, name: name || fallback, cart: new Map() });
  activeMemberId = members[members.length - 1].id;
  renderAll();
}
async function clearAll() {
  const target = multiMode ? '所有成員' : '你';
  const ok = await bkConfirm(`${target}目前點餐的品項都會被清空`, { title: '清空點餐？', confirmText: '清空' });
  if (!ok) return;
  members.forEach(m => m.cart.clear());
  renderAll();
}

function toggleMultiMode() {
  multiMode = !multiMode;
  const btn = document.getElementById('toggleMultiBtn');
  document.querySelectorAll('.multi-only').forEach(el => {
    el.classList.toggle('hidden', !multiMode);
  });
  if (multiMode) {
    btn.textContent = '👤 關閉多人';
    btn.classList.remove('ghost');
    // 若只剩一人，加一個成員，讓介面立刻看到切換差異
    if (members.length === 1) {
      members.push({ id: memberIdSeq++, name: '成員 2', cart: new Map() });
    }
  } else {
    btn.textContent = '👥 啟用多人';
    btn.classList.add('ghost');
    // 關閉時：保留第一位的購物車，其他成員資料一律丟棄
    if (members.length > 1) {
      members = [members[0]];
      activeMemberId = members[0].id;
    }
  }
  renderAll();
}

// ============ 揭曉成績單 ============
async function openResult() {
  const anyCart = members.some(m => m.cart.size > 0);
  if (!anyCart) {
    await bkAlert('還沒點任何東西喔！先從左邊挑幾樣再來揭曉', { icon: 'info', title: '空空如也' });
    return;
  }

  const card = document.getElementById('resultCard');
  const now = new Date();
  const stamp = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  let html = `
    <div class="result-title">🔥 熱量真相揭曉 🔥</div>
    <div class="result-subtitle">${stamp} · 漢堡王熱量計算機</div>
  `;

  members.forEach(m => {
    const totals = sumCart(m.cart);
    const rk = rankOf(totals.k);
    const ctx = buildCtx(m.cart, totals, rk.label, { memberCount: members.length });
    const roast = pickRoast(ctx);
    const tag = pickRankTag(rk);
    html += resultCardHtml(m.name, totals, rk, m, false, roast, tag);
  });

  if (members.length >= 2) {
    const agg = { k:0, p:0, f:0, sf:0, tf:0, c:0, sg:0, s:0 };
    members.forEach(m => {
      const t = sumCart(m.cart);
      for (const k in agg) agg[k] += t[k];
    });
    const rk = rankOf(agg.k);
    const ctx = buildAggCtx(members, agg, rk.label);
    const roast = pickRoast(ctx);
    const tag = pickRankTag(rk);
    html += resultCardHtml(`全員合計（${members.length}人）`, agg, rk, null, true, roast, tag);
  }

  html += `<div class="watermark">— bkcalc.local —</div>`;
  card.innerHTML = html;

  document.getElementById('resultOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // 評級字母掉落動畫（錯開播放）
  requestAnimationFrame(() => {
    card.querySelectorAll('.rank-letter').forEach((el, i) => {
      el.classList.remove('grade-drop');
      void el.offsetWidth;
      setTimeout(() => el.classList.add('grade-drop'), i * 150);
    });
  });
}

function resultCardHtml(title, totals, rk, member, isAgg, roast, tag) {
  const chips = FIELDS.filter(f => visibleKeys.has(f.key)).map(f => {
    const v = totals[f.key];
    const cls = f.emph === 1 ? 'emph' : f.emph === 2 ? 'emph2' : '';
    const shown = f.unit === 'mg' ? v.toFixed(0) : v.toFixed(1);
    return `<div class="total-chip ${cls}">
      <div class="total-chip-label">${f.label}</div>
      <div class="total-chip-value">${shown}</div>
      <div class="total-chip-unit">${f.unit}</div>
    </div>`;
  }).join('');

  let itemsHtml = '';
  if (member) {
    if (!member.cart.size) itemsHtml = '<div class="empty">（沒點餐點）</div>';
    else {
      member.cart.forEach((v, name) => {
        const it = findItem(name);
        itemsHtml += `<div class="row">
          <span>${escapeHtml(name)} × ${v.qty}</span>
          <span>${it ? (it.k * v.qty).toFixed(0) : '?'} Kcal</span>
        </div>`;
      });
    }
  } else {
    members.forEach(m => {
      const t = sumCart(m.cart);
      itemsHtml += `<div class="row">
        <span>${escapeHtml(m.name)}（${m.cart.size} 品）</span>
        <span>${t.k.toFixed(0)} Kcal</span>
      </div>`;
    });
  }

  const headIcon = isAgg ? '👥' : '🧑';
  const roastHtml = roast
    ? `<div class="rank-roast">"${escapeHtml(roast)}"</div>`
    : '';

  return `
    <div class="result-card ${isAgg ? 'agg' : ''}">
      <div class="result-card-head">${headIcon} <span class="owner">${escapeHtml(title)}</span></div>
      <div class="rank-row" style="--rank-color:${rk.color}">
        <div class="rank-img" style="background:${rk.color}">
          <img src="pic/${rk.r}.png" alt="評級 ${rk.label}" onerror="this.style.display='none'">
          <div class="rank-letter">${rk.label}</div>
          <div class="rank-alt">[圖片待補]</div>
        </div>
        <div class="rank-text">
          <div class="rank-tagline">熱量評級</div>
          <div class="rank-quote">${escapeHtml(tag || '')}</div>
          <div class="rank-kcal">${totals.k.toFixed(0)} Kcal / 鈉 ${totals.s.toFixed(0)} mg</div>
        </div>
      </div>
      ${roastHtml}
      <div class="totals-grid">${chips}</div>
      <div class="result-items">${itemsHtml}</div>
    </div>`;
}

function closeResult() {
  document.getElementById('resultOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

async function screenshot() {
  const btn = document.getElementById('screenshotBtn');
  const target = document.getElementById('resultCard');
  const original = btn.textContent;
  btn.textContent = '📸 產圖中...';
  btn.disabled = true;
  try {
    const canvas = await html2canvas(target, {
      backgroundColor: '#fff8ea',
      scale: 2,
      useCORS: true,
      logging: false
    });
    const link = document.createElement('a');
    link.download = `漢堡王熱量-${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    await bkAlert(err.message, { icon: 'error', title: '截圖失敗' });
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
}

// ===== 通用 =====
function renderAll() { renderMembersBar(); renderMenu(); renderSidebar(); }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
function highlight(text, term) {
  if (!term) return escapeHtml(text);
  const idx = text.toLowerCase().indexOf(term);
  if (idx < 0) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx)) +
    '<mark style="background:#ffe082;padding:0 2px;border-radius:3px">' +
    escapeHtml(text.slice(idx, idx + term.length)) +
    '</mark>' + escapeHtml(text.slice(idx + term.length));
}

// ===== 綁定 =====
document.getElementById('search').addEventListener('input', e => { searchTerm = e.target.value; renderMenu(); });
document.getElementById('addMemberBtn').addEventListener('click', addMember);
document.getElementById('toggleMultiBtn').addEventListener('click', toggleMultiMode);
document.getElementById('clearAllBtn').addEventListener('click', clearAll);
document.getElementById('revealBtn').addEventListener('click', openResult);
document.getElementById('modalCloseBtn').addEventListener('click', closeResult);
document.getElementById('backToOrderBtn').addEventListener('click', closeResult);
document.getElementById('screenshotBtn').addEventListener('click', screenshot);
document.getElementById('resultOverlay').addEventListener('click', e => {
  if (e.target.id === 'resultOverlay') closeResult();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !document.getElementById('resultOverlay').classList.contains('hidden')) closeResult();
});

renderFieldToggles();
renderCatTabs();
renderAll();
