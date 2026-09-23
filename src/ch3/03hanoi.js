/* 动画5：汉诺塔与递归调用栈（移动序列与调用栈同步演示；f(n)=2^n−1） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'void hanoi(int n, char A, char B, char C) {  // 把n个盘从A借助B移到C',
    '    if (n == 1)',
    '        move(1, A, C);                       // 递归出口：1个盘直接移',
    '    else {',
    '        hanoi(n - 1, A, C, B);               // ① 上面n-1个盘 A→B（借助C）',
    '        move(n, A, C);                       // ② 第n号盘 A→C',
    '        hanoi(n - 1, B, A, C);               // ③ n-1个盘 B→C（借助A）',
    '    }',
    '}'
  ];

  DSC.reg({
    id: 'hanoi', ch: 3, name: '递归调用栈：汉诺塔',
    aim: '递归靠的是**系统栈**：把每层的 n 和起止柱压进栈，才看得懂为什么是 2ⁿ−1 步',
    note: '教材 3.4 栈与递归（递归工作栈）',
    guide: [
      '右侧递归工作栈与左侧圆盘移动完全同步：压栈=展开一层计划，弹栈=该层完成',
      '每个移动帧都标注由哪个栈帧的哪一步触发',
      '把 n 调到 4、5，观察步数按 2^n − 1 指数增长',
      '最大栈深 = n → 空间 O(n)；步数 2^n − 1 → 时间 O(2^n)'
    ],
    inputs: [
      { key: 'n', label: '盘子数 n', type: 'number', value: 3, min: 1, max: 5 }
    ],
    run: function (v) {
      var n = Math.floor(+v.n);
      if (!(n >= 1 && n <= 5)) throw new Error('盘子数 n 取 1～5（5 已经要 31 步）');
      var frames = [];
      var pegs = { A: [], B: [], C: [] };
      for (var d = n; d >= 1; d--) pegs.A.push(d);
      var stack = [], step = 0;
      function snap(o) {
        o = o || {};
        o.pegs = { A: pegs.A.slice(), B: pegs.B.slice(), C: pegs.C.slice() };
        o.stack = stack.slice(); o.step = step; o.n = n; o.total = Math.pow(2, n) - 1;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      var depthMax = 0;

      function move(m, from, to) {
        var disc = pegs[from].pop();
        pegs[to].push(disc);
        step++;
        var owner = stack[stack.length - 1] || '';
        F([m === 1 ? 2 : 5], '第 ' + step + ' 步：move(' + m + ', ' + from + ', ' + to + ') —— 盘 ' + disc + ' 从 ' + from + ' 移到 ' + to + '。（由当前栈顶 ' + owner + ' 的' + (m === 1 ? '递归出口' : '第②步 move') + '触发）',
          { 递归调用栈: stack.join(' ｜ '), 已移动: step + ' / ' + (Math.pow(2, n) - 1) + ' 步' },
          snap({ last: { disc: disc, from: from, to: to }, phase: 'move' }));
      }
      function hanoi(k, from, via, to) {
        stack.push('hanoi(' + k + ',' + from + '→' + to + ',借助' + via + ')');
        if (stack.length > depthMax) depthMax = stack.length;
        F(0, '调用 hanoi(' + k + ', ' + from + ', ' + via + ', ' + to + ')：系统把工作记录（参数、返回地址）压入【递归工作栈】。当前栈深 ' + stack.length + '。',
          { 递归调用栈: stack.join(' ｜ '), 已移动: step + ' 步' }, snap({ phase: 'call' }));
        if (k === 1) {
          move(1, from, to);
        } else {
          hanoi(k - 1, from, to, via);   // A→B 借助C：参数顺序 (from, to, via) 中 to=B via=C
          move(k, from, to);
          hanoi(k - 1, via, from, to);
        }
        stack.pop();
        F(0, 'hanoi(' + k + ',' + from + '→' + to + ') 执行完毕，返回：栈帧弹出、现场恢复。' + (stack.length ? '回到上一层 ' + stack[stack.length - 1] + '。' : '栈空，递归结束。'),
          { 递归调用栈: stack.join(' ｜ ') || '（空）', 已移动: step + ' 步' }, snap({ phase: 'ret' }));
      }

      F(0, '初始状态：' + n + ' 个盘按大到小叠在 A 柱，目标：全部移到 C 柱。规则：每次只移 1 个盘、大盘不能压小盘。预测总步数 f(n) = 2^n − 1 = ' + (Math.pow(2, n) - 1) + '。',
        { 递归调用栈: '（空）', 已移动: '0 步', 预测总步数: '2^' + n + ' − 1 = ' + (Math.pow(2, n) - 1) },
        snap({ phase: 'init' }));
      hanoi(n, 'A', 'B', 'C');
      F([6], '完成！共移动 ' + step + ' 步 = 2^' + n + ' − 1。递归调用最大栈深 ' + depthMax + ' = n，空间复杂度 O(n)；步数 2^n − 1 → 时间复杂度 O(2^n)（64 个盘要 5800 多亿年）。',
        { 总步数: step + ' = 2^' + n + ' − 1', 最大栈深: depthMax }, snap({ phase: 'done', done: true }));
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470;
      var baseY = 356, px = [170, 400, 630], pegNames = ['A', 'B', 'C'];
      /* 栈面板与最右一根柱子共用横向空间：盘 5 的右缘必须停在 STK_X 之前，否则 n=5 时盘子压到栈框上 */
      var STK_X = 762, STK_W = 218;
      var g = '';
      g += h.txt(W / 2, 36, '汉诺塔（n = ' + s.n + '，目标 A → C，借助 B）', { size: 19, w: 600 });
      var colors = ['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'];
      for (var p = 0; p < 3; p++) {
        var X = px[p], discs = s.pegs[pegNames[p]];
        g += h.rect(X - 95, baseY + 6, 190, 10, { fill: C.grey, stroke: 'none', rx: 5 });
        g += h.line(X, baseY, X, baseY - s.n * 26 - 40, { stroke: C.muted, sw: 3 });
        g += h.txt(X, baseY + 38, pegNames[p], { size: 20, w: 700 });
        for (var k = 0; k < discs.length; k++) {
          var dsz = discs[k];
          var wHalf = 20 + dsz * 18;   /* 相邻柱最大盘不得相碰（间距 230 > 2×110），且最右盘缘停在栈面板 762 之前 */
          var y = baseY - (k + 1) * 26 + 4;
          var isLast = s.last && s.last.to === pegNames[p] && s.phase === 'move' &&
            k === discs.length - 1;
          g += h.rect(X - wHalf, y, wHalf * 2, 24, {
            fill: colors[dsz - 1], stroke: isLast ? C.amber : '#1e40af', sw: isLast ? 3 : 1, rx: 12
          });
          g += h.txt(X, y + 17, '盘' + dsz, { size: 12.5, fill: '#0b1c39', w: 600 });
        }
      }
      if (s.last && s.phase === 'move') {
        g += h.txt(W / 2, 84, '第 ' + s.step + ' 步：盘 ' + s.last.disc + '  ' + s.last.from + ' → ' + s.last.to, { size: 16, fill: C.amber, w: 700 });
      }
      // 递归栈（右侧）
      var sx = STK_X + STK_W / 2, sy = 90;
      g += h.txt(sx, sy - 20, '递归工作栈', { size: 13, fill: C.muted, w: 600 });
      for (var k2 = 0; k2 < s.stack.length; k2++) {
        var yy = sy + (s.stack.length - 1 - k2) * 34;
        var isTop = k2 === s.stack.length - 1;
        g += h.rect(STK_X, yy, STK_W, 30, { fill: isTop ? C.blueBg : '#fff', stroke: isTop ? C.blue : C.grey, rx: 6, sw: isTop ? 2 : 1 });
        g += h.txt(STK_X + STK_W / 2, yy + 20, s.stack[k2], { size: 12, fill: isTop ? C.blue : C.ink, family: 'Consolas,monospace' });
      }
      if (!s.stack.length) g += h.txt(STK_X + STK_W / 2, sy + 20, '（栈空）', { size: 13, fill: C.muted });
      var note = s.phase === 'init' ? '预测步数 f(n) = 2^n − 1 = ' + s.total + '，下面逐层递归验证'
        : s.done ? '完成：共 ' + s.step + ' 步 = 2^' + s.n + ' − 1；最大栈深 = n → 空间 O(n)，步数指数增长 → 时间 O(2^n)'
        : (s.phase === 'call' ? '压栈：保存工作记录' : s.phase === 'ret' ? '弹栈：恢复现场' : '移动一个盘');
      var nc = s.done ? C.green : C.blue;
      g += h.rect(W / 2 - 260, H - 42, 520, 32, { fill: s.done ? C.greenBg : C.blueBg, stroke: nc, rx: 8 });
      g += h.txt(W / 2, H - 21, note, { size: 13.5, fill: nc, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
