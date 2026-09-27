/* Total covers available reports, never an inferred lifetime count. */
(() => {
 const root=document.getElementById('download-status-body');if(!root)return;
 let data=null,failed=false;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(){
  const en=document.documentElement.lang==='en';
  const names=new Intl.DisplayNames([en?'en':'ja'],{type:'region'});
  const num=v=>Number(v).toLocaleString(en?'en-US':'ja-JP');
  const panel=(d,title,tag)=>{
   const known=d?.reportDays>0,codes=(d?.countries||[]).filter(c=>c!=='ZZ');
   return `<section class="ds-period"><p class="ds-period-tag">${tag}</p><h3>${title}</h3><dl class="ds-metrics"><div class="ds-metric"><dt>Downloads</dt><dd>${known?esc(num(d.downloads)):'—'}</dd></div><div class="ds-metric"><dt>Countries / Regions</dt><dd>${known?codes.length:'—'}</dd></div></dl><div class="ds-countries"><ul>${codes.map(c=>{let n=c;try{n=names.of(c);}catch{}return `<li>${esc(n)}</li>`;}).join('')}</ul>${!codes.length?`<p class="ds-note">${known?(en?'No confirmed countries yet':'確認できた国・地域はまだありません'):(en?'Awaiting data':'データ取得待ち')}</p>`:''}</div></section>`;
  };
  const updated=data?.updatedAt?new Date(data.updatedAt).toLocaleString(en?'en-GB':'ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
  root.innerHTML=`<p class="ds-label">${en?'Download activity':'ダウンロード状況'}</p><h2 class="ds-headline" id="download-status-title">Small apps. Global users.</h2><p class="ds-desc">${en?'Small apps from a quiet corner of Kyushu, reaching people around the world.':'九州の片田舎からリリースした小さなアプリが、少しずつ世界へ届いています。'}</p><div class="ds-periods">${panel(data,en?'Last 30 days':'直近30日','RECENT')}${panel(data?.total,en?'Total · available reports':'取得済み累計','TOTAL')}</div><p class="ds-note">${updated?`${en?'Last updated':'最終更新日'} ${esc(updated)} ${en?'JST':'（日本時間）'}`:failed?(en?'Data temporarily unavailable':'現在データを取得できません'):(en?'Loading…':'読み込み中…')}</p><p class="ds-ads">0 ADS</p><p class="ds-closing">${en?'Small steps, reaching a little farther.':'小さなアプリで、少しずつ遠くへ。'}</p>`;
 }
 render();document.addEventListener('langchange',render);
 fetch('https://hammy-workdesk.excitedcherry0909.workers.dev/api/public/downloads',{credentials:'omit',cache:'no-cache',signal:AbortSignal.timeout(10000)})
 .then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(!d.period||!Array.isArray(d.countries)||!d.total||!Array.isArray(d.total.countries)||!Number.isInteger(d.reportDays)||!(d.downloads===null||Number.isFinite(d.downloads)))throw Error();data=d;render();})
 .catch(()=>{failed=true;render();});
})();
