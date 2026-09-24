# -*- coding: utf-8 -*-
"""A1: 给每个 DSC.reg 模块在 note 行后插入 keywords 行。
只插入、不改其它内容；id 对不上或已有 keywords 会报出来。"""
import pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src'

KW = {
    # ---------- 第1章 ----------
    'complexity': '大O 渐近 增长速度 数量级 O(1) O(logn) O(nlogn) O(n2) O(2n) 指数 复杂度分级 阶 比较快慢',
    'spaceComplexity': 'S(n) 辅助空间 原地算法 in-place 递归栈空间 工作单元 空间代价 堆栈 归并O(n) 堆排序O(1) 尾递归',
    'timeCount': '语句频度 T(n) 基本操作 循环计数 执行次数 对数 log2 等比 每轮翻倍 折半 忽略常数 数量级 四步法 并列相加 嵌套相乘',
    # ---------- 第2章 ----------
    'seqList': '顺序表 插入 删除 移动元素 平均移动 n/2 表长 ListInsert ListDelete 数组实现 随机存取 存储容量',
    'seqOps': '查找 LocateElem 取值 GetElem 表长 Length 最大元素 时间性能 位序 下标 越界 随机存取 O(1)',
    'linkList': '单链表 头插法 尾插法 建表 先连后断 断链 指针 next 带头结点 头结点 查找第i个 空间预先分配',
    'linkOps': '链表遍历 按位查找 FindElem 删除结点 插入结点 free 释放 空表 前驱 后继 无随机存取',
    'dualList': '双向链表 prior 对称改链 四个指针 循环链表 单循环 双向循环 rear 判空 判尾 next==head 从表尾回溯',
    'mergeList': '有序表合并 LA LB LC 归并 双指针 非递减 表头复用 结果复用 顺序表合并 O(m+n)',
    'polyAdd': '一元多项式 指数 系数 有序链表合并 同类项 相加 系数为零删除 稀疏多项式 链表应用',
    'linkProblems': '链表逆置 就地逆置 约瑟夫环 Josephus 循环链表 公共结点 相交 长度差对齐 快慢指针 双指针 自由循环',
    # ---------- 第3章 ----------
    'seqStack': '栈 后进先出 LIFO 栈顶 top 进栈 push 出栈 pop 栈空 栈满 上溢 下溢 顺序存储 数组模拟 栈底',
    'linkStackQueue': '链栈 栈顶即头结点 无需判满 链队列 front rear 删除 假溢出 队头 队尾 最后一个结点特判',
    'hanoi': '汉诺塔 递归 递归工作栈 调用栈 栈帧 盘 2的n次方减1 分治 移动步骤',
    'circQueue': '循环队列 假溢出 取模 队满 队空 牺牲一个单元 front==rear 损失一格 判满条件 rear+1 换位置',
    'bracket': '括号匹配 配对 左右括号 入栈 出栈 字符串 平衡 栈的应用 匹配失败 剩余',
    'expression': '表达式求值 操作数栈 运算符栈 优先级 中缀 括号 退栈计算 案例3.3 OPTR OPND',
    'toPostfix': '后缀式 逆波兰 RPN 中缀转后缀 算符优先 出栈 逐符号扫描 波兰式 前缀 手工转换',
    'baseConvert': '进制转换 十进制转二进制 除基取余 逆序输出 八进制 十六进制 基数 余数进栈',
    'maze': '迷宫求解 回溯 DFS 足迹栈 死路 方向 探路 通路 栈应用  retreat',
    # ---------- 第4章 ----------
    'kmp': '串 模式匹配 BF 暴力 回溯 指针i不回退 next数组 部分匹配值 前缀 后缀 最长公共前后缀 nextval 优化 定位',
    'matrix': '压缩存储 对称矩阵 下三角 上三角 三元组 稀疏矩阵 转置 快速转置 特殊矩阵 地址计算 一维数组映射',
    'glist': '广义表 表头 表尾 GetHead GetTail 长度 深度 递归 结点 tag sub tp 空表 原子 子表 链式存储',
    # ---------- 第5章 ----------
    'treeStore': '树的存储 双亲表示法 parent 孩子表示法 孩子兄弟表示法 CS 链表 找父结点 找孩子 度 存储结构对照',
    'treeSeqStore': '二叉树顺序存储 完全二叉树 2i 2i+1 数组存储 结点数性质 n0=n2+1 高度 满二叉树 深度 编号',
    'traversal': '先序 中序 后序 层次遍历 递归 访问时机 序列 由先序中序还原 建树 二叉树遍历 队列 经过',
    'threads': '线索二叉树 中序线索 前驱 后继 ltag rtag 空链域 找前驱 找后继 遍历效率 线索化',
    'treeConvert': '树转二叉树 森林 左孩子右兄弟 逆转换 度 兄弟 树与二叉树对应 变形',
    'huffman': '哈夫曼树 最优二叉树 WPL 带权路径长度 前缀编码 赫夫曼 构造 合并 权值 编码 译码 贪心 叶子结点',
    'heapPQ': '堆 小顶堆 大顶堆 建堆 筛选 siftup shiftdown 优先队列 出队 入队 Top-K 第K大 近似完全二叉树 数组表示',
    'ufset': '并查集 双亲数组 查找 Find 合并 Union 按秩合并 按大小 路径压缩 连通分量 亲戚 根结点',
    # ---------- 第6章 ----------
    'graphBasic': '图 顶点 边 弧 有向图 无向图 完全图 度 入度 出度 握手定理 边数 子图 连通 连通分量 强连通 稠密 稀疏 网 权',
    'graphStore': '邻接多重表 multilist 十字链表 orthogonal list 边结点 弧结点 头尾顶点 hlink tlink firstout firstin 共享 一条边只存一次',
    'dfsBfs': 'DFS 深度优先 BFS 广度优先 邻接矩阵 邻接表 遍历序列 队列 递归 访问标记 连通分量 生成树 层序 时间复杂度',
    'mst': '最小生成树 Prim 普里姆 Kruskal 克鲁斯卡尔 贪心 选边 权值和 并查集判环 无向连通图 顶点集U 代价最小',
    'dijkstra': '最短路径 单源 迪杰斯特拉 贪心 dist path S集合 松弛 权值 不能处理负权 按长度递增',
    'floyd': '每对顶点 多源 弗洛伊德 中转点 三重循环 动态规划 负权 路径还原 dist path 矩阵',
    'topo': '拓扑排序 AOV网 入度为0 栈 输出序列 回路 环 检测 有向无环图 DAG 先修课程',
    'critical': '关键路径 AOE网 关键活动 最早发生时间 ve 最迟发生时间 vl 时间余量 松弛量 最长路径 工期 提前完工',
    # ---------- 第7章 ----------
    'seqBinSearch': '顺序查找 哨兵 平均查找长度 ASL 查找成功 查找失败 折半查找 二分 判定树 比较次数 log2n 有序 中间位置',
    'blockSearch': '分块查找 索引顺序查找 索引表 块 平均查找长度 折中 ASL 块内有序 块间有序',
    'bst': '二叉排序树 二叉搜索树 BST 中序有序 插入 删除 三种情况 直接前驱 构造 查找失败 不平衡 退化成链表',
    'avl': '平衡二叉树 AVL 平衡因子 LL RR LR RL 旋转 右旋 左旋 最小不平衡子树 高度 调整 保持平衡',
    'btree': 'B树 多路查找树 m阶 分裂 上移 关键字 根到叶子路径长度相等 B+树 叶子链表 数据库 索引 m/2 度 插入 删除',
    'hashLinear': '散列 哈希 hash 除留余数 模 冲突 线性探测 再散列 开放定址 堆积 一次聚集 装填因子 ASL 处理冲突',
    'hashChain': '链地址法 拉链法 桶 bucket 同义词 冲突 无堆积 装填因子 链表 平均查找长度 散列函数 头插',
    'rbt': '红黑树 五条性质 自平衡 变色 旋转 黑高 最长路径 根到叶子 2-3树 结点数 高度',
    # ---------- 第8章 ----------
    'insertSort': '直接插入排序 有序区 无序区 后移 稳定 哨兵 最好O(n) 折半插入 比较次数',
    'shellSort': '希尔排序 增量 gap 分组 缩小增量 分组插入 不稳定 Shell 距离',
    'bubbleSort': '冒泡排序 相邻交换 大数沉底 提前结束 标志 swapped 稳定 上浮 一趟',
    'quickSort': '快速排序 划分 partition 基准 pivot 分治 递归 最坏O(n2) 有序 栈深度 不稳定 一趟划分 归位',
    'selectSort': '简单选择排序 选最小 交换 不稳定 比较次数 n(n-1)/2 与初始无关 打擂台',
    'heapSort': '堆排序 建堆 筛选 大顶堆 输出序列 重建 O(nlogn) 不稳定 siftDown 交换堆顶 数组下标',
    'mergeSort': '归并排序 二路归并 分治 辅助空间O(n) 稳定 逆序对 归并段 一趟归并',
    'radixSort': '基数排序 LSD MSD 最低位优先 分配 收集 桶 稳定 位 基数 多关键字 链式队列',
    'countBucket': '计数排序 桶排序 线性时间 非比较排序 O(n+k) 辅助空间 分布均匀 取值范围小 稳定',
    'extSort': '外部排序 归并段 多路归并 k趟 磁盘读写 I/O 置换-选择 败者树 初始归并段 内排序 缓冲区',
    'sortGallery': '八大排序 对比 稳定性 时间复杂度 空间复杂度 适用场景 一览表 选哪个 总结 逆序 有序',
}

changed, missing, already = [], [], []
for p in sorted(src.rglob('*.js')):
    rel = p.relative_to(src)
    if rel.parts[0] not in ['ch%d' % i for i in range(1, 9)]:
        continue
    text = p.read_text(encoding='utf-8')
    mid = re.search(r"DSC\.reg\(\{[\s\S]{0,400}?id: '([^']+)'", text)
    if not mid:
        continue
    mid = mid.group(1)
    if 'keywords:' in text:
        already.append(mid)
        continue
    if mid not in KW:
        missing.append(mid)
        continue
    lines = text.split('\n')
    hit = None
    for i, ln in enumerate(lines):
        if re.match(r"^\s*note: '.*',\s*$", ln):
            hit = i
            break
    if hit is None:
        missing.append(mid + ' (no note line)')
        continue
    indent = re.match(r'^\s*', lines[hit]).group(0)
    lines.insert(hit + 1, "{}keywords: '{}',".format(indent, KW[mid]))
    p.write_text('\n'.join(lines), encoding='utf-8')
    changed.append(mid)

print('changed : {}  already: {}  missing: {}'.format(len(changed), len(already), len(missing)))
if missing:
    print('MISSING ids (no keywords authored):')
    for x in missing:
        print('  ' + x)
unused = [k for k in KW if k not in changed and k not in already]
if unused:
    print('UNUSED keys in table (no such module):')
    for x in unused:
        print('  ' + x)
