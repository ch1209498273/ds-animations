/* 动画：二叉排序树 BST——教材 7.3，插入（路径比较）与删除三情形，例题 {45,24,53,12,37,90} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE_I = [
    'BSTNode* InsertBST(BSTNode *T, KeyType key) {',
    '    if (!T)  return new BSTNode(key);         // 空位：创建新结点',
    '    if (key == T->key)      return T;         // 已存在（不重复插入）',
    '    else if (key < T->key)  T->lchild = InsertBST(T->lchild, key);   // 小 → 左',
    '    else                    T->rchild = InsertBST(T->rchild, key);   // 大 → 右',
    '    return T;',
    '}'
  ];
  var CODE_D = [
    'void DeleteBST(BSTNode *&T, KeyType key) {',
    '    if (!T) return;',
    '    if (key < T->key)  DeleteBST(T->lchild, key);      // 左子树找',
    '    else if (key > T->key) DeleteBST(T->rchild, key);  // 右子树找',
    '    else {                                             // 找到了，三种情形',
    '        if (!T->lchild)       T = T->rchild;           // ① 左空：右子树顶替',
    '        else if (!T->rchild)  T = T->lchild;           // ② 右空：左子树顶替',
    '        else {                                         // ③ 两孩子都在：',
    '            p = T->lchild;                             //   找中序前驱',
    '            while (p->rchild) p = p->rchild;',
    '            T->key = p->key;                           //   前驱值放入 T',
    '            DeleteBST(T->lchild, p->key);              //   再删除前驱结点',
    '        }',
    '    }',
    '}'
  ];

  function insert(node, val, path) {
    if (!node) { return { v: val, l: null, r: null, _new: true }; }
    path.push(node.v);
    if (val === node.v) return node;
    if (val < node.v) node.l = insert(node.l, val, path);
    else node.r = insert(node.r, val, path);
    return node;
  }
  function inorder(node, out) { if (!node) return; inorder(node.l, out); out.push(node.v); inorder(node.r, out); }
  function cloneT(n) { return n ? { v: n.v, l: cloneT(n.l), r: cloneT(n.r) } : null; }
  function find(node, val, path) { while (node) { path.push(node.v); if (val === node.v) return node; node = val < node.v ? node.l : node.r; } return null; }
  function maxNode(node) { while (node.r) node = node.r; return node; }

  var INS = [45, 24, 53, 12, 37, 90];

  DSC.reg({
    id: 'bst', ch: 7, name: '二叉排序树（插入与删除）',
    note: '教材 7.3 动态查找（中序有序、删除三情形）',
    guide: [
      '插入 = 一路比较走到空位：小于当前走左边、大于走右边——新结点永远是叶子',
      '中序遍历 BST 恰好得到递增序列（左侧演示），这是 BST 的灵魂性质',
      '删除有三种情形：叶子直接删；单孩子由孩子顶替；**双孩子用中序前驱（左子树最右）的值替换，再删前驱**',
      '试三个删除场景：删叶子 12、删单孩子 53、删双孩子 45——删根也能保持 BST 性质'
    ],
    inputs: [
      { key: 'op', label: '操作', type: 'select', options: [
        ['ins', '依次插入 45,24,53,12,37,90'],
        ['dl', '插入后删除叶子 12'],
        ['d1', '插入后删除单孩子结点 53'],
        ['d2', '插入后删除双孩子结点 45（前驱替代）']
      ], value: 'ins' }
    ],
    run: function (v) {
      var op = v.op;
      var root = null, frames = [], cmp = 0;
      var code = op === 'ins' ? CODE_I : CODE_D;

      function snap(hl) {
        hl = hl || {};
        return { tree: cloneT(root), cur: hl.cur || null, hit: hl.hit || null, del: hl.del || null, path: (hl.path || []).slice(), newv: hl.newv || null, note: hl.note || '', mark: hl.mark };
      }
      function F(line, msg, hl) {
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: (function () { var io = []; inorder(root, io); return { 中序序列: io.join(' ≤ ') || '（空）', 结点数: String(io.length) }; })(),
          snap: snap(hl)
        });
      }

      INS.forEach(function (val) {
        var path = [];
        F(0, '插入 ' + val + '：从根开始比较。', {});
        var cur = root, parent = null, dir = '', dup = false;
        while (cur) {
          cmp++;
          if (val < cur.v) { F([3], val + ' < ' + cur.v + ' → 走左子树。', { cur: cur.v, path: path }); parent = cur; dir = 'l'; cur = cur.l; }
          else if (val > cur.v) { F([4], val + ' > ' + cur.v + ' → 走右子树。', { cur: cur.v, path: path }); parent = cur; dir = 'r'; cur = cur.r; }
          else { dup = true; F([2], val + ' 已存在（BST 不插重复键）。', { cur: cur.v }); break; }
        }
        if (dup) return;
        if (!root) { root = insert(root, val, path); }
        else if (dir === 'l') { parent.l = insert(null, val, []); } else if (dir === 'r') { parent.r = insert(null, val, []); }
        F(1, '走到空位：新结点 ' + val + ' 作为 ' + (parent ? parent.v + ' 的' + (dir === 'l' ? '左' : '右') + '孩子' : '根') + ' 插入——**插入永远发生在叶子层**，不需要调整树形。', { newv: val, hit: val }, 'ins' + val);
      });
      if (op === 'ins') {
        var io = []; inorder(root, io);
        F(0, '插入完成。中序遍历：' + io.join(' ≤ ') + ' —— 恰好递增！查找就是沿着这条比较路径走，ASL 与结点深度挂钩（树越平衡越快）。', {}, 'done');
        return { code: code, frames: frames };
      }

      /* 删除场景 */
      var delVal = op === 'dl' ? 12 : op === 'd1' ? 53 : 45;
      F(0, '现在删除 ' + delVal + '：先按查找路径找到它。', {});
      var path2 = [];
      var node = find(root, delVal, path2);
      if (node.l && node.r) {
        F([8, 9, 10], delVal + ' 左右孩子都在（双孩子情形）：不能直接摘——会断成两棵树。策略：找**中序前驱**（左子树最右结点）。', { cur: delVal, path: path2 });
        var pred = maxNode(node.l);
        F([11], '中序前驱 = 左子树最右结点 ' + pred.v + '（比 ' + delVal + ' 小的最大结点）。把它的值放入被删结点。', { cur: delVal, note: '前驱=' + pred.v });
        node.v = pred.v;
        F([12], '值替换完成：该结点现在存放 ' + pred.v + '。接下来只需从左子树中删除结点 ' + pred.v + '（此时它必是叶子或单孩子，退化为前两种情形）。', { del: pred.v });
        (function delPred(n2, val) {   // 只在左子树中删前驱；前驱无右孩子，孩子顶替即可
          if (n2.v === val) return n2.l;
          if (val < n2.v) n2.l = delPred(n2.l, val); else n2.r = delPred(n2.r, val);
          return n2;
        })(node.l, pred.v);
      } else if (node.l || node.r) {
        var child = node.l || node.r;
        F([7], delVal + ' 只有一个孩子（' + child.v + '）——单孩子情形：孩子直接顶替它的位置。', { cur: delVal, path: path2 });
        replaceNode(root, delVal, child);
      } else {
        F([6], delVal + ' 是叶子——情形①：直接删除，不留空位。', { cur: delVal, path: path2 });
        replaceNode(root, delVal, null);
      }
      var io2 = []; inorder(root, io2);
      F(0, '删除完成。中序序列：' + io2.join(' ≤ ') + ' —— 依然严格递增，BST 性质保持！这就是"用中序前驱/后继补位"的意义：删掉的可以是任意结点，有序性不丢。', {}, 'done');
      return { code: code, frames: frames };

      function replaceNode(n2, val, child) {
        if (!n2) return null;
        if (n2.v === val) return child;
        if (val < n2.v) n2.l = replaceNode(n2.l, val, child); else n2.r = replaceNode(n2.r, val, child);
        return n2;
      }
    },
    render: function (s) {
      var W = 980, H = 560;
      var g = '';
      var nodes = [], pos = {};
      (function walk(n2, d) {
        if (!n2) return;
        walk(n2.l, d + 1); nodes.push({ v: n2.v, d: d }); walk(n2.r, d + 1);
      })(s.tree, 0);
      nodes.forEach(function (n3, r) { pos[n3.v] = [110 + r * ((W - 220) / Math.max(nodes.length - 1, 1)), 90 + n3.d * 92]; });
      (function edges(n2) {
        if (!n2) return;
        if (n2.l) { var A = pos[n2.v], B = pos[n2.l.v]; g += h.line(A[0], A[1], B[0], B[1], { stroke: C.line, sw: 1.6 }); edges(n2.l); }
        if (n2.r) { var A2 = pos[n2.v], B2 = pos[n2.r.v]; g += h.line(A2[0], A2[1], B2[0], B2[1], { stroke: C.line, sw: 1.6 }); edges(n2.r); }
      })(s.tree);
      nodes.forEach(function (n4) {
        var P = pos[n4.v];
        var f = '#fff', st = C.grey, sw = 1.8;
        if (s.path && s.path.indexOf(n4.v) >= 0) { f = C.blueBg; st = C.blue; }
        if (s.cur === n4.v) { f = C.amberBg; st = C.amber; sw = 2.6; }
        if (s.newv === n4.v || s.hit === n4.v) { f = C.greenBg; st = C.green; sw = 2.6; }
        if (s.del === n4.v) { f = C.redBg; st = C.red; sw = 2.6; }
        g += h.circle(P[0], P[1], 21, { fill: f, stroke: st, sw: sw });
        g += h.txt(P[0], P[1] + 6, String(n4.v), { size: 14.5, w: 700 });
      });
      g += h.txt(W / 2, 380, '横向位置即中序次序 → 中序遍历必然递增', { size: 12.5, fill: C.muted });
      if (s.note) g += h.txt(W / 2, 420, s.note, { size: 14, w: 700, fill: C.amber });
      g += h.txt(W / 2, 470, '蓝=比较路径  黄=当前比较  绿=新插入/命中  红=待删除', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
