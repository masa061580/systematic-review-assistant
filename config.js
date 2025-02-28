// APIエンドポイントとAPIキーの設定
// 注意: このファイルをgitにコミットしないでください (.gitignoreに追加)

const API_ENDPOINTS = {
    // OpenAI API エンドポイント
    openai: 'https://api.openai.com/v1/chat/completions',
    
    // PubMed API エンドポイント
    pubmedSearch: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
    pubmedSummary: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
};

const API_KEYS = {
    // 実際の使用時には、これらのAPIキーを実際のものに置き換えてください
    openai: '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',
    pubmed: 'd52dbe68d5b96f138bc3ca4a64f199369808'  // PubMed APIキー (必要な場合)
};
