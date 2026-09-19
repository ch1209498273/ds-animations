/* 动画：Floyd 算法——逐个中转点松弛 D 矩阵，求任意两顶点间最短路径（附路径重建） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var N = 4;
  var ARCS = [[0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 0, 4], [0, 3, 7]];
  var POS = { 0: [90, 290], 1: [330, 105], 2: [330, 480], 3: [580, 290] };

  var CODE = [
    'void ShortestPath_Floyd(AMGraph G) {',
    '    for (i = 0; i < n; ++i)          // 初始化：D^(−1)[i][j] = 弧权',
    '        for (j = 0; j < n; ++j) {',
    '            D[i][j] = G.arcs[i][j];',
    '            if (i != j && D[i][j] < ∞) P[i][j] = i;  // 直接到达',
    '            else P[i][j] = -1;',
    '        }',
    '    for (k = 0; k < n; ++k)          // 逐个顶点作为中转',
    '        for (i = 0; i < n; ++i)',
    '            for (j = 0; j < n; ++j)',
    '                if (D[i][k] + D[k][j] < D[i][j]) {',
    '                    D[i][j] = D[i][k] + D[k][j];     // 经k更短→更新',
    '                    P[i][j] = P[k][j];               // 记录中转',
    '                }',
    '}'
  ];

  DSC.reg({
    id: 'floyd', ch: 6, name: '⑭ Floyd：各顶点间最短路径',
    note: '教材 6.6 图的应用（所有顶点间最短路径）',
    guide: [
      '每一轮只允许一个新中转点 v_k，用它检查全部 i→j：经 k 更短就更新 D[i][j]',
      '核心一行：D[i][j] = min(D[i][j], D[i][k] + D[k][j])',
      'n 轮结束后，D 矩阵就是任意两顶点间的最短路径长度'
    ],
    inputs: [],
    run: function () {
      var frames = [];
      var INF = Infinity;
      var D = [], P = [];
      for (var i = 0; i < N; i++) { D.push([]); P.push([]); for (var j = 0; j < N; j++) { D[i].push(i === j ? 0 : INF); P[i].push(-1); } }
      ARCS.forEach(function (a) { D[a[0]][a[1]] = a[2]; if (a[0] !== a[1]) P[a[0]][a[1]] = a[0]; });
      function snap(o) {
        o = o || {};
        o.D = D.map(function (r) { return r.map(function (x) { return x; }); });
        o.P = P.map(function (r) { return r.slice(); });
        o.k = o.k == null ? -1 : o.k; o.cell = o.cell || null; o.N = N; o.INF = true;
        o.route = o.route || null;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      function dstr(arr) { return arr.map(function (x) { return x === INF ? '∞' : x; }).join('  '); }
      function routeStr(i, j) {
        /* P[i][j] 记录 j 的前驱：从 j 沿前驱回走到 i */
        if (i === j) return String(i);
        var seq = [j], x = j, guard = 0;
        while (x !== i && guard++ < 2 * N + 2) {
          x = P[i][x];
          if (x < 0 || x === undefined) return '（路径缺失）';
          seq.unshift(x);
        }
        return seq.join('→');
      }

      F([1, 2, 3, 4, 5, 6], '初始化 D 矩阵：D[i][j] = i→j 的直达弧权（无弧记 ∞），对角线为 0。目标：n 轮后 D[i][j] 即 i 到 j 的最短路径长度。',
        { D: dstr(D[0]) + ' / ' + dstr(D[1]), 中转: '（尚未开始）' }, snap({}));

      for (var k = 0; k < N; k++) {
        F(2, '第 ' + (k + 1) + ' 轮：允许经 v' + k + ' 中转。逐对检查 D[i][j] 与 D[i][' + k + '] + D[' + k + '][j]——经中转更短就更新，并在 P 中记录。',
          { 本轮中转: 'v' + k, D: dstr(D[0]) + ' / ' + dstr(D[1]) + ' / …' }, snap({ k: k }));
        for (var i2 = 0; i2 < N; i2++) {
          for (var j2 = 0; j2 < N; j2++) {
            if (i2 === j2) continue;
            if (D[i2][k] === INF || D[k][j2] === INF) continue;
            var nd = D[i2][k] + D[k][j2];
            if (nd < D[i2][j2]) {
              var old = D[i2][j2];
              D[i2][j2] = nd; P[i2][j2] = P[k][j2];
              F([11, 12, 13], 'D[v' + i2 + '][v' + j2 + ']：经 v' + k + ' 中转 ' + D[i2][k] + '+' + D[k][j2] + ' = ' + nd + ' < 原 ' + (old === INF ? '∞' : old) + ' → 更新为 ' + nd + '，路径 ' + routeStr(i2, j2) + '。',
                { 本轮中转: 'v' + k, 更新: 'D[v' + i2 + '][v' + j2 + ']: ' + (old === INF ? '∞' : old) + ' → ' + nd, 路径: routeStr(i2, j2) },
                snap({ k: k, cell: [i2, j2] }));
            }
          }
        }
      }
      F(14, 'Floyd 完成！D 矩阵即任意两顶点间的最短路径长度。例如 v0→v3 = ' + D[0][3] + '，路径 ' + routeStr(0, 3) + '。三重循环，时间复杂度 O(n³)；适合稠密图求全对最短路径（对比：反复调用 Dijkstra）。',
        (function () { var p = {}; for (var a = 0; a < N; a++) p['v' + a + ' 行'] = dstr(D[a]); return p; })(),
        snap({ done: true }));
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 560, r = 24;
      var g = '';
      g += h.txt(340, 34, s.k < 0 ? 'Floyd：初始化 D 矩阵（直达弧权）' : 'Floyd：第 ' + (s.k + 1) + ' 轮——允许经 v' + s.k + ' 中转', { size: 19, w: 600 });
      // 有向弧
      ARCS.forEach(function (a) {
        var A = POS[a[0]], B = POS[a[1]];
        var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
        var x1 = A[0] + dx / L * r, y1 = A[1] + dy / L * r, x2 = B[0] - dx / L * r, y2 = B[1] - dy / L * r;
        g += h.arrow(x1, y1, x2, y2, { stroke: C.grey, sw: 1.8 });
        var lx = (A[0] + B[0]) / 2 - dy / L * 15, ly = (A[1] + B[1]) / 2 + dx / L * 15;
        g += h.circle(lx, ly, 12, { fill: '#fff', stroke: C.grey, sw: 1.2 });
        g += h.txt(lx, ly + 4.5, a[2], { size: 12, w: 700 });
      });
      // 顶点
      for (var k = 0; k < N; k++) {
        var P2 = POS[k];
        var isK = s.k === k;
        g += h.circle(P2[0], P2[1], r, { fill: isK ? C.amberBg : C.blueBg, stroke: isK ? C.amber : C.blue, sw: isK ? 4 : 2 });
        g += h.txt(P2[0], P2[1] + 7, 'v' + k, { size: 16, w: 700 });
        if (isK) g += h.txt(P2[0], P2[1] + 44, '本轮中转', { size: 12, fill: C.amber, w: 600 });
      }
      // D 矩阵（右侧）
      var tx = 700, cell = 56, my = 120;
      g += h.txt(tx + 2 * cell, my - 26, 'D 矩阵（行 i → 列 j）', { size: 14, w: 600 });
      g += h.txt(tx + cell / 2 + 14, my + 4, ' ', { size: 10 });
      for (var j2 = 0; j2 < N; j2++) {
        var kCol = s.k === j2;
        g += h.txt(tx + cell + j2 * cell + cell / 2, my + 2, '到 v' + j2, { size: 11.5, fill: kCol ? C.amber : C.muted, w: kCol ? 700 : 400 });
      }
      for (var i3 = 0; i3 < N; i3++) {
        var kRow = s.k === i3;
        g += h.txt(tx + 14, my + i3 * cell + cell / 2 + 4, 'v' + i3 + ' from', { size: 10.5, fill: kRow ? C.amber : C.muted });
        for (var j3 = 0; j3 < N; j3++) {
          var v = s.D[i3][j3];
          var f = '#fff', stroke = C.line, sw2 = 1;
          if (i3 === j3) f = C.greyBg;
          if (s.cell && s.cell[0] === i3 && s.cell[1] === j3) { f = C.amberBg; stroke = C.amber; sw2 = 2.5; }
          g += h.rect(tx + cell + j3 * cell, my + i3 * cell, cell - 3, cell - 3, { fill: f, stroke: stroke, sw: sw2, rx: 5 });
          g += h.txt(tx + cell + j3 * cell + (cell - 3) / 2, my + i3 * cell + (cell - 3) / 2 + 6,
            v === Infinity ? '∞' : v, { size: 15, w: s.cell && s.cell[0] === i3 && s.cell[1] === j3 ? 700 : 400, fill: v === Infinity ? C.red : C.ink });
        }
      }
      g += h.txt(tx + 2 * cell, my + N * cell + 24, '黄色 = 最近一次更新的格子 ｜ 琥珀行列 = 当前中转点', { size: 11.5, fill: C.muted });
      if (s.route) g += h.txt(tx + 2 * cell, my + N * cell + 48, '当前路径：' + s.route, { size: 12.5, fill: C.blue, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
