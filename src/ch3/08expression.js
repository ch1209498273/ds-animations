/* 动画：表达式求值——双栈法（案例3.3）：OPTR 存运算符、OPND 存操作数，按教材优先级表（表3.1）求值 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 教材表3.1：行=栈顶运算符，列=当前读入运算符；'>' 弹栈计算，'<' 直接入栈，'=' 脱括号 */
  var PRI = {
    '+': { '+': '>', '-': '>', '*': '<', '/': '<', '(': '<', ')': '>', '#': '>' },
    '-': { '+': '>', '-': '>', '*': '<', '/': '<', '(': '<', ')': '>', '#': '>' },
    '*': { '+': '>', '-': '>', '*': '>', '/': '>', '(': '<', ')': '>', '#': '>' },
    '/': { '+': '>', '-': '>', '*': '>', '/': '>', '(': '<', ')': '>', '#': '>' },
    '(': { '+': '<', '-': '<', '*': '<', '/': '<', '(': '<', ')': '=', '#': ' ' },
    ')': { '+': '>', '-': '>', '*': '>', '/': '>', '(': ' ', ')': '>', '#': '>' },
    '#': { '+': '<', '-': '<', '*': '<', '/': '<', '(': '<', ')': ' ', '#': '=' }
  };
  var OPS = ['+', '-', '*', '/', '(', ')', '#'];

  var CODE = [
    'OperandType EvaluateExpression() {',
    '    InitStack(OPTR);  Push(OPTR, \x27#\x27);    // 运算符栈，栈底压#',
    '    InitStack(OPND);                       // 操作数栈',
    '    ch = 读入表达式下一个字符;',
    '    while (ch != \x27#\x27 || OPTR栈顶 != \x27#\x27) {',
    '        if (ch 是数字) { 组装多位数; Push(OPND, v); ch = 下一字符; }',
    '        else switch (Precede(OPTR栈顶, ch)) {      // 比较优先级',
    '            case \x27<\x27: Push(OPTR, ch);  ch = 下一字符; break;   // 栈顶低→入栈',
    '            case \x27>\x27: {                       // 栈顶高→先计算',
    '                b = Pop(OPND);  a = Pop(OPND);',
    '                theta = Pop(OPTR);',
    '                Push(OPND, a theta b);  break;   // 结果压回',
    '            }',
    '            case \x27=\x27: Pop(OPTR);  ch = 下一字符; break;   // 脱括号',
    '        }',
    '    }',
    '    return Pop(OPND);                      // 结果',
    '}'
  ];

  DSC.reg({
    id: 'expression', ch: 3, name: '表达式求值：双栈法（案例3.3）',
    note: '教材 3.6 案例分析与实现（案例3.3 表达式求值）',
    guide: [
      '两个栈分工：OPTR 只存运算符（栈底压 #），OPND 只存操作数',
      '每读一个运算符先查优先级表：栈顶低 → 入栈；栈顶高 → 弹两数一符先计算；相等 = 括号相遇，脱括号',
      '观察优先级表高亮格，理解 * / 为什么先于 + - 计算',
      '表达式可以自己改（支持 + - * / 和括号、多位数），以 # 或直接结束'
    ],
    inputs: [
      { key: 'expr', label: '表达式', type: 'text', value: '3*(7-2)' }
    ],
    run: function (v) {
      var expr = (v.expr || '').replace(/\s+/g, '').replace(/#$/, '');
      if (!expr.length) throw new Error('请输入表达式，如 3*(7-2)');
      if (expr.length > 20) throw new Error('表达式过长（' + expr.length + ' 字符 > 20），请缩短后重试');
      for (var c0 = 0; c0 < expr.length; c0++) {
        var ch0 = expr[c0];
        if (!/[0-9+\-*/()]/.test(ch0)) throw new Error('含不支持的字符：" ' + ch0 + ' "（只支持 + - * / ( ) 和数字）');
      }
      var seq = expr.split('');
      seq.push('#');

      var frames = [];
      var optr = ['#'], opnd = [];
      function snap(o) {
        o = o || {};
        o.optr = optr.slice(); o.opnd = opnd.slice();
        o.seq = seq.slice(); o.cur = o.cur == null ? -1 : o.cur;
        o.priCell = o.priCell || null; o.calc = o.calc || null; o.err = o.err || null;
        o.done = !!o.done;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }

      F([1, 2, 3], '初始化：OPTR 运算符栈底压入 "#"（表达式结束符），OPND 操作数栈为空。随后从左向右扫描表达式。',
        { OPTR: '自底→顶 ' + optr.join(' '), OPND: opnd.length ? opnd.join(' ') : '（空）' }, snap({ cur: -1 }));

      var pos = 0, calcCount = 0;
      while (!(seq[pos] === '#' && optr[optr.length - 1] === '#')) {
        var ch = seq[pos];
        if (ch === undefined) { F(4, '表达式扫描完毕。', {}, snap({ cur: seq.length - 1, err: '表达式不完整（缺少括号或运算符）' })); return { code: CODE, frames: frames }; }
        if (/[0-9]/.test(ch)) {
          var num = 0, start = pos;
          while (pos < seq.length && /[0-9]/.test(seq[pos])) { num = num * 10 + (+seq[pos]); pos++; }
          opnd.push(num);
          F([6], '操作数：读入数字 ' + expr.slice(start, pos) + ' → 组装为 ' + num + '，压入 OPND。读入下一字符。',
            { OPTR: '自底→顶 ' + optr.join(' '), OPND: '自底→顶 ' + opnd.join(' '), 已读: '第 ' + (pos) + ' 个字符' },
            snap({ cur: pos - 1, action: 'pushNum' }));
          continue;
        }
        if (!OPS || PRI[optr[optr.length - 1]][ch] === undefined) {
          F(7, '✗ 运算符 "' + ch + '" 与栈顶 "' + optr[optr.length - 1] + '" 的组合不符合文法（如 ")(" 或 "(#"）。', {}, snap({ cur: pos, err: '文法错误' }));
          return { code: CODE, frames: frames };
        }
        var rel = PRI[optr[optr.length - 1]][ch];
        var top = optr[optr.length - 1];
        var cell = { top: top, cur: ch };
        if (rel === '<') {
          F([7, 8], '比较优先级：栈顶 "' + top + '" < 当前 "' + ch + '" → 当前运算符优先级更高，压入 OPTR 暂存，读入下一字符。',
            { OPTR: '自底→顶 ' + (optr.join(' ') + ' ' + ch), 比较结果: top + ' < ' + ch }, snap({ cur: pos, priCell: cell, action: 'pushOp' }));
          optr.push(ch);
          pos++;
        } else if (rel === '>') {
          F([7, 9], '比较优先级：栈顶 "' + top + '" > 当前 "' + ch + '" → 栈顶运算符该先算：弹出两栈开始计算。',
            { 比较结果: top + ' > ' + ch + '（先算栈顶）' }, snap({ cur: pos, priCell: cell, action: 'cmpPop' }));
          var b = opnd.pop(), a = opnd.pop(), theta = optr.pop();
          if (theta === '/' && b === 0) {
            F([10], '✗ 除数 b = 0，无法计算。', { 结果: 'ERROR（除数为 0）' }, snap({ cur: pos, err: '除零' }));
            return { code: CODE, frames: frames };
          }
          var r = theta === '+' ? a + b : theta === '-' ? a - b : theta === '*' ? a * b : a / b;
          opnd.push(r);
          calcCount++;
          F([10, 11], '计算：弹出 ' + a + ' 和 ' + b + '，运算符 ' + theta + ' → ' + a + ' ' + theta + ' ' + b + ' = ' + r + '，结果压回 OPND。',
            { OPTR: '自底→顶 ' + (optr.join(' ') || '#'), OPND: '自底→顶 ' + opnd.join(' '), 本步计算: a + ' ' + theta + ' ' + b + ' = ' + r },
            snap({ cur: pos, calc: { a: a, theta: theta, b: b, r: r }, action: 'calc' }));
        } else if (rel === '=') {
          optr.pop();
          F([14], '比较优先级：栈顶 "' + top + '" = 当前 "' + ch + '"（左右括号相遇）→ 弹出括号，脱括号完成，读入下一字符。',
            { OPTR: '自底→顶 ' + (optr.join(' ') || '#'), 比较结果: top + ' = ' + ch + '（脱括号）' },
            snap({ cur: pos, priCell: cell, action: 'meet' }));
          pos++;
        } else {
          F([14], '✗ 组合 "' + top + '" 与 "' + ch + '" 无优先级关系——括号不匹配或表达式非法，返回 ERROR。',
            { 结果: 'ERROR（括号不匹配）' },
            snap({ cur: pos, priCell: cell, action: 'err', err: '括号不匹配' }));
          return { code: CODE, frames: frames };
        }
      }
      var result = opnd.pop();
      F(16, '两栈都只剩 "#"，扫描结束——OPND 栈顶即为结果：' + expr + ' = ' + result + '。（共进行 ' + calcCount + ' 次弹栈计算；时间 O(n)）',
        { 结果: expr + ' = ' + result, 计算次数: calcCount + ' 次' },
        snap({ cur: seq.length - 1, done: true, result: result }));
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 560;
      var g = '';
      g += h.txt(W / 2, 34, '双栈法表达式求值（OPTR 运算符栈 ｜ OPND 操作数栈）', { size: 19, w: 600 });
      // 表达式字符条
      var ex = 60, ey = 96;
      g += h.txt(30, ey + 20, '表达式', { size: 13.5, fill: C.muted, anchor: 'start', w: 600 });
      s.seq.forEach(function (c, k) {
        var x = ex + 56 + k * 44;
        var f = '#fff', st = C.grey;
        if (k < s.cur) { f = C.greyBg; st = C.line; }
        if (k === s.cur) { f = C.amberBg; st = C.amber; }
        if (s.done && k === s.seq.length - 1) { f = C.greenBg; st = C.green; }
        g += h.rect(x, ey, 38, 38, { fill: f, stroke: st, rx: 7, sw: k === s.cur ? 2.5 : 1.4 });
        g += h.txt(x + 19, ey + 24, c, { size: 16, w: 700 });
      });
      // OPTR 栈（竖）
      function vstack(x, label, arr, col, bg) {
        g += h.txt(x + 55, 150, label, { size: 14.5, fill: col, w: 600 });
        var base = 470;
        arr.forEach(function (v, k) {
          var y = base - (k + 1) * (44 + 6);
          var isTop = k === arr.length - 1;
          g += h.rect(x, y, 110, 44, { fill: isTop ? bg : '#fff', stroke: isTop ? col : C.grey, rx: 8, sw: isTop ? 2.5 : 1.5 });
          g += h.txt(x + 55, y + 27, v, { size: 17, w: 700, family: 'Consolas,monospace' });
        });
        g += h.rect(x - 8, base + 4, 126, 8, { fill: C.grey, stroke: 'none', rx: 4 });
        g += h.txt(x + 55, base + 34, '栈底', { size: 12, fill: C.muted });
        if (arr.length) {
          var ty = base - arr.length * 50 - 4;
          g += h.arrow(x + 55, ty - 20, x + 55, ty, { stroke: col, sw: 2.5, head: 7 });
          g += h.txt(x + 55, ty - 26, '栈顶', { size: 12, fill: col, w: 600 });
        }
      }
      vstack(110, 'OPTR（运算符）', s.optr, C.blue, C.blueBg);
      vstack(320, 'OPND（操作数）', s.opnd, C.green, C.greenBg);
      // 计算示意（位于优先级表下方空白区，避免遮挡表格）
      if (s.calc) {
        g += h.rect(560, 364, 330, 50, { fill: C.amberBg, stroke: C.amber, rx: 9 });
        g += h.txt(725, 395, '弹栈计算：' + s.calc.a + ' ' + s.calc.theta + ' ' + s.calc.b + ' = ' + s.calc.r, { size: 17, w: 700, fill: C.amber });
      }
      // 优先级表（右侧）
      var px = 620, py = 150, cw2 = 40, ch2 = 26;
      g += h.txt(px + (cw2 + 7 * cw2) / 2 - 20, py - 12, '优先级表（行=栈顶，列=当前）', { size: 13, w: 600 });
      g += h.txt(px + 14, py + ch2 / 2 + 5, '↓', { size: 11, fill: C.muted });
      for (var j = 0; j < 7; j++) g += h.txt(px + cw2 + j * cw2 + cw2 / 2, py + ch2 / 2 + 5, OPS[j], { size: 13, w: 700 });
      for (var i = 0; i < 7; i++) {
        var top = OPS[i];
        g += h.txt(px + 14, py + (i + 1) * ch2 + ch2 / 2 + 5, top, { size: 13, w: 700, fill: s.priCell && s.priCell.top === top ? C.amber : C.ink });
        for (var j2 = 0; j2 < 7; j2++) {
          var rel = PRI[top][OPS[j2]];
          var isCur = s.priCell && s.priCell.top === top && s.priCell.cur === OPS[j2];
          g += h.rect(px + cw2 + j2 * cw2, py + (i + 1) * ch2, cw2 - 2, ch2 - 2, {
            fill: isCur ? C.amberBg : '#fff', stroke: isCur ? C.amber : C.line, sw: isCur ? 2.5 : 1, rx: 4
          });
          g += h.txt(px + cw2 + j2 * cw2 + (cw2 - 2) / 2, py + (i + 1) * ch2 + (ch2 - 2) / 2 + 6,
            rel === ' ' ? '×' : rel, { size: 13, w: isCur ? 700 : 400, fill: isCur ? C.amber : (rel === '>' ? C.red : rel === '<' ? C.blue : C.ink) });
        }
      }
      // 图例必须在表格之下：表占 py..py+8*ch2，原先写死 352 落在最后一行里
      g += h.txt(px + 4 * cw2, py + 8 * ch2 + 22, '> 弹栈计算 ｜ < 入栈 ｜ = 脱括号', { size: 11.5, fill: C.muted });
      // 结果
      if (s.done && s.result != null) {
        g += h.rect(W / 2 - 160, 430, 320, 54, { fill: C.greenBg, stroke: C.green, rx: 10, sw: 2 });
        g += h.txt(W / 2, 465, '结果 = ' + s.result, { size: 24, w: 700, fill: C.green });
      }
      if (s.err) {
        g += h.rect(W / 2 - 200, 440, 400, 36, { fill: C.redBg, stroke: C.red, rx: 8 });
        g += h.txt(W / 2, 463, '✗ ' + s.err, { size: 14.5, fill: C.red, w: 600 });
      }
      return h.svg(W, H, g);
    }
  });
})();
