# 🍟 Calories · 速食熱量計算機

> 一起點餐、一起揭曉熱量真相。

多人點餐、搞笑評級、截圖分享 — 讓你的外食罪惡感變成娛樂節目。

👉 **線上版**：<https://calories.chrischotw.com/>

## 支援品牌

| 品牌 | 連結 | 品項數 | 資料欄位 |
|---|---|---:|---|
| 🍔 漢堡王 Burger King | [/burgerking/](https://calories.chrischotw.com/burgerking/) | 97 | 8 欄齊 |
| 🥪 摩斯 MOS Burger | [/mos/](https://calories.chrischotw.com/mos/) | 111 | 7 欄（無糖欄） |
| 🍟 麥當勞 McDonald's | [/mcdonalds/](https://calories.chrischotw.com/mcdonalds/) | 87 | 5 欄（無 sf/tf/sg） |
| 🍗 肯德基 KFC | [/kfc/](https://calories.chrischotw.com/kfc/) | 54 | 8 欄齊 |

8 欄指：熱量、蛋白質、脂肪、飽和脂肪、反式脂肪、碳水、糖、鈉。

## 特色

- **多人點餐**：一鍵切換單人／多人，每位成員獨立購物車，結算顯示全員合計
- **搞笑 7 級評比**（D → C → B → A → S → SS → SSS）：
  - 依熱量門檻給等級
  - 每次揭曉隨機抽標語（每家品牌自有專屬池）
  - 特殊條件觸發吐槽（例如 KFC 分享拼盤獨享、MOS 三個以上珍珠堡、BK 三層華堡…）
- **營養素勾選**：預設只顯示熱量 + 鈉，其他 6 欄一勾即現
- **截圖分享**：用 html2canvas 把成績單輸出成 PNG，檔名帶日期
- **評級字母掉落動畫**：仿 commutetruth 的 `gradeDrop` 彈跳效果

## 專案結構

純 vanilla JavaScript，無框架、無 Node build。本地雙擊 `index.html` 就能跑（部分瀏覽器需要 local server，跑 `python -m http.server` 即可）。

```
calories.chrischotw.com/
├── index.html              # 品牌入口頁
├── shared/js/
│   ├── app.js              # UI 邏輯（四家共用）
│   └── roast.js            # 通用吐槽池 + 特殊條件
└── <brand>/                # burgerking / mos / mcdonalds / kfc
    ├── index.html
    ├── css/styles.css      # 品牌配色（覆寫 --bk-* CSS vars）
    └── js/
        ├── data.js         # 菜單 + RANKS + FIELDS + DAILY_LIMITS
        └── extend.js       # 品牌專屬擴充（選填）
```

### extend.js 擴充點

每個品牌可選擇性宣告以下全域變數追加內容（通用池不會被蓋）：

```js
// <brand>/js/extend.js
const BRAND_RANK_TAGS = { sss: ['...'], ss: ['...'] };
const BRAND_ROASTS_GRADE = { SSS: ['...'] };
const BRAND_SPECIAL_CONDITIONS = [
  {
    id: 'unique-id',
    trigger: ctx => /* 依 ctx.items / ctx.totals / ctx.grade 判斷 */,
    roasts: { any: ['...'], SSS: ['...'] }
  }
];
```

Script 載入順序：`data.js` → `extend.js` → `shared/roast.js` → `shared/app.js`

## 新增品牌

1. `cp -r burgerking new-brand/`
2. 替換 `new-brand/js/data.js` 的 `MENU`（保留 `FIELDS` / `RANKS` 結構）
3. 改 `new-brand/css/styles.css` 的 `:root` 配色
4. 改 `new-brand/index.html` 的 `<title>` 與 `<h1>`
5. 加到根 `index.html` 的品牌卡清單
6. `git push` 完成，webhook 自動部署

## 部署流程

```
push → GitHub webhook → Hostinger adnanh/webhook (port 9001)
     → /opt/webhook/scripts/deploy-calories.sh
     → git fetch + reset --hard origin/main
     → 自動 content-hash build（各品牌的 js/css 產生 <name>.<sha8>.<ext> 副本並 sed 替換 HTML）
     → Telegram 通知「✅ calories deployed」
```

### Content hash cache busting

為了徹底閃過 Cloudflare / 瀏覽器 cache，每次部署會：

- 刪除舊的 hash 檔（避免堆積）
- 對每個 `.js` / `.css` 計算 `sha256 | head -c 8`
- 複製成 `<name>.<hash>.<ext>`（保留原檔方便開發時雙擊測試）
- `sed` 改寫所有 `<brand>/index.html` 的引用

結果：原始碼沒動，但每次內容變 URL 就變，cache 永遠不會打中舊版。

## 技術棧

- **Vanilla JS / HTML / CSS** — 沒有框架、沒有 npm、沒有 webpack
- **[html2canvas](https://html2canvas.hertzen.com/)** — 截圖成 PNG
- **[SweetAlert2](https://sweetalert2.github.io/)** — 取代原生 alert / confirm / prompt
- **Cloudflare** — DNS + CDN + HTTPS
- **Hostinger VPS + adnanh/webhook + nginx** — 託管

## 資料來源

| 品牌 | 來源 | 備註 |
|---|---|---|
| 漢堡王 | 官方營養標示 | 8 欄齊 |
| 摩斯 | 摩斯漢堡 2026/3 商品營養分析表 | 原表無糖欄 |
| 麥當勞 | [nuturefit.com](https://nuturefit.com/mcdonalds-calories/) | 第三方整理，僅 5 欄 |
| 肯德基 | [dailydietitian.com.tw](https://dailydietitian.com.tw/) | 第三方整理 |

數值僅供參考，**以門市公告為準**。本站為娛樂用途，評級純屬搞笑。

## 開發提示

- 圖片辨識：大張營養標示圖用色塊邊界自動分離（飽和度掃描 → RGB 量化 → 連續分組 → LANCZOS 放大），不要用百分比亂切
- 原始營養標示圖放 `.source-material/`（`.gitignore` 已擋）
- `shared/` 修改會同時影響所有品牌，謹慎

## 授權

MIT.

## 作者

Made by [Chris.Cho](https://chrischotw.com/) · [GitHub](https://github.com/ChrisChoTW)

Co-developed with Claude Code.
