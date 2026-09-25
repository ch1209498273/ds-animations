/* UAT 探针（在宿主页面里跑，操作的是 iframe 内的课件）。
   由 tests/uat.js 读进来注入，单独放一个文件是为了能被 node --check、也方便改。
   约定：每条检查用 rec(名字, 通过?, 详情) 记账，最后把结果写进 <pre id="UATOUT">。 */
(async function () {
  var R = [], d = null, w = null;
  function rec(n, ok, x) { R.push({ n: n, ok: !!ok, x: x === undefined ? '' : String(x).slice(0, 100) }); }
  function el(i) { return d.getElementById(i); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function pos() { return el('pos').textContent.trim(); }
  function total() { var m = /(\d+)\s*\/\s*(\d+)/.exec(pos()); return m ? +m[2] : 0; }
  function key(k) { d.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true })); }
  try {
    var f = document.getElementById('f');
    /* 每次轮询都重取 contentDocument：iframe 导航完成前拿到的是那个会被替换掉的空文档 */
    for (var tries = 0; tries < 120; tries++) {
      d = f.contentDocument; w = f.contentWindow;
      if (d && d.getElementById && d.getElementById('pos') && d.querySelector('#canvas svg')) break;
      await sleep(100);
    }
    if (!d || !d.getElementById('pos')) { rec('探针没等到外壳就绪', false, 'iframe 里始终没有 #pos'); throw new Error('外壳未就绪'); }

    /* 1 首屏 */
    rec('首屏：画布有 svg、帧号是 n / N、标题下有常驻说明、引导默认收起',
      !!d.querySelector('#canvas svg') && /^\d+ \/ \d+$/.test(pos()) && el('modaim').textContent.length > 8 && el('guide').hidden === true,
      'pos=' + pos() + ' aim=' + el('modaim').textContent.slice(0, 18));

    /* 2-3 翻页 */
    var p0 = pos(); el('btnNext').click(); await sleep(150); var p1 = pos();
    rec('下一步：帧号前进且解说非空', p1 !== p0 && el('msg').textContent.length > 4, p0 + ' → ' + p1);
    el('btnPrev').click(); await sleep(150);
    rec('上一步：帧号退回', pos() === p0, pos());

    /* 4 自动播放（普通帧停 1.1~2.2s，节拍帧再多停 1.2s，所以等 4.5s） */
    el('btnPlay').click(); await sleep(4500); var p2 = pos(); el('btnPlay').click();
    rec('自动播放：不点按钮也会自己往前走', p2 !== p1, p1 + ' → ' + p2);

    /* 5 变速 */
    var sp = el('speed'); sp.value = '4'; sp.dispatchEvent(new w.Event('change', { bubbles: true }));
    var p3 = pos(); el('btnPlay').click(); await sleep(1200); var p4 = pos(); el('btnPlay').click();
    rec('变速 4× 仍然推进（不卡死）', p4 !== p3, p3 + ' → ' + p4);
    sp.value = '1'; sp.dispatchEvent(new w.Event('change', { bubbles: true }));

    /* 6 进度条 */
    var sk = el('seek'); sk.value = String(Math.floor(total() / 2)); sk.dispatchEvent(new w.Event('input', { bubbles: true }));
    await sleep(200);
    rec('进度条拖到中间：帧号落到一半', parseInt(pos(), 10) === Math.floor(total() / 2) + 1, pos() + ' / ' + total());

    /* 7 键盘 */
    key('End'); await sleep(150); var e1 = pos();
    key('Home'); await sleep(150); var h1 = pos();
    key('PageDown'); await sleep(150); var pg = pos();
    rec('键盘 End/Home 跳到末帧与首帧', parseInt(e1, 10) === total() && h1.indexOf('1') === 0, e1 + ' | ' + h1);
    rec('PageDown 按节拍跳（跳过普通帧）', parseInt(pg, 10) > 1, pg);

    /* 8 缩放 */
    var z0 = el('zoomLv').textContent; el('btnZoomIn').click(); el('btnZoomIn').click(); await sleep(200);
    var z1 = el('zoomLv').textContent; el('btnZoomFit').click(); await sleep(200); var z2 = el('zoomLv').textContent;
    rec('缩放：+ 两档变大、点「适配」回到 100%', parseInt(z1) > parseInt(z0) && z2.indexOf('100') === 0, z0 + '→' + z1 + '→' + z2);

    /* 9 平移 */
    el('btnZoomIn').click(); el('btnZoomIn').click(); el('btnZoomIn').click(); el('btnZoomIn').click(); await sleep(250);
    var st = el('stage'); st.scrollLeft = 0; st.scrollTop = 0; await sleep(100);
    var sx = st.scrollWidth, cx = st.clientWidth;
    function pev(type, x, y) { st.dispatchEvent(new w.PointerEvent(type, { bubbles: true, pointerId: 1, clientX: x, clientY: y, buttons: 1 })); }
    pev('pointerdown', 600, 400); pev('pointermove', 520, 400); pev('pointerup', 520, 400);
    await sleep(150);
    rec('放大后可以拖动画面（平移生效）', sx > cx && st.scrollLeft > 0, '可滚 ' + sx + ' 视口 ' + cx + ' scrollLeft=' + st.scrollLeft);
    el('btnZoomFit').click(); await sleep(150);

    /* 10-11 自定义数据与重置（文本框走 change，不在每次击键上重跑） */
    w.location.hash = '#m=hashLinear'; await sleep(1100);
    var inp = d.querySelector('#inputs input[type=text]');
    var old = inp.value, tot0 = total();
    inp.value = '5,7,11'; inp.dispatchEvent(new w.Event('change', { bubbles: true })); await sleep(700);
    var tot1 = total();
    rec('改数据会真的重演（帧数随数据变）', tot1 !== tot0 && tot1 > 3, tot0 + ' → ' + tot1);
    el('btnReset').click(); await sleep(700);
    /* 实测行为：「⟲ 重置」只把画面倒回第 1 帧，不动你输入的数据（按钮无 tooltip，语义含糊，
       已作为 UAT 发现上报）。这里按实际行为断言，不擅自改成"应该怎样"。 */
    rec('点「重置」回到第 1 帧，且不改你输入的数据',
      parseInt(pos(), 10) === 1 && total() === tot1 && inp.value === '5,7,11', pos() + ' 帧数 ' + total());

    /* 12-13 非法输入 */
    inp.value = 'abc'; inp.dispatchEvent(new w.Event('change', { bubbles: true })); await sleep(700);
    var errTxt = (el('msg').textContent || '') + ' | ' + (el('pos').textContent || '');
    rec('非法输入给出可见的「输入有误」，画面不是一片空白', /有误|不合法|请输入/.test(errTxt), errTxt.slice(0, 70));
    inp.value = old; inp.dispatchEvent(new w.Event('change', { bubbles: true })); await sleep(700);
    rec('改回合法值后画面自己恢复（错误态不会卡住）', /^\d+ \/ \d+$/.test(pos()) && total() > 10, pos());

    /* 14-15 引导 */
    var sw0 = el('stage').offsetWidth;
    el('btnGuide').click(); await sleep(300);
    var g = el('guide'), gr = g.getBoundingClientRect(), sr = el('stage').getBoundingClientRect();
    var overlap = !(gr.right < sr.left + 2 || gr.left > sr.right - 2 || gr.bottom < sr.top + 2 || gr.top > sr.bottom - 2);
    var fsz = parseFloat(w.getComputedStyle(d.querySelector('.guidebox li')).fontSize);
    rec('引导：点开占右列、画面宽度未变、与画面零重叠、字号≥14px',
      !g.hidden && el('stage').offsetWidth === sw0 && !overlap && fsz >= 14,
      'stage ' + sw0 + '→' + el('stage').offsetWidth + ' 重叠 ' + overlap + ' 字号 ' + fsz);
    el('btnGuideX').click(); await sleep(250);
    rec('引导：点 ✕ 收起', g.hidden === true);

    /* 16-19 目录 */
    el('btnCatalog').click(); await sleep(800);
    var cat = el('catalog'); var rows = cat.querySelectorAll('.ovrow');
    el('ovAll').click(); await sleep(400);
    var vis = Array.prototype.filter.call(rows, function (r) { return r.offsetHeight > 0; }).length;
    rec('目录：能打开，全部展开后能看到 58 条', vis === 58, vis);
    var s = el('ovSearch'); s.value = '散列 冲突'; s.dispatchEvent(new w.Event('input', { bubbles: true })); await sleep(350);
    var hit = Array.prototype.filter.call(rows, function (r) { return r.offsetHeight > 0; });
    rec('目录搜索：空格分词求交（「散列 冲突」命中 2 条）', hit.length === 2, hit.map(function (r) { return r.dataset.id; }).join(','));
    s.value = 'zzz不存在'; s.dispatchEvent(new w.Event('input', { bubbles: true })); await sleep(300);
    rec('目录搜索：无结果时给出「没有匹配」提示', el('ovNone').hidden === false);
    s.value = '哈夫'; s.dispatchEvent(new w.Event('input', { bubbles: true })); await sleep(300);
    var one = Array.prototype.filter.call(rows, function (r) { return r.offsetHeight > 0; })[0];
    var nm0 = el('modname').textContent; one.click(); await sleep(1000);
    rec('目录：点一行真的切到那个动画', /哈夫曼/.test(el('modname').textContent) && el('modname').textContent !== nm0, el('modname').textContent);

    /* 20 二维码 */
    el('btnCatalog').click(); await sleep(700);
    var cat2 = el('catalog');
    var qrBtn = cat2 && cat2.querySelector('[data-act="qr"]');
    if (qrBtn) { qrBtn.click(); await sleep(500);
      rec('目录：二维码能弹出且是真图形', !!d.getElementById('qrbox') && !!d.querySelector('#qrbox svg')); }
    else rec('目录：二维码能弹出且是真图形', false, '找不到 ▦ 按钮（切模块后目录会自己关）');

    /* 21 复制链接（降级路径不能卡住） */
    var prompted = false; w.prompt = function () { prompted = true; return ''; };
    var err = null; try { el('btnLink').click(); await sleep(400); } catch (e2) { err = e2.message; }
    rec('复制链接：剪贴板不可用时给出可粘贴框且不报错', !err && (prompted || !!el('toast')), 'prompt=' + prompted);

    /* 22 截图导出 */
    var cap = null, oc = w.HTMLAnchorElement.prototype.click;
    w.HTMLAnchorElement.prototype.click = function () { cap = { href: this.href, name: this.download }; };
    el('btnShot').click(); await sleep(1000);
    rec('截图导出：产出 PNG 数据且文件名带帧号',
      !!cap && /^data:image\/png/.test(cap.href) && /第\d+帧/.test(cap.name || ''),
      cap ? (cap.href.slice(0, 16) + '… ' + cap.name) : '没触发下载');
    w.HTMLAnchorElement.prototype.click = oc;

    /* 23 运行时版权指纹 */
    var svg = d.querySelector('#canvas svg');
    var dr = svg ? svg.getAttribute('data-r') : '', desc = svg ? svg.querySelector('desc') : null;
    rec('运行时版权指纹：画布 svg 带 data-r 与 <desc>，内容是署名',
      /芦老师聊AI/.test(dr || '') && !!desc && /CC BY-NC-SA/.test(desc.textContent || ''), (dr || '').slice(0, 40));

    /* 24 投影 */
    el('btnProj').click(); await sleep(300);
    var proj = d.body.classList.contains('proj'); el('btnProj').click(); await sleep(250);
    rec('投影模式能开关', proj === true && d.body.classList.contains('proj') === false);

    /* 25-27 手机放映 */
    w.location.hash = '#m=heapSort&mp=1'; await sleep(1600);
    var mp = d.body.classList.contains('mp'), arrows = !el('mpPrev').hidden && !el('mpNext').hidden;
    var mpc = el('mpCounter').textContent.trim();
    rec('手机放映深链：打开就是 mp 态、有翻页箭头与帧号', mp && arrows && /\d/.test(mpc), 'mp=' + mp + ' 箭头=' + arrows + ' 计数=' + mpc);
    el('mpPrev').click(); await sleep(300);
    rec('手机放映：‹ 能翻（末帧再翻有边界提示）', el('mpMsg').textContent.length > 2, el('mpMsg').textContent.slice(0, 30));
    el('mpExit').click(); await sleep(500);
    rec('手机放映：退出后回到普通界面', d.body.classList.contains('mp') === false);

    /* 28 章节切换 */
    w.location.hash = '#m=graphBasic'; await sleep(1000);
    var ch3 = d.querySelector('#chapters [data-ch="3"]');
    if (!ch3) throw new Error('章节按钮没找到');
    ch3.click(); await sleep(700);
    rec('章节切换：点第3章后胶囊条换成第3章的动画', /栈|队列|迷宫|表达式/.test(el('modbar').textContent), el('modbar').textContent.slice(0, 40));

    /* 29 深链一次到位 */
    w.location.hash = '#m=hashLinear&w=19%2C14%2C23%2C1%2C68%2C20%2C84%2C27%2C55%2C11&errDel=1&f=5'; await sleep(1400);
    var cb = d.querySelector('#inp_errDel');
    rec('深链：模块+自定义数据+复选框+帧号一次到位',
      /哈希/.test(el('modname').textContent) && !!cb && cb.checked === true && parseInt(el('pos').textContent, 10) === 6,
      el('modname').textContent + ' cb=' + (cb ? cb.checked : '无') + ' pos=' + el('pos').textContent);

    /* 30 错误演示的结论帧在浏览器里真画出来了（f=999 会夹到末帧） */
    w.location.hash = '#m=hashLinear&errDel=1&f=999'; await sleep(1400);
    var lastMsg = el('msg').textContent, lastSvg = d.querySelector('#canvas svg').textContent;
    rec('错误演示：末帧结论与"探测链/删除标记"读出真的画在页面上（不只是 Node 里对）',
      /★|结论/.test(lastMsg) && /删除标记|DELETED|探测链/.test(lastMsg + lastSvg), lastMsg.slice(0, 60));
  } catch (e) {
    R.push({ n: '探针异常中断', ok: false, x: String(e && e.stack ? e.stack : e.message).replace(/\s+/g, ' ').slice(0, 300) });
  }
  var pre = document.createElement('pre'); pre.id = 'UATOUT';
  pre.textContent = 'UAT:' + JSON.stringify(R);
  document.body.appendChild(pre);
})();
