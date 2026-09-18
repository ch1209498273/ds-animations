/* 算法正确性测试：在 Node 中加载各模块逻辑层，用教材/PPT 例题断言输出。运行：node tests/test.js */
'use strict';
const fs = require('fs'), path = require('path');
global.window = global;
const SRC = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
eval(SRC('core/engine.js'));
['ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'].forEach(ch => {
  fs.readdirSync(path.join(__dirname, '..', 'src', ch)).sort().forEach(f => eval(SRC(ch + '/' + f)));
});

const DSC = global.DSC;
const M = {}; DSC.mods.forEach(m => M[m.id] = m);
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
  const rp = M.seqStack.run({ scene: 'push' });
  t('进栈场景: 含上溢', rp.frames.some(f => f.snap.err === '上溢'));
  t('进栈场景: 无出栈、最终满栈 A-F', last(rp).top === 6 && JSON.stringify(last(rp).cells) === JSON.stringify(['A', 'B', 'C', 'D', 'E', 'F']), last(rp).cells);
  t('进栈场景: 进栈序列 A B C D E F', lastFrame(rp).panel['进栈序列'] === 'A B C D E F', lastFrame(rp).panel['进栈序列']);
  const ro = M.seqStack.run({ scene: 'pop' });
  t('出栈场景: 含下溢、无上溢', ro.frames.some(f => f.snap.err === '下溢') && !ro.frames.some(f => f.snap.err === '上溢'));
  t('出栈场景: 出栈序列 F E D C B A', lastFrame(ro).panel['出栈序列'] === 'F E D C B A', lastFrame(ro).panel['出栈序列']);
  t('出栈场景: 最终栈空 (top=0)', last(ro).top === 0, last(ro).top);
  const rl = M.seqStack.run({ scene: 'life' });
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
  t('括号不完整: 报表达式不完整', !!r6.frames.find(f => (f.msg || '').indexOf('不完整') >= 0 || (f.snap.err || '') === '表达式不完整（缺少括号或运算符）'));
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

console.log('— 渲染烟测（每帧 render 不抛异常） —');
{
  let ok = true, bad = '';
  const cases = {
    seqList: [{ op: 'insert', i: 3, e: 33, data: '25,12,47,89,36,14' }, { op: 'del', i: 2, e: 0, data: '25,12,47,89,36,14' }, { op: 'insert', i: 0, e: 1, data: '1,2' }, { op: 'insert', i: 3, e: 33, errDir: true, data: '25,12,47,89,36,14' }],
    linkList: [{ op: 'insert', i: 3, e: 33, bad: false, data: '25,12,47,89,36,14' }, { op: 'insert', i: 3, e: 33, bad: true, data: '25,12,47,89,36,14' }, { op: 'del', i: 4, e: 0, bad: false, data: '25,12,47,89,36,14' }],
    seqStack: [{ scene: 'push' }, { scene: 'pop' }, { scene: 'life' }],
    circQueue: [{ demo: 'linear' }, { demo: 'fewer' }, { demo: 'tag' }, { demo: 'size' }],
    hanoi: [{ n: 3 }, { n: 5 }],
    traversal: [['pre', 'GDA##FE###MH##Z##'], ['in', 'GDA##FE###MH##Z##'], ['post', 'GDA##FE###MH##Z##'], ['level', 'GDA##FE###MH##Z##']].map(x => ({ mode: x[0], data: x[1] })),
    huffman: [{ preset: 'a', w: '' }, { preset: 'b', w: '' }, { preset: 'a', w: '', phase: 'decode' }, { preset: 'a', w: '', phase: 'code' }, { preset: 'a', w: '', phase: 'build' }],
    dfsBfs: [{ method: 'dfs', start: '2' }, { method: 'bfs', start: '2' }, { method: 'dfs', start: '2', storage: 'list' }],
    mst: [{ method: 'prim' }, { method: 'kruskal' }],
    dijkstra: [{ start: '0' }, { start: '1' }],
    bracket: [{ expr: '([()])' }, { expr: ')(' }, { expr: '([)]' }, { expr: '(()' }, { expr: 'a(b)c' }],
    expression: [{ expr: '3*(7-2)' }, { expr: '2+3*4' }, { expr: '5/(3-3)' }, { expr: '12*(3+4)' }],
    threads: [{ data: 'GDA##FE###MH##Z##', phase: 'build' }, { data: 'GDA##FE###MH##Z##', phase: 'walk' }, { data: 'GDA##FE###MH##Z##', phase: 'all' }],
    critical: [{}],
    topo: [{}, { cycle: true }],
    floyd: [{}]
  };
  for (const id in cases) {
    cases[id].forEach(inp => {
      let res;
      try { res = M[id].run(inp); } catch (e) { ok = false; bad += id + ':run ' + e.message + '; '; return; }
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

console.log('\n结果: 通过 ' + pass + '，失败 ' + fail);
process.exit(fail ? 1 : 0);
