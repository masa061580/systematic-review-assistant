# システマティックレビュー検索アシスタント

システマティックレビュー検索アシスタントは、医療研究者がシステマティックレビューを行う際の文献検索をサポートするWebアプリケーションです。日本語で研究テーマを入力すると、PubMed用の最適な検索式を自動生成し、検索結果を簡単に取得・整理することができます。

## 機能

- **日本語入力からの検索式生成**: 日本語で入力した研究テーマから、適切なPubMed検索式を自動生成
- **検索条件のカスタマイズ**: 人を対象とした研究、成人のみ、RCTのみなど、様々な条件で検索をフィルタリング
- **検索結果数の即時確認**: 生成された検索式でヒットする論文数をすぐに確認可能
- **検索結果の取得・表示**: 論文のタイトル、著者、PubMed ID、URLを簡単に取得
- **抄録の自動要約**: 論文の抄録を日本語で1文に要約
- **CSV形式でのエクスポート**: 検索結果をCSVファイルでダウンロード可能

## セットアップ方法

1. このリポジトリをクローンまたはダウンロードします
   ```
   git clone https://github.com/yourusername/systematic-review-assistant.git
   cd systematic-review-assistant
   ```

2. `config.js.example` を `config.js` にコピーします
   ```
   cp config.js.example config.js
   ```

3. `config.js` ファイルを編集して、OpenAI APIキーを設定します
   ```javascript
   const API_KEYS = {
       openai: 'YOUR_OPENAI_API_KEY_HERE',
       pubmed: ''  // PubMed APIキー (必要な場合)
   };
   ```

4. `index.html` をブラウザで開くか、ローカルサーバーを起動してアプリケーションを使用します
   ```
   # Python 3を使用する場合
   python -m http.server 8000
   
   # Node.jsを使用する場合
   npx serve
   ```

## 使い方

1. 研究テーマを日本語で入力します
2. 検索条件（人を対象とした研究、成人のみなど）を選択します
3. 「検索式を生成」ボタンをクリックします
4. 生成された検索式と検索結果数を確認します
5. 必要に応じて「検索式を再生成」ボタンをクリックします
6. 「検索結果を取得」ボタンをクリックして論文情報を取得します
7. 「結果をCSVでダウンロード」ボタンをクリックしてデータをエクスポートします

## 使用技術

- HTML/CSS/JavaScript
- OpenAI API (GPT-4o)
- PubMed API (E-Utilities)

## 注意事項

- このアプリケーションを使用するには、OpenAI APIキーが必要です
- APIキーを含む `config.js` ファイルは `.gitignore` に追加されており、リポジトリにコミットされません
- 大量のAPI呼び出しを行うと、OpenAI APIの使用料金が発生する可能性があります

## ライセンス

[MIT License](LICENSE)

## 作者

[あなたの名前]

## お問い合わせ

何か質問や提案がありましたら、[your.email@example.com] までご連絡ください。
