/* 动画：分块查找（索引顺序查找）——教材 7.2，块间有序 / 块内无序，两段查找 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'int BlockSearch(SSTable ST, IndexTable ID, KeyType key) {',
    '    // ① 在索引表（有序）中确定所在块：可顺序也可折半',
    '    for (b = 1; b <= ID.len && ID[b].max < key; ++b);',
    '    if (b > ID.len)  return 0;                 // 比所有块上界都大 → 失败',
    '    // ② 在该块内顺序查找（块内无序，只能顺序）',
    '    for (i = ID[b].start; i < ID[b].start + ID[b].len; ++i)',
    '        if (ST.r[i].key == key)  return i;',
    '    return 0;',
    '}'
  ];

  var DEF = [22, 12, 13, 8, 9, 33, 42, 44, 38, 24, 48, 60, 58, 74, 49];

  DSC.reg({
    id: 'blockSearch', ch: 7, name: '分块查找（索引顺序查找）',
    aim: '分块查找 = 索引 + 块内顺序：**先折半定位在哪一块，再在块里挨个找**',
    note: '教材 7.2 分块查找（索引表定块、块内顺序，折中的 ASL）',
    guide: [
      '分块 = "块间有序、块内无序"：先查**索引表**（每块最大值，有序）确定所在块，再在块内顺序扫',
      '蓝色=索引表扫描，黄色=块内扫描；先看 key=38：索引 2 步定块，块内 2 步命中',
      'key=50：比前两块上界都大、落在第三块，但块内没有 → 失败（仍要扫完该块）',
      'ASL = 索引查找 + 块内查找，介于顺序查找 O(n) 与折半 O(log n) 之间；分块还支持"块内插入不移动其他块"'
    ],
    inputs: [
      { key: 'key', label: '查找 key', type: 'select', options: [['38', '38（成功：第 2 块）'], ['49', '49（成功：第 3 块）'], ['50', '50（失败）'], ['8', '8（成功：第 1 块）']], value: '38' },
      { key: 'im', label: '索引表查找方式', type: 'select', options: [['seq', '顺序'], ['bin', '折半']], value: 'seq' }
    ],
    run: function (v) {
      var st = DEF.slice(), n = st.length, B = 3, S = n / B;
      var key = +v.key;
      var idx = [];
      for (var b = 0; b < B; b++) {
        var mx = -1;
        for (var k = 0; k < S; k++) mx = Math.max(mx, st[b * S + k]);
        idx.push(mx);
      }
      var frames = [], cmp = 0;
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 阶段: extra.phase || '—', 结果: extra.res || '查找中…' },
          snap: { st: st, idx: idx, S: S, B: B, key: key, curI: extra.curI, curB: extra.curB, blk: extra.blk, hit: extra.hit, res: extra.res || null, im: v.im, visit: (extra.visit || []).slice(), mark: mk }
        });
      }
      var visit = [];
      F(0, '原表 "块间有序、块内无序"：索引表 = 每块最大值 ' + idx.join('、') + '（有序）。查找 key=' + key + ' 分两段：先索引表定块，再块内顺序。', { phase: '索引表' });

      if (v.im === 'bin') {
        var lo = 0, hi = B - 1, blk = -1;
        while (lo <= hi) {
          var mid = Math.floor((lo + hi) / 2);
          cmp++; visit.push(mid);
          F(1, '折半查索引表：ID[' + (mid + 1) + '].max=' + idx[mid] + (idx[mid] >= key ? ' ≥ ' : ' < ') + key + (idx[mid] >= key ? ' → 块（或更左）' : ' → 右半') + '。', { phase: '索引表(折半)', curB: mid, visit: visit });
          if (idx[mid] >= key) { blk = mid; hi = mid - 1; } else lo = mid + 1;
        }
        if (blk < 0) { F(3, '索引表全部 < key：key 比所有块上界都大 → 查找失败。', { phase: '索引表', visit: visit, res: '失败：key 不在表中' }, 'fail'); return { code: CODE, frames: frames }; }
        F(1, '确定所在块：第 ' + (blk + 1) + ' 块（其上界 ' + idx[blk] + ' ≥ ' + key + '，且前一块上界 < key）。', { phase: '索引表', blk: blk, visit: visit });
      } else {
        var blk = -1;
        for (var b2 = 0; b2 < B; b2++) {
          cmp++; visit.push(b2);
          if (idx[b2] >= key) { blk = b2; F(1, '索引表第 ' + (b2 + 1) + ' 项：上界 ' + idx[b2] + ' ≥ key=' + key + ' → 目标只可能在第 ' + (b2 + 1) + ' 块。', { phase: '索引表', curB: b2, blk: blk, visit: visit }); break; }
          F(1, '索引表第 ' + (b2 + 1) + ' 项：上界 ' + idx[b2] + ' < key → 跳过第 ' + (b2 + 1) + ' 块。', { phase: '索引表', curB: b2, visit: visit });
        }
        if (blk < 0) { F(2, '所有块上界都 < key → 查找失败（只比较了 B=' + B + ' 次索引——这是分块的优点）。', { phase: '索引表', visit: visit, res: '失败：key 不在表中' }, 'fail'); return { code: CODE, frames: frames }; }
      }

      F(4, '进入第 ' + (blk + 1) + ' 块（位置 ' + (blk * S + 1) + '~' + ((blk + 1) * S) + '），块内无序 → 只能顺序扫描。', { phase: '块内', blk: blk, visit: visit });
      var hit = -1;
      for (var k2 = 0; k2 < S; k2++) {
        var p = blk * S + k2;
        cmp++;
        if (st[p] === key) { hit = p; F(6, 'ST[' + (p + 1) + ']=' + st[p] + ' = key，命中！共比较 ' + cmp + ' 次（索引 + 块内）。', { phase: '块内', blk: blk, curI: p, hit: p, res: '成功：第 ' + (p + 1) + ' 个元素' }, 'found'); break; }
        F(5, 'ST[' + (p + 1) + ']=' + st[p] + ' ≠ ' + key + '，继续。', { phase: '块内', blk: blk, curI: p, visit: visit });
      }
      if (hit < 0) F(7, '块内扫完没有命中 → 查找失败（key 不在表中，但绝不会出现在其他块）。', { phase: '块内', blk: blk, res: '失败：key 不在表中' }, 'fail');
      var aslIdx = v.im === 'bin' ? Math.ceil(Math.log2(B + 1)) : (B + 1) / 2;
      F(0, '小结：等概率下 ASL = 索引查找 + 块内查找。本例 3 块每块 5 个：顺序索引 + 顺序块内 = (' + (B + 1) + '/2)+(' + (S + 1) + '/2) = 5；若索引用折半 ≈ ' + (Math.ceil(Math.log2(B + 1)) + (S + 1) / 2).toFixed(1) + '。n 越大，分块相对整体顺序查找的优势越明显。', { res: hit >= 0 ? '成功' : '失败' });
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 520;
      var g = '';
      g += h.txt(W / 2, 30, '分块查找：key = ' + s.key + '（' + (s.im === 'bin' ? '索引折半' : '索引顺序') + '）', { size: 17, w: 600 });
      /* 索引表 */
      g += h.txt(60, 78, '索引表（有序）', { size: 13.5, fill: C.muted, anchor: 'start', w: 600 });
      var iw = 110, ix = 60;
      for (var b = 0; b < s.B; b++) {
        var on = s.curB === b || s.blk === b;
        var visited = s.visit && s.visit.indexOf(b) >= 0;
        var f = on ? C.blueBg : visited ? C.amberBg : '#fff', st2 = on ? C.blue : visited ? C.amber : C.grey;
        g += h.rect(ix + b * (iw + 10), 90, iw, 40, { fill: f, stroke: st2, sw: on ? 2.4 : 1.5, rx: 6 });
        g += h.txt(ix + b * (iw + 10) + iw / 2, 116, 'max=' + s.idx[b], { size: 14, w: 700 });
        g += h.txt(ix + b * (iw + 10) + iw / 2, 146, '第 ' + (b + 1) + ' 块', { size: 11, fill: C.muted });
      }
      /* 主表（按块分框） */
      var bw = 52, x0 = 60, y0 = 210;
      for (var b2 = 0; b2 < s.B; b2++) {
        var bx = x0 + b2 * (s.S * bw + 26);
        g += h.rect(bx - 8, y0 - 8, s.S * bw + 16, 66, { fill: s.blk === b2 ? C.blueBg : 'none', stroke: s.blk === b2 ? C.blue : C.line, sw: s.blk === b2 ? 2 : 1, rx: 8, dash: s.blk === b2 ? null : '4,4' });
        for (var k = 0; k < s.S; k++) {
          var p = b2 * s.S + k, x = bx + k * bw;
          var isCur = s.curI === p, isHit = s.hit === p;
          g += h.rect(x, y0, bw - 4, 50, { fill: isHit ? C.greenBg : isCur ? C.amberBg : '#fff', stroke: isHit ? C.green : isCur ? C.amber : C.grey, sw: isCur || isHit ? 2.4 : 1.4, rx: 5 });
          g += h.txt(x + (bw - 4) / 2, y0 + 31, String(s.st[p]), { size: 14.5, w: 700 });
          g += h.txt(x + (bw - 4) / 2, y0 + 66, String(p + 1), { size: 10, fill: C.muted });
        }
      }
      g += h.txt(60, 350, '块内无序（块间有序）：索引表只管"最大值上界"，块内必须顺序扫描', { size: 12.5, fill: C.muted, anchor: 'start' });
      if (s.res) g += h.txt(W / 2, 420, (s.res.indexOf('成功') >= 0 ? '✓ ' : '✗ ') + s.res, { size: 16, w: 700, fill: s.res.indexOf('成功') >= 0 ? C.green : C.red });
      g += h.txt(W / 2, 470, '索引表(有序) ─确定块→ 块内(无序) ─顺序扫→ 结果；ASL 介于顺序与折半之间', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
