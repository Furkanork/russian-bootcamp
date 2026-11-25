{
let ev=null;const b=document.getElementById('install');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();ev=e;b.hidden=false});
b.addEventListener('click',async()=>{if(!ev)return;ev.prompt();try{await ev.userChoice}catch(e){}ev=null;b.hidden=true});
window.addEventListener('appinstalled',()=>{b.hidden=true});
try{if('serviceWorker' in navigator&&isSecureContext)navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}
}
