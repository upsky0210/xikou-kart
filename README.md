# 溪口卡丁車 · 動物車隊

以溪口校園為舞台的瀏覽器卡丁車遊戲，提供八位可愛動物車手、操場賽與校園串聯賽。

**[直接開啟遊戲](https://upsky0210.github.io/xikou-kart/)**

**[M5／M6 獨立試作：兩款立體臉＋走廊中庭短程試駕](https://upsky0210.github.io/xikou-kart/lab.html)**。可旋轉／近看橘貓與米格魯、切換車手，以鍵盤或螢幕按鈕試駕約 56 公尺的灰盒環線；提供路線示範、暫停與安全重置。此入口尚未接入正式賽道與排行。走廊寬度及池塘位置依校園平面，入口開口與坡道為可行性試作，尚未驗證完整原場景的柱子與低頂鏡頭。

## 怎麼玩

1. 選擇橘貓、狐蒙、倉鼠、米格魯、獼猴、寶馬、羊妹或山豬。
2. 選擇「操場環線」或「全校＋操場」，再選一圈／兩圈。
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

目前預設為親子友善操控：轉向漸進、放開快速回正、反打迅速，轉彎稍減速；直線最高速約 40 km/h。光門約 7.2–7.6 m 寬，中間整片都可通過，不需要碰到框。新的排行與幽靈另存，調整前的成績可在排行榜選擇「調整前紀錄」查看。

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
