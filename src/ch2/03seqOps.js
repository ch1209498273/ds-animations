/* 动画：顺序表基本操作合集——按值查找/取值/求表长/求最大值/遍历（教材 2.4） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'int LocateElem(SqList L, ElemType e) {   // 按值查找',
    '    for (i = 0; i < L.length; ++i)',
    '        if (L.elem[i] == e)  return i+1;  // 返回位序',
    '    return 0;                              // 未找到',
    '}',
    'ElemType GetElem(SqList L, int i) { return L.elem[i-1]; }  // 取值 O(1)',
    'int MaxElem(SqList L) {                   // 求最大值',
    '    max = L.elem[0];',
    '    for (i = 1; i < L.length; ++i)',
    '        if (L.elem[i] > max)  max = L.elem[i];',
    '    return max;',
    '}'
  ];

  DSC.reg({
    id: 'seqOps', ch: 2, name: '顺序表基本操作合集',
    note: '教材 2.4 基本操作（查找/取值/表长/最值，随机存取特性）',
    guide: [
      '按值查找：逐格比较（黄色=正在比较），失败要扫满全表 O(n)',
      '取值：位序 i 直接映射下标 i−1，**一步到位 O(1)**——顺序表随机存取的核心优势',
      '求最大值：带"当前最大"标记扫一遍，n 个元素比较 n−1 次',
      '求表长直接读 L.length；这些操作都没有元素移动——移动只发生在插入/删除时'
    ],
    inputs: [
      { key: 'op', label: '操作', type: 'select', options: [
        ['find', '按值查找 LocateElem'], ['get', '取值 GetElem'], ['len', '求表长 Length'],
        ['max', '求最大值 MaxElem'], ['trav', '遍历输出 Traverse']
      ], value: 'find' },
      { key: 'key', label: '查找值 e（按值查找用）', type: 'number', value: 47, min: -999, max: 999 },
      { key: 'pos', label: '位序 i（取值用）', type: 'number', value: 3, min: 1, max: 12 },
      { key: 'data', label: '初始序列', type: 'text', value: '25,12,47,89,36,14' }
    ],
    run: function (v) {
      var arr = h.parse(v.data);
      if (arr.length < 1 || arr.length > 12) throw Error('请输入 1~12 个整数');
      var n = arr.length, op = v.op, k = +v.key || 0, pos = Math.round(+v.pos || 0);
      var frames = [], cmp = 0;
      function colors(hl) {
        hl = hl || {};
        var cs = [];
        for (var i = 0; i < n; i++) cs.push('N');
        (hl.done || []).forEach(function (i2) { cs[i2] = 'D'; });
        if (hl.c != null) cs[hl.c] = 'C';
        if (hl.hit != null) cs[hl.hit] = 'S';
        if (hl.m != null) cs[hl.m] = 'P';
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 表长: 'n = ' + n, 结果: extra.res || '…' },
          snap: { arr: arr.slice(), colors: colors(extra), tag: extra.tag || '', res: extra.res || null, mark: mk }
        });
      }
      F(0, '顺序表 L =（' + arr.join(', ') + '），n = ' + n + '。位序 i 从 1 起，下标 = i−1。', {});

      if (op === 'find') {
        var found = -1;
        for (var i = 0; i < n; i++) {
          cmp++;
          if (arr[i] === k) { found = i; F([2], 'elem[' + i + ']=' + arr[i] + ' = ' + k + '，命中！返回位序 ' + (i + 1) + '。', { hit: i, res: '位序 ' + (i + 1) }, 'found'); break; }
          F([2], 'elem[' + i + ']=' + arr[i] + ' ≠ ' + k + '，继续。', { c: i });
        }
        if (found < 0) F([3], '扫描全表未找到 ' + k + ' → 返回 0。共比较 ' + n + ' 次——最坏情形 O(n)。', { res: '未找到' }, 'fail');
        F(0, '小结：按值查找 O(n)。等概率成功 ASL=(n+1)/2=' + ((n + 1) / 2).toFixed(1) + '。想 O(1) 查找 → 第 7 章散列表。', { hit: found >= 0 ? found : undefined, res: found >= 0 ? '位序 ' + (found + 1) : '未找到' });
      } else if (op === 'get') {
        if (pos < 1 || pos > n) F(0, 'i = ' + pos + ' 不合法（合法范围 1 ≤ i ≤ ' + n + '）→ 返回 ERROR。', { res: 'ERROR：i 越界' }, 'err');
        else F(5, 'elem[' + (pos - 1) + '] = ' + arr[pos - 1] + '。位序 ' + pos + ' 直接映射下标 ' + (pos - 1) + '，**一次寻址 O(1)**，与 n 无关。', { hit: pos - 1, res: '第 ' + pos + ' 个 = ' + arr[pos - 1] }, 'ok');
      } else if (op === 'len') {
        F(0, 'L.length 是顺序表结构体里现成的字段：n = ' + n + '，**O(1) 直接读**（链表则要数一遍 O(n)）。', { done: arr.map(function (_, i) { return i; }), res: 'n = ' + n }, 'ok');
      } else if (op === 'max') {
        var mx = 0;
        for (var i2 = 1; i2 < n; i2++) {
          cmp++;
          if (arr[i2] > arr[mx]) { mx = i2; F([8], 'elem[' + i2 + ']=' + arr[i2] + ' > 当前最大 elem[' + (mx === i2 ? i2 : mx) + '] → 更新最大值候选。', { m: i2, c: i2 }); }
          else F([8], 'elem[' + i2 + ']=' + arr[i2] + ' ≤ 当前最大 ' + arr[mx] + '，不更新。', { m: mx, c: i2 });
        }
        F([6], '最大值 = elem[' + (mx + 1) + '] 位置的 ' + arr[mx] + '（位序 ' + (mx + 1) + '），共比较 ' + (n - 1) + ' 次。', { m: mx, res: 'max = ' + arr[mx] }, 'ok');
      } else {
        var out = [];
        for (var i3 = 0; i3 < n; i3++) {
          out.push(arr[i3]);
          F(0, '输出第 ' + (i3 + 1) + ' 个：' + arr[i3] + '（已输出 ' + out.join(', ') + '）', { done: out.map(function (_, j) { return j; }) });
        }
        F(0, '遍历完成：L =（' + out.join(', ') + '）。遍历 O(n)。', { done: out.map(function (_, j) { return j; }), res: '共 ' + n + ' 个' }, 'ok');
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470, n = s.arr.length;
      var cw = Math.min(84, Math.floor((W - 140) / n) - 10), x0 = (W - n * cw - (n - 1) * 10) / 2, y = 200;
      var g = '';
      g += h.txt(W / 2, 90, '顺序表 L（MAXSIZE = 12）', { size: 18, w: 600 });
      for (var i = 0; i < n; i++) {
        var x = x0 + i * (cw + 10), key = s.colors[i] || 'N';
        var cm = { N: ['#fff', C.grey], C: [C.amberBg, C.amber], S: [C.greenBg, C.green], D: ['#f8fafc', C.line], P: [C.blueBg, C.blue] }[key];
        g += h.rect(x, y, cw, 56, { fill: cm[0], stroke: cm[1], sw: key === 'N' ? 1.5 : 2.4, rx: 7 });
        g += h.txt(x + cw / 2, y + 34, String(s.arr[i]), { size: 17, w: 700 });
        g += h.txt(x + cw / 2, y + 76, '下标 ' + i, { size: 11, fill: C.muted });
        g += h.txt(x + cw / 2, y + 94, '位序 ' + (i + 1), { size: 11, fill: C.muted });
      }
      for (var j = n; j < 12; j++) g += h.rect(x0 + j * (cw + 10), y, cw, 56, { fill: '#fbfcfe', stroke: C.line, sw: 1, rx: 7, dash: '5,4' });
      if (s.tag) g += h.txt(W / 2, 350, s.tag, { size: 15, w: 700, fill: C.blue });
      g += h.txt(W / 2, 400, '蓝=当前最大  黄=比较  绿=命中  灰虚线=空闲空间', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
