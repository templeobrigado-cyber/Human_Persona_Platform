# Human Persona Platform（HPP）

## 個人開発向け事業・システム設計書 v1.0

> 方針：**1人で作れることを前提に、小さく作って大きく育てる**

------------------------------------------------------------------------

# 1. 開発方針

## やらないこと

-   独自AIモデル開発
-   複雑な心理学アルゴリズム研究
-   同時に複数業界展開
-   大規模インフラ構築

## やること

-   既存心理理論の統合
-   LLMによる分析
-   SaaS型サービス
-   API化を前提とした設計

------------------------------------------------------------------------

# 2. MVP

期間：3か月

## 機能

### ユーザー

-   会員登録
-   ログイン
-   診断
-   マイページ

### 診断

-   タイプコンパス（簡易・ユング理論ベース4指標）
-   Big Five
-   AI分析

### 出力

-   Persona ID
-   PDF出力

------------------------------------------------------------------------

# 3. 開発技術

  領域           採用
  -------------- -----------------
  Frontend       Next.js
  Backend        Laravel
  DB             PostgreSQL
  認証           Laravel Sanctum
  AI             OpenAI API
  決済           Stripe
  ホスティング   Vercel + VPS

------------------------------------------------------------------------

# 4. フェーズ設計

## Phase1

### 人格診断

``` text
TOP
 ↓
会員登録
 ↓
診断
 ↓
AI分析
 ↓
Persona生成
 ↓
PDF
```

目標 - 月1000診断

------------------------------------------------------------------------

## Phase2

### Persona ID

追加 - エニアグラム - 相性診断 - Persona DB

目標 - 月100課金

------------------------------------------------------------------------

## Phase3

### 占い版

追加 - 顧客管理 - AI鑑定 - カルテ - 九星気学レイヤー（本命星・五行・相性）

> 企業版（Phase4）には九星気学を混ぜない。占いと心理統計を同じ画面に出すと企業向けの信頼性が下がるため、SKUを分けて共存させる。

目標 - 占い師10名

------------------------------------------------------------------------

## Phase4

### 採用版

追加 - 企業管理 - 人材分析 - 組織分析

目標 - 法人5社

------------------------------------------------------------------------

# 5. DB設計

## users

  項目
  ----------
  id
  name
  email
  password

## diagnosis_sessions

  項目
  ------------
  id
  user_id
  status
  created_at

## answers

  項目
  -------------
  id
  session_id
  question_id
  answer

## mbti_results

  項目
  ---------
  user_id
  type
  ei
  sn
  tf
  jp

## bigfive_results

  項目
  -------------------
  user_id
  openness
  conscientiousness
  extraversion
  agreeableness
  neuroticism

## enneagram_results

  項目
  ---------
  user_id
  type
  wing

## kyusei_results（Phase3・占い版のみ）

  項目
  ------------
  user_id
  honmeisei（本命星）
  getsumeisei（月命星）
  gogyou（五行）

## persona_profiles

  項目
  ------------
  persona_id
  user_id
  creativity
  leadership
  empathy
  stability
  challenge
  logic

------------------------------------------------------------------------

# 6. ER図

``` text
users
 ├ diagnosis_sessions
 │    └ answers
 ├ mbti_results
 ├ bigfive_results
 ├ enneagram_results
 ├ kyusei_results（占い版のみ）
 └ persona_profiles
         └ compatibility
```

------------------------------------------------------------------------

# 7. Persona Engine

入力（共通コア）

``` text
タイプコンパス
+
Big Five
+
Enneagram
```

入力（占い版のみ追加）

``` text
+ 九星気学（本命星・五行）
```

> 企業版は共通コアのみでスコア化する。九星気学は占い版のPersona Engineにだけ重みを加えるオプションレイヤーとして実装し、企業版のロジックには一切触れさせない。

処理

``` text
標準化
 ↓
重み付け
 ↓
スコア化
 ↓
人格ベクトル生成
```

出力

``` json
{
 "creativity":91,
 "leadership":75,
 "empathy":82,
 "challenge":94,
 "logic":65,
 "stability":28
}
```

------------------------------------------------------------------------

# 8. AIプロンプト設計

入力

-   タイプコンパス
-   BigFive
-   エニアグラム
-   Personaスコア

出力

-   強み
-   弱み
-   適職
-   恋愛
-   人間関係
-   ストレス
-   人生戦略

------------------------------------------------------------------------

# 9. UI設計

## TOP

-   サービス説明
-   診断開始

## 診断

-   プログレスバー
-   設問

## 結果

表示 - タイプコンパス - BigFiveレーダー - Persona - AI分析

## マイページ

表示 - Persona ID - 履歴 - PDF

------------------------------------------------------------------------

# 10. API

## Auth

POST /register

POST /login

## Diagnosis

POST /diagnosis/start

POST /diagnosis/answer

GET /diagnosis/result

## Persona

GET /persona/profile

GET /persona/report

GET /persona/compatibility

------------------------------------------------------------------------

# 11. マネタイズ

## 個人

-   AI分析 980円
-   PDF 980円
-   相性診断 980円

## 占い

-   月3980円（九星気学レイヤー込み）

## 企業

-   月50000円（心理統計データのみ、占い要素なし）

------------------------------------------------------------------------

# 12. 個人開発ロードマップ

## 月1

-   DB
-   認証
-   タイプコンパス

## 月2

-   BigFive
-   AI分析
-   Persona

## 月3

-   PDF
-   決済
-   リリース

## 月6

-   エニアグラム
-   相性診断

## 月12

-   占いSaaS
-   九星気学レイヤー実装（`bodyclystal/lib/kyusei.ts` の検証済みロジックを移植できるため、ゼロから組むより前倒し可能）

## 月24

-   採用SaaS

------------------------------------------------------------------------

# 最終目標

``` text
人格診断
 ↓
人格データ
 ↓
Persona ID
 ↓
AI人格分析
 ↓
業界別SaaS
 ↓
Human Persona Platform
```

「診断を売る」のではなく、 「人格データを活用するインフラを作る」。
