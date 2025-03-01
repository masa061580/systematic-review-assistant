// APIエンドポイントの設定
// GitHub Pages用に調整されたconfig.js
// APIキーは含まれていません

const API_ENDPOINTS = {
    // OpenAI API エンドポイント (バックエンド経由で使用)
    openai: 'https://api.openai.com/v1/chat/completions',
    
    // PubMed API エンドポイント
    pubmedSearch: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
    pubmedSummary: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
};

// APIキーはバックエンドに保存
const API_KEYS = {
    openai: '',  // APIキーはバックエンドで管理
    pubmed: ''   // APIキーはバックエンドで管理
};
