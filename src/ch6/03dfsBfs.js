/* 动画8：图的深度/广度优先遍历（默认图取自 cp6-03：DFS(2)=2,1,3,5,4,6；BFS(2)=2,1,5,3,4,6） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var N = 6;
  var EDGES = [[1, 2], [1, 3], [2, 5], [3, 5], [4, 5], [4, 6]];
  var POS = { 1: [470, 90], 2: [290, 210], 3: [630, 210], 4: [290, 450], 5: [630, 450], 6: [470, 565] };

  var CODE = {
    dfs: [
      'void DFS(AMGraph G, int v) {',
      '    cout << v;  visited[v] = true;     // 访问并标记',
      '    for (w = 0; w < n; ++w)            // 依次检查v的所有邻接点',
      '        if (G.arcs[v][w] != 0 && !visited[w])',
      '            DFS(G, w);                 // 递归访问未访问的邻接点',
      '}'
    ],
    bfs: [
      'void BFS(AMGraph G, int v) {',
      '    cout << v;  visited[v] = true;',
      '    EnQueue(Q, v);                     // 起点入队',
      '    while (!QueueEmpty(Q)) {',
      '        DeQueue(Q, u);                 // 队头出队',
      '        for (w = 0; w < n; ++w)',
      '            if (G.arcs[u][w] != 0 && !visited[w]) {',
      '                cout << w;  visited[w] = true;',
      '                EnQueue(Q, w);         // 邻接点入队',
      '            }',
      '    }',
      '}'
    ]
  };

  DSC.reg({
    id: 'dfsBfs', ch: 6, name: '图的 DFS 与 BFS 遍历',
    aim: 'DFS 一条路走到黑（栈），BFS 一圈圈往外扩（队）：**同一张图两种访问序列**',
    note: '教材 6.5 图的遍历（DFS/BFS、存储结构的影响）',
    guide: [
      '切换 DFS（递归+栈）与 BFS（队列），以及起点；右侧同步显示递归栈/队列',
      '存储结构可切换：邻接矩阵（邻接点升序）与邻接表（头插法）——同图不同存储，序列不同',
      '绿色结点=已访问，绿色粗边=遍历生成树；黄色=当前正在检查的邻接点',
      '对照矩阵行扫描/邻接表逐结点，理解"序列不唯一，但同一存储下确定"'
    ],
    inputs: [
      { key: 'method', label: '遍历方法', type: 'select', options: [['dfs', '深度优先 DFS（递归+栈）'], ['bfs', '广度优先 BFS（队列）']], value: 'dfs' },
      { key: 'storage', label: '存储结构', type: 'select', options: [['mat', '邻接矩阵（邻接点按编号升序）'], ['list', '邻接表（头插法建表）']], value: 'mat' },
      { key: 'start', label: '起点', type: 'select', options: [['1', 'v1'], ['2', 'v2'], ['3', 'v3'], ['4', 'v4'], ['5', 'v5'], ['6', 'v6']], value: '2' }
    ],
    run: function (v) {
      var method = v.method, storage = v.storage || 'mat', start = +v.start;
      var code = method === 'dfs' ? CODE.dfs : CODE.bfs;
      var frames = [];
      /* 邻接表（头插法）：边按输入顺序建立，每个边结点头插 → 邻居顺序与输入顺序相反 */
      var ADJ = {};
      for (var ai = 1; ai <= N; ai++) ADJ[ai] = [];
      if (storage === 'mat') {
        EDGES.forEach(function (e) { ADJ[e[0]].push(e[1]); ADJ[e[1]].push(e[0]); });
        Object.keys(ADJ).forEach(function (k) { ADJ[k].sort(function (a, b) { return a - b; }); });
      } else {
        EDGES.forEach(function (e) { ADJ[e[0]].unshift(e[1]); ADJ[e[1]].unshift(e[0]); });
      }
      var visited = {}, seq = [], treeEdges = [], stack = [], queue = [], cur = null, checkCell = null;
      function snap(o) {
        o = o || {};
        o.nodes = []; o.edges = EDGES.slice(); o.visited = Object.keys(visited).map(Number);
        o.seq = seq.slice(); o.treeEdges = treeEdges.slice(); o.stack = stack.slice(); o.queue = queue.slice();
        o.cur = cur; o.checkCell = checkCell; o.method = method; o.storage = storage; o.N = N; o.mat = mat();
        o.adj = {}; for (var k in ADJ) o.adj[k] = ADJ[k].slice();
        return o;
      }
      function mat() {
        var m = [];
        for (var a = 1; a <= N; a++) { m.push([]); for (var b = 1; b <= N; b++) m[a - 1].push(hasEdge(a, b) ? 1 : 0); }
        return m;
      }
      function hasEdge(a, b) { return EDGES.some(function (e) { return (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a); }); }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      function visit(u, via) {
        visited[u] = true; seq.push(u); cur = u;
        if (via) treeEdges.push([via, u]);
        F(method === 'dfs' ? 1 : (via === null ? 2 : (via === undefined ? 1 : 1)),
          '访问 v' + u + '，visited[v' + u + '] = true' + (via ? '（从 v' + via + ' 到达，边 v' + via + '—v' + u + ' 记入生成树）' : '（起点）') + '。序列：' + seq.join(' → '),
          { 已访问序列: seq.join(' → '), visited: Object.keys(visited).map(function (k) { return 'v' + k; }).join(','), 方法: method === 'dfs' ? 'DFS' : 'BFS' },
          snap({}));
      }
      if (method === 'dfs') {
        function dfs(u, from) {
          stack.push('DFS(v' + u + ')');
          visit(u, from === undefined ? null : from);
          ADJ[u].forEach(function (w) {
            cur = u;                  // 当前结点必须跟着"正在扫谁的行"走：递归返回到祖先时，
                                      // 若仍停在最后访问的点上，画面会显示"人在 v6、却在扫 v2 的行"
            checkCell = { r: u, c: w };
            if (!visited[w]) {
              F([2, 3], '检查 v' + u + ' 的邻接点 v' + w + '：未访问 → 递归调用 DFS(v' + w + ')。',
                { 递归栈: stack.join(' → '), 已访问: seq.join(' → ') }, snap({}));
              dfs(w, u);
            } else {
              F([3, 4], (seq.length === N ? '【回溯收尾】' : '') + '检查 v' + u + ' 的邻接点 v' + w + '：已访问，跳过（避免绕回路）。' +
                (seq.length === N ? '全部结点已访问完，这些检查是递归返回前的收尾，不产生新结点。' : ''),
                { 递归栈: stack.join(' → ') }, snap({}));
            }
          });
          checkCell = null;
          var backOver = seq.length === N;   // 全部访问完：不再逐帧演示回溯
          stack.pop();
          if (!backOver) F(0, 'DFS(v' + u + ') 结束，回溯到' + (stack.length ? stack[stack.length - 1] : '调用者') + '。', { 递归栈: stack.join(' → ') || '（空）' }, snap({}));
        }
        F(0, '存储结构：【' + (storage === 'mat' ? '邻接矩阵' : '邻接表') + '】。visited[] 初始化为 false。从 v' + start + ' 出发深度优先遍历。' +
          (storage === 'mat' ? '邻接点按编号升序依次扫描。' : '注意右侧邻接表由【头插法】建立——邻居顺序与输入边序相反，扫描按表内顺序进行。'), { 方法: 'DFS', 存储: storage === 'mat' ? '邻接矩阵' : '邻接表', 序列: '（待生成）' }, snap({}));
        dfs(start);
        F(0, '★ 深度优先遍历完成：全部 ' + N + ' 个结点已访问，递归调用逐层返回、栈清空，算法结束。序列为 ' + seq.join(' → ') + '。注意：同一个图存储结构不同，遍历序列可能不同；DFS 只保证访问所有结点，不保证最短路径。时间复杂度 O(n²)（邻接矩阵）或 O(n+e)（邻接表）。', { 已访问序列: seq.join(' → '), 递归栈: '（空）' }, snap({ done: true }));
      } else {
        function bfs(s0) {
          visited[s0] = true; seq.push(s0); queue.push(s0); cur = s0;
          F([1, 2], '访问起点 v' + s0 + ' 并入队。', { 队列: '队头 → ' + queue.join(', ') + ' ← 队尾', 已访问: seq.join(' → ') }, snap({}));
          while (queue.length) {
            var u = queue.shift(); cur = u;
            F(4, 'v' + u + ' 出队，依次检查其邻接点。', { 队列: queue.join(', ') || '（空）', 已访问: seq.join(' → ') }, snap({}));
            ADJ[u].forEach(function (w) {
              checkCell = { r: u, c: w };
              if (!visited[w]) {
                visited[w] = true; seq.push(w); queue.push(w); treeEdges.push([u, w]);
                F([6, 7, 8], 'v' + u + ' 的邻接点 v' + w + ' 未访问 → 访问并入队。序列：' + seq.join(' → '),
                  { 队列: queue.join(', ') || '（空）', 已访问: seq.join(' → ') }, snap({}));
              } else {
                F(6, 'v' + u + ' 的邻接点 v' + w + ' 已访问，跳过。', { 队列: queue.join(', ') || '（空）' }, snap({}));
              }
            });
          }
          checkCell = null; cur = null;
          F(3, '队列空，BFS 结束：按层扩展完成。', { 序列: seq.join(' → ') }, snap({ done: true }));
        }
        F(0, '存储结构：【' + (storage === 'mat' ? '邻接矩阵' : '邻接表') + '】。visited[] 初始化为 false。从 v' + start + ' 出发广度优先遍历：借助【队列】实现按层扩展（对比 DFS 借助栈/递归）。', { 方法: 'BFS', 存储: storage === 'mat' ? '邻接矩阵' : '邻接表' }, snap({}));
        bfs(start);
      }
      cur = null;
      if (method === 'bfs') F(0, '广度优先遍历完成：从 v' + start + ' 出发的序列为 ' + seq.join(' → ') + '。注意：同一个图存储结构不同（邻接矩阵/邻接表）遍历序列可能不同——序列不唯一，但同一存储下结果确定。时间复杂度 O(n²)（邻接矩阵）或 O(n+e)（邻接表）。',
        { 遍历序列: seq.join(' → '), 生成树边: treeEdges.map(function (e) { return 'v' + e[0] + '—v' + e[1]; }).join(', ') },
        snap({ done: true }));
      return { code: code, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 620, r = 24;
      var g = '';
      g += h.txt(430, 32, (s.method === 'dfs' ? '深度优先搜索 DFS（栈/递归）' : '广度优先搜索 BFS（队列）'), { size: 19, w: 600 });
      // 边
      s.edges.forEach(function (e) {
        var A = POS[e[0]], B = POS[e[1]];
        var isTree = s.treeEdges.some(function (t) { return (t[0] === e[0] && t[1] === e[1]) || (t[0] === e[1] && t[1] === e[0]); });
        var isCheck = s.checkCell && ((s.checkCell.r === e[0] && s.checkCell.c === e[1]) || (s.checkCell.r === e[1] && s.checkCell.c === e[0]));
        g += h.line(A[0], A[1], B[0], B[1], { stroke: isTree ? C.green : (isCheck ? C.amber : C.line), sw: isTree ? 4 : (isCheck ? 3 : 1.8), dash: isTree ? null : (isCheck ? null : '2,4') });
      });
      // 结点
      for (var k = 1; k <= N; k++) {
        var P = POS[k];
        var fill = '#fff', stroke = C.grey, sw = 2;
        if (s.visited.indexOf(k) >= 0) { fill = C.greenBg; stroke = C.green; }
        if (s.cur === k) { fill = C.amberBg; stroke = C.amber; sw = 4; }
        g += h.circle(P[0], P[1], r, { fill: fill, stroke: stroke, sw: sw });
        g += h.txt(P[0], P[1] + 7, 'v' + k, { size: 16, w: 700 });
      }
      // 右侧：邻接矩阵 或 邻接表（先垫白底板，防止左图越界元素压住文字）
      g += h.rect(740, 42, 232, 556, { fill: '#ffffff', stroke: 'none' });
      var mx = 762, my = 106, cell = 28;
      if (s.storage === 'list') {
        var rowGap = 38;
        g += h.txt(mx + 88, my - 22, '邻接表（头插法：邻居顺序与输入相反）', { size: 12.5, w: 600 });
        for (var li = 1; li <= N; li++) {
          var ly = my + (li - 1) * rowGap;
          var rowCur = s.checkCell && s.checkCell.r === li;
          g += h.txt(mx - 8, ly + 26, 'v' + li, { size: 13.5, w: 700, anchor: 'end' });
          g += h.txt(mx + 2, ly + 26, '→', { size: 13, fill: C.muted });
          var nb = s.adj[li] || [];
          nb.forEach(function (w, k4) {
            var bx = mx + 18 + k4 * 62;
            var isCheck = s.checkCell && s.checkCell.r === li && s.checkCell.c === w;
            g += h.rect(bx, ly + 4, 46, 34, { fill: isCheck ? C.amberBg : (s.visited.indexOf(w) >= 0 ? C.greenBg : '#fff'), stroke: isCheck ? C.amber : (s.visited.indexOf(w) >= 0 ? C.green : C.grey), rx: 6, sw: isCheck ? 2.5 : 1.2 });
            g += h.txt(bx + 23, ly + 26, 'v' + w, { size: 13.5, w: 600 });
            g += h.txt(bx + 54, ly + 26, k4 < nb.length - 1 ? '→' : '∧', { size: 12, fill: C.muted });
          });
          if (!nb.length) g += h.txt(mx + 30, ly + 26, '∧（空）', { size: 12, fill: C.muted });
          if (rowCur) g += h.rect(mx - 14, ly, 226, 42, { fill: 'none', stroke: C.amber, rx: 8, sw: 1.5 });
        }
        g += h.txt(mx + 100, my + N * rowGap + 8, '黄色 = 当前正在检查的邻接点｜绿 = 已访问', { size: 11.5, fill: C.muted });
      } else {
        g += h.txt(mx + 3 * cell, my - 34, '邻接矩阵', { size: 14, w: 600 });
        // 列号必须画在网格上方：格子带不透明填充且绘制在后，画在网格内会被第一行盖住
        for (var j = 1; j <= N; j++) g += h.txt(mx + (j - 0.5) * cell, my - 9, String(j), { size: 11, fill: C.muted });
        g += h.txt(mx - 30, my - 9, '行＼列', { size: 10, fill: C.muted });
        for (var a = 1; a <= N; a++) {
          g += h.txt(mx - 12, my + (a - 0.5) * cell + 5, String(a), { size: 11, fill: C.muted });
          for (var b = 1; b <= N; b++) {
            var v = s.mat[a - 1][b - 1];
            var f = v ? C.blueBg : '#fff';
            var isCheck = s.checkCell && s.checkCell.r === a && s.checkCell.c === b;
            if (isCheck) f = C.amberBg;
            g += h.rect(mx + (b - 1) * cell, my + (a - 1) * cell, cell - 2, cell - 2, { fill: f, stroke: isCheck ? C.amber : C.line, sw: isCheck ? 2.5 : 1, rx: 3 });
            if (v) g += h.txt(mx + (b - 0.5) * cell - 1, my + (a - 0.5) * cell + 5, '1', { size: 11.5, fill: C.blue, w: 600 });
          }
        }
        g += h.txt(mx + 3 * cell, my + N * cell + 26, '行扫描：当前正在检查 ' + (s.checkCell ? 'arcs[v' + s.checkCell.r + '][v' + s.checkCell.c + ']' : '—'), { size: 12, fill: C.muted });
      }
      // 栈 / 队列
      if (s.method === 'dfs') {
        var sy = s.storage === 'list' ? 420 : 348;
        g += h.txt(820, sy - 16, '递归栈', { size: 13, fill: C.muted, w: 600 });
        for (var k2 = 0; k2 < s.stack.length; k2++) {
          var yy = sy + (s.stack.length - 1 - k2) * 36;
          var top = k2 === s.stack.length - 1;
          g += h.rect(762, yy, 200, 30, { fill: top ? C.blueBg : '#fff', stroke: top ? C.blue : C.grey, rx: 6 });
          g += h.txt(862, yy + 21, s.stack[k2], { size: 13, fill: top ? C.blue : C.ink, family: 'Consolas,monospace' });
        }
        if (!s.stack.length) g += h.txt(862, sy + 20, '（空）', { size: 13, fill: C.muted });
      } else {
        var qy = s.storage === 'list' ? 430 : 356;
        g += h.txt(820, qy - 16, '队列', { size: 13, fill: C.muted, w: 600 });
        s.queue.forEach(function (u, k3) {
          g += h.rect(762 + k3 * 70, qy, 62, 34, { fill: k3 === 0 ? C.blueBg : '#fff', stroke: k3 === 0 ? C.blue : C.grey, rx: 6 });
          g += h.txt(793 + k3 * 70, qy + 23, 'v' + u, { size: 14, w: 600 });
        });
        if (!s.queue.length) g += h.txt(800, qy + 22, '（空）', { size: 13, fill: C.muted });
      }
      // 序列
      g += h.txt(430, 600, '遍历序列：' + (s.seq.length ? s.seq.map(function (u) { return 'v' + u; }).join(' → ') : '（待生成）'), { size: 15, fill: s.done ? C.green : C.ink, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
