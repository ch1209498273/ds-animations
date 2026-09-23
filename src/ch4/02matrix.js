/* 动画：矩阵压缩存储——对称矩阵下标映射 + 稀疏矩阵三元组快速转置，教材 4.5/4.6 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE_SYM = [
    '// 对称矩阵（下三角）压缩：aij（i≥j）存入 sa[]',
    'k = i*(i-1)/2 + j - 1      // 下标从 0 起：第 i 行前有 1+2+…+(i-1) 个元素',
    'aij（i<j）与 aji 对称：读 sa[ j*(j-1)/2 + i - 1 ]'
  ];
  var CODE_SPT = [
    'void FastTransposeSMatrix(TSMatrix M, TSMatrix &T) {',
    '    // num[col]：M 中第 col 列（即 T 的第 col 行）非零元个数',
    '    for (col = 1; col <= M.nu; ++col)  num[col] = 0;',
    '    for (p = 1; p <= M.tu; ++p)  ++num[M.data[p].j];',
    '    cpot[1] = 1;                            // cpot：T 中每行的起始位置',
    '    for (col = 2; col <= M.nu; ++col)',
    '        cpot[col] = cpot[col-1] + num[col-1];',
    '    for (p = 1; p <= M.tu; ++p) {           // 一遍扫描完成转置',
    '        col = M.data[p].j;  q = cpot[col];',
    '        T.data[q].i = M.data[p].j;  T.data[q].j = M.data[p].i;',
    '        T.data[q].e = M.data[p].e;  ++cpot[col];',
    '    }',
    '}'
  ];

  var DEF_MTX = '6,0,0,2, 0,5,0,0, 0,0,9,0, 2,0,0,7';   // 4×4 对称例

  DSC.reg({
    id: 'matrix', ch: 4, name: '矩阵压缩存储',
    aim: '对称阵、三角阵、对角阵压成一维数组，**下标映射公式**是怎么推出来的',
    note: '教材 4.5/4.6 特殊矩阵与稀疏矩阵（对称矩阵映射、三元组快速转置）',
    guide: [
      '场景①对称矩阵：只存下三角。第 i 行前有 1+2+…+(i−1) = i(i−1)/2 个元素 → aij 存到 sa[i(i−1)/2+j−1]',
      '点矩阵任意格子（或改 i、j），动画给出映射 k 并在 sa[] 中点亮对应位置；i<j 时读其对称元素',
      '场景②稀疏矩阵：三元组 (行,列,值) 只存非零元；**快速转置**预先用 num/cpot 算出每行起始位，一遍扫描完成',
      '对比：普通转置要反复扫描 M（O(tu×nu)）；快速转置 O(tu+nu)——用两个辅助数组换时间'
    ],
    inputs: [
      { key: 'scen', label: '场景', type: 'select', options: [
        ['sym', '① 对称矩阵 → 一维数组 sa'],
        ['spt', '② 稀疏矩阵三元组 → 快速转置']
      ], value: 'sym' },
      { key: 'ii', label: '行 i', type: 'number', value: 3, min: 1, max: 4 },
      { key: 'jj', label: '列 j', type: 'number', value: 2, min: 1, max: 4 },
      { key: 'w', label: '对称矩阵（行优先展开）', type: 'text', value: DEF_MTX }
    ],
    run: function (v) {
      var frames = [];
      if (v.scen !== 'spt') {
        var vals = h.parse(v.w);
        var n = Math.round(Math.sqrt(vals.length));
        if (n * n !== vals.length || n < 2 || n > 5) throw Error('请输入 4~25 个数（构成 2~5 阶方阵，行优先展开）');
        for (var a = 0; a < n; a++) for (var b = a + 1; b < n; b++) {
          if (vals[a * n + b] !== vals[b * n + a]) throw Error('矩阵不对称：m[' + (a + 1) + '][' + (b + 1) + ']=' + vals[a * n + b] + ' ≠ m[' + (b + 1) + '][' + (a + 1) + ']=' + vals[b * n + a]);
        }
        var ii = Math.min(Math.max(1, +v.ii || 1), n), jj2 = Math.min(Math.max(1, +v.jj || 1), n);
        var swap = ii < jj2;
        var I = swap ? jj2 : ii, J = swap ? ii : jj2;
        var k = I * (I - 1) / 2 + J - 1;          // 1 基
        var sa = [];
        for (var r = 1; r <= n; r++) for (var c = 1; c <= r; c++) sa.push(vals[(r - 1) * n + (c - 1)]);
        function F(line, msg, extra, mk) {
          extra = extra || {};
          frames.push({
            line: Array.isArray(line) ? line : [line], msg: msg,
            panel: { n: String(n), 非零元: String(sa.filter(function (x) { return x !== 0; }).length), 压缩率: Math.round(sa.length / (n * n) * 100) + '%' },
            snap: { mtx: vals.slice(), n: n, sa: sa.slice(), si: extra.si, sj: extra.sj, k: extra.k, ii: ii, jj: jj2, mark: mk }
          });
        }
        F(0, n + ' 阶对称矩阵（对角线下三角存储）：m[' + ii + '][' + jj2 + ']=' + vals[(ii - 1) * n + (jj2 - 1)] + (swap ? ' 在上三角 → 实际读取其对称元素 m[' + I + '][' + J + ']。' : ' 在下三角 → 直接映射。'), {});
        F(1, 'k = i(i−1)/2 + j−1 = ' + I + '×' + (I - 1) + '/2 + ' + J + '−1 = ' + k + '（第 ' + I + ' 行前共有 1+2+…+' + (I - 1) + '=' + (I * (I - 1) / 2) + ' 个元素）。', { k: k });
        F(1, 'sa[' + k + '] = ' + sa[k] + ' ✓ 与矩阵中 m[' + I + '][' + J + '] 一致。存取都是 O(1)——压缩一半空间，随机存取能力不丢。', { si: I, sj: J, k: k }, 'symdone');
        F(0, '一般结论：对角矩阵、三角矩阵、对称矩阵都可用"位置公式"压进一维数组；对称矩阵对 i<j 的元素直接读对称位，无需重复存储。', { si: I, sj: J, k: k });
        return { code: CODE_SYM, frames: frames };
      }

      /* 稀疏矩阵快速转置：教材例题 6×6 M */
      var M = [
        { i: 1, j: 2, e: 12 }, { i: 1, j: 3, e: 9 }, { i: 3, j: 5, e: -3 }, { i: 4, j: 3, e: 24 },
        { i: 5, j: 1, e: 14 }, { i: 5, j: 4, e: -7 }, { i: 6, j: 1, e: 18 }, { i: 6, j: 6, e: 8 }
      ];
      var mu = 6, nu = 6;
      var num = []; for (var q = 0; q <= nu; q++) num.push(0);
      M.forEach(function (x) { num[x.j]++; });
      var cpot = [0, 1]; for (var col = 2; col <= nu; col++) cpot[col] = cpot[col - 1] + num[col - 1];   // cpot[1..nu]
      function F2(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 非零元: String(M.length), 'num[]': '[' + num.slice(1).join(',') + ']', 'cpot[]': '[' + cpot.slice(1).join(',') + ']' },
          snap: { M: M.map(function (x) { return { i: x.i, j: x.j, e: x.e }; }), T: (extra.T || []).map(function (x) { return { i: x.i, j: x.j, e: x.e }; }), cur: extra.cur, stage: extra.stage, mark: mk }
        });
      }
      F2(0, '稀疏矩阵 M（6×6，8 个非零元）的三元组表：只存 (行,列,值)。转置 = 每个 (i,j,e) → (j,i,e) 且按新行序排列。', { stage: 'init' });
      F2([1, 2], '第一步：统计 num[col] = M 中第 col 列的非零元个数 = T 中第 col 行的元素个数。', { stage: 'num' });
      M.forEach(function (x, p) {
        F2([3], 'M.data[' + (p + 1) + ']=(' + x.i + ',' + x.j + ',' + x.e + ')：列 ' + x.j + ' 计数 +1 → num[' + x.j + ']=' + num[x.j] + '。', { stage: 'num', cur: p });
      });
      F2([4, 5], 'cpot[1]=1；cpot[col] = cpot[col−1] + num[col−1] → [' + cpot.slice(1).join(', ') + ']：T 中每一行的起始存放位置。', { stage: 'cpot' });
      var T2 = []; var cp = cpot.slice();
      M.forEach(function (x, p) {
        var c = x.j, q = cp[c];
        T2[q - 1] = { i: c, j: x.i, e: x.e };
        cp[c]++;
        F2([6, 7, 8, 9], '(' + x.i + ',' + x.j + ',' + x.e + ') → 转置为 (' + c + ',' + x.i + ',' + x.e + ')，放入 T.data[' + q + ']（cpot[' + c + ']），cpot[' + c + '] 后移。', { stage: 'move', cur: p, T: T2 });
      });
      F2(0, '快速转置完成：T 的三元组已按行序排列（' + T2.map(function (x) { return '(' + x.i + ',' + x.j + ',' + x.e + ')'; }).join(' ') + '）。只扫描 M 两遍（一遍计数、一遍移动），O(tu+nu)——普通转置需 O(tu×nu)。', { stage: 'done', T: T2, mark: 'final' });
      return { code: CODE_SPT, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470;
      var g = '';
      if (s.mtx) {
        var n = s.n, cw = 64, x0 = 90, y0 = 80;
        g += h.txt(90 + n * cw / 2, 50, '对称矩阵（下三角压缩）', { size: 16, w: 600 });
        for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
          var x = x0 + c * cw, y = y0 + r * cw;
          var lower = c <= r;
          var isSel = (r + 1) === s.si && (c + 1) === s.sj;
          var f = isSel ? C.blueBg : lower ? '#fff' : '#f1f5f9';
          g += h.rect(x, y, cw - 6, cw - 6, { fill: f, stroke: isSel ? C.blue : (lower ? C.grey : C.line), sw: isSel ? 2.6 : 1.2, rx: 6, dash: lower ? null : '4,4' });
          g += h.txt(x + (cw - 6) / 2, y + (cw - 6) / 2 + 7, String(s.mtx[r * n + c]), { size: 15, w: 700, fill: lower ? C.ink : C.muted });
          if (c === 0) g += h.txt(x - 14, y + cw / 2, String(r + 1), { size: 12, fill: C.muted });
        }
        for (var c2 = 0; c2 < n; c2++) g += h.txt(x0 + c2 * cw + (cw - 6) / 2, y0 + n * cw + 18, String(c2 + 1), { size: 12, fill: C.muted });
        /* sa 数组 */
        var sw2 = Math.min(46, Math.floor((W - 600) / s.sa.length)), sx0 = 560, sy = 130;
        g += h.txt(sx0, 100, 'sa[]（一维数组，共 ' + s.sa.length + ' 格 = n(n+1)/2）', { size: 13.5, fill: C.muted, anchor: 'start', w: 600 });
        s.sa.forEach(function (val, k) {
          var x = sx0 + k * sw2;
          var hot = s.k === k;
          g += h.rect(x, sy, sw2 - 4, 44, { fill: hot ? C.blueBg : '#fff', stroke: hot ? C.blue : C.grey, sw: hot ? 2.6 : 1.3, rx: 5 });
          g += h.txt(x + (sw2 - 4) / 2, sy + 27, String(val), { size: 14, w: 700 });
          g += h.txt(x + (sw2 - 4) / 2, sy + 62, String(k), { size: 10, fill: hot ? C.blue : C.muted, w: hot ? 700 : 400 });
        });
        if (s.k) g += h.txt(sx0 + (s.k - 1) * sw2 + (sw2 - 4) / 2, sy + 86, '↑ k=' + s.k, { size: 12, fill: C.blue, w: 700 });
        g += h.txt(560, 300, '映射公式（下标从 0 起）：', { size: 13.5, anchor: 'start', w: 600 });
        g += h.txt(560, 330, 'k = i(i−1)/2 + j − 1   （i ≥ j）', { size: 15, w: 700, anchor: 'start', family: 'Consolas,monospace' });
        g += h.txt(560, 360, 'i < j 时读对称元素 sa[ j(j−1)/2 + i − 1 ]', { size: 15, w: 700, anchor: 'start', family: 'Consolas,monospace', fill: C.muted });
        g += h.txt(560, 400, '第 i 行前有 1+2+…+(i−1) = i(i−1)/2 个元素', { size: 12.5, fill: C.muted, anchor: 'start' });
      } else {
        g += h.txt(W / 2, 40, '稀疏矩阵三元组快速转置（M 6×6，8 个非零元）', { size: 16, w: 600 });
        function table(x, y, title, arr, hotP) {
          var out = h.txt(x + 130, y - 12, title, { size: 13.5, fill: C.muted, anchor: 'start', w: 600 });
          out += h.txt(x + 10, y + 16, '( i,  j,  e )', { size: 12, fill: C.muted, anchor: 'start', family: 'Consolas,monospace' });
          arr.forEach(function (t, p) {
            var hot = hotP === p;
            out += h.rect(x, y + 26 + p * 32, 260, 28, { fill: hot ? C.amberBg : '#fff', stroke: hot ? C.amber : C.line, sw: hot ? 2.2 : 1, rx: 4 });
            out += h.txt(x + 16, y + 45 + p * 32, '( ' + t.i + ',  ' + t.j + ',  ' + t.e + ' )', { size: 13, anchor: 'start', family: 'Consolas,monospace', w: hot ? 700 : 400 });
          });
          return out;
        }
        g += table(60, 100, 'M.data（转置前）', s.M, s.cur);
        if (s.T && s.T.length) g += table(620, 100, 'T.data（转置后，按行序）', s.T, null);
        if (s.stage === 'num' || s.stage === 'cpot') g += h.txt(W / 2, 440, s.stage === 'num' ? '统计 num[col]：M 第 col 列非零元个数（= T 第 col 行个数）' : '由 num 推出 cpot：T 每行在 T.data 中的起始位置', { size: 13, fill: C.blue, w: 600 });
        if (s.mark === 'final') g += h.txt(W / 2, 445, '✓ 一遍扫描完成转置：O(tu + nu)，普通算法为 O(tu × nu)', { size: 14, w: 700, fill: C.green });
      }
      return h.svg(W, H, g);
    }
  });
})();
