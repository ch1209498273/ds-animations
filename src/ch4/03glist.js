/* 动画：广义表——链式存储与表头/表尾/长度/深度（教材 4.4） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '/* 广义表 LS = (a1, a2, …, an)，每个 ai 要么是原子，要么是一个广义表 */',
    'typedef struct GLNode {',
    '    int tag;                      // 0 = 原子，1 = 子表',
    '    union { ElemType atom; struct GLNode *sub; };   // 数据 或 子表指针',
    '    struct GLNode *tp;            // 指向同层的下一个元素',
    '} GList;',
    '',
    '/* 约定：一个子表用"表头结点(tag=1) → 各元素结点"的链表示，',
    '   表头结点的 sub 指向该子表的第一个元素结点 */',
    '',
    'GList GetHead(GList L) {          // 表头：第一个元素（原子或子表），是元素',
    '    if (!L) return NULL;',
    '    return L->tag == 1 ? L->sub : L;      // 返回第一个结点本身',
    '}',
    'GList GetTail(GList L) {          // 表尾：除第一个元素外的「其余部分」，必是表',
    '    if (!L || !L->tp) return NULL;',
    '    t = new GList; t->tag = 1; t->sub = L->tp;   // 套一层表头结点',
    '    return t;',
    '}',
    'int Length(GList L) { for (p = L->sub, n = 0; p; p = p->tp) ++n; return n; }',
    'int Depth(GList L) {',
    '    if (!L || L->tag == 0)  return 0;     // 原子深度 0',
    '    max = 0;',
    '    for (p = L->sub; p; p = p->tp) {',
    '        d = (p->tag == 0) ? 0 : Depth(p); // 子表递归',
    '        if (d + 1 > max)  max = d + 1;    // 每套一层 +1',
    '    }',
    '    return max;',
    '}'
  ];

  /* 解析成嵌套数组：原子是字符串，子表是数组 */
  function parse(src) {
    var s = String(src).replace(/\s+/g, '');
    var i = 0;
    function parseList() {
      if (s.charAt(i) !== '(') throw Error('子表必须以 ( 开头');
      i++;
      var out = [];
      if (s.charAt(i) === ')') { i++; return out; }
      while (i < s.length) {
        var c = s.charAt(i);
        if (c === '(') out.push(parseList());
        else {
          var j = i;
          while (j < s.length && ',)'.indexOf(s.charAt(j)) < 0) j++;
          if (j === i) throw Error('空的元素位置（多余逗号？）');
          out.push(s.slice(i, j)); i = j;
        }
        if (s.charAt(i) === ',') { i++; continue; }
        if (s.charAt(i) === ')') { i++; break; }
        throw Error('缺少右括号');
      }
      return out;
    }
    var r = parseList();
    if (i < s.length) throw Error('括号之后还有多余字符「' + s.charAt(i) + '」');
    return r;
  }
  function show(x) {
    if (typeof x === 'string') return x;
    return '(' + x.map(show).join(',') + ')';
  }
  function isAtom(x) { return typeof x === 'string'; }
  function depthOf(x) { return isAtom(x) ? 0 : (x.length ? 1 + Math.max.apply(null, x.map(depthOf)) : 1); }
  function lenOf(x) { return isAtom(x) ? 0 : x.length; }

  DSC.reg({
    id: 'glist', ch: 4, name: '广义表：链式存储与表头/表尾/长度/深度',
    aim: '广义表的结点靠 tag 域区分**原子还是子表**；表头、表尾、长度、深度各怎么算',
    note: '教材 4.4 广义表（tag/sub/tp 三域结点、GetHead/GetTail、长度与递归深度）',
    guide: [
      '线性表的元素必须是原子。一旦允许"元素本身也是一个表"，就成了**广义表**——它是树、图的通用化表示，也是 LISP 系列语言的底层结构',
      '存储结点是三个域：`tag`（0 原子 / 1 子表）、`atom 或 sub`（联合）、`tp`（指向**同层下一个**元素）。子表靠 sub 往下钻，同层靠 tp 横着走',
      '**表头 GetHead 是一个元素**（可能是原子），**表尾 GetTail 一定是一个表**——把除第一个元素之外的部分再套一层表头结点。这是选择题最爱挖的坑',
      '长度是**最外层**元素个数，不递归；深度要递归：原子 0，子表 = 1 + 子表深度最大值。注意空表 `()` 的深度是 1 而不是 0'
    ],
    inputs: [
      {
        key: 'scene', label: '演示', type: 'select', options: [
          ['build', '建立链式存储（tag / sub / tp 三域）'],
          ['head', 'GetHead 表头'], ['tail', 'GetTail 表尾'],
          ['len', 'Length 长度'], ['depth', 'Depth 深度（递归）']
        ], value: 'depth'
      },
      { key: 'lst', label: '广义表（含外层括号）', type: 'text', value: '(a,(b,c),(),d)' }
    ],

    run: function (v) {
      var L = parse(v.lst), scene = v.scene, frames = [];
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          scene: scene, L: L, path: [], hl: null, scan: [], done: false, text: show(L)
        }, snap || {}) });
      }
      if (lenOf(L) === 0) throw Error('空表没什么可演示的，给个非空的广义表');

      if (scene === 'build') {
        F([0], '广义表 `' + show(L) + '`：' + lenOf(L) + ' 个最外层元素 —— ' +
          L.map(function (x, i) { return (i + 1) + '. ' + (isAtom(x) ? '原子 ' + x : '子表 ' + show(x)); }).join('；') +
          '。元素可以是原子，也可以是**另一张表**。',
          { 长度: lenOf(L) + '', 深度: depthOf(L) + '' }, {});
        F([1, 2, 3, 4, 5], '每个结点三个域：`tag`（0=原子、1=子表）、中间的联合域（原子值 **或** 子表指针 sub）、' +
          '`tp` 指向**同层的下一个**元素。所以"往下钻"用 sub、"横着走"用 tp。',
          { 结点域: 'tag / (atom|sub) / tp' }, { hl: { node: [0] } });
        L.forEach(function (x, i) {
          F([7, 8], '第 ' + (i + 1) + ' 个元素 ' + (isAtom(x) ? '`' + x + '` 是原子 → tag=0，联合域存值' :
            '`' + show(x) + '` 是子表 → tag=1，联合域存 **sub 指针**，另起一条子链'),
            { 正在建: (i + 1) + ' / ' + lenOf(L), 类型: isAtom(x) ? '原子' : '子表' },
            { hl: { node: [i] }, built: i + 1 });
        });
        F([8], '★ 建完：最外层一条 tp 链串起 ' + lenOf(L) + ' 个结点，' +
          L.filter(function (x) { return !isAtom(x); }).length + ' 个子表各自另有一条链，用 sub 挂过去。' +
          '广义表的存储因此是"横链 + 纵链"的两级结构，和定长数组完全不一样。',
          { 长度: lenOf(L) + '', 子表数: L.filter(function (x) { return !isAtom(x); }).length + '' },
          { done: true, built: lenOf(L) });
        return { code: CODE, frames: frames };
      }

      if (scene === 'head') {
        var first = L[0];
        F([7, 8], '先找到最外层的**表头结点**：它 tag=1，`sub` 指向第一个元素结点。' +
          '画面里最外层那条链的起点就是它，往右用 tp 串起 ' + lenOf(L) + ' 个元素。',
          { 表头结点: 'tag=1，sub → 第一个元素', 最外层元素: lenOf(L) + ' 个' }, {});
        F([10, 11], '`GetHead(L)` 第一行只判空：`if (!L) return NULL;`——表都不存在就没什么可取的。',
          { 入参: 'L = ' + show(L) }, { hl: { node: [0] } });
        F([12], '核心就一行三元：`return L->tag == 1 ? L->sub : L;`。表头结点 tag=1，所以**走 sub 往下钻**，' +
          '落到第一个元素结点——' + (isAtom(first) ? '它 tag=0，联合域里存的是原子 `' + show(first) + '`。'
            : '它 tag=1，本身就是一张子表 `' + show(first) + '`，表头**可以是表**。'),
          { 走哪条指针: 'sub（往下钻）', 落点: isAtom(first) ? '原子结点 tag=0' : '子表结点 tag=1' },
          { hl: { node: [0] } });
        F([12, 13], '★ GetHead = ' + show(first) + '。返回的是**一个元素**，不是' +
          (L.some(function (x) { return !isAtom(x); }) ? '一张表——本例第一个元素恰好是原子；把 LS 换成 ((b,c),a) 试试，' +
            '表头就会是整张子表 (b,c)。' : '一张表——对照记忆：`GetHead` 的结果**少一层括号**。'),
          { 结果: show(first), 是: isAtom(first) ? '原子（一个元素）' : '子表（但仍算一个元素）' },
          { hl: { node: [0] }, done: true });
        return { code: CODE, frames: frames };
      }

      if (scene === 'tail') {
        var rest = L.slice(1);
        F([14], '`GetTail(L)` 要的是"**除第一个元素之外的其余部分**"。入参仍然是最外层那个表头结点，' +
          '第一个元素 ' + show(L[0]) + ' 就是待跳过的那一个。',
          { 原表: show(L), 待跳过: show(L[0]) }, { hl: { node: [0], skip: true } });
        F([15], '先判 `!L->tp`：`tp` 指向同层的**下一个**元素，也就是第二个元素结点。' +
          (rest.length ? '本例 tp 非空，继续往下走。' : '本例最外层只有一个元素，tp 为空 → **直接返回 NULL**。') +
          '注意返回的是 NULL 而不是空表 `()`，这两件事在广义表里不等价。',
          { 判空: 'L->tp' + (rest.length ? ' 非空 → 继续' : ' 为空 → NULL') },
          { hl: { node: [0], skip: true } });
        if (rest.length) {
          F([16], '顺 `tp` 横着走一步 → 落到第二个元素结点（' + show(L[1]) + '），它就是其余部分的开头。' +
            '到这一步还没新建任何结点。',
            { 走哪条指针: 'tp（同层横着走）', 落点: show(L[1]) + ' 所在结点' }, { hl: { node: [1] } });
          F([16, 17], '可表尾必须是一张**表**，于是 `new` 一个 tag=1 的表头结点，把它的 `sub` 指向上一步的落点——' +
            '给其余部分**再套一层表头结点**。原结点一个都不复制，只是多挂一个头。',
            { 新表头结点: 'tag=1，sub → 第二个元素结点', 套上的括号: '(' + rest.map(show).join(',') + ')' },
            { hl: { node: rest.map(function (_, i) { return i + 1; }) } });
          F([17], '★ GetTail = (' + rest.map(show).join(',') + ')。对照记忆：`GetHead` 少一层括号、`GetTail` 保留括号。' +
            '再取一次表头：GetHead(GetTail(L)) = ' + show(rest[0]) + '。',
            { 结果: '(' + rest.map(show).join(',') + ')', 是: '一张表' }, { done: true });
        } else {
          F([17], '★ GetTail = NULL。只剩一个元素时"其余部分"根本不存在，返回空指针而不是空表 `()`。',
            { 结果: 'NULL' }, { done: true });
        }
        return { code: CODE, frames: frames };
      }

      if (scene === 'len') {
        var n = lenOf(L);
        for (var i = 0; i < n; i++) {
          F([18], 'Length 只数**最外层**：`for (p = L->sub; p; p = p->tp) ++n`，顺着 tp 横着走，' +
            '走到第 ' + (i + 1) + ' 个元素 ' + show(L[i]) + '，n = ' + (i + 1) + '。' +
            (isAtom(L[i]) ? '' : '（它是子表也**只算 1 个**，不往里数）'),
            { 计数: (i + 1) + ' / ' + n }, { hl: { node: [i] }, counted: i + 1 });
        }
        F([18], '★ Length(`' + show(L) + '`) = ' + n + '。长度**不递归**——子表算一个元素。',
          { 结果: n + '' }, { done: true, counted: n });
        return { code: CODE, frames: frames };
      }

      /* depth */
      var trail = [];
      F([19, 20], 'Depth 要递归：原子深度 0，表的深度 = **1 + 各元素深度的最大值**。' +
        '先从外层 `' + show(L) + '` 开始，它自己贡献 1 层。',
        { 深度: depthOf(L) + '' }, {});
      (function walk(x, d, idx) {
        if (isAtom(x)) {
          trail.push(d);
          F([21], '原子 `' + x + '` → 深度 0，不用往里钻。', { 当前: x, 该层贡献: '0' }, { hl: { node: idx }, trail: trail.slice() });
          return;
        }
        if (!x.length) {
          trail.push(1);
          F([21, 22], '空表 `()` 里面没有元素，但它**本身是一层括号** → 深度记 1（不是 0，这是常错点）。',
            { 当前: '()', 该层贡献: '1' }, { hl: { node: idx }, trail: trail.slice() });
          return;
        }
        F([21, 22], '进入子表 `' + show(x) + '`（第 ' + (d + 1) + ' 层）：它的深度 = 1 + max(元素深度)。逐个看：' +
          x.map(function (y, k) { return isAtom(y) ? y + '→0' : show(y) + '→' + depthOf(y); }).join('，'),
          { 当前: show(x), 层: (d + 1) + '', 本层最大值: Math.max.apply(null, x.map(function (y) { return isAtom(y) ? 0 : depthOf(y) + 1; })) + '' },
          { hl: { node: idx }, trail: trail.slice() });
        x.forEach(function (y, k) { walk(y, d + 1, idx.concat([k])); });
        trail.push(d + 1);
      })(L, 0, []);
      F([23], '★ Depth(`' + show(L) + '`) = ' + depthOf(L) + '。每往里钻一层就 +1，取所有分支里最大的那个。',
        { 结果: depthOf(L) + '', 递归访问: trail.length + ' 个结点' }, { done: true });
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 500, g = '';
      g += h.txt(W / 2, 28, '广义表 ' + s.text + '　｜　横着走 tp、往下钻 sub', { size: 17, w: 600 });
      g += h.txt(30, 50, '图例：蓝框=本帧正在处理的元素　浅蓝=它内部的元素　大框=子表（tag=1，用 sub 钻进去）　小框=原子（tag=0）',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      function samePath(a, bb) { return a && bb && a.length === bb.length && a.every(function (x, i) { return x === bb[i]; }); }
      function isDesc(a, bb) { return a && bb && a.length > bb.length && bb.every(function (x, i) { return a[i] === x; }); }
      function measure(x) {
        if (isAtom(x)) return 46;
        if (!x.length) return 46;
        var w = 14;
        x.forEach(function (z) { w += measure(z) + 8; });
        return Math.max(w + 6, 60);
      }
      /* 往里嵌套一层，父框就要往下多长 12px，否则子表框会探出父表框 */
      function nestDepth(x) {
        if (isAtom(x) || !x.length) return 0;
        return 1 + Math.max.apply(null, x.map(nestDepth));
      }
      function draw(x, px, py, path) {
        /* hot = 本帧正在处理的元素；inside = 它内部的元素（祖先不跟着发蓝，否则整张表都蓝了） */
        var hot = sel && samePath(s.hl.node, path);
        var inside = sel && path.length > 0 && isDesc(path, s.hl.node);
        if (isAtom(x)) {
          g += h.rect(px, py, 40, 26, { fill: hot ? C.blueBg : inside ? '#f4f8ff' : '#fff', stroke: hot ? C.blue : inside ? '#cfe0f7' : C.grey, sw: hot ? 2.6 : 1.3, rx: 5 });
          g += h.txt(px + 20, py + 18, x, { size: 13, w: 700 });
          return 46;
        }
        if (!x.length) {
          g += h.rect(px, py, 40, 26, { fill: hot ? C.blueBg : inside ? '#f4f8ff' : '#fff', stroke: hot ? C.blue : inside ? '#cfe0f7' : C.grey, sw: hot ? 2.6 : 1.3, rx: 5 });
          g += h.txt(px + 20, py + 18, '()', { size: 12, fill: hot ? C.blue : C.muted });
          return 46;
        }
        var w = measure(x);
        g += h.rect(px, py - 6, w, 40 + 12 * nestDepth(x), { fill: inside ? '#f4f8ff' : 'none', stroke: hot ? C.blue : inside ? '#cfe0f7' : C.line, sw: hot ? 2.6 : inside ? 1.4 : 1.2, rx: 7 });
        var cx = px + 8;
        x.forEach(function (z, k) {
          var zw = draw(z, cx, py + 8, path.concat([k]));
          if (k < x.length - 1) g += h.arrow(cx + zw - 2, py + 21, cx + zw + 8, py + 21, { stroke: '#c3ccd8', sw: 1.1, head: 5 });
          cx += zw + 8;
        });
        return w;
      }
      var total = measure(s.L);
      /* 选中某元素时高亮它本身；没选中元素（path 为空）时不要整张表发蓝 */
      var sel = s.hl && s.hl.node && s.hl.node.length;
      draw(s.L, (W - total) / 2, 88, []);
      /* 三域结点示意 */
      var ny = 210;
      g += h.txt(W / 2, ny - 12, '每个元素一个这样的结点：往下钻用 sub，同层横着走用 tp', { size: 12.5, fill: C.muted });
      var tw = [56, 156, 56], names = ['tag', 'atom  |  sub', 'tp'], tx = (W - (tw[0] + tw[1] + tw[2] + 24)) / 2;
      names.forEach(function (nm, i) {
        g += h.rect(tx, ny, tw[i], 34, { fill: i === 1 ? '#f8fafc' : '#fff', stroke: C.grey, sw: 1.4, rx: 4 });
        g += h.txt(tx + tw[i] / 2, ny + 22, nm, { size: 12, w: 600, family: 'Consolas,monospace' });
        tx += tw[i] + 12;
      });
      g += h.txt(W / 2, ny + 54, 'tag=0 → 中间存原子值；tag=1 → 中间存子表首元素的表头指针 sub；tp 指向同层下一个元素（无则 NULL）',
        { size: 11.5, fill: C.muted });
      /* 四个量的对照表：把最容易混的几组并排放 */
      var ty = 300, colw = 150, rows = [
        ['最外层元素', s.L.map(show).join(', ')],
        ['GetHead', show(s.L[0]) + '　（' + (isAtom(s.L[0]) ? '原子' : '子表') + '，是一个元素）'],
        ['GetTail', (s.L.length > 1 ? '(' + s.L.slice(1).map(show).join(',') + ')' : 'NULL') + '　（是一张表）'],
        ['Length', lenOf(s.L) + '　（只数最外层，子表算 1 个）'],
        ['Depth', depthOf(s.L) + '　（递归取最大，空表 () 记 1）']
      ];
      g += h.rect((W - 620) / 2, ty - 24, 620, rows.length * 28 + 20, { fill: '#f8fafc', stroke: C.line, sw: 1, rx: 8 });
      rows.forEach(function (r2, i) {
        g += h.txt((W - 620) / 2 + 16, ty + i * 28, r2[0], { size: 12, w: 700, fill: C.muted, anchor: 'start' });
        g += h.txt((W - 620) / 2 + 130, ty + i * 28, r2[1], { size: 12, fill: C.ink, anchor: 'start' });
      });
      var res = s.scene === 'head' ? 'GetHead = ' + show(s.L[0])
        : s.scene === 'tail' ? 'GetTail = ' + (s.L.length > 1 ? '(' + s.L.slice(1).map(show).join(',') + ')' : 'NULL')
          : s.scene === 'len' ? 'Length = ' + lenOf(s.L)
            : s.scene === 'depth' ? 'Depth = ' + depthOf(s.L) : '最外层 ' + lenOf(s.L) + ' 个元素';
      g += h.txt(W / 2, H - 18, s.done ? '★ ' + res + '　（' + s.text + '）'
        : '表头是「一个元素」（可以是原子）；表尾是「一张表」（去掉首元素后剩下的整体）',
        { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
