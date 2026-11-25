// РЫВОК offline support: the site's own files are fetched fresh when online and served from the cache when offline.
const CACHE='rybok-v5';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/favicon-32.png','./css/site.css','./js/data.js','./js/app.js','./js/pwa.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const own=new URL(r.url).origin===self.location.origin;
  const put=res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(CACHE).then(x=>x.put(r.mode==='navigate'?'./index.html':r,c))}return res};
  if(own||r.mode==='navigate'){e.respondWith(fetch(r).then(put).catch(()=>caches.match(r.mode==='navigate'?'./index.html':r)));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(put)));
});
