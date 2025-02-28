// DOM要素の参照を取得
document.addEventListener('DOMContentLoaded', function() {
    // フォームと結果セクションの要素
    var searchForm = document.getElementById('searchForm');
    var initialForm = document.getElementById('initialForm');
    var loadingSection = document.getElementById('loadingSection');
    var resultSection = document.getElementById('resultSection');
    var articleResultsSection = document.getElementById('articleResultsSection');
    
    // 検索式と結果の表示関連要素
    var searchExpressionElement = document.getElementById('searchExpression');
    var articleCountElement = document.getElementById('articleCount');
    var articleResultsElement = document.getElementById('articleResults');
    var resultsInfoElement = document.getElementById('resultsInfo');
    
    // ボタン要素
    var copySearchExpressionBtn = document.getElementById('copySearchExpression');
    var regenerateButton = document.getElementById('regenerateButton');
    var getResultsButton = document.getElementById('getResultsButton');
    var backToStartButton = document.getElementById('backToStart');
    var downloadCSVButton = document.getElementById('downloadCSV');
    var backToSearchButton = document.getElementById('backToSearch');
    
    // モーダル関連要素
    var showAboutLink = document.getElementById('showAbout');
    var aboutModal = document.getElementById('aboutModal');
    var closeModalButtonX = document.getElementById('closeModalBtn');
    var closeModalButton = document.getElementById('closeModalButton');
    
    // セクションの表示/非表示を制御する関数
    function showSection(section) {
        // すべてのセクションを非表示
        initialForm.style.display = "none";
        loadingSection.style.display = "none";
        resultSection.style.display = "none";
        articleResultsSection.style.display = "none";
        
        // 指定されたセクションのみ表示
        section.style.display = "block";
    }
    
    // 初期表示設定
    initialForm.style.display = "block";
    loadingSection.style.display = "none";
    resultSection.style.display = "none";
    articleResultsSection.style.display = "none";
    aboutModal.style.display = "none";
    
    // 検索クエリとPubMed検索式を保存する変数
    var currentQuery = '';
    var currentSearchExpression = '';
    var searchResults = [];
    
    // -------- モーダル関連機能 -------- //
    
    // モーダルを表示
    showAboutLink.onclick = function(e) {
        e.preventDefault();
        aboutModal.style.display = "flex";
    };
    
    // Xボタンでモーダルを閉じる
    closeModalButtonX.onclick = function() {
        aboutModal.style.display = "none";
    };
    
    // 閉じるボタンでモーダルを閉じる
    closeModalButton.onclick = function() {
        aboutModal.style.display = "none";
    };
    
    // モーダルの外側をクリックで閉じる
    aboutModal.onclick = function(e) {
        if (e.target === aboutModal) {
            aboutModal.style.display = "none";
        }
    };
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && aboutModal.style.display === "flex") {
            aboutModal.style.display = "none";
        }
    });
    
    // -------- 検索関連機能 -------- //
    
    // 検索フォーム送信イベント
    searchForm.onsubmit = async function(e) {
        e.preventDefault();
        
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
        
        // ローディング表示
        showSection(loadingSection);
        
        try {
            // OpenAI APIを使用して検索式を生成
            var searchExpression = await generateSearchExpression(currentQuery);
            currentSearchExpression = searchExpression;
            
            // PubMed APIで検索結果数を取得
            var count = await getArticleCount(searchExpression);
            
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
    
    // 検索式をコピーボタン
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
    
    // 検索式を再生成ボタン
    regenerateButton.onclick = async function() {
        showSection(loadingSection);
        
        try {
            // 検索式を再生成（異なる表現となるよう指示）
            var searchExpression = await generateSearchExpression(currentQuery, true);
            currentSearchExpression = searchExpression;
            
            // PubMed APIで検索結果数を取得
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
    
    // 検索結果を取得ボタン
    getResultsButton.onclick = async function() {
        showSection(loadingSection);
        
        try {
            // PubMed APIで検索結果を取得
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
    
    // 検索式画面に戻るボタン
    backToSearchButton.onclick = function() {
        showSection(resultSection);
    };
    
    // 最初からやり直すボタン
    backToStartButton.onclick = function() {
        // フォーム内容をリセット
        searchForm.reset();
        
        // 変数をクリア
        currentQuery = '';
        currentSearchExpression = '';
        searchResults = [];
        
        // 初期フォームを表示
        showSection(initialForm);
    };
    
    // CSVダウンロードボタン
    downloadCSVButton.onclick = function() {
        if (searchResults.length === 0) {
            alert('ダウンロードする検索結果がありません');
            return;
        }
        
        exportToCSV(searchResults);
    };
    
    // OpenAI APIを使用して検索式を生成する関数
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
            
            const response = await fetch(API_ENDPOINTS.openai, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEYS.openai}`
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
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`OpenAI API エラー: ${response.status}`);
            }
            
            const data = await response.json();
            const searchExpression = data.choices[0].message.content.trim();
            
            return searchExpression;
        } catch (error) {
            console.error('検索式生成中にエラーが発生しました:', error);
            throw new Error('検索式の生成に失敗しました');
        }
    }
    
    // PubMed APIで検索結果数を取得する関数
    async function getArticleCount(searchExpression) {
        try {
            // 検索式をエンコード
            const encodedSearchTerm = encodeURIComponent(searchExpression);
            
            // PubMed APIから検索結果数を取得
            const response = await fetch(`${API_ENDPOINTS.pubmedSearch}?term=${encodedSearchTerm}&retmax=0&format=json&api_key=${API_KEYS.pubmed}`);
            
            if (!response.ok) {
                throw new Error(`PubMed API エラー: ${response.status}`);
            }
            
            const data = await response.json();
            return data.esearchresult.count;
        } catch (error) {
            console.error('検索結果数取得中にエラーが発生しました:', error);
            throw new Error('検索結果数の取得に失敗しました');
        }
    }
    
    // PubMed APIで検索結果を取得する関数
    async function getSearchResults(searchExpression) {
        try {
            // 検索式をエンコード
            const encodedSearchTerm = encodeURIComponent(searchExpression);
            
            // 最初のステップ: 検索クエリに一致するPubMed IDのリストを取得
            const searchResponse = await fetch(`${API_ENDPOINTS.pubmedSearch}?term=${encodedSearchTerm}&retmax=30&format=json&api_key=${API_KEYS.pubmed}`);
            
            if (!searchResponse.ok) {
                throw new Error(`PubMed Search API エラー: ${searchResponse.status}`);
            }
            
            const searchData = await searchResponse.json();
            const pmids = searchData.esearchresult.idlist;
            
            if (pmids.length === 0) {
                return [];
            }
            
            // 第二ステップ: PubMed IDを使用して論文の詳細情報を取得
            const summaryResponse = await fetch(`${API_ENDPOINTS.pubmedSummary}?id=${pmids.join(',')}&format=json&api_key=${API_KEYS.pubmed}`);
            
            if (!summaryResponse.ok) {
                throw new Error(`PubMed Summary API エラー: ${summaryResponse.status}`);
            }
            
            const summaryData = await summaryResponse.json();
            
            // 論文データを整形
            const articles = await Promise.all(pmids.map(async (pmid) => {
                const article = summaryData.result[pmid];
                
                if (!article) {
                    return null;
                }
                
                // 著者情報を整形
                let authors = '';
                if (article.authors && article.authors.length > 0) {
                    authors = article.authors
                        .map(author => `${author.name || ''}`)
                        .join(', ');
                }
                
                // タイトルを取得
                const title = article.title || 'タイトルなし';
                
                // 抄録の要約
                let abstractSummary = 'Abstract not available';
                if (article.abstract) {
                    // 抄録がある場合、OpenAI APIを使用して要約を生成
                    abstractSummary = await generateAbstractSummary(article.abstract);
                }
                
                // PubMed URL
                const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
                
                return {
                    pmid,
                    pubmedUrl,
                    title,
                    authors,
                    abstractSummary
                };
            }));
            
            // nullを除外
            return articles.filter(article => article !== null);
        } catch (error) {
            console.error('検索結果取得中にエラーが発生しました:', error);
            throw new Error('検索結果の取得に失敗しました');
        }
    }
    
    // OpenAI APIを使用して抄録を要約する関数
    async function generateAbstractSummary(abstract) {
        try {
            const response = await fetch(API_ENDPOINTS.openai, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEYS.openai}`
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
            
            if (!response.ok) {
                throw new Error(`OpenAI API エラー: ${response.status}`);
            }
            
            const data = await response.json();
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
                <div class="article-info">PubMed ID: ${article.pmid}</div>
                <div class="article-summary">
                    <strong>要約:</strong> ${article.abstractSummary}
                </div>
            `;
            
            articleResultsElement.appendChild(articleElement);
        });
    }
    
    // 検索結果をCSVとしてエクスポートする関数
    function exportToCSV(results) {
        // CSVヘッダー
        const csvHeader = ['PubMed ID', 'PubMed URL', 'タイトル', '著者', '要約'];
        
        // 各行のデータを作成
        const csvRows = results.map(function(article) {
            return [
                article.pmid,
                article.pubmedUrl,
                article.title,
                article.authors,
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
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'pubmed_search_results.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
