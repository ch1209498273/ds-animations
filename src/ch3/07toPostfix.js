/* 动画：中缀表达式 → 后缀表达式（逆波兰），以及后缀式的栈式求值 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**，不是行号 */
  var CODE = [
    '/* 中缀 → 后缀：扫描一遍，操作数直接输出，运算符进栈压住 */',
    'Priority:  + − → 1     * / → 2     ^ → 3（右结合）',
    '           (  → 入栈但不比较；遇到 ) 弹到 ( 为止',
    '',
    'for (每个 token x) {',
    '    if (x 是操作数)        输出 x;',
    '    else if (x == \'(\')     push(x);',
    '    else if (x == \')\')     while (栈顶 != \'(\')  pop 并输出;  pop 掉 \'(\';',
    '    else {                              // 运算符',
    '        while (栈不空 && 栈顶不是 \'(\',',
    '               && (优先级(栈顶) > 优先级(x)',
    '                    || 优先级(栈顶) == 优先级(x) 且 x 不是 ^))',
    '            pop 并输出;                  // 栈顶该先算，先出去',
    '        push(x);',
    '    }',
    '}',
    'while (栈不空) pop 并输出;               // 收尾',
    '',
    '/* 后缀式求值：只扫一遍，不需要栈存运算符 */',
    'for (每个 token x) {',
    '    if (x 是操作数)  push(x);',
    '    else { b = pop(); a = pop(); push(a x b); }   // 注意 a、b 顺序',
    '}'
  ];
  var PREC = { '+': 1, '−': 1, '-': 1, '*': 2, '/': 2, '^': 3 };

  function tokenize(src) {
    var t = String(src).replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/-/g, '−'), out = [], i = 0;
    while (i < t.length) {
      var c = t.charAt(i);
      if (/[0-9.]/.test(c)) { var j = i; while (j < t.length && /[0-9.]/.test(t.charAt(j))) j++; out.push(t.slice(i, j)); i = j; }
      else if (/[a-zA-Z]/.test(c)) { out.push(c); i++; }
      else if ('+−*/^()'.indexOf(c) >= 0) { out.push(c); i++; }
      else throw Error('不支持的字符「' + c + '」，只允许数字/字母与 + − * / ^ ( )');
    }
    return out;
  }
  function isOp(x) { return '+−*/^'.indexOf(x) >= 0 && x.length === 1; }
  function isNum(x) { return /^[0-9.]+$/.test(x); }

  DSC.reg({
    id: 'toPostfix', ch: 3, name: '中缀转后缀与后缀式求值（逆波兰）',
    aim: '中缀转后缀之后为什么能去掉括号还照算：**逆波兰式自带优先级**',
    note: '教材 3.3 栈的应用（算符优先）：中缀→后缀逐符号决策，后缀式一遍扫完求值',
    keywords: '后缀式 逆波兰 RPN 中缀转后缀 算符优先 出栈 逐符号扫描 波兰式 前缀 手工转换',
    guide: [
      '计算机算不了中缀：既要括号又要优先级，还得回头看。**后缀式**把顺序写死在串里，一遍扫描、只用一个栈就能算完',
      '转换只有一条判断：**栈顶运算符该不该先算**。栈顶优先级 ≥ 当前运算符（左结合）就先弹出去输出，弹到更低为止，再把当前的压进去',
      '`^` 是右结合，所以栈顶同为 `^` 时**不弹**——`2^3^2` 是 2^(3^2)，不是 (2^3)^2，这是最容易错的点',
      '求值时弹栈顺序别反：先弹出的是**右**操作数 b、后弹出的是左操作数 a，算的是 `a 运算符 b`。做 `12/4-2` 一验就知道'
    ],
    inputs: [
      {
        key: 'scene', label: '场景', type: 'select', options: [
          ['conv', '中缀 → 后缀（逐符号决策）'], ['eval', '后缀式求值（一遍扫描）'],
          ['both', '先转换、再用结果求值']
        ], value: 'conv'
      },
      { key: 'expr', label: '中缀表达式', type: 'text', value: '12/(4-2)+3*5-8/4' }
    ],

    run: function (v) {
      var tk = tokenize(v.expr);
      if (!tk.length) throw Error('表达式不能为空');
      if (tk.length > 21) throw Error('表达式太长（最多 21 个 token）');
      var scene = v.scene, frames = [];
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({
          tk: tk.slice(), at: -1, stack: [], out: [], phase: 'conv', evalStack: [], done: false, note2: ''
        }, snap || {}) });
      }
      /* ---- 转换 ---- */
      var stack = [], out = [], bal = 0;
      tk.forEach(function (t) { if (t === '(') bal++; if (t === ')') bal--; if (bal < 0) throw Error('括号不匹配：多余的右括号'); });
      if (bal !== 0) throw Error('括号不匹配：还差 ' + bal + ' 个右括号');

      F([0, 1, 2], '中缀式 `' + tk.join('') + '` 共 ' + tk.length + ' 个 token。' +
        '规则：操作数**直接输出**；运算符进栈，但要先把栈里"该先算的"弹出去。',
        { 输入长度: tk.length + ' 个', 后缀输出: '（空）' }, { phase: 'init' });
      tk.forEach(function (x, i) {
        if (isNum(x) || /^[a-zA-Z]$/.test(x)) {
          out.push(x);
          F([5], '`' + x + '` 是操作数 → 直接抄到输出。栈不动。',
            { 当前token: x, 动作: '输出', 栈: stack.join('') || '空', 输出: out.join(' ') },
            { at: i, stack: stack.slice(), out: out.slice(), hotOut: out.length - 1 });
        } else if (x === '(') {
          stack.push(x);
          F([6], '`(` 一律入栈，**不参与比较**——它是道墙，墙里的先算完才轮到外面。',
            { 当前token: x, 动作: '入栈', 栈: stack.join('') || '空', 输出: out.join(' ') },
            { at: i, stack: stack.slice(), out: out.slice(), hotStk: stack.length - 1 });
        } else if (x === ')') {
          var popped = [];
          while (stack.length && stack[stack.length - 1] !== '(') { popped.push(stack.pop()); out.push(popped[popped.length - 1]); }
          stack.pop();
          F([7], '`)` 来了：把栈里从顶到 `(` 之间的运算符**全部弹出输出**（' + popped.join('、') + '），再把 `(` 丢掉——它不进输出。',
            { 当前token: x, 动作: '弹到 ( 为止', 弹出: popped.join(' ') || '（括号里没运算符）', 栈: stack.join('') || '空', 输出: out.join(' ') },
            { at: i, stack: stack.slice(), out: out.slice(), popped: popped });
        } else {
          var evicted = [];
          while (stack.length) {
            var top = stack[stack.length - 1];
            if (top === '(') break;
            var higher = PREC[top] > PREC[x];
            var equalLeft = PREC[top] === PREC[x] && x !== '^';
            if (!(higher || equalLeft)) break;
            evicted.push(stack.pop()); out.push(evicted[evicted.length - 1]);
          }
          stack.push(x);
          F([8, 9, 10, 11, 12, 13], '`' + x + '`（优先级 ' + PREC[x] + '）入栈前先看栈顶：' +
            (evicted.length
              ? '栈顶 ' + evicted.join('、') + ' 优先级不低于它、且 `' + x + '`' + (x === '^' ? '是右结合' : '是左结合') +
                ' → 说明那些**该先算**，全部弹出输出，然后把 `' + x + '` 压进去。'
              : (stack.length > 1 ? '栈顶 `' + stack[stack.length - 2] + '` 优先级更低' : '栈是空的（或栈顶是 `(`）') +
                ' → 没有要先算的，直接压栈。'),
            { 当前token: x, 动作: evicted.length ? '先弹 ' + evicted.join('') + ' 再入栈' : '直接入栈', 栈: stack.join('') || '空', 输出: out.join(' ') },
            { at: i, stack: stack.slice(), out: out.slice(), popped: evicted, hotStk: stack.length - 1 });
        }
      });
      var tail = [];
      while (stack.length) { tail.push(stack.pop()); out.push(tail[tail.length - 1]); }
      F([16], '扫描结束，把栈里剩下的运算符全部弹出输出：' + tail.join('、') + '。',
        { 动作: '清空栈', 栈: '空', 输出: out.join(' ') }, { at: tk.length - 1, stack: [], out: out.slice(), popped: tail });
      F([0], '★ 转换完成：`' + tk.join('') + '` → 后缀式 `' + out.join(' ') + '`。' +
        '校验：后缀式里没有括号、运算顺序完全由位置决定，扫一遍就能算。',
        { 中缀: tk.join(''), 后缀: out.join(' '), 输出长度: out.length + ' 个' },
        { stack: [], out: out.slice(), done: scene === 'conv', phase: 'done' });
      if (scene === 'conv') return { code: CODE, frames: frames };

      /* ---- 求值 ---- */
      var vs = [], unknown = null;
      F([17, 18], '现在用后缀式 `' + out.join(' ') + '` 求值：只扫一遍，操作数压栈，遇到运算符就弹两个来算。',
        { 后缀式: out.join(' '), 栈: '空' }, { out: out.slice(), phase: 'eval' });
      out.forEach(function (x, i) {
        if (isNum(x)) {
          vs.push(+x);
          F([19], '`' + x + '` 是操作数 → 压栈。', { 当前: x, 栈: vs.join(' ') },
            { out: out.slice(), at: i, evalStack: vs.slice(), hotEv: vs.length - 1, phase: 'eval' });
        } else if (/^[a-zA-Z]$/.test(x)) {
          unknown = x;
          F([19], '`' + x + '` 是变量，没有赋值 → 无法算出数值，改成一个具体数字再试。',
            { 当前: x, 栈: vs.join(' ') }, { out: out.slice(), at: i, evalStack: vs.slice(), phase: 'eval' });
        } else {
          if (vs.length < 2) { F([20], '栈里只剩 ' + vs.length + ' 个数，凑不出一个二元运算——后缀式本身不合法。',
            { 当前: x }, { out: out.slice(), at: i, evalStack: vs.slice(), phase: 'eval' }); return; }
          var b = vs.pop(), a = vs.pop(), r = x === '+' ? a + b : x === '−' ? a - b : x === '*' ? a * b : x === '/' ? a / b : Math.pow(a, b);
          vs.push(r);
          F([20], '`' + x + '`：先弹出的是**右**操作数 b = ' + b + '，再弹出左操作数 a = ' + a +
            ' → 算 `a ' + x + ' b` = ' + a + ' ' + x + ' ' + b + ' = ' + (Math.round(r * 1e6) / 1e6) + '，结果压回栈。',
            { 当前: x, 算式: a + ' ' + x + ' ' + b + ' = ' + (Math.round(r * 1e6) / 1e6), 栈: vs.join(' ') },
            { out: out.slice(), at: i, evalStack: vs.slice(), hotEv: vs.length - 1, phase: 'eval' });
        }
      });
      if (unknown) F([19], '★ 含变量的后缀式只能化简不能求值：栈里剩 ' + vs.length + ' 项。',
        { 变量: unknown, 栈: vs.join(' ') }, { out: out.slice(), evalStack: vs.slice(), done: true, phase: 'eval' });
      else F([17], '★ 求值结束，栈里剩唯一一项 **' + (Math.round(vs[0] * 1e6) / 1e6) + '**，就是答案。' +
        '整个过程没有优先级判断、没有括号——顺序已经编码在串里了。这就是编译器把表达式转成后缀（逆波兰）的原因。',
        { 结果: String(Math.round(vs[0] * 1e6) / 1e6), 后缀式: out.join(' ') },
        { out: out.slice(), evalStack: vs.slice(), done: true, phase: 'eval' });
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 520, g = '';
      var evalMode = s.phase === 'eval';
      g += h.txt(W / 2, 28, evalMode ? '后缀式求值：一个栈走到底' : '中缀 → 后缀：操作数直出，运算符看优先级',
        { size: 17, w: 600 });
      g += h.txt(30, 50, '图例：橙=当前 token / 刚弹出的项 蓝=栈顶 绿=本轮新写出的输出 灰=已消费',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      var bw = Math.min(46, Math.floor((W - 120) / Math.max(s.tk.length, 1))), x0 = (W - s.tk.length * (bw + 5)) / 2;
      /* 输入流 */
      g += h.txt(x0 - 8, 96, '输入', { size: 12, fill: C.muted, anchor: 'end', w: 600 });
      s.tk.forEach(function (t, i) {
        var used = evalMode || i < s.at, cur = !evalMode && i === s.at;
        g += h.rect(x0 + i * (bw + 5), 76, bw, 30, {
          fill: cur ? C.amberBg : used ? '#eef2f7' : '#fff', stroke: cur ? C.amber : used ? C.line : C.grey,
          sw: cur ? 2.4 : 1.2, rx: 5
        });
        g += h.txt(x0 + i * (bw + 5) + bw / 2, 96, t, { size: 13, w: cur ? 700 : 400, fill: used && !cur ? '#a3afbd' : C.ink });
      });
      /* 输出带 */
      var oy = 168;
      g += h.txt(x0 - 8, oy + 22, '输出', { size: 12, fill: C.muted, anchor: 'end', w: 600 });
      var ow = Math.min(46, Math.floor((W - 120) / Math.max(s.out.length, 1)));
      var ox0 = (W - s.out.length * (ow + 5)) / 2;
      s.out.forEach(function (t, i) {
        var isNew = !evalMode && i === s.hotOut;
        var popped = !evalMode && s.popped && s.out.length - s.popped.length === i;
        g += h.rect(ox0 + i * (ow + 5), oy, ow, 30, {
          fill: isNew ? C.greenBg : popped ? C.amberBg : '#fff', stroke: isNew ? C.green : popped ? C.amber : C.line,
          sw: isNew || popped ? 2.2 : 1.1, rx: 5
        });
        g += h.txt(ox0 + i * (ow + 5) + ow / 2, oy + 20, t, { size: 13, w: isNew ? 700 : 400 });
      });
      if (!s.out.length) g += h.txt(ox0, oy + 20, '（还没有输出）', { size: 12, fill: C.muted, anchor: 'start' });
      /* 栈 */
      var stk = evalMode ? s.evalStack.map(String) : s.stack;
      var sy0 = 246, sh = 34;
      g += h.txt(W / 2, sy0 - 12, evalMode ? '值栈（顶在右）' : '运算符栈（顶在右）', { size: 12.5, fill: C.muted });
      for (var r = 0; r < Math.max(stk.length, 1); r++) {
        var y = sy0 + r * (sh + 8);
        if (r >= stk.length) {
          g += h.rect(W / 2 - 30, y, 60, sh, { fill: '#fbfcfe', stroke: C.line, sw: 1, rx: 6, dash: '5,4' });
          g += h.txt(W / 2, y + 22, '空', { size: 12, fill: C.muted });
          continue;
        }
        var top = r === stk.length - 1;
        g += h.rect(W / 2 - (stk.length * 62 - 6) / 2 + r * 62, y, 54, sh, {
          fill: top ? C.blueBg : '#fff', stroke: top ? C.blue : C.grey, sw: top ? 2.4 : 1.4, rx: 6
        });
        g += h.txt(W / 2 - (stk.length * 62 - 6) / 2 + r * 62 + 27, y + 22, String(stk[r]), { size: 14, w: 700 });
      }
      /* 说明区 */
      var ny = sy0 + Math.max(stk.length, 1) * (sh + 8) + 26;
      if (s.popped && s.popped.length && !evalMode) {
        g += h.txt(W / 2, ny + 16, '本轮弹出并输出：' + s.popped.join(' '), { size: 12.5, fill: C.amber, w: 600 });
      }
      var note = s.done
        ? (evalMode ? '★ 后缀式求值只需一个栈、一遍扫描，没有任何优先级判断'
          : '★ 后缀式没有括号：运算顺序完全由位置决定')
        : (evalMode ? '先弹出的是右操作数，后弹出的是左操作数——反了减法和除法就错'
          : '当前运算符不比栈顶"更该先算"时，栈顶要先出去');
      g += h.txt(W / 2, H - 18, note, { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
