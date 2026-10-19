/* =========================================================
   profile.js — общая логика страницы игрока (fixed)
   ========================================================= */

;(function () {
    'use strict'

    /* ---------- Утилита: безопасный querySelector ---------- */
    const $ = (sel, root) => (root || document).querySelector(sel)

    /* ---------- 1. Год ---------- */
    const yearEl = $('#footerYear')
    if (yearEl) yearEl.textContent = new Date().getFullYear()

    /* ---------- 2. Тема + localStorage ---------- */
    const themeBtn = $('#themeBtn')
    const themeIcon = $('#themeIcon')
    const THEME_KEY = 'teamfive-theme'

    function applyTheme(theme) {
        const isLight = theme === 'light'
        document.body.classList.toggle('light', isLight)
        if (themeIcon) themeIcon.textContent = isLight ? '☀️' : '🌙'
    }

    let saved = 'dark'
    try {
        saved = localStorage.getItem(THEME_KEY) || 'dark'
    } catch (e) {}
    applyTheme(saved)

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            const next = document.body.classList.contains('light')
                ? 'dark'
                : 'light'
            applyTheme(next)
            try {
                localStorage.setItem(THEME_KEY, next)
            } catch (e) {}
        })
    }

    /* ---------- 3. Плавный скролл по якорям ---------- */
    // ВАЖНО: не блокируем стандартное поведение, если элемент не найден
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const href = link.getAttribute('href')
            if (!href || href === '#') return
            const target = document.querySelector(href)
            if (!target) return // пусть работает как обычный якорь
            e.preventDefault()
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            // Обновим подсветку активной ссылки вручную
            document.querySelectorAll('.header__link').forEach(function (l) {
                l.classList.remove('header__link--active')
            })
            link.classList.add('header__link--active')
        })
    })

    /* ---------- 4. Анимированные счётчики ---------- */
    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches
    const counters = document.querySelectorAll('[data-counter]')

    function runCounter(el) {
        const target = parseInt(el.dataset.counter, 10)
        if (isNaN(target)) return
        const duration = 1200
        const start = performance.now()
        function tick(now) {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            el.textContent = Math.round(target * eased).toLocaleString('ru-RU')
            if (t < 1) requestAnimationFrame(tick)
            else el.textContent = target.toLocaleString('ru-RU')
        }
        requestAnimationFrame(tick)
    }

    if (reducedMotion || !('IntersectionObserver' in window)) {
        counters.forEach(function (c) {
            c.textContent = c.dataset.counter
        })
    } else {
        const counterObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return
                    runCounter(entry.target)
                    counterObserver.unobserve(entry.target)
                })
            },
            { threshold: 0.4 }
        )
        counters.forEach(function (c) {
            counterObserver.observe(c)
        })
    }

    /* ---------- 5. Данные игрока ---------- */
    const player = window.PLAYER || {}
    console.log('[profile] PLAYER loaded:', player) // ← проверка в консоли

    /* ---------- 6. Рендер героев ---------- */
    const heroesList = document.getElementById('heroesList')
    if (heroesList && Array.isArray(player.heroes) && player.heroes.length) {
        heroesList.innerHTML = player.heroes
            .map(function (hero) {
                return (
                    '<li class="hero-card">' +
                    '<div class="hero-card__top">' +
                    '<span class="hero-card__name">' +
                    hero.name +
                    '</span>' +
                    '<span class="hero-card__winrate">' +
                    hero.winrate +
                    '%</span>' +
                    '</div>' +
                    '<span class="hero-card__role">' +
                    hero.role +
                    '</span>' +
                    '<div class="hero-card__bar"><div class="hero-card__bar-fill" data-w="' +
                    hero.winrate +
                    '"></div></div>' +
                    '<span class="hero-card__games">' +
                    hero.games +
                    ' игр · ' +
                    hero.kda +
                    ' KDA</span>' +
                    '</li>'
                )
            })
            .join('')

        // Анимация полосок
        setTimeout(function () {
            heroesList
                .querySelectorAll('.hero-card__bar-fill')
                .forEach(function (bar) {
                    bar.style.width =
                        Math.min(100, parseInt(bar.dataset.w, 10)) + '%'
                })
        }, 100)
    } else {
        console.warn(
            '[profile] heroes not rendered. heroesList:',
            heroesList,
            'heroes:',
            player.heroes
        )
    }

    /* ---------- 7. Рендер матчей ---------- */
    const table = document.querySelector('.matches__table')
    if (table && Array.isArray(player.matches) && player.matches.length) {
        player.matches.forEach(function (m) {
            const row = document.createElement('div')
            row.className = 'matches__row'
            row.setAttribute('role', 'row')
            row.innerHTML =
                '<span class="matches__hero" role="cell">' +
                m.hero +
                '</span>' +
                '<span class="matches__result matches__result--' +
                (m.win ? 'win' : 'loss') +
                '" role="cell">' +
                (m.win ? 'Победа' : 'Поражение') +
                '</span>' +
                '<span role="cell">' +
                m.kda +
                '</span>' +
                '<span role="cell">' +
                m.duration +
                '</span>'
            table.appendChild(row)
        })
    } else {
        console.warn(
            '[profile] matches not rendered. table:',
            table,
            'matches:',
            player.matches
        )
    }

    /* ---------- 8. Случайный факт ---------- */
    const factBtn = document.getElementById('factBtn')
    const factOut = document.getElementById('factOutput')

    if (
        factBtn &&
        factOut &&
        Array.isArray(player.facts) &&
        player.facts.length
    ) {
        const storageKey = 'teamfive-facts-' + (player.nick || 'player')
        let shown = 0
        try {
            shown = parseInt(localStorage.getItem(storageKey) || '0', 10)
        } catch (e) {}

        let lastIndex = -1

        factBtn.addEventListener('click', function () {
            let idx = Math.floor(Math.random() * player.facts.length)
            if (player.facts.length > 1 && idx === lastIndex) {
                idx = (idx + 1) % player.facts.length
            }
            lastIndex = idx

            factOut.textContent = player.facts[idx]
            factOut.classList.add('is-active')

            shown += 1
            try {
                localStorage.setItem(storageKey, String(shown))
            } catch (e) {}
        })
    } else {
        console.warn(
            '[profile] fact button not wired. btn:',
            factBtn,
            'out:',
            factOut,
            'facts:',
            player.facts
        )
    }

    /* ---------- 9. Появление секций ---------- */
    if (!reducedMotion && 'IntersectionObserver' in window) {
        const sections = document.querySelectorAll(
            '.stats, .heroes, .matches, .profile__side, .profile__main'
        )
        sections.forEach(function (el) {
            el.style.opacity = '0'
            el.style.transform = 'translateY(20px)'
            el.style.transition =
                'opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1)'
        })

        const secObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return
                    entry.target.style.opacity = '1'
                    entry.target.style.transform = 'translateY(0)'
                    secObserver.unobserve(entry.target)
                })
            },
            { threshold: 0.12 }
        )

        sections.forEach(function (el) {
            secObserver.observe(el)
        })
    }
})()
