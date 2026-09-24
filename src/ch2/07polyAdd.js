/* 动画：一元多项式相加（有序链表应用）——教材 2.8 案例，例题 A=7+3x+9x⁸+5x¹⁷，B=8x+22x⁷−9x⁸ */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    'void AddPolyn(Polynomial &Pa, Polynomial &Pb) {',
    '    // Pa、Pb 均按指数升序（有序链表）',
    '    while (pa && pb) {',
    '        if (pa->exp  <  pb->exp) { qa = pa; pa = pa->next; }        // A 项小：直接保留',
    '        else if (pa->exp == pb->exp) {                              // 指数相同：系数相加',
    '            sum = pa->coef + pb->coef;',
    '            if (sum != 0) { pa->coef = sum; qa = pa; }              // 和非零：并入 A',
    '            else { /* 删除 A 项 */ }  DelFirst(pb, pb); ++m;        // 和为零：两都删',
    '            pa = qa->next;  pb = pb->next;',
    '        }',
    '        else { /* B 项小：把 B 项插入 A */ }',
    '    }',
    '}'
  ];

  function parseTerms(s, name) {
    var toks = String(s).trim().split(/[\s;；,，]+/).filter(function (x) { return x !== ''; });
    if (toks.length % 2) throw Error(name + ' 格式应为「系数 指数 系数 指数 …」，如 7,0 3,1 9,8');
    var ts = [];
    for (var i = 0; i < toks.length; i += 2) {
      var c = Number(toks[i]), e = Number(toks[i + 1]);
      if (isNaN(c) || isNaN(e) || e < 0 || e > 30) throw Error(name + ' 系数/指数非法（指数 0~30）');
      ts.push({ c: c, e: e });
    }
    ts = ts.filter(function (t) { return t.c !== 0; });
    ts.sort(function (a, b) { return a.e - b.e; });
    for (var j = 1; j < ts.length; j++) if (ts[j].e === ts[j - 1].e) throw Error(name + ' 有重复指数 ' + ts[j].e);
    return ts;
  }
  function fmt(ts) {
    if (!ts.length) return '0';
    return ts.map(function (t, i) {
      var sign = t.c < 0 ? '−' : (i ? '+' : '');
      var a = Math.abs(t.c);
      var body = t.e === 0 ? String(a) : (a === 1 ? '' : a) + 'x' + (t.e > 1 ? 'ˆ' + t.e : '');
      return sign + (i && t.c > 0 ? ' ' : '') + body;
    }).join(' ');
  }

  var DEF_A = '7,0 3,1 9,8 5,17', DEF_B = '8,1 22,7 -9,8';

  DSC.reg({
    id: 'polyAdd', ch: 2, name: '一元多项式相加（有序链表）',
    aim: '两个有序链表按指数归并成一条——一元多项式相加就是合并有序表',
    note: '教材 2.8 案例分析与实现（指数升序合并、同类项合并）',
    keywords: '一元多项式 指数 系数 有序链表合并 同类项 相加 系数为零删除 稀疏多项式 链表应用',
    guide: [
      '多项式按指数**升序**存进链表：相加就变成"两个有序表归并"——第2章 mergeList 的直接应用',
      '指数小的先输出；指数相同 → 系数相加，**和为 0 时两结点都删除**（观察 9x⁸ 与 −9x⁸）',
      '某表用尽后另一表整体接上；整个过程 O(m+n)',
      '可以自己改系数/指数（空格或逗号分隔的「系数,指数」对），看合并、抵消、接续三种情形'
    ],
    inputs: [
      { key: 'a', label: 'A(x)「系数,指数」对', type: 'text', value: DEF_A },
      { key: 'b', label: 'B(x)「系数,指数」对', type: 'text', value: DEF_B }
    ],
    run: function (v) {
      var A = parseTerms(v.a, 'A(x)'), B = parseTerms(v.b, 'B(x)');
      var frames = [], cmp = 0;
      var R = [];
      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 比较: cmp + ' 次', 'A 剩': A.length + ' 项', 'B 剩': B.length + ' 项' },
          snap: { A: A.map(function (t) { return { c: t.c, e: t.e }; }), B: B.map(function (t) { return { c: t.c, e: t.e }; }), R: R.map(function (t) { return { c: t.c, e: t.e }; }), hiA: extra.hiA, hiB: extra.hiB, mark: mk }
        });
      }
      F(0, 'A(x) = ' + fmt(A) + '；B(x) = ' + fmt(B) + '。都按指数升序存放。', { hiA: 0, hiB: 0 });
      var i = 0, j = 0;
      while (i < A.length && j < B.length) {
        cmp++;
        if (A[i].e < B[j].e) { R.push(A[i]); F([3], 'A 指数 ' + A[i].e + ' < B 指数 ' + B[j].e + ' → A 的 ' + A[i].c + 'x^' + A[i].e + ' 直接并入结果。', { hiA: i, hiB: j }); i++; }
        else if (A[i].e === B[j].e) {
          var sum = A[i].c + B[j].c;
          if (sum !== 0) {
            R.push({ c: sum, e: A[i].e });
            F([4, 5, 6], '指数相同（' + A[i].e + '）：系数 ' + A[i].c + ' + (' + B[j].c + ') = ' + sum + ' ≠ 0 → 合并为一项 x^' + A[i].e + '。', { hiA: i, hiB: j });
          } else {
            F([6, 7], '指数相同（' + A[i].e + '）：系数 ' + A[i].c + ' + (' + B[j].c + ') = 0 → **两项同时删除**，结果中消失。', { hiA: i, hiB: j });
          }
          i++; j++;
        } else { R.push(B[j]); F([9], 'B 指数 ' + B[j].e + ' < A 指数 ' + A[i].e + ' → B 的 ' + B[j].c + 'x^' + B[j].e + ' 插入结果。', { hiA: i, hiB: j }); j++; }
      }
      while (i < A.length) { R.push(A[i]); F(0, 'B 已尽：A 剩余项 ' + A[i].c + 'x^' + A[i].e + ' 直接并入。', { hiA: i }); i++; }
      while (j < B.length) { R.push(B[j]); F(0, 'A 已尽：B 剩余项 ' + B[j].c + 'x^' + B[j].e + ' 直接并入。', { hiB: j }); j++; }
      F(0, '★ A(x) + B(x) = ' + fmt(R) + '。多项式相加 = 有序表归并 + 同类项合并，O(m+n)。系数链表让"删除中间项"也不必搬动其他项。', { mark: 'final' });
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 600;
      var g = '';
      function supx(e) { return String(e).split('').map(function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d] || d; }).join(''); }
      /* 画一条链：头指针盒 → 结点（coef|exp）→ … → NULL；hi=当前指针结点，consumed=之前已处理的灰化，delHi=被删红结点 */
      function chain(y, label, headName, arr, hi, opts) {
        opts = opts || {};
        var out = h.rect(40, y, 74, 40, { fill: '#eef2ff', stroke: C.blue, rx: 6 });
        out += h.txt(77, y + 25, headName, { size: 14, w: 700, fill: C.blue });
        out += h.arrow(114, y + 20, 148, y + 20, { stroke: C.blue, sw: 2 });
        var nLen = arr.length;
        /* 间隙 34（原 22）：箭头原本只有 step-18-(step-22)=4 单位长，等于一个点；
           next 标签的居中公式化简后是 x+nw，正好压在结点右边框上 */
        var step = nLen ? Math.max(104, Math.min(150, Math.floor((W - 320) / nLen))) : 150;
        var nw = step - 34;
        var cfs = nw < 100 ? 12 : 13.5;
        arr.forEach(function (t2, k) {
          var x = 150 + k * step;
          var isHi = hi === k;
          var isDel = opts.delHi === k;
          var consumed = opts.consumedBefore != null && k < opts.consumedBefore;
          var f = '#fff', st = C.grey, sw = 1.5;
          if (consumed) { f = '#f1f5f9'; st = C.line; }
          if (isHi && !isDel) { f = opts.delNow ? C.redBg : C.amberBg; st = opts.delNow ? C.red : C.amber; sw = 2.4; }
          if (isDel) { f = C.redBg; st = C.red; sw = 2.4; }
          if (opts.li === k) { f = C.greenBg; st = C.green; sw = 2.6; }
          out += h.rect(x, y, nw, 44, { fill: f, stroke: st, rx: 6, sw: sw, dash: isDel ? '5,4' : null });
          out += h.line(x + 58, y, x + 58, y + 44, { stroke: st, sw: 1 });
          out += h.txt(x + 29, y + 27, String(t2.c), { size: cfs, w: 700, family: 'Consolas,monospace' });
          out += h.txt(x + 58 + (nw - 58) / 2, y + 27, 'x' + supx(t2.e), { size: cfs - 1.5, family: 'Consolas,monospace' });
          if (k < nLen - 1) {
            out += h.arrow(x + nw + 2, y + 22, x + step - 4, y + 22, { stroke: C.grey, sw: 1.7, head: 7 });
            out += h.txt(x + nw + 17, y + 14, 'next', { size: 8.5, fill: C.muted });
          }
          if (isHi) {
            var px = x + nw / 2;
            out += h.arrow(px, y - 34, px, y - 8, { stroke: C.blue, sw: 2.5 });
            out += h.txt(px, y - 42, opts.ptr || 'p', { size: 13, fill: C.blue, w: 700 });
          }
          if (isDel) out += h.txt(x + nw / 2, y + 62, '✗ 删除', { size: 10.5, fill: C.red, w: 700 });
        });
        /* NULL 尾 */
        var xe = 150 + nLen * step;
        if (nLen) {
          out += h.arrow(xe - step + nw, y + 22, xe - 6, y + 22, { stroke: C.grey, sw: 1.7, head: 7 });
          out += h.txt(xe + 8, y + 26, '∧', { size: 15, fill: C.muted, w: 700 });
        } else {
          out += h.txt(160, y + 26, '（空链）', { size: 13, fill: C.muted, anchor: 'start' });
        }
        return out;
      }
      g += h.txt(W / 2, 26, '一元多项式相加：指数升序链表归并（指针逐结点移动）', { size: 17, w: 600 });
      g += chain(88, 'A(x)', 'pa', s.A, s.hiA, { consumedBefore: s.hiA, ptr: 'pa', delHi: s.del ? s.hiA : null, delNow: !!s.del });
      g += chain(210, 'B(x)', 'pb', s.B, s.hiB, { consumedBefore: s.hiB, ptr: 'pb', delHi: s.del ? s.hiB : null, delNow: !!s.del });
      g += h.txt(W / 2, 296, '↓ 指数小的结点先接入结果链；指数相同系数相加（和为 0 则两结点一起删） ↓', { size: 13, fill: C.muted });
      g += chain(320, '和', 'phead', s.R, s.li, { li: s.li });
      if (s.mark === 'final') {
        g += h.rect(W / 2 - 260, 386, 520, 54, { fill: C.greenBg, stroke: C.green, rx: 9 });
        g += h.txt(W / 2, 419, '✓ 相加完成（同类项已合并，抵消项已删除）', { size: 15, w: 700, fill: C.green });
      }
      g += h.txt(W / 2, 470, 'pa / pb 指针逐结点后移：指数小的直接接入；指数相同算系数，和为 0 两结点同时删除', { size: 12.5, fill: C.muted });
      g += h.txt(W / 2, 496, '这就是"用有序链表表示多项式"的意义：合并、删项只改指针，不搬数据', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
