/* 临时：把两个新模块的帧逐条打印出来核对逻辑（只读，不入库） */
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

const which = process.argv[2] || 'ufset';
const vals = defVals(which);
if (process.argv[3]) {
  process.argv.slice(3).forEach(kv => { const i = kv.indexOf('='); vals[kv.slice(0, i)] = kv.slice(i + 1); });
}
const res = M[which].run(vals);
console.log('输入:', JSON.stringify(vals));
res.frames.forEach((f, i) => {
  console.log('\n#' + (i + 1) + ' line=' + JSON.stringify(f.line));
  console.log('  msg: ' + f.msg);
  console.log('  panel: ' + JSON.stringify(f.panel));
  console.log('  snap: ' + JSON.stringify(f.snap));
});
