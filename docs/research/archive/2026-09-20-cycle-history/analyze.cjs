'use strict';
// Research artifact only; reads inputs and writes a dataset only with --out.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).trim();
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const walk=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isSymbolicLink()?[]:e.isDirectory()?walk(d+'/'+e.name):[d+'/'+e.name]);
const clean=s=>s.replace(/[*\x60]/g,'').trim();
const field=(lines,name)=>{for(let i=0;i<lines.length;i++){const m=clean(lines[i]).match(new RegExp('^(?:-\\s+)?'+name+'\\s*:\\s*(.*)$','i'));if(m)return {line:i+1,value:m[1]};}return null;};
const inputs=walk('docs/reviews').filter(p=>p.endsWith('.md')&&!path.basename(p).startsWith('2026-09-20-codex-cycle-')).sort();
const rows=inputs.map(p=>{const raw=fs.readFileSync(path.join(root,p)),text=raw.toString('utf8').replace(/\r\n/g,'\n'),lines=text.trimEnd().split('\n');return {path:p,sha256:hash(raw),bytes:raw.length,lines:lines.length,reviewer:field(lines,'Reviewer'),verdict:field(lines,'Verdict'),mode:field(lines,'Mode'),baseline:field(lines,'Reviewed commit'),urlCount:(text.match(/https?:\/\/[^\s)>]+/g)||[]).length};});
const exact=['PASS','FAIL','BLOCKED','RECOMMENDATION'];
const verdictRows=rows.filter(r=>r.verdict);
const lengths=rows.map(r=>r.lines).sort((a,b)=>a-b);
const sizeStats={medianLines:lengths[Math.floor((lengths.length-1)*.5)],p90Lines:lengths[Math.floor((lengths.length-1)*.9)],over250:rows.filter(r=>r.lines>250).length,totalLines:lengths.reduce((a,b)=>a+b,0),totalBytes:rows.reduce((a,b)=>a+b.bytes,0)};
const histogram={};for(const r of verdictRows){const v=r.verdict.value;histogram[v]=(histogram[v]||0)+1;}
const cohorts=[['v1.9.3',8,4],['v1.9',5,1],['v1.9.4',3,2],['paired-cycle',3,2],['v1.9.5 certification',5,4],['Track C/H1',3,1]];
function comb(n,k){if(k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v;}
function series(c){return [1,2,3,4].map(k=>{const eligible=c.filter(([,n])=>n>=k);return {k,eligible:eligible.map(([name])=>name),miss:eligible.reduce((s,[,n,m])=>s+comb(m,k)/comb(n,k),0)/eligible.length};});}
const secondary=['.ai/ARCHIVE.md','.ai/DECISIONS.md','docs/decisions/REGISTRY.md','.ai/PLAN.md','.ai/TASK.md'];
const ledgers=secondary.map(p=>({path:p,sha256:hash(fs.readFileSync(path.join(root,p)))}));
const archive=read('.ai/ARCHIVE.md'),decisions=read('.ai/DECISIONS.md'),registry=read('docs/decisions/REGISTRY.md');
const journalPaths=walk('.ai/worklog').filter(p=>p.endsWith('.md')&&!p.endsWith('/README.md'));
const transitions=[['v1.9.3','FAIL','FAIL'],['P2','FAIL','CONDITIONAL'],['P5','PASS','CONDITIONAL'],['A2','PASS','CORRECTION REQUIRED'],['A3','FAIL','PASS'],['A5b','PASS','PASS'],['C1','PASS','PASS'],['course correction','FAIL','RECOMMENDATION'],['closure','FAIL','PASS'],['Wave A','FAIL','PASS'],['paired remediation','PASS','FAIL'],['MCP','RECOMMENDATION','RECOMMENDATION']];
const out={schema:1,createdUTC:new Date().toISOString(),head:git('rev-parse','HEAD'),dirty:true,
method:{inventory:'All review .md including INDEX; excludes this study codex-cycle-* outputs. First anchored field anywhere after removing Markdown * and backticks; not a certification parser. No model ranking or defect-recall estimator.',
cohorts:'Counts transcribed from Claude table for arithmetic sensitivity ONLY; cohort memberships and shared snapshot were not supplied. miss means fraction of subsets with no blocking verdict, not missed confirmed defects.',
transitions:'Claude 12-row table normalized PASS (+doc)->PASS, annotations removed. Same-verdict content changes not counted as changed verdict.',
snapshot:'File SHA256 values identify exact read inputs. Dirty HEAD alone cannot reproduce these files.'},
counts:{markdownFiles:rows.length,excludingIndex:rows.filter(r=>path.basename(r.path)!=='INDEX.md').length,verdictFields:verdictRows.length,reviewerFields:rows.filter(r=>r.reviewer).length,modeFields:rows.filter(r=>r.mode).length,
exactVerdicts:verdictRows.filter(r=>exact.includes(r.verdict.value)).length,verdictWithExplanationsOrNonstandard:verdictRows.filter(r=>!exact.includes(r.verdict.value)).length,
archiveDatedEntries:(archive.match(/^## \d{4}-\d{2}-\d{2}\b/gm)||[]).length,decisionBlocks:(decisions.match(/^### (?:PROTO-)?DEC-\d+\s*$/gm)||[]).length,
registryRows:(registry.match(/^\|\s*(?:PROTO-)?DEC-\d+\s*\|/gm)||[]).length,journals:journalPaths.length,commits:Number(git('rev-list','--count','HEAD')),documentsWithURLs:rows.filter(r=>r.urlCount).length},
claudeArithmetic:{cohorts,pooledBlocking:13/27,changingCohorts:series(cohorts),fixedCohorts:series(cohorts.filter(([,n])=>n>=4)),transitions,changedVerdicts:transitions.filter(([,a,b])=>a!==b).length},
histogram,sizeStats,ledgers,rows};
for(const r of [...rows,...ledgers])if(hash(fs.readFileSync(path.join(root,r.path)))!==r.sha256)throw Error('Input moved during collection: '+r.path);
if(process.argv.includes('--out')){const idx=process.argv.indexOf('--out');fs.writeFileSync(path.resolve(root,process.argv[idx+1]),JSON.stringify(out,null,2)+'\n');}
console.log(JSON.stringify({counts:out.counts,sizeStats,claudeArithmetic:out.claudeArithmetic,histogram},null,2));
