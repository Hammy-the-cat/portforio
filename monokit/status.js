/* Public aggregate only. API keys and private dashboard data never reach this page. */
(() => {
 const root=document.getElementById('download-status-body');if(!root)return;
 let data=null,failed=false;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(){
  const en=document.documentElement.lang==='en',has=data?.reportDays>0;
  const names=new Intl.DisplayNames([en?'en':'ja'],{type:'region'});
  const codes=(data?.countries||[]).filter(c=>c!=='ZZ');
  const regions=codes.map(c=>{try{return names.of(c);}catch{return c;}});
  const num=v=>Number(v).toLocaleString(en?'en-US':'ja-JP');
  const updated=data?.updatedAt?new Date(data.updatedAt).toLocaleString(en?'en-GB':'ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
  const note=data?(en?`4 apps combined · ${data.period.start} – ${data.period.end} (Pacific Time). ${data.reportDays} of 30 daily reports available. Missing days are not counted as zero. First-time downloads, net of adjustments; not lifetime totals. Ads: manually maintained advertising activity.`:`4アプリ合計・${data.period.start}〜${data.period.end}（米国太平洋時間）。30日中${data.reportDays}日分を取得。未取得日は0件として扱いません。初回取得数（返品等の調整を含む）で、累計ではありません。Adsは広告出稿の手動設定です。`):(failed?(en?'Data is temporarily unavailable. Please try again later.':'現在データを取得できません。時間をおいて再読み込みしてください。'):(en?'Loading the latest report data…':'最新のレポートを読み込んでいます…'));
  root.innerHTML=`<p class="ds-label">${en?'Downloads · last 30 days':'直近30日間のダウンロード状況'}</p><h2 class="ds-headline" id="download-status-title">Small apps. Global users.</h2><p class="ds-desc">${en?'Small apps from a quiet corner of Kyushu, reaching people around the world.':'九州の片田舎からリリースした小さなアプリが、少しずつ世界へ届いています。'}</p><dl class="ds-metrics"><div class="ds-metric"><dt>Downloads</dt><dd>${has?esc(num(data.downloads)):'—'}</dd></div><div class="ds-metric"><dt>Countries / Regions</dt><dd>${has?codes.length:'—'}</dd></div><div class="ds-metric"><dt>Ads</dt><dd>0</dd></div></dl><p class="ds-note">${esc(note)}${updated?`<br>${en?'Updated':'最終データ取得'} ${esc(updated)} ${en?'JST':'（日本時間）'}`:''}</p><div class="ds-countries"><p class="ds-countries-title">${en?'Countries and regions reached by the 4 apps during this period':'この期間に4アプリが届いた国・地域'}</p><ul>${regions.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>${has&&!regions.length?`<p>${en?'No confirmed countries or regions yet.':'確認できた国・地域はまだありません。'}</p>`:''}</div><p class="ds-closing">${en?'Small steps, reaching a little farther.':'小さなアプリで、少しずつ遠くへ。'}</p>`;
 }
 render();document.addEventListener('langchange',render);
 fetch('https://hammy-workdesk.excitedcherry0909.workers.dev/api/public/downloads',{credentials:'omit',signal:AbortSignal.timeout(10000)})
 .then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(!d.period||!Array.isArray(d.countries)||!Number.isInteger(d.reportDays)||!(d.downloads===null||Number.isFinite(d.downloads)))throw Error();data=d;render();})
 .catch(()=>{failed=true;render();});
})();
