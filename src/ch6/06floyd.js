/* 动画：Floyd 算法——逐个中转点松弛 D 矩阵，求任意两顶点间最短路径（附路径重建）
   四张预置图各答一个问题，另有一个「循环顺序」开关演示 k 为什么必须在最外层。 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* ① 教材基准：4 点 5 弧，与改造前一字不差。②③ 直接借用 Dijkstra 那一档的负权图，
     好让两个动画互相印证（Dijkstra 把 v2 定死在 10，Floyd 算出真实答案 0）。 */
  var TEXT_POS = { 0: [90, 290], 1: [330, 105], 2: [330, 480], 3: [580, 290] };
  var SIX_POS = { 0: [90, 300], 1: [280, 105], 2: [280, 495], 4: [470, 105], 3: [470, 495], 5: [615, 300] };
  var NEG_ARCS = [[0, 2, 10], [0, 4, 30], [0, 5, 100], [1, 2, 5], [2, 3, 50], [3, 5, 10], [4, 3, 20], [4, 5, 60], [5, 2, -60]];

  var PRESETS = {
    text: {
      N: 4, arcs: [[0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 0, 4], [0, 3, 7]], pos: TEXT_POS,
      label: '① 教材图（基准，4 点 5 弧）',
      teach: '第 1 张·基准：4 个点的有向网，看**三重循环怎样把 D 矩阵一轮轮改出来**。' +
        '第 k 轮只干一件事：允许"经 v' + 'k' + ' 中转"，把每一对 i→j 都拿 D[i][k] + D[k][j] 比一次。' +
        '注意 v0→v3 的直达弧是 7，最后却被改成 6——它借了别人的路。'
    },
    neg: {
      N: 6, arcs: NEG_ARCS, pos: SIX_POS,
      label: '② 负权无负环：Dijkstra 算错的那张',
      teach: '第 2 张·负权但没负环：这就是 Dijkstra 第 ⑤ 档那张图（多一条 v5→v2 的 −60）。' +
        'Dijkstra 把 v2 第 1 轮就定死在 10；**Floyd 算出来 v0→v2 = 0**——它不挑"先定死谁"，' +
        '而是把每个点都当过中转、反复比，所以负权弧来得及被用上。'
    },
    cyc: {
      N: 6, arcs: [[0, 2, 10], [0, 4, 30], [0, 5, 100], [1, 2, 5], [2, 3, 5], [3, 5, 10], [4, 3, 20], [4, 5, 60], [5, 2, -60]], pos: SIX_POS,
      label: '③ 有负环：对角线自己会变负',
      teach: '第 3 张·有负环：把 ② 里的 v2→v3 从 50 改成 5，回路 v2→v3→v5→v2 就成了 5+10−60 = **−45 的负环**。' +
        '这一张没有"正确答案"可给——但 Floyd 会自己报出来：**跑完之后对角线上出现了负数**，' +
        '意思是"从 v2 出发绕回 v2 还能变短"，最短路根本没有定义。'
    },
    disc: {
      N: 4, arcs: [[0, 1, 2], [1, 2, 3], [0, 2, 20]], pos: TEXT_POS,
      label: '④ 不连通：∞ 一路都是 ∞',
      teach: '第 4 张·不连通：v3 一条边都不接，v2 也只能出去不能回来。' +
        '这一张看的是**实现细节**：∞ 参与加法会溢出，所以内层必须先判 `D[i][k] == ∞ || D[k][j] == ∞` 就跳过；' +
        '跑完 D 里那些 ∞ 是"到不了"，不是"还没算到"。'
    }
  };
  var ORDERS = {
    outer: { label: 'k 在最外层（教材写法）' },
    inner: { label: 'k 挪到最内层（错误写法）' }
  };

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

  /* 一遍标准 Floyd（k 在最外层），供"错误写法"那一档算对照答案用 */
  function solve(N, arcs) {
    var D = [], P = [], INF = Infinity;
    for (var i = 0; i < N; i++) { D.push([]); P.push([]); for (var j = 0; j < N; j++) { D[i].push(i === j ? 0 : INF); P[i].push(-1); } }
    arcs.forEach(function (a) { D[a[0]][a[1]] = a[2]; if (a[0] !== a[1]) P[a[0]][a[1]] = a[0]; });
    for (var k = 0; k < N; k++)
      for (var i2 = 0; i2 < N; i2++)
        for (var j2 = 0; j2 < N; j2++) {
          if (D[i2][k] === INF || D[k][j2] === INF) continue;
          if (D[i2][k] + D[k][j2] < D[i2][j2]) { D[i2][j2] = D[i2][k] + D[k][j2]; P[i2][j2] = P[k][j2]; }
        }
    return { D: D, P: P };
  }

  DSC.reg({
    id: 'floyd', ch: 6, name: 'Floyd：各顶点间最短路径',
    aim: '三重循环枚举中转点，**一次算出所有点对**之间的最短路；负权能算，负环会自己露出来',
    note: '教材 6.6 图的应用（所有顶点间最短路径）',
    keywords: '每对顶点 多源 弗洛伊德 中转点 三重循环 动态规划 负权 负环 路径还原 dist path 矩阵',
    guide: [
      '每一轮只允许一个新中转点 v_k，用它检查全部 i→j：经 k 更短就更新 D[i][j]',
      '核心一行：D[i][j] = min(D[i][j], D[i][k] + D[k][j])；n 轮后 D 就是任意两顶点间的最短路径长度',
      '「图」四张预置图各答一个问题：①基准 ②负权无负环（Dijkstra 算错的那张，这里算得对）③有负环（对角线变负）④不连通（∞ 一路是 ∞）',
      '「循环顺序」是错误演示：把 k 挪到最内层，同一张图会算出不同的 D——末帧把两版的差异逐格列出来',
      '末帧的 D 矩阵就是答案；黄色格子是最近一次被改的，琥珀行列是当前中转点'
    ],
    inputs: [
      { key: 'graph', label: '图', type: 'select', options: [
        ['text', PRESETS.text.label], ['neg', PRESETS.neg.label], ['cyc', PRESETS.cyc.label], ['disc', PRESETS.disc.label]
      ], value: 'text' },
      { key: 'order', label: '循环顺序', type: 'select', options: [
        ['outer', ORDERS.outer.label], ['inner', ORDERS.inner.label]
      ], value: 'outer' }
    ],
    run: function (v) {
      var pre = PRESETS[(v && v.graph) || 'text'] || PRESETS.text;
      var wrong = !!(v && v.order === 'inner');
      var N = pre.N, ARCS = pre.arcs, POS = pre.pos;
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
        o.route = o.route || null; o.arcs = ARCS; o.pos = POS; o.wrong = wrong;
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
      function relax(k, i2, j2) {
        /* 不跳过 i===j：对角线正是"图里有没有负环"的证据（③那一档全靠它）。
           非负权图上 D[i][k] + D[k][i] 不会小于 0，所以这一句不会改变①②④的任何一帧 */
        if (D[i2][k] === INF || D[k][j2] === INF) return;
        var nd = D[i2][k] + D[k][j2];
        if (nd < D[i2][j2]) {
          var old = D[i2][j2];
          D[i2][j2] = nd; P[i2][j2] = P[k][j2];
          F([11, 12, 13], 'D[v' + i2 + '][v' + j2 + ']：经 v' + k + ' 中转 ' + D[i2][k] + '+' + D[k][j2] + ' = ' + nd + ' < 原 ' + (old === INF ? '∞' : old) + ' → 更新为 ' + nd + '，路径 ' + routeStr(i2, j2) + '。',
            { 本轮中转: 'v' + k, 更新: 'D[v' + i2 + '][v' + j2 + ']: ' + (old === INF ? '∞' : old) + ' → ' + nd, 路径: routeStr(i2, j2) },
            snap({ k: k, cell: [i2, j2] }));
        }
      }

      /* 首帧先说清这张图答什么问题（mst / Dijkstra 定下的规矩） */
      F([0], pre.teach, { 图: pre.label, 循环顺序: ORDERS[wrong ? 'inner' : 'outer'].label, 顶点数: N + ' 个', 弧数: ARCS.length + ' 条' }, snap({}));
      F([1, 2, 3, 4, 5, 6], '初始化 D 矩阵：D[i][j] = i→j 的直达弧权（无弧记 ∞），对角线为 0。目标：n 轮后 D[i][j] 即 i 到 j 的最短路径长度。',
        { D: dstr(D[0]) + ' / ' + dstr(D[1]), 中转: '（尚未开始）' }, snap({}));

      if (!wrong) {
        for (var k = 0; k < N; k++) {
          F(2, '第 ' + (k + 1) + ' 轮：允许经 v' + k + ' 中转。逐对检查 D[i][j] 与 D[i][' + k + '] + D[' + k + '][j]——经中转更短就更新，并在 P 中记录。',
            { 本轮中转: 'v' + k, D: dstr(D[0]) + ' / ' + dstr(D[1]) + ' / …' }, snap({ k: k }));
          for (var i2 = 0; i2 < N; i2++) for (var j2 = 0; j2 < N; j2++) relax(k, i2, j2);
        }
      } else {
        /* 错误写法：三层顺序换成 i→j→k。逐格检查时仍然看得见"当前这一轮"，
           但它用的子问题可能还没算出来——末帧拿正确写法的结果来对 */
        for (var ii = 0; ii < N; ii++) {
          F(2, '（错误写法）现在固定 i = v' + ii + '，再逐对 j、k 检查——k 被放到了最内层。',
            { 本轮行: 'v' + ii, D: dstr(D[0]) + ' / ' + dstr(D[1]) + ' / …' }, snap({ k: -1 }));
          for (var jj = 0; jj < N; jj++) for (var kk = 0; kk < N; kk++) relax(kk, ii, jj);
        }
      }

      /* 有没有负环：对角线自己变负就是证据（只有正确写法这一遍的判断有意义） */
      var negCyc = [];
      for (var c = 0; c < N; c++) if (D[c][c] < 0) negCyc.push('v' + c + '（绕回自己 ' + D[c][c] + '）');

      if (wrong) {
        var truth = solve(N, ARCS), diff = [];
        for (var a = 0; a < N; a++) for (var b = 0; b < N; b++)
          if (String(D[a][b]) !== String(truth.D[a][b])) diff.push({ i: a, j: b, ok: truth.D[a][b], bad: D[a][b] });
        F(14, '✗ k 挪到最内层，跑完 n³ 次比较照样错：' + (diff.length
          ? diff.map(function (x) { return 'D[v' + x.i + '][v' + x.j + '] 该是 ' + (x.ok === INF ? '∞' : x.ok) + '，却停在 ' + (x.bad === INF ? '∞' : x.bad); }).join('；') +
            '。原因是算 D[i][j] 时要用到的 D[k][j] 还没轮到被算出来——**k 必须在最外层**，' +
            '才能保证每一轮用的都是"已经允许前 k 个中转点"的结论。'
          : '这次两份结果恰好相同——换一张图（比如①教材图）就能看出差别。'),
          (function () { var p = {}; for (var x = 0; x < N; x++) p['v' + x + ' 行（错）'] = dstr(D[x]); return p; })(),
          snap({ done: true }));
        return { code: CODE, frames: frames };
      }

      if (negCyc.length) {
        F(14, '✗ 跑完发现对角线不是 0：' + negCyc.join('、') + '。对角线为负的意思是"从自己出发绕一圈回来还变短了"，' +
          '也就是**图里有负环**——这些点之间的最短路径根本没有定义（可以再绕一圈，永远更短）。' +
          '这不是 Floyd 算错了，恰恰是它把负环**报**出来了：先查对角线，再谈 D 矩阵。',
          (function () { var p = { 负环证据: negCyc.join('、') }; for (var x = 0; x < N; x++) p['v' + x + ' 行'] = dstr(D[x]); return p; })(),
          snap({ done: true, negCyc: true }));
        return { code: CODE, frames: frames };
      }

      var infCount = 0;
      for (var m1 = 0; m1 < N; m1++) for (var m2 = 0; m2 < N; m2++) if (D[m1][m2] === INF) infCount++;
      /* 举例不能写死 v0→v3：④那张图里它根本到不了，末帧会说出"路径（路径缺失）"这种话 */
      var ex = null;
      for (var e1 = 0; e1 < N && !ex; e1++) for (var e2 = 0; e2 < N; e2++) if (e1 !== e2 && D[e1][e2] < INF) { ex = [e1, e2]; break; }
      F(14, 'Floyd 完成！D 矩阵即任意两顶点间的最短路径长度。' +
        (ex ? '例如 v' + ex[0] + '→v' + ex[1] + ' = ' + D[ex[0]][ex[1]] + '，路径 ' + routeStr(ex[0], ex[1]) + '。' : '') +
        (infCount ? '矩阵里还有 ' + infCount + ' 个 ∞，那是"到不了"，不是"没算到"。' : '') +
        '三重循环，时间复杂度 O(n³)；适合稠密图求全对最短路径（对比：反复调用 Dijkstra）。',
        (function () { var p = {}; for (var a2 = 0; a2 < N; a2++) p['v' + a2 + ' 行'] = dstr(D[a2]); return p; })(),
        snap({ done: true }));
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 560, r = 24;
      var N = s.N, POS = s.pos, ARCS = s.arcs;
      var g = '';
      g += h.txt(340, 34, s.wrong ? 'Floyd（错误写法）：k 被放到了最内层'
        : s.done ? 'Floyd：跑完 ' + N + ' 轮之后的 D 矩阵'
        : s.k < 0 ? 'Floyd：初始化 D 矩阵（直达弧权）' : 'Floyd：第 ' + (s.k + 1) + ' 轮——允许经 v' + s.k + ' 中转', { size: 19, w: 600 });
      // 有向弧：同一对顶点若存在反向弧（本例 0→3 与 3→0），必须弯开画，
      // 否则两条边完全重合、权标挤在同一个点上
      ARCS.forEach(function (a) {
        var A = POS[a[0]], B = POS[a[1]];
        var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / L, uy = dy / L;
        var ca = Math.min(a[0], a[1]), cb = Math.max(a[0], a[1]);
        var pair = ARCS.some(function (x) { return x[0] === cb && x[1] === ca; });
        var x1 = A[0] + ux * r, y1 = A[1] + uy * r, x2 = B[0] - ux * r, y2 = B[1] - uy * r;
        var lx, ly;
        if (pair) {
          // 以「小编号→大编号」为基准定左右两侧，保证反向弧一定弯向另一边
          var CA = POS[ca], CB = POS[cb];
          var cdx = CB[0] - CA[0], cdy = CB[1] - CA[1], cl = Math.sqrt(cdx * cdx + cdy * cdy) || 1;
          var side = a[0] === ca ? -1 : 1;
          var cx = (A[0] + B[0]) / 2 + (-cdy / cl) * 30 * side;
          var cy = (A[1] + B[1]) / 2 + (cdx / cl) * 30 * side;
          g += h.curve(x1, y1, cx, cy, x2, y2, { stroke: C.grey, sw: 1.8 });
          lx = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
          ly = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
        } else {
          g += h.arrow(x1, y1, x2, y2, { stroke: C.grey, sw: 1.8 });
          // 直线弧的权标放在靠源点 35% 处：正中间常被别的边穿过
          lx = x1 + (x2 - x1) * 0.35 - uy * 15;
          ly = y1 + (y2 - y1) * 0.35 + ux * 15;
        }
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
      // D 矩阵（右侧）：格宽按点数收，6 点时 56 会顶出画布；数字宽度再压字号
      var tx = 700, cell = Math.min(56, Math.floor(224 / N)), my = 120, widest = 1;
      for (var w1 = 0; w1 < N; w1++) for (var w2 = 0; w2 < N; w2++) {
        var txt = s.D[w1][w2] === Infinity ? '∞' : String(s.D[w1][w2]);
        if (txt.length > widest) widest = txt.length;
      }
      var fsz = Math.max(10, Math.min(15, (cell - 9) / (widest * 0.62)));
      g += h.txt(tx + 2 * cell, my - 34, 'D 矩阵（行 i → 列 j）', { size: 14, w: 600 });
      // 列头必须画在网格顶边之上：格子带不透明填充且在之后绘制，画在网格内会被第一行盖住
      for (var j2 = 0; j2 < N; j2++) {
        var kCol = s.k === j2;
        g += h.txt(tx + cell + j2 * cell + cell / 2, my - 8, '到 v' + j2, { size: 11.5, fill: kCol ? C.amber : C.muted, w: kCol ? 700 : 400 });
      }
      for (var i3 = 0; i3 < N; i3++) {
        var kRow = s.k === i3;
        g += h.txt(tx + 14, my + i3 * cell + cell / 2 + 4, 'v' + i3 + ' from', { size: 10.5, fill: kRow ? C.amber : C.muted });
        for (var j3 = 0; j3 < N; j3++) {
          var v = s.D[i3][j3];
          var f = '#fff', stroke = C.line, sw2 = 1;
          if (i3 === j3) f = C.greyBg;
          if (s.negCyc && i3 === j3 && v < 0) { f = C.redBg; stroke = C.red; sw2 = 2.5; }
          if (s.cell && s.cell[0] === i3 && s.cell[1] === j3) { f = C.amberBg; stroke = C.amber; sw2 = 2.5; }
          g += h.rect(tx + cell + j3 * cell, my + i3 * cell, cell - 3, cell - 3, { fill: f, stroke: stroke, sw: sw2, rx: 5 });
          g += h.txt(tx + cell + j3 * cell + (cell - 3) / 2, my + i3 * cell + (cell - 3) / 2 + fsz * 0.4,
            v === Infinity ? '∞' : v, { size: fsz, w: s.cell && s.cell[0] === i3 && s.cell[1] === j3 ? 700 : 400, fill: v === Infinity ? C.red : (i3 === j3 && v < 0 ? C.red : C.ink) });
        }
      }
      g += h.txt(tx + 2 * cell, my + N * cell + 24, '黄色 = 最近一次更新的格子 ｜ 琥珀行列 = 当前中转点', { size: 11.5, fill: C.muted });
      if (s.negCyc) g += h.txt(tx + 2 * cell, my + N * cell + 48, '对角线为负 = 图里有负环', { size: 12.5, fill: C.red, w: 700 });
      if (s.route) g += h.txt(tx + 2 * cell, my + N * cell + 48, '当前路径：' + s.route, { size: 12.5, fill: C.blue, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
