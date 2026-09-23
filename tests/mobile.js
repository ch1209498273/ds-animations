/* 手机视口卡口：用 headless Chrome 在真 390×844 视口下量测构建产物。
   无头浏览器有最小窗宽限制（约 492px），直接 --window-size=390 拿不到真窄视口，
   所以把页面装进 390px 宽的 iframe 里量——iframe 内的媒体查询按 iframe 宽度生效。
   断言：无横向溢出、可点元素全部 ≥44px、舞台高度 ≥45% 视口、页头 ≤100px、
   翻页后"当前执行行"仍在代码框可视区内。
   找不到 Chrome 时跳过（返回 0），不阻塞无浏览器的环境。
   ★ 这里刻意**不回退到 msedge**：本机经 Edge 发起认证会触发 Windows 账户锁定，
     验证一律走 headless Chrome（见需求方 2026-09-22 的安全日志结论）。 */
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe'
];
const edge = BROWSERS.find(p => p && fs.existsSync(p));
if (!edge) { console.log('  (跳过: 未找到 headless Chrome；不用 Edge 兜底)'); process.exit(0); }

const dist = path.join(__dirname, '..', 'dist', '数据结构互动课件.html');
/* 没有构建产物属于环境缺失，不是代码缺陷：GitHub 的 ubuntu-latest 镜像自带 Chrome，
   发布仓库里又没有 dist/，这里若判失败就会把 CI 无故弄红。跳过并说明。 */
if (!fs.existsSync(dist)) { console.log('  (跳过: 无 dist 构建产物，手机卡口只在本地跑)'); process.exit(0); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dscmob-'));
fs.copyFileSync(dist, path.join(tmp, 'm.html'));

/* 量测用独立的临时 --user-data-dir，跑完随 tmp 一起删；绝不碰真实浏览器配置 */
const PROFILE = path.join(tmp, 'chrome-profile');

const PROBE = `
setTimeout(function () {
  var d = f.contentDocument, w = f.contentWindow, o = {};
  var de = d.documentElement;
  o.vw = w.innerWidth; o.vh = w.innerHeight;
  o.hOverflow = de.scrollWidth - de.clientWidth;
  var st = d.getElementById('stage');
  if (st) { var r = st.getBoundingClientRect(); o.stage = [Math.round(r.width), Math.round(r.height)]; }
  var cv = d.getElementById('canvas');
  if (cv && st) o.canvasFits = cv.offsetWidth <= st.clientWidth + 2 && cv.offsetHeight <= st.clientHeight + 2;
  var svg = d.querySelector('#canvas svg');
  if (svg) {
    var rs = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    var sc = rs.width / vb.width;
    var fa = [];
    svg.querySelectorAll('text').forEach(function (t) {
      var x = parseFloat(w.getComputedStyle(t).fontSize) || 0; if (x) fa.push(x);
    });
    if (fa.length) { fa.sort(function (a, b) { return a - b; }); o.effMinPx = +(fa[0] * sc).toFixed(1); }
  }
  var els = d.querySelectorAll('button,a,select,input,[role=button]');
  var small = [], minH = 999, n = 0;
  els.forEach(function (e) { var r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return; n++;
    if (r.height < minH) minH = r.height;
    if (r.height < 44) small.push((e.id || e.className || e.tagName) + ':' + Math.round(r.height)); });
  o.clickables = n; o.minClickH = Math.round(minH); o.smallCount = small.length; o.smallSample = small.slice(0, 6);
  var hd = d.querySelector('header');
  if (hd) o.header = Math.round(hd.getBoundingClientRect().height);  /* 放映态的控件必须真的被布局出来：#mpCounter 曾有文本但 0×0
     （默认 display:none 没被 body.mp 覆盖掉）——只查文本或存在性都会漏 */
  if (d.body.classList.contains('mp')) {
    o.mpEls = {};
    var mpc = d.getElementById('mpCounter');
    o.mpCounterText = mpc ? JSON.stringify(mpc.textContent) + '/' + getComputedStyle(mpc).display : 'missing';
    ['mpPrev', 'mpNext', 'mpBar', 'mpMsg', 'mpCounter', 'mpExit'].forEach(function (id) {
      var e = d.getElementById(id);
      o.mpEls[id] = e ? [Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)] : null;
    });
  }
  /* 代码框：伪代码比框高时（手机 170px 只装得下约 9 行），高亮行必须被滚进可视区。
     这一步要翻到后面的帧才量得到，所以放在所有量测之后 */
  var cb = d.querySelector('.codebox');
  if (cb && cb.offsetHeight > 0) {
    o.codeOverflow = cb.scrollHeight > cb.clientHeight + 2;
    for (var kk = 0; kk < 30; kk++) d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    var on2 = d.querySelector('#code .cl.on');
    if (on2) {
      var r2 = on2.getBoundingClientRect(), rb = cb.getBoundingClientRect();
      o.codeHiVisible = r2.top >= rb.top - 1 && r2.bottom <= rb.bottom + 1;
      o.codeHi = [Math.round(r2.top), Math.round(r2.bottom), Math.round(rb.top), Math.round(rb.bottom)];
    }
  }
  var pre = document.createElement('pre');
  pre.textContent = 'PROBE:' + JSON.stringify(o);
  document.body.appendChild(pre);
}, 2500);
`;

function measure(hash, W, H) {
  W = W || 390; H = H || 844;
  const html = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#888}iframe{border:0;background:#fff}</style></head><body>' +
    '<iframe id="f" src="m.html' + hash + '" style="width:' + W + 'px;height:' + H + 'px"></iframe>' +
    '<script>var f=document.getElementById("f");' + PROBE + '<\/script></body></html>';
  const hp = path.join(tmp, 'harness.html');
  fs.writeFileSync(hp, html, 'utf8');
  const r = cp.spawnSync(edge, ['--headless=new', '--disable-gpu', '--user-data-dir=' + PROFILE, '--allow-file-access-from-files',
    '--hide-scrollbars', '--window-size=500,900', '--virtual-time-budget=9000',
    '--dump-dom', 'file:///' + hp.replace(/\\/g, '/')], { encoding: 'utf8', timeout: 60000 });
  const m = /PROBE:(\{[^<]*)/.exec(r.stdout || '');
  return m ? JSON.parse(m[1]) : null;
}

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  ' + JSON.stringify(extra) : '')); }
}

const VIEWS = [['目录页', ''], ['堆排序', '#m=heapSort'], ['顺序表', '#m=seqList'],
  ['最小生成树', '#m=mst'], ['链栈与链队列', '#m=linkStackQueue']];
VIEWS.forEach(function (v) {
  const o = measure(v[1]);
  if (!o) { t('手机视口 ' + v[0] + ': 量测成功', false, '探针无输出'); return; }
  t('手机视口 ' + v[0] + ': 无横向溢出', o.hOverflow === 0, o.hOverflow);
  t('手机视口 ' + v[0] + ': 可点元素全部 ≥44px', o.smallCount === 0, o.smallSample);
  t('手机视口 ' + v[0] + ': 舞台高度 ≥45% 视口', o.stage && o.stage[1] >= Math.round(o.vh * 0.45), o.stage);
  t('手机视口 ' + v[0] + ': 页头 ≤100px', o.header <= 100, o.header);
  if (o.codeOverflow !== undefined) {
    t('手机视口 ' + v[0] + ': 翻页后"当前执行行"仍在代码框可视区内',
      o.codeOverflow === false || o.codeHiVisible === true, { overflow: o.codeOverflow, visible: o.codeHiVisible, box: o.codeHi });
  }
});

/* 手机放映（横屏 844×390）：用户要求"画面就是窗口大小"，不许上下左右拖。
   那意味着高画布（980×620）等比只能缩到 0.5 上下，字号物理上到不了 8px，
   所以这里守的是"完整可见"，字号只留一个下限防止再度缩到看不清 */
[['堆排序', '#m=heapSort&mp=1'], ['循环队列', '#m=circQueue&mp=1'], ['Dijkstra', '#m=dijkstra&mp=1'],
  ['B+ 树', '#m=btree&mp=1']].forEach(function (v) {
  const o = measure(v[1], 844, 390);
  if (!o) { t('手机放映 ' + v[0] + ': 量测成功', false, '探针无输出'); return; }
  t('手机放映 ' + v[0] + ': 画布完整落在窗口内（不需拖动）', o.canvasFits === true, { fits: o.canvasFits, stage: o.stage });
  t('手机放映 ' + v[0] + ': 画布最小字号 ≥5px', o.effMinPx >= 5, o.effMinPx);
  t('手机放映 ' + v[0] + ': 无横向溢出', o.hOverflow === 0, o.hOverflow);
  t('手机放映 ' + v[0] + ': 可点元素 ≥44px', o.smallCount === 0, o.smallSample);
  const flat = o.mpEls && Object.keys(o.mpEls).filter(k => !o.mpEls[k] || o.mpEls[k][0] < 8 || o.mpEls[k][1] < 8);
  t('手机放映 ' + v[0] + ': 箭头/解说条/帧号/退出 都已布局', flat && flat.length === 0,
    { els: o.mpEls, counter: o.mpCounterText });
});

/* 目录页（手机竖屏）：卡片网格时代要滑 6.6 屏，改成"搜索 + 紧凑行 + 手风琴"后
   守两件事——默认够短、搜索真的能过滤（.ovrow 是 display:flex，
   早先漏了 [hidden]{display:none}，属性设了但行藏不起来，只有截图才看得出来） */
const CAT = `
setTimeout(function () {
  var d = f.contentDocument, w = f.contentWindow;
  d.getElementById('btnCatalog').click();
  setTimeout(function () {
    var c = d.getElementById('catalog');
    function vis() { return Array.prototype.filter.call(c.querySelectorAll('.ovrow'), function (r) { return r.offsetHeight > 0; }).length; }
    /* 抽屉本身高度固定，滚动在 .ovlist 上——量错对象会让断言恒真 */
    var list = c.querySelector('.ovlist');
    var o = { screens: +(list.scrollHeight / w.innerHeight).toFixed(2), visRows: vis(),
      drawerW: Math.round(c.querySelector('.ovbox').getBoundingClientRect().width),
      fitsViewport: c.querySelector('.ovbox').getBoundingClientRect().width <= w.innerWidth };
    var s = d.getElementById('ovSearch');
    s.value = '哈夫'; s.dispatchEvent(new w.Event('input', { bubbles: true }));
    o.afterSearch = vis();
    var pre = document.createElement('pre');
    pre.textContent = 'PROBE:' + JSON.stringify(o);
    document.body.appendChild(pre);
  }, 700);
}, 1500);
`;

function measureCatalog(hash) {
  const html = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#888}iframe{border:0;background:#fff}</style></head><body>' +
    '<iframe id="f" src="m.html' + hash + '" style="width:390px;height:844px"></iframe>' +
    '<script>var f=document.getElementById("f");' + CAT + '<\/script></body></html>';
  const hp = path.join(tmp, 'cat.html');
  fs.writeFileSync(hp, html, 'utf8');
  const r = cp.spawnSync(edge, ['--headless=new', '--disable-gpu', '--user-data-dir=' + PROFILE, '--allow-file-access-from-files',
    '--hide-scrollbars', '--window-size=500,900', '--virtual-time-budget=12000',
    '--dump-dom', 'file:///' + hp.replace(/\\/g, '/')], { encoding: 'utf8', timeout: 90000 });
  const m = /PROBE:(\{[^<]*)/.exec(r.stdout || '');
  return m ? JSON.parse(m[1]) : null;
}

{
  const o = measureCatalog('#m=heapSort');
  if (!o) t('目录页: 量测成功', false, '探针无输出');
  else {
    t('目录页: 默认不超 1.5 屏', o.screens <= 1.5, o.screens);
  t('目录页: 抽屉不超出视口宽度', o.fitsViewport === true, { drawerW: o.drawerW });
    t('目录页: 搜索能真正过滤（渲染后只剩 1 行）', o.afterSearch === 1, { before: o.visRows, after: o.afterSearch });
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log('  手机视口小计: 通过 ' + pass + '，失败 ' + fail);
process.exit(fail ? 1 : 0);
