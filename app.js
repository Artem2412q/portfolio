
/* v4 interactions: theme, drawer, scroll progress, scrollspy, reveal, counters, toasts, copy, modal, skill progress, filter, tilt */

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

/* Toast */
const toastEl = $("#toast");
let toastTimer = null;
function toast(msg){
  if(!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toastEl.classList.remove("show"), 2200);
}

/* Theme */
const themeBtn = $("#themeBtn");
const savedTheme = localStorage.getItem("theme");
if(savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

themeBtn?.addEventListener("click", ()=>{
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  toast(`Тема: ${next === "light" ? "светлая" : "тёмная"}`);
});

/* Scroll progress */
const progressBar = $("#progressBar");
function updateProgress(){
  if(!progressBar) return;
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const p = max <= 0 ? 0 : (doc.scrollTop / max) * 100;
  progressBar.style.width = p.toFixed(2) + "%";
}
updateProgress();
addEventListener("scroll", updateProgress, { passive:true });

/* Reveal */
const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!prefersReduced){
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });
  $$("[data-anim]").forEach(el=>io.observe(el));
} else {
  $$("[data-anim]").forEach(el=>el.classList.add("in"));
}

/* Scrollspy */
const navLinks = $$(".nav__link");
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

if(sections.length){
  const ioNav = new IntersectionObserver((entries)=>{
    const vis = entries
      .filter(e=>e.isIntersecting)
      .sort((a,b)=>b.intersectionRatio - a.intersectionRatio)[0];
    if(!vis) return;
    const id = "#" + vis.target.id;
    navLinks.forEach(a=>a.classList.toggle("active", a.getAttribute("href") === id));
  }, { rootMargin: "-45% 0px -50% 0px", threshold: [0.1,0.25,0.4,0.6] });
  sections.forEach(s=>ioNav.observe(s));
}

/* Counters */
function animateCounter(el, to){
  const dur = 900;
  const start = performance.now();
  function frame(t){
    const p = Math.min(1, (t-start)/dur);
    const eased = 1 - Math.pow(1-p, 3);
    el.textContent = Math.round(to*eased).toString();
    if(p<1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const ioCount = new IntersectionObserver((entries)=>{
  for(const e of entries){
    if(e.isIntersecting){
      const el = e.target;
      const to = parseInt(el.getAttribute("data-counter")||"0",10);
      animateCounter(el,to);
      ioCount.unobserve(el);
    }
  }
},{ threshold: 0.55 });
$$("[data-counter]").forEach(el=>ioCount.observe(el));

/* Copy helpers */
async function copyText(val){
  try{
    await navigator.clipboard.writeText(val);
    toast("Скопировано: " + val);
  }catch{
    toast("Не удалось скопировать: " + val);
  }
}
$$("[data-copy]").forEach(btn=>{
  btn.addEventListener("click", ()=>copyText(btn.getAttribute("data-copy")));
});
$$("[data-toast]").forEach(el=>{
  el.addEventListener("click",(e)=>{
    if(el.tagName.toLowerCase()==="a" && el.getAttribute("href")==="#") e.preventDefault();
    toast(el.getAttribute("data-toast") || "Ок");
  });
});

/* Inline tip buttons */
$$(".inlineTip").forEach(b=>b.addEventListener("click", ()=>toast(b.getAttribute("data-toast") || "")));

/* Drawer */
const drawer = $("#drawer");
const menuBtn = $("#menuBtn");
function openDrawer(){
  drawer?.classList.add("open");
  drawer?.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeDrawer(){
  drawer?.classList.remove("open");
  drawer?.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
menuBtn?.addEventListener("click", openDrawer);
$$("[data-close]", drawer).forEach(el=>el.addEventListener("click", closeDrawer));
addEventListener("keydown",(e)=>{
  if(e.key==="Escape" && drawer?.classList.contains("open")) closeDrawer();
});

/* Modal for projects */
const modal = $("#modal");
const mTitle = $("#mTitle");
const mDesc = $("#mDesc");
const mCover = $("#mCover");
const mTags = $("#mTags");
const mLink = $("#mLink");
const workCards = $$(".work__card");
const openFirst = $("#openFirst");

function openModalFrom(card){
  if(!modal || !card) return;
  mTitle.textContent = card.dataset.title || "Проект";
  mDesc.textContent = card.dataset.desc || "";
  const cover = card.querySelector(".work__cover");
  if(mCover){
    const img = card.querySelector("img");
    if(img && img.getAttribute("src")){
      mCover.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.20), rgba(0,0,0,.60)), url(${img.getAttribute("src")})`;
      mCover.style.backgroundSize = "cover";
      mCover.style.backgroundPosition = "center";
    } else if(cover){
      mCover.style.background = getComputedStyle(cover).background;
    }
  }
  const tags = (card.dataset.tags || "")
    .split(",")
    .map(s=>s.trim())
    .filter(Boolean);
  mTags.innerHTML = tags.map(t=>`<span>${t}</span>`).join("");
  const link = card.dataset.link || "#";
  if(mLink){
    mLink.href = link;
    mLink.style.display = (link && link !== "#") ? "inline-flex" : "none";
  }
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modal?.classList.remove("open");
  modal?.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
workCards.forEach(c => c.addEventListener("click", ()=>openModalFrom(c)));
openFirst?.addEventListener("click", ()=>openModalFrom(workCards[0]));
$$("[data-close]", modal).forEach(el=>el.addEventListener("click", closeModal));
addEventListener("keydown",(e)=>{
  if(e.key==="Escape" && modal?.classList.contains("open")) closeModal();
});

/* Radials */
const radHost = $("#radials");
if(radHost){
  try{
    const data = JSON.parse(radHost.getAttribute("data-radials") || "[]");
    radHost.innerHTML = data.map(item => {
      const r = 22;
      const c = 2 * Math.PI * r;
      const gid = item.name.replace(/\W/g,'');
      return `
        <div class="rad">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <linearGradient id="g${gid}" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="rgba(125,211,252,.95)"/>
                <stop offset="0.6" stop-color="rgba(167,243,208,.75)"/>
                <stop offset="1" stop-color="rgba(240,171,252,.65)"/>
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="${r}" stroke="rgba(255,255,255,.10)" stroke-width="8" fill="none"/>
            <circle class="ring" cx="32" cy="32" r="${r}"
              stroke="url(#g${gid})" stroke-width="8" fill="none"
              stroke-linecap="round"
              stroke-dasharray="${c}"
              stroke-dashoffset="${c}"
              data-val="${item.value}"
            />
          </svg>
          <div class="rad__text">
            <div class="rad__name">${item.name}</div>
            <div class="rad__val">${item.value}%</div>
          </div>
        </div>`;
    }).join("");

    const rings = $$(".ring", radHost);
    const ioR = new IntersectionObserver((entries)=>{
      for(const e of entries){
        if(e.isIntersecting){
          rings.forEach(ring=>{
            const r = 22;
            const c = 2 * Math.PI * r;
            const v = parseInt(ring.getAttribute("data-val")||"0",10);
            ring.style.transition = "stroke-dashoffset 1.15s cubic-bezier(.2,.9,.2,1)";
            ring.style.strokeDashoffset = c * (1 - v/100);
          });
          ioR.disconnect();
        }
      }
    }, { threshold: 0.35 });
    ioR.observe(radHost);
  }catch(err){ console.warn("Bad radials JSON", err); }
}

/* Bars animation */
const bars = $("#bars");
if(bars){
  const barEls = $$(".bar", bars);
  const ioB = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        barEls.forEach((b, idx)=>{
          const v = parseInt(b.getAttribute("data-val")||"0",10);
          const fill = $(".bar__line i", b);
          if(fill){
            fill.style.transition = `width 1.05s cubic-bezier(.2,.9,.2,1) ${idx*90}ms`;
            fill.style.width = v + "%";
          }
        });
        ioB.disconnect();
      }
    }
  }, { threshold: 0.35 });
  ioB.observe(bars);
}

/* Services filter */
const segBtns = $$(".seg__btn");
const svcCards = $$(".svc");
segBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    segBtns.forEach(b=>b.classList.toggle("active", b===btn));
    const f = btn.getAttribute("data-filter") || "all";
    svcCards.forEach(card=>{
      const cat = card.getAttribute("data-cat");
      const show = f === "all" || f === cat;
      card.style.display = show ? "" : "none";
    });
    toast(f === "all" ? "Показаны все услуги" : `Фильтр: ${btn.textContent}`);
  });
});

/* Smooth scroll for buttons */
$$("[data-scroll]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const sel = btn.getAttribute("data-scroll");
    const el = document.querySelector(sel);
    el?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  });
});

/* Form demo */
const form = $("#contactForm");
const formNote = $("#formNote");
form?.addEventListener("submit",(e)=>{
  e.preventDefault();
  const chk = $("#notRobot");
  if(chk && !chk.checked){
    formNote.textContent = "Поставь галочку «Я не робот» (демо).";
    formNote.style.color = "rgba(240,171,252,.95)";
    return;
  }
  formNote.style.color = "";
  formNote.textContent = "Готово! (Демо) — подключим отправку в Telegram/почту.";
  toast("Отправлено (демо)");
  form.reset();
});

/* Tilt effect (desktop only) */
const canTilt = !prefersReduced && matchMedia("(hover:hover) and (pointer:fine)").matches;
if(canTilt){
  const tilts = $$(".tilt");
  tilts.forEach(el=>{
    el.setAttribute("data-tilt","on");
    let raf = null;
    const onMove = (ev)=>{
      const r = el.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width;
      const y = (ev.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 6;  // deg
      const ry = (x - 0.5) * 8;  // deg
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-1px)`;
      });
    };
    const onLeave = ()=>{
      if(raf) cancelAnimationFrame(raf);
      el.style.transform = "";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
  });
}

/* Year */
$("#year").textContent = new Date().getFullYear();

// ===== New Year theme toggle =====
const nyToggle = document.getElementById('nyToggle');
if(nyToggle){
  const setNY = (v)=>{
    document.body.dataset.ny = v ? 'on' : '';
    localStorage.setItem('ny', v ? 'on' : 'off');
  };
  const savedNY = localStorage.getItem('ny');
  if(savedNY === 'on') setNY(true);

  nyToggle.addEventListener('click', ()=>{
    setNY(document.body.dataset.ny !== 'on');
  });
}


// ===== v9: NY countdown (to next Jan 1, local time) =====
const nyCountdown = document.getElementById('nyCountdown');
const nyTime = document.getElementById('nyTime');

function nextNewYear(){
  const now = new Date();
  const year = now.getFullYear();
  // Always next Jan 1 (of next year)
  return new Date(year + 1, 0, 1, 0, 0, 0, 0);
}
function fmt2(n){ return String(n).padStart(2,'0'); }

let nyTimer = null;
function startNYCountdown(){
  if(!nyCountdown || !nyTime) return;
  nyCountdown.hidden = false;

  const tick = ()=>{
    const now = new Date();
    const target = nextNewYear();
    let diff = target - now;

    if(diff <= 0){
      nyTime.textContent = "С Новым годом! 🎉";
      return;
    }
    const sec = Math.floor(diff/1000);
    const days = Math.floor(sec / 86400);
    const hrs = Math.floor((sec % 86400)/3600);
    const mins = Math.floor((sec % 3600)/60);

    if(days > 0){
      nyTime.textContent = `${days}д ${fmt2(hrs)}ч ${fmt2(mins)}м`;
    } else {
      const s = sec % 60;
      nyTime.textContent = `${fmt2(hrs)}:${fmt2(mins)}:${fmt2(s)}`;
    }
  };

  tick();
  nyTimer = setInterval(tick, 1000);
}
function stopNYCountdown(){
  if(!nyCountdown) return;
  nyCountdown.hidden = true;
  if(nyTimer){ clearInterval(nyTimer); nyTimer = null; }
}

(function(){
  const apply = ()=>{
    const on = document.body.dataset.ny === 'on';
    if(on) startNYCountdown();
    else stopNYCountdown();
  };
  apply();
  const mo = new MutationObserver(apply);
  mo.observe(document.body, { attributes:true, attributeFilter:['data-ny'] });
})();
