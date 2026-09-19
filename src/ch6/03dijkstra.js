/* 动画10：Dijkstra 单源最短路径（教材经典数据：6顶点，v0出发 D=[0,∞,10,50,30,60]） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var N = 6;
  var ARCS = [[0, 2, 10], [0, 4, 30], [0, 5, 100], [1, 2, 5], [2, 3, 50], [3, 5, 10], [4, 3, 20], [4, 5, 60]];
  var POS = { 0: [90, 300], 1: [280, 105], 2: [280, 495], 4: [470, 105], 3: [470, 495], 5: [615, 300] };
  var ADJ = {};
  for (var i = 0; i < N; i++) ADJ[i] = [];
  ARCS.forEach(function (a) { ADJ[a[0]].push([a[1], a[2]]); });
  Object.keys(ADJ).forEach(function (k) { ADJ[k].sort(function (a, b) { return a[0] - b[0]; }); });

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
    id: 'dijkstra', ch: 6, name: '⑬ 最短路径：Dijkstra',
    note: '教材 6.6 图的应用（单源最短路径）',
    guide: [
      '每轮先在 V−S 中比较 D 值选最小者（消息里列出比较过程），其最短路径就此确定',
      '随后松弛该点的每条出弧：经它中转更短就更新 D 和 Path',
      '右侧表格：绿色=已确定（在 S 中），黄色=本步更新；绿边构成从源点出发的最短路径树（v1 不可达不在树中——注意它≠最小生成树）',
      '注意：Dijkstra 不适用于带负权边的图'
    ],
    inputs: [
      { key: 'start', label: '源点 v0', type: 'select', options: [['0', 'v0'], ['1', 'v1'], ['2', 'v2'], ['3', 'v3'], ['4', 'v4'], ['5', 'v5']], value: '0' }
    ],
    run: function (v) {
      var v0 = +v.start;
      var frames = [];
      var S = {}, D = [], Path = [];
      for (var w = 0; w < N; w++) {
        D[w] = Infinity; Path[w] = -1;
        ARCS.forEach(function (a) { if (a[0] === v0 && a[1] === w) { D[w] = a[2]; Path[w] = v0; } });
      }
      D[v0] = 0;
      function snap(o) {
        o = o || {};
        o.S = Object.keys(S).map(Number); o.D = D.slice(); o.Path = Path.slice();
        o.hlEdge = o.hlEdge || null; o.hlV = o.hlV == null ? null : o.hlV;
        o.relaxCell = o.relaxCell || null; o.v0 = v0; o.N = N; o.done = !!o.done;
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
        F(8, '第 ' + round + ' 轮：在 V−S 中比较 D 值——' + cmp.join('，') + '，最小的是 v' + k + '（D = ' + D[k] + '）→ 其最短路径就此确定（贪心：若经其他点中转必然 ≥ 它，不可能更短）。', dPanel({ 选中: 'v' + k, 比较: cmp.join('  ') }), snap({ hlV: k, hlEdge: Path[k] >= 0 ? [Path[k], k] : null }));
        S[k] = true;
        F(9, 'v' + k + ' 并入 S。' + (Path[k] >= 0 ? '最短路径：' + pathStr(k) + '，长度 ' + D[k] + '。' : ''), dPanel(), snap({ hlV: k }));
        ADJ[k].forEach(function (arc) {
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
      })() + '。贪心 + 松弛，时间 O(n²)。注意：Dijkstra 不适用于带负权边的图。',
        (function () { var p = {}; for (var t4 = 0; t4 < N; t4++) p['v' + t4 + ' 最短'] = D[t4] === Infinity ? '∞ 不可达' : (pathStr(t4) + ' ＝ ' + D[t4]); return p; })(),
        snap({ done: true }));
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 620, r = 26;
      var g = '';
      g += h.txt(430, 32, 'Dijkstra：求 v' + s.v0 + ' 到其余各顶点的最短路径', { size: 19, w: 600 });
      // 有向弧
      ARCS.forEach(function (a) {
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
        g += h.rect(230, 560, 520, 36, { fill: C.greenBg, stroke: C.green, rx: 8 });
        g += h.txt(490, 583, '绿色边构成最短路径树（生成树的一种）', { size: 14, fill: C.green, w: 600 });
      }
      return h.svg(W, H, g);
    }
  });
})();
