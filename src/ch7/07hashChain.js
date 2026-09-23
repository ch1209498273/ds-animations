/* 动画：哈希表——链地址法（拉链法），教材 7.4，同余链表 + ASL 对照 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    '#define M 13',
    'int H(KeyType key) { return key % 13; }',
    'void InsertHash(HashTable &HT, KeyType key) {   // 链地址：冲突就挂链',
    '    addr = H(key);',
    '    // 头插法：新结点插到该桶链表最前面（同义词条数再大也不影响其他桶）',
    '    p = new Node(key);  p->next = HT[addr];  HT[addr] = p;',
    '}',
    '// 查找：先到桶，再沿链顺序比较（比较次数 = 在链中的位次）'
  ];

  var DEF = [19, 14, 23, 1, 68, 20, 84, 27, 55, 11];
  var M = 13;

  DSC.reg({
    id: 'hashChain', ch: 7, name: '哈希表：链地址法（拉链）',
    aim: '冲突了挂到同一条链表上：**链地址法不怕装填因子大**，删除也好办',
    note: '教材 7.4 散列表（同义词挂链、无堆积，与线性探测对照）',
    guide: [
      '同一批关键码换**拉链法**：每个桶是一条链表，冲突的元素直接挂上去——谁也不挤谁',
      '头插法：新结点总插在链头（注意 84 插入后：桶 6 变成 84→19）',
      '比较次数 = 元素在链中的位次；最后一帧的 ASL 与线性探测对照（本例 1.50 < 1.80）',
      '链地址优点：无堆积、删改方便、装填因子可 >1；代价：链表指针的空间与二次寻址'
    ],
    inputs: [
      { key: 'w', label: '关键码序列', type: 'text', value: '19,14,23,1,68,20,84,27,55,11' }
    ],
    run: function (v) {
      var keys = h.parse(v.w);
      if (keys.length < 3 || keys.length > 30) throw Error('请输入 3~30 个非负整数');
      for (var c0 = 0; c0 < keys.length; c0++) if (keys[c0] < 0 || keys[c0] > 999) throw Error('关键码请在 0~999 之间');
      var HT = [], cnt = {}, total = 0;
      for (var i = 0; i < M; i++) { HT.push([]); }
      var frames = [];

      function F(line, msg, extra, mk) {
        extra = extra || {};
        frames.push({
          line: Array.isArray(line) ? line : [line], msg: msg,
          panel: { 元素数: String(keys.length), 累计比较: total + ' 次' },
          snap: { HT: HT.map(function (c) { return c.slice(); }), cnt: JSON.parse(JSON.stringify(cnt)), addr: extra.addr, cur: extra.cur, pos: extra.pos, mark: mk }
        });
      }

      F(0, '13 个空桶（桶 = 同义词链表的头指针）。逐个头插。', {});
      keys.forEach(function (key) {
        var addr = key % M;
        F([2, 3, 4], key + '：H(' + key + ')=' + key + '%13=' + addr + (HT[addr].length ? '，桶不空（链上已有 ' + HT[addr].join('→') + '）→ 头插。' : '，桶为空 → 直接成为链头。'), { addr: addr, cur: key });
        HT[addr].unshift(key);
        cnt[key] = HT[addr].indexOf(key) + 1;
        F(5, key + ' 进入桶 ' + addr + ' 链头：链变为 ' + HT[addr].join('→') + '。（后续头插会改变位次，最终查找代价以末帧统计为准）', { addr: addr, cur: key }, 'ins' + key);
      });
      var total = 0;
      keys.forEach(function (k2) { total += HT[k2 % M].indexOf(k2) + 1; });
      F(0, '插入完成（按最终链位次统计：' + keys.map(function (k3) { return k3 + '→' + (HT[k3 % M].indexOf(k3) + 1); }).join('，') + '）。ASL(成功) = ' + total + ' ÷ ' + keys.length + ' = ' + (total / keys.length).toFixed(2) + '——对照线性探测的 1.8，拉链法没有"堆积"，冲突只发生在真正的同义词之间。', { mark: 'final' });
      return { code: CODE, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 560;
      var g = '';
      g += h.txt(W / 2, 32, '哈希表 H(key)=key%13 · 链地址法（头插）', { size: 17, w: 600 });
      var bw = Math.floor((W - 80) / 13);
      for (var i = 0; i < M; i++) {
        var x = 40 + i * bw;
        g += h.txt(x + bw / 2 - 6, 92, String(i), { size: 12, fill: C.muted, w: 700 });
        g += h.rect(x, 102, bw - 10, 44, { fill: (s.addr === i) ? C.blueBg : '#fbfcfe', stroke: (s.addr === i) ? C.blue : C.grey, sw: (s.addr === i) ? 2.4 : 1.4, rx: 6 });
        g += h.txt(x + bw / 2 - 6, 130, s.cur != null && s.HT[i][0] != null && s.addr === i ? String(s.cur) : (s.HT[i].length ? '•' : ''), { size: 14, w: 700, fill: C.blue });
        if (s.addr === i && s.cur != null) g += h.txt(x + bw / 2 - 6, 80, 'H(' + s.cur + ')', { size: 10.5, fill: C.blue, w: 700 });
        /* 链 */
        s.HT[i].forEach(function (val, k) {
          var y = 160 + k * 46;
          g += h.line(x + bw / 2 - 6, y - 14, x + bw / 2 - 6, y, { stroke: C.grey, sw: 1.6 });
          var isCur = s.cur === val && s.addr === i;
          g += h.rect(x + 6, y, bw - 22, 34, { fill: isCur ? C.greenBg : '#fff', stroke: isCur ? C.green : C.grey, sw: isCur ? 2.4 : 1.5, rx: 6 });
          g += h.txt(x + bw / 2 - 6, y + 23, String(val), { size: 13.5, w: 700 });
        });
      }
      g += h.txt(W / 2, 540, '桶头 → 同义词链表；比较次数 = 链上位次。无堆积、可删改，α 可以 > 1', { size: 12.5, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
