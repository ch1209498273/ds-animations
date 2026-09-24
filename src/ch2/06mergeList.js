/* 动画：合并有序表 LA/LB→LC（双指针归并，教材 2.7 应用，为归并排序铺垫） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'void MergeList(SqList La, SqList Lb, SqList &Lc) {',
    '    // La、Lb 非递减有序',
    '    i = j = 1;  k = 0;',
    '    while (i <= La.len && j <= Lb.len) {     // 两表都还有剩余',
    '        if (La[i] <= Lb[j])  Lc[++k] = La[i++];   // 取较小者（相等取A，稳定）',
    '        else                 Lc[++k] = Lb[j++];',
    '    }',
    '    while (i <= La.len)  Lc[++k] = La[i++];  // 收尾：A 剩余',
    '    while (j <= Lb.len)  Lc[++k] = Lb[j++];  // 收尾：B 剩余',
    '}'
  ];

  function parseSorted(s, name) {
    var a = DSC.h.parse(s);
    for (var i = 1; i < a.length; i++) if (a[i] < a[i - 1]) throw Error(name + ' 必须非递减有序（' + a[i - 1] + ' 后出现 ' + a[i] + '）');
    if (a.length < 1 || a.length > 8) throw Error(name + ' 请输入 1~8 个整数');
    return a;
  }

  DSC.reg({
    id: 'mergeList', ch: 2, name: '合并有序表 LA+LB→LC',
    aim: '两个有序表归并成一个新的有序表：**指针只往下走、不回头**，所以线性时间',
    note: '教材 2.7 线性表应用（双指针归并，O(m+n)）',
    keywords: '有序表合并 LA LB LC 归并 双指针 非递减 表头复用 结果复用 顺序表合并 O(m+n)',
    guide: [
      '两个有序表各出一个指针 i、j：每次比较，**较小者**进入 LC，对应指针后移',
      '相等时取 LA（黄色提示）——归并是稳定操作，这个细节决定了归并排序的稳定性',
      '某表用尽后，另一表的剩余**整体接上**（已有序，无需再比）',
      '只比较 m+n−1 次以内，O(m+n)——归并排序的每一层就是这个过程'
    ],
    inputs: [
      { key: 'la', label: 'LA（有序）', type: 'text', value: '3,5,8,11' },
      { key: 'lb', label: 'LB（有序）', type: 'text', value: '2,6,8,9,15' }
    ],
    run: function (v) {
      var A = parseSorted(v.la, 'LA'), B = parseSorted(v.lb, 'LB');
      var frames = [], cmp = 0;
      var LC = [];
      function colors(a, hl) {
        hl = hl || {};
        var cs = [];
        for (var i = 0; i < a; i++) cs.push('N');
        if (hl.ai != null && hl.which !== 'B') cs[hl.ai] = 'C';
        if (hl.bi != null && hl.which === 'B') cs[hl.bi] = 'C';
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 'LC 当前': LC.join(', ') || '（空）' },
          snap: { A: A, B: B, LC: LC.slice(), ai: extra.ai, bi: extra.bi, take: extra.take || '', li: extra.li, mark: mk }
        });
      }
      F(0, 'LA =（' + A.join(', ') + '），LB =（' + B.join(', ') + '），i、j 分别指向两表开头。两表当前头部正在对视——这就是一次"比较"。', { ai: 0, bi: 0 });
      var i = 0, j = 0;
      while (i < A.length && j < B.length) {
        cmp++;
        if (A[i] <= B[j]) {
          LC.push(A[i]);
          F([4], '比较：LA[' + (i + 1) + ']=' + A[i] + (A[i] === B[j] ? ' = ' : ' ≤ ') + 'LB[' + (j + 1) + ']=' + B[j] + (A[i] === B[j] ? '（相等 → 取 LA，保证稳定）' : '') + ' → 取 LA 这一个进 LC[' + LC.length + ']，i 后移。', { ai: i, bi: j, take: 'A', li: LC.length - 1 });
          i++;
        } else {
          LC.push(B[j]);
          F([5], '比较：LA[' + (i + 1) + ']=' + A[i] + ' > LB[' + (j + 1) + ']=' + B[j] + ' → 取 LB 这一个进 LC[' + LC.length + ']，j 后移。', { ai: i, bi: j, take: 'B', li: LC.length - 1 });
          j++;
        }
      }
      F([6, 7], '某表已用尽（i=' + (i + 1) + '，j=' + (j + 1) + '）：剩余元素整体接上。', {});
      while (i < A.length) { LC.push(A[i]); F(7, 'LA 剩余 ' + A[i] + ' 直接接入 LC。', { ai: i, li: LC.length - 1, take: 'A' }); i++; }
      while (j < B.length) { LC.push(B[j]); F(8, 'LB 剩余 ' + B[j] + ' 直接接入 LC。', { bi: j, li: LC.length - 1, take: 'B' }); j++; }
      F(0, '合并完成：LC =（' + LC.join(', ') + '），共 ' + LC.length + ' 个元素、仅比较 ' + cmp + ' 次。LC 天然有序——归并的两个输入都有序，每次只挑"当前最小"。', {}, 'final');
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 520;
      var g = '';
      function row(y, label, arr, ci, done, color) {
        var out = h.txt(60, y + 26, label, { size: 14, fill: C.muted, anchor: 'start', w: 700 });
        var cw = Math.min(56, Math.floor((W - 220) / Math.max(arr.length, 1)) - 8);
        arr.forEach(function (val, k) {
          var x = 130 + k * (cw + 8);
          var f = '#fff', st = C.grey, sw = 1.4;
          if (ci === k) { f = C.amberBg; st = C.amber; sw = 2.4; }
          out += h.rect(x, y, cw, 44, { fill: f, stroke: st, sw: sw, rx: 6 });
          out += h.txt(x + cw / 2, y + 27, String(val), { size: 15, w: 700 });
        });
        return out;
      }
      g += h.txt(W / 2, 34, '合并两个有序表（双指针归并）', { size: 18, w: 600 });
      g += row(66, 'LA', s.A, s.ai);
      g += row(134, 'LB', s.B, s.bi);
      g += h.txt(W / 2, 216, '↓ 每次取两表当前头部的较小者 ↓', { size: 13, fill: C.muted });
      g += row(238, 'LC', s.LC, -1);
      if (s.mark === 'final') {
        g += h.rect(W / 2 - 250, 330, 500, 54, { fill: C.greenBg, stroke: C.green, rx: 9 });
        g += h.txt(W / 2, 363, '✓ 有序合并完成，比较 ' + (s.LC.length - 1) + ' 次以内', { size: 15, w: 700, fill: C.green });
      }
      g += h.txt(W / 2, 430, '黄=该表当前比较位 ｜ 相等取 LA 保稳定 ｜ 一表用尽后另一表整体接上', { size: 12.5, fill: C.muted });
      g += h.txt(W / 2, 462, '这个过程就是归并排序每一层的 merge()——先在这里看懂，第 8 章就轻松了', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
