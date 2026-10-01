/* 动画：拓扑排序——AOV 网、入度/栈算法、回路检测
   四张预置图各答一个问题（合法序列有几个），另有一个"写法"开关演示为什么不删边就会误判有环。 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var N = 6;
  var NAMES = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  var BASE_ARCS = [[0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [4, 5]];
  var POS = { 0: [300, 90], 1: [560, 90], 2: [180, 300], 3: [430, 300], 4: [680, 300], 5: [430, 500] };
  var CHAIN_ARCS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];
  var CHAIN_POS = { 0: [110, 160], 1: [220, 420], 2: [330, 160], 3: [440, 420], 4: [550, 160], 5: [650, 420] };
  var LOOSE_ARCS = [[0, 1], [1, 2], [2, 3]];
  var LOOSE_POS = { 0: [130, 160], 1: [300, 160], 2: [470, 160], 3: [640, 160], 4: [240, 430], 5: [470, 430] };

  /* orders = 这张图的合法拓扑序列个数（穷举 6! = 720 种排列数出来的，测试里再独立穷举对拍） */
  var PRESETS = {
    text: {
      arcs: BASE_ARCS, pos: POS, orders: 22,
      label: '① 教材图（基准，6 活动 6 约束）',
      teach: '第 1 张·基准：教材那个 AOV 网。这一张看**摘得完吗、以及答案不止一个**——' +
        '穷举 6! 种排列，满足全部约束的合法拓扑序列有 **22 个**；栈这一版给出的 C2,C5,C1,C4,C3,C6 只是其中一个' +
        '（恰好还是字典序最大的那个）。'
    },
    chain: {
      arcs: CHAIN_ARCS, pos: CHAIN_POS, orders: 1,
      label: '② 一条链：拓扑序列唯一',
      teach: '第 2 张·什么时候唯一：六个活动串成一条链，**合法序列只有 1 个**。' +
        '原因看得见：每一步栈里都恰好只有一个入度为 0 的点，没有可选的余地。' +
        '"拓扑序列唯一"的充要条件就是每步只有一个候选——反过来，只要某一步栈里有两个，序列就不止一个。'
    },
    cyc: {
      arcs: BASE_ARCS.concat([[5, 1]]), pos: POS, orders: 0,
      label: '③ 加一条 C6→C2：有回路',
      teach: '第 3 张·有回路：在 ① 上加一条 C6→C2，于是 C2→C4→C6→C2 互相等。' +
        '栈空了但只输出 2 个顶点，**剩下 4 个的入度永远降不到 0**——穷举 720 种排列，合法序列 **0 个**。' +
        '这就是拓扑排序当回路检测用的原理：输出不满 n 个 ⟺ 图里有环。'
    },
    loose: {
      arcs: LOOSE_ARCS, pos: LOOSE_POS, orders: 30,
      label: '④ 两个没人管的点：30 个序列',
      teach: '第 4 张·没有约束的点：C1→C2→C3→C4 一条链，外加 C5、C6 谁也不管、谁也不管他们。' +
        '合法序列涨到 **30 个**——那两个自由点可以插在链的任意位置。' +
        '注意它们一开始就都在栈里（入度为 0），所以栈一开就有三个候选。'
    }
  };
  var MODES = {
    ok: { label: '正常（弹点 + 删弧）' },
    nodelete: { label: '只弹点、不删弧（错误写法）' }
  };

  var CODE = [
    'bool TopologicalSort(ALGraph G) {',
    '    求 G 中各顶点的入度 inDegree[];',
    '    把所有入度为 0 的顶点进栈 S;',
    '    count = 0;',
    '    while (!StackEmpty(S)) {',
    '        v = Pop(S);  cout << v;  ++count;   // ① 栈顶（入度0）输出',
    '        for (每条弧 <v, w>) {',
    '            if (--inDegree[w] == 0)         // ② 删弧：后继入度减1',
    '                Push(S, w);                 //    减到 0 就进栈',
    '        }',
    '    }',
    '    return count >= G.vexnum;               // 输出不满 → 有回路',
    '}'
  ];

  DSC.reg({
    id: 'topo', ch: 6, name: '拓扑排序：AOV 网与回路检测',
    aim: 'AOV 网反复摘**入度为 0** 的点；摘不满 n 个就说明图里有回路',
    note: '教材 6.6 图的应用（AOV 网、拓扑排序、回路检测）',
    keywords: '拓扑排序 AOV网 入度为0 栈 输出序列 回路 环 检测 有向无环图 DAG 先修课程 唯一',
    guide: [
      '只有入度为 0 的顶点才能输出——输出后删除它的所有出弧',
      '删除弧使后继入度减 1，减到 0 就进栈；弹栈顺序就是拓扑序列',
      '「图」四张预置图各答一个问题：①基准（22 个合法序列）②一条链（唯一，1 个）③有回路（0 个）④两个自由点（30 个）',
      '「写法」是错误演示：只弹点不删弧，入度永远降不下来——无环的图也会"排不完"，可见第 7 行才是命门',
      '栈里同时有几个入度 0 的点，就说明这一步可以任选——拓扑序列往往不唯一'
    ],
    inputs: [
      { key: 'graph', label: '图', type: 'select', options: [
        ['text', PRESETS.text.label], ['chain', PRESETS.chain.label],
        ['cyc', PRESETS.cyc.label], ['loose', PRESETS.loose.label]
      ], value: 'text' },
      { key: 'mode', label: '写法', type: 'select', options: [
        ['ok', MODES.ok.label], ['nodelete', MODES.nodelete.label]
      ], value: 'ok' }
    ],
    run: function (v) {
      var pre = PRESETS[(v && v.graph) || 'text'] || PRESETS.text;
      var wrong = !!(v && v.mode === 'nodelete');
      var ARCS = pre.arcs, POS = pre.pos;
      var arcs = ARCS.map(function (a) { return a.slice(); });
      var frames = [];
      var inDeg = []; for (var q = 0; q < N; q++) inDeg.push(0);
      arcs.forEach(function (a) { inDeg[a[1]]++; });
      var stack = [], out = [];
      function snap(o) {
        o = o || {};
        o.arcs = arcs.map(function (a) { return a.slice(); });
        o.inDeg = inDeg.slice(); o.stack = stack.slice(); o.out = out.slice();
        o.N = N; o.cur = o.cur == null ? null : o.cur;
        o.delArc = o.delArc || null; o.pushed = o.pushed == null ? null : o.pushed;
        o.pos = POS; o.wrong = wrong; o.orders = pre.orders;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      function panelOf(extra) {
        var p = { 拓扑序列: out.join(' → ') || '（待输出）', 栈: stack.length ? '自底→顶 ' + stack.map(function (i) { return NAMES[i]; }).join(' ') : '（空）' };
        for (var j = 0; j < N; j++) p[NAMES[j] + ' 入度'] = String(inDeg[j]);
        if (extra) for (var k in extra) p[k] = extra[k];
        return p;
      }

      /* 首帧先说清这张图答什么问题（mst / Dijkstra / Floyd 定下的规矩） */
      F([0], pre.teach, { 图: pre.label, 写法: MODES[wrong ? 'nodelete' : 'ok'].label, 活动数: N + ' 个', 约束数: arcs.length + ' 条' }, snap({}));

      F([0, 1], 'AOV 网：顶点表示活动（课程），有向弧表示先后约束（C1 必须先于 C3、C4…）。拓扑排序 = 输出一个满足全部先后约束的序列。先求各顶点入度。',
        panelOf(), snap({}));

      F([2], '把所有入度为 0 的顶点进栈：', panelOf(), snap({}));
      for (var s0 = 0; s0 < N; s0++) {
        if (inDeg[s0] === 0) {
          stack.push(s0);
          F(2, NAMES[s0] + ' 入度为 0 → 进栈。栈（自底→顶）：' + stack.map(function (i) { return NAMES[i]; }).join(' '),
            panelOf(), snap({ pushed: s0 }));
        }
      }

      var guard = 0;
      while (stack.length && guard++ < N + 2) {
        var u = stack.pop();
        out.push(u);
        F([5], '① 弹栈输出 ' + NAMES[u] + '（count = ' + out.length + '）。' +
          (wrong ? '这一版**没有删除它的出弧**——后继的入度一个都没变。' : '它的所有出弧即将被"删除"。'),
          panelOf({ 当前输出: NAMES[u] }), snap({ cur: u }));
        if (wrong) continue;
        var outs = arcs.filter(function (a) { return a[0] === u; });
        for (var ai = 0; ai < outs.length; ai++) {
          var w = outs[ai][1];
          var old = inDeg[w];
          inDeg[w]--;
          var toPush = inDeg[w] === 0;
          if (toPush) stack.push(w);
          F([6, 7], '删除弧 ' + NAMES[u] + '→' + NAMES[w] + '：' + NAMES[w] + ' 入度 ' + old + ' → ' + inDeg[w] +
            (toPush ? '，减到 0 → 进栈。' : '，未减到 0，不入栈。'),
            panelOf(), snap({ cur: u, delArc: [u, w], pushed: toPush ? w : null }));
        }
      }

      if (out.length >= N) {
        F([10], '★ 拓扑排序成功！序列：' + out.map(function (i) { return NAMES[i]; }).join(' → ') + '（共 ' + N + ' 个顶点全部输出）。' +
          (pre.orders === 1
            ? '而且这个序列是**唯一的**：这张图每一步都恰好只有一个入度为 0 的点，没得选。'
            : '这张图一共有 ' + pre.orders + ' 个合法拓扑序列，刚才这一版只是其中一个。'),
          { 拓扑序列: out.map(function (i) { return NAMES[i]; }).join(' → '), 输出顶点数: N + ' / ' + N, 合法序列总数: pre.orders + ' 个' }, snap({ done: true }));
      } else if (wrong) {
        var restW = [];
        for (var r2 = 0; r2 < N; r2++) if (out.indexOf(r2) < 0) restW.push(NAMES[r2]);
        F([10], '✗ 栈空了，只输出 ' + out.length + ' 个（' + restW.join('、') + ' 没出来）——**但这张图里根本没有环**：' +
          '它本来有 ' + pre.orders + ' 个合法拓扑序列。错在第 7 行没执行：不删弧，后继的入度就永远降不到 0，' +
          '也就永远进不了栈。"输出不满 n 个 ⟹ 有回路"这条判据，**前提是删弧做对了**。',
          { 输出顶点数: out.length + ' / ' + N, 未输出: restW.join('、'), 结论: '不是有环，是没删弧', 合法序列总数: pre.orders + ' 个' },
          snap({ err: '没删弧', done: true }));
      } else {
        var rest = [];
        for (var r = 0; r < N; r++) if (out.indexOf(r) < 0) rest.push(NAMES[r]);
        F([10], '✗ 栈已空，但仍有 ' + rest.length + ' 个顶点（' + rest.join('、') + '）未能输出——它们的入度始终无法减到 0。' +
          '结论：该 AOV 网【存在回路】，拓扑排序失败（回路中的活动互相等待，工程无法开始）。' +
          '穷举 720 种排列，这张图的合法拓扑序列是 ' + pre.orders + ' 个。',
          { 输出顶点数: out.length + ' / ' + N, 未输出: rest.join('、'), 结论: '存在回路', 合法序列总数: pre.orders + ' 个' }, snap({ err: '回路', done: true }));
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 620;
      var NAMES2 = NAMES, POS = s.pos;
      var g = '';
      g += h.txt(430, 34, s.wrong ? 'AOV 网拓扑排序（错误写法：只弹点，不删弧）'
        : 'AOV 网拓扑排序（顶点=活动，弧=先后约束）', { size: 19, w: 600 });
      // 弧
      s.arcs.forEach(function (a) {
        var A = POS[a[0]], B = POS[a[1]];
        var dead = !s.wrong && s.out.indexOf(a[0]) >= 0;
        var isDel = s.delArc && s.delArc[0] === a[0] && s.delArc[1] === a[1];
        g += h.arrow(A[0], A[1], B[0], B[1], { stroke: dead ? C.line : (isDel ? C.amber : C.grey), sw: isDel ? 3 : 1.8, dash: dead ? '4,4' : null });
        if (isDel) {
          var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
          g += h.txt(mx + 18, my, '删', { size: 12, fill: C.amber, w: 700 });
        }
      });
      // 顶点
      for (var k = 0; k < s.N; k++) {
        var P = POS[k];
        var isOut = s.out.indexOf(k) >= 0;
        var fill = '#fff', stroke = C.grey, sw = 2;
        if (isOut) { fill = C.greenBg; stroke = C.green; }
        if (s.cur === k) { fill = C.amberBg; stroke = C.amber; sw = 4; }
        if (s.pushed === k && s.cur === null) { fill = C.blueBg; stroke = C.blue; sw = 3; }
        g += h.circle(P[0], P[1], 25, { fill: fill, stroke: stroke, sw: sw });
        g += h.txt(P[0], P[1] + 7, NAMES2[k], { size: 15, w: 700 });
        g += h.txt(P[0], P[1] + 40, '入度 ' + s.inDeg[k], { size: 11.5, fill: s.inDeg[k] === 0 && !isOut ? C.blue : C.muted });
      }
      // 右侧：入度表 + 栈
      var tx = 770;
      g += h.txt(tx + 95, 96, '入度表', { size: 14, w: 600 });
      for (var j = 0; j < s.N; j++) {
        var y = 108 + j * 30;
        var done = s.out.indexOf(j) >= 0;
        g += h.rect(tx, y, 190, 26, { fill: done ? C.greenBg : '#fff', stroke: C.line, sw: 1, rx: 4 });
        g += h.txt(tx + 34, y + 18, NAMES2[j], { size: 12.5, w: 600, family: 'Consolas,monospace' });
        g += h.txt(tx + 120, y + 18, done ? '已输出' : '入度 ' + s.inDeg[j], { size: 12, family: 'Consolas,monospace', fill: done ? C.green : C.ink });
      }
      var sy = 320;
      g += h.txt(tx + 95, sy - 14, '栈（自底→顶）', { size: 14, w: 600 });
      for (var k2 = 0; k2 < s.stack.length; k2++) {
        var yy = sy + (s.stack.length - 1 - k2) * 40;
        var top = k2 === s.stack.length - 1;
        g += h.rect(tx, yy, 190, 34, { fill: top ? C.blueBg : '#fff', stroke: top ? C.blue : C.grey, rx: 6, sw: top ? 2 : 1 });
        g += h.txt(tx + 95, yy + 22, NAMES2[s.stack[k2]], { size: 14, w: 600, fill: top ? C.blue : C.ink });
      }
      if (!s.stack.length) g += h.txt(tx + 95, sy + 20, '（空）', { size: 13, fill: C.muted });
      // 输出序列
      var oy = 575;
      g += h.txt(30, oy + 22, '拓扑序列输出', { size: 14, fill: C.muted, anchor: 'start', w: 600 });
      s.out.forEach(function (v2, k3) {
        g += h.rect(150 + k3 * 62, oy, 56, 40, { fill: C.greenBg, stroke: C.green, rx: 8 });
        g += h.txt(178 + k3 * 62, oy + 26, NAMES2[v2], { size: 16, w: 700, fill: C.green });
      });
      if (!s.out.length) g += h.txt(160, oy + 26, '（尚未输出）', { size: 13.5, fill: C.muted, anchor: 'start' });
      return h.svg(W, H, g);
    }
  });
})();
