// Execute: node tests/validar-codigo.cjs. Sem rede, API, banco ou execução n8n.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const meta=JSON.parse(fs.readFileSync(path.join(__dirname,'inventario-codigo.json'),'utf8'));
const results=[];
function test(name,fn){fn();results.push({teste:name,resultado:'passou'});}
function run(name,options={}){
 const e=meta.codes.find(c=>c.name===name),body=fs.readFileSync(path.join(base,e.path),'utf8');
 const context={$json:options.json||{},$input:{all:()=>options.items||[]},$:options.node||(()=>({first:()=>({json:{}})})),$thisRunIndex:options.runIndex||0,items:options.items||[{json:{after:'cursor-demo'}}],$items:options.history||(()=>{throw Error('fim simulado');}),$item:()=>({$node:{'Paginação HubSpot':{json:{paging:{next:{after:'cursor-next'}}}}}}),Date:options.Date||Date,console:{log:()=>{},error:()=>{}}};
 return vm.runInNewContext('(function(){'+body+'})()',context,{timeout:1000});
}
test('Sintaxe dos corpos JavaScript',()=>{for(const e of meta.codes)new Function(fs.readFileSync(path.join(base,e.path),'utf8'));});
test('Estrutura pública e conexões válidas',()=>{
 const text=fs.readFileSync(path.join(base,'workflows/workflow.template.json'),'utf8'),w=JSON.parse(text);
 assert.equal(w.active,false);assert.deepEqual(w.pinData,{});assert.equal(w.nodes.length,meta.total);assert.equal(w.nodes.filter(n=>n.disabled).length,meta.disabled);assert.equal(w.nodes.filter(n=>n.credentials).length,0);
 const names=new Set(w.nodes.map(n=>n.name));for(const [source,groups]of Object.entries(w.connections)){assert.ok(names.has(source));for(const outputs of Object.values(groups))for(const links of outputs)for(const link of links)assert.ok(names.has(link.node),link.node);}
 for(const n of w.nodes.filter(n=>/gmail|httpRequest|hubspot|webhook|scheduleTrigger|\.cron$/.test(n.type)))assert.equal(n.disabled,true,n.name);
 assert.equal(/pat-[A-Za-z0-9_-]{10,}|AIza[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]{15,}\./.test(text),false);
});

test('Extrai remetente em Nome <email> e preserva dados',()=>{
 const out=run('Code',{items:[{json:{From:'Pessoa Demo <pessoa@cliente-a.example>',Subject:'Solicitação Demo',id:'email-demo'}}]});assert.equal(out[0].json.senderEmail,'pessoa@cliente-a.example');assert.equal(out[0].json.matched,true);assert.equal(out[0].json.id,'email-demo');
});
test('Aceita segundo domínio demonstrativo e endereço direto',()=>{assert.equal(run('Code',{items:[{json:{From:'pessoa@cliente-b.example'}}]})[0].json.matched,true);});
test('Rejeita domínio fora da lista e trata ausência de From',()=>{
 const out=run('Code',{items:[{json:{From:'pessoa@outro.example'}},{json:{}}]});assert.ok(out.every(x=>x.json.matched===false));assert.equal(out[1].json.senderEmail,'');
});
test('Comparação preserva a distinção de caixa do original',()=>{assert.equal(run('Code',{items:[{json:{From:'Pessoa@CLIENTE-A.EXAMPLE'}}]})[0].json.matched,false);});

const report={escopo:'Testes locais de JavaScript e estrutura JSON, sem n8n ou sistemas reais',total:results.length,testes:results};
fs.writeFileSync(path.join(__dirname,'resultados-testes.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
