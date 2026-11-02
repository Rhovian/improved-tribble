// Builds public/diorama.html: a self-contained fullscreen page for the
// "House at the End of the World" diorama (video cover + loop recorder).
// The engine source of truth is src/lib/diorama.ts; run `pnpm build:diorama`
// after changing it.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(root, "src/lib/diorama.ts"), "utf8");
const js = ts
  .transpileModule(src, {
    compilerOptions: { target: ts.ScriptTarget.ES2019, module: ts.ModuleKind.ESNext, removeComments: true },
  })
  .outputText.replace(/^export \{\};?$/gm, "")
  .replace(/^export /gm, "");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The House at the End of the World</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap" rel="stylesheet">
<style>
:root{--bg:#03050c;--fg:#93a9d1;--line:#1e2c56;--warm:#ffbe5c;--panel:rgba(3,5,12,.78);color-scheme:dark}
html,body{height:100%;margin:0;background:var(--bg);overflow:hidden}
#stage{position:fixed;inset:0;display:grid;place-items:center;overflow:hidden;background:var(--bg)}
canvas{display:block;image-rendering:pixelated;image-rendering:crisp-edges;flex:none}
body.idle,body.idle *{cursor:none}
#hud{position:fixed;left:max(16px,env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));
  max-width:calc(100% - 32px);box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;
  padding:10px 12px;background:var(--panel);border:1px solid var(--line);color:var(--fg);
  font:10px/1.5 Silkscreen,ui-monospace,Menlo,monospace;letter-spacing:.06em;transition:opacity .5s}
#hud.off{opacity:0;pointer-events:none}
#hud strong{color:var(--warm);font-weight:400}
#hud button{font:inherit;letter-spacing:inherit;color:var(--fg);background:transparent;border:1px solid var(--line);padding:4px 8px;cursor:pointer}
#hud button:hover{border-color:var(--fg)}
#hud button:focus-visible{outline:1px solid var(--warm);outline-offset:2px}
#hud button[aria-pressed="true"]{color:var(--warm);border-color:var(--warm)}
#msg{flex-basis:100%;color:var(--fg);opacity:.8}
#msg:empty{display:none}
</style>
</head>
<body>
<div id="stage"><canvas id="c" role="img" aria-label="Pixel-art night scene: a snowy cottage with glowing windows on a clifftop above a moonlit sea and distant mountains, a hooded figure by a campfire, drifting smoke and a bright moon over a starry sky"></canvas></div>
<div id="hud">
  <span><strong>The House at the End of the World</strong> &middot; <span id="len">6:00</span> seamless loop</span>
  <button id="bFull" type="button">Fullscreen [F]</button>
  <button id="bRec" type="button" aria-pressed="false">Record loop [R]</button>
  <button id="bHide" type="button">Hide [H]</button>
  <span id="msg"></span>
</div>
<script>
${js}
(function(){
  var canvas=document.getElementById('c'), hud=document.getElementById('hud'), msg=document.getElementById('msg'), bRec=document.getElementById('bRec');
  var d=createDiorama(canvas);
  var origin=performance.now(), rec=null, hidden=false, idleTimer=0;
  function fit(){ if(!rec) d.resize(innerWidth,innerHeight,devicePixelRatio||1); }
  fit();
  var rt; addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(fit,120);});
  function loop(now){
    d.frame((now-origin)/1000);
    if(rec){
      rec.out.drawImage(canvas,0,0,1920,1080);
      var el=(now-rec.start)/1000;
      msg.textContent='Recording '+fmt(el)+' / '+fmt(LOOP_SECONDS)+' (keep this tab visible)';
      if(el>=LOOP_SECONDS) stopRec();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  function fmt(s){s=Math.min(LOOP_SECONDS,Math.floor(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
  document.getElementById('len').textContent=fmt(LOOP_SECONDS);

  function showHud(){ if(hidden) return; hud.classList.remove('off'); document.body.classList.remove('idle'); clearTimeout(idleTimer); idleTimer=setTimeout(function(){ if(!rec) hud.classList.add('off'); document.body.classList.add('idle'); },3500); }
  addEventListener('mousemove',showHud); addEventListener('touchstart',showHud,{passive:true});
  showHud();

  function toggleFull(){ try{ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(function(){}); }catch(e){} }
  function toggleHide(){ hidden=!hidden; hud.classList.toggle('off',hidden); if(!hidden) showHud(); }

  function startRec(){
    if(rec) return;
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){ msg.textContent='This browser cannot record a canvas. Try Chrome or Firefox.'; return; }
    var out=document.createElement('canvas'); out.width=1920; out.height=1080;
    var o=out.getContext('2d'); o.imageSmoothingEnabled=false;
    // Render exactly 480x270 art pixels (4x = 1080p) while recording.
    var fixed=createDiorama(canvas,{fixedSize:{w:480,h:270}}); fixed.resize(0,0,1);
    canvas.style.width=Math.min(innerWidth,innerHeight*16/9)+'px'; canvas.style.height=Math.min(innerHeight,innerWidth*9/16)+'px';
    var types=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'];
    var mime=types.filter(function(t){return MediaRecorder.isTypeSupported(t);})[0]||'';
    var stream=out.captureStream(60), chunks=[];
    var mr=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:14e6}:{videoBitsPerSecond:14e6});
    mr.ondataavailable=function(e){ if(e.data&&e.data.size) chunks.push(e.data); };
    mr.onstop=function(){
      var blob=new Blob(chunks,{type:mime||'video/webm'}), url=URL.createObjectURL(blob);
      var a=document.createElement('a'); a.href=url; a.download='house-at-the-end-of-the-world-loop.'+(mime.indexOf('mp4')>=0?'mp4':'webm');
      document.body.appendChild(a); a.click(); a.remove();
      msg.textContent='Saved one '+fmt(LOOP_SECONDS)+' loop at 1920x1080. If no download appeared, open this page as a local file or from your own site.';
      setTimeout(function(){URL.revokeObjectURL(url);},60000);
    };
    origin=performance.now();
    rec={out:o,mr:mr,start:origin,prev:d}; d=fixed;
    mr.start(1000);
    bRec.setAttribute('aria-pressed','true'); bRec.textContent='Stop [R]';
  }
  function stopRec(){
    if(!rec) return;
    var r=rec; rec=null; r.mr.stop();
    d=createDiorama(canvas); fit();
    bRec.setAttribute('aria-pressed','false'); bRec.textContent='Record loop [R]';
  }
  document.getElementById('bFull').onclick=toggleFull;
  document.getElementById('bHide').onclick=toggleHide;
  bRec.onclick=function(){ rec?stopRec():startRec(); };
  addEventListener('keydown',function(e){
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    var k=e.key.toLowerCase();
    if(k==='f') toggleFull(); else if(k==='h') toggleHide(); else if(k==='r') bRec.onclick();
  });
  canvas.addEventListener('dblclick',toggleFull);
  try{ if(navigator.wakeLock) navigator.wakeLock.request('screen').catch(function(){}); }catch(e){}
  document.addEventListener('visibilitychange',function(){ try{ if(!document.hidden&&navigator.wakeLock) navigator.wakeLock.request('screen').catch(function(){}); }catch(e){} });
})();
</script>
</body>
</html>
`;

writeFileSync(resolve(root, "public/diorama.html"), html);
console.log(`wrote public/diorama.html (${(html.length / 1024).toFixed(1)} KB)`);
