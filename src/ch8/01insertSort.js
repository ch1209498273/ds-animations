/* 动画：直接插入排序（可切换折半插入）——教材 8.2，例题 {49,38,65,97,76,13,27,49*}，带哨兵 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  var CODE = [
    'void InsertSort(SqList &L) {',
    '    for (i = 2; i <= L.length; ++i)',
    '        if (L.r[i] < L.r[i-1]) {              // 需将 L.r[i] 插入有序子表',
    '            L.r[0] = L.r[i];                  // 复制为哨兵',
    '            for (j = i-1; L.r[0] < L.r[j]; --j)',
    '                L.r[j+1] = L.r[j];            // 记录后移',
    '            L.r[j+1] = L.r[0];                // 插入到正确位置',
    '        }',
    '}'
  ];
  var CODE_B = [
    'void BInsertSort(SqList &L) {',
    '    for (i = 2; i <= L.length; ++i) {',
    '        L.r[0] = L.r[i];                      // 哨兵',
    '        low = 1;  high = i-1;                 // 在 [1..i-1] 中折半查找插入位置',
    '        while (low <= high) {',
    '            m = (low + high) / 2;',
    '            if (L.r[0] < L.r[m])  high = m-1; // 插入位置在低半区',
    '            else                  low  = m+1;',
    '        }                                     // 循环结束 low 即插入位置',
    '        for (j = i-1; j >= low; --j) L.r[j+1] = L.r[j];   // 记录后移',
    '        L.r[low] = L.r[0];',
    '    }',
    '}'
  ];

  DSC.reg({
    id: 'insertSort', ch: 8, name: '直接插入排序（含折半插入）',
    note: '教材 8.2 插入排序（逐个比较/后移/插入，稳定）',
    guide: [
      '左侧绿色为已排好的"有序区"，每趟把下一个元素插入其中',
      '观察哨兵 L.r[0]：先取出待插元素腾出空位，再从后往前比较、后移',
      '对比"直接/折半"两种方式：折半只减少比较次数，移动次数不变',
      '注意两个 49：直接插入排序是稳定的（相等元素不跨越）'
    ],
    inputs: su.presetInputs([
      { key: 'mode', label: '插入方式', type: 'select', options: [['d', '直接插入'], ['b', '折半插入']], value: 'd' }
    ]),
    run: function (v) {
      var a = su.getData(v);
      a.unshift(0);                                  // a[0] 为哨兵位
      var n = a.length - 1, bin = v.mode === 'b';
      var frames = [], cmp = 0, mov = 0;
      var code = bin ? CODE_B : CODE;

      function colors(hl) {
        var cs = [];
        for (var i = 1; i <= n; i++) cs.push(i <= (hl.done ? hl.done : 0) ? 'D' : 'N');
        if (hl.c) cs[hl.c - 1] = 'C';
        if (hl.s) cs[hl.s - 1] = 'S';
        if (hl.p) cs[hl.p - 1] = 'P';
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 移动: mov + ' 次', 有序区: '第 1 ~ ' + (extra.done || 0) + ' 个', 哨兵: extra.sent != null ? String(extra.sent) : '—' },
          snap: { arr: a.slice(1), colors: colors(extra), tags: [], sent: extra.sent, mark: mk }
        });
      }

      F(0, '初始序列（位置 1~' + n + '，a[0] 留作哨兵）。' + (bin ? '折半插入：先用二分找到插入位置，再统一后移。' : '直接插入：从后往前边比较边后移。'), { done: 0 });

      for (var i = 2; i <= n; i++) {
        var sent = a[i];
        if (!bin) {
          cmp++;
          if (a[i - 1] <= sent) { F(1, '第 ' + (i - 1) + ' 趟：a[' + i + ']=' + sent + ' ≥ 前驱 a[' + (i - 1) + ']=' + a[i - 1] + '，位置本就正确，本趟 0 次移动。', { c: i, done: i - 1, sent: sent }); }
          else {
            a[0] = a[i]; mov++;
            F([2, 3], '第 ' + (i - 1) + ' 趟：a[' + i + ']=' + sent + ' < 前驱，取出存入哨兵 a[0]，位置 ' + i + ' 腾空。', { p: i, sent: sent });
            var j = i - 1;
            while (a[0] < a[j]) {
              cmp++; a[j + 1] = a[j]; mov++;
              F(5, 'a[' + j + ']=' + a[j] + ' > 哨兵 ' + a[0] + ' → 后移到 a[' + (j + 1) + ']。', { c: j, s: j + 1, sent: a[0] });
              j--;
            }
            cmp++;
            a[j + 1] = a[0]; mov++;
            F(6, 'a[' + j + ']=' + (j >= 1 ? a[j] : '—') + ' ≤ 哨兵，停在这里：a[' + (j + 1) + '] = ' + a[0] + '，插入完成。', { s: j + 1, sent: a[0] });
          }
          F(1, '第 ' + (i - 1) + ' 趟完成：第 1~' + i + ' 个元素构成有序区。', { done: i, sent: null }, i);
        } else {
          a[0] = a[i]; mov++;
          F([1, 2], '第 ' + (i - 1) + ' 趟：取出 a[' + i + ']=' + sent + ' 存入哨兵，在有序区 [1..' + (i - 1) + '] 中折半查找插入位置。', { p: i, sent: sent });
          var low = 1, high = i - 1;
          while (low <= high) {
            var m = Math.floor((low + high) / 2);
            cmp++;
            var goLow = a[0] < a[m];
            F([5, 6, 7, 8], 'm=(1+' + high + ')/2 取中 m=' + m + '：a[m]=' + a[m] + (goLow ? ' > 哨兵 ' + a[0] + ' → 插入位置在低半区，high=' + (m - 1) : ' ≤ 哨兵 ' + a[0] + ' → 在高半区，low=' + (m + 1)) + '。',
              { c: m, p: i, sent: sent });
            if (goLow) high = m - 1; else low = m + 1;
          }
          F(4, '折半结束：low=' + low + ' ≤ high=' + high + ' 不再成立，插入位置确定为 low=' + low + '。', { sent: sent });
          for (var k = i - 1; k >= low; k--) { a[k + 1] = a[k]; mov++; F(9, 'a[' + k + ']=' + a[k] + ' 后移到 a[' + (k + 1) + ']。', { c: k, s: k + 1, sent: sent }); }
          a[low] = a[0]; mov++;
          F(10, 'a[' + low + '] = ' + a[0] + '，插入完成。', { s: low, sent: a[0] });
          F(2, '第 ' + (i - 1) + ' 趟完成：第 1~' + i + ' 个元素构成有序区。', { done: i, sent: null }, i);
        }
      }
      F(0, '排序完成：' + a.slice(1).join(' ') + '。共比较 ' + cmp + ' 次、移动 ' + mov + ' 次。要点：折半插入把比较次数降到 O(n log n)，但移动次数仍为 O(n²)——移动由序列初始排列决定，比较方式帮不上忙。',
        { done: n, sent: null }, 'final');
      return { code: code, frames: frames };
    },
    render: function (s) {
      var g = su.bars(s, { title: '插入排序（绿=有序区，蓝=待插元素，黄=比较，红=后移/写入）' });
      g += su.legend([['有序区', 'D'], ['取出/待插', 'P'], ['比较', 'C'], ['后移/写入', 'S']]);
      if (s.sent != null) g += h.txt(490, 446, '哨兵 a[0] = ' + s.sent, { size: 14, w: 700, fill: C.blue });
      return g;
    }
  });
})();
