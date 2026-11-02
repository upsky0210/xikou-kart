# 溪口卡丁車 · 動物車隊

以溪口校園為舞台的瀏覽器卡丁車遊戲，提供八位可愛動物車手、操場賽與校園串聯賽。

**[直接開啟遊戲](https://upsky0210.github.io/xikou-kart/)**

**[操場＋走廊中庭正式賽道](https://upsky0210.github.io/xikou-kart/play.html?track=courtyard&laps=1)**：約 303 公尺，使用完整原校園場景，穿過西側穿堂、走廊與中庭，再由南側坡道回操場。支援一圈／兩圈、自由試駕、安全重置、獨立排行及個人最佳幽靈。走廊與坡道不限速、跟車鏡頭降低到天花板下；橘貓與米格魯已採用確認後的連續立體臉型。原本兩條賽道仍可在選單切換。

**[早期獨立造型與灰盒樣本](https://upsky0210.github.io/xikou-kart/lab.html)**仍保留供比較；完整校園整合版請使用上方正式賽道入口。

四車競賽可與三台電腦車同場起跑，即時顯示名次與完賽勝負。車輛彼此不互撞，避免窄道堵塞；仍會碰撞校園牆面。另保留個人計時與自由試駕。

2026-11-01 再次提高 AI 直線速度、出彎加速與持續轉彎速度，保留提前煞車與寬路超車。標準／挑戰的大巡迴兩圈約再縮短 12%／13%；四賽道三難度共 36 台次兩圈驗證均零碰撞、漏點、重置。已實作下方 8 種校園道具競賽，保留[10 種候選規劃](docs/校園道具規劃-2026-11-01.md)。

2026-10-31：電腦車提早看彎煞車、提高直線與彎道速度，三位車手有不同節奏，在寬直道會換線嘗試超車，窄道與急彎提早回中線；換線前會檢查真實場景障礙。跟車鏡頭降低並拉近，高速與加速時視野漸增，加入周邊風切線、引擎與風聲；靜音、暫停、完賽與系統減少動態效果設定均有對應處理。玩家的物理操控與成績規則保持原版本。

遊戲是獨立校園副本，不會自動讀取或同步本機 `3D School` 檔案。賽車光照使用自己的 `xikou-kart.time` 設定，首次預設白天，不再沿用原校園導覽的 `campus-time`。

右上方「☀️ 白天／🌙 夜晚」按鈕可隨時切換校園天空、光照及窗戶亮燈，約 1.5 秒漸變，包含選角、試駕、比賽與暫停畫面。選擇記在這個瀏覽器；重新開啟仍保留，與原校園導覽分開。

橘貓保留高精細造型；其餘七隻車手已重新雕塑連續頭部表面，包含各自的臉型、口鼻、眼窩與耳型。選角頭像由正式 3D 模型直接渲染，與比賽角色一致。可在 [造型展示](https://upsky0210.github.io/xikou-kart/roster.html) 切換正面、側面與背面。

2026-10-31 最新車隊更換：[無尾熊、浣熊與長頸鹿專屬造型](https://upsky0210.github.io/xikou-kart/roster.html?crew=wildlife)。倉鼠→無尾熊、獼猴→浣熊、兔兔→長頸鹿。三隻各自雕塑臉型、身體及物種細節：無尾熊有奶油粉耳毛、大絨鼻與腳掌肉墊；浣熊有清晰白眉眼罩、細手指與立體環紋尾；長頸鹿有長脖子、不規則棕斑、桃色口鼻、藍眼睛、睫毛、角與短鬃。正式選角、AI、幽靈及頭像同步更新，舊角色選擇自動對應新角色。羊妹沿用黑色長臉與奶油捲羊毛版。

新增 [橘貓高精細樣本](https://upsky0210.github.io/xikou-kart/cat-study.html)：可拖曳旋轉、臉部特寫、全車／背面，以及切換現有造型比較。獨立展示保留新舊比較；高精細造型已套用所有比賽車手。

操場＋走廊中庭賽道已移除人工賽道護欄與其碰撞，保留原校園牆面與坡道側面。車隊目前為橘貓、長頸鹿、無尾熊、米格魯、浣熊、寶馬、羊妹、山豬。

新增「全校＋操場＋走廊中庭」大巡迴，將兩條完整路線從西側通道串聯，依光門順序完成全程。電腦車可選輕鬆／標準／挑戰，依前方彎道提早煞車、直線恢復速度。


## 校園道具競賽（2026-11-01）

[直接玩 8 種道具競賽](https://upsky0210.github.io/xikou-kart/play.html?track=grand&laps=1&items=1)。選單可改成核心 6 種；四條賽道都支援一圈／兩圈，以及三台 AI。

| 道具 | 使用效果 |
| --- | --- |
| 牛奶瓶 | 加速 25%，持續 1.8 秒；與甩尾／加速帶取較強效果 |
| 粉筆 | 向前直投最多 20 公尺，命中減速 35%，1.2 秒 |
| 水彩罐 | 往後灑水彩，周邊暈染 1.5 秒，輕微減速；中央與按鈕保持清楚 |
| 透明尺 | 4 秒內擋一次攻擊 |
| 橡皮擦 | 清除水彩、減速，提供 1.2 秒保護 |
| 膠水瓶 | 往後留下 5 秒膠水區，命中減速 30%，1 秒 |
| 紙飛機 | 緩慢轉向追蹤前方可見對手，最多 25 公尺；命中減速 25%，1 秒 |
| 下課鈴 | 0.3 秒光圈與鈴聲預告後，4 公尺內可見對手減速 20%，0.8 秒 |

經過發光文具盒領取；鍵盤 **E** 或點擊道具圖示使用。每車只有一格；補給盒對每車各自冷卻 8 秒，領先車不會搶走其他車的份。AI 同樣領取、持有、使用與受擊，反應延遲 0.7–1.4 秒。攻擊會被牆面阻擋、不同樓層不互相命中，減速不疊加，受擊效果結束後仍有約 2 秒保護。

道具賽依賽道、圈數、6／8 種分開儲存名次、時間和使用／命中／防護次數，不錄製道具幽靈。原計時挑戰與幽靈繼續保留。可按「先練習校園道具」熟悉操作。

驗證：`node tools/verify-items.mjs`，涵蓋攻防判定、牆面／高差、冷卻、防連擊、6／8 種、紀錄隔離與四條賽道 16 台車實際物理完賽；包含大巡迴兩圈。測試用 `qa=1` 領取與命中按鈕僅在 QA 頁顯示，成績使用獨立測試儲存。

## 怎麼玩

1. 選擇橘貓、長頸鹿、無尾熊、米格魯、浣熊、寶馬、羊妹或山豬。
2. 選擇「操場＋走廊中庭」、「操場環線」或「全校＋操場」，再選一圈／兩圈。
3. 填寫暱稱並開始，依序通過光門，挑戰自己的最佳紀錄。

| 操作 | 按鍵 |
| --- | --- |
| 油門 | W／↑ |
| 煞車與倒車 | S／↓ |
| 左右轉向 | A、D／←、→ |
| 甩尾集氣 | 轉彎時按空白鍵，集滿後放開 |
| 回檢查點 | R |
| 暫停／繼續 | P／Esc |

平板可使用畫面觸控按鈕，同時按油門與轉向；西側窄道請提早減速。音效可在右上角關閉。

Chromebook／平板請在開始畫面的「操作方式」選擇「螢幕按鈕」，按開始後就會出現左側方向鍵與右側油門。自動模式同時檢查觸控螢幕及指標能力，支援主要指標仍是滑鼠的觸控裝置；也可用右上「觸控操作」切換。

**[直接開啟螢幕觸控版](https://upsky0210.github.io/xikou-kart/play.html?track=campus&laps=1&controls=touch)**

目前預設為暢快操控：轉向更靈敏、放開快速回正、反打迅速，轉彎稍減速；直線最高速約 40 km/h。光門約 7.2–7.6 m 寬，中間整片都可通過，不需要碰到框。新的排行與幽靈另存，調整前的成績可在排行榜選擇「先前版本紀錄」查看。

## 內容

- 八位原創程式幾何 3D 動物車手，性能相同、車色不同。
- 操場環線約 168 公尺；全校＋操場約 557 公尺、24 個順序檢查點。
- 加速帶、甩尾集氣、跟車鏡頭、碰撞、迷你地圖及安全重置。
- 本機前五名與個人最佳幽靈車，依暱稱、路線及圈數分開。
- 紀錄保存在目前瀏覽器，沒有帳號、雲端同步或多人連線。

桌面瀏覽器已測試；iPad 的多點觸控與長時間效能仍待實機驗收。

## 本機開啟

```sh
python -m http.server 5174 --directory site
```

開啟 http://localhost:5174/ 。請透過 HTTP 伺服器執行，勿直接以檔案方式開啟 HTML。

## 在家裡與學校兩台電腦更新

第一次在學校電腦下載：

```powershell
git clone https://github.com/upsky0210/xikou-kart.git C:\AI\Codex\Kart
cd C:\AI\Codex\Kart
python -m http.server 5174 --directory site
```

若該資料夾已經有檔案，請另選新的空資料夾，不要覆蓋現有專案。完整遊戲原始碼都在 `site/`，不需要另外複製 3D School。

每次開始修改前，在這份 Git 儲存庫內執行：

```powershell
git status
git pull --ff-only
```

修改 `site/`，本機試玩確認後：

```powershell
python tools/verify-site.py
git add site
git commit -m "Update kart game"
git push origin main
```

`pull` 是下載更新；`commit` 保存本機修改；`push` 上傳後才會觸發網站更新。公開儲存庫任何人都能下載，但推送必須登入有寫入權限的 GitHub 帳號。學校電腦若沒有 Git／Python，需先依該電腦的管理方式準備工具。

換電腦前先 commit、push；另一台開始工作前先 pull。若 Git 顯示未提交修改或衝突，先保留並處理該修改，不使用強制推送或硬重設。

原開發電腦的儲存庫在 `C:\AI\Codex\Kart\publish\xikou-kart`，請在這裡執行 Git 指令並修改 `site/`。外層舊 `dist/` 是本機預覽副本，不再用它覆蓋 Git 儲存庫。

## GitHub Pages

本儲存庫使用 GitHub Actions 將 `site/` 發佈至 Pages；推送 `main` 後自動更新。第一次需在儲存庫 Settings → Pages 將來源設為 GitHub Actions。

部署設定依 [GitHub Pages 官方文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

第三方程式與字型的授權資訊見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

### Race assistance tuning (2026-11-02)

Edit `site/race-features-config.js` for per-rank item weights, wrong-way angle/duration thresholds, final-lap banner duration, and rocket start windows/multipliers. Weights are relative and zero disables an item for that rank. Player and AI draw from the same table at pickup time. Rocket starts apply only to the player; AI retains its existing start behavior. Normal driving and record schemas remain unchanged.

Run `node tools/verify-items.mjs` and `node tools/verify-race-features.mjs`. The latter checks real route simulation laps and two-second player physics curves. In `?qa=1`, use the reverse/correct direction buttons for visual verification. Browser proof images are in `tools/evidence/`.
