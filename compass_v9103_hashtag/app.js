(function(){
 'use strict';
 const D=window.COMPASS_DATA,E=window.COMPASS_ENGINE,P=window.COMPASS_PRACTICAL;
 const INTENT=window.COMPASS_INTENTS;
 const intentVisibilityKey='compass_v97_show_question_intent';
 let displayQuestionIntents=true;
 function renderIntent(mode,explanation){
  const detail=$(mode==='practical'?'practical-intent':'classic-intent');
  const content=$(mode==='practical'?'practical-intent-content':'classic-intent-content');
  if(!detail||!content)return;
  detail.hidden=!displayQuestionIntents;
  if(!displayQuestionIntents)return;
  const bullet=explanation.signals?.length?`<ul>${explanation.signals.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>評価項目の登録がありません。</p>';
  content.innerHTML=`<div class="intent-id">QUESTION ID：${esc(explanation.id)}</div><h3>何を確かめる質問？</h3><p>${esc(explanation.purpose)}</p><h3>評価される要素</h3>${bullet}<h3>回答は順位にどう影響する？</h3><p>${esc(explanation.impact)}</p><p class="intent-caution"><strong>確認してほしい点：</strong>${esc(explanation.note)}</p><p class="intent-feedback">質問が曖昧・キャラと合わない場合は、この質問IDと気になった点を知らせてください。</p>`;
  detail.open=true;
 }

 const key='compass_hero_finder_v89_session';const practicalKey='compass_hero_finder_v910_practical';const practicalHistoryKey='compass_v90_practical_history';const historyKey='compass_hero_finder_v85_local_history';const feedbackKey='compass_hero_finder_v85_local_feedback';
 const $=id=>document.getElementById(id);
 let active=null,practicalActive=null,previousScreen='home',completionKey='',practicalCompletionKey='';
 const answerLabel={yes:'はい',no:'いいえ',neutral:'どちらでもない',unknown:'わからない'};
 const categoryLabels={P:'勝ち方の好み',A:'攻め方の好み',K:'カードと準備',R:'距離感',M:'移動・機動力',D:'守り方の好み',C:'妨害と駆け引き',T:'味方との連携',X:'操作や挑戦',H:'切り札の使い方',J:'惹かれる人物像',V:'見た目・デザイン',E:'カードの好み'};
 function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function safeLoad(key,fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback;}catch(e){return fallback;}}
 function save(){try{if(active)localStorage.setItem(key,JSON.stringify(active));else localStorage.removeItem(key);}catch(e){/* private mode may block storage */}}
 function show(name){for(const id of ['home','quiz','result','practical-quiz','practical-result','roster'])$(id).hidden=id!==name;window.scrollTo({top:0,behavior:'instant'});if(name==='home')refreshHome();}
 function art(hero,cls){return hero.portrait?`<img src="${esc(hero.portrait)}" loading="lazy" alt="${esc(hero.name)}のヒーロー画像" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="hero-placeholder" hidden><span class="placeholder-icon">?</span><span class="placeholder-label">HERO FILE</span><span class="placeholder-number">NO.${String(hero.id).padStart(3,'0')}</span></span>`:`<div class="hero-placeholder"><span class="placeholder-icon">?</span><span class="placeholder-label">HERO FILE</span><span class="placeholder-number">NO.${String(hero.id).padStart(3,'0')}</span></div>`;}
 function practicalCompetencyPanel(h,folded=false){
  const p=h.practicalCompetency;if(!p)return '';
  const sections=[['主力となる行動',p.mainActions],['必要な技術',p.requiredSkills],['苦手なら練習候補になる技術（推定）',p.criticalWeaknesses]];
  const contents=sections.map(([title,items])=>`<div class="competency-item"><h5>${esc(title)}</h5><ul>${(items||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
  const label='<strong>104人個別・実戦プロフィール（暫定）</strong>';
  const support=p.supportCardUsage?`<p class="competency-support-note"><strong>支援カードの運用（暫定）：</strong>${esc(p.supportCardUsage.status)}。${esc(p.supportCardUsage.basis)}。カードとHA・HSなどの固有能力は別に扱います。</p>`:'';
  const note='<p class="competency-caution">これはヒーロー側に必要と推定された操作です。現在苦手でも練習で改善できる可能性があり、「このヒーローを使ってはいけない」という意味ではありません。登録内容の重要度は未検証で、現在の順位計算には反映していません。</p>';
  return folded?`<details class="competency-profile"><summary>${label}を表示</summary>${contents}${support}${note}</details>`:`<section class="competency-profile" aria-label="${esc(h.name)}の実戦プロフィール"><h4>${label}</h4>${contents}${support}${note}</section>`;
 }
 function refreshHome(){
  $('continue').hidden=!(active&&active.history.length>0&&active.history.length<30);$('continue-practical').hidden=!(practicalActive&&practicalActive.history.length>0&&practicalActive.history.length<P.questions.length);
  const records=safeLoad(historyKey,[]),area=$('history-area'),container=$('history-content');
  area.hidden=!records.length;if(!records.length){renderPracticalHistory();return;}
  const group=(field,label)=>{
   const counts={};records.forEach(r=>{if(Number.isInteger(r[field])&&r[field]>=1&&r[field]<=104)counts[r[field]]=(counts[r[field]]||0)+1;});
   const unique=Object.entries(counts).sort((a,b)=>b[1]-a[1]||Number(a[0])-Number(b[0])).slice(0,6);
   return `<section class="history-track"><h3>${label}</h3>${unique.length?`<div class="history-cards">${unique.map(([id,n])=>{const h=D.heroes[Number(id)-1];return `<div class="history-card"><b>${esc(h?.name||'ヒーロー')}</b>${n}回 <span class="mini-history">/ この端末</span></div>`;}).join('')}</div>`:'<p class="mini-history">この項目の保存済み1位はまだありません。</p>'}</section>`;
  };
  container.innerHTML=`<div class="history-top"><p class="mini-history">この端末のみ：診断 ${records.length} 回（全利用者のランキングではありません）</p><button class="clear-history" type="button" id="clear-history">履歴を消す</button></div>${group('id','性能相性の1位（端末内）')}${group('appearanceId','見た目の好みの1位（端末内）')}`;
  $('clear-history').onclick=()=>{if(confirm('この端末の「好きから探すヒーロー診断」の履歴をすべて削除しますか？')){try{localStorage.removeItem(historyKey);}catch(e){}refreshHome();}};renderPracticalHistory();
 }
 function startNew(){if(active&&active.history.length>0&&active.history.length<30){if(!confirm('進行中の診断を最初からやり直しますか？'))return;}active=E.session(Date.now());completionKey='';save();renderQuiz();}
 function resume(){if(!active||active.history.length>=30)return;renderQuiz();}
 function renderQuiz(){if(!active||!active.questionId)return;show('quiz');const index=active.history.length+1,id=active.questionId,question=E.byId(id);
  $('q-number').textContent=String(index).padStart(2,'0');$('q-label-num').textContent=String(index).padStart(2,'0');$('progress').setAttribute('aria-valuenow',String(index-1));$('progress-fill').style.width=((index-1)/30*100)+'%';
  for(const tab of document.querySelectorAll('[data-stage]')){const stage=Number(tab.dataset.stage);const curr=index<=10?1:index<=29?2:3;tab.classList.toggle('active',stage===curr);tab.classList.toggle('complete',stage<curr);}
  // An actual transition screen, not an extra counted question.
  // The 'seen' flag survives reloads, while going back to Q10 remains available.
  const intro=index===11&&!active.gameplayIntroSeen;
  $('gameplay-intro').hidden=!intro;
  $('question-panel').hidden=intro;
  document.querySelector('.quiz-bottom').hidden=intro;
  if(intro){
   $('q-number').textContent='10';
   $('progress').setAttribute('aria-valuetext','10問回答済み / 30問・コンパスの質問に進む前');
   return;
  }
  let text='',category='',hint='直感に近い答えを選んでね。';
  if(index<=10){text=question?.question;category='性格診断 / '+(question?.axis_name||'');hint='あなたの普段の考え方に近い方を選んでね。';}
  else if(index<=29){text=question?.question;category=categoryLabels[question?.category]||'好きな戦い方';hint=question?.category==='V'?'見た目や衣装の好みについて答えてね。性能の順位には影響しません。':question?.special?'少し直接的な確認です。好き・苦手をそのまま答えてね。':'理想のプレイスタイルを思い浮かべて答えてね。';}
  else {const hero=D.heroes[Number(id.slice(1))-1];text=hero?.specificQuestion||'最後の確認です。';category='最後の確認（性能上位候補）';hint='上位の性能候補の専用質問です。人物像などが混ざる質問は採点しません。';}
  $('q-category').textContent=category;$('quiz-title').textContent=text||'次の質問を準備しています';$('q-guide').textContent=hint;
  const explain=index<=10?INTENT.classic(question,'personality',null,D):index<=29?INTENT.classic(question,'common',null,D):INTENT.classic({id},'specific',D.heroes[Number(id.slice(1))-1],D);
  renderIntent('classic',explain);
  $('previous').disabled=active.history.length===0;$('previous').hidden=active.history.length===0;
  $('progress').setAttribute('aria-valuetext',`${index-1}問回答済み / 30問`);
 }
 function doAnswer(value){if(!active||active.history.length>=30)return;try{active=E.answer(active,value);save();if(active.history.length===30){finish();}else renderQuiz();}catch(err){console.error(err);alert('診断を進められませんでした。ページを更新してみてください。');}}
 function finish(){
  if(!active||active.history.length!==30)return;
  const outcome=E.compute(active),first=outcome.ranked[0],coverage=E.answerCoverage(active);if(!first)return;
  const id=active.createdAt;
  if(completionKey!==id){
   const records=safeLoad(historyKey,[]);
   if((coverage.performance||coverage.appearance)&&!records.some(r=>r.sessionId===id)){
    records.unshift({id:coverage.performance?first.hero.id:null,name:coverage.performance?first.hero.name:null,appearanceId:coverage.appearance?outcome.rankedAppearance[0]?.hero.id:null,sessionId:id,date:new Date().toISOString()});
    try{localStorage.setItem(historyKey,JSON.stringify(records.slice(0,100)));}catch(e){}
   }
   completionKey=id;
  }
  renderResult();
 }
 function renderResult(){
  if(!active||active.history.length!==30)return;
  const out=E.compute(active),best=out.rankedPerformance[0],look=out.rankedAppearance[0];
  if(!best||!look)return;
  const h=best.hero,v=look.hero,coverage=E.answerCoverage(active),reasons=E.explainEvidence(active,h,'performance'),visualReasons=E.explainEvidence(active,v,'appearance');
  const perfAlternates=out.rankedPerformance.slice(1,5),visualAlternates=out.rankedAppearance.slice(1,5);
  const personality=E.personalitySummary(active);
  const missingVisualNames=(out.visualUnverified||[]).map(id=>D.heroes[id-1]?.name).filter(Boolean);
  const visualCoverageCount=D.heroes.length-missingVisualNames.length;
  const explanation=items=>items.length?`<ul>${items.map(q=>`<li>${esc(q)}</li>`).join('')}</ul>`:'<p>上位候補を明確に区別できる回答が少なく、この順位を強く裏付ける根拠はありません。</p>';
  const uncertainty=(track)=>{const count=coverage[track],total=track==='appearance'?6:13,ranked=track==='appearance'?out.rankedAppearance:out.rankedPerformance;const ties=ranked.filter(r=>r.score===ranked[0]?.score && (track!=='appearance'||r.visualEvidenceReady)).length;if(!count)return `<p class="evidence-warning">${track==='appearance'?'見た目':'性能'}の質問に「はい」「いいえ」の回答がなかったため、この項目は判定保留です。ランダムな1位を表示しません。</p>`;
    return `<p class="evidence-count">採点に使えた回答：${count} / ${total}問${count<(track==='appearance'?3:5)?'（少ないため順位は特に暫定的です）':''}${ties>1?`／同点${ties}人：同点時はヒーロー番号順で仮表示`:''}</p>`;};
  const recs=(items,track)=>`<div class="recommend-list">${items.map((x,i)=>{const why=E.explainEvidence(active,x.hero,track,1)[0];return `<article class="recommend-card"><div class="recommend-image">${art(x.hero)}</div><div class="recommend-info"><span class="recommend-number">#${i+2} / NO.${String(x.hero.id).padStart(3,'0')}</span><strong class="recommend-name">${esc(x.hero.name)}</strong><span class="recommend-role">${esc(x.hero.role)} · ${x.score.toFixed(1)} pt</span>${why?`<p class="recommend-why">${esc(why)}</p>`:''}</div></article>`;}).join('')}</div>`;
  const mainCard=(item,tag,type)=>{const hero=item.hero;
    if(!coverage[type==='appearance'?'appearance':'performance'])return `<section class="unscorable-track" role="status"><h3>判定保留</h3><p>この項目に有効な「はい」「いいえ」の回答がないため、1位を決められませんでした。</p></section>`;
    return `<article class="result-card separated-card ${type}"><div class="result-art">${art(hero)}</div><div class="result-info"><span class="role-chip">${esc(hero.role)}</span><p class="rank-subtitle">NO.${String(hero.id).padStart(3,'0')} / ${tag}</p><h3 class="hero-name">${esc(hero.name)}</h3>${type==='performance'?`<p class="result-summary">${esc(hero.summary)}</p><div class="card-profile-mini"><strong>カード傾向（暫定）</strong><span>${esc(hero.cardKnowledge?.primary||'研究中')}</span><small>HA・通常攻撃の効果とは別に集計しています</small></div>`:`<p class="result-summary">外見の研究資料に記載された衣装・色使い・モチーフとの一致を評価しています。</p>`}<div class="score-strip"><span class="score-label">${type==='performance'?'性能相性スコア':'見た目の好みスコア'}<br/>候補同士の比較値</span><span class="score-value">${item.score.toFixed(1)} <span style="font-size:12px">pt</span></span></div><p class="soft-caution">※点数は正確さの割合ではありません。</p></div></article>`;
  };
  const excl=out.excluded.length?`<p>特殊カードの回答により、性能の候補から ${out.excluded.map(n=>esc(D.heroes[n-1].name)).join('・')} を除外しました。外見ランキングでは除外しません。</p>`:'<p>性能の候補からの特殊カード除外はありませんでした。</p>';
  const pnotes=personality.length?`<ul>${personality.map(x=>`<li>${esc(x.axis)}：${esc(x.tendency)}</li>`).join('')}</ul>`:'<p>回答の傾向は一定ではありませんでした。</p>';
  $('results-content').innerHTML=`
   <div class="result-top"><div class="result-kicker">YOUR MATCHES / 30 QUESTIONS COMPLETE</div><button type="button" class="back-link" id="result-home">← トップへ</button></div>
   <h1 id="result-title" class="result-headline">「使いやすさ」と「見た目」は、<br/>別の答えでもいい。</h1>
   <p class="separation-lead">性能面で合いそうなキャラと、デザインが好みに合いそうなキャラをそれぞれ表示しています。両方同じキャラになることもあります。</p>
   <div class="result-type-header"><span class="type-index">01 / GAMEPLAY</span><h2>戦い方・性能の相性</h2><p>操作・カード・ポータル・火力など、ゲーム内での使い方だけで評価</p></div>
   ${uncertainty('performance')}
   ${mainCard(best,'PERFORMANCE TOP MATCH','performance')}
   ${coverage.performance&&h.id===61?'<div class="rinne-note">✦ 特別演出：罠を仕掛けたつもりが、診断のほうに引っかかってしまった……？</div>':''}
   <div class="insight-grid"><div class="insight-panel"><h3>✦ 性能面で選ばれた理由</h3>${coverage.performance?explanation(reasons):'<p>性能面の根拠となる回答がありません。</p>'}</div><div class="insight-panel"><h3>✦ 苦手な特殊カードの扱い</h3>${excl}</div></div>
   <div class="section-heading-row"><h2>性能相性：ほかの候補4人</h2><small>実戦向きの参考候補</small></div>
   ${coverage.performance?recs(perfAlternates,'performance'):'<p class="evidence-warning">性能ランキングは表示を保留しています。</p>'}
   <div class="result-type-header appearance-heading"><span class="type-index">02 / APPEARANCE</span><h2>見た目・デザインの好み</h2><p>衣装・配色・造形・外見モチーフのみを評価。性能の得点や特殊カード除外は混ぜません。</p></div>
   ${uncertainty('appearance')}
   ${mainCard(look,'VISUAL TOP MATCH','appearance')}
   <div class="insight-grid"><div class="insight-panel"><h3>✦ 見た目の面で選ばれた理由</h3>${coverage.appearance?explanation(visualReasons):'<p>見た目の根拠となる回答がありません。</p>'}</div><div class="insight-panel"><h3>✦ 見た目診断の確認状況</h3><p>現在、104人中${visualCoverageCount}人の外見資料から仮の特徴を登録。残る${missingVisualNames.length}人は外見データ不足のため、見た目TOP5の順位付けから外しています。好きではない、という意味ではありません。</p>${missingVisualNames.length?`<details class="visual-unverified"><summary>未判定の${missingVisualNames.length}人を見る</summary><p>${missingVisualNames.map(esc).join("・")}</p></details>`:""}<p>資料・タグはユーザー確認前の暫定版です。宇宙モチーフの2問は、該当する外見タグの研究がないため現時点で出題対象外です。</p></div></div>
   <div class="section-heading-row"><h2>見た目の好み：ほかの候補4人</h2><small>性能とは別の順位</small></div>
   ${coverage.appearance?recs(visualAlternates,'appearance'):'<p class="evidence-warning">見た目ランキングは表示を保留しています。</p>'}
   <div class="insight-grid"><div class="insight-panel"><h3>✦ 最初の性格10問（参考）</h3><p>日常の考え方への回答から見られた傾向。人物の見た目や操作性能とは直結させていません。</p>${pnotes}</div><div class="insight-panel"><h3>✦ 最後の専用質問について</h3><p>専用質問には性格・見た目・戦闘が混ざるものもあります。純粋に戦闘を問う設問だけ性能スコアに少し加点し、混合質問はどちらの順位にも加算しません。</p></div></div>
   <div class="result-actions"><button type="button" class="primary-button" id="retest">もう一度診断する <span>↗</span></button><button class="secondary-button x-share-button" type="button" id="x-share-classic">Xでシェア ↗</button><button class="secondary-button" type="button" id="share">2つの結果をコピー <span>⧉</span></button><button class="secondary-button" type="button" id="result-roster">104人を見る <span>↗</span></button></div>
   <div class="feedback-card"><div class="eyebrow small">YOUR IMPRESSION</div><h3>2つの結果はどうだった？</h3><p>それぞれ別に評価できます。回答はこの端末だけに保存されます。</p><div class="dual-feedback"><div><b>性能の相性</b><div class="feedback-actions"><button type="button" data-feedback-track="performance" data-feedback="good">合ってる</button><button type="button" data-feedback-track="performance" data-feedback="ok">まあまあ</button><button type="button" data-feedback-track="performance" data-feedback="bad">違う</button></div></div><div><b>見た目の好み</b><div class="feedback-actions"><button type="button" data-feedback-track="appearance" data-feedback="good">合ってる</button><button type="button" data-feedback-track="appearance" data-feedback="ok">まあまあ</button><button type="button" data-feedback-track="appearance" data-feedback="bad">違う</button></div></div></div><p class="feedback-status" id="feedback-status" role="status"></p></div>
   <details class="answer-review"><summary>30問の回答を振り返る <span>⌄</span></summary><ol>${active.history.map(a=>{const q=E.byId(a.id);const text=a.id.startsWith('S')?D.heroes[Number(a.id.slice(1))-1]?.specificQuestion:q?.question;return `<li><span class="review-question">${esc(text)}</span><span class="review-answer">${esc(answerLabel[a.answer])}</span></li>`}).join('')}</ol></details>
   ${h.cardGuide?`<details class="card-guide"><summary>性能1位のカードガイド資料を見る <span>⌄</span></summary><div class="card-guide-body"><img loading="lazy" src="${esc(h.cardGuide)}" alt="${esc(h.name)}のカード参考資料"><p>以前提供されたカードガイド画像。現在の最適構成や採用率を保証しません。</p></div></details>`:''}
   <div class="result-note">本サイトは<strong>非公式ファンメイドのβ版</strong>です。戦闘性能も外見も、過去の研究資料から作成した暫定モデルであり、現行環境の実測値や客観的な美醜評価ではありません。</div>`;
  show('result');
  $('result-home').onclick=()=>show('home');
  const existing=safeLoad(feedbackKey,{}),saved=existing[active.createdAt]||{};
  document.querySelectorAll('[data-feedback-track]').forEach(b=>{
   const track=b.dataset.feedbackTrack;if(saved[track]===b.dataset.feedback)b.classList.add('selected');
   b.onclick=()=>{const data=safeLoad(feedbackKey,{}),old=data[active.createdAt]||{};data[active.createdAt]={...old,[track]:b.dataset.feedback};try{localStorage.setItem(feedbackKey,JSON.stringify(data))}catch(e){}document.querySelectorAll(`[data-feedback-track="${track}"]`).forEach(x=>x.classList.toggle('selected',x===b));$('feedback-status').textContent='この端末に保存しました。';};
  });
  $('retest').onclick=()=>{active=E.retest(active);completionKey='';save();renderQuiz()};
  $('result-roster').onclick=()=>openRoster('result');
  $('x-share-classic').onclick=()=>openXShare(`#コンパス 非公式｜好きから探すヒーロー診断\n性能の相性1位：${coverage.performance?h.name:'判定保留'}\n見た目の好み1位：${coverage.appearance?v.name:'判定保留'}\n#コンパス非公式ヒーロー診断`);
  $('share').onclick=async()=>{const text=`#コンパス 非公式 好きから探すヒーロー診断 v9.10.1\n性能の相性：${coverage.performance?h.name:'判定保留'}\n見た目の好み：${coverage.appearance?v.name:'判定保留'}\n${location.origin&&location.origin!=='null'?location.origin+location.pathname:''}`;try{await navigator.clipboard.writeText(text);$('share').textContent='コピーしました ✓'}catch(e){window.prompt('コピーして共有してね',text)}};
 }
 // Xへの投稿画面を開く。投稿は利用者が確認・送信し、サイトは自動投稿しない。
 function shareUrl(){return /^https?:$/.test(window.location.protocol)?window.location.origin+window.location.pathname:'';}
 function openXShare(message){
  const url=new URL('https://twitter.com/intent/tweet');
  url.searchParams.set('text',message);
  const page=shareUrl();if(page)url.searchParams.set('url',page);
  // ユーザー操作から直接開き、ブラウザにブロックされた場合だけ同じタブで遷移する。
  const win=window.open(url.toString(),'_blank');
  if(win)win.opener=null;else window.location.assign(url.toString());
 }
 function savePractical(){try{if(practicalActive)localStorage.setItem(practicalKey,JSON.stringify(practicalActive));}catch(e){}}
 function startPractical(){if(practicalActive&&practicalActive.history.length>0&&practicalActive.history.length<P.questions.length&&!confirm('途中の「実戦から探すヒーロー診断」を最初からやり直しますか？'))return;practicalActive=P.session();practicalCompletionKey='';savePractical();renderPracticalQuiz();}
 function resumePractical(){if(practicalActive&&practicalActive.history.length<P.questions.length)renderPracticalQuiz();}
 function renderPracticalQuiz(){if(!practicalActive||!P.safeSession(practicalActive))return;
  if(practicalActive.history.length===P.questions.length){renderPracticalResult();return;}
  show('practical-quiz');const i=practicalActive.history.length,q=P.questions[i];
  $('practical-number').textContent=String(i+1).padStart(2,'0');
  $('practical-progress').setAttribute('aria-valuenow',String(i));$('practical-progress').setAttribute('aria-valuetext',`${i} / ${P.questions.length}問回答済み`);
  $('practical-progress-fill').style.width=(100*i/P.questions.length)+'%';
  $('practical-down-guide').hidden=!q.id.startsWith('D');
  $('practical-card-down-guide').hidden=q.id!=='D03';
  $('practical-category').textContent=q.group;$('practical-quiz-title').textContent=q.question;
  const mode=q.responseMode||'skill';
  const guide=$('practical-answer-guide');
  if(guide)guide.textContent=mode==='style'?'普段の立ち回りについて答えてください。特定のカードやHAを持っている必要はありません。':mode==='usage'?'最近の普段のデッキや立ち回りでの使用頻度を答えてください。使えるだけなら「よく使う」ではありません。未経験は「使ったことがない」で大丈夫です。':'実際の操作経験に合わせて答えてください。「できる」だけで、そのカードを使うヒーローが上位になるわけではありません。';
  const labels=P.labelsFor(q);document.querySelectorAll('[data-practical-answer]').forEach(b=>{const label=b.querySelector('span:last-child');if(label)label.textContent=labels[b.dataset.practicalAnswer]});
  renderIntent('practical',INTENT.practical(q));
  $('practical-back').hidden=i===0;
 }
 function doPracticalAnswer(value){if(!practicalActive)return;try{practicalActive=P.answer(practicalActive,value);savePractical();if(practicalActive.history.length===P.questions.length)finishPractical();else renderPracticalQuiz();}catch(e){console.error(e);alert('「実戦から探すヒーロー診断」を進められませんでした。');}}
 function finishPractical(){const result=P.compute(practicalActive);if(practicalCompletionKey!==practicalActive.createdAt){const arr=safeLoad(practicalHistoryKey,[]);if(result.ready&&!arr.some(r=>r.sessionId===practicalActive.createdAt)){arr.unshift({id:result.ranked[0].hero.id,sessionId:practicalActive.createdAt,modelVersion:'v9.10',date:new Date().toISOString()});try{localStorage.setItem(practicalHistoryKey,JSON.stringify(arr.slice(0,100)));}catch(e){}}practicalCompletionKey=practicalActive.createdAt;}renderPracticalResult();}
 const practicalPracticeTips={"R01":"まずはポータル1か所を目標に、ダッシュで接近→確保→安全な経路で離脱する一連の動きを練習。","R02":"接近する前に敵の位置を見て、短い交戦の後に撤退するタイミングを繰り返し確認。","R03":"射程の端を維持し、敵が近づいたら攻撃を一度止めて距離を取り直す練習。","R04":"ポータル上で無理に攻撃せず、相手の攻撃を見て守る・引くを選ぶ練習。","P01":"小さな交戦でも人数差と空いたポータルを確認してから移動する習慣を付ける。","P02":"キルを追う前に残りポータル数を確認し、守る場面と攻める場面を振り返る。","P04":"味方の足止めに合わせ、追撃とポータル奪取のどちらを選ぶか振り返る。","P05":"味方の位置を見ながら敵を挟む位置取りや退路の制限を考えてみる。","P06":"残り時間とポータル数を見て、攻撃・防衛・時間稼ぎの優先度を声に出して整理。","F01":"近距離の射程を意識して、無理な突進を減らし有利な距離で交戦する練習。","F02":"遠距離の射程端を保ち、敵が近づいたら後退して再び撃てる位置を探す。","F03":"短い移動→攻撃→回避の順に動きを分け、慣れたらつなげて練習。","F05":"攻撃の予兆から反撃の機会を選び、無理な反撃を控える判断も練習。","F07":"キル機会と生存・防衛の優先順位を、試合後に見直す。","F08":"キル役を担う場面と味方を支える場面を試合後に振り返る。","K01":"近距離カードを相手の硬直に合わせて出し、射程と発生速度を覚える。","K02":"連続カード中に敵が離れないよう、相手の隙と位置を確認してから使う。","K03":"遠距離カードの発動速度と硬直を確かめ、安全な距離から命中を練習。","K04":"周囲カードの範囲を確かめ、複数人狙いと自衛を場面ごとに使い分ける。","K05":"ガード中の相手を見分け、ガードブレイクを使うタイミングを練習。","K06":"スタン構成を使う場合は、味方の位置に合わせた活用場面を試す。","K07":"罠を安全な位置に置き、敵の通るルートを見て設置場所を調整する練習。","K08":"ドアで移動した直後に守れる位置を確認し、着地後の対応を練習。","K11":"自強化カードの効果時間を確認し、強化中の行動を絞って練習。","K12":"弱体化カードを当てた後、攻撃につなぐまでの順番とタイミングを確認。","D01":"固有技で転倒を取れるキャラを試す際は、条件を確認してから練習。","D03":"カードの実際の転倒条件を確認し、ダウン後に追撃できる位置を覚える。","D02":"転倒後に敵を追うかポータルを取るか、人数差を見て選ぶ練習。","T01":"味方のHPと位置を見て、回復や支援を早すぎず遅すぎず合わせる。","T02":"妨害が成功した直後、味方の動きと攻撃チャンスを確認する練習。"};
 function practiceTip(id){return practicalPracticeTips[id]||'苦手だと感じる場面を振り返り、少しずつ操作を試して改善を確認しましょう。';}
 function practicalWeaknessGuidance(items,limit){return items.slice(0,limit).map(x=>`<li><span>${esc(x.q.question)}</span><small>回答：${esc(P.labelsFor(x.q)[x.ans])} ／ 現時点では課題と判定されました。</small><p class="practice-tip"><strong>練習のヒント：</strong>${esc(practiceTip(x.q.id))}</p></li>`).join('');}
 function practicalReasons(items,limit){return items.slice(0,limit).map(x=>`<li><span>${esc(x.q.question)}</span><small>${esc(P.labelsFor(x.q)[x.ans])}：現在の暫定モデルでは、この回答との関連があると登録されています。</small></li>`).join('');}
 function renderPracticalResult(){if(!practicalActive||practicalActive.history.length!==P.questions.length)return;
  const out=P.compute(practicalActive),top=out.ranked[0],valid=out.ready;
  const card=(item,rank)=>{const h=item.hero;const cardDown=P.cardDownProfile(h);return `<article class="practical-rank-card ${rank===1?'practical-first':''}"><div class="practical-thumb">${art(h)}</div><div class="practical-rank-body"><span class="practical-rank-small">${rank===1?'TOP RECOMMENDATION':`#${rank}`} / NO.${String(h.id).padStart(3,'0')} · ${esc(h.role)}</span><h3>${esc(h.name)}</h3><div class="practical-rating">適性指標 <strong>${item.score.toFixed(1)}</strong><span> / 100（推定勝率ではありません）</span></div>${rank===1?`<p>${esc(h.summary)}</p><p class="practical-source">主なカード傾向：${esc(h.cardKnowledge?.primary||'未確認')} ／ 根拠：${esc(h.cardKnowledge?.evidenceTier||'暫定')}</p>${cardDown?`<p class="practical-source">カード転倒の評価対象：${esc(cardDown.route)}（${esc(cardDown.basis)}）。${cardDown.assumption?"※近・周の転倒適性は検証前の仮定です。":"※貫通カードの研究に基づく暫定候補です。"} ※採用必須ではありません。</p>`:''}`:''}${practicalCompetencyPanel(h,rank!==1)}<div class="practical-why"><b>順位に影響した回答（操作・判断・使用経験）</b>${item.strengths.length?`<ul>${practicalReasons(item.strengths,rank===1?4:2)}</ul>`:'<p>このヒーローに合うと確認できた実技回答は少なめです。</p>'}</div>${item.weaknesses.length?`<section class="practical-training"><p class="practical-training-lead"><strong>練習で伸ばせる可能性があるポイント</strong> — 苦手な操作があっても、このヒーローを使ってはいけないという判定ではありません。</p><details class="practical-weak" ${rank===1?'open':''}><summary>回答から見えた課題（${item.weaknesses.length}件）と練習ヒント</summary><ul>${practicalWeaknessGuidance(item.weaknesses,3)}</ul>${item.weaknesses.length>3?`<p class="practice-more">残り${item.weaknesses.length-3}件の課題もあります。まずは上記の練習から取り組めます。</p>`:''}</details></section>`:''}</div></article>`;};
  const unverified=out.ranked.filter(r=>r.coverage<.45).length;
  $('practical-results-content').innerHTML=`<div class="result-top"><div class="result-kicker">PRACTICAL / ${P.questions.length} QUESTIONS COMPLETE</div><button type="button" class="back-link" id="practical-result-home">← モード選択へ</button></div><h1 class="result-headline" id="practical-result-title">実際の操作から探す、<br/>使いやすそうなヒーロー。</h1><p class="separation-lead">性格と見た目は一切採点しません。「操作できるか」「普段どう動くか」「実際に使う構成」を分けて、暫定的な戦闘・カード研究に照合しています。カードの操作ができるだけでは推薦加点しません。</p>
   <div class="practical-summary"><strong>回答済み（未経験を除く）：${out.known} / ${out.total}問</strong><p>${out.unknown?`未経験・判断できない ${out.unknown}問は加点も減点もしません。`:''} スコアは候補比較の暫定指標であり、勝率・勝ちやすさの実測値ではありません。今回、単なるカード操作の得意さは加点しないように変更しました。</p></div>
   ${valid?`<div class="result-type-header"><span class="type-index">PRACTICAL TOP 5</span><h2>おすすめの5人</h2><p>ここで示す苦手な操作は、練習によって改善できる可能性があります。今の順位は使用禁止・才能の判定ではありません。所持カードと現環境への最適化は未確認です。</p></div><div class="practical-ranked">${out.ranked.slice(0,5).map((item,i)=>card(item,i+1)).join('')}</div><p class="evidence-count">※実際の勝率は不明です。カードの操作が得意なことは、カードを採用するキャラへの推薦理由ではありません。研究タグの登録が少ないヒーローもいるため、全104人の完全比較ではありません。</p>`:
   `<section class="unscorable-track" role="status"><h2>判定保留</h2><p>${P.questions.length}問中、実技を判断できた回答が${out.known}問でした。判断できた回答10問以上、うち肯定側の回答が4問以上必要です。無理に1位を決めません。</p><button type="button" class="secondary-button" id="practical-revise">回答を見直す</button></section>`}
   <div class="practical-limitations"><h2>この診断で分からないこと</h2><p>試合の勝率・使用歴・キャラ所持・カードレベルは取得していません。カード研究には未確認の採用例や古い構成が含まれます。結果は「今、練習する候補」を探すための仮説です。なお近距離・周囲カードの転倒評価は今回の実験用の仮定であり、実ゲームでの保証ではありません。</p><p>現在の研究タグで裏付けが薄いヒーローが含まれるため、弱点がゼロ表示でも「弱点がない」意味ではありません。苦手な操作が表示されても「使用に向かないと確定」したわけではなく、練習やデッキ構成によって改善できる場合があります。新登録の「主力行動・必要技術・苦手時の注意点」は個別のレビュー用であり、現在の順位計算には反映していません。</p></div>
   <div class="result-actions"><button class="primary-button" type="button" id="practical-retest">実戦から探す診断をやり直す ↗</button><button class="secondary-button x-share-button" type="button" id="x-share-practical">Xでシェア ↗</button><button class="secondary-button" type="button" id="practical-share">結果をコピー</button><button class="secondary-button" type="button" id="practical-show-roster">104人を見る</button></div>
   ${valid&&top.hero.cardGuide?`<details class="card-guide"><summary>1位ヒーローの以前のカードガイドを見る <span>⌄</span></summary><div class="card-guide-body"><img loading="lazy" src="${esc(top.hero.cardGuide)}" alt="${esc(top.hero.name)}のカード参考資料"><p>旧研究資料の画像。現在の最適デッキや所持を保証しません。</p></div></details>`:''}
   <details class="answer-review"><summary>${P.questions.length}問の回答を確認する <span>⌄</span></summary><ol>${practicalActive.history.map((a,i)=>`<li><span class="review-question">${esc(P.questions[i].question)}</span><span class="review-answer">${esc(P.labelsFor(P.questions[i])[a.answer])}</span></li>`).join('')}</ol></details><div class="result-note">非公式ファンメイド / 実戦採点モデルv9.9（使用頻度と技術を分離した検証β）／104人の個別プロフィールv9.6（ペルリニエの支援型も追加／採点未反映）／暫定評価です。心理検査・公式評価・勝率予測ではありません。</div>`;
  show('practical-result');$('practical-result-home').onclick=()=>show('home');$('practical-retest').onclick=startPractical;
  $('practical-show-roster').onclick=()=>openRoster('practical-result');
  if($('practical-revise'))$('practical-revise').onclick=()=>{practicalActive=P.back(practicalActive);savePractical();renderPracticalQuiz();};
  $('x-share-practical').onclick=()=>openXShare(`#コンパス 非公式｜実戦から探すヒーロー診断\n${valid?out.ranked.slice(0,3).map((x,i)=>`${i+1}位：${x.hero.name}`).join('\n'):'判定保留'}\n※試験公開中の暫定結果\n#コンパス非公式ヒーロー診断`);
  $('practical-share').onclick=async()=>{const msg=`#コンパス 非公式 実戦から探すヒーロー診断 v9.10.1\n${valid?out.ranked.slice(0,5).map((x,i)=>`${i+1}位：${x.hero.name}`).join('\n'):'判定保留'}\n※自己申告×暫定研究の指標・質問監査v9.9`;try{await navigator.clipboard.writeText(msg);$('practical-share').textContent='コピーしました ✓';}catch(e){window.prompt('結果をコピー',msg);}};
 }
 function renderPracticalHistory(){const arr=safeLoad(practicalHistoryKey,[]),parent=$('history-area'),container=$('history-content');
  let box=$('practical-history');if(!box){box=document.createElement('div');box.id='practical-history';box.className='history-track';parent.after(box);}
  if(!arr.length){box.hidden=true;return;}box.hidden=false;
  const counts={};arr.forEach(x=>{if(Number.isInteger(x.id)&&x.id>0&&x.id<=104)counts[x.id]=(counts[x.id]||0)+1;});
  box.innerHTML=`<h2>実戦から探すヒーロー診断の1位（この端末のみ）</h2><p class="mini-history">実戦から探す ${arr.length}回 / 全利用者の記録ではありません。</p><div class="history-cards">${Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([id,n])=>`<div class="history-card"><b>${esc(D.heroes[Number(id)-1]?.name||'ヒーロー')}</b>${n}回</div>`).join('')}</div><button class="clear-history" type="button" id="clear-practical-history">この履歴を削除</button>`;
  $('clear-practical-history').onclick=()=>{if(confirm('「実戦から探すヒーロー診断」の履歴を消しますか？')){localStorage.removeItem(practicalHistoryKey);refreshHome();}};
 }
 function openRoster(from){previousScreen=from||'home';$('hero-search').value='';$('hero-role').value='';renderRoster();show('roster');}
 function renderRoster(){const search=$('hero-search').value.trim().toLowerCase(),role=$('hero-role').value;
  const arr=D.heroes.filter(h=>(!role||h.role===role)&&(!search||h.name.toLowerCase().includes(search)||String(h.id)===search));
  $('roster-count').textContent=`${arr.length} / 104 ヒーロー`;
  $('roster-grid').innerHTML=arr.map(h=>`<button type="button" class="roster-item" data-no="${h.id}" aria-label="${esc(h.name)}の詳細"><div class="roster-thumb">${art(h)}</div><span class="roster-item-body"><span class="roster-id">NO.${String(h.id).padStart(3,'0')}</span><strong class="roster-item-name">${esc(h.name)}</strong><span class="roster-item-role">${esc(h.role)}</span></span></button>`).join('');
  $('roster-grid').querySelectorAll('.roster-item').forEach(b=>b.onclick=()=>showHeroDetail(Number(b.dataset.no)));
 }
 function showHeroDetail(n){const h=D.heroes[n-1];document.querySelector('.roster-detail')?.remove();const el=document.createElement('div');el.className='roster-detail';el.innerHTML=`<button type="button" aria-label="詳細を閉じる">閉じる ×</button><div class="eyebrow small">NO.${String(n).padStart(3,'0')} / ${esc(h.role)}</div><b>${esc(h.name)}</b><p><strong>研究メモ：</strong>${esc(h.summary)}</p><p><strong>主なカード傾向（暫定）：</strong>${esc(h.cardKnowledge?.primary||"研究中")}</p><p><strong>別構成・候補：</strong>${esc(h.cardKnowledge?.optional||"未確認")}</p>${(h.innateCardDistinction||[]).map(n=>`<p><strong>固有能力との区別：</strong>${esc(n)}</p>`).join("")}${practicalCompetencyPanel(h)}<p><strong>専用質問：</strong>${esc(h.specificQuestion)}</p>`;
  $('roster-grid').before(el);el.querySelector('button').onclick=()=>el.remove();el.scrollIntoView({behavior:'smooth',block:'start'});}
 function rosterBack(){if(previousScreen==='practical-result'&&practicalActive?.history.length===P.questions.length)renderPracticalResult();else if(previousScreen==='practical-quiz'&&practicalActive?.history.length<P.questions.length)renderPracticalQuiz();else if(previousScreen==='result'&&active?.history.length===30)renderResult();else if(previousScreen==='quiz'&&active&&active.history.length<30)renderQuiz();else show('home');}
 function init(){
  try{displayQuestionIntents=localStorage.getItem(intentVisibilityKey)!=='false';}catch(e){displayQuestionIntents=true;}
  const setting=$('intent-visible');if(setting){setting.checked=displayQuestionIntents;setting.addEventListener('change',()=>{displayQuestionIntents=setting.checked;try{localStorage.setItem(intentVisibilityKey,String(displayQuestionIntents));}catch(e){};if(!$('quiz').hidden)renderQuiz();if(!$('practical-quiz').hidden)renderPracticalQuiz();});}
  const raw=safeLoad(key,null),practicalRaw=safeLoad(practicalKey,null);if(P.safeSession(practicalRaw)){practicalActive=practicalRaw;if(practicalActive.history.length===P.questions.length)practicalCompletionKey=practicalActive.createdAt;}
  if(E.safeSession(raw)&&raw.history.length<=30){active=raw;if(active.history.length===30)completionKey=active.createdAt||'';}
  $('start').addEventListener('click',startNew);$('continue').addEventListener('click',resume);$('start-practical').addEventListener('click',startPractical);$('continue-practical').addEventListener('click',resumePractical);$('practical-quit').addEventListener('click',()=>show('home'));$('practical-back').addEventListener('click',()=>{if(!practicalActive)return;practicalActive=P.back(practicalActive);savePractical();renderPracticalQuiz();});document.querySelectorAll('[data-practical-answer]').forEach(b=>b.addEventListener('click',()=>doPracticalAnswer(b.dataset.practicalAnswer))); 
  $('nav-roster').addEventListener('click',()=>openRoster(!$('practical-quiz').hidden?'practical-quiz':!$('practical-result').hidden?'practical-result':!$('quiz').hidden?'quiz':!$('result').hidden?'result':'home'));
  $('roster-back').addEventListener('click',rosterBack);
  $('hero-search').addEventListener('input',renderRoster);$('hero-role').addEventListener('change',renderRoster);
  $('brand-home').addEventListener('click',e=>{e.preventDefault();show('home')});
  $('quit-quiz').addEventListener('click',()=>show('home'));
  $('previous').addEventListener('click',()=>{if(!active)return;active=E.back(active);save();renderQuiz();});
  $('gameplay-next').addEventListener('click',()=>{if(!active||active.history.length!==10)return;active={...active,gameplayIntroSeen:true};save();renderQuiz();});
  $('gameplay-back').addEventListener('click',()=>{if(!active||active.history.length!==10)return;active=E.back(active);save();renderQuiz();});
  document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>doAnswer(b.dataset.answer)));
  if(active&&active.history.length===30)renderResult();else show('home');
 }
 document.addEventListener('DOMContentLoaded',init);
})();
