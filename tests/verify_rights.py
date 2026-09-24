# -*- coding: utf-8 -*-
"""版权校验：查一份副本是不是我的、有没有被改动过。

    python tests/verify_rights.py                      # 查本地构建产物（自动读 src/.rights.key）
    python tests/verify_rights.py 那份.html             # 查任意一份/多份
    python tests/verify_rights.py --key <私钥> 那份.html  # 在别人机器上查时手动带私钥

两层判据：
  完整性  文件里那条 sha256 是"本文件自己的哈希"（约定：把那 64 位还原成
          __SELFHASH__ 再复算）。改一个字节就对不上。
  出处    CSS 里一枚 FIXED 出处记号 + 三处 ck 暗记。ck = SHA-256(私钥 + 定稿前文本)，
          没有私钥的人算不出同一个值；FIXED 不依赖文件完整性，删了版权声明也还在。
"""
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
META = re.compile(r'<meta name="x-rights" content="([^"]*)"')
DECL = re.compile(r'sha256=([0-9a-f]{64})')
CKS = [re.compile(r'<html lang="zh-CN" data-b="([0-9a-f]{20})">'),
       re.compile(r'<meta name="generator" content="dsck/1\.0 \(([0-9a-f]{20})\)">')]
FIXED = re.compile(r'--ds-ck:"([0-9a-f]{12})"')


def load_key(argv):
    for i, a in enumerate(argv):
        if a == '--key' and i + 1 < len(argv):
            return argv[i + 1], argv[:i] + argv[i + 2:]
    kf = ROOT / 'src' / '.rights.key'
    return (kf.read_text(encoding='utf-8').strip() if kf.exists() else ''), argv


def check(text, key):
    """返回 (等级, 说明)。等级：OK / WARN（能认出处但验不了完整）/ FAIL"""
    m = META.search(text)
    fields = dict(kv.split('=', 1) for kv in m.group(1).split(';') if '=' in kv) if m else {}
    tag = '{} {} {} {}'.format(fields.get('author', '作者未知'), fields.get('ver', '?'),
                               fields.get('license', '协议被删'), fields.get('built', '?'))
    d = DECL.search(text)
    fixed = hashlib.sha256((key + '|dsck-provenance|').encode('utf-8')).hexdigest()[:12] if key else ''
    obs_fixed = FIXED.search(text)
    cks = [r.search(text).group(1) for r in CKS if r.search(text)]
    proven = bool(obs_fixed and obs_fixed.group(1) == fixed) or (
        bool(cks) and key and all(c == expect_ck(text, key, c, fixed) for c in cks))
    if not key:
        if not m or not d:
            return 'FAIL', '缺署名元信息或自校验哈希，且本机没有私钥可查暗记'
        if d.group(1) != hashlib.sha256(
                text.replace('sha256=' + d.group(1), 'sha256=__SELFHASH__').encode('utf-8')).hexdigest():
            return 'FAIL', '内容被改动过（哈希不吻合）｜' + tag
        return 'WARN', '完整性吻合，但没带私钥，无法证明出处｜' + tag
    if not proven:
        return 'FAIL', '查不到我的暗记（不是我的构建产物，或暗记已被剥离）｜' + tag
    if not d:
        return 'WARN', '出处可认（' + str(len(cks) + 1) + ' 处暗记）但自校验声明被删，无法判完整性'
    ok = d.group(1) == hashlib.sha256(
        text.replace('sha256=' + d.group(1), 'sha256=__SELFHASH__').encode('utf-8')).hexdigest()
    where = '出处记号 1 + 暗记 ' + str(len(cks))
    return ('OK', '一致｜' + tag + '｜' + where) if ok else \
        ('FAIL', '内容被改动过｜出处是我的，但哈希不吻合｜' + tag)


def expect_ck(text, key, observed, fixed):
    """按构建时的顺序反推：还原自校验哈希占位 → 还原 ck 与 FIXED 占位 → 复算。"""
    d = DECL.search(text)
    t = text.replace('sha256=' + d.group(1), 'sha256=__SELFHASH__') if d else text
    t = t.replace(observed, '__CK__')
    if fixed:
        t = t.replace(fixed, '__FIXED__')
    return hashlib.sha256((key + t).encode('utf-8')).hexdigest()[:20]


def targets(argv):
    if argv:
        return [pathlib.Path(a) for a in argv]
    out = []
    for base in (ROOT, ROOT / 'dist', ROOT / 'gitee-pages'):
        for name in ('index.html', '数据结构互动课件.html'):
            p = base / name
            if p.exists():
                out.append(p)
        ad = base / 'a'
        if ad.is_dir():
            out += sorted(ad.glob('*.html'))
    return out


def main():
    key, argv = load_key(sys.argv[1:])
    ts = targets(argv)
    if not ts:
        print('没有可查的文件（先 python src/build.py，或把副本路径作为参数传进来）')
        return 0
    bad = 0
    for p in ts:
        try:
            text = p.read_text(encoding='utf-8')
        except Exception as e:
            print('[FAIL] {} :: 读不了 {}'.format(p.name, str(e)[:40]))
            bad += 1
            continue
        lvl, msg = check(text, key)
        print('[{}] {} :: {}'.format(lvl, p.name, msg))
        bad += 1 if lvl == 'FAIL' else 0
    print('合计 {} 份，异常 {} 份｜私钥 {}'.format(len(ts), bad, '已载入' if key else '未提供'))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
