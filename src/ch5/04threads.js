/* 动画：中序线索二叉树——利用 n+1 个空链域存前驱/后继线索（ltag/rtag），并可沿线索遍历（不用栈） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'void InThreading(BiThrTree p, BiThrTree &pre) {',
    '    if (p) {',
    '        InThreading(p->lchild, pre);        // 先线索化左子树',
    '        if (!p->lchild) {                   // 左孩子为空',
    '            p->ltag = 1;  p->lchild = pre;  //   建前驱线索',
    '        } else p->ltag = 0;',
    '        if (pre && !pre->rchild) {          // 前驱无右孩子',
    '            pre->rtag = 1;  pre->rchild = p;//   回填后继线索',
    '        } else if (pre) pre->rtag = 0;',
    '        pre = p;                            // 当前结点成为下一个的前驱',
    '        InThreading(p->rchild, pre);        // 再线索化右子树',
    '    }',
    '}'
  ];

  function parse(str) {
    var toks = (str || '').replace(/\s+/g, '').split('');
    if (!toks.length) throw new Error('请输入先序序列（# 表示空），如 GDA##FE###MH##Z##');
    var pos = 0, nid = 0;
    function build() {
      if (pos >= toks.length) throw new Error('序列不完整：# 数量不足以构成一棵树');
      var t = toks[pos++];
      if (t === '#') return null;
      if (!/^[A-Za-z0-9]$/.test(t)) throw new Error('只能输入字母/数字或 #（"' + t + '" 不合法）');
      var nd = { id: 'x' + (nid++), ch: t, l: null, r: null, ltag: 0, rtag: 0, lchild: null, rchild: null };
      nd.l = build();
      nd.r = build();
      return nd;
    }
    var root = build();
    if (pos < toks.length) throw new Error('序列有多余字符：' + toks.slice(pos).join(''));
    return root;
  }

  DSC.reg({
    id: 'threads', ch: 5, name: '中序线索二叉树',
    aim: '把空链域挂上前驱后继——**线索二叉树不用栈也能走中序**',
    note: '教材 5.5 遍历二叉树与线索二叉树',
    keywords: '线索二叉树 中序线索 前驱 后继 ltag rtag 空链域 找前驱 找后继 遍历效率 线索化',
    guide: [
      '普通二叉链表有 n+1 个空链域——正好用来存放"前驱/后继"线索',
      '规则：无左孩子 → 左链存前驱（ltag=1）；无右孩子 → 右链存后继（rtag=1）',
      '沿线索遍历：rtag=1 时后继就是右链；否则走到右子树的最左结点——全程不用栈',
      '切换"② 沿线索遍历"看线索的实际用法；输入框可换自己的树'
    ],
    inputs: [
      {
        key: 'phase', label: '阶段', type: 'select', options: [
          ['all', '完整流程（建立线索 → 沿线索遍历）'],
          ['build', '① 建立中序线索'],
          ['walk', '② 沿线索遍历（不用栈）']
        ], value: 'all'
      },
      { key: 'data', label: '二叉树（先序序列，#为空）', type: 'text', value: 'GDA##FE###MH##Z##' }
    ],
    run: function (v) {
      var root = parse(v.data);
      /* 布局：x 按中序序号，y 按深度（自适应） */
      var total = 0, maxD = 0;
      (function cnt(nd, d) { if (!nd) return; total++; if (d > maxD) maxD = d; cnt(nd.l, d + 1); cnt(nd.r, d + 1); })(root, 0);
      var dx = Math.min(112, Math.max(48, 900 / Math.max(total, 1)));
      var dy = Math.min(88, Math.max(40, 330 / Math.max(maxD, 1)));
      var idx = 0, all = [];
      (function place(nd, d) {
        if (!nd) return;
        place(nd.l, d + 1);
        nd.x = 80 + idx++ * dx; nd.y = 92 + d * dy; nd.depth = d;
        all.push(nd);
        place(nd.r, d + 1);
      })(root, 0);

      /* 中序线索化（教材算法：按中序回溯，pre 记录刚访问的结点） */
      var ino = [];
      (function w(nd) { if (!nd) return; w(nd.l); ino.push(nd); w(nd.r); })(root);
      var frames = [];
      if (!root) {
        frames.push({ line: [0], msg: '树为空（输入 "#"）：中序线索化结束，无结点可线索化。换成非空树（如 GDA##FE###MH##Z##）再试。', panel: { 结果: '空树' }, snap: { nodes: [], links: [], seq: [], cur: null, done: true } });
        return { code: CODE, frames: frames };
      }
      function snap(o) {
        o = o || {};
        o.nodes = all.map(function (n) {
          return { id: n.id, ch: n.ch, x: n.x, y: n.y, ltag: n.ltag, rtag: n.rtag,
            l: n.l ? n.l.id : null, r: n.r ? n.r.id : null,
            lt: n.lt ? n.lt.id : null, rt: n.rt ? n.rt.id : null };
        });
        o.cur = o.cur == null ? null : o.cur; o.pre = o.pre == null ? null : o.pre;
        o.walkCur = o.walkCur == null ? null : o.walkCur; o.walkNote = o.walkNote || null;
        o.seq = ino.map(function (n) { return n.ch; }); o.done = !!o.done; o.total = total;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }

      F([0, 1], '一棵 n 个结点的二叉链表共有 n+1 = ' + (total + 1) + ' 个空指针域。中序线索化：把它们利用起来——无左孩子 → 左链存【前驱】（ltag=1）；无右孩子 → 右链存【后继】（rtag=1）。按中序序列逐结点处理。',
        { 结点数: String(total), 空链域: (total + 1) + ' 个', 已线索化: '0 个' }, snap({}));

      var pre = null;
      ino.forEach(function (p, k) {
        var notes = [];
        var curBefore = pre ? pre.ch : null;
        if (!p.l) {
          p.ltag = 1; p.lt = pre;
          notes.push(p.ch + ' 无左孩子 → 建立前驱线索：' + (pre ? '指向 ' + pre.ch : '无前驱（中序第一个），置空'));
        } else { p.ltag = 0; notes.push(p.ch + ' 有左孩子 → 保持孩子指针（ltag=0）'); }
        var backfill = null;
        if (pre && !pre.r) {
          pre.rtag = 1; pre.rt = p;
          backfill = pre;
          notes.push('同时回填：' + pre.ch + ' 无右孩子 → 建立后继线索指向 ' + p.ch);
        } else if (pre) { pre.rtag = 0; }
        pre = p;
        F([2, 3, 4, 5, 6, 7, 8], '中序第 ' + (k + 1) + ' 位 ' + p.ch + '：' + notes.join('；') + '。',
          { 已线索化: (k + 1) + ' / ' + total, 中序序列: ino.map(function (n) { return n.ch; }).join(' ') },
          snap({ cur: p.id, pre: backfill ? backfill.id : (pre ? pre.id : null) }));
      });
      var lastN = ino[ino.length - 1];
      if (!lastN.r) lastN.rtag = 1;   // 中序最后一个结点：无后继，右线索置空
      var threadCount = all.reduce(function (sum, n) {
        return sum + (n.ltag === 1 && n.lt ? 1 : 0) + (n.rtag === 1 && n.rt ? 1 : 0);
      }, 0);

      F([9], '线索化完成！实线 = 孩子指针，虚线箭头 = 线索（琥珀=前驱，绿=后继）。之后的中序遍历可以【不用栈】：rtag=1 时后继就是右链；否则走到右子树的最左结点。',
        { 中序序列: ino.map(function (n) { return n.ch; }).join(' '), 线索数: threadCount + ' 条' },
        snap({ done: true }));

      /* 沿线索遍历 */
      var walkSeq = [];
      var cur = ino[0];
      var guard = 0;
      F(9, '沿线索遍历：从【中序第一个结点】（最左结点 ' + cur.ch + '）出发。', { 沿线索序列: walkSeq.join(' ') || '（空）' }, snap({ walkCur: cur.id }));
      while (cur && guard++ < total + 2) {
        walkSeq.push(cur.ch);
        var nxt = null, why;
        if (cur.rtag === 1) {
          nxt = cur.rt;
          why = nxt ? cur.ch + ' 的右链就是后继线索 → 直接走到 ' + nxt.ch : cur.ch + ' 是中序最后一个结点（后继为空），遍历结束';
        } else {
          var m2 = cur.r; while (m2 && m2.ltag === 0 && m2.l) m2 = m2.l; nxt = m2;
          why = cur.ch + ' 有右孩子 → 后继 = 右子树中最左的结点 ' + nxt.ch;
        }
        if (!nxt) { F(9, why, { 沿线索序列: walkSeq.join(' ') }, snap({ walkCur: cur.id, done: true })); break; }
        F(9, why + '。', { 沿线索序列: walkSeq.join(' ') }, snap({ walkCur: nxt.id }));
        cur = nxt;
      }
      F([9], '沿线索遍历完成：' + walkSeq.join(' ') + '——与递归中序结果一致，但空间 O(1)（不设栈/队列）。',
        { 沿线索序列: walkSeq.join(' ') }, snap({ walkCur: cur ? cur.id : null, done: true, walkDone: true }));

      var out;
      if (v.phase === 'build') out = frames.slice(0, 2 + total);
      else if (v.phase === 'walk') out = frames.slice(1 + total);
      else out = frames;
      return { code: CODE, frames: out };
    },
    render: function (s) {
      var W = 1150, H = 560;
      var g = '';
      g += h.txt(430, 34, s.walkCur != null || s.walkDone ? '沿线索遍历（不借助栈）' : '中序线索化（虚线 = 线索）', { size: 19, w: 600 });
      var byId = {}; s.nodes.forEach(function (n) { byId[n.id] = n; });
      // 孩子边（实线）
      s.nodes.forEach(function (n) {
        ['l', 'r'].forEach(function (side) {
          var t = n[side];
          if (n[side + 'tag'] === 0 && t && byId[t]) {
            var A = byId[n.id], B = byId[t];
            g += h.line(A.x, A.y + 20, B.x, B.y - 20, { stroke: C.blue, sw: 2 });
          }
        });
      });
      // 线索边（虚线箭头，跨子树画弧）
      s.nodes.forEach(function (n) {
        [['lt', 'ltag', -46], ['rt', 'rtag', 46]].forEach(function (pr) {
          var t = n[pr[0]];
          if (n[pr[1]] === 1 && t && byId[t]) {
            var A = byId[n.id], B = byId[t];
            var col = pr[0] === 'lt' ? C.amber : C.green;
            var bend = pr[2];
            var mx = (A.x + B.x) / 2 + bend, my = (A.y + B.y) / 2 - 18;
            var a = Math.atan2(B.y - 20 - my, B.x - mx);
            var bx = B.x - 22 * Math.cos(a), by2 = B.y - 20 - 22 * Math.sin(a);
            g += '<path d="M' + A.x + ',' + (A.y - 14) + ' Q' + mx + ',' + my + ' ' + bx + ',' + by2 + '" fill="none" stroke="' + col + '" stroke-width="1.8" stroke-dasharray="5,4"/>' +
              '<polygon points="' + bx + ',' + by2 + ' ' + (bx - 7 * Math.sin(a)) + ',' + (by2 - 7 * Math.cos(a)) + ' ' + (bx + 7 * Math.sin(a)) + ',' + (by2 + 7 * Math.cos(a)) + '" fill="' + col + '"/>';
          }
        });
      });
      // 结点 + tag
      s.nodes.forEach(function (n) {
        var fill = '#fff', stroke = C.grey, sw = 2;
        if (s.cur === n.id) { fill = C.amberBg; stroke = C.amber; sw = 4; }
        if (s.walkCur === n.id) { fill = C.blueBg; stroke = C.blue; sw = 4; }
        g += h.circle(n.x, n.y, 22, { fill: fill, stroke: stroke, sw: sw });
        g += h.txt(n.x, n.y + 7, n.ch, { size: 17, w: 700 });
        g += h.txt(n.x - 30, n.y - 14, 'L' + n.ltag, { size: 10.5, fill: n.ltag === 1 ? C.amber : C.muted, w: n.ltag === 1 ? 700 : 400 });
        g += h.txt(n.x + 30, n.y - 14, 'R' + n.rtag, { size: 10.5, fill: n.rtag === 1 ? C.green : C.muted, w: n.rtag === 1 ? 700 : 400, anchor: 'start' });
        g += h.txt(n.x - 30, n.y + 36, n.ltag === 1 ? (n.lt ? '前驱:' + byId[n.lt].ch : '前驱:空') : '', { size: 10, fill: C.amber, anchor: 'start' });
        g += h.txt(n.x + 30, n.y + 36, n.rtag === 1 ? (n.rt ? '后继:' + byId[n.rt].ch : '后继:空') : '', { size: 10, fill: C.green, anchor: 'start' });
      });
      // 中序序列条
      var oy = 500;
      g += h.line(30, oy - 14, 700, oy - 14, { stroke: C.line, sw: 1 });
      g += h.txt(40, oy + 10, '中序序列（线索应按此顺序互指）', { size: 13, fill: C.muted, anchor: 'start', w: 600 });
      s.seq.forEach(function (ch, k2) {
        var isCur = s.walkCur && s.nodes.some(function (n) { return n.id === s.walkCur && n.ch === ch; });
        g += h.rect(280 + k2 * 50, oy, 44, 38, { fill: isCur ? C.blueBg : C.greyBg, stroke: isCur ? C.blue : C.line, rx: 7 });
        g += h.txt(302 + k2 * 50, oy + 25, ch, { size: 16, w: 700, fill: isCur ? C.blue : C.ink });
      });
      // 说明
      g += h.txt(sx2(880), 60, '图例', { size: 13, fill: C.muted, w: 600 });
      g += h.line(880, 84, 940, 84, { stroke: C.blue, sw: 2 });
      g += h.txt(950, 88, '孩子指针', { size: 12, fill: C.muted, anchor: 'start' });
      g += h.line(880, 112, 940, 112, { stroke: C.amber, sw: 1.8, dash: '5,4' });
      g += h.txt(950, 116, '前驱线索（ltag=1）', { size: 12, fill: C.muted, anchor: 'start' });
      g += h.line(880, 140, 940, 140, { stroke: C.green, sw: 1.8, dash: '5,4' });
      g += h.txt(950, 144, '后继线索（rtag=1）', { size: 12, fill: C.muted, anchor: 'start' });
      if (s.walkNote) g += h.txt(880, 180, s.walkNote, { size: 12, fill: C.blue, anchor: 'start' });
      return h.svg(W, H, g);

      function sx2(x) { return x; }
    }
  });
})();
