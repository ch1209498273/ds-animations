/* 动画：二叉树的顺序存储与主要特性（408 大纲 四(二)2、四(一)3） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '// 顺序存储：用一维数组存二叉树，靠下标算关系（下标从 1 起）',
    '#define MAXN 16',
    'typedef struct {',
    '    TElemType sq[MAXN];        // 结点按完全二叉树编号入格',
    '    int n;                     // 实际结点数',
    '} CSqTree;',
    '',
    'TElemType Parent(CSqTree T, int i) {',
    '    if (i > 1)   return T.sq[i / 2];        // ⌊i/2⌋，1 是根没有双亲',
    '    return NULL;',
    '}',
    'TElemType LChild(CSqTree T, int i) {',
    '    if (2*i <= T.n)  return T.sq[2 * i];    // 左孩子 = 2i',
    '    return NULL;',
    '}',
    'TElemType RChild(CSqTree T, int i) {',
    '    if (2*i + 1 <= T.n)  return T.sq[2*i+1];// 右孩子 = 2i+1',
    '    return NULL;',
    '}',
    '/* 由此推出二叉树的五条性质（与存储无关，但编号一看就懂）',
    '   ① 第 i 层至多 2^(i−1) 个结点（i 从 1 起）',
    '   ② 深度 h 的二叉树至多 2^h − 1 个结点',
    '   ③ 任何二叉树：叶子数 n0 = 度为 2 的结点数 n2 + 1',
    '   ④ n 个结点的完全二叉树深度 = ⌊log2 n⌋ + 1 = ⌈log2(n+1)⌉',
    '   ⑤ 结点 i 的双亲 ⌊i/2⌋、左孩子 2i、右孩子 2i+1 */'
  ];

  var NAMES = 'ABCDEFGHIJ';
  /* 一棵 7 结点的完全二叉树（下标 1..7 连续无空位） */
  function complete(k) { return Math.pow(2, k) - 1; }
  function buildNodes(mode) {
    var list = [];
    if (mode === 'full') {
      for (var i = 1; i <= 7; i++) list.push({ i: i, lab: NAMES[i - 1] });
    } else if (mode === 'right') {
      /* 每层只有右孩子：1 → 3 → 7 → 15，4 个结点却要用到第 15 格 */
      [1, 3, 7, 15].forEach(function (ix, k) { list.push({ i: ix, lab: NAMES[k] }); });
    } else {
      /* 稀疏：完全树删掉中间几个结点，数组里的空位就露出来了 */
      [1, 2, 4, 5].forEach(function (ix, k) { list.push({ i: ix, lab: NAMES[k] }); });
    }
    return list;
  }
  function lvl(i) { return Math.floor(Math.log(i) / Math.LN2); }   // 0 起

  DSC.reg({
    id: 'treeSeqStore', ch: 5, name: '二叉树的顺序存储与主要特性',
    note: '408 大纲 四(二)2 顺序存储 + 四(一)3 二叉树性质（i ↔ 2i/2i+1、n₀=n₂+1、⌊log₂n⌋+1）',
    guide: [
      '顺序存储**不存指针**：结点按"完全二叉树编号"塞进一维数组，父子关系全靠下标算——`i` 的双亲是 ⌊i/2⌋、左孩子 2i、右孩子 2i+1',
      '这套公式**只对完全二叉树成立**。树一旦不满，数组里就得留空位；斜成一条右链时，4 个结点要开到第 15 格，浪费 73%',
      '反过来看第④条：n 个结点的完全二叉树深度只有 ⌊log₂n⌋+1——所以堆、优先队列、线段树全都长成完全二叉树的样子',
      '第③条 `n₀ = n₂ + 1` 与存储无关，是二叉树本身的性质：每多一个分支就多一个叶子'
    ],
    inputs: [
      {
        key: 'mode', label: '树形', type: 'select', options: [
          ['full', '满二叉树（7 结点，顺序存储的最佳场景）'],
          ['sparse', '不完全（4 结点，数组里出现空位）'],
          ['right', '右斜链（4 结点，却要开到第 15 格）']
        ], value: 'right'
      },
      {
        key: 'scene', label: '内容', type: 'select', options: [
          ['map', '编号 ↔ 下标、双亲与孩子公式'],
          ['props', '五条主要特性逐条验证']
        ], value: 'map'
      }
    ],

    run: function (v) {
      var nodes = buildNodes(v.mode), frames = [];
      var maxI = nodes.reduce(function (a, x) { return Math.max(a, x.i); }, 0);
      var used = nodes.length, cells = Math.max(maxI, 7);
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          nodes: nodes.map(function (x) { return { i: x.i, lab: x.lab }; }),
          cells: cells, mode: v.mode, used: used, hl: null, pair: null
        }, snap || {}) });
      }
      var labOf = {};
      nodes.forEach(function (x) { labOf[x.i] = x.lab; });

      if (v.scene === 'props') {
        var lv = {}, n0 = 0, n1 = 0, n2 = 0;
        nodes.forEach(function (x) {
          var hasL = labOf[2 * x.i] != null, hasR = labOf[2 * x.i + 1] != null;
          var d = (hasL ? 1 : 0) + (hasR ? 1 : 0);
          lv[lvl(x.i)] = (lv[lvl(x.i)] || 0) + 1;
          if (d === 0) n0++; else if (d === 2) n2++; else n1++;
        });
        var depth = Math.max.apply(null, nodes.map(function (x) { return lvl(x.i) + 1; }));
        F([19, 20], '性质①：第 i 层**至多** 2^(i−1) 个结点。这棵树各层实际结数是 ' +
          Object.keys(lv).sort().map(function (k) { return '第' + (+k + 1) + '层 ' + lv[k] + ' 个（上限 ' + Math.pow(2, +k) + '）'; }).join('；') +
          '。"至多"取等号时就是满二叉树。',
          { 层数: depth + '' }, { hl: { level: 0 } });
        var cap = Math.pow(2, depth) - 1;
        F([21], '性质②：深度 h = ' + depth + ' 的二叉树**至多** 2^h − 1 = ' + cap + ' 个结点。' +
          (used === cap ? '这棵正好取满 → 它是满二叉树，顺序存储一格不浪费。'
            : '这棵只有 ' + used + ' 个 → 空着 ' + (cap - used) + ' 个位置，顺序存储就得为它们留格子。'),
          { 最多结点数: cap + '', 实际: used + ' 个' }, { hl: {} });
        F([22], '性质③：**任何**二叉树都有 n₀ = n₂ + 1。数一下这棵树：叶子 n₀ = ' + n0 +
          '、度为 2 的 n₂ = ' + n2 + '、度为 1 的 n₁ = ' + n1 + '。' + n0 + ' = ' + n2 + ' + 1 ' + (n0 === n2 + 1 ? '✓' : '✗') +
          '。直觉：每个二度结点多开出两条分支，分支总数比结点数恰好多 1。',
          { n0: n0 + '', n1: n1 + '', n2: n2 + '', 校验: n0 + ' = ' + n2 + ' + 1' }, { hl: { n0: true } });
        var fl = Math.floor(Math.log(used) / Math.LN2) + 1;
        F([23], '性质④：n = ' + used + ' 个结点的**完全**二叉树深度 = ⌊log₂n⌋ + 1 = ⌊' +
          (Math.log(used) / Math.LN2).toFixed(3) + '⌋ + 1 = ' + fl + '。' +
          '这条是顺序存储能"又矮又省"的原因——堆、线段树、优先队列都用它。',
          { 完全树深度: '⌊log₂' + used + '⌋+1 = ' + fl }, { hl: { complete: true } });
        F([24], '性质⑤：结点 i 的双亲是 ⌊i/2⌋、左孩子 2i、右孩子 2i+1。' +
          '正因为这五条只对"按层连续编号"的完全二叉树成立，' +
          (v.mode === 'right' ? '而眼前这条右斜链把 4 个结点摊到了第 15 格——顺序存储在这里最不划算。'
            : v.mode === 'sparse' ? '眼前这棵不满，数组里就出现了空格子。'
            : '这棵满二叉树用顺序存储最划算，一格都不浪费。'),
          { 数组占用: used + '/' + cells, 浪费: Math.round((1 - used / cells) * 100) + '%' },
          { hl: { i: 1 }, pair: { p: null, l: 2, r: 3 }, done: true });
        return { code: CODE, frames: frames };
      }

      F([0, 3], '一维数组 sq[]，下标从 1 开始。结点是按"完全二叉树的层序编号"塞进去的——' +
        '所以树里每个结点下面都写着它的下标。',
        { 结点数: used + ' 个', 数组格数: cells + ' 格' }, {});
      [1, 2, 4].forEach(function (i) {
        if (labOf[i] == null) return;
        var p = i > 1 ? labOf[Math.floor(i / 2)] : null, l = labOf[2 * i], r = labOf[2 * i + 1];
        F([8, 9, 10, 11, 12, 13, 14, 15, 16], '看结点 ' + labOf[i] + '（下标 i = ' + i + '）：双亲 sq[⌊' + i + '/2⌋] = sq[' +
          Math.floor(i / 2) + '] = ' + (p || '无（它是根）') + '；左孩子 sq[2i] = sq[' + (2 * i) + '] = ' + (l || '空') +
          '；右孩子 sq[2i+1] = sq[' + (2 * i + 1) + '] = ' + (r || '空') + '。三个关系都是**一次除法或乘法**，不需要指针。',
          { 当前结点: labOf[i] + '（i=' + i + '）', 双亲: p || '—', 左孩子: l || '—', 右孩子: r || '—' },
          { hl: { i: i }, pair: { p: i > 1 ? Math.floor(i / 2) : null, l: 2 * i, r: 2 * i + 1 } });
      });
      if (v.mode === 'right') {
        F([3, 4], '但这棵是**右斜链**：A 在 1 号、B 是它的右孩子只能落在 3 号、C 再落 7 号、D 落 15 号。' +
          '中间 2、4、5、6…这些格子必须留着——它们是"不存在但被编号占了位"的左孩子。',
          { 结点数: '4 个', 数组格数: '15 格', 浪费: '73%' }, { hl: { chain: true } });
        F([13, 16], '后果有两个：① 数组要开到 2^h − 1 = 15 格才放得下 4 个结点；② 公式仍然"对"，' +
          '只是 LChild(1) 会返回一个空格子——所以顺序存储**只适合完全二叉树或接近完全的树**。',
          { 结点数: '4 个', 数组格数: '15 格', 浪费: '73%' }, { hl: { waste: true } });
      } else if (v.mode === 'sparse') {
        F([3, 4], '这棵只有 4 个结点（A 的左孩子 B，B 的左右孩子 D、E）。按层编号它们是 1、2、4、5——' +
          '3 号格子是空的（A 没有右孩子），可它不能被省掉，否则 2i+1 就算错位置了。',
          { 结点数: '4 个', 数组格数: '7 格', 浪费: '43%' }, { hl: { holes: [3] } });
      } else {
        F([3, 4], '这棵是满二叉树：下标 1..7 连续无空位，数组一格不浪费。' +
          '顺序存储在这种树上反而比链式更省——**一个指针域都不用存**。',
          { 结点数: '7 个', 数组格数: '7 格', 浪费: '0%' }, { hl: { tight: true } });
      }
      F([24], '★ 小结：顺序存储用"下标算关系"换掉了指针，代价是必须按完全二叉树编号。' +
        '4 个结点的右斜链要占 15 格，而同样这 4 个结点用链式只存 4 个结点 + 4 个指针——' +
        '这就是教材那句"顺序存储仅适用于完全二叉树"的来由。',
        { 结点数: used + ' 个', 数组格数: cells + ' 格', 浪费: Math.round((1 - used / cells) * 100) + '%' },
        { hl: {}, done: true });
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 520, g = '';
      var labOf = {}; s.nodes.forEach(function (x) { labOf[x.i] = x.lab; });
      var cellW = Math.min(70, Math.floor((W - 120) / s.cells)), x0 = (W - s.cells * cellW) / 2, ay = 78;
      g += h.txt(W / 2, 30, '二叉树的顺序存储 · 一维数组下标 = 完全二叉树层序编号', { size: 17, w: 600 });
      g += h.txt(30, 52, '图例：蓝=当前结点 绿=它的孩子/双亲 白=数组里的空位（占格但没有结点）',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      function cx(i) { return x0 + (i - 1) * cellW + cellW / 2; }
      function ty(i) { return 196 + lvl(i) * 84; }
      /* 数组 */
      g += h.txt(x0 - 8, ay + 16, 'sq[]', { size: 12.5, w: 700, fill: C.muted, anchor: 'end' });
      for (var i = 1; i <= s.cells; i++) {
        var has = labOf[i] != null;
        var isHl = s.hl && s.hl.i === i, isPair = s.pair && (s.pair.p === i || s.pair.l === i || s.pair.r === i);
        g += h.rect(x0 + (i - 1) * cellW, ay, cellW - 4, 40, {
          fill: isHl ? C.blueBg : isPair ? C.greenBg : has ? '#fff' : '#f1f5f9',
          stroke: isHl ? C.blue : isPair ? C.green : has ? C.grey : '#e2e8f0',
          sw: isHl || isPair ? 2.4 : 1.2, rx: 5, dash: has ? null : '4,3'
        });
        g += h.txt(cx(i), ay + 26, has ? labOf[i] : '', { size: 15, w: 700 });
        g += h.txt(cx(i), ay + 54, String(i), { size: 10.5, fill: has ? C.muted : '#b9c3cf' });
      }
      g += h.txt(x0 + s.cells * cellW + 6, ay + 26, '下标', { size: 10.5, fill: C.muted, anchor: 'start' });
      /* 树 */
      s.nodes.forEach(function (x) {
        var p = x.i > 1 ? Math.floor(x.i / 2) : null;
        if (p != null && labOf[p] != null) {
          var hot = (s.hl && s.hl.i === x.i) || (s.hl && s.hl.i === p);
          g += h.line(cx(p), ty(p) + 20, cx(x.i), ty(x.i) - 20, { stroke: hot ? C.blue : C.grey, sw: hot ? 2.4 : 1.4 });
        }
      });
      s.nodes.forEach(function (x) {
        var isHl = s.hl && s.hl.i === x.i;
        var isPair = s.pair && (s.pair.p === x.i || s.pair.l === x.i || s.pair.r === x.i);
        g += h.circle(cx(x.i), ty(x.i), 20, {
          fill: isHl ? C.blueBg : isPair ? C.greenBg : '#fff',
          stroke: isHl ? C.blue : isPair ? C.green : C.grey, sw: isHl || isPair ? 3 : 1.6
        });
        g += h.txt(cx(x.i), ty(x.i) + 5, x.lab, { size: 13.5, w: 700 });
        g += h.txt(cx(x.i), ty(x.i) + 34, x.i + '', { size: 10.5, fill: C.muted });
      });
      if (s.hl && s.hl.holes) {
        s.hl.holes.forEach(function (hi) {
          g += h.txt(cx(hi), ay - 12, '空格', { size: 10.5, fill: C.red });
        });
      }
      if (s.hl && s.hl.chain) {
        [2, 4, 5, 6].forEach(function (hi) {
          g += h.txt(cx(hi), ay - 12, '空', { size: 10, fill: C.red });
        });
      }
      var maxLvl = Math.max.apply(null, s.nodes.map(function (x) { return lvl(x.i); }));
      g += h.txt(x0, ty(1) + 62, '第 1 层', { size: 10.5, fill: C.muted, anchor: 'start' });
      for (var L = 1; L <= maxLvl; L++) {
        g += h.txt(x0, ty(Math.pow(2, L)) + 62, '第 ' + (L + 1) + ' 层（至多 ' + Math.pow(2, L) + ' 个）',
          { size: 10.5, fill: C.muted, anchor: 'start' });
      }
      var note = s.done
        ? '★ 顺序存储用下标换掉指针：完全树一格不浪费，右斜链 4 个结点要占 15 格'
        : '下标 i 的双亲 ⌊i/2⌋、左孩子 2i、右孩子 2i+1——不需要任何指针就能算出父子关系';
      g += h.txt(W / 2, H - 20, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
