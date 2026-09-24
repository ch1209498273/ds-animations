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
    '}',
    'int SearchHash(HashTable &HT, KeyType key) {   // 查找：沿同一条探测链',
    '    for (i = 0; i < M; ++i) { addr = (H(key) + i) % M;',
    '        if (HT[addr] == EMPTY) return NOTFOUND;   // 遇空格即判失败 ← 断链就在这行',
    '        if (HT[addr] == key)  return addr;        // 命中',
    '    }',
    '}',
    'void DeleteHash(HashTable &HT, KeyType key) {',
    '    i = SearchHash(HT, key);',
    '    if (i != NOTFOUND) HT[i] = DELETED;   // ★ 只能置删除标记，不能置 EMPTY',
    '}'
  ];

  var DEF = [19, 14, 23, 1, 68, 20, 84, 27, 55, 11];
  var M = 13;

  DSC.reg({
    id: 'hashLinear', ch: 7, name: '哈希表：线性探测再散列',
    aim: '冲突了就往后一格一格找：**线性探测会堆积**，装填因子一大 ASL 飙升',
    note: '教材 7.4 散列表（除留余数 + 开放定址，ASL 统计）',
    keywords: '散列 哈希 hash 除留余数 模 冲突 线性探测 再散列 开放定址 堆积 一次聚集 装填因子 ASL 处理冲突',
    guide: [
      '哈希思想：不比较、直接算地址——H(key)=key%13。理想 O(1)，但会"冲突"（两数同地址）',
      '冲突就用**线性探测**：地址被占就顺移一格 (h0+i)%M，直到找到空位（红色=冲突，蓝=落位）',
      '观察 84：H=6 被 19 占 → 7 被 20 占 → 8 落位，探测 3 次；27 更是探测 4 次——"堆积"现象',
      '查最后面板的 ASL：成功查找平均 1.8 次 = Σ每元素探测次数 ÷ n。装填因子越大，堆积越严重',
      '勾"错误演示"：删除时把格子直接腾空，看查找为什么会在探测链半路断掉——开放定址必须用删除标记'
    ],
    inputs: [
      { key: 'w', label: '关键码序列', type: 'text', value: '19,14,23,1,68,20,84,27,55,11' },
      { key: 'errDel', label: '错误演示：删除时把格子直接置空（断链）', type: 'checkbox', value: false }
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
          snap: { table: table.slice(), cnt: cnt.slice(), probe: extra.probe, addr: extra.addr, h0: extra.h0, ok: extra.ok, fail: extra.fail, cur: extra.cur, del: extra.del, found: extra.found, chain: extra.chain, chainTxt: extra.chainTxt, mark: mk }
        });
      }

      F(0, '空表 HT[0..12]，散列函数 H(key)=key%13。逐个插入。', {});
      var dup = {}, pos = {};
      keys.forEach(function (key) {
        if (dup[key]) { F(0, '关键码 ' + key + ' 重复，跳过。', {}); return; }
        dup[key] = 1;
        var h0 = key % M, probes = 0, addr = h0, ok = -1;
        F([3, 4], '插入 ' + key + '：H(' + key + ') = ' + key + ' % 13 = ' + h0 + '。', { cur: key, h0: h0, addr: h0 });
        for (var i = 0; i < M; i++) {
          addr = (h0 + i) % M;
          if (table[addr] === null) {
            probes = i + 1; total += probes;
            table[addr] = key; cnt[addr] = probes; ok = addr; pos[key] = addr;
            F([6, 7], (i === 0 ? 'HT[' + addr + '] 为空 → 直接放入（探测 1 次）。' : '第 ' + (i + 1) + ' 次探测：HT[' + addr + '] 为空 → 放入（' + key + ' 共探测 ' + probes + ' 次）。'), { cur: key, h0: h0, addr: addr, ok: addr }, 'ins' + key);
            break;
          }
          F(5, 'HT[' + addr + '] 已被 ' + table[addr] + ' 占用 → 冲突，线性探测下一格 (h0+' + (i + 1) + ') mod 13 = ' + ((h0 + i + 1) % M) + '。', { cur: key, h0: h0, addr: addr, probe: i + 1 });
        }
        if (ok < 0) F(8, '表满，插入失败。', { cur: key, fail: true });
      });
      var n = table.filter(function (x) { return x !== null; }).length;
      F(0, '插入完成。每个关键码下方的数字 = 查找它需要的比较（探测）次数。ASL(成功) = ' + total + ' ÷ ' + n + ' = ' + (total / n).toFixed(2) + '。装填因子 α = ' + n + '/' + M + ' ≈ ' + (n / M).toFixed(2) + '——α 越大冲突越多；线性探测易"堆积"（非同义词争抢同一批地址），后续帧可对比链地址法。', {}, 'final');
      if (v.errDel) {
        /* 断链不用编数据：只要有某个键 X 没落在自己的 H(X) 上，
           它 home 地址上那个键 Y 就是"删掉之后 X 一定查不到"的对象 */
        var X = -1, Y = -1, hx = -1, ax = -1, best = 0;
        for (var q = 0; q < keys.length; q++) {
          var kk = keys[q], hk = kk % M, ak = pos[kk];
          if (ak == null || ak === hk || table[hk] == null) continue;
          var len = ((ak - hk) % M + M) % M + 1;
          if (len > best) { best = len; X = kk; hx = hk; ax = ak; Y = table[hk]; }
        }
        if (X < 0) {
          F(0, '这批数据里每个关键码都正好落在自己的 H(key) 上（没有跨格探测），也就没有探测链可断。想看断链，换回教材序列 19,14,23,1,68,20,84,27,55,11 再勾一次。', {}, 'nofault');
        } else {
          var chain = [];
          for (var c1 = hx; ; c1 = (c1 + 1) % M) { chain.push(c1); if (c1 === ax) break; }
          /* 链太长就不逐格列出来，否则这一行会顶出画布宽度 */
          var chainTxt = X + ' 的探测链：' + (chain.length > 6 ? 'HT[' + hx + '] → … → HT[' + ax + ']（跨 ' + chain.length + ' 格）' :
            chain.map(function (i2) { return 'HT[' + i2 + ']'; }).join(' → '));
          F([10, 11], '先看 ' + X + ' 是怎么存进去的：H(' + X + ')=' + hx + '，可 HT[' + hx + '] 已被 ' + Y + ' 占，一路探到 HT[' + ax + '] 才放下，共探测 ' + cnt[ax] + ' 次。', { h0: hx, cur: X, chain: chain, chainTxt: chainTxt }, 'chain');
          table[hx] = null;
          F([16, 17, 18], '错误做法来了：删除 ' + Y + '，`HT[' + hx + '] = EMPTY`，格子直接腾干净。看起来干干净净，没有任何一处报错。', { del: hx, cur: Y, chainTxt: chainTxt }, 'baddel');
          F(12, '查 ' + X + ' 就出事：H(' + X + ')=' + hx + ' → HT[' + hx + '] 是空的 → 查找函数一遇 EMPTY 就 return NOTFOUND。✗ 判为不存在，可 ' + X + ' 明明还躺在 HT[' + ax + '] 里。', { addr: hx, cur: X, found: ax, chain: chain, chainTxt: chainTxt }, 'badmiss');
          F([10, 12], '为什么断：线性探测把 HT[' + hx + ']→HT[' + ax + '] 串成了一条链，' + X + ' 是靠"链头被占"才走到 HT[' + ax + '] 的。把链头挖掉，查找在第一步就以为整条链到头了。', { cur: X, found: ax, chain: chain, chainTxt: chainTxt }, 'why');
          table[hx] = 'D';
          F(18, '正确做法：删除只置 DELETED 标记（图上写 D）。它占着坑，查找不会提前止步，插入还能就地复用。', { del: hx, cur: Y, chain: chain, chainTxt: chainTxt }, 'markok');
          F([12, 13], '再查 ' + X + '：HT[' + hx + ']=D 不是 EMPTY → 继续探 → … → HT[' + ax + '] 命中，仍然 ' + cnt[ax] + ' 次。✓ 和删除前一模一样，链没断。', { cur: X, found: ax, chain: chain, chainTxt: chainTxt }, 'searchok');
          F(18, '★ 结论：开放定址哈希表删除只能用删除标记，不能真腾格子——这正是"堆积"的另一面：探测链把本来不相干的键绑在了一起。对照链地址法：结点上直接 free 就行，没有断链问题。', { cur: X, found: ax, chain: chain, chainTxt: chainTxt }, 'badfinal');
        }
      }
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470, cw = Math.floor((W - 80) / 13);
      var g = '';
      g += h.txt(W / 2, 32, '哈希表 H(key)=key%13 · 线性探测再散列', { size: 17, w: 600 });
      for (var i = 0; i < M; i++) {
        var x = 40 + i * cw;
        var f = '#fff', st = C.grey, sw = 1.5, dash = null, tc = C.ink;
        if (s.chain && s.chain.indexOf(i) >= 0) { f = C.amberBg; }
        if (s.addr === i && !s.ok) { f = C.redBg; st = C.red; sw = 2.4; }
        if (s.ok === i) { f = C.blueBg; st = C.blue; sw = 2.6; }
        if (s.found === i) { st = C.green; sw = 2.6; }
        if (s.table[i] === 'D') { st = C.amber; sw = 2.2; dash = '5 4'; tc = C.amber; }
        if (s.del === i) { st = C.amber; sw = 2.6; dash = '5 4'; }
        g += h.rect(x, 120, cw - 4, 52, { fill: f, stroke: st, sw: sw, rx: 6, dash: dash });
        g += h.txt(x + (cw - 4) / 2, 152, s.table[i] == null ? '' : String(s.table[i]), { size: 16, w: 700, fill: tc });
        g += h.txt(x + (cw - 4) / 2, 192, String(i), { size: 11, fill: C.muted });
        if (s.cnt[i]) g += h.txt(x + (cw - 4) / 2, 214, '探' + s.cnt[i], { size: 10.5, fill: C.green, w: 600 });
        if (s.h0 === i && s.cur != null) g += h.txt(x + (cw - 4) / 2, 108, 'H(' + s.cur + ')=' + i, { size: 10.5, fill: C.blue, w: 700 });
        if (s.ok === i && s.cur != null) g += h.txt(x + (cw - 4) / 2, 98, s.cur + ' 落位', { size: 11, fill: C.blue, w: 700 });
      }
      g += h.txt(W / 2, 260, '红色=冲突探测中 ｜ 蓝=插入落位 ｜ 绿=查找命中 ｜ 橙虚线=删除标记 D ｜ 格下数字=查找比较次数', { size: 12.5, fill: C.muted });
      g += h.txt(W / 2, 300, '探查序列：(h0) → (h0+1) mod M → (h0+2) mod M → …（"线性"：一格一格顺移）', { size: 13, fill: C.ink });
      g += h.txt(W / 2, 340, '堆积（clustering）：非同义词抢占地址链，使冲突概率滚雪球——线性探测的主要缺陷', { size: 12.5, fill: C.muted });
      if (s.chainTxt) g += h.txt(W / 2, 382, s.chainTxt, { size: 13.5, w: 600, fill: C.amber });
      return h.svg(W, H, g);
    }
  });
})();
