# 第9段階 検証
- ローカル試作 v9.10.8。正式採用・デプロイなし。
- test-v9107-adaptive.js PASS（250仮想回答、106候補、30問、104人、分岐、戻る）
- test-v9106-reviewed-tags.js PASS（600回帰）
- test-v9105-lab.js PASS（800 A/B、友人旧固定TOP5維持）
- test-card-model.js PASS
- practical.js / data.js / data.json 原本とSHA256一致。
- ブラウザ、localStorage実機未実施。ゲーム仕様最新数値未再検証。
- 本人30回答・友人適応30回答未受領。実測順位の再現と精度評価は未完了。
- COMPARISON_STAGE9.json は仮想回答規則による比較。出題経路も異なるため因果・精度は断定不可。
