/* 动画：链栈与链队列——栈和队列的链式存储结构（408 大纲 三(三)） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  /* 帧里的 line 是 CODE 的**下标**（引擎 code.map(function (t, i)) 比对），不是行号 */
  var SCODE = [
    'typedef struct LNode {          // 链栈结点',
    '    ElemType data;',
    '    struct LNode *next;',
    '} LNode, *LStackPtr;',
    'LStackPtr top = NULL;           // 不带头结点：top 就是栈顶结点',
    '',
    'Status Push(LStackPtr &top, ElemType e) {',
    '    s = (LNode*)malloc(sizeof(LNode));',
    '    if (!s) return ERROR;       // 只可能内存耗尽',
    '    s->data = e;',
    '    s->next = top;              // ① 先接住原栈顶',
    '    top = s;                    // ② 再把 top 指过来',
    '    return OK;                  // 无"栈满"、无假溢出',
    '}',
    'Status Pop(LStackPtr &top, ElemType &e) {',
    '    if (top == NULL) return ERROR;  // 判空只看一个指针',
    '    p = top;  e = p->data;',
    '    top = p->next;              // ① 头指针先移到下一个结点',
    '    free(p);                    // ② 再释放原栈顶',
    '    return OK;',
    '}'
  ];
  var QCODE = [
    'typedef struct QNode {          // 链队列结点',
    '    QElemType data;',
    '    struct QNode *next;',
    '} QNode, *QueuePtr;',
    'typedef struct { QNode *front, *rear; } LinkQueue;',
    '',
    'Status InitQueue(LinkQueue &Q) {',
    '    Q.front = Q.rear = (QNode*)malloc(sizeof(QNode));  // 头结点',
    '    Q.front->next = NULL;',
    '}',
    'Status EnQueue(LinkQueue &Q, QElemType e) {',
    '    s = (QNode*)malloc(sizeof(QNode));',
    '    s->data = e;  s->next = NULL;',
    '    Q.rear->next = s;           // ① 先挂到尾结点后面',
    '    Q.rear = s;                 // ② 再尾指针后移',
    '}',
    'Status DeQueue(LinkQueue &Q, QElemType &e) {',
    '    if (Q.front == Q.rear) return ERROR;   // 空队',
    '    p = Q.front->next;  e = p->data;',
    '    Q.front->next = p->next;    // 摘除首元结点',
    '    if (Q.rear == p)            // ★ 队里只剩它一个！',
    '        Q.rear = Q.front;',
    '    free(p);',
    '}'
  ];

  function head(arr) { return String(arr).split(/[,，\s]+/).filter(Boolean); }

  DSC.reg({
    id: 'linkStackQueue', ch: 3, name: '链栈与链队列：栈和队列的链式实现',
    note: '教材 3.3/3.4 栈与队列的链式存储（top 即栈顶结点、rear 的"最后一个结点"特判）',
    guide: [
      '**链栈不带头结点**：top 本身就是栈顶结点，进栈就是头插法（s->next = top; top = s），出栈就是删除首元结点',
      '顺序栈要判满、还会假溢出；链栈两样都没有——它唯一的"满"是内存分配失败，代价是每个结点额外存一个指针',
      '**链队列带头结点**，front 指头结点、rear 指尾结点：入队必须"先 rear->next = s，再 rear = s"，顺序反了就丢掉后面的链',
      '出队最容易错在**队里只剩一个结点**时：摘掉它之后 rear 就悬空了，必须补一句 rear = front。勾上下面的选项可以看不写这句会发生什么'
    ],
    inputs: [
      {
        key: 'scene', label: '场景', type: 'select', options: [
          ['lpush', '链栈 · 进栈（头插法）'], ['lpop', '链栈 · 出栈（删首元结点）'],
          ['qpush', '链队列 · 入队（尾插法）'], ['qpop', '链队列 · 出队（含 rear 特判）']
        ], value: 'qpop'
      },
      { key: 'seq', label: '元素序列（逗号分隔，1~6 个）', type: 'text', value: 'A,B,C,D,E' },
      { key: 'badRear', label: '出队不写"最后一个结点"特判（演示 rear 悬空）', type: 'checkbox', value: false }
    ],

    run: function (v) {
      var scene = v.scene, kind = scene.charAt(0) === 'l' ? 'stack' : 'queue';
      var items = head(v.seq);
      if (!items.length) throw Error('请至少给 1 个元素，例如 A,B,C');
      if (items.length > 6) throw Error('最多 6 个元素（画布放不下更多结点）');
      var bad = !!v.badRear && scene === 'qpop';
      var frames = [];
      function F(line, msg, panel, snap) {
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: snap });
      }
      function cnt(n) { return n + ' 个'; }

      /* ---------------- 链栈 ---------------- */
      if (kind === 'stack') {
        var nodes = [], fly = null, pops = [];
        function S(o) {
          return Object.assign({
            kind: 'stack', scene: scene, nodes: nodes.map(function (x) { return { v: x }; }),
            fly: fly, pops: pops.slice(), pending: pending.slice(), tot: items.length + 1, err: err
          }, o || {});
        }
        var pending, err = null;

        if (scene === 'lpush') {
          pending = items.slice();
          F([3, 4], '链栈**不带头结点**：top 本身就是栈顶结点。初始 top = NULL，判空就是一句 top == NULL。',
            { 栈内: '0 个', top: 'NULL' }, S({}));
          pending.forEach(function (e) {
            fly = { v: e, link: false };
            F([6, 7, 8], '进栈 e = ' + e + '：malloc 一个结点。链栈没有"栈满"这回事，只有内存真的分配不出来才算失败。',
              { 栈内: cnt(nodes.length), 待进栈: pending.join(' ') }, S({}));
            fly = { v: e, link: true };
            F([10], '① s->next = top：先让新结点接住当前栈顶' + (nodes.length ? '（' + nodes[0] + '）' : '（NULL）') + '。',
              { 栈内: cnt(nodes.length), 待进栈: pending.join(' ') }, S({}));
            nodes.unshift(e); fly = null; pending = pending.slice(1);
            F([11], '② top = s：头指针指过来，' + e + ' 就成了新的栈顶。这就是**头插法**。',
              { 栈内: cnt(nodes.length), 栈顶: e, 待进栈: pending.join(' ') }, S({}));
          });
          F([12], '★ 进栈完成：' + items.length + ' 个元素全插在链头，从栈顶到栈底是 ' + nodes.join(' → ') +
            '。对照顺序栈：不用判满、不会假溢出，代价是每个结点多背一个 next 指针。',
            { 栈内: cnt(nodes.length), 栈顶: nodes[0], 栈底: nodes[nodes.length - 1] }, S({ done: true }));
        } else {
          nodes = items.slice().reverse();
          pending = [];
          F([4], '预置：' + items.join('、') + ' 依次进栈后，后进的在链头——栈顶是 ' + nodes[0] + '，栈底是 ' + nodes[nodes.length - 1] + '。',
            { 栈内: cnt(nodes.length), 栈顶: nodes[0] }, S({}));
          nodes.slice().forEach(function (e) {
            F([15], '出栈前判空：top == NULL？现在 top 指向 ' + e + ' 的结点，非空，继续。',
              { 栈内: cnt(nodes.length), 栈顶: e }, S({}));
            var nx = nodes[1] ? nodes[1] + ' 的结点' : 'NULL';
            F([16, 17], 'p = top; e = p->data 取到 ' + e + '；top = p->next 让头指针先移到' + nx +
              '。**顺序不能反**：先 free(p) 就找不到 p->next 了。',
              { 栈内: cnt(nodes.length), 栈顶: nodes[1] || 'NULL' }, S({ outIdx: 0 }));
            pops.push(nodes.shift());
            F([18], 'free(p)：' + e + ' 的结点被释放，出栈序列现在是 ' + pops.join(' ') + '。',
              { 栈内: cnt(nodes.length), 出栈序: pops.join(' ') }, S({}));
          });
          err = '下溢';
          F([15], '✗ 下溢：top == NULL 还执行出栈。链栈的判空条件和顺序栈不同——它只看一个指针，不需要比较 top 和 base。',
            { 栈内: '0 个', 出栈序: pops.join(' ') }, S({}));
          F([18], '★ 出栈序列 ' + pops.join(' → ') + '，与进栈顺序 ' + items.join(' → ') + ' 正好相反（LIFO）。' +
            '结点是一个个 free 掉的，链栈的内存会随出栈真正归还。',
            { 栈内: '0 个', 出栈序: pops.join(' → ') }, S({ done: true }));
        }
        return { code: SCODE, frames: frames };
      }

      /* ---------------- 链队列 ---------------- */
      var qn = ['头'], rear = 0, fly = null, qpops = [], qpend, qerr = null, dangling = false;
      function Q(o) {
        return Object.assign({
          kind: 'queue', scene: scene, qn: qn.map(function (x) { return { v: x }; }), rear: rear,
          fly: fly, pops: qpops.slice(), pending: qpend.slice(), tot: items.length + 2,
          err: qerr, dangling: dangling
        }, o || {});
      }
      if (scene === 'qpush') {
        qpend = items.slice();
        F([6, 7, 8], '链队列**带头结点**：InitQueue 让 front 和 rear 都指向头结点，此时 front == rear 就是空队。',
          { 队列长: '0 个', 队头: '—', 队尾: '—' }, Q({}));
        qpend.forEach(function (e) {
          fly = { v: e, link: false };
          F([11, 12], '入队 e = ' + e + '：新建结点 s，s->data = e、s->next = NULL。',
            { 队列长: cnt(qn.length - 1), 待入队: qpend.join(' ') }, Q({}));
          fly = { v: e, link: true };
          F([13], '① rear->next = s：先把新结点挂到**尾结点**后面。此时 rear 还指着' + qn[qn.length - 1] + '。',
            { 队列长: cnt(qn.length - 1), 待入队: qpend.join(' ') }, Q({}));
          qn.push(e); fly = null; rear = qn.length - 1; qpend = qpend.slice(1);
          F([14], '② rear = s：尾指针才后移。**先移指针再挂结点就会丢掉后面整条链**，这两步顺序是考点。',
            { 队列长: cnt(qn.length - 1), 队头: qn[1], 队尾: e, 待入队: qpend.join(' ') }, Q({}));
        });
        F([14], '★ 入队完成：从队头到队尾是 ' + qn.slice(1).join(' → ') + '。链队列不会假溢出，' +
          '也不需要像循环队列那样留一个空位来区分"空"和"满"。',
          { 队列长: cnt(qn.length - 1), 队头: qn[1], 队尾: qn[qn.length - 1] }, Q({ done: true }));
        return { code: QCODE, frames: frames };
      }

      qn = ['头'].concat(items);
      rear = qn.length - 1;
      qpend = [];
      F([4, 7], '预置：' + items.join('、') + ' 依次入队。front 指着**头结点**（不存数据），rear 指着尾结点 ' + items[items.length - 1] + '。',
        { 队列长: cnt(qn.length - 1), 队头: qn[1], 队尾: qn[rear] }, Q({}));
      items.forEach(function (e, i) {
        var lastOne = i === items.length - 1;
        F([17], '判空：front == rear？现在 front 后面还有 ' + (qn.length - 1) + ' 个结点，不为空。',
          { 队列长: cnt(qn.length - 1), 队头: e }, Q({}));
        F([18, 19], 'p = front->next（' + e + ' 的结点）；e = p->data 取出 ' + e + '；front->next = p->next 把它从链上摘下来。',
          { 队列长: cnt(qn.length - 1), 队头: e }, Q({ outIdx: 1 }));
        if (lastOne && !bad) {
          F([20, 21], '★ 特判：刚才摘掉的 p 正是 rear 指着的那个结点——队里已经没东西了，' +
            '必须 rear = front，否则 rear 就指向被释放的内存。',
            { 队列长: '0 个', 状态: 'rear = front' }, Q({ rearFix: true }));
          qn = ['头']; rear = 0; qpops.push(e);
          F([22], 'free(p) 之后 rear 已经安全地回到头结点上。',
            { 队列长: '0 个', 出队序: qpops.join(' ') }, Q({}));
        } else {
          qn = qn.slice(0, 1).concat(qn.slice(2));
          rear = qn.length - 1;   /* 结点整体左移一格，rear 跟着往前挪 */
          qpops.push(e);
          F([22], 'free(p)：' + e + ' 出队。rear 没动——它指着的那个结点还在队里。',
            { 队列长: cnt(qn.length - 1), 队头: qn[1] || '—', 队尾: qn[rear], 出队序: qpops.join(' ') }, Q({}));
        }
      });
      if (bad) {
        dangling = true;
        F([20], '✗ 没写 rear = front：队里最后一个结点被 free 掉了，可 rear 仍然指着那块**已释放**的内存——悬空指针。',
          { 队列长: '0 个', 队尾: '悬空！', 出队序: qpops.join(' ') }, Q({}));
        fly = { v: 'X', link: false };
        F([12], '现在再入队一个 X：EnQueue 照常 malloc、照常写 s->next = NULL。',
          { 队列长: '0 个（看起来）', 队尾: '悬空' }, Q({}));
        fly = { v: 'X', link: true };
        F([13], '① rear->next = s：这一句写进了**已经被 free 的内存**。程序不一定立刻崩溃，但 X 根本没有接到头结点后面。',
          { 队列长: '0 个（看起来）', 队尾: '悬空' }, Q({}));
        F([14], '② rear = s：front->next 依然是 NULL，从队头往后走找不到 X——X 连同那块垃圾内存一起被遗忘了。' +
          '这就是那道选择题的答案：**出队时必须判断队列是否只剩一个结点**。',
          { 队列长: '0 个（实际丢了 X）', 队尾: 'X（接在已释放内存后）' }, Q({ done: true, lostX: true }));
      } else {
        qerr = '空队';
        F([17], '✗ 空队：front == rear 还执行出队。判空条件用的正是"两个指针相等"，而不是 front->next == NULL 之外的那套写法。',
          { 队列长: '0 个', 出队序: qpops.join(' ') }, Q({}));
        F([22], '★ 出队序列 ' + qpops.join(' → ') + '，与入队顺序一致（FIFO）。带头结点的好处：入队出队都不用改 front 指向的结点本身。',
          { 队列长: '0 个', 出队序: qpops.join(' → ') }, Q({ done: true }));
      }
      return { code: QCODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 540, g = '';
      var NOTE = {
        stack: '链栈：top 即栈顶结点，进栈 = 头插、出栈 = 删首元；不带头结点时判空就是 top == NULL',
        queue: '链队列：front 指头结点、rear 指尾结点；入队先接后移，出队要特判"只剩一个结点"'
      };
      if (s.kind === 'stack') {
        var NW = 150, NH = 38, PITCH = 52, CX = 300, y0 = 92;
        g += h.txt(W / 2, 30, '链栈（不带头结点）· top 就是栈顶结点', { size: 17, w: 600 });
        g += h.txt(30, 54, '图例：绿=链上的有效结点 橙=正在插入的新结点 红=待释放 虚线=刚刚改写的指针',
          { size: 11.5, fill: C.muted, anchor: 'start' });
        /* top 指针框 */
        g += h.rect(60, y0, 74, NH, { fill: C.blueBg, stroke: C.blue, sw: 2, rx: 6 });
        g += h.txt(97, y0 + 24, 'top', { size: 14, w: 700, family: 'Consolas,monospace' });
        var topY = s.nodes.length ? y0 : y0;
        g += h.arrow(134, y0 + NH / 2, CX - 4, topY + NH / 2, { stroke: s.nodes.length ? C.blue : C.grey, sw: 2, head: 8 });
        if (!s.nodes.length) g += h.txt(CX + 4, y0 + 25, 'NULL', { size: 13, fill: C.grey, anchor: 'start', family: 'Consolas,monospace' });
        s.nodes.forEach(function (nd, i) {
          var y = y0 + i * PITCH, out = s.outIdx != null && i === s.outIdx;
          var fill = out ? C.redBg : '#fff', stroke = out ? C.red : C.green;
          g += h.rect(CX, y, NW - 62, NH, { fill: fill, stroke: stroke, sw: 1.8, rx: 5 });
          g += h.rect(CX + NW - 62, y, 62, NH, { fill: C.greyBg, stroke: stroke, sw: 1.8, rx: 5 });
          g += h.txt(CX + (NW - 62) / 2, y + 25, nd.v, { size: 15, w: 700 });
          g += h.txt(CX + NW - 31, y + 25, 'next', { size: 10.5, fill: C.muted });
          var ny = CX + NW - 31;
          if (i < s.nodes.length - 1) g += h.line(ny, y + NH, ny, y + PITCH, { stroke: C.grey, sw: 1.6 });
          else g += h.line(ny, y + NH, ny, y + NH + 14, { stroke: C.grey, sw: 1.6 });
        });
        if (s.nodes.length) {
          g += h.txt(CX + NW - 31, y0 + (s.nodes.length - 1) * PITCH + NH + 28, 'NULL',
            { size: 12, fill: C.grey, family: 'Consolas,monospace' });
        }
        /* 待插入的新结点 */
        if (s.fly) {
          var fy = y0, fx = 620;
          g += h.rect(fx, fy, NW - 62, NH, { fill: C.amberBg, stroke: C.amber, sw: 2.4, rx: 5 });
          g += h.rect(fx + NW - 62, fy, 62, NH, { fill: '#fff', stroke: C.amber, sw: 2.4, rx: 5, dash: '5,4' });
          g += h.txt(fx + (NW - 62) / 2, fy + 25, s.fly.v, { size: 15, w: 700, fill: C.amber });
          g += h.txt(fx + NW - 31, fy + 25, 'next', { size: 10.5, fill: C.muted });
          g += h.txt(fx + (NW - 62) / 2, fy - 12, '新结点 s', { size: 11.5, fill: C.amber });
          if (s.fly.link) {
            g += h.arrow(fx, fy + NH / 2, CX + NW + 6, fy + NH / 2, { stroke: C.amber, sw: 2, head: 8 });
            g += h.txt(fx - 8, fy + NH / 2 - 10, 's->next = top', { size: 11, fill: C.amber, anchor: 'end' });
          }
          g += h.arrow(fx + (NW - 62) / 2, fy + NH, CX + 40, y0 + NH + 2, { stroke: C.amber, sw: 2, head: 8 });
        }
        if (s.err) g += h.txt(CX + 200, y0 + 25, '✗ ' + s.err + '：top == NULL 还执行出栈', { size: 12.5, fill: C.red, anchor: 'start', w: 600 });
        var sy = 452;
        if (s.pending.length) {
          g += h.txt(30, sy, '待进栈：', { size: 13, fill: C.muted, anchor: 'start', w: 600 });
          s.pending.forEach(function (pv, k) {
            var x = 100 + k * 44;
            g += h.rect(x, sy - 18, 38, 26, { fill: '#fff', stroke: C.line, sw: 1, rx: 5 });
            g += h.txt(x + 19, sy, pv, { size: 13, fill: C.muted });
          });
        }
        if (s.pops.length) {
          g += h.txt(30, sy + 36, '出栈序列：', { size: 13, fill: C.muted, anchor: 'start', w: 600 });
          s.pops.forEach(function (pv, k) {
            var x = 110 + k * 44, last = k === s.pops.length - 1;
            g += h.rect(x, sy + 18, 38, 26, { fill: last ? C.amberBg : '#fff', stroke: last ? C.amber : C.line, sw: last ? 2 : 1, rx: 5 });
            g += h.txt(x + 19, sy + 36, pv, { size: 13, w: last ? 700 : 400, fill: last ? C.amber : C.muted });
          });
        }
        g += h.txt(W / 2, H - 20, s.done ? '★ 链栈的"满"只有内存耗尽一种；它用指针换掉了顺序栈的判满和假溢出' : NOTE.stack,
          { size: 12.5, fill: s.done ? C.green : C.muted, w: s.done ? 600 : 400 });
        return h.svg(W, H, g);
      }

      /* ---- 链队列 ---- */
      var TOT = s.tot, bw = Math.min(96, Math.floor((W - 120) / TOT) - 26), gap = 26, qy = 150, QH = 40;
      var qx0 = (W - TOT * (bw + gap) + gap) / 2;
      g += h.txt(W / 2, 30, '链队列（带头结点）· front 指头结点，rear 指尾结点', { size: 17, w: 600 });
      g += h.txt(30, 54, '图例：灰=头结点（不存数据） 白=队内结点 橙=正在接入的新结点 红=已释放/悬空 虚线=刚刚改写的指针',
        { size: 11.5, fill: C.muted, anchor: 'start' });
      function cellX(i) { return qx0 + i * (bw + gap); }
      var shown = s.qn.length + (s.dangling ? 1 : 0);   /* 悬空时多画一个"已释放"的幽灵格 */
      for (var i = 0; i < shown; i++) {
        var isHead = i === 0, ghost = s.dangling && i === shown - 1;
        var out = s.outIdx != null && i === s.outIdx && !ghost;
        var x = cellX(i);
        g += h.rect(x, qy, bw - 26, QH, {
          fill: ghost || out ? C.redBg : isHead ? C.greyBg : '#fff',
          stroke: ghost || out ? C.red : isHead ? C.grey : C.green, sw: 1.8, rx: 5, dash: ghost ? '5,4' : null
        });
        g += h.rect(x + bw - 26, qy, 26, QH, { fill: C.greyBg, stroke: ghost || out ? C.red : isHead ? C.grey : C.green, sw: 1.8, rx: 5, dash: ghost ? '5,4' : null });
        var label = ghost ? '已释放' : (isHead ? '头' : s.qn[i].v);
        g += h.txt(x + (bw - 26) / 2, qy + 25, label, { size: ghost ? 11 : 15, w: ghost ? 600 : 700, fill: ghost || out ? C.red : C.ink });
        g += h.txt(x + bw - 13, qy + 25, 'next', { size: 9, fill: C.muted });
        if (i < s.qn.length - 1) {
          g += h.line(x + bw - 13, qy + QH, cellX(i + 1) + bw - 39, qy + QH + 13, { stroke: C.grey, sw: 1.6 });
        }
      }
      if (!s.fly && !s.dangling) {
        g += h.line(cellX(s.qn.length - 1) + bw - 13, qy + QH, cellX(s.qn.length - 1) + bw - 13, qy + QH + 13, { stroke: C.grey, sw: 1.6 });
        g += h.txt(cellX(s.qn.length - 1) + bw - 13, qy + QH + 27, 'NULL', { size: 11.5, fill: C.grey, family: 'Consolas,monospace' });
      }
      /* front / rear 指针框 */
      var py = qy + QH + 56;
      var fxx = cellX(0) + (bw - 26) / 2;
      g += h.rect(fxx - 32, py, 64, 30, { fill: C.blueBg, stroke: C.blue, sw: 2, rx: 6 });
      g += h.txt(fxx, py + 20, 'front', { size: 13, w: 700, family: 'Consolas,monospace' });
      g += h.line(fxx, py, fxx, qy + QH + 13, { stroke: C.blue, sw: 1.8 });
      var rx = s.dangling ? cellX(shown - 1) + (bw - 26) / 2 : cellX(s.rear) + (bw - 26) / 2;
      /* 空队时 front == rear，两个框必须并排画，不能叠在同一个格子上 */
      var shared = Math.abs(rx - fxx) < 74;
      if (shared) rx = fxx + 82;
      g += h.rect(rx - 28, py, 56, 30, {
        fill: s.dangling ? C.redBg : C.amberBg, stroke: s.dangling ? C.red : C.amber, sw: 2, rx: 6, dash: s.dangling ? '5,4' : null
      });
      g += h.txt(rx, py + 20, 'rear', { size: 13, w: 700, fill: s.dangling ? C.red : C.amber, family: 'Consolas,monospace' });
      if (shared) g += h.line(fxx + 34, py + 15, rx - 28, py + 15, { stroke: s.dangling ? C.red : C.amber, sw: 1.8 });
      else g += h.line(rx, py, rx, qy + QH + 13, { stroke: s.dangling ? C.red : C.amber, sw: 1.8, dash: s.dangling ? '5,4' : null });
      if (s.rearFix) g += h.arrow(rx - 28, py + 15, fxx + 34, py + 15, { stroke: C.green, sw: 2.4, head: 9 });
      /* 新结点 */
      if (s.fly) {
        var fi = s.dangling ? shown : s.qn.length;
        var fx = cellX(fi), fyy = qy - 66;
        g += h.rect(fx, fyy, bw - 26, QH, { fill: C.amberBg, stroke: C.amber, sw: 2.4, rx: 5 });
        g += h.rect(fx + bw - 26, fyy, 26, QH, { fill: '#fff', stroke: C.amber, sw: 2.4, rx: 5, dash: '5,4' });
        g += h.txt(fx + (bw - 26) / 2, fyy + 25, s.fly.v, { size: 15, w: 700, fill: C.amber });
        g += h.txt(fx + bw - 13, fyy + 25, 'next', { size: 9, fill: C.muted });
        g += h.txt(fx + (bw - 26) / 2, fyy - 10, '新结点 s', { size: 11.5, fill: C.amber });
        if (s.fly.link) {
          var fromX = (s.dangling ? cellX(shown - 1) : cellX(s.rear)) + (bw - 26) / 2;
          g += h.arrow(fromX, qy - 4, fx + (bw - 26) / 2, fyy + QH - 2, { stroke: s.dangling ? C.red : C.amber, sw: 2.2, head: 9 });
          /* 标签放在箭头起点的左上方：写在箭头中段会被线横穿 */
          g += h.txt(fromX - 8, qy - 16, s.dangling ? 'rear->next = s（写进已释放内存！）' : 'rear->next = s',
            { size: 11, fill: s.dangling ? C.red : C.amber, anchor: 'end' });
        }
      }
      if (s.err) g += h.txt(W / 2, qy - 30, '✗ ' + s.err + '：front == rear 还执行出队', { size: 12.5, fill: C.red, w: 600 });
      var sy2 = 380;
      if (s.pending.length) {
        g += h.txt(30, sy2, '待入队：', { size: 13, fill: C.muted, anchor: 'start', w: 600 });
        s.pending.forEach(function (pv, k) {
          var x = 104 + k * 44;
          g += h.rect(x, sy2 - 18, 38, 26, { fill: '#fff', stroke: C.line, sw: 1, rx: 5 });
          g += h.txt(x + 19, sy2, pv, { size: 13, fill: C.muted });
        });
      }
      if (s.pops.length) {
        g += h.txt(30, sy2 + 36, '出队序列：', { size: 13, fill: C.muted, anchor: 'start', w: 600 });
        s.pops.forEach(function (pv, k) {
          var x = 114 + k * 44, last = k === s.pops.length - 1;
          g += h.rect(x, sy2 + 18, 38, 26, { fill: last ? C.greenBg : '#fff', stroke: last ? C.green : C.line, sw: last ? 2 : 1, rx: 5 });
          g += h.txt(x + 19, sy2 + 36, pv, { size: 13, w: last ? 700 : 400, fill: last ? C.green : C.muted });
        });
      }
      var qnote = s.lostX ? '✗ 结论：X 被接在已释放的内存后面，从 front 出发根本找不到它——出队漏掉 rear = front 的代价'
        : s.done ? '★ 链队列不会假溢出，也不需要循环队列那种"牺牲一个空位"的判满写法；但每次进出都要动指针'
          : NOTE.queue;
      g += h.txt(W / 2, H - 20, qnote, { size: 12.5, fill: s.done || s.lostX ? (s.lostX ? C.red : C.green) : C.muted, w: 600 });
      return h.svg(W, H, g);
    }
  });
})();
