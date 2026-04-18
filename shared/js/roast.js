// ===== 吐槽池：依等級（通用） =====
const ROASTS_GRADE = {
  SSS: [
    '你是否已經忘記健康的感覺？',
    '家醫科醫師看到這張單會想退休',
    '血壓計看到你會主動關機',
    '你不是在吃漢堡，是在跟壽命談判',
    '這份單子裱框起來可以當反面教材',
    '身體今天會寫辭職信',
    '腸胃科診所已準備好為你空出早班'
  ],
  SS: [
    '天選之子，被選來爆肝的',
    '你的身體正在偷偷記帳',
    '明天的體重會讓磅秤哭',
    '研究說一餐超過 2200 kcal 等於兩天份，你真的很務實',
    '這不是一餐，是兩天的份量',
    '你的胃是不是另一個次元？'
  ],
  S: [
    '這數字不是誤差，是蓄意',
    '午餐吃完下午就別想上班了',
    '你吃的不是餐，是 KPI',
    '飽到下午茶都免了',
    '這頓飯可以支撐你跑完半馬，只要你真的去跑'
  ],
  A: [
    '略有放縱，但合乎情理',
    '你和自律的距離：一份薯條',
    '吃到這裡剛剛好，再加一口就過線',
    '邊緣人格，每餐都在標準之上一點點'
  ],
  B: [
    '小罪惡，大快樂',
    '這頓飯沒什麼好道歉的',
    '一個標準快樂上班族的午餐',
    '吃完還能做事，這份量 OK 的'
  ],
  C: [
    '克制得剛剛好',
    '這才叫正餐',
    '你是懂吃飯的人',
    '標準樣本，營養師會微笑'
  ],
  D: [
    '你確定你今天有吃飯嗎？',
    '這份量是給鳥吃的？',
    '回家可能又會偷吃宵夜',
    '你是來拍照打卡的吧',
    '這是點心不是正餐'
  ]
};

// ===== 特殊條件：滿足就把吐槽丟進候選池 =====
// trigger 接收 ctx: { items, totals, grade, memberCount, isAgg }
//   items: [{n,k,p,f,sf,tf,c,sg,s,cat,qty}, ...]（已展開 qty 的原始參考，不是 multiplied）
//   totals: 已加總的 {k,p,f,sf,tf,c,sg,s}
// roasts: { any: [...], [grade]: [...] }
const SPECIAL_CONDITIONS = [
  {
    id: 'sodium-bomb',
    trigger: ctx => ctx.totals.s >= DAILY_LIMITS.s,
    roasts: {
      any: [
        '鈉含量一餐吃完一日份，明天準備浮腫',
        '你的腎明天會寄陳情書',
        '水腫的起點，從此刻開始',
        '這鈉量可以醃一整塊肉'
      ]
    }
  },
  {
    id: 'sodium-2x',
    trigger: ctx => ctx.totals.s >= DAILY_LIMITS.s * 2,
    roasts: {
      any: [
        '鈉兩倍日量，你在醃自己嗎？',
        '這不是一餐，這是一場血壓表演',
        '高血壓協會想頒發終身會員給你'
      ]
    }
  },
  {
    id: 'sugar-overload',
    trigger: ctx => ctx.totals.sg >= DAILY_LIMITS.sg * 1.5,
    roasts: {
      any: [
        '糖量爆表，胰島素今天要加班',
        '你是不是把飲料當水喝？',
        '牙醫看到這張單正在訂遊艇'
      ]
    }
  },
  {
    id: 'satfat-overload',
    trigger: ctx => ctx.totals.sf >= DAILY_LIMITS.sf * 1.5,
    roasts: {
      any: [
        '飽和脂肪破表，血管正在罵髒話',
        '你的膽固醇在聊天群組 @所有人',
        '心血管科醫師的退休基金有著落了'
      ]
    }
  },
  {
    id: 'transfat',
    trigger: ctx => ctx.totals.tf >= DAILY_LIMITS.tf,
    roasts: {
      any: [
        '反式脂肪超標，這是違法邊緣的快感',
        '你的動脈今天很難過'
      ]
    }
  },
  {
    id: 'triple-whopper',
    trigger: ctx => ctx.items.some(i => i.n.includes('三層') || i.n.includes('重磅') || i.n.includes('霸三')),
    roasts: {
      any: [
        '三層以上的堡是給兩個人分的，不是一個人挑戰的',
        '你點的這個是怪獸，不是餐點',
        '這品項的包裝紙都抵擋不住你的野心'
      ]
    }
  },
  {
    id: 'only-sides',
    trigger: ctx => ctx.items.length > 0 && ctx.items.every(i => i.cat === '點心類' || i.cat === '飲料類'),
    roasts: {
      any: [
        '全都是配角，主角呢？',
        '你是去漢堡王點下午茶？',
        '沒漢堡的漢堡王之旅，勇氣可嘉'
      ]
    }
  },
  {
    id: 'only-drinks',
    trigger: ctx => ctx.items.length > 0 && ctx.items.every(i => i.cat === '飲料類'),
    roasts: {
      any: [
        '你是在試喝嗎？',
        '進漢堡王只為了飲料，店員應該會記住你',
        '可能隔壁手搖比較適合你'
      ]
    }
  },
  {
    id: 'fake-healthy',
    trigger: ctx => {
      const hasZero = ctx.items.some(i => i.n.includes('Black') || i.n.includes('無糖'));
      const hasFried = ctx.items.some(i => /(薯條|薯球|雞塊|洋蔥圈|雞薯)/.test(i.n));
      return hasZero && hasFried;
    },
    roasts: {
      any: [
        '配無糖可樂吃大薯，你是在做哪門子的平衡？',
        '零卡飲料 + 炸物，這是當代假養生經典',
        '黑可樂救不了那份油，醒醒'
      ]
    }
  },
  {
    id: 'giant-meal',
    trigger: ctx => ctx.items.some(i => i.n.includes('(大)') || i.n.includes('大薯')),
    roasts: {
      any: [
        '大份量，大決心，大後悔',
        '點大的那一刻，你就知道會這樣'
      ]
    }
  },
  {
    id: 'many-items',
    trigger: ctx => ctx.items.reduce((s, i) => s + i.qty, 0) >= 8 && !ctx.isAgg,
    roasts: {
      any: [
        '一個人點八樣以上，你在幫全家人代買還是食量驚人？',
        '這是開派對還是開告別式？'
      ]
    }
  },
  {
    id: 'cheese-overload',
    trigger: ctx => {
      const cheeseCount =
        ctx.items.filter(i => i.n.includes('起士') || i.n.includes('起司')).reduce((s, i) => s + i.qty, 0) +
        ctx.items.filter(i => i.n === '起司醬包').reduce((s, i) => s + i.qty, 0);
      return cheeseCount >= 3;
    },
    roasts: {
      any: [
        '起司堆疊，這已經不是調味是信仰',
        '法國乳製品協會想頒個獎給你'
      ]
    }
  },
  {
    id: 'all-zero-cal',
    trigger: ctx => ctx.totals.k === 0 && ctx.items.length > 0,
    roasts: {
      any: [
        '零熱量？你是來洗手間附送喝口茶的嗎',
        '這個點法，店員會擔心你',
        '連一卡路里都不給自己，是在演什麼？'
      ]
    }
  },
  {
    id: 'lonely',
    trigger: ctx => !ctx.isAgg && ctx.items.length === 1,
    roasts: {
      any: [
        '只點一樣，今天心情是有多糾結',
        '極簡主義派的漢堡王愛好者',
        '一份就夠？那你幹嘛進來'
      ]
    }
  },
  {
    id: 'group-feast',
    trigger: ctx => ctx.isAgg && ctx.memberCount >= 3,
    roasts: {
      any: [
        '這麼多人吃這些，你們是開戰前糧草籌備嗎？',
        '一桌的罪惡共享起來沒那麼重——才怪',
        '人越多越放心吃，這定律有寫在課本裡？'
      ]
    }
  },
  {
    id: 'ketchup-heavy',
    trigger: ctx => ctx.items.filter(i => i.n === '番茄醬包').reduce((s, i) => s + i.qty, 0) >= 4,
    roasts: {
      any: [
        '四包以上番茄醬，你是來洗番茄浴的嗎',
        '這是吃薯條沾醬還是吃醬配薯條？'
      ]
    }
  },
  {
    id: 'no-protein',
    trigger: ctx => ctx.totals.p < 10 && ctx.totals.k > 500,
    roasts: {
      any: [
        '高熱量低蛋白，完美的浪費',
        '你吃的全是糖和油，肌肉今天失業',
        '健身教練看到這張單會默默解除追蹤'
      ]
    }
  },
  {
    id: 'protein-beast',
    trigger: ctx => ctx.totals.p >= 80,
    roasts: {
      any: [
        '蛋白質 80g+，你是在 bulk 還是報復社會？',
        '健身房看到你會自動讓出器材',
        '這個蛋白質量可以撐起一個業餘健美比賽'
      ]
    }
  }
];

// ===== 核心：挑吐槽 =====
// 品牌可在 extend.js 宣告 BRAND_ROASTS_GRADE / BRAND_SPECIAL_CONDITIONS
// 來追加專屬池子，不覆蓋通用
function pickRoast(ctx) {
  const candidates = [];
  const brandCondList = (typeof BRAND_SPECIAL_CONDITIONS !== 'undefined') ? BRAND_SPECIAL_CONDITIONS : [];
  const brandGradeMap = (typeof BRAND_ROASTS_GRADE !== 'undefined') ? BRAND_ROASTS_GRADE : {};

  // 特殊條件命中（通用 + 品牌）
  [...SPECIAL_CONDITIONS, ...brandCondList].forEach(cond => {
    try {
      if (cond.trigger(ctx)) {
        const pool = cond.roasts[ctx.grade] || [];
        candidates.push(...pool, ...(cond.roasts.any || []));
      }
    } catch (e) { /* 條件寫錯就略過 */ }
  });

  // 通用等級池 + 品牌等級池
  candidates.push(...(ROASTS_GRADE[ctx.grade] || []));
  candidates.push(...(brandGradeMap[ctx.grade] || []));

  if (!candidates.length) return '';
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// 建立 ctx：從 cart/members 餵進去
function buildCtx(cart, totals, grade, opts = {}) {
  const items = [];
  cart.forEach((v, name) => {
    const it = findItem(name);
    if (!it) return;
    items.push({ ...it, qty: v.qty });
  });
  return {
    items,
    totals,
    grade,
    memberCount: opts.memberCount || 1,
    isAgg: !!opts.isAgg
  };
}

// 全員合計用（把所有成員購物車合併）
function buildAggCtx(members, totals, grade) {
  const combined = new Map();
  members.forEach(m => {
    m.cart.forEach((v, name) => {
      const prev = combined.get(name) || { qty: 0 };
      combined.set(name, { qty: prev.qty + v.qty });
    });
  });
  return buildCtx(combined, totals, grade, { memberCount: members.length, isAgg: true });
}
