# -*- coding: utf-8 -*-
"""把 src 下的样式/引擎/模块内联合并，产出单文件 HTML（带构建时间戳版本徽标）。
构建时用 terser 压缩 JS（可用则压缩，失败自动回退原始代码）。
同时生成单动画分享页 a/<id>.html（引擎 + 该动画，约 40KB）。"""
import pathlib
import time
import subprocess
import tempfile
import os
import re
import hashlib

root = pathlib.Path(__file__).resolve().parent.parent   # 互动课件/
src = root / 'src'

css = (src / 'core' / 'style.css').read_text(encoding='utf-8')
core = (src / 'core' / 'engine.js').read_text(encoding='utf-8')

mods = []
module_files = []
for p in sorted(src.rglob('*.js')):
    if p.name in ('engine.js', 'qrcode.min.js', '00sortCommon.js'):
        continue
    rel = p.relative_to(src)
    if rel.parts[0] not in ('ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'):
        continue
    module_files.append(p)
    mods.append('/* ==================== {} ==================== */\n{}'.format(rel.as_posix(), p.read_text(encoding='utf-8')))
mods_js = '\n\n'.join(mods)
qrcode_js = (src / 'core' / 'qrcode.min.js').read_text(encoding='utf-8').strip()
sort_common_src = (src / 'ch8' / '00sortCommon.js').read_text(encoding='utf-8')


def terser(code):
    """terser 压缩（默认不重命名顶层标识符，DSC/qrcode 等全局安全）；失败回退原码。"""
    try:
        tmp = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8')
        tmp.write(code)
        tmp.close()
        out = tmp.name + '.min.js'
        r = subprocess.run(['npx', '-y', 'terser', tmp.name, '--compress', '--mangle', '-o', out],
                           capture_output=True, text=True, timeout=120, shell=(os.name == 'nt'))
        if r.returncode == 0 and os.path.exists(out):
            res = pathlib.Path(out).read_text(encoding='utf-8')
            os.unlink(tmp.name)
            os.unlink(out)
            return res
        print('  terser 回退：', (r.stderr or r.stdout or '')[:160])
    except Exception as e:
        print('  terser 回退：', str(e)[:160])
    return code


def min_css(c):
    c = re.sub(r'/\*.*?\*/', '', c, flags=re.S)
    c = re.sub(r'\n\s*', '', c)
    return c.strip()


core_min = terser(core)
mods_min = terser(mods_js)
sort_common_min = terser(sort_common_src)
css_min = min_css(css) + ':root{--ds-ck:"__FIXED__"}'

tpl = (src / 'index.template.html').read_text(encoding='utf-8')
VER = 'v3.7'
NMOD = len(module_files)          # 对外文案里的动画数一律由实际模块数推出，不再手写
stamp = VER + ' · 构建 ' + time.strftime('%Y-%m-%d %H:%M')
RIGHTS = ('author=芦老师聊AI;work=数据结构互动课件;kind=原创算法动画课件;'
          'license=CC BY-NC-SA 4.0;ver=' + VER + ';built=' + time.strftime('%Y-%m-%d %H:%M') +
          ';sha256=__SELFHASH__')


KEY_FILE = src / '.rights.key'
KEY = KEY_FILE.read_text(encoding='utf-8').strip() if KEY_FILE.exists() else ''


def seal(text):
    """两道印记，顺序不能换：
    ① 暗记 ck = SHA-256(私钥 + 定稿前文本) 的前 20 位。它混在看着无害的三处
      （generator 标签、:root 自定义属性、<html data-b>）里，删掉明面上的版权声明也还在，
      而没有 src/.rights.key 的人算不出同一个值——这才是"证明那份是我的"的依据。
    ② 自校验哈希：__SELFHASH__ 换成本文件自己的 SHA-256。
      自引用没法直接算，所以约定：校验时把那 64 位还原成占位符 __SELFHASH__ 再复算。"""
    fixed = hashlib.sha256((KEY + '|dsck-provenance|').encode('utf-8')).hexdigest()[:12] if KEY else ''
    text = text.replace('__FIXED__', fixed)
    if KEY:
        ck = hashlib.sha256((KEY + text).encode('utf-8')).hexdigest()[:20]
    else:
        ck = ''
        print('  警告: 缺 src/.rights.key，本次构建没埋暗记，这份产物无法据此取证')
    text = text.replace('__CK__', ck)
    digest = hashlib.sha256(text.encode('utf-8')).hexdigest()
    return text.replace('sha256=__SELFHASH__', 'sha256=' + digest)


def ledger(main_html):
    """每次构建把主文件指纹记进发布仓库的 RELEASES.md（公开、有 git 时间线可举证）。
    同一版本重复构建只替换那一行，不追加。"""
    body = main_html.encode('utf-8')
    row = '| {} | {} | {} | {:,} |'.format(
        VER, time.strftime('%Y-%m-%d %H:%M'), hashlib.sha256(body).hexdigest(), len(body))
    p = root / 'gitee-pages' / 'RELEASES.md'
    head = ('# 发版台账\n\n'
            '每行是一次构建的主文件指纹。核对某份副本出自哪一次发版：\n\n'
            '`python tests/verify_rights.py 那份.html`\n\n'
            '| 版本 | 构建时间 | 主文件 SHA-256 | 字节 |\n|---|---|---|---|\n')
    rows = []
    if p.exists():
        rows = [x for x in p.read_text(encoding='utf-8').split('\n') if x.startswith('| v')]
    rows = [x for x in rows if not x.startswith('| ' + VER + ' ')]
    rows.append(row)
    rows.sort(key=lambda s: [int(x) for x in s.split('|')[1].strip().lstrip('v').split('.')])
    p.parent.mkdir(exist_ok=True)
    p.write_text(head + '\n'.join(rows) + '\n', encoding='utf-8')
    return p

MAIN_DESC = ('%d 个可交互数据结构算法动画：线性表、栈队列、串数组、树、图、查找、排序全部章节，'
             '教材例题对拍验证，单文件零依赖，点开即用。') % NMOD
MAIN_OGT = '《数据结构》互动课件 —— %d 个算法动画' % NMOD
html = (tpl.replace('/*__CSS__*/', css_min)
           .replace('//__CORE__', core_min + '\n' + qrcode_js + '\n' + sort_common_min)
           .replace('//__MODULES__', mods_min)
           .replace('__DESC__', MAIN_DESC)
           .replace('__OGTITLE__', MAIN_OGT)
           .replace('__RIGHTS__', RIGHTS)
           .replace('__BUILD__', stamp))
html = seal(html)          # 指纹要在全部内容定稿之后再算，否则哈希对不上

out_dir = root / 'dist'
out_dir.mkdir(exist_ok=True)
out = out_dir / '数据结构互动课件.html'
out.write_text(html, encoding='utf-8')
raw = len(css) + len(core) + len(mods_js) + len(qrcode_js)
lp = ledger(html)
print('built:', out, '({:,} chars，压缩前 {:,})'.format(len(html), raw), '｜', stamp)

# ---------- 单动画分享页：a/<id>.html（引擎 + 该动画） ----------
CIRC_RE = re.compile(r'^[①-⑳㉑-㉟㊱-㊺]+\s*')
single_dir = root / 'gitee-pages' / 'a'
single_dir.mkdir(exist_ok=True)
for old in single_dir.glob('*.html'):
    old.unlink()

count = 0
for i, p in enumerate(module_files):
    rel = p.relative_to(src)
    code = p.read_text(encoding='utf-8')
    m_no = i + 1
    mid = re.search(r"DSC\.reg\(\{[\s\S]*?id: *'([^']+)'", code)
    m_id = mid.group(1) if mid else rel.stem
    nm = re.search(r"DSC\.reg\(\{[\s\S]*?name: *'([^']+)'", code)
    disp = str(m_no) + '. ' + CIRC_RE.sub('', nm.group(1) if nm else rel.stem)
    nt = re.search(r"DSC\.reg\(\{[\s\S]*?note: *'([^']+)'", code)
    m_note = nt.group(1) if nt else ''

    page = (tpl.replace('/*__CSS__*/', css_min)
               .replace('__BUILD__', stamp)
               .replace('<title>《数据结构》互动课件</title>', '<title>' + disp + ' · 数据结构动画</title>')
               .replace('__DESC__', m_note + '（数据结构互动课件·单动画页）')
               .replace('__OGTITLE__', disp)
               .replace('__RIGHTS__', RIGHTS))

    scripts = ('<script>window.DSC_SINGLE={no:' + str(m_no) + '};</script>\n'
               '<script>\n' + core_min + '\n' + qrcode_js + '\n'
               + sort_common_min + '\n' + code + '\n</script>')
    page = page.replace('<script>\n//__CORE__\n</script>\n<script>\n//__MODULES__\n</script>', scripts)
    # 每个分享页各自算自己的哈希——被人单独改动某一只动画页时同样能查出来
    (single_dir / (m_id + '.html')).write_text(seal(page), encoding='utf-8')
    count += 1
print('single pages:', count, '→', single_dir)
