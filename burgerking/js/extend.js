// ===== 漢堡王專屬擴充（BK Extend） =====
// 此檔案完全選填，移除也不影響網站運作。
// 三種擴充點，皆會被 shared/roast.js 的 pickRoast() 與 data.js 的 pickRankTag() 讀取：
//
// 1. BRAND_RANK_TAGS：各評級的品牌專屬標語（追加至 RANKS.tags）
// 2. BRAND_ROASTS_GRADE：各評級的品牌專屬吐槽（追加至通用池）
// 3. BRAND_SPECIAL_CONDITIONS：品牌專屬的特殊條件觸發

// ---- 範例：漢堡王熱量神獸們的專屬吐槽 ----
const BRAND_RANK_TAGS = {
  sss: [
    '你是華堡三層的親兒子',
    '漢堡王董事會正在寫感謝函'
  ]
};

const BRAND_ROASTS_GRADE = {
  // 目前留空，需要時追加
};

const BRAND_SPECIAL_CONDITIONS = [
  {
    id: 'bk-whopper-stack',
    trigger: ctx => ctx.items.some(i => i.n.includes('三層') || i.n.includes('霸三')),
    roasts: {
      any: [
        '三層以上是友善店員用來勸退客人的陷阱，你居然點了',
        '三層華堡的設計初衷：讓別人看到你吃的畫面',
        '吃三層就像開雙 B，主要用途是社交而非通勤'
      ]
    }
  },
  {
    id: 'bk-peanut-abuse',
    trigger: ctx => ctx.items.filter(i => i.n.includes('花生')).reduce((s,i)=>s+i.qty,0) >= 2,
    roasts: {
      any: [
        '兩個花生堡，你是要在漢堡王做花生醬供應鏈研究嗎',
        '花生愛好者的朝聖餐'
      ]
    }
  }
];
