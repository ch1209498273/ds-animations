/* 动画：哈希表——线性探测再散列（开放定址），教材 7.4，例题 H(key)=key%13，{19,14,23,1,68,20,84,27,55,11} */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    '#define M 13                     // 表长 = 哈希地址数 0..12',
    'int H(KeyType key) { return key % 13; }   // 除留余数法',
    'int InsertHash(HashTable &HT, KeyType key) {',
    '    h0 = H(key);                          // 计算散列地址',
    '    for (i = 0; i < M; ++i) {',
    '        addr = (h0 + i) % M;              // 线性探测：h0, h0+1, …（取模回绕）',
    '        if (HT[addr] == EMPTY) { HT[addr] = key; return i+1; }  // 空位即插入',
    '    }',
    '    return ERROR;                         // 表满',
    '}'
  ];

  var DEF = [19, 14, 23, 1, 68, 20, 84, 27, 55, 11];
  var M = 13;

  DSC.reg({
    id: 'hashLinear', ch: 7, name: '哈希表：线性探测再散列',
    note: '教材 7.4 散列表（除留余数 + 开放定址，ASL 统计）',
    guide: [
      '哈希思想：不比较、直接算地址——H(key)=key%13。理想 O(1)，但会"冲突"（两数同地址）',
      '冲突就用**线性探测**：地址被占就顺移一格 (h0+i)%M，直到找到空位（红色=冲突，蓝=落位）',
      '观察 84：H=6 被 19 占 → 7 被 20 占 → 8 落位，探测 3 次；27 更是探测 4 次——"堆积"现象',
      '查最后面板的 ASL：成功查找平均 1.8 次 = Σ每元素探测次数 ÷ n。装填因子越大，堆积越严重'
    ],
    inputs: [
      { key: 'w', label: '关键码序列', type: 'text', value: '19,14,23,1,68,20,84,27,55,11' }
    ],
    run: function (v) {
      var keys = h.parse(v.w);
      if (keys.length < 3 || keys.length > M) throw Error('请输入 3~' + M + ' 个非负整数（表长 M=13）');
      for (var c0 = 0; c0 < keys.length; c0++) if (keys[c0] < 0 || keys[c0] > 999) throw Error('关键码请在 0~999 之间');
      var table = [], cnt = [];
      for (var i = 0; i < M; i++) { table.push(null); cnt.push(0); }
      var frames = [], total = 0;

      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 已存: table.filter(function (x) { return x !== null; }).length + ' / ' + M, 累计探测: total + ' 次' },
          snap: { table: table.slice(), cnt: cnt.slice(), probe: extra.probe, addr: extra.addr, h0: extra.h0, ok: extra.ok, fail: extra.fail, cur: extra.cur, mark: mk }
        });
      }

      F(0, '空表 HT[0..12]，散列函数 H(key)=key%13。逐个插入。', {});
      var dup = {};
      keys.forEach(function (key) {
        if (dup[key]) { F(0, '关键码 ' + key + ' 重复，跳过。', {}); return; }
        dup[key] = 1;
        var h0 = key % M, probes = 0, addr = h0, ok = -1;
        F([3, 4], '插入 ' + key + '：H(' + key + ') = ' + key + ' % 13 = ' + h0 + '。', { cur: key, h0: h0, addr: h0 });
        for (var i = 0; i < M; i++) {
          addr = (h0 + i) % M;
          if (table[addr] === null) {
            probes = i + 1; total += probes;
            table[addr] = key; cnt[addr] = probes; ok = addr;
            F([6, 7], (i === 0 ? 'HT[' + addr + '] 为空 → 直接放入（探测 1 次）。' : '第 ' + (i + 1) + ' 次探测：HT[' + addr + '] 为空 → 放入（' + key + ' 共探测 ' + probes + ' 次）。'), { cur: key, h0: h0, addr: addr, ok: addr }, 'ins' + key);
            break;
          }
          F(5, 'HT[' + addr + '] 已被 ' + table[addr] + ' 占用 → 冲突，线性探测下一格 (h0+' + (i + 1) + ') mod 13 = ' + ((h0 + i + 1) % M) + '。', { cur: key, h0: h0, addr: addr, probe: i + 1 });
        }
        if (ok < 0) F(8, '表满，插入失败。', { cur: key, fail: true });
      });
      var n = table.filter(function (x) { return x !== null; }).length;
      F(0, '插入完成。每个关键码下方的数字 = 查找它需要的比较（探测）次数。ASL(成功) = ' + total + ' ÷ ' + n + ' = ' + (total / n).toFixed(2) + '。装填因子 α = ' + n + '/' + M + ' ≈ ' + (n / M).toFixed(2) + '——α 越大冲突越多；线性探测易"堆积"（非同义词争抢同一批地址），后续帧可对比链地址法。', { mark: 'final' });
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470, cw = Math.floor((W - 80) / 13);
      var g = '';
      g += h.txt(W / 2, 32, '哈希表 H(key)=key%13 · 线性探测再散列', { size: 17, w: 600 });
      for (var i = 0; i < M; i++) {
        var x = 40 + i * cw;
        var f = '#fff', st = C.grey, sw = 1.5;
        if (s.addr === i && !s.ok) { f = C.redBg; st = C.red; sw = 2.4; }
        if (s.ok === i) { f = C.blueBg; st = C.blue; sw = 2.6; }
        g += h.rect(x, 120, cw - 4, 52, { fill: f, stroke: st, sw: sw, rx: 6 });
        g += h.txt(x + (cw - 4) / 2, 152, s.table[i] == null ? '' : String(s.table[i]), { size: 16, w: 700 });
        g += h.txt(x + (cw - 4) / 2, 192, String(i), { size: 11, fill: C.muted });
        if (s.cnt[i]) g += h.txt(x + (cw - 4) / 2, 214, '探' + s.cnt[i], { size: 10.5, fill: C.green, w: 600 });
        if (s.h0 === i && s.cur != null) g += h.txt(x + (cw - 4) / 2, 108, 'H(' + s.cur + ')=' + i, { size: 10.5, fill: C.blue, w: 700 });
        if (s.ok === i && s.cur != null) g += h.txt(x + (cw - 4) / 2, 98, s.cur + ' 落位', { size: 11, fill: C.blue, w: 700 });
      }
      g += h.txt(W / 2, 260, '红色=冲突探测中 ｜ 蓝=插入落位 ｜ 格下数字=该元素的查找比较次数', { size: 12.5, fill: C.muted });
      g += h.txt(W / 2, 300, '探查序列：(h0) → (h0+1) mod M → (h0+2) mod M → …（"线性"：一格一格顺移）', { size: 13, fill: C.ink });
      g += h.txt(W / 2, 340, '堆积（clustering）：非同义词抢占地址链，使冲突概率滚雪球——线性探测的主要缺陷', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
