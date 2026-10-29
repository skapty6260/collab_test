/* matches.js — фильтрация матчей по результату */
;(function () {
    const list = document.getElementById('matchList')
    if (!list) return

    const buttons = document.querySelectorAll('.filters__btn')
    const matches = list.querySelectorAll('.match')

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            buttons.forEach((b) => b.classList.remove('filters__btn--active'))
            btn.classList.add('filters__btn--active')

            const filter = btn.dataset.filter

            matches.forEach((match) => {
                const show = filter === 'all' || match.dataset.result === filter
                match.classList.toggle('is-hidden', !show)
            })
        })
    })
})()
