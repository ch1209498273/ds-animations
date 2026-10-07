/* 动画：堆排序——教材 8.5，建大根堆（自下而上筛选）+ 逐个输出堆顶，例题 {49,38,65,97,76,13,27,49*} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  var CODE = [
    'void HeapAdjust(SqList &L, int s, int m) {   // 使 a[s..m] 成为大根堆',
    '    rc = L.r[s];                             // 暂存待调整记录',
    '    for (j = 2*s; j <= m; j *= 2) {          // 沿孩子向下筛选',
    '        if (j < m && L.r[j] < L.r[j+1]) ++j; // j 指向较大的孩子',
    '        if (rc >= L.r[j])  break;            // 找到归宿，结束',
    '        L.r[s] = L.r[j];  s = j;             // 孩子上移，继续向下',
    '    }',
    '    L.r[s] = rc;',
    '}',
    'void HeapSort(SqList &L) {',
    '    for (i = L.length/2; i >= 1; --i)        // ① 自下而上建大根堆',
    '        HeapAdjust(L, i, L.length);',
    '    for (i = L.length; i > 1; --i) {         // ② 堆顶与堆尾交换，堆缩小',
    '        swap(L.r[1], L.r[i]);  HeapAdjust(L, 1, i-1);',
    '    }',
    '}'
  ];

  DSC.reg({
    id: 'heapSort', ch: 8, name: '堆排序（建堆 + 筛选）',
    aim: '先建成大顶堆，再把堆顶换到末尾、堆缩小一层——**建堆 O(n)，每次筛选 O(logn)**',
    note: '教材 8.5 选择排序（完全二叉树视角的选择排序，不稳定）',
    keywords: '堆排序 建堆 筛选 大顶堆 输出序列 重建 O(nlogn) 不稳定 siftDown 交换堆顶 数组下标',
    guide: [
      '上半部分是完全二叉树视图、下半部分是数组视图——同一份数据两种看法（a[i] 的孩子是 a[2i]、a[2i+1]）',
      '第一步自下而上"建堆"：从最后一个非叶结点开始，把大孩子逐层上移，让每个父亲 ≥ 孩子',
      '第二步反复"输出堆顶"：堆顶（最大值）与堆尾交换（绿色=已就位），堆缩小后再筛选重建',
      '建堆 O(n)，每次调整 O(log n)，整体 O(n log n)——不受初始序列影响，且只用到 O(1) 辅助空间'
    ],
    inputs: su.presetInputs([{ key: 'errChild', label: '错误演示：选较大孩子时少判 j < m', type: 'checkbox', value: false }]),
    misleads: [{ "key": "errChild", "value": true, "claim": '少判 j < m：筛选时会把堆外"已就位"的数当成孩子来比，选错之后结果不再是升序' }],
    run: function (v) {
      var a = su.getData(v).slice();
      var n = a.length, cmp = 0, mov = 0;
      /* errChild 只删一个守卫：`if (j < m && L.r[j] < L.r[j+1]) ++j` 里的 j < m。
         它不会崩——读到的是数组里真实存在、但已经"输出就位"的那一格，于是筛出错了孩子。
         四组预设数据全部翻车（末态不升序），而数据本身仍然守恒：这一族错要查"有序"，
         插入落位那一族（01insertSort 的 errLand）要查"守恒"——判据不一样。 */
      var cb = !!v.errChild;
      a.unshift(0);
      var frames = [];

      /* 大根堆性质自查：a[1..heap] 里有没有父亲小于孩子（现算，不写死） */
      var phase2 = false, badN = 0;
      function heapBad(heap) {
        for (var k = 1; k <= heap; k++) {
          if (2 * k <= heap && a[k] < a[2 * k]) return 'a[' + k + '] < a[' + (2 * k) + ']';
          if (2 * k + 1 <= heap && a[k] < a[2 * k + 1]) return 'a[' + k + '] < a[' + (2 * k + 1) + ']';
        }
        return null;
      }

      function colors(hl, heap) {
        hl = hl || {}; heap = heap == null ? n : heap;
        var cs = [];
        for (var i = 1; i <= n; i++) cs.push(i > heap ? 'D' : 'N');
        if (hl.s != null && cs[hl.s - 1] === 'N') cs[hl.s - 1] = 'P';
        if (hl.c != null && cs[hl.c - 1] === 'N') cs[hl.c - 1] = 'C';
        if (hl.w != null) cs[hl.w - 1] = 'S';
        return cs;
      }
      function F(line, msg, extra, mk) {
        extra = extra || {};
        var heap = extra.heap == null ? n : extra.heap;
        var pn = { 比较: cmp + ' 次', 赋值: mov + ' 次', 堆区: 'a[1..' + heap + ']', 已输出: n - heap + ' 个' };
        /* 默认档面板一行不加——加了就等于改线上产品的界面；只有错误档多这行诊断 */
        if (cb) {
          /* 建堆之前原始序列本来就不是堆，报"被破坏"是噪音；建堆完成起才要求它成立 */
          if (!phase2) pn['大根堆'] = '建堆中，还不要求';
          else if (heap < 2) pn['大根堆'] = '—（堆里不到两个结点）';
          else { var b = heapBad(heap); pn['大根堆'] = b == null ? '成立' : '被破坏 ' + b; if (b != null) badN++; }
        }
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg, panel: pn,
          snap: { arr: a.slice(1), colors: colors(extra, heap), heap: heap, s: extra.s, c: extra.c, w: extra.w, mark: mk }
        });
      }

      F(0, '初始序列（数组 a[1..' + n + ']，完全二叉树视图：a[i] 的孩子是 a[2i] 与 a[2i+1]）。先自下而上建大根堆。', {});

      function adjust(s, m, phase) {
        var rc = a[s];
        F([1], phase + '：调整结点 a[' + s + ']=' + rc + '（其子树中暂存于 rc）。', { s: s, heap: m });
        for (var j = 2 * s; j <= m; j *= 2) {
          if (cb || j < m) {
            cmp++;
            var only = (j === m), off = (j + 1 > n);          /* only：堆里只有这一个孩子；off：连数组都没有 */
            var pick = off ? j : (a[j] < a[j + 1] ? j + 1 : j);
            F([3], only
              ? (off ? '少判 j < m：堆里 a[' + s + '] 只有 a[' + j + '] 一个孩子，它又已是表尾，还要去读不存在的 a[' + (j + 1) + ']——越界读。'
                    : '少判 j < m：堆只到 a[' + m + ']，a[' + s + '] 在堆里只有 a[' + j + ']=' + a[j] + ' 一个孩子，却把堆外的 a[' + (j + 1) + ']=' + a[j + 1] + '（已就位）也当候选 → 选了 a[' + pick + ']' + (pick === j ? '，这次侥幸没选错' : '，一个已经排好位的数') + '。')
              : '两个孩子 a[' + j + ']=' + a[j] + '、a[' + (j + 1) + ']=' + a[j + 1] + '：选较大者 a[' + pick + ']。',
              { c: pick, s: s, heap: m });
            j = pick;
          } else { F([3], '只有一个孩子 a[' + j + ']=' + a[j] + '。', { c: j, s: s, heap: m }); }
          cmp++;
          if (rc >= a[j]) { F([4], 'rc=' + rc + ' ≥ 大孩子 a[' + j + ']=' + a[j] + ' → 位置合适，筛选结束。', { s: s, c: j, heap: m }); break; }
          a[s] = a[j]; mov++;
          F(5, 'rc=' + rc + ' < 大孩子 a[' + j + ']=' + a[j] + ' → 大孩子上移到 a[' + s + ']，继续向下看。', { w: s, c: j, heap: m });
          s = j;
        }
        a[s] = rc; mov++;
        F(6, 'rc=' + rc + ' 放入最终位置 a[' + s + ']。', { w: s, heap: m });
      }

      for (var i = Math.floor(n / 2); i >= 1; i--) adjust(i, n, '建堆');
      phase2 = true;
      var mx = Math.max.apply(null, a.slice(1)), bb = heapBad(n);
      F([9, 10], cb
        ? '建堆结束：a[1]=' + a[1] + (a[1] === mx ? ' 恰好还是最大值' : ' 并不是最大值（最大的是 ' + mx + '）') +
          '，大根堆性质' + (bb == null ? '仍成立' : '已被破坏：' + bb) + '。接下来照常"取堆顶 + 重建堆"，看这个错会不会被放大。'
        : '建堆完成！a[1]=' + a[1] + ' 是全序列最大值，且每个父亲 ≥ 孩子。堆排序开始：反复"取堆顶 + 重建堆"。', {}, 'heap');

      var cnt = 0;
      for (var i2 = n; i2 > 1; i2--) {
        var t = a[1]; a[1] = a[i2]; a[i2] = t; mov++;
        cnt++;
        F(12, '第 ' + cnt + ' 步：堆顶 ' + t + ' 与堆尾 a[' + i2 + ']=' + a[i2] + ' 交换 → ' + t + ' 已就位（绿）。堆缩小为 a[1..' + (i2 - 1) + ']。',
          { w: i2, heap: i2 - 1 }, 'e' + cnt);
        adjust(1, i2 - 1, '重建堆');
      }
      F(12, cb
        ? '✗ 跑完' + (su.asc(a.slice(1)) ? '看着仍是升序：' : '并不是升序：') + a.slice(1).join(' ') +
          '。少判 j < m，筛选就拿堆外"已就位"的数当孩子比——本次有 ' + badN + ' 帧大根堆被破坏' +
          (badN ? '，堆顶不是最大值，交换出去的就不一定是当前最大者。' : '，这组数据侥幸躲过：边界错误就是这样时对时错。')
        : '排序完成：' + a.slice(1).join(' ') + '。整个过程比较 ' + cmp + ' 次、赋值 ' + mov + ' 次。堆排序 = "树形选择排序"：利用父子关系把选择最小/最大的代价从 O(n) 降到 O(log n)。', { heap: 0 }, 'final');
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 620, n = s.arr.length, heap = s.heap == null ? n : s.heap;
      var g = '';
      g += h.txt(W / 2, 30, '堆排序（蓝=调整中，黄=孩子候选，红=写入，绿=已输出）', { size: 17, w: 600 });
      /* ---- 树视图 ---- */
      function pos(i) { // i 1-based
        var d = Math.floor(Math.log(i) / Math.LN2), k = i - (1 << d), cnt = 1 << d;
        var dx = Math.min(120, 880 / cnt);
        return [W / 2 + (k - (cnt - 1) / 2) * dx, 88 + d * 104];
      }
      for (var i = 1; i <= n; i++) {
        if (2 * i > n) continue;
        var A = pos(i), B1 = pos(2 * i);
        g += h.line(A[0], A[1] + 20, B1[0], B1[1] - 20, { stroke: C.line, sw: 1.6 });
        if (2 * i + 1 <= n) { var B2 = pos(2 * i + 1); g += h.line(A[0], A[1] + 20, B2[0], B2[1] - 20, { stroke: C.line, sw: 1.6 }); }
      }
      for (var i2 = 1; i2 <= n; i2++) {
        var P = pos(i2), key = s.colors[i2 - 1] || 'N';
        var cm = su.COLORS[key];
        var out = i2 > heap;
        g += h.circle(P[0], P[1], 21, { fill: out ? C.greenBg : cm[0], stroke: out ? C.green : cm[1], sw: out ? 1.6 : 2.2 });
        g += h.txt(P[0], P[1] + 6, String(s.arr[i2 - 1]), { size: 15, w: 700, fill: out ? C.green : C.ink });
        if (s.s === i2) g += h.txt(P[0], P[1] - 30, '调整中', { size: 11, fill: C.blue, w: 600 });
        if (s.c === i2) g += h.txt(P[0], P[1] - 30, '候选孩子', { size: 11, fill: C.amber, w: 600 });
      }
      /* ---- 数组视图 ---- */
      var bw = Math.min(60, Math.floor(880 / n) - 8), x0 = (W - n * bw - (n - 1) * 8) / 2, ay = 500;
      for (var i3 = 1; i3 <= n; i3++) {
        var x = x0 + (i3 - 1) * (bw + 8), key2 = s.colors[i3 - 1] || 'N', cm2 = su.COLORS[key2];
        var out2 = i3 > heap;
        g += h.rect(x, ay, bw, 40, { fill: out2 ? C.greenBg : cm2[0], stroke: out2 ? C.green : cm2[1], sw: 1.6, rx: 5 });
        g += h.txt(x + bw / 2, ay + 26, String(s.arr[i3 - 1]), { size: 15, w: 700, fill: out2 ? C.green : C.ink });
        g += h.txt(x + bw / 2, ay + 56, String(i3), { size: 10.5, fill: C.muted });
        if (i3 === 1 && heap >= 1) g += h.txt(x + bw / 2, ay - 10, '堆顶', { size: 11.5, fill: C.blue, w: 700 });
      }
      return h.svg(W, H, g);
    }
  });
})();
