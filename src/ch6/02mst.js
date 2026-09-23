/* 动画9：最小生成树 Prim / Kruskal（教材图6.19 数据：6顶点10边，WPL=15，两种算法结果一致） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var N = 6;
  var EDGES = [
    [1, 2, 6], [1, 3, 1], [1, 4, 5], [2, 3, 5], [2, 5, 3],
    [3, 4, 5], [3, 5, 6], [3, 6, 4], [4, 6, 2], [5, 6, 6]
  ];
  /* 平面布局：v3 与其余顶点全相邻（度5），置于中心；其余按 1-2-5-6-4 排成五边形，
     五条外围边恰为五边形边、五条辐条连向中心——10 条边零交叉（教材图 6.19 画法）。 */
  var POS = { 1: [490, 100], 2: [700, 245], 5: [610, 480], 6: [370, 480], 4: [280, 245], 3: [490, 300] };
  function wOf(a, b) { var e = EDGES.filter(function (x) { return (x[0] === a && x[1] === b) || (x[0] === b && x[1] === a); })[0]; return e ? e[2] : Infinity; }

  var CODE = {
    prim: [
      'void MiniSpanTree_Prim(AMGraph G, VertexType u) {',
      '    for (i = 0; i < G.vexnum; ++i)      // 初始化候选边表',
      '        if (i != u) { lowcost[i] = G.arcs[u][i]; adjvex[i] = u; }',
      '    lowcost[u] = 0;                     // U = {u}',
      '    for (i = 1; i < G.vexnum; ++i) {',
      '        k = Min{ lowcost[v], v∈V−U };   // ① 选代价最小的候选边',
      '        输出边 (adjvex[k], k);           // ② 该边进入生成树',
      '        lowcost[k] = 0;                 // ③ k并入U',
      '        for (j = 0; j < G.vexnum; ++j)  // ④ 用k松驰候选边表',
      '            if (lowcost[j] != 0 && G.arcs[k][j] < lowcost[j]) {',
      '                lowcost[j] = G.arcs[k][j];  adjvex[j] = k;',
      '            }',
      '    }',
      '}'
    ],
    kruskal: [
      'void MiniSpanTree_Kruskal(AMGraph G) {',
      '    将边按权值从小到大排序;              // 权相同按输入顺序（稳定）',
      '    并查集VSt：初态每个顶点各自成集;',
      '    edgenum = 0;',
      '    while (edgenum < G.vexnum - 1) {',
      '        取当前最短的边 (u, v);',
      '        if (u、v不在同一连通分量) {      // 不成环才要',
      '            输出边(u, v);  合并(u, v);',
      '            edgenum++;',
      '        }   // 否则丢弃（会成环）',
      '    }',
      '}'
    ]
  };

  DSC.reg({
    id: 'mst', ch: 6, name: '最小生成树：Prim / Kruskal',
    note: '教材 6.6 图的应用（最小生成树：Prim / Kruskal）',
    guide: [
      'Prim：看右侧候选边表逐轮更新，每次把"离 U 最近"的点并入（绿色）',
      'Kruskal：按权升序逐条考察，接受不成环的边、丢弃成环的边（红色虚线）',
      '两算法在本例上得到相同总权值 15——贪心策略不同，最优值一致'
    ],
    inputs: [
      { key: 'method', label: '算法', type: 'select', options: [['prim', 'Prim（逐点并入，从v1出发）'], ['kruskal', 'Kruskal（按权选边，避环）']], value: 'prim' }
    ],
    run: function (v) {
      var method = v.method;
      var code = method === 'prim' ? CODE.prim : CODE.kruskal;
      var frames = [];
      var treeEdges = [], inU = {}, lowcost = {}, adjvex = {}, uLabel = null, curComp = null, curEdgeList = null;
      function snap(o) {
        o = o || {};
        o.treeEdges = treeEdges.slice(); o.lowcost = JSON.parse(JSON.stringify(lowcost));
        o.adjvex = JSON.parse(JSON.stringify(adjvex)); o.inU = Object.keys(inU).map(Number);
        o.hlEdge = o.hlEdge || null; o.rejected = o.rejected || [];
        o.method = method; o.N = N; o.components = curComp;
        o.edgeList = curEdgeList ? curEdgeList.map(function (e2) {
          var st = edgeState ? (edgeState[e2[0] + '-' + e2[1]] || 'pending') : 'pending';
          return { u: e2[0], v: e2[1], w: e2[2], st: st };
        }) : null;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      function lcPanel(extra) {
        var p = { U集合: '{ v' + Object.keys(inU).map(Number).sort(function (a, b) { return a - b; }).join(', v') + ' }' };
        for (var j = 1; j <= N; j++) {
          if (inU[j]) continue;
          p['v' + j] = (lowcost[j] === Infinity ? '∞' : lowcost[j]) + '（经 v' + adjvex[j] + '）';
        }
        if (extra) for (var k in extra) p[k] = extra[k];
        return p;
      }

      if (method === 'prim') {
        var u0 = 1;
        inU[u0] = true; uLabel = u0;
        for (var j = 1; j <= N; j++) { lowcost[j] = (j === u0 ? 0 : wOf(u0, j)); adjvex[j] = u0; }
        F([1, 2, 3], '初始：U = { v' + u0 + ' }。候选边表：对每个 V−U 中的点记录"连到 U 的最短边"。', lcPanel(), snap({}));
        for (var round = 1; round < N; round++) {
          var k = -1;
          for (var j2 = 1; j2 <= N; j2++) if (!inU[j2] && lowcost[j2] < Infinity && (k < 0 || lowcost[j2] < lowcost[k])) k = j2;
          F(5, '第 ' + round + ' 轮：候选边表中最小的 lowcost[v' + k + '] = ' + lowcost[k] + '（边 v' + adjvex[k] + '—v' + k + '）→ 选它。',
            lcPanel({ 选中: 'v' + adjvex[k] + ' — v' + k + '，权 ' + lowcost[k] }), snap({ hlEdge: [adjvex[k], k] }));
          treeEdges.push([adjvex[k], k]); inU[k] = true;
          F([6, 7], '边 v' + adjvex[k] + '—v' + k + '（权 ' + lowcost[k] + '）加入生成树，v' + k + ' 并入 U。已并入 ' + round + ' 个顶点。',
            lcPanel(), snap({ hlEdge: [adjvex[k], k] }));
          for (var j3 = 1; j3 <= N; j3++) {
            if (inU[j3]) continue;
            var w = wOf(k, j3);
            if (w < lowcost[j3]) {
              lowcost[j3] = w; adjvex[j3] = k;
              F([9, 10, 11], '松弛：v' + j3 + ' 经新点 v' + k + ' 的边权 ' + w + ' < 原 lowcost → 更新为 ' + w + '（经 v' + k + '）。',
                lcPanel(), snap({ hlEdge: [k, j3] }));
            } else if (w < Infinity) {
              F(9, '检查 v' + j3 + '：经 v' + k + ' 的边权 ' + w + ' ≥ 原 lowcost ' + (lowcost[j3] === Infinity ? '∞' : lowcost[j3]) + '，不更新。',
                lcPanel(), snap({ hlEdge: [k, j3] }));
            }
          }
        }
        var total = 0;
        treeEdges.forEach(function (e) { total += wOf(e[0], e[1]); });
        F(13, 'Prim 完成！生成树边：' + treeEdges.map(function (e) { return 'v' + e[0] + '—v' + e[1] + '(' + wOf(e[0], e[1]) + ')'; }).join('，') + '，总权值 = ' + total + '。每次把"离 U 最近"的点并入，贪心策略保证全局最优。',
          { 生成树总权值: String(total), 边数: 'n−1 = ' + (N - 1) }, snap({ done: true }));
      } else {
        var sorted = EDGES.slice().sort(function (a, b) { return a[2] - b[2]; });
        curEdgeList = sorted;
        var edgeState = {};
        var parent = {}; for (var x = 1; x <= N; x++) parent[x] = x;
        function find(a) { while (parent[a] !== a) a = parent[a] = parent[parent[a]]; return a; }
        var cnt = 0, idx = 0, accepted = [];
        F(1, '第一步：把全部边按权值【从小到大】排序（权相同按输入顺序，稳定）：' + sorted.map(function (e) { return 'v' + e[0] + 'v' + e[1] + '(' + e[2] + ')'; }).join('、') + '。之后按此顺序逐条考察。',
          { 已选边数: '0 / ' + (N - 1) }, snap({}));
        for (var ei = 0; ei < sorted.length && cnt < N - 1; ei++) {
          var e = sorted[ei];
          var ra = find(e[0]), rb = find(e[1]);
          if (ra !== rb) {
            parent[ra] = rb;
            treeEdges.push([e[0], e[1]]); accepted.push(e); cnt++;
            edgeState[e[0] + '-' + e[1]] = 'accepted';
            curComp = compStr(parent);
            F([6, 7, 8], '边 v' + e[0] + '—v' + e[1] + '（权 ' + e[2] + '）：两端点不在同一连通分量 → 【接受】，合并分量。已选 ' + cnt + ' 条边。',
              { 已选边数: cnt + ' / ' + (N - 1), 分量: curComp }, snap({ hlEdge: [e[0], e[1]] }));
          } else {
            edgeState[e[0] + '-' + e[1]] = 'rejected';
            curComp = compStr(parent);
            var rej = snap({ rejected: [] }); rej.rejected.push([e[0], e[1]]);
            F(9, '边 v' + e[0] + '—v' + e[1] + '（权 ' + e[2] + '）：两端点已连通（分量 ' + curComp + '）→【丢弃】，否则成环。',
              { 已选边数: cnt + ' / ' + (N - 1), 分量: curComp }, rej);
          }
        }
        var total2 = 0; accepted.forEach(function (e) { total2 += e[2]; });
        F(10, 'Kruskal 完成！生成树边：' + accepted.map(function (e) { return 'v' + e[0] + '—v' + e[1] + '(' + e[2] + ')'; }).join('，') + '，总权值 = ' + total2 + '。已凑够 n−1 = ' + (N - 1) + ' 条边，剩余边无需再看。按权从小到大贪心选"不成环"的边。',
          { 生成树总权值: String(total2), 边数: 'n−1 = ' + (N - 1) }, snap({ done: true }));
      }
      return { code: code, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 620;
      var g = '';
      g += h.txt(430, 32, s.method === 'prim' ? 'Prim 算法（逐点并入）' : 'Kruskal 算法（按权选边）', { size: 19, w: 600 });
      EDGES.forEach(function (e) {
        var A = POS[e[0]], B = POS[e[1]];
        var inTree = s.treeEdges.some(function (t) { return (t[0] === e[0] && t[1] === e[1]) || (t[0] === e[1] && t[1] === e[0]); });
        var isHl = s.hlEdge && ((s.hlEdge[0] === e[0] && s.hlEdge[1] === e[1]) || (s.hlEdge[0] === e[1] && s.hlEdge[1] === e[0]));
        var isRej = s.rejected.some(function (t) { return (t[0] === e[0] && t[1] === e[1]) || (t[0] === e[1] && t[1] === e[0]); });
        var stroke = inTree ? C.green : (isRej ? C.red : (isHl ? C.amber : C.line));
        g += h.line(A[0], A[1], B[0], B[1], { stroke: stroke, sw: inTree ? 4.5 : (isHl ? 3.5 : 1.6), dash: isRej ? '6,5' : null });
        var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
        var lx = mx - dy / L * 13, ly = my + dx / L * 13;
        g += h.circle(lx, ly, 11, { fill: inTree ? C.greenBg : '#fff', stroke: inTree ? C.green : C.grey, sw: 1.2 });
        g += h.txt(lx, ly + 4.5, e[2], { size: 12, w: 700, fill: inTree ? C.green : C.ink });
      });
      for (var k = 1; k <= N; k++) {
        var P = POS[k];
        var inU = s.inU.indexOf(k) >= 0;
        g += h.circle(P[0], P[1], 25, { fill: inU ? C.greenBg : '#fff', stroke: inU ? C.green : C.grey, sw: inU ? 3.5 : 2 });
        g += h.txt(P[0], P[1] + 7, 'v' + k, { size: 16, w: 700 });
      }
      if (s.method === 'prim') {
        g += h.txt(760, 96, '候选边表（连到 U 的最短边）', { size: 13, w: 600, anchor: 'start' });
        var y0 = 118;
        for (var j = 1; j <= N; j++) {
          var inUj = s.inU.indexOf(j) >= 0;
          var txt = inUj ? 'v' + j + ' ∈ U' : 'v' + j + ':  lowcost=' + (s.lowcost[j] === Infinity ? '∞' : s.lowcost[j]) + '  adjvex=v' + s.adjvex[j];
          g += h.rect(760, y0 + (j - 1) * 40, 210, 34, { fill: inUj ? C.greenBg : '#fff', stroke: inUj ? C.green : C.grey, rx: 6 });
          g += h.txt(865, y0 + (j - 1) * 40 + 22, txt, { size: 12.5, family: 'Consolas,monospace', fill: inUj ? C.green : C.ink, w: inUj ? 600 : 400 });
        }
        g += h.txt(972, y0 + N * 40 + 20, '绿色 = 已并入 U；lowcost=0 表示在 U 中', { size: 11.5, fill: C.muted, anchor: 'end' });
      } else {
        g += h.txt(760, 96, '排序边表（按权升序，逐条考察）', { size: 13, w: 600, anchor: 'start' });
        var ey = 110, erh = 24;
        (s.edgeList || []).forEach(function (e2, k2) {
          var ry = ey + k2 * erh;
          var stTxt = e2.st === 'accepted' ? '✓ 已选' : e2.st === 'rejected' ? '✗ 丢弃（成环）' : '… 待考察';
          var stCol = e2.st === 'accepted' ? C.green : e2.st === 'rejected' ? C.red : C.muted;
          g += h.rect(760, ry, 210, erh - 3, { fill: e2.st === 'accepted' ? C.greenBg : (e2.st === 'rejected' ? C.redBg : '#fff'), stroke: C.line, sw: 0.8, rx: 4 });
          g += h.txt(772, ry + 16, 'v' + e2.u + '—v' + e2.v + '  权' + e2.w, { size: 12, family: 'Consolas,monospace', anchor: 'start' });
          g += h.txt(962, ry + 16, stTxt, { size: 11.5, fill: stCol, w: 600, anchor: 'end' });
        });
        var cy2 = ey + (s.edgeList || []).length * erh + 14;
        g += h.txt(760, cy2, '并查集分量', { size: 13, w: 600, anchor: 'start' });
        g += h.rect(760, cy2 + 12, 210, 56, { fill: '#fff', stroke: C.grey, rx: 6 });
        var lines2 = String(s.components || '').split(' ｜ ');
        lines2.slice(0, 2).forEach(function (ln, k3) { g += h.txt(865, cy2 + 34 + k3 * 22, ln, { size: 12.5, family: 'Consolas,monospace' }); });
        g += h.txt(760, cy2 + 86, '绿=已接受  红虚线=丢弃（会成环）', { size: 11.5, fill: C.muted, anchor: 'start' });
      }
      var total = 0;
      s.treeEdges.forEach(function (t) {
        var e = EDGES.filter(function (x) { return (x[0] === t[0] && x[1] === t[1]) || (x[0] === t[1] && x[1] === t[0]); })[0];
        total += e[2];
      });
      g += h.txt(430, 600, '生成树：' + (s.treeEdges.length ? s.treeEdges.map(function (t) { return 'v' + t[0] + '—v' + t[1]; }).join('，') + '，总权值 ' + total : '（构造中…）'),
        { size: 15, fill: s.treeEdges.length === N - 1 ? C.green : C.ink, w: 600 });
      return h.svg(W, H, g);
    }
  });
  function compStr(parent) {
    var groups = {};
    function find(a) { while (parent[a] !== a) a = parent[a]; return a; }
    Object.keys(parent).forEach(function (k) {
      var r = find(+k);
      (groups[r] = groups[r] || []).push(+k);
    });
    return Object.keys(groups).map(function (r) {
      return '{ v' + groups[r].sort(function (a, b) { return a - b; }).join(', v') + ' }';
    }).join(' ｜ ');
  }
})();
