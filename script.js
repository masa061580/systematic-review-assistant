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

    
    // PubMed APIからのデータ抽出を強化した関数
    async function extractArticleDetails(article, pmid) {
        // 受け取ったデータの構造をログ出力
        console.log(`PMID ${pmid} データ構造詳細:`, JSON.stringify({
            hasTitle: !!article.title,
            hasAuthors: !!article.authors,
            authorsType: article.authors ? typeof article.authors : 'undefined',
            authorsIsArray: article.authors ? Array.isArray(article.authors) : false,
            authorsSample: article.authors && Array.isArray(article.authors) && article.authors.length > 0 ? 
                JSON.stringify(article.authors[0]) : 'なし',
            hasPubdate: !!article.pubdate,
            hasSource: !!article.source,
            hasFullJournalName: !!article.fulljournalname
        }, null, 2));
        
        // 著者情報を整形（さまざまな構造に対応）
        let authors = '';
        if (article.authors) {
            if (Array.isArray(article.authors)) {
                authors = article.authors
                    .map(author => {
                        // 名前フィールドが存在するか確認
                        if (typeof author === 'object' && author.name) {
                            return author.name;
                        } else if (typeof author === 'string') {
                            return author;
                        } else if (typeof author === 'object' && author.lastName) {
                            // 別の可能性: {lastName: "名字", initials: "イニシャル"} 形式
                            return `${author.lastName}${author.initials ? ' ' + author.initials : ''}`;
                        }
                        return '';
                    })
                    .filter(name => name !== '') // 空の名前を除外
                    .join(', ');
            } else if (typeof article.authors === 'string') {
                authors = article.authors;
            }
        }
        
        // タイトルを取得（複数の可能性に対応）
        const title = article.title || article.docTitle || article.docsum || `PMID: ${pmid}`;
        
        // 出版年を取得（さまざまな形式に対応）
        let year = '';
        if (article.pubdate) {
            // pubdateフィールドを解析
            const dateMatch = article.pubdate.match(/(\d{4})/);
            if (dateMatch && dateMatch[1]) {
                year = dateMatch[1];
            } else {
                year = article.pubdate.split(' ')[0] || '';
            }
        } else if (article.year) {
            year = article.year;
        } else if (article.sortpubdate) {
            // YYYY/MM/DD 形式の可能性
            const dateMatch = article.sortpubdate.match(/(\d{4})/);
            if (dateMatch && dateMatch[1]) {
                year = dateMatch[1];
            }
        }
        
        // ジャーナル名を取得（複数の可能性に対応）
        const journal = article.fulljournalname || article.source || article.journal || '';
        
        return {
            authors,
            title,
            year,
            journal
        };
    }


    // バックエンドAPIで検索結果を取得する関数
    // バックエンドAPIで検索結果を取得する関数内の修正
    // 論文データを取得する関数を修正（検索結果処理時の並行処理数を制限）
    // getSearchResults関数の修正部分（PubMed APIからの情報取得を改善）
    // バックエンドAPIで検索結果を取得する関数
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
            
            // レスポンス構造を詳細にログ出力
            console.log('summaryData構造サンプル:', JSON.stringify(summaryData.result ? {
                hasUids: !!summaryData.result.uids,
                firstPmid: pmids[0],
                firstArticleSample: summaryData.result[pmids[0]] ? {
                    hasTitle: !!summaryData.result[pmids[0]].title,
                    hasAuthors: !!summaryData.result[pmids[0]].authors,
                    authorsType: summaryData.result[pmids[0]].authors ? 
                        typeof summaryData.result[pmids[0]].authors : 'undefined',
                    authorsIsArray: summaryData.result[pmids[0]].authors ? 
                        Array.isArray(summaryData.result[pmids[0]].authors) : false,
                    firstAuthor: summaryData.result[pmids[0]].authors && 
                        Array.isArray(summaryData.result[pmids[0]].authors) && 
                        summaryData.result[pmids[0]].authors.length > 0 ? 
                        JSON.stringify(summaryData.result[pmids[0]].authors[0]) : 'なし',
                    hasPubdate: !!summaryData.result[pmids[0]].pubdate,
                    hasSource: !!summaryData.result[pmids[0]].source,
                    hasJournalname: !!summaryData.result[pmids[0]].fulljournalname
                } : 'データなし'
            } : 'result欠落', null, 2));
            
            // 論文データを整形
            const articlesPromises = pmids.map(async (pmid) => {
                try {
                    // 新しいPubMed API応答構造への対応
                    if (summaryData.result && summaryData.result.uids && summaryData.result[pmid]) {
                        const article = summaryData.result[pmid];
                        console.log(`PMID ${pmid} のデータを見つけました（新構造）`);
                        
                        // データ構造詳細をログ出力
                        console.log(`PMID ${pmid} データ構造:`, JSON.stringify({
                            hasTitle: !!article.title,
                            hasAuthors: !!article.authors,
                            authorsType: article.authors ? typeof article.authors : 'undefined',
                            authorsIsArray: article.authors ? Array.isArray(article.authors) : false,
                            authorsSample: article.authors && Array.isArray(article.authors) && article.authors.length > 0 ? 
                                JSON.stringify(article.authors[0]) : 'なし',
                            hasPubdate: !!article.pubdate,
                            hasSource: !!article.source,
                            hasFullJournalName: !!article.fulljournalname
                        }, null, 2));
                        
                        // 論文の詳細情報を抽出（著者、年、ジャーナル等）
                        const details = await extractArticleDetails(article, pmid);
                        
                        // 抄録の取得（抄録がない場合は直接PubMedから取得を試みる）
                        let abstract = article.abstract || '';
                        if (!abstract) {
                            try {
                                abstract = await fetchAbstract(pmid);
                            } catch (err) {
                                console.warn(`PMID ${pmid} の抄録取得に失敗:`, err);
                                abstract = '';
                            }
                        }
                        
                        // 抄録の要約
                        let abstractSummary = 'Abstract not available';
                        if (abstract) {
                            try {
                                abstractSummary = await generateAbstractSummary(abstract);
                            } catch (err) {
                                console.warn(`PMID ${pmid} の抄録要約に失敗:`, err);
                                abstractSummary = '抄録の要約を生成できませんでした';
                            }
                        }
                        
                        // PubMed URL
                        const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
                        
                        return {
                            pmid,
                            pubmedUrl,
                            title: details.title,
                            authors: details.authors,
                            year: details.year,
                            journal: details.journal,
                            abstract,
                            abstractSummary
                        };
                    } 
                    // 古い構造への対応
                    else if (summaryData.result && summaryData.result[pmid]) {
                        const article = summaryData.result[pmid];
                        console.log(`PMID ${pmid} のデータを見つけました（従来構造）`);
                        
                        // データ構造詳細をログ出力
                        console.log(`PMID ${pmid} 従来構造:`, JSON.stringify({
                            hasTitle: !!article.title,
                            hasAuthors: !!article.authors,
                            authorsType: article.authors ? typeof article.authors : 'undefined',
                            hasPubdate: !!article.pubdate,
                            hasSource: !!article.source
                        }, null, 2));
                        
                        // 論文の詳細情報を抽出
                        const details = await extractArticleDetails(article, pmid);
                        
                        // 抄録の取得
                        let abstract = article.abstract || '';
                        if (!abstract) {
                            try {
                                abstract = await fetchAbstract(pmid);
                            } catch (err) {
                                console.warn(`PMID ${pmid} の抄録取得に失敗:`, err);
                                abstract = '';
                            }
                        }
                        
                        // 抄録の要約
                        let abstractSummary = 'Abstract not available';
                        if (abstract) {
                            try {
                                abstractSummary = await generateAbstractSummary(abstract);
                            } catch (err) {
                                console.warn(`PMID ${pmid} の抄録要約に失敗:`, err);
                                abstractSummary = '抄録の要約を生成できませんでした';
                            }
                        }
                        
                        // PubMed URL
                        const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
                        
                        return {
                            pmid,
                            pubmedUrl,
                            title: details.title,
                            authors: details.authors,
                            year: details.year,
                            journal: details.journal,
                            abstract,
                            abstractSummary
                        };
                    }
                    // データが見つからない場合、直接情報取得を試みる
                    else {
                        console.log(`PMID ${pmid} のデータが見つかりません - 直接取得を試みます`);
                        
                        // PubMed URLは常に生成できる
                        const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
                        
                        // 抄録を直接取得
                        let abstract = '';
                        try {
                            abstract = await fetchAbstract(pmid);
                        } catch (err) {
                            console.warn(`PMID ${pmid} の抄録直接取得に失敗:`, err);
                        }
                        
                        // デフォルト値を設定
                        let title = `PMID: ${pmid}`;
                        let abstractSummary = '抄録を取得できませんでした';
                        let authors = '';
                        let year = '';
                        let journal = '';
                        
                        // 抄録から情報抽出を試みる
                        if (abstract && abstract.length > 10) {
                            try {
                                // OpenAI APIを使用して情報を抽出
                                const metaData = await fetchWithRetry(`${API_BASE_URL}/api/openai`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        model: "gpt-4o",
                                        messages: [
                                            {
                                                role: "system",
                                                content: "あなたは医学論文の抄録から情報を抽出する専門家です。抄録からタイトル、著者、出版年、ジャーナル名を見つけてください。"
                                            },
                                            {
                                                role: "user",
                                                content: `以下の医学論文の抄録から、論文のメタデータを抽出してください。
    以下のJSON形式で返してください:
    {
    "title": "論文のタイトル",
    "authors": "著者名（わかる場合）",
    "year": "出版年（わかる場合）",
    "journal": "ジャーナル名（わかる場合）"
    }

    抄録:
    ${abstract}`
                                            }
                                        ],
                                        temperature: 0.3
                                    })
                                });
                                
                                try {
                                    // JSONパースを試みる
                                    const extractedData = JSON.parse(metaData.choices[0].message.content);
                                    title = extractedData.title || title;
                                    authors = extractedData.authors || authors;
                                    year = extractedData.year || year;
                                    journal = extractedData.journal || journal;
                                } catch (jsonErr) {
                                    console.warn('メタデータのJSON解析に失敗:', jsonErr);
                                    // 通常のテキスト応答からタイトルを抽出
                                    title = metaData.choices[0].message.content.trim().split('\n')[0];
                                }
                                
                                // 抄録の要約も生成
                                abstractSummary = await generateAbstractSummary(abstract);
                            } catch (err) {
                                console.warn(`PMID ${pmid} のメタデータ抽出に失敗:`, err);
                            }
                        }
                        
                        return {
                            pmid,
                            pubmedUrl,
                            title,
                            authors,
                            year,
                            journal,
                            abstract: abstract || '',
                            abstractSummary
                        };
                    }
                } catch (error) {
                    console.error(`PMID ${pmid} の処理中にエラーが発生しました:`, error);
                    
                    // エラーが発生しても処理を継続するために基本情報を返す
                    return {
                        pmid,
                        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
                        title: `PMID: ${pmid} (処理中にエラーが発生しました)`,
                        authors: '',
                        year: '',
                        journal: '',
                        abstract: '',
                        abstractSummary: 'エラーが発生したため、要約を生成できませんでした'
                    };
                }
            });
            
            let articles = [];
            try {
                articles = await Promise.all(articlesPromises);
            } catch (allError) {
                console.error('一部の論文情報取得に失敗しました:', allError);
                // Promise.allがエラーでも処理を継続
            }
            
            // nullを除外し、基本情報を確保
            return articles
                .filter(article => article !== null)
                .map(article => ({
                    pmid: article.pmid,
                    pubmedUrl: article.pubmedUrl || `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
                    title: article.title || `PMID: ${article.pmid}`,
                    authors: article.authors || '',
                    year: article.year || '',
                    journal: article.journal || '',
                    abstract: article.abstract || '',
                    abstractSummary: article.abstractSummary || 'データなし'
                }));
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
    
    // PubMedから抄録を取得する関数（遅延処理付き）
    async function fetchAbstract(pmid, retryCount = 0) {
        try {
            console.log(`PMID ${pmid} の抄録を取得中...`);
            
            // リクエスト数を調整するための遅延
            // PMIDの数値を使って少しずつ異なる遅延時間を設定（同時リクエストを防ぐ）
            const delay = 500 + (parseInt(pmid) % 10) * 100;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            const response = await fetchWithRetry(`${API_BASE_URL}/api/pubmed/fetch?id=${pmid}&rettype=abstract`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // レスポンスから抄録テキストを抽出
            if (response && response.abstract) {
                const abstractText = response.abstract;
                console.log(`PMID ${pmid} の抄録取得成功 (長さ: ${abstractText.length}文字)`);
                return abstractText;
            }
            
            console.log(`PMID ${pmid} の抄録は利用できません`);
            return "";
        } catch (error) {
            console.error(`PMID ${pmid} の抄録取得中にエラーが発生しました:`, error);
            
            // レート制限エラーの場合、より長い遅延を入れて再試行
            if (error.message && error.message.includes('rate limit exceeded') && retryCount < 3) {
                const retryDelay = 2000 + (retryCount * 1000); // 再試行ごとに遅延を増加
                console.log(`レート制限エラー。${retryDelay}ms後に再試行します（${retryCount + 1}/3）...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return fetchAbstract(pmid, retryCount + 1);
            }
            
            return "";
        }
    }
        
    // 研究デザインを判定する関数の改善版
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
                            content: "あなたは医学研究のエキスパートです。与えられた論文の抄録から研究デザインを判定してください。抄録に明示的な記述がなくても、研究方法や結果の記述から研究デザインを推測できます。"
                        },
                        {
                            role: "user",
                            content: `以下の医学論文の抄録から研究デザインを判定してください。
    抄録の内容を分析して、最も適切な研究デザインを以下のいずれかでラベル付けしてください。
    抄録の記述から明確に判断できない場合は、最も可能性の高いデザインを選択してください。

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
            
            // 応答から研究デザインを抽出
            const fullResponse = data.choices[0].message.content.trim();
            const firstLine = fullResponse.split('\n')[0];
            
            // 研究デザイン名の抽出
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
    // 結果を要約する関数の改善版
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
                            content: "あなたは医学論文の抄録から研究結果を抽出し、要約する専門家です。抄録が構造化されていない場合でも、テキスト全体から主要な研究結果を特定できます。"
                        },
                        {
                            role: "user",
                            content: `以下の医学論文の抄録から主要な「結果（Results）」に関する情報を日本語で1文に要約してください。
    抄録が明示的に「Results」セクションに分かれていない場合は、研究で得られた主な知見や測定結果について要約してください。

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

    // 結論を要約する関数の改善版
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
                            content: "あなたは医学論文の抄録から結論を抽出し、要約する専門家です。抄録が構造化されていない場合でも、テキスト全体から結論や臨床的意義を特定できます。"
                        },
                        {
                            role: "user",
                            content: `以下の医学論文の抄録から「結論（Conclusion）」に関する情報を日本語で1文に要約してください。
    抄録が明示的に「Conclusion」セクションに分かれていない場合は、著者が示唆する主要な結論、臨床的意義、または今後の展望について要約してください。

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
    
    // 検索結果をCSVとしてエクスポートする関数の修正版
    function exportToCSV(results) {
        // CSVヘッダー
        const csvHeader = ['PubMed ID', 'PubMed URL', 'タイトル', '著者', '出版年', 'ジャーナル', '要約'];
        
        // 各行のデータを作成（データが欠損している場合のチェックを強化）
        const csvRows = results.map(function(article) {
            // デバッグ用ログ（開発時に確認し、後で削除）
            console.log('CSV書き出し用データ:', {
                pmid: article.pmid,
                authors: article.authors || '',
                year: article.year || '',
                journal: article.journal || ''
            });
            
            return [
                article.pmid || '',
                article.pubmedUrl || `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
                article.title || '',
                article.authors || '', // 著者データが存在するか確認
                article.year || '',    // 出版年データが存在するか確認
                article.journal || '', // ジャーナル名データが存在するか確認
                article.abstractSummary || ''
            ];
        });
        
        // ヘッダーと行を結合
        const csvData = [csvHeader].concat(csvRows);
        
        // CSVフォーマットに変換（文字化け対策）
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // BOMを追加（Excel対応）
        const csvContent = csvData.map(function(row) {
            return row.map(function(cell) {
                // ダブルクォートでくくり、内部のダブルクォートはエスケープ
                return '"' + String(cell).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        
        // BOMありCSVファイルのダウンロード
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'pubmed_search_results.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 詳細情報付き検索結果をCSVとしてエクスポートする関数の修正版
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
        
        // 各行のデータを作成（データ欠損対策を強化）
        const csvRows = results.map(function(article) {
            // デバッグ出力（開発中のみ表示）
            console.log('詳細CSV書き出し用データ:', {
                pmid: article.pmid,
                title: article.title ? article.title.substring(0, 20) + '...' : 'なし',
                hasAuthors: !!article.authors,
                hasYear: !!article.year,
                hasJournal: !!article.journal
            });
            
            return [
                article.pmid || '',
                article.pubmedUrl || `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
                article.title || '',
                article.authors || '',   // 著者データの確認
                article.year || '',      // 出版年データの確認
                article.journal || '',   // ジャーナル名データの確認
                article.studyDesign || 'Unknown',
                article.resultsSummary || '',
                article.conclusionSummary || ''
            ];
        });
        
        // ヘッダーと行を結合
        const csvData = [csvHeader].concat(csvRows);
        
        // CSVフォーマットに変換（文字化け対策としてBOMを追加）
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // BOMを追加（Excel対応）
        const csvContent = csvData.map(function(row) {
            return row.map(function(cell) {
                // ダブルクォートでくくり、内部のダブルクォートはエスケープ
                return '"' + String(cell).replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        
        // BOMありCSVファイルのダウンロード
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'pubmed_detailed_results.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});