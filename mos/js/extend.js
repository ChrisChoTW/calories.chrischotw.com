// ===== 摩斯漢堡專屬擴充（MOS Extend） =====
// 三種擴充點：
//  1. BRAND_RANK_TAGS      追加評級標語
//  2. BRAND_ROASTS_GRADE   追加等級通用吐槽
//  3. BRAND_SPECIAL_CONDITIONS  追加特殊條件觸發

const BRAND_RANK_TAGS = {
  d: [
    '摩斯米漢堡一顆的水準',
    '你大概只吃了一顆珍珠堡'
  ],
  sss: [
    '摩斯櫃檯在默默報警',
    '和風系列也救不了這個份量'
  ]
};

const BRAND_ROASTS_GRADE = {
  // 留空，有靈感再加
};

const BRAND_SPECIAL_CONDITIONS = [
  {
    id: 'mos-pearl-overload',
    trigger: ctx => ctx.items.filter(i => i.n.includes('珍珠堡')).reduce((s,i)=>s+i.qty,0) >= 3,
    roasts: {
      any: [
        '三個以上珍珠堡，米飯愛好者的極限挑戰',
        '這樣吃你就是半碗飯的化身',
        '摩斯的米農合作社很感謝你的支持'
      ]
    }
  },
  {
    id: 'mos-soup-salty',
    trigger: ctx => ctx.items.some(i => i.n === '和風蔬汁濃湯'),
    roasts: {
      any: [
        '和風蔬汁濃湯一碗 1076mg 鈉，你喝的是醬油湯',
        '喝完湯隔天的水腫請不要怪鏡子'
      ]
    }
  },
  {
    id: 'mos-all-green',
    trigger: ctx => ctx.items.some(i => i.n.includes('纖鮮綠') || i.n.includes('輕綠') || i.n.includes('和風')),
    roasts: {
      any: [
        '選了健康系列的同時，薯條也進了你的購物車？',
        '綠色系菜單是給自己一個心理安慰'
      ]
    }
  },
  {
    id: 'mos-milkshake-bomb',
    trigger: ctx => ctx.items.filter(i => i.n.includes('奶昔')).reduce((s,i)=>s+i.qty,0) >= 2,
    roasts: {
      any: [
        '兩杯奶昔下肚，今天的糖配額算完了',
        '你是來喝奶昔順便吃飯的吧'
      ]
    }
  }
];
