# -*- coding: utf-8 -*-
"""把各模块 note 从『本校大纲+PPT编号』改为通用教材章节表述。"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent
NOTES = {
    'ch2/01seqList.js':   '教材 2.4 线性表的顺序表示和实现（插入/删除、移动次数分析）',
    'ch2/02linkList.js':  '教材 2.5 线性表的链式表示和实现（先连后断、与顺序表对比）',
    'ch3/01seqStack.js':  '教材 3.3 栈的表示和操作的实现（栈空/栈满判定、上溢/下溢）',
    'ch3/02circQueue.js': '教材 3.5 队列的表示和操作的实现（假溢出、队空/队满三方案）',
    'ch3/03hanoi.js':     '教材 3.4 栈与递归（递归工作栈）',
    'ch3/04bracket.js':   '教材 3.6 案例分析与实现（案例3.2 括号匹配）',
    'ch3/05expression.js':'教材 3.6 案例分析与实现（案例3.3 表达式求值）',
    'ch5/01traversal.js': '教材 5.5 遍历二叉树（访问时机与递归栈）',
    'ch5/02threads.js':   '教材 5.5 遍历二叉树与线索二叉树',
    'ch5/03huffman.js':   '教材 5.7 哈夫曼树及其应用（WPL、前缀编码）',
    'ch6/01dfsBfs.js':    '教材 6.5 图的遍历（DFS/BFS、存储结构的影响）',
    'ch6/02mst.js':       '教材 6.6 图的应用（最小生成树：Prim / Kruskal）',
    'ch6/03dijkstra.js':  '教材 6.6 图的应用（单源最短路径）',
    'ch6/04floyd.js':     '教材 6.6 图的应用（所有顶点间最短路径）',
    'ch6/05topo.js':      '教材 6.6 图的应用（AOV 网、拓扑排序、回路检测）',
    'ch6/06critical.js':  '教材 6.6 图的应用（AOE 网、关键路径、关键活动）',
}
for rel, note in NOTES.items():
    p = root / rel
    t = p.read_text(encoding='utf-8')
    t2 = re.sub(r"note: *'[^']*'", "note: '" + note + "'", t, count=1)
    assert t2 != t, rel
    p.write_text(t2, encoding='utf-8')
    print('ok', rel)
print('all notes updated')
