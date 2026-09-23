/* 动画：冒泡排序——教材 8.4 交换排序，含"已有序提前终止"，例题 {49,38,65,97,76,13,27,49*} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  var CODE = [
    'void BubbleSort(SqList &L) {',
    '    m = L.length - 1;  flag = 1;              // flag 记录某一趟是否发生交换',
    '    while (m > 0 && flag) {',
    '        flag = 0;                             // 本趟开始先假设不交换',
    '        for (j = 1; j <= m; ++j)',
    '            if (L.r[j] > L.r[j+1]) {',
    '                swap(L.r[j], L.r[j+1]);       // 逆序则交换',
    '                flag = 1;                     // 发生了交换',
    '            }',
    '        --m;                                  // 最大者已"冒泡"到末尾',
    '    }',
    '}'
  ];

  DSC.reg({
    id: 'bubbleSort', ch: 8, name: '冒泡排序（相邻逆序交换）',
    aim: '相邻逆序就交换，一趟把最大值**冒到末尾**；某一趟没交换就提前收工',
    note: '教材 8.4 交换排序（相邻比较、大数沉底，稳定）',
    guide: [
      '每趟从左到右依次比较相邻两个：逆序就交换——最大的数像气泡一样"冒"到末尾',
      '黄色=正在比较的一对，红色=发生交换；每趟结束最右端多一个绿色"已就位"',
      '重点看 flag：若某一趟一次交换都没发生，序列已有序，提前终止',
      '最好情况（已有序）只比较 n−1 次、0 次移动——切到"有序"数据试一试'
    ],
    inputs: su.presetInputs(),
    run: function (v) {
      var a = su.getData(v).slice();
      var n = a.length, cmp = 0, mov = 0;
      var frames = [];

      function colors(hl) {
        var cs = [];
        for (var i = 0; i < n; i++) cs.push(hl.doneFrom != null && i >= hl.doneFrom ? 'D' : 'N');
        if (hl.c1 != null) cs[hl.c1] = 'C';
        if (hl.c2 != null) cs[hl.c2] = 'C';
        if (hl.s1 != null) cs[hl.s1] = 'S';
        if (hl.s2 != null) cs[hl.s2] = 'S';
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 交换: mov + ' 次', 已就位: extra.doneFrom != null ? '第 ' + (extra.doneFrom + 1) + '~' + n + ' 个' : '—' },
          snap: { arr: a.slice(), colors: colors(extra), mark: mk }
        });
      }

      F(0, '初始序列。冒泡排序按"相邻比较、逆序交换"进行，每趟把当前无序区的最大值送到末尾。', {});

      var m = n - 1, flag = 1, pass = 0;
      while (m > 0 && flag) {
        flag = 0; pass++;
        F([3], '第 ' + pass + ' 趟开始：flag 清零（假设本趟无交换），无序区为第 1~' + (m + 1) + ' 个。', { doneFrom: m + 1 });
        for (var j = 0; j < m; j++) {
          cmp++;
          if (a[j] > a[j + 1]) {
            var t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
            mov++; flag = 1;
            F([6, 7, 8], 'a[' + (j + 1) + ']=' + t + ' > a[' + (j + 2) + ']=' + a[j] + '，逆序 → 交换。', { s1: j, s2: j + 1, doneFrom: m + 1 });
          } else {
            F(5, 'a[' + (j + 1) + ']=' + a[j] + ' ≤ a[' + (j + 2) + ']=' + a[j + 1] + '，顺序正确，不交换。', { c1: j, c2: j + 1, doneFrom: m + 1 });
          }
        }
        F(9, '第 ' + pass + ' 趟结束：无序区最大值 ' + a[m] + ' 已"冒泡"到第 ' + (m + 1) + ' 个位置。' + (flag ? '' : '本趟一次交换都没有发生 → flag=0！'),
          { doneFrom: m }, pass);
        m--;
      }
      F(1, '排序完成：' + a.join(' ') + '。共 ' + pass + ' 趟、比较 ' + cmp + ' 次、交换 ' + mov + ' 次。要点：flag 提前终止让"有序/几乎有序"输入达到 O(n)——最好情况；相等的相邻元素不会交换，稳定。', { doneFrom: 0 }, 'final');
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var g = su.bars(s, { title: '冒泡排序（黄=比较相邻对，红=交换，绿=已就位）' });
      g += su.legend([['比较中', 'C'], ['交换', 'S'], ['已就位', 'D']]);
      return su.wrap(g);
    }
  });
})();
