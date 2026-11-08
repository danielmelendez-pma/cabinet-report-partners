"use strict";
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);
const quantity=()=>{const n=Number($("client-count").value);return Number.isFinite(n)?Math.min(100000,Math.max(0,Math.floor(n))):0;};
const price=()=>Number($("plan-select").value)||0;
const modes={
 ref:{title:"Referidor",desc:"Recomienda clientes nuevos. Recibe el 40% de su primera cuota y 8% por cada renovación de los meses 2 al 12.",first:.40,next:.08,after:0,firstText:"40% · primer pago único",nextText:"8% por mensualidad cobrada",afterText:"0% · comisión finalizada",rule:"Un mismo cliente genera el 40% solo una vez, en su primera cuota."},
 red:{title:"Administrador principal de redes",desc:"Cargo exclusivo ya asignado. Recibe 10% global de gestión (tope $1,000/mes), 10% extra de cada cuota inicial y 8% extra por clientes atribuibles a redes durante meses 2–12.",rule:"El 10% de nuevas cuotas y el 8% digital son adicionales al tope de $1,000 de gestión."},
 dig:{title:"Captador digital",desc:"Acredita clientes mediante código o enlace de redes. Obtiene 8% en las renovaciones de meses 2 al 12; puede cobrar 40% inicial solo si también es el referidor validado.",first:0,next:.08,after:0,firstText:"Solo si la referencia inicial está acreditada",nextText:"8% · captación por código",afterText:"0% · termina al mes 12",rule:"El 40% inicial requiere que también seas el referidor acreditado. No se duplica."},
 ven:{title:"Asesor comercial / Vendedor",desc:"Realiza demostraciones y cierra ventas. Recibe el 12% de mensualidades cobradas de los meses 2 al 12, más un bono inicial únicamente si es referidor acreditado.",first:0,next:.12,after:0,firstText:"40% solo con referencia inicial válida",nextText:"12% por mensualidad cobrada",afterText:"0% · comisión finalizada",rule:"La comisión de venta no continúa desde el mes 13."},
 tec:{title:"Partner técnico / Gestor",desc:"Acompaña a los clientes. Recibe 10% en meses 2–12 y 8% desde el mes 13 mientras siga su gestión activa.",first:0,next:.10,after:.08,firstText:"40% solo con referencia inicial válida",nextText:"10% · acompañamiento activo",afterText:"8% · gestión vigente",rule:"La participación del 8% después del mes 12 requiere gestión efectiva y asignación activa."},
 int:{title:"Partner integral",desc:"Capta, vende y administra los mismos clientes. Acumula hasta 30% por mes del 2 al 12 si se acreditan todas esas funciones; luego 8% por gestión.",first:.40,next:.30,after:.08,firstText:"40% · primera cuota referida",nextText:"Hasta 30% · tres funciones validadas",afterText:"8% · gestión activa",rule:"El máximo del 30% exige acreditar captación, venta y gestión (8% + 12% + 10%)."}
};
let mode="ref",summary="",toastTimeout=null;
function render(){
 const p=price(),n=quantity(),base=n*p,r=modes[mode];
 const refCredit=$("credit-ref").checked;
 const digCredit=$("credit-digital").checked;
 let initial=0,next=0,after=0,firstLabel=r.firstText||"",nextLabel=r.nextText||"",afterLabel=r.afterText||"";
 if(mode==="red"){
  const monthlyRevenue=Math.max(0,Number($("company-revenue").value)||0);
  const management=Math.min(monthlyRevenue*.10,1000);
  initial=management+base*.10;
  next=management+(digCredit?base*.08:0);
  after=management;
  firstLabel=`${money(management)} gestión + ${money(base*.10)} por primeras cuotas`;
  nextLabel=`${money(management)} gestión${digCredit?" + "+money(base*.08)+" captación digital":"; sin captación digital"}`;
  afterLabel=`${money(management)} gestión global; 0% captación desde mes 13`;
 }else{
  const firstRate=(mode==="ref"||mode==="int"||refCredit)? .40:0;
  initial=base*firstRate;next=base*r.next;after=base*r.after;
  if(mode==="dig"||mode==="ven"||mode==="tec"){
   firstLabel=refCredit?"40% · referencia inicial también acreditada":"$0 sin acreditación como referidor";
  }
 }
 $("calc-role-title").textContent=r.title;
 $("calc-role-description").textContent=r.desc;
 $("calc-rule").textContent=r.rule;
 $("credit-ref-wrap").hidden=!["dig","ven","tec"].includes(mode);
 $("credit-digital-wrap").hidden=mode!=="red";
 $("company-revenue-wrap").hidden=mode!=="red";
 $("calc-inputs").setAttribute("aria-labelledby","t-"+mode);
 $("stage-first").textContent=money(initial);
 $("stage-next").textContent=money(next);
 $("stage-after").textContent=money(after);
 $("stage-first-detail").textContent=firstLabel;
 $("stage-next-detail").textContent=nextLabel;
 $("stage-after-detail").textContent=afterLabel;
 $("annual-first").textContent=money(initial+11*next);
 $("annual-second").textContent=money(12*after);
 $("calc-footnote").textContent=mode==="red" ? "Incluye la gestión global sobre el ingreso indicado y las comisiones por clientes simulados. La cifra global no se limita a esos clientes. No representa ingresos de Cabinet Report." : "Se supone que estos mismos clientes pagan cada mes. Son únicamente las comisiones del partner: no se suman nuevos clientes cada mes ni se muestran ingresos de Cabinet Report.";
 summary=`Cabinet Report Partners · Rol: ${r.title} · Plan: ${$("plan-select").selectedOptions[0].textContent} · Clientes: ${n} · Mes 1: ${money(initial)} · Cada mes 2–12: ${money(next)} · Cada mes desde el 13: ${money(after)} · Año 1: ${money(initial+11*next)} · Año 2: ${money(12*after)}. Proyección orientativa sujeta a cobros reales y funciones acreditadas.`;
}
function selectRole(next){if(!modes[next])return;mode=next;for(const key of Object.keys(modes)){$("t-"+key).classList.toggle("active",key===mode);$("t-"+key).setAttribute("aria-selected",String(key===mode));}render();}
document.querySelectorAll("[data-mode]").forEach(el=>el.addEventListener("click",()=>selectRole(el.dataset.mode)));
for(const id of ["plan-select","client-count","credit-ref","credit-digital","company-revenue"]){$(id).addEventListener("input",render);$(id).addEventListener("change",render);}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove("show"),2300);}
async function copy(text){try{await navigator.clipboard.writeText(text);toast("Simulación copiada");}catch{const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.append(area);area.select();const ok=document.execCommand("copy");area.remove();toast(ok?"Simulación copiada":"No fue posible copiarla");}}
$("copy").addEventListener("click",()=>copy(summary));
// Immersive view avoids desktop zooming or scrolling between form and result.
function maximize(toggle){const on=typeof toggle==="boolean"?toggle:!$("calcbox").classList.contains("is-maximized");$("calcbox").classList.toggle("is-maximized",on);document.body.classList.toggle("calc-full-open",on);$("calc-expand").setAttribute("aria-pressed",String(on));$("calc-expand").textContent=on?"✕ Cerrar pantalla completa":"⤢ Pantalla completa";if(on)$("calcbox").scrollTop=0;}
$("calc-expand").addEventListener("click",()=>maximize());
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("calcbox").classList.contains("is-maximized"))maximize(false);});
const phone="50766359740";
function whatsappMessage(){const name=$("interested-name").value.trim().replace(/\s+/g," ");const role=$("interest").value;return `Hola, soy ${name||"[Tu nombre]"}.\n\nEstoy interesado(a) en formar parte de *Cabinet Report Partners* como *${role}*.\n\nHe conocido el programa en la web informativa y me gustaría saber cuáles son los requisitos y condiciones para participar.\n\nMuchas gracias.`;}
function updateWhatsappLink(){const message=whatsappMessage();$("message-text").textContent=message;$("whatsapp-interest").href="https://wa.me/"+phone+"?text="+encodeURIComponent(message);if($("interested-name").value.trim())$("name-error").hidden=true;}
$("interested-name").addEventListener("input",updateWhatsappLink);$("interest").addEventListener("change",updateWhatsappLink);
$("whatsapp-interest").addEventListener("click",e=>{if($("interested-name").value.trim().length<2){e.preventDefault();$("name-error").hidden=false;$("interested-name").focus();return;}updateWhatsappLink();});
// Global benefits modal remains independent of the calculator.
const dlg=$("benefits-dialog");let trigger=null;
function showBenefits(e){trigger=e.currentTarget;if($("calcbox").classList.contains("is-maximized"))maximize(false);dlg.showModal();$("close-benefits").focus({preventScroll:true});dlg.scrollTop=0;}
function closeBenefits(){dlg.close();}
document.querySelectorAll("[data-show-benefits]").forEach(el=>el.addEventListener("click",showBenefits));
$("close-benefits").addEventListener("click",closeBenefits);
$("close-benefits-bottom").addEventListener("click",closeBenefits);
dlg.addEventListener("close",()=>{if(trigger)trigger.focus();});
dlg.addEventListener("click",e=>{if(e.target===dlg)closeBenefits();});
updateWhatsappLink();render();
