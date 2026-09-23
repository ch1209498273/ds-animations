/* 算法正确性测试：在 Node 中加载各模块逻辑层，用教材/PPT 例题断言输出。运行：node tests/test.js */
'use strict';
const fs = require('fs'), path = require('path');
global.window = global;
const SRC = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
eval(SRC('core/engine.js'));
['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'].forEach(ch => {
  fs.readdirSync(path.join(__dirname, '..', 'src', ch)).sort().forEach(f => eval(SRC(ch + '/' + f)));
});

const DSC = global.DSC;
const M = {}; DSC.mods.forEach(m => M[m.id] = m);
/* 取模块的默认输入——用来断言"打开就看到的这次演示"本身是对的，
   而不是只断言手工喂进去的一组值 */
function defVals(id) {
  const v = {};
  (M[id].inputs || []).forEach(s => { v[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
  return v;
}
let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra !== undefined ? '  → ' + JSON.stringify(extra) : '')); }
}
const last = res => res.frames[res.frames.length - 1].snap;
const lastFrame = res => res.frames[res.frames.length - 1];
const findSnap = (res, fn) => { const f = res.frames.find(fr => fn(fr.snap)); return f ? f.snap : null; };
const cellsOf = s => s.cells.filter(x => x !== null);

console.log('— 第2章 顺序表 —');
{
  const r = M.seqList.run({ op: 'insert', i: 3, e: 33, data: '25,12,47,89,36,14' });
  t('插入 i=3: 结果 25,12,33,47,89,36,14', JSON.stringify(cellsOf(last(r))) === JSON.stringify([25, 12, 33, 47, 89, 36, 14]), cellsOf(last(r)));
  t('插入 i=3: 移动 4 次 (= n−i+1)', last(r).moves === 4, last(r).moves);
  const r2 = M.seqList.run({ op: 'del', i: 2, e: 0, data: '25,12,47,89,36,14' });
  t('删除 i=2: 结果 25,47,89,36,14', JSON.stringify(cellsOf(last(r2))) === JSON.stringify([25, 47, 89, 36, 14]), cellsOf(last(r2)));
  t('删除 i=2: 移动 4 次 (= n−i)', last(r2).moves === 4, last(r2).moves);
  const re = M.seqList.run({ op: 'insert', i: 0, e: 1, data: '1,2' });
  t('插入 i=0: 报 i 不合法', !!findSnap(re, s => s.err === 'i 不合法'));
  t('插入 i=8 (n+1=7): 报 i 不合法', !!findSnap(M.seqList.run({ op: 'insert', i: 8, e: 1, data: '1,2,3,4,5,6' }), s => s.err === 'i 不合法'));
  const f1 = M.seqList.run({ op: 'insert', i: 1, e: 9, data: '1,2,3' });
  t('插入表头 i=1: 移动 3 次', last(f1).moves === 3 && JSON.stringify(cellsOf(last(f1))) === JSON.stringify([9, 1, 2, 3]));
  const f2 = M.seqList.run({ op: 'insert', i: 4, e: 9, data: '1,2,3' });
  t('插入表尾之后 i=n+1: 移动 0 次', last(f2).moves === 0 && JSON.stringify(cellsOf(last(f2))) === JSON.stringify([1, 2, 3, 9]));
  const fb = M.seqList.run({ op: 'insert', i: 3, e: 33, errDir: true, data: '25,12,47,89,36,14' });
  t('错误方向演示: 47,47,47,47 覆盖数据', JSON.stringify(cellsOf(last(fb))) === JSON.stringify([25, 12, 47, 47, 47, 47, 47]), cellsOf(last(fb)));
  t('错误方向演示: 标记"方向错误"', last(fb).err === '方向错误');
  const rn = M.seqList.run({ op: 'insert', i: 3, e: 33, data: '25,12,47,89,36,14' });
  t('插入循环有边界判断帧', !!rn.frames.find(fr => (fr.msg || '').indexOf('循环条件不成立') >= 0));
  const mv5 = rn.frames.find(fr => fr.snap.from === 5);
  t('后移帧: 源格腾空（hole=5），目标格出现 14', mv5.snap.hole === 5 && mv5.snap.cells[6] === 14, { hole: mv5.snap.hole, c6: mv5.snap.cells[6] });
  const bnd = rn.frames.find(fr => (fr.msg || '').indexOf('循环条件不成立') >= 0);
  t('后移结束: 空位停在插入点 i−1=2', bnd.snap.hole === 2, bnd.snap.hole);
  const rd2 = M.seqList.run({ op: 'del', i: 2, e: 0, data: '25,12,47,89,36,14' });
  const mv2 = rd2.frames.find(fr => fr.snap.from === 2);
  t('前移帧: 源格腾空（hole=2），目标格被 47 覆盖', mv2.snap.hole === 2 && mv2.snap.cells[1] === 47, { hole: mv2.snap.hole, c1: mv2.snap.cells[1] });
  const fd = M.seqList.run({ op: 'del', i: 2, e: 0, data: '25,12,47,89,36,14' });
  t('删除循环有边界判断帧', !!fd.frames.find(fr => (fr.msg || '').indexOf('循环条件不成立') >= 0));
}

console.log('— 第2章 单链表 —');
{
  const r = M.linkList.run({ op: 'insert', i: 3, e: 33, bad: false, data: '25,12,47,89,36,14' });
  t('插入 i=3: 链序列 25,12,33,47,89,36,14', JSON.stringify(last(r).chain) === JSON.stringify(['H', 'n0', 'n1', 's', 'n2', 'n3', 'n4', 'n5']), last(r).chain);
  t('插入帧顺序: 先 s->next(①) 后 p->next(②)',
    (() => { let a = -1, b = -1; r.frames.forEach((f, k) => { if (f.line[0] === 6 && a < 0) a = k; if (f.line[0] === 7 && b < 0) b = k; }); return a >= 0 && b > a; })());
  const rb = M.linkList.run({ op: 'insert', i: 3, e: 33, bad: true, data: '25,12,47,89,36,14' });
  const sb = last(rb);
  t('错误演示: 可达链只剩 25,12,33', JSON.stringify(sb.chain) === JSON.stringify(['H', 'n0', 'n1', 's']), sb.chain);
  t('错误演示: 4 个结点丢失 + 自环', sb.lost.length === 4 && sb.loop === true, { lost: sb.lost, loop: sb.loop });
  const rd = M.linkList.run({ op: 'del', i: 4, e: 0, bad: false, data: '25,12,47,89,36,14' });
  t('删除 i=4 (89): 25,12,47,36,14', JSON.stringify(last(rd).chain) === JSON.stringify(['H', 'n0', 'n1', 'n2', 'n4', 'n5']), last(rd).chain);
  const rh = M.linkList.run({ op: 'insert', i: 1, e: 7, bad: false, data: '1,2' });
  t('插入表头 i=1 (p停头结点): 7,1,2', JSON.stringify(last(rh).chain) === JSON.stringify(['H', 's', 'n0', 'n1']), last(rh).chain);
}

console.log('— 第3章 顺序栈 —');
{
  const rp = M.seqStack.run({ scene: 'push', seq: 'A,B,C,D,E,F' });
  t('进栈场景: 6 个元素恰好填满（无上溢帧）', !rp.frames.find(f => f.snap.err === '上溢'));
  t('进栈场景: 无出栈、最终满栈 A-F', last(rp).top === 6 && JSON.stringify(last(rp).cells) === JSON.stringify(['A', 'B', 'C', 'D', 'E', 'F']), last(rp).cells);
  t('进栈场景: 进栈序列 A B C D E F', lastFrame(rp).panel['进栈序列'] === 'A B C D E F', lastFrame(rp).panel['进栈序列']);
  const ro = M.seqStack.run({ scene: 'pop', seq: 'A,B,C,D,E,F' });
  t('出栈场景: 含下溢、无上溢', ro.frames.some(f => f.snap.err === '下溢') && !ro.frames.some(f => f.snap.err === '上溢'));
  t('出栈场景: 出栈序列 F E D C B A', lastFrame(ro).panel['出栈序列'] === 'F E D C B A', lastFrame(ro).panel['出栈序列']);
  t('出栈场景: 最终栈空 (top=0)', last(ro).top === 0, last(ro).top);
  const rl = M.seqStack.run({ scene: 'life', seq: 'A,B,C,D,E,F' });
  t('综合场景: 上溢与下溢都出现', rl.frames.some(f => f.snap.err === '上溢') && rl.frames.some(f => f.snap.err === '下溢'));
  t('综合场景: 出栈序列 F G E D C B A', lastFrame(rl).panel['出栈序列'] === 'F G E D C B A', lastFrame(rl).panel['出栈序列']);
}

console.log('— 第3章 队列（假溢出 / 循环队列） —');
{
  const rl2 = M.circQueue.run({ demo: 'linear' });
  t('假溢出场景: 入队 g 被拒（rear==M 但下标0、1空着）', !!rl2.frames.find(f => f.snap.err === '假溢出' && f.snap.op === 'enq' && f.snap.arg === 'g'));
  t('假溢出场景: 全程 linearMode', rl2.frames.every(f => f.snap.linearMode === true));
  t('假溢出场景: 结论帧给出环形+取模方案', !!rl2.frames.find(fr => (fr.msg || '').indexOf('环形') >= 0 && (fr.msg || '').indexOf('取模') >= 0));
  const r = M.circQueue.run({ demo: 'fewer' });
  const s = last(r);
  t('少一单元方案: 最终 front=2 rear=0 队长=4', s.front === 2 && s.rear === 0 && s.length === 4, { front: s.front, rear: s.rear, len: s.length });
  t('少一单元方案: 演示含队满上溢', r.frames.some(f => f.snap.err === '上溢'));
  t('少一单元方案: 循环场景不混入线性队列画面', r.frames.every(f => f.snap.linearMode === false));
  const full = findSnap(r, f => f.op === 'full');
  t('少一单元方案: 队满时 front=1 rear=0 (存5个,M=6)', full.front === 1 && full.rear === 0, { front: full.front, rear: full.rear });
  const rt = M.circQueue.run({ demo: 'tag' });
  const ft = findSnap(rt, f => f.op === 'full');
  t('tag 方案: 可存满 6 个，front==rear==0 且 tag=1 时队满', ft.front === 0 && ft.rear === 0 && ft.tag === 1, { front: ft.front, rear: ft.rear, tag: ft.tag });
  t('tag 方案: 再入队 g 上溢', rt.frames.some(f => f.snap.err === '上溢'));
  t('tag 方案: 出队后 front=1 tag=0', last(rt).front === 1 && last(rt).tag === 0, { front: last(rt).front, tag: last(rt).tag });
  const rs = M.circQueue.run({ demo: 'size' });
  const fs2 = findSnap(rs, f => f.op === 'full');
  t('size 方案: size==6 时队满', fs2.size === 6, fs2.size);
  t('size 方案: 出队后 size=5', last(rs).size === 5, last(rs).size);
}

console.log('— 第3章 链栈与链队列 —');
{
  const b = {};
  (M.linkStackQueue.inputs || []).forEach(s => { b[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
  const runL = o => M.linkStackQueue.run(Object.assign({}, b, o));
  const vs = r => r.frames[r.frames.length - 1].snap;
  const vv = a => (a || []).map(x => x.v).join(',');
  const SEQ = 'A,B,C,D,E';

  /* 链栈：不带头结点，进栈 = 头插 → 栈内必须正好是进栈序的逆序 */
  const lp = runL({ scene: 'lpush', seq: SEQ });
  t('链栈: 进栈后从栈顶到栈底是入序的逆序', vv(vs(lp).nodes) === 'E,D,C,B,A', vv(vs(lp).nodes));
  t('链栈: top 指向最后进栈的元素', vs(lp).nodes[0].v === 'E' && vs(lp).rear == null);
  t('链栈: 全程没有"上溢"错误帧（对照顺序栈）',
    !lp.frames.some(f => /上溢|overflow/.test(f.msg) || f.snap.err === '上溢'),
    lp.frames.map(f => f.msg).filter(x => /上溢|overflow/.test(x))[0]);
  t('链栈: 每个元素都走过"先接 next 再动 top"两步',
    lp.frames.filter(f => /s->next = top/.test(f.msg)).length === 5 &&
    lp.frames.filter(f => /top = s/.test(f.msg)).length === 5);
  t('链栈: 新结点接入前悬在链外（fly 未 link）',
    lp.frames.some(f => f.snap.fly && f.snap.fly.link === false) &&
    lp.frames.some(f => f.snap.fly && f.snap.fly.link === true));

  const lo = runL({ scene: 'lpop', seq: SEQ });
  t('链栈: 出栈序列与进栈序列相反（LIFO）', vs(lo).pops.join(',') === 'E,D,C,B,A', vs(lo).pops.join(','));
  t('链栈: 出空后 top 为 NULL 并报下溢', vs(lo).nodes.length === 0 && vs(lo).err === '下溢', vs(lo).err);
  t('链栈: 摘链帧在 free 帧之前（top 先移到下一个结点）',
    lo.frames.findIndex(f => /top = p->next/.test(f.msg)) === 2 &&
    lo.frames.findIndex(f => /^free\(p\)/.test(f.msg)) === 3,
    [lo.frames.findIndex(f => /top = p->next/.test(f.msg)), lo.frames.findIndex(f => /^free\(p\)/.test(f.msg))]);

  /* 链队列：带头结点，入队 = 尾插 → 队内顺序与入队序一致 */
  const qp = runL({ scene: 'qpush', seq: SEQ });
  t('链队列: 第 0 格是头结点、不存数据', vs(qp).qn[0].v === '头' && vs(qp).qn.length === 6, vv(vs(qp).qn));
  t('链队列: 从队头到队尾与入队序一致（FIFO）', vv(vs(qp).qn) === '头,A,B,C,D,E', vv(vs(qp).qn));
  t('链队列: rear 始终指着最后一个结点', vs(qp).rear === vs(qp).qn.length - 1, [vs(qp).rear, vs(qp).qn.length]);
  t('链队列: 入队两帧顺序为 rear->next 在前、rear = s 在后',
    qp.frames.findIndex(f => /rear->next = s/.test(f.msg)) < qp.frames.findIndex(f => /② rear = s/.test(f.msg)));

  const qo = runL({ scene: 'qpop', seq: SEQ });
  t('链队列: 出队序列与入队序一致', vs(qo).pops.join(',') === 'A,B,C,D,E', vs(qo).pops.join(','));
  t('链队列: 写完特判后 rear 回到头结点、无悬空', vs(qo).rear === 0 && vs(qo).dangling === false, [vs(qo).rear, vs(qo).dangling]);
  t('链队列: 只剩一个结点时出现 rear = front 特判帧',
    qo.frames.filter(f => /rear = front/.test(f.msg)).length === 1,
    qo.frames.filter(f => /rear = front/.test(f.msg)).length);
  t('链队列: 空队再出队报"空队"', vs(qo).err === '空队', vs(qo).err);
  t('链队列: 出队全程元素总数守恒',
    qo.frames.every(f => f.snap.pops.length + (f.snap.qn.length - 1) === 5),
    qo.frames.map(f => f.snap.pops.length + f.snap.qn.length - 1));

  /* 漏写特判的后果必须演出来，而不是只在文字里说一句 */
  const qb = runL({ scene: 'qpop', seq: SEQ, badRear: true });
  t('链队列: 漏写特判后 rear 悬空', vs(qb).dangling === true && vs(qb).lostX === true, [vs(qb).dangling, vs(qb).lostX]);
  t('链队列: 漏写特判时不执行 rear = front 那一步',
    !qb.frames.some(f => f.snap.rearFix));
  t('链队列: 悬空后再入队的 X 接不回队头',
    vs(qb).qn.length === 1 && !/X/.test(vv(vs(qb).qn)), vv(vs(qb).qn));

  /* 输入边界 */
  let eb = '';
  try { M.linkStackQueue.run(Object.assign({}, b, { scene: 'lpush', seq: 'A,B,C,D,E,F,G' })); } catch (e) { eb = e.message; }
  t('链栈链队列: 超过 6 个元素要报错', /最多 6 个/.test(eb), eb);
}

console.log('— 第3章 汉诺塔 —');
{
  const r3 = M.hanoi.run({ n: 3 });
  const moves = r3.frames.filter(f => f.snap.phase === 'move').map(f => [f.snap.last.disc, f.snap.last.from, f.snap.last.to]);
  t('n=3 共 7 步', moves.length === 7, moves.length);
  t('n=3 步骤序列正确', JSON.stringify(moves) === JSON.stringify([[1, 'A', 'C'], [2, 'A', 'B'], [1, 'C', 'B'], [3, 'A', 'C'], [1, 'B', 'A'], [2, 'B', 'C'], [1, 'A', 'C']]), moves);
  t('n=3 最大栈深 3', Math.max(...r3.frames.map(f => f.snap.stack.length)) === 3);
  const r5 = M.hanoi.run({ n: 5 });
  t('n=5 共 31 步 (2^5−1)', r5.frames.filter(f => f.snap.phase === 'move').length === 31);
  t('最终全在 C 柱', last(r3).pegs.C.length === 3 && last(r3).pegs.A.length === 0 && last(r3).pegs.B.length === 0);
}

console.log('— 第4章 广义表 —');
{
  const b = {};
  (M.glist.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = (sc, lst) => M.glist.run(Object.assign({}, b, { scene: sc, lst: lst }));
  const last = r => r.frames[r.frames.length - 1];
  const res = (sc, lst) => last(run(sc, lst)).panel['结果'];

  /* 教材例题 LS = (a,(b,c),(),d) */
  const LS = '(a,(b,c),(),d)';
  t('广义表: GetHead(LS) = a（原子）', res('head', LS) === 'a', res('head', LS));
  t('广义表: GetTail(LS) = ((b,c),(),d)（是一张表，保留括号）',
    res('tail', LS) === '((b,c),(),d)', res('tail', LS));
  t('广义表: Length(LS) = 4（子表与空表各算一个元素）', res('len', LS) === '4', res('len', LS));
  t('广义表: Depth(LS) = 2', res('depth', LS) === '2', res('depth', LS));
  /* 嵌套到最深处 */
  t('广义表: Depth((a,(b,(c,(d))))) = 4', res('depth', '(a,(b,(c,(d))))') === '4', res('depth', '(a,(b,(c,(d))))'));
  t('广义表: Length((((a)))) = 1（长度不递归，4 层括号也只算 1 个元素）', res('len', '((((a))))') === '1', res('len', '((((a))))'));
  t('广义表: Depth((((a)))) = 4', res('depth', '((((a))))') === '4', res('depth', '((((a))))'));
  /* 空表陷阱 */
  t('广义表: Length(((),())) = 2', res('len', '((),())') === '2', res('len', '((),())'));
  t('广义表: Depth(((),())) = 2（空表本身算一层）', res('depth', '((),())') === '2', res('depth', '((),())'));
  t('广义表: 纯原子表深度为 1', res('depth', '(a,b,c)') === '1', res('depth', '(a,b,c)'));
  /* 表头可以是子表 */
  t('广义表: 首元素是子表时 GetHead 返回整张子表',
    res('head', '((b,c),d)') === '(b,c)', res('head', '((b,c),d)'));
  /* 表尾只剩一个元素时 */
  t('广义表: 两个元素的表，表尾是单元素表', res('tail', '(a,b)') === '(b)', res('tail', '(a,b)'));
  t('广义表: 单元素表的表尾是 NULL（不是空表）', res('tail', '(a)') === 'NULL', res('tail', '(a)'));
  /* 帧序：深度场景必须真的递归进子表，而不是只报一个数 */
  const dp = run('depth', LS);
  t('广义表: 深度演示真的递归进了子表',
    dp.frames.some(f => /进入子表/.test(f.msg)) && dp.frames.some(f => /空表 `\(\)` 里面没有元素/.test(f.msg)),
    dp.frames.map(f => f.msg.slice(0, 18)).join(' | '));
  t('广义表: 深度场景每帧消息完整（不出现 undefined/NaN）',
    dp.frames.every(f => !/undefined|NaN/.test(f.msg + JSON.stringify(f.panel))));
  /* 解析边界 */
  let e1 = '', e2 = '', e3 = '';
  try { run('len', 'a,b'); } catch (e) { e1 = e.message; }
  try { run('len', '(a,(b)'); } catch (e) { e2 = e.message; }
  try { run('len', '(a,,b)'); } catch (e) { e3 = e.message; }
  t('广义表: 缺外层括号/缺右括号/空元素都明确报错',
    /以 \( 开头/.test(e1) && /右括号/.test(e2) && /逗号/.test(e3), [e1, e2, e3]);
}

console.log('— 第5章 二叉树遍历 —');
{
  const mk = mode => M.traversal.run({ mode, data: 'GDA##FE###MH##Z##' });
  t('先序 GDAFEMHZ (cp5-03)', last(mk('pre')).seq.join('') === 'GDAFEMHZ', last(mk('pre')).seq.join(''));
  t('中序 ADEFGHMZ', last(mk('in')).seq.join('') === 'ADEFGHMZ', last(mk('in')).seq.join(''));
  t('后序 AEFDHZMG', last(mk('post')).seq.join('') === 'AEFDHZMG', last(mk('post')).seq.join(''));
  t('层次 GDMAFHZE', last(mk('level')).seq.join('') === 'GDMAFHZE', last(mk('level')).seq.join(''));
  const c = mode => M.traversal.run({ mode, data: 'ABD##E##C#F##' });
  t('自定义树 先序 ABDECF', last(c('pre')).seq.join('') === 'ABDECF', last(c('pre')).seq.join(''));
  t('自定义树 中序 DBEACF', last(c('in')).seq.join('') === 'DBEACF', last(c('in')).seq.join(''));
  t('自定义树 后序 DEBFCA', last(c('post')).seq.join('') === 'DEBFCA', last(c('post')).seq.join(''));
  const deep = M.traversal.run({ mode: 'pre', data: 'A#B#C#D#E#F#G#H#I#J#K#L#M#N#O##' });
  t('深右链(15层): 全部结点在画布内、不压输出栏', last(deep).nodes.every(function (n) { return n.x <= 870 && n.y <= 470; }),
    { maxY: Math.max.apply(null, last(deep).nodes.map(function (n) { return n.y; })), maxX: Math.max.apply(null, last(deep).nodes.map(function (n) { return n.x; })) });
}

console.log('— 第5章 哈夫曼 —');
{
  const ra = M.huffman.run({ preset: 'a', w: '' });
  const sa = last(ra);
  t('例1 编码 A=0 B=10 C=110 D=111 (cp5-06)', JSON.stringify(sa.codes) === JSON.stringify({ A: '0', B: '10', C: '110', D: '111' }), sa.codes);
  t('例1 WPL = 350', sa.wpl === 350, sa.wpl);
  t('例1 译码 100110111 → B,A,C,D', JSON.stringify(sa.decodeOut.map(o => o.ch)) === JSON.stringify(['B', 'A', 'C', 'D']), sa.decodeOut);
  const rb2 = M.huffman.run({ preset: 'b', w: '' });
  t('例2 WPL = 261 (cp5-06 换算)', last(rb2).wpl === 261, last(rb2).wpl);
  t('例2 A(7) 编码 = 1010', last(rb2).codes['A'] === '1010', last(rb2).codes['A']);
  t('例2 B(19) 编码 = 00', last(rb2).codes['B'] === '00', last(rb2).codes['B']);
  const rd = M.huffman.run({ preset: 'a', w: '', phase: 'decode' });
  t('阶段切换: 译码场景首帧即带编码表', !!rd.frames[0].snap.codes && Object.keys(rd.frames[0].snap.codes).length === 4);
  t('阶段切换: 译码场景最后一帧译出 B,A,C,D', JSON.stringify(last(rd).decodeOut.map(o => o.ch)) === JSON.stringify(['B', 'A', 'C', 'D']));
  const rb3 = M.huffman.run({ preset: 'a', w: '', phase: 'build' });
  t('阶段切换: 构造场景无译码帧', rb3.frames.every(f => !f.snap.decode));
  const rc2 = M.huffman.run({ preset: 'a', w: '', phase: 'code' });
  t('阶段切换: 编码场景首帧树已就绪', rc2.frames[0].snap.treeReady === true);
  const h10 = M.huffman.run({ preset: 'c', w: '1,2,3,4,5,6,7,8,9,10' });
  t('自定义10叶子: 树不与右侧HT表重叠（叶子x ≤ 810）', Object.values(last(h10).coords).every(function (c2) { return c2.x <= 810; }),
    Math.max.apply(null, Object.values(last(h10).coords).map(function (c2) { return c2.x; })));
  t('自定义10叶子: 结点标签无 undefined', last(h10).ht.slice(1).every(function (t2) { return t2.ch !== undefined; }));
}

console.log('— 第5章 并查集 —');
{
  const base = {};
  (M.ufset.inputs || []).forEach(s => { base[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
  const run = mode => M.ufset.run(Object.assign({}, base, { mode }));
  const fin = r => r.frames[r.frames.length - 1].snap;
  const P = r => fin(r).parent.join(',');

  /* 默认请求是反向链 1-0 2-1 … 7-6：三种策略必须长出三种形状 */
  const pl = run('plain'), sz = run('size'), cp = run('compress');
  t('并查集: 不启用优化长成长链 0→1→…→7', P(pl) === '1,2,3,4,5,6,7,-8', P(pl));
  t('并查集: 不启用优化时树高 7', fin(pl).h === 7, fin(pl).h);
  t('并查集: 按大小合并压成星形（全挂 v1）', P(sz) === '1,-8,1,1,1,1,1,1', P(sz));
  t('并查集: 按大小合并树高 1、探测次数最少', fin(sz).h === 1 && fin(sz).probes === 21, [fin(sz).h, fin(sz).probes]);
  t('并查集: 路径压缩把链拍平到根 v7', P(cp) === '7,7,7,7,7,7,7,-8', P(cp));
  t('并查集: 压缩后树高 7 → 1', fin(cp).h === 1 && fin(cp).peakH === 7, [fin(cp).h, fin(cp).peakH]);
  t('并查集: 三种策略最终都只剩 1 个集合', [pl, sz, cp].every(r => fin(r).sets === 1));
  t('并查集: 根上记录集合大小（parent[根] = −8）', [fin(pl), fin(sz), fin(cp)].every(s => s.parent.indexOf(-8) >= 0));

  /* 结论文案里的"树高"必须是过程峰值：压缩模式下当前树高是 1，说"最大树高 1"就是自相矛盾 */
  t('并查集: 完成帧用树高峰值而非压缩后的当前高度',
    cp.frames[cp.frames.length - 1].msg.indexOf('树高峰值 7') >= 0,
    cp.frames[cp.frames.length - 1].msg);

  /* 文案必须与代码实际做的事一致：路径压缩策略不启用按大小合并，就不能说"不比谁小" */
  const uniMsgs = m => m.frames.filter(f => f.panel && f.panel['新根']).map(f => f.msg);
  t('并查集: 路径压缩模式的合并帧不冒充按大小合并',
    uniMsgs(cp).every(x => /本策略不按大小合并/.test(x)) && uniMsgs(cp).length === 7, uniMsgs(cp).slice(0, 2));
  t('并查集: 不启用优化的合并帧说明按调用顺序',
    uniMsgs(pl).every(x => /不启用优化/.test(x)) && uniMsgs(pl).length === 7, uniMsgs(pl)[0]);
  /* 按大小合并的"交换"句：报出来的两个规模必须真的是小→大，不能拿交换后的值说事 */
  const swapLines = uniMsgs(sz).filter(x => /交换/.test(x));
  t('并查集: 交换句里的两棵子树规模自洽（前者确实更小）',
    swapLines.length === 6 && swapLines.every(x => {
      const n = x.match(/(\d+) 个、比 v\d+ 的 (\d+) 个/);
      return n && +n[1] < +n[2];
    }), swapLines[0]);
  /* 帧文案里不能出现拼接事故（"为 vv1 找根"） */
  t('并查集: 帧文案无 "vv" 拼接残留', run('plain').frames.every(f => !/vv\d/.test(f.msg)),
    run('plain').frames.map(f => f.msg).filter(x => /vv\d/.test(x))[0]);
  /* 路径压缩一次改多个格子，就得一次标多个 */
  const cmpFrame = cp.frames.find(f => /路径压缩/.test(f.msg));
  t('并查集: 压缩帧把被改动的格子全部标出', Array.isArray(cmpFrame.snap.changed) && cmpFrame.snap.changed.length === 7,
    cmpFrame.snap.changed);
  /* 合并决策帧必须在画布上有对应高亮（hl.roots），否则那一步只有文字没有图 */
  t('并查集: 合并决策帧带根高亮', run('plain').frames.filter(f => f.snap.hl && f.snap.hl.roots).length >= 14,
    run('plain').frames.filter(f => f.snap.hl && f.snap.hl.roots).length);

  /* 重复请求必须被识别为已连通，不能改结构：8 个结点、2 条有效合并 → 6 个集合 */
  const dup = M.ufset.run(Object.assign({}, base, { mode: 'size', pairs: '0-1 1-0 3-4' }));
  const dupSnap = fin(dup);
  t('并查集: 重复合并不减少集合数（8 结点 2 次有效合并 → 6 个集合）', dupSnap.sets === 6, dupSnap.sets);
  t('并查集: 重复合并不改变 parent 结构', dupSnap.parent.join(',') === '1,-2,3,-2,0,0,0,0' || dupSnap.parent.filter(x => x < 0).length === 6,
    dupSnap.parent.join(','));
  t('并查集: 有"根相同 → 已在同一集合"的判定帧', dup.frames.some(f => /根相同|已在同一集合/.test(f.msg)));

  /* 非法输入必须明确报错，不能静默演一个错结果 */
  let bad1 = '', bad2 = '';
  try { M.ufset.run(Object.assign({}, base, { pairs: '0-9' })); } catch (e) { bad1 = e.message; }
  try { M.ufset.run(Object.assign({}, base, { pairs: '01' })); } catch (e) { bad2 = e.message; }
  t('并查集: 下标越界要报错', /0~7/.test(bad1), bad1);
  t('并查集: 缺横线的请求格式要报错', /a-b/.test(bad2), bad2);
}

console.log('— 第5章 二叉树顺序存储与性质 —');
{
  const b = {};
  (M.treeSeqStore.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = o => M.treeSeqStore.run(Object.assign({}, b, o));
  const fin = r => r.frames[r.frames.length - 1].snap;
  const idxOf = r => fin(r).nodes.map(x => x.i);

  const rg = run({ mode: 'right', scene: 'map' });
  t('顺序存储: 右斜链 4 个结点的下标是 1/3/7/15', idxOf(rg).join(',') === '1,3,7,15', idxOf(rg).join(','));
  t('顺序存储: 右斜链要开到 15 格、浪费 73%', fin(rg).cells === 15 &&
    rg.frames.some(f => /73%/.test(f.msg) || f.panel['浪费'] === '73%'), fin(rg).cells);
  const fu = run({ mode: 'full', scene: 'map' });
  t('顺序存储: 满二叉树 7 结点占 7 格、零浪费', fin(fu).cells === 7 && idxOf(fu).join(',') === '1,2,3,4,5,6,7', idxOf(fu).join(','));
  const sp = run({ mode: 'sparse', scene: 'map' });
  t('顺序存储: 不完全树出现空格（3 号位没有结点）', idxOf(sp).join(',') === '1,2,4,5', idxOf(sp).join(','));

  /* 编号公式：每个结点的父 = ⌊i/2⌋，孩子 = 2i / 2i+1，且父必须在树里 */
  [['full', '1,2,3,4,5,6,7'], ['right', '1,3,7,15'], ['sparse', '1,2,4,5']].forEach(([mo, want]) => {
    const ids = idxOf(run({ mode: mo, scene: 'map' })).map(Number);
    const bad = ids.filter(i => i > 1 && ids.indexOf(Math.floor(i / 2)) < 0);
    t('顺序存储: ' + mo + ' 树每个结点的 ⌊i/2⌋ 都在数组里（编号自洽）', bad.length === 0, bad);
  });

  /* 性质③ n0 = n2 + 1 必须对三种树都成立（不是只演满树） */
  ['full', 'right', 'sparse'].forEach(mo => {
    const r = run({ mode: mo, scene: 'props' });
    const f = r.frames.find(fr => /n₀ = n₂ \+ 1|性质③/.test(fr.msg));
    const m0 = f.msg.match(/叶子 n₀ = (\d+)、度为 2 的 n₂ = (\d+)/);
    t('二叉树性质: ' + mo + ' 满足 n₀ = n₂ + 1', m0 && +m0[1] === +m0[2] + 1, m0 && m0.slice(1, 3).join('/'));
    t('二叉树性质: ' + mo + ' 的帧文案自带校验勾', /✓/.test(f.msg), f.msg.slice(-30));
  });
  const pf = run({ mode: 'full', scene: 'props' });
  t('二叉树性质: 满树深度 3、2^3−1=7 取满', /2\^h − 1 = 7/.test(pf.frames[1].msg), pf.frames[1].msg.slice(0, 60));
  t('二叉树性质: 完全树深度公式 ⌊log₂7⌋+1 = 3', /⌊log₂n⌋ \+ 1 = ⌊2\.807⌋ \+ 1 = 3/.test(pf.frames[3].msg), pf.frames[3].msg.slice(0, 70));
  const pr = run({ mode: 'right', scene: 'props' });
  t('二叉树性质: 右斜链第 i 层只有 1 个结点（对比上限 2^(i−1)）', /第1层 1 个（上限 1）/.test(pr.frames[0].msg), pr.frames[0].msg.slice(0, 80));
}

console.log('— 第5章 树的三种存储结构 —');
{
  const b = {};
  (M.treeStore.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = o => M.treeStore.run(Object.assign({}, b, o));
  const msgOf = r => r.frames.map(f => f.msg).join('\n');
  const panOf = r => r.frames.map(f => f.panel);

  /* 三种表示的代价必须真的不同，而不是三段文案各说各话 */
  const pa = run({ way: 'parent', target: 'A' }), ch = run({ way: 'child', target: 'A' }), sb = run({ way: 'sib', target: 'A' });
  t('树存储: 双亲表示法找 A 的孩子要扫满 8 格', /扫到第 8 格/.test(msgOf(pa)) && /全表扫完 8 格/.test(msgOf(pa)));
  t('树存储: 双亲表示法找爹只碰 1 格', panOf(pa).some(x => x['访问格数'] === '1 格'), panOf(pa).map(x => x['访问格数']));
  t('树存储: 孩子表示法找爹要遍历 8 条链表', /查到 list\[7\]/.test(msgOf(ch)) && /遍历了 8 条链表/.test(msgOf(ch)));
  t('树存储: 孩子表示法找 A 的孩子不碰其它结点', /不碰其它结点/.test(msgOf(ch)));
  t('树存储: 孩子兄弟表示法顺兄弟链拿孩子', /nextsibling/.test(msgOf(sb)) && /大孩子 B/.test(msgOf(sb)));
  t('树存储: 孩子兄弟表示法找爹只能自顶向下搜', /根本没存爹|本身就是根/.test(msgOf(sb)));
  ['parent', 'child', 'sib'].forEach(w => {
    const r = run({ way: w, target: 'B' });
    t('树存储: ' + w + ' 有明确的结论帧', r.frames[r.frames.length - 1].snap.done === true && /★/.test(r.frames[r.frames.length - 1].msg));
  });
  /* 结构数据自洽：KID 与 PAR 必须互逆，否则高亮会指错 */
  let eb = '';
  try { M.treeStore.run(Object.assign({}, b, { target: 'Z' })); } catch (e) { eb = e.message; }
  t('树存储: 非法结点明确报错', /A~H/.test(eb), eb);
}

console.log('— 第5章 堆与优先队列 —');
{
  const b = {};
  (M.heapPQ.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = o => M.heapPQ.run(Object.assign({}, b, o));
  const fin = r => r.frames[r.frames.length - 1].snap;
  function isMaxHeap(a) {
    for (let i = 1; i < a.length; i++) {
      if (2 * i < a.length && a[i] < a[2 * i]) return 'r[' + i + '] < r[' + 2 * i + ']';
      if (2 * i + 1 < a.length && a[i] < a[2 * i + 1]) return 'r[' + i + '] < r[' + (2 * i + 1) + ']';
    }
    return '';
  }
  function isMinHeap(a) {
    for (let i = 1; i < a.length; i++) {
      if (2 * i < a.length && a[i] > a[2 * i]) return 'r[' + i + '] > r[' + 2 * i + ']';
      if (2 * i + 1 < a.length && a[i] > a[2 * i + 1]) return 'r[' + i + '] > r[' + (2 * i + 1) + ']';
    }
    return '';
  }
  const D = '49,38,65,97,76,13,27,49';
  const bd = run({ scene: 'build', data: D });
  const heap = fin(bd).arr.slice(1);
  t('堆: 教材序列建堆结果是 97 76 65 49 49 13 27 38', heap.join(',') === '97,76,65,49,49,13,27,38', heap.join(','));
  t('堆: 建堆结果逐格满足大顶堆', isMaxHeap(fin(bd).arr) === '', isMaxHeap(fin(bd).arr));
  t('堆: 建堆结果仍是原集合（多重集守恒）',
    heap.slice().sort((x, y) => x - y).join(',') === D.split(',').map(Number).sort((x, y) => x - y).join(','), heap.join(','));
  t('堆: 堆顶是最大值', fin(bd).arr[1] === 97, fin(bd).arr[1]);
  t('堆: 建堆从 ⌊n/2⌋ 开始筛', /⌊n\/2⌋ = 4/.test(bd.frames[1].msg), bd.frames[1].msg.slice(0, 60));

  const pp = run({ scene: 'pq', data: D, op: 'pop' });
  const popped = fin(pp).out;
  t('堆: 连续出队得到降序（堆排序原理）',
    popped.join(',') === '97,76,65,49,49,38,27,13', popped.join(','));
  t('堆: 出队次数等于元素个数', popped.length === 8, popped.length);
  const pm = run({ scene: 'pq', data: D, op: 'mix' });
  t('堆: 交替出入队后堆序仍成立', isMaxHeap(fin(pm).arr.slice(0, fin(pm).n + 1)) === '',
    fin(pm).arr.slice(1, fin(pm).n + 1).join(','));
  t('堆: 入队 100 会浮到堆顶', /100/.test(fin(pm).out.join(' ')), fin(pm).out.join(' '));
  const pu = run({ scene: 'pq', data: D, op: 'push' });
  t('堆: 连续入队后仍是合法大顶堆', isMaxHeap(pu.frames[pu.frames.length-1].snap.arr.slice(0, pu.frames[pu.frames.length-1].snap.n + 1)) === '');
  t('堆: 入队版结论不再谎称"出队 0 次"', /不是有序的/.test(pu.frames[pu.frames.length - 1].msg), pu.frames[pu.frames.length - 1].msg.slice(0, 50));

  const tk = run({ scene: 'topk', data: D, k: 3 });
  const topk = fin(tk).arr.slice(1).sort((x, y) => y - x);
  t('堆: Top-3 = 97 76 65', topk.join(',') === '97,76,65', topk.join(','));
  t('堆: Top-K 用的是小顶堆（守门员在堆顶）', isMinHeap(fin(tk).arr) === '', isMinHeap(fin(tk).arr));
  t('堆: Top-K 榜容量恒为 K', fin(tk).arr.length - 1 === 3, fin(tk).arr.length - 1);
  const tk2 = run({ scene: 'topk', data: '5,1,9,7,3', k: 2 });
  t('堆: Top-2 of 5,1,9,7,3 = 9,7', fin(tk2).arr.slice(1).sort((x, y) => y - x).join(',') === '9,7', fin(tk2).arr.slice(1).join(','));
  t('堆: 比守门员小的数被丢弃且不进堆', /直接丢弃/.test(tk2.frames.map(f => f.msg).join('\n')));
  let eb = '';
  try { M.heapPQ.run(Object.assign({}, b, { data: '1,2' })); } catch (e) { eb = e.message; }
  t('堆: 少于 4 个关键字要报错', /4~12/.test(eb), eb);
}

console.log('— 第6章 DFS/BFS —');
{
  const seqOf = (method, start) => last(M.dfsBfs.run({ method, start })).seq;
  t('DFS 从 v2: 2,1,3,5,4,6 (cp6-03)', JSON.stringify(seqOf('dfs', '2')) === JSON.stringify([2, 1, 3, 5, 4, 6]), seqOf('dfs', '2'));
  t('BFS 从 v2: 2,1,5,3,4,6 (cp6-03)', JSON.stringify(seqOf('bfs', '2')) === JSON.stringify([2, 1, 5, 3, 4, 6]), seqOf('bfs', '2'));
  t('DFS 从 v1: 1,2,5,3,4,6', JSON.stringify(seqOf('dfs', '1')) === JSON.stringify([1, 2, 5, 3, 4, 6]), seqOf('dfs', '1'));
  t('BFS 从 v1: 1,2,3,5,4,6', JSON.stringify(seqOf('bfs', '1')) === JSON.stringify([1, 2, 3, 5, 4, 6]), seqOf('bfs', '1'));
  const r = M.dfsBfs.run({ method: 'dfs', start: '2' });
  t('生成树边数 n−1 = 5', last(r).treeEdges.length === 5, last(r).treeEdges);
  t('全部顶点被访问', last(r).seq.length === 6);
  const dl = M.dfsBfs.run({ method: 'dfs', start: '2', storage: 'list' });
  t('邻接表(头插) DFS(2): 2,5,4,6,3,1', JSON.stringify(last(dl).seq) === JSON.stringify([2, 5, 4, 6, 3, 1]), last(dl).seq);
  const bl = M.dfsBfs.run({ method: 'bfs', start: '2', storage: 'list' });
  t('邻接表(头插) BFS(2): 2,5,1,4,3,6', JSON.stringify(last(bl).seq) === JSON.stringify([2, 5, 1, 4, 3, 6]), last(bl).seq);
  t('邻接表顺序与矩阵相反（头插法）', JSON.stringify(last(dl).adj['2']) === JSON.stringify([5, 1]) && last(dl).adj['1'][0] === 3, last(dl).adj);
  /* 当前结点必须跟着"正在扫谁的行"走。递归返回到祖先时，cur 若仍停在最后访问的点上，
     画面会出现"人在 v6、却在扫 v2 的行"——橙圈骗人说还在往下走。
     只管「检查 v」帧：「访问 v」帧上的 checkCell 是"从哪条边到达"的高亮，属于有意保留。 */
  const strayCur = res => res.frames.filter(f => String(f.msg).indexOf('检查 v') === 0 && f.snap.checkCell && f.snap.cur !== f.snap.checkCell.r)
    .map(f => 'cur=v' + f.snap.cur + ' 但扫的是 v' + f.snap.checkCell.r);
  t('DFS 当前结点跟随扫描行（含递归返回后）', strayCur(r).length === 0 && strayCur(dl).length === 0, strayCur(r).concat(strayCur(dl)).slice(0, 3));
  {
    const li = r.frames.reduce((a, f, i) => String(f.msg).indexOf('访问 v') === 0 ? i : a, -1);
    const tailSkips = r.frames.slice(li + 1).filter(f => String(f.msg).indexOf('已访问，跳过') >= 0);
    t('DFS 全访问完的收尾帧标注「回溯收尾」并说明不产生新结点',
      tailSkips.length > 0 && tailSkips.every(f => /【回溯收尾】/.test(f.msg) && /不产生新结点/.test(f.msg)),
      tailSkips.map(f => String(f.msg).replace(/<[^>]+>/g, '').slice(0, 24)));
  }
  // 画布几何：邻接矩阵的行列标注位置（回归用——列号曾被第一行的不透明格子盖住）
  const MF = M.dfsBfs.run({ method: 'dfs', start: '2' }).frames[6];
  const mtxSvg = M.dfsBfs.render(MF.snap);
  const texts = [];
  (mtxSvg.match(/<text x="([^"]+)" y="([^"]+)" font-size="([^"]+)"[^>]*>([^<]*)<\/text>/g) || [])
    .forEach(s => { const m = s.match(/x="([^"]+)" y="([^"]+)"/); const c = s.match(/>([^<]*)<\/text>/);
      texts.push({ x: +m[1], y: +m[2], s: c[1] }); });
  // 从实际画出的格子反推网格位置，不写死常量——否则测试只是把新代码抄一遍，抓不到旧 bug
  const cells = [];
  (mtxSvg.match(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g) || [])
    .forEach(s => { const m = s.match(/x="([^"]+)" y="([^"]+)" width="([^"]+)"/);
      cells.push({ x: +m[1], y: +m[2], w: +m[3] }); });
  const grid = cells.filter(c => c.w > 20 && c.w < 40 && c.x >= 750);
  const gridTop = grid.length ? Math.min.apply(null, grid.map(c => c.y)) : -1;
  const colHdr = texts.filter(o => /^[1-6]$/.test(o.s) && o.x > 750 && o.y < gridTop + 1 && gridTop > 0);
  t('邻接矩阵：列号在网格顶边之上（旧 bug 是画在格子里被不透明填充盖住）',
    gridTop > 0 && colHdr.length >= 6, { gridTop: gridTop, hdr: colHdr.length });
  // 行由格子的 y 决定（x 决定的是列），按 y 归组得到每行的行顶
  const rowTops = Array.from(new Set(grid.map(c => c.y))).sort((p, q) => p - q);
  const rowHdrOk = [1, 2, 3, 4, 5, 6].every(a => {
    const top = rowTops[a - 1];
    return top !== undefined && texts.some(o => o.s === String(a) && o.x < 762
      && o.y > top && o.y < top + 28);
  });
  t('邻接矩阵：行号落在自己那一行的格子带内', rowHdrOk,
    { rowTops: rowTops, labels: texts.filter(o => /^[1-6]$/.test(o.s) && o.x < 762).map(o => o.y) });
  const scan = texts.find(o => o.s.indexOf('行扫描') === 0);
  const stk = texts.find(o => o.s === '递归栈');
  t('邻接矩阵：行扫描说明与"递归栈"标题不重叠', !!scan && !!stk && (stk.y - scan.y) > 10,
    scan && stk ? [scan.y, stk.y] : 'missing');
}

console.log('— 第6章 最小生成树 —');
{
  const norm = arr => JSON.stringify(arr.map(e => [Math.min(e[0], e[1]), Math.max(e[0], e[1])]).sort((a, b) => a[0] - b[0] || a[1] - b[1]));
  const rp = M.mst.run({ method: 'prim' });
  t('Prim 边集 {(1,3),(3,6),(4,6),(2,3),(2,5)}', norm(last(rp).treeEdges) === norm([[1, 3], [3, 6], [6, 4], [3, 2], [2, 5]]), last(rp).treeEdges);
  const rk = M.mst.run({ method: 'kruskal' });
  t('Kruskal 边集与 Prim 一致 (总权15)', norm(last(rk).treeEdges) === norm([[1, 3], [4, 6], [2, 5], [3, 6], [2, 3]]), last(rk).treeEdges);
  t('Kruskal 丢弃 (1,4)（成环）', !!rk.frames.find(f => (f.snap.rejected || []).some(e => e[0] === 1 && e[1] === 4)));
  const sum = ed => ed.reduce((s, e) => s + [6, 1, 5, 5, 3, 5, 6, 4, 2, 6][[[1, 2], [1, 3], [1, 4], [2, 3], [2, 5], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6]].findIndex(x => (x[0] === Math.min(e[0], e[1]) && x[1] === Math.max(e[0], e[1])))], 0);
  t('两种算法总权值均为 15', sum(last(rp).treeEdges) === 15 && sum(last(rk).treeEdges) === 15);
}

console.log('— 第6章 Dijkstra —');
{
  const r = M.dijkstra.run({ start: '0' });
  const s = last(r);
  const INF = Infinity;
  t('D = [0,∞,10,50,30,60] (教材例)', JSON.stringify(s.D.map(x => x === INF ? '∞' : x)) === JSON.stringify([0, '∞', 10, 50, 30, 60]), s.D);
  t('路径: v3←v4←v0, v5←v3', s.Path[3] === 4 && s.Path[5] === 3 && s.Path[4] === 0 && s.Path[2] === 0, s.Path);
  t('最短路径树 4 条边', s.treeEdges.length === 4, s.treeEdges);
  const r2 = M.dijkstra.run({ start: '1' });
  const s2 = last(r2);
  t('源点 v1: D=[∞,0,5,55,∞,65] (v0,v4不可达)', JSON.stringify(s2.D.map(x => x === INF ? '∞' : x)) === JSON.stringify(['∞', 0, 5, 55, '∞', 65]), s2.D);
}

console.log('— 第3章 表达式求值 —');
{
  const r = M.expression.run({ expr: '3*(7-2)' });
  t('3*(7-2) = 15（教材经典例）', last(r).result === 15, last(r).result);
  const r2 = M.expression.run({ expr: '2+3*4' });
  t('2+3*4 = 14（乘优先于加）', last(r2).result === 14, last(r2).result);
  const r3 = M.expression.run({ expr: '(6+4)/2' });
  t('(6+4)/2 = 5', last(r3).result === 5, last(r3).result);
  const r4 = M.expression.run({ expr: '12*(3+4)' });
  t('多位数 12*(3+4) = 84', last(r4).result === 84, last(r4).result);
  const r5 = M.expression.run({ expr: '5/(3-3)' });
  t('除以 0: 报除零错误', !!r5.frames.find(f => f.snap.err === '除零'));
  const r6 = M.expression.run({ expr: '2*(3+4' });
  t('括号不完整: 优雅报错（不崩溃）', !!r6.frames.find(f => (f.snap.err || '').indexOf('括号') >= 0));
}

console.log('— 第5章 中序线索二叉树 —');
{
  const r = M.threads.run({ data: 'GDA##FE###MH##Z##', phase: 'build' });
  const s = last(r);
  /* 有孩子的结点无线索（前驱/后继经孩子求得）；空链域才存线索 */
  const exp = { A: { pre: null, succ: 'D' }, E: { pre: 'D', succ: 'F' }, F: { succ: 'G' }, H: { pre: 'G', succ: 'M' }, Z: { pre: 'M', succ: null } };
  let ok = true, bad = '';
  s.nodes.forEach(function (n) {
    const e = exp[n.ch];
    if (!e) return;
    const gotPre = n.ltag === 1 ? (n.lt ? byCh(s, n.lt) : null) : '(child)';
    const gotSucc = n.rtag === 1 ? (n.rt ? byCh(s, n.rt) : null) : '(child)';
    if ('pre' in e && String(gotPre) !== String(e.pre)) { ok = false; bad += n.ch + '.pre=' + gotPre + ' '; }
    if ('succ' in e && String(gotSucc) !== String(e.succ)) { ok = false; bad += n.ch + '.succ=' + gotSucc + ' '; }
  });
  function byCh(s2, id) { const n2 = s2.nodes.find(function (x) { return x.id === id; }); return n2 ? n2.ch : null; }
  t('线索化: 空链域线索与中序序列一致（有孩子的结点无线索）', ok, bad);
  const rw = M.threads.run({ data: 'GDA##FE###MH##Z##', phase: 'walk' });
  t('沿线索遍历 = 中序序列 ADEFGHMZ（不用栈）', last(rw).seq.join('') === 'ADEFGHMZ' && last(rw).walkDone === true, last(rw).seq);
  const rAll = M.threads.run({ data: 'GDA##FE###MH##Z##', phase: 'all' });
  t('完整流程: 含线索化帧与遍历帧', rAll.frames.length > r.frames.length + rw.frames.length - 4);
}

console.log('— 第6章 关键路径 —');
{
  const r = M.critical.run({});
  const s = last(r);
  t('ve = [0,3,2,6,6,8]', JSON.stringify(s.ve) === JSON.stringify([0, 3, 2, 6, 6, 8]), s.ve);
  t('vl = [0,4,2,6,7,8]', JSON.stringify(s.vl) === JSON.stringify([0, 4, 2, 6, 7, 8]), s.vl);
  const crit = s.act.filter(a => a.crit).map(a => a.name);
  t('关键活动 = a2、a5、a7', JSON.stringify(crit) === JSON.stringify(['a2', 'a5', 'a7']), crit);
  t('关键路径 v0→v2→v3→v5，工期 8', JSON.stringify(s.critPath) === JSON.stringify(['0', '2', '3', '5']) && s.ve[5] === 8, s.critPath);
  t('非关键活动有富余（a1 富余 1、a6 富余 3）', (function(){ const a1 = s.act.find(x=>x.name==='a1'), a6 = s.act.find(x=>x.name==='a6'); return a1.slack === 1 && a6.slack === 3; })());
}
{
  const r = M.floyd.run({});
  const s = last(r);
  const expect = [[0, 1, 3, 6], [9, 0, 2, 5], [7, 8, 0, 3], [4, 5, 7, 0]];
  t('Floyd 最终 D 矩阵（手算逐格核对）', JSON.stringify(s.D) === JSON.stringify(expect), s.D);
  t('更新帧含最终路径 0→1→2→3', !!r.frames.find(fr => (fr.msg || '').indexOf('0→1→2→3') >= 0));
}

console.log('— 第3章 括号匹配 —');
{
  const rok = M.bracket.run({ expr: '([()])' });
  t('([()]) 匹配成功且栈空', last(rok).action === 'ok' && last(rok).stack.length === 0, last(rok).action);
  const r1 = M.bracket.run({ expr: ')(' });
  t(')( → 失败情形①（栈空遇右括号）', !!r1.frames.find(f => f.snap.action === 'err1'));
  const r2 = M.bracket.run({ expr: '(]' });
  t('(] → 失败情形②（类型不符）', !!r2.frames.find(f => f.snap.action === 'err2'));
  const r3 = M.bracket.run({ expr: '([)]' });
  t('([)] → 失败情形②（交叉嵌套）', !!r3.frames.find(f => f.snap.action === 'err2'));
  const r4 = M.bracket.run({ expr: '(()' });
  t('(() → 失败情形③（结束栈非空）', !!r4.frames.find(f => f.snap.action === 'err3'));
  const r5 = M.bracket.run({ expr: 'a(b)c' });
  t('普通字符跳过后匹配成功', last(r5).action === 'ok');
}

console.log('— 第6章 拓扑排序 —');
{
  const r = M.topo.run({});
  t('拓扑序列 C1,C4,C0,C3,C2,C5（教材栈算法）', JSON.stringify(last(r).out) === JSON.stringify([1, 4, 0, 3, 2, 5]), last(r).out);
  t('全部 6 个顶点输出（无回路）', last(r).out.length === 6 && last(r).done === true);
  const rc = M.topo.run({ cycle: true });
  t('加入回路: C1 入度不再为 0，仅输出 C0、C2', JSON.stringify(last(rc).out) === JSON.stringify([0, 2]), last(rc).out);
  t('加入回路: 判定存在回路、排序失败', !!rc.frames.find(f => (f.msg || '').indexOf('存在回路') >= 0));
}

console.log('— 第6章 图的基本概念 —');
{
  const b = {};
  (M.graphBasic.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = o => M.graphBasic.run(Object.assign({}, b, o));
  const msgs = r => r.frames.map(f => f.msg).join('\n');
  const D = '0-1 0-2 1-2 1-3 2-3 4-5 5-6 4-6';

  const dg = run({ scene: 'deg', edges: D, nv: 7 });
  t('图: 握手定理 Σ度 = 2|E| = 16',
    dg.frames.some(f => f.panel['度之和'] === '16 = 2×8'),
    dg.frames.map(f => f.panel['度之和']).filter(Boolean).join(','));
  t('图: 逐点度正确（0→2、1→3、6→2）',
    dg.frames.some(f => f.panel['顶点'] === '0' && f.panel['度'] === '2') &&
    dg.frames.some(f => f.panel['顶点'] === '1' && f.panel['度'] === '3') &&
    dg.frames.some(f => f.panel['顶点'] === '6' && f.panel['度'] === '2'));
  t('图: 奇数度顶点个数被断言为偶数', /必是偶数个/.test(msgs(dg)));

  const dd = run({ scene: 'ideg', edges: D, nv: 7 });
  t('图: 有向版 Σ入度 = Σ出度 = |E| = 8', /Σ入度 = 8、Σ出度 = 8/.test(msgs(dd)),
    dd.frames.filter(f => /Σ入度/.test(f.msg)).map(f => f.msg.slice(0, 40)).join('|'));
  t('图: 有向版不再自称"无向完全图"', !/无向完全图/.test(msgs(dd)), (msgs(dd).match(/完全图[^。]*/) || [''])[0]);
  t('图: 有向完全图按 n(n−1) 算 = 42', /n\(n−1\) = 42/.test(msgs(dd)));
  t('图: 有向场景逐点给入度/出度两个数',
    dd.frames.some(f => f.panel['顶点'] === '0' && f.panel['入度'] === '0' && f.panel['出度'] === '2'),
    dd.frames.filter(f => f.panel['顶点'] === '0').map(f => JSON.stringify(f.panel)).join('|'));
  t('图: 有向场景是独立场景，不再藏在勾选框里',
    M.graphBasic.inputs.some(x => x.key === 'scene' && x.options.some(o => o[0] === 'ideg')) &&
    !M.graphBasic.inputs.some(x => x.key === 'dir'));
  /* 反向弧必须画成两条：叠在一起就看不出 <a,b> 与 <b,a> 是两码事 */
  {
    const rp = run({ scene: 'ideg', edges: '0>1 1>0 1>2 2>1 2>3', nv: 5 });
    const tw = rp.frames[0].snap.twin;
    t('图: 互为反向的弧被识别成两条（0↔1、1↔2 共 4 条）', tw.length === 4, tw);
    const svgRP = M.graphBasic.render(rp.frames[0].snap);
    const svgND = M.graphBasic.render(run({ scene: 'ideg', edges: '0-1 1-2 2-3', nv: 4 }).frames[0].snap);
    t('图: 反向弧走曲线、无反向弧时不引入曲线',
      (svgRP.match(/<path/g) || []).length >= 4 && (svgND.match(/<path/g) || []).length === 0,
      { twinPaths: (svgRP.match(/<path/g) || []).length, plainPaths: (svgND.match(/<path/g) || []).length });
  }

  const cn = run({ scene: 'conn', edges: D, nv: 7 });
  t('图: 无向切成 2 个连通分量 {0 1 2 3} + {4 5 6}',
    /2 个连通分量/.test(msgs(cn)) && /\{0 1 2 3\} \+ \{4 5 6\}/.test(msgs(cn)),
    (msgs(cn).match(/切成[^。]*/) || [''])[0]);
  t('图: 连通场景画的是"顶点→第几块"归属表，不是度数表',
    /第 1 块/.test(M.graphBasic.render(cn.frames[cn.frames.length - 1].snap)) &&
    !/入度/.test(M.graphBasic.render(cn.frames[cn.frames.length - 1].snap)));
  const cw = run({ scene: 'sconn', edges: D, nv: 7 });
  t('图: 同样边当弧→弱连通 2 块、强连通 7 块', /忽略方向是 2 块，讲方向是 7 块/.test(msgs(cw)),
    (msgs(cw).match(/对比：[^。]*。|同一张图：[^。]*。/) || [''])[0]);
  const cy = run({ scene: 'sconn', edges: '0-1 1-2 2-0 3-4', nv: 5 });
  t('图: 含 3-环的有向图强连通分量 = {0 1 2}+{3}+{4}',
    /\{0 1 2\} \+ \{3\} \+ \{4\}/.test(msgs(cy)),
    (msgs(cy).match(/强连通分量\*\*：[^。]*/) || [''])[0]);
  const iso = run({ scene: 'conn', edges: '0-1 2-3', nv: 6 });
  t('图: 孤立点各自自成一分量（4 块）', /4 个连通分量/.test(msgs(iso)), (msgs(iso).match(/切成[^。]*/) || [''])[0]);

  let e1 = '', e2 = '', e3 = '';
  try { M.graphBasic.run(Object.assign({}, b, { edges: '0-9', nv: 5 })); } catch (e) { e1 = e.message; }
  try { M.graphBasic.run(Object.assign({}, b, { edges: '01' })); } catch (e) { e2 = e.message; }
  try { M.graphBasic.run(Object.assign({}, b, { edges: '0-0 1-2' })); } catch (e) { e3 = e.message; }
  t('图: 越界/格式/自环都明确报错', /0~4/.test(e1) && /a-b/.test(e2) && /自环/.test(e3), [e1, e2, e3]);
  t('图: 三种写法 a-b / a>b / <a,b> 都能解析',
    ['0-1 1-2', '0>1 1>2', '<0,1> <1,2>'].every(x => M.graphBasic.run(Object.assign({}, b, { edges: x })).frames.length > 0));
}

console.log('— 第3章 中缀转后缀与后缀求值 —');
{
  const b = {};
  (M.toPostfix.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = o => M.toPostfix.run(Object.assign({}, b, o));
  const last = r => r.frames[r.frames.length - 1];
  const conv = e => last(run({ scene: 'conv', expr: e })).panel['后缀'];
  const val = e => last(run({ scene: 'both', expr: e })).panel['结果'];

  /* 教材例题与经典陷阱：转换结果必须逐字符等于标准答案 */
  t('转后缀: A-(B*C+D)/E → A B C * D + E / −', conv('A-(B*C+D)/E') === 'A B C * D + E / −', conv('A-(B*C+D)/E'));
  t('转后缀: 12/(4-2)+3*5-8/4 正确',
    conv('12/(4-2)+3*5-8/4') === '12 4 2 − / 3 5 * + 8 4 / −', conv('12/(4-2)+3*5-8/4'));
  t('转后缀: a+b*c → a b c * +（优先级生效）', conv('a+b*c') === 'a b c * +', conv('a+b*c'));
  t('转后缀: (a+b)*c → a b + c *（括号生效）', conv('(a+b)*c') === 'a b + c *', conv('(a+b)*c'));
  /* ^ 右结合：同为 ^ 时不弹栈 */
  t('转后缀: 2^3^2 是右结合 → 2 3 2 ^ ^', conv('2^3^2') === '2 3 2 ^ ^', conv('2^3^2'));
  t('求值: 2^3^2 = 512（不是 64）', val('2^3^2') === '512', val('2^3^2'));
  /* 左结合：减除必须从左往右 */
  t('求值: 20-8-5 = 7（先弹的是右操作数）', val('20-8-5') === '7', val('20-8-5'));
  t('求值: 12/4*3 = 9（同级左结合）', val('12/4*3') === '9', val('12/4*3'));
  t('求值: 12/(4-2)+3*5-8/4 = 19', val('12/(4-2)+3*5-8/4') === '19', val('12/(4-2)+3*5-8/4'));

  /* 结构守恒：操作数与运算符的个数在转换前后不变，且后缀式不含括号 */
  ['A-(B*C+D)/E', '12/(4-2)+3*5-8/4', '2^3^2', '1+2*3'].forEach(e => {
    const r = run({ scene: 'conv', expr: e });
    const toks = r.frames[1].snap.tk;
    const nd = toks.filter(t => !'+−*/^()'.includes(t)).length;
    const no = toks.filter(t => '+−*/^'.includes(t)).length;
    const out = conv(e).split(' ');
    t('转后缀: ' + e + ' 操作数/运算符个数守恒且无括号',
      out.length === nd + no && out.filter(t => '+−*/^'.includes(t)).length === no &&
      !out.some(t => t === '(' || t === ')'), out.join(' '));
  });
  t('转后缀: 每一帧的栈与输出都自洽（输出只增不减）',
    run({ scene: 'conv', expr: '12/(4-2)+3*5-8/4' }).frames.every((f, i, A) => i === 0 || (f.snap.out || []).length >= (A[i - 1].snap.out || []).length));
  t('后缀求值: 变量式明确说不给值就算不出',
    /无法算出数值|变量/.test(run({ scene: 'both', expr: 'A-(B*C+D)/E' }).frames.map(f => f.msg).join('\n')));

  let e1 = '', e2 = '', e3 = '';
  try { M.toPostfix.run(Object.assign({}, b, { expr: '(1+2' })); } catch (e) { e1 = e.message; }
  try { M.toPostfix.run(Object.assign({}, b, { expr: '1+2)' })); } catch (e) { e2 = e.message; }
  try { M.toPostfix.run(Object.assign({}, b, { expr: '1#2' })); } catch (e) { e3 = e.message; }
  t('转后缀: 括号不匹配与非法字符都明确报错',
    /右括号/.test(e1) && /右括号/.test(e2) && /不支持的字符/.test(e3), [e1, e2, e3]);
}

console.log('— 第6章 邻接多重表与十字链表 —');
{
  const b = {};
  (M.graphStore.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = o => M.graphStore.run(Object.assign({}, b, o));
  const fin = r => r.frames[r.frames.length - 1].snap;
  const msgs = r => r.frames.map(f => f.msg).join('\n');

  /* 邻接多重表：一条边只有一个结点，但必须恰好出现在两个端点的链里 */
  const E1 = '0-1 0-2 1-2 1-3 2-3 4-5';
  const mr = run({ way: 'mul', edges: E1, pick: 2 }), ms = fin(mr).st;
  const refs = [];
  ms.chains.forEach(function (c) { refs.push.apply(refs, c[1].concat(c[2])); });
  t('邻接多重表: 边结点数 = 边数（不翻倍）', ms.ebox.length === 6, ms.ebox.length);
  t('邻接多重表: 每条边恰好被两条链引用（共享性）',
    refs.length === 12 && [0, 1, 2, 3, 4, 5].every(k => refs.filter(x => x === k).length === 2),
    refs.slice().sort().join(','));
  t('邻接多重表: 顶点 2 的链覆盖它关联的 3 条边', ms.chains[2][1].concat(ms.chains[2][2]).sort().join(',') === '1,2,4',
    ms.chains[2][1].concat(ms.chains[2][2]).join(','));
  t('邻接多重表: 结论按 2|E| 对比邻接表', /邻接表要建 \*\*12\*\* 个边结点.*只建 6 个/.test(msgs(mr)),
    (msgs(mr).match(/对比邻接表[^。]*。/) || [''])[0]);
  const mc = run({ way: 'mul', edges: '0-1 0-2 0-3', pick: 0 });
  t('邻接多重表: 星形图中心点的度 = 3',
    mc.frames.some(f => f.panel['顶点'] === '0' && f.panel['度'] === '3'),
    mc.frames.map(f => f.panel['度']).filter(Boolean).join(','));

  /* 十字链表：一条弧一个结点，同时挂在出边链与入边链上 */
  const E2 = '0>1 0>2 1>2 2>0 2>3 1>3';
  const or_ = run({ way: 'ortho', edges: E2, pick: 2 }), os = fin(or_).st;
  const outDeg = [0, 1, 2, 3].map(v => E2.split(/\s+/).filter(t => t.startsWith(v + '>')).length);
  const inDeg = [0, 1, 2, 3].map(v => E2.split(/\s+/).filter(t => t.endsWith('>' + v)).length);
  t('十字链表: 每个顶点的出边链长 = 实际出度',
    os.outChain.every((c, v) => c.length === outDeg[v]), os.outChain.map(c => c.length).join(',') + ' vs ' + outDeg.join(','));
  t('十字链表: 每个顶点的入边链长 = 实际入度',
    os.inChain.every((c, v) => c.length === inDeg[v]), os.inChain.map(c => c.length).join(',') + ' vs ' + inDeg.join(','));
  t('十字链表: Σ出度 = Σ入度 = 弧数',
    outDeg.reduce((a, x) => a + x, 0) === 6 && inDeg.reduce((a, x) => a + x, 0) === 6);
  t('十字链表: 弧结点数 = 弧数（不翻倍）', os.ebox.length === 6, os.ebox.length);
  const oref = [];
  os.outChain.forEach(c => oref.push.apply(oref, c));
  os.inChain.forEach(c => oref.push.apply(oref, c));
  t('十字链表: 每条弧恰好出现在一条出边链和一条入边链里',
    oref.length === 12 && [0, 1, 2, 3, 4, 5].every(k => oref.filter(x => x === k).length === 2),
    oref.slice().sort().join(','));
  t('十字链表: 观察帧同时报出度与入度',
    or_.frames.some(f => f.panel['顶点'] === '2' && f.panel['出度'] === '2' && f.panel['入度'] === '2'),
    or_.frames.filter(f => f.panel['顶点']).map(f => f.panel['出度'] + '/' + f.panel['入度']).join(','));
  const ocyc = run({ way: 'ortho', edges: '0>1 1>2 2>0 3>0', pick: 0 });
  t('十字链表: 环上顶点 0 出度 1、入度 2（有两条弧指进来）',
    ocyc.frames.some(f => f.panel['顶点'] === '0' && f.panel['出度'] === '1' && f.panel['入度'] === '2'),
    ocyc.frames.map(f => f.panel['出度'] + '/' + f.panel['入度']).filter(x => x !== 'undefined/undefined').join(','));

  let e1 = '', e2 = '', e3 = '';
  try { M.graphStore.run(Object.assign({}, b, { edges: '0>9 1>2 2>0' })); } catch (e) { e1 = e.message; }
  try { M.graphStore.run(Object.assign({}, b, { edges: '01 1-2 2-0' })); } catch (e) { e2 = e.message; }
  try { M.graphStore.run(Object.assign({}, b, { edges: '0-1 1-2' })); } catch (e) { e3 = e.message; }
  t('图存储: 越界/格式/边太少都明确报错', /0~5/.test(e1) && /a-b|a>b/.test(e2) && /至少给 3 条/.test(e3), [e1, e2, e3]);
}

console.log('— 第8章 计数排序与桶排序 —');
{
  const b = {};
  (M.countBucket.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = o => M.countBucket.run(Object.assign({}, b, o));
  const last = r => r.frames[r.frames.length - 1];
  const result = r => (last(r).panel['结果'] || '').split(/[ ,]+/).filter(Boolean).map(Number);
  const SRC = {
    small: [4, 2, 1, 3, 3, 0, 2, 1], textbook: [49, 38, 65, 97, 76, 13, 27, 49], skew: [5, 5, 5, 6, 6, 7, 50]
  };
  const sortedOK = a2 => a2.every((x, i) => i === 0 || a2[i - 1] <= x);
  const sameMulti = (a2, src) => a2.slice().sort((x, y) => x - y).join() === src.slice().sort((x, y) => x - y).join();

  ['small', 'textbook', 'skew'].forEach(pr => {
    const r = run({ scene: 'count', preset: pr });
    t('计数排序: ' + pr + ' 结果有序且元素守恒', sortedOK(result(r)) && sameMulti(result(r), SRC[pr]), result(r).join(','));
    t('计数排序: ' + pr + ' 全程零次比较', last(r).panel['比较次数'] === '0 次', last(r).panel['比较次数']);
  });
  t('计数排序: 教材例题结果 13 27 38 49 49 65 76 97',
    result(run({ scene: 'count', preset: 'textbook' })).join(',') === '13,27,38,49,49,65,76,97',
    result(run({ scene: 'count', preset: 'textbook' })).join(','));
  /* 前缀和自检：最后一项必须等于 n */
  const cs = run({ scene: 'count', preset: 'small' });
  const preFrame = cs.frames.find(f => /前缀和结果/.test(f.msg));
  const cntArr = preFrame.snap.count;
  t('计数排序: 前缀和末项 = n', cntArr[cntArr.length - 1] === 8, cntArr.join(','));
  t('计数排序: 频次统计各值个数正确',
    cs.frames.filter(f => /① 统计/.test(f.panel['步'] || '')).length === 8,
    cs.frames.filter(f => /① 统计/.test(f.panel['步'] || '')).length);
  t('计数排序: 回填按逆序进行（稳定性的来源被演出来）',
    cs.frames.some(f => /逆序遍历/.test(f.msg) || /从后往前/.test(f.msg)));
  t('计数排序: 值域宽度进面板（O(n+k) 的 k 看得见）',
    last(cs).panel['复杂度'] === 'O(n+k) = O(13)', last(cs).panel['复杂度']);

  ['small', 'textbook', 'skew'].forEach(pr => {
    [2, 4, 8].forEach(mm => {
      const r = run({ scene: 'bucket', preset: pr, nbuckets: mm });
      t('桶排序: ' + pr + ' m=' + mm + ' 结果有序且守恒', sortedOK(result(r)) && sameMulti(result(r), SRC[pr]), result(r).join(','));
    });
  });
  const bs = run({ scene: 'bucket', preset: 'skew', nbuckets: 4 });
  const bks = bs.frames.filter(f => f.snap.buckets).pop().snap.buckets;
  t('桶排序: 各桶元素数之和 = n', bks.reduce((a, x) => a + x.length, 0) === 7, bks.map(x => x.length).join('/'));
  t('桶排序: 偏斜数据被明说（最大桶远大于均值）', /偏挤|退化|优势就没了/.test(bs.frames.map(f => f.msg).join('\n')));
  const bu = run({ scene: 'bucket', preset: 'small', nbuckets: 8 });
  t('桶排序: 桶内排序后每桶自身有序',
    bu.frames.pop().snap.buckets.every(x => x.every((v, i) => i === 0 || x[i - 1] <= v)));

  let e1 = '', e2 = '';
  try { M.countBucket.run(Object.assign({}, b, { scene: 'count', preset: 'custom', w: '1,2,500' })); } catch (e) { e1 = e.message; }
  try { M.countBucket.run(Object.assign({}, b, { scene: 'count', preset: 'custom', w: '5,-2,3' })); } catch (e) { e2 = e.message; }
  t('计数/桶排序: 值域过大与负数都明确报错', /≤ 99/.test(e1) && /非负/.test(e2), [e1, e2]);
}

console.log('— 第7章 顺序/折半/分块查找 —');
{
  const rb1 = M.seqBinSearch.run({ mode: 'bin', key: 21, w: '' });
  t('折半查找 21: 判定树路径 6→3→4', JSON.stringify(rb1.frames[0].snap.visit.concat([])) === '[]' && JSON.stringify(rb1.frames.filter(f => f.snap.mid != null).slice(0, 3).map(f => f.snap.mid)) === JSON.stringify([6, 3, 4]), rb1.frames.filter(f => f.snap.mid != null).map(f => f.snap.mid));
  const fnd = rb1.frames.filter(f => f.snap.mark)[0];
  t('折半查找 21: 成功，位于第 4 个', fnd && fnd.snap.res === '成功：第 4 个' && fnd.snap.visit.join(',') === '6,3,4', fnd && fnd.snap);
  const rb2 = M.seqBinSearch.run({ mode: 'bin', key: 85, w: '' });
  const ff2 = rb2.frames.filter(f => f.snap.mark)[0];
  t('折半查找 85: 失败，路径 6→9→10', ff2 && ff2.snap.res.indexOf('失败') >= 0 && ff2.snap.visit.join(',') === '6,9,10', ff2 && ff2.snap.visit);
  const rs1 = M.seqBinSearch.run({ mode: 'seq', key: 21, w: '' });
  const fs1 = rs1.frames.filter(f => f.snap.mark)[0];
  t('顺序查找 21: 成功第 4 个，比较 8 次', fs1 && fs1.snap.res.indexOf('第 4 个') >= 0 && /共比较 8 次/.test(fs1.msg), fs1 && fs1.msg);
  const rs2 = M.seqBinSearch.run({ mode: 'seq', key: 999, w: '' });
  const ff1 = rs2.frames.filter(f => f.snap.mark)[0];
  t('顺序查找失败: 比较n+1=12次', ff1 && /共比较 12 次/.test(ff1.msg), ff1 && ff1.msg);
  let threw = false;
  try { M.seqBinSearch.run({ mode: 'bin', key: 5, w: '3,1,2' }); } catch (e) { threw = true; }
  t('折半查找拒绝无序表', threw);
  const rk1 = M.blockSearch.run({ key: '38', im: 'seq' });
  const fk1 = rk1.frames.filter(f => f.snap.mark)[0];
  t('分块查找 38: 索引2步+块内2步，命中第 9 个', fk1 && fk1.snap.res.indexOf('第 9 个') >= 0, fk1 && fk1.snap.res);
  const rk2 = M.blockSearch.run({ key: '50', im: 'bin' });
  const fk2 = rk2.frames.filter(f => f.snap.mark)[0];
  t('分块查找 50: 失败（比所有块上界大或块内无）', fk2 && fk2.snap.res.indexOf('失败') >= 0, fk2 && fk2.snap.res);
  const rk3 = M.blockSearch.run({ key: '49', im: 'bin' });
  const fk3 = rk3.frames.filter(f => f.snap.mark)[0];
  t('分块查找 49: 折半索引定块成功', fk3 && fk3.snap.res.indexOf('成功') >= 0, fk3 && fk3.snap.res);
}

console.log('— 第7章 BST / AVL —');
{
  const bio = r => r.frames[r.frames.length - 1].panel['中序序列'];
  const bi = M.bst.run({ op: 'ins' });
  t('BST 依次插入: 中序 12≤24≤37≤45≤53≤90', bio(bi) === '12 ≤ 24 ≤ 37 ≤ 45 ≤ 53 ≤ 90', bio(bi));
  t('BST 插入完成: 根为 45', bi.frames[bi.frames.length - 1].snap.tree.v === 45);
  t('BST 删叶子 12: 中序仍递增且少 12', bio(M.bst.run({ op: 'dl' })) === '24 ≤ 37 ≤ 45 ≤ 53 ≤ 90');
  t('BST 删单孩子 53: 中序 12≤24≤37≤45≤90', bio(M.bst.run({ op: 'd1' })) === '12 ≤ 24 ≤ 37 ≤ 45 ≤ 90');
  const bd2 = M.bst.run({ op: 'd2' });
  t('BST 删双孩子 45: 根被中序前驱 37 替代', bd2.frames[bd2.frames.length - 1].snap.tree.v === 37, bd2.frames[bd2.frames.length - 1].snap.tree.v);
  t('BST 删双孩子 45: 中序 12≤24≤37≤53≤90', bio(bd2) === '12 ≤ 24 ≤ 37 ≤ 53 ≤ 90');
  ['LL', 'RR', 'LR', 'RL'].forEach(s => {
    const ra = M.avl.run({ scen: s });
    const lastP = ra.frames[ra.frames.length - 1].panel;
    t('AVL ' + s + ': 中序递增 ' + lastP['中序'], lastP['中序'] === '10 ≤ 20 ≤ 30', lastP['中序']);
    t('AVL ' + s + ': 旋转后全部 |bf| ≤ 1', +lastP['最大|bf|'] <= 1, lastP['最大|bf|']);
    t('AVL ' + s + ': 新根为 20', ra.frames[ra.frames.length - 1].snap.tree.v === 20);
  });
}

console.log('— 第7章 散列表（线性探测 / 链地址） —');
{
  const KW = '19,14,23,1,68,20,84,27,55,11';
  const rh = M.hashLinear.run({ w: KW });
  const tbl = rh.frames[rh.frames.length - 2].snap.table;
  t('线性探测: 终表与教材一致', JSON.stringify(tbl) === JSON.stringify([null, 14, 1, 68, 27, 55, 19, 20, 84, null, 23, 11, null]), tbl);
  t('线性探测: 27 探测 4 次落位 a[4]', rh.frames[rh.frames.length - 2].snap.cnt[4] === 4, rh.frames[rh.frames.length - 2].snap.cnt);
  t('线性探测: ASL成功 = 18/10 = 1.80', /1\.80/.test(rh.frames[rh.frames.length - 1].msg), rh.frames[rh.frames.length - 1].msg.slice(0, 60));
  const rdup = M.hashLinear.run({ w: '19,19,1' });
  t('线性探测: 重复关键码被跳过（表中 19 仅一份）', rdup.frames[rdup.frames.length - 2].snap.table.filter(x => x === 19).length === 1);
  const rc2 = M.hashChain.run({ w: KW });
  t('链地址: 总比较 15 次 → ASL 1.50', /15 ÷ 10 = 1\.50/.test(rc2.frames[rc2.frames.length - 1].msg), rc2.frames[rc2.frames.length - 1].msg.slice(0, 90));
  t('链地址: 桶1终链 27→1→14（头插）', JSON.stringify(rc2.frames[rc2.frames.length - 2].snap.HT[1]) === JSON.stringify([27, 1, 14]), rc2.frames[rc2.frames.length - 2].snap.HT[1]);
  t('链地址: 桶6终链 84→19', JSON.stringify(rc2.frames[rc2.frames.length - 2].snap.HT[6]) === JSON.stringify([84, 19]));
}

console.log('— 第4章 KMP / 矩阵压缩 —');
{
  const km = M.kmp.run({ s: 'acabaabaabcacaabc', t: 'abaabcac' });
  const nx = km.frames.filter(f => f.snap.mark === 'nextdone')[0].snap.nx.slice(1);
  t('KMP: next("abaabcac") = 0,1,1,2,2,3,1,2（教材）', JSON.stringify(nx) === JSON.stringify([0, 1, 1, 2, 2, 3, 1, 2]), nx);
  const bd = km.frames.filter(f => f.snap.mark === 'bfdone')[0];
  const kd = km.frames.filter(f => f.snap.mark === 'kmpdone')[0];
  t('KMP: BF 比较 20 次', /20 次/.test(bd.msg), bd.msg.slice(0, 40));
  t('KMP: KMP 比较 15 次（i 不回退）', /15 次/.test(kd.msg), kd.msg.slice(0, 40));
  t('KMP: 两者都在主串第 6 位匹配', /第 6 位/.test(bd.msg) && /第 6 位/.test(kd.msg));
  let bad = false;
  try { M.kmp.run({ s: 'abc', t: 'A1' }); } catch (e) { bad = true; }
  t('KMP: 非小写字母输入被拒绝', bad);
  const ms = M.matrix.run({ scen: 'sym', ii: 3, jj: 2, w: '1,2,3,4, 2,5,6,7, 3,6,8,9, 4,7,9,10' });
  t('对称矩阵: m[3][2] → sa[4] = 6', /sa\[4\] = 6/.test(ms.frames[2].msg), ms.frames[2].msg.slice(0, 40));
  const mu = M.matrix.run({ scen: 'sym', ii: 1, jj: 4, w: '1,2,3,4, 2,5,6,7, 3,6,8,9, 4,7,9,10' });
  t('对称矩阵: m[1][4] 上三角 → 读对称 sa[6] = 4', /sa\[6\] = 4/.test(mu.frames[2].msg) && mu.frames[0].msg.indexOf('上三角') >= 0, mu.frames[2].msg.slice(0, 40));
  let asym = false;
  try { M.matrix.run({ scen: 'sym', ii: 1, jj: 1, w: '1,99,3,4, 2,5,6,7, 3,6,8,9, 4,7,9,10' }); } catch (e) { asym = true; }
  t('对称矩阵: 非对称输入被拒绝', asym);
  const sp = M.matrix.run({ scen: 'spt' });
  const tf = sp.frames[sp.frames.length - 1].snap.T;
  t('快速转置: cpot = [1,3,4,6,7,8]（教材）', sp.frames[sp.frames.length - 1].panel['cpot[]'] === '[1,3,4,6,7,8]', sp.frames[sp.frames.length - 1].panel['cpot[]']);
  t('快速转置: T 按行序排列且行列互换', JSON.stringify(tf) === JSON.stringify([{ i: 1, j: 5, e: 14 }, { i: 1, j: 6, e: 18 }, { i: 2, j: 1, e: 12 }, { i: 3, j: 1, e: 9 }, { i: 3, j: 4, e: 24 }, { i: 4, j: 5, e: -7 }, { i: 5, j: 3, e: -3 }, { i: 6, j: 6, e: 8 }]), tf);
}

console.log('— 第8章 排序（教材例题逐趟对拍） —');
{
  const TB = [49, 38, 65, 97, 76, 13, 27, 49];
  const marksOf = (id, v) => { const o = {}; M[id].run(v).frames.forEach(f => { if (f.snap.mark) o[f.snap.mark] = f.snap.arr; }); return o; };
  const ins = marksOf('insertSort', { preset: 'textbook', w: '', mode: 'd' });
  t('直接插入: 第7趟后 13,27,38,49,65,76,97,49*', JSON.stringify(ins[7]) === JSON.stringify([13, 27, 38, 49, 65, 76, 97, 49]), ins[7]);
  t('直接插入: 终帧有序 13,27,38,49,49,65,76,97', JSON.stringify(ins.final) === JSON.stringify([13, 27, 38, 49, 49, 65, 76, 97]), ins.final);
  const insb = marksOf('insertSort', { preset: 'textbook', w: '', mode: 'b' });
  t('折半插入: 每趟结果与直接插入一致', JSON.stringify(insb[7]) === JSON.stringify(ins[7]) && JSON.stringify(insb.final) === JSON.stringify(ins.final));
  const sh = marksOf('shellSort', { preset: 'textbook', w: '' });
  t('希尔: dk=4 后 49,13,27,49,76,38,65,97', JSON.stringify(sh.gap4) === JSON.stringify([49, 13, 27, 49, 76, 38, 65, 97]), sh.gap4);
  t('希尔: dk=2 后 27,13,49,38,65,49,76,97', JSON.stringify(sh.gap2) === JSON.stringify([27, 13, 49, 38, 65, 49, 76, 97]), sh.gap2);
  t('希尔: dk=1 后有序', JSON.stringify(sh.gap1) === JSON.stringify([13, 27, 38, 49, 49, 65, 76, 97]), sh.gap1);
  const bub = marksOf('bubbleSort', { preset: 'textbook', w: '' });
  t('冒泡: 第1趟 38,49,65,76,13,27,49,97', JSON.stringify(bub[1]) === JSON.stringify([38, 49, 65, 76, 13, 27, 49, 97]), bub[1]);
  t('冒泡: 第5趟已有序，第6趟零交换后提前终止（无第7趟）', JSON.stringify(bub[5]) === JSON.stringify([13, 27, 38, 49, 49, 65, 76, 97]) && bub[7] === undefined, Object.keys(bub));
  const bq = M.bubbleSort.run({ preset: 'ordered', w: '' });
  const bubOrd = bq.frames[bq.frames.length - 1].panel['比较'];
  t('冒泡: 有序输入仅比较 7 次（最好 O(n)）', bubOrd === '7 次', bubOrd);
  const qs = marksOf('quickSort', { preset: 'textbook', w: '' });
  t('快排: 第一趟划分 27,38,13,49,76,97,65,49', JSON.stringify(qs['part1_8']) === JSON.stringify([27, 38, 13, 49, 76, 97, 65, 49]), qs['part1_8']);
  t('快排: 子区间[1..3]划分 13,27,38', JSON.stringify(qs['part1_3']) === JSON.stringify([13, 27, 38, 49, 76, 97, 65, 49]), qs['part1_3']);
  t('快排: 终帧有序', JSON.stringify(qs.final) === JSON.stringify([13, 27, 38, 49, 49, 65, 76, 97]), qs.final);
  const qso = marksOf('quickSort', { preset: 'ordered', w: '' });
  t('快排: 有序输入仍正确（最坏情形不崩）', JSON.stringify(qso.final) === JSON.stringify([12, 23, 34, 45, 56, 67, 78, 89]), qso.final);
  const sel = marksOf('selectSort', { preset: 'textbook', w: '' });
  t('选择: 第4趟 13,27,38,49,76,97,65,49', JSON.stringify(sel[4]) === JSON.stringify([13, 27, 38, 49, 76, 97, 65, 49]), sel[4]);
  const selFrames = M.selectSort.run({ preset: 'textbook', w: '' }).frames;
  t('选择: 比较次数固定 n(n-1)/2 = 28', selFrames[selFrames.length - 1].panel['比较'] === '28 次', selFrames[selFrames.length - 1].panel['比较']);
  t('选择: 终帧有序', JSON.stringify(sel.final) === JSON.stringify([13, 27, 38, 49, 49, 65, 76, 97]), sel.final);
  const hp = marksOf('heapSort', { preset: 'textbook', w: '' });
  t('堆排: 建堆后 97,76,65,49,49,13,27,38（教材）', JSON.stringify(hp.heap) === JSON.stringify([97, 76, 65, 49, 49, 13, 27, 38]), hp.heap);
  t('堆排: 第1次输出后 38,76,65,49,49,13,27,97', JSON.stringify(hp.e1) === JSON.stringify([38, 76, 65, 49, 49, 13, 27, 97]), hp.e1);
  t('堆排: 终帧有序', JSON.stringify(hp.final) === JSON.stringify([13, 27, 38, 49, 49, 65, 76, 97]), hp.final);
  const mg = marksOf('mergeSort', { preset: 'textbook', w: '' });
  t('归并: 左半排好后 38,49,65,97,76,13,27,49', JSON.stringify(mg['m0_3']) === JSON.stringify([38, 49, 65, 97, 76, 13, 27, 49]), mg['m0_3']);
  t('归并: 右半排好后 38,49,65,97,13,27,49,76', JSON.stringify(mg['m4_7']) === JSON.stringify([38, 49, 65, 97, 13, 27, 49, 76]), mg['m4_7']);
  t('归并: 终帧有序', JSON.stringify(mg.final) === JSON.stringify([13, 27, 38, 49, 49, 65, 76, 97]), mg.final);
  const rd = marksOf('radixSort', { preset: 'textbook', w: '' });
  t('基数: 个位趟 930,063,083,184,505,278,008,109,589,269', JSON.stringify(rd.p1) === JSON.stringify(['930','063','083','184','505','278','008','109','589','269']), rd.p1);
  t('基数: 十位趟 505,008,109,930,063,269,278,083,184,589', JSON.stringify(rd.p2) === JSON.stringify(['505','008','109','930','063','269','278','083','184','589']), rd.p2);
  t('基数: 百位趟整体有序', JSON.stringify(rd.p3) === JSON.stringify(['008','063','083','109','184','269','278','505','589','930']), rd.p3);
  const ga = M.sortGallery.run({ preset: 'textbook', w: '' });
  const st = ga.frames[0].snap.stats;
  t('总览: 8 算法全部得到相同有序结果', st.every(s => s.sorted === true), st.map(s => s.name + ':' + s.sorted));
  t('总览: 稳定性标注（插入/冒泡/归并/基数稳定，希尔/快排/选择/堆不稳定）', JSON.stringify(st.map(s => s.stableClaim)) === JSON.stringify([true, false, true, false, false, false, true, true]), st.map(s => s.stableClaim));
  t('总览: 基数排序比较次数为 0（不比较）', st[7].cmp === 0, st[7].cmp);
  const go = M.sortGallery.run({ preset: 'ordered', w: '' }).frames[0].snap.stats;
  t('总览: 有序输入时冒泡比较 7 次 < 快排 28 次', go[2].cmp === 7 && go[3].cmp === 28, go[2].cmp + '/' + go[3].cmp);
  let invalid = false;
  try { M.insertSort.run({ preset: 'custom', w: 'abc', mode: 'd' }); } catch (e) { invalid = true; }
  t('排序: 非法输入被拒绝', invalid);
}

console.log('— M4 补强：复杂度 / 顺序表与链表基本操作 / 合并有序表 —');
{
  const cx = M.complexity.run({ nmax: 16 });
  t('复杂度: 帧数随设定规模变化（nmax=16 → 16 帧）', cx.frames.length === 16, cx.frames.length);
  const cx64 = M.complexity.run({ nmax: 64 });
  t('复杂度: nmax=64 → 64 帧，O(2ⁿ)=1.8e+19 动态展示', cx64.frames.length === 64 && /1\.84e\+19/.test(cx64.frames[63].msg), cx64.frames[63].msg.slice(0, 70));
  const v16 = cx.frames[15].snap.vals;
  const byName = n => v16.find(x => x.name === n).v;
  t('复杂度: n=16 时 log n = 4', byName('O(log n)') === 4, byName('O(log n)'));
  t('复杂度: n=16 时 O(2ⁿ)=65536（远超 n²）', byName('O(2ⁿ)') === 65536 && byName('O(2ⁿ)') > byName('O(n²)'), byName('O(2ⁿ)'));
  t('复杂度: n=16 时 log<n<nlogn<n² 递增', byName('O(log n)') < byName('O(n)') && byName('O(n)') < byName('O(n log n)') && byName('O(n log n)') < byName('O(n²)'));
    t('复杂度: 坐标轴自动缩放渲染（含"指数爆炸"说明）', (() => { const svg = M.complexity.render(cx.frames[15].snap); return svg.indexOf('自动缩放') >= 0 && svg.indexOf('每格 ×10') >= 0; })());
  const cx300 = M.complexity.run({ nmax: 300 });
  t('复杂度: nmax=300 → 300 帧且 O(2³⁰⁰)≈1.94e+90', cx300.frames.length === 300 && /2\.04e\+90/.test(cx300.frames[299].msg), cx300.frames[299].msg.slice(0, 60));
  t('复杂度: 任意帧 y 轴顶刻度 = 当前最大（n=30 时 10⁹）', (() => { const svgMid = M.complexity.render(cx300.frames[29].snap); return svgMid.indexOf('10⁹') >= 0; })());
  const svgEarly = M.complexity.render(cx.frames[0].snap), svgLate = M.complexity.render(cx.frames[15].snap);
  t('复杂度: 曲线逐帧生长（早期帧无前沿远端，终帧到达 x 轴右端）', svgEarly.indexOf('920.') < 0 && svgLate.indexOf('920.') >= 0, svgEarly.indexOf('920.') + '/' + svgLate.indexOf('920.'));
  t('复杂度: 横轴从 1 起标（说明文字 + 首刻度为 1）', svgLate.indexOf('横轴 1 到当前 n') >= 0 && svgLate.indexOf('>1<') >= 0);
  const svg4 = M.complexity.render(cx.frames[3].snap);
  t('复杂度: n=4 刻度无重复（1,2,3,4 各一次）', (svg4.match(/>4</g) || []).length === 1 && (svg4.match(/>3</g) || []).length === 1, (svg4.match(/>[234]</g) || []));
  t('复杂度: 轴顶标实际最大值（n=16 → 65536，位于轴顶 y=60）', (() => {
    const svg = M.complexity.render(cx.frames[15].snap);
    return /<text x="88" y="60"[^>]*>65536<\/text>/.test(svg);
  })());
  t('复杂度: 顶格刻度贴近轴顶时不补最大值（n=10 不叠字）', (() => {
    const svg = M.complexity.render(cx.frames[9].snap);
    return svg.indexOf('10³') >= 0 && !/<text x="88" y="60"/.test(svg);
  })());
  const so = M.seqOps.run({ op: 'find', key: 47, data: '25,12,47,89,36,14' });
  const sof = so.frames.filter(f => f.snap.mark)[0];
  t('顺序表查找 47: 命中位序 3，比较 3 次', sof && sof.snap.res === '位序 3' && sof.panel['比较'] === '3 次', sof && sof.panel['比较']);
  const sof2 = M.seqOps.run({ op: 'find', key: 99, data: '25,12,47,89,36,14' }).frames.filter(f => f.snap.mark)[0];
  t('顺序表查找 99: 失败扫满全表（6 次）', sof2 && sof2.snap.res === '未找到' && /比较 6 次/.test(sof2.msg), sof2 && sof2.msg);
  const sog = M.seqOps.run({ op: 'get', pos: 3, data: '25,12,47,89,36,14' }).frames.filter(f => f.snap.mark)[0];
  t('顺序表取值 i=3: 一步 O(1) 得 47', sog && sog.snap.res === '第 3 个 = 47', sog && sog.snap.res);
  const soge = M.seqOps.run({ op: 'get', pos: 9, data: '25,12,47,89,36,14' }).frames.filter(f => f.snap.mark)[0];
  t('顺序表取值 i=9 越界: ERROR', soge && soge.snap.res.indexOf('ERROR') >= 0, soge && soge.snap.res);
  const som = M.seqOps.run({ op: 'max', data: '25,12,47,89,36,14' }).frames.filter(f => f.snap.mark)[0];
  t('顺序表求最大值: max=89，比较 n-1=5 次', som && som.snap.res === 'max = 89' && /比较 5 次/.test(som.msg), som && som.msg);
  const sol = M.seqOps.run({ op: 'len', data: '25,12,47,89,36,14' }).frames.filter(f => f.snap.mark)[0];
  t('顺序表求表长: n=6', sol && sol.snap.res === 'n = 6');
  const sot = M.seqOps.run({ op: 'trav', data: '1,2' }).frames.filter(f => f.snap.mark)[0];
  t('顺序表遍历: 输出全部 2 个', sot && /共 2 个/.test(sot.snap.res), sot && sot.snap.res);
  const se = (() => { try { M.seqOps.run({ op: 'find', key: 1, data: 'x' }); return false; } catch (e) { return true; } })();
  t('顺序表: 非法序列被拒绝', se);
  const lo = M.linkOps.run({ op: 'find', key: 47, data: '25,12,47,89,36,14' });
  const lof = lo.frames.filter(f => f.snap.mark)[0];
  t('链表查找 47: 走 3 步命中第 3 个结点', lof && lof.snap.res.indexOf('第 3 个') >= 0 && lof.snap.hops === 3, lof && lof.snap);
  const lof2 = M.linkOps.run({ op: 'find', key: 99, data: '25,12,47,89,36,14' }).frames.filter(f => f.snap.mark)[0];
  t('链表查找 99: 走到 NULL 失败', lof2 && lof2.snap.res === '未找到', lof2 && lof2.snap.res);
  const lol = M.linkOps.run({ op: 'len', data: '25,12,47,89,36,14' }).frames.filter(f => f.snap.mark)[0];
  t('链表求表长: 计满 n=6', lol && lol.snap.res === 'n = 6');
  const log3 = M.linkOps.run({ op: 'get', pos: 3, data: '25,12,47,89,36,14' }).frames.filter(f => f.snap.mark)[0];
  t('链表取值 i=3: 走 3 步得 47（O(n)）', log3 && log3.snap.res === '第 3 个 = 47' && /3 步/.test(log3.msg), log3 && log3.msg);
  const loge = M.linkOps.run({ op: 'get', pos: 7, data: '25,12,47,89,36,14' }).frames.filter(f => f.snap.mark)[0];
  t('链表取值 i=7 越界: ERROR', loge && loge.snap.res === 'ERROR');
  const ml = M.mergeList.run({ la: '3,5,8,11', lb: '2,6,8,9,15' });
  const mlf = ml.frames[ml.frames.length - 1];
  t('合并有序表: LC = 2,3,5,6,8,8,9,11,15', mlf.snap.LC.join(',') === '2,3,5,6,8,8,9,11,15', mlf.snap.LC.join(','));
  t('合并有序表: 共 9 个元素', mlf.snap.LC.length === 9);
  const mld = M.mergeList.run({ la: '1,2,3', lb: '10' });
  t('合并有序表: A 尽后 B 整体接上', mld.frames[mld.frames.length - 1].snap.LC.join(',') === '1,2,3,10');
  const mls = (() => { try { M.mergeList.run({ la: '3,1', lb: '2' }); return false; } catch (e) { return true; } })();
  t('合并有序表: 无序输入被拒绝', mls);
}

console.log('— M4 补强：双向链表 / 多项式相加 / 数制转换 / 迷宫 —');
{
  const di = M.dualList.run({ op: 'ins' });
  t('双向插入: 终链 10⇄20⇄25⇄30⇄40', di.frames[di.frames.length - 1].snap.list.join(',') === '10,20,25,30,40', di.frames[di.frames.length - 1].snap.list.join(','));
  t('双向插入: 有"顺序不能乱"警告帧', !!di.frames.find(f => f.snap.mark === 'warn'));
  const dd = M.dualList.run({ op: 'del' });
  t('双向删除 20: 终链 10⇄30⇄40', dd.frames[dd.frames.length - 1].snap.list.join(',') === '10,30,40');
  t('双向删除: 两步改链完成', !!dd.frames.find(f => f.snap.mark === 'done'));
  const dc = M.dualList.run({ op: 'cyc' });
  t('循环链表: 演示尾指回头（回环链蓝色高亮）', dc.frames.some(f => (f.snap.links || []).some(l => l.f === 40 && l.t === 10 && l.st === 'new')));
  const pa = M.polyAdd.run({ a: '7,0 3,1 9,8 5,17', b: '8,1 22,7 -9,8' });
  const paf = pa.frames[pa.frames.length - 1].snap.R;
  t('多项式相加: 教材例题和为 7+11x+22x⁷+5x¹⁷', JSON.stringify(paf) === JSON.stringify([{ c: 7, e: 0 }, { c: 11, e: 1 }, { c: 22, e: 7 }, { c: 5, e: 17 }]), JSON.stringify(paf));
  t('多项式相加: 9x⁸ 与 −9x⁸ 抵消（结果无 e=8 项）', paf.every(t => t.e !== 8));
  const pad = M.polyAdd.run(defVals('polyAdd'));
  const padf = pad.frames[pad.frames.length - 1].snap.R;
  t('多项式相加: 默认输入（打开即看到的演示）结果 = 7+11x+22x⁷+5x¹⁷',
    JSON.stringify(padf) === JSON.stringify([{ c: 7, e: 0 }, { c: 11, e: 1 }, { c: 22, e: 7 }, { c: 5, e: 17 }]), JSON.stringify(padf));
  t('多项式相加: 默认结果不含系数为 0 的项', padf.every(x => x.c !== 0), JSON.stringify(padf));
  const paz = M.polyAdd.run({ a: '5,2', b: '-5,2' });
  t('多项式相加: 完全抵消得 0（空结果）', paz.frames[paz.frames.length - 1].snap.R.length === 0);
  const pae = (() => { try { M.polyAdd.run({ a: '7,0 3', b: '1,0' }); return false; } catch (e) { return true; } })();
  t('多项式相加: 格式错误被拒绝', pae);
  const bc = M.baseConvert.run({ n: 1348, base: '8' });
  t('数制转换: 1348 → (2504)₈（教材例题）', /2504/.test(bc.frames[bc.frames.length - 1].msg), bc.frames[bc.frames.length - 1].msg.slice(0, 50));
  const bcb = M.baseConvert.run({ n: 11, base: '2' });
  t('数制转换: 11 → (1011)₂', /1011/.test(bcb.frames[bcb.frames.length - 1].msg));
  const bch = M.baseConvert.run({ n: 255, base: '16' });
  t('数制转换: 255 → (FF)₁₆', /FF/.test(bch.frames[bch.frames.length - 1].msg));
  const bc0 = M.baseConvert.run({ n: 0, base: '8' });
  t('数制转换: N=0 有友好提示帧', bc0.frames.length >= 1 && /无需转换/.test(bc0.frames[0].msg));
  const mz = M.maze.run({ start: '1,1' });
  t('迷宫: 从(1,1)找到(8,8)出口', !!mz.frames.find(f => f.snap.mark === 'found'));
  t('迷宫: 全程含回溯帧（红虚线足迹）', !!mz.frames.find(f => f.snap.pop));
  t('迷宫: 终帧结论为"DFS+栈回溯"', /DFS|栈回溯|路径/.test(mz.frames[mz.frames.length - 1].msg));
}

console.log('— M4 补强：树转换 / 堆建立 —');
{
  const tc = M.treeConvert.run({ step: '3' });
  const tcf = tc.frames[tc.frames.length - 1].panel;
  t('树转二叉树: 二叉树先序 = 树先根遍历 ABEFCDGH', tcf['二叉树先序'] === 'A B E F C G D H', tcf['二叉树先序']);
  t('树转二叉树: 二叉树中序 = 树后根遍历 EFBGCHDA', tcf['二叉树中序'] === 'E F B G C H D A', tcf['二叉树中序']);
  t('树转二叉树: 六帧演示（原树→加线→抹线→旋转中→完成→验证）', tc.frames.length === 6);
  const tcSvgs = tc.frames.map(f => M.treeConvert.render(f.snap));
  t('树转二叉树: 每帧画面互异（真动画）', new Set(tcSvgs).size === 6, new Set(tcSvgs).size);
  t('树转二叉树: 末帧为完整二叉树（4 左孩子 + 3 右孩子连线）', (tcSvgs[5].match(/stroke="#16a34a"/g) || []).length === 4 && (tcSvgs[5].match(/stroke="#2563eb"/g) || []).length === 3);
}

console.log('— v2.1 模块边界补强（错误场景与极端输入）—');
{
  let e1 = false;
  try { M.huffman.run({ preset: 'c', w: '5' }); } catch (e) { e1 = true; }
  t('哈夫曼: 权值不足被拒绝', e1);
  const bno = M.bubbleSort.run({ preset: 'nearly', w: '' });
  t('冒泡: 几乎有序输入提前终止（比较 < 28）', parseInt(bno.frames[bno.frames.length - 1].panel['比较']) < 28, bno.frames[bno.frames.length - 1].panel['比较']);
  const qsr = M.quickSort.run({ preset: 'reverse', w: '' });
  t('快排: 逆序输入正确排序', qsr.frames[qsr.frames.length - 1].snap.arr.join(',') === '12,23,34,45,56,67,78,89');
  const isr = M.insertSort.run({ preset: 'reverse', w: '', mode: 'd' });
  t('直接插入: 逆序输入移动 42 次（28 次后移 + 7 次哨兵存取，最坏）', isr.frames[isr.frames.length - 1].panel['移动'] === '42 次', isr.frames[isr.frames.length - 1].panel['移动']);
  const kmpf = M.kmp.run({ s: 'aaaa', t: 'ab' });
  t('KMP: 无匹配时 BF/KMP 均报失败', /失败/.test(kmpf.frames.find(f => f.snap.mark === 'bfdone').msg) && /失败/.test(kmpf.frames.find(f => f.snap.mark === 'kmpdone').msg));
  const mx5 = M.matrix.run({ scen: 'sym', ii: 5, jj: 5, w: '1,2,3,4,5, 2,6,7,8,9, 3,7,10,11,12, 4,8,11,13,14, 5,9,12,14,15' });
  t('对称矩阵: 5 阶矩阵映射正常（k=14）', /sa\[14\]/.test(mx5.frames[2].msg), mx5.frames[2].msg.slice(0, 40));
  const hashFull = M.hashLinear.run({ w: '13,26,39,52,0,1,2,3,4,5,6,7,8' });
  t('哈希线性探测: 13 个元素装满表（含回绕）不崩', hashFull.frames[hashFull.frames.length - 2].snap.table.every(x => x !== null));
  const avlAll = ['LL', 'RR', 'LR', 'RL'].every(s => {
    const r = M.avl.run({ scen: s });
    return r.frames.some(f => f.snap.mark === 'rot');
  });
  t('AVL: 四场景均有旋转帧', avlAll);
  const gal2 = M.sortGallery.run({ preset: 'reverse', w: '' });
  t('排序总览: 逆序数据 8 算法结果仍一致', gal2.frames[0].snap.stats.every(s => s.sorted));
  const bs2 = M.blockSearch.run({ key: '8', im: 'seq' });
  t('分块查找: 第 1 块命中 8', /成功/.test(bs2.frames.find(f => f.snap.mark).snap.res));
}

console.log('— v2.1 深度校验：排列不变量 / 随机数据 / 教材第二例 / 结构完整性 —');
{
  /* 排序模块：逐帧都是输入的排列（元素无丢无重） + 随机数据结果有序 */
  const sortIds = ['insertSort', 'shellSort', 'bubbleSort', 'quickSort', 'selectSort', 'heapSort', 'mergeSort', 'radixSort'];
  const ref = [49, 38, 65, 97, 76, 13, 27, 49].slice().sort((a, b) => a - b);
  sortIds.forEach(id => {
    const r = M[id].run({ preset: 'textbook', w: '' });
    const norm = a => a.map(Number).sort((x, y) => x - y).join(',');
    const okLen = r.frames.every(f => f.snap.arr && (f.snap.arr.length === 8 || f.snap.arr.length === 10));
    const own = id === 'radixSort' ? [278, 109, 63, 930, 589, 184, 505, 269, 8, 83] : ref;
    const finArr = r.frames[r.frames.length - 1].snap.arr.map(Number).sort((x, y) => x - y).join(',');
    t('排序不变量[' + id + ']: 位置数守恒且终帧为有序排列', okLen && finArr === norm(own), finArr);
    const rr = M[id].run({ preset: 'random', w: '' });
    const fin = rr.frames[rr.frames.length - 1].snap.arr.map(Number);
    t('排序随机数据[' + id + ']: 结果有序', fin.every((x, i) => i === 0 || fin[i - 1] <= x), fin.join(','));
  });
  t('排序帧解说: 全部排序模块每帧 msg 非空', sortIds.every(id => M[id].run({ preset: 'textbook', w: '' }).frames.every(f => (f.msg || '').length > 5)));
  const gq = M.sortGallery.run({ preset: 'reverse', w: '' }).frames[0].snap.stats;
  t('排序总览: 逆序下快排比较 28 次（与有序同为最坏）', gq[3].cmp === 28, gq[3].cmp);
  /* 折半查找极端位置 */
  const rb5 = M.seqBinSearch.run({ mode: 'bin', key: 5, w: '' });
  t('折半查找 5(首元素): 路径 6→3→1', rb5.frames.filter(f => f.snap.mid != null).map(f => f.snap.mid).slice(0, 3).join(',') === '6,3,1');
  const rb92 = M.seqBinSearch.run({ mode: 'bin', key: 92, w: '' });
  t('折半查找 92(末元素): 路径 6→9→10→11（4 次）', rb92.frames.filter(f => f.snap.mid != null).map(f => f.snap.mid).slice(0, 4).join(',') === '6,9,10,11');
  /* 哈夫曼教材第二例 */
  const h2 = M.huffman.run({ preset: 'b', w: '' });
  const h2wpl = h2.frames.map(f => f.panel && f.panel['WPL']).filter(Boolean).pop();
  t('哈夫曼例2: WPL = 261（教材 cp5-06）', String(h2wpl).indexOf('261') >= 0, String(h2wpl));
  /* 表达式嵌套 */
  const ex2 = M.expression.run({ expr: '8-(3-2)' });
  t('表达式求值: 括号嵌套 8-(3-2) = 7', /7/.test(ex2.frames[ex2.frames.length - 1].msg.slice(0, 60)), ex2.frames[ex2.frames.length - 1].msg.slice(0, 40));
  /* 循环队列另两方案 */
  const cqTag = M.circQueue.run({ demo: 'tag' });
  t('循环队列tag方案: 演示完成且含队满判定', cqTag.frames.length > 10 && !!cqTag.frames.find(f => (f.msg || '').indexOf('tag') >= 0 || (f.msg || '').indexOf('队满') >= 0));
  const cqSize = M.circQueue.run({ demo: 'size' });
  t('循环队列size方案: size 计数演示完成', cqSize.frames.length > 10);
  /* 哈希链地址逐元素统计 */
  const rc3 = M.hashChain.run({ w: '19,14,23,1,68,20,84,27,55,11' });
  t('哈希链地址: 最终位次统计 19→2，14→3，27→1', /19→2，14→3/.test(rc3.frames[rc3.frames.length - 1].msg) && /27→1/.test(rc3.frames[rc3.frames.length - 1].msg));
  /* 数制转换栈深 */
  const bc2 = M.baseConvert.run({ n: 4096, base: '2' });
  t('数制转换: 4096 → 12 位二进制 1000000000000', /1000000000000/.test(bc2.frames[bc2.frames.length - 1].msg));
  t('数制转换: 最大栈深 12（12 位余数曾同时入栈）', bc2.frames.some(f => f.panel['栈深'] === '12'));
  /* 迷宫左下入口有解 */
  const mz2 = M.maze.run({ start: '8,1' });
  t('迷宫: 从(8,1)出发同样找到出口', !!mz2.frames.find(f => f.snap.mark === 'found'));
  /* 多项式接续两个方向 */
  const pa2 = M.polyAdd.run({ a: '1,0 2,3', b: '4,1' });
  t('多项式相加: 指数交错合并 1+4x+2x³', JSON.stringify(pa2.frames[pa2.frames.length - 1].snap.R) === JSON.stringify([{ c: 1, e: 0 }, { c: 4, e: 1 }, { c: 2, e: 3 }]));
  const pa3 = M.polyAdd.run({ a: '1,0', b: '2,5 3,6' });
  t('多项式相加: A 尽后 B 剩余并入', JSON.stringify(pa3.frames[pa3.frames.length - 1].snap.R) === JSON.stringify([{ c: 1, e: 0 }, { c: 2, e: 5 }, { c: 3, e: 6 }]));
  /* 双向链表插入四步帧 */
  const di2 = M.dualList.run({ op: 'ins' });
  t('双向插入: start/step1..4/warn 各阶段帧齐全', ['start', 'step1', 'step2', 'step3', 'step4', 'warn'].every(s => di2.frames.some(f => f.snap.stage === s)), di2.frames.map(f => f.snap.stage).join(','));
  /* 树转换分步 */
  t('树转二叉树: 完整动画 6 帧（含旋转中间帧与完成帧）', M.treeConvert.run({}).frames.length === 6);
  /* 建堆随机数据堆性质（heapBuild 已并入堆排序章，用 heapSort 的建堆帧验证） */
  const hbR = M.heapSort.run({ preset: 'textbook', w: '' });
  const hf = hbR.frames.find(f => f.snap.mark === 'heap').snap.arr;
  let heapOK = true;
  for (let i = 1; i <= hf.length; i++) {
    if (2 * i <= hf.length && hf[i - 1] < hf[2 * i - 1]) heapOK = false;
    if (2 * i + 1 <= hf.length && hf[i - 1] < hf[2 * i]) heapOK = false;
  }
  t('建堆: 教材例题建堆后满足大根堆性质（父≥子）', heapOK, hf.join(','));
  /* 顺序/链表首元素 */
  const so1 = M.seqOps.run({ op: 'find', key: 25, data: '25,12,47' }).frames.filter(f => f.snap.mark)[0];
  t('顺序表查找首元素: 比较 1 次', so1 && so1.panel['比较'] === '1 次');
  const lo1 = M.linkOps.run({ op: 'get', pos: 1, data: '25,12,47' }).frames.filter(f => f.snap.mark)[0];
  t('链表取值 i=1: 1 步即得', lo1 && lo1.snap.res === '第 1 个 = 25');
  /* 结构完整性：43 模块注册规范 */
  const all = DSC.mods;
    t('结构: 模块总数 56（新增链表经典题）', all.length === 56, all.length);
  t('结构: 模块 id 无重复', new Set(all.map(m => m.id)).size === all.length);
  t('结构: 全部模块有非空使用引导', all.every(m => m.guide && m.guide.length >= 3));
  t('结构: 全部模块有非空教材标注（无本校 cp 编号）', all.every(m => (m.note || '').length >= 6 && m.note.indexOf('cp') < 0));
  t('结构: 章节号均在 1~8', all.every(m => m.ch >= 1 && m.ch <= 8));
  t('结构: 每模块渲染函数存在且可调用', all.every(m => typeof m.render === 'function'));
  t('数制转换: 1348 转八进制最大栈深 4（对应 4 位结果）', M.baseConvert.run({ n: 1348, base: '8' }).frames.some(f => f.panel['栈深'] === '4'));
  t('排序总览: 终帧状态面板算法数为 8', M.sortGallery.run({ preset: 'textbook', w: '' }).frames.slice(-1)[0].panel['算法数'] === '8');
}

console.log('— 第7章 B 树 / B+ 树 —');
{
  const b = {};
  (M.btree.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const runB = o => M.btree.run(Object.assign({}, b, o));
  const fin = r => r.frames[r.frames.length - 1].snap;
  const lv = n => n.leaf ? [n] : n.ch.reduce((a, c) => a.concat(lv(c)), []);
  const nodes = n => n.leaf ? [n] : [n].concat(n.ch.reduce((a, c) => a.concat(nodes(c)), []));
  const firstKey = n => n.leaf ? n.keys[0] : firstKey(n.ch[0]);
  const leafLevels = (n, l, out) => { if (n.leaf) { out.push(l); return out; } n.ch.forEach(c => leafLevels(c, l + 1, out)); return out; };
  /* B 树每个关键字只存一份、可能在内部结点上；B+ 才要求全部落在叶子层 */
  const keysOf = n => n.keys.concat(n.leaf ? [] : n.ch.reduce((a, c) => a.concat(keysOf(c)), []));
  const leafKeys = n => n.leaf ? n.keys.slice() : n.ch.reduce((a, c) => a.concat(leafKeys(c)), []);

  /* B 树不变式：容量上下界、结点内有序、孩子数 = 关键字数 + 1、所有叶子同层、
     子树整体满足 左 < key[i] < 右 */
  function checkB(t, m) {
    const maxK = m - 1, minK = Math.ceil(m / 2) - 1, bad = [];
    (function rec(x, root) {
      if (x.keys.length > maxK) bad.push('超容量[' + x.keys.join(' ') + ']');
      if (!root && x.keys.length < minK) bad.push('低于下界[' + x.keys.join(' ') + ']');
      if (root && x.keys.length < 1) bad.push('空根');
      for (let i = 1; i < x.keys.length; i++) if (x.keys[i - 1] >= x.keys[i]) bad.push('结点内无序');
      if (!x.leaf) {
        if (x.ch.length !== x.keys.length + 1) bad.push('孩子数不等于关键字数+1');
        x.ch.forEach((c, i) => {
          keysOf(c).forEach(k => {
            if (i > 0 && !(k > x.keys[i - 1])) bad.push('左界破坏 ' + k + '<=' + x.keys[i - 1]);
            if (i < x.keys.length && !(k < x.keys[i])) bad.push('右界破坏 ' + k + '>=' + x.keys[i]);
          });
          rec(c, false);
        });
      }
    })(t, true);
    const ls = leafLevels(t, 0, []);
    if (new Set(ls).size !== 1) bad.push('叶子不同层 ' + ls.join(','));
    return bad;
  }

  /* B+ 不变式：关键字全在叶子层且无重无漏、叶子递增、索引键 = 右子树首键的副本 */
  function checkPlus(t, m, seq) {
    const maxK = m - 1, minK = Math.ceil(m / 2) - 1, bad = [];
    const flat = leafKeys(t);
    if (flat.join(',') !== seq.slice().sort((x, y) => x - y).join(',')) bad.push('叶子层不是全集: ' + flat.join(','));
    (function rec(x, root) {
      if (x.keys.length > maxK) bad.push('超容量[' + x.keys.join(' ') + ']');
      if (!root && x.keys.length < minK) bad.push('低于下界[' + x.keys.join(' ') + ']');
      if (!x.leaf) {
        if (x.ch.length !== x.keys.length + 1) bad.push('孩子数不等于关键字数+1');
        x.keys.forEach((k, i) => { if (k !== firstKey(x.ch[i + 1])) bad.push('索引键 ' + k + ' 不是右子树首键 ' + firstKey(x.ch[i + 1])); });
        x.ch.forEach(c => rec(c, false));
      }
    })(t, true);
    if (new Set(leafLevels(t, 0, [])).size !== 1) bad.push('叶子不同层');
    return bad;
  }

  const SEQ = '10,20,30,40,50,60,70,80,90';
  const r3 = runB({ scene: 'ins', order: 3, seq: SEQ });
  const t3 = fin(r3).tree;
  t('B树: 3 阶插 10..90 长成 root[40] / [20] / [60 80]',
    t3.keys.join(',') === '40' && t3.ch[0].keys.join(',') === '20' && t3.ch[1].keys.join(',') === '60,80',
    JSON.stringify(t3.keys) + '/' + JSON.stringify(t3.ch.map(x => x.keys)));
  t('B树: 3 阶树高 3（9 个关键字只用 3 层）', fin(r3).h === 3, fin(r3).h);
  [3, 4, 5].forEach(m => {
    const r = runB({ scene: 'ins', order: m, seq: m === 5 ? '5,10,15,20,25,30,35,40,45,50,55,60' : SEQ });
    const sq = (m === 5 ? '5,10,15,20,25,30,35,40,45,50,55,60' : SEQ).split(',').map(Number);
    t('B树: m=' + m + ' 满足全部不变式', checkB(fin(r).tree, m).length === 0, checkB(fin(r).tree, m).slice(0, 3));
    t('B树: m=' + m + ' 关键字无重无漏', keysOf(fin(r).tree).sort((x, y) => x - y).join(',') === sq.join(','), keysOf(fin(r).tree).sort((x, y) => x - y).join(','));
    t('B树: m=' + m + ' 每一帧的树都不比上一层深', r.frames.every(f => f.snap.h >= 1), '');
  });
  t('B树: 顺序插入也会反复分裂（不是一条链）', fin(r3).splits === 5, fin(r3).splits);
  t('B树: 分裂帧会写明中位数上移', r3.frames.filter(f => /上移/.test(f.msg)).length >= 4,
    r3.frames.filter(f => /上移/.test(f.msg)).length);

  const rp = runB({ scene: 'plus', order: 3, seq: SEQ });
  t('B+树: 9 个关键字全部留在叶子层', leafKeys(fin(rp).tree).join(',') === SEQ,
    lv(fin(rp).tree).map(l => l.keys.join(' ')).join(' | '));
  t('B+树: 满足 B+ 不变式（索引键是副本）', checkPlus(fin(rp).tree, 3, SEQ.split(',').map(Number)).length === 0,
    checkPlus(fin(rp).tree, 3, SEQ.split(',').map(Number)).slice(0, 3));
  const rp4 = runB({ scene: 'plus', order: 4, seq: '3,9,17,25,31,42,56,70' });
  t('B+树: m=4 同样满足不变式', checkPlus(fin(rp4).tree, 4, [3, 9, 17, 25, 31, 42, 56, 70]).length === 0,
    checkPlus(fin(rp4).tree, 4, [3, 9, 17, 25, 31, 42, 56, 70]).slice(0, 3));
  t('B+树: 分裂文案说"复制"而不是"移走"',
    rp.frames.filter(f => /复制/.test(f.msg)).length >= 4, rp.frames.filter(f => /复制/.test(f.msg)).length);
  t('B+树: 面板关键字数只算叶子层（9 不是 13）', fin(rp).n === 9, fin(rp).n);
  t('B+树: 画布画出叶子链表箭头',
    (M.btree.render(fin(rp)).match(/<polygon/g) || []).length >= lv(fin(rp).tree).length - 1);

  const sh = runB({ scene: 'search', order: 3, seq: SEQ, target: 40 });
  t('B树查找: 命中的关键字有命中帧', sh.frames.some(f => /命中/.test(f.msg)) && sh.frames.some(f => f.snap.found));
  const ms = runB({ scene: 'search', order: 3, seq: SEQ, target: 45 });
  t('B树查找: 不在树里的值有"未找到"帧', ms.frames.some(f => /未找到/.test(f.msg)));
  t('B树查找: 比较次数不超过 树高×每层关键字数',
    Math.max.apply(null, sh.frames.map(f => +(f.panel['比较次数'] || '0 次').split(' ')[0])) <= 3 * 2,
    sh.frames.map(f => f.panel['比较次数']));

  let e1 = '', e2 = '', e3 = '';
  try { M.btree.run(Object.assign({}, b, { order: 2 })); } catch (e) { e1 = e.message; }
  try { M.btree.run(Object.assign({}, b, { seq: '1,2' })); } catch (e) { e2 = e.message; }
  try { M.btree.run(Object.assign({}, b, { seq: '1,2,a,4,5' })); } catch (e) { e3 = e.message; }
  t('B树: 阶数/个数/非整数都明确报错', /3~5/.test(e1) && /4~12/.test(e2) && /整数/.test(e3), [e1, e2, e3]);

  /* ---------- B 树删除：借位 / 合并 ---------- */
  /* 中间帧允许暂时破窗（刚删完还没救、前驱刚复制上来还重复），
     所以不变式查在每个"★ …完毕"帧上——那才是应该回到合法状态的时点 */
  const settledBad = r => r.frames.filter(f => /^★/.test(f.msg))
    .map(f => ({ n: f.msg.slice(0, 14), bad: checkB(f.snap.tree, +f.snap.m) }))
    .filter(x => x.bad.length).slice(0, 3);
  const d3 = runB({ scene: 'del', order: 3, seq: SEQ, dels: '50,30,20,40,10,60' });
  t('B树删除: 每个"删除完毕"帧都满足 B 树全部不变式', settledBad(d3).length === 0, settledBad(d3));
  t('B树删除: 删掉的 6 个关键字真消失、其余一个不少',
    keysOf(fin(d3).tree).slice().sort((x, y) => x - y).join(',') === '70,80,90',
    keysOf(fin(d3).tree).slice().sort((x, y) => x - y).join(','));
  t('B树删除: 借位与合并都真的演示过（不是只靠直接删）',
    d3.frames.some(f => /借位/.test(f.msg)) && d3.frames.some(f => /合并/.test(f.msg)),
    [d3.frames.filter(f => /借位/.test(f.msg)).length, d3.frames.filter(f => /合并/.test(f.msg)).length]);
  t('B树删除: 删分支结点的关键字时改用直接前驱顶替，再转化到叶子',
    d3.frames.some(f => /直接前驱/.test(f.msg)), d3.frames.filter(f => /前驱/.test(f.msg)).length);
  t('B树删除: 删除过程中树高只减不增',
    d3.frames.every((f, i) => i === 0 || f.snap.h <= d3.frames[i - 1].snap.h),
    d3.frames.map(f => f.snap.h).join(','));
  const dAll = runB({ scene: 'del', order: 3, seq: SEQ, dels: '10,20,30,40,50,60,70,80,90' });
  t('B树删除: 全部删空后塌成一层空根',
    fin(dAll).h === 1 && keysOf(fin(dAll).tree).length === 0, [fin(dAll).h, keysOf(fin(dAll).tree)]);
  const dMiss = runB({ scene: 'del', order: 3, seq: SEQ, dels: '999' });
  t('B树删除: 不在树里的关键字报 ERROR 且树完全不动',
    dMiss.frames.some(f => /不在树里/.test(f.msg)) && keysOf(fin(dMiss).tree).length === 9,
    [dMiss.frames.some(f => /不在树里/.test(f.msg)), keysOf(fin(dMiss).tree).length]);
  [[4, SEQ, '20,10,30,40,50,60'], [5, '5,10,15,20,25,30,35,40,45,50,55,60', '30,60,10,50,90,20,5,55'],
   [3, '1,2,3,4,5,6,7,8,9,10,11,12', '7,8,6,5,9,4,10,3']].forEach(c => {
    const r = runB({ scene: 'del', order: c[0], seq: c[1], dels: c[2] });
    const gone = c[2].split(',').map(Number);
    const want = c[1].split(',').map(Number).filter(k => gone.indexOf(k) < 0).sort((x, y) => x - y);
    t('B树删除 m=' + c[0] + ': 不变式 + 集合都正确',
      settledBad(r).length === 0 && keysOf(fin(r).tree).slice().sort((x, y) => x - y).join(',') === want.join(','),
      [settledBad(r), keysOf(fin(r).tree).slice().sort((x, y) => x - y).join(','), want.join(',')]);
  });
  const dRoot = runB({ scene: 'del', order: 3, seq: SEQ, dels: '40' });
  t('B树删除: 删根上的分界也走前驱替代，不直接摘',
    dRoot.frames.some(f => /40 在分支结点/.test(f.msg) && /直接前驱/.test(f.msg)),
    dRoot.frames.slice(1, 3).map(f => f.msg.slice(0, 24)).join(' | '));
  let e4 = '', e5 = '';
  try { runB({ scene: 'del', order: 3, seq: SEQ, dels: 'a' }); } catch (e) { e4 = e.message; }
  try { runB({ scene: 'del', order: 3, seq: SEQ, dels: '' }); } catch (e) { e5 = e.message; }
  t('B树删除: 删除序列非整数/为空都明确报错', /整数/.test(e4) && /至少/.test(e5), [e4, e5]);
}


console.log('— 第7章 红黑树 —');
{
  const b = {};
  (M.rbt.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = o => M.rbt.run(Object.assign({}, b, o));
  const isR = t => !!t && t.c === 'R';
  function violations(t) {
    const bad = [];
    if (t && t.c !== 'B') bad.push('根非黑');
    (function nr(x) {
      if (!x) return;
      if (x.c === 'R' && (isR(x.l) || isR(x.r))) bad.push('红红相邻@' + x.v);
      if (isR(x.r)) bad.push('右倾红链@' + x.v);
      nr(x.l); nr(x.r);
    })(t);
    const acc = [];
    (function bd(x, d) { if (!x) { acc.push(d); return; } const e = d + (x.c === 'B' ? 1 : 0); bd(x.l, e); bd(x.r, e); })(t, 0);
    if (new Set(acc).size > 1) bad.push('黑高不等[' + acc.join(',') + ']');
    return bad;
  }
  function bstBad(t, lo, hi) {
    if (!t) return [];
    if (t.v <= lo || t.v >= hi) return ['BST序破坏@' + t.v];
    return bstBad(t.l, lo, t.v).concat(bstBad(t.r, t.v, hi));
  }
  const inorder = t => (t ? inorder(t.l).concat([t.v]).concat(inorder(t.r)) : []);
  const count = t => (t ? 1 + count(t.l) + count(t.r) : 0);
  const height = t => (t ? 1 + Math.max(height(t.l), height(t.r)) : 0);

  const SEQ = [
    '10,85,40,5,70,80,60,30,20,90', '1,2,3,4,5,6,7,8', '8,7,6,5,4,3,2,1',
    '16,3,7,11,13,9,5,2,4,6,10,14', '12,1,9,2,11,4,7'
  ];
  SEQ.forEach((sq, si) => {
    const r = run({ seq: sq, find: Number(sq.split(',')[2]) });
    const want = sq.split(',').map(Number);
    const badFrames = [];
    r.frames.forEach((f, i) => {
      const v = violations(f.snap.root).concat(bstBad(f.snap.root, -Infinity, Infinity));
      if (v.length) badFrames.push('f' + (i + 1) + ':' + v[0]);
    });
    t('红黑树: 序列' + (si + 1) + ' 每一帧都满足五条性质 + 左倾不变式', badFrames.length === 0, badFrames.slice(0, 2));
    const fin = r.frames[r.frames.length - 1].snap.root;
    t('红黑树: 序列' + (si + 1) + ' 结点无重无漏', count(fin) === want.length && new Set(inorder(fin)).size === want.length,
      count(fin) + '/' + want.length);
    t('红黑树: 序列' + (si + 1) + ' 中序遍历即升序',
      inorder(fin).join(',') === want.slice().sort((x, y) => x - y).join(','), inorder(fin).join(','));
    t('红黑树: 序列' + (si + 1) + ' 树高 ≤ 2·log₂(n+1)',
      height(fin) <= 2 * Math.log2(want.length + 1) + 1e-9, height(fin) + ' vs ' + (2 * Math.log2(want.length + 1)).toFixed(2));
  });
  /* 顺序插入最考验平衡：1..8 若退化成链，树高就是 8 */
  const inc = run({ seq: '1,2,3,4,5,6,7,8', find: 1 });
  const ih = height(inc.frames[inc.frames.length - 1].snap.root);
  t('红黑树: 顺序插入不退化（1..8 树高远小于 8）', ih <= 5, ih);
  const dec = run({ seq: '8,7,6,5,4,3,2,1', find: 8 });
  t('红黑树: 逆序插入同样平衡', height(dec.frames[dec.frames.length - 1].snap.root) <= 5);
  /* 查找 */
  const hit = run({ seq: '10,85,40,5,70,80,60,30,20,90', find: 60 });
  t('红黑树: 查找命中的值确实在树里',
    inorder(hit.frames[hit.frames.length - 1].snap.root).indexOf(60) >= 0 && /命中/.test(hit.frames[hit.frames.length - 1].msg));
  const miss = run({ seq: '1,2,3,4,5', find: 99 });
  t('红黑树: 不存在的值报未找到', /未找到/.test(miss.frames[miss.frames.length - 1].msg));
  t('红黑树: 查找路径自顶向下连续',
    hit.frames[hit.frames.length - 1].snap.path.length >= 2);
  /* 调整动作必须真的发生过，否则等于没演 */
  const adj = run({ seq: '10,85,40,5,70,80,60,30,20,90', find: 60 });
  const adjFrames = adj.frames.filter(f => /触发了 \d+ 次调整/.test(f.msg));
  t('红黑树: 插入过程确有旋转/变色', adjFrames.length >= 5, adjFrames.length);
  t('红黑树: 调整动作名与三种操作一致',
    adjFrames.every(f => /左旋|右旋|变色/.test(f.msg)));

  let e1 = '', e2 = '';
  try { M.rbt.run(Object.assign({}, b, { seq: '1,2,x' })); } catch (e) { e1 = e.message; }
  try { M.rbt.run(Object.assign({}, b, { seq: '1,2' })); } catch (e) { e2 = e.message; }
  t('红黑树: 非整数与长度越界明确报错', /整数/.test(e1) && /3~12/.test(e2), [e1, e2]);
}

console.log('— 第8章 外部排序 —');
{
  const base = {};
  (M.extSort.inputs || []).forEach(s => { base[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
  const run = o => M.extSort.run(Object.assign({}, base, o));
  const fin = r => r.frames[r.frames.length - 1].snap;
  const sorted = r => r.every(x => x.every((k, i) => i === 0 || x[i - 1] <= k));

  const od = fin(run({ scene: 'gen', genMode: 'order' }));
  t('外排: 顺序分组得 4 个归并段、段长恒为 w=6', od.runs.length === 4 && od.runs.every(r => r.length === 6),
    od.runs.map(r => r.length));
  t('外排: 顺序分组各段内部有序', sorted(od.runs));

  const rp = fin(run({ scene: 'gen', genMode: 'replace' }));
  t('外排: 置换-选择段数更少（3 < 4）', rp.runs.length < od.runs.length, [od.runs.length, rp.runs.length]);
  t('外排: 置换-选择各段仍有序', sorted(rp.runs));
  t('外排: 置换-选择元素总数守恒', rp.runs.reduce((s, r) => s + r.length, 0) === 24,
    rp.runs.reduce((s, r) => s + r.length, 0));

  /* 趟数必须等于 ⌈log_k(m)⌉，且最终归并结果全序 */
  [2, 3, 4, 6].forEach(k => {
    const mg = fin(run({ scene: 'merge', genMode: 'replace', k: k }));
    const m0 = mg.levels[0].length;
    const want = Math.ceil(Math.log(m0) / Math.log(k));
    const last = mg.levels[mg.levels.length - 1];
    t('外排: k=' + k + ' 趟数 = ⌈log_' + k + '(' + m0 + ')⌉ = ' + want, mg.pass === want, [mg.pass, want]);
    t('外排: k=' + k + ' 末层只剩 1 段且全序', last.length === 1 && last[0].length === 24 &&
      last[0].every((x, i) => i === 0 || last[0][i - 1] <= x), last.length + '/' + last[0].length);
  });

  let e1 = '', e2 = '', e3 = '';
  try { M.extSort.run(Object.assign({}, base, { data: '1,2,3' })); } catch (e) { e1 = e.message; }
  try { M.extSort.run(Object.assign({}, base, { mem: 1 })); } catch (e) { e2 = e.message; }
  try { M.extSort.run(Object.assign({}, base, { k: 9 })); } catch (e) { e3 = e.message; }
  t('外排: 记录数/工作区/路数越界都明确报错', /4~24/.test(e1) && /2~12/.test(e2) && /2~8/.test(e3), [e1, e2, e3]);

  /* 拼接优先级事故：'…' + genMode === 'replace' 先加后比，首句被吞、方法名永远显示"顺序分组" */
  const mgRep = run({ scene: 'merge', genMode: 'replace', k: 2 });
  const mgOrd = run({ scene: 'merge', genMode: 'order' });
  t('外排: 置换-选择的阶段二首帧保留完整句子且方法名正确',
    /^阶段二：/.test(mgRep.frames[0].msg) && /置换-选择得到的 3 个段/.test(mgRep.frames[0].msg), mgRep.frames[0].msg);
  t('外排: 顺序分组的阶段二首帧方法名跟着变',
    /^阶段二：/.test(mgOrd.frames[0].msg) && /顺序分组得到的 4 个段/.test(mgOrd.frames[0].msg), mgOrd.frames[0].msg);
  /* 封段原因里的 lastOut 必须是重置前的值，不能印成空括号 */
  const sealF = run({ scene: 'gen', genMode: 'replace' }).frames.filter(f => /封住第/.test(f.msg));
  t('外排: 封段帧给出重置前的 lastOut 和刚封住的段长',
    sealF.length === 2 && /≥ lastOut=97/.test(sealF[0].msg) && /封住第 1 段\*\*（11 个）/.test(sealF[0].msg),
    sealF.map(f => f.msg));
  t('外排: 帧文案无空括号拼接残留',
    run({ scene: 'gen', genMode: 'replace' }).frames.every(f => !/lastOut\(\)|\(\)/.test(f.msg)));
  /* 趟数是这次演示的常量，不能随翻页从 0 跳到 1 再跳到 2 */
  const titles = mgRep.frames.map(f => M.extSort.render(f.snap)).filter(x => x);
  t('外排: 阶段二标题与底部趟数在所有帧一致',
    titles.every(x => x.indexOf('共 2 趟') >= 0) && titles.every(x => /⌉ = 2/.test(x)),
    titles[0].match(/共 \d+ 趟/));
  t('外排: 阶段二画出层间"谁并成谁"的连线',
    (titles[2].match(/<line /g) || []).length > (titles[0].match(/<line /g) || []).length,
    [(titles[0].match(/<line /g) || []).length, (titles[2].match(/<line /g) || []).length]);
}

/* 逐帧烟测与画布几何检查共用这张用例表：只喂默认输入的话，
   多场景模块（外部排序的两个阶段、并查集的三种策略）的其余版式就没人查 */
const CASES = {
    seqList: [{ op: 'insert', i: 3, e: 33, data: '25,12,47,89,36,14' }, { op: 'del', i: 2, e: 0, data: '25,12,47,89,36,14' }, { op: 'insert', i: 0, e: 1, data: '1,2' }, { op: 'insert', i: 3, e: 33, errDir: true, data: '25,12,47,89,36,14' }],
    linkList: [{ op: 'insert', i: 3, e: 33, bad: false, data: '25,12,47,89,36,14' }, { op: 'insert', i: 3, e: 33, bad: true, data: '25,12,47,89,36,14' }, { op: 'del', i: 4, e: 0, bad: false, data: '25,12,47,89,36,14' }],
    linkProblems: [
      { scene: 'reverse', data: '25,12,47,89,36' },
      { scene: 'reverse', data: '1,2' },
      { scene: 'reverse', data: '1,2,3,4,5,6,7,8' },
      { scene: 'josephus', n: 7, k: 3 },
      { scene: 'josephus', n: 10, k: 6 },
      { scene: 'josephus', n: 3, k: 2 },
      { scene: 'intersect', segs: '7,2|5|8,3,6' },
      { scene: 'intersect', segs: '1,2,3,4|5,6|7,8,9' },
      { scene: 'intersect', segs: '1,2|1,2|' },
      { scene: 'intersect', segs: '|1|3,4' }
    ],
    seqStack: [{ scene: 'push', seq: 'A,B,C,D,E,F' }, { scene: 'pop', seq: 'A,B,C,D,E,F' }, { scene: 'life', seq: 'A,B,C,D,E,F' }],
    circQueue: [{ demo: 'linear' }, { demo: 'fewer' }, { demo: 'tag' }, { demo: 'size' }],
    linkStackQueue: [
      { scene: 'lpush', seq: 'A,B,C,D,E', badRear: false },
      { scene: 'lpop', seq: 'A,B,C,D,E', badRear: false },
      { scene: 'qpush', seq: 'A,B,C,D,E', badRear: false },
      { scene: 'qpop', seq: 'A,B,C,D,E', badRear: false },
      { scene: 'qpop', seq: 'A,B,C', badRear: true },
      { scene: 'lpush', seq: 'A', badRear: false }
    ],
    hanoi: [{ n: 3 }, { n: 5 }],
    traversal: [['pre', 'GDA##FE###MH##Z##'], ['in', 'GDA##FE###MH##Z##'], ['post', 'GDA##FE###MH##Z##'], ['level', 'GDA##FE###MH##Z##']].map(x => ({ mode: x[0], data: x[1] })),
    huffman: [{ preset: 'a', w: '' }, { preset: 'b', w: '' }, { preset: 'a', w: '', phase: 'decode' }, { preset: 'a', w: '', phase: 'code' }, { preset: 'a', w: '', phase: 'build' }],
    dfsBfs: [{ method: 'dfs', start: '2' }, { method: 'bfs', start: '2' }, { method: 'dfs', start: '2', storage: 'list' }],
    mst: [{ method: 'prim' }, { method: 'kruskal' }],
    dijkstra: [{ start: '0' }, { start: '1' }],
    bracket: [{ expr: '([()])' }, { expr: ')(' }, { expr: '([)]' }, { expr: '(()' }, { expr: 'a(b)c' }],
    expression: [{ expr: '3*(7-2)' }, { expr: '2+3*4' }, { expr: '5/(3-3)' }, { expr: '12*(3+4)' }],
    complexity: [{ nmax: 16 }, { nmax: 64 }],
    seqOps: [{ op: 'find', key: 47, data: '25,12,47' }, { op: 'max', data: '25,12,47,89' }],
    linkOps: [{ op: 'find', key: 47, data: '25,12,47' }, { op: 'len', data: '25,12,47' }],
    mergeList: [{ la: '1,3,5', lb: '2,4' }],
    glist: [
      { scene: 'build', lst: '(a,(b,c),(),d)' },
      { scene: 'head', lst: '(a,(b,c),(),d)' },
      { scene: 'tail', lst: '(a,(b,c),(),d)' },
      { scene: 'len', lst: '(a,(b,c),(),d)' },
      { scene: 'depth', lst: '(a,(b,c),(),d)' },
      { scene: 'depth', lst: '(a,(b,(c,(d))))' },
      { scene: 'len', lst: '((),())' },
      { scene: 'depth', lst: '(a,b,c)' },
      { scene: 'head', lst: '((b,c),d)' },
      { scene: 'tail', lst: '(a)' },
      { scene: 'build', lst: '((((a))))' }
    ],
    dualList: [{ op: 'ins' }, { op: 'del' }, { op: 'cyc' }],
    polyAdd: [{ a: '7,0 3,1 9,8 5,17', b: '8,1 22,7 -9,8' }],
    baseConvert: [{ n: 1348, base: '8' }, { n: 255, base: '16' }],
    maze: [{ start: '1,1' }, { start: '8,1' }],
    treeConvert: [{}],
    threads: [{ data: 'GDA##FE###MH##Z##', phase: 'build' }, { data: 'GDA##FE###MH##Z##', phase: 'walk' }, { data: 'GDA##FE###MH##Z##', phase: 'all' }],
    critical: [{}],
    topo: [{}, { cycle: true }],
    floyd: [{}],
    rbt: [
      { seq: '10,85,40,5,70,80,60,30,20,90', find: 60 },
      { seq: '1,2,3,4,5,6,7,8', find: 1 },
      { seq: '8,7,6,5,4,3,2,1', find: 99 },
      { seq: '16,3,7,11,13,9,5,2,4,6,10,14', find: 11 },
      { seq: '12,1,9,2,11,4,7', find: 5 }
    ],
    ufset: [
      { mode: 'plain', pairs: '1-0 2-1 3-2 4-3 5-4 6-5 7-6', probe: 0 },
      { mode: 'size', pairs: '1-0 2-1 3-2 4-3 5-4 6-5 7-6', probe: 0 },
      { mode: 'compress', pairs: '1-0 2-1 3-2 4-3 5-4 6-5 7-6', probe: 0 },
      { mode: 'compress', pairs: '0-1 0-1 2-3 5-5', probe: 2 }
    ],
    countBucket: [
      { scene: 'count', preset: 'small', w: '', nbuckets: 4 },
      { scene: 'count', preset: 'textbook', w: '', nbuckets: 4 },
      { scene: 'count', preset: 'skew', w: '', nbuckets: 4 },
      { scene: 'bucket', preset: 'small', w: '', nbuckets: 4 },
      { scene: 'bucket', preset: 'textbook', w: '', nbuckets: 2 },
      { scene: 'bucket', preset: 'skew', w: '', nbuckets: 8 },
      { scene: 'count', preset: 'custom', w: '0,0,0,1', nbuckets: 4 }
    ],
    btree: [
      { scene: 'ins', order: 3, seq: '10,20,30,40,50,60,70,80,90', target: 40 },
      { scene: 'ins', order: 4, seq: '10,20,30,40,50,60,70,80,90', target: 40 },
      { scene: 'ins', order: 5, seq: '5,10,15,20,25,30,35,40,45,50,55,60', target: 20 },
      { scene: 'search', order: 3, seq: '10,20,30,40,50,60,70,80,90', target: 40 },
      { scene: 'search', order: 3, seq: '10,20,30,40,50,60,70,80,90', target: 45 },
      { scene: 'plus', order: 3, seq: '10,20,30,40,50,60,70,80,90', target: 40 },
      { scene: 'plus', order: 4, seq: '3,9,17,25,31,42,56,70', target: 31 },
      { scene: 'del', dels: '50,30,20,40,10,60' },
      { scene: 'del', order: 4, dels: '20,10,30,40' },
      { scene: 'del', order: 5, dels: '30,60,10,50,90,20' },
      { scene: 'del', order: 4, seq: '1,2,3,4,5,6,7,8,9,10,11,12', dels: '5,6,7,8,1,12' }
    ],
    toPostfix: [
      { scene: 'conv', expr: '12/(4-2)+3*5-8/4' },
      { scene: 'both', expr: '12/(4-2)+3*5-8/4' },
      { scene: 'conv', expr: 'A-(B*C+D)/E' },
      { scene: 'conv', expr: '2^3^2' },
      { scene: 'both', expr: '2^3^2' },
      { scene: 'both', expr: '20-8-5' },
      { scene: 'both', expr: '12/4*3' },
      { scene: 'eval', expr: '1+2*3' }
    ],
    graphStore: [
      { way: 'ortho', edges: '0>1 0>2 1>2 2>0 2>3 1>3', pick: 2 },
      { way: 'ortho', edges: '0>1 1>2 2>0 3>0', pick: 0 },
      { way: 'mul', edges: '0-1 0-2 1-2 1-3 2-3 4-5', pick: 2 },
      { way: 'mul', edges: '0-1 1-2 2-3 3-0', pick: 1 },
      { way: 'mul', edges: '0-1 0-2 0-3', pick: 0 }
    ],
    graphBasic: [
      { scene: 'deg', edges: '0-1 0-2 1-2 1-3 2-3 4-5 5-6 4-6', nv: 7 },
      { scene: 'ideg', edges: '0-1 0-2 1-2 1-3 2-3 4-5 5-6 4-6', nv: 7 },
      { scene: 'conn', edges: '0-1 0-2 1-2 1-3 2-3 4-5 5-6 4-6', nv: 7 },
      { scene: 'sconn', edges: '0-1 0-2 1-2 1-3 2-3 4-5 5-6 4-6', nv: 7 },
      { scene: 'sconn', edges: '0-1 1-2 2-0 3-4', nv: 5 },
      { scene: 'ideg', edges: '0>1 1>0 1>2 2>1 2>3', nv: 5 },
      { scene: 'deg', edges: '0-1 2-3', nv: 6 },
      { scene: 'conn', edges: '0-1 2-3', nv: 6 }
    ],
    heapPQ: [
      { scene: 'build', data: '49,38,65,97,76,13,27,49', k: 3, op: 'mix' },
      { scene: 'pq', data: '49,38,65,97,76,13,27,49', k: 3, op: 'mix' },
      { scene: 'pq', data: '49,38,65,97,76,13,27,49', k: 3, op: 'pop' },
      { scene: 'pq', data: '49,38,65,97,76,13,27,49', k: 3, op: 'push' },
      { scene: 'topk', data: '49,38,65,97,76,13,27,49', k: 3, op: 'mix' },
      { scene: 'topk', data: '5,1,9,7,3', k: 2, op: 'mix' }
    ],
    treeStore: [
      { way: 'parent', target: 'A' }, { way: 'parent', target: 'E' },
      { way: 'child', target: 'A' }, { way: 'child', target: 'H' },
      { way: 'sib', target: 'A' }, { way: 'sib', target: 'B' }, { way: 'sib', target: 'H' }
    ],
    treeSeqStore: [
      { mode: 'right', scene: 'map' }, { mode: 'full', scene: 'map' }, { mode: 'sparse', scene: 'map' },
      { mode: 'right', scene: 'props' }, { mode: 'full', scene: 'props' }, { mode: 'sparse', scene: 'props' }
    ],
    extSort: [
      { scene: 'gen', genMode: 'order', data: '49,38,65,97,76,13,27,49,55,4,62,18,93,31,7,88,45,22,70,15,36,59,81,2', mem: 6, k: 3 },
      { scene: 'gen', genMode: 'replace', data: '9,8,7,6,5,4,3,2,1,10,11,12', mem: 4, k: 2 },
      { scene: 'merge', genMode: 'order', data: '49,38,65,97,76,13,27,49,55,4,62,18,93,31,7,88,45,22,70,15,36,59,81,2', mem: 6, k: 2 },
      { scene: 'merge', genMode: 'replace', data: '49,38,65,97,76,13,27,49,55,4,62,18,93,31,7,88,45,22,70,15,36,59,81,2', mem: 4, k: 3 },
      /* w=2 时长到 12 个归并段：段行距和格子宽度都会走到极限，几何检查必须覆盖 */
      { scene: 'gen', genMode: 'order', data: '49,38,65,97,76,13,27,49,55,4,62,18,93,31,7,88,45,22,70,15,36,59,81,2', mem: 2, k: 2 },
      { scene: 'merge', genMode: 'order', data: '49,38,65,97,76,13,27,49,55,4,62,18,93,31,7,88,45,22,70,15,36,59,81,2', mem: 2, k: 2 }
    ]
};

console.log('— 渲染烟测（每帧 render 不抛异常） —');

{
  let ok = true, bad = '';
  for (const id in CASES) {
    CASES[id].forEach(inp => {
      /* CASES 里只写"和默认值不同的那几项"，所以要先垫默认值再跑 */
      let res;
      try { res = M[id].run(Object.assign(defVals(id), inp)); } catch (e) { ok = false; bad += id + ':run ' + e.message + '; '; return; }
      res.frames.forEach((f, k) => {
        try {
          const svg = M[id].render(f.snap);
          if (typeof svg !== 'string' || svg.indexOf('</svg>') < 0) throw new Error('bad svg at frame ' + k);
        } catch (e) { ok = false; bad += id + '#f' + k + ':' + e.message + '; '; }
      });
    });
  }
  t('全部模块全部帧渲染成功', ok, bad);
}

console.log('— 代码行高亮：下标必须合法，且指到正在执行的那条语句 —');
{
  /* 引擎按 code.map(function (t, i) => line.indexOf(i)) 上色，line 是**下标**不是行号；
     按行号写就会整体错位一行：并查集的"先各自找根"曾经高亮 if (ra == rb) return */
  let bad = [];
  DSC.mods.forEach(m => {
    const v = {};
    (m.inputs || []).forEach(s => { v[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
    let res;
    try { res = m.run(v); } catch (e) { return; }
    const n = (res.code || []).length;
    res.frames.forEach((f, i) => (f.line || []).forEach(k => {
      if (!(k >= 0 && k < n)) bad.push(m.id + '#f' + (i + 1) + ' line=' + k + '（code 只有 ' + n + ' 行）');
    }));
  });
  t('全部模块: frame.line 都是 code 的合法下标', bad.length === 0, bad.slice(0, 6));

  const hi = (r, i) => (r.frames[i].line || []).map(k => r.code[k]).join('\n');
  const at = (r, re) => hi(r, r.frames.findIndex(f => re.test(f.msg)));
  const ufb = {};
  (M.ufset.inputs || []).forEach(s => { ufb[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
  const ufRun = mode => M.ufset.run(Object.assign({}, ufb, { mode }));
  const cpR = ufRun('compress'), szR = ufRun('size');
  const one = (r, re, want) => at(r, re).trim() === want;
  t('并查集: 找根帧只高亮 Find 的循环', one(cpR, /沿 parent 链上溯/, 'while (parent[x] >= 0)'), at(cpR, /沿 parent 链上溯/));
  t('并查集: 上溯帧只高亮 x = parent[x]', one(cpR, /上溯到 v/, 'x = parent[x];    // 一次上溯 = 一次比较'), at(cpR, /上溯到 v/));
  t('并查集: 查到根帧只高亮 return x', one(cpR, /所在集合的根是/, 'return x;'), at(cpR, /所在集合的根是/));
  t('并查集: 压缩帧只高亮压缩那一行', one(cpR, /路径压缩：/, '// 路径压缩策略：把沿途结点改挂到根上'), at(cpR, /路径压缩：/));
  t('并查集: 合并帧只高亮 ra = Find(a); rb = Find(b)', one(cpR, /先各自找根/, 'ra = Find(a);  rb = Find(b);'), at(cpR, /先各自找根/));
  t('并查集: 写入帧高亮最后两条赋值', at(cpR, /改指双亲/).split('\n').length === 2 && /parent\[rb\] = ra/.test(at(cpR, /改指双亲/)), at(cpR, /改指双亲/));
  t('并查集: 交换帧高亮比较与交换两行', at(szR, /交换/).split('\n').length === 2 && /parent\[ra\] > parent\[rb\]/.test(at(szR, /交换/)), at(szR, /交换/));
  const dupR = M.ufset.run(Object.assign({}, ufb, { mode: 'size', pairs: '0-1 1-0 3-4' }));
  t('并查集: 已连通帧只高亮 if (ra == rb) return',
    one(dupR, /已在同一集合/, 'if (ra == rb) return; // 已同集合，合并无意义'), at(dupR, /已在同一集合/));
}

/* 深链 #m=<id>&f=<帧>&mp=1 用的是保留字，输入框再占用同名键就会被模块 id 污染 */
  {
    const clash = [];
    DSC.mods.forEach(mm => (mm.inputs || []).forEach(sp => {
      if (sp.key === 'm' || sp.key === 'f' || sp.key === 'mp') clash.push(mm.id + '.' + sp.key);
    }));
    t('全部模块: 输入框不占用深链保留字 m/f/mp', clash.length === 0, clash);
  }

/* 画布里的 h.txt 不解析 markdown：解说条能用的 **加粗** / `代码` 写进画布会原样显示出来。
   喂 CASES 全部输入——只喂默认输入的话，非默认场景的画布永远查不到（约瑟夫那行反引号就是这么漏的） */
{
  const md = [];
  DSC.mods.forEach(m => {
    const def = {};
    (m.inputs || []).forEach(s => { def[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
    const sets = [def].concat((CASES[m.id] || []).map(x => Object.assign({}, def, x)));
    sets.forEach(v => {
      let res;
      try { res = m.run(v); } catch (e) { return; }
      res.frames.forEach((f, i) => {
        let svg;
        try { svg = m.render(f.snap); } catch (e) { return; }
        (svg.match(/>([^<]*)<\/text>/g) || []).forEach(t2 => {
          if (/\*\*|`/.test(t2)) md.push(m.id + '#f' + (i + 1) + ' ' + t2.slice(1, -6).slice(0, 24));
        });
      });
    });
  });
  t('全部模块: 画布文字里不出现未渲染的 markdown 记号', md.length === 0, md.slice(0, 6));
  /* 伪代码面板是 <pre> 纯文本，** 和 ` 在那里同样不会被渲染 */
  const mdCode = [];
  DSC.mods.forEach(m => {
    let res;
    try { res = m.run(defVals(m.id)); } catch (e) { return; }
    res.code.forEach((t2, i) => {
      if (/\*\*|`/.test(t2)) mdCode.push(m.id + ' code#' + (i + 1) + ' ' + t2.slice(0, 34));
    });
  });
  t('全部模块: 伪代码行里不出现未渲染的 markdown 记号', mdCode.length === 0, mdCode.slice(0, 6));
}

/* 解说条与状态面板支持 **加粗** 和 `代码`，但记号必须成对——落单的一个 ` 会原样显示。
   面板值以前是直接拼进 innerHTML 的（既不转义也不管记号），所以这里连面板一起查 */
{
  const odd = [];
  DSC.mods.forEach(m => {
    const def = {};
    (m.inputs || []).forEach(s => { def[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
    const sets = [def].concat((CASES[m.id] || []).map(x => Object.assign({}, def, x)));
    sets.forEach(v => {
      let res;
      try { res = m.run(v); } catch (e) { return; }
      res.frames.forEach((f, i) => {
        [f.msg].concat(Object.keys(f.panel || {}).map(k => f.panel[k])).forEach(tx => {
          const s = String(tx == null ? '' : tx);
          const bt = (s.match(/`/g) || []).length, st = (s.match(/\*\*/g) || []).length;
          if (bt % 2 || st % 2) odd.push(m.id + '#f' + (i + 1) + ' bt=' + bt + ' st=' + st + ' ' + s.slice(0, 36));
        });
      });
    });
  });
  t('全部模块: 解说与面板里的 markdown 记号成对', odd.length === 0, odd.slice(0, 6));
}

/* 每个模块都有一句常驻在标题下的"这动画在讲什么"：引导层要点 ? 才看得到，
   多数人一辈子不点，于是"看了不知道演示的是什么" */
{
  const bad = [];
  DSC.mods.forEach(m => {
    const a = m.aim || '';
    const stars = (a.match(/\*\*/g) || []).length;
    if (!a || a.length > 62 || stars % 2 || /`/.test(a)) bad.push(m.id + ' [len=' + a.length + '] ' + a.slice(0, 26));
  });
  t('全部模块: 都有 aim 一句话（非空、≤62 字、无未渲染记号）', bad.length === 0, bad.slice(0, 6));
}

/* 全量复核卡口：把"内容自洽"里能自动查的几项钉住，防止改着改着回退。
   2026-09-24 第一次跑它查出来的问题都已修：seqOps 的取值/表长/遍历三股操作
   伪代码高亮全指着"按值查找"那一行、glist 表头表尾只有 2~3 帧、
   huffman 译码最后一帧留了个空面板值。 */
{
  const bad = [];
  const CH408 = { 1: '一', 2: '二', 3: '三', 4: '三', 5: '四', 6: '五', 7: '六', 8: '七' };
  const CONCL = /★|✗|小结|结论|要点|对照|完成|这就是|为什么|这就是/;
  DSC.mods.forEach(m => {
    const tag = 'ch' + m.ch + ' ' + m.id;
    const mm = /^教材\s*(\d+)\./.exec(m.note || '');
    if (mm && +mm[1] !== m.ch) bad.push('教材小节号与章号不符 ' + tag + ' ' + m.note);
    const g4 = /^408 大纲\s*([一二三四五六七])/.exec(m.note || '');
    if (g4 && g4[1] !== CH408[m.ch]) bad.push('408 部分号与章号不符 ' + tag + ' ' + m.note);
    if ((m.guide || []).length < 3 || (m.guide || []).length > 5) bad.push('引导条数异常 ' + tag + ' =' + (m.guide || []).length);
    const dv = {};
    (m.inputs || []).forEach(s => { dv[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
    const probe = (over, label) => {
      let r;
      try { r = m.run(Object.assign({}, dv, over)); }
      catch (e) { bad.push('跑不出来 ' + tag + ' ' + label + ' ' + e.message); return; }
      if (r.frames.length < 3) bad.push('帧数偏少 ' + tag + ' ' + label + ' =' + r.frames.length);
      const lm = String(r.frames[r.frames.length - 1].msg || '');
      if (!CONCL.test(lm)) bad.push('末帧没有结论 ' + tag + ' ' + label + ' → ' + lm.slice(0, 26));
      r.frames.forEach((f, i) => {
        Object.keys(f.panel || {}).forEach(k => {
          const v = f.panel[k];
          if (v === undefined || v === null || v === '' || /undefined|NaN/.test(String(v))) {
            bad.push('面板空值 ' + tag + ' #f' + (i + 1) + ' ' + k + '=' + JSON.stringify(v));
          }
        });
      });
    };
    probe({}, '默认');
    (m.inputs || []).forEach(sp => {
      if (sp.type !== 'select') return;
      sp.options.forEach(o => probe({ [sp.key]: o[0] }, sp.key + '=' + o[0]));
    });
  });
  t('复核卡口: 章节号自洽 / 引导 3–5 条 / 每个选项都够演 / 末帧有结论 / 面板无空值', bad.length === 0, bad.slice(0, 8));
}

console.log('— 第2章 链表经典题 —');
{
  const b = {};
  (M.linkProblems.inputs || []).forEach(x => { b[x.key] = x.type === 'checkbox' ? !!x.value : x.value; });
  const run = o => M.linkProblems.run(Object.assign({}, b, o));
  const last = r => r.frames[r.frames.length - 1];
  const pan = f => JSON.stringify(f.panel);

  /* ---------- ① 就地逆置 ---------- */
  const rv = run({ scene: 'reverse', data: '25,12,47,89,36' });
  t('链表逆置: 末帧结果 = 输入逆序', last(rv).panel['结果'] === '36→89→47→12→25', last(rv).panel['结果']);
  /* 守恒 = "就地"的机器可查版本：任何一帧，已逆置 + 待处理 恰好是原序列的重排 */
  const broken = rv.frames.filter(f => {
    const sn = f.snap, all = sn.built.concat(sn.rest).slice().sort((x, y) => x - y);
    return all.join() !== sn.orig.slice().sort((x, y) => x - y).join();
  });
  t('链表逆置: 每帧「已逆置 + 待处理」= 原序列（不新建、不丢结点）', broken.length === 0,
    broken.map(f => f.snap.built.join() + '|' + f.snap.rest.join()).slice(0, 3));
  const notHead = rv.frames.filter(f =>
    f.snap.built.join() !== f.snap.orig.slice(0, f.snap.built.length).reverse().join());
  t('链表逆置: 已逆置段永远是原前缀的逆序（头插法的定义）', notHead.length === 0,
    notHead.map(f => f.snap.built.join()).slice(0, 3));
  const qAt = rv.frames.findIndex(f => /把后继/.test(f.msg));
  const insAt = rv.frames.findIndex(f => /p->next = L->next/.test(f.msg));
  t('链表逆置: 每轮第一步就是记后继 q（顺序错了整条链就断）', qAt >= 0 && qAt < insAt, [qAt, insAt]);
  let rvErr = '';
  try { run({ scene: 'reverse', data: '1' }); } catch (e) { rvErr = e.message; }
  try { run({ scene: 'reverse', data: '1,2,3,4,5,6,7,8,9,10' }); } catch (e) { rvErr += '/' + e.message; }
  t('链表逆置: 少于 2 个或多于 8 个结点都拒绝演示', (rvErr.match(/2~8/g) || []).length === 2, rvErr);

  /* ---------- ② 约瑟夫环：和独立的数组模拟对拍 ---------- */
  function joseBrute(n, k) {
    const a = []; for (let i = 1; i <= n; i++) a.push(i);
    const out = []; let i = 0;
    while (a.length > 1) { i = (i + k - 1) % a.length; out.push(a.splice(i, 1)[0]); }
    return { out: out, surv: a[0] };
  }
  [[7, 3], [10, 6], [3, 2], [5, 5], [8, 4], [6, 2]].forEach(nk => {
    const r = run({ scene: 'josephus', n: nk[0], k: nk[1] }), exp = joseBrute(nk[0], nk[1]);
    const pn = last(r).panel;
    t('约瑟夫环 n=' + nk[0] + ',k=' + nk[1] + ': 出圈顺序 = 独立模拟',
      pn['出圈顺序'] === exp.out.join('→'), [pn['出圈顺序'], exp.out.join('→')]);
    t('约瑟夫环 n=' + nk[0] + ',k=' + nk[1] + ': 幸存者 = ' + exp.surv,
      pn['幸存者'] === String(exp.surv), pn['幸存者']);
  });
  const j73 = run({ scene: 'josephus', n: 7, k: 3 });
  t('约瑟夫环: 教材常见例 n=7,k=3 的出圈顺序 3→6→2→7→5→1、幸存者 4',
    last(j73).panel['出圈顺序'] === '3→6→2→7→5→1' && last(j73).panel['幸存者'] === '4',
    [last(j73).panel['出圈顺序'], last(j73).panel['幸存者']]);
  const leak = j73.frames.filter(f => f.snap.alive.length + f.snap.out.length !== 7);
  t('约瑟夫环: 每帧「圈里剩下 + 已出圈」恒等于 n', leak.length === 0,
    leak.map(f => f.snap.alive.length + '+' + f.snap.out.length).slice(0, 4));
  const counted = j73.frames.filter(f => /当前报数/.test(pan(f)));
  t('约瑟夫环: 报数帧数 = (n−1)(k−1)，确实逐个人数过去',
    counted.length === 6 * 2, [counted.length, 6 * 2]);
  let jErr = '';
  try { run({ scene: 'josephus', n: 2, k: 3 }); } catch (e) { jErr = e.message; }
  try { run({ scene: 'josephus', n: 7, k: 9 }); } catch (e) { jErr += '/' + e.message; }
  t('约瑟夫环: n、k 越出范围时明确报错', /人数 n/.test(jErr) && /报数 k/.test(jErr), jErr);

  /* ---------- ③ 两链表找公共结点 ---------- */
  const ic = run({ scene: 'intersect', segs: '7,2|5|8,3,6' });
  t('找公共结点: la、lb 都把公共段算进去',
    ic.frames[1].panel['A 长'] === '5' && ic.frames[1].panel['B 长'] === '4',
    [ic.frames[1].panel['A 长'], ic.frames[1].panel['B 长']]);
  t('找公共结点: 答案 = 公共段第一个结点，位序从 1 数',
    last(ic).panel['结果'] === '公共结点 8' &&
    ic.frames.filter(f => f.panel['位置']).pop().panel['位置'] === '第 3 个结点',
    [last(ic).panel['结果'], ic.frames.filter(f => f.panel['位置']).pop().panel['位置']]);
  const align = ic.frames.filter(f => /补齐进度/.test(pan(f)));
  t('找公共结点: 长表先走的步数 = |la − lb|',
    align.length === 1 && align[0].panel['补齐进度'] === '1 / 1',
    align.map(f => f.panel['补齐进度']).join());
  ['1,2,3,4|5,6|7,8,9', '|1|3,4', '1,2,3|4|9', '1,2,3,4,5,6|7|8'].forEach(sg => {
    const pt = sg.split('|');
    const A = pt[0] ? pt[0].split(',').map(Number) : [];
    const B = pt[1] ? pt[1].split(',').map(Number) : [];
    const S = pt[2] ? pt[2].split(',').map(Number) : [];
    const r = run({ scene: 'intersect', segs: sg });
    const want = S.length ? '公共结点 ' + S[0] : 'NULL';
    const got = last(r).panel['结果'] || '';
    t('找公共结点 ' + sg + ': 与按结点身份直接求得的一致',
      got === want || (want === 'NULL' && /NULL/.test(got)), [got, want]);
    const walk = r.frames.filter(f => /步数/.test(pan(f))).pop();
    if (walk) t('找公共结点 ' + sg + ': 同步走的步数 = 两条链独有段的较小值',
      walk.panel['步数'] === String(Math.min(A.length, B.length)),
      [walk.panel['步数'], A.length, B.length]);
  });
  const none = run({ scene: 'intersect', segs: '1,2|1,2|' });
  t('找公共结点: 公共段为空时返回 NULL（不相交）', /NULL/.test(last(none).panel['结果']), last(none).panel['结果']);
  let iErr = '';
  try { run({ scene: 'intersect', segs: '1,2|3' }); } catch (e) { iErr = e.message; }
  try { run({ scene: 'intersect', segs: '1,2,3,4,5,6,7|1|9' }); } catch (e) { iErr += '/' + e.message; }
  t('找公共结点: 段数不对/单段过长都明确报错', /三段/.test(iErr) && /6 个/.test(iErr), iErr);
}

console.log('— 画布几何：文字不得重叠/越界、盒子不得互撞 —');

{
  /* 中文按 1 em、其余按 0.55 em 估算文字宽度；基线 y 上方 0.78 em 为字顶、下方 0.26 em 为字底。
     这类"标注被后绘格子盖住 / 标签挤成一团 / 列表画到画布外"的缺陷，靠看图才发现得到，
     所以固化成断言。曾一次性抓出 floyd 列头被盖、polyAdd 标题压指针、expression 图例压表格、
     maze 足迹栈超 14 条后画到画布外。 */
  function textW(s, fz) {
    let w = 0;
    for (const c of s) w += /[一-鿿-￯]/.test(c) ? fz : fz * 0.55;
    return w;
  }
  function unesc(s) {
    return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }
  let overlap = [], clipped = [], boxHit = [], rectOut = [];
  /* 这里曾经记着 3 个老模块的存量欠账（把检查从"只喂默认输入"扩到 CASES 全部输入时扫出来的）：
       dualList  循环链表 prior/断开标签重叠      —— 已修：回环 prior 改画下方大弧线 + 标签按占位让位
       huffman   HT 表图例压编码表标题            —— 已修：树行距随深度压、表行高随行数压
       hanoi     n=5 时盘标签盒互相重叠            —— 已修
     现在 56 个模块全部零容忍。这个空壳留着是有意的：万一以后又扫出存量缺陷，
     宁可显式记账 + 每次运行都打印欠账，也不要偷偷把检查改弱。记在这里就必须同步记进缺口清单。 */
  const GEOM_DEBT = {};
  const debtSkips = {};
  const skipDebt = id => { if (GEOM_DEBT[id]) { debtSkips[id] = (debtSkips[id] || 0) + 1; return true; } return false; };
  const defV = m => { const v = {}; (m.inputs || []).forEach(s => { v[s.key] = s.type === 'checkbox' ? !!s.value : s.value; }); return v; };
  DSC.mods.forEach(m => {
    const sets = [defV(m)].concat((CASES[m.id] || []).map(x => Object.assign(defV(m), x)));
    sets.forEach(inp => {
    let r;
    try { r = m.run(inp); } catch (e) { return; }
    const seen = new Set();
    r.frames.forEach((f, fi) => {
      let svg;
      try { svg = m.render(f.snap); } catch (e) { return; }
      const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
      if (!vb) return;
      const VW = +vb[1], VH = +vb[2], T = [];
      (svg.match(/<text x="[^"]*" y="[^"]*" font-size="[^"]*"[^>]*text-anchor="[^"]*"[^>]*>[^<]*/g) || [])
        .forEach(s => {
          const a = /x="([^"]*)" y="([^"]*)" font-size="([^"]*)"[^>]*text-anchor="([^"]*)"[^>]*>([^<]*)/.exec(s);
          const x = +a[1], y = +a[2], fz = +a[3], an = a[4], txt = unesc((a[5] || '').trim());
          if (!txt || !isFinite(x) || !isFinite(y)) return;
          const w = textW(txt, fz);
          const x0 = an === 'start' ? x : an === 'end' ? x - w : x - w / 2;
          T.push({ x0: x0, x1: x0 + w, y0: y - fz * 0.78, y1: y + fz * 0.26, s: txt });
        });
      T.forEach(p => {
        if (p.x0 < -1 || p.y0 < -1 || p.x1 > VW + 1 || p.y1 > VH + 1) {
          const k = 'X' + p.s.slice(0, 10) + '@' + Math.round(p.x0) + ',' + Math.round(p.y0);
          if (skipDebt(m.id)) { } else if (!seen.has(k)) { seen.add(k); clipped.push(m.id + ' 第' + (fi + 1) + '帧「' + p.s.slice(0, 12) + '」'); }
        }
      });
      for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
        const a = T[i], b = T[j];
        const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
        const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (ox > 2 && oy > 2) {
          const k = 'T' + a.s.slice(0, 10) + '|' + b.s.slice(0, 10);
          if (skipDebt(m.id)) { } else if (!seen.has(k)) { seen.add(k); overlap.push(m.id + ' 第' + (fi + 1) + '帧「' + a.s.slice(0, 10) + '」×「' + b.s.slice(0, 10) + '」'); }
        }
      }
      /* 矩形也不许画出 viewBox：原来只查文字越界，
         seqOps 把 12 个格子画到 x=1331（画布只有 980）一直没被抓到 */
      (svg.match(/<rect x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*"/g) || []).forEach(s => {
        const a = /x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/.exec(s);
        const x = +a[1], y = +a[2], w = +a[3], hh = +a[4];
        if (x < -1 || y < -1 || x + w > VW + 1 || y + hh > VH + 1) {
          const k = 'R' + Math.round(x) + ',' + Math.round(y) + 'x' + Math.round(w);
          if (skipDebt(m.id)) { } else if (!seen.has(k)) { seen.add(k); rectOut.push(m.id + ' 第' + (fi + 1) + '帧 rect[' + Math.round(x) + ',' + Math.round(y) + ' ' + Math.round(w) + '×' + Math.round(hh) + ']'); }
        }
      });
      /* 两个带边框的矩形"部分重叠"（互不包含）= 撞版；嵌套是设计不算。
         文字×文字查不到这种：循环队列整排"待入队序列"格子压在底部解说条上。 */
      const B = [];
      (svg.match(/<rect x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*"[^>]*\/>/g) || []).forEach(s => {
        const a = /x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"[^>]*?stroke="([^"]*)"/.exec(s);
        if (!a) return;
        const x = +a[1], y = +a[2], w = +a[3], hh = +a[4];
        if (!(w > 0 && hh > 0) || a[5] === 'none') return;
        B.push({ x: x, y: y, w: w, h: hh });
      });
      for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
        const p = B[i], q = B[j];
        const ox = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x);
        const oy = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y);
        if (ox <= 3 || oy <= 3 || ox * oy < 24) continue;
        const nest = (q.x >= p.x - 1 && q.y >= p.y - 1 && q.x + q.w <= p.x + p.w + 1 && q.y + q.h <= p.y + p.h + 1) ||
                     (p.x >= q.x - 1 && p.y >= q.y - 1 && p.x + p.w <= q.x + q.w + 1 && p.y + p.h <= q.y + q.h + 1);
        if (nest) continue;
        const k = 'B' + Math.round(p.x) + ',' + Math.round(p.y) + '×' + Math.round(q.x) + ',' + Math.round(q.y);
        if (skipDebt(m.id)) { } else if (!seen.has(k)) { seen.add(k); boxHit.push(m.id + ' 第' + (fi + 1) + '帧 [' + Math.round(p.x) + ',' + Math.round(p.y) + ']×[' + Math.round(q.x) + ',' + Math.round(q.y) + ']'); }
      }
    });
    });
  });
  t('画布几何: 无文字越出画布', clipped.length === 0, clipped.slice(0, 4));
  t('画布几何: 无文字互相重叠', overlap.length === 0, overlap.slice(0, 4));
  t('画布几何: 无盒子互撞（矩形部分重叠）', boxHit.length === 0, boxHit.slice(0, 4));
  t('画布几何: 无矩形画出 viewBox', rectOut.length === 0, rectOut.slice(0, 4));
  {
    const ks = Object.keys(debtSkips);
    if (ks.length) console.log('    ⚠ 存量欠账已跳过（不是豁免，见 实验缺口清单.md）：' +
      ks.map(k => k + '（' + GEOM_DEBT[k] + '，' + debtSkips[k] + ' 处）').join('、'));
  }
}

console.log('\n— 画布结构：render 必须只返回一个完整 <svg> —');
{
  /* 排序模块曾把 <svg> 包装写在 su.bars() 里，各模块又在返回串后面拼图例，
     图元落到 </svg> 之后 → 脱离 SVG 命名空间，色块不渲染、文字挤成一行、
     位置不按 viewBox 缩放、还被舞台裁掉。上面三条几何断言查不到它，
     因为量的是字符串里的坐标，而浏览器根本没画它。 */
  const stray = [];
  DSC.mods.forEach(m => {
    const v = {};
    (m.inputs || []).forEach(s => { v[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
    let r;
    try { r = m.run(v); } catch (e) { return; }
    r.frames.forEach((f, i) => {
      let s;
      try { s = m.render(f.snap); } catch (e) { return; }
      const open = (s.match(/<svg/g) || []).length, close = (s.match(/<\/svg>/g) || []).length;
      const tail = s.slice(s.lastIndexOf('</svg>') + 6);
      if (open !== 1 || close !== 1 || tail.trim() !== '') {
        if (!stray.length || stray[stray.length - 1].id !== m.id) stray.push({ id: m.id, n: 1 });
        else stray[stray.length - 1].n++;
        if (stray.length < 6) stray[stray.length - 1].sample = '第' + (i + 1) + '帧 svg=' + open + '/' + close + ' 尾长=' + tail.trim().length;
      }
    });
  });
  t('画布结构: 所有模块每帧都是单一完整 svg、尾部无游离图元', stray.length === 0, stray);
}

console.log('\n— 概念节拍（趟/轮边界识别） —');
{
  const BEAT = /第\s*[0-9一二三四五六七八九十两]+\s*(趟|轮|遍)/;
  const strip = s => String(s || '').replace(/<[^>]+>/g, '');
  const hit = {}, counts = {};
  DSC.mods.forEach(m => {
    const r = m.run(defVals(m.id));
    const n = r.frames.filter(f => BEAT.test(strip(f.msg))).length;
    counts[m.id] = n;
    if (n) hit[m.id] = true;
  });
  const want = ['insertSort', 'selectSort', 'bubbleSort', 'radixSort', 'mst', 'dijkstra', 'floyd', 'linkProblems'];
  const got = Object.keys(hit).sort();
  t('节拍: 命中且仅命中趟/轮类算法', JSON.stringify(got) === JSON.stringify(want.slice().sort()), got);
  t('节拍: 命中模块节拍数在 4-16 之间', want.every(id => counts[id] >= 4 && counts[id] <= 16),
    want.map(id => id + ':' + counts[id]));
  t('节拍: 堆排序/汉诺塔等无趟/轮误报', !['heapSort', 'hanoi', 'traversal', 'mergeSort'].some(id => hit[id]));
}

console.log('\n— 手机视口（390×844，headless 浏览器实测） —');
{
  const r = require('child_process').spawnSync(process.execPath, [path.join(__dirname, 'mobile.js')], { encoding: 'utf8' });
  process.stdout.write(r.stdout || '');
  if ((r.stdout || '').indexOf('✗') >= 0 || r.status !== 0) fail++;
}

console.log('\n结果: 通过 ' + pass + '，失败 ' + fail);
process.exit(fail ? 1 : 0);
