/* 动画：基数排序——教材 8.7，多关键字 LSD 分配/收集，教材例题 {278,109,063,930,589,184,505,269,008,083} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C, su = DSC.su;

  var CODE = [
    'void RadixSort(SqList &L) {',
    '    // 关键字按"个位→十位→百位"分解（LSD 最低位优先），每位取值 0..9',
    '    for (d = 1; d <= 3; ++d) {',
    '        // ① 分配：按第 d 位关键字，把记录放入队列 Q[0..9]',
    '        for (i = 1; i <= L.length; ++i)',
    '            EnQueue(Q[第d位(L.r[i])], L.r[i]);',
    '        // ② 收集：按 Q[0]..Q[9] 顺序依次出队接回',
    '        for (j = 0, i = 1; j <= 9; ++j)',
    '            while (!QueueEmpty(Q[j]))  L.r[i++] = DeQueue(Q[j]);',
    '    }',
    '}'
  ];

  var DEF = [278, 109, 63, 930, 589, 184, 505, 269, 8, 83];
  function pad3(x) { return ('00' + x).slice(-3); }

  DSC.reg({
    id: 'radixSort', ch: 8, name: '基数排序（分配与收集）',
    aim: '完全不比较关键字，按位**分配—收集**：次数=位数，与数值大小无关',
    note: '教材 8.7 多关键字排序（LSD 最低位优先，稳定）',
    keywords: '基数排序 LSD MSD 最低位优先 分配 收集 桶 稳定 位 基数 多关键字 链式队列 牌堆 十进制桶 位数d',
    guide: [
      '基数排序不比较元素大小！把整数按位分解：个位→十位→百位，逐位做"分配 + 收集"',
      '分配：按当前位数字 0~9 把记录放进 10 个队列（黄色框显示当前入队记录）',
      '收集：按 Q[0]→Q[9] 依次出队接回原表。注意队列先进先出——这是稳定性的来源',
      '做完最高位后整体有序；趟数 = 最大位数 d，复杂度 O(d(n+10))，与 n 成线性关系'
    ],
    inputs: [
      { key: 'preset', label: '数据', type: 'select', options: [
        ['textbook', '教材例题 278,109,063,930,589,184,505,269,008,083'],
        ['custom', '自定义 ↓']
      ], value: 'textbook' },
      { key: 'w', label: '自定义序列', type: 'text', value: '278,109,63,930,589,184,505,269,8,83' }
    ],
    run: function (v) {
      var arr = v.preset === 'custom' ? su.parse(v.w) : DEF.slice();
      if (arr.length < 2 || arr.length > 10) throw Error('请输入 2~10 个非负整数');
      for (var c0 = 0; c0 < arr.length; c0++) if (arr[c0] < 0 || arr[c0] > 999) throw Error('数值需在 0~999 之间');
      var n = arr.length, d = 3;
      var frames = [], disp = arr.map(pad3);

      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 趟数: extra.pass ? '第 ' + extra.pass + ' 趟（' + extra.bitName + '）' : '—', 队列: extra.buckets ? extra.buckets.map(function (b) { return b.length; }).join(',') : '—' },
          snap: { arr: (extra.arr || disp).slice(), colors: [], buckets: extra.buckets ? extra.buckets.map(function (b) { return b.slice(); }) : null, cur: extra.cur, mark: mk, pass: extra.pass }
        });
      }

      F(0, '初始序列（显示为 3 位对齐：如 008）。从最低位（个位）开始，逐位分配 + 收集。', {});

      var work = arr.slice();
      [1, 2, 3].forEach(function (bit) {
        var bitName = bit === 1 ? '个位' : bit === 2 ? '十位' : '百位';
        var buckets = [];
        for (var b = 0; b < 10; b++) buckets.push([]);
        F([2, 3], '【第 ' + bit + ' 趟 · ' + bitName + '】准备 10 个空队列 Q[0..9]，开始按 ' + bitName + '数字分配。', { arr: disp, pass: bit, bitName: bitName, buckets: buckets });
        for (var i = 0; i < n; i++) {
          var dig = Math.floor(work[i] / Math.pow(10, bit - 1)) % 10;
          buckets[dig].push(work[i]);
          F(4, pad3(work[i]) + ' 的 ' + bitName + ' = ' + dig + ' → 进入队列 Q[' + dig + ']。', { arr: disp, pass: bit, bitName: bitName, buckets: buckets, cur: i });
        }
        var out = [];
        for (var q = 0; q < 10; q++) while (buckets[q].length) out.push(buckets[q].shift());
        F([6, 7], '分配完毕，按 Q[0]→Q[9] 依次收集（队列先进先出，等值记录先后次序不变——稳定）。', { pass: bit, bitName: bitName, buckets: buckets.map(function () { return []; }) });
        work = out;
        disp = work.map(pad3);
        F([5, 8], '第 ' + bit + ' 趟收集完成：' + disp.join(' ') + '。' + (bit < 3 ? '注意观察：' + bitName + '小的都排到了前面。' : '百位也有序了——整体有序！'),
          { pass: bit, bitName: bitName, buckets: null }, 'p' + bit);
      });
      F(0, '排序完成：' + disp.join(' ') + '。共 3 趟（= 最大位数 d），每趟 n 次分配 + n 次收集，O(d·(n+r))，r 为基数。不比较、不交换，靠"位"的先后关系排序；d 与 r 固定时接近线性。', { arr: disp }, 'final');
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 520, n = s.arr.length;
      var bw = Math.min(70, Math.floor((W - 120) / n) - 10), gap = 10;
      var x0 = (W - (n * bw + (n - 1) * gap)) / 2, base = 200;
      var g = '';
      g += h.txt(W / 2, 30, s.pass ? '基数排序 · 第 ' + s.pass + ' 趟（' + (s.pass === 1 ? '个位' : s.pass === 2 ? '十位' : '百位') + '）' : '基数排序（分配 → 收集）', { size: 17, w: 600 });
      for (var i = 0; i < n; i++) {
        var x = x0 + i * (bw + gap);
        var hl = s.cur === i;
        g += h.rect(x, base, bw, 44, { fill: hl ? C.amberBg : '#fff', stroke: hl ? C.amber : C.grey, sw: hl ? 2.5 : 1.5, rx: 6 });
        g += h.txt(x + bw / 2, base + 27, s.arr[i], { size: 15.5, w: 700, family: 'Consolas,monospace' });
      }
      if (s.buckets) {
        g += h.txt(30, 320, '队列（Q0 → Q9）：', { size: 13.5, fill: C.muted, anchor: 'start', w: 600 });
        var qy = 336, qw = (W - 60) / 10;
        for (var q = 0; q < 10; q++) {
          var qx = 30 + q * qw;
          g += h.txt(qx + qw / 2, qy + 14, 'Q' + q, { size: 12, w: 700, fill: C.muted });
          g += h.rect(qx + 4, qy + 22, qw - 8, 116, { fill: '#fbfcfe', stroke: C.line, rx: 6 });
          s.buckets[q].forEach(function (val, k) {
            g += h.rect(qx + 10, qy + 30 + k * 36, qw - 20, 30, { fill: C.blueBg, stroke: C.blue, rx: 5 });
            g += h.txt(qx + qw / 2, qy + 50 + k * 36, pad3(val), { size: 12.5, w: 600, family: 'Consolas,monospace' });
          });
        }
      } else {
        g += h.txt(W / 2, 330, '（本帧队列为空——收集阶段/初始）', { size: 12.5, fill: C.muted });
      }
      g += h.txt(W / 2, H - 14, '分配：按当前位数字进队 ｜ 收集：按 Q0→Q9 出队接回。队列先进先出 ⇒ 稳定', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
