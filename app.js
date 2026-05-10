/* ========================================
   AI魔法工坊 — Complete JavaScript
   ======================================== */

// ===== Page Loader =====
(function(){
  const o = document.createElement('div');
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
    showToast('⚠️ 输入图片描述');
    prompt.focus(); prompt.style.borderColor='#ef4444';
    setTimeout(()=>prompt.style.borderColor='',2000); return;
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
  result.innerHTML=`<div class="loading"><div class="spinner"></div><span>🎨 AI 正在绘制...</span></div>`;

  try{
    const encoded=encodeURIComponent(fullPrompt);
    const seed=Math.floor(Math.random()*999999);
    const url=`https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&seed=${seed}`;

    // Try loading the image
    const img=new Image();
    img.style.cssText='width:100%;height:auto;max-height:400px;object-fit:contain;cursor:pointer;display:block;';
    img.crossOrigin='anonymous';

    await new Promise((resolve)=>{
      let loaded=false;
      img.onload=()=>{loaded=true;resolve()};
      img.onerror=()=>{
        // Retry once
        const rUrl=`https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&seed=${seed+1}`;
        const rImg=new Image();
        rImg.onload=()=>{img.src=rUrl;loaded=true;resolve()};
        rImg.onerror=()=>resolve();
        rImg.src=rUrl;
      };
      img.src=url;
      setTimeout(()=>{if(!loaded)resolve()},25000);
    });

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

    showToast('✅ 生成成功！点击图片下载 (消耗 5✨)');
  } catch(err){
    result.innerHTML=`<div class="placeholder"><span class="ico">❌</span><span>生成失败，换个描述试试<br/><span style="font-size:.75rem;color:var(--muted)">网络问题或该描述无法生成</span></span></div>`;
    showToast('❌ 生成失败');
  }

  btn.textContent='✨ 消耗 5✨ 生成';
  btn.disabled=false;
}

// ===== Generate WenAn =====
function generateWenAn(){
  const input=document.getElementById('wenAnInput');
  const result=document.getElementById('wenAnResult');
  if(!input||!result) return;

  const text=input.value.trim();
  if(!text){showToast('⚠️ 请输入文案主题');input.focus();return}

  let output='';
  const kw=text.toLowerCase();

  if(text.includes('小红书')||text.includes('攻略')){
    output=`🏆 标题：${text.replace(/^(帮我写|写|生成|一段|一个|的)/,'').trim()}\n\n哈喽姐妹们！今天来分享一篇超干货～\n\n✨ 为什么你一定要看？\n\n1️⃣ 亲测有效的方法\n2️⃣ 零成本，有手就能做\n3️⃣ 坚持一周就有变化\n\n💡 小贴士：\n- 建议收藏慢慢看\n- 有问题评论区问～\n\n📌 记得点赞+收藏！\n\n#干货分享 #实用推荐`;
  } else if(text.includes('产品')||text.includes('介绍')){
    output=`📦 产品介绍\n\n${text.replace(/^(帮我写|写|生成|一段|一个|产品介绍)/,'').trim()}\n\n✨ 核心亮点\n✅ 简单易用 —— 不需要任何技术基础\n✅ 高效快捷 —— 节省 90% 时间\n✅ 性价比高 —— 用得起的价格\n\n🎯 适用人群\n> 适合所有想要提升效率的个人和团队\n\n📞 联系我们，了解更多\n---`;
  } else if(text.includes('SEO')||text.includes('文章')){
    output=`📝 ${text.replace(/^(帮我写|写|生成|一篇|一个|SEO文章)/,'').trim()} 完整指南\n\n为什么这很重要？\n掌握这个技能可以帮你提升效率、节省成本、获得更多机会。\n\n如何开始？\n第一步：了解基础\n第二步：动手实践\n第三步：持续优化\n\n总结\n尽早开始，持续学习。\n---`;
  } else if(text.includes('推广')){
    output=`📢 推广文案\n\n还在为 [痛点] 烦恼吗？试试这个！\n\n✨ 为什么值得试？\n✅ 效果显著\n✅ 操作简单\n✅ 价格亲民\n\n💡 限时福利：\n现在联系我，免费体验！\n\n👉 立即行动，别错过！`;
  } else {
    output=`${text}\n\n${text} 是一个很有价值的主题。\n\n要点：\n1️⃣ 了解基础概念和应用场景\n2️⃣ 掌握核心方法\n3️⃣ 通过实践不断提升\n\n💡 从简单的开始，循序渐进。\n\n需要更多帮助？联系我们！`;
  }

  result.textContent=''; result.innerText=output;
  showToast('✅ 文案生成！点击结果全选复制');
}

// ===== Select Text =====
function selectText(el){
  if(!el) return;
  const r=document.createRange(); r.selectNodeContents(el);
  const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
  showToast('✅ 已选中，Ctrl+C / Cmd+C 复制');
}

// ===== Magic Counter Animation =====
(function(){
  const c=document.getElementById('magicCount'); const b=document.getElementById('magicBar');
  if(!c) return;
  let used=86,total=200;
  function tick(){if(used<total){used++;c.textContent=total-used;if(b)b.style.width=((used/total)*100)+'%';setTimeout(tick,3000+Math.random()*4000)}}
  setTimeout(tick,3000);
  const d=document.getElementById('resetDays');
  if(d){let day=18;setInterval(()=>{day=day<=1?30:day-1;d.textContent=day},60000)}
})();

// ===== Exports =====
window.generateImage=generateImage;
window.generateWenAn=generateWenAn;
window.fillPrompt=fillPrompt;
window.fillWenAn=fillWenAn;
window.selectText=selectText;
window.showToast=showToast;

// Console greeting
console.log('%c✨ AI魔法工坊 v2.0', 'font-size:20px;font-weight:bold;color:#a855f7');
console.log('%cAI生图 · AI视频 · AI建站 · AI文案', 'font-size:12px;color:#7c7c8a');
console.log('%c魔法消耗制 · $6.99 起', 'font-size:12px;color:#f59e0b');
