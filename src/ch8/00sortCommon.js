/* 排序章共享工具：数据预设、条形图渲染。被 ch8 各排序模块复用（非注册模块）。 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  DSC.su = {
    /* 颜色约定：N 普通 C 比较 S 交换/写入 D 已就位 P 基准/关键 */
    COLORS: {
      N: ['#ffffff', '#94a3b8'], C: ['#fef3c7', '#d97706'], S: ['#fee2e2', '#dc2626'],
      D: ['#dcfce7', '#16a34a'], P: ['#dbeafe', '#2563eb']
    },
    parse: function (s) {
      return String(s).split(/[,，\s]+/).filter(function (x) { return x !== ''; })
        .map(Number).filter(function (x) { return !isNaN(x); });
    },
    gen: function (kind, custom) {
      if (kind === 'textbook') return [49, 38, 65, 97, 76, 13, 27, 49];
      if (kind === 'ordered') return [12, 23, 34, 45, 56, 67, 78, 89];
      if (kind === 'reverse') return [89, 78, 67, 56, 45, 34, 23, 12];
      if (kind === 'nearly') return [12, 23, 34, 45, 67, 56, 78, 89];
      if (kind === 'custom') return this.parse(custom);
      var a = [], i;
      for (i = 0; i < 10; i++) a.push(10 + Math.floor(Math.random() * 90));
      return a;
    },
    getData: function (v) {
      var arr = this.gen(v.preset, v.w);
      if (arr.length < 2 || arr.length > 12) throw Error('请输入 2~12 个整数（用逗号分隔）');
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] < 0 || arr[i] > 999) throw Error('数值请在 0~999 之间');
        if (!isFinite(arr[i])) throw Error('存在非法数值');
      }
      return arr;
    },
    presetInputs: function (extra) {
      return [
        { key: 'preset', label: '数据', type: 'select', options: [
          ['textbook', '教材例题 49,38,65,97,76,13,27,49'],
          ['random', '随机 10 个（每次不同）'],
          ['ordered', '有序（最好情况）'],
          ['reverse', '逆序（最坏情况）'],
          ['nearly', '几乎有序'],
          ['custom', '自定义 ↓']
        ], value: 'textbook' },
        { key: 'w', label: '自定义序列', type: 'text', value: '49,38,65,97,76,13,27,49' }
      ].concat(extra || []);
    },
    /* 条形图：s={arr,colors,tags}，o={title,W,H,base,note} */
    bars: function (s, o) {
      o = o || {};
      var W = o.W || 980, H = o.H || 470, arr = s.arr, n = arr.length;
      var bw = Math.min(72, Math.floor((W - 150) / n) - 12), gap = 12;
      var x0 = (W - (n * bw + (n - 1) * gap)) / 2, base = o.base || 380;
      var maxv = Math.max.apply(null, arr) || 1;
      var g = '';
      if (o.title) g += h.txt(W / 2, 34, o.title, { size: 18, w: 600 });
      for (var i = 0; i < n; i++) {
        var bh = 40 + Math.round(arr[i] / maxv * (base - 120));
        var x = x0 + i * (bw + gap);
        var key = (s.colors && s.colors[i]) || 'N';
        var cm = this.COLORS[key] || this.COLORS.N;
        g += h.rect(x, base - bh, bw, bh, { fill: cm[0], stroke: cm[1], sw: key === 'N' ? 1.4 : 2.4, rx: 5 });
        g += h.txt(x + bw / 2, base - bh - 8, String(arr[i]), { size: 14.5, w: 700 });
        g += h.txt(x + bw / 2, base + 20, String(i + 1), { size: 11, fill: C.muted });
      }
      (s.tags || []).forEach(function (t) {
        var x = x0 + t.i * (bw + gap) + bw / 2;
        g += h.txt(x, base + 40, t.text, { size: 12.5, fill: t.color || C.blue, w: 600 });
      });
      if (o.note) g += h.txt(W / 2, H - 14, o.note, { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    },
    /* 图例 */
    legend: function (items) {
      var h = DSC.h, g = '', x = 30;
      items.forEach(function (it) {
        var cm = DSC.su.COLORS[it[1]];
        g += h.rect(x, 404, 16, 16, { fill: cm[0], stroke: cm[1], rx: 3 });
        g += h.txt(x + 22, 416, it[0], { size: 12, fill: DSC.C.muted, anchor: 'start' });
        x += 22 + it[0].length * 13 + 16;
      });
      return g;
    }
  };
})();
