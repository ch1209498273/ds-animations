/* 动画：并查集——双亲数组表示、按集合大小合并、路径压缩（408 大纲 四(四)2） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var N = 8;

  /* 帧里的 line 是 CODE 的**下标**（引擎按 code.map(function(t,i)) 比对），不是行号 */
  var CODE = [
    '#define MAXN 8',
    'int parent[MAXN];         // <0：是根，绝对值=集合元素个数',
    '                          // >=0：指向双亲下标',
    'int Find(int x) {         // 沿双亲链上溯到根',
    '    while (parent[x] >= 0)',
    '        x = parent[x];    // 一次上溯 = 一次比较',
    '    // 路径压缩策略：把沿途结点改挂到根上',
    '    return x;',
    '}',
    'void Union(int a, int b) {',
    '    ra = Find(a);  rb = Find(b);',
    '    if (ra == rb) return; // 已同集合，合并无意义',
    '    if (parent[ra] > parent[rb])   // ra 集合更小 → 换',
    '        { t = ra; ra = rb; rb = t; }',
    '    parent[ra] += parent[rb];      // 新根的元素数',
    '    parent[rb] = ra;               // 小集合并到大集合',
    '}'
  ];

  DSC.reg({
    id: 'ufset', ch: 5, name: '并查集：双亲表示与路径压缩',
    note: '408 大纲 四(四)2 并查集及其应用（双亲数组、按大小合并、路径压缩）',
    guide: [
      '并查集只用**一个 int 数组**表示森林：parent[i] < 0 说明 i 是根、绝对值是该集合的元素数；≥ 0 就是指向双亲的下标',
      '三种场景对照同一串合并请求：**不优化**会退化成一条长链，find 退化为 O(n)；**按集合大小合并**把小树挂到大树上，树高被压到 O(log n)',
      '**路径压缩**在 find 途中把遇到的结点直接改挂到根上——本次多花一点，之后近乎 O(1)',
      '底部一行的 find 探测总次数就是考纲爱问的"比较次数"，切换场景看它怎么变'
    ],
    inputs: [
      {
        key: 'mode', label: '优化策略', type: 'select', options: [
          ['plain', '都不启用（谁先来谁当根）'],
          ['size', '按集合大小合并（union by size）'],
          ['compress', '路径压缩（不启用按大小合并）']
        ], value: 'compress'
      },
      /* 反向的链式请求：0-1 1-2 … 会让"不启用优化"也把新结点挂到已有大根上、
         退化成星形，三种策略就看不出差别了 */
      { key: 'pairs', label: '合并请求（形如 0-1 1-2）', type: 'text', value: '1-0 2-1 3-2 4-3 5-4 6-5 7-6' },
      { key: 'probe', label: '最后 find 的结点', type: 'number', value: 0, min: 0, max: N - 1 }
    ],

    run: function (v) {
      var mode = v.mode;
      var reqs = String(v.pairs).split(/[\s,;]+/).filter(Boolean).map(function (t) {
        var m = /^(\d+)\s*[-→]\s*(\d+)$/.exec(t);
        if (!m) throw Error('合并请求格式应为 a-b，例如 0-1；收到「' + t + '」');
        var a = +m[1], b = +m[2];
        if (a >= N || b >= N) throw Error('结点下标必须在 0~' + (N - 1) + ' 之间');
        return [a, b];
      });
      if (!reqs.length) throw Error('请至少给一条合并请求，例如 0-1');
      var probe = +v.probe;
      if (!(probe >= 0 && probe < N)) throw Error('find 结点须在 0~' + (N - 1));

      var parent = [], frames = [], probes = 0, sets = N, peak = 0;
      for (var i = 0; i < N; i++) parent.push(-1);

      function height() {
        var mx = 0;
        for (var i = 0; i < N; i++) { var d = 0, x = i; while (parent[x] >= 0) { x = parent[x]; d++; if (d > N) break; } mx = Math.max(mx, d); }
        return mx;
      }
      function snap(o) {
        o = o || {};
        return {
          parent: parent.slice(), N: N, mode: mode, probes: probes, sets: sets,
          h: height(), peakH: peak,
          hl: o.hl || null, changed: o.changed == null ? null : o.changed,
          done: !!o.done
        };
      }
      function F(line, msg, extra, mk) {
        frames.push({ line: line, msg: msg, panel: extra || {}, snap: snap(mk) });
      }

      F([1, 2], '初始：' + N + ' 个结点各自成集合，parent[i] = −1（既是根、又记录集合大小为 1）。并查集的"森林"就藏在这一个数组里。',
        { 集合数: N + ' 个', 树高: '0', "find 探测": '0 次' }, {});

      /* 沿链 find：逐跳高亮，返回根 */
      function doFind(x, why) {
        var path = [x], cur = x;   /* 起点也要进路径：漏了它，压缩就少改一个结点 */
        F([4], why + '：从 v' + x + ' 出发，沿 parent 链上溯。', { 当前: 'find(v' + x + ')' }, { hl: { path: [x] } });
        while (parent[cur] >= 0) {
          probes++;
          path.push(parent[cur]);
          F([5], 'v' + cur + ' 不是根（parent=' + parent[cur] + '）→ 上溯到 v' + parent[cur] + '，累计探测 ' + probes + ' 次。',
            { 当前: 'find 路径 ' + path.map(function (p) { return 'v' + p; }).join('→') }, { hl: { path: path.slice() } });
          cur = parent[cur];
        }
        probes++;
        if (mode === 'compress' && path.length > 2) {
          peak = Math.max(peak, height());   /* 压缩只让树变矮，峰值出现在压缩前 */
          var touched = path.slice(0, path.length - 1);
          for (var k = 0; k < touched.length; k++) parent[touched[k]] = cur;
          F([6], '路径压缩：把途中经过的 ' + touched.length + ' 个结点（' + touched.map(function (p) { return 'v' + p; }).join('、') +
            '）直接改挂到根 v' + cur + ' 上——本次多花一点，以后这条链一步到位。',
            { 压缩: touched.map(function (p) { return 'v' + p; }).join('、') + ' → 根 v' + cur },
            { hl: { path: path.slice(), root: cur }, changed: touched });
        }
        F([7], 'v' + x + ' 所在集合的根是 v' + cur + '（parent=' + parent[cur] + '，即该集合有 ' + (-parent[cur]) + ' 个元素）。',
          { 根: 'v' + cur }, { hl: { path: path.slice(), root: cur } });
        return cur;
      }

      reqs.forEach(function (rq, ri) {
        var a = rq[0], b = rq[1];
        F([10], '【合并 ' + (ri + 1) + '/' + reqs.length + '】Union(v' + a + ', v' + b + ')：先各自找根。',
          { 请求: 'v' + a + ' − v' + b + '（累计 ' + (ri + 1) + ' 条）' }, {});
        var ra = doFind(a, '第一个参数 v' + a);
        var rb = doFind(b, '第二个参数 v' + b);
        if (ra === rb) {
          F([11], '两个根相同（都是 v' + ra + '）→ v' + a + ' 与 v' + b + ' 已在同一集合，**直接返回**，不做任何修改。',
            { 判定: '已连通，忽略' }, { hl: { root: ra } });
          return;
        }
        /* 文案必须用交换**之前**的根和规模：拿交换之后的值说"只有 2 个、另一个 1 个 → 换"，
           读起来就是自相矛盾 */
        var ra0 = ra, rb0 = rb, szA = -parent[ra], szB = -parent[rb];
        var swapped = false;
        if (mode === 'size' && parent[ra] > parent[rb]) { var t = ra; ra = rb; rb = t; swapped = true; }
        F(mode === 'size' && swapped ? [12, 13] : [12], mode === 'plain'
          ? '不启用优化：按调用顺序把 v' + rb0 + ' 挂到 v' + ra0 + ' 下——不管两棵树谁高，长链就是这么来的。'
          : mode === 'compress'
            ? '本策略不按大小合并（压缩只发生在 find 途中）：仍按调用顺序把 v' + rb0 + '（' + szB + ' 个）挂到 v' + ra0 + '（' + szA + ' 个）下。'
            : (swapped
              ? '按大小合并：v' + ra0 + ' 只有 ' + szA + ' 个、比 v' + rb0 + ' 的 ' + szB + ' 个小 → **交换**，让大集合的根 v' + ra + ' 当新根，小树挂上去。'
              : '按大小合并：v' + ra0 + '（' + szA + ' 个）不比 v' + rb0 + '（' + szB + ' 个）小 → 保持 v' + ra0 + ' 为根，把 v' + rb0 + ' 挂过来。'),
          { 新根: 'v' + ra, 被挂: 'v' + rb }, { hl: { roots: [ra, rb] } });
        parent[ra] += parent[rb];
        parent[rb] = ra;
        sets--; peak = Math.max(peak, height());
        F([14, 15], 'parent[v' + rb + '] = ' + ra + '（改指双亲），parent[v' + ra + '] = ' + parent[ra] + '（新集合共 ' + (-parent[ra]) + ' 个元素）。集合数 ' + (sets + 1) + ' → ' + sets + '。',
          { 集合数: sets + ' 个', 树高: height() + '', "find 探测": probes + ' 次' }, { changed: rb, hl: { roots: [ra] } });
      });

      F([3], '全部合并请求处理完。现在做一次独立的 find(v' + probe + ')，看这条链到底有多长。',
        { 集合数: sets + ' 个', 树高: height() + '', "find 探测": probes + ' 次' }, {});
      var hBefore = height();
      var root = doFind(probe, '最后单独查一次 v' + probe);

      var mx = 0;
      for (var i = 0; i < N; i++) parent[i] < 0 && (mx = Math.max(mx, -parent[i]));
      F([16], '★ 完成：' + N + ' 个结点归并为 ' + sets + ' 个集合，最大集合 ' + mx + ' 个元素；v' + probe + ' 属于以 v' + root + ' 为根的集合。' +
        '本策略累计 find 探测 ' + probes + ' 次、过程中树高峰值 ' + peak + '。' +
        (mode === 'plain' ? '换成"按集合大小合并"再跑一遍，探测次数会明显下降。'
          : mode === 'size' ? '再换成"路径压缩"，find 途中顺手把链拍平。'
            : '这一次 find 顺手把链拍平：树高 ' + hBefore + ' → ' + height() + '，之后再查同一条链只要 1 步。' +
            '这就是 Kruskal 判环要用并查集、而不是每次都 DFS 的原因。'),
        { 集合数: sets + ' 个', 最大集合: mx + ' 个元素', 树高: height() + '（find 前 ' + hBefore + '）', "find 探测": probes + ' 次' },
        { done: true, hl: { root: root } });

      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 560, g = '';
      var ML = { plain: '都不启用', size: '按集合大小合并', compress: '路径压缩' };
      g += h.txt(W / 2, 32, '并查集（' + ML[s.mode] + '）· parent[] 一个数组表示整片森林', { size: 17, w: 600 });
      g += h.txt(30, 58, '图例：绿=根（标着集合元素数） 白=非根 橙=本次 find 走过的路径 蓝=本次合并涉及的根 红=刚被改动的格子',
        { size: 11.5, fill: C.muted, anchor: 'start' });

      /* 按根分组做布局：根在上，孩子逐层往下 */
      var kids = {}, roots = [], i;
      for (i = 0; i < s.N; i++) {
        if (s.parent[i] < 0) roots.push(i);
        else (kids[s.parent[i]] = kids[s.parent[i]] || []).push(i);
      }
      var bandW = (W - 60) / Math.max(roots.length, 1), pos = {}, maxD = 0;
      roots.forEach(function (r, gi) {
        var q = [[r, 0]], rows = {}, left = 30 + gi * bandW;
        while (q.length) {
          var it = q.shift(), v = it[0], d = it[1];
          (rows[d] = rows[d] || []).push(v);
          maxD = Math.max(maxD, d);
          (kids[v] || []).forEach(function (c) { q.push([c, d + 1]); });
        }
        Object.keys(rows).forEach(function (d) {
          rows[d].forEach(function (v, k) {
            pos[v] = [left + bandW * (k + 1) / (rows[d].length + 1), +d];
          });
        });
      });
      var pitch = maxD ? Math.min(78, 250 / maxD) : 78;
      Object.keys(pos).forEach(function (v) { pos[v][1] = 100 + pos[v][1] * pitch; });

      function inPath(x) { return s.hl && s.hl.path && s.hl.path.indexOf(+x) >= 0; }
      /* hl.root 是单个根，hl.roots 是"本次合并涉及的根"——两种都要画出来，
         否则最关键的"谁挂到谁下面"那帧画布上一点变化都没有 */
      function isMarked(x) {
        if (!s.hl) return false;
        if (s.hl.root != null && s.hl.root === +x) return true;
        return !!(s.hl.roots && s.hl.roots.indexOf(+x) >= 0);
      }
      function isChanged(x) {
        if (s.changed == null) return false;
        return Array.isArray(s.changed) ? s.changed.indexOf(+x) >= 0 : s.changed === +x;
      }

      /* 边：孩子 → 双亲 */
      for (i = 0; i < s.N; i++) {
        var p = s.parent[i];
        if (p < 0) continue;
        var A = pos[i], B = pos[p];
        if (!A || !B) continue;
        var hot = inPath(i);
        g += h.arrow(A[0], A[1] - 21, B[0], B[1] + 21, { stroke: hot ? C.amber : C.grey, sw: hot ? 2.4 : 1.5, head: 7 });
      }
      /* 结点 */
      for (i = 0; i < s.N; i++) {
        var P = pos[i]; if (!P) continue;
        var isRoot = s.parent[i] < 0, hot2 = inPath(i), mark = isMarked(i);
        var fill = hot2 ? C.amberBg : isRoot ? C.greenBg : '#fff';
        var stroke = hot2 ? C.amber : isRoot ? C.green : C.grey;
        if (mark && !hot2) { stroke = C.blue; fill = C.blueBg; }
        g += h.circle(P[0], P[1], 20, { fill: fill, stroke: stroke, sw: hot2 || mark ? 3 : 1.8 });
        g += h.txt(P[0], P[1] + 5, 'v' + i, { size: 12.5, w: 700 });
        if (isRoot) g += h.txt(P[0], P[1] - 28, '−' + (-s.parent[i]), { size: 11, fill: C.green, w: 600 });
      }

      /* parent[] 数组 */
      var n = s.N, cw = Math.min(84, Math.floor((W - 140) / n) - 10), gap = 10;
      var x0 = (W - n * cw - (n - 1) * gap) / 2, ay = 430;
      g += h.txt(x0 - 6, ay + 34, 'parent[]', { size: 13, w: 700, fill: C.muted, anchor: 'end' });
      for (i = 0; i < n; i++) {
        var x = x0 + i * (cw + gap), ch = isChanged(i), rt = s.parent[i] < 0;
        g += h.rect(x, ay, cw, 52, {
          fill: ch ? C.redBg : rt ? C.greenBg : '#fff',
          stroke: ch ? C.red : rt ? C.green : C.grey, sw: ch || rt ? 2.2 : 1.4, rx: 7
        });
        g += h.txt(x + cw / 2, ay + 33, String(s.parent[i]), { size: 16, w: 700 });
        g += h.txt(x + cw / 2, ay + 70, '下标 ' + i, { size: 11, fill: C.muted });
        g += h.txt(x + cw / 2, ay + 88, s.parent[i] < 0 ? '根' : '→ v' + s.parent[i], { size: 11, fill: ch ? C.red : C.muted });
      }
      var note = s.done
        ? '结论：' + n + ' 结点 → ' + s.sets + ' 个集合，树高峰值 ' + s.peakH + '（当前 ' + s.h + '），find 累计探测 ' + s.probes + ' 次'
        : '上方森林与下方数组是同一份数据的两种画法：每个非根结点的箭头指向它的双亲';
      g += h.txt(W / 2, H - 22, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: s.done ? 600 : 400 });
      return h.svg(W, H, g);
    }
  });
})();
