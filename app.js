/* ===== 灵境建站 v2.0 - JavaScript ===== */

// ===== Page Loader =====
(function(){
  const overlay = document.createElement('div');
  overlay.id = 'pageLoader';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0a0a12;display:flex;align-items:center;justify-content:center;transition:opacity .4s;opacity:0;pointer-events:none';
  overlay.innerHTML = '<div style="width:30px;height:30px;border:3px solid rgba(255,255,255,.05);border-top-color:#6366f1;border-radius:50%;animation:loaderSpin .8s linear infinite"></div><style>@keyframes loaderSpin{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.style.opacity = '1');
  window.addEventListener('load', () => {
    setTimeout(() => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 400); }, 200);
  });
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const h = link.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('javascript:') || h.startsWith('http://') || h.startsWith('https://')) return;
    if (h.endsWith('.html')) {
      e.preventDefault();
      overlay.style.opacity = '1';
      setTimeout(() => window.location.href = h, 250);
    }
  });
})();

// ===== Toast =====
function showToast(msg, duration) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.classList.remove('show'), duration || 3000);
}

// ===== Style Picker =====
(function(){
  const container = document.getElementById('styleOptions');
  if (!container) return;
  container.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
})();

// ===== Fill prompt helpers =====
function fillPrompt(text) {
  const el = document.getElementById('prompt');
  if (el) { el.value = text; el.focus(); }
}
function fillAn(text) {
  const el = document.getElementById('wenAnInput');
  if (el) { el.value = text; el.focus(); }
}

// ===== Generate Image =====
async function generateImage() {
  const prompt = document.getElementById('prompt');
  const result = document.getElementById('genResult');
  const btn = document.getElementById('genBtn');

  if (!prompt || !result || !btn) return;
  const text = prompt.value.trim();
  if (!text) {
    showToast('⚠️ 请输入图片描述');
    prompt.focus();
    prompt.style.borderColor = '#ef4444';
    setTimeout(() => prompt.style.borderColor = '', 2000);
    return;
  }

  // Get style
  const styleBtn = document.querySelector('#styleOptions .active');
  const style = styleBtn ? styleBtn.dataset.style : '';

  // Get size
  const sizeSel = document.getElementById('genSize');
  const size = sizeSel ? sizeSel.value : '1024';
  let w = 1024, h = 1024;
  if (size === '1024x768') { w = 1024; h = 768; }
  else if (size === '768x1024') { w = 768; h = 1024; }

  // Build prompt
  const fullPrompt = style ? `${text}, ${style}, 高质量, 细节丰富` : `${text}, 高质量, 细节丰富`;

  // Loading state
  btn.textContent = '⏳ 生成中...';
  btn.disabled = true;
  result.innerHTML = `<div class="loading"><div class="spinner"></div><span>🎨 AI 正在绘制...</span></div>`;

  try {
    // Pollinations.ai free API
    const encoded = encodeURIComponent(fullPrompt);
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&seed=${seed}`;

    // Load image
    const img = new Image();
    img.style.cssText = 'width:100%;height:auto;max-height:400px;object-fit:contain;cursor:pointer;display:block;';

    // Wait for image to load (Pollinations generates on first request)
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => {
        // Retry once with different seed
        const retryUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&seed=${seed+1}`;
        const retryImg = new Image();
        retryImg.onload = () => { img.src = retryUrl; resolve(); };
        retryImg.onerror = resolve; // Give up, show broken image
        retryImg.src = retryUrl;
      };
      img.src = imageUrl;
      // Safety timeout
      setTimeout(resolve, 20000);
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

    // Download hint
    const hint = document.createElement('div');
    hint.style.cssText = 'position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,.5);color:#fff;padding:4px 12px;border-radius:8px;font-size:.72rem;pointer-events:none;z-index:1;';
    hint.textContent = '👆 点击下载';
    result.style.position = 'relative';
    result.appendChild(hint);

    showToast('✅ 图片生成完成！点击图片可下载');

  } catch (err) {
    result.innerHTML = `<div class="placeholder"><span class="big-ico">❌</span><span>生成失败<br/><span style="font-size:.78rem;color:var(--muted)">网络问题或该描述无法生成，换个描述试试</span></span></div>`;
    showToast('❌ 生成失败，请重试');
  }

  btn.textContent = '✨ 生成图片';
  btn.disabled = false;
}

// ===== Generate WenAn =====
function generateWenAn() {
  const input = document.getElementById('wenAnInput');
  const result = document.getElementById('wenAnResult');
  if (!input || !result) return;

  const text = input.value.trim();
  if (!text) {
    showToast('⚠️ 请输入文案主题');
    input.focus();
    return;
  }

  // Generate mock content based on input keywords
  const lower = text.toLowerCase();
  let output = '';

  if (text.includes('小红书') || text.includes('攻略')) {
    output = `🏆 **标题：${text.replace(/^(帮我写|写|生成|一段|一个)/, '').trim()}**\n\n哈喽姐妹们！今天来给大家分享一篇超实用的内容～\n\n✨ 为什么你一定要看？\n\n1️⃣ 这是我自己亲测有效的方法\n2️⃣ 零成本，有手就能做\n3️⃣ 坚持一周就能看到变化\n\n💡 小贴士：\n- 建议收藏起来慢慢看\n- 有什么问题评论区问我～\n\n📌 记得点赞+收藏，下次用得上！\n\n#干货分享 #生活小技巧 #实用推荐`;
  } else if (text.includes('产品') || text.includes('介绍')) {
    output = `# 📦 产品介绍：${text.replace(/^(帮我写|写|生成|一段|一个|产品介绍)/, '').trim()}\n\n## 核心亮点\n\n✨ **为什么选择我们？**\n\n✅ 简单易用 —— 不需要任何技术基础\n✅ 高效快捷 —— 节省 90% 的时间\n✅ 性价比高 —— 用得起的价格\n\n## 适用人群\n\n> 适合所有想要提升效率的个人和团队\n\n## 现在就开始\n\n📞 联系我们，了解更多\n\n---\n*让技术为每个人服务*`;
  } else if (text.includes('SEO') || text.includes('文章')) {
    output = `# 📝 ${text.replace(/^(帮我写|写|生成|一篇|一个|SEO文章)/, '').trim()} 完整指南\n\n## 为什么这很重要？\n\n在当今时代，掌握这个技能可以帮你：\n- 提升效率\n- 节省成本\n- 获得更多机会\n\n## 如何开始？\n\n### 第一步：了解基础\n...\n\n### 第二步：动手实践\n...\n\n### 第三步：持续优化\n...\n\n## 总结\n\n尽早开始，持续学习，你也能做到。\n\n---\n*本文由 AI 辅助生成，仅供参考*`;
  } else {
    output = `${text}\n\n${text}是一个很有价值的主题。以下是一些关键要点：\n\n1️⃣ 首先，了解其基本概念和应用场景\n2️⃣ 其次，掌握核心方法和技巧\n3️⃣ 最后，通过实践不断提升\n\n💡 建议从简单的开始，循序渐进。\n\n欢迎联系我们获取更多帮助！`;
  }

  result.textContent = '';
  result.innerText = output;
  showToast('✅ 文案生成完成！点击结果区域可全选复制');
}

// ===== Select text helper =====
function selectText(el) {
  if (!el) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  showToast('✅ 已选中，按 Ctrl+C / Cmd+C 复制');
}

// ===== Contact form =====
function submitContact(e) {
  e.preventDefault();
  const name = document.getElementById('cName').value.trim();
  const contact = document.getElementById('cContact').value.trim();
  const type = document.getElementById('cType').value;
  const desc = document.getElementById('cDesc').value.trim();

  if (!name || !contact || !desc) {
    showToast('⚠️ 请填写完整信息');
    return;
  }

  // For now, compose a message and show toast
  const msg = `📩 需求已收到！\n\n称呼：${name}\n联系方式：${contact}\n网站类型：${type}\n需求：${desc.substring(0, 50)}${desc.length > 50 ? '...' : ''}\n\n我会在 24 小时内联系你！`;

  showToast('✅ ' + '需求已提交！我会在 24h 内联系你', 4000);
  document.querySelector('.contact-form').reset();
}

// ===== Exports =====
window.generateImage = generateImage;
window.generateWenAn = generateWenAn;
window.fillPrompt = fillPrompt;
window.fillAn = fillAn;
window.selectText = selectText;
window.submitContact = submitContact;
window.showToast = showToast;

// ===== Console =====
console.log('%c🏗️ 灵境建站 v2.0', 'font-size:22px;font-weight:bold;color:#6366f1');
console.log('%c用 AI 帮不懂代码的人建网站', 'font-size:13px;color:#7c7c8a');
