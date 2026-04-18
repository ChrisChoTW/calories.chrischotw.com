// 麥當勞專屬擴充
const BRAND_RANK_TAGS = {
  sss: ['大麥克家族正準備幫你開派對', '金拱門之王']
};
const BRAND_ROASTS_GRADE = {};
const BRAND_SPECIAL_CONDITIONS = [
  {
    id: 'mc-bigmac-spam',
    trigger: ctx => ctx.items.filter(i => i.n.includes('大麥克') || i.n.includes('四盎司')).reduce((s,i)=>s+i.qty,0) >= 2,
    roasts: {
      any: [
        '兩個大漢堡，你是在挑戰還是絕望？',
        '你吃的不是漢堡，是兒時回憶的兩倍版'
      ]
    }
  },
  {
    id: 'mc-mcfries-upgrade',
    trigger: ctx => ctx.items.some(i => i.n === '薯條(大)'),
    roasts: {
      any: [
        '中改大的那一刻你就知道會後悔',
        '薯條大份，人生大份罪惡'
      ]
    }
  },
  {
    id: 'mc-frozen-tornado',
    trigger: ctx => ctx.items.some(i => i.n.includes('冰炫風') || i.n.includes('蛋捲冰淇淋')),
    roasts: {
      any: [
        '冰炫風是飯後甜點，不是主食',
        '今天你又用甜點結束一切'
      ]
    }
  }
];
