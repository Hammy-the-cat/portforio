/* ================================================================
   MonoKit「現在のダウンロード状況」スライド
   数値・文言・国名・集計日・注記を更新するときは、このオブジェクトだけを編集する。
   - snapshotDate: 集計日が確認できたときだけ "YYYY-MM-DD" を入れる（未確認なら null のまま。仮の日付は入れない）
   - metrics: 値(value)と下限表現(suffix)は分けて持つ。正確な集計値に切り替えるときは suffix を "" にする
   - countries: 国数(countries の value)と整合させる。一部抜粋なら countriesPartial を true にする
   - *En: 英語表示(ENボタン)用の訳。日本語側の文言が正
================================================================ */
window.MONOKIT_STATUS = {
  sectionLabel: '現在のダウンロード状況',
  sectionLabelEn: 'Current downloads',
  headline: 'Small apps. Global users.',
  description: '九州の片田舎からリリースしたニッチアプリが、広告なしで少しずつ世界へ届き始めています。',
  descriptionEn: 'Niche apps released from a quiet corner of Kyushu are slowly starting to reach the world — with no ads.',
  snapshotDate: null,
  metrics: [
    { id: 'downloads', value: 23, suffix: '+', label: 'Downloads' },
    { id: 'countries', value: 7,  suffix: '+', label: 'Countries' },
    { id: 'ads',       value: 0,  suffix: '',  label: 'Ads' }
  ],
  scopeNote: 'Downloadsは3アプリ合計の確認済みスナップショット。CountriesはField Hockey Stats Trackerで確認できた到達国数。Adsは広告出稿の実績を示します。',
  scopeNoteEn: 'Downloads is a confirmed snapshot of the total across 3 apps. Countries is the number of countries confirmed for Field Hockey Stats Tracker. Ads refers to ad spend.',
  countryApp: 'Field Hockey Stats Tracker',
  countries:   ['フランス', 'オランダ', 'ベルギー', 'イタリア', 'ポーランド', 'イギリス', 'カタール'],
  countriesEn: ['France', 'Netherlands', 'Belgium', 'Italy', 'Poland', 'United Kingdom', 'Qatar'],
  countriesPartial: false,
  closingMessage: 'まだ大きな数字じゃない。でも、世界のどこかで本当に使ってくれる人がいる。',
  closingMessageEn: 'Not big numbers yet. But somewhere in the world, someone is really using them.'
};

(() => {
  const d = window.MONOKIT_STATUS;
  const root = document.getElementById('download-status-body');
  if (!d || !root) return;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const en = (s) => s ? ` data-en="${esc(s)}"` : '';

  let dateJa = '', dateEn = '';
  if (d.snapshotDate) {
    const [y, m, day] = d.snapshotDate.split('-').map(Number);
    dateJa = `${y}年${m}月${day}日時点。`;
    dateEn = `As of ${new Date(y, m - 1, day).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. `;
  }

  const countriesMetric = d.metrics.find(m => m.id === 'countries');
  if (countriesMetric && d.countries.length !== countriesMetric.value && !d.countriesPartial) {
    console.warn('MONOKIT_STATUS: countries の件数と Countries の値が一致しません');
  }
  const partialJa = d.countriesPartial ? '（一部抜粋）' : '';
  const partialEn = d.countriesPartial ? ' (partial list)' : '';

  root.innerHTML = `
    <p class="ds-label"${en(d.sectionLabelEn)}>${esc(d.sectionLabel)}</p>
    <h2 class="ds-headline" id="download-status-title">${esc(d.headline)}</h2>
    <p class="ds-desc"${en(d.descriptionEn)}>${esc(d.description)}</p>
    <dl class="ds-metrics">
      ${d.metrics.map(m => `
      <div class="ds-metric">
        <dt>${esc(m.label)}</dt>
        <dd>${esc(m.value)}${m.suffix ? `<span class="ds-suffix">${esc(m.suffix)}</span>` : ''}</dd>
      </div>`).join('')}
    </dl>
    <p class="ds-note" data-en="${esc(dateEn + d.scopeNoteEn)}">${esc(dateJa + d.scopeNote)}</p>
    <div class="ds-countries">
      <p class="ds-countries-title" data-en="${esc('Countries reached by ' + d.countryApp + partialEn)}">${esc(d.countryApp)} が届いた国${partialJa}</p>
      <ul>${d.countries.map((c, i) => `<li${en(d.countriesEn && d.countriesEn[i])}>${esc(c)}</li>`).join('')}</ul>
    </div>
    <p class="ds-closing"${en(d.closingMessageEn)}>${esc(d.closingMessage)}</p>`;
})();
