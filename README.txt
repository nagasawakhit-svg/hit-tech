使い方
1. 既存HITサイトの index.html は丸ごと差し替えず、今回の index.html は「社員ログイン」リンク追加済み版です。
2. style.css は既存デザインを残したまま、社員ログイン用CSSだけを末尾に追加しています。
3. login.html / script.js / firebase-config.example.js を追加してください。
4. firebase-config.example.js を firebase-config.js にリネームしてFirebase設定を入れてください。
5. load-test-app フォルダに負荷試験報告書アプリを入れてください。
6. load-test-app/index.html の最後に以下を追加すると、未ログインでは入れません。
   <script type="module" src="auth-guard.js"></script>
