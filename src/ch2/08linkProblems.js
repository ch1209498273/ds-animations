/* 动画：链表三道经典实验题——就地逆置 / 约瑟夫环 / 两链表找公共结点（教材 2.5 延伸） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var RCODE = [
    'LNode* Reverse(LinkList L) {          // 头插法逆置：不新建结点，只改 next',
    '    p = L->next;  L->next = NULL;     // p 指向原首结点，L 先接一张空表',
    '    while (p) {',
    '        q = p->next;                  // 关键：先把后继记下来',
    '        p->next = L->next;            // p 的 next 指向当前已逆置表的首结点',
    '        L->next = p;                  // p 成为新的首结点',
    '        p = q;                        // 处理下一个原结点',
    '    }',
    '    return L;',
    '}'
  ];
  var JCODE = [
    'LNode* Josephus(int n, int k) {        // 循环链表解约瑟夫环',
    '    建 n 个结点的循环链表;  rear->next = head;   // 首尾相接',
    '    p = head;  pre = p;',
    '    while (p->next != p) {             // 圈里不止一个人',
    '        for (j = 1; j < k; j++) { pre = p;  p = p->next; }  // 报 k-1 次数',
    '        printf(p->data);  pre->next = p->next;   // p 出圈：把它摘掉',
    '        p = p->next;                   // 从下一个人重新开始报数',
    '    }',
    '    return p;                          // 最后一个幸存者',
    '}'
  ];
  var ICODE = [
    'LNode* FirstCommonNode(LNode *a, LNode *b) {',
    '    la = Length(a);  lb = Length(b);          // 各自从头数到尾',
    '    if (la > lb)  for (i = 0; i < la - lb; i++)  a = a->next;  // 长表先走差值',
    '    else          for (i = 0; i < lb - la; i++)  b = b->next;',
    '    while (a && a != b) { a = a->next;  b = b->next; }  // 然后一步一同步',
    '    return a;            // 相遇点即第一个公共结点；NULL 表示不相交',
    '}'
  ];

  function ints(s) { return String(s).split(/[,，\s]+/).filter(function (x) { return x.length; }).map(Number); }

  DSC.reg({
    id: 'linkProblems', ch: 2, name: '链表三道经典题：逆置 / 约瑟夫环 / 找公共结点',
    note: '教材 2.5 延伸实验题（只改指针、循环链表、长度差对齐）',
    guide: [
      '这三题是链表实验报告的常客，考的都是同一件事：**会不会动手改 next，而不是想着"数组下标"**',
      '就地逆置用头插法：每轮四步 `q = p->next; p->next = L->next; L->next = p; p = q`。忘记先记 q 是最高频的错误——一旦 `p->next` 被改掉，后面整条链就断了',
      '约瑟夫环用**循环链表**最自然：报数就是 `p = p->next` 走圈，出圈就是 `pre->next = p->next` 删结点。删除时要记住 `pre`， singly 链表没法回头',
      '两链表找公共结点：相交的定义是**从某结点起后面全重合**。先各自数出长度 la、lb，长表先走 |la−lb| 步补齐，然后同步后移，第一个相遇点就是答案——O(la+lb)、O(1) 空间'
    ],
    inputs: [
      {
        key: 'scene', label: '题目', type: 'select', options: [
          ['reverse', '① 单链表就地逆置（头插法）'],
          ['josephus', '② 约瑟夫环（循环链表报数出圈）'],
          ['intersect', '③ 两单链表找第一个公共结点']
        ], value: 'reverse'
      },
      { key: 'data', label: '① 逆置：链表数据（≤8 个）', type: 'text', value: '25,12,47,89,36' },
      { key: 'n', label: '② 约瑟夫：人数 n', type: 'number', value: 7, min: 3, max: 10 },
      { key: 'k', label: '② 约瑟夫：报到 k 出圈', type: 'number', value: 3, min: 2, max: 6 },
      { key: 'segs', label: '③ 相交：A独有 | B独有 | 公共段', type: 'text', value: '7,2|5|8,3,6' }
    ],

    run: function (v) {
      var scene = v.scene, frames = [];
      function F(code, line, msg, panel, snap) {
        /* 帧的 snap 必须是当时的快照：built/out 这类数组是原地改的，不复制会让所有帧共用终态 */
        var cp = Object.assign({}, snap);
        Object.keys(cp).forEach(function (k) { if (Array.isArray(cp[k])) cp[k] = cp[k].slice(); });
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: Object.assign({ scene: scene, done: false }, cp) });
      }

      /* ---------- ① 就地逆置 ---------- */
      if (scene === 'reverse') {
        var arr = ints(v.data);
        if (arr.length < 2 || arr.length > 8) throw Error('请输入 2~8 个整数');
        var built = [], rest = arr.slice(), step = 0;
        F(RCODE, [0, 1], '原链表 L → ' + arr.join(' → ') + ' → ∧。逆置的目标是让 L 接上 ' +
          arr.slice().reverse().join(' → ') + '。要求**就地**：不许新建结点，只改 next。',
          { 已逆置: '（空）', 待处理: rest.length + ' 个' }, { built: built, rest: rest, orig: arr });
        F(RCODE, [1], '第一步就把 `L->next = NULL`：先让 L 表示一张**空表**，下面用头插法一个个往上摞。' +
          '`p` 停在原来的首结点 ' + arr[0] + ' 上。',
          { 已逆置: '（空）', 待处理: rest.length + ' 个' }, { built: built, rest: rest, orig: arr, p: arr[0] });
        while (rest.length) {
          var p = rest[0], q = rest.length > 1 ? rest[1] : null;
          F(RCODE, [2, 3], '第 ' + (++step) + ' 轮：`while (p)` 成立（p = ' + p + '）。' +
            '先做最容易忘的一步——`q = p->next` 把后继 ' + (q == null ? 'NULL' : q) + ' 记下来。' +
            '不记它的话，下一行就要把 `p->next` 改掉，后面整条链会一起断掉。',
            { 轮次: step + ' / ' + arr.length, p: String(p), q: q == null ? 'NULL' : String(q) },
            { built: built, rest: rest, orig: arr, p: p, q: q });
          built.unshift(p); rest = rest.slice(1);
          F(RCODE, [4, 5], '`p->next = L->next`（' + p + ' 指向现在表头的 ' + (built.length > 1 ? built[1] : '∧') + '），' +
            '再 `L->next = p`（' + p + ' 成为新首结点）。已逆置部分变成 ' + built.join(' → ') + '。',
            { 轮次: step + ' / ' + arr.length, 已逆置: built.join('→'), 待处理: rest.length + ' 个' },
            { built: built, rest: rest, orig: arr, p: p, q: q, justMoved: p });
          rest = rest.slice(0);
          F(RCODE, [6], '`p = q`' + (q == null ? ' → p 走到 NULL，循环该停了。' : ' → p 移到 ' + q + '，处理下一个。'),
            { 轮次: step + ' / ' + arr.length, p: q == null ? 'NULL' : String(q) },
            { built: built, rest: rest, orig: arr, p: q, q: null });
        }
        F(RCODE, [7, 8], '★ 逆置完成：L → ' + built.join(' → ') + ' → ∧。' +
          '整个过程只动了 ' + arr.length + ' 次「摘结点」，没有新建也没有释放——这就是"就地"，空间 O(1)，时间 O(n)。',
          { 结果: built.join('→'), 空间: 'O(1)（就地）', 时间: 'O(n)' },
          { built: built, rest: [], orig: arr, p: null, q: null, done: true });
        return { code: RCODE, frames: frames };
      }

      /* ---------- ② 约瑟夫环 ---------- */
      if (scene === 'josephus') {
        var nn = Math.round(+v.n), kk = Math.round(+v.k);
        if (!(nn >= 3 && nn <= 10)) throw Error('人数 n 请在 3~10 之间');
        if (!(kk >= 2 && kk <= 6)) throw Error('报数 k 请在 2~6 之间');
        var ppl = []; for (var i = 0; i < nn; i++) ppl.push(i + 1);
        var alive = ppl.slice(), out = [], ci = 0;
        F(JCODE, [0, 1], nn + ' 个人围成一圈，编号 1~' + nn + '，报到 ' + kk + ' 的出圈。' +
          '用**循环链表**存：最后一个结点的 next 指回第一个，所以"转圈"就是不停地 `p = p->next`。',
          { 圈里剩下: nn + ' 人', 出圈顺序: '—' },
          { people: ppl, alive: alive.slice(), out: out, cur: 0, pre: nn - 1, count: 0 });
        F(JCODE, [2], '`p` 从 1 号开始报 1。单链表删结点要动的是**前驱**的 next，所以同时带着 `pre` 指在 ' +
          nn + ' 号（1 号的前驱）上。',
          { 圈里剩下: nn + ' 人', 'p': '1 号' },
          { people: ppl, alive: alive.slice(), out: out, cur: 0, pre: nn - 1, count: 1 });
        var round = 0;
        while (alive.length > 1) {
          round++;
          var c = 1;
          while (c < kk && alive.length > 1) {
            c++;
            /* 顺着圈走到下一个还在圈里的人 */
            var steps = 0;
            while (steps < nn) {
              ci = (ci + 1) % nn; steps++;
              if (alive.indexOf(ppl[ci]) >= 0) break;
            }
            F(JCODE, [4], '第 ' + round + ' 轮：报数 ' + c + ' → `pre = p; p = p->next`，p 走到 ' + ppl[ci] + ' 号。',
              { 轮次: round + ' / ' + (nn - 1), 当前报数: c + ' / ' + kk, p: ppl[ci] + ' 号', 圈里剩下: alive.length + ' 人' },
              { people: ppl, alive: alive.slice(), out: out, cur: ci, pre: null, count: c });
          }
          var victim = ppl[ci];
          var preIdx = ci;
          var back = 0;
          while (back < nn) { preIdx = (preIdx + nn - 1) % nn; back++; if (alive.indexOf(ppl[preIdx]) >= 0) break; }
          alive.splice(alive.indexOf(victim), 1);
          out.push(victim);
          F(JCODE, [5], 'p 报到 ' + kk + ' → ' + victim + ' 号出圈。删除动作是 `pre->next = p->next`' +
            '（让 ' + ppl[preIdx] + ' 号直接跳过 ' + victim + ' 号），结点本身可以释放了。',
            { 轮次: round + ' / ' + (nn - 1), 出圈: victim + ' 号', 出圈顺序: out.join('→'), 圈里剩下: alive.length + ' 人' },
            { people: ppl, alive: alive.slice(), out: out, cur: ci, pre: preIdx, count: kk, justOut: victim });
          if (alive.length) {
            var nx = ci, st = 0;
            while (st < nn) { nx = (nx + 1) % nn; st++; if (alive.indexOf(ppl[nx]) >= 0) break; }
            ci = nx;
            F(JCODE, [6], '从下一个人重新报 1：`p = p->next` → p 现在 ' + ppl[ci] + ' 号。圈里还剩 ' + alive.length + ' 人。',
              { 轮次: round + ' / ' + (nn - 1), p: ppl[ci] + ' 号', 圈里剩下: alive.length + ' 人' },
              { people: ppl, alive: alive.slice(), out: out, cur: ci, pre: null, count: 1 });
          }
        }
        F(JCODE, [7, 8], '★ 圈里只剩 ' + alive[0] + ' 号（`p->next == p`，自己就是自己的后继）→ 幸存者 = **' +
          alive[0] + '**。出圈顺序：' + out.join(' → ') + ' → ' + alive[0] + '。',
          { 出圈顺序: out.join('→'), 幸存者: String(alive[0]) },
          { people: ppl, alive: alive.slice(), out: out, cur: ppl.indexOf(alive[0]), pre: null, count: 0, done: true });
        frames.forEach(function (f) { f.snap.k = kk; f.snap.total = nn; });
        return { code: JCODE, frames: frames };
      }

      /* ---------- ③ 找公共结点 ---------- */
      var segs = String(v.segs).split(/[|｜]/);
      if (segs.length !== 3) throw Error('请用两条竖线分成三段：A独有 | B独有 | 公共段');
      var aown = ints(segs[0]), bown = ints(segs[1]), shr = ints(segs[2]);
      if (aown.length > 6 || bown.length > 6 || shr.length > 6) throw Error('每段最多 6 个结点');
      if (!aown.length && !bown.length) throw Error('至少一条链要有自己的独有段，否则两条链完全重合');
      var la = aown.length + shr.length, lb = bown.length + shr.length;
      /* 结点身份：aTrack/bTrack 里存 "A:0" / "S:2" 这样的唯一标识 */
      var aTrack = aown.map(function (x, i) { return { id: 'A' + i, val: x }; })
        .concat(shr.map(function (x, i) { return { id: 'S' + i, val: x }; }));
      var bTrack = bown.map(function (x, i) { return { id: 'B' + i, val: x }; })
        .concat(shr.map(function (x, i) { return { id: 'S' + i, val: x }; }));
      var pa = 0, pb = 0;
      function snap(extra) {
        return Object.assign({ aown: aown, bown: bown, shr: shr, pa: pa, pb: pb, la: la, lb: lb }, extra);
      }
      F(ICODE, [0], '两条单链表在 ' + (shr.length ? '值为 ' + shr[0] + ' 的结点之后完全重合' : '这里其实不相交') +
        '。"相交"的定义是**从某个结点起后面全部重合**（同一个结点，不是同一个值），所以公共段只有一份存储。',
        {'A 长': la + '', 'B 长': lb + '' }, snap({ phase: 'intro' }));
      F(ICODE, [1], '数长度：A 有 ' + la + ' 个结点，B 有 ' + lb + ' 个。注意公共段两边都要算进来——' +
        '所以 la、lb 都包含那 ' + shr.length + ' 个共享结点。',
        {'A 长': la + '', 'B 长': lb + '', 差值: Math.abs(la - lb) + '' }, snap({ phase: 'len' }));
      var diff = Math.abs(la - lb);
      if (diff) {
        var longer = la > lb ? 'A' : 'B';
        for (var d = 0; d < diff; d++) {
          if (la > lb) pa++; else pb++;
          F(ICODE, [la > lb ? 2 : 3], '长表是 ' + longer + '，先走 ' + diff + ' 步补齐：第 ' + (d + 1) + ' 步 → ' +
            longer + ' 的指针现在停在 ' + (la > lb ? aTrack[pa].val : bTrack[pb].val) + '。' +
            '这样两个指针到各自链尾的**剩余步数就一样了**。',
            { 补齐进度: (d + 1) + ' / ' + diff, 'a': aTrack[pa].val + '', 'b': bTrack[pb].val + '' },
            snap({ phase: 'align' }));
        }
      } else {
        F(ICODE, [2, 3], '两条链一样长 → 谁都不用先走，直接进入同步阶段。',
          { 差值: '0' }, snap({ phase: 'align' }));
      }
      var meet = -1;
      for (var s = 0; s <= Math.max(la, lb); s++) {
        if (pa >= la || pb >= lb) { meet = -2; break; }
        if (aTrack[pa].id === bTrack[pb].id) { meet = pa; break; }
        F(ICODE, [4], '同步走：a 在 ' + aTrack[pa].val + '、b 在 ' + bTrack[pb].val + '，`a != b`（不是同一个结点）' +
          '→ 两个指针各后移一步。',
          { 步数: (s + 1) + '', 'a': aTrack[pa].val + '', 'b': bTrack[pb].val + '' }, snap({ phase: 'walk' }));
        pa++; pb++;
      }
      if (meet >= 0) {
        F(ICODE, [4, 5], '★ 相遇：a 和 b 指到了**同一个结点**（值为 ' + aTrack[pa].val + '，公共段第 ' + (pa - aown.length + 1) +
          ' 个）。因为补齐之后两者离链尾同样远，只要结点相同后面就必然全同，所以这就是第一个公共结点。',
          { 结果: '公共结点 ' + aTrack[pa].val, 位置: '第 ' + (pa + 1) + ' 个结点' }, snap({ phase: 'meet', done: true }));
        F(ICODE, [5], '★ 复杂度：数长度 O(la+lb)，走链 O(la+lb)，总共 O(la+lb) 时间、**O(1) 空间**。' +
          '另一条思路是用哈希存 A 的结点地址再遍历 B 查第一个命中的，同样 O(la+lb) 但要 O(la) 空间——面试要能说清差别。',
          { 结果: '公共结点 ' + aTrack[pa].val, 时间: 'O(la+lb)', 空间: 'O(1)' }, snap({ phase: 'cplx', done: true }));
      } else {
        F(ICODE, [5], '★ 两个指针一起走到了 NULL 也没碰上 → 两条链**不相交**，返回 NULL。' +
          '（把公共段长度改成 0 或者换掉公共段的值，就会走到这个分支。）',
          { 结果: 'NULL（不相交）' }, snap({ phase: 'none', done: true }));
      }
      return { code: ICODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 500, g = '';
      if (s.scene === 'reverse') {
        g += h.txt(W / 2, 28, '就地逆置（头插法）：只改 next，一个结点都不新建', { size: 17, w: 600 });
        var bw = 62, gap = 40, x0 = 120, y1 = 120, y2 = 300;
        function chain(list, y, label, hotVal, qVal, doneVal, headTxt, headCol) {
          g += h.rect(40, y, 56, 44, { fill: headCol === C.red ? '#fff8f4' : '#eef2ff', stroke: headCol, sw: 1.8, rx: 6 });
          g += h.txt(68, y + 27, headTxt, { size: 15, w: 700, fill: headCol });
          g += h.txt(68, y + 62, label, { size: 10.5, fill: C.muted });
          var x = x0;
          if (!list.length) {
            g += h.arrow(98, y + 22, x - 8, y + 22, { stroke: C.grey, sw: 2, head: 8 });
            g += h.txt(x + 4, y + 28, '∧（空表）', { size: 13, fill: C.muted, anchor: 'start' });
            return;
          }
          list.forEach(function (val, i) {
            var hot = val === hotVal, dn = doneVal && doneVal.indexOf(val) >= 0;
            var fill = hot ? C.amberBg : dn ? C.greenBg : '#fff';
            var st = hot ? C.amber : dn ? C.green : C.grey;
            g += h.arrow(x - 8 + 8 - 8, y + 22, x - 6, y + 22, { stroke: C.grey, sw: 2, head: 8 });
            g += h.rect(x, y, bw, 44, { fill: fill, stroke: st, sw: hot || dn ? 2.6 : 1.5, rx: 6 });
            g += h.txt(x + bw / 2, y + 27, String(val), { size: 15, w: 700 });
            if (val === qVal) g += h.txt(x + bw / 2, y - 14, 'q', { size: 14, fill: C.red, w: 700 });
            if (val === hotVal) g += h.txt(x + bw / 2, y + 62, 'p', { size: 13, fill: C.red, w: 700 });
            x += bw + gap;
          });
          g += h.arrow(x - gap + 2, y + 22, x - gap + 24, y + 22, { stroke: C.grey, sw: 2, head: 8 });
          g += h.txt(x - gap + 34, y + 28, '∧', { size: 16, fill: C.muted, w: 700, anchor: 'start' });
        }
        chain(s.built, y1, '逆置结果', s.p, s.q, s.built, 'L', C.blue);
        g += h.txt(W / 2, y1 + 96, '↑ 已逆置部分（' + (s.built.length ? s.built.join(' → ') : '还是空表') + '）',
          { size: 12.5, fill: C.muted });
        chain(s.rest, y2, '待处理（p 从这里摘）', s.p, s.q, null, 'p', C.red);
        g += h.txt(W / 2, y2 + 96, '↓ 剩下的原链表：p 每摘一个结点，就摞到上面那张表的表头', { size: 12.5, fill: C.muted });
        g += h.txt(W / 2, 452, '四步口诀：q 记后继 → p 插表头 → L 指 p → p 变 q', { size: 13, fill: C.ink, w: 600 });
        g += h.txt(W / 2, H - 14, s.done ? '★ 完成：' + s.built.join(' → ') + '　（时间 O(n)、空间 O(1)）'
          : '橙=p 正在摘的结点　绿=已经接到逆置表上　红 q=提前记下的后继', { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
        return h.svg(W, H, g);
      }

      if (s.scene === 'josephus') {
        g += h.txt(W / 2, 28, '约瑟夫环：' + s.people.length + ' 人围成圈，报到 ' +
          (s.k || 3) + ' 出圈（循环链表）', { size: 17, w: 600 });
        var cx = 490, cy = 246, R = Math.max(118, 14 * s.people.length);
        var nn = s.people.length;
        s.people.forEach(function (val, i) {
          var a = -Math.PI / 2 + i * 2 * Math.PI / nn;
          var px = cx + R * Math.cos(a), py = cy + R * Math.sin(a);
          var alive = s.alive.indexOf(val) >= 0, isOut = !alive;
          var isP = alive && s.cur === i;
          var isPre = s.pre === i;
          var fill = isP ? C.amberBg : isOut ? '#f1f3f6' : '#fff';
          var st = isP ? C.amber : isOut ? '#c9ced6' : C.grey;
          g += h.rect(px - 24, py - 16, 48, 32, { fill: fill, stroke: st, sw: isP ? 2.8 : 1.5, rx: 6 });
          g += h.txt(px, py + 5, String(val), { size: 14, w: 700, fill: isOut ? '#aeb4bd' : C.ink });
          if (isP) g += h.txt(px, py - 24, 'p', { size: 13, fill: C.red, w: 700 });
          if (isPre) g += h.txt(px, py + 32, 'pre', { size: 11, fill: C.blue, w: 600 });
          /* 指向下一个还在圈里的人 */
          if (alive) {
            var nx = -1, st2 = 0;
            while (st2 < nn) { var q = (i + st2 + 1) % nn; st2++; if (s.alive.indexOf(s.people[q]) >= 0) { nx = q; break; } }
            if (nx >= 0) {
              var b = -Math.PI / 2 + nx * 2 * Math.PI / nn;
              var bx = cx + R * Math.cos(b), by = cy + R * Math.sin(b);
              var dx = bx - px, dy = by - py, dl = Math.sqrt(dx * dx + dy * dy) || 1;
              g += h.arrow(px + dx / dl * 28, py + dy / dl * 22, bx - dx / dl * 28, by - dy / dl * 22,
                { stroke: isOut ? '#d8dce1' : '#c3ccd8', sw: 1.4, head: 6 });
            }
          }
        });
        g += h.txt(cx, cy + 4, '圈里还剩 ' + s.alive.length + ' 人', { size: 15, w: 700, fill: C.ink });
        g += h.txt(cx, cy + 26, s.count ? '当前报数 ' + s.count : (s.done ? '只剩自己' : ''), { size: 12.5, fill: C.muted });
        g += h.txt(W / 2, 424, '出圈顺序：' + (s.out.length ? s.out.join(' → ') : '—') +
          (s.done ? ' → ' + s.alive[0] + '（幸存）' : ''), { size: 13.5, w: 600, fill: s.done ? C.green : C.ink });
        g += h.txt(W / 2, 452, '删除动作只有一句 pre->next = p->next ——所以必须一路带着前驱 pre',
          { size: 12.5, fill: C.muted });
        g += h.txt(W / 2, H - 14, '橙=p 当前所指　蓝 pre=它的前驱　灰底=已出圈', { size: 12, fill: C.muted });
        return h.svg(W, H, g);
      }

      /* intersect */
      g += h.txt(W / 2, 28, '两单链表找第一个公共结点：先补齐长度差，再同步走', { size: 17, w: 600 });
      var bw2 = 58, gp = 34, ax0 = 150, ay = 110, by = 190, sy = 320;
      function box(x, y, val, tag, col) {
        g += h.rect(x, y, bw2, 40, { fill: col ? col.bg : '#fff', stroke: col ? col.st : C.grey, sw: col ? 2.6 : 1.5, rx: 6 });
        g += h.txt(x + bw2 / 2, y + 25, String(val), { size: 14.5, w: 700 });
        if (tag) g += h.txt(x + bw2 / 2, y - 10, tag.t, { size: 13, fill: tag.c, w: 700 });
      }
      g += h.txt(ax0 - 14, ay + 24, 'A:', { size: 14, w: 700, anchor: 'end' });
      g += h.txt(ax0 - 14, by + 24, 'B:', { size: 14, w: 700, anchor: 'end' });
      s.aown.forEach(function (val, i) {
        var x = ax0 + i * (bw2 + gp);
        box(x, ay, val, s.pa === i ? { t: 'a', c: C.red } : null, s.pa === i ? { bg: C.amberBg, st: C.amber } : null);
        g += h.arrow(x + bw2 + 2, ay + 20, x + bw2 + gp - 4, ay + 20, { stroke: C.grey, sw: 1.6, head: 6 });
      });
      s.bown.forEach(function (val, i) {
        var x = ax0 + i * (bw2 + gp);
        box(x, by, val, s.pb === i ? { t: 'b', c: C.blue } : null, s.pb === i ? { bg: '#eaf1ff', st: C.blue } : null);
        g += h.arrow(x + bw2 + 2, by + 20, x + bw2 + gp - 4, by + 20, { stroke: C.grey, sw: 1.6, head: 6 });
      });
      var lastAx = ax0 + s.aown.length * (bw2 + gp) - gp;
      var lastBx = ax0 + s.bown.length * (bw2 + gp) - gp;
      var shX = Math.max(lastAx, lastBx) + 60;
      s.shr.forEach(function (val, i) {
        var x = shX + i * (bw2 + gp);
        var gi = s.aown.length + i, gj = s.bown.length + i;
        var tag = s.pa === gi && s.pb === gj ? 'a b' : s.pa === gi ? 'a' : s.pb === gj ? 'b' : null;
        box(x, sy, val, tag ? { t: tag, c: C.green } : null, tag ? { bg: C.greenBg, st: C.green } : null);
        if (i < s.shr.length - 1)
          g += h.arrow(x + bw2 + 2, sy + 20, x + bw2 + gp - 4, sy + 20, { stroke: C.grey, sw: 1.6, head: 6 });
      });
      if (s.shr.length) {
        g += h.arrow(lastAx + bw2 + 4, ay + 20, shX - 6, sy + 12, { stroke: C.green, sw: 2, head: 7 });
        g += h.arrow(lastBx + bw2 + 4, by + 20, shX - 6, sy + 28, { stroke: C.green, sw: 2, head: 7 });
        g += h.txt((lastAx + shX) / 2 + 20, ay + 62, '同一个结点', { size: 11, fill: C.green });
        g += h.txt(shX + s.shr.length * (bw2 + gp) + 6, sy + 25, '∧', { size: 16, fill: C.muted, anchor: 'start' });
      } else {
        /* 不相交：两条链各自走到 ∧（每格后面已经画过 next 箭头，这里只补终止符） */
        [[s.aown, ay], [s.bown, by]].forEach(function (row) {
          var xa = row[0].length ? ax0 + (row[0].length - 1) * (bw2 + gp) + bw2 + gp + 4 : ax0 - 20;
          g += h.txt(xa, row[1] + 26, '∧', { size: 16, fill: C.muted, anchor: 'start' });
        });
        g += h.txt(W / 2, sy + 25, '两个指针一起走到 ∧，从未指向同一个结点 → 不相交',
          { size: 14, fill: C.red, w: 600 });
      }
      g += h.txt(W / 2, 424, 'A 长 ' + s.la + '、B 长 ' + s.lb + '，差 ' + Math.abs(s.la - s.lb) + ' 步——' +
        (Math.abs(s.la - s.lb) ? '长表先走这么多，两个指针到链尾就一样远了' : '一样长，直接进入同步阶段'),
        { size: 13, w: 600 });
      g += h.txt(W / 2, 452, '公共段只有一份存储：两条链在同一结点处汇合，之后所有 next 都指向同一串',
        { size: 12.5, fill: C.muted });
      g += h.txt(W / 2, H - 14, s.done ? (s.phase === 'none' ? '★ 返回 NULL：两条链不相交'
        : '★ 相遇点就是第一个公共结点（绿框）') : '橙 a=A 的指针　蓝 b=B 的指针　绿=公共段',
        { size: 12.5, fill: s.done ? C.green : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
