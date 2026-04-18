// KFC 專屬擴充
const BRAND_RANK_TAGS = {
  sss: ['上校昨晚夢到你', '全家餐變個人餐的英雄']
};
const BRAND_ROASTS_GRADE = {};
const BRAND_SPECIAL_CONDITIONS = [
  {
    id: 'kfc-bucket',
    trigger: ctx => ctx.items.some(i => i.n === '分享拼盤' || i.n === '上校雞塊(20塊)'),
    roasts: {
      any: [
        '分享拼盤的「分享」兩個字你選擇性失明',
        '這是兩個人的份，除非你在報仇',
        '上校看你的眼神充滿敬意與擔憂'
      ]
    }
  },
  {
    id: 'kfc-double-karla',
    trigger: ctx => ctx.items.filter(i => i.n.includes('雙層')).reduce((s,i)=>s+i.qty,0) >= 1,
    roasts: {
      any: [
        '雙層雞腿堡，胃是你的秘密武器',
        '一層不夠你的你要兩層，我懂'
      ]
    }
  },
  {
    id: 'kfc-egg-tart-spree',
    trigger: ctx => ctx.items.filter(i => i.n.includes('蛋撻')).reduce((s,i)=>s+i.qty,0) >= 3,
    roasts: {
      any: [
        '三個蛋撻，你是來掃貨的嗎',
        '蛋撻愛好者的極致表現'
      ]
    }
  }
];
