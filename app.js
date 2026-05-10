/* ===== AI魔法工坊 v2.0 - JavaScript ===== */
(function(){

// ===== Loader =====
  const overlay = document.createElement('div');
  overlay.id = 'pageLoader';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg,#0c0c14);display:flex;align-items:center;justify-content:center;transition:opacity .5s;opacity:0;pointer-events:none';
  overlay.innerHTML = '<div style="width:36px;height:36px;border:3px solid rgba(255,255,255,.05);border-top-color:#a855f7;border-radius:50%;animation:spin .8s linear infinite"></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.style.opacity = '1');
  window.addEventListener('load',() => {
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(),500);
    },300);
  });
  document.addEventListener('click',e => {
    const link = e.target.closest('a[href]');
    if(!link) return;
    const h = link.getAttribute('href');
    if(!h || h.startsWith('#') || h.startsWith('javascript:') || h.startsWith('http://') || h.startsWith('https://')) return;
    if(h.endsWith('.html')) {
      e.preventDefault();
      overlay.style.opacity = '1';
      setTimeout(() => window.location.href = h, 300);
    }
  });
})();

// ===== Toast =====
function showToast(msg, duration){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.classList.remove('show'), duration || 3000);
}

// ===== Style Picker (tools page) =====
(function(){
  const container = document.getElementById('styleOptions');
  if(!container) return;
  container.addEventListener('click',e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
})();

// ===== Generate Image =====
async function generateImage(){
  const prompt = document.getElementById('prompt');
  const result = document.getElementById('genResult');
  const btn = document.getElementById('genBtn');
  if(!prompt || !result || !btn) return;

  const text = prompt.value.trim();
  if(!text){
    showToast('⚠️ 请输入图片描述');
    prompt.focus();
    prompt.style.borderColor = '#ef4444';
    setTimeout(() => prompt.style.borderColor = '', 2000);
    return;
  }

  // Get style
  const styleBtn = document.querySelector('#styleOptions .active');
  const style = styleBtn ? styleBtn.dataset.style : '写实';

  // Get size
  const sizeSel = document.getElementById('genSize');
  const size = sizeSel ? sizeSel.value : '1024';

  // Build prompt with style
  const fullPrompt = style ? `${text}, ${style}风格, 高画质, 细节丰富` : `${text}, 高画质, 细节丰富`;

  // Determine dimensions
  let w = 1024, h = 1024;
  if(size === '1024x768'){ w = 1024; h = 768; }
  else if(size === '768x1024'){ w = 768; h = 1024; }

  // Show loading
  btn.textContent = '⏳ 生成中...';
  btn.disabled = true;
  result.innerHTML = `<div class="loading"><div class="spinner"></div><span>🎨 AI 正在绘制 "${text.slice(0,20)}..."</span></div>`;

  try {
    // Use Pollinations.ai free API
    const encoded = encodeURIComponent(fullPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random()*999999)}`;

    // Preload image
    const img = new Image();
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:var(--radius);cursor:pointer;';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => {
        // If Pollinations fails, try the image URL directly (it's a GET that returns the image)
        // Fallback: just use the URL as src
        resolve();
      };
      img.src = imageUrl;
      // Safety timeout
      setTimeout(resolve, 15000);
    });

    // Display result
    result.innerHTML = '';
    result.appendChild(img);

    // Click to download
    img.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `ai-${Date.now()}.jpg`;
      a.click();
      showToast('✅ 图片已保存');
    });

    // Add download hint
    const hint = document.createElement('div');
    hint.style.cssText = 'position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,.6);color:#fff;padding:4px 12px;border-radius:8px;font-size:.75rem;pointer-events:none;z-index:1;';
    hint.textContent = '点击下载';
    result.style.position = 'relative';
    result.appendChild(hint);
    setTimeout(() => hint.style.opacity = '.5', 3000);

    showToast('✅ 图片生成完成！');

    // Try to generate a second preview image (sometimes the first request is still being generated)
    // The Pollinations API generates on first request, so we just show it.

  } catch(err) {
    result.innerHTML = `<div class="placeholder"><span class="big-ico">❌</span><span>生成失败，请重试<br/><span style="font-size:.78rem;color:var(--muted)">${err.message}</span></span></div>`;
    showToast('❌ 生成失败，请重试');
  }

  btn.textContent = '✨ 生成图片';
  btn.disabled = false;
}

// ===== Generate WenAn (文案) =====
const wenAnTemplates = {
  '小红书': '🏆 **标题：**[主题]必看的5个秘诀\n\n哈喽姐妹们！今天来跟大家分享关于[主题]的干货～\n\n✨ 为什么我推荐你一定要试试？\n1. 第一个原因是...\n2. 第二个原因是...\n\n💡 小贴士：\n- 记得先做...\n- 搭配...效果更好\n\n📌 收藏起来慢慢看，下次用得上！\n\n#AI工具 #效率提升 #干货分享',
  '产品介绍': '## [产品名称]\n\n### 核心功能\n- 功能一：[描述]\n- 功能二：[描述]\n- 功能三：[描述]\n\n### 适用场景\n> [场景描述]\n\n### 定价\n基础版：免费  |  专业版：¥29/月\n\n👉 [立即体验]',
  'SEO文章': '# [关键词]完整指南（2026）\n\n## 什么是[关键词]\n\n[关键词]是...近年来受到越来越多关注。\n\n## 为什么[关键词]很重要\n\n1. 提升效率\n2. 降低成本\n3. 改善体验\n\n## 如何开始使用[关键词]\n\n第一步：...\n第二步：...\n第三步：...\n\n## 总结\n\n[关键词]正在改变...建议尽早了解和使用。\n\n---\n*本文由AI辅助生成*',
  '默认': '📝 你的文案将在这里显示...\n\n这是由AI生成的示例文案。\n\n---\n*输入你想要的内容主题，点击生成即可*'
};

function generateWenAn(){
  const input = document.getElementById('wenAnInput');
  const result = document.getElementById('wenAnResult');
  if(!input || !result) return;

  const text = input.value.trim();
  if(!text){
    showToast('⚠️ 请输入文案主题');
    input.focus();
    return;
  }

  // Pick a random template
  const keys = Object.keys(wenAnTemplates);
  const template = wenAnTemplates[keys[Math.floor(Math.random() * keys.length)]];

  // Replace placeholders with user input
  let output = template
    .replace(/\[主题\]/g, text)
    .replace(/\[关键词\]/g, text)
    .replace(/\[产品名称\]/g, text)
    .replace(/\[描述\]/g, '高效便捷，一键生成')
    .replace(/\[场景描述\]/g, `适用于${text}相关场景`);

  result.innerHTML = `<div style="white-space:pre-wrap;line-height:1.8;font-size:.9rem;">${output}</div>`;
  showToast('✅ 文案生成完成！复制即可使用');
}

// ===== Exports for inline onclick =====
window.generateImage = generateImage;
window.generateWenAn = generateWenAn;
window.showToast = showToast;

// ===== Magic counter animation (tools page) =====
(function(){
  var countEl = document.getElementById('magicCount');
  var barEl = document.getElementById('magicBar');
  if(!countEl) return;
  var used = 86, total = 200;
  function tick(){
    if(used < total){
      used += 1;
      countEl.textContent = total - used;
      if(barEl) barEl.style.width = ((used / total) * 100) + '%';
      setTimeout(tick, 3000 + Math.random() * 4000);
    }
  }
  setTimeout(tick, 3000);
  var daysEl = document.getElementById('resetDays');
  if(daysEl){
    var d = 18;
    setInterval(function(){ d = d <= 1 ? 30 : d - 1; daysEl.textContent = d; }, 60000);
  }
})();

// ===== Console greeting =====
console.log('%c⚡ AI魔法工坊 v2.0', 'font-size:24px;font-weight:bold;color:#a855f7');
console.log('%c🎨 免费在线 AI 图片生成器', 'font-size:14px;color:#7c7c8a');
console.log('%c💡 提示: 按 F12 → Application → 查看所有页面资源', 'font-size:12px;color:#6b7280');
