/* 动画：B 树插入与查找、B+ 树结构与叶子链表（408 大纲 六(六)） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**（引擎 code.map(function (t, i)) 比对），不是行号 */
  var BCODE = [
    '// m 阶 B 树：每个结点关键字数 ∈ [⌈m/2⌉−1, m−1]（根至少 1 个）',
    'Status Search(BTree T, KeyType k) {',
    '    p = T;  i = 1;',
    '    while (p && i <= p->num && k != p->key[i]) {',
    '        if (k < p->key[i])  i--;            // 走左子树',
    '        else { i++;  p = p->child[i]; }     // 一次下探 = 一次外存读',
    '    }',
    '    return p ? FOUND : NOTFOUND;',
    '}',
    'void Insert(BTree &T, KeyType k) {',
    '    沿 Search 的走法下降到叶子结点 p;',
    '    把 k 插入 p，使 p 仍保持有序;',
    '    while (p->num > m−1) {                  // 关键字数超限 → 分裂',
    '        mid = ⌈m/2⌉−1;  x = p->key[mid];    // 中位数 x 上移',
    '        左块 = key[0..mid−1]，右块 = key[mid+1..];',
    '        if (p 是根) { T = 新根 [x]; break; }  // 树长高一层',
    '        把 x 插进父结点;  p = 父;             // 父结点可能继续分裂',
    '    }',
    '}'
  ];
  var PCODE = [
    '// B+ 树：非叶结点只作索引，全部关键字都在叶子层，叶子串成链表',
    'void Insert(BPlus &T, KeyType k) {',
    '    下降到叶子 p;',
    '    把 k 插入 p，使 p 仍保持有序;',
    '    if (p->num > m−1) {                      // 叶子分裂',
    '        mid = ⌈m/2⌉;  sep = p->key[mid];     // ★ 复制上移，不是中位数',
    '        左块 = key[0..mid−1]，右块 = key[mid..]; // sep 仍留在叶子里',
    '        右块.next = 原后继叶子;               // 维持叶子链表',
    '        把 sep 插进父结点;  p = 父;',
    '    } else if (内部结点超限) {',
    '        mid = ⌈m/2⌉−1;  中位数上移;           // 这一层与 B 树相同',
    '    }',
    '}',
    'Status Search(BPlus &T, KeyType k) {',
    '    沿索引层下降到叶子，再在叶子内找 k;        // 比较次数只看非叶',
    '    范围查找：找到起点后沿叶子链表右移，不必回到根',
    '}'
  ];

  function mk(leaf) { return { id: 0, leaf: !!leaf, keys: [], ch: [] }; }
  function clone(n) {
    return { id: n.id, leaf: n.leaf, keys: n.keys.slice(), ch: n.ch.map(clone) };
  }
  function leaves(n, out) {
    if (n.leaf) { out.push(n); return out; }
    n.ch.forEach(function (c) { leaves(c, out); });
    return out;
  }
  function depth(n) { return n.leaf ? 1 : 1 + Math.max.apply(null, n.ch.map(depth)); }
  function count(n) { return n.keys.length + (n.leaf ? 0 : n.ch.reduce(function (a, c) { return a + count(c); }, 0)); }

  DSC.reg({
    id: 'btree', ch: 7, name: 'B 树与 B+ 树：多路平衡与分裂上移',
    note: '408 大纲 六(六) B 树及其基本操作、B+ 树的基本概念（插入分裂、查找路径、叶子链表）',
    guide: [
      'B 树是为**外存**设计的多路平衡搜索树：一层结点 = 一次磁盘读，所以"又矮又宽"——m 越大树高越小，读写次数越少',
      'm 阶 B 树每个结点最多 **m−1 个关键字**；插入超了就分裂：取 mid = ⌈m/2⌉−1，**中位数上移**给父结点，左右两半各自成为一块',
      '分裂可能一路传到根：根一分裂，树就**长高一层**，其它所有叶子仍然同层——这就是"平衡"的含义',
      'B+ 树的两处不同：① 叶子分裂时上移的是**右半第一个关键字的副本**（叶子仍保留它）；② 全部关键字都在叶子层并串成**链表**，所以范围查找不用回到根'
    ],
    inputs: [
      {
        key: 'scene', label: '场景', type: 'select', options: [
          ['ins', 'B 树 · 插入（分裂上移）'], ['search', 'B 树 · 查找路径'],
          ['plus', 'B+ 树 · 插入与叶子链表']
        ], value: 'ins'
      },
      { key: 'order', label: '阶数 m（3~5）', type: 'number', value: 3, min: 3, max: 5 },
      { key: 'seq', label: '插入序列（逗号分隔，4~12 个）', type: 'text', value: '10,20,30,40,50,60,70,80,90' },
      { key: 'target', label: '查找值（查找场景用）', type: 'number', value: 40, min: -999, max: 999 }
    ],

    run: function (v) {
      /* 键名不能叫 m：深链 #m=<模块 id> 会把这个键当成模块选择器，值就成了字符串 */
      var scene = v.scene, m = +v.order, plus = scene === 'plus';
      if (!(m >= 3 && m <= 5)) throw Error('阶数 m 须在 3~5 之间');
      var keys = String(v.seq).split(/[,，\s]+/).filter(Boolean).map(Number);
      if (keys.some(isNaN)) throw Error('插入序列必须是整数');
      if (keys.length < 4 || keys.length > 12) throw Error('请输入 4~12 个整数');
      var maxK = m - 1, mid = Math.ceil(m / 2) - 1, leafMid = Math.ceil(m / 2);
      var frames = [], nid = 0, splits = 0;
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: snap });
      }
      var T = { root: Object.assign(mk(true), { id: ++nid }) };
      var pending = keys.slice();   /* 首帧也要把待插入序列画出来 */
      function total() {
        return plus ? leaves(T.root, []).reduce(function (a, l) { return a + l.keys.length; }, 0) : count(T.root);
      }
      function view(o) {
        return Object.assign({ tree: clone(T.root), m: m, plus: plus, maxK: maxK, remain: pending.slice(), splits: splits,
          h: depth(T.root), n: total() }, o || {});
      }

      function insert(k, emit) {
        var path = [], node = T.root;
        while (!node.leaf) {
          var i = 0;
          while (i < node.keys.length && k > node.keys[i]) i++;
          if (emit) F([10], '下降到结点 [' + node.keys.join(' ') + ']：' + k +
            (node.keys[i] != null ? ' < ' + node.keys[i] + ' → 走指针 ' + i : ' 比所有关键字都大 → 走最右指针 ' + node.keys.length) +
            '。每下一层就是一次外存读。',
            { 树高: depth(T.root) + '', 关键字数: total() + ' 个' },
            view({ path: path.map(function (p) { return p.n.id; }), at: node.id, take: i, key: k }));
          path.push({ n: node, i: i });
          node = node.ch[i];
        }
        var pos = 0;
        while (pos < node.keys.length && node.keys[pos] < k) pos++;
        node.keys.splice(pos, 0, k);
        if (emit) F([11], k + ' 插入叶子结点，插完是 [' + node.keys.join(' ') + ']（结点最多 m−1 = ' + maxK + ' 个关键字）。',
          { 树高: depth(T.root) + '', 关键字数: total() + ' 个' },
          view({ at: node.id, hot: pos, key: k }));
        var cur = node;
        while (cur.keys.length > maxK) {
          var isPlusLeaf = plus && cur.leaf;
          var cut = isPlusLeaf ? leafMid : mid;
          var up = cur.keys[cut];
          var L = Object.assign(mk(cur.leaf), { id: ++nid });
          var R = Object.assign(mk(cur.leaf), { id: ++nid });
          L.keys = cur.keys.slice(0, cut);
          R.keys = cur.keys.slice(isPlusLeaf ? cut : cut + 1);
          if (!cur.leaf) {
            L.ch = cur.ch.slice(0, cut + 1);
            R.ch = cur.ch.slice(isPlusLeaf ? cut : cut + 1);
          }
          splits++;
          if (path.length === 0) {
            var nr = Object.assign(mk(false), { id: ++nid });
            nr.keys = [up]; nr.ch = [L, R];
            T.root = nr;
            if (emit) F(plus ? (cur.leaf ? [5, 6, 7] : [10]) : [13, 14, 15],
              '★ 分裂的是**根**：' + (isPlusLeaf ? '把 ' + up + ' 复制一份上去做新根（叶子仍然留着它）' : '中位数 ' + up + ' 上移') +
              '成新根，左块 [' + L.keys.join(' ') + ']、右块 [' + R.keys.join(' ') + ']。树高 +1，其余叶子仍然同层。',
              { 树高: depth(T.root) + '', 关键字数: total() + ' 个', 分裂次数: splits + '' },
              view({ newRoot: nr.id, up: up, key: k }));
            break;
          }
          var p = path.pop();
          p.n.keys.splice(p.i, 0, up);
          p.n.ch[p.i] = L;
          p.n.ch.splice(p.i + 1, 0, R);
          if (emit) F(plus ? (cur.leaf ? [5, 6, 7, 8] : [10]) : [12, 13, 14, 16],
            (cur.leaf ? '叶子结点 [' : '内部结点 [') + cur.keys.join(' ') + '] 有 ' + cur.keys.length +
            ' 个关键字 > m−1 = ' + maxK + ' → 在 mid = ' + cut + ' 处分裂：' +
            (isPlusLeaf ? up + ' 是**复制**上移（叶子仍然留着它），右块还要接上叶子链表'
              : '中位数 ' + up + ' **上移**进父结点') +
            '，左块 [' + L.keys.join(' ') + ']、右块 [' + R.keys.join(' ') + ']。',
            { 树高: depth(T.root) + '', 关键字数: total() + ' 个', 分裂次数: splits + '' },
            view({ at: p.n.id, up: up, key: k, splitId: cur.id }));
          cur = p.n;
        }
      }

      if (scene === 'search') {
        keys.forEach(function (k) { insert(k, false); });
        pending = [];   /* 树已经建好，查找场景不该再显示待插入序列 */
        var t = +v.target;
        F([1], '先把 ' + keys.length + ' 个关键字插成一棵 ' + m + ' 阶 B 树（树高 ' + depth(T.root) +
          '），再来查 ' + t + '。B 树的查找就是"结点内二分 + 沿指针下探"。',
          { 树高: depth(T.root) + '', 关键字数: total() + ' 个' }, view({}));
        var node = T.root, lvl = 0, cmp = 0, hit = null;
        while (node) {
          var i2 = 0;
          while (i2 < node.keys.length && t > node.keys[i2]) { cmp++; i2++; }
          if (i2 < node.keys.length && node.keys[i2] === t) {
            cmp++;
            F([3], '第 ' + (lvl + 1) + ' 层 [' + node.keys.join(' ') + ']：逐个回答「' + t +
              ' 等于第几个关键字？」——第 ' + (i2 + 1) + ' 个就是，**命中**。累计比较 ' + cmp + ' 次。',
              { 比较次数: cmp + ' 次', 结果: '命中' },
              view({ at: node.id, hot: i2, found: true, target: t }));
            hit = true; break;
          }
          if (node.leaf) {
            F([3, 6], '叶子层 [' + node.keys.join(' ') + '] 里没有 ' + t + '，它该在的位置是空的 → 查找失败。B 树查失败也要走到叶子。',
              { 比较次数: cmp + ' 次', 结果: '未找到' }, view({ at: node.id, target: t }));
            break;
          }
          F([3, 4, 5], '第 ' + (lvl + 1) + ' 层 [' + node.keys.join(' ') + ']：' + t + ' 与这里的 ' + node.keys.length +
            ' 个关键字比过，' + (i2 < node.keys.length ? t + ' < ' + node.keys[i2] + ' → 走指针 ' + i2 : '都比 ' + t + ' 小 → 走指针 ' + node.keys.length) +
            '。一次下探 = 一次外存读。',
            { 比较次数: cmp + ' 次', 层: (lvl + 1) + ' / ' + depth(T.root) },
            view({ at: node.id, take: i2, target: t }));
          node = node.ch[i2]; lvl++;
        }
        if (!hit) F([7], '✗ 未找到：' + t + ' 不在树里，下探到了空指针。查找失败要走到叶子层之外，比较次数 = 树高 × 每层关键字数。',
          { 比较次数: cmp + ' 次', 结果: '查找失败' }, view({ target: t, miss: true, done: true }));
        else F([7], '★ 查找结束：' + t + ' 命中在第 ' + lvl + ' 层。整棵树的树高只有 ' + depth(T.root) +
          '，所以最多 ' + depth(T.root) + ' 次外存读——这就是外存索引结构都长成 B 树/B+ 树的原因。',
          { 比较次数: cmp + ' 次', 结果: '命中', 树高: depth(T.root) + '' },
          view({ target: t, found: true, done: true }));
        return { code: BCODE, frames: frames };
      }

      F([plus ? 1 : 9], (plus ? 'B+ 树插入：' : m + ' 阶 B 树：') + '每个结点最多 m−1 = ' + maxK +
        ' 个关键字。下面按 ' + keys.join(', ') + ' 逐个插入。',
        { 树高: '1', 关键字数: '0 个' }, view({}));
      keys.forEach(function (k) {
        pending = keys.slice(keys.indexOf(k) + 1);
        insert(k, true);
      });
      var lv = leaves(T.root, []);
      F(plus ? [14, 15] : [17], '★ 完成：' + keys.length + ' 个关键字，树高 ' + depth(T.root) + '、' +
        (plus ? lv.length + ' 个叶子结点串成链表；' : lv.length + ' 个叶子全部同层；') +
        '共分裂 ' + splits + ' 次。' +
        (plus ? '注意叶子把上移过的关键字**又**存了一份（' + lv.map(function (x) { return x.keys.join(' '); }).join(' | ') +
          '），非叶只是索引——范围查找沿叶子链表走就行。'
          : '任何时刻所有叶子都在同一层，这是 B 树"平衡"的定义；同一串数插进二叉排序树会退化成一条链。'),
        { 树高: depth(T.root) + '', 关键字数: total() + ' 个', 分裂次数: splits + '', 叶子数: lv.length + ' 个' },
        view({ done: true, chain: plus }));
      return { code: plus ? PCODE : BCODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 560, g = '';
      var KW = 34, NH = 38;
      var title = s.plus ? 'B+ 树（' + s.m + ' 阶）· 非叶只作索引，叶子串成链表'
        : 'B 树（' + s.m + ' 阶）· 每个结点最多 ' + s.maxK + ' 个关键字';
      g += h.txt(W / 2, 28, title, { size: 17, w: 600 });
      g += h.txt(30, 48, '图例：蓝=本次查找/下降经过的结点 橙=正在比较或刚插入的关键字 绿=刚上移的关键字 白=其余',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      /* 布局：叶子占槽，父结点居中于首尾孩子之间 */
      var pos = {}, lf = [], nid = 0;
      (function walk(n, lvl) {
        nid++;
        if (n.leaf) { pos[n.id] = { lvl: lvl, slot: lf.length }; lf.push(n); return pos[n.id]; }
        var first = null, last = null;
        n.ch.forEach(function (c) {
          var r = walk(c, lvl + 1);
          if (first === null) first = r;
          last = r;
        });
        pos[n.id] = { lvl: lvl, slot: (first.slot + last.slot) / 2 };
        return pos[n.id];
      })(s.tree, 0);
      var slots = Math.max(lf.length, 1), D = 0;
      Object.keys(pos).forEach(function (k) { D = Math.max(D, pos[k].lvl); });
      var rowH = Math.min(96, 300 / (D + 1)), sw = (W - 120) / slots;
      function cx(n) { return 60 + (pos[n.id].slot + 0.5) * sw; }
      function cy(n) { return 84 + pos[n.id].lvl * rowH; }
      function boxW(n) { return Math.max(n.keys.length, 1) * KW; }
      function each(n, f) { f(n); (n.ch || []).forEach(function (c) { each(c, f); }); }

      /* 先画指针线，再画盒子（盒子压在线上） */
      each(s.tree, function (n) {
        if (n.leaf) return;
        var x0 = cx(n) - boxW(n) / 2, yb = cy(n) + NH;
        n.ch.forEach(function (c, i) {
          var px = x0 + i * KW, hot = s.at === n.id && s.take === i;
          if (px < 12) px = 12;
          g += h.line(px, yb, cx(c), cy(c), { stroke: hot ? C.amber : s.path && s.path.indexOf(c.id) >= 0 ? C.blue : C.grey, sw: hot ? 2.4 : 1.4 });
        });
      });
      /* B+ 的叶子链表 */
      if (s.plus && lf.length > 1) {
        for (var li = 0; li < lf.length - 1; li++) {
          var a = lf[li], b = lf[li + 1];
          g += h.arrow(cx(a) + boxW(a) / 2 + 2, cy(a) + NH / 2, cx(b) - boxW(b) / 2 - 2, cy(b) + NH / 2,
            { stroke: C.green, sw: 1.6, head: 7 });
        }
      }
      each(s.tree, function (n) {
        var x0 = cx(n) - boxW(n) / 2, y = cy(n), onPath = s.path && s.path.indexOf(n.id) >= 0;
        var here = s.at === n.id;
        g += h.rect(x0, y, boxW(n), NH, {
          fill: here ? C.amberBg : onPath ? C.blueBg : '#fff',
          stroke: here ? C.amber : onPath ? C.blue : C.green, sw: here ? 2.6 : 1.6, rx: 6
        });
        n.keys.forEach(function (kv, ki) {
          var hot = here && s.hot === ki;
          var upped = s.up != null && kv === s.up;
          g += h.txt(x0 + ki * KW + KW / 2, y + 25, String(kv), {
            size: 13, w: hot || upped ? 700 : 400, fill: upped ? C.green : hot ? C.amber : C.ink
          });
        });
      });
      if (lf.length) {
        g += h.txt(60, cy(lf[0]) + NH + 22, '叶子层' + (s.plus ? '（全部关键字都在这里，串成链表）' : '（同层）'),
          { size: 11, fill: C.muted, anchor: 'start' });
      }
      var sy = 452, remain = s.remain || [];
      if (remain.length) {
        g += h.txt(30, sy, '待插入：', { size: 13, fill: C.muted, anchor: 'start', w: 600 });
        remain.forEach(function (rv, ri) {
          var x = 104 + ri * 40;
          g += h.rect(x, sy - 18, 34, 26, { fill: '#fff', stroke: C.line, sw: 1, rx: 5 });
          g += h.txt(x + 17, sy, String(rv), { size: 12.5, fill: C.muted });
        });
      }
      if (s.target != null) {
        g += h.txt(30, sy + 36, '查找路径：', { size: 13, fill: C.muted, anchor: 'start', w: 600 });
        g += h.txt(114, sy + 36, String(s.target) + (s.found ? ' 命中' : s.miss ? ' 未找到' : ' 下探中…'),
          { size: 13, w: 600, fill: s.found ? C.green : s.miss ? C.red : C.amber, anchor: 'start' });
      }
      var note = s.done
        ? (s.plus ? 'B+ 树：叶子保留全部关键字并串成链表，非叶只是索引 —— 等值查找走树、范围查找走链表'
          : 'B 树：所有叶子同层，插入只从叶子分裂上移，永远不会局部失衡')
        : (s.plus ? '分裂时上移的是右半第一个关键字的**副本**，叶子仍然留着它——这是 B+ 与 B 树最容易考的区别'
          : '插入 → 有序放进叶子 → 超过 m−1 就分裂 → 中位数上移，可能一路传到根');
      g += h.txt(W / 2, H - 22, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: s.done ? 600 : 400 });
      return h.svg(W, H, g);
    }
  });
})();
