/* 动画：图的基本概念——度/入度出度、握手定理、连通分量与强连通分量（408 大纲 五(一)(二)） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '// 图 G = (V, E)：无向图的边记 (v, w)，有向图的弧记 <v, w>',
    'TD(v) = 与 v 相关联的边数;                    // 度',
    '/* 握手定理（无向图）：Σ TD(v) = 2|E|',
    '   一条边给两个端点各贡献 1 个度 → 度之和必为偶数',
    '   推论：度为奇数的顶点必有偶数个 */',
    '',
    '/* 有向图：TD(v) = ID(v) + OD(v)              // 入度 + 出度',
    '   Σ ID(v) = Σ OD(v) = |A|;   且 Σ TD(v) = 2|A|',
    '   每条弧 <v,w> 恰好给 v 一个出度、给 w 一个入度 */',
    'ID(v) = 以 v 为头的弧数;   OD(v) = 以 v 为尾的弧数;',
    '/* <v,w> 与 <w,v> 是两条不同的弧（无向图里 (v,w) ≡ (w,v)） */',
    '',
    '/* 完全图：Kn 有 n(n−1)/2 条边，每个点度 = n−1',
    '   有向完全图有 n(n−1) 条弧，每个点 ID = OD = n−1 */',
    '/* 连通（无向图）：任意两点间有路径。',
    '   连通分量 = 极大连通子图（再加任何一个点/边就不连通） */',
    '/* 强连通（有向图）：任意两点 v⇄w 双向都有路径。',
    '   强连通分量 = 极大强连通子图；忽略方向后得到的叫弱连通分量 */',
    '/* 生成树：n 个顶点 + n−1 条边的极小连通子图 */',
    '',
    '/* 求分量：对每个还没染过色的点走一遍，一轮染出来的就是一块 */',
    'for (v in V)',
    '    if (!visited[v]) { ++cc; BFS(v, cc); }'
  ];

  var PAL = [C.blue, C.green, C.amber, '#8b5cf6', '#0891b2', '#db2777'];
  var DIRSC = { ideg: 1, sconn: 1 };

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
    aim: '度怎么数、图被切成几块：无向 **Σ度=2|E|**，有向 **Σ入度=Σ出度=|A|**',
    note: '408 大纲 五(一) 图的定义与术语（度/入度出度、握手定理、完全图、连通与强连通分量）',
    guide: [
      '这个动画回答两个问题：**一个顶点的度到底怎么数**，以及**一张图被切成几块互相走不到的岛**。四个场景各答一半',
      '无向图里一条边给两端各加 1 个度，所以 **Σ度 = 2|E|**（握手定理）——立刻推出"奇数度的点必是偶数个"。这是选择题最爱的一句',
      '有向图必须把入度、出度分开数：**Σ入度 = Σ出度 = 弧数**。注意 <a,b> 和 <b,a> 是两条不同的弧，画面里画成上下分开的两条',
      '分量那两栏：无向图叫连通分量，有向图要分"忽略方向"（弱连通）和"双向都走得通"（强连通）。同一批边，两个数可以差很多——408 的高频陷阱'
    ],
    inputs: [
      {
        key: 'scene', label: '场景', type: 'select', options: [
          ['deg', '① 无向图：度与握手定理'],
          ['ideg', '② 有向图：入度、出度与 Σ入=Σ出'],
          ['conn', '③ 无向图：连通分量'],
          ['sconn', '④ 有向图：强连通分量（与弱连通对比）']
        ], value: 'deg'
      },
      { key: 'edges', label: '边表（无向写 a-b，有向写 a>b；有向场景里 a-b 等同 a→b）', type: 'text', value: '0-1 0-2 1-2 1-3 2-3 4-5 5-6 4-6' },
      { key: 'nv', label: '顶点数（把孤立点也算进来）', type: 'number', value: 7, min: 3, max: 10 }
    ],

    run: function (v) {
      var scene = v.scene, dir = !!DIRSC[scene], nv = +v.nv;
      if (!(nv >= 3 && nv <= 10)) throw Error('顶点数须在 3~10 之间');
      var E = [];
      /* 三种写法都收：a-b、a>b、<a,b>；分隔符可以是空格/逗号/分号。
         逗号在 <a,b> 里是"两个端点之间"的分隔、在列表里又是"两条边之间"的分隔，
         所以只在带尖括号时才把逗号当端点分隔，否则 a-b,c-d 会被咬错 */
      var raw = String(v.edges), re = /<\s*(\d+)\s*,\s*(\d+)\s*>|(\d+)\s*[-→>]\s*(\d+)/g, m2, rest = raw;
      while ((m2 = re.exec(raw))) {
        var a = +(m2[1] != null ? m2[1] : m2[3]), b = +(m2[2] != null ? m2[2] : m2[4]);
        if (a >= nv || b >= nv) throw Error('端点下标必须在 0~' + (nv - 1));
        if (a === b) throw Error('本动画不画自环');
        E.push([a, b]);
        rest = rest.replace(m2[0], ' ');
      }
      var junk = rest.replace(/[\s,;、]/g, '');
      if (!E.length || junk) throw Error('边表格式应为 a-b 或 a>b（也可写 <a,b>），看不懂「' + (junk || raw) + '」');
      var nodes = [], i;
      for (i = 0; i < nv; i++) nodes.push(i);
      var pos = layout(nodes.length);
      var frames = [];
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          nodes: nodes.length, pos: pos, E: E, dir: dir, scene: scene, ehl: [], nhl: [],
          comp: null, v: null, done: false, isolated: [], twin: []
        }, snap || {}) });
      }
      /* 度统计 */
      var deg = nodes.map(function () { return 0; }), ind = nodes.map(function () { return 0; }), outd = nodes.map(function () { return 0; });
      E.forEach(function (e) {
        deg[e[0]]++; deg[e[1]]++;
        if (dir) { outd[e[0]]++; ind[e[1]]++; }
      });
      var isolated = nodes.filter(function (x) { return deg[x] === 0; });
      /* 互为反向的弧：画成上下分开的两条，否则看不出是两条 */
      var twin = [];
      E.forEach(function (e, k) {
        if (dir && E.some(function (f, j) { return j !== k && f[0] === e[1] && f[1] === e[0]; })) twin.push(k);
      });
      var sd = deg.reduce(function (a, x) { return a + x; }, 0);
      var si = ind.reduce(function (a, x) { return a + x; }, 0), so = outd.reduce(function (a, x) { return a + x; }, 0);
      var odd = deg.filter(function (x) { return x % 2; }).length;
      var arcOf = function (k) { return dir ? '<' + E[k][0] + ',' + E[k][1] + '>' : '(' + E[k][0] + ',' + E[k][1] + ')'; };

      if (scene === 'deg' || scene === 'ideg') {
        var p0 = { 顶点数: nodes.length + ' 个' };
        p0[dir ? '弧数' : '边数'] = E.length + ' 条';
        F([0], (dir ? '有向图' : '无向图') + ' G = (V, E)：' + nodes.length + ' 个顶点、' + E.length + ' 条' +
          (dir ? '弧' : '边') + '。' + (dir ? '弧 <v,w> 里 v 是**尾**（从它出发）、w 是**头**（指到它）；' +
            '<v,w> 与 <w,v> 是两条不同的弧。' : '边 (v,w) 不分方向，(v,w) 和 (w,v) 是同一条。') +
          '边表直接写在下面输入框里，换一张图结论照样成立。',
          p0,
          { comp: nodes.map(function () { return 0; }), twin: twin });
        nodes.forEach(function (x) {
          var ei = [];
          E.forEach(function (e, k) { if (e[0] === x || e[1] === x) ei.push(k); });
          if (dir) {
            F([6, 9], '顶点 ' + x + '：入度 ID = ' + ind[x] + '（指进来的 ' +
              (E.filter(function (e) { return e[1] === x; }).map(function (e) { return '<' + e[0] + ',' + e[1] + '>'; }).join(' ') || '无') +
              '）、出度 OD = ' + outd[x] + '（指出去的 ' +
              (E.filter(function (e) { return e[0] === x; }).map(function (e) { return '<' + e[0] + ',' + e[1] + '>'; }).join(' ') || '无') +
              '）→ 度 TD = ID + OD = ' + deg[x] + '。',
              { 顶点: String(x), 入度: ind[x] + '', 出度: outd[x] + '', 度: deg[x] + '' },
              { ehl: ei, nhl: [x], v: x, twin: twin });
          } else {
            F([1], '顶点 ' + x + ' 挂着 ' + deg[x] + ' 条边：' +
              (ei.map(function (k) { return '(' + E[k][0] + ',' + E[k][1] + ')'; }).join(' ') || '一条也没有——它是孤立点') +
              ' → TD(' + x + ') = ' + deg[x] + '。',
              { 顶点: String(x), 度: deg[x] + '', 奇偶: deg[x] % 2 ? '奇' : '偶' },
              { ehl: ei, nhl: [x], v: x, twin: twin });
          }
        });
        if (dir) {
          F([7, 8], '★ 握手定理（有向版）：Σ入度 = ' + si + '、Σ出度 = ' + so + '，都恰好等于弧数 |A| = ' + E.length +
            '；两者相加才等于 2|A| = ' + sd + '。因为每条弧**必然**一端进、一端出，谁也不多谁也不少。',
            { 'Σ入度': si + ' = |A|', 'Σ出度': so + ' = |A|', 度之和: sd + ' = 2×' + E.length },
            { comp: nodes.map(function () { return 0; }), done: true, twin: twin });
          if (twin.length) {
            F([10], '注意 ' + twin.map(arcOf).join('、') + ' 这几条：图里同时有 <a,b> 和 <b,a>，它们是**两条不同的弧**，' +
              '各算一次出度、各算一次入度。画面里把它们画成上下分开的两条，免得看成一条无向边。',
              { 反向弧对: twin.map(arcOf).join(' ') || '无' }, { ehl: twin.slice(), twin: twin });
          }
          var kn = nodes.length * (nodes.length - 1);
          F([12, 13], '对照有向完全图：' + nodes.length + ' 个点两两互指，该有 n(n−1) = ' + kn + ' 条弧，现在只有 ' + E.length +
            ' 条' + (E.length === kn ? '——正好是有向完全图。' : '，差 ' + (kn - E.length) + ' 条。') +
            '有向完全图里每个点 ID = OD = n−1 = ' + (nodes.length - 1) + '，度为 2(n−1)。',
            { 有向完全图: 'n(n−1) = ' + kn, 当前弧数: E.length + ' 条', 每点度: '入=出=' + (nodes.length - 1) },
            { done: true, comp: nodes.map(function () { return 0; }), twin: twin });
        } else {
          F([2, 3, 4], '★ 握手定理：把每个顶点的度加起来 = ' + deg.join(' + ') + ' = **' + sd + '**，而边数是 ' + E.length +
            ' 条，2|E| = ' + 2 * E.length + '。两者相等不是巧合——每条边都给两个端点各记 1 个度。' +
            '推论：度为奇数的顶点有 ' + odd + ' 个，**必是偶数个**。',
            { 度之和: sd + ' = 2×' + E.length, 边数: E.length + ' 条', 奇数度顶点: odd + ' 个' },
            { comp: nodes.map(function () { return 0; }), done: true, twin: twin });
          if (isolated.length) {
            F([1], '补一句：' + isolated.join('、') + ' 号是**孤立点**，度为 0（偶数）。它照样算顶点，' +
              '而且在连通性那一栏里它会自成一个分量。',
              { 孤立点: isolated.join('、'), 度: '0' }, { nhl: isolated, comp: nodes.map(function () { return 0; }), twin: twin });
          }
          var ku = nodes.length * (nodes.length - 1) / 2;
          F([12], '对照完全图：' + nodes.length + ' 个顶点的无向完全图 K' + nodes.length + ' 该有 n(n−1)/2 = ' + ku +
            ' 条边，现在只有 ' + E.length + ' 条' + (E.length === ku ? '——正好是完全图。' : '，差 ' + (ku - E.length) + ' 条。') +
            '完全图里每个点的度都是 n−1 = ' + (nodes.length - 1) + '。',
            { 完全图边数: 'n(n−1)/2 = ' + ku, 当前边数: E.length + ' 条', 每点度: (nodes.length - 1) + '' },
            { done: true, comp: nodes.map(function () { return 0; }), twin: twin });
        }
        return { code: CODE, frames: frames };
      }

      /* -------- 连通分量 / 强连通分量 -------- */
      var adj = nodes.map(function () { return []; });
      E.forEach(function (e, k) {
        adj[e[0]].push({ to: e[1], e: k });
        if (dir) adj[e[1]].push({ to: e[0], e: k, back: true }); else adj[e[1]].push({ to: e[0], e: k });
      });
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
      F([14, 15, 20], (dir ? '先**忽略弧的方向**，把图当成无向图看能不能走到——这样分出来的块叫弱连通分量。' : '') +
        '求分量的办法只有一句：**从任意没染过色的点出发走一遍，染到的就是一块**，再找下一个没染色的。',
        { 顶点数: nodes.length + ' 个', 边数: E.length + ' 条' }, { comp: comp.slice(), twin: twin });
      var used = [];
      for (i = 0; i < cc; i++) used[i] = nodes.filter(function (x) { return comp[x] === i; });
      for (i = 0; i < cc; i++) {
        var mem = used[i];
        var ei2 = [];
        E.forEach(function (e, k) { if (comp[e[0]] === i && comp[e[1]] === i) ei2.push(k); });
        F([21, 22], '第 ' + (i + 1) + ' 块：从 ' + mem[0] + ' 号出发一次遍历，染到 ' + mem.join('、') +
          ' 共 ' + mem.length + ' 个点、内部 ' + ei2.length + ' 条' + (dir ? '弧' : '边') + '。' +
          (mem.length === 1 && ei2.length === 0 ? '它一个邻居都没有，是**孤立点自成一分量**。' : '') +
          ' 块外的点和它互相走不到。',
          { 分量数: (i + 1) + ' / ' + cc, 本块顶点: mem.join(' '), 本块边数: ei2.length + ' 条' },
          { comp: comp.map(function (c, k) { return c <= i ? c : -1; }), nhl: mem, ehl: ei2, twin: twin });
      }
      F([14, 15], '★ ' + nodes.length + ' 个顶点被切成 **' + cc + ' 个' + (dir ? '弱' : '') + '连通分量**：' +
        used.map(function (m, k) { return '{' + m.join(' ') + '}'; }).join(' + ') +
        '。"极大"是关键词——每块都已经是能扩的最大范围，再往里加点就不连通了。',
        { 分量数: cc + ' 个', 划分: used.map(function (m) { return '{' + m.join(' ') + '}'; }).join('+') },
        { comp: comp.slice(), done: true, twin: twin });
      if (dir) {
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
        F([16, 17], '现在把方向认真当回事：有向图要求 **v 能走到 w 且 w 也能走到 v** 才算一处，这叫强连通。' +
          '逐对查"互相可达"之后，' + nodes.length + ' 个点被切成 ' + sc + ' 个**强连通分量**：' +
          Array.apply(null, Array(sc)).map(function (_, k) {
            return '{' + nodes.filter(function (x) { return scc[x] === k; }).join(' ') + '}';
          }).join(' + '),
          { 强连通分量: sc + ' 个', 弱连通分量: cc + ' 个' }, { comp: scc.slice(), done: true, twin: twin });
        F([16, 17], '★ 同一张图：忽略方向是 ' + cc + ' 块，讲方向是 ' + sc + ' 块。' +
          (sc > cc ? '多出来的都是被方向拆开的小块——单向能到、回不来就不算强连通。' : '') +
          '有向图里"连通"这个词本身就有好几种口径（强连通 / 双向连通 / 弱连通），做题先看题目问的是哪一种。',
          { 强连通分量: sc + ' 个', 弱连通分量: cc + ' 个' }, { comp: scc.slice(), done: true, twin: twin });
      }
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 560, g = '';
      var n = s.nodes, pos = s.pos, dir = s.dir, twin = s.twin || [];
      var connScene = s.scene === 'conn' || s.scene === 'sconn';
      var SCNM = { deg: '① 无向图：度与握手定理', ideg: '② 有向图：入度与出度', conn: '③ 连通分量', sconn: '④ 强连通分量' };
      g += h.txt(W / 2, 28, SCNM[s.scene] + ' · ' + n + ' 个顶点、' + s.E.length + ' 条' + (dir ? '弧' : '边'),
        { size: 17, w: 600 });
      g += h.txt(30, 50, '图例：橙=当前' + (dir ? '弧' : '边') + ' 蓝=当前顶点 ' +
        (connScene ? '颜色块=所属分量（同一颜色一块）' : '下面一行是各顶点的度数') + ' 灰=未涉及',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      /* 边 / 弧：互为反向的两条各让开一侧，免得叠成一条 */
      s.E.forEach(function (e, k) {
        var A = pos[e[0]], B = pos[e[1]];
        var hot = s.ehl.indexOf(k) >= 0;
        var col = hot ? C.amber : s.comp && s.comp[e[0]] >= 0 && s.comp[e[0]] === s.comp[e[1]] ? PAL[s.comp[e[0]] % PAL.length] : C.grey;
        var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / L, ny = dx / L;                       // 法向
        var off = dir && twin.indexOf(k) >= 0 ? (e[0] < e[1] ? 13 : -13) : 0;
        var sx = A[0] + dx / L * 22 + nx * off, sy = A[1] + dy / L * 22 + ny * off;
        var tx = B[0] - dx / L * 24 + nx * off, ty = B[1] - dy / L * 24 + ny * off;
        if (!dir) g += h.line(sx, sy, tx, ty, { stroke: col, sw: hot ? 2.8 : 1.6 });
        else if (off) g += h.curve(sx, sy, (sx + tx) / 2 + nx * off * 1.7, (sy + ty) / 2 + ny * off * 1.7, tx, ty,
          { stroke: col, sw: hot ? 2.8 : 1.8, head: 8 });
        else g += h.arrow(sx, sy, tx, ty, { stroke: col, sw: hot ? 2.8 : 1.6, head: 8 });
      });
      /* 顶点 */
      for (var i = 0; i < n; i++) {
        var c = s.comp ? s.comp[i] : -1;
        var isHot = s.nhl.indexOf(i) >= 0;
        g += h.circle(pos[i][0], pos[i][1], 21, {
          fill: isHot ? C.amberBg : '#fff',
          stroke: isHot ? C.amber : c >= 0 ? PAL[c % PAL.length] : C.grey, sw: isHot ? 3.2 : 1.8
        });
        g += h.txt(pos[i][0], pos[i][1] + 5, String(i), { size: 14, w: 700 });
      }
      /* 下方表：度数场景给度/入出度，连通场景给分量归属 */
      var ty0 = 452, cw = Math.min(74, Math.floor((W - 120) / n));
      var x0 = (W - n * (cw + 6)) / 2;
      var deg = [], ind = [], outd = [];
      for (var q0 = 0; q0 < n; q0++) { deg[q0] = 0; ind[q0] = 0; outd[q0] = 0; }
      s.E.forEach(function (e) {
        deg[e[0]]++; deg[e[1]]++;
        if (dir) { outd[e[0]]++; ind[e[1]]++; }
      });
      if (connScene) {
        g += h.txt(x0 - 8, ty0 + 18, '顶点', { size: 11.5, fill: C.muted, anchor: 'end' });
        g += h.txt(x0 - 8, ty0 + 52, '分量', { size: 11.5, fill: C.muted, anchor: 'end' });
        for (var r1 = 0; r1 < n; r1++) {
          var hh1 = s.nhl.indexOf(r1) >= 0, cc1 = s.comp ? s.comp[r1] : -1;
          g += h.rect(x0 + r1 * (cw + 6), ty0, cw, 26, { fill: '#fff', stroke: hh1 ? C.amber : C.line, sw: hh1 ? 2 : 1, rx: 4 });
          g += h.txt(x0 + r1 * (cw + 6) + cw / 2, ty0 + 18, String(r1), { size: 12.5, w: hh1 ? 700 : 400 });
          g += h.rect(x0 + r1 * (cw + 6), ty0 + 34, cw, 26, {
            fill: cc1 >= 0 ? PAL[cc1 % PAL.length] : '#f8fafc',
            stroke: cc1 >= 0 ? PAL[cc1 % PAL.length] : C.line, sw: 1.2, rx: 4
          });
          g += h.txt(x0 + r1 * (cw + 6) + cw / 2, ty0 + 52, cc1 >= 0 ? '第 ' + (cc1 + 1) + ' 块' : '—',
            { size: 11.5, w: 700, fill: cc1 >= 0 ? '#fff' : C.muted });
        }
      } else {
        g += h.txt(x0 - 8, ty0 + 18, dir ? '入度' : '度', { size: 11.5, fill: C.muted, anchor: 'end' });
        for (var r2 = 0; r2 < n; r2++) {
          var hot2 = s.nhl.indexOf(r2) >= 0;
          g += h.rect(x0 + r2 * (cw + 6), ty0, cw, 26, { fill: hot2 ? C.amberBg : '#fff', stroke: hot2 ? C.amber : C.line, sw: hot2 ? 2 : 1, rx: 4 });
          g += h.txt(x0 + r2 * (cw + 6) + cw / 2, ty0 + 18, String(dir ? ind[r2] : deg[r2]), { size: 13, w: hot2 ? 700 : 400 });
          g += h.txt(x0 + r2 * (cw + 6) + cw / 2, ty0 + 40, String(r2), { size: 10.5, fill: C.muted });
        }
        if (dir) {
          g += h.txt(x0 - 8, ty0 + 66, '出度', { size: 11.5, fill: C.muted, anchor: 'end' });
          for (var r3 = 0; r3 < n; r3++) {
            var hot3 = s.nhl.indexOf(r3) >= 0;
            g += h.rect(x0 + r3 * (cw + 6), ty0 + 48, cw, 26, { fill: hot3 ? C.amberBg : '#fff', stroke: hot3 ? C.amber : C.line, sw: hot3 ? 2 : 1, rx: 4 });
            g += h.txt(x0 + r3 * (cw + 6) + cw / 2, ty0 + 66, String(outd[r3]), { size: 13, w: hot3 ? 700 : 400 });
          }
        }
      }
      var note;
      if (connScene) {
        var nc = s.comp && s.comp.indexOf(-1) < 0 && s.comp ? Math.max.apply(null, s.comp) + 1 : 0;
        note = s.done && nc ? '★ ' + n + ' 个点被切成 ' + nc + ' 块，每个顶点恰好属于一块'
          : (dir ? '先按"忽略方向能不能走到"分块，再单独看强连通' : '从没染色的点走一遍，染到的就是一块');
      } else if (dir) {
        note = s.done ? '★ Σ入度 = Σ出度 = 弧数；<a,b> 与 <b,a> 是两条弧'
          : '入度 = 指进来几条弧，出度 = 指出去几条弧';
      } else {
        note = s.done ? '★ Σ度 = ' + sd2(deg) + ' = 2 × 边数 ' + s.E.length + '（握手定理）'
          : '度 = 挂了几条边；无向图一条边给两端各加 1，所以度之和一定是偶数';
      }
      g += h.txt(W / 2, H - 18, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
  function sd2(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
})();
