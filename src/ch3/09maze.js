/* 动画：迷宫求解（栈的应用）——教材 3.6 案例，DFS 探索 + 回溯，位置足迹栈 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'void MazePath(MazeType maze, PosType start, PosType end) {',
    '    InitStack(S);  cur = start;',
    '    do {',
    '        if (Pass(cur)) {                     // 当前位置可通',
    '            FootPrint(cur);  Push(S, cur);   // 留足迹，入栈',
    '            if (cur == end)  return OK;      // 到达终点',
    '            cur = NextPos(cur, 1);           // 按右→下→左→上试探下一位置',
    '        } else {',
    '            if (!StackEmpty(S)) {',
    '                Pop(S, cur);                 // 死路：回溯到上一格',
    '                while (cur.di == 4 && !StackEmpty(S))  Pop(S, cur);  // 四面都试过则再回退',
    '                if (cur.di < 4) { cur.di++;  cur = NextPos(cur, cur.di); }',
    '            }',
    '        }',
    '    } while (!StackEmpty(S));',
    '    return FALSE;                            // 栈空仍未到终点：无通路',
    '}'
  ];

  /* 8×8 迷宫：0=通路 1=墙。设计有唯一主路径（右→下优先可解） */
  var MAZE = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1]
  ];
  /* 上面 10 列被压缩到 8×8 有效区（行列 1..8），边界全 1 */
  var START = [1, 1], END = [8, 8];
  var DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];   // 右 下 左 上
  var DNAME = ['右', '下', '左', '上'];

  DSC.reg({
    id: 'maze', ch: 3, name: '迷宫求解（栈与回溯）',
    aim: '迷宫求解 = 深度优先 + 回溯：**走不通就退回上一个岔口**换方向',
    note: '教材 3.6 案例分析与实现（DFS 探索、足迹栈、死路回溯）',
    keywords: '迷宫求解 回溯 DFS 足迹栈 死路 方向 探路 通路 栈应用  retreat',
    guide: [
      '从入口 (1,1) 出发按 **右→下→左→上** 的固定顺序试探：能走就留足迹入栈',
      '走到死路（四面不通）→ 弹栈**回溯**到上一个岔路口换方向——红色虚线是退掉的脚印',
      '栈里装的就是"从入口到当前位置的路径"——DFS 探索天然用栈（第 6 章图的 DFS 同理）',
      '栈空仍未到终点 → 无通路。蓝色=当前路径，灰=探索过但放弃的位置'
    ],
    inputs: [
      { key: 'start', label: '入口', type: 'select', options: [['1,1', '(1,1) 左上'], ['8,2', '(8,2) 左下']], value: '1,1' }
    ],
    run: function (v) {
      var st = v.start === '8,2' ? [8, 2] : [1, 1];
      var en = st[0] === 1 ? [8, 8] : [1, 8];
      var frames = [];
      var foot = {}, tried = {}, stack = [];
      function key(r, c) { return r + ',' + c; }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 栈深: String(stack.length), 位置: extra.pos || (stack.length ? '(' + stack[stack.length - 1][0] + ',' + stack[stack.length - 1][1] + ')' : '—') },
          snap: { foot: JSON.parse(JSON.stringify(foot)), tried: JSON.parse(JSON.stringify(tried)), stack: stack.map(function (x) { return x.slice(); }), cur: extra.cur || null, pop: extra.pop || null, start: st, end: en, mark: mk }
        });
      }
      F(0, '迷宫（0=通路 1=墙），入口 (' + st[0] + ',' + st[1] + ')，出口 (' + en[0] + ',' + en[1] + ')。试探顺序：右 → 下 → 左 → 上。', {});

      var cur = { r: st[0], c: st[1], di: 0 };
      foot[key(cur.r, cur.c)] = 1;
      stack.push([cur.r, cur.c, 0]);
      F(1, '入口入栈，开始探索。', { cur: cur });
      var guard = 0, solved = false;
      while (stack.length && guard++ < 400) {
        var top = stack[stack.length - 1];
        var r = top[0], c = top[1], di = top[2];
        var moved = false;
        while (di < 4) {
          var nr = r + DIRS[di][0], nc = c + DIRS[di][1];
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && MAZE[nr][nc] === 0 && !foot[key(nr, nc)] && !tried[key(nr, nc)]) {
            /* 走这一步 */
            stack[stack.length - 1][2] = di + 1;
            foot[key(nr, nc)] = 1;
            stack.push([nr, nc, 0]);
            cur = { r: nr, c: nc, di: 0 };
            moved = true;
            break;
          }
          di++;
        }
        if (moved === false && di >= 4) {
          /* 没找到可走方向：回溯 */
          var popped = stack.pop();
          tried[key(popped[0], popped[1])] = 1;
          delete foot[key(popped[0], popped[1])];
          F([9, 10], '(' + popped[0] + ',' + popped[1] + ') 四面皆死路 → 弹栈回溯（红虚线足迹）。', { pop: popped, cur: { r: popped[0], c: popped[1] } });
        } else {
          var now = stack[stack.length - 1];
          if (now[0] === en[0] && now[1] === en[1]) {
            solved = true;
            F([5], '到达出口 (' + en[0] + ',' + en[1] + ')！路径即栈中全部元素（' + stack.length + ' 格）。', { cur: { r: now[0], c: now[1] } }, 'found');
            break;
          }
          F([3, 4, 5], '走到 (' + now[0] + ',' + now[1] + ')，足迹入栈（栈深 ' + stack.length + '）。', { cur: { r: now[0], c: now[1] } });
        }
      }
      if (!solved) F(12, '栈空仍未到达出口 → 该迷宫从给定入口**无通路**。', {}, 'fail');
      F(0, solved ? '结论：DFS 探索 + 栈回溯。栈中保存的正是"从入口到现在"的完整路径——这就是深度优先遍历的骨架（第 6 章 DFS(v) 与此同构）。' : '换一个入口再试试（左上 / 左下）。', { mark: 'final' });
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 520, cell = 40, ox = 70, oy = 66;
      var g = '';
      g += h.txt(W / 2 + 60, 36, '迷宫求解（蓝=路径足迹，灰=探索后放弃，红虚=回溯）', { size: 16, w: 600 });
      for (var r = 0; r < 10; r++) for (var c = 0; c < 10; c++) {
        var x = ox + c * cell, y = oy + r * cell;
        var wall = MAZE[r][c] === 1;
        var k = r + ',' + c;
        var isFoot = s.foot[k] != null, isTried = s.tried[k];
        var f = wall ? '#334155' : '#fff';
        if (isFoot) f = C.blueBg;
        if (isTried) f = '#f1f5f9';
        g += h.rect(x, y, cell - 4, cell - 4, { fill: f, stroke: wall ? '#334155' : C.line, sw: 1.2, rx: 3 });
        if (s.start[0] === r && s.start[1] === c) g += h.txt(x + cell / 2 - 2, y + cell / 2 + 5, '入', { size: 14, w: 700, fill: C.green });
        if (s.end[0] === r && s.end[1] === c) g += h.txt(x + cell / 2 - 2, y + cell / 2 + 5, '出', { size: 14, w: 700, fill: C.amber });
        if (isFoot) g += h.circle(x + cell / 2 - 2, y + cell / 2, 5, { fill: C.blue, stroke: C.blue });
        if (s.cur && s.cur.r === r && s.cur.c === c) g += h.circle(x + cell / 2 - 2, y + cell / 2, 10, { fill: 'none', stroke: C.amber, sw: 3 });
        if (s.pop && s.pop[0] === r && s.pop[1] === c) g += h.circle(x + cell / 2 - 2, y + cell / 2, 9, { fill: 'none', stroke: C.red, sw: 2.5, dash: '3,3' });
      }
      /* 栈视图 */
      var sx = 540;
      g += h.txt(sx + 80, 60, '足迹栈（底 → 顶）', { size: 13, fill: C.muted, w: 600 });
      // 行距按栈深自适应：固定 30 时超过约 14 条就画到画布外，长路径的栈顶几格会看不见
      var nS = s.stack.length;
      var pitch = nS > 1 ? Math.min(30, (412 - 26) / (nS - 1)) : 30;
      var bh = Math.max(15, Math.min(26, pitch - 3));
      s.stack.forEach(function (p2, i2) {
        var y2 = 76 + i2 * pitch;
        g += h.rect(sx, y2, 160, bh, { fill: '#fff', stroke: C.line, sw: 1, rx: 4 });
        g += h.txt(sx + 80, y2 + bh * 0.72, '(' + p2[0] + ',' + p2[1] + ')',
          { size: Math.min(12, bh - 3), family: 'Consolas,monospace' });
      });
      if (!s.stack.length) g += h.txt(sx + 80, 92, '（空）', { size: 12.5, fill: C.muted });
      g += h.txt(270, 500, '入口绿「入」出口黄「出」｜ 回溯就是"出栈+把该格标记为放弃"', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
