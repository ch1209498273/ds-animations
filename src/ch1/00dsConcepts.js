/* 动画：数据结构基本概念——术语层级、四种逻辑结构、两种存储结构、ADT（408 大纲 一(一)） */
(function () {
  var DSC = window.DSC, h = DSC.h, C = DSC.C;

  var CODE = [
    '/* 一(一) 数据结构基本概念：先说清"我们在讨论哪一级单位" */',
    '',
    '数据        Data          能输入、能处理的符号总称',
    '数据对象    DataObject    性质相同的数据元素的集合',
    '数据元素    DataElement   数据的基本单位，作为一个整体处理',
    '数据项      DataItem      组成数据元素的最小单位，不可分割',
    '/* 包含关系（从外到内）：数据 ⊃ 数据对象 ⊃ 数据元素 ⊃ 数据项 */',
    '/* 同一概念在不同语境下的别名：数据元素 = 记录 = 结点 = 元素 */',
    '',
    '/* 逻辑结构：数据元素之间的抽象关系。与计算机无关，与怎么存无关 */',
    '集合结构      仅有"同属一个集合"这一种关系',
    '线性结构      一对一：除首尾外，每个元素恰有一个前驱、一个后继',
    '树形结构      一对多：一个元素可对应多个后继（根无父，其余恰一父）',
    '图状/网状结构  多对多：任意两个元素之间都可能相关',
    '/* 四类里，线性结构是"线性"的，树形与图状都算非线性结构 */',
    '',
    '/* 存储结构（= 物理结构）：逻辑结构在计算机里的落地方式，只有两样 */',
    '顺序存储  逻辑相邻 ⇒ 物理相邻：一段地址连续的内存',
    '链式存储  物理可散可断：每元素附带"指针"，靠指针串出顺序',
    '/* 顺序：Loc(a_i) = Loc(a_1) + (i−1)×c    // c = 一个元素占的字节数 */',
    '/*   地址能算出来 ⇒ 取第 i 个元素一步到位，这叫随机访问；代价是插入删除要搬家 */',
    '/* 链式：插入删除只改指针 ⇒ 便宜；但要找第 i 个只能从表头 next 走 i 次 */',
    '',
    '/* 抽象数据类型 ADT = (D, S, P)：把"数据 + 关系 + 操作"打包成一份声明 */',
    'D  数据对象：成员取自哪一类、取值范围是什么',
    'S  数据关系：D 上的关系集',
    'P  基本操作：每个操作只写"输入 / 输出 / 做什么"',
    'ADT Stack {',
    '  D：{ ai | ai ∈ 某个同类型元素的集合 }',
    '  S：{ <a(i−1), a(i)> }   // 除首尾外每个元素恰有一前一后',
    '  P：InitStack()  Push(e)  Pop()  GetTop()  StackEmpty()',
    '}   // 通篇没有出现"数组""指针""地址"——这就是"抽象"两个字的意思',
    '/* 同一个 ADT 可有两种实现：顺序栈（数组+top 下标）/ 链栈（结点+next）。换实现不用改声明 */',
    '/* 数据类型是语言内置的（int、float）；ADT 由使用者自己定义，多出来的是"把操作绑在数据上" */'
  ];

  var NM = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];

  /* ---- 场景一：术语层级。左边四级嵌套框，右边一张具体的成绩表 ---- */
  var COLS = ['学号', '姓名', '成绩'];
  var ROWS = [['20230101', '张三', '87'], ['20230102', '李四', '92'], ['20230103', '王五', '76']];
  var LVL = [
    { k: 'data', x: 26, y: 74, w: 432, ht: 408, t: '数据', en: 'Data', e: '能输入、能处理的符号总称' },
    { k: 'object', x: 58, y: 116, w: 368, ht: 336, t: '数据对象', en: 'DataObject', e: '性质相同的数据元素的集合' },
    { k: 'element', x: 90, y: 162, w: 304, ht: 254, t: '数据元素', en: 'DataElement', e: '基本单位，整体考虑、整体处理' },
    { k: 'item', x: 122, y: 214, w: 240, ht: 168, t: '数据项', en: 'DataItem', e: '最小单位，不可再分' }
  ];
  var TX = 520, TCW = [128, 96, 76], TY = 150, TRH = 44;

  /* ---- 场景二：四种逻辑结构。同一批 6 个元素，只换连边方式 ---- */
  var LPOS = {
    set: [[110, 170], [330, 120], [560, 190], [810, 130], [250, 360], [640, 380]],
    linear: [[130, 250], [275, 250], [420, 250], [565, 250], [710, 250], [855, 250]],
    tree: [[490, 120], [280, 260], [700, 260], [180, 400], [390, 400], [700, 400]],
    graph: [[490, 110], [640, 190], [640, 320], [490, 400], [340, 320], [340, 190]]
  };
  var LEDG = {
    set: [],
    linear: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    tree: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]],
    graph: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4]]
  };
  var KNAME = { set: '① 集合结构', linear: '② 线性结构', tree: '③ 树形结构', graph: '④ 图状（网状）结构' };
  /* 总结帧：四张缩略图，每种结构用 4 个点各画一遍 */
  var MINI = [
    { t: '集合结构', s: '只有"同属一个集合"', d: [[36, 40], [112, 16], [86, 78], [168, 58]], e: [] },
    { t: '线性结构', s: '一对一，3 条边', d: [[26, 48], [80, 48], [134, 48], [188, 48]], e: [[0, 1], [1, 2], [2, 3]] },
    { t: '树形结构', s: '一对多，也是 3 条边', d: [[108, 14], [52, 56], [164, 56], [164, 100]], e: [[0, 1], [0, 2], [2, 3]] },
    { t: '图状结构', s: '多对多，5 条边', d: [[108, 12], [186, 56], [108, 100], [30, 56]], e: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]] }
  ];

  /* ---- 场景三：两种存储结构。同一条内存标尺，两种放法 ---- */
  var MX = 60, MW = 118, MY = 210, MH = 56;
  var SEQADDR = [1000, 1016, 1032, 1048, 1064, 1080, 1096];
  var LX = [70, 470, 200, 760, 330, 620], LW = 110, LADDR = [1000, 1480, 1160, 1800, 1320, 1640];
  /* 新结点画在内存条下方（条里没有多余的连续空位了），下标 6 代表它 */
  var NX = 690, NY = 330;

  /* ---- 场景四：ADT 三元组 ---- */
  var ACARD = [
    { k: 'D', y: 92, ht: 74, t: 'D  数据对象', ln: ['{ ai | ai ∈ 同一类元素的集合 }', '只写"成员取自哪一类"，不写有几个'] },
    { k: 'S', y: 180, ht: 74, t: 'S  数据关系', ln: ['{ <a(i−1), a(i)> | 1 < i ≤ n }', '一句话把"线性结构"钉进定义里'] },
    { k: 'P', y: 268, ht: 158, t: 'P  基本操作', ln: ['InitStack()  把栈清空，准备使用', 'Push(e)      把 e 放到栈顶', 'Pop()        取走栈顶元素', 'GetTop()     只看栈顶，不取走', 'StackEmpty() 空则 1，非空则 0'] }
  ];
  /* 实现层两块：这里才允许出现"数组""下标"——声明层一个都不许有 */
  var IMP = [['顺序实现', '数组 + top 下标', '见第 3 章 seqStack', 520], ['链式实现', '结点 + next', '见第 3 章 linkStack', 740]];

  DSC.reg({
    id: 'dsConcepts', ch: 1,
    name: '数据结构基本概念：术语层级、四种逻辑结构、两种存储结构与 ADT',
    aim: '分类只看**关系**：逻辑结构四类、存储结构两样，最后用 **ADT=(D,S,P)** 把数据和操作打包',
    note: '408 大纲 一(一) 数据结构基本概念（数据/数据元素/数据项、四种逻辑结构、两种存储结构、抽象数据类型）',
    keywords: '基本概念 绪论 数据 数据对象 数据元素 数据项 记录 结点 元素 逻辑结构 存储结构 物理结构 四类 两种 集合 线性 树形 图状 网状 非线性 一对多 多对多 前驱 后继 顺序存储 链式存储 随机访问 地址 计算地址 指针 存储密度 抽象数据类型 ADT 三元组 数据类型 定义',
    guide: [
      '绪论里最容易被跳过、考试却最爱抠字的一屏。四个场景各管一件事：**分清单位**、**给逻辑结构分类**、**给存储结构分类**、**把前两者打包成 ADT**',
      '场景②是主角：六次演示用的是**同一批数据元素 a1…a6**，只换连边方式。看清楚"结构"分的是关系，不是数据本身',
      '场景③同一条内存标尺画两遍：顺序存储把元素排到地址连续的地方，链式存储让它们散落各处、用指针串起来。插入那一帧两边的代价差得很远',
      '场景④左半边那份 ADT 声明里找不到"数组""地址"三个字——这不是漏写，这正是"抽象"的意思；右半边说明为什么可以随便换实现'
    ],
    inputs: [
      {
        key: 'scene', label: '场景', type: 'select', options: [
          ['term', '① 术语层级：数据 ⊃ 数据对象 ⊃ 数据元素 ⊃ 数据项'],
          ['logic', '② 四种逻辑结构：同一批数据，四种关系'],
          ['store', '③ 两种存储结构：顺序 vs 链式（同一条内存标尺）'],
          ['adt', '④ 抽象数据类型 ADT = (D, S, P)']
        ], value: 'logic'
      }
    ],

    run: function (v) {
      var scene = v.scene || 'logic', frames = [];
      /* 快照里带上真正用来画图的几何与清单：断言才能数到"画出来的那两条"，
         而不是另算一遍可能与画面不一致的数 */
      function F(line, msg, panel, s) {
        var snap = Object.assign({ scene: scene }, s || {});
        if (LEDG[snap.kind]) { snap.E = LEDG[snap.kind]; snap.pos = LPOS[snap.kind]; }
        if (scene === 'term') snap.tbl = ROWS;
        if (snap.mode === 'seq') snap.addr = SEQADDR;
        if (snap.mode === 'link') { snap.lx = LX; snap.laddr = LADDR; }
        if (scene === 'term') snap.tbl = ROWS;
        if (scene === 'adt') { snap.cards = ACARD; snap.impl = IMP; }
        frames.push({ line: line, msg: msg, panel: panel || {}, snap: snap });
      }

      if (scene === 'term') {
        F([0, 2], '先把"数据"这个词放大到它本来那么大：**凡是能进计算机、能被处理的符号都算数据**——数字、字符、表格、图像都是。' +
          '这一级太宽，讨论从来不停在这儿，所以要往下切三层。',
          { 一共四级: '数据 ⊃ 数据对象 ⊃ 数据元素 ⊃ 数据项', 右边例子: '一张 3 行 × 3 列的成绩表' }, { hl: 'data' });
        F([3, 6], '往里一层是**数据对象**：性质相同的数据元素凑成一堆。这 3 条记录都是"学生成绩"这一类，所以它们是**同一个**数据对象。' +
          '再拿一张教师表来，元素性质不同，那就是**另一个**数据对象了。',
          { 判据: '元素性质相同 → 才算同一个数据对象', 本例: '这张成绩表 = 一个数据对象' }, { hl: 'object' });
        F([4, 7], '再往里是**数据元素**：数据的**基本单位**，处理时把它当一个整体传来传去。这张表里"一个学生的全部信息"就是一个数据元素。' +
          '同一件事在不同书里叫法不同——数据库叫**记录**，树和图里叫**结点**，口头一般就叫**元素**。',
          { 地位: '基本单位（整体考虑、整体处理）', 别名: '记录 = 结点 = 元素 = 数据元素' }, { hl: 'element', alias: true });
        F([5, 6], '最里面这一层是**数据项**：组成数据元素、有独立含义、**不能再拆**的最小单位——学号、姓名、成绩各自是一个数据项。' +
          '选择题就抠这两个词：数据的**最小单位是数据项**，数据讨论和处理的**基本单位是数据元素**。这两个说反了就是错。',
          { 最小单位: '数据项（不可分割）', 基本单位: '数据元素（整体处理）', 本例: '一格 = 一个数据项；一行 = 一个数据元素' },
          { hl: 'item' });
        F([6], '把四级的方向记牢：**从外到内是包含**。数据最大，数据项最小。' +
          '追问一句：一个数据元素能不能**只由一个数据项**组成？能——只存一个字段的数据元素是合法的，' +
          '这时两者数值上重合，但概念上仍是两级：一个说"整体处理的单位"，一个说"不能再拆的单位"。',
          { 从外到内: '数据 ⊃ 数据对象 ⊃ 数据元素 ⊃ 数据项', '元素能只有一个项吗': '能，此时两者重合但仍是两级' }, { hl: null });
        F([7, 9], '★ 小结：这一屏只解决"我们在说哪一级单位"。下面换问题：这一堆数据元素**彼此之间**是什么关系——' +
          '注意这个问题跟它们存在哪儿、用几字节，一点关系都没有。',
          { 下一步: '元素之间的关系 = 逻辑结构', 与什么无关: '与计算机、与存储方式都无关' }, { hl: null });
        return { code: CODE, frames: frames };
      }

      /* ---------- 场景三：两种存储结构 ---------- */
      if (scene === 'store') {
        F([16], '要存的是同一个线性表 (a1…a6)，就是上面那一行。存进内存只有两样办法，区别浓缩成一句话：' +
          '**逻辑上相邻的元素，物理上到底挨不挨着。**',
          { 要存的东西: '线性表，6 个元素，5 条前后继关系', 两种存法: '顺序存储 / 链式存储（即物理结构）' }, { mode: 'list' });
        F([17, 19], '**顺序存储**：从地址 1000 起要一段**连续**的内存，一个挨一个放下去。每个元素占 c=16 字节，' +
          '那么 a3 的地址 = 1000 + (3−1)×16 = **1032**。地址不是查出来的，是**算**出来的。',
          { 存放: '地址连续：1000, 1016, 1032, …', 'a3 的地址': '1000 + (3−1)×16 = 1032', 代价: '必须先有一段够用且连续的地方' },
          { mode: 'seq', hl: 2 });
        F([19, 20], '因为地址能算，取第 i 个元素就是**一次乘法**——从第 1 个直接跳到第 5 个，和跳到第 2 个一样快。' +
          '这叫**随机访问**（随机 = 任意，不是"随机数"）。这一条是顺序存储最值钱的性质，也是第 2 章顺序表敢把"取值写成 O(1)"的全部理由。',
          { '取第 i 个': 'Loc(a_i) = Loc(a_1) + (i−1)×c → O(1)', 随机访问: '任意下标一步到位，代价与 i 无关' },
          { mode: 'seq', hl: 4, jump: true });
        F([17, 20], '代价在插入上：要在 a2 之后插一个 x，就得先把 **a3…a6 四个元素依次往右搬一格**腾出地方，再把人放进去。' +
          '表长 n、插在第 i 个位置，平均要搬约 n/2 个——第 2 章那句"插入平均移动 n/2 次"就是这一屏。',
          { 本帧移动次数: '4 次（n−i+1，n=6、i=3）', 结论: '顺序存储：读便宜、改搬家' },
          { mode: 'seq', ins: true, moves: 4 });
        F([18], '**链式存储**：格子随便散在内存各处，地址谁也不挨谁；每个元素旁边多带一格**指针**，' +
          '记下"我的下一个在哪个地址"。逻辑上的 a1→a2→a3，是靠上面这些弧**串**出来的。',
          { 存放: '物理散落：1000 / 1480 / 1160 / 1800 / 1320 / 1640', 靠什么成序: '每个结点附带的 next 指针', 多花的空间: '每结点一个指针 → 存储密度 < 1' },
          { mode: 'link', hl: 1, hlArc: 1, n1: '注意地址：a2 在 1480、a3 在 1160——a3 的地址比 a2 小，物理上它排在 a2 左边' });
        F([21], '插入就轻松了：x 的 next 写 a3 的地址 1160，再把 a2 的 next 从 1160 **改成** x 的 1900——' +
          '**改两个指针，其余元素一个字节都不用动**（虚线弧就是要断开的旧链接）。',
          { 改动: '2 个指针（a2.next 改写、x.next 新建）', 其他元素: '一动不动', '取第 i 个': '必须顺指针走 i−1 步 → O(n)' },
          { mode: 'link', relink: [[1, 6], [6, 2]], oldArc: 1 });
        F([17, 18, 20, 21], '★ 把两样并成一张对照表：**顺序 = 用地址相邻表达逻辑关系，链式 = 用指针表达逻辑关系**，' +
          '表达的都是第二屏那个线性结构，逻辑结构一个字都没改。所以"顺序/链式"是**存储结构**的分类，不是逻辑结构的分类——' +
          '这一句和上一屏合起来，就是"逻辑结构与实现无关"的完整意思。',
          { 地址: '顺序：连续｜链式：任意', '取第 i 个': '顺序：算一下 O(1)｜链式：走过去 O(n)', '插入删除': '顺序：搬家 O(n)｜链式：改指针 O(1)', '空间预估': '顺序：先要一大块｜链式：用一个分一个', 存储密度: '顺序 ≈ 1｜链式 < 1（多背指针）' },
          { mode: 'link', ptrAll: true, n1: '蓝色那一小格就是 next：它存的不是"a3"这个名字，而是一个地址。整张图的先后顺序全靠这些地址串出来', n2: '每个结点都多背一格指针 → 存储密度 < 1：存同样多的数据，链式要额外花地方' });
        return { code: CODE, frames: frames };
      }

      /* ---------- 场景四：抽象数据类型 ADT ---------- */
      if (scene === 'adt') {
        F([23], '最后一屏把前三屏打包。**抽象数据类型 = (D, S, P)**：把"这批数据是什么、彼此什么关系、' +
          '能对它做哪些事"写成一份声明。左边这份就是栈的 ADT，三块正是 D、S、P。',
          { 三元组: 'ADT = (D, S, P)', 例子: 'ADT Stack（栈这种抽象数据类型）' }, { hl: 'all' });
        F([24], '**D 数据对象**：只说成员取自哪一类、取值范围是什么。' +
          '写的是"某个同类型元素的集合"——**不写有几个、不写占多少字节、更不写放在哪块内存**。',
          { D: '数据对象：成员及其取值范围', 本例: '{ ai | ai ∈ 同一类元素的集合 }' }, { hl: 'D' });
        F([25], '**S 数据关系**：D 上的关系集。这里一行 `{ <a(i−1), a(i)> }` 就把第二屏的**线性结构**钉进了定义：' +
          '除首尾外每个元素恰有一前一后。换成树的 ADT，这一行就得改写成"每个元素至多一个父、零或多个子"。',
          { S: 'D 上的关系集', 本例: '{ <a(i−1), a(i)> } → 一对一，线性结构' }, { hl: 'S' });
        F([26, 31], '**P 基本操作**：每个操作只交代输入、输出、**做什么**。往回看这五行——' +
          '没有一个字提到数组、指针、地址、下标。这不是简写，**这就是"抽象"两个字的含义**：' +
          '定义只承诺行为，不承诺实现。第 3 章的栈、第 2 章的线性表，教材都是按这个格式给的。',
          { P: '对 D 的基本操作集', 每个操作写什么: '名字 + 输入 + 输出 + 做什么', 绝对不写什么: '怎么存、怎么找、怎么搬' }, { hl: 'P' });
        F([32], '为什么不写"怎么做"？因为**同一个 ADT 底下可以换实现**：左边用数组 + top 下标（第 3 章顺序栈），' +
          '右边用结点 + next（链栈），上面那份声明一个字都不用改。',
          { '同一个 ADT': '顺序栈（第 3 章 seqStack）/ 链栈（linkStack）', 换实现要改什么: '声明和调用都不用改', 调用者买的单: '"能 Push 能 Pop"，不是"用了几格内存"' }, { hl: 'impl' });
        F([33, 9], '★ 最后分清两个词：**数据类型**是语言内置的——int、float、char；' +
          '**抽象数据类型**是你自己定义的，它比数据类型多出来的那一样东西，就是"把操作绑在数据上"。' +
          '这也回答了"为什么要学数据结构"：学的是**定义自己的类型**，而不是背几种写法。',
          { 数据类型: '语言内置 int / float / char', 抽象数据类型: '自定义，数据 + 关系 + 操作打包', 一句话: '数据结构课 = 学怎么定义自己的类型' },
          { hl: 'type' });
        return { code: CODE, frames: frames };
      }

      /* ---------- 场景二：四种逻辑结构（默认场景，走到函数末尾）---------- */
      var cnt = { set: 0, linear: 5, tree: 5, graph: 8 };
      F([9], '屏幕上是同一批数据元素 a1…a6，一条线都不连。逻辑结构问的只有一件事：**它们之间是什么对应关系**。',
        { 元素: 'a1…a6 共 6 个', '关系（还没定）': '——' }, { kind: 'set', ehl: [] });
      F([10], '**① 集合结构**：除了"我们同属一个集合"，彼此再没有任何可说的对应关系。这是最松散的一类，' +
        '也是教材承认存在、但后面几乎不讲的一类——因为光有集合什么算法都做不了。',
        { 结构: '集合', 关系: '仅"同属一个集合"', 边数: '0 条' }, { kind: 'set', ehl: [] });
      F([11], '**② 线性结构**：把它们排成一行。除第一个和最后一个之外，每个元素**恰有一个前驱、恰有一个后继**；' +
        '首元素无前驱、尾元素无后继，而且**首尾各只有一个**——这一句就是判断"是不是线性结构"的硬指标。',
        { 结构: '线性', 关系: '一对一（前驱 ≤1、后继 ≤1）', 边数: cnt.linear + ' 条 = n−1' },
        { kind: 'linear', ehl: [0, 1, 2, 3, 4], ann: true });
      F([12], '**③ 树形结构**：一个元素可以对应**多个**后继，但除根以外每个元素只有**一个**父。' +
        'a1 是根（无父），a2、a3 是它的孩子，a4、a5 又是 a2 的孩子——层次关系，**一对多**。',
        { 结构: '树形', 关系: '一对多（1 个父、多个子）', 边数: cnt.tree + ' 条 = n−1' },
        { kind: 'tree', ehl: [0, 1, 2, 3, 4], ann: true });
      F([13, 14], '**④ 图状（网状）结构**：任意两个元素之间都可能相关，前驱后继都不再唯一。这里是 6 个点连一圈再加两条对角线，' +
        '**多对多**。树形其实是图状的特例（有根、且每个点只有一个父的连通无环图）——但分类时按最一般的口径记：四类。',
        { 结构: '图状 / 网状', 关系: '多对多（前驱后继都任意）', 边数: cnt.graph + ' 条（最多 n(n−1)/2 = 15）' },
        { kind: 'graph', ehl: [0, 1, 2, 3, 4, 5, 6, 7] });
      F([10, 11, 12, 13, 14], '四张缩略图并排，判据统一成一句话：**看每个元素最多能直接连几个**。' +
        '集合只讲归属；线性 ≤1 前驱且 ≤1 后继；树 1 父多子；图 任意。' +
        '顺手记住分界——**线性结构是"线性"的，树形和图状都归到非线性结构**，问"下列哪些是非线性结构"时两个都要选。',
        { '每点最多几个后继': '集合 0 · 线性 1 · 树 多 · 图 多', '每点最多几个前驱': '集合 0 · 线性 1 · 树 1 · 图 多', 非线性的是: '树形结构、图状结构' },
        { kind: 'all' });
      F([9], '★ 最后拆掉一个错判据：**边数不能用来分类**。看缩略图，4 个点的线性结构和 4 个点的树**都是 3 条边**；' +
        '换成 6 个点，两种结构都正好需要 5 条边。边数相同、关系完全不同——分类依据是**关系的形状**，不是边的根数。',
        { '边数相同会撞车': 'n 个点的线性结构和 n 个点的树都是 n−1 条边', 真正的判据: '元素之间的对应关系（几对几）' },
        { kind: 'all', note2: true });
      return { code: CODE, frames: frames };
    },

    render: function (s) {
      var W = 980, H = 560, g = '';
      if (s.scene === 'term') return rTerm(s, W, H);
      if (s.scene === 'logic') return rLogic(s, W, H);
      if (s.scene === 'store') return rStore(s, W, H);
      return rAdt(s, W, H);
    }
  });

  /* ================= 渲染：术语层级 ================= */
  function rTerm(s, W, H) {
    var g = '', hl = s.hl;
    g += h.txt(W / 2, 28, '① 术语层级：数据、数据对象、数据元素、数据项', { size: 17, w: 600 });
    g += h.txt(26, 50, '左：四级从外到内嵌套　右：一张具体成绩表　橙色边框 = 现在说的这一级', { size: 11.5, fill: C.muted, anchor: 'start' });
    /* 四级嵌套框：外到内，只描边不填色，避免层层压色 */
    LVL.forEach(function (L) {
      var on = hl === L.k;
      g += h.rect(L.x, L.y, L.w, L.ht, { rx: 12, fill: 'none', stroke: on ? C.amber : C.line, sw: on ? 3 : 1.4 });
      g += h.txt(L.x + 10, L.y + 20, L.t, { size: 13.5, w: 700, anchor: 'start', fill: on ? C.amber : C.ink });
      g += h.txt(L.x + 10, L.y + 36, L.en + '｜' + L.e, { size: 10.5, anchor: 'start', fill: on ? C.amber : C.muted });
    });
    /* 右表：3 行记录 × 3 列数据项 */
    var tw = TCW[0] + TCW[1] + TCW[2], x = TX;
    COLS.forEach(function (c, j) {
      var cx = x + TCW.slice(0, j).reduce(function (a, b) { return a + b; }, 0);
      var on = hl === 'item' && j === 0;
      g += h.rect(cx, TY - TRH, TCW[j], TRH, { rx: 3, fill: on ? C.amberBg : C.greyBg, stroke: on ? C.amber : C.grey, sw: on ? 2.4 : 1.2 });
      g += h.txt(cx + TCW[j] / 2, TY - TRH / 2 + 5, c, { size: 13, w: 700 });
    });
    ROWS.forEach(function (row, i) {
      var y = TY + i * TRH;
      if (hl === 'element' && i === 0) {
        g += h.rect(x - 5, y, tw + 10, TRH, { rx: 5, fill: C.amberBg, stroke: C.amber, sw: 2.6 });
      }
      row.forEach(function (cell, j) {
        var cx = x + TCW.slice(0, j).reduce(function (a, b) { return a + b; }, 0);
        var on = hl === 'item' && i === 0 && j === 0;
        g += h.rect(cx, y, TCW[j], TRH, { rx: 3, fill: on ? C.amberBg : '#fff', stroke: on ? C.amber : C.grey, sw: on ? 2.6 : 1.2 });
        g += h.txt(cx + TCW[j] / 2, y + TRH / 2 + 5, cell, { size: 13, w: on ? 700 : 400 });
      });
    });
    var tbY = TY + ROWS.length * TRH;
    if (hl === 'object') {
      g += h.rect(x - 10, TY - TRH - 10, tw + 20, tbY - TY + TRH + 20, { rx: 10, fill: 'none', stroke: C.amber, sw: 3 });
    }
    g += h.txt(x, tbY + 26, '3 条记录 × 3 个数据项', { size: 12.5, anchor: 'start', fill: C.muted });
    if (hl === 'element') g += h.txt(x + tw + 12, TY + TRH / 2 + 6, '← 一行 = 一个数据元素', { size: 12.5, anchor: 'start', fill: C.amber, w: 700 });
    if (hl === 'item') g += h.txt(x + tw + 12, TY - TRH / 2 + 6, '← 一格 = 一个数据项', { size: 12.5, anchor: 'start', fill: C.amber, w: 700 });
    if (hl === 'object') g += h.txt(x + tw + 12, TY + TRH * 1.5 + 6, '← 整张表 = 一个数据对象', { size: 12.5, anchor: 'start', fill: C.amber, w: 700 });
    if (s.alias) {
      ['记录', '结点', '元素'].forEach(function (t, i) {
        g += h.rect(x + i * 108, tbY + 44, 96, 30, { rx: 15, fill: C.blueBg, stroke: C.blue, sw: 1.4 });
        g += h.txt(x + i * 108 + 48, tbY + 63, t, { size: 13, w: 600 });
      });
      g += h.txt(x, tbY + 92, '都指同一个东西：数据元素', { size: 12, anchor: 'start', fill: C.muted });
    }
    g += h.txt(W / 2, 520, '从外到内是包含关系：数据 ⊃ 数据对象 ⊃ 数据元素 ⊃ 数据项', { size: 14, w: 600, fill: C.blue });
    return h.svg(W, H, g);
  }

  /* ================= 渲染：四种逻辑结构 ================= */
  function rLogic(s, W, H) {
    var g = '', kind = s.kind || 'set';
    if (kind === 'all') return rLogicAll(s, W, H);
    g += h.txt(W / 2, 28, KNAME[kind] + ' · 同一批数据元素 a1…a6', { size: 17, w: 600 });
    g += h.txt(26, 50, '点不动、只动连线：换的只是"谁和谁相关"这一件事。橙 = 本帧强调的关系，灰 = 未涉及', { size: 11.5, fill: C.muted, anchor: 'start' });
    var pos = LPOS[kind], E = LEDG[kind];
    E.forEach(function (e, k) {
      var A = pos[e[0]], B = pos[e[1]], hot = (s.ehl || []).indexOf(k) >= 0;
      var col = hot ? C.amber : C.grey, sw = hot ? 2.8 : 1.8;
      var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
      var sx = A[0] + dx / L * 23, sy = A[1] + dy / L * 23;
      var tx = B[0] - dx / L * 23, ty = B[1] - dy / L * 23;
      if (kind === 'linear') g += h.arrow(sx, sy, tx, ty, { stroke: col, sw: sw, head: 9 });
      else g += h.line(sx, sy, tx, ty, { stroke: col, sw: sw });
    });
    pos.forEach(function (p, i) {
      var hot = kind !== 'set';
      g += h.circle(p[0], p[1], 22, { fill: '#fff', stroke: hot ? C.blue : C.grey, sw: 2 });
      g += h.txt(p[0], p[1] + 5, NM[i], { size: 13.5, w: 700 });
    });
    if (s.ann && kind === 'linear') {
      g += h.txt(130, 196, '首元素：无前驱', { size: 12, fill: C.amber, w: 600 });
      g += h.txt(420, 300, '中间元素：恰一个前驱、恰一个后继', { size: 12, fill: C.amber, w: 600 });
      g += h.txt(855, 300, '尾元素：无后继', { size: 12, fill: C.amber, w: 600 });
      g += h.txt(490, 400, '每个点的后继数都 ≤ 1 → 排成一条线，这就是"线性"三个字的来源', { size: 12.5, fill: C.muted });
    }
    if (s.ann && kind === 'tree') {
      g += h.txt(490, 80, '根 a1：没有父', { size: 12, fill: C.amber, w: 600 });
      g += h.txt(180, 452, '叶子 a4：没有孩子', { size: 12, fill: C.amber, w: 600 });
      g += h.txt(490, 500, 'a2 的父只有 a1 一个，但它的孩子有 a4、a5 两个 → 这就是"一对多"', { size: 12.5, fill: C.muted });
    }
    if (kind === 'graph') {
      g += h.txt(490, 470, 'a1 的后继可以是 a2、a4、a3 任意多个，反过来也一样 → "多对多"', { size: 12.5, fill: C.muted });
      g += h.txt(490, 500, '完全图 K6 要 15 条边，这里只连了 8 条：连线多少不改变它属于图状结构', { size: 12.5, fill: C.muted });
    }
    if (kind === 'set') {
      g += h.txt(490, 470, '六个点谁也不挨谁——除了"它们是一个集合里的"，没有别的关系可写', { size: 12.5, fill: C.muted });
    }
    return h.svg(W, H, g);
  }

  function rLogicAll(s, W, H) {
    var g = '';
    g += h.txt(W / 2, 28, '四种逻辑结构并排：判据只看"每个元素最多能直接连几个"​', { size: 17, w: 600 });
    g += h.txt(26, 50, '每种都用 4 个点、同样的画法。注意线性和树形各自都用了 3 条边——边数相同，形状完全不同', { size: 11.5, fill: C.muted, anchor: 'start' });
    MINI.forEach(function (m, i) {
      var ox = 40 + i * 232, oy = 120;
      g += h.rect(ox - 14, oy - 26, 214, 190, { rx: 10, fill: 'none', stroke: C.line, sw: 1.2 });
      m.e.forEach(function (e) {
        var A = m.d[e[0]], B = m.d[e[1]];
        if (i === 1) g += h.arrow(ox + A[0] + 11, oy + A[1], ox + B[0] - 11, oy + B[1], { stroke: C.blue, sw: 2, head: 7 });
        else g += h.line(ox + A[0], oy + A[1], ox + B[0], oy + B[1], { stroke: C.blue, sw: 1.8 });
      });
      m.d.forEach(function (p) {
        g += h.circle(ox + p[0], oy + p[1], 9, { fill: '#fff', stroke: C.blue, sw: 1.8 });
      });
      g += h.txt(ox + 92, oy + 186, m.t, { size: 14, w: 700, fill: C.ink });
      g += h.txt(ox + 92, oy + 206, m.s, { size: 11.5, fill: C.muted });
    });
    g += h.txt(W / 2, 380, s.note2 ? '边数不能用来分类：n 个点的线性结构和 n 个点的树都是 n−1 条边'
      : '线性结构 = 线性；树形 + 图状 = 非线性结构（考试两个都要选上）', { size: 14, w: 700, fill: s.note2 ? C.red : C.blue });
    g += h.txt(W / 2, 412, s.note2 ? '真正的判据是"关系的形状"：一对一 / 一对多 / 多对多'
      : '集合只讲归属 · 线性 ≤1 前驱且 ≤1 后继 · 树 1 父多子 · 图 任意', { size: 13, fill: C.muted });
    return h.svg(W, H, g);
  }

  /* ================= 渲染：两种存储结构 ================= */
  function rStore(s, W, H) {
    var g = '', mode = s.mode || 'list';
    var TIT = { list: '③ 两种存储结构：先空着这条内存', seq: '③ 顺序存储：地址连续', link: '③ 链式存储：物理散落、靠指针串起来' };
    g += h.txt(W / 2, 28, TIT[mode], { size: 17, w: 600 });
    g += h.txt(26, 50, '上面一行是纸上的逻辑结构，下面那条长条是一段内存（地址从左到右增大）。橙 = 当前强调', { size: 11.5, fill: C.muted, anchor: 'start' });
    /* 顶行：逻辑结构（始终是参照物） */
    g += h.txt(30, 82, '逻辑结构', { size: 13, anchor: 'start', w: 600 });
    NM.forEach(function (n, i) {
      var x = 300 + i * 62;
      var hot = s.topHl === i;
      g += h.rect(x, 62, 52, 30, { rx: 4, fill: hot ? C.amberBg : '#fff', stroke: hot ? C.amber : C.grey, sw: hot ? 2.4 : 1.4 });
      g += h.txt(x + 26, 82, n, { size: 13, w: 600 });
    });
    g += h.txt(690, 82, '（这是纸上的一行，跟内存无关）', { size: 11.5, anchor: 'start', fill: C.muted });
    /* 内存条 */
    g += h.rect(MX, MY, 880, MH, { rx: 3, fill: 'none', stroke: C.line, sw: 1.4, dash: mode === 'list' ? '6 5' : '' });

    if (mode === 'seq') {
      var n = s.ins ? 7 : 6;
      for (var i = 0; i < n; i++) {
        var x = MX + i * MW, idx = i < 2 ? i : (s.ins ? i - 1 : i);
        var label = s.ins && i === 2 ? 'x' : NM[idx];
        var moved = !!s.ins && i >= 3;
        var hot = s.hl === i || (s.hl === 2 && label === 'x');
        g += h.rect(x + 2, MY + 6, MW - 4, MH - 12, {
          rx: 4, fill: hot ? C.amberBg : (moved ? '#fff' : C.greyBg),
          stroke: hot ? C.amber : (moved ? C.blue : C.grey), sw: hot ? 2.6 : 1.4,
          dash: moved ? '5 3' : ''
        });
        g += h.txt(x + MW / 2, MY + MH / 2 + 5, label, { size: 14.5, w: 700 });
        if (!s.ins || i !== 2) g += h.txt(x + MW / 2, MY + MH + 20, String(SEQADDR[i]), { size: 11.5, fill: hot ? C.amber : C.muted });
        else g += h.txt(x + MW / 2, MY + MH + 20, '新来的', { size: 11.5, fill: C.amber, w: 600 });
      }
      if (!s.ins) {
        g += h.rect(MX + 6 * MW, MY + 6, 880 - 6 * MW - 4, MH - 12, { rx: 4, fill: 'none', stroke: C.line, sw: 1.2, dash: '4 4' });
        g += h.txt(MX + 6 * MW + (880 - 6 * MW) / 2, MY + MH / 2 + 4, '这段之后是空闲', { size: 12, fill: C.muted });
      }
      if (s.hl === 2 && !s.ins) {
        var cx = MX + 2 * MW + MW / 2;
        g += h.txt(cx, MY + MH + 48, 'Loc(a3) = Loc(a1) + (3−1)×c = 1000 + 2×16 = 1032', { size: 13.5, w: 600, fill: C.amber });
        g += h.txt(cx, MY + MH + 70, '地址能算出来 → 只要给下标就能直接取，这就是"随机访问"', { size: 12.5, fill: C.muted });
      }
      if (s.jump) {
        var a = MX + MW / 2, b = MX + 4 * MW + MW / 2;
        g += h.curve(a, MY + 2, (a + b) / 2, MY - 62, b, MY + 2, { stroke: C.red, sw: 2.4, head: 9 });
        g += h.txt((a + b) / 2, MY - 70, '取第 1 个 → 立刻取第 5 个：都是一次地址计算，代价一样', { size: 12.5, fill: C.red });
      }
      if (s.ins) {
        for (var j = 3; j < 3 + s.moves; j++) {
          var px = MX + (j - 1) * MW + MW / 2;
          g += h.arrow(px, MY - 14, px + MW - 6, MY - 14, { stroke: C.amber, sw: 2.2, head: 8 });
        }
        g += h.txt(MX + 2 * MW + MW / 2, MY - 34, 'a3…a6 依次往右搬一格：移动 4 次', { size: 12.5, fill: C.amber, w: 600 });
        g += h.txt(490, 430, '空出来的这一格放 x。搬完才对——顺序存储的插入是"先挪窝、再放人"', { size: 12.5, fill: C.muted });
      }
    }

    if (mode === 'link') {
      /* relink = 这次插入要改写的指针清单，箭头数量由它决定（不是画死的） */
      var RL = s.relink || [], touch = {}, NEW = 6;
      RL.forEach(function (R) { touch[R[0]] = 1; touch[R[1]] = 1; });
      var nx = 690, ny = 330;
      var nodeXY = function (i) { return i === NEW ? [nx + (LW - 10) / 2, ny] : [LX[i] + LW / 2, MY + MH / 2]; };
      /* 结点：[ 数据 | next ]，位置散落，各带自己的地址 */
      LX.forEach(function (x, i) {
        var hot = s.hl === i, isOld = touch[i];
        g += h.txt(x + LW / 2, MY - 8, String(LADDR[i]), { size: 11.5, fill: isOld ? C.amber : C.muted, w: isOld ? 600 : 400 });
        g += h.rect(x, MY + 6, LW, MH - 12, { rx: 4, fill: 'none', stroke: hot || isOld ? C.amber : C.grey, sw: hot || isOld ? 2.4 : 1.2 });
        g += h.rect(x + 2, MY + 8, LW - 34, MH - 16, { rx: 3, fill: hot ? C.amberBg : C.greyBg, stroke: hot ? C.amber : C.grey, sw: 1.2 });
        g += h.txt(x + (LW - 32) / 2 + 2, MY + MH / 2 + 4, NM[i], { size: 13.5, w: 700 });
        g += h.rect(x + LW - 32, MY + 8, 30, MH - 16, { rx: 3, fill: s.ptrAll || hot || isOld ? C.blueBg : '#fff', stroke: C.blue, sw: 1.2 });
        g += h.txt(x + LW - 17, MY + MH / 2 + 4, 'next', { size: 10, fill: C.blue });
      });
      /* 逻辑顺序靠上面的弧串出来 */
      for (var k = 0; k < 5; k++) {
        var x1 = LX[k] + LW / 2, x2 = LX[k + 1] + LW / 2;
        var dep = 26 + Math.abs(x2 - x1) * 0.06;
        var dim = s.oldArc === k;
        g += h.curve(x1, MY + 2, (x1 + x2) / 2, MY - dep, x2, MY + 2, {
          stroke: dim ? C.grey : (s.hlArc === k ? C.amber : C.blue), sw: s.hlArc === k ? 2.6 : 1.8,
          head: 8, dash: dim ? '5 4' : ''
        });
      }
      if (RL.length) {
        g += h.rect(nx, ny, LW - 10, 44, { rx: 4, fill: C.amberBg, stroke: C.amber, sw: 2.4 });
        g += h.rect(nx + 2, ny + 3, LW - 44, 38, { rx: 3, fill: '#fff', stroke: C.amber, sw: 1.2 });
        g += h.txt(nx + (LW - 42) / 2 + 2, ny + 26, 'x', { size: 13.5, w: 700 });
        g += h.rect(nx + LW - 42, ny + 3, 30, 38, { rx: 3, fill: C.blueBg, stroke: C.blue, sw: 1.2 });
        g += h.txt(nx + LW - 27, ny + 26, 'next', { size: 10, fill: C.blue });
        g += h.txt(nx + 4, ny - 8, '新结点，地址 1900', { size: 11.5, anchor: 'start', fill: C.amber });
        RL.forEach(function (R) {
          var A = nodeXY(R[0]), B = nodeXY(R[1]);
          g += h.arrow(A[0] + (R[0] === NEW ? -26 : 22), A[1] + (R[0] === NEW ? 4 : 20),
            B[0] + (R[1] === NEW ? -24 : 14), B[1] + (R[1] === NEW ? 32 : 16),
            { stroke: C.amber, sw: 2.4, head: 8 });
        });
        g += h.txt(490, 420, '改动只有 ' + RL.length + ' 处：a2 的 next 由「1160」改成「1900」，x 的 next 写「1160」。其余四个元素一个字节都不用动',
          { size: 12.5, fill: C.amber, w: 600 });
        g += h.txt(490, 444, '代价在另一头：想取第 i 个，只能从 a1 一路 next 走过去，走 i−1 步', { size: 12.5, fill: C.muted });
      }
      if (s.n1) g += h.txt(490, 400, s.n1, { size: 12.5, fill: C.muted });
      if (s.n2) g += h.txt(490, 424, s.n2, { size: 12.5, fill: C.muted });
    }
    if (mode === 'list') {
      g += h.txt(490, MY + MH / 2 + 5, '同一个线性表，可以这样存，也可以那样存 ↓', { size: 14, fill: C.muted });
      g += h.txt(490, 330, '要存的还是那 6 个元素、还是那 5 条前后继关系：逻辑结构一个字没改', { size: 13, fill: C.blue });
      g += h.txt(490, 356, '改的只是"物理上怎么摆"——所以顺序 / 链式是存储结构的分类，不是逻辑结构的分类', { size: 13, fill: C.muted });
    }
    return h.svg(W, H, g);
  }

  /* ================= 渲染：ADT 三元组 ================= */
  function rAdt(s, W, H) {
    var g = '', hl = s.hl || 'all';
    g += h.txt(W / 2, 28, '④ 抽象数据类型 ADT = (D, S, P)', { size: 17, w: 600 });
    g += h.txt(26, 50, '左：一份真实的栈 ADT 声明，逐块点亮　右：声明底下可以换实现。橙 = 当前讲的这一块', { size: 11.5, fill: C.muted, anchor: 'start' });
    g += h.txt(40, 78, 'ADT Stack {', { size: 13.5, anchor: 'start', w: 600, fill: C.muted });
    ACARD.forEach(function (cd) {
      var on = hl === cd.k || hl === 'all';
      g += h.rect(40, cd.y, 430, cd.ht, { rx: 8, fill: on ? C.amberBg : '#fff', stroke: on ? C.amber : C.line, sw: on ? 2.8 : 1.4 });
      g += h.txt(54, cd.y + 22, cd.t, { size: 13.5, anchor: 'start', w: 700, fill: on ? C.amber : C.ink });
      cd.ln.forEach(function (l, i) {
        g += h.txt(54, cd.y + 42 + i * 20, l, { size: 12, anchor: 'start', fill: C.ink });
      });
    });
    g += h.txt(40, 446, '}', { size: 13.5, anchor: 'start', w: 600, fill: C.muted });
    if (hl === 'P') {
      g += h.rect(52, 300, 404, 98, { rx: 6, fill: 'none', stroke: C.red, sw: 2, dash: '5 3' });
      g += h.txt(256, 420, '往回看这五行：没有数组、没有指针、没有地址', { size: 11.5, fill: C.red });
    }
    /* 右半边：声明层 / 实现层 */
    var on2 = hl === 'impl';
    g += h.rect(520, 92, 420, 74, { rx: 8, fill: on2 ? C.greenBg : C.greyBg, stroke: on2 ? C.green : C.line, sw: on2 ? 2.8 : 1.4 });
    g += h.txt(730, 118, '定义层：ADT Stack（用户看到的就这一层）', { size: 13, w: 700 });
    g += h.txt(730, 140, 'Push / Pop / GetTop / Empty —— 只说做什么', { size: 11.5, fill: C.muted });
    IMP.forEach(function (b, i) {
      g += h.rect(b[3], 210, 200, 92, { rx: 8, fill: '#fff', stroke: on2 ? C.green : C.line, sw: on2 ? 2.2 : 1.4 });
      g += h.txt(b[3] + 100, 238, b[0], { size: 13, w: 700 });
      g += h.txt(b[3] + 100, 260, b[1], { size: 12, fill: C.muted });
      g += h.txt(b[3] + 100, 282, b[2], { size: 11, fill: C.grey });
      g += h.arrow(b[3] + 100, 208, 730 + (i === 0 ? -110 : 110), 170, { stroke: on2 ? C.green : C.grey, sw: 1.8, head: 8 });
    });
    g += h.txt(730, 330, on2 ? '换实现，上面那份声明一个字都不用改' : '底下用哪种实现，调用者不知道也不需要知道',
      { size: 12.5, w: on2 ? 700 : 400, fill: on2 ? C.green : C.muted });
    if (hl === 'type') {
      var rows = [['数据类型', '语言内置：int、float、char…', '只有值和几个内置运算'],
        ['抽象数据类型', '你自己定义：ADT Stack、ADT List…', '数据 + 关系 + 操作，一起打包']];
      rows.forEach(function (r, i) {
        g += h.rect(520, 360 + i * 58, 420, 52, { rx: 8, fill: i ? C.blueBg : '#fff', stroke: i ? C.blue : C.line, sw: i ? 2.2 : 1.4 });
        g += h.txt(536, 380 + i * 58, r[0], { size: 13, anchor: 'start', w: 700, fill: i ? C.blue : C.ink });
        g += h.txt(536, 400 + i * 58, r[1] + '　' + r[2], { size: 11.5, anchor: 'start', fill: C.muted });
      });
      g += h.txt(730, 490, '学数据结构，本质就是学"定义自己的类型"', { size: 13, w: 700, fill: C.blue });
    } else {
      g += h.txt(730, 390, '前三屏的落点：逻辑结构管"关系"，存储结构管"怎么摆"', { size: 12.5, fill: C.muted });
      g += h.txt(730, 414, 'ADT 把这两层连同操作一起封起来，对外只露操作', { size: 12.5, fill: C.muted });
    }
    return h.svg(W, H, g);
  }
})();
