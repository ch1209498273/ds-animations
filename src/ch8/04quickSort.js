/* 动画：快速排序——教材 8.4，Partition 双指针相向扫描 + 递归树，例题 {49,38,65,97,76,13,27,49*} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  var CODE = [
    'int Partition(SqList &L, int low, int high) {',
    '    L.r[0] = L.r[low];                        // 基准存入 L.r[0]，low 位腾空',
    '    pivotkey = L.r[low].key;',
    '    while (low < high) {',
    '        while (low < high && L.r[high] >= pivotkey) --high;',
    '        L.r[low] = L.r[high];                 // 小的换到左边',
    '        while (low < high && L.r[low]  <= pivotkey) ++low;',
    '        L.r[high] = L.r[low];                 // 大的换到右边',
    '    }',
    '    L.r[low] = L.r[0];                        // 基准归位：左边都不大于它，右边都不小于它',
    '    return low;',
    '}',
    'void QSort(SqList &L, int low, int high) {',
    '    if (low < high) { pivot = Partition(L, low, high);',
    '        QSort(L, low, pivot-1);  QSort(L, pivot+1, high); }',
    '}'
  ];

  DSC.reg({
    id: 'quickSort', ch: 8, name: '快速排序（Partition 划分）',
    aim: '拿一个基准把序列**切成两半**（小的在前大的在后），递归下去；每趟划分后基准就位',
    note: '教材 8.4 交换排序（基准划分、分治递归，不稳定）',
    keywords: '快速排序 划分 partition 基准 pivot 分治 递归 最坏O(n2) 有序 栈深度 不稳定 一趟划分 归位',
    guide: [
      '每趟选区间第一个元素为基准（蓝色）：先挖出基准，左边留一个"坑"',
      'high 端从右向左找比基准小的填左坑；low 端从左向右找比基准大的填右坑——两指针相向而行',
      'low==high 时基准归位：它左边都不大于它、右边都不小于它，位置就是最终位置（绿色）',
      '对基准两侧子区间递归。切到"有序"数据看最坏情况：每次划分极度不平衡，退化为 O(n²)',
      '勾"错误演示"：只漏掉 Partition 最后一句 `L.r[low] = L.r[0];`，看整趟排序怎么连带错掉'
    ],
    inputs: su.presetInputs([
      { key: 'errPivot', label: '错误演示：划分结束漏掉"基准归位"那一句', type: 'checkbox', value: false }
    ]),
    run: function (v) {
      var a = su.getData(v).slice();
      var n = a.length, cmp = 0, mov = 0;
      var want = a.slice().sort(function (x, y) { return x - y; });
      var errNoBack = !!v.errPivot, errShown = false;
      var frames = [], stackView = [];

      function colors(hl) {
        hl = hl || {};
        var cs = [];
        for (var i = 0; i < n; i++) cs.push('N');
        for (var k = 0; k < n; k++) if (a._done && a._done[k]) cs[k] = 'D';
        if (hl.c != null) cs[hl.c] = 'C';
        if (hl.s != null) cs[hl.s] = 'S';
        if (hl.p != null) cs[hl.p] = 'P';
        (hl.zone || []).forEach(function (i2) { if (cs[i2] === 'N') cs[i2] = 'P'; });
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 赋值: mov + ' 次', 调用栈: stackView.length ? stackView.join(' ｜ ') : '（空）' },
          snap: { arr: a.slice(), colors: colors(extra), mark: mk, zone: extra.zone || [] }
        });
      }

      F(0, '初始序列。快速排序 = 选基准 + Partition 划分 + 对两侧递归（分治）。', {});

      function qsort(low, high, depth) {
        if (low >= high) {
          if (low === high) { a._done = a._done || {}; a._done[low] = 1; }
          return;
        }
        stackView.push('[' + (low + 1) + '..' + (high + 1) + '] 基准=' + a[low]);
        F([13, 14, 15], 'QSort 处理区间 [' + (low + 1) + '..' + (high + 1) + ']：取基准 a[' + (low + 1) + ']=' + a[low] + ' 挖出，存入 L.r[0]。', { p: low, zone: [low, high] });
        var pivot = a[low];
        var i = low, j = high;
        while (i < j) {
          while (i < j && a[j] >= pivot) { cmp++; j--; }
          if (i < j) {
            cmp++;
            a[i] = a[j]; mov++;
            F([5, 6], '右端 a[' + (j + 1) + ']=' + a[j] + ' < 基准 ' + pivot + ' → 填入左坑 a[' + (i + 1) + ']，右端腾出新坑。', { c: j, s: i, p: low, zone: [low, high] });
          }
          while (i < j && a[i] <= pivot) { cmp++; i++; }
          if (i < j) {
            cmp++;
            a[j] = a[i]; mov++;
            F([7, 8], '左端 a[' + (i + 1) + ']=' + a[i] + ' > 基准 ' + pivot + ' → 填入右坑 a[' + (j + 1) + ']，左端腾出新坑。', { c: i, s: j, p: low, zone: [low, high] });
          }
        }
        if (errNoBack && !errShown) {
          /* 只在第一次划分漏这一句，后面全部按正确写法跑：错一处就足以让整趟排序失败，
             学生才能看清"漏一句"和"结果错"之间的因果 */
          errShown = true;
          var holeVal = a[i], dupCnt = 0, pivCnt = 0;
          for (var q1 = low; q1 <= high; q1++) { if (a[q1] === holeVal) dupCnt++; if (a[q1] === pivot) pivCnt++; }
          F(9, '错误演示：两指针相遇于 a[' + (i + 1) + ']，可是**漏掉这一句** `L.r[low] = L.r[0];`。坑里还留着刚搬过来的 ' + holeVal + '，基准 ' + pivot + ' 一直躺在哨兵位 L.r[0] 里没回填。', { c: i, s: i, p: low, zone: [low, high] }, 'badhole');
          var cntTxt = holeVal === pivot ? '基准没回填，切点两侧的前提不成立' :
            '序列里少了一个 ' + pivot + '、多了一个 ' + holeVal + '——数据自己就丢了';
          F(9, '数一下区间 a[' + (low + 1) + '..' + (high + 1) + ']：' + holeVal + ' 出现 ' + dupCnt + ' 次，' + pivot + ' 出现 ' + pivCnt + ' 次。' + cntTxt + '。而且 a[' + (i + 1) + '] 根本不是基准的最终位置。', { c: i, zone: [low, high] }, 'badcnt');
          F([9, 10], '可 Partition 照样 `return ' + (i + 1) + '`。左边不满足"都不大于基准"、右边不满足"都不小于基准"，接下来按这个切点递归——**从这一步起整个分治都错了**。', { s: i, zone: [low, high] }, 'badret');
        } else {
          a[i] = pivot; mov++;
          a._done = a._done || {}; a._done[i] = 1;
          F([9, 10], '两指针相遇于 a[' + (i + 1) + ']：基准 ' + pivot + ' 归位（绿色）。左侧全部 ≤ ' + pivot + '，右侧全部 ≥ ' + pivot + '。', { s: i, zone: [low, high] }, 'part' + (low + 1) + '_' + (high + 1));
        }
        stackView.pop();
        qsort(low, i - 1, depth + 1);
        qsort(i + 1, high, depth + 1);
      }
      qsort(0, n - 1, 1);
      if (errNoBack) {
        var same = JSON.stringify(a) === JSON.stringify(want);
        F(9, '✗ 错误演示跑完：最终序列 ' + a.join(' ') + (same ? '（这次碰巧还是有序的）' : ' ——不是有序序列') +
          '。对照正确结果 ' + want.join(' ') + '：只漏了一句"基准归位"，整趟快排就废了。这就是 Partition 最后那行 `L.r[low] = L.r[0];` 存在的意义。', {}, 'badfinal');
      } else {
        F(12, '排序完成：' + a.join(' ') + '。要点：① 平均 O(n log n)，但**有序/逆序输入每次只能划分出 1 个元素**，退化为 O(n²)——这就是"快排怕有序"；② 相等元素会跨越基准，不稳定。', {}, 'final');
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var g = su.bars(s, { title: '快速排序（蓝=当前区间/基准，黄=扫描，红=填坑，绿=已归位）' });
      g += su.legend([['基准/区间', 'P'], ['扫描', 'C'], ['填坑', 'S'], ['已归位', 'D']]);
      return su.wrap(g);
    }
  });
})();
