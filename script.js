"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const intro = document.getElementById("marks-intro");
    const sections = Array.from(
        document.querySelectorAll("main section")
    );

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let introFinished = false;

    // =====================================
    // 1. ABERTURA CINEMATOGRÁFICA MARKS
    // =====================================

    document.body.classList.add("intro-playing");

    function finishIntro() {
        if (introFinished) return;

        introFinished = true;

        if (intro) {
            intro.remove();
        }

        document.body.classList.remove("intro-playing");
    }

    if (intro && !reduceMotion) {
        window.setTimeout(finishIntro, 3600);
    } else {
        finishIntro();
    }

    // =====================================
    // 2. ANIMAÇÃO DAS SEÇÕES
    // =====================================

    const revealSections = sections.filter(
        (section) => section.id !== "inicio"
    );

    revealSections.forEach((section) => {
        section.classList.add("reveal");
    });

    if ("IntersectionObserver" in window && !reduceMotion) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12
            }
        );

        revealSections.forEach((section) => {
            observer.observe(section);
        });
    } else {
        revealSections.forEach((section) => {
            section.classList.add("visible");
        });
    }

    // =====================================
    // 3. NAVEGAÇÃO PELA SETA PARA BAIXO
    // =====================================

    function getNextSection() {
        const threshold = 100;

        return sections.find((section) => {
            return section.getBoundingClientRect().top > threshold;
        });
    }

    function goToNextSection() {
        if (!introFinished) {
            finishIntro();
        }

        const nextSection = getNextSection();

        if (nextSection) {
            nextSection.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start"
            });
        } else {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: reduceMotion ? "auto" : "smooth"
            });
        }
    }

    document.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowDown") return;

        // Não interfere na digitação ou em combinações de teclas.
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

    // =====================================
    // 4. LINKS INTERNOS COM ROLAGEM SUAVE
    // =====================================

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            if (!introFinished) {
                finishIntro();
            }

            target.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start"
            });

            if (target.id) {
                history.replaceState(null, "", `#${target.id}`);
            }
        });
    });

    // =====================================
    // 5. INDICADOR DE ROLAGEM NO MENU
    // =====================================

    const navLinks = Array.from(
        document.querySelectorAll(".navigation a[href^='#']")
    );

    function updateActiveLink() {
        let currentSection = "";

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();

            if (
                rect.top <= window.innerHeight * 0.4 &&
                rect.bottom > window.innerHeight * 0.4
            ) {
                if (section.id) {
                    currentSection = section.id;
                }
            }
        });

        navLinks.forEach((link) => {
            const isActive =
                link.getAttribute("href") === `#${currentSection}`;

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    window.addEventListener("scroll", updateActiveLink, {
        passive: true
    });

    updateActiveLink();

    // =====================================
    // 6. ANO AUTOMÁTICO NO RODAPÉ
    // =====================================

    const footerCopyright = document.querySelector(".footer-bottom span");

    if (footerCopyright) {
        footerCopyright.textContent =
            `© ${new Date().getFullYear()} Agência MARKS. Todos os direitos reservados.`;
    }
});
