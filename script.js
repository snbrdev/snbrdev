// snbr.dev
// Todos los derechos reservados.

// ===== BOOT SEQUENCE (typewriter) =====
const bootLines = [
  "> initializing snbr.dev ...",
  "> loading modules: WEB_DEV, SOFTWARE ...",
  "> status: OPERATIVO",
  "> bienvenido."
];

function typeBoot(el, lines, lineDelay = 550, charDelay = 22){
  let lineIndex = 0;
  let charIndex = 0;
  let output = "";

  function typeChar(){
    if(lineIndex >= lines.length) return;
    const currentLine = lines[lineIndex];

    if(charIndex < currentLine.length){
      output += currentLine[charIndex];
      el.textContent = output;
      charIndex++;
      setTimeout(typeChar, charDelay);
    } else {
      output += "\n";
      lineIndex++;
      charIndex = 0;
      if(lineIndex < lines.length){
        setTimeout(typeChar, lineDelay);
      }
    }
  }
  typeChar();
}

document.addEventListener("DOMContentLoaded", () => {
  const bootText = document.getElementById("bootText");
  if(bootText){
    typeBoot(bootText, bootLines);
  }

  // ===== MOBILE NAV TOGGLE =====
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  if(navToggle){
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }

  // close mobile menu after clicking a link
  document.querySelectorAll(".nav__links a").forEach(link => {
    link.addEventListener("click", () => nav.classList.remove("is-open"));
  });

  // ===== CONTACT FORM -> WHATSAPP =====
  const form = document.getElementById("contactForm");
  if(form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("fieldName").value.trim();
      const message = document.getElementById("fieldMessage").value.trim();

      const text = `Hola SNBR, soy ${name}. ${message}`;
      const whatsappUrl = `https://wa.link/q2kxcn?text=${encodeURIComponent(text)}`;

      // wa.link no siempre soporta ?text= directo — fallback a wa.me si tenés el número.
      window.open(whatsappUrl, "_blank");
    });
  }
});
