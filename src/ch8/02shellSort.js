/* 动画：希尔排序——教材 8.3，增量序列 {4,2,1}，例题 {49,38,65,97,76,13,27,49*} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  var CODE = [
    'void ShellSort(SqList &L, int dlta[]) {',
    '    // 增量序列 dlta = { 4, 2, 1 }',
    '    for (k = 0; k < 3; ++k)',
    '        ShellInsert(L, dlta[k]);          // 一趟增量为 dlta[k] 的插入排序',
    '}',
    'void ShellInsert(SqList &L, int dk) {',
    '    for (i = dk+1; i <= L.length; ++i)',
    '        if (L.r[i] < L.r[i-dk]) {         // 组内插入排序（带哨兵）',
    '            L.r[0] = L.r[i];',
    '            for (j = i-dk; j > 0 && L.r[0] < L.r[j]; j -= dk)',
    '                L.r[j+dk] = L.r[j];       // 组内记录后移 dk 位',
    '            L.r[j+dk] = L.r[0];',
    '        }',
    '}'
  ];

  DSC.reg({
    id: 'shellSort', ch: 8, name: '希尔排序（缩小增量）',
    aim: '先按大步 dk 粗排再逐步缩小：**前期一次移动能跨过很远**，代价是不稳定',
    note: '教材 8.3 希尔排序（分组插入、增量收缩，不稳定）',
    guide: [
      '按增量 dk 把序列分成 dk 组，组内做插入排序——远距离的元素先大致就位',
      '增量逐趟收缩（4→2→1），最后一趟 dk=1 就是普通直接插入，但此时序列已"基本有序"',
      '观察前几趟：移动步长是 dk 而不是 1，远处的小数能一步跳到前面',
      '希尔排序性能依赖增量序列，约 O(n^1.3)；相等的元素可能被分到不同组——它是不稳定排序'
    ],
    inputs: su.presetInputs(),
    run: function (v) {
      var a = su.getData(v);
      a.unshift(0);
      var n = a.length - 1, cmp = 0, mov = 0;
      var frames = [];
      var gaps = [];
      for (var g0 = Math.floor(n / 2); g0 >= 1; g0 = Math.floor(g0 / 2)) gaps.push(g0);
      if (gaps.length > 3) gaps = gaps.slice(gaps.length - 3);

      function colors(hl) {
        var cs = [];
        for (var i = 1; i <= n; i++) cs.push('N');
        if (hl.c) cs[hl.c - 1] = 'C';
        if (hl.s) cs[hl.s - 1] = 'S';
        if (hl.p) cs[hl.p - 1] = 'P';
        (hl.group || []).forEach(function (i2, k) { if (cs[i2 - 1] === 'N') cs[i2 - 1] = k % 2 ? 'P' : 'N'; });
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 移动: mov + ' 次', 当前增量: String(extra.dk || '—') },
          snap: { arr: a.slice(1), colors: colors(extra), dk: extra.dk, group: extra.group || [], mark: mk }
        });
      }

      F(0, '初始序列。本例增量序列取 { ' + gaps.join(', ') + ' }（教材例题取法），每趟组内做插入排序。', {});

      for (var gi = 0; gi < gaps.length; gi++) {
        var dk = gaps[gi];
        var group = [];
        for (var t = 1; t <= dk; t++) group.push(t);
        F([0, 1, 4], '【dk = ' + dk + '】把位置按 "位置 mod dk" 分成 ' + dk + ' 组，组内做插入排序。', { dk: dk, group: group });
        for (var i = dk + 1; i <= n; i++) {
          cmp++;
          if (a[i] < a[i - dk]) {
            a[0] = a[i]; mov++;
            F([6, 7], 'a[' + i + ']=' + a[i] + ' < 同组前驱 a[' + (i - dk) + ']=' + a[i - dk] + '：存入哨兵，准备在组内前移。', { dk: dk, c: i, p: i - dk, group: group });
            var j = i - dk;
            while (j > 0 && a[0] < a[j]) {
              cmp++; a[j + dk] = a[j]; mov++;
              F(9, '组内 a[' + j + ']=' + a[j] + ' > 哨兵 → 后移 dk 位到 a[' + (j + dk) + ']（一次跨 ' + dk + ' 步！）。', { dk: dk, c: j, s: j + dk, group: group });
              j -= dk;
            }
            a[j + dk] = a[0]; mov++;
            F(10, '哨兵 ' + a[0] + ' 插入到 a[' + (j + dk) + ']。', { dk: dk, s: j + dk, group: group });
          }
        }
        F([1, 2], 'dk=' + dk + ' 一趟完成：序列更"接近有序"。' + (dk === 1 ? '最后一趟 dk=1 即直接插入排序——因为基本有序，比较/移动都很少。' : ''), { dk: dk, group: group }, 'gap' + dk);
      }
      var sorted = a.slice(1).slice().sort(function (x, y) { return x - y; });
      F(0, '排序完成：' + a.slice(1).join(' ') + '。要点：① 增量序列最后一个必须是 1；② 基本有序后 dk=1 那趟几乎不移动——这就是希尔快于直接插入的原因；③ 分组跨越使相等元素可能乱序，不稳定。', {}, 'final');
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var tags = [];
      (s.group || []).forEach(function (i, k) { tags.push({ i: i - 1, text: '组' + ((k % 4) + 1), color: ['#2563eb', '#16a34a', '#d97706', '#7c3aed'][k % 4] }); });
      var g = su.bars({ arr: s.arr, colors: s.colors, tags: tags }, { title: '希尔排序（dk = ' + (s.dk || '—') + '）：同色位置为一组，组内插入排序' });
      g += su.legend([['比较', 'C'], ['后移/写入', 'S'], ['哨兵来源', 'P']]);
      return su.wrap(g);
    }
  });
})();
