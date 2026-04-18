# Calories · 速食熱量計算機

娛樂用途的速食熱量計算工具。多人點餐、搞笑評級、截圖分享。

## 品牌

- 🍔 [漢堡王 / Burger King](./burgerking/)
- 🍟 麥當勞（待補）
- 🍗 肯德基（待補）
- 🥪 摩斯漢堡（待補）

## 結構

純 vanilla JS，無 build 流程。

```
calories.chrischotw.com/
├── index.html          # 品牌入口
└── <brand>/
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── data.js     # 菜單 + 評級門檻
        ├── roast.js    # 吐槽池 + 特殊條件
        └── app.js      # UI / 互動
```

## 部署

`main` 分支 push 後，webhook 自動 `git pull` 到 `/opt/calories.chrischotw.com/`。

## 資料來源

各品牌官方營養標示。數值僅供參考，以門市公告為準。
