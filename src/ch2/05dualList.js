/* 动画：双向链表与循环链表——逐步展示每条 prior/next 指针的新建与断开（教材 2.5） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE_I = [
    's->prior = p->prior;        // ① 新结点 s 的 prior 指向 p 的前驱',
    'p->prior->next = s;         // ② 前驱的 next 改指 s（旧链断开）',
    's->next = p;                // ③ s 的 next 指向 p',
    'p->prior = s;               // ④ 最后才改 p 的 prior（顺序不能乱！）'
  ];
  var CODE_CYC = [
    '循环链表的操作要点：',
    '    尾结点的 next 指回头结点;   // 与单链表的唯一区别',
    '    从任一结点出发都能遍历全表',
    '    设尾指针 rear 后：头尾操作均 O(1)，两链合并只改两次指针'
  ];
  var CODE_D = [
    'p->prior->next = p->next;   // ① 前驱跨过 p',
    'p->next->prior = p->prior;  // ② 后继跨过 p',
    'free(p);                    // 双向链表删除只需两步改链'
  ];

  var BASE = [10, 20, 30, 40];

  /* 依据 op + stage 生成链接状态表（数据驱动渲染） */
  function buildLinks(op, stage) {
    var L = [];
    function n(f, t, st) { L.push({ f: f, t: t, k: 'next', st: st || '' }); }
    function p(f, t, st) { L.push({ f: f, t: t, k: 'prior', st: st || '' }); }
    if (op === 'ins') {
      if (stage === 'start') {
        n(10, 20); n(20, 30); n(30, 40);
        p(20, 10); p(30, 20); p(40, 30);
      } else if (stage === 'step1') {
        n(10, 20); n(20, 30); n(30, 40);
        p(20, 10); p(30, 20); p(40, 30);
        p(20, 25, 'new');                                // ① s->prior 指向前驱 20
      } else if (stage === 'step2') {
        n(10, 20); n(30, 40);
        n(20, 25, 'new'); n(20, 30, 'cut');
        p(20, 10); p(40, 30); p(20, 25, 'new'); p(30, 20);
      } else if (stage === 'step3') {
        n(10, 20); n(30, 40);
        n(20, 25, 'new'); n(20, 30, 'cut'); n(25, 30, 'new');
        p(20, 10); p(40, 30); p(20, 25, 'new'); p(30, 20);
      } else {   // step4 / done / warn：插入完成，5 结点最终形态
        var isNew = stage === 'step4';
        n(10, 20, isNew ? 'new' : '');
        n(20, 25, isNew ? 'new' : '');
        n(25, 30, isNew ? 'new' : '');
        n(30, 40);
        p(20, 10);
        p(20, 25, isNew ? 'new' : '');
        p(30, 25, isNew ? 'new' : '');
        p(40, 30);
        p(30, 20, stage === 'step4' ? 'cut' : '');
      }
    } else if (op === 'del') {
      if (stage === 'start') {
        n(10, 20); n(20, 30); n(30, 40);
        p(20, 10); p(30, 20); p(40, 30);
      } else if (stage === 'step1') {
        n(20, 30); n(30, 40);
        n(10, 30, 'new'); n(10, 20, 'cut');
        p(20, 10); p(30, 20); p(40, 30);
      } else {
        n(30, 40);
        n(10, 30, 'new'); n(10, 20, 'cut');
        p(30, 10, 'new'); p(30, 20, 'cut'); p(40, 30);
        p(20, 10, 'cut'); p(20, 30, 'cut');
      }
    } else if (op === 'bad') {
      n(10, 20); n(20, 30); n(30, 40);
      p(20, 10); p(40, 30);
      if (stage === 'w1') { p(30, 25, 'new'); p(30, 20, 'cut'); }
      if (stage === 'w2' || stage === 'w3' || stage === 'w4') { p(30, 25, 'new'); p(30, 20, 'cut'); p(25, 25, 'cut'); }
      if (stage === 'w3') { n(25, 25, 'cut'); }
      if (stage === 'w4' || stage === 'w5') { n(25, 30, 'new'); }
      if (stage === 'w5') { p(30, 25); p(25, 25, 'cut'); }
    } else {
      n(10, 20); n(20, 30); n(30, 40);
      n(40, 10, stage === 'start' ? 'new' : '');
      p(20, 10); p(30, 20); p(40, 30); p(10, 40, stage === 'start' ? 'new' : '');
    }
    return L;
  }

  DSC.reg({
    id: 'dualList', ch: 2, name: '双向链表与循环链表',
    note: '教材 2.5 双向链表（prior/next 对称改链）、循环链表',
    guide: [
      '双向链表每个结点两个指针：prior 指前驱、next 指后继——可以 O(1) 找到前驱，单链表不行',
      '插入四步逐帧看链接变化：**蓝色=新建的指针，红色虚线=断开的旧指针**；步骤②后 30 暂时"够不着"是正常的',
      '删除两步"跨过 p"：前驱的 next 与后继的 prior 同时改指，20 被隔离后释放——对比单链表删除要先遍历找前驱',
      '循环链表：尾结点 next 指回头结点——从**任意**结点（包括尾）出发都能走完全表；若再设尾指针 rear，头尾操作都 O(1)'
    ],
    inputs: [
      { key: 'op', label: '场景', type: 'select', options: [
        ['ins', '双向插入：在 30 前插入 25（四步改链）'],
        ['del', '双向删除：删除 20（两步跨过）'],
        ['cyc', '循环链表：为什么"绕回去"有价值'],
        ['bad', '错误演示：顺序颠倒成 ④①②③（链断）']
      ], value: 'ins' }
    ],
    run: function (v) {
      var op = v.op;
      var frames = [];
      var list = BASE.slice();
      function F(msg, o, mk, line) {
        o = o || {};
        frames.push({
          line: Array.isArray(line) ? line : (line != null ? [line] : [1]), msg: msg,
          panel: { 链表: list.join(' ⇄ ') || '（空）' },
          snap: { nodes: nodes.slice(), links: buildLinks(op, o.stage || ''), op: op, list: list.slice(),
                  p: o.p, sFloat: o.sFloat, del: o.del, walk: o.walk, stage: o.stage || '', mark: mk }
        });
      }
      var nodes = BASE.slice();

      if (op === 'ins') {
        F('在结点 30 前插入 25：新结点 s（蓝虚线框）已创建，p 指向 30。注意看蓝色/红色链接如何逐步变化。', { stage: 'start', p: 30, sFloat: 25 });
        F('① s->prior = p->prior：新结点 s 的 prior 指向前驱 20（蓝色新链）。此时 20⇄30 的旧链还没动。', { stage: 'step1', p: 30, sFloat: 25 }, 'ins1', 0);
        F('② p->prior->next = s：前驱 20 的 next 改指 s，**旧链 20→30 断开**（红色虚线）。此刻 30 暂时"够不着"——这正是步骤不能乱的原因。', { stage: 'step2', p: 30, sFloat: 25 }, 'ins2', 1);
        F('③ s->next = p：s 的 next 指向 30。s 与两边的连接已齐三条，只差最后一条。', { stage: 'step3', p: 30, sFloat: 25 }, 'ins3', 2);
        list.splice(2, 0, 25);
        nodes.splice(2, 0, 25);                        // 25 正式进入链表（渲染按 5 结点排布）
        F('④ p->prior = s：最后才改 30 的 prior（30→20 的旧 prior 断开，红色虚线）。四条新链齐了：10 ⇄ 20 ⇄ 25 ⇄ 30 ⇄ 40。', { stage: 'step4', p: 30 }, 'ins4', 3);
        F('为什么顺序不能乱？若先执行④（p->prior = s），30 记住前驱的那条旧链立刻断开——再想执行①时 20 的信息已经丢了。蓝色=新链、红色虚线=断链，回看前四帧体会。', { stage: 'warn' }, 'warn');
        return { code: CODE_I, frames: frames };
      }
      if (op === 'bad') {
        F('错误演示：把正确顺序 ①②③④ 颠倒成 **④①②③**。初始状态正常，s（蓝虚线框）待接入，p 指向 30。', { stage: 'start', p: 30, sFloat: 25 }, 'bad0', 0);
        F('④ p->prior = s：30 的 prior 改指 s（蓝色新链），30→20 的旧 prior **立刻断开**（红色虚线）。此刻 20 的信息只存在于"已经断开的旧链"里——没有任何结点记得它！', { stage: 'w1', p: 30, sFloat: 25 }, 'bad1', 3);
        F('① s->prior = p->prior：而 p->prior 已经是 s 自己 → **s->prior 指向 s，形成自环**！前驱 20 的信息永久丢失。', { stage: 'w2', p: 30, sFloat: 25 }, 'bad2', 1);
        F('② p->prior->next = s：p->prior 是 s → s->next = s，**next 也自环了**。正向链 10→20→30→40 看似完好——隐患藏在反向。', { stage: 'w3', p: 30, sFloat: 25 }, 'bad3', 2);
        F('③ s->next = p：s 接上了 30。表面看四步都执行了……', { stage: 'w4', p: 30, sFloat: 25 }, 'bad4', 3);
        F('后果检查：从 40 沿 prior 回走：40 → 30 → s → s → s…… **死循环**！20 和 10 从反向链上永远消失；这个"链表"只有正向能用，反向已坏——这就是颠倒顺序的代价。', { stage: 'w5', sFloat: 25 }, 'bad5', 4);
        F('结论：四步的正确顺序本质是"**先用 ① s->prior 备份前驱，再用 ② 改前驱的 next**"。任何先改后备份的顺序都会丢信息。对照正确场景再走一遍。', { stage: 'w5' }, 'done');
        return { code: CODE_I, frames: frames };
      }
      if (op === 'del') {
        F('删除结点 20（红色）：双向链表不必遍历找前驱——p->prior 直接就是它。', { stage: 'start', p: 20, del: 20 });
        F('① p->prior->next = p->next：前驱 10 的 next 跨过 20 直接指向 30（蓝色新链），旧链 10→20 断开。', { stage: 'step1', p: 20, del: 20 }, 'del1', 0);
        F('② p->next->prior = p->prior：后继 30 的 prior 跨过 20 指向 10；20 的所有链接断开（红色虚线），释放 p → 10 ⇄ 30 ⇄ 40。', { stage: 'step2', p: 30, del: 20 }, 'del2', 1);
        list.splice(1, 1);
        F('两步改链完成，全程 O(1)。单链表要走到同样效果，得先从头遍历找前驱——O(n)。这就是"多一个 prior 指针"买来的能力。', { stage: 'done' }, 'done');
        return { code: CODE_D, frames: frames };
      }
      F('循环链表：尾结点 40 的 next **不指向 NULL**，而是指回头结点（蓝色回环链）。任务：假设手里只有尾结点 40，要走完全表——单链表此刻已经绝望（后面是 NULL），循环链表可以。', { stage: 'start', walk: 40 }, 'cyc0', 1);
      F('第 1 步：访问 40（尾结点）。沿它的 next 走——单链表这里就是 NULL 终结；循环链表走的是【蓝色回环链】。', { stage: 'walk', walk: 40 }, 'cyc1', 2);
      F('第 2 步：经回环链到达头结点 10。走到头了也没关系——继续沿 next 前进。', { stage: 'walk', walk: 10 }, 'cyc2', 3);
      F('第 3 步：访问 20。', { stage: 'walk', walk: 20 }, 'cyc3', 2);
      F('第 4 步：访问 30。全表 4 个结点从"尾结点出发"全部走完——单链表做不到，这就是循环的价值。', { stage: 'walk', walk: 30 }, 'cyc4', 2);
      F('意义②：若再设一个尾指针 rear，则 rear->next 就是头——表头与表尾的操作都 O(1)；两条循环链表合并只需改两次指针。', { stage: 'done' }, 'done');
      return { code: CODE_CYC, frames: frames };
    },
    render: function (s) {
      var W = 980, H = 470;
      var g = '';
      var nodes = s.nodes.slice();
      var insFloat = s.sFloat != null && s.stage !== 'warn';
      var cw = 64, gap = Math.max(44, Math.floor((W - 220) / Math.max(nodes.length, 1) - cw));
      var x0 = 110, y = 170;
      function pos(v2) {
        for (var i = 0; i < nodes.length; i++) if (String(nodes[i]) === String(v2)) return { x: x0 + i * (cw + gap), y: y, w: cw };
        if (s.sFloat != null && String(v2) === String(s.sFloat)) return { x: x0 + 1.5 * (cw + gap) - cw / 2, y: y + 112, w: cw };
        return null;
      }
      for (var i = 0; i < nodes.length; i++) {
        var x = x0 + i * (cw + gap);
        var isDel = s.del != null && String(nodes[i]) === String(s.del);
        var isWalk = s.walk != null && String(nodes[i]) === String(s.walk);
        var isP = s.p != null && String(nodes[i]) === String(s.p);
        var iso = isDel && s.stage === 'step2';
        g += h.rect(x, y, cw, 48, { fill: isDel ? C.redBg : isWalk ? C.greenBg : '#fff', stroke: isDel ? C.red : isWalk ? C.green : C.grey, rx: 7, sw: (isDel || isWalk) ? 2.6 : 1.7, dash: iso ? '5,4' : null });
        g += h.txt(x + cw / 2, y + 30, String(nodes[i]), { size: 16, w: 700, fill: iso ? C.red : C.ink });
        if (isP) { g += h.arrow(x + cw / 2, y - 42, x + cw / 2, y - 8, { stroke: C.amber, sw: 2.5 }); g += h.txt(x + cw / 2, y - 50, 'p', { size: 14, fill: C.amber, w: 700 }); }
        if (isWalk) g += h.txt(x + cw / 2, y - 34, '当前', { size: 11, fill: C.green, w: 700 });
        if (iso) g += h.txt(x + cw / 2, y + 66, '已隔离', { size: 10.5, fill: C.red, w: 700 });
      }
      if (s.sFloat != null && insFloat) {
        var sp = pos(s.sFloat);
        g += h.rect(sp.x, sp.y, cw, 48, { fill: C.blueBg, stroke: C.blue, rx: 7, sw: 2.4, dash: '6,4' });
        g += h.txt(sp.x + cw / 2, sp.y + 30, String(s.sFloat), { size: 16, w: 700, fill: C.blue });
        g += h.txt(sp.x + cw / 2, sp.y + 66, '新结点 s', { size: 11, fill: C.blue, w: 700 });
      }
      /* 同一条链上"两条 prior 的中点会撞在一起"（跨过中间结点时尤其明显），
         所以标签按占位记录逐个让位：next 往上抬、prior 往下压 */
      var placed = [];
      function tw(str, size) {
        var w = 0;
        for (var q = 0; q < str.length; q++) w += str.charCodeAt(q) > 255 ? size : size * 0.55;
        return w;
      }
      function put(x, y, str, o) {
        var w = tw(str, o.size), yy = y, n = 0;
        while (n++ < 6 && placed.some(function (p) {
          return Math.abs(p.x - x) < (p.w + w) / 2 + 3 && Math.abs(p.y - yy) < o.size + 4;
        })) yy += o.up ? -14 : 14;
        placed.push({ x: x, y: yy, w: w });
        g += h.txt(x, yy, str, o);
      }
      s.links.forEach(function (lk) {
        var A = pos(lk.f), B = pos(lk.t);
        if (!A || !B) return;
        var stroke = lk.st === 'new' ? C.blue : lk.st === 'cut' ? C.red : C.grey;
        var sw = lk.st === 'new' ? 2.8 : lk.st === 'cut' ? 1.8 : 1.7;
        if (String(lk.f) === String(lk.t)) {
          var lp = pos(lk.f);
          var lc = lk.st === 'cut' ? C.red : C.blue;
          g += h.curve(lp.x + 6, lp.y, lp.x + cw - 6, lp.y, lp.x + cw / 2, lp.y - 20, { stroke: lc, sw: 2.2, dash: lk.st === 'cut' ? '4,3' : null, head: 7 });
          g += h.txt(lp.x + cw / 2, lp.y - 26, '自环', { size: 10.5, fill: lc, w: 700 });
          return;
        }
        var involveS = (s.sFloat != null) && (String(lk.f) === String(s.sFloat) || String(lk.t) === String(s.sFloat));
        if (involveS) {
          var sxp = pos(s.sFloat);
          var fromNode = String(lk.f) === String(s.sFloat) ? sxp : A;
          var toNode = String(lk.t) === String(s.sFloat) ? sxp : B;
          var y1 = fromNode.y > y ? fromNode.y : fromNode.y + 48;
          var y2 = toNode.y > y ? toNode.y : toNode.y + 48;
          var mx = (fromNode.x + cw / 2 + toNode.x + cw / 2) / 2;
          g += h.curve(fromNode.x + cw / 2, y1, mx, (y1 + y2 + 48) / 2, toNode.x + cw / 2, y2,
            { stroke: stroke, sw: lk.st === 'new' ? 2.6 : lk.st === 'cut' ? 1.6 : 1.6, dash: lk.st === 'cut' ? '5,4' : null, head: 8 });
          return;
        }
        var top = lk.k === 'next';
        var yl = top ? Math.min(A.y, B.y) - 16 : Math.max(A.y, B.y) + 62;
        var x1 = A.x + A.w / 2, x2 = B.x + B.w / 2;
        if (lk.k === 'next' && x2 < x1) {
          /* 回环 next：从尾到头画上方大弧线 */
          g += h.curve(x1, y - 6, (x1 + x2) / 2, y - 92, x2, y - 6, { stroke: stroke, sw: sw, head: 8, dash: lk.st === 'cut' ? '5,4' : null });
          return;
        }
        if (lk.k === 'prior' && x2 > x1) {
          /* 回环 prior（头结点的 prior 指向尾结点）：跨过整排结点，画下方大弧线，
             否则它的标签会正好落在中间那条 prior 的标签上 */
          g += h.curve(x1, y + 54, (x1 + x2) / 2, y + 138, x2, y + 54, { stroke: stroke, sw: sw, head: 8, dash: lk.st === 'cut' ? '5,4' : null });
          put((x1 + x2) / 2, y + 156, lk.st === 'new' ? 'prior 新建（环）' : 'prior（环）',
            { size: 10.5, fill: lk.st === 'new' ? C.blue : C.muted, w: 700 });
          return;
        }
        if (lk.k === 'next') g += h.arrow(Math.min(x1, x2) + 6, yl, Math.max(x1, x2) - 6, yl, { stroke: stroke, sw: sw, head: 8, dash: lk.st === 'cut' ? '5,4' : null });
        else g += h.arrow(Math.max(x1, x2) - 6, yl, Math.min(x1, x2) + 6, yl, { stroke: stroke, sw: sw, head: 8, dash: lk.st === 'cut' ? '5,4' : null });
        var lx = (x1 + x2) / 2;
        if (lk.st === 'new') put(lx, top ? yl - 8 : yl + 16, lk.k === 'next' ? 'next 新建' : 'prior 新建', { size: 10.5, fill: C.blue, w: 700, up: top });
        else if (lk.st === 'cut') put(lx, top ? yl - 8 : yl + 16, '✗ 断开', { size: 10.5, fill: C.red, w: 700, up: top });
        else put(lx, top ? yl - 8 : yl + 14, lk.k, { size: 9.5, fill: C.muted, up: top });
      });
      if (s.op === 'cyc') {
        var lastP = pos(nodes[nodes.length - 1]), firstP = pos(nodes[0]);
        g += h.curve(lastP.x + cw / 2, y - 8, W / 2, 66, firstP.x + cw / 2, y - 8, { stroke: C.blue, sw: 2.6, head: 8 });
        g += h.txt(W / 2, 60, '尾结点 40 的 next 指回头结点（环）', { size: 12, fill: C.blue, w: 700 });
      }
      if (s.stage === 'warn') {
        g += h.rect(W / 2 - 250, 352, 500, 50, { fill: C.redBg, stroke: C.red, rx: 8 });
        g += h.txt(W / 2, 372, '✗ 顺序错误的后果：s->prior 无从设置——链已断', { size: 13.5, w: 700, fill: C.red });
        g += h.txt(W / 2, 392, '（若先执行了 ④ p->prior = s，再想执行 ① 时前驱信息已丢失）', { size: 11.5, fill: C.muted });
      }
      g += h.txt(W / 2, 442, '蓝=新建指针  红虚线=断开的旧指针  黄箭头=p  绿=遍历位置  上方箭头=next  下方箭头=prior', { size: 12, fill: C.muted });
      return h.svg(W, H, g);
    }
  });
})();
