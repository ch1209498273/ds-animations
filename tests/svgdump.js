/* 临时：把指定帧的画布导出成独立 SVG，便于真的用眼睛看（用完删） */
'use strict';
const fs = require('fs'), path = require('path');
global.window = global;
const SRC = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
eval(SRC('core/engine.js'));
['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'].forEach(ch => {
  fs.readdirSync(path.join(__dirname, '..', 'src', ch)).sort().forEach(f => eval(SRC(ch + '/' + f)));
});
const DSC = global.DSC;
const M = {}; DSC.mods.forEach(m => M[m.id] = m);
function defVals(id) { const v = {}; (M[id].inputs || []).forEach(s => { v[s.key] = s.type === 'checkbox' ? !!s.value : s.value; }); return v; }

const id = process.argv[2], which = process.argv[3];   // which: 帧号(1起) 或 /正则/
const vals = defVals(id);
process.argv.slice(4).forEach(kv => { const i = kv.indexOf('='); vals[kv.slice(0, i)] = kv.slice(i + 1); });
const res = M[id].run(vals);
const want = /^\d+$/.test(which) ? [+which - 1]
  : res.frames.map((f, i) => i).filter(i => new RegExp(which.slice(1, -1)).test(res.frames[i].msg));
const OUT = 'C:/Users/MR/AppData/Local/Temp/dscshots';
want.forEach(i => {
  const svg = M[id].render(res.frames[i].snap);
  fs.writeFileSync(path.join(OUT, `${id}-${i + 1}.svg`), svg);
  console.log(`${id} #${i + 1}: ${res.frames[i].msg.slice(0, 70)}`);
});
