
/* =========================================================
   v11 — interactions (premium minimal)
   - Theme: auto / light / dark
   - Sticky header is native; we add active section highlight
   - Smooth scroll + progress bar
   - Reveal on scroll
   - Portfolio rendering + modal
   - Local anti-spam captcha + optional external captcha placeholder
   ========================================================= */

const $ = (q, el=document)=>el.querySelector(q);
const $$ = (q, el=document)=>Array.from(el.querySelectorAll(q));

/* ---------- Theme ---------- */
const THEME_KEY = "theme_v11";
const themes = ["auto","light","dark"];
const themeBtn = $("#themeBtn");

function systemTheme(){
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function applyTheme(mode){
  const html = document.documentElement;
  html.setAttribute("data-theme", mode);
  // resolve auto into actual appearance via data-effective
  const eff = (mode === "auto") ? systemTheme() : mode;
  html.dataset.effective = eff;
  // for CSS we use explicit modes; set class via mode?
  if(mode === "auto"){
    html.setAttribute("data-theme", eff); // practical: auto behaves as system for styling
    html.dataset.mode = "auto";
  } else {
    html.dataset.mode = mode;
  }
  updateThemeIcon();
}
function updateThemeIcon(){
  if(!themeBtn) return;
  const mode = document.documentElement.dataset.mode || "auto";
  themeBtn.textContent = mode === "light" ? "☀️" : mode === "dark" ? "🌙" : "🌓";
  themeBtn.setAttribute("data-tip", `Тема: ${mode} (нажми)`);
}
function getMode(){
  return localStorage.getItem(THEME_KEY) || "auto";
}
function nextMode(cur){
  const i = themes.indexOf(cur);
  return themes[(i+1) % themes.length];
}
applyTheme(getMode());
themeBtn?.addEventListener("click", ()=>{
  const cur = getMode();
  const n = nextMode(cur);
  localStorage.setItem(THEME_KEY, n);
  applyTheme(n);
});
window.matchMedia?.("(prefers-color-scheme: light)")?.addEventListener?.("change", ()=>{
  if(getMode()==="auto") applyTheme("auto");
});

/* ---------- Mobile menu ---------- */
const menuBtn = $("#menuBtn");
const mobileNav = $("#mobileNav");
menuBtn?.addEventListener("click", ()=>{
  const open = mobileNav.classList.toggle("is-open");
  mobileNav.setAttribute("aria-hidden", open ? "false" : "true");
});
$$(".mobileNav a").forEach(a=>a.addEventListener("click", ()=>{
  mobileNav.classList.remove("is-open");
  mobileNav.setAttribute("aria-hidden","true");
}));

/* ---------- Smooth scroll (respect reduced motion) ---------- */
const prefersReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!prefersReduce){
  document.documentElement.style.scrollBehavior = "smooth";
}

/* ---------- Progress bar ---------- */
const progressBar = $("#progressBar");
function updateProgress(){
  if(!progressBar) return;
  const doc = document.documentElement;
  const top = doc.scrollTop || document.body.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  const p = height > 0 ? (top/height)*100 : 0;
  progressBar.style.width = `${p}%`;
}
window.addEventListener("scroll", updateProgress, {passive:true});
updateProgress();

/* ---------- Reveal on scroll ---------- */
const revealEls = $$("[data-reveal]");
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add("is-in");
  });
},{threshold: 0.12});
revealEls.forEach(el=>io.observe(el));

/* ---------- Active section highlight ---------- */
const navLinks = $$(".nav__link");
const sections = ["about","strengths","portfolio","contact"].map(id=>document.getElementById(id)).filter(Boolean);

function setActive(id){
  navLinks.forEach(a=>{
    a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
  });
}
const so = new IntersectionObserver((entries)=>{
  // pick most visible
  const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(visible?.target?.id) setActive(visible.target.id);
},{threshold: [0.25,0.5,0.75]});
sections.forEach(s=>so.observe(s));

/* ---------- Toast + copy ---------- */
const toast = $("#toast");
let toastT=null;
function showToast(msg){
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add("is-on");
  clearTimeout(toastT);
  toastT = setTimeout(()=>toast.classList.remove("is-on"), 1600);
}
function copyText(t){
  navigator.clipboard?.writeText(t).then(()=>showToast("Скопировано ✅")).catch(()=>showToast("Не удалось скопировать"));
}
$$("[data-copy]").forEach(el=>{
  el.addEventListener("click", ()=>{
    const t = el.getAttribute("data-copy");
    if(t) copyText(t);
  });
});

/* ---------- Portfolio data ---------- */
const CASES = [
  {
    id:"whitenet",
    title:"WhiteNet",
    meta:"Web hub • navigation • motion",
    desc:"Игровой веб‑хаб с продуманной навигацией, ролями и быстрым доступом к разделам.",
    tags:["UI","Motion","Adaptive","FiveM","MySQL"],
    filters:["ui","motion","db"],
    badge:"RP",
    img:"assets/shot-whitenet.png",
    ux:"Сделать удобную точку входа с ясной структурой: быстро понять куда нажать и что происходит, без “простыни” текста.",
    sol:"Сетка + иерархия. Карточки-сценарии, чёткие CTA, аккуратные подсказки, мягкие переходы между состояниями.",
    res:"Пользователь быстрее ориентируется, меньше ошибок навигации, интерфейс выглядит цельным и “продуктовым”.",
    stack:"HTML/CSS/JS • дизайн-система • интеграция с серверной логикой • MySQL (в проекте)",
    link:"https://vk.com/artem_chepko"
  },
  {
    id:"bhb",
    title:"BHB",
    meta:"Catalog • cards • components",
    desc:"Сложный интерфейс с каталогами, карточками, фильтрацией и атмосферной стилизацией.",
    tags:["UI","Components","Adaptive","FiveM","MySQL"],
    filters:["ui","db"],
    badge:"RP",
    img:"assets/shot-bhb.png",
    ux:"Собрать большую витрину/каталог так, чтобы она читалась и оставалась удобной при росте контента.",
    sol:"Компонентный подход: карточки, табы, таблицы, единая типографика, аккуратные состояния (hover/active/empty).",
    res:"Контент воспринимается блоками, интерфейс не “сыпется” на мобилке, можно спокойно добавлять новые разделы.",
    stack:"UI kit • HTML/CSS/JS • адаптив • интеграции с БД (в связке с сервером)",
    link:"https://vk.com/artem_chepko"
  },
  {
    id:"drive3",
    title:"Drive3",
    meta:"Dashboards • stats • micro‑UX",
    desc:"Интерфейс с плотной инфографикой: статусы, блоки, быстрые действия и аккуратный motion.",
    tags:["UX","Motion","Adaptive","FiveM","MySQL"],
    filters:["ui","motion","db"],
    badge:"RP",
    img:"assets/shot-drive3.png",
    ux:"Сделать “дашборд”, который не перегружает: важное видно сразу, остальное — по запросу.",
    sol:"Группировка по приоритетам, компактные карточки, понятные акценты, микро‑анимации на взаимодействиях.",
    res:"Сценарии выполняются быстрее, меньше “визуального шума”, интерфейс ощущается как продукт.",
    stack:"UI/UX • motion • HTML/CSS/JS • интеграция с MySQL (в проекте)",
    link:"https://vk.com/artem_chepko"
  },
  {
    id:"mchs",
    title:"Сайт МЧС",
    meta:"Portal • navigation • readability",
    desc:"Информационный портал с акцентом на читаемость, навигацию и быстрый поиск по разделам.",
    tags:["Portal","Readability","Adaptive","Components"],
    filters:["portal","ui"],
    badge:"UI",
    img:"assets/shot-mchs.png",
    ux:"Уложить большой объём информации так, чтобы пользователь быстро находил нужное и не уставал читать.",
    sol:"Якоря/разделы, табы, карточки, аккуратные заголовки, единые отступы, понятные подсказки.",
    res:"Страница не выглядит “простынёй”, навигация понятна, добавление новых материалов не ломает дизайн.",
    stack:"HTML/CSS/JS • компоненты • структура контента",
    link:"https://vk.com/artem_chepko"
  }
];

const casesRoot = $("#cases");

function tagHtml(t){ return `<span class="tag">${t}</span>`; }

function caseCard(c){
  const hasImg = !!c.img;
  const imgTag = hasImg ? `<img src="${c.img}" alt="${c.title}" loading="lazy">` : "";
  return `
  <article class="case" data-id="${c.id}" tabindex="0" role="button" aria-label="Открыть кейс ${c.title}">
    <div class="case__media">
      ${imgTag}
      <div class="case__badge">${c.badge}</div>
    </div>
    <div class="case__body">
      <div class="case__title">${c.title}</div>
      <div class="case__meta">${c.meta}</div>
      <div class="case__desc">${c.desc}</div>
      <div class="tags">${c.tags.map(tagHtml).join("")}</div>
    </div>
  </article>`;
}

let currentFilter = "all";
function renderCases(){
  if(!casesRoot) return;
  const list = CASES.filter(c => currentFilter==="all" ? true : c.filters.includes(currentFilter));
  casesRoot.innerHTML = list.map(caseCard).join("");
  // hook
  $$(".case", casesRoot).forEach(el=>{
    const open = ()=>openCase(el.dataset.id);
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); }
    });
  });
}
renderCases();

/* ---------- Filters ---------- */
$$(".fbtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    $$(".fbtn").forEach(b=>b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter || "all";
    renderCases();
  });
});

/* ---------- Modal ---------- */
const modal = $("#modal");
const mMedia = $("#mMedia");
const mTitle = $("#mTitle");
const mMeta = $("#mMeta");
const mTags = $("#mTags");
const mUX = $("#mUX");
const mSol = $("#mSol");
const mRes = $("#mRes");
const mStack = $("#mStack");

function openCase(id){
  const c = CASES.find(x=>x.id===id);
  if(!c || !modal) return;

  modal.classList.remove("is-closing");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden","false");

  mTitle.textContent = c.title;
  mMeta.textContent = c.meta;
  mTags.innerHTML = c.tags.map(tagHtml).join("");
  mUX.textContent = c.ux;
  mSol.textContent = c.sol;
  mRes.textContent = c.res;
  mStack.textContent = c.stack;

  if(mMedia){
    if(c.img){
      mMedia.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.62)), url(${c.img})`;
      mMedia.style.backgroundSize = "cover";
      mMedia.style.backgroundPosition = "center";
    } else {
      mMedia.style.backgroundImage = "";
    }
  }

  document.body.style.overflow = "hidden";
}

let __closeT=null;
function closeModal(){
  if(!modal) return;
  // graceful close
  modal.classList.remove("is-open");
  modal.classList.add("is-closing");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
  clearTimeout(__closeT);
  const t = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0 : 230;
  __closeT = setTimeout(()=>{ modal.classList.remove("is-closing"); }, t);
}

$$( "[data-close]", modal ).forEach(el=>el.addEventListener("click", closeModal));
window.addEventListener("keydown", (e)=>{
  if(e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
});

/* ---------- Local captcha ---------- */
const captchaQ = $("#captchaQ");
const captchaA = $("#captchaA");
const captchaRefresh = $("#captchaRefresh");
let captchaAnswer = 0;

function newCaptcha(){
  const a = Math.floor(2 + Math.random()*8);
  const b = Math.floor(2 + Math.random()*8);
  const op = Math.random() > 0.5 ? "+" : "×";
  captchaAnswer = op === "+" ? (a + b) : (a * b);
  if(captchaQ) captchaQ.textContent = `${a} ${op} ${b} = ?`;
  if(captchaA) captchaA.value = "";
}
captchaRefresh?.addEventListener("click", newCaptcha);
newCaptcha();

/* Prevent submit unless captcha correct */
const form = $("#contactForm");
form?.addEventListener("submit", (e)=>{
  const v = parseInt(captchaA?.value || "", 10);
  if(Number.isNaN(v) || v !== captchaAnswer){
    e.preventDefault();
    showToast("Антиспам: неверный ответ ❌");
    captchaA?.focus();
    return;
  }
  showToast("Отправляю… ✉️");
});

/* ---------- Micro: section transition hint (optional) ---------- */
window.addEventListener("hashchange", ()=>{
  const id = location.hash.replace("#","");
  const el = document.getElementById(id);
  if(el){ el.classList.add("flash"); setTimeout(()=>el.classList.remove("flash"), 700); }
});


/* ---- v11-fix: form file protocol guard + mailto fallback ---- */
(function(){
  const form = document.getElementById("contactForm");
  const notice = document.getElementById("formNotice");
  const mailtoBtn = document.getElementById("mailtoBtn");
  if(!form || !mailtoBtn) return;

  function buildMailto(){
    const name = form.querySelector('input[name="name"]')?.value?.trim() || "";
    const email = form.querySelector('input[name="email"]')?.value?.trim() || "";
    const msg = form.querySelector('textarea[name="message"]')?.value?.trim() || "";
    const subject = "Сообщение с портфолио (artem)";
    const body =
      `Имя: ${name}\n` +
      `Email: ${email}\n\n` +
      `${msg}\n\n` +
      `— Отправлено со страницы-портфолио`;
    const href = `mailto:artemcepko69@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    mailtoBtn.href = href;
  }

  // Update mailto on input
  ["input","change","keyup"].forEach(evt=>{
    form.addEventListener(evt, ()=>{
      buildMailto();
    }, {passive:true});
  });
  buildMailto();

  const isFile = location.protocol === "file:";

  if(isFile){
    notice && (notice.hidden = false);
  }

  form.addEventListener("submit", (e)=>{
    // If opened via file://, FormSubmit won't work. Cancel and suggest mailto.
    if(isFile){
      e.preventDefault();
      buildMailto();
      showToast("Открываю почту… 📨");
      // open mailto
      window.location.href = mailtoBtn.href;
      return;
    }
  });
})();




/* ---- v11-fix4: floating tooltip (row-aware) ---- */
(function(){
  const tip = document.getElementById("tipFloat");
  if(!tip) return;

  let activeEl = null;
  let hideT = null;

  function uniqSorted(values, tol=6){
    const out = [];
    values.sort((a,b)=>a-b);
    for(const v of values){
      if(out.length===0 || Math.abs(v - out[out.length-1]) > tol) out.push(v);
    }
    return out;
  }

  function columnsCount(els){
    const lefts = uniqSorted(els.map(e=>Math.round(e.getBoundingClientRect().left)), 10);
    return lefts.length;
  }

  function rowIndex(el, container, selector){
    const els = Array.from(container.querySelectorAll(selector));
    if(els.length === 0) return 0;
    const tops = uniqSorted(els.map(e=>Math.round(e.getBoundingClientRect().top)), 10);
    const t = Math.round(el.getBoundingClientRect().top);
    let idx = 0;
    let best = Infinity;
    for(let i=0;i<tops.length;i++){
      const d = Math.abs(t - tops[i]);
      if(d < best){ best = d; idx = i; }
    }
    return idx;
  }

  function show(el){
    const text = el.getAttribute("data-tip");
    if(!text) return;

    activeEl = el;
    clearTimeout(hideT);

    tip.textContent = text;
    tip.classList.add("is-on");
    tip.setAttribute("aria-hidden","false");

    position(el);
  }

  function hide(){
    activeEl = null;
    tip.classList.remove("is-on");
    tip.setAttribute("aria-hidden","true");
  }

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function position(el){
    if(!el || !tip.classList.contains("is-on")) return;

    // measure tooltip
    tip.style.transform = "translate3d(-9999px,-9999px,0)";
    const rect = el.getBoundingClientRect();
    const pad = 12;

    // Determine preferred placement:
    let prefer = "top";

    const strengths = el.closest(".strengths");
    if(strengths){
      const chips = Array.from(strengths.querySelectorAll(".chip"));
      const cols = columnsCount(chips);
      if(cols <= 1){
        // In 1-column layout, prefer top to avoid covering next item
        prefer = "top";
      } else {
        const r = rowIndex(el, strengths, ".chip");
        prefer = (r === 0) ? "top" : "bottom";
      }
    } else {
      // generic: top if enough space else bottom
      prefer = (rect.top > 120) ? "top" : "bottom";
    }

    // compute size after setting text
    const tipW = tip.offsetWidth;
    const tipH = tip.offsetHeight;

    let x = rect.left + rect.width/2 - tipW/2;
    x = clamp(x, pad, window.innerWidth - tipW - pad);

    let yTop = rect.top - tipH - 10;
    let yBottom = rect.bottom + 10;

    // flip if needed
    if(prefer === "top" && yTop < pad) prefer = "bottom";
    if(prefer === "bottom" && (yBottom + tipH) > (window.innerHeight - pad)) prefer = "top";

    let y = (prefer === "top") ? yTop : yBottom;

    // last resort: side placement
    if(y < pad) y = pad;
    if(y + tipH > window.innerHeight - pad) y = window.innerHeight - tipH - pad;

    tip.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }

  // Events
  document.addEventListener("pointerenter", (e)=>{
    const el = e.target?.closest?.("[data-tip]");
    if(el) show(el);
  }, true);

  document.addEventListener("pointerleave", (e)=>{
    const el = e.target?.closest?.("[data-tip]");
    if(el && el === activeEl){
      hideT = setTimeout(hide, 50);
    }
  }, true);

  document.addEventListener("focusin", (e)=>{
    const el = e.target?.closest?.("[data-tip]");
    if(el) show(el);
  });

  document.addEventListener("focusout", (e)=>{
    const el = e.target?.closest?.("[data-tip]");
    if(el && el === activeEl) hide();
  });

  window.addEventListener("scroll", ()=>{
    if(activeEl) position(activeEl);
  }, {passive:true});
  window.addEventListener("resize", ()=>{
    if(activeEl) position(activeEl);
  });
})();
