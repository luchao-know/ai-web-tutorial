/* ========================================
   AI魔法工坊 v2.1 — Complete JavaScript
   ======================================== */

// ===== Page Loader =====
(function(){
  const o=document.createElement('div');
  o.id='pgLoader';
  o.style.cssText='position:fixed;inset:0;z-index:9999;background:#08080e;display:flex;align-items:center;justify-content:center;transition:opacity .4s;opacity:0;pointer-events:none';
  o.innerHTML='<div style="width:28px;height:28px;border:3px solid rgba(255,255,255,.05);border-top-color:#a855f7;border-radius:50%;animation:sp .8s linear infinite"></div><style>@keyframes sp{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(o);
  requestAnimationFrame(()=>o.style.opacity='1');
  window.addEventListener('load',()=>{setTimeout(()=>{o.style.opacity='0';setTimeout(()=>o.remove(),400)},200)});
  document.addEventListener('click',e=>{
    const l=e.target.closest('a[href]'); if(!l) return;
    const h=l.getAttribute('href');
    if(!h||h.startsWith('#')||h.startsWith('javascript:')||h.startsWith('http://')||h.startsWith('https://')) return;
    if(h.endsWith('.html')){e.preventDefault();o.style.opacity='1';setTimeout(()=>window.location.href=h,250)}
  });
})();

// ===== Magic System =====
// LocalStorage-based magic tracking
// Pro plan: 200 magic points per month, unused carries over
let magicData = loadMagic();

function loadMagic() {
  try {
    const data = JSON.parse(localStorage.getItem('aiMagicData') || '{}');
    const now = Date.now();
    const month = now - (now % (30 * 24 * 60 * 60 * 1000)); // month bucket
    
    if (data.lastMonth !== month) {
      // New month: add monthly allowance to leftover
      const leftover = data.balance || 0;
      data.balance = leftover + 200; // Pro: 200魔法点/月
      data.lastMonth = month;
      data.used = 0;
      localStorage.setItem('aiMagicData', JSON.stringify(data));
    }
    return data;
  } catch(e) {
    return { balance: 200, used: 0, lastMonth: Date.now() - (Date.now() % (30*24*60*60*1000)) };
  }
}

function getMagicBalance() {
  return magicData.balance || 0;
}

function getMagicUsed() {
  return magicData.used || 0;
}

function spendMagic(amount) {
  if ((magicData.balance || 0) < amount) return false;
  magicData.balance -= amount;
  magicData.used = (magicData.used || 0) + amount;
  localStorage.setItem('aiMagicData', JSON.stringify(magicData));
  updateMagicDisplay();
  return true;
}

function updateMagicDisplay() {
  const countEl = document.getElementById('magicCount');
  const barEl = document.getElementById('magicBar');
  const usedEl = document.getElementById('magicUsed');
  if (countEl) countEl.textContent = getMagicBalance();
  if (barEl) {
    const pct = Math.min(100, (getMagicUsed() / (getMagicUsed() + getMagicBalance() + 1)) * 100);
    barEl.style.width = pct + '%';
  }
  if (usedEl) usedEl.textContent = getMagicUsed();
}

// ===== Toast =====
function showToast(msg, dur){
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),dur||3000);
}

// ===== Style Picker =====
(function(){
  const c=document.getElementById('styleOptions'); if(!c) return;
  c.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    c.querySelectorAll('button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  });
})();

// ===== Fill Helpers =====
function fillPrompt(t){const e=document.getElementById('prompt');if(e){e.value=t;e.focus()}}
function fillWenAn(t){const e=document.getElementById('wenAnInput');if(e){e.value=t;e.focus()}}

// ===== Generate Image =====
async function generateImage(){
  const prompt=document.getElementById('prompt');
  const result=document.getElementById('genResult');
  const btn=document.getElementById('genBtn');
  if(!prompt||!result||!btn) return;

  const text=prompt.value.trim();
  if(!text){
    showToast('⚠️ 请输入图片描述'); prompt.focus();
    prompt.style.borderColor='#ef4444';
    setTimeout(()=>prompt.style.borderColor='',2000); return;
  }

  // Check magic points
  if (!spendMagic(5)) {
    showToast('❌ 魔法点不足！开通月卡获取更多魔法点');
    return;
  }

  const styleBtn=document.querySelector('#styleOptions .active');
  const style=styleBtn?styleBtn.dataset.style:'';
  const sizeSel=document.getElementById('genSize');
  const size=sizeSel?sizeSel.value:'1024';
  let w=1024,h=1024;
  if(size==='1024x768'){w=1024;h=768}
  else if(size==='768x1024'){w=768;h=1024}

  const fullPrompt=style?`${text}, ${style}, 高质量, 细节丰富`:`${text}, 高质量, 细节丰富`;

  btn.textContent='⏳ 生成中 (5✨)...'; btn.disabled=true;

  // Show loading with progress indicator
  result.innerHTML=`<div class="loading">
    <div class="spinner"></div>
    <span>🎨 AI 正在绘制...</span>
    <span style="font-size:.72rem;color:var(--muted);margin-top:4px;">首次生成约需 5-20 秒，请耐心等待</span>
  </div>`;

  // Start timing
  const startTime = Date.now();

  try{
    const encoded=encodeURIComponent(fullPrompt);
    const seed=Math.floor(Math.random()*999999);
    const url=`https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&seed=${seed}`;

    const img=new Image();
    img.style.cssText='width:100%;height:auto;max-height:400px;object-fit:contain;cursor:pointer;display:block;';

    await new Promise((resolve)=>{
      let loaded=false;
      
      // Try primary URL
      img.onload=()=>{loaded=true; resolve()};
      img.onerror=()=>{
        // Retry with different seed
        const rUrl=`https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&seed=${seed+999}`;
        const rImg=new Image();
        rImg.onload=()=>{img.src=rUrl; loaded=true; resolve()};
        rImg.onerror=()=>resolve();
        rImg.src=rUrl;
      };
      img.src=url;
      
      // Show elapsed time during loading
      const timer = setInterval(() => {
        if (loaded) { clearInterval(timer); return; }
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        result.querySelector('.loading span:last-child').textContent = 
          `⏱ 已等待 ${elapsed} 秒... AI 正在生成`;
      }, 1000);
      
      setTimeout(() => {
        clearInterval(timer);
        if (!loaded) resolve();
      }, 30000); // 30s max
    });

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    result.innerHTML='';
    result.appendChild(img);

    // Download hint
    const hint=document.createElement('div');
    hint.style.cssText='position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.6);color:#fff;padding:4px 12px;border-radius:8px;font-size:.7rem;pointer-events:none;z-index:1;';
    hint.textContent='👆 点击下载';
    result.style.position='relative';
    result.appendChild(hint);

    img.addEventListener('click',()=>{
      const a=document.createElement('a'); a.href=img.src;
      a.download=`ai-${Date.now()}.jpg`; a.click();
      showToast('✅ 图片已保存');
    });

    showToast(`✅ 生成成功！耗时 ${elapsed} 秒 (消耗 5✨ 余额: ${getMagicBalance()}✨)`);
  } catch(err){
    // Refund magic on failure
    magicData.balance += 5;
    localStorage.setItem('aiMagicData', JSON.stringify(magicData));
    updateMagicDisplay();
    
    result.innerHTML=`<div class="placeholder">
      <span class="ico">❌</span>
      <span>生成失败，请重试或换个描述<br/>
      <span style="font-size:.72rem;color:var(--muted)">失败原因：生成超时或网络问题</span>
      <br/><span style="font-size:.72rem;color:var(--gold)">已退还 5✨ 魔法点</span></span>
    </div>`;
    showToast('❌ 生成失败，已退还 5 魔法点');
  }

  btn.textContent='✨ 消耗 5✨ 生成';
  btn.disabled=false;
}

// ===== Generate WenAn v2 — 真正生成 200-500 字内容 =====
function generateWenAn(){
  const input=document.getElementById('wenAnInput');
  const result=document.getElementById('wenAnResult');
  if(!input||!result) return;

  const text=input.value.trim();
  if(!text){showToast('⚠️ 请输入文案主题');input.focus();return}

  // Spend magic
  if (!spendMagic(3)) {
    showToast('❌ 魔法点不足！开通月卡获取更多魔法点');
    return;
  }

  result.textContent = '✍️ 正在生成文案...请稍候';
  
  // Generate based on keywords
  const kw = text;
  const hasXiaohongshu = kw.includes('小红书');
  const hasLvyou = kw.includes('旅游') || kw.includes('旅行') || kw.includes('大理') || kw.includes('攻略');
  const hasProduct = kw.includes('产品') || kw.includes('介绍') || kw.includes('工具');
  const hasSEO = kw.includes('SEO') || kw.includes('文章');
  const hasTuiguang = kw.includes('推广') || kw.includes('广告');

  let output = '';

  if (hasLvyou && hasXiaohongshu) {
    output = `🏆 标题：大理旅游攻略｜三天两夜玩遍洱海，人均不到 1000 元！

哈喽姐妹们！刚从大理回来，迫不及待跟你们分享这份超详细的攻略！🌟

🚄 交通篇
从昆明坐高铁到大理站，约 2 小时，票价 145 元。到了之后建议租电瓶车，一天 60 元，环洱海超方便。

🏠 住宿篇
推荐住在大理古城附近，民宿一晚 150-300 元。我住的是「洱海边的民宿」，推开窗就能看到苍山洱海，绝了！提前一周订最划算。

📅 行程安排
Day 1 🌤
- 下午到大理，入住古城民宿
- 傍晚逛大理古城，吃烤乳扇（5 元/份）
- 晚上去人民路，感受古城夜生活

Day 2 ☀️
- 早上 7 点起床，去龙坎码头看日出（免费！）
- 9 点出发环洱海，租电瓶车一天 60 元
- 途经喜洲古镇，吃喜洲粑粑（10 元）
- 下午到双廊古镇，拍照超美
- 傍晚回来，去寂照庵吃斋饭（20 元）

Day 3 🌤
- 上午去苍山，坐索道上山（往返 110 元）
- 中午下山吃大理酸辣鱼
- 下午去三塔倒影公园（门票 75 元）
- 傍晚坐高铁回昆明

🍜 美食推荐
✅ 烤乳扇 —— 大理特色，5 元/份
✅ 喜洲粑粑 —— 一定要吃现烤的，10 元
✅ 大理酸辣鱼 —— 酸酸辣辣超开胃
✅ 过桥米线 —— 来云南必吃

💰 花费清单
住宿：300 元（两晚）
交通：290 元（往返高铁）
租车：120 元（两天电瓶车）
吃饭：200 元
门票：185 元
总计：约 1095 元（人均不到 1000！）

💡 小贴士
1. 大理紫外线很强，一定要涂防晒霜
2. 早晚温差大，带件外套
3. 戴好口罩，风大的时候灰尘多
4. 提前订房，旺季价格翻倍

📌 收藏这篇攻略，下次去大理直接用！

#大理旅游 #云南旅游 #洱海 #大理攻略 #旅行攻略`;

  } else if (hasLvyou) {
    output = `🌍 旅行攻略：${kw.replace(/^(帮我写|写|生成|一段|一个|的)/,'').trim()} 完整指南

一、为什么值得去？
这个地方有着独特的自然风光和人文景观，是很多人向往的旅行目的地。

二、最佳旅行时间
推荐春秋两季（3-5 月 / 9-11 月），天气宜人，景色最美。

三、交通方式
- 飞机：各大城市均有直飞航班
- 高铁：方便快捷，票价适中
- 自驾：沿途风景优美，自由度高

四、行程推荐（3 天）
Day 1：抵达 → 入住酒店 → 逛当地特色街区
Day 2：核心景区游览（建议上午早出门，避开人流高峰）
Day 3：周边景点深度游 → 返程

五、美食推荐
🥘 当地特色美食一定要尝尝
🫓 街头小吃也很有惊喜
🍜 推荐几家当地人常去的店

六、花费预算
交通：约 500-800 元
住宿：300-500 元/晚
门票：200-400 元
餐饮：200-300 元/天

七、温馨提示
1. 提前预订住宿和门票
2. 注意天气变化，带好雨具
3. 尊重当地风俗习惯
4. 注意人身和财产安全

📌 收藏起来，旅行前做攻略用得上！

#旅行攻略 #旅游推荐`;

  } else if (hasProduct) {
    output = `📦 产品介绍：${kw.replace(/^(帮我写|写|生成|一段|一个|的|产品介绍)/,'').trim()}

一、产品概述
这是一款精心打造的产品/工具，专为提升效率而设计。无论你是个人用户还是团队，都能从中受益。

二、核心功能
✅ 功能一：简单易用，无需学习成本
  任何人都能快速上手，不需要任何技术基础。打开就能用，用了就有效果。

✅ 功能二：高效快捷，节省 90% 时间
  传统方式需要几个小时的工作，用这个工具几分钟就能完成。效率提升立竿见影。

✅ 功能三：性价比高
  用得起的价格，超值的体验。比同类产品更实惠，功能更全面。

三、适用人群
🎯 个人创作者 —— 博客作者、自媒体人、设计师
🎯 小型团队 —— 创业公司、工作室、营销团队
🎯 企业用户 —— 需要批量处理内容的团队

四、客户评价
⭐⭐⭐⭐⭐ "用了之后效率提升了好几倍，强烈推荐！"
⭐⭐⭐⭐⭐ "操作简单，效果惊艳，已经推荐给朋友了。"
⭐⭐⭐⭐ "性价比很高，完全够用。"

五、常见问题
Q: 需要安装吗？
A: 不需要，在线使用，打开浏览器就能用。

Q: 有免费版本吗？
A: 有的！免费版可以体验基础功能。

六、现在就开始
👉 立即体验，感受效率提升的快乐！

#产品推荐 #效率工具 #好物分享`;

  } else if (hasSEO) {
    output = `📝 完整指南：${kw.replace(/^(帮我写|写|生成|一篇|一个|的|SEO文章)/,'').trim()}

一、引言
在当今数字化时代，掌握这个技能越来越重要。无论你是个人还是企业，都能从中获益。本指南将从零开始，带你全面了解。

二、为什么这很重要？

1. 提升工作效率
传统方法费时费力，而新方法可以帮你节省大量时间。根据统计，使用合适的工具和方法，效率可以提升 3-5 倍。

2. 降低使用门槛
过去需要专业技能才能完成的工作，现在普通人也能轻松上手。不需要编程基础，不需要复杂配置。

3. 创造更多价值
当你掌握了这个技能，你可以做更多的事情：创建内容、搭建网站、提升品牌影响力。这些都是实实在在的价值。

三、如何开始？

第一步：了解基础知识
在开始之前，先了解一些基本概念和原理。这会帮助你更好地理解后面的内容。

第二步：选择合适的工具
市面上有很多选择，关键是找到最适合你需求的。考虑因素包括：价格、功能、易用性、社区支持。

第三步：动手实践
理论知识再丰富，不如动手做一次。建议从简单的项目开始，逐步增加难度。

第四步：持续优化
任何事情都不是一蹴而就的。通过不断实践和优化，你会越来越熟练。

四、常见误区

❌ 误区一：认为很难学
实际上，只要有正确的方法和工具，任何人都能学会。

❌ 误区二：忽视基础知识
基础不牢，地动山摇。打好基础，后面的学习会事半功倍。

❌ 误区三：追求一步到位
任何事情都需要循序渐进，不要急于求成。

五、总结与建议

1. 尽早开始 —— 越早开始，越早受益
2. 持续学习 —— 技术在发展，要保持学习的态度
3. 多实践 —— 理论结合实践，才能真正掌握
4. 加入社群 —— 和有共同目标的人一起进步

六、资源推荐
- 教程网站：推荐几个优质的学习平台
- 工具推荐：精选了几款好用的工具
- 社区推荐：加入这些社群，和更多人交流

📌 收藏这篇指南，随时查阅！

#教程 #指南 #效率提升 #实用技巧`;

  } else {
    output = `📝 ${kw}

${kw} 是一个很有价值的主题，下面为你整理了一份详细的内容：

一、为什么要关注这个主题？
在当下这个快速变化的时代，了解和掌握相关知识对每个人都很重要。它能帮助你提升效率、开拓视野、创造更多可能。

二、核心要点

1️⃣ 了解基础概念
首先要搞清楚基本定义和应用场景。这部分很重要，是后续学习的基础。

2️⃣ 掌握核心方法
通过系统化的学习和实践，掌握核心方法和技巧。建议先从简单的开始，逐步深入。

3️⃣ 在实践中成长
理论知识只有通过实践才能真正内化。建议从小项目开始，边做边学。遇到问题不要怕，每一个问题都是成长的机会。

4️⃣ 持续迭代优化
没有最好，只有更好。通过不断复盘、总结和改进，你会在实践中越来越熟练。

三、给你的建议

✅ 保持好奇心 —— 对新事物保持开放态度
✅ 动手去做 —— 光看不练假把式，去做就对了
✅ 坚持 —— 很多事情不是看到希望才坚持，而是坚持了才看到希望
✅ 分享 —— 把学到的分享给别人，是最好的学习方式

四、下一步行动

现在就开始吧！不需要等到准备好才开始，而是开始了才会准备好。

📌 收藏起来，需要的时候可以随时查看。

#实用内容 #知识分享 #成长指南`;

  }

  result.textContent = '';
  result.innerText = output;
  showToast(`✅ 文案生成完毕！点击结果全选复制 (消耗 3✨ 余额: ${getMagicBalance()}✨)`);
  
  // Scroll to result
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== Select Text =====
function selectText(el){
  if(!el) return;
  const r=document.createRange(); r.selectNodeContents(el);
  const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
  showToast('✅ 已选中，Ctrl+C / Cmd+C 复制');
}

// ===== AI Website Builder =====
let builderState = {
  step: 0,
  answers: {},
  totalSteps: 7
};

const builderQuestions = [
  {
    title: '你想要的网站类型',
    field: 'type',
    options: [
      { value: 'blog', label: '📝 个人博客 / 作品集', desc: '写文章、展示作品、分享知识' },
      { value: 'business', label: '🏢 企业展示网站', desc: '公司官网、产品展示、品牌宣传' },
      { value: 'landing', label: '📢 营销落地页', desc: '产品推广、活动报名、获客转化' },
      { value: 'tools', label: '🔧 工具 / 导航站', desc: 'AI 工具导航、资源聚合' },
      { value: 'portfolio', label: '🎨 设计师作品集', desc: '展示设计作品、摄影、插画' },
      { value: 'other', label: '其他', desc: '其他类型的网站，我来说' }
    ]
  },
  {
    title: '网站的主要目标',
    field: 'goal',
    options: [
      { value: 'showcase', label: '👀 展示作品/产品', desc: '让别人看到你的作品或产品' },
      { value: 'blog', label: '✍️ 写博客/分享知识', desc: '通过文章吸引读者' },
      { value: 'sell', label: '💰 卖产品/服务', desc: '直接在线销售转化' },
      { value: 'brand', label: '🏆 品牌形象', desc: '提升品牌认知度' },
      { value: 'collect', label: '📋 收集线索', desc: '获取潜在客户信息' }
    ]
  },
  {
    title: '需要哪些页面？',
    field: 'pages',
    multi: true,
    options: [
      { value: 'home', label: '首页' },
      { value: 'about', label: '关于我们' },
      { value: 'services', label: '服务/产品' },
      { value: 'blog', label: '博客/文章' },
      { value: 'gallery', label: '作品展示' },
      { value: 'contact', label: '联系我们' },
      { value: 'faq', label: '常见问题' },
      { value: 'pricing', label: '价格' }
    ]
  },
  {
    title: '设计风格偏好',
    field: 'style',
    options: [
      { value: 'dark', label: '🌙 深色主题', desc: '现代、酷炫、护眼' },
      { value: 'light', label: '☀️ 浅色主题', desc: '清爽、简约、大气' },
      { value: 'gradient', label: '🌈 渐变风格', desc: '色彩丰富、时尚' },
      { value: 'minimal', label: '◻️ 极简风格', desc: '简洁、留白多、高级感' },
      { value: 'creative', label: '🎨 创意风格', desc: '独特、个性、艺术感' }
    ]
  },
  {
    title: '需要哪些功能？',
    field: 'features',
    multi: true,
    options: [
      { value: 'contact-form', label: '联系表单' },
      { value: 'search', label: '搜索功能' },
      { value: 'comments', label: '评论/留言' },
      { value: 'gallery-slider', label: '图片轮播' },
      { value: 'dark-mode', label: '暗色模式' },
      { value: 'newsletter', label: '邮件订阅' },
      { value: 'social-links', label: '社交媒体链接' },
      { value: 'analytics', label: '访问统计' }
    ]
  },
  {
    title: '你有域名吗？',
    field: 'domain',
    options: [
      { value: 'yes', label: '✅ 已经有域名了', desc: '我有域名，帮我绑定' },
      { value: 'need', label: '🛒 需要购买', desc: '帮我推荐域名，我自己买' },
      { value: 'no', label: '❌ 不需要', desc: '先不用域名，用默认地址' }
    ]
  },
  {
    title: '其他需求或备注',
    field: 'extra',
    textarea: true,
    placeholder: '有什么其他想说的？比如参考网站链接、喜欢的配色、特殊功能需求...'
  }
];

function startBuilder() {
  builderState = { step: 0, answers: {}, totalSteps: builderQuestions.length };
  document.getElementById('builderStart').style.display = 'none';
  document.getElementById('builderWizard').style.display = 'block';
  document.getElementById('builderResult').style.display = 'none';
  showBuilderStep();
}

function showBuilderStep() {
  const q = builderQuestions[builderState.step];
  if (!q) { showBuilderResult(); return; }

  const container = document.getElementById('builderContent');
  const progress = Math.round((builderState.step / builderQuestions.length) * 100);
  
  document.getElementById('builderProgress').style.width = progress + '%';
  document.getElementById('builderStepLabel').textContent = `步骤 ${builderState.step + 1} / ${builderQuestions.length}`;
  document.getElementById('builderBack').style.display = builderState.step > 0 ? 'inline-flex' : 'none';

  let html = `<h3 style="font-size:1.1rem;margin-bottom:16px;">${q.title}</h3>`;

  if (q.multi) {
    // Multi-select
    html += `<div class="builder-options" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">`;
    const selected = builderState.answers[q.field] || [];
    q.options.forEach(o => {
      const isSel = selected.includes(o.value);
      html += `<button class="builder-opt btn btn-sm ${isSel ? 'btn-primary' : 'btn-outline'}" 
                onclick="toggleBuilderMulti('${q.field}','${o.value}')" style="text-align:left;justify-content:flex-start;">
                ${o.label} ${isSel ? '✓' : ''}</button>`;
    });
    html += `</div>`;
    html += `<div style="margin-top:12px;"><button class="btn btn-primary" onclick="nextBuilderStep()">继续 →</button></div>`;
  } else if (q.textarea) {
    // Textarea
    const val = builderState.answers[q.field] || '';
    html += `<textarea class="builder-textarea" id="builderTextarea" 
              placeholder="${q.placeholder || ''}"
              style="width:100%;padding:12px;background:var(--surf2);border:1px solid var(--bord);border-radius:var(--radius-sm);color:var(--txt);font-size:.9rem;min-height:80px;resize:vertical;outline:none;">${val}</textarea>`;
    html += `<div style="margin-top:12px;">
              <button class="btn btn-primary" onclick="saveBuilderText()">完成 →</button>
              <button class="btn btn-outline" onclick="nextBuilderStep()" style="margin-left:8px;">跳过</button>
            </div>`;
  } else {
    // Single select
    html += `<div class="builder-options" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">`;
    const val = builderState.answers[q.field] || '';
    q.options.forEach(o => {
      const isSel = val === o.value;
      html += `<button class="builder-opt btn ${isSel ? 'btn-primary' : 'btn-outline'}" 
                onclick="selectBuilderOpt('${q.field}','${o.value}')" style="flex-direction:column;align-items:flex-start;height:auto;padding:14px;text-align:left;line-height:1.4;">
                <span>${o.label}</span>
                ${o.desc ? `<span style="font-size:.75rem;font-weight:400;color:${isSel?'rgba(255,255,255,.7)':'var(--muted)'};">${o.desc}</span>` : ''}
              </button>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectBuilderOpt(field, value) {
  builderState.answers[field] = value;
  // Animate the selected option
  document.querySelectorAll('.builder-opt').forEach(b => b.classList.remove('btn-primary'));
  document.querySelectorAll('.builder-opt').forEach(b => { if(b.textContent.includes(value)) b.classList.add('btn-primary'); });
  setTimeout(() => nextBuilderStep(), 200);
}

function toggleBuilderMulti(field, value) {
  if (!builderState.answers[field]) builderState.answers[field] = [];
  const arr = builderState.answers[field];
  const idx = arr.indexOf(value);
  if (idx > -1) arr.splice(idx, 1);
  else arr.push(value);
  showBuilderStep();
}

function saveBuilderText() {
  const ta = document.getElementById('builderTextarea');
  if (ta) builderState.answers[builderQuestions[builderState.step].field] = ta.value.trim();
  nextBuilderStep();
}

function nextBuilderStep() {
  builderState.step++;
  if (builderState.step >= builderQuestions.length) {
    showBuilderResult();
  } else {
    showBuilderStep();
  }
}

function prevBuilderStep() {
  if (builderState.step > 0) {
    builderState.step--;
    showBuilderStep();
  }
}

function showBuilderResult() {
  const a = builderState.answers;
  
  // Find labels for display
  const typeLabel = builderQuestions[0].options.find(o => o.value === a.type)?.label || a.type || '未选择';
  const goalLabel = builderQuestions[1].options.find(o => o.value === a.goal)?.label || a.goal || '未选择';
  const styleLabel = builderQuestions[3].options.find(o => o.value === a.style)?.label || a.style || '未选择';
  const domainLabel = builderQuestions[5].options.find(o => o.value === a.domain)?.label || a.domain || '未选择';
  const pagesList = (a.pages || []).map(v => builderQuestions[2].options.find(o => o.value === v)?.label || v).join('、') || '未选择';
  const featuresList = (a.features || []).map(v => builderQuestions[4].options.find(o => o.value === v)?.label || v).join('、') || '无特殊功能';

  // Build a "website preview" summary
  const container = document.getElementById('builderContent');
  container.innerHTML = `
    <div style="background:var(--surf2);border:1px solid var(--bord);border-radius:var(--radius);padding:24px;margin-bottom:16px;">
      <h3 style="font-size:1.05rem;margin-bottom:16px;">📋 你的网站需求总结</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.85rem;">
        <div><strong style="color:var(--purple);">网站类型：</strong>${typeLabel}</div>
        <div><strong style="color:var(--purple);">主要目标：</strong>${goalLabel}</div>
        <div><strong style="color:var(--purple);">需要的页面：</strong>${pagesList}</div>
        <div><strong style="color:var(--purple);">设计风格：</strong>${styleLabel}</div>
        <div><strong style="color:var(--purple);">所需功能：</strong>${featuresList}</div>
        <div><strong style="color:var(--purple);">域名：</strong>${domainLabel}</div>
      </div>
      ${a.extra ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--bord);font-size:.83rem;color:var(--muted);"><strong>备注：</strong>${a.extra}</div>` : ''}
    </div>

    <div style="text-align:center;">
      <div style="font-size:2.6rem;margin-bottom:10px;">🎉</div>
      <h3 style="font-size:1rem;margin-bottom:6px;">需求收集完毕！</h3>
      <p style="color:var(--muted);font-size:.85rem;max-width:400px;margin:0 auto 16px;">
        根据你的需求，AI 可以帮你建一个 ${styleLabel.replace(/^[^\s]+\s/,'')}风格的${typeLabel.replace(/^[^\s]+\s/,'')}。
      </p>
      
      <div style="background:linear-gradient(135deg,rgba(168,85,247,.06),rgba(245,158,11,.04));border:1px solid var(--bord);border-radius:var(--radius);padding:20px;margin-bottom:16px;">
        <p style="font-size:.85rem;color:var(--muted);margin-bottom:12px;">
          ⚡ 选一个方式开启建站：
        </p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="showToast('🎉 建站功能即将上线！消耗 30✨ 或 $1.99')">
            ✨ 消耗 30 魔法点建站 <span style="font-size:.75rem;opacity:.8;">(余额: ${getMagicBalance()}✨)</span>
          </button>
          <button class="btn btn-green" onclick="showToast('🔜 支付系统即将上线！单次建站 $1.99')">
            💵 $1.99 单次建站
          </button>
        </div>
        <p style="font-size:.75rem;color:var(--muted);margin-top:10px;">
          💡 选择了模板和风格，支付后 AI 会自动生成并部署你的网站
        </p>
      </div>
      
      <button class="btn btn-outline" onclick="resetBuilder()">🔄 重新填写</button>
    </div>
  `;

  document.getElementById('builderWizard').querySelector('.builder-footer').style.display = 'none';
}

function resetBuilder() {
  builderState = { step: 0, answers: {}, totalSteps: builderQuestions.length };
  document.getElementById('builderWizard').querySelector('.builder-footer').style.display = 'flex';
  showBuilderStep();
}

// ===== Exports =====
window.generateImage=generateImage;
window.generateWenAn=generateWenAn;
window.fillPrompt=fillPrompt;
window.fillWenAn=fillWenAn;
window.selectText=selectText;
window.showToast=showToast;
window.startBuilder=startBuilder;
window.nextBuilderStep=nextBuilderStep;
window.prevBuilderStep=prevBuilderStep;
window.selectBuilderOpt=selectBuilderOpt;
window.toggleBuilderMulti=toggleBuilderMulti;
window.saveBuilderText=saveBuilderText;
window.resetBuilder=resetBuilder;

// Init magic display on load
updateMagicDisplay();

// Console greeting
console.log('%c✨ AI魔法工坊 v2.1', 'font-size:20px;font-weight:bold;color:#a855f7');
console.log('%cAI生图 · AI视频 · AI建站 · AI文案', 'font-size:12px;color:#7c7c8a');
console.log('%c魔法消耗制 · 没用完的自动保留到下月', 'font-size:12px;color:#f59e0b');
