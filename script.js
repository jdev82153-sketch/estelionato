"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const sections = Array.from(
    document.querySelectorAll("main .page-section")
  );
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  let introFinished = false;
  let scrollLocked = false;
  document.body.classList.add("js-ready", "intro-playing");
  // 1. FINALIZA A ABERTURA
  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    if (intro) {
      intro.remove();
    }
    document.body.classList.remove("intro-playing");
    document.body.classList.add("intro-finished");
    // Libera a animação de entrada do conteúdo.
    window.setTimeout(() => {
      document.body.classList.remove("intro-finished");
    }, 1000);
  }
  if (intro && !reduceMotion) {
    window.setTimeout(finishIntro, 3000);
  } else {
    finishIntro();
  }
  // 2. REVELA SEÇÕES AO ENTRAREM NA TELA
  const revealSections = sections.filter(
    section => section.id !== "inicio"
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08
    });
    revealSections.forEach(section => observer.observe(section));
  } else {
    revealSections.forEach(section => {
      section.classList.add("visible");
    });
  }
  // 3. NAVEGA PARA A PRÓXIMA SEÇÃO
  function goToNextSection() {
    if (!introFinished) {
      finishIntro();
      return;
    }
    if (scrollLocked) return;
    const position = window.scrollY + 120;
    const nextSection = sections.find(section => {
      return section.offsetTop > position;
    });
    if (!nextSection) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: reduceMotion ? "auto" : "smooth"
      });
      return;
    }
    scrollLocked = true;
    nextSection.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
    window.setTimeout(() => {
      scrollLocked = false;
    }, reduceMotion ? 50 : 800);
  }
  // 4. SETA NA TELA
  document.querySelectorAll("[data-next]").forEach(button => {
    button.addEventListener("click", goToNextSection);
  });
  // 5. SETA DO TECLADO
  document.addEventListener("keydown", event => {
    if (event.key !== "ArrowDown") return;
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }
    const active = document.activeElement;
    if (
      active &&
      (
        active.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(active.tagName)
      )
    ) {
      return;
    }
    event.preventDefault();
    goToNextSection();
  });
  // 6. LINKS DO MENU E DA PÁGINA
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const selector = link.getAttribute("href");
      const target = selector ? document.querySelector(selector) : null;
      if (!target) return;
      event.preventDefault();
      if (!introFinished) finishIntro();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
      if (target.id) {
        history.replaceState(null, "", `#${target.id}`);
      }
    });
  });
  // 7. DESTACA A SEÇÃO ATUAL NO MENU
  const navLinks = Array.from(
    document.querySelectorAll(".navigation a[href^='#']")
  );
  function updateNavigation() {
    const marker = window.innerHeight * 0.35;
    let currentId = "inicio";
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker && section.id) {
        currentId = section.id;
      }
    });
    navLinks.forEach(link => {
      const active = link.getAttribute("href") === `#${currentId}`;
      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }
  window.addEventListener("scroll", updateNavigation, {
    passive: true
  });
  updateNavigation();
  // 8. ANO ATUAL NO RODAPÉ
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
});
