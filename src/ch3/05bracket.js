/* 动画：括号匹配——栈的应用（案例3.2，圆括号/方括号/花括号；三种失败情形逐一演示） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var PAIR = { ')': '(', ']': '[', '}': '{' };
  var ISLEFT = { '(': 1, '[': 1, '{': 1 };
  var ISRIGHT = { ')': 1, ']': 1, '}': 1 };
  var CLOSE = { '(': ')', '[': ']', '{': '}' };

  var CODE = [
    'bool isMatched(char expr[]) {',
    '    Stack S;  InitStack(S);                // 初始化空栈',
    '    for (每个字符 ch : expr) {',
    '        if (ch 是左括号)',
    '            Push(S, ch);                   // 左括号进栈',
    '        else if (ch 是右括号) {',
    '            if (StackEmpty(S)) return false;   // ① 栈空：右括号无配对',
    '            top = Pop(S);',
    '            if (!匹配(top, ch)) return false;  // ② 与栈顶类型不符',
    '        }   // 其余字符跳过',
    '    }',
    '    return StackEmpty(S);                      // ③ 结束时栈必须空',
    '}'
  ];

  DSC.reg({
    id: 'bracket', ch: 3, name: '括号匹配：栈的应用',
    aim: '括号匹配只要一个栈：**右括号来了就弹栈配对**，弹错或栈不空就是不匹配',
    note: '教材 3.6 案例分析与实现（案例3.2 括号匹配）',
    keywords: '括号匹配 配对 左右括号 入栈 出栈 字符串 平衡 栈的应用 匹配失败 剩余',
    guide: [
      '左括号一律进栈；遇到右括号时与栈顶配对，配对成功才弹出',
      '三种失败情形：① 栈空遇右括号 ② 栈顶类型不符 ③ 扫描结束栈非空',
      '把表达式改成自己的用例，观察它在哪一步、以哪种方式失败',
      '对照右侧伪代码：栈只记左括号，右括号负责"销账"（全角括号会自动按半角处理）'
    ],
    inputs: [
      { key: 'expr', label: '表达式', type: 'text', value: '([()])' }
    ],
    run: function (v) {
      var FW = { '（': '(', '）': ')', '【': '[', '】': ']', '［': '[', '］': ']', '｛': '{', '｝': '}' };
      var expr = (v.expr || '').split('').map(function (c) { return FW[c] || c; });
      if (!expr.length) throw new Error('请输入表达式（可含 ( ) [ ] { } 与普通字符）');
      if (expr.length > 24) throw new Error('表达式过长（' + (v.expr || '').length + ' 字符 > 24），逐步演示超出单屏，请缩短后重试——不要截断，截断会造成误判');
      var frames = [];
      var stack = [];
      function snap(o) {
        o = o || {};
        o.expr = expr.slice(); o.i = -1; o.stack = stack.slice();
        o.action = o.action || ''; o.n = expr.length;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }

      F([0, 1], '初始化空栈 S。规则：左括号一律进栈；遇到右括号时，它必须与【栈顶】的左括号配对——最后出现的左括号最先被匹配（LIFO）。',
        { 栈: '（空）', 已扫描: '0 / ' + expr.length }, snap({ i: -1 }));

      var fail = null;
      for (var i = 0; i < expr.length && !fail; i++) {
        var ch = expr[i];
        if (!ISLEFT[ch] && !ISRIGHT[ch]) {
          F(8, '字符 "' + ch + '"：不是括号，直接跳过。', { 栈: stack.length ? stack.join(' ') : '（空）', 已扫描: (i + 1) + ' / ' + expr.length }, snap({ i: i, action: 'skip' }));
          continue;
        }
        if (ISLEFT[ch]) {
          stack.push(ch);
          F([3, 4], '"' + ch + '" 是左括号 → 进栈。当前栈（自底→顶）：' + stack.join(' ') + '。',
            { 栈: '自底→顶 ' + stack.join(' '), 已扫描: (i + 1) + ' / ' + expr.length },
            snap({ i: i, action: 'push', last: i }));
        } else {
          if (!stack.length) {
            F(6, '✗ "' + ch + '" 是右括号，但栈已【空】——没有左括号可与它配对。失败情形①：return false。',
              { 结果: '失败（情形①：栈空遇右括号）', 已扫描: (i + 1) + ' / ' + expr.length },
              snap({ i: i, action: 'err1', err: '栈空遇右括号' }));
            fail = '情形①：位置 ' + (i + 1) + ' 的右括号 "' + ch + '" 没有左括号配对';
            break;
          }
          var top = stack[stack.length - 1];
          if (PAIR[ch] === top) {
            stack.pop();
            F([7, 8], '"' + ch + '" 与栈顶 "' + top + '" 配对成功 → 弹出。当前栈：' + (stack.length ? stack.join(' ') : '（空）') + '。',
              { 配对: top + ch + ' ✓', 栈: stack.length ? '自底→顶 ' + stack.join(' ') : '（空）', 已扫描: (i + 1) + ' / ' + expr.length },
              snap({ i: i, action: 'pop', last: i }));
          } else {
            F(8, '✗ "' + ch + '" 应与 "' + PAIR[ch] + '" 配对，但栈顶是 "' + top + '"——交叉嵌套！失败情形②：return false。',
              { 结果: '失败（情形②：类型不符）', 栈顶: top + ' ≠ 需要 ' + PAIR[ch] },
              snap({ i: i, action: 'err2', err: '括号类型不符' }));
            fail = '情形②：位置 ' + (i + 1) + ' 的 "' + ch + '" 与栈顶 "' + top + '" 类型不符';
            break;
          }
        }
      }
      if (!fail) {
        if (stack.length) {
          F(11, '✗ 表达式扫描结束，但栈中还有 ' + stack.length + ' 个左括号（' + stack.join(' ') + '）未匹配——失败情形③：return false。',
            { 结果: '失败（情形③：栈非空）' }, snap({ i: expr.length - 1, action: 'err3', err: '栈非空' }));
        } else {
          F(11, '★ 扫描结束且栈空——所有括号恰好配对，表达式匹配成功！',
            { 结果: '匹配成功 ✓', 栈: '（空）' }, snap({ i: expr.length - 1, action: 'ok', done: true }));
        }
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470, cw = 54, chh = 50;
      var x0 = Math.max(30, (W - 460 - s.n * cw) / 2), y0 = 150;
      var g = '';
      g += h.txt(300, 40, '括号匹配（栈的应用）', { size: 19, w: 600 });
      g += h.txt(x0 - 4, y0 - 18, '表达式（逐字符扫描）', { size: 13, fill: C.muted, anchor: 'start' });
      for (var k = 0; k < s.n; k++) {
        var x = x0 + k * cw;
        var ch = s.expr[k];
        var fill = '#fff', stroke = C.grey, txtC = C.ink;
        if (k < s.i) { fill = C.greyBg; stroke = C.line; txtC = C.muted; }
        if (k === s.i) { fill = C.amberBg; stroke = C.amber; }
        if (s.done && s.action === 'ok') { fill = C.greenBg; stroke = C.green; txtC = C.green; }
        g += h.rect(x, y0, cw - 8, chh, { fill: fill, stroke: stroke, rx: 8, sw: k === s.i ? 2.5 : 1.5 });
        g += h.txt(x + (cw - 8) / 2, y0 + chh / 2 + 6, ch, { size: 19, w: 700, fill: txtC });
        g += h.txt(x + (cw - 8) / 2, y0 + chh + 18, String(k + 1), { size: 11, fill: C.muted });
      }
      if (s.i >= 0 && s.i < s.n) {
        var cx = x0 + s.i * cw + (cw - 8) / 2;
        g += h.arrow(cx, y0 - 40, cx, y0 - 6, { stroke: C.amber, sw: 2.5 });
        g += h.txt(cx, y0 - 50, '当前', { size: 12, fill: C.amber, w: 600 });
      }
      // 栈（右侧竖画）
      var sx = W - 260, sy = 210, sw2 = 70, sh = 44;
      g += h.txt(sx + sw2 / 2, sy - 44, '栈 S（自底→顶）', { size: 13.5, fill: C.muted, w: 600 });
      for (var k2 = 0; k2 < s.stack.length; k2++) {
        var yy = sy + (s.stack.length - 1 - k2) * (sh + 8);
        var isTop = k2 === s.stack.length - 1;
        g += h.rect(sx, yy, sw2, sh, { fill: isTop ? C.blueBg : '#fff', stroke: isTop ? C.blue : C.grey, rx: 8, sw: isTop ? 2.5 : 1.5 });
        g += h.txt(sx + sw2 / 2, yy + sh / 2 + 6, s.stack[k2], { size: 18, w: 700, fill: isTop ? C.blue : C.ink });
      }
      if (!s.stack.length) g += h.txt(sx + sw2 / 2, sy + 20, '（空）', { size: 13, fill: C.muted });
      g += h.arrow(sx - 26, sy - 10, sx - 26, sy + 6, { stroke: C.blue, sw: 2 });
      g += h.txt(sx - 32, sy + 2, '栈顶', { size: 12, fill: C.blue, anchor: 'end' });
      var note = s.err === '栈空遇右括号' ? '✗ 失败情形①：栈空遇右括号——它没有左括号可配'
        : s.err === '括号类型不符' ? '✗ 失败情形②：右括号与栈顶类型不符（交叉嵌套）'
        : s.err === '栈非空' ? '✗ 失败情形③：扫描结束栈中还有左括号未匹配'
        : s.done ? '✓ 匹配成功：扫描结束且栈空'
        : s.action === 'push' ? '左括号进栈（可能要等很久才被匹配）'
        : s.action === 'pop' ? '右括号与栈顶配对成功，弹出销账'
        : '左括号进栈、右括号找栈顶配对——最后栈必须空';
      var ncl = s.err ? C.red : (s.done ? C.green : C.blue);
      g += h.rect(W / 2 - 310, H - 58, 620, 34, { fill: s.err ? C.redBg : (s.done ? C.greenBg : C.blueBg), stroke: ncl, rx: 8 });
      g += h.txt(W / 2, H - 36, note, { size: 13.5, fill: ncl, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
