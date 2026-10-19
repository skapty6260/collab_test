/* =========================================================
   index.js — Dota 2 team homepage
   ========================================================= */

;(function () {
    'use strict'

    /* ---------- 1. Год в футере ---------- */
    const yearEl = document.getElementById('footerYear')
    if (yearEl) yearEl.textContent = new Date().getFullYear()

    /* ---------- 2. Переключатель темы + localStorage ---------- */
    const themeBtn = document.getElementById('themeBtn')
    const themeIcon = document.getElementById('themeIcon')
    const THEME_KEY = 'teamfive-theme'

    function applyTheme(theme) {
        const isLight = theme === 'light'
        document.body.classList.toggle('light', isLight)
        if (themeIcon) themeIcon.textContent = isLight ? '☀️' : '🌙'
    }

    // Восстанавливаем сохранённую тему, иначе — тёмная по умолчанию (Dota style)
    let savedTheme = 'dark'
    try {
        savedTheme = localStorage.getItem(THEME_KEY) || 'dark'
    } catch (e) {
        /* localStorage может быть недоступен — не падаем */
    }
    applyTheme(savedTheme)

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            const next = document.body.classList.contains('light')
                ? 'dark'
                : 'light'
            applyTheme(next)
            try {
                localStorage.setItem(THEME_KEY, next)
            } catch (e) {
                /* ignore */
            }
        })
    }

    /* ---------- 3. Плавный скролл по внутренним якорям ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const id = link.getAttribute('href')
            if (id.length < 2) return
            const target = document.querySelector(id)
            if (!target) return
            e.preventDefault()
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    })

    /* ---------- 4. Появление карточек при скролле ---------- */
    const cards = document.querySelectorAll('.player')
    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches

    if (!('IntersectionObserver' in window) || reducedMotion) {
        cards.forEach(function (c) {
            c.style.opacity = '1'
            c.style.transform = 'none'
        })
        return
    }

    // Стартовое состояние
    cards.forEach(function (card, i) {
        card.style.opacity = '0'
        card.style.transform = 'translateY(24px)'
        card.style.transition =
            'opacity .55s ease ' +
            i * 70 +
            'ms, transform .55s cubic-bezier(.2,.8,.2,1) ' +
            i * 70 +
            'ms'
    })

    const revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return
                entry.target.style.opacity = '1'
                entry.target.style.transform = 'translateY(0)'
                revealObserver.unobserve(entry.target)
            })
        },
        { threshold: 0.15 }
    )

    cards.forEach(function (c) {
        revealObserver.observe(c)
    })

    /* ---------- 5. 3D-наклон карточки под курсором ---------- */
    const canHover = window.matchMedia(
        '(hover: hover) and (pointer: fine)'
    ).matches

    if (canHover && !reducedMotion) {
        const MAX_TILT = 6

        cards.forEach(function (card) {
            const link = card.querySelector('.player__link')
            if (!link) return

            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width - 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5

                // ВАЖНО: применяем наклон к .player__link,
                // но translateY(-6px) уже в CSS на hover — используем matrix через transform с приоритетом
                link.style.transform =
                    'translateY(-6px) rotateX(' +
                    (-y * MAX_TILT).toFixed(2) +
                    'deg) rotateY(' +
                    (x * MAX_TILT).toFixed(2) +
                    'deg)'
            })

            card.addEventListener('mouseleave', function () {
                link.style.transform = ''
            })
        })
    }

    /* ---------- 6. Восстановление после bfcache ---------- */
    window.addEventListener('pageshow', function (event) {
        if (!event.persisted) return
        cards.forEach(function (c) {
            c.style.opacity = '1'
            c.style.transform = 'translateY(0)'
        })
    })

    /* ---------- 7. Мини-счётчик MMR в topbar ---------- */
    // Немного «жизни» в HUD: плавно досчитываем до значения из разметки.
    const mmrEl = document.querySelector('.topbar__mmr strong')
    if (mmrEl && !reducedMotion) {
        const target = parseInt(mmrEl.textContent.replace(/\s+/g, ''), 10)
        if (!isNaN(target)) {
            let current = 0
            const step = Math.max(1, Math.ceil(target / 60))
            const start = performance.now()
            const duration = 1200

            function tick(now) {
                const t = Math.min(1, (now - start) / duration)
                // ease-out cubic
                const eased = 1 - Math.pow(1 - t, 3)
                current = Math.round(target * eased)
                mmrEl.textContent = current.toLocaleString('ru-RU')
                if (t < 1) requestAnimationFrame(tick)
                else mmrEl.textContent = target.toLocaleString('ru-RU')
            }
            requestAnimationFrame(tick)
        }
    }
})()
