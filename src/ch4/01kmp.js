/* 动画：串的模式匹配——BF 与 KMP 对照 + next 数组计算，教材 4.3，例题 S="acabaabaabcacaabc", T="abaabcac" */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE_BF = [
    'int Index_BF(SString S, SString T) {',
    '    i = 1;  j = 1;',
    '    while (i <= S.len && j <= T.len) {',
    '        if (S[i] == T[j])  { ++i;  ++j; }    // 匹配：双指针前进',
    '        else { i = i - j + 2;  j = 1; }      // 失配：i 回退到本趟起点下一位',
    '    }',
    '    return j > T.len ? i - T.len : 0;',
    '}'
  ];
  var CODE_KMP = [
    'void get_next(SString T, int next[]) {     // 预处理（前缀自我匹配）',
    '    i = 1;  next[1] = 0;  j = 0;',
    '    while (i < T.len) {',
    '        if (j == 0 || T[i] == T[j]) { ++i;  ++j;  next[i] = j; }',
    '        else  j = next[j];',
    '    }',
    '}',
    'int Index_KMP(SString S, SString T, int next[]) {',
    '    i = 1;  j = 1;',
    '    while (i <= S.len && j <= T.len) {',
    '        if (j == 0 || S[i] == T[j]) { ++i;  ++j; }   // 匹配则前进',
    '        else  j = next[j];                    // 失配：i 不回退！模式右滑',
    '    }',
    '    return j > T.len ? i - T.len : 0;',
    '}'
  ];

  var DEF_S = 'acabaabaabcacaabc', DEF_T = 'abaabcac';

  /* 教材定义（1 基）：next[j] = 前缀 p1..p(k-1) 与 p(j-k+1)..p(j-1) 相等的最大 k，next[1]=0 */
  function bruteNext(T) {
    var nx = [0];
    for (var j = 2; j <= T.length; j++) {
      var k = j - 1;
      while (k > 0) {
        var ok = true;
        for (var t = 0; t < k - 1; t++) if (T[t] !== T[j - k + t]) { ok = false; break; }
        if (ok) break;
        k--;
      }
      nx.push(k);
    }
    return nx;
  }

  DSC.reg({
    id: 'kmp', ch: 4, name: '模式匹配：BF 与 KMP',
    aim: 'KMP 快的原因：**next 数组记住已匹配部分的最长相等前后缀**，主串指针从不回溯',
    note: '教材 4.3 串的模式匹配（BF 回退对比 KMP 不回退、next 数组）',
    keywords: '串 模式匹配 BF 暴力 回溯 指针i不回退 next数组 部分匹配值 前缀 后缀 最长公共前后缀 nextval 优化 定位',
    guide: [
      'BF（朴素）：失配时主串指针 i **回退**到本趟起点下一位、模式从头再来——浪费在重复比较',
      'KMP：失配时 **i 永不回退**，只有模式指针 j 滑到 next[j]——next 预先算好"失配后从模式的哪一位继续"',
      '动画分两阶段：先逐格算出 next，再同屏对照 BF / KMP 的比较次数',
      '复杂度：BF 最坏 O(m×n)；KMP O(m+n)——主串越长、模式前缀重复越多，KMP 优势越大',
      '勾"错误演示"：把 next 整体左移一格，看 KMP 怎样把真正的匹配点直接滑过去'
    ],
    inputs: [
      { key: 's', label: '主串 S', type: 'text', value: DEF_S },
      { key: 't', label: '模式 T', type: 'text', value: DEF_T },
      { key: 'errNext', label: '错误演示：next 错位一格', type: 'checkbox', value: false }
    ],
    run: function (v) {
      var S = String(v.s || DEF_S).replace(/\s+/g, ''), T = String(v.t || DEF_T).replace(/\s+/g, '');
      if (T.length < 2 || T.length > 12) throw Error('模式串长度请取 2~12');
      if (S.length < T.length || S.length > 24) throw Error('主串需长于模式且不超过 24 个字符');
      if (/[^a-z]/.test(S + T)) throw Error('请只用小写字母 a~z');
      var frames = [];
      var nx = [0].concat(bruteNext(T));           // nx[1..len]

      function F(line, msg, extra, mk, code) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 阶段: extra.phase || '—', 比较次数: extra.cmps != null ? extra.cmps + ' 次' : '—' },
          snap: { S: S, T: T, nx: extra.nxArr || nx, phase: extra.phase || 'next', si: extra.si, ti: extra.ti, mark: mk }
        });
      }

      F(0, '阶段一：求模式 T=' + T + ' 的 next 数组。next[j] = T 前 j−1 个字符的"最长相等前后缀长度 + 1"。', { phase: 'next' });
      for (var j = 2; j <= T.length; j++) {
        var k = nx[j];
        F(0, 'next[' + j + ']：前 ' + (j - 1) + ' 个字符 "' + T.slice(0, j - 1) + '" 的最长相等前后缀长度 = ' + (k - 1) + '（前缀 ' + T.slice(0, k - 1) + ' == 后缀 ' + T.slice(j - 1 - (k - 1), j - 1) + '）→ next[' + j + '] = ' + k + '。', { phase: 'next', ti: j - 1 });
      }
      F(0, 'next = [' + nx.slice(1).join(', ') + ']。含义：模式第 j 位失配时，j 滑到 next[j] 继续，主串指针 i 不动。', { phase: 'next' }, 'nextdone');

      /* BF */
      var i = 0, jj = 0, bfc = 0;
      F(1, '阶段二 · BF：从主串第 1 位开始逐趟对齐比较。', { phase: 'BF', si: 0, ti: 0 }, 'bfstart');
      while (i < S.length && jj < T.length) {
        bfc++;
        var m1 = S[i] === T[jj];
        F(3, 'BF 比较 #' + bfc + '：S[' + (i + 1) + ']=' + S[i] + (m1 ? ' = ' : ' ≠ ') + 'T[' + (jj + 1) + ']=' + T[jj] + (m1 ? '，双指针前进。' : '，失配 → i 回退到第 ' + (i - jj + 2) + ' 位，j 归 1。'),
          { phase: 'BF', si: i, ti: jj, cmps: bfc });
        if (m1) { i++; jj++; } else { i = i - jj + 1; jj = 0; }
      }
      var bfRes = jj >= T.length ? '成功：匹配位置 = 主串第 ' + (i - T.length + 1) + ' 位' : '失败';
      F(6, 'BF 结束：' + bfRes + '，共比较 ' + bfc + ' 次。每趟失配 i 都要回退，最坏 O(m×n)。', { phase: 'BF', cmps: bfc, si: i, ti: jj }, 'bfdone');

      /* KMP */
      var i2 = 0, j2 = 0, kc = 0;
      F(15, '阶段二 · KMP：同样的主串与模式，j 失配时沿 next 滑动。', { phase: 'KMP', si: 0, ti: 0, cmps: 0 }, 'kmpstart');
      while (i2 < S.length && j2 < T.length) {
        kc++;
        var m2 = S[i2] === T[j2];
        if (m2) { F(18, 'KMP 比较 #' + kc + '：S[' + (i2 + 1) + ']=' + S[i2] + ' = T[' + (j2 + 1) + ']=' + T[j2] + '，前进。', { phase: 'KMP', si: i2, ti: j2, cmps: kc }); i2++; j2++; }
        else if (j2 === 0) { F(19, 'KMP 比较 #' + kc + '：S[' + (i2 + 1) + ']=' + S[i2] + ' ≠ T[1]=' + T[0] + '，模式头失配 → 直接右移一位。', { phase: 'KMP', si: i2, ti: j2, cmps: kc }); i2++; }
        else { var nj = nx[j2 + 1] - 1; F(19, 'KMP 比较 #' + kc + '：S[' + (i2 + 1) + ']=' + S[i2] + ' ≠ T[' + (j2 + 1) + ']=' + T[j2] + ' → j 滑到 next[' + (j2 + 1) + ']=' + (nj + 1) + '，**i 不回退**！', { phase: 'KMP', si: i2, ti: j2, cmps: kc }); j2 = nj; }
      }
      var kRes = j2 >= T.length ? '成功：匹配位置 = 主串第 ' + (i2 - T.length + 1) + ' 位' : '失败';
      F(21, 'KMP 结束：' + kRes + '，共比较 ' + kc + ' 次。', { phase: 'KMP', cmps: kc, si: i2, ti: j2 }, 'kmpdone');
      F(0, '对照结论：BF ' + bfc + ' 次 vs KMP ' + kc + ' 次。next 只需 O(n) 预处理一次；对同一模式的多次查找都可复用。主串越长、模式前缀重复越多，KMP 优势越大。', { phase: 'KMP', cmps: kc, mark: 'final' });
      if (v.errNext) {
        /* 错位一格有两种方向，后果完全不同——两种都实测过：
           左移（少一位占位）→ 模式多滑一格，把真正的匹配点滑过去，查找失败；
           右移（多一位占位）→ next[j] 会算出 0/负数，j 再也滑不动，死循环 */
        var bad = [0];
        for (var q = 1; q <= T.length; q++) bad.push(q < T.length ? nx[q + 1] : 0);
        var diffj = 0;
        /* 从第 2 位起找第一处不同：next[1]=0 是规定，不参与滑动，比较它没意义 */
        for (var q2 = 2; q2 <= T.length; q2++) if (bad[q2] !== nx[q2] && !diffj) diffj = q2;
        F(0, '错误演示：next 整体**左移一格**（把"最长相等前后缀长度"直接当 next、或者忘写 next[1]=0 都会得到它）。正确 [' + nx.slice(1).join(', ') + '] → 错位 [' + bad.slice(1).join(', ') + ']。', { phase: 'next', nxArr: bad, ti: diffj }, 'badnext');
        F(0, '第一个不同的下标是 next[' + diffj + ']：正确值 ' + nx[diffj] + '，错位值 ' + bad[diffj] + '。失配时 j 会滑到' + (bad[diffj] > nx[diffj] ? '更靠后' : '更靠前') + '的位置——模式相对主串多滑了一格。', { phase: 'next', nxArr: bad, ti: diffj }, 'baddiff');
        var i3 = 0, j3 = 0, bc = 0, guard = 0, shots = 0, stuck = false;
        var stepF = function (msg, ti2, cmp2) {
          if (shots >= 3) return;
          shots++;
          F(19, msg, { phase: 'KMP', si: i3, ti: ti2, cmps: cmp2, nxArr: bad });
        };
        while (i3 < S.length && j3 < T.length) {
          if (++guard > 300) { stuck = true; break; }
          bc++;
          if (j3 === 0 || S[i3] === T[j3]) { i3++; j3++; continue; }
          var nb = bad[j3 + 1] - 1;
          stepF('按错位表：S[' + (i3 + 1) + ']=' + S[i3] + ' ≠ T[' + (j3 + 1) + ']=' + T[j3] + ' → j 滑到 bad next[' + (j3 + 1) + '] = ' + bad[j3 + 1] + '，即 T 的第 ' + (nb + 1) + ' 位；正确表这时应滑到 next[' + (j3 + 1) + '] = ' + nx[j3 + 1] + '（第 ' + nx[j3 + 1] + ' 位）。', j3, bc);
          if (nb < 0) { stuck = true; break; }
          j3 = nb;
        }
        var badRes = stuck ? '卡住：j 再也滑不动（死循环）' : (j3 >= T.length ? '成功：匹配位置 = 主串第 ' + (i3 - T.length + 1) + ' 位' : '失败：扫到主串末尾也没匹配上');
        F(21, (stuck || j3 < T.length ? '✗ ' : '· ') + '用错位表跑完：' + badRes + '，比较 ' + bc + ' 次。对照正确表的结论——KMP 结束：' + kRes + '，共 ' + kc + ' 次。', { phase: 'KMP', cmps: bc, si: i3, ti: j3, nxArr: bad }, 'badrun');
        F(8, '★ 结论：next 差一格，KMP 就从"更快"变成"错得离谱"。右移一格更糟：next[j] 会出现 0 甚至负数，j 原地不动直接死循环。背公式不如把表逐位核对一遍——用本动画阶段一的算法跑一次，对答案。', { phase: 'KMP', nxArr: bad }, 'badfinal');
      }
      return { code: CODE_BF.concat(CODE_KMP), frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470, S = s.S, T = s.T, nx = s.nx;
      var g = '';
      g += h.txt(W / 2, 30, s.phase === 'next' ? '阶段一：next 数组' : '阶段二：' + s.phase + ' 执行对照', { size: 17, w: 600 });
      /* next 表 */
      var cw = 34, x0 = (W - (T.length + 1) * cw) / 2;
      g += h.txt(x0 - 14, 78, 'j', { size: 11.5, fill: C.muted, anchor: 'end' });
      g += h.txt(x0 - 14, 104, 'T[j]', { size: 11.5, fill: C.muted, anchor: 'end' });
      g += h.txt(x0 - 14, 130, 'next', { size: 11.5, fill: C.muted, anchor: 'end' });
      for (var j = 1; j <= T.length; j++) {
        var x = x0 + j * cw;
        var hot = s.phase !== 'next' ? false : (s.ti != null && j === s.ti + 1);
        g += h.rect(x, 62, cw - 3, 24, { fill: '#fff', stroke: C.line, sw: 1, rx: 3 });
        g += h.txt(x + (cw - 3) / 2, 79, String(j), { size: 12, fill: C.muted });
        g += h.rect(x, 88, cw - 3, 24, { fill: hot ? C.amberBg : '#fff', stroke: hot ? C.amber : C.line, sw: hot ? 2 : 1, rx: 3 });
        g += h.txt(x + (cw - 3) / 2, 105, T[j - 1], { size: 13, w: 700 });
        g += h.rect(x, 114, cw - 3, 24, { fill: hot ? C.amberBg : C.greyBg, stroke: hot ? C.amber : C.line, sw: hot ? 2 : 1, rx: 3 });
        g += h.txt(x + (cw - 3) / 2, 131, String(nx[j]), { size: 13, w: 700, fill: hot ? C.amber : C.blue });
      }
      if (s.phase === 'next') {
        g += h.txt(W / 2, 210, 'T = ' + T, { size: 17, w: 700, family: 'Consolas,monospace' });
        g += h.txt(W / 2, 244, '前缀 ↑（从 T[1] 开始）与后缀 ↑（到 T[j−1] 结束）逐长对照，取最长相等者', { size: 12.5, fill: C.muted });
        return h.svg(W, H, g);
      }
      /* 匹配视图 */
      var scw = Math.min(40, Math.floor((W - 140) / S.length));
      var sx = (W - (S.length * scw)) / 2, sy = 210;
      var align = (s.si != null && s.ti != null) ? s.si - s.ti : 0;
      g += h.txt(sx - 10, sy + 26, 'S', { size: 14, fill: C.muted, anchor: 'end', w: 700 });
      for (var k = 0; k < S.length; k++) {
        var x = sx + k * scw;
        var isCmp = s.si === k;
        var matched = k >= align && k < s.si;
        var f = '#fff', st = C.grey, sw = 1.4;
        if (matched) { f = C.greenBg; st = C.green; }
        if (isCmp) { f = C.amberBg; st = C.amber; sw = 2.4; }
        g += h.rect(x, sy, scw - 2, 36, { fill: f, stroke: st, sw: sw, rx: 4 });
        g += h.txt(x + (scw - 2) / 2, sy + 24, S[k], { size: 14.5, w: 700 });
        g += h.txt(x + (scw - 2) / 2, sy + 52, String(k + 1), { size: 9.5, fill: C.muted });
      }
      var ty = sy + 66;
      g += h.txt(sx - 10, ty + 26, 'T', { size: 14, fill: C.muted, anchor: 'end', w: 700 });
      var tx0 = sx + align * scw;
      for (var k2 = 0; k2 < T.length; k2++) {
        var x2 = tx0 + k2 * scw;
        /* 两头都要裁：模式挂在主串左外面、或者尾巴伸出主串末尾（错位演示会把 align 推到很大）
           ——伸出去的那几格画出来就顶破画布了 */
        if (x2 < sx - scw) continue;
        if (x2 + scw - 2 > sx + S.length * scw) continue;
        var isCmp2 = s.ti === k2;
        var f2 = '#fff', st2 = C.grey, sw2 = 1.4;
        if (isCmp2) { f2 = C.amberBg; st2 = C.amber; sw2 = 2.4; }
        else if (k2 < s.ti) { f2 = C.greenBg; st2 = C.green; }
        g += h.rect(x2, ty, scw - 2, 36, { fill: f2, stroke: st2, sw: sw2, rx: 4 });
        g += h.txt(x2 + (scw - 2) / 2, ty + 24, T[k2], { size: 14.5, w: 700 });
      }
      if (s.mark === 'bfdone' || s.mark === 'kmpdone' || s.mark === 'final') {
        var win = (s.mark !== 'bfdone' || true);
        g += h.rect(sx + (s.si - T.length) * scw, sy - 6, T.length * scw, 48, { fill: 'none', stroke: s.mark === 'bfdone' ? C.green : C.blue, sw: 2.5, rx: 6, dash: '5,4' });
      }
      g += h.txt(W / 2, 388, s.phase === 'BF' ? 'BF：失配 → i 回退到本趟起点下一位（绿色=本趟已比较过）' : 'KMP：失配 → 仅模式右滑，主串指针 i 从不左移', { size: 13, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
