/* 动画：外部排序——初始归并段（顺序分组 / 置换-选择）与 k 路平衡归并（408 大纲 七(十一)） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var INF = 1e9;

  var CODE = [
    '/* 阶段一：生成初始归并段（内存工作区 WA 最多 w 个记录） */',
    'while (外存未读完) {',
    '    读入至多 w 个记录到 WA;',
    '    内部排序(WA);',
    '    写出 WA → 得到一个归并段;      // 顺序分组法',
    '}',
    '/* 置换-选择：能得到更长的归并段 */',
    '工作区装满 w 个记录;  lastOut = −∞;',
    'while (工作区还有有效记录) {',
    '    min = WA 中 key ≥ lastOut 的最小者;',
    '    if (min 不存在) { 封段; lastOut = −∞;   // 开新段',
    '                      min = WA 中最小者; }',
    '    输出 min → 当前段;  lastOut = min.key;',
    '    WA[min.slot] = 再读一条;  // 外存空则置 ∞',
    '}',
    '/* 阶段二：m 个归并段做 k 路平衡归并 */',
    '归并趟数 S = ⌈log_k(m)⌉;',
    'while (段数 > 1) { 每 k 个段并成 1 个段; }'
  ];

  function orderRuns(a, w) {
    var runs = [];
    for (var i = 0; i < a.length; i += w) runs.push(a.slice(i, i + w).sort(function (x, y) { return x - y; }));
    return runs;
  }
  function replaceRuns(a, w) {
    var ws = [], p = 0, i;
    for (i = 0; i < w; i++) { ws.push(p < a.length ? a[p++] : INF); }
    var runs = [], cur = [], last = -INF, guard = 0;
    function active() { for (var j = 0; j < ws.length; j++) if (ws[j] < INF) return true; return false; }
    while (active() && guard++ < 500) {
      var best = -1, cand = [];
      for (i = 0; i < ws.length; i++) if (ws[i] < INF && ws[i] >= last) cand.push(i);
      if (!cand.length) {
        runs.push(cur); cur = []; last = -INF;
        for (i = 0; i < ws.length; i++) if (ws[i] < INF) cand.push(i);
      }
      for (i = 0; i < cand.length; i++) if (best < 0 || ws[cand[i]] < ws[best]) best = cand[i];
      last = ws[best]; cur.push(last);
      ws[best] = p < a.length ? a[p++] : INF;
    }
    if (cur.length) runs.push(cur);
    return runs;
  }
  function passes(levels, k) {
    /* lv 是"层"的列表，每层是一组归并段；写成 levels.map(...) 会让
       lv[lv.length-1] 取到单个归并段而不是整层，归并就全乱了 */
    var lv = [levels.map(function (r) { return r.slice(); })];
    while (lv[lv.length - 1].length > 1) {
      var src = lv[lv.length - 1], nxt = [];
      for (var i = 0; i < src.length; i += k) {
        var m = [];
        for (var j = i; j < Math.min(i + k, src.length); j++) m = m.concat(src[j]);
        m.sort(function (x, y) { return x - y; });
        nxt.push(m);
      }
      lv.push(nxt);
    }
    return lv;
  }

  DSC.reg({
    id: 'extSort', ch: 8, name: '外部排序：归并段与多路归并',
    aim: '内存装不下就**分批排成归并段再多路归并**——省的是外存读写次数，不是比较次数',
    note: '408 大纲 七(十一) 外部排序（归并段生成、置换-选择、⌈log_k m⌉ 趟）',
    keywords: '外部排序 归并段 多路归并 k趟 磁盘读写 I/O 置换-选择 败者树 初始归并段 内排序 缓冲区',
    guide: [
      '外存排序不能一次把全部记录装进内存，只能**先在内存里排好一小段、写回外存**，再把这些"归并段"多路归并起来',
      '**顺序分组**：每次读 w 个、内部排序、写出。段长恒为 w，段数 m = ⌈n/w⌉——但段与段之间可能本可以接得更长',
      '**置换-选择**：只输出"不小于刚输出者"的最小记录，够条件就一直往当前段里加，因此段长远大于 w，段数变少、归并趟数随之下降',
      'k 路平衡归并的**趟数 = ⌈log_k(m)⌉**：段数 m 一定时，把 k 调大能减趟数（减少外存读写次数），但 k 受内存可分的输入缓冲区个数限制'
    ],
    inputs: [
      {
        key: 'scene', label: '阶段', type: 'select', options: [
          ['gen', '阶段一：生成初始归并段'],
          ['merge', '阶段二：k 路平衡归并']
        ], value: 'gen'
      },
      {
        key: 'genMode', label: '段生成方法', type: 'select', options: [
          ['order', '顺序分组（段长恒为 w）'],
          ['replace', '置换-选择（段长可变）']
        ], value: 'replace'
      },
      { key: 'data', label: '外存记录', type: 'text', value: '49,38,65,97,76,13,27,49,55,4,62,18,93,31,7,88,45,22,70,15,36,59,81,2' },
      { key: 'mem', label: '内存工作区 w（记录数）', type: 'number', value: 6, min: 2, max: 12 },
      { key: 'k', label: '归并路数 k', type: 'number', value: 3, min: 2, max: 8 }
    ],

    run: function (v) {
      var a = h.parse(v.data);
      if (a.length < 4 || a.length > 24) throw Error('请输入 4~24 个整数（演示用）');
      var w = +v.mem, k = +v.k;
      if (!(w >= 2 && w <= 12)) throw Error('工作区大小 w 须在 2~12 之间');
      if (!(k >= 2 && k <= 8)) throw Error('归并路数 k 须在 2~8 之间');
      var frames = [], scene = v.scene, genMode = v.genMode;

      function F(line, msg, panel, snap) { frames.push({ line: line, msg: msg, panel: panel || {}, snap: snap }); }

      /* ---------- 阶段一 ---------- */
      var order = orderRuns(a, w), repl = replaceRuns(a, w);
      var avgO = a.length / order.length;   // 两种生成方法都要引用它

      if (scene === 'gen') {
        if (genMode === 'order') {
          F([1, 2], '外存上共 ' + a.length + ' 个记录，内存工作区只能装 w = ' + w + ' 个。只能"读 w 个 → 内排 → 写回"反复做。',
            { 外存记录: a.length + ' 个', 工作区: 'w = ' + w },
            { scene: 'gen', mode: 'order', a: a, pos: 0, ws: [], runs: [], w: w });
          for (var i = 0; i < order.length; i++) {
            var chunk = a.slice(i * w, i * w + w), sorted = order[i];
            F([3], '第 ' + (i + 1) + ' 轮：从外存读入 ' + chunk.length + ' 个记录 → ' + chunk.join(' ') + '，工作区被填满。',
              { 外存记录: a.length + ' 个', 工作区: chunk.length + '/' + w, 已生成段: i + ' 个' },
              { scene: 'gen', mode: 'order', a: a, pos: i * w, ws: chunk.slice(), runs: order.slice(0, i), w: w });
            F([4], '在工作区内部分排序（内存里放得下，直接用内部排序）→ ' + sorted.join(' ') + '。',
              { 外存记录: a.length + ' 个', 工作区: chunk.length + '/' + w, 已生成段: i + ' 个' },
              { scene: 'gen', mode: 'order', a: a, pos: i * w, ws: sorted.slice(), runs: order.slice(0, i), w: w, wsSorted: true });
            F([5], '写回外存，得到一个长度 ' + sorted.length + ' 的**归并段 #' + (i + 1) + '**。顺序分组的段长恒为 w，段与段之间不会衔接。',
              { 外存记录: a.length + ' 个', 工作区: '空闲', 已生成段: (i + 1) + ' 个' },
              { scene: 'gen', mode: 'order', a: a, pos: (i + 1) * w, ws: [], runs: order.slice(0, i + 1), w: w });
          }
          F([2], '★ 阶段一完成（顺序分组）：' + a.length + ' 个记录 → **' + order.length + ' 个归并段**，平均段长 ' + avgO.toFixed(1) + '。' +
            '归并趟数 ⌈log_k(m)⌉ 里的 m 就是它——切到"置换-选择"对比看。',
            { 归并段数: order.length + ' 个', 平均段长: avgO.toFixed(1), 最长段: Math.max.apply(null, order.map(function (r) { return r.length; })) + '' },
            { scene: 'gen', mode: 'order', a: a, pos: a.length, ws: [], runs: order, w: w, done: true });
          return { code: CODE, frames: frames };
        }

        /* 置换-选择 */
        F([7], '置换-选择：工作区同样只装 w = ' + w + ' 个，但**只输出"不小于刚输出者"的最小记录**，够条件就继续往当前段里加。',
          { 外存记录: a.length + ' 个', 工作区: 'w = ' + w },
          { scene: 'gen', mode: 'replace', a: a, pos: 0, ws: [], runs: [], w: w, last: -INF });
        var ws = [], p = 0, j;
        for (j = 0; j < w; j++) { ws.push(p < a.length ? a[p++] : INF); }
        F([8], '先把工作区装满：' + ws.filter(function (x) { return x < INF; }).join(' ') + '。lastOut = −∞，第一段开始。',
          { 外存记录: a.length + ' 个', 工作区: w + '/' + w, 已生成段: '0 个' },
          { scene: 'gen', mode: 'replace', a: a, pos: p, ws: ws.slice(), runs: [], w: w, last: -INF });
        var runs = [], cur = [], last = -INF, guard = 0;
        function act() { for (var q = 0; q < ws.length; q++) if (ws[q] < INF) return true; return false; }
        while (act() && guard++ < 200) {
          var cand = [], q2;
          for (j = 0; j < ws.length; j++) if (ws[j] < INF && ws[j] >= last) cand.push(j);
          var sealed = false, sealedAt = 0;
          if (!cand.length) {
            sealedAt = last;                       /* 封段原因里的 lastOut 必须是重置前的那个值 */
            runs.push(cur); cur = []; last = -INF; sealed = true;
            for (j = 0; j < ws.length; j++) if (ws[j] < INF) cand.push(j);
          }
          var best = cand[0];
          for (q2 = 1; q2 < cand.length; q2++) if (ws[cand[q2]] < ws[best]) best = cand[q2];
          var outKey = ws[best]; last = outKey; cur.push(outKey);
          var nx = p < a.length ? a[p++] : INF; ws[best] = nx;
          F([10, 11, 12, 13], (sealed ? '工作区里已经没有 ≥ lastOut=' + sealedAt + ' 的记录 → **封住第 ' + runs.length +
            ' 段**（' + runs[runs.length - 1].length + ' 个），lastOut 重置为 −∞、开第 ' + (runs.length + 1) + ' 段；' : '') +
            '取工作区中 ≥ lastOut 的最小者 ' + outKey + ' 输出到当前段，再从外存补入 ' + (nx < INF ? nx : '∞（外存已读完）') + '。',
            { 外存记录: a.length + ' 个', 工作区: ws.filter(function (x) { return x < INF; }).length + '/' + w, 当前段长: cur.length + '' },
            { scene: 'gen', mode: 'replace', a: a, pos: p, ws: ws.slice(), runs: runs.slice(), cur: cur.slice(), w: w, last: last, hot: best });
        }
        if (cur.length) { runs.push(cur); cur = []; }
        var avgR = a.length / runs.length;
        F([9], '★ 阶段一完成（置换-选择）：' + a.length + ' 个记录 → **' + runs.length + ' 个归并段**，平均段长 ' + avgR.toFixed(1) +
          '（顺序分组是 ' + avgO.toFixed(1) + '、' + order.length + ' 段）。段长更长 → 段数更少 → 归并趟数更少、外存读写次数更少。',
          { 归并段数: runs.length + ' 个（顺序分组 ' + order.length + '）', 平均段长: avgR.toFixed(1), 最长段: Math.max.apply(null, runs.map(function (r) { return r.length; })) + '' },
          { scene: 'gen', mode: 'replace', a: a, pos: p, ws: [], runs: runs, w: w, done: true });
        return { code: CODE, frames: frames };
      }

      /* ---------- 阶段二：k 路平衡归并 ---------- */
      var src = genMode === 'replace' ? repl : order;
      var lv = passes(src, k);
      var S = lv.length - 1;
      /* 拼接优先级坑：'…' + genMode === 'replace' 先算加法再比相等，
         条件永远为假，整句首句被吞掉、方法名也永远显示"顺序分组" */
      F([15], '阶段二：内存里一次放不下两个段的全部数据，只能每段开一个输入缓冲区、每次取各段队首的最小者输出。' +
        (genMode === 'replace' ? '这里用的是置换-选择得到的 ' : '这里用的是顺序分组得到的 ') + src.length + ' 个段。',
        { 初始段数: src.length + ' 个', 归并路数: 'k = ' + k, 归并趟数: '⌈log_' + k + '(' + src.length + ')⌉ = ' + S },
        { scene: 'merge', levels: [src.map(function (r) { return r.slice(); })], total: lv.length, k: k, pass: 0, srcMode: genMode });
      for (var pi = 1; pi < lv.length; pi++) {
        var before = lv[pi - 1].length, after = lv[pi].length;
        F([17], '第 ' + pi + ' 趟：把 ' + before + ' 个段每 ' + k + ' 个并成 1 个 → 剩 ' + after + ' 个段' +
          (after > 1 ? '（不足 ' + k + ' 个的尾巴直接进本趟结果）' : '') + '。' +
          (after === 1 ? ' 全部有序，结束。' : ''),
        { 初始段数: src.length + ' 个', 归并路数: 'k = ' + k, 归并趟数: '共 ' + S + ' 趟', 本趟: before + ' → ' + after + ' 段' },
        { scene: 'merge', levels: lv.slice(0, pi + 1).map(function (L) { return L.map(function (r) { return r.slice(); }); }),
          total: lv.length, k: k, pass: pi, srcMode: genMode });
      }
      var lg = Math.log(src.length) / Math.log(k);
      F([16], '★ 完成：' + src.length + ' 个归并段、k = ' + k + ' 路归并，趟数 ⌈log_' + k + '(' + src.length + ')⌉ = ⌈' + lg.toFixed(2) + '⌉ = **' + S + ' 趟**，' +
        '趟数就是外存被整体读写一遍的次数——每归并一趟，全部记录都要"读进内存 → 写回外存"一轮。' +
        '把 k 调大能减趟数，但 k 受"内存能切出几个输入缓冲区"的限制，不是越大越好。',
        { 初始段数: src.length + ' 个', 归并路数: 'k = ' + k, 归并趟数: S + ' 趟', 最终: '1 个有序文件' },
        { scene: 'merge', levels: lv.map(function (L) { return L.map(function (r) { return r.slice(); }); }),
          total: lv.length, k: k, pass: S, srcMode: genMode, done: true });
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 600, g = '';
      if (s.scene === 'gen') {
        var n = s.a.length, cw = Math.min(34, Math.floor((W - 80) / n) - 4), gap = 4;
        var x0 = (W - n * (cw + gap)) / 2;
        g += h.txt(W / 2, 30, '外部排序 · 阶段一：' + (s.mode === 'order' ? '顺序分组生成初始归并段' : '置换-选择生成初始归并段'), { size: 17, w: 600 });
        g += h.txt(x0, 62, '外存记录（共 ' + n + ' 个，灰=已读入）', { size: 12, fill: C.muted, anchor: 'start' });
        for (var i = 0; i < n; i++) {
          var read = i < s.pos;
          g += h.rect(x0 + i * (cw + gap), 72, cw, 30, { fill: read ? '#eef2f7' : '#fff', stroke: read ? C.line : C.grey, sw: 1.2, rx: 5 });
          g += h.txt(x0 + i * (cw + gap) + cw / 2, 92, String(s.a[i]), { size: 11.5, fill: read ? '#a3afbd' : C.ink });
        }
        /* 工作区 */
        var wN = s.ws.length || s.w, ww = Math.min(72, Math.floor((W - 200) / s.w) - 10);
        var wx = (W - s.w * (ww + 10)) / 2, wy = 150;
        g += h.txt(wx - 8, wy + 30, '内存工作区', { size: 12.5, fill: C.muted, w: 600, anchor: 'end' });
        for (i = 0; i < s.w; i++) {
          var val = s.ws[i], has = val != null && val < INF;
          var hot = s.mode === 'replace' && s.hot === i;
          g += h.rect(wx + i * (ww + 10), wy, ww, 44, {
            fill: hot ? C.amberBg : has ? (s.wsSorted ? C.greenBg : C.blueBg) : '#fbfcfe',
            stroke: hot ? C.amber : has ? (s.wsSorted ? C.green : C.blue) : C.line, sw: hot || has ? 2 : 1.2, rx: 7,
            dash: has ? null : '5,4'
          });
          if (has) g += h.txt(wx + i * (ww + 10) + ww / 2, wy + 28, String(val), { size: 15, w: 700 });
        }
        /* 已生成的归并段：w=2 时能长出 12 段，行距必须自适应，否则最后几行画出画布 */
        var ry = 230, shown = s.runs.concat(s.cur && s.cur.length ? [s.cur] : []);
        var pitch = Math.min(34, Math.floor(320 / Math.max(shown.length, 1)));
        var bh = Math.min(26, pitch - 3);
        g += h.txt(30, ry - 10, '外存上的归并段（' + shown.length + ' 段）' + (s.done ? '' : '　—— 正在生成'), { size: 12.5, fill: C.muted, anchor: 'start', w: 600 });
        shown.forEach(function (r, ri) {
          var isCur = !!s.cur && ri === shown.length - 1;
          var bw = Math.min(30, Math.floor((W - 220) / Math.max(r.length, 1)) - 3);
          var rowY = ry + ri * pitch;
          g += h.txt(30, rowY + bh - 8, '段 #' + (ri + 1) + (isCur ? '（当前）' : ''), { size: 11.5, fill: isCur ? C.amber : C.muted, anchor: 'start', w: 600 });
          for (var t = 0; t < r.length; t++) {
            g += h.rect(120 + t * (bw + 3), rowY, bw, bh, { fill: isCur ? C.amberBg : '#f0fdf4', stroke: isCur ? C.amber : C.green, sw: 1, rx: 4 });
            g += h.txt(120 + t * (bw + 3) + bw / 2, rowY + bh / 2 + 4, String(r[t]), { size: 10.5, fill: C.ink });
          }
          g += h.txt(120 + r.length * (bw + 3) + 8, rowY + bh - 8, 'len=' + r.length, { size: 10.5, fill: C.muted, anchor: 'start' });
        });
        if (!shown.length && s.mode === 'replace') g += h.txt(30, ry + 18, '（还没有段被封闭——置换-选择会一直往当前段里加，直到工作区里没有 ≥ lastOut 的记录）',
          { size: 11.5, fill: C.muted, anchor: 'start' });
        var note = s.done
          ? '结论：' + n + ' 个记录 → ' + s.runs.length + ' 个归并段，平均段长 ' + (n / s.runs.length).toFixed(1) +
          (s.mode === 'order' ? '（段长恒为 w=' + s.w + '）' : '（远大于 w=' + s.w + '）')
          : '工作区装满 → 处理 → 腾空，循环往复；外存读写以"块"为单位';
        g += h.txt(W / 2, H - 24, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: s.done ? 600 : 400 });
        return h.svg(W, H, g);
      }

      /* ---- 阶段二：按趟分层画 ---- */
      var lvN = s.levels.length, total = s.total || lvN;
      g += h.txt(W / 2, 30, '外部排序 · 阶段二：' + s.k + ' 路平衡归并（共 ' + (total - 1) + ' 趟，已展开 ' + (lvN - 1) + ' 趟）', { size: 17, w: 600 });
      g += h.txt(W / 2, 52, '第 0 层是初始归并段；每往下一层，相邻 ' + s.k + ' 个段并成 1 个段', { size: 12, fill: C.muted });
      var rowH = Math.min(150, 460 / lvN);
      /* 左侧留出行标签、右侧留出段数标签的站位，否则 12 段时"第 0 趟后"会压在格子上 */
      var GX = 96, GR = 70;
      var geo = s.levels.map(function (L, li) {
        var bw = Math.min(150, Math.floor((W - GX - GR) / L.length) - 12);
        return { L: L, y: 90 + li * rowH, bw: bw, sx: GX + (W - GX - GR - L.length * (bw + 12)) / 2 };
      });
      /* 层间连线：下一层第 j 个段来自本层 [j*k, j*k+k) —— 不画就看不出"谁并成了谁" */
      for (var gi = 0; gi + 1 < geo.length; gi++) {
        var fr = geo[gi], to = geo[gi + 1];
        var now = gi + 1 === s.pass;
        to.L.forEach(function (r2, j) {
          var tx = to.sx + j * (to.bw + 12) + to.bw / 2;
          for (var q = j * s.k; q < Math.min(j * s.k + s.k, fr.L.length); q++) {
            var fx = fr.sx + q * (fr.bw + 12) + fr.bw / 2;
            g += h.line(fx, fr.y + 41, tx, to.y - 1, { stroke: now ? C.blue : '#dbe3ec', sw: now ? 1.8 : 1.1 });
          }
        });
      }
      geo.forEach(function (one, li) {
        var L = one.L, y = one.y, bw = one.bw, sx = one.sx;
        g += h.txt(24, y + 26, '第 ' + li + ' 趟后', { size: 11.5, fill: li === s.pass ? C.blue : C.muted, anchor: 'start', w: li === s.pass ? 700 : 400 });
        L.forEach(function (r, ri) {
          var x = sx + ri * (bw + 12);
          g += h.rect(x, y, bw, 40, { fill: li === s.pass ? (s.done && li === lvN - 1 ? C.greenBg : C.blueBg) : '#fff', stroke: li === s.pass ? (s.done && li === lvN - 1 ? C.green : C.blue) : C.grey, sw: li === s.pass ? 2.2 : 1.3, rx: 7 });
          g += h.txt(x + bw / 2, y + 18, bw < 92 ? (li === 0 ? '#' + (ri + 1) + ' · ' + r.length + '个' : r.length + '个')
            : (li === 0 ? '段 #' + (ri + 1) + ' · len=' + r.length : 'len=' + r.length), { size: bw < 92 ? 10.5 : 11.5, w: 600, fill: C.ink });
          /* 段首预览按格子宽度截断：写死 6 个元素在窄格里会串到隔壁格子上 */
          var budget = Math.floor((bw - 8) / 6.4), head = '', shown = 0;
          for (var t = 0; t < r.length; t++) {
            var piece = (head ? ' ' : '') + r[t];
            if (head.length + piece.length > budget) break;
            head += piece; shown++;
          }
          if (shown < r.length) head += ' …';
          g += h.txt(x + bw / 2, y + 33, head, { size: 9.5, fill: C.muted, family: 'Consolas,monospace' });
        });
        g += h.txt(W - 24, y + 26, L.length + ' 段', { size: 11.5, fill: C.muted, anchor: 'end' });
      });
      g += h.txt(W / 2, H - 24, '趟数 S = ⌈log_' + s.k + '(' + s.levels[0].length + ')⌉ = ' + (total - 1) +
        '　·　k 越大趟数越少，但每个归并程序要占一个输入缓冲区，k 受内存可切分块数限制', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
