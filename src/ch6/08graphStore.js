/* 动画：邻接多重表与十字链表（408 大纲 五(二)3） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '/* 邻接表的毛病：一条边在两个顶点的链里各存一份结点，',
    '   想"标记这条边已访问"就得改两处（Prim/Kruskal 判边就难受） */',
    '',
    '/* ① 邻接多重表（无向图）：一条边只有一个结点，被两个顶点共享 */',
    'typedef struct EBox {',
    '    VertexType v1, v2;',
    '    ArcType *a1;        // 下一条与 v1 关联的边',
    '    ArcType *a2;        // 下一条与 v2 关联的边',
    '} EBox;',
    'typedef struct { VertexType vex; EBox *firstedge; } VNode;',
    'VNode vexs[n];',
    '/* 插边 (i, j)：新建一个 EBox，分别接到 i 链和 j 链的头上；',
    '   若 i 是 v1 就动 a1，若 i 是 v2 就动 a2 —— 同一个结点挂两条链 */',
    '',
    '/* ② 十字链表（有向图）：一条弧一个结点，同时挂在"尾点出边链"和',
    '   "头点入边链"上，于是入度出度都能顺链走完 */',
    'typedef struct ArcBox {',
    '    int tailvex, headvex;',
    '    ArcType hlink;      // 下一条 headvex 相同的弧（同一条入边链）',
    '    ArcType tlink;      // 下一条 tailvex 相同的弧（同一条出边链）',
    '} ArcBox;',
    'typedef struct { VexType vex; ArcType firstin, firstout; } VexNode;',
    'VexNode xlist[n];      // 表头结点阵，行是顶点、列是弧，交叉成"十字"'
  ];

  function build(edges, nv) {
    var ebox = edges.map(function (e, k) { return { k: k, v1: e[0], v2: e[1], a1: null, a2: null }; });
    var head = [], chains = [], i;
    for (i = 0; i < nv; i++) { head.push(null); chains.push({ 1: [], 2: [] }); }
    /* 头插：新边结点的 a1 接住 v1 原来的链头、a2 接住 v2 原来的链头，两个表头再改指它 */
    edges.forEach(function (e, k) {
      ebox[k].a1 = head[e[0]];
      ebox[k].a2 = head[e[1]];
      head[e[0]] = k; head[e[1]] = k;
    });
    /* 从每个表头沿"对应那一侧的指针"走，还原出该顶点的链，并记住每条边是从 a1 还是 a2 找到的 */
    for (i = 0; i < nv; i++) {
      var cur = head[i];
      while (cur != null) {
        var eb = ebox[cur], slot = eb.v1 === i ? 1 : 2;
        chains[i][slot].push(cur);
        cur = slot === 1 ? eb.a1 : eb.a2;
      }
    }
    return { ebox: ebox, chains: chains, head: head };
  }

  function buildOrtho(edges, nv) {
    /* 十字链表：弧结点同时挂在 tail 的 out 链和 head 的 in 链上 */
    var ebox = edges.map(function (e, k) { return { k: k, tail: e[0], head: e[1], tlink: null, hlink: null }; });
    var outHead = [], inHead = [];
    for (var i = 0; i < nv; i++) { outHead.push(null); inHead.push(null); }
    edges.forEach(function (e, k) {
      ebox[k].tlink = outHead[e[0]]; outHead[e[0]] = k;
      ebox[k].hlink = inHead[e[1]]; inHead[e[1]] = k;
    });
    function chain(hd, fld) {
      var out = [], cur = hd;
      while (cur != null) { out.push(cur); cur = ebox[cur][fld]; }
      return out;
    }
    var outChain = [], inChain = [];
    for (i = 0; i < nv; i++) { outChain.push(chain(outHead[i], 'tlink')); inChain.push(chain(inHead[i], 'hlink')); }
    return { ebox: ebox, outChain: outChain, inChain: inChain, outHead: outHead, inHead: inHead };
  }

  DSC.reg({
    id: 'graphStore', ch: 6, name: '邻接多重表与十字链表',
    note: '408 大纲 五(二)3 邻接多重表、十字链表（一条边/弧只存一个结点，被两条链共享）',
    guide: [
      '邻接表把**一条边存两份**（两个端点各一份）。想给这条边打个"已访问"标记就得改两处——Kruskal 判边、Prim 更新都很别扭',
      '**邻接多重表**（无向图）：一条边只有**一个结点**，里面同时记 `v1/a1` 和 `v2/a2`。两个顶点的链各指到同一个结点，所以标记一次就够',
      '**十字链表**（有向图）：一条弧也只有**一个结点**，同时挂在"尾顶点的出边链"和"头顶点的入边链"上。行看是出边、列看是入边，交叉成十字',
      '代价是多一倍指针：邻接表的边结点只要 1 个指针，邻接多重表要 2 个；十字链表同理。它换来的是**入边和出边都能顺链走完**'
    ],
    inputs: [
      {
        key: 'way', label: '结构', type: 'select', options: [
          ['mul', '邻接多重表（无向图）'], ['ortho', '十字链表（有向图）']
        ], value: 'ortho'
      },
      { key: 'edges', label: '边表（无向写 a-b，有向写 a>b，端点 0~5）', type: 'text', value: '0>1 0>2 1>2 2>0 2>3 1>3' },
      { key: 'pick', label: '重点观察的顶点', type: 'number', value: 2, min: 0, max: 5 }
    ],

    run: function (v) {
      var way = v.way, dir = way === 'ortho', frames = [];
      var toks = String(v.edges).split(/[\s,;]+/).filter(Boolean);
      var E = [];
      toks.forEach(function (t) {
        var m = /^(\d+)\s*[-→>]\s*(\d+)$/.exec(t);
        if (!m) throw Error('边表格式应为 a-b 或 a>b，收到「' + t + '」');
        var a = +m[1], b = +m[2];
        if (a > 5 || b > 5) throw Error('端点下标须在 0~5');
        if (a === b) throw Error('不画自环');
        E.push([a, b]);
      });
      if (E.length < 3) throw Error('至少给 3 条边才看得出链的串联');
      var nv = 0;
      E.forEach(function (e) { nv = Math.max(nv, e[0] + 1, e[1] + 1); });
      var pick = Math.max(0, Math.min(+v.pick || 0, nv - 1));
      var st = dir ? buildOrtho(E, nv) : build(E, nv);
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          way: way, nv: nv, E: E, st: st, hlE: [], hlV: [], pick: pick, done: false
        }, snap || {}) });
      }

      if (dir) {
        F([15, 16, 17, 18, 19, 20], '十字链表（有向图）：' + nv + ' 个顶点、' + E.length + ' 条弧。' +
          '每个顶点一行，行里**两格表头**：firstout 管"从我出发的弧"、firstin 管"指向我来的弧"。',
          { 顶点数: nv + ' 个', 弧数: E.length + ' 条', 弧结点: E.length + ' 个（不翻倍）' }, {});
        E.forEach(function (e, k) {
          F([18, 19, 20, 21], '挂第 ' + k + ' 条弧 <' + e[0] + ',' + e[1] + '>：**只建一个弧结点**，' +
            '它的 tlink 接进 ' + e[0] + ' 的出边链头、hlink 接进 ' + e[1] + ' 的入边链头。同一个结点被两条不同的链共享。',
            { 当前弧: '<' + e[0] + ',' + e[1] + '>', 尾点出链: st.outChain[e[0]].length + 1 + ' 条', 头点入链: st.inChain[e[1]].length + 1 + ' 条' },
            { hlE: [k], hlV: [e[0], e[1]] });
        });
        var oc = st.outChain[pick], ic = st.inChain[pick];
        F([21], '看 ' + pick + ' 号顶点这一"行"：出边链 ' + (oc.length ? oc.map(function (x) { return '<' + E[x][0] + ',' + E[x][1] + '>'; }).join('→') : '空') +
          '（出度 ' + oc.length + '），入边链 ' + (ic.length ? ic.map(function (x) { return '<' + E[x][0] + ',' + E[x][1] + '>'; }).join('→') : '空') +
          '（入度 ' + ic.length + '）。两个数直接读链长，**不用遍历全图**。',
          { 顶点: String(pick), 出度: oc.length + '', 入度: ic.length + '', 度: (oc.length + ic.length) + '' },
          { hlE: oc.concat(ic), hlV: [pick] });
        var dup = 0;
        E.forEach(function (e, k) { if (E.some(function (f, j) { return j !== k && f[0] === e[1] && f[1] === e[0]; })) dup++; });
        F([15, 16], '★ 十字链表的用处：求入边、求出边都是 O(度数)。代价是每条弧要存 **2 个指针**（tlink + hlink），' +
          '比邻接表的 1 个多一倍。' + (dup ? '另外注意：若图里同时有 <a,b> 和 <b,a>，它们是**两个不同结点**，别当成一条边。' : ''),
          { 弧结点数: E.length + ' 个', 指针总数: 2 * E.length + ' 个' }, { done: true });
      } else {
        F([3, 4, 5, 6, 7], '邻接多重表（无向图）：' + nv + ' 个顶点、' + E.length + ' 条边。' +
          '顶点行只有一个表头 `firstedge`；边结点里有 **v1/a1、v2/a2 两对**字段。',
          { 顶点数: nv + ' 个', 边数: E.length + ' 条', 边结点: E.length + ' 个（不翻倍）' }, {});
        E.forEach(function (e, k) {
          var eb = st.ebox[k];
          F([11, 12], '插第 ' + k + ' 条边 (' + e[0] + ',' + e[1] + ')：**只建一个边结点**，' +
            'a1 = ' + (eb.a1 == null ? '∧' : eb.a1 + ' 号边') + ' 接住 ' + e[0] + ' 原来的链头、' +
            'a2 = ' + (eb.a2 == null ? '∧' : eb.a2 + ' 号边') + ' 接住 ' + e[1] + ' 原来的链头，然后两个表头都改指它。',
            { 当前边: '(' + e[0] + ',' + e[1] + ')', 'a1 →': eb.a1 == null ? '∧' : String(eb.a1), 'a2 →': eb.a2 == null ? '∧' : String(eb.a2) },
            { hlE: [k], hlV: [e[0], e[1]] });
        });
        var c1 = st.chains[pick][1], c2 = st.chains[pick][2];
        var all = c1.concat(c2);
        F([6, 7], pick + ' 号顶点的链：走 a1 拿到 ' + (c1.map(function (x) { return x + ' 号'; }).join('→') || '（空）') +
          '，走 a2 拿到 ' + (c2.map(function (x) { return x + ' 号'; }).join('→') || '（空）') +
          '，合起来 ' + all.length + ' 条边就是它的全部邻点：' +
          all.map(function (x) { var e = E[x]; return e[0] === pick ? e[1] : e[0]; }).join('、') + '。',
          { 顶点: String(pick), 度: all.length + '', 'a1 链长': c1.length + '', 'a2 链长': c2.length + '' },
          { hlE: all, hlV: [pick] });
        F([0, 1, 3], '★ 对比邻接表：同样这张图，邻接表要建 **' + 2 * E.length + '** 个边结点（每条边两个端点各一份），' +
          '邻接多重表只建 ' + E.length + ' 个。所以给边打标记、判边是否已用，改一处就够——' +
          '代价是每个边结点要存 a1、a2 两个指针，且"这条边是从哪头找到的"必须靠 v1/v2 现场判断。',
          { 边结点数: E.length + ' 个', 邻接表需: 2 * E.length + ' 个结点', 每结点指针: '2 个' }, { done: true });
      }
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 560, g = '';
      var dir = s.way === 'ortho', st = s.st, nv = s.nv, m = s.E.length;
      g += h.txt(W / 2, 28, (dir ? '十字链表（有向）' : '邻接多重表（无向）') + ' · 一条' +
        (dir ? '弧' : '边') + '只有一个结点，被两条链共享', { size: 17, w: 600 });
      g += h.txt(30, 50, '图例：橙=当前' + (dir ? '弧' : '边') + '及其两条链 蓝=当前顶点 灰=未涉及 ∧=空指针',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      /* 顶点表 */
      var vy = 84, vh = 30, vw = dir ? 132 : 96;
      g += h.txt(30, vy - 10, dir ? '顶点表（表头两格）' : '顶点表', { size: 11.5, fill: C.muted, anchor: 'start' });
      for (var i = 0; i < nv; i++) {
        var y = vy + i * vh, on = s.hlV.indexOf(i) >= 0, pk = s.pick === i;
        g += h.rect(30, y, 26, 24, { fill: pk ? C.blueBg : '#fff', stroke: pk ? C.blue : C.grey, sw: pk ? 2.4 : 1.3, rx: 4 });
        g += h.txt(43, y + 17, String(i), { size: 13, w: 700 });
        if (dir) {
          g += h.rect(58, y, (vw - 26) / 2, 24, { fill: on ? C.amberBg : '#f8fafc', stroke: on ? C.amber : C.line, sw: on ? 2 : 1, rx: 3 });
          g += h.txt(58 + (vw - 26) / 4, y + 17, 'in→' + (st.inHead[i] == null ? '∧' : st.inHead[i]), { size: 10.5, family: 'Consolas,monospace' });
          g += h.rect(58 + (vw - 26) / 2, y, (vw - 26) / 2, 24, { fill: on ? C.amberBg : '#f8fafc', stroke: on ? C.amber : C.line, sw: on ? 2 : 1, rx: 3 });
          g += h.txt(58 + 3 * (vw - 26) / 4, y + 17, 'out→' + (st.outHead[i] == null ? '∧' : st.outHead[i]), { size: 10.5, family: 'Consolas,monospace' });
        } else {
          g += h.rect(58, y, vw - 28, 24, { fill: on ? C.amberBg : '#f8fafc', stroke: on ? C.amber : C.line, sw: on ? 2 : 1, rx: 3 });
          g += h.txt(58 + (vw - 28) / 2, y + 17, 'firstedge→' + (st.head[i] == null ? '∧' : st.head[i]),
            { size: 10, family: 'Consolas,monospace' });
        }
      }
      /* 边结点表 */
      var ex = 250, ew = 118, eh = 34;
      g += h.txt(ex, vy - 10, dir ? '弧结点表（tailvex, hlink, headvex, tlink）' : '边结点表（v1, a1, v2, a2）',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      for (var k = 0; k < m; k++) {
        var eb = st.ebox[k];
        var col = k % 2, row = Math.floor(k / 2);
        var x = ex + col * (ew + 46), y = vy + row * (eh + 26);
        var on = s.hlE.indexOf(k) >= 0;
        g += h.rect(x, y, ew, eh, { fill: on ? C.amberBg : '#fff', stroke: on ? C.amber : C.grey, sw: on ? 2.4 : 1.3, rx: 5 });
        g += h.txt(x + 10, y + 13, '#' + k, { size: 9.5, fill: C.muted, anchor: 'start' });
        if (dir) {
          g += h.txt(x + ew / 2, y + 14, '<' + eb.tail + ',' + eb.head + '>', { size: 12, w: 700 });
          g += h.txt(x + 14, y + 29, 'h→' + (eb.hlink == null ? '∧' : eb.hlink), { size: 9.5, fill: on ? C.amber : C.muted, anchor: 'start', family: 'Consolas,monospace' });
          g += h.txt(x + ew - 14, y + 29, 't→' + (eb.tlink == null ? '∧' : eb.tlink), { size: 9.5, fill: on ? C.amber : C.muted, anchor: 'end', family: 'Consolas,monospace' });
        } else {
          g += h.txt(x + ew / 2, y + 14, '(' + eb.v1 + ',' + eb.v2 + ')', { size: 12, w: 700 });
          g += h.txt(x + 14, y + 29, 'a1→' + (eb.a1 == null ? '∧' : eb.a1), { size: 9.5, fill: on ? C.amber : C.muted, anchor: 'start', family: 'Consolas,monospace' });
          g += h.txt(x + ew - 14, y + 29, 'a2→' + (eb.a2 == null ? '∧' : eb.a2), { size: 9.5, fill: on ? C.amber : C.muted, anchor: 'end', family: 'Consolas,monospace' });
        }
      }
      /* 链的连线：从顶点表头/边结点指向下一条边 */
      function ecell(k) {
        var col = k % 2, row = Math.floor(k / 2);
        return [ex + col * (ew + 46), vy + row * (eh + 26)];
      }
      function link(x1, y1, to, fromField) {
        if (to == null) return '';
        var p = ecell(to);
        var x2 = p[0] + (fromField === 'a1' || fromField === 'h' ? 20 : ew - 20), y2 = p[1] + (fromField ? 22 : eh / 2);
        var on = s.hlE.indexOf(to) >= 0;
        return h.arrow(x1, y1, x2, y2, { stroke: on ? C.amber : '#cfd8e3', sw: on ? 1.9 : 1.1, head: 6 });
      }
      for (i = 0; i < nv; i++) {
        var vy2 = vy + i * vh + 12;
        if (dir) {
          g += link(58 + (vw - 26) / 2, vy2, st.inHead[i], null);
          g += link(58 + vw - 16, vy2, st.outHead[i], null);
        } else {
          g += link(58 + vw - 28, vy2, st.head[i], null);
        }
      }
      for (k = 0; k < m; k++) {
        var p0 = ecell(k), eb2 = st.ebox[k];
        if (dir) {
          g += link(p0[0] + 20, p0[1] + eh, eb2.hlink, 'h');
          g += link(p0[0] + ew - 20, p0[1] + eh, eb2.tlink, 't');
        } else {
          g += link(p0[0] + 20, p0[1] + eh, eb2.a1, 'a1');
          g += link(p0[0] + ew - 20, p0[1] + eh, eb2.a2, 'a2');
        }
      }
      var note = s.done
        ? (dir ? '★ 十字链表：行看是出边链、列看是入边链，一条弧只存一个结点，代价是 2 个指针'
          : '★ 邻接多重表：一条边只存一个结点、被两个顶点的链共享，所以给边打标记改一处就够')
        : (dir ? '橙=刚挂上的那条弧：注意它同时被两个顶点的表头指到' : '橙=刚插入的那条边：同一个边结点同时被两个顶点的链指到——这就是"多重表"');
      g += h.txt(W / 2, H - 18, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
