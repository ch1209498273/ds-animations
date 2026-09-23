/* 动画：树的三种存储结构对照——双亲表示 / 孩子表示 / 孩子兄弟表示（408 大纲 四(三)1） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '/* ① 双亲表示法：一维数组，每个结点只记"我爹是谁" */',
    '#define MAX 8',
    'typedef struct {',
    '    PTType data;',
    '    int parent;                 // −1 表示根',
    '} PNode;',
    'PNode tree[MAX];',
    'int Parent(int i) { return tree[i].parent; }          // O(1)',
    'int FirstChild(int i) {',
    '    for (j = 0; j < MAX; ++j)',
    '        if (tree[j].parent == i)  return j;  // 只能全表扫  O(n)',
    '    return −1;',
    '}',
    '',
    '/* ② 孩子表示法：数组 + 每行一条孩子单链表 */',
    'typedef struct CNode { int child; struct CNode *next; } CNode, *Link;',
    'typedef struct { PTType data; Link firstchild; } CBox;',
    'CBox list[MAX];',
    'int Parent(int v) {',
    '    for (i = 0; i < MAX; ++i)',
    '        for (p = list[i].firstchild; p; p = p->next)',
    '            if (p->child == v)  return i;    // 遍历所有链表  O(n)',
    '}',
    '',
    '/* ③ 孩子兄弟表示法（二叉链表）：左=第一个孩子，右=下一个兄弟 */',
    'typedef struct CSNode {',
    '    PTType data;',
    '    struct CSNode *firstchild, *nextsibling;',
    '} CSNode, *CSTree;',
    '/* 树 → 二叉树的"左孩子右兄弟"，森林与树因此能用同一套二叉树算法 */'
  ];

  /* 固定的树：A 有 B、C、D；B 有 E、F；C 有 G；D 有 H（下标即数组位置） */
  var LBL = 'ABCDEFGH'.split('');
  var PAR = [-1, 0, 0, 0, 1, 1, 2, 3];
  var KID = [[1, 2, 3], [4, 5], [6], [7], [], [], [], []];
  var POS = { A: [490, 96], B: [250, 168], C: [490, 168], D: [730, 168],
    E: [170, 240], F: [320, 240], G: [490, 240], H: [730, 240] };

  DSC.reg({
    id: 'treeStore', ch: 5, name: '树的三种存储结构：双亲 / 孩子 / 孩子兄弟',
    note: '408 大纲 四(三)1 树的存储结构（三种表示在同一棵树上对照，找爹与找孩子各要摸几格）',
    guide: [
      '二叉树只用"最多两个孩子"，所以能靠下标算父子；**普通树孩子个数不定**，必须换表示法——这就是三种存储结构的由来',
      '**双亲表示法**：数组里每格只记 `parent`。找爹 O(1)，但找孩子只能把整张表扫一遍',
      '**孩子表示法**：数组每格挂一条孩子单链表。找孩子顺着链表走就行，找爹却要把**所有链表**遍历一遍',
      '**孩子兄弟表示法**（左孩子右兄弟二叉链表）：`firstchild` 指大孩子、`nextsibling` 指下一个兄弟。三种里只有它能表示**森林**，也正是"树/森林 → 二叉树"那节用的结构'
    ],
    inputs: [
      {
        key: 'way', label: '存储结构', type: 'select', options: [
          ['parent', '① 双亲表示法（数组 + parent 域）'],
          ['child', '② 孩子表示法（数组 + 孩子链表）'],
          ['sib', '③ 孩子兄弟表示法（二叉链表）']
        ], value: 'sib'
      },
      { key: 'target', label: '要查的结点（找它的孩子与双亲）', type: 'text', value: 'B' }
    ],

    run: function (v) {
      var way = v.way, frames = [];
      var t = String(v.target).trim().toUpperCase().charAt(0);
      var ti = LBL.indexOf(t);
      if (ti < 0) throw Error('结点请用 A~H 之一');
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          way: way, scan: [], hit: [], cur: ti, done: false
        }, snap || {}) });
      }
      var kids = KID[ti], par = PAR[ti];
      var PN = { parent: '① 双亲表示法', child: '② 孩子表示法', sib: '③ 孩子兄弟表示法' }[way];

      if (way === 'parent') {
        F([1, 2, 3, 4, 5, 6], PN + '：一维数组，每格只有 `data` 和 `parent` 两个域，`parent = −1` 表示它是根。' +
          '结点的**位置**就是它的编号，所以 A=0、B=1 … H=7。',
          { 结点数: '8 个', 每格占用: '数据 + 1 个 int' }, {});
        F([7], '先做"找双亲"：`Parent(' + ti + ')` 就是 `tree[' + ti + '].parent` = ' + par + '（' + (par < 0 ? '它是根' : LBL[par]) + '）。' +
          '**一次取值，不查表**——这是双亲表示法的全部优点。',
          { 找双亲: t + ' → ' + (par < 0 ? '无（根）' : LBL[par]), 访问格数: '1 格' }, { hit: par >= 0 ? [par] : [ti] });
        var seq = [];
        for (var i = 0; i < 8; i++) {
          seq.push(i);
          F([8, 9, 10], '再找孩子就难受了：`FirstChild(' + ti + ')` 只能从 0 号格开始比 `tree[j].parent == ' + ti + '`。' +
            '扫到第 ' + (i + 1) + ' 格 ' + LBL[i] + '（parent=' + PAR[i] + '）' + (PAR[i] === ti ? ' → **命中**' : ' → 不等，继续'),
            { 已扫格数: (i + 1) + ' / 8', 当前比较: 'tree[' + i + '].parent == ' + ti }, { scan: seq.slice(), hit: kids });
        }
        F([10, 11], '★ 全表扫完 8 格，才找到 ' + t + ' 的 ' + kids.length + ' 个孩子（' + (kids.map(function (k) { return LBL[k]; }).join('、') || '无') + '）。' +
          '所以双亲表示法：**找爹 O(1)、找孩子 O(n)**，而且求树高、判兄弟都得反复扫表。',
          { 找孩子: kids.map(function (k) { return LBL[k]; }).join('、') || '叶子', 访问格数: '8 格' },
          { scan: [], hit: kids, done: true });
      } else if (way === 'child') {
        F([15, 16, 17, 18], PN + '：数组下标仍是结点编号，但每格挂一条**孩子单链表**，链上依次是它的孩子。' +
          'A 的链表是 B→C→D，B 的是 E→F，叶子挂空链。',
          { 结点数: '8 个', 链表总长: '7 个链结点（= 边数）' }, {});
        F([16, 17], '先做"找孩子"：`list[' + ti + '].firstchild` 顺链走 ' + kids.length + ' 步就是 ' +
          (kids.map(function (k) { return LBL[k]; }).join(' → ') || '空') + '。**不碰其它结点**，O(孩子数)。',
          { 找孩子: kids.map(function (k) { return LBL[k]; }).join('、') || '叶子', 访问格数: (kids.length + 1) + ' 格' },
          { hit: kids });
        var walked = [];
        for (var j = 0; j < 8; j++) {
          walked.push(j);
          var found = KID[j].indexOf(ti) >= 0;
          F([19, 20, 21, 22], '找双亲就反过来：只能把每条孩子链表都走一遍，看 ' + t + ' 出现在谁的链上。' +
            '查到 list[' + j + ']（' + LBL[j] + '）的链：' + (KID[j].map(function (k) { return LBL[k]; }).join('→') || '空') +
            (found ? ' → **在里面！爹就是 ' + LBL[j] + '**' : ' → 没有，换下一条'),
            { 已查头结点: (j + 1) + ' / 8', 当前链表: LBL[j] + ' 的孩子' }, { scan: walked.slice(), hit: par >= 0 ? [par] : [] });
        }
        F([22], '★ 遍历了 8 条链表才找到 ' + t + ' 的双亲（' + (par < 0 ? '它是根，本来就没有' : LBL[par]) + '）。' +
          '所以孩子表示法正好和双亲表示法**反过来**：找孩子快、找爹 O(n)。' +
          '两种各快一半，谁也帮不了谁——这就是要引出第三种的原因。',
          { 找双亲: par < 0 ? '无（根）' : LBL[par], 访问格数: '8 条链' }, { scan: [], hit: [], done: true });
      } else {
        F([25, 26, 27, 28], PN + '：每个结点两个指针——`firstchild` 指**第一个孩子**，`nextsibling` 指**下一个兄弟**。' +
          '于是"一长串孩子"被压成一条兄弟链，任意一棵树都能这样表成二叉树。',
          { 结点数: '8 个', 每格占用: '数据 + 2 个指针' }, {});
        var chain = [], k = ti;
        F([27, 28], t + ' 的 `firstchild` 指向' + (kids.length ? '大孩子 ' + LBL[kids[0]] : '空（它是叶子）') + '。',
          { 第一步: 'firstchild(' + t + ') → ' + (kids.length ? LBL[kids[0]] : 'NULL') }, { hit: kids.slice(0, 1) });
        if (kids.length) {
          chain.push(kids[0]);
          for (var q = 1; q < kids.length; q++) {
            chain.push(kids[q]);
            F([28], '再顺 `nextsibling` 往右：' + LBL[chain[q - 1]] + ' 的兄弟是 ' + LBL[kids[q]] + '。' +
              '走了 ' + chain.length + ' 个链结点拿到 ' + t + ' 的全部孩子。',
              { 孩子链: chain.map(function (x) { return LBL[x]; }).join(' → ') }, { hit: chain.slice() });
          }
        }
        F([27, 28], '★ 找孩子：' + t + ' → ' + (kids.map(function (x) { return LBL[x]; }).join('、') || '无') +
          '，代价只跟**孩子个数**有关，跟树的规模无关。',
          { 找孩子: kids.map(function (x) { return LBL[x]; }).join('、') || '叶子', 访问格数: (kids.length + 1) + ' 格' },
          { hit: kids });
        /* 找爹：从根沿 firstchild / nextsibling 走到目标所在的兄弟链 */
        var path = [];
        if (par >= 0) {
          var walk = [0];
          if (ti !== 1 && ti !== 2 && ti !== 3) {
            walk.push(PAR[ti]);        // 先下到大孩子那一层
            for (var w = 0; w < 8; w++) if (PAR[w] === PAR[ti] && w !== ti) walk.push(w);
          }
          F([27, 28], '但找爹仍然不行——**结点里根本没存爹**。只能从根 A 出发，沿 firstchild 下、沿 nextsibling 右，' +
            '一个个问「你的孩子是不是 ' + t + '？」。要走过 ' + (ti <= 3 ? 'A 的兄弟链' : LBL[par] + ' 的孩子链') + '。',
            { 找双亲: '必须自顶向下搜', 访问格数: 'O(n)' }, { scan: walk.slice(), hit: [par] });
        } else {
          F([27, 28], '而 ' + t + ' 本身就是根，没有双亲——不过要判断"它是不是根"，' +
            '在双亲表示法里看一眼 parent==−1 就行，这里却得从它往上搜一遍才知道没人指着它。',
            { 找双亲: '无（根）', 访问格数: 'O(n)' }, { scan: [ti] });
        }
        F([29], '★ 三种里只有孩子兄弟表示法能顺手表示**森林**（把各棵树的根串成兄弟链即可），' +
          '而且它就是把树画成二叉树的那个样子——"左孩子右兄弟"。' +
          '代价是找爹最麻烦，且每格要存两个指针。',
          { 找双亲: '自顶向下搜', 每格占用: '数据 + 2 个指针' }, { scan: [], hit: [], done: true });
      }
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 540, g = '';
      /* 上半：同一棵树 */
      g += h.txt(W / 2, 28, '树的存储结构对照 · 同一棵树，看' + (s.way === 'parent' ? '扫全表找孩子' :
        s.way === 'child' ? '遍历所有链表找爹' : '左孩子右兄弟') + '要摸多少格', { size: 16.5, w: 600 });
      for (var i = 0; i < 8; i++) {
        if (PAR[i] < 0) continue;
        var hot = s.scan.indexOf(i) >= 0 || s.hit.indexOf(i) >= 0 || s.cur === i;
        g += h.line(POS[LBL[PAR[i]]][0], POS[LBL[PAR[i]]][1] + 17, POS[LBL[i]][0], POS[LBL[i]][1] - 17,
          { stroke: hot ? C.amber : C.grey, sw: hot ? 2.2 : 1.2 });
      }
      LBL.forEach(function (lb, ix) {
        var p = POS[lb], cur = s.cur === ix, hot = s.hit.indexOf(ix) >= 0, scan = s.scan.indexOf(ix) >= 0;
        g += h.circle(p[0], p[1], 17, {
          fill: cur ? C.blueBg : hot ? C.greenBg : scan ? C.amberBg : '#fff',
          stroke: cur ? C.blue : hot ? C.green : scan ? C.amber : C.grey, sw: cur || hot || scan ? 2.8 : 1.4
        });
        g += h.txt(p[0], p[1] + 5, lb, { size: 13.5, w: 700 });
      });
      /* 下半：所选表示法的结构图 */
      var y0 = 300, cw = 92, chh = 34;
      function cellX(i) { return 60 + i * (cw + 8); }
      if (s.way === 'parent') {
        g += h.txt(60, y0 - 14, '数组 tree[]（下标即结点编号）', { size: 12, fill: C.muted, anchor: 'start' });
        for (var i2 = 0; i2 < 8; i2++) {
          var cur2 = s.cur === i2, scan = s.scan.indexOf(i2) >= 0, hit = s.hit.indexOf(i2) >= 0;
          g += h.rect(cellX(i2), y0, cw, 26, { fill: cur2 ? C.blueBg : '#fff', stroke: cur2 ? C.blue : C.grey, sw: cur2 ? 2.2 : 1.2, rx: 4 });
          g += h.txt(cellX(i2) + cw / 2, y0 + 18, LBL[i2], { size: 13, w: 700 });
          g += h.rect(cellX(i2), y0 + 30, cw, 26, {
            fill: scan ? C.amberBg : hit ? C.greenBg : '#f8fafc',
            stroke: scan ? C.amber : hit ? C.green : C.line, sw: scan || hit ? 2.2 : 1.2, rx: 4
          });
          g += h.txt(cellX(i2) + cw / 2, y0 + 48, 'parent = ' + PAR[i2], { size: 11, fill: scan || hit ? C.ink : C.muted, family: 'Consolas,monospace' });
        }
        g += h.txt(60, y0 + 86, 'data 域在上、parent 域在下：一个结点只多存了一个整数，代价是"孩子是谁"完全没有记录',
          { size: 11.5, fill: C.muted, anchor: 'start' });
      } else if (s.way === 'child') {
        g += h.txt(60, y0 - 14, '数组 list[]，每格挂一条孩子单链表（沿行向右）', { size: 12, fill: C.muted, anchor: 'start' });
        var rowH = 22;
        for (var i3 = 0; i3 < 8; i3++) {
          var cur3 = s.cur === i3, scan3 = s.scan.indexOf(i3) >= 0, ry = y0 + i3 * rowH;
          g += h.txt(44, ry + 14, i3 + '', { size: 10, fill: C.muted });
          g += h.rect(60, ry, 46, 19, {
            fill: cur3 ? C.blueBg : scan3 ? C.amberBg : '#fff',
            stroke: cur3 ? C.blue : scan3 ? C.amber : C.grey, sw: cur3 || scan3 ? 2.2 : 1.2, rx: 4
          });
          g += h.txt(83, ry + 14, LBL[i3], { size: 12.5, w: 700 });
          if (!KID[i3].length) { g += h.txt(120, ry + 14, '∧', { size: 12, fill: C.grey, anchor: 'start' }); continue; }
          g += h.line(106, ry + 9, 122, ry + 9, { stroke: scan3 ? C.amber : C.grey, sw: 1.3 });
          KID[i3].forEach(function (kd, kj) {
            var xk = 124 + kj * 52, hot = s.hit.indexOf(kd) >= 0;
            g += h.rect(xk, ry, 40, 19, { fill: hot ? C.greenBg : '#f8fafc', stroke: hot ? C.green : C.line, sw: hot ? 2 : 1, rx: 4 });
            g += h.txt(xk + 20, ry + 14, LBL[kd], { size: 12, w: hot ? 700 : 400 });
            if (kj < KID[i3].length - 1) g += h.line(xk + 40, ry + 9, xk + 52, ry + 9, { stroke: C.grey, sw: 1.2 });
          });
        }
        g += h.txt(60, y0 + 8 * rowH + 20, '链上依次是该结点的孩子，∧ = 空链（叶子）。找孩子顺自己那条链就行；找爹要把 8 条链全遍历一遍。',
          { size: 11.5, fill: C.muted, anchor: 'start' });
      } else {
        g += h.txt(60, y0 - 14, '二叉链表：firstchild（左）指大孩子，nextsibling（右）指下一个兄弟',
          { size: 12, fill: C.muted, anchor: 'start' });
        for (var i4 = 0; i4 < 8; i4++) {
          var x4 = cellX(i4), cur4 = s.cur === i4;
          g += h.rect(x4, y0, cw, 24, { fill: cur4 ? C.blueBg : '#fff', stroke: cur4 ? C.blue : C.grey, sw: cur4 ? 2.2 : 1.2, rx: 4 });
          g += h.txt(x4 + cw / 2, y0 + 17, LBL[i4], { size: 13, w: 700 });
          g += h.rect(x4, y0 + 26, cw / 2, 20, { fill: '#f8fafc', stroke: C.line, sw: 1, rx: 3 });
          g += h.rect(x4 + cw / 2, y0 + 26, cw / 2, 20, { fill: '#f8fafc', stroke: C.line, sw: 1, rx: 3 });
          g += h.txt(x4 + cw / 4, y0 + 41, 'child', { size: 9.5, fill: C.muted });
          g += h.txt(x4 + 3 * cw / 4, y0 + 41, 'sibling', { size: 9.5, fill: C.muted });
        }
        /* 指针弧线：firstchild 走下方，nextsibling 走上方 */
        for (var a1 = 0; a1 < 8; a1++) {
          var fc = KID[a1][0], sib = -1;
          if (PAR[a1] >= 0) {
            var bk = KID[PAR[a1]];
            var at = bk.indexOf(a1);
            if (at >= 0 && at + 1 < bk.length) sib = bk[at + 1];
          }
          if (fc != null) {
            var hot1 = s.cur === a1 || s.hit.indexOf(fc) >= 0;
            g += h.arrow(cellX(a1) + cw / 4, y0 + 46, cellX(fc) + cw / 2, y0 + 52,
              { stroke: hot1 ? C.green : C.grey, sw: hot1 ? 2.2 : 1.2, head: 6 });
          }
          if (sib >= 0) {
            var hot2 = s.cur === a1 || s.hit.indexOf(sib) >= 0;
            g += h.arrow(cellX(a1) + 3 * cw / 4, y0 + 46, cellX(sib) + cw / 2, y0 + 68,
              { stroke: hot2 ? C.amber : '#dbe3ec', sw: hot2 ? 2.2 : 1.1, head: 6 });
          }
        }
        g += h.txt(60, y0 + 88, '绿线 = firstchild（大孩子，走下面第一条道）　灰橙线 = nextsibling（右兄弟，第二条道）',
          { size: 11.5, fill: C.muted, anchor: 'start' });
      }
      var note = s.done
        ? '★ ' + { parent: '双亲表示法：找爹 O(1)、找孩子要扫全表 O(n)',
          child: '孩子表示法：找孩子 O(度数)、找爹要遍历所有链表 O(n)',
          sib: '孩子兄弟表示法：能表示森林，代价是找爹只能自顶向下搜' }[s.way]
        : '上半是同一棵树，下半是它在' + PN0(s.way) + '下的样子；橙=正在比较，绿=命中';
      g += h.txt(W / 2, H - 18, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
  function PN0(w) { return { parent: '双亲表示法', child: '孩子表示法', sib: '孩子兄弟表示法' }[w]; }
})();
