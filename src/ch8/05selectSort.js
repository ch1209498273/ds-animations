/* 动画：直接选择排序——教材 8.5 选择排序，例题 {49,38,65,97,76,13,27,49*} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  var CODE = [
    'void SelectSort(SqList &L) {',
    '    for (i = 1; i < L.length; ++i) {',
    '        k = i;                                // 先假设第 i 个最小',
    '        for (j = i+1; j <= L.length; ++j)',
    '            if (L.r[j] < L.r[k])  k = j;      // 记录更小者的位置',
    '        if (k != i)  swap(L.r[i], L.r[k]);    // 与第 i 个交换',
    '    }',
    '}'
  ];

  DSC.reg({
    id: 'selectSort', ch: 8, name: '直接选择排序（选最小交换）',
    aim: '每趟从没排好的部分**选出最小**换到前面：比较次数固定、移动少，但不稳定',
    note: '教材 8.5 选择排序（选最小者放到队首，不稳定）',
    keywords: '简单选择排序 选最小 交换 不稳定 比较次数 n(n-1)/2 与初始无关 打擂台',
    guide: [
      '每趟在无序区里**选出最小值**（黄色跟踪候选最小者），与无序区第一个元素交换',
      '与冒泡的区别：比较时只记录位置不交换，每趟最多交换 1 次——交换次数最少',
      '红色=发生交换的一对，绿色=已就位；比较次数固定 n(n−1)/2，与初始序列无关',
      '交换会跨越相等元素：反例 3,3,1 第一趟 1 与第一个 3 交换后两个 3 乱序——不稳定'
    ],
    inputs: su.presetInputs(),
    run: function (v) {
      var a = su.getData(v).slice();
      var n = a.length, cmp = 0, mov = 0;
      var frames = [];

      function colors(hl) {
        hl = hl || {};
        var cs = [];
        for (var i = 0; i < n; i++) cs.push(hl.doneFrom != null && i < hl.doneFrom ? 'D' : 'N');
        if (hl.c != null) cs[hl.c] = 'C';
        if (hl.m != null) cs[hl.m] = 'P';
        if (hl.s1 != null) { cs[hl.s1] = 'S'; cs[hl.s2] = 'S'; }
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 交换: mov + ' 次', 有序区: extra.doneFrom != null ? '第 1~' + extra.doneFrom + ' 个' : '—' },
          snap: { arr: a.slice(), colors: colors(extra), mark: mk }
        });
      }

      F(0, '初始序列。选择排序：每趟从未排序部分选出最小值，放到开头。', { doneFrom: 0 });

      for (var i = 0; i < n - 1; i++) {
        var k = i;
        F([2], '第 ' + (i + 1) + ' 趟：先假设 a[' + (i + 1) + ']=' + a[i] + ' 是无序区最小。', { m: k, doneFrom: i });
        for (var j = i + 1; j < n; j++) {
          cmp++;
          if (a[j] < a[k]) {
            var old = k; k = j;
            F([4], 'a[' + (j + 1) + ']=' + a[j] + ' < 候选最小 a[' + (old + 1) + ']=' + a[old] + ' → 更新候选最小为 a[' + (j + 1) + ']。', { m: k, c: j, doneFrom: i });
          } else {
            F([4], 'a[' + (j + 1) + ']=' + a[j] + ' ≥ 候选最小 a[' + (k + 1) + ']=' + a[k] + '，不更新。', { m: k, c: j, doneFrom: i });
          }
        }
        if (k !== i) {
          var t = a[i]; a[i] = a[k]; a[k] = t; mov++;
          F(5, '无序区最小值 ' + a[i] + '（原在 a[' + (k + 1) + ']）与 a[' + (i + 1) + '] 交换。', { s1: i, s2: k, doneFrom: i + 1 });
        } else {
          F(5, '最小值恰好就在 a[' + (i + 1) + ']，本趟无需交换。', { doneFrom: i + 1 });
        }
        F([1, 6], '第 ' + (i + 1) + ' 趟完成：a[' + (i + 1) + ']=' + a[i] + ' 已就位。', { doneFrom: i + 1 }, i + 1);
      }
      F(0, '排序完成：' + a.join(' ') + '。共比较 ' + cmp + ' 次（固定 n(n−1)/2）、交换 ' + mov + ' 次（最多 n−1）。移动次数少是它对"交换成本高"场景的价值；但比较不占便宜，且不稳定。', { doneFrom: n }, 'final');
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var g = su.bars(s, { title: '直接选择排序（蓝=当前候选最小，黄=正在比较，红=交换，绿=已就位）' });
      g += su.legend([['候选最小', 'P'], ['比较', 'C'], ['交换', 'S'], ['已就位', 'D']]);
      return su.wrap(g);
    }
  });
})();
