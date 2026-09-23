/* 动画2：单链表的插入与删除（带头结点；含"先连后断"颠倒错误演示。默认数据同 cp2-01/cp2-02） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE_INSERT = [
    'p = L;  j = 0;                          // p指向头结点，j为计数器',
    'while (p && j < i - 1) {                // 寻找第 i-1 个结点',
    '    p = p->next;  ++j;',
    '}',
    'if (!p || j > i - 1) return ERROR;      // i不合法',
    's = new LNode;  s->data = e;            // 生成新结点s',
    's->next = p->next;                      // ① 先连：s接入p原来的后继',
    'p->next = s;                            // ② 后断：p改接s',
    'return OK;'
  ];
  var CODE_INSERT_BAD = [
    'p = L;  j = 0;',
    'while (p && j < i - 1) { p = p->next; ++j; }',
    'if (!p || j > i - 1) return ERROR;',
    's = new LNode;  s->data = e;',
    'p->next = s;                            // ✗ 先执行"后连"',
    's->next = p->next;                      // ✗ 后执行"先连"：此时p->next已是s！',
    'return OK;'
  ];
  var CODE_DELETE = [
    'p = L;  j = 0;',
    'while (p->next && j < i - 1) {          // 寻找第 i-1 个结点',
    '    p = p->next;  ++j;',
    '}',
    'if (!(p->next) || j > i - 1) return ERROR;',
    'q = p->next;                            // q指向第 i 个结点',
    'p->next = q->next;                      // ① 从链上摘下q',
    'e = q->data;  free(q);                  // ② 释放q',
    'return OK;'
  ];

  DSC.reg({
    id: 'linkList', ch: 2, name: '单链表的插入与删除',
    note: '教材 2.5 线性表的链式表示和实现（先连后断、与顺序表对比）',
    guide: [
      '先看 p 沿箭头逐结点走到第 i−1 个位置（头结点不计入表长）',
      '插入两步顺序不能颠倒：先 s->next = p->next 接后继，再 p->next = s 接新结点',
      '勾选"错误演示：颠倒两步顺序"，看断链和后继丢失',
      '删除只需摘链 + free 一次指针操作，对比顺序表不用移动任何元素'
    ],
    inputs: [
      { key: 'op', label: '操作', type: 'select', options: [['insert', '插入：第 i 个位置前插入 e'], ['del', '删除：删除第 i 个结点']], value: 'insert' },
      { key: 'i', label: '位置 i', type: 'number', value: 3, min: 1, max: 12 },
      { key: 'e', label: '值 e', type: 'number', value: 33 },
      { key: 'bad', label: '错误演示：颠倒两步顺序', type: 'checkbox', value: false },
      { key: 'data', label: '初始序列', type: 'text', value: '25,12,47,89,36,14' }
    ],
    run: function (v) {
      var vals = (v.data || '').split(/[,，\s]+/).filter(function (s) { return s !== ''; }).map(Number);
      if (vals.some(function (x) { return Number.isNaN(x); })) throw new Error('初始序列请输入逗号分隔的数字');
      if (vals.length === 0) throw new Error('初始序列不能为空');
      if (vals.length > 8) vals = vals.slice(0, 8);

      var ins = v.op === 'insert', bad = v.op === 'insert' && !!v.bad;
      var code = ins ? (bad ? CODE_INSERT_BAD : CODE_INSERT) : CODE_DELETE;

      /* 链模型：结点 {id, data}，next 用对象映射；'H' 为头结点 */
      var next = {}, nodes = { H: { id: 'H', data: '头' } };
      var prev = 'H';
      vals.forEach(function (d, k) { var id = 'n' + k; nodes[id] = { id: id, data: d }; next[prev] = id; prev = id; });
      next[prev] = null;

      var frames = [];
      function chainFrom(head) {           // 带防环保护
        var seq = [], seen = {}, p = head, loop = false;
        while (p && !seen[p]) {
          seen[p] = true; seq.push(p);
          p = next[p];
          if (seq.length > 30) { loop = true; break; }
        }
        if (p && seen[p]) loop = seq.indexOf(p) >= 0 && p === seq[seq.length - 1];
        return { seq: seq, loop: loop };
      }
      function snap(o) {
        o = o || {};
        var c = chainFrom('H');
        var chain = c.seq, loop = c.loop;
        var lost = Object.keys(nodes).filter(function (id) { return id !== 'H' && chain.indexOf(id) < 0 && (o.ghost || []).indexOf(id) < 0; });
        o.chain = chain; o.loop = loop; o.lost = lost;
        o.nodes = nodes; o.next = {};
        for (var k in next) o.next[k] = next[k];
        return o;
      }
      function F(line, msg, panel, s) { frames.push({ line: Array.isArray(line) ? line : [line], msg: msg, panel: panel, snap: s }); }

      var i = +v.i, e = +v.e;
      var basePanel = { i: 'i = ' + i, 表长: vals.length + ' 个数据结点（另有头结点）' };

      /* ---------- 插入 ---------- */
      if (ins) {
        var p = 'H', j = 0;
        F(0, '初始化：p 指向头结点，j = 0。头结点不计入表长，作用是让"在第 1 个位置插入"与其他位置处理一致。',
          { p: 'p → 头结点', j: 'j = 0' }, snap({ p: p, j: j }));
        var okWalk = true;
        while (p && j < i - 1) {
          if (!next[p]) { okWalk = false; break; }
          p = next[p]; j++;
          F([1, 2], 'p 后移：p → ' + (p === 'H' ? '头结点' : nodes[p].data) + '（第 ' + j + ' 个结点），j = ' + j + '。',
            { p: 'p → ' + (p === 'H' ? '头结点' : nodes[p].data), j: 'j = ' + j }, snap({ p: p, j: j }));
        }
        if (!p || j > i - 1) {
          F(4, 'i = ' + i + ' 不合法（找不到第 i−1 个结点）。算法返回 ERROR。',
            { 结果: 'ERROR（i 不合法）' }, snap({ p: p, j: j, err: true }));
          return { code: code, frames: frames };
        }
        F(4, '定位成功：p 指向第 i−1 = ' + (i - 1) + ' 个结点' + (p === 'H' ? '（头结点）' : '（值 ' + nodes[p].data + '）') + '。新结点将插到它后面。',
          { p: 'p → ' + (p === 'H' ? '头结点' : nodes[p].data), j: 'j = ' + j }, snap({ p: p, j: j }));
        var sid = 's';
        nodes[sid] = { id: sid, data: e };
        next[sid] = null;
        F(5, '生成新结点 s，数据域 s->data = ' + e + '。',
          { s: 's（待插入）' }, snap({ p: p, s: sid, ghost: [sid] }));

        if (!bad) {
          var oldNext = next[p];
          next[sid] = oldNext;
          F(6, '① 先连：s->next = p->next。新结点 s 先接上 p 原来的后继' + (oldNext ? '（值 ' + nodes[oldNext].data + '）' : '（NULL）') + '，链的后半段不丢。',
            { 's->next': oldNext ? '→ ' + nodes[oldNext].data : '→ NULL', '旧 next': oldNext ? '曾指向 ' + nodes[oldNext].data : '曾指向 NULL' }, snap({ p: p, s: sid, newLink: [sid, oldNext], cutLink: [p, oldNext], cutState: 'will', oldNextVal: oldNext != null ? nodes[oldNext].data : '∧' }));
          next[p] = sid;
          F(7, '② 后断：p->next = s。插入完成：L = ( ' + vals.slice(0, i - 1).concat([e]).concat(vals.slice(i - 1)).join(', ') + ' )。查找位置 O(n)，修改指针 O(1)——指针修改本身不移动任何元素。',
            { 'p->next': '→ s', 's->next': oldNext ? '→ ' + nodes[oldNext].data : '→ NULL' },
            snap({ p: p, s: sid, newLink: [p, sid], cutLink: [p, oldNext], cutState: 'done', oldNextVal: oldNext != null ? nodes[oldNext].data : '∧', done: true }));
        } else {
          var lostAt = next[p];
          next[p] = sid;                                   // ✗ 先"后连"
          F(4, '✗ 错误写法第一步：p->next = s。此时 p 原来的后继（' + vals.slice(i - 1).join(', ') + '）失去了唯一入口，已经从链上脱落！',
            { 'p->next': '→ s（错误）' }, snap({ p: p, s: sid, ghost: [sid], lostFrom: lostAt }));
          next[sid] = next[p];                             // ✗ s->next = p->next = s 自环
          F(5, '✗ 错误写法第二步：s->next = p->next，而 p->next 已经是 s 自己——s->next 指向 s，形成自环；' + vals.slice(i - 1).join(', ') + ' 全部丢失！',
            { 's->next': '→ s（自环）' }, snap({ p: p, s: sid, ghost: [sid], selfLoopDone: true }));
          F(5, '结论：两步顺序绝不能颠倒。必须先执行 s->next = p->next（先连），再执行 p->next = s（后断）。',
            { 结果: '链已断裂' }, snap({ p: p, s: sid, ghost: [sid], selfLoopDone: true, err: true }));
        }
        return { code: code, frames: frames };
      }

      /* ---------- 删除 ---------- */
      var p2 = 'H', j2 = 0;
      F(0, '初始化：p 指向头结点，j = 0。', { p: 'p → 头结点', j: 'j = 0' }, snap({ p: p2, j: j2 }));
      var okWalk2 = true;
      while (next[p2] && j2 < i - 1) {
        p2 = next[p2]; j2++;
        F([1, 2], 'p 后移：p → ' + nodes[p2].data + '（第 ' + j2 + ' 个结点），j = ' + j2 + '。',
          { p: 'p → ' + nodes[p2].data, j: 'j = ' + j2 }, snap({ p: p2, j: j2 }));
      }
      if (!next[p2] || j2 > i - 1) {
        F(4, 'i = ' + i + ' 不合法（不存在第 i 个结点）。算法返回 ERROR。', { 结果: 'ERROR（i 不合法）' }, snap({ p: p2, j: j2, err: true }));
        return { code: code, frames: frames };
      }
      var q = next[p2];
      F(5, 'q = p->next：q 指向待删除的第 ' + i + ' 个结点（值 ' + nodes[q].data + '）。',
        { p: 'p → ' + nodes[p2].data, q: 'q → ' + nodes[q].data }, snap({ p: p2, q: q }));
      var after = next[q];
      next[p2] = after;
      F(6, '① 摘链：p->next = q->next。p 越过 q 直接连到后继' + (after ? '（值 ' + nodes[after].data + '）' : '（NULL）') + '，q 脱离链表（此时还没释放）。',
        { 'p->next': after ? '→ ' + nodes[after].data : '→ NULL' }, snap({ p: p2, q: q, ghost: [q], removed: q, newLink: [p2, after], cutLink: [p2, q], cutState: 'done' }));
      F(7, '② free(q) 释放结点 q（值 ' + nodes[q].data + '）。删除完成：L = ( ' + vals.filter(function (_, k) { return k !== i - 1; }).join(', ') + ' )。同样只需改一个指针，不必移动元素。',
        { 结果: '删除成功' }, snap({ p: p2, removed: q, freed: q, done: true }));
      return { code: code, frames: frames };
    },
    render: function (s) {
      var total = s.chain.length + (s.s && s.chain.indexOf(s.s) < 0 ? 1 : 0) +
        (s.lost || []).length + (s.removed ? 1 : 0);
      var W = Math.max(980, 70 + total * 152), H = 430, nw = 92, nh = 46, y0 = 150, gap = 12;
      var pos = {};       // id -> {x,y,row}
      var g = '';
      g += h.txt(W / 2, 34, '单链表（带头结点）', { size: 19, w: 600 });
      // 主链一行
      var x = 30;
      for (var k = 0; k < s.chain.length; k++) {
        var id = s.chain[k];
        pos[id] = { x: x, y: y0, row: 0 };
        x += nw + 46 + gap;
      }
      // s 结点位置：放在链末端之后或 p 之后 —— 放在主链后面一格
      if (s.s && !pos[s.s]) { pos[s.s] = { x: x, y: y0, row: 0 }; x += nw + 46 + gap; }
      // ghost 结点跟随
      (s.ghost || []).forEach(function (id) { if (!pos[id] && !s.removed) { pos[id] = { x: x, y: y0, row: 0 }; x += nw + 46 + gap; } });
      // 丢失结点第二行
      var lx = 60;
      (s.lost || []).forEach(function (id) { pos[id] = { x: lx, y: y0 + 150, row: 1 }; lx += nw + 46 + gap; });
      if ((s.lost || []).length) g += h.txt(Math.max(96, 60 + (lx - 60 - gap) / 2 - (nw / 2)), y0 + 118, '已从链上脱落（无法再访问）', { size: 14, fill: C.red, w: 600 });
      if (s.removed && !pos[s.removed]) { pos[s.removed] = { x: lx, y: y0 + 150, row: 1 }; }

      function nodeX(id) { return pos[id].x; }
      function drawNode(id) {
        var P = pos[id], nd = s.nodes[id], isHead = id === 'H';
        var isS = id === s.s, isGhost = (s.ghost || []).indexOf(id) >= 0, isLost = (s.lost || []).indexOf(id) >= 0, isFreed = s.freed === id;
        var fill = '#fff', stroke = C.grey, sw = 1.5, dash = null;
        if (isHead) { fill = C.blueBg; stroke = C.blue; }
        if (isS) { fill = C.amberBg; stroke = C.amber; sw = 2.5; }
        if (isGhost || isLost) { fill = C.greyBg; stroke = C.grey; dash = '5,4'; }
        if (isFreed) { fill = C.redBg; stroke = C.red; dash = '5,4'; }
        var label = isHead ? '头' : nd.data;
        var dW = 56, pW = 40;
        var isNewPtr = s.newLink && s.newLink[0] === id;
        var ptrFill = isNewPtr ? C.blueBg : fill;
        var ptrStroke = isNewPtr ? C.blue : stroke;
        var nxt2 = s.next[id];
        var ptrTxt = (nxt2 === undefined) ? '' : (nxt2 === null ? '∧' : (nxt2 === 'H' ? '头' : (s.nodes[nxt2] ? s.nodes[nxt2].data : '')));
        g += h.rect(P.x, P.y, dW, nh, { fill: fill, stroke: stroke, sw: sw, rx: 6, dash: dash });
        g += h.rect(P.x + dW, P.y, pW, nh, { fill: ptrFill, stroke: ptrStroke, sw: isNewPtr ? 2.5 : sw, rx: 6, dash: dash });
        g += h.txt(P.x + dW / 2, P.y + nh / 2 + 6, label, { size: 17, w: 600, fill: isFreed ? C.red : C.ink });
        g += h.txt(P.x + dW + pW / 2, P.y + nh / 2 + 6, ptrTxt, { size: 14, w: 700, fill: isNewPtr ? '#fff' : C.ink, family: 'Consolas,monospace' });
        if (isNewPtr && s.oldNextVal != null) {
          g += h.txt(P.x + dW + pW / 2, P.y - 10, '原 ' + s.oldNextVal, { size: 10, fill: C.red, w: 600 });
        }
        if (isHead) g += h.txt(P.x + dW / 2, P.y - 10, '头结点 L', { size: 12, fill: C.blue });
        if (isS) g += h.txt(P.x + dW / 2, P.y - 10, 's（新结点）', { size: 12, fill: C.amber, w: 600 });
        if (isFreed) g += h.txt(P.x + dW / 2, P.y - 10, '✗ 已 free', { size: 12, fill: C.red });
        if (isLost) g += h.txt(P.x + dW / 2, P.y + nh + 18, '✗ 丢失', { size: 13, fill: C.red, w: 600 });
        // 自环
        if (s.loop && id === s.chain[s.chain.length - 1] && s.selfLoopDone) {
          var cx = P.x + dW + pW / 2;
          g += '<path d="M' + (P.x + dW + pW) + ' ' + (P.y + 8) + ' C' + (cx + 40) + ' ' + (P.y - 30) + ' ' + (cx + 10) + ' ' + (P.y - 30) + ' ' + (P.x + dW + 6) + ' ' + (P.y + 4) + '" fill="none" stroke="' + C.red + '" stroke-width="2.5"/>';
          g += h.txt(cx + 26, P.y - 36, 's->next=s 自环', { size: 12, fill: C.red, w: 600 });
        }
      }
      // 链接箭头（按 next 关系画，分主链/脱落）
      Object.keys(s.next).forEach(function (from) {
        var to = s.next[from];
        if (to === null || !pos[from] || !pos[to]) return;
        var A = pos[from], B = pos[to];
        var x1 = A.x + 92, y1 = A.y + nh / 2, x2 = B.x, y2 = B.y + nh / 2;
        var isCur = (s.newLink && s.newLink[0] === from && s.newLink[1] === to);
        var ghosted = A.row === 1 || (s.ghost || []).indexOf(from) >= 0 && from !== s.p && from !== s.s;
        var stroke = C.grey, sw = 2, dash = null;
        if (isCur) { stroke = C.amber; sw = 3; }
        else if (A.row === 1 || B.row === 1) { stroke = C.grey; dash = '5,4'; }
        else if (s.done && A.row === 0) { stroke = C.green; sw = 2.5; }
        else if (from === s.p && !s.done) { stroke = C.blue; sw = 2; }
        if (s.selfLoopDone && to === from) return;
        g += h.arrow(x1, y1, x2, y2, { stroke: stroke, sw: sw, dash: dash, head: 7 });
      });
      // 断开的旧链（红虚线）+ 标注
      if (s.cutLink) {
        var cf = s.cutLink[0], ct = s.cutLink[1];
        if (pos[cf] && pos[ct] && cf !== ct) {
          var A2 = pos[cf], B2 = pos[ct];
          var mx2 = (A2.x + 92 + B2.x) / 2, my2 = A2.y + nh / 2;
          if (s.cutState === 'done') {
            g += h.arrow(A2.x + 92, my2 + 18, B2.x + 30, B2.y + nh / 2 + (B2.y > A2.y ? -6 : 18), { stroke: C.red, sw: 2.2, dash: '6,4', head: 7 });
            g += h.txt(mx2, my2 + 40, '✗ 已断开', { size: 10.5, fill: C.red, w: 700 });
          } else {
            g += h.txt(mx2, my2 - 14, '✗ 即将断开', { size: 10.5, fill: C.red, w: 700 });
          }
        }
      }
      // 指针 p / q
      function ptr(id, name, col) {
        if (!id || !pos[id]) return;
        var P = pos[id];
        var px = P.x + 28, py = P.y - 44;
        g += h.txt(px, py - 6, name, { size: 16, fill: col, w: 700, family: 'Consolas,monospace' });
        g += h.arrow(px, py, px, P.y - 6, { stroke: col, sw: 2.5, head: 7 });
      }
      ptr(s.p, 'p', C.blue);
      ptr(s.q, 'q', C.green);
      s.chain.concat(s.lost || []).concat(s.ghost || []).concat(s.removed ? [s.removed] : [])
        .filter(function (id, k, arr) { return pos[id] && arr.indexOf(id) === k; })
        .forEach(drawNode);
      // 完成后的序列
      if (s.done || s.err) {
        var vals2 = s.chain.filter(function (id) { return id !== 'H'; }).map(function (id) { return s.nodes[id].data; });
        if (s.selfLoopDone && s.s) vals2.push(s.nodes[s.s].data + '(自环)');
        var msg2 = (s.err ? '✗ 断链结果：' : '当前链表：') + '头 → ' + (vals2.length ? vals2.join(' → ') : '空') + ' → NULL';
        g += h.rect(W / 2 - 300, H - 52, 600, 34, { fill: s.err ? C.redBg : C.greenBg, stroke: s.err ? C.red : C.green, rx: 8 });
        g += h.txt(W / 2, H - 30, msg2, { size: 14, fill: s.err ? C.red : C.green, w: 600 });
      }
      return h.svg(W, H, g);
    }
  });
})();
