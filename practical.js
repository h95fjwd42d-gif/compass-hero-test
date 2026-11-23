/* HERO FINDER v9.10 検証β - Actual gameplay proficiency fit (separate from classic preference diagnosis).
 * All 104 hero input profiles come from the inherited v8.9 provisional combat/card research.
 * This is a rule-based self-assessment, NOT measured win rate or a metagame tier list.
 * No personality, appearance, or hero-specific confirmation question feeds this score.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.COMPASS_PRACTICAL=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const D=()=>typeof window!=='undefined'?window.COMPASS_DATA:globalThis.COMPASS_DATA;
 const Q=[
  // Operational role familiarity: these are about demonstrated skill, not preference.
  {id:'R01',group:'ロール経験',question:'スプリンターでダッシュを使い、ポータルの奪取と離脱まで安定してこなせる？',signals:{'role:スプリンター':1},weight:2.2},
  {id:'R02',group:'ロール経験',question:'アタッカーで接近のタイミングを見て、キルを狙った後に無理なく離脱できる？',signals:{'role:アタッカー':1},weight:2.2},
  {id:'R03',group:'ロール経験',question:'ガンナーで敵との距離を保ちながら攻撃を続け、自分を守れる？',signals:{'role:ガンナー':1},weight:2.2},
  {id:'R04',group:'ロール経験',question:'タンクで攻撃を受ける場面を判断し、ポータルを守り続けられる？',signals:{'role:タンク':1},weight:2.2},
  // Decision-making around the win condition.
  {id:'P01',group:'ポータル・勝ち筋',question:'敵味方の人数と位置を見て、ポータルを取りに行くタイミングを決められる？',signals:{'trait:objective':1},weight:1.45},
  {id:'P02',group:'ポータル・勝ち筋',question:'敵を追いかけてキルを狙うより、今あるポータルの防衛を優先することが多い？',signals:{'trait:hold':.65,'trait:defense':.35},weight:1.4,responseMode:'style'},

  {id:'P04',group:'ポータル・勝ち筋',question:'味方が敵を足止めしてくれた場面で、追撃よりポータル確保を優先することが多い？',signals:{'trait:objective':.7,'trait:flex':.3},weight:1.1,responseMode:'style'},
  {id:'P05',group:'ポータル・勝ち筋',question:'ポータルを守る敵に対して、無理に倒すより味方と挟んだり位置を変えて動かすことが多い？',signals:{'trait:reposition':.35,'trait:team':.35,'trait:control':.3},weight:1.05,responseMode:'style'},
  {id:'P06',group:'ポータル・勝ち筋',question:'残り時間に応じて、攻める・守る・時間を稼ぐを切り替えられる？',signals:{'trait:objective':.6,'trait:flex':.4},weight:1.4},
  // Repeatable mechanical skills.
  {id:'F01',group:'戦闘操作・間合い',question:'相手の攻撃範囲に入るリスクを管理し、近距離戦を安定してこなせる？',signals:{'trait:melee':.8,'trait:skill':.2},weight:1.5},
  {id:'F02',group:'戦闘操作・間合い',question:'敵に詰められすぎないように距離を保って、遠くから継続して攻撃できる？',signals:{'trait:range':.8,'trait:safe':.2},weight:1.5},
  {id:'F03',group:'戦闘操作・間合い',question:'移動と攻撃を並行して、相手の攻撃を避けながら戦える？',signals:{'trait:mobility':.65,'trait:skill':.35},weight:1.4},

  {id:'F05',group:'戦闘操作・間合い',question:'先に仕掛けるより、相手の攻撃を見て反撃の機会を狙うことが多い？',signals:{'trait:counter':1},weight:1.25,responseMode:'style'},

  {id:'F07',group:'戦闘操作・間合い',question:'生存や防衛より、多少のリスクを取ってでもキルの機会を優先することが多い？',signals:{'tradeoff:damageOverDurability':.55,'trait:risk':.25,'trait:aggressive':.2},weight:1.05,responseMode:'style'},
  {id:'F08',group:'戦闘操作・間合い',question:'味方と交戦するとき、妨害や支援より自分がキルを取り切る役割を担うことが多い？',signals:{'trait:burst':.45,'trait:aggressive':.35,'trait:melee':.2},weight:1.1,responseMode:'style'},
  // Cards deliberately distinguish true deck adoption from innate HA/DA/HS.
  {id:'K01',group:'カード実技・所持',question:'実戦で近距離攻撃カードを使う際、相手の硬直や位置を見て命中させられる？',signals:{'card:deck_near':1},weight:1.45},
  {id:'K02',group:'カード実技・所持',question:'実戦で連続攻撃カードを使う際、敵が逃げにくいタイミングを見て当てられる？',signals:{'card:deck_combo':1},weight:1.5},
  {id:'K03',group:'カード実技・所持',question:'実戦で遠距離攻撃カードを使う際、射程と硬直を考えて当てられる？',signals:{'card:deck_ranged':1},weight:1.45},
  {id:'K04',group:'カード実技・所持',question:'実戦で周囲攻撃カードを使う際、相手の位置を見て攻撃や自衛に活かせる？',signals:{'card:deck_area':1},weight:1.4},
  {id:'K05',group:'カード実技・所持',question:'実戦でガードブレイクカードを使う際、相手のガードを確認してから当てられる？',signals:{'card:deck_guardbreak':1},weight:1.55},
  {id:'K06',group:'カード実技・所持',question:'スタンカードを入れたデッキを、実際の試合で使うことが多い？',signals:{'card:deck_stun':1},weight:0.85,responseMode:'usage'},
  {id:'K07',group:'カード実技・所持',question:'普段のデッキに罠カードを入れ、試合中に設置して使うことが多い？',signals:{'card:deck_trap':1},weight:1.9,important:'trap',responseMode:'usage'},
  {id:'K08',group:'カード実技・所持',question:'普段のデッキに「どこにでもいけるドア」を入れ、試合で使うことが多い？',signals:{'card:deck_door':1},weight:1.9,important:'door',responseMode:'usage'},
  {id:'K11',group:'カード実技・所持',question:'普段のデッキに自強化カードを入れ、試合で使うことが多い？',signals:{'card:deck_self_buff':1},weight:1.45,responseMode:'usage'},
  {id:'K12',group:'カード実技・所持',question:'普段のデッキに敵の防御力を下げるカードを入れ、試合で使うことが多い？',signals:{'card:deck_def_down':1},weight:1.45,responseMode:'usage'},

  // Knockdown is not the same as stun or generic knockback: only independently verified routes are tagged.
  {id:'D01',group:'転倒（ダウン）・固有技',question:'普段使うヒーローで、HA・DA・ダッシュ中の接触など、カード以外の技による転倒を狙うことが多い？',signals:{'down:opener':1},weight:1.15,responseMode:'usage'},
  {id:'D03',group:'転倒（ダウン）・カード',question:'実戦で近距離・周囲・貫通などの攻撃カードから敵をダウンさせたとき、追撃の操作に対応できる？',signals:{'down:card':1},weight:1.75},
  {id:'D02',group:'転倒（ダウン）・連携',question:'敵が転倒した場面では、キルの追撃より味方の援護やポータル確保を選ぶことが多い？',signals:{'trait:objective':.55,'trait:team':.25,'trait:control':.20},weight:1.55,responseMode:'style'},
  // Teamwork and adaptability. Skills that can genuinely change who is practical to pilot.
  {id:'T01',group:'連携・立ち回り',question:'味方の位置や体力を見て、自分が支援・回復する行動を優先することが多い？',signals:{'trait:team':.55,'trait:support':.35,'trait:heal':.1},weight:1.35,responseMode:'style'},
  {id:'T02',group:'連携・立ち回り',question:'自分でキルを取りに行くより、妨害やサポートで味方の攻撃機会を作ることが多い？',signals:{'trait:control':.5,'trait:disrupt':.3,'trait:support':.2},weight:1.25,responseMode:'style'},
 ];
 // Verified down-related routes are curated separately from cardTraits and generic traits.
 // Omitted hero IDs mean 'not verified', never 'cannot cause down'.
 // opener = establishes knockdown, followup = capitalises on an existing down,
 // control = enables ally actions/objective play. Values are provisional research weights.
 // D01は「固有技で転倒を発生させる」能力のみを採点する。
 // v9.10：プレイヤー実戦訂正を優先。数値は公式の成功率ではなく暫定重み。
 // 2段目・カウンター・抽選アイテムなど、条件がある候補の重みは低めにする。
 const DOWN_PROFILES={
  11:{opener:.7,followup:1},          // ソル：従来登録（未検証）
  21:{opener:.95},                    // アダム：HAの氷柱ヒットで転倒（ユーザー訂正）
  23:{opener:1,followup:1,control:1},// かけだし勇者：ジャンプHA
  25:{opener:.95},                    // レム：HAヒットで転倒（ユーザー訂正）
  26:{opener:1,followup:1,control:.4},// カイ：従来登録（未検証）
  37:{opener:.95},                    // ソーン：HAの氷柱ヒットで転倒（ユーザー訂正）
  38:{opener:.85,followup:.7,control:.35}, // リヴァイ：従来登録（未検証）
  44:{opener:.68},                    // セイバーオルタ：HA2段目・当てにくい
  47:{opener:.28},                    // ピエール：ダッシュ中の接触。補助候補
  49:{opener:1,followup:1,control:.75}, // アイズ：従来登録
  50:{opener:.36},                    // 狐ヶ咲甘色：HAカウンター成功時・補助候補
  54:{opener:.65,control:.35},       // 芥川：従来の暫定登録（未検証）
  55:{opener:.48},                    // ゲームバズーカガール：吹き飛ばし関連・要検証
  56:{opener:.55},                    // ライザ：HAで出るアイテム次第
  58:{opener:.85,followup:.95,control:.7}, // ジョーカー：従来登録
  59:{opener:1,followup:.8,control:1}, // イグニス：従来登録
  62:{opener:.72},                    // キリト：2段目命中で転倒
  65:{opener:.95},                    // ステリア：HAヒットで転倒
  78:{opener:.9},                     // クー・シー：ブレードニャークHAヒット
  84:{opener:.95},                    // 鬼ヶ式うら：HAヒットで転倒
  90:{opener:.16}                     // チーちゃん：DAで転倒だが通常は非推奨・候補
 };
 // ここには「カード以外の技で転倒を起こす」以外の情報を混ぜない。
 // 旧記録のポロロッチョ／ノクティスは追撃記録のみであり、D01には使わない。
 // マリア、ポロロッチョ、デルミン、ルルカはユーザー訂正によりD01対象外。
 const FOLLOWUP_ONLY_PROFILES={34:{followup:.85},51:{followup:1}};
 // 新規13人の説明はユーザー報告を根拠とする。実機による網羅検証は未実施。
 const USER_DOWN_NOTES={
  21:{route:'HAの氷柱が命中',tier:'通常候補'},
  25:{route:'HAが命中',tier:'通常候補'},
  37:{route:'HAの氷柱が命中',tier:'通常候補'},
  44:{route:'HAの2段目が命中。命中難度が高め',tier:'条件付き候補'},
  47:{route:'ダッシュ中の接触で転倒',tier:'補助候補'},
  50:{route:'HAカウンター成功時',tier:'補助候補'},
  55:{route:'吹き飛ばしに伴う転倒。詳細未検証',tier:'条件付き候補'},
  56:{route:'HAで出現したアイテムの種類による',tier:'条件付き候補'},
  62:{route:'2段目が命中',tier:'条件付き候補'},
  65:{route:'HAが命中',tier:'通常候補'},
  78:{route:'HAのブレードニャークが命中',tier:'通常候補'},
  84:{route:'HAが命中',tier:'通常候補'},
  90:{route:'DAで転倒するが普段はDA主力を推奨しない',tier:'補助候補'}
 };
 const DOWN_SOURCES={
  11:'https://games.app-liv.jp/archives/229147',
  23:'https://games.app-liv.jp/archives/331084',
  26:'https://games.app-liv.jp/archives/337542',
  38:'https://games.app-liv.jp/archives/394194',
  49:'https://games.app-liv.jp/archives/456495',
  54:'https://games.app-liv.jp/archives/385088',
  58:'https://games.app-liv.jp/archives/491924',
  59:'https://games.app-liv.jp/archives/496910'
 };
 // v9.3: Retain the v9.2 pierce evidence; add the user-requested experimental assumption for near OR area card compatibility (either one suffices).
 // These are provisional routes of adopting 〖貫〗 cards, rather than guaranteed deck usage or measured usage rates.
 // Omitting an ID means "未確認", not that the hero cannot knock down via cards.
 const PIERCE_CARD_DOWN_PROFILES={
  8:{score:.72,route:'遠距離貫通',basis:'カード研究の主軸（遠距離貫通）'},
  31:{score:1,route:'近距離貫通',basis:'ぶれどらの採用例'},
  33:{score:.9,route:'近距離貫通',basis:'ぶれどらの採用例'},
  38:{score:.95,route:'連続貫通',basis:'ルー・メルク・シルワの採用例'},
  49:{score:.74,route:'周囲貫通・連続貫通',basis:'研究の別デッキ例（オールレンジ／ルー）'},
  60:{score:.55,route:'遠距離貫通',basis:'カード研究の候補（採用構成次第）'},
  68:{score:1,route:'周囲貫通',basis:'オールレンジの採用例'},
  74:{score:1,route:'近距離貫通・遠距離貫通',basis:'ぶれどら・ドリーム☆エンジェルズアローの採用例'},
  76:{score:1,route:'周囲貫通・連続貫通',basis:'オールレンジ／ルーの採用例'},
  79:{score:.95,route:'連続貫通',basis:'ルー・メルク・シルワの採用例'},
  81:{score:.88,route:'近距離貫通',basis:'ぶれどらの採用例'},
  83:{score:.9,route:'近距離貫通',basis:'ぶれどらの採用例'},
  86:{score:.83,route:'連続貫通',basis:'ゆららの採用例'},
  94:{score:.9,route:'連続貫通',basis:'ルー・メルク・シルワの採用例'},
  99:{score:.9,route:'連続貫通',basis:'ルー・メルク・シルワの採用例'}
 };
 // v9.3 EXPERIMENTAL RULE: a usable 〖近〗 or 〖周〗 attack-card profile is treated as
 // *potential* card-induced knockdown even if only one category is usable.
 // The existing data scale is 0=no, <1=near impossible / not recommended, 1~2=optional,
 // 2~3.5=usable alternative, >=3.5=strong candidate. This is NOT a factual claim
 // that every near/area card causes a true down in the game.
 const ASSUMED_CARD_DOWN_MIN_COMPAT=1;
 function inferredCardDown(hero){
  const tr=hero.cardTraits||{};
  const near=Number(tr.deck_near),area=Number(tr.deck_area);
  const qualifiedNear=Number.isFinite(near)&&near>=ASSUMED_CARD_DOWN_MIN_COMPAT;
  const qualifiedArea=Number.isFinite(area)&&area>=ASSUMED_CARD_DOWN_MIN_COMPAT;
  if(!qualifiedNear&&!qualifiedArea)return null;
  const strength=v=>v>=3.5?.90:v>=2?.76:.55;
  const assumedScore=Math.max(qualifiedNear?strength(near):0,qualifiedArea?strength(area):0);
  const names=[qualifiedNear?'近距離カード（仮定）':null,qualifiedArea?'周囲カード（仮定）':null].filter(Boolean);
  return {score:assumedScore,route:names.join('・'),basis:'v9.3の近距離／周囲いずれかでカード転倒可能という実験仮説',near:qualifiedNear,area:qualifiedArea,assumption:true};
 }
 function buildCardDownProfile(hero){
  const old=PIERCE_CARD_DOWN_PROFILES[hero.id]||null;
  const assumed=inferredCardDown(hero);
  if(!old&&!assumed)return null;
  return {score:Math.max(old?.score||0,assumed?.score||0),
   route:[old?.route,assumed?.route].filter(Boolean).join(' ／ '),
   basis:[old?.basis,assumed?.basis].filter(Boolean).join(' ＋ '),
   researchScore:old?.score||0,assumedScore:assumed?.score||0,
   near:assumed?.near||false,area:assumed?.area||false,
   assumption:!!assumed,researchPierce:!!old};
 }
 // No two-stage additive reward: use MAX for near, area and independently researched pierce.
 const CARD_DOWN_PROFILES=Object.fromEntries((D()?.heroes||[]).map(h=>[h.id,buildCardDownProfile(h)]).filter(x=>x[1]));
 function cardDownProfile(hero){return CARD_DOWN_PROFILES[hero.id]||buildCardDownProfile(hero);}
 const CARD_DOWN_GENERAL_SOURCES={
  rules:'https://games.app-liv.jp/archives/375076',
  pierce:'https://gamerch.com/compass/454702',
  shield:'https://games.app-liv.jp/archives/376131',
  near:'https://gamerch.com/compass/454743'
 };
 const DOWN_GUIDE='転倒（ダウン）はスタン・単なるノックバック・打ち上げとは区別します。v9.3実験版は「近距離または周囲カードを使えるヒーローはカード転倒も狙える」と暫定仮定しています。実際の転倒はカード効果・ロール・ガード等で変わり、すべてのカードが転倒させるわけではありません。';
 // One dimension cannot stand in for another: skill at a card does NOT mean the deck is a good fit.
 //  - skill: observed ability/limitation, not card preference
 //  - style: which practical role/outcome is usually chosen, not physical proficiency
 //  - usage: real experience choosing a particular card, not guaranteed compatibility
 const RESP={yes:1,sometimes:.3,no:-1.2,unknown:0};
 const STYLE_LABELS={yes:'よくある',sometimes:'場面による',no:'あまりない',unknown:'判断できない'};
 const USAGE_LABELS={yes:'よく使う',sometimes:'ときどき使う',no:'ほとんど使わない',unknown:'使ったことがない'};
 function labelsFor(q){return q?.responseMode==='style'?STYLE_LABELS:q?.responseMode==='usage'?USAGE_LABELS:answerLabels;}
 // The answer contribution is intentionally asymmetric: knowing how to use a card
 // only removes a possible barrier; it does not increase the rank of every hero
 // able to equip that card. Weaknesses affect only strongly related cards, gently.
 function answerFactor(q,answer,rel){
  if(answer==='unknown')return 0;
  if(q.responseMode==='style')return ({yes:.7,sometimes:.22,no:-.12})[answer]||0;
  if(q.responseMode==='usage')return ({yes:.35,sometimes:.1,no:-.06})[answer]||0;
  if(q.id.startsWith('K')||q.id==='D03'){
   if(answer!=='no'||rel<.76)return 0;
   return (q.id==='K07'||q.id==='K08')?-.75:-.40;
  }
  return ({yes:.65,sometimes:.18,no:-.9})[answer]||0;
 }

 const answerLabels={yes:'安定してできる',sometimes:'ある程度できる',no:'苦手・できない',unknown:'未経験・判断できない'};
 const knownTraits=new Set(['mobility','objective','disrupt','sustain','flex','card','melee','guardbreak','ultimate','range','hold','defense','team','support','tank','setup','knock','zone','safe','skill','risk','burst','aggressive','counter','charge','dual','late','heal','reposition','control']);
 const KNOWN_CARD=/^deck_[a-z_]+$/;
 function relevance(hero,q){
  let total=0,used=0;
  for(const [key,w] of Object.entries(q.signals)){
   total+=w;const [kind,tag]=key.split(':');let r=0;
   if(kind==='role')r=hero.role===tag?1:0;
   else if(kind==='trait'&&knownTraits.has(tag)){
    if(Object.prototype.hasOwnProperty.call(hero.traits||{},tag)){
     const v=Number(hero.traits[tag]);r=v>=3.2?Math.min(1.12,.45+(v-3.2)*.4):v>=2.5?.24:0;
    }
   }else if(kind==='card'&&KNOWN_CARD.test(tag)){
    if(Object.prototype.hasOwnProperty.call(hero.cardTraits||{},tag)){
     const v=Number(hero.cardTraits[tag]);r=v>=3.5?Math.min(1.1,.8+(v-3.5)*.2):v>=2?.26:0;
    }
   }else if(kind==='down'){
    const v=tag==='card'?cardDownProfile(hero)?.score:DOWN_PROFILES[hero.id]?.[tag];
    // If route not researched, remain neutral; only the card tag reads CARD_DOWN_PROFILES.
    if(Number.isFinite(v))r=Math.max(0,Math.min(1,v));
   }else if(kind==='tradeoff'&&tag==='damageOverDurability'){
    if(Object.prototype.hasOwnProperty.call(hero.combatTradeoffs||{},tag)){
     const v=Number(hero.combatTradeoffs[tag]);r=v>=2.65?Math.min(1,(v-1.8)/2):0;
    }
   }
   used+=w*Math.max(0,r);
  }
  return total?Math.min(1.15,used/total):0;
 }
 function session(){return {version:6,history:[],questionId:Q[0].id,createdAt:new Date().toISOString()};}
 function safeSession(s){return !!(s&&s.version===6&&Array.isArray(s.history)&&s.history.length<=Q.length&&s.history.every((a,i)=>a&&a.id===Q[i].id&&Object.hasOwn(RESP,a.answer))&&(s.questionId===(Q[s.history.length]?.id||null)));}
 function answer(s,v){if(!safeSession(s)||!Object.hasOwn(RESP,v)||!s.questionId)throw Error('不正な実戦診断セッション');const history=[...s.history,{id:s.questionId,answer:v}];return {...s,history,questionId:Q[history.length]?.id||null};}
 function back(s){if(!safeSession(s)||!s.history.length)return s;const history=s.history.slice(0,-1);return {...s,history,questionId:Q[history.length].id};}
 function compute(s){if(!safeSession(s))throw Error('不正な実戦診断セッション');
  const answers=Object.fromEntries(s.history.map(a=>[a.id,a.answer]));
  const rows=D().heroes.map(hero=>{
   let raw=0,total=0,verified=0,covered=0,weaknesses=[],strengths=[];
   for(const q of Q){const rel=relevance(hero,q);if(rel<.1)continue;
    const opportunity=q.weight*rel;
    const ans=answers[q.id];
    const factor=ans?answerFactor(q,ans,rel):0;
    // The ability to equip/play a card (without a meaningful limitation) is
    // not evidence for recommending that hero. Exclude these neutral checks
    // from both the numerator AND denominator, coverage and tie breaks.
    const readinessOnly=(q.id.startsWith('K')||q.id==='D03')&&!q.responseMode;
    if(!readinessOnly||factor<0)total+=opportunity;
    if(!ans||ans==='unknown'||factor===0)continue;
    covered+=opportunity;verified++;
    const delta=opportunity*factor;raw+=delta;
    const point={q,ans,delta,rel};
    if(ans==='no'&&delta<0&&q.responseMode!=='style'&&q.responseMode!=='usage'&&rel>.28)weaknesses.push(point);
    else if(delta>0&&rel>.28)strengths.push(point);
   }
   // The added prior tempers small-data / rare-tag false positives.
   // Missing profiles and unknown answers contribute neither positive nor negative evidence.
   const score=Math.round(Math.max(0,Math.min(99,50+45*raw/(total+5)))*10)/10;
   strengths.sort((a,b)=>b.delta-a.delta);weaknesses.sort((a,b)=>a.delta-b.delta);
   return {hero,score,raw,coverage:total?covered/total:0,matchedQuestions:verified,totalEvidence:total,strengths,weaknesses};
  });
  rows.sort((a,b)=>b.score-a.score || b.coverage-a.coverage || a.hero.id-b.hero.id);
  const known=s.history.filter(a=>a.answer!=='unknown').length;
  const positives=s.history.filter(a=>a.answer==='yes'||a.answer==='sometimes').length;
  const distinct=new Set(s.history.filter(a=>a.answer!=='unknown').map(a=>a.answer)).size;
  return {ranked:rows,known,positives,lowDistinction:distinct<2,unknown:s.history.length-known,total:Q.length,ready:known>=10&&positives>=4,model:'実技の障壁＋普段の立ち回り＋実使用構成（暫定）。D01は固有技による転倒発生のみ。候補はユーザー実戦修正／未実機検証。カード操作だけで加点しない。'};
 }
 return {questions:Q,answerLabels,labelsFor,answerFactor,session,safeSession,answer,back,compute,relevance,RESP,DOWN_PROFILES,FOLLOWUP_ONLY_PROFILES,USER_DOWN_NOTES,DOWN_SOURCES,DOWN_GUIDE,CARD_DOWN_PROFILES,PIERCE_CARD_DOWN_PROFILES,ASSUMED_CARD_DOWN_MIN_COMPAT,inferredCardDown,cardDownProfile,CARD_DOWN_GENERAL_SOURCES};
});
