/* 动画：拓扑排序——AOV 网、入度/栈算法、回路检测（可勾选加入回路边演示失败判定） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var N = 6;
  var NAMES = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  var BASE_ARCS = [[0, 2], [0, 3], [1, 3], [1, 4], [2, 5], [4, 5]];
  var POS = { 0: [300, 90], 1: [560, 90], 2: [180, 300], 3: [430, 300], 4: [680, 300], 5: [430, 500] };

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
    keywords: '拓扑排序 AOV网 入度为0 栈 输出序列 回路 环 检测 有向无环图 DAG 先修课程',
    guide: [
      '只有入度为 0 的顶点才能输出——输出后删除它的所有出弧',
      '删除弧使后继入度减 1，减到 0 就进栈；弹栈顺序就是拓扑序列',
      '勾选"加入回路边 C6→C2"再看一遍：有回路的 AOV 网无法完成拓扑排序',
      '拓扑序列不唯一（栈中同时有几个都能弹），但都满足所有先后约束'
    ],
    inputs: [
      { key: 'cycle', label: '加入回路边 C6→C2（演示失败判定）', type: 'checkbox', value: false }
    ],
    run: function (v) {
      var arcs = BASE_ARCS.slice();
      if (v.cycle) arcs.push([5, 1]);
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
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      function panelOf(extra) {
        var p = { 拓扑序列: out.join(' → ') || '（待输出）', 栈: stack.length ? '自底→顶 ' + stack.map(function (i) { return NAMES[i]; }).join(' ') : '（空）' };
        for (var j = 0; j < N; j++) p[NAMES[j] + ' 入度'] = String(inDeg[j]);
        if (extra) for (var k in extra) p[k] = extra[k];
        return p;
      }

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
        var v = stack.pop();
        out.push(v);
        F([5], '① 弹栈输出 ' + NAMES[v] + '（count = ' + out.length + '）。它的所有出弧即将被"删除"。',
          panelOf({ 当前输出: NAMES[v] }), snap({ cur: v }));
        var outs = arcs.filter(function (a) { return a[0] === v; });
        for (var ai = 0; ai < outs.length; ai++) {
          var w = outs[ai][1];
          var old = inDeg[w];
          inDeg[w]--;
          var toPush = inDeg[w] === 0;
          if (toPush) stack.push(w);
          F([6, 7], '删除弧 ' + NAMES[v] + '→' + NAMES[w] + '：' + NAMES[w] + ' 入度 ' + old + ' → ' + inDeg[w] +
            (toPush ? '，减到 0 → 进栈。' : '，未减到 0，不入栈。'),
            panelOf(), snap({ cur: v, delArc: [v, w], pushed: toPush ? w : null }));
        }
      }
      if (out.length >= N) {
        F([10], '★ 拓扑排序成功！序列：' + out.map(function (i) { return NAMES[i]; }).join(' → ') + '（共 ' + N + ' 个顶点全部输出）。同一 AOV 网的拓扑序列可能不唯一（栈中同时可弹时选择不同），但都必须满足所有先后约束。',
          { 拓扑序列: out.map(function (i) { return NAMES[i]; }).join(' → '), 输出顶点数: N + ' / ' + N }, snap({ done: true }));
      } else {
        var rest = [];
        for (var r = 0; r < N; r++) if (out.indexOf(r) < 0) rest.push(NAMES[r]);
        F([10], '✗ 栈已空，但仍有 ' + rest.length + ' 个顶点（' + rest.join('、') + '）未能输出——它们的入度始终无法减到 0。结论：该 AOV 网【存在回路】，拓扑排序失败（回路中的活动互相等待，工程无法开始）。',
          { 输出顶点数: out.length + ' / ' + N, 未输出: rest.join('、'), 结论: '存在回路' }, snap({ err: '回路', done: true }));
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 620;
      var g = '';
      g += h.txt(430, 34, 'AOV 网拓扑排序（顶点=活动，弧=先后约束）', { size: 19, w: 600 });
      // 弧
      s.arcs.forEach(function (a) {
        var A = POS[a[0]], B = POS[a[1]];
        var dead = s.out.indexOf(a[0]) >= 0;
        var isDel = s.delArc && s.delArc[0] === a[0] && s.delArc[1] === a[1];
        g += h.arrow(A[0], A[1], B[0], B[1], { stroke: dead ? C.line : (isDel ? C.amber : C.grey), sw: isDel ? 3 : 1.8, dash: dead ? '4,4' : null });
        if (isDel) {
          var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
          g += h.txt(mx + 18, my, '删', { size: 12, fill: C.amber, w: 700 });
        }
      });
      // 顶点
      for (var k = 0; k < N; k++) {
        var P = POS[k];
        var isOut = s.out.indexOf(k) >= 0;
        var fill = '#fff', stroke = C.grey, sw = 2;
        if (isOut) { fill = C.greenBg; stroke = C.green; }
        if (s.cur === k) { fill = C.amberBg; stroke = C.amber; sw = 4; }
        if (s.pushed === k && s.cur === null) { fill = C.blueBg; stroke = C.blue; sw = 3; }
        g += h.circle(P[0], P[1], 25, { fill: fill, stroke: stroke, sw: sw });
        g += h.txt(P[0], P[1] + 7, NAMES[k], { size: 15, w: 700 });
        g += h.txt(P[0], P[1] + 40, '入度 ' + s.inDeg[k], { size: 11.5, fill: s.inDeg[k] === 0 && !isOut ? C.blue : C.muted });
      }
      // 右侧：入度表 + 栈
      var tx = 770;
      g += h.txt(tx + 95, 96, '入度表', { size: 14, w: 600 });
      for (var j = 0; j < N; j++) {
        var y = 108 + j * 30;
        var done = s.out.indexOf(j) >= 0;
        g += h.rect(tx, y, 190, 26, { fill: done ? C.greenBg : '#fff', stroke: C.line, sw: 1, rx: 4 });
        g += h.txt(tx + 34, y + 18, NAMES[j], { size: 12.5, w: 600, family: 'Consolas,monospace' });
        g += h.txt(tx + 120, y + 18, done ? '已输出' : '入度 ' + s.inDeg[j], { size: 12, family: 'Consolas,monospace', fill: done ? C.green : C.ink });
      }
      var sy = 320;
      g += h.txt(tx + 95, sy - 14, '栈（自底→顶）', { size: 14, w: 600 });
      for (var k2 = 0; k2 < s.stack.length; k2++) {
        var yy = sy + (s.stack.length - 1 - k2) * 40;
        var top = k2 === s.stack.length - 1;
        g += h.rect(tx, yy, 190, 34, { fill: top ? C.blueBg : '#fff', stroke: top ? C.blue : C.grey, rx: 6, sw: top ? 2 : 1 });
        g += h.txt(tx + 95, yy + 22, NAMES[s.stack[k2]], { size: 14, w: 600, fill: top ? C.blue : C.ink });
      }
      if (!s.stack.length) g += h.txt(tx + 95, sy + 20, '（空）', { size: 13, fill: C.muted });
      // 输出序列
      var oy = 575;
      g += h.txt(30, oy + 22, '拓扑序列输出', { size: 14, fill: C.muted, anchor: 'start', w: 600 });
      s.out.forEach(function (v2, k3) {
        g += h.rect(150 + k3 * 62, oy, 56, 40, { fill: C.greenBg, stroke: C.green, rx: 8 });
        g += h.txt(178 + k3 * 62, oy + 26, NAMES[v2], { size: 16, w: 700, fill: C.green });
      });
      if (!s.out.length) g += h.txt(160, oy + 26, '（尚未输出）', { size: 13.5, fill: C.muted, anchor: 'start' });
      return h.svg(W, H, g);
    }
  });
})();
