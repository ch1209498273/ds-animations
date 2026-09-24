/* 动画3：顺序栈的进栈与出栈
 * 三个独立场景（可切换）：①进栈演示——连续进栈直到栈满上溢；②出栈演示——从满栈连续出栈直到下溢；
 * ③综合演练——完整生命周期。top 指向下一个可插入位置（与教材/PPT 约定一致）。 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var MAXSIZE = 6;

  var CODE = [
    '#define MAXSIZE 6                     // 演示用容量',
    'typedef struct {',
    '    SElemType *base, *top;             // 栈底指针、栈顶指针',
    '    int stacksize;',
    '} SqStack;',
    '',
    'Status Push(SqStack &S, SElemType e) {',
    '    if (S.top - S.base == S.stacksize) return ERROR;   // 栈满 → 上溢',
    '    *S.top++ = e;                     // e压入栈顶，top加1',
    '    return OK;',
    '}',
    '',
    'Status Pop(SqStack &S, SElemType &e) {',
    '    if (S.top == S.base) return ERROR;                 // 栈空 → 下溢',
    '    e = *--S.top;                     // top先减1，再取栈顶元素',
    '    return OK;',
    '}'
  ];

  var SCENE_LABEL = {
    push: ['场景：进栈演示（只进栈，直到上溢）', C.blue, C.blueBg],
    pop: ['场景：出栈演示（只出栈，直到下溢）', C.green, C.greenBg],
    life: ['场景：综合演练（进栈 → 上溢 → 出栈 → 下溢）', C.amber, C.amberBg]
  };

  DSC.reg({
    id: 'seqStack', ch: 3, name: '顺序栈：进栈与出栈',
    aim: '栈为什么是**后进先出**：top 只在同一头动，进栈出栈都 O(1)',
    note: '教材 3.3 栈的表示和操作的实现（栈空/栈满判定、上溢/下溢）',
    keywords: '栈 后进先出 LIFO 栈顶 top 进栈 push 出栈 pop 栈空 栈满 上溢 下溢 顺序存储 数组模拟 栈底',
    guide: [
      '场景①进栈：观察 *S.top++ 两步——先放元素、top 再加 1；栈满判定 top−base==stacksize',
      '场景②出栈：--S.top 后再取元素；栈空判定 top==base',
      '场景③生命周期：完整走一遍"建栈→用栈→销毁栈"，理解栈空间的动态分配',
      '每个操作前都有边界判断帧——上溢/下溢就是在这里被拦截的'
    ],
    inputs: [
      {
        key: 'scene', label: '演示场景', type: 'select', options: [
          ['push', '① 进栈演示：连续进栈 → 栈满上溢'],
          ['pop', '② 出栈演示：连续出栈 → 栈空下溢'],
          ['life', '③ 综合演练：完整生命周期（混合）']
        ], value: 'push'
      },
      { key: 'seq', label: '进栈序列', type: 'text', value: 'A,B,C,D,E,F' }
    ],
    run: function (v) {
      var scene = v.scene || 'push';
      var frames = [];
      var seq = String(v.seq || '').split(/[,，\s]+/).filter(function (x) { return x !== ''; });
      if (seq.length < 2 || seq.length > 6) throw Error('进栈序列请输入 2~6 个元素（逗号分隔）');
      var cells = [null, null, null, null, null, null], top = 0;
      var wait = seq.slice(), pops = [];
      function snap(o) {
        o = o || {};
        o.cells = cells.slice(); o.top = top; o.max = MAXSIZE; o.base = 0; o.scene = scene;
        o.wait = wait.slice(); o.pops = pops.slice();
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      function len() { return top; }
      function basePanel(extra) {
        var p = { 场景: SCENE_LABEL[scene][0].replace('场景：', ''), 栈长: 'top − base = ' + len(), 栈顶元素: top > 0 ? cells[top - 1] : '—' };
        if (extra) for (var k in extra) p[k] = extra[k];
        return p;
      }

      if (scene === 'pop') {
        /* 出栈演示：先按进栈序列一次性进满，专注出栈 */
        for (var pf = 0; pf < seq.length; pf++) cells[pf] = seq[pf];
        top = seq.length; wait = [];
        F([7, 12], '【出栈演示】为专注于出栈，先按进栈序列（' + seq.join(' ') + '）一次性把 ' + seq.length + ' 个元素压入栈（相当于连续执行 ' + seq.length + ' 次 Push，中间步骤见"① 进栈演示"）。当前栈满：top − base = ' + seq.length + (seq.length === MAXSIZE ? ' == stacksize' : ''), 
          basePanel({ 进栈次序: seq.join(' ') + '（' + seq[seq.length - 1] + ' 最后进，在栈顶）' }), snap({ note: 'prefill' }));
        for (var pi = 0; pi < seq.length; pi++) {
          F(13, '出栈第 ' + (pi + 1) + ' 次：检查栈空？top = ' + top + ' ≠ base = 0，栈非空，可以出栈。',
            basePanel(), snap({ op: 'pop' }));
          F(14, '--S.top：top 先减 1 → ' + (top - 1) + '（栈顶元素还在下标 ' + (top - 1) + '，只是 top 不再指向"可插入位置"）。',
            { top: String(top - 1) }, snap({ lastIdx: top - 1, op: 'pop', stage: 'dec' }));
          top--;
          var ev = cells[top]; cells[top] = null; pops.push(ev);
          F(14, 'e = *S.top：取出栈顶元素 e = ' + ev + '，该格子腾空。最后进的 ' + ev + ' 最先出——后进先出（LIFO）。',
            basePanel({ 最近返回: 'e = ' + ev, 已出栈: pops.join(' ') }), snap({ lastIdx: top, ret: ev, op: 'pop' }));
        }
        F(13, '再出栈：检查 top == base，【栈空】！发生【下溢】(underflow)，返回 ERROR。栈里已经没有任何元素可取。',
          basePanel({ 结果: 'ERROR（下溢）' }), snap({ err: '下溢', op: 'pop' }));
        F([12, 13], '出栈演示结束。要点：① 栈空判定 top == base；② 下溢 = "空还出"；③ 出栈序列 ' + pops.join(' ') + ' 与进栈次序 ' + seq.join(' ') + ' 恰好相反——这就是 LIFO。出栈时间复杂度 O(1)。',
          { 出栈序列: pops.join(' '), 栈长: 'top − base = 0' }, snap({ done: true }));
        return { code: CODE, frames: frames };
      }

      /* 进栈演示 / 综合演练：从空栈开始 */
      F([0, 1, 2, 3, 4], scene === 'push'
        ? '【进栈演示】初始化空栈：base 指向栈底，top 也指向 base（约定：top 指向"下一个可插入位置"）。空栈标志：top == base。下面连续进栈，观察 top 与元素的配合。'
        : '【综合演练】初始化空栈：base 指向栈底，top 也指向 base。本场景按"进栈 → 栈满上溢 → 出栈 → 栈空下溢"完整走一遍。',
        basePanel({ 栈空判定: 'top == base  ✓成立', 栈满判定: 'top − base == stacksize' }),
        snap({ note: '空栈' }));

      var script = scene === 'push'
        ? seq.map(function (x) { return ['push', x]; })
        : seq.map(function (x) { return ['push', x]; }).concat([['pop'], ['push', 'G'], ['push', 'H'],
          ['pop'], ['pop'], ['pop'], ['pop'], ['pop'], ['pop'], ['pop']]);
      var pushes = [];
      script.forEach(function (op) {
        if (op[0] === 'push') {
          if (wait.length && wait[0] === op[1]) wait.shift();
          if (len() === MAXSIZE) {
            F(7, '进栈 ' + op[1] + '：检查 top − base = ' + len() + ' == stacksize = ' + MAXSIZE + '，栈已满！发生【上溢】(overflow)，返回 ERROR，' + op[1] + ' 无法入栈。（你的进栈序列本身超出了栈容量 ' + MAXSIZE + '——上溢由数据决定，不是演示强加的）',
              basePanel({ 结果: 'ERROR（上溢）', 进栈序列: pushes.join(' ') }), snap({ err: '上溢', op: 'push', arg: op[1] }));
            return;
          }
          F(7, '进栈 ' + op[1] + '：检查 top − base = ' + len() + ' < stacksize = ' + MAXSIZE + '，未满，可以入栈。',
            basePanel(), snap({ op: 'push', arg: op[1] }));
          cells[top] = op[1];
          F(8, '*S.top = ' + op[1] + '：第一步，把元素放进 top 当前指向的格子（下标 ' + top + '）——此时 top 还没有动。',
            { top: String(top), 该格子新值: op[1] }, snap({ lastIdx: top, op: 'push', arg: op[1], stage: 'assign' }));
          top++;
          pushes.push(op[1]);
          F(8, '第二步 S.top++：top 加 1 → ' + top + '，重新指向"下一个可插入位置"。栈长 = top − base = ' + len() + '。',
            basePanel(), snap({ lastIdx: top - 1, op: 'push', arg: op[1], stage: 'moved' }));
        } else {
          if (len() === 0) {
            F(13, '出栈：检查 top == base，【栈空】！发生【下溢】(underflow)，返回 ERROR。',
              basePanel({ 结果: 'ERROR（下溢）' }), snap({ err: '下溢', op: 'pop' }));
            return;
          }
          F(13, '出栈：检查 top == base？top = ' + top + ' ≠ base = 0，栈非空，可以出栈。',
            basePanel(), snap({ op: 'pop' }));
          F(14, '--S.top：top 先减 1 → ' + (top - 1) + '（栈顶元素还在下标 ' + (top - 1) + '，只是 top 不再指向"可插入位置"）。',
            { top: String(top - 1) }, snap({ lastIdx: top - 1, op: 'pop', stage: 'dec' }));
          top--;
          var e = cells[top]; cells[top] = null; pops.push(e);
          F(14, 'e = *S.top：取出栈顶元素 e = ' + e + '，该格子腾空。栈顶元素最先弹出——后进先出（LIFO）。',
            basePanel({ 最近返回: 'e = ' + e, 出栈序列: pops.join(' ') }), snap({ lastIdx: top, ret: e, op: 'pop' }));
        }
      });
      if (scene === 'push') {
        F([7, 8], '进栈演示结束。要点：① 每次进栈先判栈满（top − base == stacksize）；② *S.top++ 两步：先放元素、top 再加 1；③ 进栈序列 ' + pushes.join(' ') + '——后进者位置更高。' + (len() >= MAXSIZE ? '本序列恰好填满栈容量——若再多一个元素就会【上溢】。' : '想看【上溢】，把进栈序列加长到 ' + (MAXSIZE + 1) + ' 个以上。') + '进栈时间复杂度 O(1)。',
          { 进栈序列: pushes.join(' '), 栈长: 'top − base = ' + len() }, snap({ done: true }));
      } else {
        F([7, 13], '综合演练结束。要点：① 栈空 = top == base，栈满 = top − base == stacksize；② 上溢是"满还进"、下溢是"空还出"；③ 出栈序列 ' + pops.join(' ') + ' 与进栈次序相反（LIFO）。进栈/出栈时间复杂度均为 O(1)。',
          { 进栈序列: pushes.join(' '), 出栈序列: pops.join(' ') || '—', 栈长: 'top − base = ' + len() }, snap({ done: true }));
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 540, cw = 96, ch = 64;
      var x0 = (W - MAXSIZE * cw) / 2, y0 = 190;
      var g = '';
      var sl = SCENE_LABEL[s.scene] || SCENE_LABEL.push;
      g += h.rect(30, 22, 330, 34, { fill: sl[2], stroke: sl[1], rx: 8 });
      g += h.txt(195, 44, sl[0], { size: 14.5, fill: sl[1], w: 600 });
      g += h.txt(W / 2 + 60, 44, '顺序栈（MAXSIZE = ' + s.max + '）', { size: 18, w: 600 });
      g += h.txt(W / 2, 108, '进栈 push：*S.top++ = e　｜　出栈 pop：e = *--S.top　｜　栈空：top == base　｜　栈满：top − base == stacksize',
        { size: 13.5, fill: C.muted });
      for (var k = 0; k < s.max; k++) {
        var x = x0 + k * cw;
        var fill = '#fff', stroke = C.grey, dash = null;
        if (s.cells[k] !== null) { fill = C.blueBg; stroke = C.blue; }
        if (s.lastIdx === k) {
          fill = s.op === 'pop' ? C.amberBg : C.greenBg;
          stroke = s.op === 'pop' ? C.amber : C.green;
        }
        if (s.err) { stroke = C.red; if (s.cells[k] === null) dash = '4,4'; }
        g += h.rect(x, y0, cw - 8, ch, { fill: fill, stroke: stroke, rx: 8, dash: dash, sw: s.lastIdx === k ? 2.5 : 1.5 });
        if (s.cells[k] !== null) g += h.txt(x + (cw - 8) / 2, y0 + ch / 2 + 7, s.cells[k], { size: 20, w: 700 });
        g += h.txt(x + (cw - 8) / 2, y0 + ch + 22, '下标 ' + k, { size: 12, fill: C.muted });
      }
      // base 指针
      var bx = x0 + (cw - 8) / 2;
      g += h.arrow(bx, y0 + ch + 52, bx, y0 + ch + 30, { stroke: C.muted, sw: 2 });
      g += h.txt(bx, y0 + ch + 74, 'base（栈底）', { size: 13, fill: C.muted });
      // top 指针
      var tx = x0 + s.top * cw + (cw - 8) / 2;
      var topCol = s.scene === 'pop' ? C.green : C.red;
      g += h.arrow(tx, y0 - 52, tx, y0 - 12, { stroke: topCol, sw: 2.5 });
      g += h.txt(tx, y0 - 62, 'top' + (s.scene !== 'pop' ? '（下一个入栈位置）' : ''), { size: 13, fill: topCol, w: 600 });
      // 返回值
      if (s.ret != null) {
        g += h.rect(W - 200, y0 - 10, 150, 46, { fill: C.amberBg, stroke: C.amber, rx: 8 });
        g += h.txt(W - 125, y0 + 19, 'e = ' + s.ret, { size: 17, fill: C.amber, w: 700, family: 'Consolas,monospace' });
      }
      // 待进栈序列 / 出栈序列展示带（演示依据一目了然）
      var wy = 400, py3 = 440;   /* 原来 470/505 与底部解说条（482-516）同处一行，出栈序列的字全压在提示条上 */
      if (s.wait && s.wait.length && s.scene !== 'pop') {
        var wx = 30;
        g += h.txt(wx, wy, '待进栈序列：', { size: 13, fill: C.muted, anchor: 'start', w: 600 });
        s.wait.forEach(function (wv, k) {
          var x = wx + 96 + k * 44;
          var nx = k === 0;
          g += h.rect(x, wy - 18, 38, 26, { fill: nx ? C.blueBg : '#fff', stroke: nx ? C.blue : C.line, sw: nx ? 2 : 1, rx: 5 });
          g += h.txt(x + 19, wy, wv, { size: 13, w: nx ? 700 : 400, fill: nx ? C.blue : C.muted });
        });
        g += h.txt(wx + 96 + s.wait.length * 44 + 8, wy, '← 下一个进栈', { size: 11, fill: C.blue, anchor: 'start' });
      }
      if (s.pops && s.pops.length) {
        var px2 = 30;
        g += h.txt(px2, py3, '出栈序列：', { size: 13, fill: C.muted, anchor: 'start', w: 600 });
        s.pops.forEach(function (pv, k) {
          var x = px2 + 82 + k * 44;
          var last = k === s.pops.length - 1;
          g += h.rect(x, py3 - 18, 38, 26, { fill: last ? C.amberBg : '#fff', stroke: last ? C.amber : C.line, sw: last ? 2 : 1, rx: 5 });
          g += h.txt(x + 19, py3, pv, { size: 13, w: last ? 700 : 400, fill: last ? C.amber : C.muted });
        });
      }
      var note = s.err === '上溢' ? '✗ 上溢 overflow：栈满（top − base == stacksize）还执行进栈'
        : s.err === '下溢' ? '✗ 下溢 underflow：栈空（top == base）还执行出栈'
        : s.done ? (s.scene === 'push' ? '进栈要点：先判满，再 *S.top++ = e；上溢 = 满还进'
          : s.scene === 'pop' ? '出栈要点：先判空，再 e = *--S.top；出栈序与进栈序相反（LIFO）'
            : '完整生命周期：进栈 → 上溢 → 出栈 → 下溢')
        : s.note === 'prefill' ? '预置满栈：A～F 已在栈中，F 在栈顶'
        : (s.op === 'push' ? (s.stage === 'assign' ? '进栈第 1 步：*S.top = e（元素入格，top 未动）' : '进栈第 2 步：S.top++（指针上移）')
          : s.op === 'pop' ? (s.stage === 'dec' ? '出栈第 1 步：--S.top（指针下移）' : '出栈第 2 步：e = *S.top（取值腾空）')
            : '初始空栈：top == base');
      var nc = s.err ? C.red : (s.done ? C.green : C.blue);
      g += h.rect(W / 2 - 310, H - 58, 620, 34, { fill: s.err ? C.redBg : (s.done ? C.greenBg : C.blueBg), stroke: nc, rx: 8 });
      g += h.txt(W / 2, H - 36, note, { size: 14, fill: nc, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
