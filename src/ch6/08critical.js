/* 动画：关键路径——AOE 网：ve 正向推、vl 逆向推、活动 e/l 判定关键活动，高亮关键路径 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var N = 6;
  var NAMES = ['v0', 'v1', 'v2', 'v3', 'v4', 'v5'];
  var POS = { 0: [80, 300], 1: [300, 110], 2: [300, 490], 4: [510, 110], 3: [510, 490], 5: [640, 300] };
  /* 活动（弧）：a1..a8 —— 手工核对过 ve/vl 与关键路径（v0→v2→v3→v5，工期 8） */
  var ARCS = [
    { name: 'a1', from: 0, to: 1, w: 3 },
    { name: 'a2', from: 0, to: 2, w: 2 },
    { name: 'a3', from: 1, to: 3, w: 2 },
    { name: 'a4', from: 1, to: 4, w: 3 },
    { name: 'a5', from: 2, to: 3, w: 4 },
    { name: 'a6', from: 2, to: 5, w: 3 },
    { name: 'a7', from: 3, to: 5, w: 2 },
    { name: 'a8', from: 4, to: 5, w: 1 }
  ];

  var CODE = [
    '求 ve：按拓扑序  ve[j] = max{ ve[k] + w(<k,j>) }   // 事件最早发生时间',
    '求 vl：按逆拓扑序 vl[k] = min{ vl[j] − w(<k,j>) }   // 事件最迟发生时间',
    '对每条活动 <k, j>（权 w）：',
    '    e(a)  = ve[k];                 // 活动最早开始',
    '    l(a)  = vl[j] − w;             // 活动最迟开始',
    '    若 l(a) == e(a)  →  a 是关键活动   // 没有任何富余时间',
    '关键路径 = 全部关键活动连成的源点→汇点路径'
  ];

  DSC.reg({
    id: 'critical', ch: 6, name: '关键路径：AOE 网与关键活动',
    aim: '关键路径就是**最早开始 = 最晚开始**的那条路，路上的活动一天都不能推迟',
    note: '教材 6.6 图的应用（AOE 网、关键路径、关键活动）',
    guide: [
      'AOE 网：顶点=事件（状态），带权弧=活动（持续时间为权）；源点 v0 开始、汇点 v5 结束',
      '两步计算：先按拓扑序求各事件最早时间 ve，再按逆拓扑序求最迟时间 vl',
      '活动 <k,j> 的最早开始 e=ve[k]、最迟开始 l=vl[j]−w；l==e 即关键活动——延误它整个工程就延期',
      '关键路径 v0→v2→v3→v5，长度即最短工期'
    ],
    inputs: [],
    run: function () {
      var frames = [];
      var ve = [], vl = [];
      for (var q = 0; q < N; q++) { ve.push(null); vl.push(null); }
      function snap(o) {
        o = o || {};
        o.ve = ve.map(function (x) { return x == null ? null : x; }); o.vl = vl.map(function (x) { return x == null ? null : x; });
        o.act = ARCS.map(function (a) {
          var e = ve[a.from], l = vl[a.to] - a.w;
          return { name: a.name, from: a.from, to: a.to, w: a.w, e: e, l: l, slack: l - e, crit: l === e };
        });
        o.cur = o.cur == null ? null : o.cur; o.phase = o.phase || 'init'; o.done = !!o.done;
        o.critPath = ['0', '2', '3', '5'];
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      function pOf(extra) {
        var p = {};
        for (var j = 0; j < N; j++) p['ve[' + NAMES[j] + ']'] = ve[j] == null ? '—' : String(ve[j]);
        for (var j2 = 0; j2 < N; j2++) p['vl[' + NAMES[j2] + ']'] = vl[j2] == null ? '—' : String(vl[j2]);
        if (extra) for (var k in extra) p[k] = extra[k];
        return p;
      }

      F([0], 'AOE 网：源点 v0（工程开始）、汇点 v5（工程结束）；弧上的权 = 该活动所需天数。求关键路径前，先求每个事件的最早/最迟发生时间。',
        pOf({ 阶段: '初始化' }), snap({ phase: 'init' }));

      /* ve：按拓扑序 v0,v1,v2,v3,v4,v5 */
      var topo = [0, 1, 2, 3, 4, 5];
      F(0, '第一步（正向）：按【拓扑序】v0→v1→v2→v3→v4→v5 求 ve（事件最早发生时间）：ve[j] = max{ ve[k] + w(<k,j>) }。源点 ve[v0] = 0。',
        pOf({ 公式: 've[j] = max{ ve[k]+w }' }), snap({ phase: 've', cur: 0 }));
      ve[0] = 0;
      for (var t = 1; t < N; t++) {
        var ins = ARCS.filter(function (a) { return a.to === t; });
        var best = 0, det = [];
        ins.forEach(function (a) { var cand = ve[a.from] + a.w; det.push('ve[' + NAMES[a.from] + ']+' + a.w + '=' + cand); if (cand > best) best = cand; });
        ve[t] = best;
        F(0, 've[' + NAMES[t] + '] = max{ ' + det.join(', ') + ' } = ' + best + '。', pOf({ 正在计算: 've[' + NAMES[t] + ']' }), snap({ phase: 've', cur: t }));
      }
      F(0, 've 全部求出：汇点 v5 的 ve = ' + ve[5] + ' —— 这就是整个工程的【最短工期】。', pOf({ 工期: String(ve[5]) }), snap({ phase: 've', done: true }));

      /* vl：按逆拓扑序 */
      vl[N - 1] = ve[N - 1];
      F(1, '第二步（逆向）：按【逆拓扑序】v5→v4→…→v0 求 vl（事件最迟发生时间，不许拖延影响工期）：vl[k] = min{ vl[j] − w(<k,j>) }。汇点 vl[v5] = ve[v5] = ' + ve[5] + '。',
        pOf({ 公式: 'vl[k] = min{ vl[j]−w }' }), snap({ phase: 'vl', cur: 5 }));
      for (var t2 = N - 2; t2 >= 0; t2--) {
        var outs = ARCS.filter(function (a) { return a.from === t2; });
        var minv = Infinity, det2 = [];
        outs.forEach(function (a) { var cand = vl[a.to] - a.w; det2.push('vl[' + NAMES[a.to] + ']−' + a.w + '=' + cand); if (cand < minv) minv = cand; });
        vl[t2] = minv;
        F(1, 'vl[' + NAMES[t2] + '] = min{ ' + det2.join(', ') + ' } = ' + minv + '。', pOf({ 正在计算: 'vl[' + NAMES[t2] + ']' }), snap({ phase: 'vl', cur: t2 }));
      }

      /* 活动表 */
      var act = [];
      ARCS.forEach(function (a, k) {
        var e = ve[a.from], l = vl[a.to] - a.w;
        act.push({ name: a.name, from: a.from, to: a.to, w: a.w, e: e, l: l, slack: l - e, crit: l === e });
      });
      F([2, 3, 4, 5, 6], '第三步：对每条活动 a（<k,j>，权 w）：e(a) = ve[k]（最早开始），l(a) = vl[j] − w（最迟开始）。l − e = 0 的活动【没有一天富余】→ 关键活动。看右侧活动表：a2、a5、a7 打 ✓。',
        pOf({ 关键活动: 'a2、a5、a7' }), snap({ phase: 'act', done: true }));

      F([6], '完成！关键路径：v0 → v2 → v3 → v5（红色粗边），长度 2+4+2 = 8 = 工期。关键路径可能不止一条（本例一条），但【关键活动的任何延误都会推迟整个工程】——想缩短工期，必须压缩关键活动。',
        { 关键路径: 'v0→v2→v3→v5', 工期: String(ve[5]), 关键活动: 'a2、a5、a7' }, snap({ phase: 'done', done: true }));

      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 560, r = 25;
      var g = '';
      g += h.txt(430, 34, s.phase === 've' ? '第一步：正向求 ve（事件最早发生时间）'
        : s.phase === 'vl' ? '第二步：逆向求 vl（事件最迟发生时间）'
        : s.phase === 'act' || s.done ? '第三步：判定关键活动（l − e = 0）' : 'AOE 网与关键路径', { size: 19, w: 600 });
      var critArcs = { a2: 1, a5: 1, a7: 1 };
      // 弧（活动）
      ARCS.forEach(function (a) {
        var A = POS[a.from], B = POS[a.to];
        var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
        var x1 = A[0] + dx / L * r, y1 = A[1] + dy / L * r, x2 = B[0] - dx / L * r, y2 = B[1] - dy / L * r;
        var crit = critArcs[a.name] && s.phase !== 'init' && s.phase !== 've';
        var show = s.phase !== 'init';
        g += h.arrow(x1, y1, x2, y2, { stroke: crit ? C.red : C.grey, sw: crit ? 4 : 1.8 });
        var mx = (A[0] + B[0]) / 2 - dy / L * 18, my = (A[1] + B[1]) / 2 + dx / L * 18;
        if (show) {
          g += h.circle(mx, my, 13, { fill: crit ? '#fee2e2' : '#fff', stroke: crit ? C.red : C.grey, sw: 1.2 });
          g += h.txt(mx, my + 4.5, a.name + ':' + a.w, { size: 10.5, w: 700, fill: crit ? C.red : C.ink });
        }
      });
      // 顶点（事件）+ ve/vl
      for (var k = 0; k < N; k++) {
        var P = POS[k];
        var isSrc = k === 0, isSink = k === 5;
        var fill = '#fff', stroke = C.grey, sw = 2;
        if (s.cur === k && (s.phase === 've' || s.phase === 'vl')) { fill = C.amberBg; stroke = C.amber; sw = 4; }
        if (s.phase === 'act' || s.done) {
          var onCrit = (s.phase === 'act' || s.done) && (k === 0 || k === 2 || k === 3 || k === 5);
          if (onCrit) { fill = '#fee2e2'; stroke = C.red; sw = 3.5; }
        }
        g += h.circle(P[0], P[1], r, { fill: fill, stroke: stroke, sw: sw });
        g += h.txt(P[0], P[1] + 7, NAMES[k], { size: 16, w: 700 });
        if (s.phase === 've' || s.phase === 'vl' || s.phase === 'act' || s.done) {
          g += h.rect(P[0] - 32, P[1] - r - 30, 64, 24, { fill: '#fff', stroke: C.line, rx: 5 });
          if (s.ve[k] != null) g += h.txt(P[0], P[1] - r - 22, 've ' + s.ve[k], { size: 11.5, fill: C.blue, w: 600, family: 'Consolas,monospace' });
          g += h.txt(P[0], P[1] - r - 10, 'vl ' + s.vl[k], { size: 11.5, fill: C.green, w: 600, family: 'Consolas,monospace' });
        }
        if (isSrc) g += h.txt(P[0], P[1] + 44, '源点', { size: 12, fill: C.blue, w: 600 });
        if (isSink) g += h.txt(P[0], P[1] + 44, '汇点', { size: 12, fill: C.blue, w: 600 });
      }
      // 活动表（右侧）
      var tx = 700, rh = 30;
      g += h.txt(tx + 120, 92, '活动表（e / l / 富余）', { size: 14, w: 600 });
      g += h.txt(tx + 34, 116, '活动', { size: 11.5, fill: C.muted });
      g += h.txt(tx + 104, 116, 'w', { size: 11.5, fill: C.muted });
      g += h.txt(tx + 148, 116, 'e', { size: 11.5, fill: C.muted });
      g += h.txt(tx + 192, 116, 'l', { size: 11.5, fill: C.muted });
      g += h.txt(tx + 232, 116, 'l−e', { size: 11.5, fill: C.muted });
      s.act.forEach(function (a, k2) {
        var y = 126 + k2 * rh;
        var bg = a.crit ? C.greenBg : '#fff';
        g += h.rect(tx, y, 262, rh - 4, { fill: bg, stroke: C.line, sw: 1, rx: 4 });
        g += h.txt(tx + 34, y + 19, a.name + '（' + NAMES[a.from] + '→' + NAMES[a.to] + '）', { size: 11.5, family: 'Consolas,monospace' });
        g += h.txt(tx + 108, y + 19, String(a.w), { size: 12 });
        g += h.txt(tx + 148, y + 19, String(a.e), { size: 12 });
        g += h.txt(tx + 192, y + 19, String(a.l), { size: 12 });
        g += h.txt(tx + 236, y + 19, String(a.slack), { size: 12, w: a.crit ? 700 : 400, fill: a.crit ? C.green : C.muted });
      });
      g += h.txt(tx + 120, 126 + 8 * rh + 12, '✓/绿 = 关键活动（l−e = 0）', { size: 11.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
