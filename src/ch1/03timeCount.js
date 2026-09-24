/* 动画：怎么算时间复杂度——四步法、循环计数、为什么是 O(log2 n)（教材 1.4） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '// 四步法：① 找出基本操作 ② 数它执行多少次，得 T(n)',
    '//           ③ 只留最高阶 ④ 系数全丢光 → O(...)',
    '',
    '/* 例1 */',
    'i = 0;                          // 1 次',
    'while (i < n) {                 // 判断 n+1 次（最后一次为假）',
    '    i = i + 1;                  // n 次',
    '    x = 2 * x + 1;              // n 次  ← 基本操作',
    '}',
    'T(n) = 1 + (n+1) + n + n = 3n + 2  →  最高阶 3n  →  丢系数  →  O(n)',
    '',
    '/* 例2 循环变量翻倍：为什么是 O(log2 n) */',
    'i = 1;',
    'while (i < n) {                 // 设一共跑了 k 轮',
    '    i = i * 2;                  // 第 j 轮结束时 i = 2^j',
    '}',
    '循环停下的条件：2^k ≥ n  →  k = ⌈log2 n⌉  →  T(n) = O(log2 n)',
    '',
    '/* 例3 两条法则 */',
    '并列（顺序执行）：T = T1 + T2      →  取最大的那个',
    '嵌套（内外层）：  T = T1 × T2      →  内层依赖外层时改成求和',
    '    for (i = 1; i <= n; i++)          // 外层 n 次',
    '        for (j = 1; j <= i; j++)      // 内层第 i 轮跑 i 次',
    '            y = y + 1;                // Σ i = n(n+1)/2 → O(n²)',
    '',
    '/* 常见量级速查 */',
    '一次赋值 / 顺序表取值            O(1)',
    '循环变量 ×2 或 ÷2（折半查找）    O(log2 n)',
    '单层循环扫一遍                   O(n)',
    '两层独立循环                     O(n²)',
    '每轮减半 × 每轮扫一遍（归并）    O(n log2 n)'
  ];

  DSC.reg({
    id: 'timeCount', ch: 1, name: '怎么算时间复杂度：四步法与 O(log₂n)',
    aim: '数基本操作执行多少次得 T(n)，再**只留最高阶、丢掉系数**——翻倍循环就是 O(log₂n)',
    note: '教材 1.4 算法与算法分析（语句频度 T(n)、渐进时间复杂度、循环计数）',
    keywords: '语句频度 T(n) 基本操作 循环计数 执行次数 对数 log2 等比 每轮翻倍 折半 忽略常数 数量级 四步法 并列相加 嵌套相乘',
    guide: [
      '一句话：时间复杂度不是"测出来的秒数"，是**数出来的执行次数**，然后只保留最高阶项、把系数丢光',
      '① 四步法：找基本操作 → 数它跑几次得 T(n) → 取最高阶 → 丢系数。例1 里 T(n)=3n+2，答案是 O(n)，不是 O(3n+2)',
      '② 最难的一类：循环变量每次 ×2（或 ÷2）。跑 k 轮后 i=2^k，停下的条件是 2^k ≥ n，所以 k=⌈log₂n⌉ —— 这就是 O(log₂n) 的来历，把 n 从 8 拖到 64 数一数就懂了',
      '③ 两条法则：并列相加取最大、嵌套相乘；内层次数依赖外层时改成求和 Σi = n(n+1)/2，所以还是 O(n²)'
    ],
    inputs: [
      {
        key: 'scene', label: '场景', type: 'select', options: [
          ['four', '① 四步法：把 T(n) 数出来'],
          ['log', '② 循环变量翻倍 → O(log₂n)'],
          ['rule', '③ 并列相加、嵌套相乘']
        ], value: 'log'
      },
      { key: 'n', label: '规模 n（2~64）', type: 'number', value: 32, min: 2, max: 64 }
    ],

    run: function (v) {
      var scene = v.scene, n = Math.max(2, Math.min(64, +v.n || 32)), frames = [], i;
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          scene: scene, n: n, step: -1, cnt: { init: 0, test: 0, inc: 0, body: 0 },
          i: 0, x: 0, rounds: [], k: 0, outer: 0, inner: 0, sum: 0, row: -1, done: false, trace: []
        }, snap || {}) });
      }
      function pow2(j) { return Math.pow(2, j); }

      if (scene === 'four') {
        var c = { init: 0, test: 0, inc: 0, body: 0 };
        /* 轨迹累积到 snap.trace 里，渲染层只管画，不再从 step 反推轮次 */
        var tr = [];
        function push(t2) { tr.push(t2); return tr.slice(); }
        F([0, 1], '程序长这样（右边伪代码）。要算它的复杂度，**别猜，数**：' +
          '先找出"最里面那句反复执行的操作"当基本操作，再统计每条语句执行多少次。这里取 n = ' + n + '。',
          { 规模: 'n = ' + n, 基本操作: 'x = 2*x + 1' }, { cnt: c, step: -1, trace: push('（还没开始执行）') });
        c = { init: 1, test: 0, inc: 0, body: 0 };
        F([4], '`i = 0;` 在循环外面，**只执行 1 次**，跟 n 多大没关系。',
          { 语句: 'i = 0;', 次数: '1 次', 累计: '1' },
          { cnt: c, step: 0, i: 0, trace: push('i = 0;  → 1 次') });
        F([5, 6, 7], '头两轮完整走一遍：判 `i < n` 为真 → `i = i+1` → `x = 2*x+1`。' +
          '**每一轮固定 3 次**（1 次判断 + 2 次循环体）。',
          { 轮次: '1 / ' + n, 判断次数: '1 次', 基本操作: '1 次', i: '1' },
          { cnt: { init: 1, test: 1, inc: 1, body: 1 }, step: 1, i: 1,
            trace: push('第 1 轮：判 i=0<' + n + ' 真 → i=1 → x=2x+1') });
        F([5, 6, 7], '第 2 轮同理：i 变成 2，基本操作累计 2 次。到这里规律已经出来了。',
          { 轮次: '2 / ' + n, 判断次数: '2 次', 基本操作: '2 次', i: '2' },
          { cnt: { init: 1, test: 2, inc: 2, body: 2 }, step: 2, i: 2,
            trace: push('第 2 轮：判 i=1<' + n + ' 真 → i=2 → x=2x+1') });
        F([5, 6, 7], '第 3 轮到第 ' + n + ' 轮**完全同构**，不必一帧帧看。数数只需要一句：' +
          '这样的轮次一共 n 个，每轮 3 次。',
          { 轮次: '3 ~ ' + n, 判断次数: n + ' 次', 基本操作: n + ' 次', i: String(n) },
          { cnt: { init: 1, test: n, inc: n, body: n }, step: 3, i: n,
            trace: push('第 3 轮 … 第 ' + n + ' 轮：完全同构，每轮还是 3 次') });
        F([5], '循环为什么停：还要**再多判一次**。i = ' + n + ' 时再判 `i < n` → ' + n + ' < ' + n +
          ' 为假，退出。所以判断一共执行了 **n + 1** 次——这个 +1 是最容易漏的。',
          { 语句: '第 ' + (n + 1) + ' 次判断', 结果: '假 → 退出', 判断次数: (n + 1) + ' 次' },
          { cnt: { init: 1, test: n + 1, inc: n, body: n }, step: 4, i: n,
            trace: push('第 ' + (n + 1) + ' 次判断：' + n + ' < ' + n + ' 为假 → 退出') });
        F([9], '数完了，写出来：**T(n) = 1 + (n+1) + n + n = 3n + 2**。' +
          '把 n = ' + n + ' 代进去是 ' + (3 * n + 2) + ' 次——但注意，这个具体数字**不是答案**。',
          { 'T(n)': '3n + 2', 代入: 'n=' + n + ' → ' + (3 * n + 2) + ' 次', 下一步: '取最高阶' },
          { cnt: c, step: 5, i: n, trace: push('加起来：T(n) = 1 + (n+1) + n + n = 3n + 2'), done: true });
        F([0, 1, 9], '★ 第③④步：只留最高阶 → 3n；系数丢光 → **O(n)**。' +
          '所以 T(n)=3n+2、5n+100、n/2 都归到同一个 O(n)——**常数在渐进意义下没有意义**。' +
          '反过来 O(3n²) → O(n²)，O(n + log n) → O(n)。',
          { 'T(n)': '3n + 2', 最高阶: '3n', 答案: 'O(n)' },
          { cnt: c, step: 6, i: n, trace: push('取最高阶 3n → 丢系数 → O(n)'), done: true });
        return { code: CODE, frames: frames };
      }

      if (scene === 'log') {
        F([11], '这段循环只有一句 `i = i * 2`。问：它跑几轮？' +
          'i 从 1 出发：1 → 2 → 4 → 8 → …，**每轮翻倍**，直到 i ≥ ' + n + ' 才停。',
          { 规模: 'n = ' + n, 起点: 'i = 1', 每轮: '×2' }, { i: 1, rounds: [] });
        var j = 0, arr = [];
        while (pow2(j) < n) {
          arr.push({ j: j + 1, i: pow2(j + 1) });
          F([13, 14], '第 ' + (j + 1) + ' 轮：i = ' + pow2(j) + ' × 2 = ' + pow2(j + 1) + ' = 2^' + (j + 1) +
            '。' + (pow2(j + 1) < n ? '还没到 ' + n + '，继续。' : '已经 ≥ ' + n + '，下一轮判断就退出。'),
            { 轮次: (j + 1) + '', 'i 现在': pow2(j + 1) + ' = 2^' + (j + 1), 距离: 'i < ' + n + (pow2(j + 1) < n ? ' 成立' : ' 不成立') },
            { i: pow2(j + 1), rounds: arr.slice(), k: j + 1 });
          j++;
        }
        var k = j;
        F([15], '一共跑了 ' + k + ' 轮，也就是 **2^' + k + ' = ' + pow2(k) + ' ≥ ' + n + '**。' +
          '解这个不等式：k = ⌈log₂ ' + n + '⌉ = ' + k + '。' +
          '（log₂ ' + n + ' = ' + (Math.log2(n)).toFixed(3).replace(/\.?0+$/, '') + '，向上取整 ' + k + '）',
          { 不等式: '2^k ≥ ' + n, k: '⌈log₂' + n + '⌉ = ' + k, 轮数: k + ' 轮' }, { i: pow2(k), rounds: arr.slice(), k: k });
        F([12, 15], '★ 结论：**循环变量每次 ×2（或 ÷2），轮数就是 ⌈log₂n⌉，T(n) = O(log₂n)**。' +
          'n = ' + n + ' 只要 ' + k + ' 轮；n 翻到 64 也才 ' + Math.ceil(Math.log2(64)) + ' 轮——' +
          'n 翻倍而轮数只加 1，这就是对数增长，也是折半查找快的根本原因。',
          { 当前: 'n = ' + n + ' → ' + k + ' 轮', 对照: 'n = 64 → ' + Math.ceil(Math.log2(64)) + ' 轮', 'T(n)': 'O(log₂n)' },
          { i: pow2(k), rounds: arr.slice(), k: k, done: true });
        return { code: CODE, frames: frames };
      }

      /* rule：并列相加、嵌套相乘 */
      var EX = [
        ['并列：两个独立循环', 'O(n) + O(n²) → O(n²)', '顺序执行就相加，再取最大的那一项'],
        ['嵌套：内外各 n 次', 'n × n → O(n²)', '内层每轮都跑满 n 次，直接相乘'],
        ['嵌套：内层依赖外层', 'Σ i = n(n+1)/2 → O(n²)', '第 i 轮只跑 i 次，用等差求和，不是 n²'],
        ['嵌套：内层翻倍', 'n × ⌈log₂n⌉ → O(n log n)', '外层 n 轮，每轮里层对数轮（归并就是这个）'],
        ['循环变量平方增长', 'i = 1,4,9… → O(√n)', 'i 涨到 n 需要 √n 步，别条件反射写 O(n)']
      ];
      F([17], '判断法则只有两条，但**用错就全错**。逐条看：', { 条目: EX.length + ' 条', 法则: '并列相加、嵌套相乘' }, { row: -1, rows: EX });
      for (i = 0; i < EX.length; i++) {
        F(i === 2 ? [20, 21, 22] : (i === 3 ? [13, 18] : (i === 4 ? [23] : [18, 19])),
          EX[i][0] + ' → **' + EX[i][1] + '**：' + EX[i][2],
          { 例子: EX[i][0], 结果: EX[i][1], 理由: EX[i][2] }, { row: i, rows: EX });
      }
      F([0, 1, 17, 18], '★ 一条容易漏的：**"最后一次判断为假"也要算一次**，所以 `while(i<n)` 判断 n+1 次。' +
          '不过在渐进意义下 +1 也会被丢掉——**它影响的是 T(n) 的精确值，不影响 O() 的阶**。' +
          '做题时先写 T(n)，再取阶，别一上来就写 O()。',
        { 第一步: '写 T(n)', 第二步: '取最高阶', 第三步: '丢系数' }, { row: -1, rows: EX, done: true });
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 560, g = '';
      var nm = { four: '① 四步法数 T(n)', log: '② 循环变量翻倍 → O(log₂n)', rule: '③ 并列与嵌套' };
      g += h.txt(W / 2, 30, '怎么算时间复杂度 · ' + nm[s.scene] + ' · 数次数，不是测秒数', { size: 19, w: 700 });

      if (s.scene === 'four') {
        g += h.txt(34, 58, '图例：橙 = 正在执行的语句　右侧计数条 = 各语句累计执行次数。n = ' + s.n,
          { size: 13, fill: C.muted, anchor: 'start' });
        /* 变量与计数条 */
        var bx = 34, by = 96;
        g += h.rect(bx, by, 250, 58, { fill: s.i >= s.n ? C.greenBg : C.blueBg, stroke: s.i >= s.n ? C.green : C.blue, sw: 2.2, rx: 8 });
        g += h.txt(bx + 125, by + 24, 'i = ' + s.i, { size: 20, w: 800 });
        g += h.txt(bx + 125, by + 47, s.i >= s.n ? 'i < n 为假，已退出' : 'i < ' + s.n + ' 成立', { size: 12.5, fill: C.muted });
        var bars = [['判断 i<n', s.cnt.test, s.n + 1], ['i = i+1', s.cnt.inc, s.n], ['x = 2*x+1', s.cnt.body, s.n]];
        bars.forEach(function (b, bi) {
          var y = by + 84 + bi * 62;
          g += h.txt(bx, y, b[0], { size: 14, w: 700, anchor: 'start' });
          g += h.rect(bx, y + 10, 250, 26, { fill: '#f1f5f9', stroke: C.line, sw: 1, rx: 5 });
          var wv = Math.max(3, 250 * b[1] / Math.max(b[2], 1));
          g += h.rect(bx, y + 10, wv, 26, { fill: bi === 2 ? C.amber : '#93c5fd', stroke: bi === 2 ? C.amber : '#93c5fd', sw: 1, rx: 5 });
          g += h.txt(bx + 258, y + 28, b[1] + ' 次', { size: 14, w: 700, anchor: 'start' });
          if (bi === 2) g += h.txt(bx + 320, y + 28, '← 基本操作', { size: 12.5, fill: C.amber, anchor: 'start', w: 700 });
        });
        var t = 3 * s.n + 2;
        g += h.rect(bx, by + 282, 380, 96, { fill: '#f8fafc', stroke: s.step === 99 ? C.green : C.line, sw: s.step === 99 ? 2.4 : 1.2, rx: 8 });
        g += h.txt(bx + 18, by + 312, 'T(n) = 1 + (n+1) + n + n = 3n + 2', { size: 16, w: 800, anchor: 'start' });
        g += h.txt(bx + 18, by + 340, 'n = ' + s.n + ' 时 = ' + t + ' 次', { size: 14.5, anchor: 'start', fill: C.muted });
        g += h.txt(bx + 18, by + 366, '取最高阶 3n → 丢系数 → O(n)', { size: 15, w: 800, anchor: 'start', fill: C.green });
        g += h.txt(470, 110, '执行轨迹（累计到此帧）', { size: 14, w: 700, anchor: 'start' });
        var trc = s.trace || [];
        for (var q = 0; q < trc.length; q++) {
          var y2 = 136 + q * 44, last = q === trc.length - 1;
          g += h.rect(470, y2, 470, 36, { fill: last ? C.amberBg : '#fff', stroke: last ? C.amber : C.line, sw: last ? 2.2 : 1.2, rx: 6 });
          g += h.txt(482, y2 + 24, trc[q], { size: 13.5, anchor: 'start' });
        }
      } else if (s.scene === 'log') {
        g += h.txt(34, 58, '图例：每轮 i 翻倍。数一数跑到 i ≥ ' + s.n + ' 要用几轮，再和 ⌈log₂n⌉ 对一下。',
          { size: 13, fill: C.muted, anchor: 'start' });
        var k = s.k, maxK = Math.max(1, Math.ceil(Math.log2(s.n)));
        var cols = Math.min(8, maxK + 1), cw = Math.min(108, Math.floor((W - 120) / cols));
        /* 阶梯：i = 2^j */
        for (var j2 = 0; j2 <= maxK; j2++) {
          var ci = j2 % cols, ri = Math.floor(j2 / cols);
          var x = 60 + ci * (cw + 8), y = 110 + ri * 92;
          var done2 = j2 <= k;
          g += h.rect(x, y, cw, 56, {
            fill: j2 === k ? C.amberBg : done2 ? '#f0f6ff' : '#fff',
            stroke: j2 === k ? C.amber : done2 ? C.blue : '#e2e8f0', sw: j2 === k ? 2.6 : 1.4, rx: 8
          });
          g += h.txt(x + cw / 2, y + 24, '2^' + j2 + ' = ' + Math.pow(2, j2), { size: 14.5, w: 700 });
          g += h.txt(x + cw / 2, y + 45, j2 === 0 ? '起点 i=1' : '第 ' + j2 + ' 轮', { size: 11.5, fill: C.muted });
          if (ci + 1 < cols && j2 + 1 <= maxK) g += h.txt(x + cw + 4, y + 32, '→', { size: 15, fill: done2 ? C.blue : '#cbd5e1' });
        }
        var byy = 110 + (Math.floor(maxK / cols) + 1) * 92 + 6;
        g += h.rect(60, byy, W - 120, 74, { fill: '#f8fafc', stroke: s.done ? C.green : C.line, sw: s.done ? 2.4 : 1.2, rx: 8 });
        g += h.txt(78, byy + 28, '停下条件：2^k ≥ ' + s.n + '　→　k = ⌈log₂ ' + s.n + '⌉ = ' + k,
          { size: 16.5, w: 800, anchor: 'start' });
        g += h.txt(78, byy + 56, '实际数出来 ' + k + ' 轮　·　n 翻一倍只多 1 轮　→　T(n) = O(log₂ n)',
          { size: 14.5, anchor: 'start', fill: s.done ? C.green : C.muted });
        /* 对照条：n 与轮数 */
        var ref = [8, 16, 32, 64, 128, 256];
        g += h.txt(60, byy + 104, '对照（n 越大越看得出对数有多"便宜"）：', { size: 13.5, fill: C.muted, anchor: 'start' });
        ref.forEach(function (rv, ri2) {
          var x = 60 + ri2 * 148;
          g += h.rect(x, byy + 116, 138, 40, { fill: rv === s.n ? C.blueBg : '#fff', stroke: rv === s.n ? C.blue : C.line, sw: rv === s.n ? 2.2 : 1.1, rx: 6 });
          g += h.txt(x + 69, byy + 133, 'n = ' + rv, { size: 13 });
          g += h.txt(x + 69, byy + 150, Math.ceil(Math.log2(rv)) + ' 轮', { size: 13.5, w: 700, fill: C.green });
        });
      } else {
        var rows = s.rows || [];
        g += h.txt(34, 58, '图例：橙 = 正在讲的那一条。先写 T(n)，再取阶——别一上来就写 O()。',
          { size: 13, fill: C.muted, anchor: 'start' });
        var ty = 100, rh = 62;
        rows.forEach(function (r2, ri3) {
          var y = ty + ri3 * rh, on = s.row === ri3;
          g += h.rect(60, y, 860, rh - 8, { fill: on ? C.amberBg : (ri3 % 2 ? '#f8fafc' : '#fff'), stroke: on ? C.amber : C.line, sw: on ? 2.4 : 1, rx: 6 });
          g += h.txt(78, y + 24, r2[0], { size: 15.5, w: on ? 800 : 700, anchor: 'start' });
          g += h.txt(430, y + 24, r2[1], { size: 15.5, w: 800, anchor: 'start', fill: on ? C.amber : C.ink });
          g += h.txt(78, y + 45, r2[2], { size: 13, fill: C.muted, anchor: 'start' });
        });
      }
      var note = s.done
        ? (s.scene === 'log' ? '★ 循环变量 ×2 或 ÷2 → 轮数 ⌈log₂n⌉ → T(n) = O(log₂n)'
          : '★ 四步：找基本操作 → 数次数得 T(n) → 取最高阶 → 丢系数')
        : '时间复杂度是数出来的执行次数，不是测出来的秒数';
      g += h.txt(W / 2, H - 14, note, { size: 14, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
