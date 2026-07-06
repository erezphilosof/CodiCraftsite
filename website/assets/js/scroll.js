import anime from 'animejs'; const DISTANCE_THRESHOLD = 70; const SAFE_DISTANCE = 60; const UPDATE_INTERVAL = 33; let isCanvasActive = !0; let isResetting = !1; let lastTime = 0; let _camera, _controls, _canvas; let bar, glow; let isMobile = window.innerWidth < 768; export function switchToScrollMode() {
    if (!isCanvasActive) return; isCanvasActive = !1; if (_canvas) { _canvas.style.pointerEvents = 'none'; _canvas.style.touchAction = 'none' }
    document.documentElement.style.overflowY = 'auto'; document.body.style.overflowY = 'auto'; document.body.style.touchAction = 'auto'; updateZoomBar(100); setupScrollObservers()
}
export function switchTo3DMode() {
    if (isCanvasActive && !isResetting) return; isCanvasActive = !0; isResetting = !0; if (_canvas) { _canvas.style.pointerEvents = 'auto'; _canvas.style.touchAction = '' }
    document.documentElement.style.overflowY = 'hidden'; document.body.style.overflowY = 'hidden'; document.body.style.touchAction = ''; requestAnimationFrame(checkCamera); window.scrollTo({ top: 0, behavior: 'smooth' }); if (_controls && _camera) { const currentDist = _controls.getDistance(); if (currentDist >= DISTANCE_THRESHOLD) { const startPos = _camera.position.clone(); const targetPos = startPos.clone().setLength(SAFE_DISTANCE); anime({ targets: _camera.position, x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 800, easing: 'easeOutCubic', update: () => _controls.update(), complete: () => { isResetting = !1; updateZoomBar(0) } }) } else { isResetting = !1; updateZoomBar(0) } } else { isResetting = !1; updateZoomBar(0) }
}
function updateZoomBar(pct) { if (isMobile) return; if (!bar) bar = document.getElementById('zoom-progress-bar'); if (!glow) glow = document.getElementById('zoom-progress-glow'); let scaleVal = pct / 100; if (bar) bar.style.transform = `scaleY(${scaleVal})`; if (glow) glow.style.transform = `translateX(-50%) scaleY(${scaleVal})` }
function setupScrollObservers() {
    const observerCallback = (entries, obs) => {
        entries.forEach(entry => {
            if (entry.target.classList.contains('revealed')) return; if (entry.isIntersecting) {
                entry.target.classList.add('revealed'); if (entry.target.classList.contains('text-reveal')) { let delay = 0.1; let revealText = entry.target; if (revealText.querySelector('span')) return; let letters = revealText.textContent.split(""); revealText.textContent = ""; let middle = letters.filter(e => e !== " ").length / 2; letters.forEach((letter, i) => { let span = document.createElement("span"); span.textContent = letter; span.style.animationDelay = `${delay + Math.abs(i - middle) * 0.1}s`; revealText.append(span) }) }
                if (entry.target.classList.contains('values')) {
                    const speed = 10; const counter = entry.target; const animate_counter = () => { const value = +counter.getAttribute('years'); const data = +counter.innerText; const time = value / speed; if (data < value) { counter.innerText = Math.ceil(data + time); setTimeout(animate_counter, 150) } else { counter.innerText = value } }
                    animate_counter()
                }
                obs.unobserve(entry.target)
            }
        })
    }; const observer = new IntersectionObserver(observerCallback, { threshold: 0.1 }); const observeElements = (root) => {
        if (!root) return; if (root.nodeType === 1) { if (root.matches('.fade-in') || root.matches('.text-reveal') || root.matches('.values')) { observer.observe(root) } }
        if (root.querySelectorAll) { root.querySelectorAll('.fade-in, .text-reveal, .values').forEach(el => observer.observe(el)) }
    }; observeElements(document.body); const mutationObserver = new MutationObserver((mutations) => { mutations.forEach((mutation) => { mutation.addedNodes.forEach((node) => { observeElements(node) }) }) }); mutationObserver.observe(document.body, { childList: !0, subtree: !0 })
}
function checkCamera() { if (!_controls || !_camera) return; if (!isCanvasActive) return; requestAnimationFrame(checkCamera); const now = performance.now(); if (now - lastTime < UPDATE_INTERVAL) return; lastTime = now; const distance = _controls.getDistance(); const startD = 9; const endD = DISTANCE_THRESHOLD; let pct = Math.max(0, Math.min(100, ((distance - startD) / (endD - startD)) * 100)); updateZoomBar(pct); if (isCanvasActive && distance >= DISTANCE_THRESHOLD && !isResetting) { switchToScrollMode() } }
export function initScrollLogic(camera, controls, canvas) { _camera = camera; _controls = controls; _canvas = canvas; bar = document.getElementById('zoom-progress-bar'); glow = document.getElementById('zoom-progress-glow'); if (isMobile) { switchToScrollMode(); return; } document.body.style.overflowY = 'hidden'; checkCamera(); const topSentinel = document.createElement('div'); topSentinel.id = 'top-sentinel'; topSentinel.style.position = 'absolute'; topSentinel.style.top = '0'; topSentinel.style.left = '0'; topSentinel.style.width = '100%'; topSentinel.style.height = '20px'; topSentinel.style.pointerEvents = 'none'; topSentinel.style.opacity = '0'; document.body.appendChild(topSentinel); const scrollResetObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting && !isCanvasActive && !isResetting) { switchTo3DMode() } }) }, { threshold: 0 }); scrollResetObserver.observe(topSentinel) }