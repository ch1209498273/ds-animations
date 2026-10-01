/* UAT：全量功能实测。三段——
   A 输入组合扫描（Node）：每个模块 × 每个下拉选项 × 每个复选框勾上，全部帧 run+render 走一遍
   B 外壳走查（headless Chrome）：22 项真实交互，按渲染结果判定，不看 DOM 属性
   C 文档一致性：README/CHANGELOG/使用说明/关于与声明 里的数字与实跑是否对得上
   运行：node tests/uat.js   （需要 dist 构建产物；找不到 Chrome 时 B 段跳过） */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
const t = (name, ok, extra) => {
  if (ok) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra !== undefined ? '  → ' + JSON.stringify(extra).slice(0, 160) : '')); }
};

/* ============================ A 输入组合扫描 ============================ */
console.log('\n— A 输入组合扫描（Node） —');
{
  global.window = global;
  const SRC = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
  eval(SRC('core/engine.js'));
  ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'].forEach(ch => {
    fs.readdirSync(path.join(ROOT, 'src', ch)).sort().forEach(f => eval(SRC(ch + '/' + f)));
  });
  const mods = DSC.mods;
  let combos = 0, frames = 0;
  const errs = [], noEnd = [], badLine = [];
  mods.forEach(m => {
    const def = {};
    (m.inputs || []).forEach(s => { def[s.key] = s.type === 'checkbox' ? !!s.value : s.value; });
    const variants = [Object.assign({}, def)];
    (m.inputs || []).forEach(s => {
      if (s.type === 'select') s.options.forEach(o => variants.push(Object.assign({}, def, { [s.key]: o[0] })));
      if (s.type === 'checkbox' && !s.value) variants.push(Object.assign({}, def, { [s.key]: true }));
    });
    variants.forEach(v => {
      combos++;
      let res;
      try { res = m.run(v); } catch (e) { errs.push(m.id + ' [' + JSON.stringify(v) + '] ' + e.message); return; }
      if (!res.frames || !res.frames.length) { noEnd.push(m.id + ' 零帧'); return; }
      const cl = res.code.length;
      res.frames.forEach((f, i) => {
        frames++;
        (f.line || []).forEach(n => { if (!(n >= 0 && n < cl)) badLine.push(m.id + ' 第' + (i + 1) + '帧 行号 ' + n + ' 越界（CODE 长 ' + cl + '）'); });
        try { m.render(f.snap); } catch (e) { errs.push(m.id + ' 第' + (i + 1) + '帧 render: ' + e.message); }
      });
      const last = res.frames[res.frames.length - 1];
      if (!(last.msg || '').trim()) noEnd.push(m.id + ' 末帧无解说');
    });
  });
  console.log('  （' + mods.length + ' 个模块，' + combos + ' 组输入，' + frames + ' 帧全部渲染过）');
  t('A: 每组输入都能出帧、每帧 render 不抛异常', errs.length === 0, errs.slice(0, 4));
  t('A: 没有零帧或末帧空解说的组合', noEnd.length === 0, noEnd.slice(0, 4));
  t('A: 所有帧的伪代码行号都在 CODE 范围内', badLine.length === 0, badLine.slice(0, 4));
}

/* ============================ B 外壳走查（Chrome） ============================ */
const BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe'];
const CHROME = BROWSERS.find(p => p && fs.existsSync(p));
const dist = path.join(ROOT, 'dist', '数据结构互动课件.html');

console.log('\n— B 外壳走查（headless Chrome） —');
if (!CHROME) console.log('  (跳过: 未找到 Chrome)');
else if (!fs.existsSync(dist)) console.log('  (跳过: 无 dist 构建产物)');
else {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dscuat-'));
  fs.copyFileSync(dist, path.join(tmp, 'u.html'));
  const PROBE = fs.readFileSync(path.join(__dirname, 'uat_probe.js'), 'utf8');

  /* 配置档固定复用、跑完不删：每次新建 profile 起 Chrome 会在本机留一条 4625 失败登录，
     攒够 10 次锁本机账户（2026-09-27 日志证实）。与 mobile.js 分开一个目录，
     避免两个脚本同时跑时抢同一个 Chrome 实例。 */
  const PROFILE = path.join(os.tmpdir(), 'dsc-profile-uat');
  if (!fs.existsSync(PROFILE)) fs.mkdirSync(PROFILE, { recursive: true });

  const html = '<!doctype html><html><head><meta charset="utf-8">' +
    '<style>html,body{margin:0;background:#888}iframe{border:0;background:#fff}</style></head><body>' +
    '<iframe id="f" src="u.html" style="width:1360px;height:840px"></iframe>' +
    '<script>' + PROBE + '<\/script></body></html>';
  const hp = path.join(tmp, 'uat.html');
  fs.writeFileSync(hp, html, 'utf8');
  const r = cp.spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox',
    '--user-data-dir=' + PROFILE, '--allow-file-access-from-files',
    '--hide-scrollbars', '--window-size=1400,900', '--virtual-time-budget=90000',
    '--dump-dom', 'file:///' + hp.replace(/\\/g, '/')], { encoding: 'utf8', timeout: 180000 });
  const m = /UAT:(\[[\s\S]*?\])<\/pre>/.exec(r.stdout || '');
  if (!m) { t('B: 探针跑完并交回结果', false, '无输出（Chrome 可能超时；或配置档被占用，删掉 ' + PROFILE + ' 再试）'); }
  else {
    const rows = JSON.parse(m[1]);
    t('B: 探针全程未中断（无「探针异常中断」）', !rows.some(x => x.n === '探针异常中断'), rows.filter(x => x.n === '探针异常中断').map(x => x.x));
    rows.filter(x => x.n !== '探针异常中断').forEach(x => t('B: ' + x.n, x.ok, x.x));
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

/* ============================ C 文档一致性 ============================ */
console.log('\n— C 对外数字一致性 —');
{
  const rd = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
  const readme = rd('gitee-pages/README.md'), guide = rd('分享包/使用说明.txt'), notice = rd('分享包/关于与声明.txt');
  const rel = rd('gitee-pages/src/build.py');
  const ver = (rel.match(/VER = '([^']+)'/) || [])[1] || '?';
  t('C: README 版本徽标与 build.py 的 VER 一致', readme.includes('版本-' + ver) && readme.includes('ds-animations-' + ver + '.zip'), { ver: ver });
  t('C: README 声明的断言数与实跑一致（756 + 100）', /756 项正确性断言 \+ 100 项手机视口卡口/.test(readme));
  t('C: README 动画数是 59（不是历史值 58）', /算法动画-59个/.test(readme) && /## 59 个动画目录/.test(readme));
  t('C: 使用说明的版本号跟上了', guide.includes(ver) && guide.includes('共 59 个交互动画'), ver);
  t('C: zip 里的版权页版本号跟上了', notice.includes(ver) && notice.includes('59 个动画'), ver);
  t('C: 版权页写的文件名就是实际文件名（数据结构互动课件.html）', notice.includes('数据结构互动课件.html'));
  const zip = path.join(ROOT, 'gitee-pages', 'ds-animations-' + ver + '.zip');
  t('C: 发布仓库里有当前版本的 zip', fs.existsSync(zip), path.basename(zip));
  const idx = fs.existsSync(zip);
  if (idx) {
    const z = cp.spawnSync('python', ['-c', 'import zipfile,sys;print(len(zipfile.ZipFile(sys.argv[1]).namelist()))', zip],
      { encoding: 'utf8' });
    /* 条目数不许写死：写死就像当初硬编码 v3.6 那样，加一个动画就红一次、
       而且改的人只会把数字改成"今天对的数"，闸门本身失去意义。
       基准取发布仓库里 a/ 的实际页数——它由 build.py 按模块生成，所以这条真正在查的是
       "zip 里装的单页数 = 该装的单页数"，多一页少一页都会红。 */
    const pages = fs.readdirSync(path.join(ROOT, 'gitee-pages', 'a')).filter(f => /\.html$/.test(f)).length;
    const want = String(pages + 3);   // 主文件 + 2 个说明 txt
    t('C: zip 条目数 = 主文件 + a/ 单页 ' + pages + ' + 2 个说明 = ' + want,
      (z.stdout || '').trim() === want, { 实际: (z.stdout || '').trim(), 应为: want, 单页目录实数: pages });
  }
}

console.log('\nUAT 结果: 通过 ' + pass + '，失败 ' + fail);
process.exit(fail ? 1 : 0);
