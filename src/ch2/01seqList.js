/* 动画1：顺序表的插入与删除（教材算法2.3/2.5思路，默认数据取自 cp2-01 PPT 例 25,12,47,89,36,14） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var MAXSIZE = 10;

  DSC.reg({
    id: 'seqList', ch: 2, name: '① 顺序表的插入与删除',
    note: '教材 2.4 线性表的顺序表示和实现（插入/删除、移动次数分析）',
    guide: [
      '顶部选择"插入/删除"，改位置 i 或初始序列后自动重新演示',
      '看重点：元素逐格移动，源格显示"空"，空位向插入点/表尾迁移',
      '对照提示条公式：插入移动 n−i+1 次（平均 n/2）、删除移动 n−i 次（平均 (n−1)/2）',
      '勾选"错误演示：从前往后移"，看数据被覆盖的后果'
    ],
    inputs: [
      { key: 'op', label: '操作', type: 'select', options: [['insert', '插入：第 i 个位置前插入 e'], ['del', '删除：删除第 i 个元素']], value: 'insert' },
      { key: 'i', label: '位置 i', type: 'number', value: 3, min: 1, max: MAXSIZE + 1 },
      { key: 'e', label: '值 e', type: 'number', value: 33 },
      { key: 'errDir', label: '错误演示：从前往后移（会覆盖数据）', type: 'checkbox', value: false },
      { key: 'data', label: '初始序列', type: 'text', value: '25,12,47,89,36,14' }
    ],
    run: function (v) {
      var a = (v.data || '').split(/[,，\s]+/).filter(function (s) { return s !== ''; }).map(Number);
      if (a.some(function (x) { return Number.isNaN(x); })) throw new Error('初始序列请输入逗号分隔的数字，如 25,12,47,89,36,14');
      if (a.length > MAXSIZE) a = a.slice(0, MAXSIZE);
      if (a.length === 0) throw new Error('初始序列不能为空');
      var ins = v.op === 'insert';
      var code = ins ? [
        'Status ListInsert_Sq(SqList &L, int i, ElemType e) {',
        '    if (i < 1 || i > L.length + 1) return ERROR;   // ① 判断i的合法性',
        '    if (L.length >= MAXSIZE) return ERROR;         // ② 判断表是否已满',
        '    for (j = L.length - 1; j >= i - 1; --j)',
        '        L.elem[j + 1] = L.elem[j];                 // ③ 元素依次后移',
        '    L.elem[i - 1] = e;                             // ④ 插入e',
        '    ++L.length;                                    // ⑤ 表长加1',
        '    return OK;',
        '}'
      ] : [
        'Status ListDelete_Sq(SqList &L, int i) {',
        '    if (i < 1 || i > L.length) return ERROR;       // ① 判断i的合法性',
        '    for (j = i; j <= L.length - 1; ++j)',
        '        L.elem[j - 1] = L.elem[j];                 // ② 元素依次前移',
        '    --L.length;                                    // ③ 表长减1',
        '    return OK;',
        '}'
      ];
      var frames = [], moves = 0;
      function snap(len, o) {
        o = o || {};
        var cells = [];
        for (var k = 0; k < MAXSIZE; k++) cells.push(k < o.rawLen ? a[k] : null);
        o.cells = cells; o.len = len; o.moves = moves; o.op = v.op; o.i = +v.i; o.e = v.e; o.max = MAXSIZE;
        o.n0 = a.length;
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      var n = a.length;
      F(0, '初始顺序表 L = ( ' + a.join(', ') + ' )，表长 n = ' + n + '。位序 i 从 1 开始：第 i 个元素存放在下标 i−1（随机存取，取值 O(1)）。',
        { 表长: 'n = ' + n, 存储容量: 'MAXSIZE = ' + MAXSIZE, 移动次数: '0' },
        snap(n, { rawLen: n }));

      if (ins) {
        if (+v.i < 1 || +v.i > n + 1) {
          F(1, 'i = ' + v.i + ' 不合法！插入的合法范围是 1 ≤ i ≤ n+1 = ' + (n + 1) + '。算法返回 ERROR，不执行插入。',
            { 表长: 'n = ' + n, 结果: 'ERROR（i 不合法）' }, snap(n, { rawLen: n, err: 'i 不合法' }));
          return { code: code, frames: frames };
        }
        if (n >= MAXSIZE) {
          F(2, '表已满（n = MAXSIZE = ' + MAXSIZE + '），发生上溢。算法返回 ERROR，不执行插入。',
            { 表长: 'n = ' + n, 结果: 'ERROR（表满上溢）' }, snap(n, { rawLen: n, err: '表满' }));
          return { code: code, frames: frames };
        }
        if (v.errDir) {
          /* 错误方向演示：j 从 i−1 向右移，元素被覆盖 */
          for (var je = +v.i - 1; je <= n - 1; je++) {
            a[je + 1] = a[je];
            moves++;
            F([3, 4], '✗ 从前往后移：a[' + (je + 1) + '] = a[' + je + '] = ' + a[je] + '。注意下标 ' + (je + 1) + ' 里原来的 ' + (je + 2 <= n ? '元素还没移走，' : '') + '已被覆盖！',
              { j: String(je) + '（错误方向）', 已移动: moves + ' 次', 被覆盖: '下标 ' + (je + 1) + ' 原值丢失' },
              snap(n, { rawLen: n + 1, from: je, to: je + 1, errDir: true }));
          }
          F(4, '✗ 错误结果：L = ( ' + a.slice(0, n + 1).join(', ') + ' )——原 89、36、14 已被 47 覆盖，数据被破坏，e 也无处可插。结论：后移必须从最后一个元素开始（j 从 n−1 递减到 i−1）。',
            { 结果: '数据被覆盖（错误）', 移动次数: moves + ' 次' },
            snap(n, { rawLen: n + 1, errDir: true, done: true, err: '方向错误' }));
          return { code: code, frames: frames };
        }
        for (var j = n - 1; j >= +v.i - 1; j--) {
          a[j + 1] = a[j];
          moves++;
          F([3, 4], '后移：j = ' + j + '，满足 j ≥ i−1 = ' + (+v.i - 1) + '。把下标 ' + j + ' 的元素移到下标 ' + (j + 1) + '，下标 ' + j + ' 腾空——空位向插入点移动。已移动 ' + moves + ' 个元素。',
            { j: String(j) + '（≥ i−1 ✓）', 已移动: moves + ' 个元素', 表长: 'n = ' + n },
            snap(n, { rawLen: n + 1, from: j, to: j + 1, hole: j }));
        }
        F([3], 'j = ' + (+v.i - 2) + ' < i−1 = ' + (+v.i - 1) + '，循环条件不成立，后移结束——恰好移动 n−i+1 = ' + moves + ' 个元素。空位已移到下标 ' + (+v.i - 1) + '（第 ' + v.i + ' 个位置），等待 e 填入。（注意必须从最后一个元素开始移：若从前往后移，后面的元素会被覆盖）',
          { 已移动: moves + ' 个元素', 表长: 'n = ' + n, 空位: '下标 ' + (+v.i - 1) },
          snap(n, { rawLen: n + 1, hole: +v.i - 1 }));
        a[+v.i - 1] = +v.e;
        F(5, '把 e = ' + v.e + ' 放入下标 ' + (+v.i - 1) + '（即第 ' + v.i + ' 个位置）。',
          { 已移动: moves + ' 个元素', 表长: 'n = ' + n },
          snap(n + 1, { rawLen: n + 1, eAt: +v.i - 1 }));
        F(6, '表长加 1，插入完成：L = ( ' + a.slice(0, n + 1).join(', ') + ' )。共移动 ' + moves + ' = n−i+1 个元素；等概率下平均移动 n/2 个（最好 0 次、最坏 n 次）。时间复杂度 O(n)。',
          { 表长: 'n = ' + (n + 1), 移动次数: moves + '（= n−i+1）' },
          snap(n + 1, { rawLen: n + 1, done: true }));
      } else {
        if (+v.i < 1 || +v.i > n) {
          F(1, 'i = ' + v.i + ' 不合法！删除的合法范围是 1 ≤ i ≤ n = ' + n + '。算法返回 ERROR。',
            { 表长: 'n = ' + n, 结果: 'ERROR（i 不合法）' }, snap(n, { rawLen: n, err: 'i 不合法' }));
          return { code: code, frames: frames };
        }
        var del = a[+v.i - 1];
        F(1, '待删除元素：第 ' + v.i + ' 个 = ' + del + '（下标 ' + (+v.i - 1) + '）。', { 表长: 'n = ' + n }, snap(n, { rawLen: n, delAt: +v.i - 1 }));
        for (var j2 = +v.i; j2 <= n - 1; j2++) {
          a[j2 - 1] = a[j2];
          moves++;
          F([2, 3], '前移：j = ' + j2 + '，满足 j ≤ L.length−1 = ' + (n - 1) + '。把下标 ' + j2 + ' 的元素移到下标 ' + (j2 - 1) + '，覆盖删除位置；下标 ' + j2 + ' 腾空——空位向表尾移动。已移动 ' + moves + ' 个元素。',
            { j: String(j2) + '（≤ n−1 ✓）', 已移动: moves + ' 个元素', 表长: 'n = ' + n },
            snap(n, { rawLen: n, from: j2, to: j2 - 1, hole: j2 }));
        }
        F([2], 'j = ' + n + ' > L.length−1 = ' + (n - 1) + '，循环条件不成立，前移结束——恰好移动 n−i = ' + moves + ' 个元素。空位已移到表尾下标 ' + (n - 1) + '，表长减 1 后它就不属于表了。（前移从删除点开始逐个进行，次序不能颠倒）',
          { 已移动: moves + ' 个元素', 表长: 'n = ' + n, 空位: '下标 ' + (n - 1) },
          snap(n, { rawLen: n, hole: n - 1 }));
        a[n - 1] = null;
        F(4, '表长减 1，删除完成：L = ( ' + a.slice(0, n - 1).join(', ') + ' )，删掉了 ' + del + '。共移动 ' + moves + ' = n−i 个元素；平均移动 (n−1)/2 个。时间复杂度 O(n)。',
          { 表长: 'n = ' + (n - 1), 移动次数: moves + '（= n−i）' },
          snap(n - 1, { rawLen: n - 1, done: true }));
      }
      return { code: code, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470, cw = 78, ch = 56;
      var x0 = (W - MAXSIZE * cw) / 2, y0 = 200;
      var g = '';
      g += h.txt(W / 2, 42, '顺序表 L（MAXSIZE = ' + s.max + '）', { size: 19, w: 600 });
      g += h.txt(W / 2, 70, '位序 i = 下标 + 1（逻辑顺序从 1 数起）', { size: 13, fill: C.muted });
      // 位序标注（第i个位置指示）
      var ix = x0 + (s.i - 1) * cw + cw / 2;
      g += h.txt(ix, y0 - 44, '第 ' + s.i + ' 个', { size: 13, fill: C.amber, w: 600 });
      g += '<path d="M' + ix + ' ' + (y0 - 36) + ' L' + (ix - 6) + ' ' + (y0 - 24) + ' L' + (ix + 6) + ' ' + (y0 - 24) + ' Z" fill="' + C.amber + '"/>';
      for (var k = 0; k < s.max; k++) {
        var x = x0 + k * cw;
        var used = k < s.cells.length && s.cells[k] !== null;
        var isHole = s.hole === k;
        var fill = '#fff', stroke = C.grey, dash = null, txtCol = C.ink, fw = null;
        if (used && k >= s.len) { fill = C.amberBg; stroke = C.amber; }           // 移动出来暂存区
        if (s.from === k && !isHole) { fill = C.amberBg; stroke = C.amber; }
        if (s.to === k) { fill = C.blueBg; stroke = C.blue; }
        if (s.eAt === k) { fill = C.greenBg; stroke = C.green; }
        if (s.done && k < s.len) { fill = C.greenBg; stroke = C.green; }
        if (s.delAt === k) { stroke = C.red; dash = '5,4'; }
        if (s.err) { stroke = C.red; }
        if (isHole) { fill = '#fff'; stroke = C.blue; dash = '5,4'; }
        g += h.rect(x, y0, cw - 6, ch, { fill: fill, stroke: stroke, rx: 8, dash: dash });
        if (isHole) {
          g += h.txt(x + (cw - 6) / 2, y0 + ch / 2 + 5, '空', { size: 14, fill: C.blue });
        } else if (used) {
          g += h.txt(x + (cw - 6) / 2, y0 + ch / 2 + 6, s.cells[k], { size: 18, fill: txtCol, w: fw || 600 });
        }
        g += h.txt(x + (cw - 6) / 2, y0 + ch + 22, '下标 ' + k, { size: 12, fill: C.muted });
      }
      // len 分界线
      var lx = x0 + s.len * cw - 3;
      g += h.line(lx, y0 - 16, lx, y0 + ch + 16, { stroke: C.blue, sw: 2, dash: '4,4' });
      g += h.txt(lx + 8, y0 - 20, '表长 n = ' + s.len, { size: 13, fill: C.blue, anchor: 'start', w: 600 });
      // 移动箭头
      if (s.from != null && s.to != null) {
        var fx = x0 + s.from * cw + (cw - 6) / 2, tx = x0 + s.to * cw + (cw - 6) / 2;
        var ay = y0 - 70;
        g += h.arrow(fx, ay, tx, ay, { stroke: C.amber, sw: 3, head: 10 });
        g += h.txt((fx + tx) / 2, ay - 12, 'L.elem[' + s.from + '] → L.elem[' + s.to + ']', { size: 13, fill: C.amber, w: 600 });
      }
      // 底部说明
      var note = s.err === '表满' ? '✗ 上溢：表已满，插入失败'
        : s.err === 'i 不合法' ? '✗ i 不合法，操作失败'
        : s.err === '方向错误' ? '✗ 移动方向错误：从前往后移，未移走的元素被覆盖（正确做法：从最后一个元素开始移）'
        : (s.op === 'insert' ? '插入需要移动元素：移动次数 = n−i+1，平均 n/2' : '删除需要移动元素：移动次数 = n−i，平均 (n−1)/2');
      var nc = s.err ? C.red : (s.op === 'insert' ? C.blue : C.blue);
      g += h.rect(W / 2 - 300, H - 56, 600, 34, { fill: s.err ? C.redBg : C.blueBg, stroke: s.err ? C.red : C.blue, rx: 8 });
      g += h.txt(W / 2, H - 34, note, { size: 13.5, fill: nc, w: 600 });
      if (s.moves != null) g += h.txt(W - 24, 42, '已移动元素次数：' + s.moves, { size: 15, fill: C.amber, w: 600, anchor: 'end' });
      return h.svg(W, H, g);
    }
  });
})();
