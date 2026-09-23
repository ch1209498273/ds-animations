/* 动画7：哈夫曼树构造、编码与译码（例题取自 cp5-05/cp5-06：w={70,50,20,40}、{7,19,2,6,32,3,21,10}） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'void CreateHuffmanTree(HuffmanTree &HT, int n) {',
    '    m = 2 * n - 1;                      // 结点总数（无度为1的结点）',
    '    HT = new HTNode[m + 1];             // 0号单元不用；1..n为叶子',
    '    for (i = 1; i <= m; ++i) HT[i] = {parent:0, lch:0, rch:0};  // 初始化',
    '    for (i = n + 1; i <= m; ++i) {      // 共合并 n-1 次',
    '        Select(HT, i - 1, s1, s2);      // 在parent为0的结点中选权值最小的两个',
    '        HT[s1].parent = i;  HT[s2].parent = i;',
    '        HT[i].lch = s1;  HT[i].rch = s2;     // 左孩子s1编0，右孩子s2编1',
    '        HT[i].weight = HT[s1].weight + HT[s2].weight;',
    '    }',
    '}',
    '// ---------- 哈夫曼编码：从叶子到根回溯 ----------',
    'void CreatHuffmanCode(HuffmanTree HT, HuffmanCode &HC, int n) {',
    '    for (i = 1; i <= n; ++i) {',
    '        c = i;  f = HT[i].parent;       // c当前结点，f其双亲',
    '        while (f != 0) {                // 从叶子上溯到根',
    '            if (HT[f].lch == c) bit = "0";   // 左分支记0',
    '            else                bit = "1";   // 右分支记1',
    '            c = f;  f = HT[f].parent;',
    '        }',
    '        HC[i] = 逆置(bit串);            // 上溯得到的序列要倒过来',
    '    }',
    '}',
    '// ---------- 译码：从根出发，0向左 / 1向右 ----------',
    'void Decode(HuffmanTree HT, char *code) {',
    '    p = 根;',
    '    for (每个字符 ch : code) {',
    '        p = (ch == "0") ? HT[p].lch : HT[p].rch;',
    '        if (p是叶子) { 输出该字符;  p = 根; }',
    '    }',
    '}'
  ];
  var L_BUILD_SELECT = 5, L_BUILD_MK = [6, 7, 8], L_CODE_LOOP = [14, 15, 16, 17, 18], L_CODE_ONE = 20, L_DEC_BIT = 27, L_DEC_OUT = 28;

  /* 编码帧快照的深拷贝（避免后续修改污染先前帧） */
  function snapCoding(cd) {
    return cd ? { leaf: cd.leaf, leafW: cd.leafW, collected: cd.collected.slice(), code: cd.code, path: cd.path ? cd.path.slice() : null } : null;
  }
  /* 判断 targetId 是否在以 rootId 为根的子树中（用于从根向下定位到某叶子的路径） */
  function HTContains(ht, rootId, targetId) {
    if (!rootId) return false;
    if (rootId === targetId) return true;
    return HTContains(ht, ht[rootId].lch, targetId) || HTContains(ht, ht[rootId].rch, targetId);
  }

  DSC.reg({
    id: 'huffman', ch: 5, name: '哈夫曼树构造与编码/译码',
    note: '教材 5.7 哈夫曼树及其应用（WPL、前缀编码）',
    guide: [
      '阶段下拉可直达：① 构造（森林视图逐轮合并最小的两棵）② 编码 ③ 译码',
      '编码：从叶子向根收集 0/1（左0右1），底部收集器按叶→根顺序显示，最后逆置；每片叶子有"读树验证"帧',
      '译码：从根出发 0 左 1 右，到叶子输出一个字符并回到根；报文条显示当前读入位',
      '可切换两道 PPT 例题权值，或自定义 2～10 个正整数权值'
    ],
    inputs: [
      {
        key: 'phase', label: '阶段', type: 'select', options: [
          ['all', '完整流程（构造 → 编码 → 译码）'],
          ['build', '① 构造过程：选两棵最小的合并'],
          ['code', '② 编码过程：从叶子到根回溯'],
          ['decode', '③ 译码演示：0 左 / 1 右走树']
        ], value: 'all'
      },
      { key: 'preset', label: '例题', type: 'select', options: [['a', '例1：w = {70,50,20,40}（cp5-05）'], ['b', '例2：w = {7,19,2,6,32,3,21,10}（cp5-06）'], ['c', '自定义 ↓']], value: 'a' },
      { key: 'w', label: '自定义权值', type: 'text', value: '70,50,20,40' }
    ],
    run: function (v) {
      var ws = v.preset === 'a' ? '70,50,20,40' : v.preset === 'b' ? '7,19,2,6,32,3,21,10' : v.w;
      var w = ws.split(/[,，\s]+/).filter(function (s) { return s !== ''; }).map(Number);
      if (w.some(function (x) { return Number.isNaN(x) || x <= 0; })) throw new Error('权值请输入逗号分隔的正整数');
      if (w.length < 2 || w.length > 10) throw new Error('权值个数取 2～10');
      var n = w.length, m = 2 * n - 1;

      var HT = [null];
      for (var k = 0; k < n; k++) HT.push({ w: w[k], ch: 'ABCDEFGHIJ'[k], parent: 0, lch: 0, rch: 0 });
      for (var k2 = n + 1; k2 <= m; k2++) HT.push({ w: 0, ch: '', parent: 0, lch: 0, rch: 0 });

      var frames = [];
      function snap(o) {
        o = o || {};
        o.ht = HT.map(function (t) { return t ? { w: t.w, ch: t.ch, parent: t.parent, lch: t.lch, rch: t.rch } : null; });
        o.n = n; o.m = m; o.codes = Object.assign({}, codes); o.wpl = wpl; o.treeReady = treeReady;
        o.codeTable = HT.slice(1, n + 1).filter(function (t) { return t.ch && codes[t.ch]; }).map(function (t) { return { ch: t.ch, code: codes[t.ch] }; });
        /* 树越深越要压行距：否则最深的叶子标签会压到底部的编码表和收集器上 */
        var cs = {}, maxD = 1;
        Object.keys(coords).forEach(function (k) { if (coords[k].depth > maxD) maxD = coords[k].depth; });
        var vstep = Math.min(78, Math.floor(310 / maxD));
        Object.keys(coords).forEach(function (k) {
          cs[k] = Object.assign({}, coords[k], { y: 130 + coords[k].depth * vstep });
        });
        o.coords = cs; o.hl = o.hl || {}; o.decode = decode ? { at: decode.at, step: decode.step, out: decode.out.slice() } : null;
        o.decodeBits = decodeBits ? decodeBits.slice() : null; o.decodeOut = decodeOut.slice();
        o.maxIdx = curMaxIdx;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      var codes = {}, wpl = 0, treeReady = false, coords = {}, decode = null, decodeBits = null, decodeOut = [];
      var curMaxIdx = n;

      F([2, 3], '初始森林：' + n + ' 个叶子结点（HT[1..' + n + ']），权值 w = { ' + w.join(', ') + ' }，字符依次标为 ' + HT.slice(1, n + 1).map(function (t) { return t.ch; }).join(', ') + '。结点总数 m = 2n−1 = ' + m + '（哈夫曼树没有度为 1 的结点）。',
        { 叶子数: String(n), 结点总数: 'm = ' + m, 已合并: '0 次' }, snap({}));

      function select(mm) {
        var cand = [];
        for (var i = 1; i <= mm; i++) if (HT[i].parent === 0) cand.push(i);
        cand.sort(function (a, b) { return HT[a].w - HT[b].w || a - b; });
        return [cand[0], cand[1]];
      }
      for (var i = n + 1; i <= m; i++) {
        var sel = select(i - 1), s1 = sel[0], s2 = sel[1];
        F(L_BUILD_SELECT, '第 ' + (i - n) + ' 次合并：Select 在 parent 为 0 的结点中选权值最小的两棵树——s1 = HT[' + s1 + ']（' + (HT[s1].ch || '第' + s1 + '号') + '，权 ' + HT[s1].w + '）、s2 = HT[' + s2 + ']（' + (HT[s2].ch || '第' + s2 + '号') + '，权 ' + HT[s2].w + '）。',
          { 已合并: (i - n - 1) + ' 次', s1: 'HT[' + s1 + '] 权 ' + HT[s1].w, s2: 'HT[' + s2 + '] 权 ' + HT[s2].w },
          snap({ hl: { s1: s1, s2: s2 } }));
        HT[s1].parent = i; HT[s2].parent = i;
        HT[i].lch = s1; HT[i].rch = s2;
        HT[i].w = HT[s1].w + HT[s2].w;
        curMaxIdx = i;
        F(L_BUILD_MK, '新结点 HT[' + i + ']：权 = ' + HT[s1].w + ' + ' + HT[s2].w + ' = ' + HT[i].w + '；左孩子 = s1（编 0），右孩子 = s2（编 1）。森林少一棵树。',
          { 已合并: (i - n) + ' 次', 新结点: 'HT[' + i + '] 权 ' + HT[i].w },
          snap({ hl: { s1: s1, s2: s2, new: i } }));
      }
      treeReady = true;

      /* 坐标与深度（叶子多时压缩水平间距，避免压到右侧 HT 表） */
      (function place() {
        var leafNo = 0;
        var lgap = Math.min(92, 700 / Math.max(n - 1, 1));
        function walk(nd, depth) {
          if (!HT[nd].lch && !HT[nd].rch) { coords[nd] = { x: 95 + leafNo++ * lgap, y: 130 + depth * 78, depth: depth, leaf: true }; return; }
          walk(HT[nd].lch, depth + 1); walk(HT[nd].rch, depth + 1);
          coords[nd] = { x: (coords[HT[nd].lch].x + coords[HT[nd].rch].x) / 2, y: 130 + depth * 78, depth: depth, leaf: false };
        }
        walk(m, 0);
      })();
      var leafDepth = {};
      (function depths() {
        function walk(nd, d) {
          if (!HT[nd].lch && !HT[nd].rch) { leafDepth[nd] = d; return; }
          walk(HT[nd].lch, d + 1); walk(HT[nd].rch, d + 1);
        }
        walk(m, 0);
      })();
      wpl = 0;
      for (var li = 1; li <= n; li++) wpl += HT[li].w * leafDepth[li];
      F(9, '构造完成！共 ' + (n - 1) + ' 次合并，根 = HT[' + m + ']（权 ' + HT[m].w + '）。WPL = Σ(权×路径长) = ' + wpl + '（也等于所有非叶结点权值之和）。权值越大离根越近。',
        { 根权值: String(HT[m].w), WPL: String(wpl) }, snap({ hl: { root: m } }));
      var treeDoneAt = frames.length - 1;

      /* 编码：从叶子到根回溯收集（左0右1），最后逆置；每片叶子加"从根读树"验证帧 */
      var coding = null;
      for (var ci = 1; ci <= n; ci++) {
        var bits = [], c = ci, f = HT[ci].parent;
        coding = { leaf: HT[ci].ch, leafW: HT[ci].w, collected: [], code: null, path: null };
        F(L_CODE_LOOP, '开始求 ' + HT[ci].ch + '(' + HT[ci].w + ') 的编码。编码本应是"从根到该叶子"路径上的 0/1 序列；教材算法反过来走：从叶子沿 parent 指针【向根回溯】——所以先收集到的是编码的【最后一位】。',
          { 当前: HT[ci].ch, 收集器: '（空）' }, snap({ hl: { c: ci }, coding: snapCoding(coding) }));
        while (f !== 0) {
          var bit = (HT[f].lch === c) ? '0' : '1';
          bits.push(bit);
          coding.collected = bits.slice();
          F(L_CODE_LOOP, '上溯：' + (HT[c].ch ? HT[c].ch : 'HT[' + c + ']') + ' 是其双亲 HT[' + f + ']（权 ' + HT[f].w + '）的【' + (bit === '0' ? '左' : '右') + '】孩子 → 收集 ' + bit + '。' +
            (bits.length === 1 ? '先收集到的是编码的【最后一位】。' : '已收集 ' + bits.length + ' 位。'),
            { 当前: HT[ci].ch, '已收集（叶→根）': bits.join(' '), 提示: '这是从后往前收集，最后要逆置' },
            snap({ hl: { c: c, f: f }, coding: snapCoding(coding) }));
          c = f; f = HT[f].parent;
        }
        var codeStr = bits.slice().reverse().join('');
        coding.code = codeStr;
        codes[HT[ci].ch] = codeStr;
        F(L_CODE_ONE, '到达根，回溯结束。收集顺序（叶→根）：' + bits.join(' ') + ' ──逆置──▶ ' + HT[ci].ch + ' 的最终编码 = ' + codeStr + '。路径长 ' + codeStr.length + '，贡献 WPL ' + HT[ci].w + '×' + codeStr.length + ' = ' + (HT[ci].w * codeStr.length) + '。',
          { code: codeStr, WPL: String(wpl) }, snap({ hl: { c: ci }, coding: snapCoding(coding) }));
        /* 读树验证：从根走到该叶子，读出沿途 0/1 */
        var path = [], px = m;
        while (px !== ci) { path.push(px); px = (HT[px].lch && HTContains(HT, HT[px].lch, ci)) ? HT[px].lch : HT[px].rch; }
        path.push(ci);
        coding.path = path.slice();
        var readStr = path.slice(1).map(function (nd, k) { return (HT[path[k]].lch === nd ? '左(0)' : '右(1)'); }).join('→');
        F(L_CODE_ONE, '读树验证：从根出发 ' + readStr + '，得 ' + codeStr + ' ✓ 与回溯逆置的结果一致。',
          { code: codeStr }, snap({ hl: { path: path }, coding: snapCoding(coding) }));
      }
      var codeTable = HT.slice(1, n + 1).map(function (t) { return { ch: t.ch, code: codes[t.ch], w: t.weight }; });
      F(22, '编码完成！右侧为【编码表】（字符 → 编码，按 WPL 最优构造）。任一字符的编码都不是另一个的前缀（前缀编码）——因为字符只会出现在叶子上。后续译码将对照此表进行。',
        { WPL: String(wpl), 前缀编码: '叶子 → 无前缀冲突' }, snap({ doneCodes: true, codeTable: codeTable.map(function (x) { return { ch: x.ch, code: x.code }; }) }));
      var codeDoneAt = frames.length - 1;

      /* 译码演示 */
      var seq = [2, 1, 3, 4].filter(function (x) { return x <= n; });
      var sample = seq.map(function (x) { return codes[HT[x].ch]; }).join('');
      decodeBits = sample.split('');
      decode = { at: m, step: 0, out: [] };
      F(24, '译码演示：收到报文 ' + sample + '（由 ' + seq.map(function (x) { return HT[x].ch; }).join('') + ' 编码而来）。从根出发：0 向左、1 向右，到叶子就输出并回到根。',
        { 剩余报文: sample, 已译出: '（无）' }, snap({ hl: { root: m } }));
      decodeBits.forEach(function (b, bi) {
        decode.step = bi;
        var nxt = (b === '0') ? HT[decode.at].lch : HT[decode.at].rch;
        decode.at = nxt;
        F(L_DEC_BIT, '读入 ' + b + ' → 走' + (b === '0' ? '左' : '右') + '子树，p → HT[' + nxt + ']' + (HT[nxt].ch ? '（叶子 ' + HT[nxt].ch + '）' : '') + '。',
          { 剩余报文: sample.slice(bi + 1), 已译出: decode.out.join(' ') || '（无）' },
          snap({ hl: { c: nxt } }));
        if (!HT[nxt].lch && !HT[nxt].rch) {
          decode.out.push(HT[nxt].ch);
          decodeOut.push({ ch: HT[nxt].ch, w: HT[nxt].w });
          F(L_DEC_OUT, '到达叶子 ' + HT[nxt].ch + '(' + HT[nxt].w + ')，输出 ' + HT[nxt].ch + '，p 回到根，继续译码。',
            { 已译出: decode.out.join(' ') }, snap({ hl: { c: nxt }, emit: nxt }));
          decode.at = m;
        }
      });
      F(29, '译码完成：' + sample + ' → ' + decodeOut.map(function (o) { return o.ch; }).join('') + '。前缀编码保证译码结果唯一，无二义性。',
        { 报文: sample, 译出: decodeOut.map(function (o) { return o.ch; }).join('') },
        snap({ done: true }));

      /* 按阶段切分（默认完整流程） */
      var out;
      if (v.phase === 'build') out = frames.slice(0, treeDoneAt + 1);
      else if (v.phase === 'code') out = [frames[treeDoneAt]].concat(frames.slice(treeDoneAt + 1, codeDoneAt + 1));
      else if (v.phase === 'decode') out = [frames[codeDoneAt]].concat(frames.slice(codeDoneAt + 1));
      else out = frames;
      return { code: CODE, frames: out };
    },
    render: function (s) {
      var W = 1150, H = 620;
      var g = '';
      var hl = s.hl || {};
      if (!s.treeReady) {
        /* 构造阶段：森林视图——每轮选出两棵最小的树合并 */
        var roots = [];
        for (var ri = 1; ri <= s.maxIdx; ri++) if (s.ht[ri] && s.ht[ri].parent === 0) roots.push(ri);
        g += h.txt(430, 40, '森林（parent 为 0 的树根）——每轮选权值最小的两棵合并', { size: 18, w: 600 });
        var fgap = Math.min(110, 620 / Math.max(roots.length, 1));
        var fx0 = 430 - (roots.length - 1) * fgap / 2;
        roots.forEach(function (id, k) {
          var t = s.ht[id];
          var x = fx0 + k * fgap, y = 250;
          var isSel = hl.s1 === id || hl.s2 === id;
          var isNew = hl.new === id;
          var leaf = !!t.ch;
          g += h.circle(x, y, 30, { fill: isNew ? C.greenBg : (isSel ? C.amberBg : (leaf ? C.blueBg : '#fff')), stroke: isNew ? C.green : (isSel ? C.amber : (leaf ? C.blue : C.grey)), sw: isSel || isNew ? 3 : 2 });
          g += h.txt(x, y + (leaf ? 4 : 6), leaf ? t.ch : t.w, { size: leaf ? 17 : 14, w: 700, fill: leaf ? C.blue : C.ink });
          g += h.txt(x, y + 52, (t.ch ? '权' + t.w : '第' + id + '号'), { size: 11.5, fill: C.muted });
          if (isSel) g += h.txt(x, y - 42, '选中', { size: 12, fill: C.amber, w: 600 });
          if (isNew) g += h.txt(x, y - 42, '新合并的根', { size: 12, fill: C.green, w: 600 });
        });
        if (hl.s1 != null && hl.s2 != null && hl.new == null) {
          g += h.txt(430, 340, '→ 将 ' + (s.ht[hl.s1].ch ? s.ht[hl.s1].ch : 'HT[' + hl.s1 + ']') + '（权' + s.ht[hl.s1].w + '）与 ' + (s.ht[hl.s2].ch ? s.ht[hl.s2].ch : 'HT[' + hl.s2 + ']') + '（权' + s.ht[hl.s2].w + '）合并，新根权 = ' + (s.ht[hl.s1].w + s.ht[hl.s2].w), { size: 14.5, fill: C.amber, w: 600 });
        }
      } else {
        g += h.txt(430, 34, s.decodeBits ? '译码：p 从根出发，0 向左 / 1 向右，到叶子输出并回到根'
          : (s.coding ? '编码：编码 = 根到叶路径上的 0/1（左 0 右 1）；教材算法从叶子向根回溯收集，最后逆置'
            : '哈夫曼树（左 0 右 1）'), { size: 19, w: 600, fill: (s.decodeBits || s.coding) ? C.blue : C.ink });
        drawTree();
      }
      function drawTree() {
        // 边 + 0/1 标注
        for (var id = 1; id <= s.m; id++) {
        var t = s.ht[id]; if (!t || !s.coords[id]) continue;
        [t.lch, t.rch].forEach(function (ch2, idx2) {
          if (!ch2) return;
          var A = s.coords[id], B = s.coords[ch2];
          var onPath = hl.path && hl.path.indexOf(id) >= 0 && hl.path.indexOf(ch2) === hl.path.indexOf(id) + 1;
          var isHl = hl.s1 === ch2 || hl.s2 === ch2 || hl.c === ch2 || onPath;
          g += h.line(A.x, A.y + 20, B.x, B.y - 20, { stroke: onPath ? C.amber : (isHl ? C.amber : (s.treeReady ? C.line : C.grey)), sw: onPath ? 4 : (isHl ? 3 : 2) });
          var mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
          var dx = B.x - A.x, dy = B.y - A.y, L = Math.sqrt(dx * dx + dy * dy) || 1;
          g += h.circle(mx - dy / L * 12, my + dx / L * 12 * (idx2 === 0 ? 1 : 1), 10, { fill: idx2 === 0 ? C.blueBg : '#fee2e2', stroke: idx2 === 0 ? C.blue : C.red, sw: 1 });
          g += h.txt(mx - dy / L * 12, my + dx / L * 12 + 4.5, idx2 === 0 ? '0' : '1', { size: 11.5, fill: idx2 === 0 ? C.blue : C.red, w: 700 });
        });
      }
      // 结点
      for (var id2 = 1; id2 <= s.m; id2++) {
        var t2 = s.ht[id2]; if (!t2 || !s.coords[id2]) continue;
        var P = s.coords[id2];
        var fill = '#fff', stroke = C.grey, sw = 1.5;
        if (P.leaf) { fill = C.blueBg; stroke = C.blue; }
        if (hl.s1 === id2 || hl.s2 === id2) { fill = C.amberBg; stroke = C.amber; sw = 3; }
        if (hl.new === id2) { fill = C.greenBg; stroke = C.green; sw = 3; }
        if (hl.root === id2) { stroke = C.green; sw = 3; }
        if (hl.c === id2) { fill = C.amberBg; stroke = C.amber; sw = 3.5; }
        if (hl.path && hl.path.indexOf(id2) >= 0) { stroke = C.amber; sw = 3; }
        g += h.circle(P.x, P.y, 21, { fill: fill, stroke: stroke, sw: sw });
        g += h.txt(P.x, P.y + (P.leaf ? 3 : 5), P.leaf ? t2.ch : t2.w, { size: P.leaf ? 16 : 13, w: 700, fill: P.leaf ? C.blue : C.ink });
        if (P.leaf) g += h.txt(P.x, P.y + 38, t2.w + (s.codes[t2.ch] ? '（码 ' + s.codes[t2.ch] + '）' : ''), { size: 12, fill: C.muted, w: 500 });
      }
      }
      // 右侧 HT 表
      /* 行数多时要压行高，保证表格下方的图例不会被挤到底部编码表那一栏上 */
      var tx = 830, tw = 300, rh = Math.min(26, Math.floor(392 / Math.max(s.m + 1, 1)));
      g += h.txt(tx + tw / 2, 52, 'HT 数组（1 起）', { size: 14, w: 600 });
      var cols = [['i', 30], ['ch', 40], ['w', 50], ['parent', 62], ['lch', 52], ['rch', 52]];
      var cx2 = tx;
      g += h.rect(tx, 62, tw, rh, { fill: '#0f2c5c', stroke: 'none' });
      cols.forEach(function (cc) { g += h.txt(cx2 + cc[1] / 2, 62 + rh - 8, cc[0], { size: 11.5, fill: '#fff' }); cx2 += cc[1]; });
      for (var r = 1; r <= s.m; r++) {
        var row = s.ht[r], y = 62 + r * rh;
        var rf = '#fff';
        if (hl.s1 === r || hl.s2 === r) rf = C.amberBg;
        if (hl.new === r) rf = C.greenBg;
        if (hl.c === r) rf = C.amberBg;
        g += h.rect(tx, y, tw, rh, { fill: rf, stroke: '#e2e8f0', sw: 0.75, rx: 0 });
        var vals = [r, row.ch || '—', row.w, row.parent, row.lch, row.rch];
        var cx3 = tx;
        cols.forEach(function (cc, k) { g += h.txt(cx3 + cc[1] / 2, y + rh - 8, vals[k], { size: Math.min(12, rh - 5), family: 'Consolas,monospace' }); cx3 += cc[1]; });
      }
      if (!s.decodeBits) g += h.txt(tx + tw / 2, 62 + (s.m + 1) * rh + 26, 's1=左(0) s2=右(1) ｜ 黄=本次选中 ｜ 绿=新结点', { size: 11.5, fill: C.muted });
      // 编码收集器：按收集顺序（叶→根）显示已收到的位；结束后给出逆置结果
      if (s.coding && !s.decodeBits) {
        var cy3 = 578;
        g += h.txt(40, cy3 + 20, '收集器（叶→根顺序）', { size: 13.5, fill: C.muted, anchor: 'start', w: 600 });
        if (s.coding.collected.length) {
          s.coding.collected.forEach(function (b, bi) {
            g += h.rect(195 + bi * 40, cy3, 34, 30, { fill: '#fff', stroke: C.blue, rx: 6, sw: 1.5 });
            g += h.txt(212 + bi * 40, cy3 + 21, b, { size: 15, w: 700, fill: C.blue });
          });
          g += h.txt(195 + s.coding.collected.length * 40 + 6, cy3 + 20, '←先收集到的是编码末位', { size: 11.5, fill: C.muted, anchor: 'start' });
        } else {
          g += h.txt(195, cy3 + 20, '（尚未收集）', { size: 12.5, fill: C.muted, anchor: 'start' });
        }
        if (s.coding.code) {
          var ax = 560;
          g += h.txt(ax, cy3 + 20, '──逆置──▶', { size: 13.5, fill: C.amber, w: 600, anchor: 'start' });
          s.coding.code.split('').forEach(function (b2, k4) {
            g += h.rect(ax + 92 + k4 * 34, cy3, 30, 30, { fill: C.greenBg, stroke: C.green, rx: 6, sw: 1.5 });
            g += h.txt(ax + 107 + k4 * 34, cy3 + 21, b2, { size: 15, w: 700, fill: C.green });
          });
          g += h.txt(ax + 100 + s.coding.code.length * 34, cy3 + 20, '（' + s.coding.leaf + ' 的最终编码）', { size: 11.5, fill: C.green, anchor: 'start' });
        }
        g += h.txt(W - 40, cy3 + 20, '正在求：' + s.coding.leaf + '(' + s.coding.leafW + ')', { size: 13.5, fill: C.blue, w: 600, anchor: 'end' });
      }
      // 译码进度条：报文逐位消费 + 译出字符
      if (s.decodeBits && s.decode) {
        var dy = 578;
        g += h.txt(40, dy + 20, '报文', { size: 14, fill: C.muted, anchor: 'start', w: 600 });
        s.decodeBits.forEach(function (b, bi) {
          var bx = 100 + bi * 30;
          var st = bi < s.decode.step ? 'done' : bi === s.decode.step ? 'cur' : 'todo';
          g += h.rect(bx, dy, 26, 30, { fill: st === 'cur' ? C.amberBg : (st === 'done' ? C.greyBg : '#fff'), stroke: st === 'cur' ? C.amber : C.grey, rx: 6, sw: st === 'cur' ? 2.5 : 1.2 });
          g += h.txt(bx + 13, dy + 21, b, { size: 13, w: 700, fill: st === 'done' ? C.muted : C.ink });
        });
        var ox = 110 + s.decodeBits.length * 30;
        g += h.txt(ox, dy + 20, '→ 译出', { size: 14, fill: C.muted, anchor: 'start' });
        (s.decode.out || []).forEach(function (ch2, k3) {
          g += h.rect(ox + 60 + k3 * 38, dy, 34, 30, { fill: C.greenBg, stroke: C.green, rx: 6 });
          g += h.txt(ox + 77 + k3 * 38, dy + 21, ch2, { size: 15, w: 700, fill: C.green });
        });
        if (!(s.decode.out || []).length) g += h.txt(ox + 64, dy + 20, '（暂无，读到叶子才输出）', { size: 12.5, fill: C.muted, anchor: 'start' });
        var atN = s.ht[s.decode.at];
        g += h.txt(W - 40, dy + 20, 'p → ' + (atN.ch ? '叶子 ' + atN.ch + '(' + atN.w + ')' : 'HT[' + s.decode.at + '] 权' + atN.w), { size: 13, fill: C.blue, w: 600, anchor: 'end' });
      }
      if (s.codeTable && s.codeTable.length) {
        var tw = Math.min(150, Math.floor((W - 80) / s.codeTable.length)), tx0 = W - 20 - s.codeTable.length * tw, ty0 = H - 96;
        g += h.txt(tx0 - 10, ty0 - 26, '编码表', { size: 13.5, w: 700, anchor: 'start', fill: C.ink });
        s.codeTable.forEach(function (ct, k) {
          var x = tx0 + k * tw;
          g += h.rect(x, ty0 - 20, tw - 12, 64, { fill: '#fff', stroke: C.blue, sw: 1.4, rx: 6 });
          g += h.txt(x + (tw - 12) / 2, ty0 + 2, ct.ch, { size: 13, w: 700, fill: C.blue });
          g += h.txt(x + (tw - 12) / 2, ty0 + 30, ct.code, { size: 16, w: 700, fill: C.ink, family: 'Consolas,monospace' });
        });
      }
      return h.svg(W, H, g);
    }
  });
})();
