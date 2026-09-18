/* 动画4：队列的入队与出队
 * 两个独立场景（下拉切换）：
 * ① 假溢出引入——普通顺序队列，演示"前面空着却不能再入队"的假溢出，说明引入循环队列的动机；
 * ② 循环队列——环形数组，队空/队满三方案可切换（少用一单元 / size 计数 / tag 标志（实验一(四)））。 */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;
  var M = 6;

  function buildCode(scheme) {
    var judge = scheme === 'fewer' ? '(Q.rear + 1) % MAXQSIZE == Q.front'
      : scheme === 'size' ? 'Q.size == MAXQSIZE'
        : 'Q.front == Q.rear && Q.tag == 1';
    var empty = scheme === 'fewer' ? 'Q.front == Q.rear'
      : scheme === 'size' ? 'Q.size == 0'
        : 'Q.front == Q.rear && Q.tag == 0';
    var extra = scheme === 'size' ? '    int size;            // 元素个数'
      : scheme === 'tag' ? '    int tag;             // 最近操作：0出队 1入队'
        : '                      // （本方案不需要额外变量）';
    return [
      '#define MAXQSIZE 6        // 演示用容量',
      'typedef struct {',
      '    QElemType *base;      // 动态分配的数组',
      '    int front, rear;      // 队头、队尾指针',
      extra
    ].concat([
      '} SqQueue;',
      '',
      'Status EnQueue(SqQueue &Q, QElemType e) {',
      '    if (' + judge + ') return ERROR;                        // 队满 → 上溢',
      '    Q.base[Q.rear] = e;   // e插入队尾',
      '    Q.rear = (Q.rear + 1) % MAXQSIZE;' + (scheme === 'size' ? '  ++Q.size;' : scheme === 'tag' ? '  Q.tag = 1;' : '                       // rear环形后移'),
      '    return OK;',
      '}',
      '',
      'Status DeQueue(SqQueue &Q, QElemType &e) {',
      '    if (' + empty + ') return ERROR;                        // 队空 → 下溢',
      '    e = Q.base[Q.front];  // 取队头元素',
      '    Q.front = (Q.front + 1) % MAXQSIZE;' + (scheme === 'size' ? '  --Q.size;' : scheme === 'tag' ? '  Q.tag = 0;' : '                     // front环形后移'),
      '    return OK;',
      '}'
    ]);
  }
  var L_JUDGE_FULL = 8, L_PLACE = 9, L_MOVEREAR = 10, L_JUDGE_EMPTY = 15, L_TAKE = 16, L_MOVEFRONT = 17;

  DSC.reg({
    id: 'circQueue', ch: 3, name: '④ 假溢出与循环队列：入队与出队',
    note: '教材 3.5 队列的表示和操作的实现（假溢出、队空/队满三方案）',
    inputs: [
      {
        key: 'demo', label: '演示场景', type: 'select', options: [
          ['linear', '① 假溢出引入：普通顺序队列（为什么必须循环）'],
          ['fewer', '② 循环队列：少用一个元素空间（教材主推）'],
          ['size', '③ 循环队列：增设 size 变量计数'],
          ['tag', '④ 循环队列：增设 tag 标志（实验一(四)）']
        ], value: 'fewer'
      }
    ],
    run: function (v) {
      var demo = v.demo || 'linear';
      var frames = [];
      var cells = [null, null, null, null, null, null], front = 0, rear = 0, size = 0, tag = 0;
      var linearMode = demo === 'linear';
      var scheme = linearMode ? null : demo;
      var code = linearMode ? [
        '#define MAXQSIZE 6        // 普通顺序队列（不循环）',
        'typedef struct {',
        '    QElemType *base;',
        '    int front, rear;      // 入队 rear++，出队 front++（不取模）',
        '} SqQueue;',
        '',
        'Status EnQueue(SqQueue &Q, QElemType e) {',
        '    if (Q.rear == MAXQSIZE) return ERROR;   // rear 到达数组末尾 → 判"满"',
        '    Q.base[Q.rear] = e;',
        '    Q.rear = Q.rear + 1;                    // rear 单向右移',
        '    return OK;',
        '}',
        '',
        'Status DeQueue(SqQueue &Q, QElemType &e) {',
        '    if (Q.front == Q.rear) return ERROR;    // 队空',
        '    e = Q.base[Q.front];',
        '    Q.front = Q.front + 1;                  // front 单向右移',
        '    return OK;',
        '}'
      ] : buildCode(scheme);

      function snap(o) {
        o = o || {};
        o.cells = cells.slice(); o.front = front; o.rear = rear; o.M = M;
        o.demo = demo; o.linearMode = linearMode; o.scheme = scheme; o.size = size; o.tag = tag;
        o.length = linearMode ? (rear - front)
          : (scheme === 'size' ? size
            : (scheme === 'tag' ? (front === rear ? (tag === 1 ? M : 0) : (rear - front + M) % M)
              : (rear - front + M) % M));
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }
      function cond() {
        var p = { front: 'front = ' + front, rear: 'rear = ' + rear };
        if (scheme === 'size') p.size = 'size = ' + size;
        if (scheme === 'tag') p.tag = 'tag = ' + tag + (tag === 1 ? '（最近是入队）' : '（最近是出队）');
        var full, empty, lenTxt;
        if (linearMode) {
          full = 'rear == M → ' + (rear === M ? '成立（不能再入队）' : '不成立');
          empty = 'front == rear → ' + (front === rear ? '成立（空）' : '不成立');
          lenTxt = 'rear − front = ' + (rear - front);
        } else if (scheme === 'fewer') {
          full = '(rear+1) % M == front → ' + ((rear + 1) % M === front ? '成立（满）' : '不成立');
          empty = 'front == rear → ' + (front === rear ? '成立（空）' : '不成立');
          lenTxt = '(rear−front+M) % M = ' + ((rear - front + M) % M);
        } else if (scheme === 'size') {
          full = 'size == M → ' + (size === M ? '成立（满）' : '不成立');
          empty = 'size == 0 → ' + (size === 0 ? '成立（空）' : '不成立');
          lenTxt = 'size = ' + size;
        } else {
          full = 'front==rear && tag==1 → ' + (front === rear && tag === 1 ? '成立（满）' : '不成立');
          empty = 'front==rear && tag==0 → ' + (front === rear && tag === 0 ? '成立（空）' : '不成立');
          lenTxt = front === rear ? (tag === 1 ? 'M = ' + M : '0') : ((rear - front + M) % M);
        }
        p['队长'] = lenTxt;
        p['队空判定'] = empty;
        p['队满判定'] = full;
        return p;
      }

      /* ---------- 场景①：假溢出引入（普通顺序队列） ---------- */
      if (linearMode) {
        F([6, 7], '【普通顺序队列】约定：入队放 base[rear] 后 rear++，出队取 base[front] 后 front++——指针只会单向右移，【不取模】。先连续入队 5 个元素。',
          cond(), snap({}));
        ['a', 'b', 'c', 'd', 'e'].forEach(function (ch2) {
          F([7], '入队 ' + ch2 + '：rear = ' + rear + ' 未到数组末尾，放入 base[' + rear + ']。', cond(), snap({ lastIdx: rear, op: 'enq', arg: ch2 }));
          cells[rear] = ch2;
          rear++;
          F([8], 'rear++ → ' + rear + '。' + (rear === M ? 'rear 已到达数组末尾！' : ''), cond(), snap({ moved: 'rear', op: 'enq', arg: ch2 }));
        });
        F([14, 15], '出队 a、b：front 从 0 右移到 2，下标 0、1 腾空。队列还剩 c、d、e，front = 2、rear = 5。',
          cond(), snap({ lastIdx: 1, ret: 'b', op: 'deq', note: 'deq2' }));
        cells[0] = null; cells[1] = null; front = 2;
        F([14, 15], '当前状态：下标 0、1 已空，队中元素为 c、d、e（下标 2～4）。', cond(), snap({ note: 'afterdeq' }));
        F([7], '入队 f：rear = 5 < M = 6，放入 base[5]。', cond(), snap({ lastIdx: 5, op: 'enq', arg: 'f' }));
        cells[5] = 'f';
        rear = 6;
        F([8], 'rear++ → 6，已到达数组末尾。', cond(), snap({ moved: 'rear', op: 'enq', arg: 'f' }));
        F([6], '再想入队 g：判满 rear == M = 6 → 返回 ERROR！可是下标 0、1 明明空着——【前面空着却不能再入队】，这就是【假溢出】。原因：front 之前的空间，单向右移的指针永远回不去。',
          cond(), snap({ err: '假溢出', op: 'enq', arg: 'g' }));
        F([0], '结论：普通顺序队列的空间利用率太低。解决办法——把数组首尾相连成【环形】，指针取模后移：rear = (rear+1) % M。请切换到"② 循环队列"场景继续。',
          cond(), snap({ done: true }));
        return { code: code, frames: frames };
      }

      /* ---------- 场景②④：循环队列（三方案） ---------- */
      F([0, 1, 2, 3], '【循环队列】数组首尾相连：base[M−1] 接在 base[0] 之后，指针一律取模后移——rear = (rear+1) % M，front = (front+1) % M。这样出队腾出的空间可以复用（对比"① 假溢出引入"场景）。本场景采用【' +
        (scheme === 'fewer' ? '少用一个元素空间' : scheme === 'size' ? 'size 计数' : 'tag 标志') + '】方案区分队空与队满。',
        cond(), snap({ note: 'init' }));

      var script = scheme === 'fewer'
        ? [['enq', 'a'], ['enq', 'b'], ['enq', 'c'], ['deq'], ['enq', 'd'], ['enq', 'e'], ['enq', 'f'], ['full'], ['enq', 'g'], ['deq'], ['len']]
        : [['enq', 'a'], ['enq', 'b'], ['enq', 'c'], ['enq', 'd'], ['enq', 'e'], ['enq', 'f'], ['full'], ['enq', 'g'], ['deq'], ['len']];
      script.forEach(function (op) {
        if (op[0] === 'enq') {
          var fullNow = scheme === 'fewer' ? ((rear + 1) % M === front)
            : scheme === 'size' ? (size === M)
              : (front === rear && tag === 1);
          var judgeTxt = scheme === 'fewer'
            ? '(rear+1) % M = (' + rear + '+1) % ' + M + ' = ' + ((rear + 1) % M) + (fullNow ? ' == front = ' + front : ' ≠ front = ' + front)
            : scheme === 'size' ? 'size = ' + size + (fullNow ? ' == M = ' + M : ' < M = ' + M)
              : 'front = ' + front + (front === rear ? ' == ' : ' ≠ ') + 'rear = ' + rear + '，tag = ' + tag;
          if (fullNow) {
            F(L_JUDGE_FULL, '入队 ' + op[1] + '：判满 ' + judgeTxt + '，【队满】！发生【上溢】，返回 ERROR。' +
              (scheme === 'fewer' ? '牺牲的 1 个空格正是代价——M 格最多存 M−1 个元素。'
                : scheme === 'size' ? 'size 方案可存满 M = ' + M + ' 个元素。'
                  : 'tag 方案也可存满 M = ' + M + ' 个：tag 记录"最后一次是入队还是出队"，front==rear 时靠 tag 区分满（tag=1）与空（tag=0）。'),
              cond(), snap({ err: '上溢', op: 'enq', arg: op[1] }));
            return;
          }
          F(L_JUDGE_FULL, '入队 ' + op[1] + '：判满 ' + judgeTxt + '，未满。', cond(), snap({ op: 'enq', arg: op[1] }));
          cells[rear] = op[1];
          F(L_PLACE, 'Q.base[' + rear + '] = ' + op[1] + '：元素放入下标 ' + rear + '。', cond(), snap({ lastIdx: rear, op: 'enq', arg: op[1] }));
          var oldRear = rear;
          rear = (rear + 1) % M;
          if (scheme === 'size') size++;
          if (scheme === 'tag') tag = 1;
          F(L_MOVEREAR, 'rear = (rear + 1) % M = (' + oldRear + ' + 1) % ' + M + ' = ' + rear + (rear === 0 ? '（绕回 0 —— 这就是"循环"）' : '') +
            (scheme === 'size' ? '；size 加 1 → ' + size : scheme === 'tag' ? '；tag 置 1（最近操作是入队）' : '') + '。',
            cond(), snap({ moved: 'rear', op: 'enq', arg: op[1] }));
        } else if (op[0] === 'deq') {
          var emptyNow = scheme === 'fewer' ? (front === rear)
            : scheme === 'size' ? (size === 0)
              : (front === rear && tag === 0);
          if (emptyNow) {
            F(L_JUDGE_EMPTY, '出队：判空【队空】，返回 ERROR（下溢）。', cond(), snap({ err: '下溢', op: 'deq' }));
            return;
          }
          F(L_JUDGE_EMPTY, '出队：判空非空。', cond(), snap({ op: 'deq' }));
          var e = cells[front];
          F(L_TAKE, 'e = Q.base[' + front + '] = ' + e + '：取出队头元素。', cond(), snap({ lastIdx: front, ret: e, op: 'deq' }));
          var oldFront = front;
          front = (front + 1) % M;
          cells[oldFront] = null;
          if (scheme === 'size') size--;
          if (scheme === 'tag') tag = 0;
          F(L_MOVEFRONT, 'front = (front + 1) % M = (' + oldFront + ' + 1) % ' + M + ' = ' + front + '。出队后空出的格子可以复用（对比"① 假溢出引入"场景）' +
            (scheme === 'size' ? '；size 减 1 → ' + size : scheme === 'tag' ? '；tag 置 0（最近操作是出队）' : '') + '。',
            cond(), snap({ moved: 'front', lastIdx: oldFront, op: 'deq' }));
        } else if (op[0] === 'full') {
          var judgeTxt2 = scheme === 'fewer'
            ? '(rear+1) % M = (' + rear + '+1) % ' + M + ' = ' + ((rear + 1) % M) + ' == front = ' + front + '，【队满】'
            : scheme === 'size' ? 'size = ' + size + ' == M = ' + M + '，【队满】'
              : 'front = ' + front + ' == rear = ' + rear + ' 且 tag = ' + tag + '（最近是入队），【队满】';
          F(L_JUDGE_FULL, '关键点：再想入队时判满 ' + judgeTxt2 + '。' +
            (scheme === 'fewer'
              ? '注意此刻 front 位置其实还空着——这正是"少用一个空间"的代价：用一格换来了队空（front==rear）与队满（(rear+1)%M==front）两个条件不混淆。'
              : '本方案 front==rear 时队空与队满都可能，靠' + (scheme === 'size' ? 'size' : 'tag') + '区分。'),
            cond(), snap({ op: 'full' }));
        } else {
          F(L_JUDGE_EMPTY, '演示结束。当前队长 = ' + (scheme === 'fewer'
            ? '(rear − front + M) % M = (' + rear + ' − ' + front + ' + ' + M + ') % ' + M + ' = ' + ((rear - front + M) % M)
            : (scheme === 'size' ? 'size = ' + size : (front === rear ? (tag === 1 ? M : 0) : (rear - front + M) % M))) + '。' +
            (scheme === 'fewer'
              ? '三种方案对比：少一单元最常用（省变量）；size 直观（可存满 M 个）；tag 开销最小也可存满——实验一(四)要求实现的就是 tag 方案。'
              : '对比"少用一单元"方案：本方案可存满 M 个元素，代价是额外一个变量。'),
            cond(), snap({ done: true }));
        }
      });
      return { code: code, frames: frames };
    },
    render: function (s) {
      if (s.linearMode) return renderLinear(s);
      return renderRing(s);
    }
  });

  /* ---------- 场景① 渲染：普通顺序队列（大图） ---------- */
  function renderLinear(s) {
    var W = 980, H = 470, cw = 100, ch = 64;
    var x0 = (W - M * cw) / 2, y0 = 210;
    var g = '';
    g += h.txt(30, 36, '场景① 普通顺序队列（不循环）——为什么需要循环队列', { size: 17, w: 600, anchor: 'start', fill: C.amber });
    for (var k = 0; k < M; k++) {
      var x = x0 + k * cw;
      var used = s.cells[k] !== null;
      var wasted = k < s.front;
      var fill = '#fff', stroke = C.grey, dash = null;
      if (used) { fill = C.blueBg; stroke = C.blue; }
      if (s.lastIdx === k) { fill = s.ret != null ? C.amberBg : C.greenBg; stroke = s.ret != null ? C.amber : C.green; }
      if (s.err) { stroke = C.red; }
      if (wasted) { fill = C.greyBg; stroke = C.grey; dash = '5,4'; }
      g += h.rect(x, y0, cw - 8, ch, { fill: fill, stroke: stroke, rx: 8, dash: dash, sw: s.lastIdx === k ? 2.5 : 1.5 });
      if (used) g += h.txt(x + (cw - 8) / 2, y0 + ch / 2 + 7, s.cells[k], { size: 20, w: 700 });
      if (wasted) g += h.txt(x + (cw - 8) / 2, y0 + ch / 2 + 7, '空', { size: 15, fill: C.red });
      g += h.txt(x + (cw - 8) / 2, y0 + ch + 22, '下标 ' + k, { size: 12, fill: C.muted });
    }
    // front 指针（下方，绿）
    var fx = x0 + s.front * cw + (cw - 8) / 2;
    g += h.arrow(fx, y0 + ch + 48, fx, y0 + ch + 10, { stroke: C.green, sw: 2.5 });
    g += h.txt(fx, y0 + ch + 70, 'front = ' + s.front + (s.front > 0 ? '（前面的格子已浪费）' : ''), { size: 13.5, fill: C.green, w: 600 });
    // rear 指针（上方，蓝；越界时画在末尾外）
    var rIdx = Math.min(s.rear, M);
    var rx = x0 + rIdx * cw + (cw - 8) / 2;
    g += h.arrow(rx, y0 - 48, rx, y0 - 10, { stroke: C.blue, sw: 2.5 });
    g += h.txt(rx, y0 - 58, 'rear = ' + s.rear + (s.rear >= M ? '（已越界！）' : ''), { size: 13.5, fill: s.rear >= M ? C.red : C.blue, w: 600 });
    // 浪费区标注
    if (s.front > 0) {
      g += h.rect(x0 - 6, y0 - 6, s.front * cw, ch + 12, { fill: 'none', stroke: C.red, rx: 8, dash: '6,4', sw: 1.5 });
      g += h.txt(x0 + s.front * cw / 2, y0 - 16, '无法复用的空间', { size: 12.5, fill: C.red });
    }
    var note = s.err ? '✗ 假溢出：rear 已到数组末尾判"满"，但 front 之前还有空格——空间被浪费'
      : s.done ? '解决：首尾相连成环形，指针取模后移 → 切换到"② 循环队列"场景'
        : '入队 rear++，出队 front++，指针单向右移、不取模';
    var nc = s.err ? C.red : (s.done ? C.green : C.amber);
    g += h.rect(W / 2 - 310, H - 58, 620, 34, { fill: s.err ? C.redBg : (s.done ? C.greenBg : C.amberBg), stroke: nc, rx: 8 });
    g += h.txt(W / 2, H - 36, note, { size: 13.5, fill: nc, w: 600 });
    return h.svg(W, H, g);
  }

  /* ---------- 场景②④ 渲染：循环队列（环形） ---------- */
  function renderRing(s) {
    var W = 980, H = 470, cx = 400, cy = 258, R = 130, bw = 64, bh = 44;
    var g = '';
    g += h.txt(W - 30, 40, '循环队列（M = ' + s.M + '，方案：' + (s.scheme === 'fewer' ? '少用一空间，最多存 ' + (s.M - 1) + ' 个' : 'size/tag 计，可存满 ' + s.M + ' 个') + '）', { size: 16, w: 600, anchor: 'end' });
    g += h.circle(cx, cy, R, { fill: 'none', stroke: C.line, sw: 1.5, dash: '3,5' });
    var pos = [];
    for (var k = 0; k < s.M; k++) {
      var ang = (k * 360 / s.M - 90) * Math.PI / 180;
      pos[k] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
    }
    for (var k2 = 0; k2 < s.M; k2++) {
      var P = pos[k2];
      var fill = '#fff', stroke = C.grey, dash = null, sw = 1.5;
      if (s.cells[k2] !== null) { fill = C.blueBg; stroke = C.blue; }
      if (s.lastIdx === k2) { fill = s.ret != null ? C.amberBg : C.greenBg; stroke = s.ret != null ? C.amber : C.green; sw = 2.5; }
      if (s.err) { stroke = C.red; }
      g += h.rect(P.x - bw / 2, P.y - bh / 2, bw, bh, { fill: fill, stroke: stroke, rx: 9, dash: dash, sw: sw });
      if (s.cells[k2] !== null) g += h.txt(P.x, P.y + 6, s.cells[k2], { size: 19, w: 700 });
      var ox = cx + (R + 52) * Math.cos((k2 * 360 / s.M - 90) * Math.PI / 180);
      var oy = cy + (R + 52) * Math.sin((k2 * 360 / s.M - 90) * Math.PI / 180);
      g += h.txt(ox, oy + 5, '[' + k2 + ']', { size: 12.5, fill: C.muted });
    }
    function ptrArr(name, idx, col, dx) {
      var P = pos[idx];
      var ang = (idx * 360 / s.M - 90) * Math.PI / 180;
      var fx = cx + (R + 88) * Math.cos(ang), fy = cy + (R + 88) * Math.sin(ang);
      var tx = P.x + (P.x - cx) / R * (bh / 2 + 12), ty = P.y + (P.y - cy) / R * (bh / 2 + 12);
      g += h.arrow(fx, fy, tx, ty, { stroke: col, sw: 2.5, head: 8 });
      var anchor = dx === 0 ? 'middle' : (dx < 0 ? 'end' : 'start');
      g += h.txt(fx + dx, fy + (fy > cy ? 20 : -8), name, { size: 15, fill: col, w: 700, family: 'Consolas,monospace', anchor: anchor });
    }
    ptrArr('front=' + s.front, s.front, C.green, -34);
    ptrArr('rear=' + s.rear, s.rear, C.blue, 10);
    var rx = 770;
    g += h.txt(rx + 95, 120, '判定条件', { size: 16, w: 600 });
    function condBox(y, txt, sub, col, bg) {
      g += h.rect(rx, y, 190, 46, { fill: bg, stroke: col, rx: 8 });
      g += h.txt(rx + 95, y + 19, txt, { size: 12.5, fill: col, w: 600 });
      g += h.txt(rx + 95, y + 37, sub, { size: 11.5, fill: C.muted });
    }
    var fullNow = s.scheme === 'fewer' ? ((s.rear + 1) % s.M === s.front)
      : s.scheme === 'size' ? (s.size === s.M) : (s.front === s.rear && s.tag === 1);
    var emptyNow = s.scheme === 'fewer' ? (s.front === s.rear)
      : s.scheme === 'size' ? (s.size === 0) : (s.front === s.rear && s.tag === 0);
    if (s.scheme === 'fewer') {
      condBox(140, '队空：front == rear', emptyNow ? '当前：成立 ✓（空）' : '当前：不成立', C.green, C.greenBg);
      condBox(196, '队满：(rear+1)%M == front', fullNow ? '当前：成立 ✓（满）' : '当前：不成立', C.blue, C.blueBg);
      g += h.rect(rx, 252, 190, 46, { fill: '#fff', stroke: C.grey, rx: 8 });
      g += h.txt(rx + 95, 270, '队长：(rear−front+M)%M', { size: 12 });
      g += h.txt(rx + 95, 288, '当前 = ' + s.length, { size: 13, w: 600 });
    } else if (s.scheme === 'size') {
      condBox(140, '队空：size == 0', emptyNow ? '当前：成立 ✓（空）' : '当前：不成立', C.green, C.greenBg);
      condBox(196, '队满：size == M', fullNow ? '当前：成立 ✓（满）' : '当前：不成立', C.blue, C.blueBg);
      g += h.rect(rx, 252, 190, 46, { fill: '#fff', stroke: C.grey, rx: 8 });
      g += h.txt(rx + 95, 270, '队长：size', { size: 12 });
      g += h.txt(rx + 95, 288, '当前 = ' + s.size + '（可存满 ' + s.M + ' 个）', { size: 12.5, w: 600 });
    } else {
      condBox(140, '队空：front==rear 且 tag=0', emptyNow ? '当前：成立 ✓（空）' : '当前：不成立', C.green, C.greenBg);
      condBox(196, '队满：front==rear 且 tag=1', fullNow ? '当前：成立 ✓（满）' : '当前：不成立', C.blue, C.blueBg);
      g += h.rect(rx, 252, 190, 46, { fill: '#fff', stroke: C.grey, rx: 8 });
      g += h.txt(rx + 95, 270, 'tag：最近操作（0出队/1入队）', { size: 11 });
      g += h.txt(rx + 95, 288, '当前 tag = ' + s.tag + '，队长 = ' + s.length, { size: 12.5, w: 600 });
    }
    g += h.txt(rx + 95, 330, 'front 指向队头元素', { size: 12.5, fill: C.green });
    g += h.txt(rx + 95, 352, 'rear 指向队尾的下一位置', { size: 12.5, fill: C.blue });
    var note = s.err === '上溢' ? '✗ 上溢：队满还入队'
      : s.err === '下溢' ? '✗ 下溢：队空还出队'
      : s.done ? '三种方案：少一单元（省变量）｜ size（直观，存满 M）｜ tag（开销最小，存满 M，即实验一(四)）'
      : s.note === 'init' ? '指针一律取模后移：rear=(rear+1)%M，front=(front+1)%M（假溢出已解决）'
      : '入队：判满→放元素→rear取模后移　｜　出队：判空→取元素→front取模后移';
    var nc = s.err ? C.red : C.blue;
    g += h.rect(W / 2 - 310, H - 50, 620, 34, { fill: s.err ? C.redBg : C.blueBg, stroke: nc, rx: 8 });
    g += h.txt(W / 2, H - 28, note, { size: 13.5, fill: nc, w: 600 });
    return h.svg(W, H, g);
  }
})();
