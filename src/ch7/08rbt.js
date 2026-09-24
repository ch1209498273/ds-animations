/* 动画：红黑树——插入与自平衡（408 大纲 六(五)3）。采用左倾红黑树写法，性质与一般红黑树完全一致 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '/* 红黑树：每个结点染一种颜色，且满足五条性质',
    '   ① 结点是红的或黑的      ② 根是黑的',
    '   ③ 每个空叶(NIL)是黑的   ④ 红结点的两个孩子都是黑的（无连续红）',
    '   ⑤ 任一点到其所有子孙叶，黑结点个数相同（黑高相等）',
    '   ⇒ 最长路径 ≤ 2×最短路径，所以查找 O(log n) */',
    '',
    '/* 左倾红黑树（LLRB）：把"红黑树的插入调整"收敛成三个动作 */',
    'Node put(Node t, int x) {',
    '    if (t == NULL) return red(x);         // 新链接一律先染红',
    '    if (x < t.v) t.l = put(t.l, x);',
    '    else if (x > t.v) t.r = put(t.r, x);',
    '    else t.v = x;',
    '    t = fixUp(t);',
    '    return t;',
    '}',
    'Node fixUp(Node t) {                      // 回溯时对每个结点做三件事',
    '    if (red(t.r) && !red(t.l))      t = rotateL(t);   // ① 红链右倾 → 左旋掰向左',
    '    if (red(t.l) && red(t.l.l))     t = rotateR(t);   // ② 连续左红 → 右旋把中间提上去',
    '    if (red(t.l) && red(t.r))       flip(t);          // ③ 两孩子都红 → 变色，红点上移',
    '    return t;',
    '}',
    'void flip(Node t) { t.color = R; t.l.color = B; t.r.color = B; }  // 红点上移一层',
    'Node rotateL(Node t) { n = t.r; t.r = n.l; n.l = t; n.color = t.color; t.color = R; return n; }',
    'Node rotateR(Node t) { n = t.l; t.l = n.r; n.r = t; n.color = t.color; t.color = R; return n; }',
    '/* 收尾：root = put(root, x); root.color = BLACK;  —— 性质②靠这一步兜住 */'
  ];

  function isRed(t) { return !!t && t.c === 'R'; }
  function clone(t) { return t ? { v: t.v, c: t.c, l: clone(t.l), r: clone(t.r) } : null; }
  function insert(root, x) {
    var acts = [];
    function rotL(t) { var n = t.r; t.r = n.l; n.l = t; n.c = t.c; t.c = 'R'; return n; }
    function rotR(t) { var n = t.l; t.l = n.r; n.r = t; n.c = t.c; t.c = 'R'; return n; }
    function fixUp(t) {
      if (isRed(t.r) && !isRed(t.l)) { t = rotL(t); acts.push({ k: 'rotL', v: t.v }); }
      if (isRed(t.l) && isRed(t.l.l)) { t = rotR(t); acts.push({ k: 'rotR', v: t.v }); }
      if (isRed(t.l) && isRed(t.r)) { t.c = 'R'; t.l.c = 'B'; t.r.c = 'B'; acts.push({ k: 'flip', v: t.v }); }
      return t;
    }
    function put(t) {
      if (!t) return { v: x, c: 'R', l: null, r: null };
      if (x < t.v) t.l = put(t.l);
      else if (x > t.v) t.r = put(t.r);
      else t.v = x;
      return fixUp(t);
    }
    var t = root ? clone(root) : null;
    var out = put(t);
    out.c = 'B';
    return { root: out, acts: acts };
  }
  /* 五条性质校验（③④是重点） */
  function checkRB(root) {
    var bad = [];
    if (root && root.c !== 'B') bad.push('根不是黑');
    function noRedRed(t) {
      if (!t) return;
      if (t.c === 'R' && (isRed(t.l) || isRed(t.r))) bad.push('红结点 ' + t.v + ' 有红孩子');
      noRedRed(t.l); noRedRed(t.r);
    }
    function blackDepth(t, d, acc) {
      if (!t) { acc.push(d); return; }
      blackDepth(t.l, d + (t.c === 'B' ? 1 : 0), acc);
      blackDepth(t.r, d + (t.c === 'B' ? 1 : 0), acc);
    }
    noRedRed(root);
    var acc = []; blackDepth(root, 0, acc);
    if (new Set(acc).size > 1) bad.push('黑高不等：' + acc.join(','));
    return bad;
  }
  function layout(root) {
    var pos = {}, ino = 0;
    (function walk(t, d) {
      if (!t) return;
      walk(t.l, d + 1);
      pos[t.v] = { x: ino, d: d }; ino++;
      walk(t.r, d + 1);
    })(root, 0);
    return { pos: pos, count: ino };
  }

  DSC.reg({
    id: 'rbt', ch: 7, name: '红黑树：插入与五条性质的维持',
    aim: '红黑树用**五条性质**换"近似平衡"：最长路径不超过最短的两倍，插入最多三次旋转',
    note: '408 大纲 六(五)3 红黑树（五性质、插入后变色与旋转、黑高相等 ⇒ 最长 ≤ 2×最短）',
    keywords: '红黑树 五条性质 自平衡 变色 旋转 黑高 最长路径 根到叶子 2-3树 结点数 高度',
    guide: [
      'AVL 要求左右子树高度差 ≤ 1，**每次都精确平衡**，插入删除旋转频繁；红黑树只要求"大致平衡"，用颜色换旋转次数——查找仍是 O(log n)',
      '五条性质里真正起作用的是两条：**④ 红结点的孩子必须都是黑**、**⑤ 任一结点到子孙叶的黑结点个数相同**。有这两条就能推出最长路径不超过最短的两倍',
      '本动画用**左倾红黑树**写法：性质与普通红黑树完全一致，但插入后的调整收敛成三个动作——右旋、左旋、变色（把红点上移一层），比四类情况好盯',
      '每插完一个结点，动画都会把五条性质**逐条重算一遍**并在面板上给出结果。哪一步破坏了④或⑤，就在下一步被修掉'
    ],
    inputs: [
      { key: 'seq', label: '插入序列（3~12 个整数）', type: 'text', value: '10,85,40,5,70,80,60,30,20,90' },
      { key: 'find', label: '最后查找的值', type: 'number', value: 60, min: -9999, max: 9999 }
    ],

    run: function (v) {
      var seq = String(v.seq).split(/[,，\s]+/).filter(Boolean).map(Number);
      if (seq.some(isNaN)) throw Error('插入序列必须是整数');
      if (seq.length < 3 || seq.length > 12) throw Error('请输入 3~12 个整数');
      var frames = [], root = null, step = 0;
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          root: clone(root), mark: null, path: [], props: checkRB(root), n: step, done: false
        }, snap || {}) });
      }
      F([0, 1, 2, 3, 4, 5], '空树开始。红黑树是一棵二叉排序树 + 一套颜色约束，' +
        '插入过程中靠**变色**和**旋转**维持那五条性质。', { 结点数: '0 个' }, {});
      seq.forEach(function (x) {
        var res = insert(root, x);
        root = res.root; step++;
        var acts = res.acts;
        F([8, 9, 10, 11], '插入 ' + x + '：先按 BST 走到底，**新链接一律染红**（红链接代表"这一步还没定黑高"）。',
          { 结点数: step + ' 个', 动作: '染红插入 ' + x }, { mark: { v: x }, props: checkRB(root) });
        if (acts.length) {
          F([14, 15, 16, 17], '回溯途中在 ' + acts.map(function (a) { return a.v; }).join('、') + ' 上触发了 ' + acts.length + ' 次调整：' +
            acts.map(function (a, i) {
              return (i + 1) + '. ' + ({ rotL: '红链右倾 → **左旋**', rotR: '连续左红 → **右旋**', flip: '两孩子都红 → **变色**（红点上移一层）' })[a.k] +
                '（作用在 ' + a.v + '）';
            }).join('；') + '。',
            { 结点数: step + ' 个', 调整: acts.map(function (a) { return { rotR: '右旋', rotL: '左旋', flip: '变色' }[a.k]; }).join(' → ') },
            { mark: { v: x, adj: true }, props: checkRB(root) });
        }
        F([17], '收尾把根染黑（性质②）。此刻五条性质重新全部成立：' +
          (checkRB(root).length === 0 ? '无红红相邻 ✓、各路径黑高相同 ✓、根黑 ✓。' : '✗ ' + checkRB(root).join('；')),
          { 结点数: step + ' 个', 性质: checkRB(root).length ? '被破坏' : '全部成立',
            黑高: (function () { var a = []; (function bd(t, d) { if (!t) { a.push(d); return; } var e = d + (t.c === 'B' ? 1 : 0); bd(t.l, e); bd(t.r, e); })(root, 0); return new Set(a).size + ' 种取值(' + a.join(',') + ')'; })() },
          { mark: null, props: checkRB(root) });
      });
      /* 查找 */
      var f = +v.find, cur = root, path = [], cmp = 0, hit = null;
      while (cur) {
        cmp++; path.push(cur.v);
        if (f === cur.v) { hit = cur; break; }
        cur = f < cur.v ? cur.l : cur.r;
      }
      F([6], '★ 最后查 ' + f + '：沿 ' + path.join(' → ') + (hit ? ' 命中' : ' 走到空，未找到') +
        '，比较 ' + cmp + ' 次。树高 ' + (function th(t) { return t ? 1 + Math.max(th(t.l), th(t.r)) : 0; })(root) +
        '，而 log₂' + step + ' = ' + (Math.log2(step)).toFixed(1) + '——红黑树保证树高不超过 2log₂(n+1)。',
        { 结点数: step + ' 个', 查找: f + ' ' + (hit ? '命中' : '未找到'), 比较次数: cmp + ' 次',
          树高: (function th(t) { return t ? 1 + Math.max(th(t.l), th(t.r)) : 0; })(root) + '' },
        { path: path.slice(), mark: hit ? { v: f } : null, done: true });
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 520, g = '';
      var L = layout(s.root), pos = L.pos, cnt = Math.max(L.count, 1);
      g += h.txt(W / 2, 28, '红黑树 · 黑结点实心底、红结点空心，右侧实时校验五条性质', { size: 17, w: 600 });
      g += h.txt(30, 50, '图例：● 黑结点 ○ 红结点 蓝环=本次插入/查找 橙环=刚调整过 灰线=查找路径',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      var x0 = 60, dx = (W - 420) / Math.max(cnt - 1, 1), y0 = 92, dy = 56;
      function px(v) { return x0 + pos[v].x * dx; }
      function py(v) { return y0 + pos[v].d * dy; }
      (function edges(t) {
        if (!t) return;
        [[t.l, 'l'], [t.r, 'r']].forEach(function (pr) {
          if (!pr[0]) return;
          var on = s.path.indexOf(t.v) >= 0 && s.path.indexOf(pr[0].v) >= 0;
          g += h.line(px(t.v), py(t.v) + 15, px(pr[0].v), py(pr[0].v) - 15,
            { stroke: on ? C.amber : pr[1] === 'l' && isRed(pr[0]) ? '#f0a8a8' : C.grey, sw: on ? 2.6 : 1.5 });
          edges(pr[0]);
        });
      })(s.root);
      (function nodes(t) {
        if (!t) return;
        var mk = s.mark && s.mark.v === t.v, onPath = s.path.indexOf(t.v) >= 0;
        g += h.circle(px(t.v), py(t.v), 17, {
          fill: t.c === 'B' ? '#334155' : '#fff',
          stroke: mk ? (s.mark.adj ? C.amber : C.blue) : onPath ? C.amber : t.c === 'B' ? '#334155' : '#dc2626',
          sw: mk || onPath ? 3.2 : 1.8
        });
        g += h.txt(px(t.v), py(t.v) + 5, String(t.v), { size: 12.5, w: 700, fill: t.c === 'B' ? '#fff' : '#b91c1c' });
        nodes(t.l); nodes(t.r);
      })(s.root);
      /* 右侧性质面板 */
      var bx = W - 330, by = 84;
      var th = (function tt(t) { return t ? 1 + Math.max(tt(t.l), tt(t.r)) : 0; })(s.root);
      var bh = []; (function bd(t, d) { if (!t) { bh.push(d); return; } var e = d + (t.c === 'B' ? 1 : 0); bd(t.l, e); bd(t.r, e); })(s.root, 0);
      var uniq = new Set(bh);
      var rows = [
        ['① 结点非红即黑', '✓'],
        ['② 根是黑结点', s.root && s.root.c === 'B' ? '✓' : (s.root ? '✗' : '—')],
        ['④ 无红红相邻', s.props.some(function (x) { return /红红/.test(x); }) ? '✗' : '✓'],
        ['⑤ 黑高处处相等', uniq.size > 1 ? '✗ ' + bh.join(',') : '✓ = ' + (bh[0] || 0)],
        ['推论 树高 ≤ 2·log₂(n+1)', th + ' ≤ ' + (2 * Math.log2((s.n || 1) + 1)).toFixed(1)]
      ];
      g += h.rect(bx - 14, by - 26, 330, rows.length * 26 + 40, { fill: '#f8fafc', stroke: C.line, sw: 1, rx: 8 });
      g += h.txt(bx, by - 8, '性质校验（每帧重算）', { size: 12.5, w: 700, fill: C.muted, anchor: 'start' });
      rows.forEach(function (r, i) {
        g += h.txt(bx, by + 14 + i * 26, r[0], { size: 11.5, fill: C.ink, anchor: 'start' });
        g += h.txt(bx + 300, by + 14 + i * 26, r[1], { size: 11.5, w: 700, anchor: 'end', fill: /^✗/.test(r[1]) ? C.red : /^✓/.test(r[1]) ? C.green : C.muted });
      });
      var note = s.done
        ? '★ 红黑树用"颜色 + 两条硬性质"换到 O(log n) 查找，且插入删除的旋转次数远少于 AVL'
        : '新链接一律先染红；回溯时右旋 → 左旋 → 变色三步把性质修回来，最后把根染黑';
      g += h.txt(W / 2, H - 18, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
