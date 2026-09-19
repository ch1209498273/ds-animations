/* 动画：树 ↔ 二叉树转换（孩子兄弟表示法）——教材 5.6，加线/抹线/旋转三步 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    '// 树 → 二叉树（左孩子右兄弟）：',
    '// ① 加线：所有相邻兄弟结点之间加一条线',
    '// ② 抹线：只保留第一个孩子（左孩子），抹掉其余孩子连线',
    '// ③ 旋转：以根为轴顺时针转 45°，层次分明 → 二叉树',
    '// 二叉树 → 树：反操作（把右链视为兄弟）',
    ' typedef struct CSNode {',
    '     ElemType data;',
    '     struct CSNode *firstchild, *nextsibling;   // 左=第一个孩子，右=下一个兄弟',
    ' } CSNode;'
  ];

  /* 教材例树：A(B,E,F ; C,G ; D,H) 用 (根:孩子列表) 描述 */
  var TREE = { v: 'A', kids: [
    { v: 'B', kids: [{ v: 'E', kids: [] }, { v: 'F', kids: [] }] },
    { v: 'C', kids: [{ v: 'G', kids: [] }] },
    { v: 'D', kids: [{ v: 'H', kids: [] }] }
  ] };

  function toBinary(t) {   // 孩子兄弟转换
    function conv(node) {
      if (!node) return null;
      var b = { v: node.v, l: null, r: null };
      var kids = node.kids;
      if (kids && kids.length) {
        b.l = conv(kids[0]);
        var p = b.l;
        for (var i = 1; i < kids.length; i++) { p.r = conv(kids[i]); p = p.r; }
      }
      return b;
    }
    return conv(t);
  }
  function preorder(b, out) { if (!b) return; out.push(b.v); preorder(b.l, out); preorder(b.r, out); }
  function inorder(b, out) { if (!b) return; inorder(b.l, out); out.push(b.v); inorder(b.r, out); }
  function cloneT(n) { return n ? { v: n.v, l: cloneT(n.l), r: cloneT(n.r) } : null; }

  DSC.reg({
    id: 'treeConvert', ch: 5, name: '树 / 森林与二叉树转换',
    note: '教材 5.6 树与森林（孩子兄弟表示、左孩子右兄弟）',
    guide: [
      '树用"二叉链表"就能存：**左指针=第一个孩子，右指针=下一个兄弟**（孩子兄弟表示法）',
      '转换三步：① 兄弟之间加线 ② 只留与第一个孩子的线，其余抹掉 ③ 整体顺时针转 45°',
      '右侧演示结果：A 的左孩子是 B（第一个孩子），B 的右链 B→C→D 恰是 A 的三个兄弟孩子',
      '性质：树的**先根遍历** = 对应二叉树的先序遍历；树的**后根遍历** = 对应二叉树的中序遍历（左下面板可验）'
    ],
    inputs: [],
    run: function (v) {
      var frames = [], bin = toBinary(TREE);
      var pre = [], ino = [];
      preorder(bin, pre); inorder(bin, ino);
      function F(line, msg, mk) {
        frames.push({ line: [line], msg: msg, panel: { 二叉树先序: pre.join(' '), 二叉树中序: ino.join(' ') }, snap: { step: line, mark: mk || null } });
      }
      var msgs = [
        '原树 T：A 有 3 个孩子 B、C、D；B 有 E、F；C 有 G；D 有 H。下一步：兄弟间加线。',
        '① 加线：在所有相邻兄弟间加线 → B—C—D、E—F（蓝色）。',
        '② 抹线：每个结点只保留与**第一个**孩子的连线（A—B、B—E、C—G、D—H），抹掉 A—C、A—D、B—F（红色虚线）。',
        '③ 旋转 45°：横着的兄弟线变成右指针，竖着的孩子线变成左指针——一棵二叉树！左链=第一个孩子，右链=兄弟。',
        '验证：二叉树先序 ' + pre.join(' ') + ' == 树的先根遍历；二叉树中序 ' + ino.join(' ') + ' == 树的后根遍历。森林 = 每棵树转二叉树后，把根用右链串起来。'
      ];
      msgs.forEach(function (msg, s) {
        F(s, msg, s === 4 ? 'final' : null);
      });
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 520;
      var g = '';
      /* 左：原树（含步骤视觉） */
      var tpos = { A: [200, 100], B: [110, 200], C: [200, 200], D: [290, 200], E: [75, 300], F: [145, 300], G: [200, 300], H: [290, 300] };
      g += h.txt(200, 60, '原树 T', { size: 15, w: 600, fill: C.muted });
      var tEdges = [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H']];
      var siblingPairs = [['B', 'C'], ['C', 'D'], ['E', 'F']];
      var keepKids = [['A', 'B'], ['B', 'E'], ['C', 'G'], ['D', 'H']];
      var droppedKids = [['A', 'C'], ['A', 'D'], ['B', 'F']];
      tEdges.forEach(function (e) {
        var p1 = tpos[e[0]], p2 = tpos[e[1]];
        var isSibling = siblingPairs.some(function (x) { return x[0] === e[0] && x[1] === e[1]; });
        var dropped = droppedKids.some(function (x) { return x[0] === e[0] && x[1] === e[1]; });
        var st = C.grey, sw = 1.8, dash = null;
        if (s.step >= 1 && isSibling) { st = C.blue; sw = 2.4; }
        if (s.step >= 2 && dropped) { st = C.red; sw = 1.6; dash = '4,4'; }
        g += h.line(p1[0], p1[1], p2[0], p2[1], { stroke: st, sw: sw, dash: dash });
      });
      if (s.step >= 1) siblingPairs.forEach(function (x) {
        var p1 = tpos[x[0]], p2 = tpos[x[1]];
        var mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
        g += h.txt(mx, my - 8, s.step >= 2 ? '抹' : '兄弟线', { size: 10.5, fill: s.step >= 2 ? C.red : C.blue, w: 700 });
      });
      Object.keys(tpos).forEach(function (k) {
        var p = tpos[k];
        g += h.circle(p[0], p[1], 20, { fill: '#fff', stroke: C.ink, sw: 1.8 });
        g += h.txt(p[0], p[1] + 6, k, { size: 15, w: 700 });
      });
      /* 右：转换后的二叉树 */
      var b = toBinary(TREE);
      var nodes = [], pos = {};
      (function walk(n2, d) { if (!n2) return; walk(n2.l, d + 1); nodes.push({ v: n2.v, d: d }); walk(n2.r, d + 1); })(b, 0);
      nodes.forEach(function (n3, r) { pos[n3.v] = [610 + r * 34, 100 + n3.d * 88]; });
      (function edges(n2) { if (!n2) return; if (n2.l) { var A = pos[n2.v], B = pos[n2.l.v]; g += h.line(A[0], A[1], B[0], B[1], { stroke: C.green, sw: 2.2 }); edges(n2.l); } if (n2.r) { var A2 = pos[n2.v], B2 = pos[n2.r.v]; g += h.line(A2[0], A2[1], B2[0], B2[1], { stroke: C.blue, sw: 2.2, dash: '5,3' }); edges(n2.r); } })(b);
      nodes.forEach(function (n4) {
        var P = pos[n4.v];
        g += h.circle(P[0], P[1], 19, { fill: '#fff', stroke: C.ink, sw: 1.8 });
        g += h.txt(P[0], P[1] + 6, n4.v, { size: 14, w: 700 });
      });
      g += h.txt(790, 60, s.step >= 3 ? '转换后的二叉树' : '二叉树（结果预览）', { size: 15, w: 600, fill: C.muted });
      g += h.txt(640, 108, '左链=孩子', { size: 10.5, fill: C.green, anchor: 'start' });
      g += h.txt(640, 126, '右虚链=兄弟', { size: 10.5, fill: C.blue, anchor: 'start' });
      g += h.txt(W / 2, 480, '左孩子右兄弟：树 → 二叉树是"一一对应"的，任何树/森林都能这样存进二叉链表', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
