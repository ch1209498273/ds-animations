/* 动画10：Dijkstra 单源最短路径（教材经典数据：6顶点，v0出发 D=[0,∞,10,50,30,60]） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  /* 五张预置图一律 6 个顶点（0~5）：源点下拉是静态的，改某张图的点数会让"源点 v5"失效 */
  var N = 6;
  var TEXT_ARCS = [[0, 2, 10], [0, 4, 30], [0, 5, 100], [1, 2, 5], [2, 3, 50], [3, 5, 10], [4, 3, 20], [4, 5, 60]];
  var TEXT_POS = { 0: [90, 300], 1: [280, 105], 2: [280, 495], 4: [470, 105], 3: [470, 495], 5: [615, 300] };
  var TIE_ARCS = [[0, 1, 2], [1, 4, 4], [0, 2, 3], [2, 4, 3], [0, 3, 5], [3, 4, 1], [4, 5, 2]];
  var TIE_POS = { 0: [90, 300], 1: [280, 110], 3: [280, 300], 2: [280, 490], 4: [470, 300], 5: [615, 300] };
  var RELAX_ARCS = [[0, 1, 5], [0, 2, 9], [0, 4, 11], [1, 3, 12], [2, 3, 4], [4, 3, 1], [3, 5, 3]];
  var RELAX_POS = { 0: [110, 300], 1: [300, 130], 2: [300, 470], 4: [480, 470], 3: [480, 130], 5: [640, 300] };
  var ISLAND_ARCS = [[0, 1, 4], [1, 3, 6], [3, 5, 2], [2, 4, 5], [4, 1, 3]];
  var ISLAND_POS = { 0: [110, 160], 1: [300, 160], 3: [490, 160], 5: [630, 160], 2: [300, 430], 4: [490, 430] };

  var PRESETS = {
    text: {
      label: '① 教材图（基准，8 条弧）', arcs: TEXT_ARCS, pos: TEXT_POS,
      teach: '第 1 张·基准：教材那张 6 顶点 8 弧的有向网。这一张只看一件事——**每轮在 V−S 里挑 D 最小的点定死**，再用它松弛出弧。注意 v1 从 v0 走不到，D 恒为 ∞。'
    },
    tie: {
      label: '② 并列最短路：距离唯一、路径不唯一', arcs: TIE_ARCS, pos: TIE_POS,
      teach: '第 2 张·路径不唯一：v0 到 v4 有三条路可走——经 v1 是 2+4，经 v2 是 3+3，经 v3 是 5+1，**三条都等于 6**。' +
        '距离只有一个答案，可松弛用的是严格小于 `nd < D[w]`，后面两条并列的都会被"不更新"挡下，Path 里只留得下第一条；' +
        'v5 只能经 v4 走，于是也跟着不唯一。问"最短路径是哪条"，其实是在问一条不止一条的路。'
    },
    relax: {
      label: '③ 反复松弛：D 会变，定死之后不再变', arcs: RELAX_ARCS, pos: RELAX_POS,
      teach: '第 3 张·为什么 D 会改：盯住 v3 那一格。它先被 v1 松弛成 17，再被 v2 松弛成 13，最后被 v4 松弛成 12——**同一个点的 D 一共改了三次**。' +
        '可一旦某个点并入 S（变绿），它的 D 就再也不动：这就是 Dijkstra 的贪心假设。'
    },
    island: {
      label: '④ 源点走不到全部顶点（有向图非强连通）', arcs: ISLAND_ARCS, pos: ISLAND_POS,
      teach: '第 4 张·从源点走不到全部点会怎样：把弧的方向全忽略掉看，这张图其实是**连通**的；' +
        '可 v2 入度为 0（没有任何弧指到它），v4 只被 v2 指着，所以从 v0 出发一个都到不了。' +
        '有向图要看方向，这叫**非强连通**，不叫"图不连通"。算法**不会崩**，' +
        '只是跑完 S 填不满 6 个点、D 表里留着两个 ∞，还会提前收场。"最短路径"这个说法只对可达的点成立。'
    },
    neg: {
      label: '⑤ 错误演示：加一条负权弧 v5→v2（−60）', arcs: TEXT_ARCS.concat([[5, 2, -60]]), pos: TEXT_POS,
      teach: '第 5 张·负权反例：还是教材那张图，只多一条 v5→v2 的 **−60**。' +
        '注意回路 v2→v3→v5→v2 的权值和恰好是 0（50+10−60），**图里没有负环、真实最短路是存在的**——错只错在"先定死就不再改"这条贪心假设。'
    }
  };

  var CODE = [
    'void ShortestPath_DIJ(AMGraph G, int v0) {',
    '    n = G.vexnum;',
    '    for (v = 0; v < n; ++v) {          // 初始化',
    '        S[v] = false;  D[v] = G.arcs[v0][v];',
    '        if (D[v] < ∞) Path[v] = v0;  else Path[v] = -1;',
    '    }',
    '    S[v0] = true;  D[v0] = 0;          // 源点并入S',
    '    for (i = 1; i < n; ++i) {          // 依次求其余n-1个顶点',
    '        k = Min{ D[v] , v∈V−S };       // ① 选当前最短路径的终点k',
    '        S[k] = true;                   // ② k并入S',
    '        for (w = 0; w < n; ++w)        // ③ 松弛：以k为中转更新V−S',
    '            if (!S[w] && D[k] + G.arcs[k][w] < D[w]) {',
    '                D[w] = D[k] + G.arcs[k][w];',
    '                Path[w] = k;',
    '            }',
    '    }',
    '}'
  ];

  DSC.reg({
    id: 'dijkstra', ch: 6, name: '最短路径：Dijkstra',
    aim: '每轮定下一个**离源点最近且已确定**的点，用它松弛邻居——所以处理不了负权',
    note: '教材 6.6 图的应用（单源最短路径）',
    keywords: '最短路径 单源 迪杰斯特拉 贪心 dist path S集合 松弛 权值 不能处理负权 按长度递增',
    guide: [
      '每轮先在 V−S 中比较 D 值选最小者（消息里列出比较过程），其最短路径就此确定',
      '随后松弛该点的每条出弧：经它中转更短就更新 D 和 Path',
      '右侧表格：绿色=已确定（在 S 中），黄色=本步更新；绿边构成从源点出发的最短路径树',
      '「图」下拉 ' + Object.keys(PRESETS).length + ' 张预置图各答一个问题：①基准 ②并列最短路（距离唯一、路径不唯一）③同一个点的 D 被改三次 ④两个点从源点走不到（有向图非强连通，忽略方向时它其实连通）',
      '⑤是错误演示：加一条 −60 的负权弧，看贪心怎样把更短的路径永久错过——注意图里没有负环，真实最短路是存在的'
    ],
    inputs: [
      { key: 'start', label: '源点 v0', type: 'select', options: [['0', 'v0'], ['1', 'v1'], ['2', 'v2'], ['3', 'v3'], ['4', 'v4'], ['5', 'v5']], value: '0' },
      { key: 'graph', label: '图', type: 'select', options: [
        ['text', PRESETS.text.label], ['tie', PRESETS.tie.label], ['relax', PRESETS.relax.label],
        ['island', PRESETS.island.label], ['neg', PRESETS.neg.label]
      ], value: 'text' }
    ],
    run: function (v) {
      var v0 = +v.start;
      var pre = PRESETS[v.graph] || PRESETS.text;
      /* 弧表与坐标都换成本次运行的局部量：切了图就不能再吃上一张的数据 */
      var ARCS = pre.arcs.map(function (a) { return a.slice(); });
      var POS = pre.pos;
      var negW = v.graph === 'neg';
      /* 负权演示用的反例：v2→v3→v5→v2 这条回路权重恰好是 0（50+10-60），
         所以图里没有负环、真实最短路是良定义的——错只错在 Dijkstra 的贪心假设 */
      var arcs = ARCS;
      var adj = {};
      for (var ai = 0; ai < N; ai++) adj[ai] = [];
      arcs.forEach(function (a) { adj[a[0]].push([a[1], a[2]]); });
      var frames = [];
      var S = {}, D = [], Path = [], settleRound = {};
      for (var w = 0; w < N; w++) {
        D[w] = Infinity; Path[w] = -1;
        arcs.forEach(function (a) { if (a[0] === v0 && a[1] === w) { D[w] = a[2]; Path[w] = v0; } });
      }
      D[v0] = 0;
      function snap(o) {
        o = o || {};
        o.S = Object.keys(S).map(Number); o.D = D.slice(); o.Path = Path.slice();
        o.arcs = arcs;
        o.hlEdge = o.hlEdge || null; o.hlV = o.hlV == null ? null : o.hlV;
        o.relaxCell = o.relaxCell || null; o.v0 = v0; o.N = N; o.done = !!o.done; o.pos = POS;
        o.treeEdges = [];
        for (var t = 0; t < N; t++) if (Path[t] >= 0 && S[t]) o.treeEdges.push([Path[t], t]);
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      function dstr(arr) { return arr.map(function (x) { return x === Infinity ? '∞' : x; }).join('  '); }
      function dPanel(extra) {
        var p = {
          S: '{ v' + Object.keys(S).map(Number).sort(function (a, b) { return a - b; }).join(', v') + ' }',
          D: dstr(D), Path: dstr(Path)
        };
        if (extra) for (var k in extra) p[k] = extra[k];
        return p;
      }
      function pathStr(t) {
        var seq = [], x = t, guard = 0;
        while (x >= 0 && guard++ < N) { seq.unshift(x); x = Path[x]; }
        return 'v' + seq.join(' → v');
      }

      /* 首帧先说清这张图答什么问题（mst 那轮定的规矩），再进算法初始化。
         文案是按源点 v0 写的，源点一换就跑偏——所以源点不是 v0 时明着提醒一句 */
      F([0], pre.teach + (v0 === 0 ? '' :
        '（上面这段是按**源点 v0** 写的；现在源点是 v' + v0 + '，具体数值请以右侧 D 表为准）'),
        { 图: pre.label, 源点: 'v' + v0, 顶点数: N + ' 个', 弧数: arcs.length + ' 条' }, snap({}));
      F([2, 3, 4], '初始化：源点 v' + v0 + '。D[v] = v0 到 v 的直达弧权（无弧记 ∞），Path[v] 记录前驱。', dPanel(), snap({}));
      S[v0] = true;
      F(6, 'S[v0] = true：源点并入 S，D[v0] = 0。S 中的顶点 = 已确定最短路径的顶点。', dPanel(), snap({ hlV: v0 }));

      for (var round = 1; round < N; round++) {
        var k = -1;
        var cmp = [];
        for (var j = 0; j < N; j++) if (!S[j]) cmp.push('v' + j + '=' + (D[j] === Infinity ? '∞' : D[j]));
        for (var j2 = 0; j2 < N; j2++) if (!S[j2] && D[j2] < Infinity && (k < 0 || D[j2] < D[k])) k = j2;
        if (k < 0) {
          F(8, 'V−S 中所有顶点的 D 均为 ∞（从 v' + v0 + ' 不可达），算法结束。', dPanel(), snap({}));
          break;
        }
        F(8, '第 ' + round + ' 轮：在 V−S 中比较 D 值——' + cmp.join('，') + '，最小的是 v' + k + '（D = ' + D[k] + '）→ 其最短路径就此确定。' +
          '（贪心成立**靠边权非负**：既然 D[k] 已是 V−S 里最小的，绕别的未定点过去只会更长，不可能更短。）', dPanel({ 选中: 'v' + k, 比较: cmp.join('  ') }), snap({ hlV: k, hlEdge: Path[k] >= 0 ? [Path[k], k] : null }));
        S[k] = true;
        settleRound[k] = round;
        F(9, 'v' + k + ' 并入 S。' + (Path[k] >= 0 ? '最短路径：' + pathStr(k) + '，长度 ' + D[k] + '。' : ''), dPanel(), snap({ hlV: k }));
        adj[k].forEach(function (arc) {
          var t = arc[0], wgt = arc[1];
          if (!S[t]) {
            var nd = D[k] + wgt;
            if (nd < D[t]) {
              F([10, 11, 12, 13], '松弛：以 v' + k + ' 为中转，D[v' + t + '] = D[v' + k + '] + arcs = ' + D[k] + ' + ' + wgt + ' = ' + nd + ' < 原 ' + (D[t] === Infinity ? '∞' : D[t]) + ' → 更新 D[v' + t + '] = ' + nd + '，Path[v' + t + '] = v' + k + '。',
                dPanel({ 检查: 'v' + k + ' → v' + t }), snap({ hlEdge: [k, t], relaxCell: t }));
              D[t] = nd; Path[t] = k;
            } else {
              F(10, '松弛：以 v' + k + ' 为中转需 ' + nd + ' ≥ 原 D[v' + t + '] = ' + D[t] + '，不更新。',
                dPanel({ 检查: 'v' + k + ' → v' + t }), snap({ hlEdge: [k, t] }));
            }
          } else if (negW && D[k] + wgt < D[t]) {
            /* 负权真正的杀伤力就在这：更短的路径出现了，但终点已经并入 S，
               第 11 行的 !S[w] 条件让算法连看都不看它一眼 */
            F([11, 12], '⚠ 出事了：v' + t + ' 早在第 ' + settleRound[t] + ' 轮就被定死为 ' + D[t] + '，可现在经 v' + k + ' 走只要 ' + D[k] + ' + (' + wgt + ') = ' + (D[k] + wgt) + '。更短的路径明摆着，算法却因为 `!S[w]` 直接跳过——这条改进被永久错过。',
              dPanel({ 错过: 'v' + t + ' 本可缩到 ' + (D[k] + wgt) }), snap({ hlEdge: [k, t], relaxCell: t }));
          }
        });
      }
      var unreachable = [];
      for (var t2 = 0; t2 < N; t2++) if (D[t2] === Infinity) unreachable.push('v' + t2);
      F(15, 'Dijkstra 完成。各顶点最短路径：' + (function () {
        var out = [];
        for (var t3 = 0; t3 < N; t3++) if (t3 !== v0 && D[t3] < Infinity) out.push(pathStr(t3) + '（长 ' + D[t3] + '）');
        if (unreachable.length) out.push(unreachable.join('、') + ' 不可达');
        return out.join('；');
      })() + '。贪心 + 松弛，邻接矩阵实现下时间 O(n²)。注意：Dijkstra 的正确性**前提是边权非负**——带负权时不能保证算对（⑤那张图就是反例），要换 Bellman-Ford / SPFA 或 Floyd。',
        (function () { var p = {}; for (var t4 = 0; t4 < N; t4++) p['v' + t4 + ' 最短'] = D[t4] === Infinity ? '∞ 不可达' : (pathStr(t4) + ' ＝ ' + D[t4]); return p; })(),
        snap({ done: true }));
      if (negW) {
        /* 用 Bellman-Ford 式的逐轮松弛算出"真实答案"来对照——不是我说它错，
           是把两个答案并排摆出来 */
        var TD = [];
        for (var t6 = 0; t6 < N; t6++) TD[t6] = Infinity;
        TD[v0] = 0;
        for (var it = 0; it < N - 1; it++) arcs.forEach(function (a) { if (TD[a[0]] < Infinity && TD[a[0]] + a[2] < TD[a[1]]) TD[a[1]] = TD[a[0]] + a[2]; });
        var diffs = [];
        for (var t7 = 0; t7 < N; t7++) if (TD[t7] !== D[t7]) diffs.push('v' + t7 + '：Dijkstra ' + (D[t7] === Infinity ? '∞' : D[t7]) + '，真实 ' + (TD[t7] === Infinity ? '∞' : TD[t7]));
        F([11, 12], '✗ 负权下 Dijkstra 的答案是错的：' + (diffs.length ? diffs.join('；') : '这次碰巧全对（负权弧没影响任何结果）') +
          '。根因是它的贪心假设——"边权非负，已确定的点不可能再被后来者改进"。有负权就得换 Bellman-Ford / SPFA；Floyd 本身能处理负权（只要没有负环）。本例回路 v2→v3→v5→v2 权重恰好为 0，没有负环，真实最短路是良定义的。',
          (function () { var p = {}; for (var t8 = 0; t8 < N; t8++) p['v' + t8 + ' 算出/真实'] = (D[t8] === Infinity ? '∞' : D[t8]) + ' / ' + (TD[t8] === Infinity ? '∞' : TD[t8]); return p; })(),
          snap({ bad: true }));
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 620, r = 26;
      var POS = s.pos;                       /* 画面只认这一帧的这张图 */
      var g = '';
      g += h.txt(430, 32, 'Dijkstra：求 v' + s.v0 + ' 到其余各顶点的最短路径', { size: 19, w: 600 });
      // 有向弧（负权那一档多一条弧，所以按本帧的弧表画）
      (s.arcs || []).forEach(function (a) {
        var A = POS[a[0]], B = POS[a[1]];
        var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
        var x1 = A[0] + dx / L * r, y1 = A[1] + dy / L * r, x2 = B[0] - dx / L * r, y2 = B[1] - dy / L * r;
        var isTree = s.treeEdges.some(function (t) { return t[0] === a[0] && t[1] === a[1]; });
        var isHl = s.hlEdge && s.hlEdge[0] === a[0] && s.hlEdge[1] === a[1];
        g += h.arrow(x1, y1, x2, y2, { stroke: isTree ? C.green : (isHl ? C.amber : C.line), sw: isTree ? 4 : (isHl ? 3 : 1.6) });
        var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        if (mx > 580) { var tt = 0.14; mx = A[0] + (B[0] - A[0]) * tt; my = A[1] + (B[1] - A[1]) * tt; }  // 避开右侧状态表
        if (Math.abs(dx) < 1) { mx = A[0] + dx / 2 - 17; my = (A[1] + B[1]) / 2 - 20; }                  // 竖直边的标签放到线左侧上方
        var lx = mx - dy / L * 15, ly = my + dx / L * 15;
        g += h.circle(lx, ly, 12, { fill: isHl ? C.amberBg : (isTree ? C.greenBg : '#fff'), stroke: isHl ? C.amber : (isTree ? C.green : C.grey), sw: 1.2 });
        g += h.txt(lx, ly + 4.5, a[2], { size: 12, w: 700, fill: isTree ? C.green : C.ink });
      });
      // 顶点
      for (var k = 0; k < N; k++) {
        var P = POS[k];
        var inS = s.S.indexOf(k) >= 0;
        var fill = '#fff', stroke = C.grey, sw = 2;
        if (inS) { fill = C.greenBg; stroke = C.green; }
        if (s.hlV === k) { fill = C.amberBg; stroke = C.amber; sw = 4; }
        g += h.circle(P[0], P[1], r, { fill: fill, stroke: stroke, sw: sw });
        g += h.txt(P[0], P[1] + 7, 'v' + k, { size: 16, w: 700 });
      }
      // 右侧表
      var tx = 700, tw = 264, rh = 42;
      g += h.txt(tx + tw / 2, 70, '状态表（S / D / Path）', { size: 14, w: 600 });
      for (var t = 0; t < N; t++) {
        var y = 84 + t * rh;
        var inS = s.S.indexOf(t) >= 0;
        var rf = inS ? C.greenBg : '#fff';
        if (s.relaxCell === t) rf = C.amberBg;
        if (s.hlV === t) rf = C.amberBg;
        g += h.rect(tx, y, tw, rh - 4, { fill: rf, stroke: C.line, sw: 1, rx: 5 });
        var pchain = (function () { var seq = [], x = t, gd = 0; while (x >= 0 && gd++ < N) { seq.unshift(x); x = s.Path[x]; } return s.Path[t] === -1 && t !== s.v0 ? '—' : 'v' + seq.join('→v'); })();
        g += h.txt(tx + 30, y + 24, 'v' + t, { size: 14, w: 700, family: 'Consolas,monospace' });
        g += h.txt(tx + 92, y + 24, 'D=' + (s.D[t] === Infinity ? '∞' : s.D[t]), { size: 13.5, family: 'Consolas,monospace', fill: s.D[t] === Infinity ? C.red : C.ink, w: s.relaxCell === t ? 700 : 400 });
        g += h.txt(tx + 176, y + 24, pchain, { size: 12.5, family: 'Consolas,monospace' });
      }
      g += h.txt(tx + tw / 2, 84 + N * rh + 24, '绿 = 已确定最短路径（在 S 中）｜ 黄 = 本步更新', { size: 11.5, fill: C.muted });
      if (s.done) {
        var cov = s.S.length;
        g += h.rect(230, 560, 520, 36, { fill: C.greenBg, stroke: C.green, rx: 8 });
        g += h.txt(490, 583, cov === N ? '绿色边构成最短路径树（覆盖全部 ' + N + ' 个顶点，是一棵生成树）'
          : '绿色边构成最短路径树，但只覆盖可达的 ' + cov + ' 个顶点——有顶点到不了，它不是生成树', { size: 14, fill: C.green, w: 600 });
      }
      return h.svg(W, H, g);
    }
  });
})();
