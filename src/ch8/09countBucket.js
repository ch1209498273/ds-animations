/* 动画：计数排序与桶排序——与基数排序并列的线性时间排序（教材 8.7 / 8.8 对照） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '/* 计数排序：不比较！先数"每个值出现几次"，再算它该落在哪 */',
    'void CountSort(int a[], int n, int maxv) {',
    '    int count[0..maxv] = {0}, out[1..n];',
    '    for (i = 1; i <= n; ++i)',
    '        ++count[a[i]];                 // ① 统计频次',
    '    for (i = 1; i <= maxv; ++i)',
    '        count[i] += count[i-1];        // ② 前缀和 = 不大于 i 的个数',
    '    for (i = n; i >= 1; --i)           // ③ 逆序回填才稳定',
    '        out[count[a[i]]--] = a[i];',
    '}',
    '/* 时间 O(n + k)，k = 值域大小；空间 O(n + k)，与 n 无关 */',
    '',
    '/* 桶排序：把值域切成 m 段，各段装一个桶，桶内再排，最后按序倒出来 */',
    'void BucketSort(int a[], int n, int m) {',
    '    for (i = 1; i <= n; ++i)',
    '        把 a[i] 放进第 ⌊(a[i]−min) / (max−min+1) * m⌋ 号桶;',
    '    for (b = 0; b < m; ++b) {',
    '        桶内排序(通常是插入排序);        // 决定整体稳定性',
    '        依次倒回原表;',
    '    }',
    '}',
    '/* 平均 O(n + n/m)：数据"均匀分布"时接近线性；',
    '   全挤进同一个桶就退化成桶内排序的 O(n²)——桶排序赌的是分布 */'
  ];

  var DEF = [49, 38, 65, 97, 76, 13, 27, 49];

  DSC.reg({
    id: 'countBucket', ch: 8, name: '计数排序与桶排序（线性时间）',
    aim: '不比较大小：**计数排序数个数、桶排序分桶再排**，快，但要求取值范围有限',
    note: '教材 8.7/8.8 线性时间排序（计数 O(n+k)、桶排序看分布），与基数排序并列对照',
    keywords: '计数排序 桶排序 线性时间 非比较排序 O(n+k) 辅助空间 分布均匀 取值范围小 稳定',
    guide: [
      '前面七种排序都在**比较**，理论下界 Ω(n log n)。计数和桶**不比大小**，所以能跑到线性——代价是要求数据是整数或有界分布',
      '计数排序三步：数频次 → 求前缀和（"不大于 v 的有几个"）→ **逆序**回填。逆序这一步是稳定性的来源，正序回填会把相同值的先后次序打乱',
      '它的空间是 O(n + k)，k 是**值域宽度**而不是 n：排 10 个 0~999 的数要开 1000 格，反而不如快排——所以计数排序适合"值域小"的场景（年龄、分数、字符）',
      '桶排序是计数排序的推广：值域太大就切 m 段，段内再排。**赌的是分布均匀**——数据全挤在一个桶里就退化成 O(n²)'
    ],
    inputs: [
      {
        key: 'scene', label: '算法', type: 'select', options: [
          ['count', '计数排序（值域 ≤ 99）'], ['bucket', '桶排序（m 个桶）']
        ], value: 'count'
      },
      { key: 'preset', label: '数据', type: 'select', options: [
        ['small', '值域小：4,2,1,3,3,0,2,1（计数排序的主场）'],
        ['textbook', '教材排序例 49,38,65,97,76,13,27,49'],
        ['skew', '挤在一起：5,5,5,6,6,7,50（看桶排序退化）'],
        ['custom', '自定义 ↓']
      ], value: 'small' },
      { key: 'w', label: '自定义序列（2~12 个非负整数）', type: 'text', value: '4,2,1,3,3,0,2,1' },
      { key: 'nbuckets', label: '桶数 m（桶排序用）', type: 'number', value: 4, min: 2, max: 8 }
    ],

    run: function (v) {
      var scene = v.scene;
      var arr = v.preset === 'custom' ? su.parse(v.w)
        : v.preset === 'textbook' ? DEF.slice()
          : v.preset === 'skew' ? [5, 5, 5, 6, 6, 7, 50]
            : [4, 2, 1, 3, 3, 0, 2, 1];
      if (arr.length < 2 || arr.length > 12) throw Error('请输入 2~12 个非负整数');
      if (arr.some(function (x) { return x < 0 || !isFinite(x); })) throw Error('计数与桶排序只接受非负整数');
      var n = arr.length, mx = Math.max.apply(null, arr), mn = Math.min.apply(null, arr);
      var frames = [];
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          scene: scene, a: arr.slice(), n: n, count: null, out: null, buckets: null,
          hlA: -1, hlC: null, hlOut: -1, step: '', done: false
        }, snap || {}) });
      }

      if (scene === 'count') {
        if (mx > 99) throw Error('计数排序要开 0~最大值 共 ' + (mx + 1) + ' 格，本演示最多支持最大值 ≤ 99 —— 这正是它的适用边界');
        var cnt = [], i;
        for (i = 0; i <= mx; i++) cnt.push(0);
        F([0, 1, 2], '待排：' + arr.join(' ') + '（n = ' + n + '，值域 0~' + mx + '）。' +
          '先开一个 `count[0..' + mx + ']` 全 0——**它的长度由值域决定，跟 n 没关系**。',
          { 元素数: n + ' 个', 值域: '0~' + mx, 附加空间: (mx + 1) + ' 格' }, { count: cnt.slice() });
        for (i = 0; i < n; i++) {
          cnt[arr[i]]++;
          F([3, 4], '第 ① 步统计：`++count[' + arr[i] + ']` → count[' + arr[i] + '] = ' + cnt[arr[i]] + '。' +
            (i === n - 1 ? '扫完 ' + n + ' 个元素，各频次为 ' + cnt.map(function (c, k) { return c ? k + ':' + c : null; }).filter(Boolean).join('  ') : ''),
            { 步: '① 统计频次 ' + (i + 1) + '/' + n, 当前值: String(arr[i]) },
            { count: cnt.slice(), hlA: i, hlC: [arr[i]] });
        }
        F([5, 6], '第 ② 步前缀和：`count[i] += count[i−1]`。做完之后 `count[v]` 的含义变了——**它是"值 ≤ v 的元素一共有几个"**，也就是 v 该放的最后位置。',
          { 步: '② 前缀和' }, { count: cnt.slice(), hlC: cnt.map(function (_, k) { return k; }) });
        for (i = 1; i <= mx; i++) cnt[i] += cnt[i - 1];
        F([5, 6], '前缀和结果：' + cnt.join(' ') + '。末项 count[' + mx + '] = ' + cnt[mx] + ' 恰好等于 n = ' + n + '，可以自检。',
          { 步: '② 前缀和完成', 末项: 'count[' + mx + '] = ' + cnt[mx] }, { count: cnt.slice() });
        var out = new Array(n + 1);
        for (i = n - 1; i >= 0; i--) {
          var val = arr[i];
          out[cnt[val]] = val; cnt[val]--;
          F([7, 8], '第 ③ 步**从后往前**回填：' + val + ' 的位置是 count[' + val + '] = ' + cnt[val] + '，写完把这个计数减 1。' +
            (i === 0 ? '逆序遍历是为了**稳定**：相同的值里后出现的先占后面的位置，先后次序才不被打乱。' : ''),
          { 步: '③ 回填 ' + (n - i) + '/' + n, 放到: 'out[' + (cnt[val] + 1) + '] = ' + val },
            { count: cnt.slice(), out: out.slice(1), hlA: i, hlC: [val], hlOut: cnt[val] + 1 });
        }
        F([9], '★ 计数排序完成：' + out.slice(1).join(' ') + '。' +
          '时间 O(n + k) = O(' + n + ' + ' + mx + ')，**全程零次比较**；空间 O(n + k)。' +
          '值域 ' + (mx + 1) + ' 格比 n = ' + n + ' 还' + (mx + 1 > n ? '大——这趟买卖不划算' : '小，很划算') + '。',
          { 结果: out.slice(1).join(' '), 比较次数: '0 次', 复杂度: 'O(n+k) = O(' + (n + mx + 1) + ')' },
          { count: cnt.slice(), out: out.slice(1), done: true });
        return { code: CODE, frames: frames };
      }

      /* ---- 桶排序 ---- */
      var m = Math.max(2, Math.min(+v.nbuckets || 4, 8));
      var span = mx - mn + 1;
      function bucketOf(x) { return Math.min(m - 1, Math.floor((x - mn) / span * m)); }
      var bk = [], j;
      for (j = 0; j < m; j++) bk.push([]);
      F([10, 11], '待排：' + arr.join(' ') + '，值域 ' + mn + '~' + mx + '。切 **m = ' + m + ' 个桶**，' +
        '每桶负责宽度 ' + (span / m).toFixed(1) + ' 的一段：`b = ⌊(x − ' + mn + ') / ' + span + ' × ' + m + '⌋`。',
        { 元素数: n + ' 个', 桶数: m + ' 个', 每桶跨度: (span / m).toFixed(1) }, { buckets: bk.map(function (x) { return x.slice(); }) });
      for (i = 0; i < n; i++) {
        var bi = bucketOf(arr[i]);
        bk[bi].push(arr[i]);
        F([13], '`' + arr[i] + '` → 第 ' + bi + ' 号桶（⌊(' + arr[i] + '−' + mn + ')/' + span + '×' + m + '⌋ = ' + bi + '）。',
          { 步: '① 分配 ' + (i + 1) + '/' + n, 落桶: '桶 ' + bi },
          { buckets: bk.map(function (x) { return x.slice(); }), hlA: i, hlB: bi });
      }
      var sizes = bk.map(function (x) { return x.length; });
      F([14], '分配完：各桶 ' + sizes.join(' / ') + ' 个。' +
        (Math.max.apply(null, sizes) === n ? '全挤在一个桶里——**退化**，接下来只能靠桶内排序硬做。'
          : Math.max.apply(null, sizes) <= Math.ceil(n / m) + 1 ? '分得比较均匀，桶内只需处理很少的元素。'
            : '有的桶明显偏挤（最多 ' + Math.max.apply(null, sizes) + ' 个），桶内排序的代价就上来。'),
        { 步: '① 分配完成', 最大桶: Math.max.apply(null, sizes) + ' 个', 空桶: sizes.filter(function (x) { return !x; }).length + ' 个' },
        { buckets: bk.map(function (x) { return x.slice(); }) });
      var sorted = bk.map(function (x) { return x.slice().sort(function (p, q) { return p - q; }); });
      F([15, 16], '第 ② 步桶内排序（教材用插入排序）：' +
        sorted.map(function (x, k) { return x.length ? k + '号桶 ' + x.join(' ') : null; }).filter(Boolean).join('；') + '。',
        { 步: '② 桶内排序' }, { buckets: sorted.map(function (x) { return x.slice(); }) });
      var merged = [];
      sorted.forEach(function (x) { x.forEach(function (y) { merged.push(y); }); });
      F([17], '第 ③ 步按桶号从小到大倒回来：' + merged.join(' ') + '。' +
        '★ 桶排序平均 O(n + n/' + m + ')，**赌的是分布均匀**：这组数据最大桶里有 ' + Math.max.apply(null, sizes) +
        ' 个元素' + (Math.max.apply(null, sizes) > n / m * 2 ? '，明显偏斜，优势就没了' : '，比较均匀') +
        '。桶内用插入排序时整体是稳定的。',
        { 结果: merged.join(' '), 复杂度: '平均 O(n+n/m)', 最大桶: Math.max.apply(null, sizes) + ' 个' },
        { buckets: sorted.map(function (x) { return x.slice(); }), out: merged.slice(), done: true });
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 470, g = '';
      var n = s.a.length;
      g += h.txt(W / 2, 30, s.scene === 'count' ? '计数排序 · 不比较，先数频次再算位置' : '桶排序 · 切成 ' + (s.buckets || []).length + ' 个桶，分桶排再倒回来',
        { size: 17, w: 600 });
      /* 输入 */
      var bw = Math.min(58, Math.floor((W - 160) / n) - 8), x0 = (W - n * (bw + 8)) / 2, iy = 56;
      g += h.txt(x0 - 10, iy + 20, '待排', { size: 12, fill: C.muted, anchor: 'end', w: 600 });
      s.a.forEach(function (x, i) {
        var cur = s.hlA === i;
        g += h.rect(x0 + i * (bw + 8), iy, bw, 32, {
          fill: cur ? C.amberBg : '#fff', stroke: cur ? C.amber : C.grey, sw: cur ? 2.4 : 1.3, rx: 5
        });
        g += h.txt(x0 + i * (bw + 8) + bw / 2, iy + 21, String(x), { size: 13.5, w: cur ? 700 : 400 });
        g += h.txt(x0 + i * (bw + 8) + bw / 2, iy + 44, String(i + 1), { size: 10, fill: C.muted });
      });
      if (s.scene === 'count') {
        /* count 数组 */
        var cn = (s.count || []).length, cx0 = (W - 100) / 2 + 50 - (W - 100) / 2, cy = 132;
        cx0 = (W - (W - 100)) / 2;
        g += h.txt(cx0 - 10, cy + 20, 'count', { size: 12, fill: C.muted, anchor: 'end', w: 600 });
        if (cn <= 24) {
          var cw = Math.min(40, Math.floor((W - 100) / Math.max(cn, 1)) - 4);
          cx0 = (W - cn * (cw + 4)) / 2;
          (s.count || []).forEach(function (x, i) {
            var on = s.hlC && s.hlC.indexOf(i) >= 0;
            g += h.rect(cx0 + i * (cw + 4), cy, cw, 30, { fill: on ? C.blueBg : '#fff', stroke: on ? C.blue : C.line, sw: on ? 2.2 : 1, rx: 4 });
            g += h.txt(cx0 + i * (cw + 4) + cw / 2, cy + 20, String(x), { size: 12.5, w: on ? 700 : 400 });
            g += h.txt(cx0 + i * (cw + 4) + cw / 2, cy + 44, String(i), { size: 10, fill: C.muted });
          });
          g += h.txt(cx0 - 10, cy + 74, '下标', { size: 11, fill: C.muted, anchor: 'end', w: 600 });
        } else {
          /* 值域一宽，逐格写数字必然挤成一团：改画密集条形，让"要开这么多格"本身可见 */
          var spanW = W - 100, bwd = spanW / cn, cmax = Math.max.apply(null, s.count) || 1;
          (s.count || []).forEach(function (x, i) {
            var on = s.hlC && s.hlC.indexOf(i) >= 0;
            var hh2 = x === 0 ? 2 : Math.max(4, Math.round(x / cmax * 40));
            g += h.rect(50 + i * bwd + 0.5, cy + 40 - hh2, Math.max(1, bwd - 1), hh2,
              { fill: on ? C.blue : x ? '#93c5fd' : '#e2e8f0', stroke: 'none', rx: 1 });
          });
          g += h.rect(50, cy + 41, spanW, 1, { fill: C.line, stroke: 'none', rx: 0 });
          g += h.txt(50, cy + 60, '0', { size: 10.5, fill: C.muted, anchor: 'start' });
          g += h.txt(W - 50, cy + 60, String(cn - 1), { size: 10.5, fill: C.muted, anchor: 'end' });
          g += h.txt(W / 2, cy + 78, '值域共 ' + cn + ' 格（图太宽放不下逐格数字，用条形高度表示计数）',
            { size: 11.5, fill: C.muted });
        }
        /* 输出 */
        if (s.out) {
          var on2 = s.out.length, ow = Math.min(58, Math.floor((W - 160) / Math.max(on2, 1)) - 8), ox0 = (W - on2 * (ow + 8)) / 2, oy = 232;
          g += h.txt(ox0 - 10, oy + 20, '输出', { size: 12, fill: C.muted, anchor: 'end', w: 600 });
          s.out.forEach(function (x, i) {
            var has = x !== undefined && x !== null && x !== '';
            var cur = s.hlOut === i + 1;
            g += h.rect(ox0 + i * (ow + 8), oy, ow, 32, {
              fill: has ? (cur ? C.greenBg : '#f0fdf4') : '#fbfcfe', stroke: has ? (cur ? C.green : C.green) : C.line,
              sw: cur ? 2.6 : 1.2, rx: 5, dash: has ? null : '5,4'
            });
            if (has) g += h.txt(ox0 + i * (ow + 8) + ow / 2, oy + 21, String(x), { size: 13.5, w: 700 });
            g += h.txt(ox0 + i * (ow + 8) + ow / 2, oy + 44, String(i + 1), { size: 10, fill: C.muted });
          });
        }
        var mx2 = Math.max.apply(null, s.a);
        g += h.txt(W / 2, 330, 'count[v] 的含义随步骤变化：① 之后是"v 出现几次"，② 之后变成"值 ≤ v 的元素有几个"',
          { size: 12, fill: C.muted });
        g += h.txt(W / 2, 356, '比较次数恒为 0；附加空间 = 值域宽度 ' + (mx2 + 1) + ' 格 + 输出数组 ' + n + ' 格',
          { size: 12, fill: C.muted });
        g += h.txt(W / 2, H - 16, s.done ? '★ 计数排序 O(n+k)：值域小就划算，值域大反而不如比较排序'
          : '三步：数频次 → 前缀和 → 逆序回填（逆序是稳定性的来源）',
          { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
        return h.svg(W, H, g);
      }

      /* 桶 */
      var bk = s.buckets || [], by = 126;
      /* 行高必须给底部留出「倒回」那一行：8 个桶时固定 46 会把倒回行顶到画布外 */
      var bh = Math.min(46, Math.floor((260 - bk.length * 6) / Math.max(bk.length, 1)));
      for (var r = 0; r < bk.length; r++) {
        var y = by + r * (bh + 6), on = s.hlB === r;
        g += h.rect(150, y, 600, bh, { fill: on ? C.amberBg : '#fbfcfe', stroke: on ? C.amber : C.line, sw: on ? 2.4 : 1.2, rx: 6 });
        g += h.txt(140, y + bh / 2 + 5, '桶 ' + r, { size: 12, fill: on ? C.amber : C.muted, anchor: 'end', w: 600 });
        bk[r].forEach(function (x, xi) {
          var bx = 160 + xi * 46;
          g += h.rect(bx, y + 6, 40, bh - 12, { fill: '#fff', stroke: C.grey, sw: 1.2, rx: 4 });
          g += h.txt(bx + 20, y + bh / 2 + 5, String(x), { size: 12.5, w: 700 });
        });
        if (!bk[r].length) g += h.txt(166, y + bh / 2 + 5, '（空）', { size: 11.5, fill: '#b9c3cf', anchor: 'start' });
      }
      if (s.out) {
        var oy2 = by + bk.length * (bh + 6) + 14, ow2 = Math.min(58, Math.floor((W - 160) / n) - 8), ox2 = (W - n * (ow2 + 8)) / 2;
        g += h.txt(ox2 - 10, oy2 + 20, '倒回', { size: 12, fill: C.muted, anchor: 'end', w: 600 });
        s.out.forEach(function (x, i) {
          g += h.rect(ox2 + i * (ow2 + 8), oy2, ow2, 30, { fill: '#f0fdf4', stroke: C.green, sw: 1.2, rx: 5 });
          g += h.txt(ox2 + i * (ow2 + 8) + ow2 / 2, oy2 + 20, String(x), { size: 13, w: 700 });
        });
      }
      g += h.txt(W / 2, H - 16, s.done ? '★ 桶排序赌分布：均匀则接近线性，全挤一个桶就退化成桶内排序的 O(n²)'
        : '分配 → 桶内排序（通常插入排序）→ 按桶号从小到大倒回来',
        { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
