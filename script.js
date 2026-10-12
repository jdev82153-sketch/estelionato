"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const site = document.querySelector(".site-shell");
  const sections = Array.from(
    document.querySelectorAll("main .page-section")
  );

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let finished = false;
  let scrolling = false;

  // GARANTE QUE O SITE TENHA CONTEÚDO VISÍVEL
  document.body.classList.add("js-ready", "intro-playing");

  if (site) {
    site.style.visibility = "hidden";
    site.style.opacity = "0";
  }

  // ENCERRA A ABERTURA MARKS E MOSTRA O SITE
  function finishIntro() {
    if (finished) return;
    finished = true;

    if (intro) {
      intro.remove();
    }

    document.body.classList.remove("intro-playing");
    document.body.classList.add("intro-finished");

    if (site) {
      site.style.visibility = "visible";
      site.style.opacity = "1";
      site.style.transform = "none";
    }

    document.body.style.overflowY = "auto";
    updateNavigation();
  }

  // A abertura dura 3 segundos
  if (intro && !reduceMotion) {
    window.setTimeout(finishIntro, 3000);
  } else {
    finishIntro();
  }

  // ANIMAÇÃO DAS SEÇÕES
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
      threshold: 0.05
    });

    revealSections.forEach(section => observer.observe(section));
  } else {
    revealSections.forEach(section => {
      section.classList.add("visible");
    });
  }

  // ENCONTRA A PRÓXIMA SEÇÃO
  function goToNextSection() {
    if (!finished) {
      finishIntro();
      return;
    }

    if (scrolling) return;

    const currentPosition = window.scrollY + 130;

    const nextSection = sections.find(section => {
      return section.offsetTop > currentPosition;
    });

    if (!nextSection) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: reduceMotion ? "auto" : "smooth"
      });
      return;
    }

    scrolling = true;

    nextSection.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });

    window.setTimeout(() => {
      scrolling = false;
    }, reduceMotion ? 100 : 900);
  }

  // BOTÃO DE DESCIDA
  document.querySelectorAll("[data-next]").forEach(button => {
    button.addEventListener("click", goToNextSection);
  });

  // SETA PARA BAIXO DO TECLADO
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

    const activeElement = document.activeElement;

    if (
      activeElement &&
      (
        activeElement.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          activeElement.tagName
        )
      )
    ) {
      return;
    }

    event.preventDefault();
    goToNextSection();
  });

  // LINKS INTERNOS DO SITE
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");
      const target = href ? document.querySelector(href) : null;

      if (!target) return;

      event.preventDefault();

      if (!finished) finishIntro();

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });

      if (target.id) {
        history.replaceState(null, "", `#${target.id}`);
      }
    });
  });

  // ATUALIZA O LINK ATIVO DO MENU
  const navLinks = Array.from(
    document.querySelectorAll(".navigation a[href^='#']")
  );

  function updateNavigation() {
    let activeId = "inicio";
    const marker = window.innerHeight * 0.35;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();

      if (
        rect.top <= marker &&
        rect.bottom > marker &&
        section.id
      ) {
        activeId = section.id;
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute("href") === `#${activeId}`) {
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

  // ANO AUTOMÁTICO
  const year = document.getElementById("year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
});
