/* 动画：顺序查找（哨兵）与折半查找（判定树 + ASL）——教材 7.2，例题 ST={5,13,19,21,37,56,64,75,80,88,92} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE_SEQ = [
    'int Search_Seq(SSTable ST, KeyType key) {',
    '    ST.r[0].key = key;                        // 哨兵：省去每次判越界',
    '    for (i = ST.length; ST.r[i].key != key; --i);   // 从后往前找',
    '    return i;                                 // 找不到时 i = 0',
    '}'
  ];
  var CODE_BIN = [
    'int Search_Bin(SSTable ST, KeyType key) {',
    '    low = 1;  high = ST.length;               // 有序表两端',
    '    while (low <= high) {',
    '        mid = (low + high) / 2;',
    '        if (key == ST.r[mid].key)  return mid;      // 找到',
    '        else if (key < ST.r[mid].key)  high = mid - 1;  // 左半区',
    '        else  low = mid + 1;                           // 右半区',
    '    }',
    '    return 0;                                 // 失败',
    '}'
  ];

  var DEF = [5, 13, 19, 21, 37, 56, 64, 75, 80, 88, 92];

  DSC.reg({
    id: 'seqBinSearch', ch: 7, name: '顺序查找与折半查找',
    aim: '顺序查找 ASL=(n+1)/2，折半 **ASL≈log₂(n+1)−1**：判定树一画就看清差在哪',
    note: '教材 7.2 静态查找（哨兵技巧、二分判定树、ASL）',
    keywords: '顺序查找 哨兵 平均查找长度 ASL 查找成功 查找失败 折半查找 二分 判定树 比较次数 log2n 有序 中间位置',
    guide: [
      '顺序查找：把 key 放进 ST[0] 当**哨兵**，从后往前扫——省去每步判"是否越界"，找不到自然停在 0',
      '折半查找：只对**有序**表有效，mid=(low+high)/2，每次排除一半；右侧展示判定树，路径就是比较序列',
      '切换不同的 key 观察成功/失败路径；失败时 low>high',
      '性能：顺序查找 ASL=(n+1)/2；折半查找 ASL≈log₂(n+1)−1——n=11 时分别为 6 和 3 左右'
    ],
    inputs: [
      { key: 'mode', label: '算法', type: 'select', options: [['seq', '顺序查找（带哨兵）'], ['bin', '折半查找（判定树）']], value: 'bin' },
      { key: 'key', label: '查找 key', type: 'number', value: 21, min: 0, max: 999 },
      { key: 'w', label: '自定义有序表', type: 'text', value: '5,13,19,21,37,56,64,75,80,88,92' },
      { key: 'errBound', label: '错误演示：low<=high 写成 low<high', type: 'checkbox', value: false }
    ],
    misleads: [{ "key": "errBound", "value": true, "claim": '区间缩到最后一格就不再比较：表里有些 key 明明在，却被判为查找失败' }],
    run: function (v) {
      var mode = v.mode || 'bin';
      var st = v.w && v.w.trim() ? h.parse(v.w) : DEF.slice();
      if (st.length < 3 || st.length > 12) throw Error('表长请取 3~12');
      for (var i0 = 1; i0 < st.length; i0++) if (st[i0] <= st[i0 - 1]) throw Error('折半查找要求表严格递增（自定义表请有序）');
      var n = st.length, key = +v.key || 0;
      /* errBound 只改循环条件。它的杀伤力不在"当前这个 key"上：中途命中的 key 一切正常，
         只有那些要走到区间缩成一格才比得到的 key 会漏。所以这一档把整张表都拿错法跑一遍，
         漏了哪些 key 现算出来（面板行与结论文案都由它生成），而不是写死"会失败"。 */
      var eb = !!v.errBound;
      function buggyPos(k) {
        var l = 1, g = n;
        while (l < g) { var m = Math.floor((l + g) / 2); if (st[m - 1] === k) return m; if (st[m - 1] > k) g = m - 1; else l = m + 1; }
        return 0;
      }
      var missed = [];
      if (eb) for (var q = 1; q <= n; q++) if (buggyPos(st[q - 1]) !== q) missed.push(q);
      var missedKeys = missed.slice(0, 4).map(function (p) { return st[p - 1]; }).join(',') + (missed.length > 4 ? '等' : '');
      var frames = [], cmp = 0, visit = [];

      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: (function () {
            var pn = { 比较: cmp + ' 次', 区间: extra.range || (mode === 'bin' ? '—' : '全表'), 结果: extra.res || '查找中…' };
            if (eb && mode === 'bin') pn['这张表会漏'] = missed.length ? missed.length + ' 个（' + missedKeys + '）' : '一个都不漏';
            return pn;
          })(),
          snap: { st: st.slice(), mode: mode, key: extra.key == null ? key : extra.key, cur: extra.cur, low: extra.low, high: extra.high, mid: extra.mid, visit: (extra.vis || visit).slice(), res: extra.res || null, mark: mk }
        });
      }

      if (mode === 'seq') {
        F(0, '顺序查找：把 key=' + key + ' 写入哨兵位 ST[0]，从表尾向前扫描。', {});
        var a = [key].concat(st);
        var i = n, found = 0;
        while (a[i] !== key && i > 0) {
          cmp++;
          F([2], 'ST[' + i + ']=' + a[i] + ' ≠ ' + key + ' → 继续向前。', { cur: i });
          i--;
        }
        cmp++;
        if (i > 0) {
          found = i;
          F([2, 3], 'ST[' + i + ']=' + a[i] + ' = key，找到！共比较 ' + (n - i + 1) + ' 次（哨兵使循环无需判越界）。', { cur: i, res: '成功：第 ' + i + ' 个元素' }, 'found');
        } else {
          F([2, 3], '扫到 ST[0] 命中哨兵——说明 key 不在表中，查找失败（i=0）。共比较 ' + (n + 1) + ' 次 = n+1（最坏情形）。', { cur: 0, res: '失败：key 不在表中' }, 'fail');
        }
        F(0, eb
          ? '✗ 顺序查找里没有 low/high 这一对边界，这个错法在它身上无从发生——切到"折半查找"再看这条。'
          : '小结：顺序查找 ASL(成功) = (n+1)/2 = ' + ((n + 1) / 2).toFixed(1) + '（等概率）。哨兵的价值：循环体内不用每次判断 i 是否越界，程序更简洁也更快一点。',
          { cur: found, res: found ? '成功' : '失败' }, eb ? 'final' : undefined);
      } else {
        F(0, '折半查找：表必须有序。low=1、high=' + n + '，mid=(low+high)/2 取整。' + (eb ? '本档把循环条件写成 low < high。' : ''), {});
        var low = 1, high = n, found2 = 0, bite = false;
        while (eb ? low < high : low <= high) {
          var mid = Math.floor((low + high) / 2);
          cmp++; visit.push(mid);
          F([3, 4], 'mid=(low+high)/2=' + mid + '：ST[' + mid + ']=' + st[mid - 1] + (st[mid - 1] === key ? ' = key，命中！' : st[mid - 1] > key ? ' > key=' + key + ' → 目标在左半区，high=' + (mid - 1) : ' < key=' + key + ' → 目标在右半区，low=' + (mid + 1)) + '。',
            { low: low, high: high, mid: mid, range: '[' + low + '..' + high + ']' });
          if (st[mid - 1] === key) { found2 = mid; break; }
          else if (st[mid - 1] > key) high = mid - 1; else low = mid + 1;
        }
        if (found2) F(5, '查找成功：key=' + key + ' 位于第 ' + found2 + ' 个。判定树上走过的路径（黄色）长度 = 比较次数 ' + cmp + '。', { mid: found2, res: '成功：第 ' + found2 + ' 个' }, 'found');
        else if (eb && low === high) {
          bite = st[low - 1] === key;
          F(9, 'low=high=' + low + '，条件 low < high 不成立 → 循环结束。ST[' + low + ']=' + st[low - 1] +
            (bite ? ' 偏偏就是 key，可它一次都没被比过 → 返回 0，明明在表里却判为失败。' : ' 不是 key → 返回 0。'),
            { res: bite ? '判为失败——可 key 就在表里' : '失败：key 不在表中' }, 'fail');
        }
        else F(9, 'low > high，区间为空——查找失败。走过 ' + cmp + ' 次比较，路径与"判定树"外部结点对应。', { res: '失败：key 不在表中' }, 'fail');
        /* 当前这一遍没暴露问题（中途命中，或 key 本来就不在表里）时，自动补一个会被漏掉的 key 再走一遍 */
        var shown = null, shownVis = null;
        if (eb && missed.length && !bite) {
          var k2 = st[missed[0] - 1], vis2 = [], l2 = 1, h2 = n;
          cmp = 0;                       /* 补的这两遍各自重新计数，否则"比较次数"这一行会累到看不出 ASL */
          F(1, (found2 ? '这个 key 中途就命中，看不出边界的问题' : '这个 key 本来就不在表里，判失败是对的') +
            '。换表里第 ' + missed[0] + ' 位的 ' + k2 + '（下面两遍各自重新计数）：错法照样找不到它。', { key: k2, vis: vis2, res: null });
          while (l2 < h2) {
            var m2 = Math.floor((l2 + h2) / 2);
            cmp++; vis2.push(m2);
            F([3, 4], 'mid=' + m2 + '：ST[' + m2 + ']=' + st[m2 - 1] + (st[m2 - 1] > k2 ? ' > ' + k2 + ' → high=' + (m2 - 1) : ' < ' + k2 + ' → low=' + (m2 + 1)) + '。',
              { low: l2, high: h2, mid: m2, range: '[' + l2 + '..' + h2 + ']', vis: vis2, key: k2 });
            if (st[m2 - 1] > k2) h2 = m2 - 1; else l2 = m2 + 1;
          }
          F(9, '错法停在 low=high=' + l2 + '：ST[' + l2 + ']=' + st[l2 - 1] + ' 从没被比过就出局了 → 返回 0。', { vis: vis2, key: k2, res: '错法：判为失败' }, 'fail');
          var vis3 = [], l3 = 1, h3 = n, hit3 = 0;
          cmp = 0;
          while (l3 <= h3) {
            var m3 = Math.floor((l3 + h3) / 2);
            cmp++; vis3.push(m3);
            if (st[m3 - 1] === k2) { hit3 = m3; break; }
            if (st[m3 - 1] > k2) h3 = m3 - 1; else l3 = m3 + 1;
          }
          F(5, '同一张表、同一个 key，把条件写回 low <= high：多走的那一步正好落在 mid=' + hit3 + ' → 命中第 ' + hit3 + ' 个（这一遍比了 ' + cmp + ' 次）。',
            { mid: hit3, vis: vis3, key: k2, res: '正确写法：成功' }, 'found');
          shown = k2; shownVis = vis3;
        }
        F(0, eb
          ? '✗ 把 low <= high 写成 low < high：这张表 ' + n + ' 个 key 里有 ' + missed.length + ' 个（' + (missed.length ? missedKeys : '无') + '）明明在表里却会被判为查找失败——区间缩到最后一格时那个元素从没被比过。'
          : '小结：折半查找 ASL ≈ log₂(n+1) − 1 ≈ ' + (Math.log2(n + 1) - 1).toFixed(1) + '，远优于顺序查找的 (n+1)/2 = ' + ((n + 1) / 2).toFixed(1) + '。前提：顺序存储 + 有序——链表不能随机存取，无法折半。',
          { res: eb ? '这张表会漏 ' + missed.length + ' 个 key' : (found2 ? '成功' : '失败'), key: shown, vis: shownVis }, eb ? 'final' : undefined);
      }
      return { code: mode === 'seq' ? CODE_SEQ : CODE_BIN, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 560, n = s.st.length;
      var g = '';
      g += h.txt(W / 2, 30, (s.mode === 'seq' ? '顺序查找（哨兵）' : '折半查找（判定树）') + '：key = ' + s.key, { size: 17, w: 600 });
      var bw = Math.min(64, Math.floor((W - 120) / n) - 10), gap = 10;
      var x0 = (W - (n * bw + (n - 1) * gap)) / 2, cy = s.mode === 'bin' ? 400 : 330;
      /* 折半判定树 */
      if (s.mode === 'bin') {
        var order = [], depthOf = {};
        (function build(lo, hi, d) {
          if (lo > hi) return;
          var m = Math.floor((lo + hi) / 2);
          order.push(m); depthOf[m] = d;
          build(lo, m - 1, d + 1); build(m + 1, hi, d + 1);
        })(1, n, 0);
        var inRank = {};
        order.slice().sort(function (a, b) { return a - b; }).forEach(function (m, r) { inRank[m] = r; });
        function npos(m) { return [70 + inRank[m] * ((W - 140) / n), 90 + depthOf[m] * 74]; }
        var edges = [];
        (function edgesBuild(lo, hi) {
          if (lo > hi) return;
          var m = Math.floor((lo + hi) / 2);
          if (lo <= m - 1) { edges.push([m, Math.floor((lo + m - 1) / 2)]); edgesBuild(lo, m - 1); }
          if (m + 1 <= hi) { edges.push([m, Math.floor((m + 1 + hi) / 2)]); edgesBuild(m + 1, hi); }
        })(1, n);
        edges.forEach(function (e) { var A = npos(e[0]), B = npos(e[1]); g += h.line(A[0], A[1], B[0], B[1], { stroke: C.line, sw: 1.5 }); });
        order.forEach(function (m) {
          var P = npos(m), idx = s.visit.indexOf(m);
          var f = '#fff', st2 = C.grey, sw = 1.8;
          if (idx >= 0 && s.res == null) { f = C.amberBg; st2 = C.amber; sw = 2.4; }
          if (s.res != null && idx >= 0) { f = C.greenBg; st2 = C.green; }
          if (s.mid === m && !s.res) { f = C.amberBg; st2 = C.amber; sw = 3; }
          g += h.circle(P[0], P[1], 20, { fill: f, stroke: st2, sw: sw });
          g += h.txt(P[0], P[1] + 6, String(s.st[m - 1]), { size: 14.5, w: 700 });
          g += h.txt(P[0], P[1] + 38, 'ST[' + m + ']', { size: 10, fill: C.muted });
        });
        g += h.txt(W / 2, 336, '↑ 判定树：走过的结点 = 比较序列 ' + (s.visit.length ? s.visit.join(' → ') : ''), { size: 12.5, fill: C.muted });
      }
      /* 表视图 */
      var sent = s.mode === 'seq';
      var cells = sent ? ['k'].concat(s.st) : s.st;
      var bw2 = sent ? Math.min(64, Math.floor((W - 160) / cells.length) - 10) : bw;
      var xx = sent ? (W - (cells.length * bw2 + (cells.length - 1) * 10)) / 2 : x0;
      cells.forEach(function (val, k) {
        var x = xx + k * (bw2 + 10), isSent = sent && k === 0;
        var f = '#fff', st3 = isSent ? C.blue : C.grey, sw = 1.5;
        var pos1 = isSent ? 0 : k;   // 显示用位序
        if (!isSent && s.cur === pos1) { f = C.amberBg; st3 = C.amber; sw = 2.6; }
        if (!isSent && s.mid === pos1) { f = C.amberBg; st3 = C.amber; sw = 2.6; }
        if (sent && s.cur === 0 && isSent) { f = C.redBg; st3 = C.red; sw = 2.4; }
        if (sent && s.res && s.cur === pos1) { f = C.greenBg; st3 = C.green; sw = 2.4; }
        if (!sent && s.res && s.mid === pos1) { f = C.greenBg; st3 = C.green; sw = 2.4; }
        g += h.rect(x, cy, bw2, 44, { fill: f, stroke: st3, sw: sw, rx: 6 });
        g += h.txt(x + bw2 / 2, cy + 27, String(val), { size: 15, w: 700 });
        g += h.txt(x + bw2 / 2, cy + 62, isSent ? 'ST[0]哨兵' : 'ST[' + pos1 + ']', { size: 10.5, fill: isSent ? C.blue : C.muted });
      });
      if (s.mode === 'bin' && s.low != null && s.res == null) {
        var lx = xx + (s.low - 1) * (bw + 10), hx = xx + (s.high - 1) * (bw + 10) + bw;
        g += h.line(lx, cy - 12, hx, cy - 12, { stroke: C.blue, sw: 3 });
        g += h.txt(lx, cy - 20, 'low', { size: 11.5, fill: C.blue, w: 600 });
        g += h.txt(hx, cy - 20, 'high', { size: 11.5, fill: C.blue, w: 600 });
      }
      if (s.res) g += h.txt(W / 2, cy + 106, (s.res.indexOf('成功') >= 0 ? '✓ ' : '✗ ') + s.res, { size: 14.5, w: 700, fill: s.res.indexOf('成功') >= 0 ? C.green : C.red });
      return h.svg(W, H, g);
    }
  });
})();
