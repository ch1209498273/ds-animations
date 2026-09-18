/* 动画：归并排序——教材 8.6，2 路归并（递归），例题 {49,38,65,97,76,13,27,49*} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  var CODE = [
    'void Merge(SqList SR, SqList &TR, int s, int m, int t) {',
    '    // 将有序的 SR[s..m] 和 SR[m+1..t] 归并为有序的 TR[s..t]',
    '    for (i = s, j = m+1; i <= m && j <= t; ) {',
    '        if (SR[i] <= SR[j])  TR[k++] = SR[i++];   // 取左半（≤ 保稳定）',
    '        else                 TR[k++] = SR[j++];   // 取右半',
    '    }',
    '    while (i <= m) TR[k++] = SR[i++];             // 收尾：左半剩余',
    '    while (j <= t) TR[k++] = SR[j++];             // 收尾：右半剩余',
    '}',
    'void MSort(SqList SR, SqList &TR1, int s, int t) {',
    '    if (s == t)  TR1[s] = SR[s];',
    '    else { m = (s+t)/2;',
    '        MSort(SR, TR2, s, m);  MSort(SR, TR2, m+1, t);   // 递归两半',
    '        Merge(TR2, TR1, s, m, t); }                       // 归并',
    '}'
  ];

  DSC.reg({
    id: 'mergeSort', ch: 8, name: '归并排序（2 路归并）',
    note: '教材 8.6 归并排序（分治 + 两路合并，稳定）',
    guide: [
      '分治：把序列一分为二，两半分别排好序（左侧帧会显示当前处理的区间），再两路归并',
      '归并时两指针分别指向左右半区开头：每次取较小者写入结果（相等取左半——稳定）',
      '看最下面一层：单个元素天然有序，归并从最小单元自底向上长出有序序列',
      '一趟归并 O(n)，共 ⌈log n⌉ 趟，任何输入都是 O(n log n)；代价是需要 O(n) 辅助数组；它也是**外排序**的基础'
    ],
    inputs: su.presetInputs(),
    run: function (v) {
      var a = su.getData(v).slice();
      var n = a.length, cmp = 0, mov = 0;
      var frames = [];

      function colors(hl) {
        hl = hl || {};
        var cs = [];
        for (var i = 0; i < n; i++) cs.push('N');
        (hl.zl || []).forEach(function (i2) { cs[i2] = 'P'; });
        (hl.zr || []).forEach(function (i2) { if (cs[i2] === 'N') cs[i2] = 'N'; });
        if (hl.c1 != null) cs[hl.c1] = 'C';
        if (hl.c2 != null) cs[hl.c2] = 'C';
        if (hl.w != null) cs[hl.w] = 'S';
        (hl.done || []).forEach(function (i2) { cs[i2] = 'D'; });
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 写入: mov + ' 次', 当前区间: extra.range || '—' },
          snap: { arr: view.slice(), colors: colors(extra), mark: mk, range: extra.range }
        });
      }

      var work = a.slice(), view = a.slice();
      F(0, '初始序列。归并排序自顶向下二分，自底向上归并。', {});

      function msort(s, t) {           // 对 work[s..t] 排序（闭区间，0 基）
        if (s === t) return;
        var m = Math.floor((s + t) / 2);
        msort(s, m); msort(m + 1, t);
        var range = '[' + (s + 1) + '..' + (t + 1) + ']（左 [' + (s + 1) + '..' + (m + 1) + '] ＋ 右 [' + (m + 2) + '..' + (t + 1) + ']）';
        F(12, '开始归并区间 ' + range + '：两半各自已有序。', { zl: span(s, m), zr: span(m + 1, t), range: range });
        var i = s, j = m + 1, buf = [];
        while (i <= m && j <= t) {
          cmp++;
          if (work[i] <= work[j]) { buf.push(work[i]); F([3], '左半 a[' + (i + 1) + ']=' + work[i] + ' ≤ 右半 a[' + (j + 1) + ']=' + work[j] + ' → 取左。', { c1: i, c2: j, zl: span(s, m), zr: span(m + 1, t), range: range }); i++; }
          else { buf.push(work[j]); F([4], '左半 a[' + (i + 1) + ']=' + work[i] + ' > 右半 a[' + (j + 1) + ']=' + work[j] + ' → 取右。', { c1: i, c2: j, zl: span(s, m), zr: span(m + 1, t), range: range }); j++; }
          mov++;
        }
        while (i <= m) { buf.push(work[i]); mov++; i++; }
        while (j <= t) { buf.push(work[j]); mov++; j++; }
        for (var k2 = 0; k2 < buf.length; k2++) work[s + k2] = buf[k2];
        view = work.slice();
        F([5, 6, 7], '归并完成：区间 ' + range + ' 已整体有序：' + buf.join(' ') + '。', { zl: span(s, m), zr: span(m + 1, t), range: range, done: span(s, t) }, 'm' + s + '_' + t);
      }
      function span(s, t) { var r = []; for (var x = s; x <= t; x++) r.push(x); return r; }

      msort(0, n - 1);
      view = work.slice();
      F(15, '排序完成：' + view.join(' ') + '。n 个元素共归并 ⌈log₂n⌉ 层、每层 O(n)，任何输入都稳定在 O(n log n)；相等时优先取左半保证稳定。空间代价 O(n) 是它的短板——但这个"有序段合并"思想让归并成为磁盘外排序的基石。', {}, 'final');
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var g = su.bars(s, { title: '归并排序（蓝=左半区，黄=左右指针比较，红=写入，绿=该区间已有序）' });
      g += su.legend([['左半区', 'P'], ['比较指针', 'C'], ['写入', 'S'], ['已有序', 'D']]);
      return g;
    }
  });
})();
