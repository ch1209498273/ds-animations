# -*- coding: utf-8 -*-
"""把 src 下的样式/引擎/模块内联合并，产出单文件 HTML（带构建时间戳版本徽标）。"""
import pathlib
import time

root = pathlib.Path(__file__).resolve().parent.parent   # 互动课件/
src = root / 'src'

css = (src / 'core' / 'style.css').read_text(encoding='utf-8')
core = (src / 'core' / 'engine.js').read_text(encoding='utf-8')

mods = []
for p in sorted(src.rglob('*.js')):
    if p.name == 'engine.js':
        continue
    rel = p.relative_to(src)
    mods.append('/* ==================== {} ==================== */\n{}'.format(rel.as_posix(), p.read_text(encoding='utf-8')))

tpl = (src / 'index.template.html').read_text(encoding='utf-8')
stamp = 'v2.0 · 构建 ' + time.strftime('%Y-%m-%d %H:%M')
html = (tpl.replace('/*__CSS__*/', css)
           .replace('//__CORE__', core)
           .replace('//__MODULES__', '\n\n'.join(mods))
           .replace('__BUILD__', stamp))

out_dir = root / 'dist'
out_dir.mkdir(exist_ok=True)
out = out_dir / '数据结构互动课件.html'
out.write_text(html, encoding='utf-8')
print('built:', out, '({:,} chars)'.format(len(html)), '｜', stamp)
