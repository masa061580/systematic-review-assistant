// DOM要素の参照を取得
document.addEventListener('DOMContentLoaded', function() {
    // 環境によってバックエンドのURLを切り替え
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    // 本番環境（GitHub Pages）では、デプロイしたバックエンドURLを使用
    const API_BASE_URL = isProduction 
        ? 'https://systematic-review-api.onrender.com' // 必ずHTTPSのURLを使用
        : 'http://localhost:3000';
    
    console.log('API Base URL:', API_BASE_URL); // デバッグ用
    console.log('環境:', isProduction ? '本番環境' : '開発環境');
    
    // フォームと結果セクションの要素
    var searchForm = document.getElementById('searchForm');
    var initialForm = document.getElementById('initialForm');
    var loadingSection = document.getElementById('loadingSection');
    var resultSection = document.getElementById('resultSection');
    var articleResultsSection = document.getElementById('articleResultsSection');
    var enhancedResultsSection = document.getElementById('enhancedResultsSection');
    
    // 検索式と結果の表示関連要素
    var searchExpressionElement = document.getElementById('searchExpression');
    var articleCountElement = document.getElementById('articleCount');
    var articleResultsElement = document.getElementById('articleResults');
    var resultsInfoElement = document.getElementById('resultsInfo');
    var enhancedResultsElement = document.getElementById('enhancedResults');
    var enhancedResultsInfoElement = document.getElementById('enhancedResultsInfo');
    var progressBarElement = document.getElementById('progressBar');
    var progressStatusElement = document.getElementById('progressStatus');
    
    // ボタン要素
    var copySearchExpressionBtn = document.getElementById('copySearchExpression');
    var regenerateButton = document.getElementById('regenerateButton');
    var getResultsButton = document.getElementById('getResultsButton');
    var getEnhancedResultsButton = document.getElementById('getEnhancedResultsButton');
    var backToStartButton = document.getElementById('backToStart');
    var downloadCSVButton = document.getElementById('downloadCSV');
    var downloadDetailedCSVButton = document.getElementById('downloadDetailedCSV');
    var downloadEnhancedCSVButton = document.getElementById('downloadEnhancedCSV');
    var backToSearchButton = document.getElementById('backToSearch');
    var backToResultsButton = document.getElementById('backToResults');
    
    // モーダル関連要素
    var showAboutLink = document.getElementById('showAbout');
    var aboutModal = document.getElementById('aboutModal');
    var closeModalButtonX = document.getElementById('closeModalBtn');
    var closeModalButton = document.getElementById('closeModalButton');
    
    // すべての要素が存在することを確認
    if (!searchForm) {
        console.error('searchForm要素が見つかりません');
    }
    if (!initialForm) {
        console.error('initialForm要素が見つかりません');
    }
    if (!loadingSection) {
        console.error('loadingSection要素が見つかりません');
    }
    if (!resultSection) {
        console.error('resultSection要素が見つかりません');
    }
    
    // セクションの表示/非表示を制御する関数
    function showSection(section) {
        // すべてのセクションを非表示
        initialForm.style.display = "none";
        loadingSection.style.display = "none";
        resultSection.style.display = "none";
        articleResultsSection.style.display = "none";
        enhancedResultsSection.style.display = "none";
        
        // 指定されたセクションのみ表示
        section.style.display = "block";
    }
    
    // 初期表示設定
    initialForm.style.display = "block";
    loadingSection.style.display = "none";
    resultSection.style.display = "none";
    articleResultsSection.style.display = "none";
    enhancedResultsSection.style.display = "none";
    aboutModal.style.display = "none";
    
    // 検索クエリとPubMed検索式を保存する変数
    var currentQuery = '';
    var currentSearchExpression = '';
    var searchResults = [];
    var enhancedResults = [];
    
    // -------- モーダル関連機能 -------- //
    
    // モーダルを表示
    if (showAboutLink) {
        showAboutLink.onclick = function(e) {
            e.preventDefault();
            aboutModal.style.display = "flex";
        };
    }
    
    // Xボタンでモーダルを閉じる
    if (closeModalButtonX) {
        closeModalButtonX.onclick = function() {
            aboutModal.style.display = "none";
        };
    }
    
    // 閉じるボタンでモーダルを閉じる
    if (closeModalButton) {
        closeModalButton.onclick = function() {
            aboutModal.style.display = "none";
        };
    }
    
    // モーダルの外側をクリックで閉じる
    if (aboutModal) {
        aboutModal.onclick = function(e) {
            if (e.target === aboutModal) {
                aboutModal.style.display = "none";
            }
        };
    }
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && aboutModal.style.display === "flex") {
            aboutModal.style.display = "none";
        }
    });
    
    // -------- 検索関連機能 -------- //
    
    // 検索フォーム送信イベント
    if (searchForm) {
        searchForm.onsubmit = async function(e) {
            e.preventDefault();
            
            console.log('検索フォーム送信');
            
            // 検索クエリを取得
            var searchQuery = document.getElementById('searchQuery').value.trim();
            if (!searchQuery) {
                alert('検索内容を入力してください');
                return;
            }
            
            // 選択された条件を取得
            var selectedConditions = Array.from(document.querySelectorAll('input[name="condition"]:checked'))
                .map(function(checkbox) { return checkbox.value; });
            
            // 現在のクエリを保存
            currentQuery = {
                searchText: searchQuery,
                conditions: selectedConditions
            };
            
            console.log('検索クエリ:', currentQuery);
            
            // ローディング表示
            showSection(loadingSection);
            
            try {
                // バックエンドAPIを使用して検索式を生成
                var searchExpression = await generateSearchExpression(currentQuery);
                currentSearchExpression = searchExpression;
                
                console.log('生成された検索式:', searchExpression);
                
                // バックエンドAPIでPubMedの検索結果数を取得
                var count = await getArticleCount(searchExpression);
                
                console.log('検索結果数:', count);
                
                // 結果の表示
                searchExpressionElement.textContent = searchExpression;
                articleCountElement.textContent = `検索結果: 約${count}件の論文が見つかりました`;
                
                // 結果セクションを表示
                showSection(resultSection);
            } catch (error) {
                console.error('Error:', error);
                alert('エラーが発生しました: ' + error.message);
                showSection(initialForm);
            }
        };
    }
    
    // 検索式をコピーボタン
    if (copySearchExpressionBtn) {
        copySearchExpressionBtn.onclick = function() {
            navigator.clipboard.writeText(currentSearchExpression)
                .then(function() {
                    var originalText = copySearchExpressionBtn.textContent;
                    copySearchExpressionBtn.textContent = 'コピーしました！';
                    setTimeout(function() {
                        copySearchExpressionBtn.textContent = originalText;
                    }, 2000);
                })
                .catch(function(err) {
                    console.error('コピーに失敗しました:', err);
                    alert('コピーできませんでした。');
                });
        };
    }
    
    // 検索式を再生成ボタン
    if (regenerateButton) {
        regenerateButton.onclick = async function() {
            showSection(loadingSection);
            
            try {
                // 検索式を再生成（異なる表現となるよう指示）
                var searchExpression = await generateSearchExpression(currentQuery, true);
                currentSearchExpression = searchExpression;
                
                // バックエンドAPIでPubMedの検索結果数を取得
                var count = await getArticleCount(searchExpression);
                
                // 結果の表示
                searchExpressionElement.textContent = searchExpression;
                articleCountElement.textContent = `検索結果: 約${count}件の論文が見つかりました`;
                
                // 結果セクションを表示
                showSection(resultSection);
            } catch (error) {
                console.error('Error:', error);
                alert('エラーが発生しました: ' + error.message);
                showSection(resultSection);
            }
        };
    }
    
    // 検索結果を取得ボタン
    if (getResultsButton) {
        getResultsButton.onclick = async function() {
            showSection(loadingSection);
            
            try {
                // バックエンドAPIでPubMedの検索結果を取得
                var results = await getSearchResults(currentSearchExpression);
                searchResults = results;
                
                // 結果数の表示
                resultsInfoElement.textContent = `${results.length}件の論文を取得しました`;
                
                // 結果を表示
                displaySearchResults(results);
                
                // 検索結果セクションを表示
                showSection(articleResultsSection);
            } catch (error) {
                console.error('Error:', error);
                alert('エラーが発生しました: ' + error.message);
                showSection(resultSection);
            }
        };
    }
    
    // 詳細情報付き検索結果を取得ボタン
    if (getEnhancedResultsButton) {
        getEnhancedResultsButton.onclick = async function() {
            showSection(loadingSection);
            
            try {
                // 通常の検索結果を先に取得
                var results = await getSearchResults(currentSearchExpression);
                searchResults = results;
                
                // 検索結果セクションを表示
                showSection(enhancedResultsSection);
                
                // 詳細情報を順次取得して表示
                enhancedResults = await getEnhancedResults(results);
                
                // 詳細情報付き結果を表示
                displayEnhancedResults(enhancedResults);
            } catch (error) {
                console.error('Error:', error);
                alert('エラーが発生しました: ' + error.message);
                showSection(resultSection);
            }
        };
    }
    
    // 検索式画面に戻るボタン
    if (backToSearchButton) {
        backToSearchButton.onclick = function() {
            showSection(resultSection);
        };
    }
    
    // 検索結果画面に戻るボタン
    if (backToResultsButton) {
        backToResultsButton.onclick = function() {
            showSection(articleResultsSection);
        };
    }
    
    // 最初からやり直すボタン
    if (backToStartButton) {
        backToStartButton.onclick = function() {
            // フォーム内容をリセット
            searchForm.reset();
            
            // 変数をクリア
            currentQuery = '';
            currentSearchExpression = '';
            searchResults = [];
            enhancedResults = [];
            
            // 初期フォームを表示
            showSection(initialForm);
        };
    }
    
    // CSVダウンロードボタン
    if (downloadCSVButton) {
        downloadCSVButton.onclick = function() {
            if (searchResults.length === 0) {
                alert('ダウンロードする検索結果がありません');
                return;
            }
            
            exportToCSV(searchResults);
        };
    }
    
    // 詳細情報付きCSVダウンロードボタン
    if (downloadDetailedCSVButton) {
        downloadDetailedCSVButton.onclick = async function() {
            if (searchResults.length === 0) {
                alert('ダウンロードする検索結果がありません');
                return;
            }
            
            try {
                // ローディングメッセージを表示
                const originalText = downloadDetailedCSVButton.textContent;
                downloadDetailedCSVButton.textContent = '詳細情報を取得中...';
                downloadDetailedCSVButton.disabled = true;
                
                // 詳細情報を取得
                if (enhancedResults.length === 0) {
                    enhancedResults = await getEnhancedResults(searchResults);
                }
                
                // CSVとしてエクスポート
                exportEnhancedToCSV(enhancedResults);
                
                // ボタンを元に戻す
                downloadDetailedCSVButton.textContent = originalText;
                downloadDetailedCSVButton.disabled = false;
            } catch (error) {
                console.error('詳細情報の取得中にエラーが発生しました:', error);
                alert('詳細情報の取得に失敗しました: ' + error.message);
                downloadDetailedCSVButton.textContent = originalText;
                downloadDetailedCSVButton.disabled = false;
            }
        };
    }
    
    // 詳細分析結果CSVダウンロードボタン
    if (downloadEnhancedCSVButton) {
        downloadEnhancedCSVButton.onclick = function() {
            if (enhancedResults.length === 0) {
                alert('ダウンロードする詳細分析結果がありません');
                return;
            }
            
            exportEnhancedToCSV(enhancedResults);
        };
    }
    
    // APIリクエストをラップした関数（エラーハンドリング強化）
    async function fetchWithRetry(url, options, retries = 2) {
        try {
            console.log(`APIリクエスト: ${options.method || 'GET'} ${url}`);
            
            // CORS関連のオプションを追加
            const fetchOptions = {
                ...options,
                mode: 'cors',      // CORSモードを明示
                credentials: 'omit' // クレデンシャルは送信しない
            };
            
            const response = await fetch(url, fetchOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('APIエラーレスポンス:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: errorData
                });
                
                throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
            }
            
            return response.json();
        } catch (error) {
            // ネットワークエラーまたはJSONパースエラー
            console.error('Fetchエラー:', error);
            
            if (retries > 0) {
                console.log(`リトライ残り${retries}回...`);
                // 少し待ってからリトライ（500ms）
                await new Promise(resolve => setTimeout(resolve, 500));
                return fetchWithRetry(url, options, retries - 1);
            }
            
            // リトライも失敗した場合
            throw new Error(`APIリクエスト失敗: ${error.message}`);
        }
    }
    
    // バックエンドAPIを使用して検索式を生成する関数
    async function generateSearchExpression(query, alternative = false) {
        try {
            // 検索クエリと条件の整形
            const conditions = query.conditions.join(', ');
            let promptText = `以下の医学研究テーマに対する最適なPubMed検索式を作成してください。
            
テーマ: ${query.searchText}

検索条件: ${conditions}

検索式を作成する際には、以下の点を考慮してください：
1. MeSH用語を適切に使用してください（可能な場合）
2. 適切な論理演算子（AND, OR, NOT）を使用してください
3. 必要に応じてフィールドタグ（[Title/Abstract], [MeSH Terms]など）を使用してください
4. 検索式は構造化され、簡潔かつ効果的である必要があります
5. 冗長性を避け、関連する全ての研究をカバーするようにしてください

検索式のみを出力してください。説明は不要です。`;

            if (alternative) {
                promptText += "\n\n注意: 先に提案した検索式とは異なる表現を用いた代替の検索式を作成してください。";
            }
            
            // 選択された条件に基づいて検索式を調整する指示を追加
            if (query.conditions.includes('human')) {
                promptText += "\n- 人間を対象とした研究に限定するためのフィルターを含めてください";
            }
            if (query.conditions.includes('adult')) {
                promptText += "\n- 成人のみを対象とした研究に限定するフィルターを含めてください";
            }
            if (query.conditions.includes('rct')) {
                promptText += "\n- ランダム化比較試験（RCT）のみに限定するフィルターを含めてください";
            }
            if (query.conditions.includes('meta')) {
                promptText += "\n- メタ分析とシステマティックレビューも含めるフィルターを追加してください";
            }
            if (query.conditions.includes('english')) {
                promptText += "\n- 英語で書かれた論文のみに限定するフィルターを含めてください";
            }
            if (query.conditions.includes('lastFiveYears')) {
                promptText += "\n- 過去5年間に出版された論文のみに限定するフィルターを含めてください";
            }
            
            console.log('OpenAI APIリクエスト送信準備...');
            
            // バックエンドAPIにリクエスト
            const data = await fetchWithRetry(`${API_BASE_URL}/api/openai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "あなたは医学研究とシステマティックレビューの専門家です。PubMedの検索式作成に非常に長けています。"
                        },
                        {
                            role: "user",
                            content: promptText
                        }
                    ],
                    temperature: 0.1
                })
            });
            
            console.log('OpenAI APIレスポンス成功');
            let searchExpression = data.choices[0].message.content.trim();
            
            // 以下の処理を追加
            // ```plaintext や ``` などのマークダウンコード囲みを削除
            searchExpression = searchExpression.replace(/```(?:plaintext)?\s*([\s\S]*?)\s*```/g, '$1');
            
            return searchExpression;
        } catch (error) {
            console.error('検索式生成中にエラーが発生しました:', error);
            throw new Error('検索式の生成に失敗しました: ' + error.message);
        }
    }
    
    // バックエンドAPIで検索結果数を取得する関数
    async function getArticleCount(searchExpression) {
        try {
            // 検索式をエンコード
            const encodedSearchTerm = encodeURIComponent(searchExpression);
            
            console.log('PubMed検索結果数取得リクエスト送信...');
            
            // バックエンドAPIから検索結果数を取得
            const data = await fetchWithRetry(`${API_BASE_URL}/api/pubmed/search?term=${encodedSearchTerm}&retmax=0`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('PubMed検索結果数取得成功:', data.esearchresult.count);
            return data.esearchresult.count;
        } catch (error) {
            console.error('検索結果数取得中にエラーが発生しました:', error);
            throw new Error('検索結果数の取得に失敗しました: ' + error.message);
        }
    }
    
    // バックエンドAPIで検索結果を取得する関数
    // バックエンドAPIで検索結果を取得する関数内の修正
    async function getSearchResults(searchExpression) {
        try {
            // 検索式をエンコード
            const encodedSearchTerm = encodeURIComponent(searchExpression);
            
            console.log('PubMed検索リクエスト送信...');
            
            // 最初のステップ: 検索クエリに一致するPubMed IDのリストを取得
            const searchData = await fetchWithRetry(`${API_BASE_URL}/api/pubmed/search?term=${encodedSearchTerm}&retmax=30`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const pmids = searchData.esearchresult.idlist;
            console.log('PubMed検索結果取得成功:', { count: pmids.length });
            
            if (pmids.length === 0) {
                return [];
            }
            
            console.log('PubMed論文詳細リクエスト送信...');
            
            // 第二ステップ: PubMed IDを使用して論文の詳細情報を取得
            const summaryData = await fetchWithRetry(`${API_BASE_URL}/api/pubmed/summary?id=${pmids.join(',')}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('PubMed論文詳細取得成功');
            
            // デバッグ用ログを追加
            console.log('summaryData構造:', {
                hasResult: !!summaryData.result,
                resultKeys: summaryData.result ? Object.keys(summaryData.result) : [],
                firstPmid: pmids[0],
                firstArticleExists: summaryData.result ? !!summaryData.result[pmids[0]] : false
            });

            // 論文データを整形
            const articlesPromises = pmids.map(async (pmid) => {
                // ここでエラーチェックを追加
                const article = summaryData.result ? summaryData.result[pmid] : null;
                
                // summaryData.resultやarticleがnullまたはundefinedの場合、基本情報だけのオブジェクトを返す
                if (!article) {
                    console.warn(`PMID ${pmid} のデータが取得できませんでした`);
                    return {
                        pmid,
                        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
                        title: `PMID: ${pmid} (詳細情報を取得できませんでした)`,
                        authors: '',
                        year: '',
                        journal: '',
                        abstract: '',
                        abstractSummary: '抄録を取得できませんでした'
                    };
                }
                
                // 以下は元のコードと同じ
                // 著者情報を整形
                let authors = '';
                if (article.authors && article.authors.length > 0) {
                    authors = article.authors
                        .map(author => `${author.name || ''}`)
                        .join(', ');
                }
                
                // タイトルを取得
                const title = article.title || 'タイトルなし';
                
                // 出版年を取得
                const pubDate = article.pubdate || '';
                const year = pubDate.split(' ')[0] || '';
                
                // ジャーナル名を取得
                const journal = article.fulljournalname || article.source || '';
                
                // 抄録の要約
                let abstractSummary = 'Abstract not available';
                if (article.abstract) {
                    // 抄録がある場合、バックエンドAPIを使用して要約を生成
                    abstractSummary = await generateAbstractSummary(article.abstract);
                }
                
                // PubMed URL
                const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
                
                return {
                    pmid,
                    pubmedUrl,
                    title,
                    authors,
                    year,
                    journal,
                    abstract: article.abstract || '',
                    abstractSummary
                };
            });
            
            const articles = await Promise.all(articlesPromises);
            
            // nullを除外
            return articles.filter(article => article !== null);
        } catch (error) {
            console.error('検索結果取得中にエラーが発生しました:', error);
            throw new Error('検索結果の取得に失敗しました: ' + error.message);
        }
    }
    
    // 詳細情報付き検索結果を取得する関数
    async function getEnhancedResults(basicResults) {
        try {
            // プログレスバーの初期化
            progressBarElement.style.width = '0%';
            progressStatusElement.textContent = `0 / ${basicResults.length} 論文を処理中...`;
            
            const enhancedArticles = [];
            
            // 各論文の詳細情報を取得
            for (let i = 0; i < basicResults.length; i++) {
                const article = basicResults[i];
                
                // プログレス表示の更新
                const progress = Math.round((i / basicResults.length) * 100);
                progressBarElement.style.width = `${progress}%`;
                progressStatusElement.textContent = `${i} / ${basicResults.length} 論文を処理中...`;
                
                try {
                    // 抄録がない場合はPubMedから直接取得を試みる
                    let abstract = article.abstract;
                    if (!abstract || abstract.trim() === '') {
                        abstract = await fetchAbstract(article.pmid);
                    }
                    
                    // 研究デザインの判定
                    const studyDesign = await determineStudyDesign(abstract);
                    
                    // 結果と結論の要約
                    const resultsSummary = await summarizeResults(abstract);
                    const conclusionSummary = await summarizeConclusion(abstract);
                    
                    // 拡張情報を追加
                    enhancedArticles.push({
                        ...article,
                        abstract: abstract,
                        studyDesign: studyDesign,
                        resultsSummary: resultsSummary,
                        conclusionSummary: conclusionSummary
                    });
                    
                    // 一部処理済みの結果を表示
                    if (i % 5 === 0 || i === basicResults.length - 1) {
                        displayEnhancedResults(enhancedArticles);
                    }
                } catch (error) {
                    console.error(`論文ID ${article.pmid} の処理中にエラーが発生しました:`, error);
                    // エラーが発生しても処理を継続
                    enhancedArticles.push({
                        ...article,
                        studyDesign: 'unknown',
                        resultsSummary: 'エラーのため要約を取得できませんでした',
                        conclusionSummary: 'エラーのため要約を取得できませんでした'
                    });
                }
            }
            
            // 完了表示
            progressBarElement.style.width = '100%';
            progressStatusElement.textContent = `${basicResults.length} / ${basicResults.length} 論文の処理が完了しました`;
            
            return enhancedArticles;
        } catch (error) {
            console.error('詳細情報取得中にエラーが発生しました:', error);
            throw new Error('詳細情報の取得に失敗しました: ' + error.message);
        }
    }
    
    // PubMedから抄録を取得する関数
    async function fetchAbstract(pmid) {
        try {
            console.log(`PMID ${pmid} の抄録を取得中...`);
            
            const response = await fetchWithRetry(`${API_BASE_URL}/api/pubmed/fetch?id=${pmid}&rettype=abstract`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // レスポンスから抄録テキストを抽出
            if (response && response.abstract) {
                return response.abstract;
            }
            
            return "Abstract not available";
        } catch (error) {
            console.error(`PMID ${pmid} の抄録取得中にエラーが発生しました:`, error);
            return "Abstract could not be retrieved";
        }
    }
    
    // 研究デザインを判定する関数
    async function determineStudyDesign(abstract) {
        try {
            console.log('研究デザイン判定リクエスト送信...');
            
            const data = await fetchWithRetry(`${API_BASE_URL}/api/openai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "あなたは医学研究のエキスパートです。与えられた論文の抄録から研究デザインを判定してください。"
                        },
                        {
                            role: "user",
                            content: `以下の医学論文の抄録から研究デザインを判定してください。
以下のいずれかの研究デザインでラベル付けし、その理由も簡潔に説明してください。
- RCT（ランダム化比較試験）
- Meta-analysis（メタ分析）
- Systematic review（システマティックレビュー）
- Cohort study（コホート研究）
- Case-control study（ケースコントロール研究）
- Cross-sectional study（横断研究）
- Case report/series（症例報告/症例集積）
- Qualitative study（質的研究）
- Animal/Basic study（動物/基礎研究）
- Other（その他）

抄録:
${abstract}`
                        }
                    ],
                    temperature: 0.3
                })
            });
            
            console.log('研究デザイン判定成功');
            
            // 応答から研究デザインを抽出 (最初の行を取得)
            const fullResponse = data.choices[0].message.content.trim();
            const firstLine = fullResponse.split('\n')[0];
            
            // 研究デザイン名だけを抽出 (例: "RCT（ランダム化比較試験）" → "RCT")
            let designMatch;
            if (firstLine.includes("RCT")) return "RCT";
            if (firstLine.includes("Meta-analysis")) return "Meta-analysis";
            if (firstLine.includes("Systematic review")) return "Systematic review";
            if (firstLine.includes("Cohort")) return "Cohort study";
            if (firstLine.includes("Case-control")) return "Case-control study";
            if (firstLine.includes("Cross-sectional")) return "Cross-sectional study";
            if (firstLine.includes("Case report")) return "Case report";
            if (firstLine.includes("Qualitative")) return "Qualitative study";
            if (firstLine.includes("Animal")) return "Animal/Basic study";
            
            // それ以外はOtherとする
            return "Other";
        } catch (error) {
            console.error('研究デザイン判定中にエラーが発生しました:', error);
            return "Unknown";
        }
    }
    
    // 結果を要約する関数
    async function summarizeResults(abstract) {
        try {
            console.log('結果要約リクエスト送信...');
            
            const data = await fetchWithRetry(`${API_BASE_URL}/api/openai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "あなたは医学論文の抄録から結果を抽出し、要約する専門家です。日本語で簡潔に1文で要約してください。"
                        },
                        {
                            role: "user",
                            content: `以下の医学論文の抄録から「結果（Results）」セクションの内容を日本語で1文に要約してください。結果セクションが明確でない場合は、論文の主な結果や知見について要約してください。

抄録:
${abstract}`
                        }
                    ],
                    temperature: 0.3
                })
            });
            
            console.log('結果要約成功');
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('結果要約中にエラーが発生しました:', error);
            return "結果の要約を取得できませんでした";
        }
    }
    
    // 結論を要約する関数
    async function summarizeConclusion(abstract) {
        try {
            console.log('結論要約リクエスト送信...');
            
            const data = await fetchWithRetry(`${API_BASE_URL}/api/openai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "あなたは医学論文の抄録から結論を抽出し、要約する専門家です。日本語で簡潔に1文で要約してください。"
                        },
                        {
                            role: "user",
                            content: `以下の医学論文の抄録から「結論（Conclusion）」セクションの内容を日本語で1文に要約してください。結論セクションが明確でない場合は、論文の主要な結論や著者の主張について要約してください。

抄録:
${abstract}`
                        }
                    ],
                    temperature: 0.3
                })
            });
            
            console.log('結論要約成功');
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('結論要約中にエラーが発生しました:', error);
            return "結論の要約を取得できませんでした";
        }
    }
    
    // バックエンドAPIを使用して抄録を要約する関数
    async function generateAbstractSummary(abstract) {
        try {
            console.log('抄録要約リクエスト送信...');
            
            const data = await fetchWithRetry(`${API_BASE_URL}/api/openai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "あなたは医学論文の抄録を短く要約する専門家です。日本語で簡潔に1文で要約してください。"
                        },
                        {
                            role: "user",
                            content: `以下の医学論文の抄録を日本語で1文に要約してください:\n\n${abstract}`
                        }
                    ],
                    temperature: 0.3
                })
            });
            
            console.log('抄録要約成功');
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('抄録要約中にエラーが発生しました:', error);
            return 'Abstract summary not available due to an error';
        }
    }
    
    // 検索結果を表示する関数
    function displaySearchResults(results) {
        articleResultsElement.innerHTML = '';
        
        if (results.length === 0) {
            articleResultsElement.innerHTML = '<p>検索結果がありません</p>';
            return;
        }
        
        results.forEach(function(article) {
            const articleElement = document.createElement('div');
            articleElement.className = 'article-card';
            
            articleElement.innerHTML = `
                <div class="article-title">
                    <a href="${article.pubmedUrl}" target="_blank">${article.title}</a>
                </div>
                <div class="article-authors">${article.authors}</div>
                <div class="article-info">
                    <span>${article.journal}</span>
                    ${article.year ? `<span> | ${article.year}</span>` : ''}
                    <span> | PubMed ID: ${article.pmid}</span>
                </div>
                <div class="article-summary">
                    <strong>要約:</strong> ${article.abstractSummary}
                </div>
            `;
            
            articleResultsElement.appendChild(articleElement);
        });
    }
    
    // 詳細情報付き検索結果を表示する関数
    function displayEnhancedResults(results) {
        enhancedResultsElement.innerHTML = '';
        
        if (results.length === 0) {
            enhancedResultsElement.innerHTML = '<p>詳細分析結果がありません</p>';
            return;
        }
        
        results.forEach(function(article) {
            const articleElement = document.createElement('div');
            articleElement.className = 'article-card';
            
            // 研究デザインに応じたクラスを追加
            let designClass = 'design-unknown';
            if (article.studyDesign) {
                if (article.studyDesign.includes('RCT')) {
                    designClass = 'design-rct';
                } else if (article.studyDesign.includes('Meta') || article.studyDesign.includes('Systematic')) {
                    designClass = 'design-meta';
                } else if (article.studyDesign.includes('Cohort')) {
                    designClass = 'design-cohort';
                } else if (article.studyDesign.includes('Case-control')) {
                    designClass = 'design-casecontrol';
                } else if (article.studyDesign.includes('Case report')) {
                    designClass = 'design-casereport';
                }
            }
            
            articleElement.innerHTML = `
                <div class="article-title">
                    <a href="${article.pubmedUrl}" target="_blank">${article.title}</a>
                </div>
                <div class="article-authors">${article.authors}</div>
                <div class="article-info">
                    <span>${article.journal}</span>
                    ${article.year ? `<span> | ${article.year}</span>` : ''}
                    <span> | PubMed ID: ${article.pmid}</span>
                    <span class="article-design ${designClass}">${article.studyDesign || 'Unknown'}</span>
                </div>
                <div class="article-summary">
                    <strong>結果要約:</strong> ${article.resultsSummary || '要約なし'}
                </div>
                <div class="article-summary">
                    <strong>結論要約:</strong> ${article.conclusionSummary || '要約なし'}
                </div>
            `;
            
            enhancedResultsElement.appendChild(articleElement);
        });
    }
    
    // 検索結果をCSVとしてエクスポートする関数
    function exportToCSV(results) {
        // CSVヘッダー
        const csvHeader = ['PubMed ID', 'PubMed URL', 'タイトル', '著者', '出版年', 'ジャーナル', '要約'];
        
        // 各行のデータを作成
        const csvRows = results.map(function(article) {
            return [
                article.pmid,
                article.pubmedUrl,
                article.title,
                article.authors,
                article.year || '',
                article.journal || '',
                article.abstractSummary
            ];
        });
        
        // ヘッダーと行を結合
        const csvData = [csvHeader].concat(csvRows);
        
        // CSVフォーマットに変換
        const csvContent = csvData.map(function(row) {
            return row.map(function(cell) {
                // ダブルクォートでくくり、内部のダブルクォートはエスケープ
                return '"' + String(cell).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        
        // CSVファイルのダウンロード
        downloadCSVFile(csvContent, 'pubmed_search_results.csv');
    }
    
    // 詳細情報付き検索結果をCSVとしてエクスポートする関数
    function exportEnhancedToCSV(results) {
        // CSVヘッダー
        const csvHeader = [
            'PubMed ID', 
            'PubMed URL', 
            'タイトル', 
            '著者', 
            '出版年', 
            'ジャーナル', 
            '研究デザイン', 
            '結果要約', 
            '結論要約'
        ];
        
        // 各行のデータを作成
        const csvRows = results.map(function(article) {
            return [
                article.pmid,
                article.pubmedUrl,
                article.title,
                article.authors,
                article.year || '',
                article.journal || '',
                article.studyDesign || 'Unknown',
                article.resultsSummary || '',
                article.conclusionSummary || ''
            ];
        });
        
        // ヘッダーと行を結合
        const csvData = [csvHeader].concat(csvRows);
        
        // CSVフォーマットに変換
        const csvContent = csvData.map(function(row) {
            return row.map(function(cell) {
                // ダブルクォートでくくり、内部のダブルクォートはエスケープ
                return '"' + String(cell).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        
        // CSVファイルのダウンロード
        downloadCSVFile(csvContent, 'pubmed_detailed_results.csv');
    }
    
    // CSVファイルをダウンロードする関数
    function downloadCSVFile(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});