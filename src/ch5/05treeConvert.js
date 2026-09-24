/* 动画：树 ↔ 二叉树转换——结点整体从"树布局"旋转滑到"二叉树布局"，终点为完整二叉树（教材 5.6） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    '// 树 → 二叉树（孩子兄弟表示）：',
    '// ① 加线：所有相邻兄弟结点之间加一条线',
    '// ② 抹线：只保留第一个孩子（左孩子），抹掉其余孩子连线',
    '// ③ 旋转：以根为轴顺时针转 45°，层次分明 → 二叉树',
    ' typedef struct CSNode {',
    '     ElemType data;',
    '     struct CSNode *firstchild, *nextsibling;   // 左=第一个孩子，右=下一个兄弟',
    ' } CSNode;'
  ];

  /* 教材例树：A(B,E,F ; C,G ; D,H) */
  var TREE = { v: 'A', kids: [
    { v: 'B', kids: [{ v: 'E', kids: [] }, { v: 'F', kids: [] }] },
    { v: 'C', kids: [{ v: 'G', kids: [] }] },
    { v: 'D', kids: [{ v: 'H', kids: [] }] }
  ] };

  function toBinary(t) {
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

  /* 树布局（全画布） */
  var TL = { A: [490, 140], B: [300, 258], C: [490, 258], D: [680, 258], E: [200, 376], F: [360, 376], G: [490, 376], H: [680, 376] };
  /* 二叉树布局（教材画法）：A 在顶部，右链 B→C→D 斜向下，E/G/H 各挂左孩子位置 */
  var BL = { A: [420, 118], B: [360, 212], E: [210, 306], F: [282, 392], C: [510, 306], G: [462, 392], D: [572, 392], H: [572, 470] };
  var KEEP = [['A', 'B'], ['B', 'E'], ['C', 'G'], ['D', 'H']];
  var DROP = [['A', 'C'], ['A', 'D'], ['B', 'F']];
  var SIB = [['B', 'C'], ['C', 'D'], ['E', 'F']];

  DSC.reg({
    id: 'treeConvert', ch: 5, name: '树 / 森林与二叉树转换',
    aim: '左孩子右兄弟：树/森林与二叉树**一一对应**，转换规则走一遍就记住',
    note: '教材 5.6 树与森林（孩子兄弟表示、左孩子右兄弟）',
    keywords: '树转二叉树 森林 左孩子右兄弟 逆转换 度 兄弟 树与二叉树对应 变形',
    guide: [
      '播放看**结点整体旋转滑动**：同一批结点从"树布局"滑到"二叉树布局"——没有任何结点增减',
      '绿色实线 = 树里的**第一个孩子**（成为二叉树的左孩子）；蓝色虚线 = **兄弟**（成为右孩子）',
      '红色虚线 = 被抹掉的旧孩子连线（A—C、A—D、B—F），②抹线后消失，换成蓝色兄弟线',
      '最后两帧是关键：**完整的二叉树**（A 的右链 B→C→D、B 左孩子 E、C 左孩子 G、D 左孩子 H）+ 遍历性质验证'
    ],
    inputs: [],
    run: function (v) {
      var frames = [], bin = toBinary(TREE);
      var pre = [], ino = [];
      preorder(bin, pre); inorder(bin, ino);
      function F(lines, step, t, msg, mk) {
        frames.push({
          line: Array.isArray(lines) ? lines : [lines], msg: msg,
          panel: { 二叉树先序: pre.join(' '), 二叉树中序: ino.join(' ') },
          snap: { step: step, t: t, mark: mk || null }
        });
      }
      F([0], 0, 0, '原树 T：A 有 3 个孩子 B、C、D；B 有 E、F；C 有 G；D 有 H。三步转换：①加线 → ②抹线 → ③旋转。');
      F([1], 1, 0, '① 加线：所有相邻兄弟之间加一条线（B—C、C—D、E—F，蓝色虚线）。');
      F([2], 2, 0, '② 抹线：每个结点只保留与**第一个**孩子的连线（A—B、B—E、C—G、D—H），抹掉 A—C、A—D、B—F（红色虚线）。');
      F([3], 3, 0.5, '③ 旋转中……结点正在绕根整体滑动到二叉树的位置。');
      F([5, 6], 4, 1, '转换完成：一棵**完整的二叉树**——绿实线 = 左孩子（树里第一个孩子），蓝虚线 = 右孩子（树里下一个兄弟）。结构：A 的左孩子是 B；B 的右链 B→C→D；B 的左孩子 E，E 的右链 F；C 的左孩子 G；D 的左孩子 H。', 'done');
      F([5, 6], 5, 1, '★ 验证：二叉树先序 ' + pre.join(' ') + ' == 树的先根遍历；二叉树中序 ' + ino.join(' ') + ' == 树的后根遍历。森林 = 每棵树转二叉树后，把根用右链串起来。', 'final');
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 580;
      var g = '';
      var t = s.t || 0, step = s.step;
      function P(v) { var a = TL[v], b = BL[v]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
      function seg(a, b, r) {   /* 沿方向裁剪 r，连线/箭头端点恰好落在结点圆周上 */
        var A = P(a), B = P(b);
        var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
        return [A[0] + dx / L * r, A[1] + dy / L * r, B[0] - dx / L * r, B[1] - dy / L * r];
      }
      function link(a, b, o, r) { var s2 = seg(a, b, r == null ? 22 : r); return h.arrow(s2[0], s2[1], s2[2], s2[3], o); }
      function line2(a, b, o, r) { var s2 = seg(a, b, r == null ? 22 : r); return h.line(s2[0], s2[1], s2[2], s2[3], o); }

      var titles = ['原树 T（待转换）', '① 加线：兄弟之间加线', '② 抹线：只保留第一个孩子', '③ 旋转：结点滑向二叉树位置…', '转换完成：完整的二叉树', '验证：遍历性质'];
      g += h.rect(300, 26, 380, 34, { fill: '#fff7ed', stroke: C.amber, rx: 8, sw: 1.5 });
      g += h.txt(490, 48, titles[step] || titles[0], { size: 15, w: 700, fill: C.amber });

      if (step <= 1) {
        KEEP.concat(DROP).forEach(function (e) {
          g += line2(e[0], e[1], { stroke: C.grey, sw: 1.8 }, 20);
        });
        if (step === 1) SIB.forEach(function (e) {
          g += line2(e[0], e[1], { stroke: C.blue, sw: 2 }, 22);
        });
      } else if (step === 2) {
        KEEP.forEach(function (e) { g += line2(e[0], e[1], { stroke: C.green, sw: 2.2 }, 20); });
        DROP.forEach(function (e) { g += line2(e[0], e[1], { stroke: C.red, sw: 1.8, dash: '6,4' }, 20); });
        SIB.forEach(function (e) { g += line2(e[0], e[1], { stroke: C.blue, sw: 2 }, 22); });
      } else {
        KEEP.forEach(function (e) {
          if (step >= 4) g += link(e[0], e[1], { stroke: C.green, sw: 2.6, head: 9 }, 22);
          else g += line2(e[0], e[1], { stroke: C.green, sw: 2.2 }, 20);
        });
        SIB.forEach(function (e) {
          if (step >= 4) g += link(e[0], e[1], { stroke: C.blue, sw: 2.4, head: 9, dash: '6,4' }, 22);
          else g += line2(e[0], e[1], { stroke: C.blue, sw: 2, dash: '6,4' }, 22);
        });
      }

      Object.keys(TL).forEach(function (v2) {
        var p2 = P(v2);
        g += h.circle(p2[0], p2[1], 20, { fill: '#fff', stroke: C.ink, sw: 1.8 });
        g += h.txt(p2[0], p2[1] + 6, v2, { size: 15, w: 700 });
      });

      if (step >= 1) {
        g += h.txt(36, 96, step === 1 ? '蓝色虚线 = 新加的兄弟线' : '绿实线 = 左孩子（第一个孩子）', { size: 11.5, fill: step === 1 ? C.blue : C.muted, anchor: 'start' });
        if (step >= 2) {
          g += h.txt(36, 116, '蓝虚线 = 右孩子（下一个兄弟）', { size: 11.5, fill: C.blue, anchor: 'start' });
          if (step === 2) g += h.txt(36, 136, '红虚线 = 抹掉的旧孩子线', { size: 11.5, fill: C.red, anchor: 'start' });
        }
      }

      var bin = toBinary(TREE), pre = [], ino = [];
      preorder(bin, pre); inorder(bin, ino);
      g += h.txt(W / 2, 508, '左孩子右兄弟：树 → 二叉树一一对应，任何树/森林都能存进二叉链表', { size: 12.5, fill: C.muted });
      g += h.txt(W / 2, 532, '面板可验：二叉树先序 ' + pre.join(' ') + ' = 树先根；二叉树中序 ' + ino.join(' ') + ' = 树后根', { size: 12, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
