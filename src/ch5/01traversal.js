/* 动画6：二叉树的四种遍历（先/中/后序递归 + 层次遍历；默认树取自 cp5-03 例：先序GDAFEMHZ/中序ADEFGHMZ） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODES = {
    pre: [
      'Status PreOrderTraverse(BiTree T) {',
      '    if (T == NULL) return OK;         // 空树：递归出口',
      '    visit(T);                         // 访问根结点（第1次经过）',
      '    PreOrderTraverse(T->lchild);      // ① 先遍历左子树',
      '    PreOrderTraverse(T->rchild);      // ② 再遍历右子树',
      '}'
    ],
    in: [
      'Status InOrderTraverse(BiTree T) {',
      '    if (T == NULL) return OK;         // 空树：递归出口',
      '    InOrderTraverse(T->lchild);       // ① 先遍历左子树',
      '    visit(T);                         // 访问根结点（第2次经过）',
      '    InOrderTraverse(T->rchild);       // ② 再遍历右子树',
      '}'
    ],
    post: [
      'Status PostOrderTraverse(BiTree T) {',
      '    if (T == NULL) return OK;         // 空树：递归出口',
      '    PostOrderTraverse(T->lchild);     // ① 先遍历左子树',
      '    PostOrderTraverse(T->rchild);     // ② 再遍历右子树',
      '    visit(T);                         // 访问根结点（第3次经过）',
      '}'
    ],
    level: [
      'void LevelOrder(BiTree T) {',
      '    if (T == NULL) return;',
      '    EnQueue(Q, T);                    // 根结点入队',
      '    while (!QueueEmpty(Q)) {',
      '        DeQueue(Q, p);  visit(p);     // 队头出队并访问',
      '        if (p->lchild) EnQueue(Q, p->lchild);   // 左孩子入队',
      '        if (p->rchild) EnQueue(Q, p->rchild);   // 右孩子入队',
      '    }',
      '}'
    ]
  };
  var NAMES = { pre: '先序遍历（根→左→右）', in: '中序遍历（左→根→右）', post: '后序遍历（左→右→根）', level: '层次遍历（自上而下、从左到右）' };
  var PASSVISIT = { pre: 1, in: 2, post: 3 };

  function parse(str) {
    var toks = (str || '').replace(/\s+/g, '').split('');
    if (!toks.length) throw new Error('请输入先序序列（用 # 表示空），如 GDA##FE###MH##Z##');
    var pos = 0, nid = 0;
    function build() {
      if (pos >= toks.length) throw new Error('序列不完整：# 的数量不足以构成一棵树');
      var t = toks[pos++];
      if (t === '#') return null;
      if (!/^[A-Za-z0-9]$/.test(t)) throw new Error('只能输入字母/数字或 #（' + t + ' 不合法）');
      return { id: 'x' + (nid++), ch: t, l: build(), r: build() };
    }
    var root = build();
    if (pos < toks.length) throw new Error('序列有多余字符：' + toks.slice(pos).join(''));
    return root;
  }
  function layout(root) {
    var idx = 0, nodes = [], edges = [];
    var total = 0, maxDepth = 0;
    (function cnt(nd, d) { if (!nd) return; total++; if (d > maxDepth) maxDepth = d; cnt(nd.l, d + 1); cnt(nd.r, d + 1); })(root, 0);
    /* 自适应：宽树压缩水平间距、深树压缩垂直间距，保证不越界、不压输出栏 */
    var dx = Math.min(112, Math.max(48, 760 / Math.max(total, 1)));
    var dy = Math.min(96, Math.max(24, 354 / Math.max(maxDepth, 1)));
    function walk(nd, depth, parent) {
      if (!nd) return;
      walk(nd.l, depth + 1, nd);
      nd.x = 100 + idx++ * dx; nd.y = 86 + depth * dy; nd.depth = depth;
      nodes.push(nd);
      if (parent) edges.push({ a: parent, b: nd });
      walk(nd.r, depth + 1, nd);
    }
    walk(root, 0, null);
    return { nodes: nodes, edges: edges };
  }
  function quietOrders(root) {
    function d(nd, f) { if (!nd) return; f(nd); d(nd.l, f); d(nd.r, f); }
    var pre = [], ino = [], post = [], lvl = [];
    d(root, function (n) { pre.push(n.ch); });
    (function i2(n) { if (!n) return; i2(n.l); ino.push(n.ch); i2(n.r); })(root);
    (function p2(n) { if (!n) return; p2(n.l); p2(n.r); post.push(n.ch); })(root);
    var q = [root];
    while (q.length) { var p = q.shift(); if (p) lvl.push(p.ch); if (p && p.l) q.push(p.l); if (p && p.r) q.push(p.r); }
    return { pre: pre, in: ino, post: post, level: lvl };
  }

  DSC.reg({
    id: 'traversal', ch: 5, name: '⑧ 二叉树的四种遍历',
    note: '教材 5.5 遍历二叉树（访问时机与递归栈）',
    guide: [
      '结点下方的 ①②③ 圆点 = 第几次"经过"；绿色那一次才是真正"访问"',
      '底部"序列输出"栏随访问逐个落下结果，完成后显示最终序列',
      '切换先/中/后/层次（队列）四种方式，观察访问时机的变化',
      '输入框可换成自己的树：先序序列、# 表示空，如 ABD##E##C#F##'
    ],
    inputs: [
      { key: 'mode', label: '遍历方式', type: 'select', options: [['pre', '先序遍历（根左右）'], ['in', '中序遍历（左根右）'], ['post', '后序遍历（左右根）'], ['level', '层次遍历（队列）']], value: 'pre' },
      { key: 'data', label: '二叉树（先序序列，#为空）', type: 'text', value: 'GDA##FE###MH##Z##' }
    ],
    run: function (v) {
      var root = parse(v.data);
      var lay = layout(root);
      var orders = quietOrders(root);
      var mode = v.mode;
      var code = CODES[mode];
      var frames = [];
      var nodes = lay.nodes, edges = lay.edges;
      function snap(o) {
        o = o || {};
        o.nodes = nodes.map(function (n) { return { id: n.id, ch: n.ch, x: n.x, y: n.y, state: n.state || 'init', pass: n.pass || 0, visitedPass: n.visitedPass || 0 }; });
        o.edges = edges.map(function (e) { return { a: e.a.id, b: e.b.id, hl: !!e.hl }; });
        o.stack = stack.slice(); o.queue = queue.slice(); o.seq = seq.slice();
        o.mode = mode; o.modeName = NAMES[mode];
        o.cur = curId;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      var stack = [], queue = [], seq = [], curId = null;

      var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
      function setState(id, st) { byId[id].state = st; }
      function visit(nd, pass) {
        seq.push(nd.ch); curId = nd.id;
        setState(nd.id, 'visited'); nd.visitedPass = pass;
        edges.forEach(function (e) { e.hl = (e.b.id === nd.id); });
        F(mode === 'level' ? 4 : (mode === 'pre' ? 2 : mode === 'in' ? 3 : 4),
          '★ 访问 ' + nd.ch + '（' + (mode === 'level' ? '出队即访问' : '第 ' + pass + ' 次经过——' + NAMES[mode] + '在此时访问') + '）。已访问：' + seq.join(' '),
          { 已访问序列: seq.join(' ') || '（空）', 当前: mode === 'level' ? '出队并访问 ' + nd.ch : '访问 ' + nd.ch + '（第' + pass + '次经过时）' },
          snap({}));
      }
      if (mode === 'level') {
        if (!root) {
          F(0, '树为空（T == NULL）：层次遍历结束，无结点可访问。输入框换成非空树（如 GDA##FE###MH##Z##）再试。', { 结果: '空树' }, snap({ done: true }));
          return { code: code, frames: frames };
        }
        queue.push(root.id);
        F(2, '根结点 ' + root.ch + ' 入队。', { 队列: '队头 → ' + queue.map(function (id) { return byId[id].ch; }).join(' ') + ' ← 队尾' }, snap({}));
        while (queue.length) {
          var pid = queue.shift();
          visit(byId[pid], 0);
          setState(pid, 'done');
          var qTxt = function () { return queue.length ? '队头 → ' + queue.map(function (id) { return byId[id].ch; }).join(' ') + ' ← 队尾' : '（空）'; };
          if (byId[pid].l) { queue.push(byId[pid].l.id); F(5, byId[pid].ch + ' 的左孩子 ' + byId[pid].l.ch + ' 入队。', { 队列: qTxt() }, snap({})); }
          if (byId[pid].r) { queue.push(byId[pid].r.id); F(6, byId[pid].ch + ' 的右孩子 ' + byId[pid].r.ch + ' 入队。', { 队列: qTxt() }, snap({})); }
        }
        F(3, '队列空，层次遍历结束：' + seq.join(' ') + '。借助【队列】实现"先访问先扩展"。',
          { 层次序列: seq.join(' '), 四种序列对比: '先 ' + orders.pre.join('') + ' ｜ 中 ' + orders.in.join('') + ' ｜ 后 ' + orders.post.join('') + ' ｜ 层 ' + orders.level.join('') },
          snap({ done: true }));
        return { code: code, frames: frames };
      }

      /* 递归遍历（pre/in/post） */
      var passNo = PASSVISIT[mode];
      var dirName = { pre: { l: 3, r: 4 }, in: { l: 2, r: 4 }, post: { l: 2, r: 3 } }[mode];
      function rec(nd, fromParent, dirLabel) {
        if (!nd) {
          F(1, (dirLabel || '子树') + '为空（T == NULL）：递归出口，直接返回 OK。', { 递归栈: stack.join(' → ') || '（空）' }, snap({}));
          return;
        }
        stack.push(nd.ch + ' 的调用');
        curId = nd.id;
        setState(nd.id, 'calling');
        nd.pass = 1;
        if (fromParent) edges.forEach(function (e) { e.hl = (e.b.id === nd.id); });
        F(0, '【第 1 次经过 ' + nd.ch + '】递归调用进入（栈深 ' + stack.length + '）。' +
          (passNo === 1 ? '先序遍历：就在此刻【访问】！' : '此刻不访问，先处理' + (passNo === 2 ? '左子树' : '左右子树') + '。'),
          { 递归栈: stack.join(' → '), 已访问: seq.join(' ') || '（空）', 当前: '第1次经过 ' + nd.ch }, snap({}));
        if (passNo === 1) visit(nd, 1);
        rec(nd.l, nd, '左子树');
        nd.pass = 2;
        edges.forEach(function (e) { e.hl = (e.b.id === nd.id); });
        F(dirName.l, '【第 2 次经过 ' + nd.ch + '】从左子树归来。' +
          (passNo === 2 ? '中序遍历：就在此刻【访问】！' : '此刻不访问。'),
          { 递归栈: stack.join(' → '), 已访问: seq.join(' ') || '（空）', 当前: '第2次经过 ' + nd.ch }, snap({}));
        if (passNo === 2) visit(nd, 2);
        rec(nd.r, nd, '右子树');
        nd.pass = 3;
        edges.forEach(function (e) { e.hl = (e.b.id === nd.id); });
        F(dirName.r, '【第 3 次经过 ' + nd.ch + '】从右子树归来。' +
          (passNo === 3 ? '后序遍历：就在此刻【访问】！' : '调用即将返回。'),
          { 递归栈: stack.join(' → '), 已访问: seq.join(' ') || '（空）', 当前: '第3次经过 ' + nd.ch }, snap({}));
        if (passNo === 3) visit(nd, 3);
        stack.pop();
        setState(nd.id, 'done');
        F(0, nd.ch + ' 的 3 次经过全部完成' + (nd.visitedPass ? '（在第 ' + nd.visitedPass + ' 次经过时被访问）' : '') + '，返回上一层（栈深 ' + stack.length + '）。', { 递归栈: stack.join(' → ') || '（空）', 已访问: seq.join(' ') }, snap({}));
      }
      rec(root, null, null);
      edges.forEach(function (e) { e.hl = false; });
      curId = null;
      F(0, NAMES[mode] + '完成：' + seq.join(' ') + '。三种遍历经过结点的路径相同，只是访问时机不同；时间 O(n)、空间 O(n)（栈深）。',
        (function () { var pn = {}; pn[mode === 'pre' ? '先序序列' : mode === 'in' ? '中序序列' : '后序序列'] = seq.join(' ');
          pn['四种序列对比'] = '先 ' + orders.pre.join('') + ' ｜ 中 ' + orders.in.join('') + ' ｜ 后 ' + orders.post.join('') + ' ｜ 层 ' + orders.level.join('');
          return pn; })(),
        snap({ done: true }));
      return { code: code, frames: frames };
    },
    render: function (s) {
      var W = 1150, H = 566;
      var g = '';
      g += h.txt(430, 34, s.modeName, { size: 19, w: 600 });
      s.edges.forEach(function (e) {
        var A = s.nodes.filter(function (n) { return n.id === e.a; })[0];
        var B = s.nodes.filter(function (n) { return n.id === e.b; })[0];
        g += h.line(A.x, A.y + 24, B.x, B.y - 24, { stroke: e.hl ? C.amber : C.line, sw: e.hl ? 3.5 : 2 });
      });
      s.nodes.forEach(function (n) {
        var fill = '#fff', stroke = C.grey, sw = 2;
        if (n.state === 'visited') { fill = C.greenBg; stroke = C.green; }
        if (n.state === 'done') { fill = C.greyBg; stroke = C.grey; }
        if (n.state === 'calling') { fill = C.blueBg; stroke = C.blue; }
        if (s.cur === n.id) { sw = 4; stroke = C.amber; }
        g += h.circle(n.x, n.y, 24, { fill: fill, stroke: stroke, sw: sw });
        g += h.txt(n.x, n.y + 7, n.ch, { size: 18, w: 700 });
        if (n.visitedPass) g += h.txt(n.x, n.y + 58, '第' + n.visitedPass + '次访问', { size: 11, fill: C.green, w: 600 });
        if (n.pass && s.mode !== 'level') {
          for (var d = 1; d <= 3; d++) {
            var dx2 = n.x - 18 + (d - 1) * 18;
            var filled = d <= n.pass;
            var isVisit = d === n.visitedPass;
            g += h.circle(dx2, n.y + 38, 5, {
              fill: isVisit ? C.green : (filled ? '#93c5fd' : '#fff'),
              stroke: isVisit ? C.green : (filled ? C.blue : C.grey), sw: 1.5
            });
            g += h.txt(dx2, n.y + 41.5, d, { size: 6.5, fill: filled ? '#0b1c39' : C.muted });
          }
          g += h.txt(n.x + 34, n.y + 42, '经过次数', { size: 10, fill: C.muted, anchor: 'start' });
        }
      });
      // 递归栈
      var sx = 880;
      g += h.txt(sx + 80, 60, '递归工作栈', { size: 14, fill: C.muted, w: 600 });
      for (var k = 0; k < s.stack.length; k++) {
        var yy = 74 + (s.stack.length - 1 - k) * 40;
        var top = k === s.stack.length - 1;
        g += h.rect(sx, yy, 250, 34, { fill: top ? C.blueBg : '#fff', stroke: top ? C.blue : C.grey, rx: 6 });
        g += h.txt(sx + 125, yy + 23, s.stack[k], { size: 13, fill: top ? C.blue : C.ink });
      }
      if (!s.stack.length) g += h.txt(sx + 125, 90, '（空）', { size: 13, fill: C.muted });
      // 队列（层次遍历）
      if (s.mode === 'level') {
        var qy = 470;
        g += h.txt(60, qy + 8, '队列：队头 →', { size: 14, fill: C.muted, anchor: 'start' });
        s.queue.forEach(function (id, k2) {
          var nd = s.nodes.filter(function (n) { return n.id === id; })[0];
          g += h.rect(180 + k2 * 70, qy - 14, 60, 42, { fill: C.blueBg, stroke: C.blue, rx: 8 });
          g += h.txt(210 + k2 * 70, qy + 12, nd.ch, { size: 17, w: 700 });
        });
        if (!s.queue.length) g += h.txt(200, qy + 10, '（空）', { size: 14, fill: C.muted, anchor: 'start' });
        g += h.txt(180 + Math.max(s.queue.length, 1) * 70 + 16, qy + 8, '← 队尾', { size: 14, fill: C.muted, anchor: 'start' });
      }
      if (s.done) {
        var c = (s.seq || []).length;
        g += h.txt(W - 130, 470, '访问结点数：' + c + ' / ' + s.nodes.length + '（每结点恰好 1 次）', { size: 13, fill: C.green });
      }
      // 输出序列条（访问一个落一个）
      var modeShort = { pre: '先序', in: '中序', post: '后序', level: '层次' }[s.mode];
      var oy = 502;
      g += h.line(30, oy - 12, W - 30, oy - 12, { stroke: C.line, sw: 1 });
      g += h.txt(40, oy + 27, modeShort + '序列输出', { size: 14.5, fill: C.muted, anchor: 'start', w: 600 });
      s.seq.forEach(function (ch, k2) {
        g += h.rect(168 + k2 * 54, oy, 48, 44, { fill: C.greenBg, stroke: C.green, rx: 8, sw: s.done ? 2.5 : 1.5 });
        g += h.txt(192 + k2 * 54, oy + 29, ch, { size: 20, w: 700, fill: C.green });
      });
      if (!s.seq.length) g += h.txt(178, oy + 28, '（尚未访问任何结点）', { size: 13.5, fill: C.muted, anchor: 'start' });
      if (s.done) g += h.txt(186 + s.seq.length * 54 + 20, oy + 28, '✓ 遍历完成，输出如上', { size: 13.5, fill: C.green, w: 600, anchor: 'start' });
      return h.svg(W, H, g);
    }
  });
})();
