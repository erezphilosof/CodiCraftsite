export class DynamicLoader {
    constructor() { this.observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { this.loadSection(entry.target); this.observer.unobserve(entry.target) } }) }, { rootMargin: '200px' }); this.init() }
    init() { document.querySelectorAll('[data-dynamic-section]').forEach(el => { this.observer.observe(el) }) }
    async loadSection(placeholder) { const sectionName = placeholder.dataset.dynamicSection; const lang = document.documentElement.lang || 'es'; const baseUrl = window.BASE_URL || '/'; try { const response = await fetch(`${baseUrl}components/${sectionName}.html?v=${new Date().getTime()}`); if (!response.ok) throw new Error(`Failed to load ${sectionName}`); const html = await response.text(); const tempDiv = document.createElement('div'); tempDiv.innerHTML = html; placeholder.innerHTML = html; placeholder.classList.add('loaded'); this.loadCSS(`${baseUrl}assets/css/${sectionName}.css?v=${new Date().getTime()}`); const jsPath = `${baseUrl}assets/js/${sectionName}.js`; try { const module = await import(`${jsPath}?v=${new Date().getTime()}`); const initFuncName = `init${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`; if (typeof module[initFuncName] === 'function') { module[initFuncName]() } else { console.warn(`No init function '${initFuncName}' found in ${jsPath}`) } } catch (jsError) { console.warn(`Could not load JS for ${sectionName}:`, jsError) } } catch (error) { console.error(error); placeholder.innerHTML = `<p class="error">Error loading content.</p>` } }
    loadCSS(href) {
        const basePath = href.split('?')[0];
        if (!document.querySelector(`link[href^="${basePath}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link)
        }
    }
}