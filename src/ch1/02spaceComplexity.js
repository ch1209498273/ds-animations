/* 动画：空间复杂度——辅助空间、原地与非原地、递归栈（教材 1.4） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '/* 空间复杂度 S(n)：算法运行过程中「临时占用」的存储空间，',
    '   一般只算辅助空间，不含输入本身占的那份 */',
    '',
    '/* 例1 把数组反转：两种写法时间都是 O(n)，空间差一个量级 */',
    'void Reverse1(int a[], int n) {        // 非原地',
    '    b = (int *)malloc(n * sizeof(int));    // 辅助数组 O(n)',
    '    for (i = 0; i < n; i++)  b[i] = a[n-1-i];',
    '    for (i = 0; i < n; i++)  a[i] = b[i];',
    '}',
    'void Reverse2(int a[], int n) {        // 原地（in-place）',
    '    for (i = 0; i < n/2; i++) {',
    '        t = a[i];                        // 只多一个临时变量 t',
    '        a[i] = a[n-1-i];',
    '        a[n-1-i] = t;',
    '    }',
    '}',
    '',
    '/* 例2 递归：每层调用都要一份栈帧（实参 + 局部变量 + 返回地址） */',
    'int Fact(int n) {',
    '    if (n == 1)  return 1;',
    '    return n * Fact(n-1);            // 栈深 n → 辅助空间 O(n)',
    '}',
    'int FactIter(int n) {',
    '    f = 1;',
    '    for (i = 2; i <= n; i++)  f = f * i;   // 只有 f、i → O(1)',
    '}',
    '',
    '/* 常见量级 */',
    '顺序表 / 链表本身      S(n) = O(n)',
    'DFS 递归栈 / BFS 队列  S(n) = O(n)',
    '归并排序的辅助数组     S(n) = O(n)',
    '堆排序（原地交换）     S(n) = O(1)',
    '快排的递归栈           S(n) = O(log n) 平均'
  ];

  var A0 = [1, 2, 3, 4, 5, 6];

  DSC.reg({
    id: 'spaceComplexity', ch: 1, name: '空间复杂度：辅助空间与递归栈',
    aim: '空间复杂度只算**临时占用**的那份：原地 O(1)、开辅助数组 O(n)、递归栈按深度算',
    note: '教材 1.4 算法与算法分析（空间复杂度 S(n)、辅助空间、原地算法）',
    keywords: 'S(n) 辅助空间 原地算法 in-place 递归栈空间 工作单元 空间代价 堆栈 归并O(n) 堆排序O(1) 尾递归',
    guide: [
      '一句话：说"这个算法占多少空间"，说的是**除了输入之外**还要多少——那份叫辅助空间',
      '① 反转数组两种写法：时间都是 O(n)，但第一种要 new 一个和输入等长的数组（辅助 O(n)），第二种只多一个临时变量 t（辅助 O(1)，叫原地算法）',
      '② 递归为什么费空间：每层调用都要一份栈帧，栈有多深就占多少——Fact(n) 栈深 n 就是 O(n)；换成迭代只有 f 和 i，回到 O(1)',
      '③ 蓝色格 = 正在写的辅助单元，橙色 = 正在交换的原地变量。数一数就知道量级差在哪'
    ],
    inputs: [
      {
        key: 'scene', label: '场景', type: 'select', options: [
          ['aux', '① 原地 vs 非原地：反转数组'],
          ['rec', '② 递归栈：Fact(n) vs 迭代'],
          ['rank', '③ 常见算法的空间复杂度对照']
        ], value: 'aux'
      },
      { key: 'n', label: '规模 n（数组长度 / 递归深度，2~8）', type: 'number', value: 6, min: 2, max: 8 }
    ],

    run: function (v) {
      var scene = v.scene, n = Math.max(2, Math.min(8, +v.n || 6)), frames = [];
      var a = [];
      for (var q = 0; q < n; q++) a.push(q + 1);
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          scene: scene, n: n, a: a.slice(), b: null, auxUsed: 0, stack: [], fi: 0,
          hotI: -1, hotJ: -1, row: -1, done: false
        }, snap || {}) });
      }

      if (scene === 'aux') {
        F([0, 1], '反转一个长度 ' + n + ' 的数组。两种写法**时间都是 O(n)**，所以看空间才能分出高下。' +
          '输入本身占 ' + n + ' 格，这部分**两种写法都不算进 S(n)**。',
          { 输入占用: n + ' 格（不算）', 辅助空间: '0 格' }, {});
        /* 非原地 */
        var b = [];
        for (q = 0; q < n; q++) b.push(null);
        F([4, 5], 'Reverse1 第一步就 `malloc` 出一个和输入等长的辅助数组 b[] —— ' + n + ' 格，' +
          '**S(n) 当场就是 O(n)**。这 ' + n + ' 格在函数返回前一直占着。',
          { 写法: 'Reverse1（非原地）', 辅助空间: n + ' 格', 'S(n)': 'O(n)' }, { b: b.slice(), auxUsed: n });
        for (var i = 0; i < n; i++) {
          b[i] = a[n - 1 - i];
          F([6], 'b[' + i + '] = a[' + (n - 1 - i) + '] = ' + b[i] + '。倒着往辅助数组里填，第 ' + (i + 1) + ' / ' + n + ' 格。',
            { 写法: 'Reverse1（非原地）', 进度: (i + 1) + ' / ' + n, 辅助空间: n + ' 格' }, { b: b.slice(), auxUsed: n, hotI: i });
        }
        var c2 = a.slice();
        for (i = 0; i < n; i++) { c2[i] = b[i]; }
        F([7], '再整份拷回 a[]：`a[i] = b[i]`。此刻 a 已反转，但 b 那 ' + n + ' 格还得等函数返回才释放。',
          { 写法: 'Reverse1（非原地）', 辅助空间: n + ' 格', 'S(n)': 'O(n)' }, { a: c2, b: b.slice(), auxUsed: n });
        /* 原地 */
        var d = a.slice(), used = 0;
        F([9, 10], 'Reverse2 一个辅助数组都不开：只借**一个临时变量 t** 做交换。',
          { 写法: 'Reverse2（原地）', 辅助空间: '1 格（t）', 'S(n)': 'O(1)' }, { a: d.slice(), auxUsed: 1 });
        for (i = 0; i < Math.floor(n / 2); i++) {
          var j = n - 1 - i, t = d[i];
          d[i] = d[j]; d[j] = t;
          F([11, 12, 13], '第 ' + (i + 1) + ' 对：t = a[' + i + ']，a[' + i + '] ← a[' + j + ']，a[' + j + '] ← t。' +
            '两头各吃掉一个，**只多一个 t**。',
            { 写法: 'Reverse2（原地）', 进度: (i + 1) + ' / ' + Math.floor(n / 2), 辅助空间: '1 格（t）' },
            { a: d.slice(), auxUsed: 1, hotI: i, hotJ: j });
        }
        F([2, 3, 8, 14], '★ 同样把数组反转：Reverse1 辅助 O(n)、Reverse2 辅助 O(1)。' +
          '时间一样、结果一样，**只有空间这一栏分出了胜负**——这就是"原地算法"这个词存在的意义。' +
          '考试里问"空间复杂度"，默认问的就是这份辅助空间。',
          { 'Reverse1': 'S(n) = O(n)', 'Reverse2': 'S(n) = O(1)', 结论: '原地 = O(1)' }, { a: d.slice(), auxUsed: 1, done: true });
        return { code: CODE, frames: frames };
      }

      if (scene === 'rec') {
        F([16], '求 ' + n + '! 的两种写法。先看递归版：`Fact(n)` 里又要算 `Fact(n-1)`，' +
          '**在拿到下层结果之前，这一层的栈帧不能释放**。',
          { 写法: 'Fact（递归）', 栈深: '0 层', 'S(n)': 'O(n)' }, { stack: [] });
        for (i = 1; i <= n; i++) {
          var st1 = [];
          for (q = 0; q < i; q++) st1.push(n - q);
          F([17, 18, 19], '第 ' + i + ' 层：Fact(' + (n - i + 1) + ') 进来，压一份栈帧（参数 ' + (n - i + 1) +
            ' + 局部变量 + 返回地址）。此刻栈深 ' + i + ' 层。' + (i === n ? '——最深处是 Fact(1)，开始返回。' : '还没算出值，只能继续压。'),
            { 写法: 'Fact（递归）', 栈深: i + ' 层', 'S(n)': 'O(n)' }, { stack: st1, fi: i });
        }
        var val = 1, back = [];
        for (i = n; i >= 1; i--) {
          val = val * i;
          for (q = 0; q < i - 1; q++) back.push(n - q);
          F([19], 'Fact(' + i + ') 返回 ' + (i === 1 ? '1' : val * i / i) + '，弹掉这一层栈帧，栈深降到 ' + (i - 1) + ' 层。' +
            (i === 1 ? '最终 ' + n + '! = ' + val + '。' : ''),
            { 写法: 'Fact（递归）', 栈深: (i - 1) + ' 层', 结果: val + '' }, { stack: back, fi: n - i + 1 });
          back = [];
        }
        F([20, 21, 22], '换成迭代版：只有 `f` 和 `i` 两个变量，**不管 n 多大都只占这么点**，' +
          'S(n) = O(1)。结果一样，' + n + '! = ' + val + '。',
          { 写法: 'FactIter（迭代）', 变量: 'f、i 共 2 个', 'S(n)': 'O(1)' }, { stack: [], fi: 0, done: true });
        F([19, 22], '★ 递归的空间代价就是**栈深**：Fact(n) 栈深 n → S(n) = O(n)；' +
          '而快排的递归栈深度只有 ⌈log₂n⌉ → S(n) = O(log n)。所以"递归费空间"要看栈有多深，不是绝对的。',
          { '递归 Fact': 'S(n) = O(n)', '迭代 FactIter': 'S(n) = O(1)', '快排栈': 'S(n) = O(log n)' }, { done: true });
        return { code: CODE, frames: frames };
      }

      /* rank：常见算法的空间复杂度对照 */
      var TB = [
        ['顺序表 / 单链表（本身）', 'O(n)', 'n 个结点各占一格，这是输入不是辅助空间'],
        ['DFS（递归写法）', 'O(n)', '最坏一条链走到底，栈深 n'],
        ['BFS（队列）', 'O(n)', '队列里最多同时装着接近一层结点'],
        ['归并排序', 'O(n)', '要一份和输入等长的辅助数组'],
        ['堆排序', 'O(1)', '原地交换，只多一个临时变量'],
        ['快速排序', 'O(log n)', '原地划分，但递归栈平均深 ⌈log₂n⌉'],
        ['直接插入排序', 'O(1)', '一个临时元素就够了'],
        ['求幂 Fact（递归）', 'O(n)', '栈深 n；改成就 O(1)']
      ];
      F([24], '同一批算法的空间复杂度放一张表。**记住三件事**：开没开辅助数组、递归栈有多深、是不是原地。',
        { 条目: TB.length + ' 项', 最小: 'O(1)', 最大: 'O(n)' }, { rows: TB, row: -1 });
      for (i = 0; i < TB.length; i++) {
        F([25 + Math.min(i, 4)], TB[i][0] + ' → **S(n) = ' + TB[i][1] + '**：' + TB[i][2],
          { 算法: TB[i][0], 'S(n)': TB[i][1], 原因: TB[i][2] }, { rows: TB, row: i });
      }
      F([24, 25], '★ 排序一章里"空间 O(1)"的只有直接插入、简单选择、堆排序这几个原地的；' +
        '归并要 O(n)，快排要 O(log n) 的栈。**"又要快、又要稳、还只给 O(1) 空间"的算法不存在**——' +
        '这就是那张"时间 / 空间 / 稳定性"对照表里三列互相拉扯的原因。',
        { 'O(1) 空间': '插入 / 选择 / 堆排', 'O(n) 空间': '归并 / 辅助数组', 'O(log n) 空间': '快排递归栈' },
        { rows: TB, row: -1, done: true });
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 560, g = '';
      var nm = { aux: '① 原地 vs 非原地', rec: '② 递归栈占的空间', rank: '③ 常见量级对照' };
      g += h.txt(W / 2, 30, '空间复杂度 S(n) · ' + nm[s.scene] + ' · 只算临时占用的那份', { size: 19, w: 700 });
      if (s.scene === 'aux') {
        g += h.txt(34, 58, '图例：黑框 = 输入数组 a[]（不算进 S(n)）　蓝格 = 辅助数组 b[] 已写到的位置　橙框 = 正在交换的两端',
          { size: 13, fill: C.muted, anchor: 'start' });
        var n = s.n, cw = Math.min(84, Math.floor((W - 260) / n)), y1 = 120, y2 = 250, y3 = 380;
        function strip(y, arr, label, sub, isAux) {
          /* 说明画在行的**上方**：画在格子左侧会被长文字顶到格子底下（截图才看得出来） */
          g += h.txt(34, y - 12, label + '　' + sub, { size: 13, fill: C.muted, anchor: 'start' });
          for (var q = 0; q < arr.length; q++) {
            var x = 200 + q * (cw + 6), empty = arr[q] == null;
            var on = isAux ? (s.hotI === q && !empty) : (s.hotI === q || s.hotJ === q);
            g += h.rect(x, y, cw, 44, {
              fill: empty ? '#fff' : (isAux ? (on ? C.blueBg : '#f0f6ff') : '#fff'),
              stroke: on ? (isAux ? C.blue : C.amber) : C.grey, sw: on ? 2.6 : 1.5, rx: 6
            });
            g += h.txt(x + cw / 2, y + 28, empty ? '' : String(arr[q]), { size: 16, w: 700 });
            g += h.txt(x + cw / 2, y + 60, String(q), { size: 11, fill: C.muted });
          }
        }
        strip(y1, s.a, 'a[] 输入', '长度 ' + n + '，这部分两种写法都要占 → 不计入 S(n)', false);
        if (s.b) strip(y2, s.b, 'b[] 辅助数组', s.auxUsed > 1 ? 'malloc 出来的 ' + n + ' 格 —— 这就是 O(n)' : '没开辅助数组', true);
        else g += h.txt(200, y2 + 28, '（这一种写法不开辅助数组）', { size: 14, fill: C.muted, anchor: 'start' });
        g += h.rect(200, y3, 168, 40, { fill: s.scene === 'aux' && s.auxUsed === 1 ? C.amberBg : '#f8fafc', stroke: s.auxUsed === 1 ? C.amber : C.line, sw: s.auxUsed === 1 ? 2.2 : 1.2, rx: 6 });
        g += h.txt(284, y3 + 26, 't = 1 格', { size: 14, w: 700 });
        g += h.txt(390, y3 + 26, s.auxUsed > 1 ? '← Reverse1 只需要这一份辅助数组，不需要 t' :
          '← Reverse2 的全部家当：一个临时变量，S(n) = O(1)', { size: 13, fill: C.muted, anchor: 'start' });
      } else if (s.scene === 'rec') {
        g += h.txt(34, 58, '图例：一格 = 一层调用栈帧（实参 + 局部变量 + 返回地址）。栈有多深，就占多少空间。',
          { size: 13, fill: C.muted, anchor: 'start' });
        var st = s.stack, maxH = 300, cell = Math.min(52, Math.floor(maxH / Math.max(s.n, 1)));
        g += h.txt(150, 100 + maxH + 24, '调用栈', { size: 14, w: 700 });
        g += h.rect(140, 100, 96, maxH, { fill: '#f8fafc', stroke: C.line, sw: 1.2, rx: 6 });
        for (var q2 = 0; q2 < st.length; q2++) {
          var yy = 100 + maxH - (q2 + 1) * cell;
          g += h.rect(146, yy + 2, 84, cell - 4, { fill: q2 === st.length - 1 ? C.blueBg : '#fff', stroke: q2 === st.length - 1 ? C.blue : C.grey, sw: q2 === st.length - 1 ? 2.2 : 1.3, rx: 5 });
          g += h.txt(188, yy + cell / 2 + 5, 'Fact(' + st[q2] + ')', { size: 13, w: 700 });
        }
        for (q2 = st.length; q2 < s.n; q2++) {
          var yz = 100 + maxH - (q2 + 1) * cell;
          g += h.rect(146, yz + 2, 84, cell - 4, { fill: '#fff', stroke: '#e5eaf1', sw: 1, rx: 5, dash: '4 4' });
        }
        g += h.txt(300, 130, '栈深 = ' + st.length + ' 层　→　辅助空间 ' + (st.length ? st.length + ' 份栈帧' : '0 份'),
          { size: 17, w: 800, anchor: 'start' });
        g += h.txt(300, 162, '递归每深一层就多一份不能提前释放的栈帧，所以 S(n) 按「最大栈深」算',
          { size: 13.5, fill: C.muted, anchor: 'start' });
        var vars = [['f', st.length ? '1 个' : '1 个'], ['i', '1 个']];
        g += h.txt(300, 220, '迭代版只有这两个变量：', { size: 14, w: 700, anchor: 'start' });
        vars.forEach(function (vr, vi) {
          g += h.rect(300 + vi * 120, 240, 104, 44, { fill: '#f0f6ff', stroke: C.blue, sw: 1.8, rx: 6 });
          g += h.txt(352 + vi * 120, 262, vr[0] + ' = ' + (vi ? s.fi : (s.fi ? '累乘中' : '1')), { size: 13.5, w: 700 });
        });
        g += h.txt(300, 316, '→ 不管 n 多大都只占这么点：S(n) = O(1)', { size: 14.5, fill: C.green, w: 700, anchor: 'start' });
      } else {
        g += h.txt(34, 58, '图例：橙 = 正在讲的那一行。三问定生死：开没开辅助数组？递归栈多深？是不是原地？',
          { size: 13, fill: C.muted, anchor: 'start' });
        var rows = s.rows || [], ty = 100, rh = 46;
        g += h.rect(60, ty - 34, 860, 28, { fill: '#0f2c5c', stroke: '#0f2c5c', sw: 1, rx: 5 });
        g += h.txt(76, ty - 14, '算法 / 结构', { size: 13, w: 700, fill: '#fff', anchor: 'start' });
        g += h.txt(520, ty - 14, 'S(n)', { size: 13, w: 700, fill: '#fff', anchor: 'start' });
        g += h.txt(620, ty - 14, '为什么', { size: 13, w: 700, fill: '#fff', anchor: 'start' });
        rows.forEach(function (r2, ri) {
          var y = ty + ri * rh, on = s.row === ri;
          g += h.rect(60, y, 860, rh - 6, { fill: on ? C.amberBg : (ri % 2 ? '#f8fafc' : '#fff'), stroke: on ? C.amber : C.line, sw: on ? 2.4 : 1, rx: 5 });
          g += h.txt(76, y + 24, r2[0], { size: 15, w: on ? 800 : 600, anchor: 'start' });
          g += h.txt(520, y + 24, r2[1], { size: 15.5, w: 800, anchor: 'start', fill: on ? C.amber : C.ink });
          g += h.txt(620, y + 24, r2[2], { size: 13, fill: C.muted, anchor: 'start' });
        });
      }
      var note = s.done
        ? '★ S(n) 只算辅助空间：原地 O(1)、辅助数组 O(n)、递归看栈深'
        : '问"占多少空间"= 问"除了输入还要多少"——开没开数组、栈有多深、是否原地';
      g += h.txt(W / 2, H - 14, note, { size: 14, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
