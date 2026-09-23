/* 动画：图的基本概念——度/入度出度、握手定理、连通分量与强连通分量（408 大纲 五(一)(二)） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '// 图 G = (V, E)：无向图记边 (v, w)，有向图记弧 <v, w>',
    'TD(v) = 与 v 相关联的边数;              // 度',
    '/* 握手定理：无向图 Σ TD(v) = 2|E|',
    '   一条边给两个端点各贡献 1 个度 → 度之和必为偶数 */',
    '有向图：TD(v) = ID(v) + OD(v);          // 入度 + 出度',
    '        Σ ID(v) = Σ OD(v) = |E|;        // 每条弧一进一出',
    '/* 完全图 Kn 有 n(n−1)/2 条边；有向完全图 n(n−1) 条 */',
    '/* 连通（无向）：任意两点间有路径。',
    '   连通分量 = 极大连通子图（再加任何一个点/边就不连通或不极大） */',
    '/* 强连通（有向）：任意两点 v⇄w 双向都有路径。',
    '   强连通分量 = 极大强连通子图 */',
    '/* 生成树：n 个顶点 + n−1 条边的极小连通子图 */',
    '',
    '/* 求连通分量：对每个还没访问过的点做一次遍历，一轮染出来的就是一个分量 */',
    'for (v in V)',
    '    if (!visited[v]) { ++cc; BFS(v, cc); }'
  ];

  var PAL = [C.blue, C.green, C.amber, '#8b5cf6', '#0891b2', '#db2777'];

  function layout(n) {
    var cx = 470, cy = 250, rx = n > 6 ? 330 : 270, ry = n > 6 ? 145 : 125, p = [];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    }
    return p;
  }

  DSC.reg({
    id: 'graphBasic', ch: 6, name: '图的基本概念：度、握手定理与连通分量',
    note: '408 大纲 五(一) 图的定义与术语（度/入度出度、握手定理、完全图、连通与强连通分量）',
    guide: [
      '度就是"挂着几条边"。无向图里一条边同时给两个端点各加 1，所以 **Σ度 = 2|E|**（握手定理）——由此立刻能推出：度为奇数的顶点个数必是偶数',
      '有向图要分开看：入度是"多少条弧指进来"、出度是"指出去几条"。**Σ入度 = Σ出度 = |E|**，每条弧恰好一进一出',
      '连通分量是**极大**连通子图：把图切成几块互相走不到的岛，每块就是一个分量。求法就是"从任意没走过的点出发染一遍色，染到的算一块"',
      '有向图要双向都走得通才叫**强**连通。把有向开关打开，同一批边会拆出和刚才完全不同的分量数——这是 408 的高频陷阱'
    ],
    inputs: [
      {
        key: 'scene', label: '场景', type: 'select', options: [
          ['deg', '度 / 入度出度 / 握手定理'], ['conn', '连通分量与强连通分量']
        ], value: 'deg'
      },
      { key: 'edges', label: '边表（形如 0-1 2-3，端点下标 0~9）', type: 'text', value: '0-1 0-2 1-2 1-3 2-3 4-5 5-6 4-6' },
      { key: 'dir', label: '有向图（弧）', type: 'checkbox', value: false },
      { key: 'nv', label: '顶点数（把孤立点也算进来）', type: 'number', value: 7, min: 3, max: 10 }
    ],

    run: function (v) {
      var scene = v.scene, dir = !!v.dir, nv = +v.nv;
      if (!(nv >= 3 && nv <= 10)) throw Error('顶点数须在 3~10 之间');
      var E = [];
      String(v.edges).split(/[\s,;]+/).filter(Boolean).forEach(function (t) {
        var m = /^(\d+)\s*[-→]\s*(\d+)$/.exec(t);
        if (!m) throw Error('边表格式应为 a-b，收到「' + t + '」');
        var a = +m[1], b = +m[2];
        if (a >= nv || b >= nv) throw Error('端点下标必须在 0~' + (nv - 1));
        if (a === b) throw Error('本动画不画自环');
        E.push([a, b]);
      });
      if (!E.length) throw Error('请至少给一条边');
      var nodes = [], i;
      for (i = 0; i < nv; i++) nodes.push(i);
      var pos = layout(nodes.length);
      var frames = [];
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          nodes: nodes.length, pos: pos, E: E, dir: dir, ehl: [], nhl: [], comp: null,
          v: null, done: false, isolated: []
        }, snap || {}) });
      }
      /* 度统计 */
      var deg = nodes.map(function () { return 0; }), ind = nodes.map(function () { return 0; }), outd = nodes.map(function () { return 0; });
      E.forEach(function (e) {
        deg[e[0]]++; deg[e[1]]++;
        if (dir) { outd[e[0]]++; ind[e[1]]++; }
      });
      var isolated = nodes.filter(function (x) { return deg[x] === 0; });

      if (scene === 'deg') {
        F([0], (dir ? '有向图' : '无向图') + ' G = (V, E)：' + nodes.length + ' 个顶点、' + E.length + ' 条' +
          (dir ? '弧' : '边') + '。边表直接写在下面输入框里，换一张图结论照样成立。',
          { 顶点数: nodes.length + ' 个', 边数: E.length + ' 条' }, { comp: nodes.map(function () { return 0; }) });
        nodes.forEach(function (x) {
          var ei = [];
          E.forEach(function (e, k) { if (e[0] === x || e[1] === x) ei.push(k); });
          if (dir) {
            F([4, 5], '顶点 ' + x + '：' + ei.length + ' 条边与它相关 —— 入度 ID = ' + ind[x] + '（' +
              E.filter(function (e) { return e[1] === x; }).map(function (e) { return '<' + e[0] + ',' + e[1] + '>'; }).join(' ') + '）、出度 OD = ' +
              outd[x] + '（' + E.filter(function (e) { return e[0] === x; }).map(function (e) { return '<' + e[0] + ',' + e[1] + '>'; }).join(' ') +
              '）→ 度 TD = ' + deg[x] + '。',
              { 顶点: String(x), 入度: ind[x] + '', 出度: outd[x] + '', 度: deg[x] + '' },
              { ehl: ei, nhl: [x], v: x });
          } else {
            F([1], '顶点 ' + x + ' 挂着 ' + deg[x] + ' 条边：' +
              (ei.map(function (k) { return '(' + E[k][0] + ',' + E[k][1] + ')'; }).join(' ') || '一条也没有——它是孤立点') +
              ' → TD(' + x + ') = ' + deg[x] + '。',
              { 顶点: String(x), 度: deg[x] + '', 奇偶: deg[x] % 2 ? '奇' : '偶' },
              { ehl: ei, nhl: [x], v: x });
          }
        });
        var sd = deg.reduce(function (a, x) { return a + x; }, 0);
        var si = ind.reduce(function (a, x) { return a + x; }, 0), so = outd.reduce(function (a, x) { return a + x; }, 0);
        var odd = deg.filter(function (x) { return x % 2; }).length;
        F(dir ? [5] : [2, 3], dir
          ? '★ 握手定理（有向版）：Σ入度 = ' + si + '、Σ出度 = ' + so + '，都恰好等于弧数 |E| = ' + E.length +
            '。因为每条弧**必然**一端进、一端出，谁也不多谁也不少。'
          : '★ 握手定理：把每个顶点的度加起来 = ' + deg.join(' + ') + ' = **' + sd + '**，而边数是 ' + E.length +
            ' 条，2|E| = ' + 2 * E.length + '。两者相等不是巧合——每条边都给两个端点各记 1 个度。' +
            '推论：度为奇数的顶点有 ' + odd + ' 个，**必是偶数个**。',
          { 度之和: sd + ' = 2×' + E.length, 边数: E.length + ' 条', 奇数度顶点: odd + ' 个' },
          { comp: nodes.map(function () { return 0; }), done: true });
        if (isolated.length) {
          F([1], '补一句：' + isolated.join('、') + ' 号是**孤立点**，度为 0（偶数）。它照样算顶点，' +
            '而且在连通性那一栏里它会自成一个分量。',
            { 孤立点: isolated.join('、'), 度: '0' }, { nhl: isolated, comp: nodes.map(function () { return 0; }) });
        }
        var kn = dir ? nodes.length * (nodes.length - 1) : nodes.length * (nodes.length - 1) / 2;
        F([6], '对照完全图：' + nodes.length + ' 个顶点的' + (dir ? '有向完全图该有 n(n−1) = ' : '无向完全图 K' + nodes.length + ' 该有 n(n−1)/2 = ') +
          kn + ' 条' + (dir ? '弧' : '边') + '，现在只有 ' + E.length + ' 条' + (E.length === kn ? '——正好是完全图' : '，差 ' + (kn - E.length) + ' 条') +
          (dir ? '。有向完全图里每个点入度 = 出度 = n−1 = ' + (nodes.length - 1) + '，度为 2(n−1)。'
               : '。完全图里每个点的度都是 n−1 = ' + (nodes.length - 1) + '。'),
          { 完全图边数: (dir ? 'n(n−1) = ' : 'n(n−1)/2 = ') + kn, 当前边数: E.length + ' 条',
            每点度: dir ? '入=出=' + (nodes.length - 1) : (nodes.length - 1) + '' },
          { done: true, comp: nodes.map(function () { return 0; }) });
        return { code: CODE, frames: frames };
      }

      /* -------- 连通分量 / 强连通分量 -------- */
      var adj = nodes.map(function () { return []; });
      E.forEach(function (e, k) {
        adj[e[0]].push({ to: e[1], e: k });
        if (dir) adj[e[1]].push({ to: e[0], e: k, back: true }); else adj[e[1]].push({ to: e[0], e: k });
      });
      /* 无向：BFS 染色；有向：仍按"可达"给出连通块，另算强连通 */
      var comp = nodes.map(function () { return -1; }), cc = 0;
      nodes.forEach(function (st) {
        if (comp[st] >= 0) return;
        var q = [st], seen = {};
        seen[st] = 1; comp[st] = cc;
        while (q.length) {
          var u = q.shift();
          adj[u].forEach(function (a) {
            if (!seen[a.to]) { seen[a.to] = 1; comp[a.to] = cc; q.push(a.to); }
          });
        }
        cc++;
      });
      F([7, 8, 13], (dir ? '有向图先按"忽略方向能不能走到"分块（这叫**弱连通**）；真正的强连通另说。' : '') +
        '求分量的办法只有一句：**从任意没染过色的点出发走一遍，染到的就是一块**，再找下一个没染色的。',
        { 顶点数: nodes.length + ' 个', 边数: E.length + ' 条' }, { comp: comp.slice() });
      var used = [];
      for (i = 0; i < cc; i++) used[i] = nodes.filter(function (x) { return comp[x] === i; });
      for (i = 0; i < cc; i++) {
        var mem = used[i];
        var ei2 = [];
        E.forEach(function (e, k) { if (comp[e[0]] === i && comp[e[1]] === i) ei2.push(k); });
        F([14], '第 ' + (i + 1) + ' 块：从 ' + mem[0] + ' 号出发一次遍历，染到 ' + mem.join('、') +
          ' 共 ' + mem.length + ' 个点、内部 ' + ei2.length + ' 条边。' +
          (mem.length === 1 && ei2.length === 0 ? '它一个邻居都没有，是**孤立点自成一分量**。' : '') +
          ' 块外的点和它互相走不到。',
          { 分量数: (i + 1) + ' / ' + cc, 本块顶点: mem.join(' '), 本块边数: ei2.length + ' 条' },
          { comp: comp.map(function (c, k) { return c <= i ? c : -1; }), nhl: mem, ehl: ei2 });
      }
      F([7, 8], '★ ' + nodes.length + ' 个顶点被切成 **' + cc + ' 个' + (dir ? '弱' : '') + '连通分量**：' +
        used.map(function (m, k) { return '{' + m.join(' ') + '}'; }).join(' + ') +
        '。"极大"是关键词——每块都已经是能扩的最大范围，再往里加点就不连通了。',
        { 分量数: cc + ' 个', 划分: used.map(function (m) { return '{' + m.join(' ') + '}'; }).join('+') },
        { comp: comp.slice(), done: true });
      if (dir) {
        /* 强连通：两两互相可达 */
        function reach(from) {
          var seen2 = {}, q2 = [from]; seen2[from] = 1;
          while (q2.length) {
            var u2 = q2.shift();
            E.forEach(function (e) { if (e[0] === u2 && !seen2[e[1]]) { seen2[e[1]] = 1; q2.push(e[1]); } });
          }
          return seen2;
        }
        var rs = nodes.map(reach);
        var scc = nodes.map(function () { return -1; }), sc = 0;
        nodes.forEach(function (a1) {
          if (scc[a1] >= 0) return;
          var grp = nodes.filter(function (x) { return x === a1 || (rs[a1][x] && rs[x][a1]); });
          grp.forEach(function (x) { scc[x] = sc; }); sc++;
        });
        F([9, 10], '把方向认真当回事：有向图要求 **v 能走到 w 且 w 也能走到 v** 才算一处，这叫强连通。' +
          '逐对查"互相可达"之后，' + nodes.length + ' 个点被切成 ' + sc + ' 个**强连通分量**：' +
          Array.apply(null, Array(sc)).map(function (_, k) {
            return '{' + nodes.filter(function (x) { return scc[x] === k; }).join(' ') + '}';
          }).join(' + '),
          { 强连通分量: sc + ' 个', 弱连通分量: cc + ' 个' }, { comp: scc.slice(), done: true });
        F([9], '★ 对比：同一张图，忽略方向是 ' + cc + ' 块，讲方向是 ' + sc + ' 块。' +
          '有向图里"连通"这个词本身就有好几种口径（强连通 / 双向连通 / 弱连通），做题先看题目问的是哪一种。',
          { 强连通分量: sc + ' 个', 弱连通分量: cc + ' 个' }, { comp: scc.slice(), done: true });
      }
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 560, g = '';
      var n = s.nodes, pos = s.pos;
      g += h.txt(W / 2, 28, (s.dir ? '有向图' : '无向图') + ' G=(V,E)：' + n + ' 个顶点、' + s.E.length + ' 条' +
        (s.dir ? '弧' : '边') + (s.comp && s.comp.some(function (c) { return c >= 0; }) ? ' · 分量按颜色分块' : ''),
        { size: 17, w: 600 });
      g += h.txt(30, 50, '图例：橙=当前顶点及其关联边 蓝/绿/紫…=所属连通分量 灰=未涉及',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      /* 边 */
      s.E.forEach(function (e, k) {
        var A = pos[e[0]], B = pos[e[1]];
        var hot = s.ehl.indexOf(k) >= 0;
        var col = hot ? C.amber : s.comp && s.comp[e[0]] >= 0 && s.comp[e[0]] === s.comp[e[1]] ? PAL[s.comp[e[0]] % PAL.length] : C.grey;
        var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
        var sx = A[0] + dx / L * 22, sy = A[1] + dy / L * 22, tx = B[0] - dx / L * 24, ty = B[1] - dy / L * 24;
        if (s.dir) g += h.arrow(sx, sy, tx, ty, { stroke: col, sw: hot ? 2.8 : 1.6, head: 8 });
        else g += h.line(sx, sy, tx, ty, { stroke: col, sw: hot ? 2.8 : 1.6 });
      });
      /* 顶点 */
      for (var i = 0; i < n; i++) {
        var c = s.comp ? s.comp[i] : -1;
        var isHot = s.nhl.indexOf(i) >= 0;
        var fill = isHot ? C.amberBg : c >= 0 ? '#fff' : '#fff';
        var stroke = isHot ? C.amber : c >= 0 ? PAL[c % PAL.length] : C.grey;
        g += h.circle(pos[i][0], pos[i][1], 21, { fill: fill, stroke: stroke, sw: isHot ? 3.2 : 1.8 });
        g += h.txt(pos[i][0], pos[i][1] + 5, String(i), { size: 14, w: 700 });
      }
      /* 度数表 */
      var deg = [], ind = [], outd = [];
      for (var q = 0; q < n; q++) { deg[q] = 0; ind[q] = 0; outd[q] = 0; }
      s.E.forEach(function (e) {
        deg[e[0]]++; deg[e[1]]++;
        if (s.dir) { outd[e[0]]++; ind[e[1]]++; }
      });
      var ty0 = 452, cw = Math.min(74, Math.floor((W - 120) / n));
      var x0 = (W - n * (cw + 6)) / 2;
      g += h.txt(x0 - 8, ty0 + 16, s.dir ? '入度' : '度', { size: 11.5, fill: C.muted, anchor: 'end', w: 600 });
      for (var r2 = 0; r2 < n; r2++) {
        var hot2 = s.nhl.indexOf(r2) >= 0;
        g += h.rect(x0 + r2 * (cw + 6), ty0, cw, 26, { fill: hot2 ? C.amberBg : '#fff', stroke: hot2 ? C.amber : C.line, sw: hot2 ? 2 : 1, rx: 4 });
        g += h.txt(x0 + r2 * (cw + 6) + cw / 2, ty0 + 18, String(s.dir ? ind[r2] : deg[r2]), { size: 13, w: hot2 ? 700 : 400 });
        g += h.txt(x0 + r2 * (cw + 6) + cw / 2, ty0 + 40, String(r2), { size: 10.5, fill: C.muted });
      }
      if (s.dir) {
        g += h.txt(x0 - 8, ty0 + 66, '出度', { size: 11.5, fill: C.muted, anchor: 'end', w: 600 });
        for (var r3 = 0; r3 < n; r3++) {
          var hot3 = s.nhl.indexOf(r3) >= 0;
          g += h.rect(x0 + r3 * (cw + 6), ty0 + 48, cw, 26, { fill: hot3 ? C.amberBg : '#fff', stroke: hot3 ? C.amber : C.line, sw: hot3 ? 2 : 1, rx: 4 });
          g += h.txt(x0 + r3 * (cw + 6) + cw / 2, ty0 + 66, String(outd[r3]), { size: 13, w: hot3 ? 700 : 400 });
        }
      }
      var sd = deg.reduce(function (a, x) { return a + x; }, 0);
      var note = s.done
        ? (s.comp && s.comp.some(function (c) { return c >= 0; }) && s.comp.indexOf(-1) < 0
          ? '★ 分量数 = ' + (Math.max.apply(null, s.comp) + 1) + '，每个顶点恰好属于一块'
          : '★ Σ度 = ' + sd + ' = 2 × 边数 ' + s.E.length + '（握手定理）')
        : '度 = 挂了几条边；无向图一条边给两端各加 1，所以度之和一定是偶数';
      g += h.txt(W / 2, H - 18, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
