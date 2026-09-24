/* 动画：时间复杂度可视化——曲线随 n 生长，坐标轴实时缩放（教材 1.4） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    '常见时间复杂度（n 为问题规模）：',
    '  O(1)      常数阶：与 n 无关（顺序表取值）',
    '  O(log n)  对数阶：每次折半（折半查找）',
    '  O(n)      线性阶：扫一遍（顺序查找）',
    '  O(n log n)：分治一层 O(n) × log n 层（归并/快排平均）',
    '  O(n²)     平方阶：双重循环（简单排序）',
    '  O(2ⁿ)     指数阶：子集枚举——n 稍大就不可行'
  ];

  var FNS = [
    { name: 'O(1)', f: function () { return 1; }, color: '#16a34a' },
    { name: 'O(log n)', f: function (n) { return Math.log2(n); }, color: '#2563eb' },
    { name: 'O(n)', f: function (n) { return n; }, color: '#9333ea' },
    { name: 'O(n log n)', f: function (n) { return n * Math.log2(Math.max(n, 1.5)); }, color: '#d97706' },
    { name: 'O(n²)', f: function (n) { return n * n; }, color: '#dc2626' },
    { name: 'O(2ⁿ)', f: function (n) { return Math.pow(2, n); }, color: '#0f172a' }
  ];
  function sup(k) { return String(k).split('').map(function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d] || d; }).join(''); }
  function fmt(x) {
    if (x < 1e6) return String(Math.round(x * 10) / 10);
    var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
    return (Math.round(m * 100) / 100) + 'e+' + e;
  }

  DSC.reg({
    id: 'complexity', ch: 1, name: '时间复杂度可视化',
    aim: 'n 一大，各种量级的差距就这么残酷——**跑得快慢不看常数，看阶**',
    note: '教材 1.4 算法与算法分析（增长速度分级、渐近符号）',
    keywords: '大O 渐近 增长速度 数量级 O(1) O(logn) O(nlogn) O(n2) O(2n) 指数 复杂度分级 阶 比较快慢',
    guide: [
      '播放时曲线逐点生长，横纵坐标每帧自动缩放——n 小的时候大家都是 1，分不出好坏',
      '看黑线 O(2ⁿ)：n 每加 1，代价就**翻一倍**；对照红线 O(n²) 只是慢慢加——差距越拉越大',
      'n=10 时 O(2ⁿ)=1024 还不算吓人；n=30 已是 10⁹；n=60 达 10¹⁸——机器快 1000 倍也追不上',
      '结论：选对复杂度才是关键。考试排序：O(1)<O(log n)<O(n)<O(n log n)<O(n²)<O(2ⁿ)'
    ],
    inputs: [
      { key: 'nmax', label: '最大规模 n', type: 'number', value: 16, min: 4, max: 300 }
    ],
    run: function (v) {
      var NMAX = Math.min(300, Math.max(4, Math.round(+v.nmax || 16)));
      var frames = [];
      for (var n = 1; n <= NMAX; n++) {
        var vals = FNS.map(function (f) { return { name: f.name, v: f.f(n), color: f.color }; });
        frames.push({
          /* CODE[0] 是标题行，六条复杂度占 [1..6]：模数写成 7 会让 n=7 那一帧高亮到不存在的行 */
          line: [(n - 1) % 6 + 1], msg: (n === NMAX ? '★ ' : '') + 'n = ' + n + '：' + vals.map(function (x) { return x.name + ' = ' + fmt(x.v); }).join('，') + (n === 1 ? '。自动播放，看曲线生长、坐标轴跟着缩放。' : n === NMAX ? '。O(2^' + NMAX + ') = ' + fmt(Math.pow(2, NMAX)) + '——指数阶在真实机器上不可行。' : ''),
          panel: (function () {
            var p = {};
            vals.forEach(function (x) { p[x.name] = fmt(x.v); });
            return p;
          })(),
          snap: { n: n, nmax: NMAX, vals: vals, mark: n === NMAX ? 'final' : undefined }
        });
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 500;
      var n = s.n, NMAX = s.nmax || 32;
      var vals = s.vals;
      var ox = 96, oy = 56, pw = W - ox - 60, ph = H - oy - 150;
      var g = '';
      g += h.txt(W / 2, 30, '常见时间复杂度增长曲线（坐标轴随 n 自动缩放 · 当前 n = ' + n + '）', { size: 17, w: 600 });
      /* 纵轴：动态对数刻度（顶 = 当前 n 时最大代价），刻度去重；曲线逐点生长 */
      var yMaxLog = Math.max(1, Math.log10(Math.max.apply(null, vals.map(function (x) { return x.v; }))));
      function Y(val) { return oy + ph * (1 - Math.log10(Math.max(1, val)) / yMaxLog); }
      function X(nn) { return n <= 1 ? ox : ox + pw * (nn - 1) / (n - 1); }
      var ye = [];
      for (var gy = 0; gy <= 4; gy++) {
        var e = Math.floor(gy * yMaxLog / 4);   // 不能用 round：yMaxLog 是小数，round 会舍出超过轴上限的刻度，标签被摆到画布上方
        if (ye.indexOf(e) < 0) ye.push(e);
      }
      ye.forEach(function (e) {
        var y = oy + ph * (1 - e / yMaxLog);
        g += h.line(ox, y, ox + pw, y, { stroke: '#eef2f7', sw: 1 });
        g += h.txt(ox - 8, y + 4, e === 0 ? '1' : '10' + sup(e), { size: 10.5, fill: C.muted, anchor: 'end' });
      });
      /* 轴顶标实际最大值：刻度取 floor 后顶格刻度低于轴顶，不补的话曲线最高点没有数可读。
         比较的是像素间距而非数值差——yMaxLog 略大于整数时顶格刻度只差零点几像素，
         补上去会和"10³"叠成一行 */
      if (ph * (1 - ye[ye.length - 1] / yMaxLog) >= 12) {
        g += h.line(ox, oy, ox + pw, oy, { stroke: '#eef2f7', sw: 1 });
        var mxv = Math.max.apply(null, vals.map(function (x) { return x.v; }));
        /* 标签右对齐在 x=88，最多约 15 个字符：nmax=64 时 O(2^n) 的原值有 19 位，
           直接 String() 会画到画布外，超过 12 位改科学计数法 */
        var mxTxt = String(mxv).length > 12 ? mxv.toExponential(2).replace('e+', 'e') : String(mxv);
        g += h.txt(ox - 8, oy + 4, mxTxt, { size: 10.5, fill: C.muted, anchor: 'end' });
      }
      /* 横轴：整数步长刻度（1 起到 n，不重复） */
      var xstep = Math.max(1, Math.ceil((n - 1) / 4));
      var xticks = [1];
      for (var v = 1 + xstep; v < n; v += xstep) xticks.push(v);
      if (n > 1) xticks.push(n);
      xticks.forEach(function (tv) {
        var x = X(tv);
        g += h.line(x, oy, x, oy + ph, { stroke: '#eef2f7', sw: 1 });
        g += h.txt(x, oy + ph + 16, String(tv), { size: 10, fill: C.muted });
      });
      g += h.txt(ox + pw / 2, oy + ph + 34, 'n（横轴 1 到当前 n）', { size: 12, fill: C.muted });
      g += h.txt(ox - 40, oy - 18, '代价（每格 ×10）', { size: 11, fill: C.muted, anchor: 'start' });
      /* 曲线：逐点生长到当前 n */
      FNS.forEach(function (f) {
        var pts = [];
        for (var k = 0; k <= 60; k++) {
          var nn = 1 + (n - 1) * k / 60;
          pts.push([X(nn), Y(f.f(nn))]);
        }
        g += '<path d="M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L') + '" fill="none" stroke="' + f.color + '" stroke-width="2.2" opacity="0.92"/>';
      });
      /* 前沿数值点 */
      vals.forEach(function (x) {
        g += h.circle(X(n), Y(x.v), 5.5, { fill: x.color, stroke: '#fff', sw: 1.5 });
      });
      /* 图例（按当前值排序） */
      var sorted = vals.slice().sort(function (a, b) { return a.v - b.v; });
      sorted.forEach(function (it, i) {
        var x = ox + (i % 3) * 190, y = oy + ph + 56 + Math.floor(i / 3) * 24;
        g += h.rect(x, y - 12, 14, 14, { fill: it.color, rx: 3 });
        g += h.txt(x + 20, y, it.name + ' = ' + fmt(it.v), { size: 12.5, anchor: 'start', family: 'Consolas,monospace' });
      });
      g += h.txt(W / 2, H - 10, '纵轴每格 ×10（对数刻度）：黑线 O(2ⁿ) 每抬一格代价就翻 10 倍——n=60 时它已爬到 10¹⁸，而 O(n²) 才 3600', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
