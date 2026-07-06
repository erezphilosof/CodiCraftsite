export function initReveal() {
    const observerCallback = (entries, obs) => {
        entries.forEach(entry => {
            if (entry.target.classList.contains('revealed')) return;
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                if (entry.target.classList.contains('text-reveal')) {
                    let delay = 0.1;
                    let revealText = entry.target;
                    if (revealText.querySelector('span')) return;
                    let letters = revealText.textContent.split("");
                    revealText.textContent = "";
                    let middle = letters.filter(e => e !== " ").length / 2;
                    letters.forEach((letter, i) => {
                        let span = document.createElement("span");
                        if (letter === " ") {
                            span.innerHTML = "&nbsp;";
                        } else {
                            span.textContent = letter;
                        }
                        span.style.animationDelay = `${delay + Math.abs(i - middle) * 0.1}s`;
                        revealText.append(span);
                    });
                }
                if (entry.target.classList.contains('values')) {
                    const speed = 10;
                    const counter = entry.target;
                    const animate_counter = () => {
                        const value = +counter.getAttribute('years');
                        const data = +counter.innerText;
                        const time = value / speed;
                        if (data < value) {
                            counter.innerText = Math.ceil(data + time);
                            setTimeout(animate_counter, 150);
                        } else {
                            counter.innerText = value;
                        }
                    };
                    animate_counter();
                }
                obs.unobserve(entry.target);
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback, { threshold: 0.1 });
    const observeElements = (root) => {
        if (!root) return;
        if (root.nodeType === 1) {
            if (root.matches('.fade-in') || root.matches('.text-reveal') || root.matches('.values')) {
                observer.observe(root);
            }
        }
        if (root.querySelectorAll) {
            root.querySelectorAll('.fade-in, .text-reveal, .values').forEach(el => observer.observe(el));
        }
    };
    observeElements(document.body);
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutations) => {
            mutations.addedNodes.forEach((node) => {
                observeElements(node);
            });
        });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
}
