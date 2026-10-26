# 溪口卡丁車 · 動物車隊

以溪口校園為舞台的瀏覽器卡丁車遊戲，提供八位可愛動物車手、操場賽與校園串聯賽。

**[直接開啟遊戲](https://upsky0210.github.io/xikou-kart/)**

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

## GitHub Pages

本儲存庫使用 GitHub Actions 將 `site/` 發佈至 Pages；推送 `main` 後自動更新。第一次需在儲存庫 Settings → Pages 將來源設為 GitHub Actions。

部署設定依 [GitHub Pages 官方文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

第三方程式與字型的授權資訊見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
