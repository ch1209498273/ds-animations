/* 动画：单链表基本操作合集——按值查找/求表长/取值（p 指针逐结点后移，教材 2.5） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'LNode* LocateElem(LinkList L, ElemType e) {  // 按值查找',
    '    p = L->next;',
    '    while (p && p->data != e)  p = p->next;  // 逐结点后移',
    '    return p;                                 // NULL 即未找到',
    '}',
    'int Length(LinkList L) {                     // 求表长',
    '    n = 0;  p = L->next;',
    '    while (p) { ++n;  p = p->next; }',
    '    return n;                                 // O(n)：链表没有"长度字段"捷径',
    '}',
    'ElemType GetElem(LinkList L, int i) {        // 取第 i 个',
    '    p = L->next;  j = 1;',
    '    while (p && j < i) { p = p->next;  ++j; }',
    '    return p ? p->data : ERROR;               // 必须从头数：O(n)',
    '}'
  ];

  DSC.reg({
    id: 'linkOps', ch: 2, name: '单链表基本操作合集',
    note: '教材 2.5 基本操作（无随机存取，全靠 p 后移）',
    guide: [
      '链表没有下标：任何"定位"都要从表头出发，让 p 沿 next 逐结点后移',
      '按值查找：边走边比较；取第 i 个：边走边数 j——两者都是 O(n)',
      '求表长也要数完整条链 O(n)——对比顺序表直接读 length 字段 O(1)',
      '这正是"顺序表取值快、链表插删快"的原因：链表定位慢，但定位后改指针不搬元素'
    ],
    inputs: [
      { key: 'op', label: '操作', type: 'select', options: [
        ['find', '按值查找 LocateElem'], ['len', '求表长 Length'], ['get', '取值 GetElem']
      ], value: 'find' },
      { key: 'key', label: '查找值 e（按值查找用）', type: 'number', value: 47, min: -999, max: 999 },
      { key: 'pos', label: '位序 i（取值用）', type: 'number', value: 3, min: 1, max: 10 },
      { key: 'data', label: '初始序列', type: 'text', value: '25,12,47,89,36,14' }
    ],
    run: function (v) {
      var arr = h.parse(v.data);
      if (arr.length < 1 || arr.length > 10) throw Error('请输入 1~10 个整数');
      var n = arr.length, op = v.op, k = +v.key || 0, pos = Math.round(+v.pos || 0);
      var frames = [], cmp = 0;
      function F(msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(extra.line) ? extra.line : (extra.line != null ? [extra.line] : [2]), msg: msg,
          panel: { 比较计数: cmp + ' 次', 'p 位置': extra.at != null ? '第 ' + (extra.at + 1) + ' 个结点' : '表头 L', 结果: extra.res || '…' },
          snap: { arr: arr.slice(), at: extra.at, hit: extra.hit, res: extra.res || null, mark: mk, hops: extra.hops != null ? extra.hops : (extra.at != null ? extra.at + 1 : 0) }
        });
      }
      F('p 指向头结点 L（头结点不存数据，只是入口）。', { at: -1 });

      if (op === 'find') {
        var found = -1;
        for (var i = 0; i < n; i++) {
          cmp++;
          if (arr[i] === k) { found = i; F('p->data = ' + arr[i] + ' = ' + k + '，命中！返回结点指针。', { at: i, hit: i, res: '找到（第 ' + (i + 1) + ' 个结点）', line: 3 }, 'found'); break; }
          F('p->data = ' + arr[i] + ' ≠ ' + k + ' → p = p->next，后移。', { at: i, line: 3 });
        }
        if (found < 0) F('p 走到 NULL——链上没有 ' + k + '，查找失败。共比较 ' + n + ' 次。', { at: n, res: '未找到', line: 3 }, 'fail');
        F('按值查找 O(n)：链表必须顺着指针走，无法像顺序表那样按下标直达。', { at: found >= 0 ? found : n, hit: found >= 0 ? found : undefined, res: found >= 0 ? '找到' : '未找到' });
      } else if (op === 'len') {
        var cnt = 0;
        for (var i2 = 0; i2 < n; i2++) { cnt++; cmp++; F('第 ' + cnt + ' 次计数：p->data = ' + arr[i2] + '，n = ' + cnt + ' → p 后移。', { at: i2, line: 7 }); }
        F('p 到 NULL，链表长 n = ' + n + '。求表长 O(n)——对比顺序表 O(1) 读字段。', { at: n, res: 'n = ' + n }, 'ok');
      } else {
        if (pos < 1 || pos > n) F('i = ' + pos + ' 不合法（1 ≤ i ≤ ' + n + '）→ 返回 ERROR。', { at: n, res: 'ERROR', line: 11 }, 'err');
        else {
          for (var i3 = 0; i3 < pos; i3++) { cmp++; if (i3 < pos - 1) F('j = ' + (i3 + 1) + ' < ' + pos + ' → p 后移到第 ' + (i3 + 2) + ' 个结点。', { at: i3, line: 11 }); }
          F('j = ' + pos + ' 到达：p->data = ' + arr[pos - 1] + '。取第 ' + pos + ' 个元素走了 ' + pos + ' 步——O(n)！顺序表同样操作只要 1 步。', { at: pos - 1, hit: pos - 1, res: '第 ' + pos + ' 个 = ' + arr[pos - 1] }, 'ok');
        }
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470, n = s.arr.length;
      var cw = Math.min(76, Math.floor((W - 200) / n) - 14), gap = Math.max(26, Math.floor((W - 240) / n - cw) + 8);
      var x0 = 130, y = 200;
      var g = '';
      g += h.txt(W / 2, 80, '单链表（头结点 L + ' + n + ' 个数据结点）', { size: 18, w: 600 });
      /* 头结点 */
      g += h.rect(40, y, 60, 46, { fill: '#eef2ff', stroke: C.blue, rx: 6 });
      g += h.txt(70, y + 28, 'L', { size: 15, w: 700, fill: C.blue });
      g += h.txt(70, y + 62, '头结点', { size: 10.5, fill: C.muted });
      for (var i = 0; i < n; i++) {
        var x = x0 + i * (cw + gap);
        var key = s.hit === i ? 'S' : (s.at === i ? 'C' : 'N');
        var cm = { N: ['#fff', C.grey], C: [C.amberBg, C.amber], S: [C.greenBg, C.green] }[key];
        g += h.rect(x, y, cw, 46, { fill: cm[0], stroke: cm[1], sw: key === 'N' ? 1.5 : 2.4, rx: 6 });
        g += h.txt(x + cw / 2, y + 28, String(s.arr[i]), { size: 16, w: 700 });
        g += h.txt(x + cw / 2, y + 62, '结点' + (i + 1), { size: 10.5, fill: C.muted });
        g += h.arrow(x + cw + 2, y + 23, x + cw + gap - 4, y + 23, { stroke: C.grey, sw: 1.8, head: 7 });
        g += h.txt(x + cw + gap / 2, y + 14, 'next', { size: 9.5, fill: C.muted });
      }
      var xe = x0 + n * (cw + gap) - gap;
      g += h.arrow(xe + 2, y + 23, xe + gap - 10, y + 23, { stroke: C.grey, sw: 1.8, head: 7 });
      g += h.txt(xe + gap + 2, y + 28, '∧', { size: 16, fill: C.muted, w: 700 });
      /* p 指针 */
      if (s.at != null) {
        var px = s.at < 0 ? 70 : (s.at < n ? x0 + s.at * (cw + gap) + cw / 2 : xe + gap);
        var py = s.at < 0 ? y : y;
        g += h.arrow(px, py - 44, px, py - 8, { stroke: C.red, sw: 2.6, head: 8 });
        g += h.txt(px, py - 52, 'p', { size: 15, fill: C.red, w: 700 });
      }
      g += h.txt(W / 2, 360, '黄=p 当前结点（比较/计数中）  绿=命中  红=p 指针', { size: 12.5, fill: C.muted });
      g += h.txt(W / 2, 396, '链表定位只能从头开始"顺藤摸瓜"——没有下标，没有捷径', { size: 13, fill: C.ink });
      return h.svg(W, H, g);
    }
  });
})();
