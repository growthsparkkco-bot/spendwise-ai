const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const STORAGE_KEY = "spendwise-ai-v1";
const categories = {
  expense: ["Food & Dining", "Transport", "Shopping", "Bills & Utilities", "Entertainment", "Health", "Education", "Travel", "Personal Care", "Other"],
  income: ["Salary", "Freelance", "Business", "Investments", "Gift", "Other"]
};
const categoryMeta = {
  "Food & Dining": {icon:"♨", color:"#6262df"}, "Transport":{icon:"↗",color:"#f3a84f"},
  "Shopping":{icon:"◇",color:"#f4776b"}, "Bills & Utilities":{icon:"⌁",color:"#35b8a0"},
  "Entertainment":{icon:"♫",color:"#a47be7"}, "Health":{icon:"✚",color:"#ec729f"},
  "Education":{icon:"▤",color:"#4ba5dc"}, "Travel":{icon:"✈",color:"#55b5c4"},
  "Personal Care":{icon:"✦",color:"#9aab57"}, "Other":{icon:"◦",color:"#9ba6b7"},
  "Salary":{icon:"↙",color:"#25b88a"}, "Freelance":{icon:"⌘",color:"#6262df"},
  "Business":{icon:"▦",color:"#f3a84f"}, "Investments":{icon:"↗",color:"#35b8a0"},
  "Gift":{icon:"♡",color:"#ec729f"}
};
const palette = ["#6262df","#f3a84f","#f4776b","#35b8a0","#a47be7","#ec729f","#4ba5dc","#55b5c4","#9aab57","#9ba6b7"];
const now = new Date();
const isoToday = localDateString(now);
const demoDate = (daysAgo) => { const d = new Date(); d.setDate(d.getDate()-daysAgo); return localDateString(d); };
let currentType = "expense";
let currentView = "overview";
let state = loadState();

function localDateString(d){const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10);}
function money(value){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(value)||0);}
function loadState(){
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved){const parsed=JSON.parse(saved);if(Array.isArray(parsed.transactions)&&Array.isArray(parsed.budgets))return parsed;}
  } catch(e){console.warn("Could not load local data",e);}
  return {
    transactions:[
      {id:cryptoId(),title:"Monthly salary",amount:42000,type:"income",category:"Salary",date:demoDate(2),method:"Bank transfer",note:"Monthly salary"},
      {id:cryptoId(),title:"Grocery store",amount:1850,type:"expense",category:"Food & Dining",date:demoDate(0),method:"UPI",note:"Weekly groceries"},
      {id:cryptoId(),title:"Metro & cab",amount:460,type:"expense",category:"Transport",date:demoDate(1),method:"UPI",note:"Commute"},
      {id:cryptoId(),title:"Online course",amount:1299,type:"expense",category:"Education",date:demoDate(3),method:"Card",note:"Learning"},
      {id:cryptoId(),title:"Freelance website",amount:6500,type:"income",category:"Freelance",date:demoDate(5),method:"UPI",note:"Website project"},
      {id:cryptoId(),title:"Dinner with friends",amount:980,type:"expense",category:"Food & Dining",date:demoDate(6),method:"UPI",note:""},
      {id:cryptoId(),title:"Mobile recharge",amount:399,type:"expense",category:"Bills & Utilities",date:demoDate(7),method:"UPI",note:"Monthly plan"},
      {id:cryptoId(),title:"Headphones",amount:2499,type:"expense",category:"Shopping",date:demoDate(9),method:"Card",note:""},
      {id:cryptoId(),title:"Design gig",amount:3200,type:"income",category:"Freelance",date:demoDate(11),method:"Bank transfer",note:""},
      {id:cryptoId(),title:"Movie tickets",amount:650,type:"expense",category:"Entertainment",date:demoDate(13),method:"Card",note:""}
    ],
    budgets:[
      {category:"Food & Dining",limit:6000},{category:"Transport",limit:2500},
      {category:"Shopping",limit:5000},{category:"Bills & Utilities",limit:3000}
    ],
    settings:{theme:"light"}
  };
}
function cryptoId(){return (globalThis.crypto?.randomUUID?.() || `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`);}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function monthTransactions(){return state.transactions.filter(t=>t.date.slice(0,7)===isoToday.slice(0,7));}
function selectedTransactions(){return $("#periodSelect").value==="all"?state.transactions:monthTransactions();}
function sums(list){return list.reduce((acc,t)=>{acc[t.type]+=Number(t.amount);acc[`${t.type}Count`]++;return acc;},{income:0,expense:0,incomeCount:0,expenseCount:0});}
function setDateLabels(){
  $("#todayLabel").textContent=now.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
  const hour=now.getHours();$("#welcomeTitle").innerHTML=`${hour<12?"Good morning":hour<17?"Good afternoon":"Good evening"}, Neel <span class="wave">✦</span>`;
}
function populateCategories(){
  $("#txCategory").innerHTML=categories.expense.map(c=>`<option>${c}</option>`).join("");
  $("#budgetCategory").innerHTML=categories.expense.map(c=>`<option>${c}</option>`).join("");
}
function renderStats(){
  const tx=selectedTransactions(),s=sums(tx),balance=s.income-s.expense,rate=s.income>0?Math.max(0,Math.min(100,Math.round(balance/s.income*100))):0;
  $("#balanceValue").textContent=money(balance);$("#incomeValue").textContent=money(s.income);$("#expenseValue").textContent=money(s.expense);
  $("#savingsValue").textContent=`${rate}%`;$("#savingsProgress").style.width=`${rate}%`;
  $("#incomeCount").textContent=s.incomeCount;$("#expenseCount").textContent=s.expenseCount;
  $("#chartIncome").textContent=money(s.income);$("#chartExpense").textContent=money(s.expense);
}
function renderChart(){
  const list=selectedTransactions();let labels=[],income=[],expense=[];
  if($("#periodSelect").value==="all"){
    const map={};list.forEach(t=>{const k=t.date.slice(0,7);if(!map[k])map[k]={income:0,expense:0};map[k][t.type]+=Number(t.amount);});
    const keys=Object.keys(map).sort().slice(-7);
    labels=keys.map(k=>new Date(`${k}-01T12:00:00`).toLocaleDateString("en-IN",{month:"short"}));
    income=keys.map(k=>map[k].income);expense=keys.map(k=>map[k].expense);
  }else{
    const d=new Date();const month=d.getMonth(),year=d.getFullYear();
    const count=7;const starts=[1,5,10,15,20,25,Math.max(1,new Date(year,month+1,0).getDate()-4)];
    labels=starts.map((day,i)=>i===6?"End":`${day}`);
    income=starts.map((day,i)=>sumBetween(list,"income",day,starts[i+1]?starts[i+1]-1:31));
    expense=starts.map((day,i)=>sumBetween(list,"expense",day,starts[i+1]?starts[i+1]-1:31));
  }
  const max=Math.max(1000,...income,...expense)*1.12;
  const points=arr=>arr.map((v,i)=>`${(i/(Math.max(1,arr.length-1)))*700},${210-(v/max)*190}`).join(" ");
  const area=(arr,color,fill)=>`<polygon points="0,210 ${points(arr)} 700,210" fill="${fill}" opacity=".12"/><polyline points="${points(arr)}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`+
    arr.map((v,i)=>`<circle cx="${(i/(Math.max(1,arr.length-1)))*700}" cy="${210-(v/max)*190}" r="3.5" fill="${color}" stroke="var(--surface)" stroke-width="2"/>`).join("");
  $("#cashflowChart").innerHTML=area(income,"#6262df","#6262df")+area(expense,"#f4776b","#f4776b");
  $("#chartLabels").innerHTML=labels.map(x=>`<span>${escapeHTML(x)}</span>`).join("");
}
function sumBetween(list,type,start,end){return list.filter(t=>t.type===type&&Number(t.date.slice(8,10))>=start&&Number(t.date.slice(8,10))<=end).reduce((a,t)=>a+Number(t.amount),0);}
function renderCategories(){
  const expenses=selectedTransactions().filter(t=>t.type==="expense");
  const grouped={};expenses.forEach(t=>grouped[t.category]=(grouped[t.category]||0)+Number(t.amount));
  const sorted=Object.entries(grouped).sort((a,b)=>b[1]-a[1]).slice(0,5),total=expenses.reduce((a,t)=>a+Number(t.amount),0);
  $("#donutTotal").textContent=money(total);
  if(!sorted.length){$("#donutChart").style.background="conic-gradient(#e9edf4 0deg 360deg)";$("#categoryLegend").innerHTML='<div class="empty-state">Add expenses to see your breakdown.</div>';return;}
  let deg=0;const segments=sorted.map(([cat,val],i)=>{const start=deg;deg+=total?val/total*360:0;return `${palette[i]} ${start}deg ${deg}deg`;});
  if(deg<360)segments.push(`#e9edf4 ${deg}deg 360deg`);
  $("#donutChart").style.background=`conic-gradient(${segments.join(",")})`;
  $("#categoryLegend").innerHTML=sorted.map(([cat,val],i)=>`<div class="category-row"><i class="category-dot" style="background:${palette[i]}"></i><span class="category-name">${escapeHTML(cat)} <small>· ${Math.round(val/total*100)}%</small></span><strong class="category-amount">${money(val)}</strong></div>`).join("");
}
function renderTransactions(){
  const list=[...selectedTransactions()].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  $("#recentRows").innerHTML=list.map(t=>{const meta=categoryMeta[t.category]||categoryMeta.Other;return `<tr><td><div class="transaction-name"><span class="transaction-icon">${meta.icon}</span><span>${escapeHTML(t.title)}</span></div></td><td>${escapeHTML(t.category)}</td><td>${formatDate(t.date)}</td><td class="amount ${t.type}">${t.type==="income"?"+":"−"}${money(t.amount)}</td></tr>`;}).join("");
  $("#recentEmpty").hidden=list.length>0;
  if(!list.length)$("#recentRows").innerHTML="";
}
function renderBudgets(){
  const list=state.budgets;
  if(!list.length){$("#budgetList").innerHTML='<div class="budget-empty">No budgets yet. Set a spending limit for a category to stay on track.</div>';return;}
  const tx=monthTransactions();
  $("#budgetList").innerHTML=list.slice(0,5).map(b=>{const spent=tx.filter(t=>t.type==="expense"&&t.category===b.category).reduce((a,t)=>a+Number(t.amount),0);const pct=Math.round(spent/b.limit*100);const meta=categoryMeta[b.category]||categoryMeta.Other;return `<div class="budget-item"><div class="budget-item-top"><span class="budget-item-name"><i>${meta.icon}</i>${escapeHTML(b.category)}</span><span class="budget-numbers"><strong>${money(spent)}</strong> / ${money(b.limit)}</span></div><div class="budget-track"><span class="${pct>100?"over":""}" style="width:${Math.min(100,pct)}%"></span></div></div>`;}).join("");
}
function renderAll(){renderStats();renderChart();renderCategories();renderTransactions();renderBudgets();saveState();}
function formatDate(date){const d=new Date(`${date}T12:00:00`);return d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function openModal(id){const el=document.getElementById(id);el.classList.add("open");el.setAttribute("aria-hidden","false");setTimeout(()=>el.querySelector("input,select,button")?.focus(),50);}
function closeModal(id){const el=document.getElementById(id);el.classList.remove("open");el.setAttribute("aria-hidden","true");}
function openTransaction(){currentType="expense";$$(".type-option").forEach(b=>b.classList.toggle("active",b.dataset.type===currentType));refreshTypeCategories();$("#transactionForm").reset();$("#txDate").value=isoToday;openModal("transactionModal");}
function refreshTypeCategories(){const old=$("#txCategory").value;$("#txCategory").innerHTML=categories[currentType].map(c=>`<option>${escapeHTML(c)}</option>`).join("");if(categories[currentType].includes(old))$("#txCategory").value=old;}
function toast(message,success=true){const node=document.createElement("div");node.className="toast";node.innerHTML=`<b>${success?"✓":"!"}</b><span>${escapeHTML(message)}</span>`;$("#toastRegion").appendChild(node);setTimeout(()=>{node.style.opacity="0";node.style.transform="translateY(8px)";setTimeout(()=>node.remove(),250);},3000);}
function addTransaction(event){
  event.preventDefault();const title=$("#txTitle").value.trim(),amount=Number($("#txAmount").value),date=$("#txDate").value,category=$("#txCategory").value;
  if(!title||!Number.isFinite(amount)||amount<=0||!date){toast("Please enter valid transaction details.",false);return;}
  state.transactions.push({id:cryptoId(),title,amount,type:currentType,category,date,method:$("#txMethod").value,note:$("#txNote").value.trim()});
  renderAll();closeModal("transactionModal");toast("Transaction saved successfully.");$("#transactionForm").reset();
}
function exportData(){
  const blob=new Blob([JSON.stringify({app:"SpendWise AI",version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`spendwise-backup-${isoToday}.json`;a.click();URL.revokeObjectURL(url);toast("Your backup has been exported.");
}
function importData(file){
  if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!Array.isArray(data.transactions)||!Array.isArray(data.budgets))throw new Error("Invalid backup");state={transactions:data.transactions,budgets:data.budgets,settings:data.settings||{theme:"light"}};saveState();applyTheme();renderAll();toast("Backup imported successfully.");}catch(e){toast("This file is not a valid SpendWise backup.",false);}$("#importFile").value="";};reader.readAsText(file);
}
function addBudget(event){event.preventDefault();const category=$("#budgetCategory").value,limit=Number($("#budgetAmount").value);if(!limit||limit<=0){toast("Enter a valid budget amount.",false);return;}const existing=state.budgets.find(b=>b.category===category);if(existing)existing.limit=limit;else state.budgets.push({category,limit});renderAll();closeModal("budgetModal");$("#budgetForm").reset();toast("Monthly budget saved.");}
function applyTheme(){document.body.classList.toggle("dark",state.settings?.theme==="dark");$("#themeBtn").textContent=state.settings?.theme==="dark"?"☀":"☾";}
function navigate(view){currentView=view;const titles={overview:"Overview",transactions:"Transactions",budgets:"Budgets",insights:"Insights"};$("#pageTitle").textContent=titles[view]||"Overview";$$(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));if(view==="transactions"){toast("Recent transactions are shown on your dashboard. Export data for a full backup.");document.querySelector(".transactions-panel").scrollIntoView({behavior:"smooth",block:"center"});}else if(view==="budgets"){document.querySelector(".budget-panel").scrollIntoView({behavior:"smooth",block:"center"});}else if(view==="insights"){const s=sums(monthTransactions());const top=Object.entries(monthTransactions().filter(t=>t.type==="expense").reduce((a,t)=>(a[t.category]=(a[t.category]||0)+Number(t.amount),a),{})).sort((a,b)=>b[1]-a[1])[0];toast(top?`Top spending category: ${top[0]} (${money(top[1])}). Savings rate: ${s.income?Math.round((s.income-s.expense)/s.income*100):0}%.`:"Add transactions to unlock spending insights.");window.scrollTo({top:0,behavior:"smooth"});}else window.scrollTo({top:0,behavior:"smooth"});$("#sidebar").classList.remove("open");}
function init(){
  setDateLabels();populateCategories();$("#txDate").value=isoToday;applyTheme();renderAll();
  $("#addBtn").addEventListener("click",openTransaction);$("#quickAddSide").addEventListener("click",openTransaction);
  $("#transactionForm").addEventListener("submit",addTransaction);$("#budgetForm").addEventListener("submit",addBudget);
  $$(".type-option").forEach(b=>b.addEventListener("click",()=>{currentType=b.dataset.type;$$(".type-option").forEach(x=>x.classList.toggle("active",x===b));refreshTypeCategories();}));
  $$("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
  $$(".modal-backdrop").forEach(backdrop=>backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal(backdrop.id);}));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")$$(".modal-backdrop.open").forEach(m=>closeModal(m.id));if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openTransaction();}});
  $("#periodSelect").addEventListener("change",renderAll);
  $("#themeBtn").addEventListener("click",()=>{state.settings={...state.settings,theme:document.body.classList.contains("dark")?"light":"dark"};applyTheme();saveState();});
  $("#addBudgetBtn").addEventListener("click",()=>openModal("budgetModal"));$("#manageBudgetBtn").addEventListener("click",()=>openModal("budgetModal"));
  $("#exportBtn").addEventListener("click",exportData);$("#importBtn").addEventListener("click",()=>$("#importFile").click());$("#importFile").addEventListener("change",e=>importData(e.target.files[0]));
  $("#settingsBtn").addEventListener("click",()=>toast("Your data is saved locally in this browser."));
  $("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $$("[data-nav]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.nav)));
  $$(".nav-item[data-view]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.view)));
}
init();
