/* 动画：平衡二叉树 AVL——教材 7.3，四种失衡旋转（LL/RR/LR/RL），平衡因子标注 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'void R_Rotate(BSTNode *&p) {              // 右旋：LL 型',
    '    lc = p->lchild;  p->lchild = lc->rchild;  lc->rchild = p;  p = lc;',
    '}',
    'void L_Rotate(BSTNode *&p) {              // 左旋：RR 型',
    '    rc = p->rchild;  p->rchild = rc->lchild;  rc->lchild = p;  p = rc;',
    '}',
    'void LeftBalance(BSTNode *&T) {           // T 左高失衡',
    '    lc = T->lchild;',
    '    if (lc->bf == 1) { T->bf = lc->bf = 0; R_Rotate(T); }            // LL',
    '    else { /* LR：先对左孩子左旋，再对 T 右旋 */',
    '        rd = lc->rchild;  /* 按rd的bf更新三者bf */',
    '        lc->rchild = rd->lchild;  rd->lchild = lc;',
    '        T->lchild = rd->rchild;   rd->rchild = T;  T = rd;  }',
    '}',
    '// 插入后从插入点向上逐层检查 |bf|≤2 → 在最浅失衡点旋转（右Balance对称）'
  ];

  function mk(v) { return { v: v, l: null, r: null, h: 1 }; }
  function H(n) { return n ? n.h : 0; }
  function upd(n) { n.h = 1 + Math.max(H(n.l), H(n.r)); }
  function bf(n) { return H(n.l) - H(n.r); }
  function cloneT(n) { return n ? { v: n.v, l: cloneT(n.l), r: cloneT(n.r), h: n.h } : null; }
  function rotr(p) { var lc = p.l; p.l = lc.r; lc.r = p; upd(p); upd(lc); return lc; }
  function rotl(p) { var rc = p.r; p.r = rc.l; rc.l = p; upd(p); upd(rc); return rc; }
  function inorder(n, out) { if (!n) return; inorder(n.l, out); out.push({ v: n.v, bf: bf(n) }); inorder(n.r, out); }

  var SCEN = {
    LL: [30, 20, 10], RR: [10, 20, 30], LR: [30, 10, 20], RL: [10, 30, 20]
  };
  var CASEINFO = {
    LL: 'LL 型：失衡点 A=30，插入落在 A 的**左**孩子的**左**子树 → 对 A **右旋**（新根=20）',
    RR: 'RR 型：失衡点 A=10，插入落在 A 的**右**孩子的**右**子树 → 对 A **左旋**（新根=20）',
    LR: 'LR 型：插入落在 A=30 的左孩子的**右**子树 → 先对左孩子 **左旋**，再对 A **右旋**（新根=20）',
    RL: 'RL 型：插入落在 A=10 的右孩子的**左**子树 → 先对右孩子 **右旋**，再对 A **左旋**（新根=20）'
  };

  DSC.reg({
    id: 'avl', ch: 7, name: '平衡二叉树（四种旋转）',
    note: '教材 7.3 平衡二叉树（|bf|≤1，失衡即旋转）',
    guide: [
      'AVL = BST + 平衡约束：每个结点 |平衡因子 bf = 左高−右高| ≤ 1，越界就旋转恢复',
      '下拉切换四种失衡场景（各 3 次插入触发一次旋转）：结点旁标注 bf，红色即失衡点',
      'LL/RR 单旋一次到位；LR/RL 双旋两步：先转孩子再转失衡点',
      '旋转后中序序列不变（仍是递增）——旋转只改变"形状"来恢复平衡，不破坏 BST 性质'
    ],
    inputs: [
      { key: 'scen', label: '失衡场景', type: 'select', options: [
        ['LL', 'LL 型：30 → 20 → 10（右旋）'],
        ['RR', 'RR 型：10 → 20 → 30（左旋）'],
        ['LR', 'LR 型：30 → 10 → 20（双旋）'],
        ['RL', 'RL 型：10 → 30 → 20（双旋）']
      ], value: 'LL' }
    ],
    run: function (v) {
      var seq = SCEN[v.scen] || SCEN.LL;
      var frames = [], root = null;
      function F(line, msg, hl, mk) {
        hl = hl || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: (function () { var io = []; inorder(root, io); return { 中序: io.map(function (x) { return x.v; }).join(' ≤ ') || '（空）', '最大|bf|': String(io.reduce(function (m, x) { return Math.max(m, Math.abs(x.bf)); }, 0)) }; })(),
          snap: { tree: cloneT(root), hl: hl, mark: mk || hl.mark }
        });
      }
      function insertAVL(val) {
        if (!root) { root = mk(val); F(1, '插入 ' + val + '：作为根。', { newv: val }, 'ins' + val); return; }
        var path = [], cur = root, par = null, dir = '';
        while (cur) {
          path.push(cur.v);
          if (val < cur.v) { par = cur; dir = 'l'; cur = cur.l; }
          else if (val > cur.v) { par = cur; dir = 'r'; cur = cur.r; }
          else { return; }
        }
        if (dir === 'l') par.l = mk(val); else par.r = mk(val);
        /* 更新高度并找最浅失衡点 */
        (function updAll(n2) { if (!n2) return; updAll(n2.l); updAll(n2.r); upd(n2); })(root);
        F(14, '插入 ' + val + '（叶子），向上检查平衡因子。', { newv: val, path: path }, 'ins' + val);
        var a = null, apar = null, adir = '';
        (function findU(n2, p, d) {
          if (!n2) return;
          findU(n2.l, n2, 'l'); findU(n2.r, n2, 'r');
          if (Math.abs(bf(n2)) > 1 && !a) { a = n2; apar = p; adir = d; }
        })(root, null, '');
        if (!a) { F(14, '所有结点 |bf| ≤ 1，无需旋转。', { path: path }); return; }
        F(6, CASEINFO[v.scen].split('：')[0] + '：结点 ' + a.v + ' 失衡（bf = ' + bf(a) + '），需要旋转。', { bad: a.v, path: path });
        var caseType = v.scen;
        if (caseType === 'LL') { root = (a === root) ? rotr(a) : (function () { if (apar.l === a) apar.l = rotr(a); else apar.r = rotr(a); return root; })(); }
        else if (caseType === 'RR') { root = (a === root) ? rotl(a) : (function () { if (apar.l === a) apar.l = rotl(a); else apar.r = rotl(a); return root; })(); }
        else if (caseType === 'LR') { F(9, 'LR 第一步：对左孩子 ' + a.l.v + ' 左旋。', { bad: a.v, sub: a.l.v }); a.l = rotl(a.l); F(1, 'LR 第二步：对 ' + a.v + ' 右旋。', { bad: a.v }); root = (a === root) ? rotr(a) : (function () { if (apar.l === a) apar.l = rotr(a); else apar.r = rotr(a); return root; })(); }
        else { F(0, 'RL 第一步：对右孩子 ' + a.r.v + ' 右旋。', { bad: a.v, sub: a.r.v }); a.r = rotr(a.r); F(4, 'RL 第二步：对 ' + a.v + ' 左旋。', { bad: a.v }); root = (a === root) ? rotl(a) : (function () { if (apar.l === a) apar.l = rotl(a); else apar.r = rotl(a); return root; })(); }
        (function updAll2(n2) { if (!n2) return; updAll2(n2.l); updAll2(n2.r); upd(n2); })(root);
        var finLine = (v.scen === 'RR' || v.scen === 'RL') ? 4 : 1;
        F(finLine, '旋转完成：新子树根 = ' + root.v + '。中序序列不变，全部 |bf| ≤ 1。', { newv: root.v }, 'rot');
      }
      seq.forEach(insertAVL);
      var io = []; inorder(root, io);
      F(0, '场景完成：依次插入 ' + seq.join(' → ') + '，最终根为 ' + root.v + '。AVL 把查找稳定在 O(log n)——代价是插入/删除要维护平衡。', {}, 'done');
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 520;
      var g = '';
      var nodes = [], pos = {};
      (function walk(n2, d) { if (!n2) return; walk(n2.l, d + 1); nodes.push({ v: n2.v, d: d, bf: bf(n2) }); walk(n2.r, d + 1); })(s.tree, 0);
      nodes.forEach(function (n3, r) { pos[n3.v] = [150 + r * ((W - 300) / Math.max(nodes.length - 1, 1)), 110 + n3.d * 100]; });
      (function edges(n2) { if (!n2) return; if (n2.l) { var A = pos[n2.v], B = pos[n2.l.v]; g += h.line(A[0], A[1], B[0], B[1], { stroke: C.line, sw: 1.7 }); edges(n2.l); } if (n2.r) { var A2 = pos[n2.v], B2 = pos[n2.r.v]; g += h.line(A2[0], A2[1], B2[0], B2[1], { stroke: C.line, sw: 1.7 }); edges(n2.r); } })(s.tree);
      nodes.forEach(function (n4) {
        var P = pos[n4.v], bad = s.hl && s.hl.bad === n4.v;
        g += h.circle(P[0], P[1], 22, { fill: bad ? C.redBg : (s.hl && s.hl.newv === n4.v ? C.greenBg : '#fff'), stroke: bad ? C.red : (s.hl && s.hl.newv === n4.v ? C.green : C.grey), sw: bad ? 2.8 : 1.9 });
        g += h.txt(P[0], P[1] + 6, String(n4.v), { size: 14.5, w: 700 });
        var bfc = n4.bf === 0 ? C.muted : Math.abs(n4.bf) > 1 ? C.red : C.blue;
        g += h.txt(P[0], P[1] + 40, 'bf=' + (n4.bf > 0 ? '+' : '') + n4.bf, { size: 11.5, fill: bfc, w: 700 });
      });
      if (s.hl && s.hl.sub) g += h.txt(W / 2, 400, '双旋第一步涉及子树根 ' + s.hl.sub, { size: 13, fill: C.amber, w: 600 });
      g += h.txt(W / 2, 460, 'bf = 左子树高 − 右子树高；|bf| > 1 即失衡（红），旋转后新根绿', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
