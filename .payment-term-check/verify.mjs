import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import {parse as parseSfc, compileScript, compileTemplate} from '@vue/compiler-sfc'
import {parse as parseJs} from '@babel/parser'

const target = path.resolve('src/views/system/paymentTerm')
const source = 'D:/erp-cloud-web/src/views/system/paymentTerm'
const files = fs.readdirSync(target, {recursive:true}).filter(name=>name.endsWith('.vue'))
for (const file of files) {
  const filename=path.join(target,file)
  const {descriptor,errors}=parseSfc(fs.readFileSync(filename,'utf8'),{filename})
  assert.equal(errors.length,0,file)
  compileScript(descriptor,{id:file})
  const compiled=compileTemplate({source:descriptor.template.content,filename,id:file})
  assert.equal(compiled.errors.length,0,`${file}: ${compiled.errors}`)
  const ast=parseJs(descriptor.script.content,{sourceType:'module'})
  for (const node of ast.program.body.filter(n=>n.type==='ImportDeclaration')) {
    const name=node.source.value
    if (!name.startsWith('.') && !name.startsWith('@/')) continue
    const resolved=name.startsWith('@/')?path.resolve('src',name.slice(2)):path.resolve(path.dirname(filename),name)
    assert.ok(['','.js','.vue','/index.js','/index.vue'].some(ext=>fs.existsSync(resolved+ext)),`${file}: ${name}`)
  }
}
console.log(`PASS: ${files.length} Vue SFCs compile and local imports resolve`)

function loadOptions(base,file) {
  const {descriptor}=parseSfc(fs.readFileSync(path.join(base,file),'utf8'))
  const script=descriptor.script.content
  const ast=parseJs(script,{sourceType:'module'})
  let code=script
  ast.program.body.filter(n=>n.type==='ImportDeclaration').reverse().forEach(n=>{code=code.slice(0,n.start)+code.slice(n.end)})
  code=code.replace('export default','module.exports =')
  const api=[]
  const messages=[]
  const context={module:{exports:{}},pageMixin:{},stageDragMixin:{},SystemOperationLogTable:{},addStageFormDlg:{},formDirtyClass:{routeStatusData:{}},Date,JSON,
    submitPaymentTerm:async data=>{api.push({action:'submit',data});return {code:200}},savePaymentTerm:async data=>{api.push({action:'save',data});return {code:200}},queryPaymentTermById:async()=>({data:{}}),setTimeout:()=>{},console}
  vm.runInNewContext(code,context)
  const options=context.module.exports
  const instance={...options.methods,$t:key=>key,$store:{state:{user:{nickName:'test'}},getters:{},dispatch:()=>{}},$route:{name:'PaymentTerm',query:{}},$router:{push:()=>Promise.resolve()},$nextTick:fn=>fn(),$refs:{form:{validate:cb=>cb(true),clearValidate:()=>{}},tables:{toggleRowExpansion:()=>{}},addStageFormDlg:{handleOpen:()=>{}}},$modal:{confirm:()=>Promise.resolve(),msgError:message=>messages.push(message),msgSuccess:()=>{}},$trimOfObj:value=>value,$resultOfBoolean:value=>value!==undefined&&value!==null&&value!=='',resetForm:()=>{},checkPermi:()=>true,$$getColumnContentMaxWidth:()=>{},$set:(obj,key,value)=>{obj[key]=value}}
  Object.assign(instance,options.data.call(instance))
  for(const [name,fn] of Object.entries(options.methods)) instance[name]=fn.bind(instance)
  for(const [name,fn] of Object.entries(options.computed||{})) Object.defineProperty(instance,name,{get:()=>fn.call(instance)})
  instance.initDraggable=()=>{}
  instance.destroyDraggable=()=>{}
  instance.cancel=()=>{}
  return {instance,api,messages}
}
const tree=()=>[{paymentTermDetailId:1,stageName:'parent',percentage:40,trigger:'9',childList:[{paymentTermDetailId:11,stageName:'child',percentage:40,triggerCivilWorksProgressMilestone:'1'}]},{paymentTermDetailId:2,stageName:'second',percentage:60}]
const normalize=value=>JSON.parse(JSON.stringify(value))
for (const file of ['fromPage.vue','editPaymentTernDlg/editPaymentTernDlg.vue']) {
  const old=loadOptions(source,file)
  const current=loadOptions(target,file)
  for(const entry of [old,current]) {
    const page=entry.instance
    page.reset()
    page.form={paymentTermName:'test',paymentTermCode:'PT',paymentTermType:'1',paymentTermPurpose:'1',paymentTermPurposeList:['1']}
    page.tableList=tree()
    page.setNodeRowId(page.tableList,0)
    page.resetStageNum(page.tableList)
    page.resetIsTopRow(page.tableList[0])
    page.updateStage({...page.tableList[0],trigger:'1',stageName:'updated'})
    assert.equal(page.tableList[0].childList[0].isCivilWorks,false)
    assert.equal(page.tableList[0].childList[0].triggerCivilWorksProgressMilestone,undefined)
    assert.equal(page.findErrNode(page.tableList),null)
    assert.equal(page.findErrNodeForPercentageEmpty(page.tableList),null)
    page.tableList[0].childList[0].percentage=undefined
    assert.equal(page.findErrNodeForPercentageEmpty(page.tableList).rowTimeId,11)
    page.tableList[0].childList[0].percentage=39
    assert.equal(page.findErrNode(page.tableList).rowTimeId,1)
    page.tableList[0].childList[0].percentage=40
    if(file==='fromPage.vue') {
      assert.equal(page.comTableList.at(-1).percentage,100)
      page.submitForm()
      await new Promise(resolve=>setImmediate(resolve))
      assert.equal(entry.api.length,1)
      page.tableList[1].percentage=59
      page.submitForm()
      await new Promise(resolve=>setImmediate(resolve))
      assert.equal(entry.api.length,1,'99 percent must not submit')
      page.tableList[1].percentage=60
      page.handleSaveDraft(false)
      await new Promise(resolve=>setImmediate(resolve))
      assert.equal(entry.api.length,2)
    }
    page.deleteCascadeNode(page.tableList,11)
    page.resetStageNum(page.tableList)
  }
  assert.deepEqual(normalize(current.instance.tableList),normalize(old.instance.tableList))
  assert.deepEqual(normalize(current.api),normalize(old.api))
  console.log(`PASS: ${file} preserves ERP tree edits, trigger reset, percentage validation and payloads`)
}
const requestSource=fs.readFileSync('src/utils/request.js','utf8')
const requestAst=parseJs(requestSource,{sourceType:'module'})
const requestSetup=requestAst.program.body.find(node=>node.type==='ExpressionStatement'&&node.expression.type==='CallExpression'&&node.expression.callee.type==='MemberExpression'&&node.expression.callee.object.type==='MemberExpression'&&node.expression.callee.object.property.name==='request')
const interceptor=requestSetup.expression.arguments[0]
const handler=vm.runInNewContext(`(${requestSource.slice(interceptor.start,interceptor.end)})`,{getToken:()=>'',FormData,encodeURIComponent})
const get=handler({method:'get',url:'/test',headers:{},params:{menuPerms:'system:paymentTerm',condition:'test'}})
assert.equal(get.headers.menuPerms,'system:paymentTerm')
assert.ok(get.url.includes('menuPerms=system%3ApaymentTerm'))
const post=handler({method:'post',url:'/test',headers:{},data:{menuPerms:'system:paymentTerm',paymentTermPurposeList:['1']}})
assert.equal(post.headers.menuPerms,'system:paymentTerm')
assert.deepEqual(normalize(post.data.paymentTermPurposeList),['1'])
console.log('PASS: request interceptor preserves GET/POST menuPerms headers and business parameters')
for(const locale of ['zh','en']) {
  const read=file=>vm.runInNewContext(fs.readFileSync(file,'utf8').replace('export default','module.exports ='),{module:{exports:{}}})
  const messages={...read(`src/lang/system/${locale}.js`),...read(`src/lang/${locale}.js`)}
  const keys=new Set(files.flatMap(file=>[...fs.readFileSync(path.join(target,file),'utf8').matchAll(/\$t\(['"]([^'"]+)['"]\)/g)].map(match=>match[1])))
  for(const key of keys) assert.ok(key.split('.').reduce((value,part)=>value?.[part],messages),`${locale}: missing ${key}`)
  console.log(`PASS: all ${keys.size} payment-term translation keys exist in ${locale}`)
}
