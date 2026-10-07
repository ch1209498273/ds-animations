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
    aim: '把每个新元素插进前面已排好的部分：**从后往前比**，稳定但 O(n²)',
    note: '教材 8.2 插入排序（逐个比较/后移/插入，稳定）',
    keywords: '直接插入排序 有序区 无序区 后移 稳定 哨兵 最好O(n) 折半插入 比较次数',
    guide: [
      '左侧绿色为已排好的"有序区"，每趟把下一个元素插入其中',
      '观察哨兵 L.r[0]：先取出待插元素腾出空位，再从后往前比较、后移',
      '对比"直接/折半"两种方式：折半把**比较**次数降到 O(n log n)；移动次数与直接插入同量级——数据移动省不掉',
      '注意两个 49：直接插入排序是稳定的（相等元素不跨越）'
    ],
    inputs: su.presetInputs([
      { key: 'mode', label: '插入方式', type: 'select', options: [['d', '直接插入'], ['b', '折半插入']], value: 'd' },
      { key: 'errStable', label: '错误演示：把严格小于改成小于等于', type: 'checkbox', value: false },
      { key: 'errLand', label: '错误演示：插入落位的下标差一格', type: 'checkbox', value: false }
    ]),
    misleads: [{ "key": "errStable", "value": true, "claim": "相等也后移：结果仍有序，但稳定性丢了" },
      { "key": "errLand", "value": true, "claim": "落位下标差一格：数组看着还是升序，可里面已经不是原来那批数了" }],
    run: function (v) {
      var a = su.getData(v);
      var orig = a.slice();                              // 数据守恒自查的对照物
      a.unshift(0);                                  // a[0] 为哨兵位
      var n = a.length - 1, bin = v.mode === 'b';
      /* errStable 只改运算符：直接插入的 `a[0] < a[j]` 与折半的 `a[0] < a[m]` 都带上等号。
         id[] 与 a[] 同步搬移，稳定性 verdict 由 su.stableBad 现算，不写死在文案里。
         ★ 带上等号后哨兵自己会满足条件（a[0] <= a[0] 为真），循环会多走一格到 j=0，
           画出一帧"a[0] 被后移"——实测元素一个没丢（末数组完整），但那帧在讲一件没发生的事。
           所以循环带 j >= 1 守卫。默认档加这条完全等价（a[0] < a[0] 本就为假），逐帧输出不变。 */
      var eq = !!v.errStable;
      /* errLand 只改落位那一格的下标：直接插入把 a[j+1] 写成 a[j]，折半把 a[low] 写成 a[high]
         （= low−1，学生最常混的一对，且高标不会越界）。实测 8 元随机 400 组 × 两种 mode：
         错法末态 400/400 仍是非降序，同时 400/400 数据不守恒——"看着有序"把错全遮住了，
         所以这一档的判据必须是守恒 + 有序两条一起，光查有序等于没查。 */
      var ld = !!v.errLand;
      var id = [], ii0; for (ii0 = 0; ii0 <= n; ii0++) id.push(ii0);
      var frames = [], cmp = 0, mov = 0;
      var code = bin ? CODE_B : CODE;

      function colors(hl) {
        var cs = [];
        for (var i = 1; i <= n; i++) cs.push(i <= (hl.done ? hl.done : 0) ? 'D' : 'N');
        if (hl.c) cs[hl.c - 1] = 'C';
        if (hl.s) cs[hl.s - 1] = 'S';
        if (hl.s2 && hl.s2 !== hl.s) cs[hl.s2 - 1] = 'S';
        if (hl.p) cs[hl.p - 1] = 'P';
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: (function () { var pn = { 比较: cmp + ' 次', 移动: mov + ' 次', 有序区: '第 1 ~ ' + (extra.done || 0) + ' 个', 哨兵: extra.sent != null ? String(extra.sent) : '—' };
            if (eq) pn['稳定性'] = su.stableText(su.stableBad(a.slice(1), id.slice(1)));   /* 默认档面板一字不动 */
            if (ld) pn['数据守恒'] = su.diffText(su.diff(orig, a.slice(1)));
            return pn; })(),
          snap: { arr: a.slice(1), colors: colors(extra), tags: [], sent: extra.sent, mark: mk }
        });
      }

      F(0, '初始序列（位置 1~' + n + '，a[0] 留作哨兵）。' + (bin ? '折半插入：先用二分找到插入位置，再统一后移。' : '直接插入：从后往前边比较边后移。'), { done: 0 });

      for (var i = 2; i <= n; i++) {
        var sent = a[i];
        if (!bin) {
          cmp++;
          if (eq ? a[i - 1] < sent : a[i - 1] <= sent) { F(1, '第 ' + (i - 1) + ' 趟：a[' + i + ']=' + sent + ' ≥ 前驱 a[' + (i - 1) + ']=' + a[i - 1] + '，位置本就正确，本趟 0 次移动。', { c: i, done: i - 1, sent: sent }); }
          else {
            a[0] = a[i]; id[0] = id[i]; mov++;
            F([2, 3], '第 ' + (i - 1) + ' 趟：a[' + i + ']=' + sent + ' < 前驱，取出存入哨兵 a[0]，位置 ' + i + ' 腾空。', { p: i, sent: sent });
            var j = i - 1;
            while (j >= 1 && (eq ? a[0] <= a[j] : a[0] < a[j])) {
              cmp++; a[j + 1] = a[j]; id[j + 1] = id[j]; mov++;
              F(5, 'a[' + j + ']=' + a[j] + (a[j] === a[0] ? ' 与哨兵相等也被后移——稳定性就是在这里丢的。' : ' > 哨兵 ' + a[0] + ' → 后移到 a[' + (j + 1) + ']。'), { c: j, s: j + 1, sent: a[0] });
              j--;
            }
            cmp++;
            var stop = j >= 1 ? a[j] : '—';                // 停下时比的那个数，必须在写入之前取
            var key = a[0], hole = j + 1, land = ld ? j : j + 1;
            a[land] = key; id[land] = id[0]; mov++;
            F(6, 'a[' + j + ']=' + stop + (eq ? ' < ' : ' ≤ ') + '哨兵，停在这里：' +
              (ld ? (land >= 1
                ? '可写入下标写成 a[' + land + ']，本该落在 a[' + hole + ']：' + stop + ' 被 key 盖掉了，而 a[' + hole + '] 那份副本还留着。'
                : '可写入下标写成 a[0]（哨兵位，不在表里），本该落在 a[' + hole + ']：key 没落进表，a[' + hole + '] 那份副本也没被覆盖。')
                  : 'a[' + hole + '] = ' + key + '，插入完成。'),
              { s: land >= 1 ? land : hole, s2: hole, sent: key });
          }
          F(1, ld
            ? '第 ' + (i - 1) + ' 趟结束：前缀 ' + a.slice(1, i + 1).join(' ') + (su.asc(a.slice(1, i + 1)) ? ' 仍升序——可这已经是拿副本拼出来的假有序了。' : ' 已经不升序。')
            : '第 ' + (i - 1) + ' 趟完成：第 1~' + i + ' 个元素构成有序区。', { done: i, sent: null }, i);
        } else {
          a[0] = a[i]; id[0] = id[i]; mov++;
          F([1, 2], '第 ' + (i - 1) + ' 趟：取出 a[' + i + ']=' + sent + ' 存入哨兵，在有序区 [1..' + (i - 1) + '] 中折半查找插入位置。', { p: i, sent: sent });
          var low = 1, high = i - 1;
          while (low <= high) {
            var m = Math.floor((low + high) / 2);
            cmp++;
            var goLow = eq ? a[0] <= a[m] : a[0] < a[m];
            F([5, 6, 7, 8], 'low=' + low + '，high=' + high + '：m=(low+high)/2 取中 m=' + m + '：a[m]=' + a[m] + (goLow ? ' > 哨兵 ' + a[0] + ' → 插入位置在低半区，high=' + (m - 1) : ' ≤ 哨兵 ' + a[0] + ' → 在高半区，low=' + (m + 1)) + '。',
              { c: m, p: i, sent: sent });
            if (goLow) high = m - 1; else low = m + 1;
          }
          F(4, '折半结束：low=' + low + ' ≤ high=' + high + ' 不再成立，插入位置确定为 low=' + low + '。', { sent: sent });
          for (var k = i - 1; k >= low; k--) { a[k + 1] = a[k]; id[k + 1] = id[k]; mov++; F(9, 'a[' + k + ']=' + a[k] + ' 后移到 a[' + (k + 1) + ']。', { c: k, s: k + 1, sent: sent }); }
          var keptB = a[low], landB = ld ? high : low;   // 错法：把落位从 low 写成 high（差一格，且永不越界）
          a[landB] = a[0]; id[landB] = id[0]; mov++;
          F(10, ld
            ? (landB >= 1
              ? '本该落在 a[' + low + ']，却写成了 a[' + landB + ']：' + keptB + ' 被 key 盖掉，而 a[' + low + '] 那份副本还留着。'
              : '本该落在 a[' + low + ']，却写成了 a[0]（哨兵位，不在表里）：key 没落进表，a[' + low + '] 那份副本还留着。')
            : 'a[' + low + '] = ' + a[0] + '，插入完成。', { s: landB >= 1 ? landB : low, s2: low, sent: a[0] });
          F(2, ld
            ? '第 ' + (i - 1) + ' 趟结束：前缀 ' + a.slice(1, i + 1).join(' ') + (su.asc(a.slice(1, i + 1)) ? ' 还升序——但落位已经偏过一格了。' : ' 已经不升序。')
            : '第 ' + (i - 1) + ' 趟完成：第 1~' + i + ' 个元素构成有序区。', { done: i, sent: null }, i);
        }
      }
      var dAll = su.diff(orig, a.slice(1));
      F(0, ld
          ? '✗ 跑完' + (su.asc(a.slice(1)) ? '看着仍是升序：' : '并不升序：') + a.slice(1).join(' ') +
            '。可表里已经不是原来那批数：' + su.diffText(dAll) + '。落位差一格，光查"有没有序"拦不住它——守恒和有序得一起查。'
          : eq
          ? '✗ 跑完仍然有序：' + a.slice(1).join(' ') + '。共比较 ' + cmp + ' 次、移动 ' + mov + ' 次——稳定性自查：' + su.stableText(su.stableBad(a.slice(1), id.slice(1))) + '。等号加错地方，丢的不是正确性，是稳定性。'
          : '排序完成：' + a.slice(1).join(' ') + '。共比较 ' + cmp + ' 次、移动 ' + mov + ' 次。要点：折半插入把比较次数降到 O(n log n)，但移动次数仍为 O(n²)——移动由序列初始排列决定，比较方式帮不上忙。',
        { done: n, sent: null }, 'final');
      return { code: code, frames: frames };
    },
    render: function (s) {
      var g = su.bars(s, { title: '插入排序（绿=有序区，蓝=待插元素，黄=比较，红=后移/写入）' });
      g += su.legend([['有序区', 'D'], ['取出/待插', 'P'], ['比较', 'C'], ['后移/写入', 'S']]);
      if (s.sent != null) g += h.txt(490, 446, '哨兵 a[0] = ' + s.sent, { size: 14, w: 700, fill: C.blue });
      return su.wrap(g);
    }
  });
})();
