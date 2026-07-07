# WORKLOG — hpp（Human Persona Platform）

## 2026-07-06 11:39 既存6ファイルのブラッシュアップ（九星気学の統合）

### 受けた指示
九星気学や「MBTI＋Big Five＋エニアグラム」を組み合わせたWEB無料診断サイトを作りたい。占い業界向けや採用・企業側の診断に使えるツールにしたい。hpp/ に置いた既存mdを読み込んだ上でブラッシュアップしてほしい。

### 対応内容
既存6ファイル（MBTI＋Big Five＋エニアグラムのみで九星気学は未反映だった）に、九星気学を「占い版のみ」の追加レイヤーとして統合。企業・採用版には混ぜず、同じPersona Engineから2つのSKU（占い版／企業版）を分岐させる「二枚看板モデル」を設計。

- `Human_Persona_Platform_企画設計書.md` — 差別化戦略セクション追加、人格データモデル・ロードマップ・マネタイズ・画面遷移・UI構成・ER概要に九星気学を反映
- `HPP_個人開発向け設計書.md` — Phase3・DB設計・Persona Engine入力・マネタイズ・ロードマップに九星気学を反映
- `01_人格診断ロジック設計書.md` — 本命星算出式（節分基準・桁和・mod9(11-s)）、五行対応表、Personaベクトルへの加点マッピング、五行相生相剋を使った相性補正を追加。既存プロジェクト `bodyclystal/lib/kyusei.ts` に検証済みの九星気学計算ロジック（本命星・月命星・日命星・傾斜宮）があることを発見し、流用元として明記
- `02_画面ワイヤーフレーム.md` — 生年月日入力画面、占い版／企業版で結果画面・CTAを分岐、占い師向け画面を追加
- `03_AIプロンプト設計書.md` — 占い版（宿命的トーン）／企業版（心理統計トーン）でプロンプトを分岐、企業版には九星気学データを渡さない設計を明記
- `04_DB完全設計.md` — `kyusei_results` テーブル、`persona_profiles_fortune` テーブル、`users.birth_date` を追加

### 次のアクション候補
- Phase3着手時に `bodyclystal/lib/kyusei.ts` の本命星ロジックをHPP側に移植
- 本命星算出式は実装前に市販の早見表と再確認（流派による端数差異のリスクあり）

## 2026-07-06 12:05 MBTIの元情報ソース整理とブランド名「タイプコンパス」への統一

### 受けた指示
九星気学・MBTI・Big Five・エニアグラムの元の情報（設問・理論）をどう収集するか質問があり、回答の中でMBTIは商標のため独自設問で実装する必要があると説明。「ユング心理学ベースの4軸診断」という表現をもっとキャッチにして反映してほしいという指示。

### 対応内容
ユーザー向け名称を**「タイプコンパス」**に決定（4軸＝方角のメタファー、商標「MBTI」を避けつつ直感的に伝わる名前）。裏側の理論・DBスキーマ（`mbti_results`等）は変更せず、画面表示・マネタイズ商品名・AIプロンプト出力の3レイヤーで表記を統一。

- `Human_Persona_Platform_企画設計書.md` — 「1.5 差別化戦略」に「ネーミング：タイプコンパス」の節を新設し、命名理由（商標リスク回避）を明記。レイヤー表・Phase1・画面遷移・UI構成の表記を置換
- `HPP_個人開発向け設計書.md` — MVP機能・Persona Engine入力・AIプロンプト入力・UI設計・ロードマップの表記を置換
- `01_人格診断ロジック設計書.md` — 「MBTI変換」を「タイプコンパス変換（ユング理論ベースの4指標）」に改題し、命名の背景を注記
- `02_画面ワイヤーフレーム.md` — 結果画面・占い師向け画面の表記を置換
- `03_AIプロンプト設計書.md` — 入力・各プロンプト文の表記を置換。加えてAIが生成結果に誤って「MBTI」と出力しないよう、各プロンプトに「『MBTI』という単語を使わない」旨の明示指示を追加
- `04_DB完全設計.md` — `mbti_results`テーブルに「ユーザー向け表示名：タイプコンパス」の注記を追加（テーブル名自体は変更なし）

### 補足（次回に活かす情報）
- Big Five：IPIP-NEO（国際性格特性項目プール）が商用利用も無料のパブリックドメイン。設問調達の標準ルートとして推奨
- エニアグラム：理論はパブリックドメインだが公式テスト（RHETI等）は著作権あり。設問は自作する
- 「タイプコンパス」の設問は、ユング理論（E/I・S/N・T/F・J/P）を参照しつつ完全に独自設計する必要がある（公式MBTI設問の翻訳・流用は不可）

## 2026-07-06 12:20 構築開始：Next.jsフルスタック基盤＋タイプコンパス診断ロジック

### 受けた指示
「構築を進めてもらえますか」との指示を受け、着手範囲を確認。技術スタックはNext.jsフルスタック（API Routes＋Prisma＋PostgreSQL、Laravelは使わず1サーバーで完結）を採用。着手範囲は「タイプコンパス診断ロジックのみ」に決定。

### 対応内容
- `create-next-app`でTypeScript＋Tailwind＋App Router＋ESLint構成を`hpp/`直下に初期化（`npx create-next-app`はディレクトリに既存ファイルがあると拒否するため、一時ディレクトリで生成してから移動）
- `package.json`の`name`を`hpp`に修正
- テスト用に`vitest`を追加し、`npm test`スクリプトを設定
- `src/lib/type-compass.ts` — タイプコンパス（E/I・S/N・T/F・J/P）の独自設問24問（4軸×6問、公式MBTI設問は不使用）と採点ロジックを実装。5件法Likertで各軸の優勢ポール・強度(%)・Personaベクトル用の特性値（社交性・内省性・現実性・創造性・論理性・共感性・計画性・柔軟性）を算出
- `src/lib/type-compass.test.ts` — 極端回答（ESTJ/INFP）・中間回答（タイブレーク）・未回答エラーの4テストを作成、全て成功
- `npm run build`・`npx eslint`で型チェック／ビルド／lintを確認、いずれも成功

### 次のアクション候補
- Prismaスキーマを`04_DB完全設計.md`に基づいて定義し、`questions`/`answers`テーブルと連携
- タイプコンパスの設問をUI（診断画面）に接続
- Big Five・エニアグラムの採点ロジックも同様の方式で実装

## 2026-07-06 12:35 チェック実施＋診断ロジックの作り込み（BigFive・エニアグラム・九星気学・Persona Engine）

### 受けた指示
①タイプコンパス実装のチェック（npm install / build / test / eslint / 設問文言の商標リスク目視レビュー）、②診断項目の作り込み。

### チェック結果（すべてOK）
- `npm install` → 成功
- `npm run build` → ビルド・型チェック成功
- `npm test` → 既存4テスト全pass（ESTJ/strength83・INFP・タイブレークESTJ/50・未回答エラー）
- `npx eslint src/lib/type-compass.ts src/lib/type-compass.test.ts` → エラーなし
- 設問文言レビュー → 24問すべて独自の日本語Likert文。公式MBTI設問は強制選択式（A/B二択）で形式自体が異なり、翻訳・流用は見られない。商標的にもUI上「タイプコンパス」表記で問題なし

### 対応内容（作り込み）
設計書`01_人格診断ロジック設計書.md`に基づき、残りの診断モジュールと統合エンジンを純粋ロジック＋Vitestで実装：

- `src/lib/big-five.ts` — Big Five 30問（5因子×6問、順方向3＋逆転3）。IPIP方針参考の独自設問。逆転項目で黙従傾向を打ち消す設計。0〜100正規化＋設計書対応のtraitVector（安定性=神経症傾向の逆転）
- `src/lib/enneagram.ts` — エニアグラム27問（9タイプ×3問、独自設問）。基本タイプ（同点は小番号）＋ウイング（円環の隣接1↔9対応、高得点側）＋全タイプスコア
- `src/lib/kyusei.ts` — 本命星（節分2/4基準・桁和・mod9(11-s)）、五行対応、相生/相剋の±10点相性補正。日付バリデーション付き。※立春は2/4固定の簡易版（Phase3でbodyclystalの節入りロジック移植時に精密化）
- `src/lib/persona-engine.ts` — 8軸Personaベクトル統合。企業版（TC30%+BF50%+EN20%、九星不参照）／占い版（TC20%+BF35%+EN15%+九星30%、gogyou_bonus内訳付き）の2 SKU分岐、相性ロジック（価値観40%+性格30%+動機30%＋占い版のみ五行±10）
- テスト4ファイル追加（big-five/enneagram/kyusei/persona-engine）。計33テスト全pass、build・eslintもクリーン

### 設計判断メモ
- 単独診断で直接測れないPersona軸（Leadership等）は関連スコアの平均で近似（persona-engine.ts内にマッピング定義。エニアグラム→8軸のマッピングは独自設計）
- 五行の相性補正は「両者とも占い版プロフィールの場合のみ」適用（企業版に九星を混ぜない原則の徹底）

### 次のアクション候補
- 診断UI（設問画面・結果画面）への接続。設問合計は24+30+27=81問なのでステップ分割UIを推奨
- Prismaスキーマ定義（`04_DB完全設計.md`ベース）
- 立春日付の精密化（bodyclystal/lib/kyusei.tsの節入りロジック移植）

## 2026-07-06 12:50 UI実装用の指示コンテキスト作成（05_UI実装指示書.md）

### 受けた指示
UIの作り込みに入るため、デザインを含めた指示コンテキストを作成してほしい。

### 対応内容
`05_UI実装指示書.md`を新規作成。UI実装セッションが単体で着手できるよう、以下を1枚に統合：

- **スコープ**：MVP＝TOP／属性入力／診断画面（81問・6問×14ページ）／結果画面（2 SKU分岐）。DB・認証・決済・AI生成・マイページは対象外。結果はsessionStorageで受け渡し
- **技術前提**：Next.js 16の要注意点を同梱docs（`node_modules/next/dist/docs/`）から抽出して明記 — `params`/`searchParams`はPromise（同期アクセス完全廃止）、`next lint`廃止、`middleware`→`proxy`。Tailwind v4はCSS-first（`@theme`、config不要）
- **ロジックAPI一覧**：実装済み5モジュールの関数シグネチャと「未回答でthrow」の契約を記載。UIはロジックを呼ぶだけで変更不要と明示
- **ルーティング**：`/diagnosis/[variant]/start|questions|result`（variant = fortune / business）
- **デザインシステム**：占い版=紫×金／企業版=青×スレートの`@theme`カラーパレット（コード付き）、Noto Sans JPへの差し替え、コンポーネント一覧（LikertScale・RadarChart等8個）、レーダーチャートの純SVG実装方針（ライブラリ追加禁止）
- **絶対ルール**：UI文言に「MBTI」を出さない（タイプコンパス表記）、企業版画面に九星気学を渡さない
- **完了条件チェックリスト**と文言サンプル

### 次のアクション候補
- `05_UI実装指示書.md`に沿ってUI実装を開始（globals.cssテーマ→共通コンポーネント→TOP→start→questions→resultの順）

## 2026-07-06 14:00 UI実装完了（TOP・属性入力・診断81問・結果画面の2 SKU分岐）

### 受けた指示
`05_UI実装指示書.md`に沿ってUIを実装。

### 対応内容
指示書どおりMVPの4画面を実装し、ブラウザで占い版・企業版とも通し動作を確認：

- `src/app/globals.css` — `@theme`にデザイントークン定義（占い版=紫×金／企業版=青、ニュートラル、チャート色）。ダークモード削除しライト固定
- `src/app/layout.tsx` — Noto Sans JP＋Geist Mono、`lang="ja"`、metadata更新
- `src/lib/diagnosis-flow.ts`＋テスト — 81問の結合・6問×14ページ分割・セクション判定・進捗判定・`StoredResult`型（+7テスト、計40テスト）
- `src/lib/ui-labels.ts` — 軸・Big Five・Persona8軸の日本語ラベル
- `src/lib/use-session-item.ts` — sessionStorage読み取りフック（`useSyncExternalStore`。React 19の`set-state-in-effect` lintルール対応）
- `src/components/` — Button/Card/ProgressBar/LikertScale/AxisBar/RadarChart（純SVG・5軸8軸兼用）/KyuseiCard/BirthForm/QuestionsFlow/ResultView
- `src/app/page.tsx` — TOP（2 SKUのCTA分岐・特徴・料金）
- `src/app/diagnosis/[variant]/start|questions|result/page.tsx` — `generateStaticParams`＋`dynamicParams=false`で fortune/business のみSSG。paramsはPromise（Next.js 16）

### 検証結果
- `npm run build`／`npm test`（40件）／`npx eslint src/` すべてクリーン
- ブラウザ通し確認：占い版（1990/6/15→一白水星・五行「水」表示、エニアグラム非表示）／企業版（エニアグラム表示・九星気学完全非表示）
- ガード動作：結果なしで結果画面直リンク→TOPへ、生年月日なしで占い版設問→startへ
- モバイル375px：Likertの横はみ出しを検出し、ラベルを円の下に置くレイアウトに修正して解消
- 画面文言に「MBTI」なし（grep確認）

### 次のアクション候補
- AI鑑定/AI分析のAPI実装（`03_AIプロンプト設計書.md`ベース、プレースホルダー枠は設置済み）
- Prismaスキーマ＋結果のDB保存（現状はsessionStorageのみ＝タブを閉じると消える）
- 結果画面のOGP画像／PDF出力

## 2026-07-06 14:20 結果画面のキャプション充実（4軸・本命星・エニアグラム、各150文字程度）

### 受けた指示
結果の4軸に対してのキャプションを充実させたい。一白水星なら特徴・長所・短所が書いてあるような、150文字程度の設定を。

### 対応内容
- `src/lib/result-captions.ts` — 新規作成。「特徴＋長所＋短所＋ひとことアドバイス」の構成で各150文字程度：
  - `POLE_CAPTIONS` — タイプコンパス8ポール（E/I/S/N/T/F/J/P）。結果画面では各軸の優勢側のみ表示
  - `KYUSEI_CAPTIONS` — 本命星9種（一白水星〜九紫火星）。従来の五行別5種の短文を置き換え
  - `ENNEAGRAM_CAPTIONS` — エニアグラム9タイプ（企業版のみ表示）
- `src/lib/result-captions.test.ts` — 全キャプションが100〜200文字に収まること、「長所」と短所への言及を含むこと、「MBTI」を含まないことを機械的に検証（+4テスト、計44テスト）
- 表示組み込み：`AxisBar`（軸バーの下に優勢ポールのキャプション）、`KyuseiCard`（五行別短文→本命星別キャプションに差し替え）、`ResultView`（エニアグラムカードにキャプション追加）

### 検証結果
- build／test（44件）／eslint すべてクリーン
- ブラウザ確認：占い版（INFP→I/N/F/Pの4キャプション、一白水星のキャプション）、企業版（タイプ1のエニアグラムキャプション）の表示を確認

### 次のアクション候補
- Big Fiveレーダーにも因子別（高低別）のキャプションを追加する場合は、スコアの高低で文面を分岐する設計が必要（現状は未対応）

## 2026-07-06 14:40 Big Five因子別キャプション（スコア帯3段階×5因子）

### 受けた指示
「次の実装を進めたい」→ 選択肢を提示し「Big Fiveキャプション」を選択。

### 対応内容
- `src/lib/result-captions.ts` — `BIG_FIVE_CAPTIONS`（5因子×3スコア帯=15キャプション、各150文字程度・特徴＋長所＋短所＋アドバイス構成）、`captionBand()`（高め≥60／中間41〜59／低め≤40）、帯の表示名（高め／バランス／控えめ）を追加。安定性「控えめ」（=神経症傾向高め）は繊細さを強みとして先に置く支援的な文面にした
- `src/components/ResultView.tsx` — Big Fiveカードのレーダー下に、因子名＋スコア＋帯チップ＋キャプションのリストを追加（チップはSKU色に追従）
- テスト+2（15キャプションの文字数・構成チェック、captionBandの境界値 60/59/41/40）→ 計46テスト

### 検証結果
- build／test（46件）／eslint すべてクリーン
- ブラウザ確認：因子ごとに回答パターンを変えて診断し、「高め」「バランス」「控えめ」3帯すべての表示を確認（社交性0→控えめ、責任感50→バランス、共感性75→高めなど）

### 次のアクション候補
- AI鑑定/AI分析のAPI実装（`03_AIプロンプト設計書.md`ベース、ANTHROPIC_API_KEYが必要）
- Prismaスキーマ＋結果のDB保存
- 結果画面のOGP画像／PDF出力

## 2026-07-06 17:20 DB保存（Prisma）＋共有用結果URL（/r/[id]）

### 受けた指示
「次の実装を」→ AI連携のコスト試算を提示 →「AI連携を後にしてください」との指示。残る本命のDB保存（Prisma）を実施。

### 対応内容
- **Prisma 7 + SQLite** を導入（`prisma` `@prisma/client` `@prisma/adapter-better-sqlite3` `dotenv`）。Prisma 7の破壊的変更に対応：datasourceの`url`はschemaに書けず`prisma.config.ts`へ、generatorは`prisma-client`（出力先`src/generated/prisma`、eslint ignore追加）、PrismaClientはドライバアダプタ（`PrismaBetterSqlite3`）必須
- `prisma/schema.prisma` — `04_DB完全設計.md`ベース。認証未実装のためusersの代わりに匿名の`diagnoses`を親に、`mbti_results`（type/ei/sn/tf/jp）・`bigfive_results`・`enneagram_results`・`kyusei_results`・`persona_profiles`（variantType＋gogyou_bonus）を1:1で紐づけ。`diagnoses.payload`に表示再現用のJSONスナップショットも保持（正規化列は将来の集計・管理画面用）
- `src/lib/db.ts` — PrismaClientシングルトン（devホットリロード対策のglobal保持）
- `src/lib/actions.ts` — Server Function `saveDiagnosis`。外部から直接POST可能なため形式バリデーション付き。ネストcreateで全テーブルへ保存し共有IDを返す
- `src/components/ResultSections.tsx` — 結果表示をResultViewから純粋コンポーネントに分離（Server Componentからも描画可能）
- `src/app/r/[id]/page.tsx` — **共有用結果ページ**（動的レンダリング、DBから復元、存在しないIDは404）
- `ShareLink.tsx` — 結果画面上部に共有URL＋コピーボタン（診断完了時にDB保存成功するとsessionStorageの`shareId`経由で表示）
- 保存失敗時（オフライン等）は従来どおりsessionStorageのみで診断体験を継続（graceful degradation）

### 検証結果
- build（`/r/[id]`はDynamic）／test（46件）／eslint すべてクリーン
- ブラウザ通し：占い版81問→保存→共有URL表示→`/r/[id]`をサーバーレンダリングで完全表示。存在しないIDは404
- SQLite実データ確認：占い版=birthDate 1990-06-15・INFP（ei=48）・一白水星/水・fortune profile（gogyouBonus JSON）／企業版=**kyusei行0件・birthDate null・standard profile**（二枚看板の原則をDB層でも確認）

### 補足（本番移行）
- 本番はPostgreSQLへ：`schema.prisma`のprovider変更＋アダプタを`@prisma/adapter-pg`に差し替え＋`DATABASE_URL`変更＋`prisma migrate`
- `dev.db`と`.env`はローカル専用。git管理開始時は`.gitignore`に追加すること（現状このディレクトリは未git化）

### 次のアクション候補
- AI鑑定/AI分析のAPI実装（保留中。モデル候補と費用試算はセッション記録参照：Sonnet 5で1回約3.6〜5.4円）
- 共有ページのOGP画像（タイプ＋レーダーの画像生成）
- 相性診断UI（persona_profiles同士の`calcCompatibility`は実装済み、画面が未着手）

## 2026-07-06 18:00 相性診断UI（/compatibility）

### 受けた指示
「次の実装は？」→ 候補を提示し「相性診断UI」を選択。

### 対応内容
実装済みの`calcCompatibility`（価値観40%＋性格30%＋動機30%、占い版同士のみ五行±10）に画面を接続：

- `src/app/compatibility/page.tsx` — 入力画面。共有URL（または診断ID）を2つ入力。`?a=<id>`でプリフィル対応
- `src/lib/diagnosis-flow.ts` `extractShareId()` — 共有URL/生IDの両対応パーサ（+3テスト、計49テスト）
- `src/components/CompatibilityForm.tsx` — バリデーション（未入力・同一ID）付きフォーム → `/compatibility/[a]/[b]`へ遷移
- `src/app/compatibility/[a]/[b]/page.tsx` — **結果ページ（Server Component・URL自体が共有可能）**。DBから2件の診断を復元して相性を計算。表示：ふたりの概要チップ（タイプ＋本命星）／相性スコア＋ランク（4段階キャプション付き）／内訳バー（価値観・性格・動機）／五行の相性カード（占い版同士のみ：相生+10・相剋-10・同五行±0）／Personaベクトル重ね合わせレーダー（凡例付き）
- `RadarChart.tsx` — `secondary`プロップ追加（2人目を破線で重ね描き）
- 導線追加：TOPに相性診断セクション、結果画面・共有ページに「ふたりの相性を診断する」カード（共有IDをプリフィル）
- テーマ分岐：占い版同士=紫×金＋五行表示／それ以外（企業版同士・混合）=青の「組織適性」表示で五行は非表示

### 検証結果
- build（/compatibility系はDynamic）／test（49件）／eslint すべてクリーン
- ブラウザ確認：一白水星（水）×三碧木星（木）→ 相生+10点でスコア100・「非常に良い」・五行カード表示。占い版×企業版の混合 → 五行なし・組織適性テーマ・95点。フォームのプリフィル／URL入力からのID抽出／存在しないIDペアの404／モバイル375px表示をすべて確認

### 補足
- `04_DB完全設計.md`の`compatibility`テーブルは未使用（計算が決定的なためオンザフライ算出。AI分析文を保存する段階で導入予定）

### 次のアクション候補
- AI鑑定/AI分析（保留中）— 相性ページのAI分析文生成も同時に実装できる
- 共有・相性ページのOGP画像
- マイページ（認証）

## 2026-07-06 18:40 GitHub公開＋Supabase(PostgreSQL)対応（Vercelデプロイ準備）

### 受けた指示
GitHub・Vercelへアップできるか？→ 課題（未git化・VercelでSQLite不可）を説明し、フル機能公開（B案）で進行。GitHubリポジトリURLとSupabaseプロジェクトの提供を受けた。

### 対応内容
- **PostgreSQL切り替え**: `schema.prisma`のproviderを`postgresql`へ、アダプタを`@prisma/adapter-pg`（`PrismaPg`）へ差し替え。`@prisma/adapter-better-sqlite3`と`dev.db`は削除。DATABASE_URL未設定時は明示エラー
- `package.json` — `build`を`prisma generate && next build`に（Vercelビルド対応）
- `.gitignore` — `/src/generated/`（Prisma生成物）、`*.db`、`/.claude/`を追加。`.env*`は元から除外済み
- `.env` — Supabase接続文字列のプレースホルダ＋取得手順コメント（git管理外）
- **git初期化＆push**: `templeobrigado-cyber/Human_Persona_Platform` のmainへ初回コミットをpush。機密・生成物が含まれないことをステージ内容で確認済み
- 検証: DB接続なしでbuild／test（49件）／eslintすべてクリーン（/r・/compatibilityは動的レンダリングのためビルド時DB不要）

### 対応内容（続き・Supabase接続完了まで）
- Supabaseの「Connect」→「ORM」タブから取得した接続文字列を採用（`DATABASE_URL`=Transaction pooler:6543+pgbouncer=true／`DIRECT_URL`=Session pooler:5432）の2本立て構成に対応：`prisma.config.ts`のdatasource urlを`DIRECT_URL`優先に変更（CLI操作はプール接続を張れないセッションを使うため）。アプリ実行時（`src/lib/db.ts`）は引き続き`DATABASE_URL`（プール接続）
- パスワード設定でのつまずきを解決：①Database password再発行は確認ダイアログ「Generate a password」経由と判明、②ユーザーが`.env`の`[YOUR-PASSWORD]`プレースホルダを置換する際に**大括弧ごと**残してしまい認証エラー（P1000）→ パスワード先頭末尾が`[`/`]`かをスクリプトでチェックして特定・解消
- `npx prisma db push`成功。Supabase上に6テーブル（diagnoses/mbti_results/bigfive_results/enneagram_results/kyusei_results/persona_profiles）を作成
- ブラウザ通し確認：占い版81問回答→Supabaseへ保存→共有ID発行→`/r/[id]`をサーバーレンダリングで表示。`pg`クライアントでSupabase上のテーブル一覧と`diagnoses`件数（1件）を直接確認
- build／test（49件）／eslint 最終確認すべてクリーン

### 残作業（ユーザー操作）
1. Vercel → Add New Project → GitHubリポジトリをimport → 環境変数`DATABASE_URL`と`DIRECT_URL`（ローカルの`.env`と同じ値）を設定 → Deploy

### 補足
- Supabaseの「Publishable key（sb_publishable_…）」はREST/JSクライアント用でPrismaでは使わない（公開されても問題ない設計のキー）
- ローカル開発もSupabaseを共用する（SQLiteは廃止済み）
- パスワードリセット時の注意（再発生防止）：Supabaseの「Reset database password」はダイアログの「Generate a password」リンクを押して生成→その場でコピーが必要（自動表示ではない）。`.env`のプレースホルダ`[YOUR-PASSWORD]`は大括弧ごと削除して実際の値に置き換えること

## 2026-07-07 07:00 Vercel本番デプロイ完了＋Supabase RLS対応＋パスワードローテーション

### 受けた指示
Vercelでのビルドエラー対応、Supabase Security Advisorの警告対応、パスワード漏えい対応（複数回のリセット）を経て本番公開まで実施。

### 対応内容
- **Vercelビルドエラー「No Output Directory named "dist"」** — プロジェクト設定の一時的な不整合が原因と判明。Framework Preset（Next.js）・Output Directory（Overrideなし＝デフォルト）を確認し解消
- **Supabase Security Advisor対応**: 6テーブル全てで「RLS Disabled in Public」警告 → Prismaの接続ロール（`postgres`、`rolbypassrls=true`）はRLSに影響されないことを確認した上で、`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`を6テーブルに適用。適用後もアプリの読み書き（既存共有ページ表示・新規診断保存）が正常动作することを確認
- **パスワードローテーション対応（複数回）**: デプロイ作業中に`.env`の差分がシステム経由で平文表示される事象が発生したため、都度パスワードを再発行。過程で以下のヒューマンエラーを都度診断・解消：
  - プレースホルダ`[YOUR-PASSWORD]`の大括弧だけ残す
  - `DATABASE_URL`と`DIRECT_URL`で異なる値を貼ってしまう
  - Supavisor（プール接続）へのパスワード反映に数秒〜数十秒のタイムラグがあり、直後の接続テストが失敗する（待機後リトライで解消）
  - 手動編集時に旧パスワードの末尾3文字が消し残る（`DATABASE_URL`のみ19文字、`DIRECT_URL`は16文字、という文字数差から検出）
  - 最終的にユーザーが直接パスワードを提示 → アシスタントが`.env`を直接編集する方式に切替え、確実性を確保
- `prisma.config.ts` — CLI操作（`db push`等）はプール接続を張れないセッションを使うため`DIRECT_URL`優先に変更。アプリ実行時（`src/lib/db.ts`）は引き続き`DATABASE_URL`
- Vercel環境変数（`DATABASE_URL`・`DIRECT_URL`）を最新パスワードに同期し、Redeploy
- **本番動作確認**: TOP（200）／共有結果ページ`/r/[id]`（200・Supabaseから正しくINFP等のデータを取得）／存在しないIDの404／MBTI表記なし、をcurlで確認

### UI微調整
- `src/components/LikertScale.tsx` — 5択の丸ボタンを外側→中央にかけて段階的に縮小（44px→36px→28px→36px→44px）するデザインに変更。タップ領域は44×44pxを維持したまま見た目の丸だけ縮小（`label`に固定サイズ＋`flex items-center justify-center`、内側`span`のみサイズ可変）

### 検証結果
- build／test（49件）／eslint すべてクリーン
- 本番URL https://human-persona-platform.vercel.app/ が診断・共有URL・相性診断まで含めて完全稼働

### 補足・教訓
- パスワードリセット系の作業は「生成→確定ボタンまで押す→その場でコピー」を1セットで確実に行うこと。生成のみ（未確定）で終えると実際のDBパスワードは変わらない
- Vercelは環境変数を編集しただけでは反映されない。**必ずRedeployが必要**
- `.env`の差分がツール経由で見える場合があるため、パスワードは可能な限り短命化し、作業完了後に必ずローテーションする運用が安全
