/* 动画：数制转换（栈的应用）——教材 3.6 案例，N=(N div d)×d + N mod d，余数逆序读出 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'void conversion(int N, int d) {          // N ≥ 0，2 ≤ d ≤ 16',
    '    SqStack S;  InitStack(S);',
    '    while (N) {',
    '        Push(S, N % d);                  // 余数进栈（低位先进）',
    '        N = N / d;                       // 商继续除',
    '    }',
    '    while (!StackEmpty(S))',
    '        Pop(S);                          // 栈中余数从高到低弹出打印',
    '}',
    '// 例：1348 = (2504)₈  —— 栈让"先算出的低位"最后输出'
  ];
  var DIGITS = '0123456789ABCDEF';

  DSC.reg({
    id: 'baseConvert', ch: 3, name: '数制转换（栈的应用）',
    aim: '十进制转 k 进制就是**除 k 取余、余数逆序输出**——逆序靠的正是栈',
    note: '教材 3.6 案例分析与实现（余数进栈、逆序出栈）',
    keywords: '进制转换 十进制转二进制 除基取余 逆序输出 八进制 十六进制 基数 余数进栈',
    guide: [
      '转换口诀：N 除以 d 取余数，商继续除，直到商为 0——余数**先得到的是低位**',
      '问题：低位先算出来却要**最后**打印。栈的 LIFO 恰好把这个顺序倒过来',
      '左半区演示除法步骤，右侧栈中余数逐个进栈；最后逐个弹出就是答案',
      '例题：1348 ÷ 8 逐次取余 → 出栈顺序 2 5 0 4，即 1348=(2504)₈'
    ],
    inputs: [
      { key: 'n', label: '十进制 N', type: 'number', value: 1348, min: 0, max: 65535 },
      { key: 'base', label: '目标进制 d', type: 'select', options: [['2', '二进制 d=2'], ['8', '八进制 d=8'], ['16', '十六进制 d=16']], value: '8' }
    ],
    run: function (v) {
      var N0 = Math.floor(+v.n || 0), d = +v.base;
      if (N0 < 0) throw Error('N 需为非负整数');
      var frames = [], stack = [];
      if (N0 === 0) { frames.push({ line: [0], msg: 'N = 0 在任何进制下都写作 0——没有余数可产生，无需转换。', panel: { N: '0', 'N % d': '—', 栈深: '0' }, snap: { stack: [], n: 0, rem: null, pop: null, out: '0', base: d, mark: 'final' } }); return { code: CODE, frames: frames }; }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { N: String(extra.n != null ? extra.n : N0), 'N % d': extra.rem != null ? String(extra.rem) : '—', 栈深: String(stack.length) },
          snap: { stack: stack.slice(), n: extra.n != null ? extra.n : N0, rem: extra.rem, pop: extra.pop, out: extra.out || '', base: d, mark: mk }
        });
      }
      F([0, 1], '转换 ' + N0 + ' → ' + (d === 2 ? '二' : d === 8 ? '八' : '十六') + '进制。原理：N = (N div d)×d + (N mod d)，每轮余数 = 当前最低位。', {});
      var N = N0;
      while (N > 0) {
        var rem = N % d;
        stack.push(rem);
        F([3, 4], N + ' % ' + d + ' = ' + rem + '（余数入栈），N = ' + Math.floor(N / d) + '。', { n: N, rem: rem });
        N = Math.floor(N / d);
      }
      var out = '';
      while (stack.length) {
        var top = stack[stack.length - 1];
        out += DIGITS[top];
        stack.pop();
        F([6, 7], '弹出 ' + top + ' → 记作数字 ' + DIGITS[top] + '，拼在结果高位。', { pop: top, out: out });
      }
      var full = out;
      F(0, '转换完成：(' + N0 + ')₁₀ = (' + full + ')' + (d === 2 ? '₂' : d === 8 ? '₈' : '₁₆') + '。除基取余 + 栈逆序——没有栈就得先把余数存数组再倒着读，栈刚好优雅地解决"顺序颠倒"。', { out: full, mark: 'final' });
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470;
      var g = '';
      g += h.txt(W / 2, 34, '数制转换：除基取余，栈存余数（LIFO 逆序输出）', { size: 17, w: 600 });
      /* 除法步骤区 */
      g += h.txt(150, 90, '除法（低位先得）', { size: 13.5, fill: C.muted, w: 600 });
      if (s.rem != null && s.pop == null) {
        g += h.txt(150, 140, s.n + '  ÷  ' + s.base + '  =  商 ' + Math.floor(s.n / s.base) + ' … 余 ' + s.rem, { size: 15, anchor: 'start', family: 'Consolas,monospace' });
      }
      /* 栈区 */
      var sx = 480, sw = 150, sh = 44;
      g += h.txt(sx + sw / 2, 90, '余数栈（栈顶在上）', { size: 13.5, fill: C.muted, w: 600 });
      for (var i = s.stack.length - 1; i >= 0; i--) {
        var y = 340 - (s.stack.length - i) * (sh + 6);
        if (y < 120) break;
        var isPop = s.pop === s.stack[i] && s.pop != null;
        g += h.rect(sx, y, sw, sh, { fill: isPop ? C.redBg : C.blueBg, stroke: isPop ? C.red : C.blue, sw: 2, rx: 6 });
        g += h.txt(sx + sw / 2, y + 29, String(s.stack[i]) + (isPop ? ' ← 弹出' : ''), { size: 15, w: 700 });
      }
      if (!s.stack.length) g += h.txt(sx + sw / 2, 330, '（栈空）', { size: 13, fill: C.muted });
      /* 结果 */
      if (s.out) {
        g += h.txt(150, 220, '已拼出的结果（高位在前）：', { size: 13.5, fill: C.muted, anchor: 'start' });
        g += h.txt(150, 260, s.out, { size: 26, w: 700, fill: C.green, anchor: 'start', family: 'Consolas,monospace' });
      }
      g += h.txt(W / 2, 430, '余数先进栈的是低位 → 后出栈；出栈顺序即目标进制从高到低的各位', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
