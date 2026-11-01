(() => {
 const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
 $('#year').textContent=new Date().getFullYear();
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reveal=$$('.reveal');
 if('IntersectionObserver'in window&&!reduced){
  const io=new IntersectionObserver((entries,obs)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -45px 0px'});
  reveal.forEach(el=>io.observe(el));
 }else reveal.forEach(el=>el.classList.add('in'));
 const nav=$('#navbar'),progress=$('#progressBar'),topBtn=$('#backTop');
 const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';nav.classList.toggle('scrolled',scrollY>24);topBtn.classList.toggle('show',scrollY>520)};
 addEventListener('scroll',update,{passive:true});update();
 topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:reduced?'auto':'smooth'}));
 $$('.nav-link').forEach(a=>a.addEventListener('click',()=>{const menu=$('#navMenu');if(menu.classList.contains('show')&&window.bootstrap)bootstrap.Collapse.getOrCreateInstance(menu).hide()}));
 if('IntersectionObserver'in window){
  const sections=$$('main section[id]'),links=$$('.nav-link');
  const navObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>{const active=a.getAttribute('href')==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}}),{rootMargin:'-38% 0px -52% 0px'});
  sections.forEach(s=>navObserver.observe(s));
 }
 const form=$('#contactForm');
 if(form){form.addEventListener('submit',e=>{e.preventDefault();const name=$('#contactName').value.trim(),email=$('#contactEmail').value.trim(),topic=$('#contactTopic').value,message=$('#contactMessage').value.trim();const subject=encodeURIComponent(topic+' — from '+name);const body=encodeURIComponent('Hi Deepankumar,\\n\\n'+message+'\\n\\nFrom: '+name+'\\nEmail: '+email);$('#formFeedback').textContent='Opening your email app…';window.location.href='mailto:deepankumarpalaniyappan@gmail.com?subject='+subject+'&body='+body;});}
 $$('.skill-node').forEach(node=>{node.addEventListener('click',()=>{node.style.animationPlayState=node.style.animationPlayState==='paused'?'running':'paused'});node.setAttribute('tabindex','0');node.setAttribute('role','button');node.setAttribute('aria-label',(node.getAttribute('title')||'Skill')+' icon; activate to pause or resume movement');node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();node.click()}})});
 const glow=$('#cursorGlow');
 if(glow&&!reduced&&matchMedia('(pointer:fine)').matches){let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;glow.style.opacity='.13'},{passive:true});const tick=()=>{x+=(tx-x)*.12;y+=(ty-y)*.12;glow.style.left=x+'px';glow.style.top=y+'px';requestAnimationFrame(tick)};tick();}
 if(!reduced&&matchMedia('(pointer:fine)').matches){$$('.project,.skill-tile,.bento-card').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.backgroundImage=`radial-gradient(circle at ${x*100}% ${y*100}%,rgba(89,143,255,.09),transparent 48%)`});card.addEventListener('pointerleave',()=>card.style.backgroundImage='')})}
})();
