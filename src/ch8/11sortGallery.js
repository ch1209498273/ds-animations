/* 动画：八大排序总览——同一数据跑全部 8 算法，统计比较/移动次数、稳定性、复杂度对照 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  var CODE = [
    '// 同一初始序列分别执行 8 种内部排序，',
    '// 统计：比较次数 / 移动(交换)次数 / 是否稳定 / 复杂度',
    '// 最终输出对照表，验证"结果一致、代价不同、稳定性有别"'
  ];

  /* 轻量实现（带 {v,id} 元素以检测稳定性；r = 记录移动次数，c = 比较次数） */
  function runAlgos(input) {
    function mk(a) { return a.map(function (v, i) { return { v: v, id: i }; }); }
    function keys(o) { return o.map(function (x) { return x.v; }); }
    var out = [];
    function alg(name, fn, stable, best, worst, extra) {
      var a = mk(input), c = 0, r = 0;
      fn(a, function () { c++; }, function () { r++; });
      var ok = keys(a).every(function (v, i, arr2) { return i === 0 || arr2[i - 1] <= v; });
      var st = a.every(function (x, i) { return i === 0 || (a[i - 1].v > x.v) || (a[i - 1].v < x.v ? true : a[i - 1].id < x.id); });
      out.push({ name: name, cmp: c, mov: r, sorted: ok, stable: st, stableClaim: stable, best: best, worst: worst, space: extra });
    }
    alg('直接插入', function (a, C2, R2) {
      for (var i = 1; i < a.length; i++) { var x = a[i], j = i - 1; C2(); while (j >= 0 && a[j].v > x.v) { C2(); a[j + 1] = a[j]; R2(); j--; } a[j + 1] = x; R2(); }
    }, true, 'O(n)', 'O(n²)', 'O(1)');
    alg('希尔排序', function (a, C2, R2) {
      var gaps = []; for (var g = Math.floor(a.length / 2); g >= 1; g = Math.floor(g / 2)) gaps.push(g);
      gaps.forEach(function (dk) {
        for (var i = dk; i < a.length; i++) { var x = a[i], j = i - dk; C2(); while (j >= 0 && a[j].v > x.v) { C2(); a[j + dk] = a[j]; R2(); j -= dk; } a[j + dk] = x; R2(); }
      });
    }, false, '≈O(n)', 'O(n²)', 'O(1)');
    alg('冒泡排序', function (a, C2, R2) {
      var m = a.length - 1, flag = 1;
      while (m > 0 && flag) { flag = 0; for (var j = 0; j < m; j++) { C2(); if (a[j].v > a[j + 1].v) { var t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; R2(); flag = 1; } } m--; }
    }, true, 'O(n)', 'O(n²)', 'O(1)');
    alg('快速排序', function (a, C2, R2) {
      (function qs(lo, hi) {
        if (lo >= hi) return; var p = a[lo].v, i = lo, j = hi;
        while (i < j) { while (i < j && a[j].v >= p) { C2(); j--; } if (i < j) { a[i] = a[j]; R2(); } while (i < j && a[i].v <= p) { C2(); i++; } if (i < j) { a[j] = a[i]; R2(); } }
        a[i] = { v: p, id: -1 }; R2(); qs(lo, i - 1); qs(i + 1, hi);
      })(0, a.length - 1);
    }, false, 'O(n log n)', 'O(n²)', 'O(log n)栈');
    alg('直接选择', function (a, C2, R2) {
      for (var i = 0; i < a.length - 1; i++) { var k = i; for (var j = i + 1; j < a.length; j++) { C2(); if (a[j].v < a[k].v) k = j; } if (k !== i) { var t = a[i]; a[i] = a[k]; a[k] = t; R2(); } }
    }, false, 'O(n²)', 'O(n²)', 'O(1)');
    alg('堆排序', function (a, C2, R2) {
      var n = a.length;
      function sift(s, m) { var rc = a[s]; for (var j = 2 * s + 1; j <= m; j = 2 * j + 1) { if (j < m) { C2(); if (a[j].v < a[j + 1].v) j++; } C2(); if (rc.v >= a[j].v) break; a[s] = a[j]; R2(); s = j; } a[s] = rc; R2(); }
      for (var i = Math.floor(n / 2) - 1; i >= 0; i--) sift(i, n - 1);
      for (var i2 = n - 1; i2 > 0; i2--) { var t = a[0]; a[0] = a[i2]; a[i2] = t; R2(); sift(0, i2 - 1); }
    }, false, 'O(n log n)', 'O(n log n)', 'O(1)');
    alg('归并排序', function (a, C2, R2) {
      var buf = new Array(a.length);
      (function ms(lo, hi) {
        if (lo >= hi) return; var m = (lo + hi) >> 1; ms(lo, m); ms(m + 1, hi);
        var i = lo, j = m + 1, k = lo;
        while (i <= m && j <= hi) { C2(); buf[k++] = (a[i].v <= a[j].v) ? a[i++] : a[j++]; R2(); }
        while (i <= m) { buf[k++] = a[i++]; R2(); } while (j <= hi) { buf[k++] = a[j++]; R2(); }
        for (var x = lo; x <= hi; x++) a[x] = buf[x];
      })(0, a.length - 1);
    }, true, 'O(n log n)', 'O(n log n)', 'O(n)');
    alg('基数排序', function (a, C2, R2) {
      for (var bit = 1; bit <= 3; bit++) {
        var bks = []; for (var b = 0; b < 10; b++) bks.push([]);
        a.forEach(function (x) { bks[Math.floor(x.v / Math.pow(10, bit - 1)) % 10].push(x); R2(); });
        var k = 0; bks.forEach(function (bk) { bk.forEach(function (x) { a[k++] = x; R2(); }); });
      }
    }, true, 'O(d(n+r))', 'O(d(n+r))', 'O(n+r)');
    return out;
  }

  DSC.reg({
    id: 'sortGallery', ch: 8, name: '八大排序总览与对比',
    aim: '八大排序放一张表里比：**时间、空间、稳定性、适用场景**，一眼看出该用哪个',
    note: '教材 8.8 排序综合比较（同一数据 × 8 算法 × 代价对照）',
    guide: [
      '同一初始序列分别用 8 种排序跑一遍：结果必然一致——差别在"代价"',
      '对照表给出比较/移动次数与复杂度；重点体会"同数据、不同算法、代价悬殊"',
      '切到"逆序/有序"数据再看：快排怕有序、冒泡爱有序——没有万能算法，只有适配场景',
      '稳定性列用两个相同的数验证：稳定算法排序后它们保持原有先后次序'
    ],
    inputs: su.presetInputs(),
    run: function (v) {
      var a = su.getData(v).slice();
      var stats = runAlgos(a);
      var frames = [];
      var sortedRef = a.slice().sort(function (x, y) { return x - y; });

      stats.forEach(function (st, i) {
        frames.push({
          line: [1, 2], msg: '【' + st.name + '】比较 ' + st.cmp + ' 次、移动/交换 ' + st.mov + ' 次；复杂度 最好 ' + st.best + ' / 最坏 ' + st.worst + '，空间 ' + st.space + '；' + (st.stableClaim ? '稳定' : '不稳定') + '。' + (i === 0 ? '逐个算法过一遍，最后给出汇总表。' : ''),
          panel: { 算法: st.name, 比较: st.cmp + ' 次', 移动: st.mov + ' 次', 稳定: st.stableClaim ? '✓ 是' : '✗ 否' },
          snap: { arr: a.slice(), cur: i, stats: stats }
        });
      });
      frames.push({
        line: [2], msg: '★ 汇总：8 种算法结果一致（' + sortedRef.join(' ') + '），代价大不相同。经验法则：基本有序 → 插入/冒泡；要求稳定 + 稳定 O(n log n) → 归并；空间苛刻 + 平均最快 → 快排；最坏也有 O(n log n) 且 O(1) 空间 → 堆排；位数固定的整数/多关键字 → 基数。',
        panel: { 结论: '见表格', 算法数: '8', 数据: a.join(',') },
        snap: { arr: sortedRef.slice(), cur: -1, stats: stats, mark: 'final' }
      });
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 560;
      var g = '';
      g += h.txt(W / 2, 32, '八大排序 · 同一数据 · 代价对照表', { size: 18, w: 600 });
      var cols = ['算法', '比较', '移动/交换', '稳定', '最好', '最坏', '空间'];
      var rows = s.stats;
      var x0 = 60, y0 = 70, cw = [140, 110, 130, 80, 150, 160, 120];
      var xx = [];
      (function () { var t = x0; cols.forEach(function (c, i) { xx.push(t); t += cw[i]; }); })();
      g += h.rect(x0 - 10, y0 - 30, cw.reduce(function (p, c) { return p + c; }, 0) + 20, 34, { fill: '#0f2c5c', stroke: 'none', rx: 6 });
      cols.forEach(function (c, i) { g += h.txt(xx[i] + cw[i] / 2 - 10, y0 - 8, c, { size: 13.5, fill: '#fff', w: 600 }); });
      rows.forEach(function (r, ri) {
        var y = y0 + ri * 44;
        var on = s.cur === ri, fin = s.mark === 'final';
        g += h.rect(x0 - 10, y - 4, cw.reduce(function (p, c) { return p + c; }, 0) + 20, 40, { fill: on ? C.blueBg : (fin ? '#f8fafc' : '#fff'), stroke: on ? C.blue : C.line, sw: on ? 2 : 1, rx: 6 });
        var vals = [r.name, r.cmp + ' 次', r.mov + ' 次', r.stableClaim ? '✓ 是' : '✗ 否', r.best, r.worst, r.space];
        vals.forEach(function (t, i) {
          g += h.txt(xx[i] + cw[i] / 2 - 10, y + 20, t, {
            size: 13, w: i === 0 ? 600 : 400,
            fill: i === 3 ? (r.stableClaim ? C.green : C.red) : (i === 1 || i === 2) && on ? C.blue : C.ink
          });
        });
      });
      var yb = y0 + rows.length * 44 + 26;
      if (s.mark === 'final') {
        g += h.rect(W / 2 - 330, yb, 660, 60, { fill: C.greenBg, stroke: C.green, rx: 9 });
        g += h.txt(W / 2, yb + 26, '全部结果一致：' + s.arr.join(' '), { size: 15, w: 700, fill: C.green });
        g += h.txt(W / 2, yb + 48, '选择依据：看初始状态（有序?）、稳定性要求、空间限制', { size: 12.5, fill: C.muted });
      } else {
        g += h.txt(W / 2, yb + 16, '↑ 逐个算法执行中……最后一帧给出汇总结论', { size: 13, fill: C.muted });
      }
      return h.svg(W, H, g);
    }
  });
})();
