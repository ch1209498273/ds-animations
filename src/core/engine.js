/* =============================================================
 * 《数据结构》互动课件 · 播放引擎（帧驱动）
 * 帧模型：算法逻辑层产出帧序列（纯数据快照），渲染层消费快照；
 * 单步/回退/自动播放都只是移动帧指针，保证逻辑与展示一致。
 * ============================================================= */
(function () {
  var DSC = window.DSC = window.DSC || {};
  DSC.mods = [];
  DSC.reg = function (m) { DSC.mods.push(m); };

  /* ---------- SVG 小工具 ---------- */
  var C = DSC.C = {
    ink: '#1f2933', muted: '#5f6b76',
    blue: '#2563eb', blueBg: '#dbeafe',
    green: '#16a34a', greenBg: '#dcfce7',
    amber: '#d97706', amberBg: '#fef3c7',
    red: '#dc2626', redBg: '#fee2e2',
    grey: '#94a3b8', greyBg: '#f1f5f9', line: '#cbd5e1'
  };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  DSC.h = {
    C: C, esc: esc,
    /* 逗号/空格分隔的整数串 → 数组（各章模块通用） */
    parse: function (s) {
      return String(s).split(/[,，\s]+/).filter(function (x) { return x !== ''; })
        .map(Number).filter(function (x) { return !isNaN(x); });
    },
    svg: function (w, hh, inner) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + hh + '" role="img">' + inner + '</svg>';
    },
    txt: function (x, y, s, o) {
      o = o || {};
      return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 15) + '" fill="' + (o.fill || C.ink) +
        '" text-anchor="' + (o.anchor || 'middle') + '"' + (o.w ? ' font-weight="' + o.w + '"' : '') +
        (o.family ? ' font-family="' + o.family + '"' : '') + '>' + esc(s) + '</text>';
    },
    rect: function (x, y, w, hh, o) {
      o = o || {};
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="' + (o.rx == null ? 6 : o.rx) +
        '" fill="' + (o.fill || '#fff') + '" stroke="' + (o.stroke || C.grey) + '" stroke-width="' + (o.sw == null ? 1.5 : o.sw) + '"' +
        (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
    },
    circle: function (cx, cy, r, o) {
      o = o || {};
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (o.fill || '#fff') +
        '" stroke="' + (o.stroke || C.grey) + '" stroke-width="' + (o.sw == null ? 2 : o.sw) + '"' +
        (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
    },
    line: function (x1, y1, x2, y2, o) {
      o = o || {};
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.stroke || C.grey) +
        '" stroke-width="' + (o.sw == null ? 2 : o.sw) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>';
    },
    arrow: function (x1, y1, x2, y2, o) {
      o = o || {};
      var head = o.head == null ? 8 : o.head;
      var a = Math.atan2(y2 - y1, x2 - x1);
      var bx = x2 - head * Math.cos(a), by = y2 - head * Math.sin(a);
      var s = head * 0.5;
      var pts = x2 + ',' + y2 + ' ' + (bx + s * Math.sin(a)) + ',' + (by - s * Math.cos(a)) + ' ' +
        (bx - s * Math.sin(a)) + ',' + (by + s * Math.cos(a));
      return this.line(x1, y1, bx, by, o) + '<polygon points="' + pts + '" fill="' + (o.stroke || C.grey) + '"/>';
    },
    /* 二次曲线箭头（用于绕行/弯曲的边） */
    curve: function (x1, y1, cx, cy, x2, y2, o) {
      o = o || {};
      var head = o.head == null ? 8 : o.head;
      var a = Math.atan2(y2 - cy, x2 - cx);
      var bx = x2 - head * Math.cos(a), by = y2 - head * Math.sin(a);
      var s = head * 0.5;
      var pts = x2 + ',' + y2 + ' ' + (bx + s * Math.sin(a)) + ',' + (by - s * Math.cos(a)) + ' ' +
        (bx - s * Math.sin(a)) + ',' + (by + s * Math.cos(a));
      return '<path d="M' + x1 + ',' + y1 + ' Q' + cx + ',' + cy + ' ' + bx + ',' + by + '" fill="none" stroke="' +
        (o.stroke || C.grey) + '" stroke-width="' + (o.sw == null ? 2 : o.sw) + '"' +
        (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>' +
        '<polygon points="' + pts + '" fill="' + (o.stroke || C.grey) + '"/>';
    }
  };

  /* ---------- 章节信息（对齐严蔚敏《数据结构（C语言版）》经典八章体系） ---------- */
  var CH = {
    1: { name: '第1章 绪论', note: '算法与时间复杂度分析' },
    2: { name: '第2章 线性表', note: '顺序存储与链式存储' },
    3: { name: '第3章 栈和队列', note: '操作受限的线性表及其应用' },
    4: { name: '第4章 串和数组', note: '模式匹配与矩阵压缩存储' },
    5: { name: '第5章 树和二叉树', note: '遍历、线索与哈夫曼树' },
    6: { name: '第6章 图', note: '遍历与四大应用' },
    7: { name: '第7章 查找', note: '静态/动态查找与散列表' },
    8: { name: '第8章 排序', note: '八大内部排序' }
  };

  /* ---------- 模块自动编号：按注册顺序显示 ①②③…，模块名无需手写圈号 ---------- */
  var CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺';
  var CIRC_RE = /^[①-⑳㉑-㉟㊱-㊺]+\s*/;
  function autoNumber() {
    var fixed = window.DSC_SINGLE && window.DSC_SINGLE.no;   // 单页模式：使用全站编号
    DSC.mods.forEach(function (m, i) {
      var no = fixed || (i + 1);
      m.disp = (CIRCLED[no - 1] || no + '.') + ' ' + m.name.replace(CIRC_RE, '');
    });
  }

  /* ---------- 状态 ---------- */
  var cur = null, frames = [], code = [], idx = 0, timer = null, speed = 1, playing = false;
  var zoom = 1, ZMIN = 1, ZMAX = 6, ZK = 1.25;

  /* ---------- 舞台缩放：画布按 viewBox 比例适配，再乘缩放档位，超出部分由 #stage 滚动 ---------- */
  function fitCanvas() {
    var st = $('stage'), cv = $('canvas'), svg = cv.querySelector('svg');
    if (!svg) return;
    var vb = svg.viewBox.baseVal;
    if (!vb || !vb.width || !vb.height) return;
    // 用 border box 而非 clientWidth/Height：后者会随滚动条有无变化，
    // 让"适配"算出依赖当前滚动状态、缩放来回抖动
    var r = st.getBoundingClientRect();
    var k = Math.max(0.05, Math.min((r.width - 10) / vb.width, (r.height - 10) / vb.height));
    cv.style.width = Math.round(vb.width * k * zoom) + 'px';
    cv.style.height = Math.round(vb.height * k * zoom) + 'px';
  }
  function setZoom(z) {
    zoom = Math.max(ZMIN, Math.min(ZMAX, z));
    fitCanvas();
    $('zoomLv').textContent = Math.round(zoom * 100) + '%';
  }
  function bindStageZoomPan() {
    var st = $('stage');
    $('btnZoomIn').onclick = function () { setZoom(zoom * ZK); };
    $('btnZoomOut').onclick = function () { setZoom(zoom / ZK); };
    $('btnZoomFit').onclick = function () { setZoom(1); };
    st.addEventListener('wheel', function (e) {
      if (!e.ctrlKey && !e.metaKey) return;        // 不带修饰键时留给普通滚动
      e.preventDefault();
      setZoom(e.deltaY < 0 ? zoom * ZK : zoom / ZK);
    }, { passive: false });
    var drag = null;
    st.addEventListener('pointerdown', function (e) {
      if (zoom <= 1 || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, l: st.scrollLeft, t: st.scrollTop };
      st.classList.add('panning');
      if (st.setPointerCapture) st.setPointerCapture(e.pointerId);
    });
    st.addEventListener('pointermove', function (e) {
      if (!drag) return;
      st.scrollLeft = drag.l - (e.clientX - drag.x);
      st.scrollTop = drag.t - (e.clientY - drag.y);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      st.addEventListener(ev, function () { drag = null; st.classList.remove('panning'); });
    });
    // 舞台尺寸会因窗口缩放、投影/放映切换、引导展开、滚动条出现而改变，
    // 逐一补调用容易漏，直接观察容器本身
    if (window.ResizeObserver) { new ResizeObserver(function () { fitCanvas(); }).observe($('stage')); }
    else { window.addEventListener('resize', fitCanvas); }
  }

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function parseHash() {
    if (!location.hash || location.hash.length < 2) return null;
    var o = {};
    location.hash.slice(1).split('&').forEach(function (p) {
      var kv = p.split('=');
      if (kv[0]) o[kv[0]] = decodeURIComponent(kv[1] || '');
    });
    return o;
  }

  function init() {
    autoNumber();
    if (window.DSC_SINGLE) {
      document.body.classList.add('single');
      var bk = document.createElement('a');
      bk.className = 'backlink';
      bk.href = '../index.html';
      bk.textContent = '← 全部动画';
      var hb = document.querySelector('.hbtns');
      if (hb) hb.insertBefore(bk, hb.firstChild);
    }
    var chapters = [];
    DSC.mods.forEach(function (m) { if (chapters.indexOf(m.ch) < 0) chapters.push(m.ch); });
    chapters.sort(function (a, b) { return a - b; });
    var nav = $('chapters');
    chapters.forEach(function (c) {
      var b = el('button', null, CH[c] ? CH[c].name : ('第' + c + '章'));
      b.dataset.ch = c;
      b.onclick = function () { selectChapter(c); };
      nav.appendChild(b);
    });
    bindControls();
    document.addEventListener('keydown', keys);
    window.addEventListener('hashchange', function () { applyHash(parseHash()); });
    applyHash(parseHash());
  }

  function applyHash(h) {
    var target = null;
    if (h && h.m) target = DSC.mods.filter(function (x) { return x.id === h.m; })[0];
    if (!target && window.DSC_SINGLE) target = DSC.mods[0];
    selectChapter(target ? target.ch : DSC.mods.length ? DSC.mods[0].ch : 2);
    if (target) {
      var pill = document.querySelector('#modbar .pill[data-id="' + target.id + '"]');
      selectModule(target, pill);
      target.inputs.forEach(function (sp) {
        var c = $('inp_' + sp.key);
        if (c && h[sp.key] != null) {
          if (sp.type === 'checkbox') c.checked = (h[sp.key] === '1' || h[sp.key] === 'true');
          else c.value = clean(h[sp.key]);
        }
      });
      build();
      if (h.f) { idx = Math.max(0, Math.min(frames.length - 1, +h.f || 0)); draw(); }
    }
  }

  function selectChapter(c) {
    var bs = document.querySelectorAll('#chapters button');
    for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('active', +bs[i].dataset.ch === c);
    var bar = $('modbar'); bar.innerHTML = '';
    DSC.mods.filter(function (m) { return m.ch === c; }).forEach(function (m) {
      var p = el('button', 'pill', m.disp || m.name);
      p.dataset.id = m.id;
      p.onclick = function () { selectModule(m, p); };
      bar.appendChild(p);
    });
    bar.appendChild(el('span', 'modnote', CH[c] ? CH[c].note : ''));
    var first = DSC.mods.filter(function (m) { return m.ch === c; })[0];
    if (first) selectModule(first, bar.querySelector('.pill'));
  }

  function selectModule(m, pill) {
    if (pill) {
      var ps = document.querySelectorAll('#modbar .pill');
      for (var i = 0; i < ps.length; i++) ps[i].classList.toggle('active', ps[i] === pill);
    }
    cur = m; stop();
    setZoom(1);                      // 换动画回到适配，不沿用上一个的缩放
    var box = $('inputs'); box.innerHTML = '';
    (m.inputs || []).forEach(function (sp) {
      var wrap = el('label', 'inp');
      var ctl;
      if (sp.type === 'select') {
        ctl = document.createElement('select');
        sp.options.forEach(function (op) {
          var o = document.createElement('option'); o.value = op[0]; o.textContent = op[1]; ctl.appendChild(o);
        });
        ctl.value = sp.value;
      } else if (sp.type === 'checkbox') {
        ctl = document.createElement('input'); ctl.type = 'checkbox'; ctl.checked = !!sp.value;
      } else {
        ctl = document.createElement('input'); ctl.type = sp.type || 'text';
        if (sp.min != null) ctl.min = sp.min;
        if (sp.max != null) ctl.max = sp.max;
        ctl.value = sp.value;
      }
      ctl.id = 'inp_' + sp.key;
      wrap.appendChild(ctl);
      wrap.insertBefore(document.createTextNode(sp.label), ctl);
      ctl.addEventListener('change', build);
      box.appendChild(wrap);
    });
    $('modname').textContent = m.disp || m.name;
    $('modnote2').textContent = m.note || '';
    renderGuide(false);
    build();
  }

  function values() {
    var v = {};
    cur.inputs.forEach(function (s) {
      var c = $('inp_' + s.key);
      v[s.key] = s.type === 'checkbox' ? c.checked : (s.type === 'number' ? +c.value : clean(c.value));
    });
    return v;
  }

  function build() {
    stop();
    var res;
    try { res = cur.run(values()); }
    catch (err) {
      $('msg').innerHTML = '<b>输入有误：</b>' + esc(err.message);
      $('canvas').innerHTML = ''; $('code').innerHTML = ''; $('panel').innerHTML = '';
      frames = []; idx = 0; updateProgress(); return;
    }
    frames = res.frames; code = res.code; idx = 0;
    draw();
  }

  function draw() {
    var f = frames[idx];
    if (!f) { $('canvas').innerHTML = ''; $('code').innerHTML = ''; $('panel').innerHTML = ''; $('msg').innerHTML = ''; updateProgress(); return; }
    $('canvas').innerHTML = cur.render(f.snap);
    fitCanvas();
    var lines = code.map(function (t, i) {
      var on = f.line && f.line.indexOf(i) >= 0;
      return '<span class="cl' + (on ? ' on' : '') + '">' + esc(t) + '</span>';
    });
    $('code').innerHTML = lines.join('\n');
    var p = f.panel || {}, keysArr = Object.keys(p);
    $('panel').innerHTML = keysArr.map(function (k) {
      return '<tr><td>' + esc(k) + '</td><td>' + p[k] + '</td></tr>';
    }).join('');
    $('msg').innerHTML = (f.msg || '').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    updateProgress();
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function updateProgress() {
    $('pos').textContent = frames.length ? (idx + 1) + ' / ' + frames.length : '0 / 0';
    $('pace').textContent = frames.length ? '⏱ ' + (frameHold(frames[idx]) / 1000).toFixed(1) + 's' : '';
    $('btnPrev').disabled = idx <= 0;
    $('btnNext').disabled = idx >= frames.length - 1;
    $('btnPlay').textContent = playing ? '⏸ 暂停' : '▶ 自动播放';
    var seek = $('seek');
    seek.max = Math.max(frames.length - 1, 0);
    seek.value = idx;
  }
  function step() { if (idx < frames.length - 1) { idx++; draw(); } else stop(); }
  function back() { if (idx > 0) { idx--; draw(); } }
  /* 每帧停留随解说长度轻微浮动：自动演示的用途是"看清在动"，逐帧讲解走「下一步」，
     所以只在原 900ms 基础上放慢一点并按字数加权，不做"读完整段解说"的时长 */
  function frameHold(f) {
    var n = String((f && f.msg) || '').replace(/<[^>]+>/g, '').length;
    return Math.max(1100, Math.min(2200, 850 + n * 12)) / speed;
  }
  function hold() {
    if (!playing) return;
    timer = setTimeout(function () {
      if (!playing) return;
      step();                       // 走到末帧会自行 stop()
      hold();
    }, frameHold(frames[idx]));
  }
  function play() {
    if (playing) { stop(); return; }
    if (idx >= frames.length - 1) { idx = 0; draw(); }
    playing = true;
    updateProgress();
    hold();
  }
  function stop() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
    if (frames.length) updateProgress();
  }
  function reset() { stop(); idx = 0; draw(); }

  function bindControls() {
    $('btnReset').onclick = reset;
    $('btnPrev').onclick = back;
    $('btnNext').onclick = function () { stop(); step(); };
    $('btnPlay').onclick = play;
    $('speed').onchange = function (e) {
      speed = +e.target.value || 1;
      updateProgress();                 // 刷新 ⏱ 读数
      // 换倍速只重排下一帧的等待，不回到第一帧
      if (playing) { if (timer) clearTimeout(timer); hold(); }
    };
    function onSeek(e) {
      var v = parseInt(e.target.value, 10);   // 必须先读值：stop()→updateProgress 会回写滑杆
      if (isNaN(v)) return;
      stop();
      if (!frames.length) { updateProgress(); return; }
      idx = Math.max(0, Math.min(frames.length - 1, v));
      draw();
    }
    $('seek').addEventListener('input', onSeek);
    $('seek').addEventListener('change', onSeek);
    $('btnGuide').onclick = function () {
      var g = $('guide');
      if (!g.hidden) { g.hidden = true; return; }   // 已显示 → 再点收起
      if (!(cur && cur.guide && cur.guide.length)) { toast('本动画没有使用引导'); return; }
      renderGuide(true);
    };
    $('guide').addEventListener('click', function (e) {
      if (e.target.id === 'btnGo') { $('guide').hidden = true; }
    });
    $('btnShot').onclick = exportFrame;
    $('btnLink').onclick = copyLink;
    $('btnProj').onclick = toggleProject;
    $('btnPresent').onclick = togglePresent;
    $('btnMore').onclick = function () {
      var on = document.body.classList.toggle('present-more');
      fitCanvas();                       // 展开/收起会改变控制条行数，重算画布
      toast(on ? '已展开完整操作台' : '已收起，只留翻页与缩放');
    };
    $('btnCatalog').onclick = openCatalog;
    bindStageZoomPan();
    document.addEventListener('fullscreenchange', syncPresent);
    try { if (localStorage.getItem('dsc_proj') === '1') { document.body.classList.add('proj'); $('btnProj').classList.add('on'); } } catch (e) {}
  }
  var hinted = {};
  function renderGuide(force) {
    var g = $('guide');
    if (!cur) { g.hidden = true; return; }
    var has = cur.guide && cur.guide.length;
    if (has && force) {
      var boldify = function (s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); };
      g.innerHTML = '<div class="gt">💡 使用引导 · ' + esc(cur.disp || cur.name) + '</div><ol>' +
        cur.guide.map(function (s) { return '<li>' + boldify(s) + '</li>'; }).join('') +
        '</ol><button id="btnGo">开始演示 ▶</button>';
      g.hidden = false;
    } else {
      g.hidden = true;
      // 引导展开时会挤掉舞台高度，所以默认收起，只提示一次
      if (has && !hinted[cur.id]) { hinted[cur.id] = 1; toast('本动画有使用引导 · 点 ? 查看'); }
    }
  }
  function toast(text) {
    var t = document.getElementById('toast');
    t.textContent = text; t.hidden = false;
    clearTimeout(toast._h);
    toast._h = setTimeout(function () { t.hidden = true; }, 1800);
  }
  function exportFrame() {
    var svg = document.querySelector('#stage svg');
    if (!svg) { toast('当前没有可导出的画面'); return; }
    var xml = new XMLSerializer().serializeToString(svg);
    var img = new Image();
    img.onload = function () {
      var vb = svg.viewBox.baseVal;
      var canvas = document.createElement('canvas');
      canvas.width = (vb.width || 980) * 2; canvas.height = (vb.height || 470) * 2;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(15,44,92,0.6)';
      ctx.font = 'bold 30px "Microsoft YaHei",sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('© 芦老师聊AI · 数据结构互动课件', canvas.width - 36, canvas.height - 26);
      ctx.textAlign = 'left';
      var a = document.createElement('a');
      var name = (cur ? (cur.disp || cur.name).replace(CIRC_RE, '') : '帧');
      a.download = '数据结构-' + name + '-第' + (idx + 1) + '帧.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      toast('已导出 PNG 图片');
    };
    img.onerror = function () { toast('导出失败，请改用系统截图'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  }
  function copyLink() {
    var url = cur ? (moduleURL(cur) + '#f=' + idx) : location.href;
    function ok() { toast('已复制该动画单页链接（含当前帧）'); }
    function fail() { window.prompt('全选并复制本页链接（Ctrl+C）：', url); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, fail);
    else fail();
  }
  /* ---------- 投影模式：大字号高对比，便于课堂投屏 ---------- */
  function toggleProject() {
    var on = document.body.classList.toggle('proj');
    try { localStorage.setItem('dsc_proj', on ? '1' : ''); } catch (e) {}
    $('btnProj').classList.toggle('on', on);
  }
  /* ---------- 放映模式：全屏投放，隐藏全部 chrome，只留画面与播控 ---------- */
  function togglePresent() {
    var de = document.documentElement;
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (de.requestFullscreen) {
      var p = de.requestFullscreen();
      if (p && p.catch) p.catch(function () { toast('浏览器拒绝了全屏请求'); });
    } else {
      toast('当前浏览器不支持全屏放映');
    }
  }
  function syncPresent() {
    var on = !!document.fullscreenElement;
    document.body.classList.toggle('present', on);
    if (!on) document.body.classList.remove('present-more');
    $('btnPresent').classList.toggle('on', on);
  }
  /* ---------- 总目录：按章分组全景，一键直达 / 复制深链接 ---------- */
  function moduleURL(m) {
    var dir = location.pathname.replace(/[^/]*$/, '');   // 当前目录（主站或 a/）
    return location.origin + dir + (document.body.classList.contains('single') ? '' : 'a/') + m.id + '.html';
  }
  function openCatalog() {
    if (document.getElementById('catalog')) return;
    var html = '<div class="ovhead"><b>📚 全部动画目录</b><span>' + DSC.mods.length + ' 个动画 · 点击卡片直达</span>' +
      '<button id="ovClose">✕</button></div>';
    var chapters = [];
    DSC.mods.forEach(function (m) { if (chapters.indexOf(m.ch) < 0) chapters.push(m.ch); });
    chapters.sort(function (a, b) { return a - b; });
    chapters.forEach(function (c) {
      html += '<div class="ovch">' + esc(CH[c] ? CH[c].name : ('第' + c + '章')) +
        (CH[c] ? ' <i>' + esc(CH[c].note) + '</i>' : '') + '</div><div class="ovgrid">';
      DSC.mods.filter(function (m) { return m.ch === c; }).forEach(function (m) {
        html += '<div class="ovcard" data-id="' + m.id + '"><b>' + esc(m.disp || m.name) + '</b>' +
          '<span>' + esc(m.note || '') + '</span>' +
          '<div class="ovbtns"><button data-act="go">打开 ▶</button>' +
          '<button data-act="qr">二维码</button>' +
          '<button data-act="copy">复制链接</button></div></div>';
      });
      html += '</div>';
    });
    var ov = document.createElement('div');
    ov.id = 'catalog'; ov.innerHTML = html;
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) {
      var act = e.target.dataset && e.target.dataset.act;
      var card = e.target.closest ? e.target.closest('.ovcard') : null;
      if (e.target.id === 'ovClose' || e.target === ov) { document.body.removeChild(ov); return; }
      if (!card) return;
      var m = DSC.mods.filter(function (x) { return x.id === card.dataset.id; })[0];
      if (!m) return;
      if (act === 'go') {
        document.body.removeChild(ov);
        if (window.DSC_SINGLE) { location.href = moduleURL(m); return; }
        location.hash = '#m=' + m.id;        // hashchange 监听统一处理
      } else if (act === 'qr') {
        var old = document.getElementById('qrbox');
        if (old) old.parentNode.removeChild(old);
        var qb = document.createElement('div');
        qb.id = 'qrbox';
        qb.innerHTML = '<div class="qrt"><b>' + esc(m.disp || m.name) + '</b> 手机扫码直达<button id="qrx">✕</button></div><div class="qrb"></div>';
        document.body.appendChild(qb);
        try {
          var qr = window.qrcode ? window.qrcode(0, 'M') : null;
          if (qr) {
            qr.addData(moduleURL(m));
            qr.make();
            qb.querySelector('.qrb').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
          } else {
            qb.querySelector('.qrb').textContent = '二维码组件未加载';
          }
        } catch (e) { qb.querySelector('.qrb').textContent = '链接过长，请用复制链接'; }
        qb.addEventListener('click', function (ev) { if (ev.target.id === 'qrx' || ev.target === qb) qb.parentNode.removeChild(qb); });
      } else if (act === 'copy') {
        var url = moduleURL(m);
        if (navigator.clipboard && navigator.clipboard.writeText)
          navigator.clipboard.writeText(url).then(function () { toast('已复制：' + (m.disp || m.name)); }, function () { window.prompt('全选复制：', url); });
        else window.prompt('全选复制：', url);
      }
    });
  }
  function clean(s) { return String(s).replace(/[<>]/g, ''); }
  function closeOverlays() {
    var ov = document.getElementById('catalog');
    if (ov) ov.parentNode.removeChild(ov);
    var qb = document.getElementById('qrbox');
    if (qb) qb.parentNode.removeChild(qb);
  }
  function keys(e) {
    var t = e.target.tagName;
    if (/INPUT|SELECT|TEXTAREA/.test(t)) return;
    if (e.key === 'Escape') { closeOverlays(); return; }
    if (e.key === 'ArrowRight') { stop(); step(); }
    else if (e.key === 'ArrowLeft') { stop(); back(); }
    else if (e.key === ' ') {
      if (t === 'BUTTON') return;        // 焦点在按钮上时交给按钮自身，避免一次按键触发两回
      e.preventDefault(); play();
    }
    else if (e.key === 'Home') { stop(); idx = 0; draw(); }
    else if (e.key === 'End') { stop(); if (frames.length) { idx = frames.length - 1; draw(); } }
    else if (e.key === 'c' || e.key === 'C') { openCatalog(); }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
