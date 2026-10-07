// snbr.dev
// Todos los derechos reservados.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== BOOT SEQUENCE (typewriter) =====
const bootLines = [
  "> iniciando snbr.dev ...",
  "> cargando módulos: WEB, SOFTWARE, AUTOMATIZACIÓN ...",
  "> estado: OPERATIVO",
  "> bienvenido. ¿Qué vamos a construir hoy?"
];

function typeBoot(el, lines, lineDelay = 450, charDelay = 18){
  if(reduceMotion){ el.textContent = lines.join("\n"); return; }
  let lineIndex = 0, charIndex = 0, output = "";
  (function typeChar(){
    if(lineIndex >= lines.length) return;
    const current = lines[lineIndex];
    if(charIndex < current.length){
      output += current[charIndex++];
      el.textContent = output + "▌";
      setTimeout(typeChar, charDelay);
    } else {
      output += "\n";
      lineIndex++; charIndex = 0;
      if(lineIndex < lines.length) setTimeout(typeChar, lineDelay);
      else el.textContent = output.trimEnd();
    }
  })();
}

// ===== ROTATING WORD IN HERO =====
function rotateWords(el, words, hold = 2400){
  if(reduceMotion) return;
  let i = 0;
  setInterval(() => {
    el.style.opacity = 0;
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.style.opacity = 1;
    }, 260);
  }, hold);
  el.style.transition = "opacity .26s ease";
}

// ===== CODE RAIN (canvas) =====
function codeRain(canvas){
  if(reduceMotion || !canvas) return;
  const ctx = canvas.getContext("2d");
  const glyphs = "01{}[]<>/=;$#snbrdev".split("");
  const size = 15;
  let cols, drops, running = true, w, h;

  function resize(){
    const r = canvas.getBoundingClientRect();
    w = canvas.width = r.width; h = canvas.height = r.height;
    cols = Math.floor(w / size);
    drops = Array.from({ length: cols }, () => Math.random() * -50);
  }
  function draw(){
    if(!running) return;
    ctx.fillStyle = "rgba(10,13,18,0.12)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#4fd1c5";
    ctx.font = size + "px 'JetBrains Mono', monospace";
    for(let i = 0; i < cols; i++){
      ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * size, drops[i] * size);
      if(drops[i] * size > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.5;
    }
    setTimeout(() => requestAnimationFrame(draw), 45);
  }
  resize();
  window.addEventListener("resize", resize);
  // pausa cuando el hero no es visible
  new IntersectionObserver(([e]) => {
    const was = running; running = e.isIntersecting;
    if(running && !was) draw();
  }).observe(canvas);
  draw();
}

// ===== COUNTERS =====
function animateCounter(el){
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  const prefix = el.dataset.prefix || "";
  if(reduceMotion || target === 0){ el.textContent = prefix + target + suffix; return; }
  const dur = 1200, t0 = performance.now();
  (function tick(now){
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
    if(p < 1) requestAnimationFrame(tick);
  })(t0);
}

document.addEventListener("DOMContentLoaded", () => {
  const bootText = document.getElementById("bootText");
  if(bootText) typeBoot(bootText, bootLines);

  const rotator = document.getElementById("rotator");
  if(rotator) rotateWords(rotator, ["hecho a medida", "rápido y seguro", "que atrae clientes", "sin plantillas"]);

  codeRain(document.getElementById("rain"));

  // ===== MOBILE NAV =====
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  if(navToggle){
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open);
    });
  }
  document.querySelectorAll(".nav__links a").forEach(link =>
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle && navToggle.setAttribute("aria-expanded", "false");
    })
  );

  // ===== SCROLL PROGRESS =====
  const bar = document.getElementById("progress");
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if(bar && max > 0) bar.style.transform = `scaleX(${Math.min(scrollY / max, 1)})`;
  }, { passive: true });

  // ===== REVEAL ON SCROLL + COUNTERS =====
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    io.observe(el);
  });

  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      animateCounter(e.target);
      counterIO.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(el => counterIO.observe(el));

  // ===== ACTIVE NAV LINK =====
  const links = [...document.querySelectorAll(".nav__links a")];
  const sections = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => spy.observe(s));

  // ===== PRESELECT PLAN FROM CARDS =====
  const planSelect = document.getElementById("fieldPlan");
  document.querySelectorAll("[data-plan]").forEach(el =>
    el.addEventListener("click", () => {
      if(planSelect) planSelect.value = el.dataset.plan;
    })
  );

  // ===== CONTACT FORM -> WHATSAPP =====
  const form = document.getElementById("contactForm");
  const errorBox = document.getElementById("formError");
  if(form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("fieldName").value.trim();
      const message = document.getElementById("fieldMessage").value.trim();
      const plan = planSelect ? planSelect.value : "";

      if(!name || !message){
        if(errorBox) errorBox.hidden = false;
        return;
      }
      if(errorBox) errorBox.hidden = true;

      const planLine = plan ? ` Me interesa el paquete: ${plan}.` : "";
      const text = `Hola SNBR, soy ${name}.${planLine} ${message}`;
      // wa.link no reenvía ?text= (siempre cae a un mensaje fijo) — se usa el número directo.
      const whatsappUrl = `https://api.whatsapp.com/send?phone=595972906300&text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank", "noopener");
    });
  }

  // ===== EASTER EGG (para los curiosos que abren la consola) =====
  console.log("%c snbr.dev ", "background:#e3a63e;color:#1a1204;font-weight:bold;font-size:14px;padding:4px 8px;border-radius:3px");
  console.log("%cSi estás leyendo esto, hablamos el mismo idioma. → https://wa.link/q2kxcn", "color:#4fd1c5;font-family:monospace");
});
