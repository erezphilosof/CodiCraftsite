import anime from 'animejs'; import { switchToScrollMode, switchTo3DMode } from './scroll.js'; export class UI {
    constructor(onNextShape, onPrevShape) { this.prevBtn = document.getElementById('prev-btn'); this.nextBtn = document.getElementById('next-btn'); this.menuToggle = document.querySelector("#ui .menu"); this.initialTitleEl = document.getElementById('initial-title'); this.titleEl = document.getElementById('shape-title'); this.descEl = document.getElementById('shape-desc'); this.onNextShape = onNextShape; this.onPrevShape = onPrevShape; this.navLinks = document.querySelectorAll('nav a'); this.sections = document.querySelectorAll('section[id], div[data-dynamic-section]'); this.initListeners(); this.initNav(); this.initSentinels() }
    initSentinels() { const ui = document.getElementById('ui'); const hero = document.getElementById('hero'); if (!ui || !hero) return; this.stickySentinel = document.createElement('div'); this.stickySentinel.style.position = 'absolute'; this.stickySentinel.style.top = '0'; this.stickySentinel.style.left = '0'; this.stickySentinel.style.width = '1px'; this.stickySentinel.style.height = '100px'; this.stickySentinel.style.pointerEvents = 'none'; this.stickySentinel.style.opacity = '0'; document.body.appendChild(this.stickySentinel); this.homeSentinel = document.createElement('div'); this.homeSentinel.style.position = 'absolute'; this.homeSentinel.style.top = '0'; this.homeSentinel.style.left = '0'; this.homeSentinel.style.width = '1px'; this.homeSentinel.style.height = '300px'; this.homeSentinel.style.pointerEvents = 'none'; this.homeSentinel.style.opacity = '0'; document.body.appendChild(this.homeSentinel); const updateDimensions = () => { const heroRect = hero.getBoundingClientRect(); const uiRect = ui.getBoundingClientRect(); const limit = heroRect.height - uiRect.height - 100; this.stickySentinel.style.height = `${Math.max(10, limit)}px` }; updateDimensions(); window.addEventListener('resize', updateDimensions); const stickyObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (!entry.isIntersecting && entry.boundingClientRect.top < 0) { ui.classList.add('sticky') } else { ui.classList.remove('sticky') } }) }, { threshold: 0 }); stickyObserver.observe(this.stickySentinel); const homeObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { this.updateActiveNavLink('') } else { } }) }, { threshold: 0 }); homeObserver.observe(this.homeSentinel) }
    initListeners() {
        if (this.prevBtn) { this.prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onPrevShape() }) }
        if (this.nextBtn) { this.nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onNextShape() }) }
        if (this.menuToggle && !this.menuToggle.dataset.menuListenerAttached) { this.menuToggle.dataset.menuListenerAttached = "true"; this.menuToggle.addEventListener('click', (e) => { e.stopPropagation(); this.menuToggle.classList.toggle('active'); console.log('Menu Toggled') }) }
        const shapeSlider = document.getElementById('shape-slider'); if (shapeSlider) { shapeSlider.addEventListener('click', (e) => { e.stopPropagation() }) }
    }
    updateText(title, description) {
        const isH1Active = this.initialTitleEl && this.initialTitleEl.style.display !== 'none'; const activeTitle = isH1Active ? this.initialTitleEl : this.titleEl; const targets = [activeTitle, this.descEl]; anime({
            targets: targets, opacity: [1, 0], translateY: [0, -10], duration: 300, easing: 'easeInQuad', complete: () => {
                if (isH1Active) { this.initialTitleEl.style.display = 'none'; this.titleEl.style.display = 'block' }
                this.titleEl.innerText = title; this.descEl.innerText = description; anime({ targets: [this.titleEl, this.descEl], opacity: [0, 1], translateY: [10, 0], duration: 500, delay: anime.stagger(100), easing: 'easeOutQuad' })
            }
        })
    }
    setDisabled(isDisabled) { if (this.prevBtn) this.prevBtn.disabled = isDisabled; if (this.nextBtn) this.nextBtn.disabled = isDisabled; const slider = document.getElementById('shape-slider'); if (slider) { slider.style.opacity = isDisabled ? '0.5' : '1'; slider.style.pointerEvents = isDisabled ? 'none' : 'auto' } }
    initNav() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href'); if (href === '#') { e.preventDefault(); switchTo3DMode() } else if (href.startsWith('#') && href.length > 1) {
                    e.preventDefault(); switchToScrollMode(); const targetId = href.substring(1); let targetElement = document.getElementById(targetId); if (!targetElement) { const reverseMap = { 'servicios': 'services', 'clientes': 'clients', 'contacto': 'contact', 'learning-world': 'learning-world' }; if (reverseMap[targetId]) { targetElement = document.querySelector(`div[data-dynamic-section="${reverseMap[targetId]}"]`) || document.getElementById(targetId) } }
                    if (targetElement) { targetElement.scrollIntoView({ behavior: 'smooth' }) }
                }
                if (this.menuToggle && this.menuToggle.classList.contains('active')) { this.menuToggle.classList.remove('active') }
            })
        }); const observerOptions = { root: null, threshold: 0.15 }; const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (window.scrollY < 50) return; let id = entry.target.getAttribute('id'); if (!id && entry.target.hasAttribute('data-dynamic-section')) { const sectionName = entry.target.getAttribute('data-dynamic-section'); const map = { 'services': 'servicios', 'clients': 'clientes', 'contact': 'contacto' }; id = map[sectionName] }
                    if (id) { this.updateActiveNavLink(id) }
                }
            })
        }, observerOptions); this.sections.forEach(section => observer.observe(section));
        const sectionMutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.matches('section[id], #learning-world')) {
                            observer.observe(node);
                        }
                        node.querySelectorAll('section[id], #learning-world').forEach(el => observer.observe(el));
                    }
                });
            });
        });
        sectionMutationObserver.observe(document.body, { childList: true, subtree: true });
    }
    updateActiveNavLink(id) { this.navLinks.forEach(link => { const href = link.getAttribute('href'); if (href === '#' + id || (id === '' && href === '#')) { link.classList.add('active') } else { link.classList.remove('active') } }); if (id === 'servicios' || id === 'learning-world') { document.body.classList.add('view-services') } else { document.body.classList.remove('view-services') } }
}