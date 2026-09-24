/* 动画：堆与优先队列、求 Top-K（408 大纲 四(四)3） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '// 堆 = 满足父子序关系的完全二叉树，用一维数组存（下标从 1 起）',
    '// 大顶堆：parent ≥ children，所以堆顶永远是最大值',
    '',
    'void HeapAdjust(SqHeap H, int s, int m) {   // 以 s 为根、向下筛到 m',
    '    rc = H.r[s];',
    '    for (j = 2*s; j <= m; j *= 2) {         // 沿"较大的那个孩子"往下走',
    '        if (j < m && H.r[j] < H.r[j+1])  ++j;   // 右孩子更大 → 改选右',
    '        if (rc >= H.r[j])  break;           // 已满足堆序，提前停',
    '        H.r[s] = H.r[j];  s = j;            // 孩子上浮，继续往下看',
    '    }',
    '    H.r[s] = rc;                            // 原堆顶落到最后停住的位置',
    '}',
    '',
    'void CreateHeap(SqHeap &H) {                // 自下而上建堆',
    '    for (i = H.n / 2; i >= 1; --i)          // 最后一个非叶结点是 ⌊n/2⌋',
    '        HeapAdjust(H, i, H.n);              // 总代价 O(n)，不是 O(n log n)',
    '}',
    '',
    '/* 优先队列的两个操作（都只走树高）',
    '   DeQueue: x = H.r[1]; H.r[1] = H.r[n]; --n; HeapAdjust(H, 1, n);  O(log n)',
    '   EnQueue: H.r[++n] = x;  沿 ⌊i/2⌋ 逐层上浮到该在的位置      O(log n)',
    '}',
    '/* 求 Top-K（408 常考）：维护容量为 K 的【小顶堆】',
    '   新元素 > 堆顶 才换掉堆顶再下沉，否则直接丢弃',
    '   结束时堆里就是最大的 K 个，代价 O(n log K) 而不是 O(n log n) */'
  ];

  function lvlOf(i) { return Math.floor(Math.log2(i)); }

  DSC.reg({
    id: 'heapPQ', ch: 5, name: '堆与优先队列：建堆、出入队与 Top-K',
    aim: '堆是**完全二叉树 + 父≥子**，所以建堆 O(n)、取顶 O(logn)，Top-K 只需留住 k 个',
    note: '408 大纲 四(四)3 堆及其应用（筛选建堆 O(n)、优先队列 O(log n)、Top-K 用容量 K 的小顶堆）',
    keywords: '堆 小顶堆 大顶堆 建堆 筛选 siftup shiftdown 优先队列 出队 入队 Top-K 第K大 近似完全二叉树 数组表示',
    guide: [
      '堆是**用一维数组存的完全二叉树**——上一个是"二叉树的顺序存储"，堆就是它最实用的下场：靠 `i ↔ 2i/2i+1` 算父子，一个指针都不存',
      '大顶堆只保证"爹 ≥ 儿"，**兄弟之间不排序**。所以堆顶是全局最大，但第二名在哪不知道',
      '建堆要**自下而上**筛：最后一个非叶结点是 ⌊n/2⌋。绝大多数结点在底层、只需下沉常数层，所以总代价是 O(n) 而不是 O(n log n)——这是 408 爱考的点；场景切「错误演示」看只筛一层会漏掉什么',
      '出队 = 堆顶换到队尾、缩小堆、从根筛一次；入队 = 追加到队尾、沿 ⌊i/2⌋ 上浮。两者都只走树高 O(log n)',
      '求 Top-K 时**用小顶堆、容量固定为 K**：堆顶是这 K 个里最小的，来了更大的才换它。用大顶堆就得存下全部 n 个'
    ],
    inputs: [
      {
        key: 'scene', label: '场景', type: 'select', options: [
          ['build', '建堆：自下而上筛选'], ['pq', '优先队列：出队与入队'],
          ['topk', '求 Top-K：容量 K 的小顶堆'],
          ['bad', '错误演示：建堆只筛一层就停']
        ], value: 'build'
      },
      { key: 'data', label: '关键字序列（4~12 个）', type: 'text', value: '49,38,65,97,76,13,27,49' },
      { key: 'k', label: 'K（Top-K 场景用）', type: 'number', value: 3, min: 1, max: 6 },
      {
        key: 'op', label: '优先队列操作', type: 'select', options: [
          ['mix', '交替：出队 → 出队 → 入队 → 出队'], ['pop', '连续出队（取完）'], ['push', '连续入队（边插边浮）']
        ], value: 'mix'
      }
    ],

    run: function (v) {
      var scene = v.scene, frames = [];
      var src = String(v.data).split(/[,，\s]+/).filter(Boolean).map(Number);
      if (src.some(isNaN)) throw Error('关键字序列必须是整数');
      if (src.length < 4 || src.length > 12) throw Error('请输入 4~12 个整数');
      var K = Math.max(1, Math.min(+v.k || 1, src.length));
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          arr: null, n: 0, hl: {}, min: false, done: false, bars: null, rest: null
        }, snap || {}) });
      }
      /* 大顶堆筛选：就地修改 a（下标 1 起），每步出一帧。lim = 最多下沉几层（错误演示用） */
      function siftDown(a, s, m, isMin, emit, tag, lim) {
        var rc = a[s], changed = false, lv = 0;
        for (var j = 2 * s; j <= m; j *= 2) {
          var pick = j;
          if (j < m && (isMin ? a[j] > a[j + 1] : a[j] < a[j + 1])) pick = j + 1;
          if (emit) F([5, 6], tag + ' 下看：孩子 ' + a[j] + (j < m ? ' 与 ' + a[j + 1] : '（只有左孩子）') +
            '，取' + (isMin ? '更**小**的 ' : '更**大**的 ') + a[pick] + '（下标 ' + pick + '）来比。',
            { 正在筛: 's=' + s + ' → ' + m + ' 内' }, { arr: a.slice(), n: m, hl: { cmp: [s, pick], v: rc }, min: isMin });
          if (isMin ? rc <= a[pick] : rc >= a[pick]) {
            if (emit) F([7], tag + ' ' + rc + (isMin ? ' ≤ ' : ' ≥ ') + a[pick] + '，堆序已满足 → **break**，' +
              rc + ' 就落在下标 ' + s + '。', { 正在筛: '停在 ' + s }, { arr: a.slice(), n: m, hl: { at: s, v: rc }, min: isMin });
            break;
          }
          a[s] = a[pick];
          changed = true;
          if (emit) F([8], tag + ' ' + a[pick] + (isMin ? ' 更小' : ' 更大') + '，让它上浮到 ' + s +
            ' 号位；继续从 ' + pick + ' 往下看。', { 正在筛: '孩子上浮到 ' + s },
            { arr: a.slice(), n: m, hl: { moved: pick, v: rc }, min: isMin });
          s = pick;
          if (lim && ++lv >= lim) {
            if (emit) F([5, 8], tag + '（错误演示）就在此刻**停手**：孩子 ' + a[s >> 1] + ' 是上浮了，可它原来那层下面还有孙子，一眼都没再看。',
              { 正在筛: '只筛一层就停' }, { arr: a.slice(), n: m, hl: { moved: s, v: rc }, min: isMin });
            break;
          }
        }
        a[s] = rc;
        if (emit && changed) F([10], tag + ' 收尾：把 ' + rc + ' 放到 ' + s + ' 号位（它的位置是筛出来的，不是比出来的）。',
          { 正在筛: rc + ' → 下标 ' + s }, { arr: a.slice(), n: m, hl: { at: s, v: rc }, min: isMin });
        return s;
      }

      /* ---------------- 建堆 ---------------- */
      if (scene === 'build') {
        var a = [null].concat(src);
        F([0, 1], '先把 ' + src.join(' ') + ' 原样放进数组（下标从 1 起）。' +
          '下面的树完全靠 `i ↔ 2i / 2i+1` 画出来——**数组里没有指针**，父子关系是算出来的。',
          { 结点数: src.length + ' 个', 树高: (lvlOf(src.length) + 1) + '' }, { arr: a.slice(), n: src.length });
        F([14], '建堆从 **⌊n/2⌋ = ' + Math.floor(src.length / 2) + '** 号位开始往前筛。' +
          '下标比它大的全是叶子（孩子会超出 n），本来就直接满足堆序，不用动。',
          { 起点: 'i = ⌊' + src.length + '/2⌋ = ' + Math.floor(src.length / 2) }, { arr: a.slice(), n: src.length, hl: { at: Math.floor(src.length / 2) } });
        for (var i = Math.floor(src.length / 2); i >= 1; i--) {
          F([13, 14, 15], '筛第 ' + i + ' 个结点（值 ' + a[i] + '，子树范围到 ' + src.length + '）：',
            { 当前筛: 'i = ' + i, 堆内: a.slice(1).join(' ') }, { arr: a.slice(), n: src.length, hl: { at: i } });
          siftDown(a, i, src.length, false, true, '筛 ' + i + ' 号（' + a[i] + '）：');
        }
        var ok = true;
        for (var q = 1; q <= src.length; q++) {
          if (2 * q <= src.length && a[q] < a[2 * q]) ok = false;
          if (2 * q + 1 <= src.length && a[q] < a[2 * q + 1]) ok = false;
        }
        F([1, 16], '★ 建堆完成：' + a.slice(1).join(' ') + '，每个爹都 ≥ 自己的两个孩子 → 大顶堆成立（' + (ok ? '已逐格校验' : '校验失败') + '）。' +
          '堆顶 ' + a[1] + ' 就是最大值，但**第二名不知道在哪**——它只保证爹比儿大，兄弟之间不排序。',
          { 堆顶: String(a[1]), 树高: (lvlOf(src.length) + 1) + '', 建堆代价: 'O(n)' },
          { arr: a.slice(), n: src.length, hl: { at: 1 }, done: true });
        return { code: CODE, frames: frames };
      }

      /* ---------------- 错误演示：只筛一层就停 ---------------- */
      if (scene === 'bad') {
        var ab = [null].concat(src);
        F([0, 1], '错误演示：建堆时"筛一层就停"。初始 ' + src.join(' ') + '（下标从 1 起）。',
          { 结点数: src.length + ' 个' }, { arr: ab.slice(), n: src.length });
        F([14, 15], '起点仍是 ⌊n/2⌋ = ' + Math.floor(src.length / 2) + '。毛病出在 HeapAdjust 里面：孩子上浮之后**不再往下看**——把 `for (j = 2*s; j <= m; j *= 2)` 少写成一轮，或者比较完孩子就 break。',
          { 起点: 'i = ⌊' + src.length + '/2⌋ = ' + Math.floor(src.length / 2) },
          { arr: ab.slice(), n: src.length, hl: { at: Math.floor(src.length / 2) } });
        for (var ib = Math.floor(src.length / 2); ib >= 1; ib--) {
          F([13, 14, 15], '筛第 ' + ib + ' 个结点（值 ' + ab[ib] + '）——这次只筛一层：',
            { 当前筛: 'i = ' + ib, 堆内: ab.slice(1).join(' ') }, { arr: ab.slice(), n: src.length, hl: { at: ib } });
          siftDown(ab, ib, src.length, false, true, '筛 ' + ib + ' 号（' + ab[ib] + '）：', 1);
        }
        var viol = [];
        for (var qb = 1; qb <= src.length; qb++) {
          if (2 * qb <= src.length && ab[qb] < ab[2 * qb]) viol.push('r[' + qb + ']=' + ab[qb] + ' < 左孩子 r[' + (2 * qb) + ']=' + ab[2 * qb]);
          if (2 * qb + 1 <= src.length && ab[qb] < ab[2 * qb + 1]) viol.push('r[' + qb + ']=' + ab[qb] + ' < 右孩子 r[' + (2 * qb + 1) + ']=' + ab[2 * qb + 1]);
        }
        var ac = [null].concat(src);
        for (var ic = Math.floor(src.length / 2); ic >= 1; ic--) siftDown(ac, ic, src.length, false, false, '');
        F([7, 10], '✗ 跑完逐对检查父子：违反 ' + viol.length + ' 处。' + (viol.length ? viol.join('；') + '。' : '这批数据碰巧没违反（换教材序列 49,38,65,97,76,13,27,49 再看）。') +
          '对照：同一批数按正确写法筛到底 → ' + ac.slice(1).join(' ') + '。漏下沉的要害是只把"孩子"提上来，**孙子还压在下面**。',
          { 违反: viol.length + ' 处', 错误结果: ab.slice(1).join(' '), 正确结果: ac.slice(1).join(' ') },
          { arr: ab.slice(), n: src.length });
        F([5, 6], '★ 记结构原因：下沉要一路走到"落定"才停。每换一次孩子，就要拿**新孩子那一层**再比一次——教材那句 `j *= 2` 和 `s = j` 缺一不可。出队时从堆顶筛一次同理，所以这个 bug 会让建堆和出队一起错。',
          { 违反: viol.length + ' 处', 正确结果: ac.slice(1).join(' ') }, { arr: ac.slice(), n: src.length, done: true });
        return { code: CODE, frames: frames };
      }

      if (scene === 'topk') {
        var hk = [null].concat(src.slice(0, K)), hn = K, dropped = [], feed = K;
        for (var i3 = Math.floor(hn / 2); i3 >= 1; i3--) siftDown(hk, i3, hn, true, false);
        F([22], '求最大的 ' + K + ' 个：维护一个**容量只有 ' + K + ' 的小顶堆**。' +
          '先拿前 ' + K + ' 个数建堆——堆顶是这 ' + K + ' 个里**最小**的那个，也就是"守门员"。',
          { 已处理: K + '/' + src.length, 守门员: String(hk[1]), 堆内: hk.slice(1).join(' ') },
          { arr: hk.slice(), n: hn, min: true, bars: src.slice(), at: K, dropped: [] });
        for (var t2i = K; t2i < src.length; t2i++) {
          var x2 = src[t2i];
          if (x2 > hk[1]) {
            F([23], '来了 ' + x2 + '：比守门员 ' + hk[1] + ' 大 → 有资格进榜。把守门员踢掉、' + x2 + ' 顶到堆顶，再筛一次。',
              { 已处理: (t2i + 1) + '/' + src.length, 动作: '换掉 ' + hk[1] }, { arr: hk.slice(), n: hn, min: true, bars: src.slice(), at: t2i, dropped: dropped.slice(), hl: { at: 1, v: hk[1] } });
            var old = hk[1]; hk[1] = x2; dropped.push(old);
            siftDown(hk, 1, hn, true, true, '换进 ' + x2 + ' 后重筛：');
          } else {
            F([23], '来了 ' + x2 + '：不比守门员 ' + hk[1] + ' 大 → 它进不了前 ' + K + '，**直接丢弃**，堆不动。',
              { 已处理: (t2i + 1) + '/' + src.length, 动作: '丢弃 ' + x2 }, { arr: hk.slice(), n: hn, min: true, bars: src.slice(), at: t2i, dropped: dropped.slice(), hl: { skip: x2 } });
            dropped.push(x2);
          }
          F([23], '处理完第 ' + (t2i + 1) + ' 个数，榜内是 ' + hk.slice(1).sort(function (p, q2) { return q2 - p; }).join(' ≥ ') +
            '，守门员（最小）= ' + hk[1] + '。',
            { 已处理: (t2i + 1) + '/' + src.length, 守门员: String(hk[1]), 榜内: hk.slice(1).join(' ') },
            { arr: hk.slice(), n: hn, min: true, bars: src.slice(), at: t2i + 1, dropped: dropped.slice() });
        }
        F([24], '★ 扫完 ' + src.length + ' 个数，最大的 ' + K + ' 个是 ' +
          hk.slice(1).sort(function (p, q2) { return q2 - p; }).join('、') + '。' +
          '代价 O(n log K)：比"全排一遍再取前 K"的 O(n log n) 省，而且 K 远小于 n 时省得多——' +
          '这也是为什么题目反复强调**Top-K 要用小顶堆、容量固定 K**。',
          { TopK: hk.slice(1).sort(function (p, q2) { return q2 - p; }).join(' '), 代价: 'O(n log K)', 丢弃: dropped.length + ' 个' },
          { arr: hk.slice(), n: hn, min: true, bars: src.slice(), at: src.length, dropped: dropped.slice(), done: true });
        return { code: CODE, frames: frames };
      }

      /* ---------------- 优先队列 ---------------- */
      var b = [null].concat(src), n = src.length;
      for (var i2 = Math.floor(n / 2); i2 >= 1; i2--) siftDown(b, i2, n, false, false);
      var out = [], ops = v.op === 'pop' ? ['pop', 'pop', 'pop', 'pop', 'pop', 'pop', 'pop', 'pop', 'pop', 'pop', 'pop', 'pop'].slice(0, n)
        : v.op === 'push' ? ['push', 'push', 'push', 'push'] : ['pop', 'pop', 'push', 'pop'];
      var extra = [100, 88, 72, 55];
      F([0, 1], '预置：' + src.join(' ') + ' 已经建成大顶堆（堆顶 ' + b[1] + '）。' +
        '优先队列只看堆顶——**出队永远拿最大那个，跟它原来排在第几位无关**。',
        { 队列长: n + ' 个', 堆顶: String(b[1]) }, { arr: b.slice(), n: n });
      var ei = 0;
      ops.forEach(function (op, oi) {
        if (op === 'pop') {
          if (n < 1) return;
          var top = b[1], last = b[n];
          F([19], '第 ' + (oi + 1) + ' 次出队：取走堆顶 ' + top + '。' +
            '不能直接删——树就不完全了。做法是把**队尾 ' + last + ' 顶到堆顶**，再把堆缩小一格。',
            { 出队: top + '', 队列长: n + ' 个' }, { arr: b.slice(), n: n, hl: { at: 1, tail: n }, out: out.slice() });
          b[1] = last; n--;
          F([19], '队尾 ' + last + ' 挪到 1 号位、堆长 ' + (n + 1) + ' → ' + n + '（' + top + ' 那个格子已经出堆了）。现在多半破坏堆序，从根筛一次。',
            { 出队: top + '', 队列长: n + ' 个' }, { arr: b.slice(), n: n, hl: { at: 1, v: last }, out: out.slice() });
          siftDown(b, 1, n, false, true, '重筛堆顶（' + last + '）：');
          out.push(top);
          F([19], top + ' 出队。已出序列：' + out.join(' → ') + '（递减——这就是堆排序反复取堆顶的原理）。',
            { 出队序: out.join(' ') || '—', 队列长: n + ' 个', 新堆顶: n >= 1 ? String(b[1]) : '空' },
            { arr: b.slice(), n: n, hl: { gone: true }, out: out.slice() });
        } else {
          var x = extra[ei++ % extra.length];
          b[++n] = x;
          F([20], '第 ' + (oi + 1) + ' 次入队 ' + x + '：只能追加到**队尾**（第 ' + n + ' 格）——完全二叉树只能在末尾长。',
            { 入队: x + '', 队列长: n + ' 个' }, { arr: b.slice(), n: n, hl: { at: n, v: x }, out: out.slice() });
          var s = n, moved = 0;
          while (s > 1 && b[s] > b[Math.floor(s / 2)]) {
            var p = Math.floor(s / 2);
            F([20], x + ' 比它爹 ' + b[p] + '（⌊' + s + '/2⌋ = ' + p + '）还大 → 违反大顶堆，父子互换，继续往上比。',
              { 上浮: s + ' → ' + p }, { arr: b.slice(), n: n, hl: { swap: [p, s], v: x }, out: out.slice() });
            var t2 = b[p]; b[p] = b[s]; b[s] = t2; s = p; moved++;
          }
          F([20], x + ' 停在 ' + s + ' 号位（' + (moved ? '一共上浮 ' + moved + ' 层' : '它本来就不比爹大，一步没动') + '）。' +
            '入队代价 = 树高 = **O(log n)**。',
            { 入队: x + '', 上浮层数: moved + '', 队列长: n + ' 个', 堆顶: String(b[1]) },
            { arr: b.slice(), n: n, hl: { at: s, v: x }, out: out.slice() });
        }
      });
      F([19, 20], out.length
        ? '★ 优先队列只看堆顶：出队 ' + out.length + ' 次拿到 ' + out.join(' ') +
          '，每次都是 O(log n)。它**不是排序**——剩下的 ' + b.slice(1, n + 1).join(' ') +
          ' 只满足爹比儿大，不是有序序列。要全序就得反复取堆顶，那正是堆排序。'
        : '★ 连续入队后堆顶是 ' + b[1] + '，数组是 ' + b.slice(1, n + 1).join(' ') +
          '。注意它**不是有序的**：堆只保证爹 ≥ 儿，兄弟之间乱序。入队全部 O(log n) 完成。',
        { 出队序: out.join(' ') || '（只入队）', 队列长: n + ' 个', 堆顶: String(b[1]) },
        { arr: b.slice(), n: n, done: true, out: out.slice() });
      return { code: CODE, frames: frames };

      /* ---------------- 默认（防呆） ---------------- */
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 540, g = '';
      var a = s.arr, n = s.n;
      g += h.txt(W / 2, 28, (s.min ? '小顶堆（Top-K 的守门员堆）' : '大顶堆') + ' · 数组下标 i ↔ 左孩子 2i、右孩子 2i+1',
        { size: 17, w: 600 });
      g += h.txt(30, 50, '图例：蓝=正在处理的格子 绿=满足堆序/入榜 橙=刚上浮或比较过 灰=已出堆',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      var cw = Math.min(64, Math.floor((W - 100) / Math.max(a.length - 1, 1)));
      var x0 = (W - (a.length - 1) * (cw + 6)) / 2, ay = 84;
      /* 数组 */
      g += h.txt(x0 - 10, ay + 18, 'r[]', { size: 12, w: 700, fill: C.muted, anchor: 'end' });
      for (var i = 0; i < a.length; i++) {
        var st = i > n ? 'gone' : i === 0 ? 'head' : 'cell';
        var isHl = s.hl && (s.hl.at === i || (s.hl.swap && s.hl.swap.indexOf(i) >= 0) || (s.hl.cmp && s.hl.cmp.indexOf(i) >= 0));
        var isV = s.hl && s.hl.v != null && a[i] === s.hl.v && i <= n;
        g += h.rect(x0 + i * (cw + 6), ay, cw, 36, {
          fill: st === 'gone' ? '#f1f5f9' : isHl ? C.blueBg : s.hl && s.hl.moved === i ? C.amberBg : isV ? C.greenBg : '#fff',
          stroke: st === 'gone' ? '#e2e8f0' : isHl ? C.blue : s.hl && s.hl.moved === i ? C.amber : isV ? C.green : C.grey,
          sw: isHl || isV ? 2.4 : 1.3, rx: 5, dash: st === 'gone' ? '4,3' : null
        });
        g += h.txt(x0 + i * (cw + 6) + cw / 2, ay + 24, st === 'head' ? '0' : String(a[i] == null ? '' : a[i]),
          { size: 14, w: 700, fill: st === 'gone' ? '#b9c3cf' : C.ink });
        if (st !== 'head') g += h.txt(x0 + i * (cw + 6) + cw / 2, ay + 48, String(i), { size: 10, fill: C.muted });
      }
      /* 树 */
      function cx(i) { return x0 + i * (cw + 6) + cw / 2; }
      function cy(i) { return 168 + lvlOf(i) * 78; }
      for (var j = 1; j <= n; j++) {
        var p2 = Math.floor(j / 2);
        if (p2 >= 1) {
          var hot = s.hl && ((s.hl.cmp && s.hl.cmp.indexOf(j) >= 0 && s.hl.cmp.indexOf(p2) >= 0) ||
            (s.hl.swap && s.hl.swap.indexOf(j) >= 0));
          g += h.line(cx(p2), cy(p2) + 17, cx(j), cy(j) - 17, { stroke: hot ? C.amber : C.grey, sw: hot ? 2.4 : 1.3 });
        }
      }
      for (var k = 1; k <= n; k++) {
        var isAt = s.hl && s.hl.at === k, isCmp = s.hl && s.hl.cmp && s.hl.cmp.indexOf(k) >= 0;
        var isMov = s.hl && s.hl.moved === k;
        g += h.circle(cx(k), cy(k), 17, {
          fill: isAt ? C.blueBg : isCmp ? C.amberBg : isMov ? C.amberBg : '#fff',
          stroke: isAt ? C.blue : isCmp || isMov ? C.amber : C.grey, sw: isAt || isCmp || isMov ? 2.8 : 1.4
        });
        g += h.txt(cx(k), cy(k) + 5, String(a[k]), { size: 13, w: 700 });
      }
      /* 右侧：输入流（Top-K）或出队序 */
      if (s.bars) {
        var bx = W - 26, by = 300;
        g += h.txt(bx, by - 16, '输入流（灰=已处理）', { size: 11.5, fill: C.muted, anchor: 'end' });
        s.bars.forEach(function (bv, bi) {
          var col = bi < s.at ? '#eef2f7' : bi === s.at ? C.amberBg : '#fff';
          var st2 = bi < s.at ? '#a3afbd' : bi === s.at ? C.amber : C.ink;
          g += h.rect(bx - 40, by + bi * 20, 40, 18, { fill: col, stroke: bi === s.at ? C.amber : C.line, sw: bi === s.at ? 2 : 1, rx: 4 });
          g += h.txt(bx - 20, by + bi * 20 + 13, String(bv), { size: 11.5, fill: st2 });
        });
        if (s.hl && s.hl.skip != null) g += h.txt(bx - 60, by + 12, '丢弃 ' + s.hl.skip, { size: 11.5, fill: C.red, anchor: 'end' });
      }
      if (s.out && s.out.length) {
        g += h.txt(30, 470, '出队序列：', { size: 12.5, fill: C.muted, anchor: 'start', w: 600 });
        s.out.forEach(function (ov, oi) {
          var x = 106 + oi * 42;
          var last2 = oi === s.out.length - 1;
          g += h.rect(x, 452, 36, 24, { fill: last2 ? C.greenBg : '#fff', stroke: last2 ? C.green : C.line, sw: last2 ? 2 : 1, rx: 5 });
          g += h.txt(x + 18, 469, String(ov), { size: 12.5, w: last2 ? 700 : 400, fill: last2 ? C.green : C.muted });
        });
      }
      if (s.dropped && s.dropped.length) {
        g += h.txt(30, 470, '已丢弃 ' + s.dropped.length + ' 个：' + s.dropped.join(' '), { size: 12, fill: C.muted, anchor: 'start' });
      }
      var note = s.done
        ? (s.min ? '★ Top-K 用容量 K 的小顶堆：守门员在堆顶，比它大才有资格进榜'
          : '★ 堆只保证"爹 ≥ 儿"：堆顶最值可 O(1) 拿到，其余位置无序')
        : '堆用一维数组存完全二叉树，父子全靠下标算——不需要任何指针';
      g += h.txt(W / 2, H - 18, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
