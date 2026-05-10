/* ===== AI魔法工坊 - JavaScript ===== */

// ===== 页面加载动画 =====
(function(){
  // 创建加载遮罩
  const overlay = document.createElement('div');
  overlay.className = 'loader-overlay';
  overlay.innerHTML = '<div class="loader-spinner"></div>';
  document.body.appendChild(overlay);

  // 加载完成后隐藏
  window.addEventListener('load', function(){
    setTimeout(function(){
      overlay.classList.remove('show');
    }, 400);
  });

  // 初始显示加载
  setTimeout(function(){
    overlay.classList.add('show');
  }, 10);

  // 所有链接点击时显示加载动画
  document.addEventListener('click', function(e){
    const link = e.target.closest('a');
    if(!link) return;
    const href = link.getAttribute('href');
    if(!href) return;
    // 只对站内链接生效
    if(href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('http')) return;
    if(href.endsWith('.html')) {
      overlay.classList.add('show');
    }
  });
})();

// ===== 平台切换 (部署页面用) =====
function switchPlatform(name){
  document.querySelectorAll('.p-content').forEach(function(el){
    el.classList.remove('active');
  });
  document.querySelectorAll('.p-tab').forEach(function(el){
    el.classList.remove('active');
  });
  var content = document.getElementById('p-' + name);
  if(content) content.classList.add('active');
  var tab = document.querySelector('.p-tab[onclick*="' + name + '"]');
  if(tab) tab.classList.add('active');
}

// ===== 魔法计数演示 (tools页面用) =====
(function(){
  var countEl = document.getElementById('magicCount');
  var barEl = document.getElementById('magicBar');
  if(!countEl) return;

  var used = 86;
  var total = 200;

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
    setInterval(function(){
      d = d <= 1 ? 30 : d - 1;
      daysEl.textContent = d;
    }, 60000);
  }
})();

// ===== 表单占位交互 =====
(function(){
  // 工具页面的生成按钮
  document.querySelectorAll('.gen-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      var input = this.closest('.gen-box').querySelector('textarea, input');
      if(input && !input.value.trim()){
        input.style.borderColor = '#ef4444';
        setTimeout(function(){ input.style.borderColor = ''; }, 2000);
        return;
      }
      this.textContent = '⏳ 生成中...';
      this.disabled = true;
      setTimeout(function(){
        this.textContent = '✅ 生成成功！';
        setTimeout(function(){
          this.textContent = '✨ 生成';
          this.disabled = false;
        }.bind(this), 2000);
      }.bind(this), 1500);
    });
  });
})();
