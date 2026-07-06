// CodiCraft Student Creators Gallery JS Logic - Pure Comics Only

document.addEventListener("DOMContentLoaded", () => {
    // Hide loading screen
    const loader = document.getElementById("loading");
    if (loader) loader.style.display = "none";

    // Navigation and menu toggle for all pages
    const menuBtn = document.querySelector(".menu.toggle");
    const navMenu = document.querySelector("nav[aria-label='First menu']");
    if (menuBtn && navMenu) {
        menuBtn.addEventListener("click", () => {
            menuBtn.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // Projects database (Grouped Collections - ONLY COMICS)
    const projects = [
        {
            id: 1,
            title: "קומיקס: נארוטו - המשימה המסתורית",
            author: "דניאל ויובל (גיל 11)",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_naruto.jpg"
            ],
            tags: ["מנגה", "נארוטו", "רנדרינג מתקדם", "אפקטים"],
            link: "https://codicraft.es/projects/naruto"
        },
        {
            id: 3,
            title: "קומיקס: הרפתקת הבובות של מיקה, דובי ולולי",
            author: "עדי בת 9",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_dolls_1.jpg",
                "assets/img/gallery/kids_comic_dolls_2.jpg",
                "assets/img/gallery/kids_comic_dolls_3.jpg",
                "assets/img/gallery/kids_comic_dolls_4.jpg"
            ],
            tags: ["הרפתקת בובות", "שידור מסרים", "דיאלוג דינמי"],
            link: "https://codicraft.es/projects/dolls-adventure"
        },
        {
            id: 5,
            title: "קומיקס: קפטן חיוך מציל את היום",
            author: "נדב בן 10",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_captain_smile.jpg"
            ],
            tags: ["גיבורי על", "טוב לב", "מניעת אלימות", "חינוכי"],
            link: "https://codicraft.es/projects/captain-smile"
        },
        {
            id: 6,
            title: "קומיקס: פיקאצ'ו וראיצ'ו - החיבוק הגדול",
            author: "אופיר בת 8",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_pikachu_raichu.jpg"
            ],
            tags: ["פוקימון", "חברות", "אנימציה רנדומלית"],
            link: "https://codicraft.es/projects/pikachu-raichu"
        },
        {
            id: 8,
            title: "קומיקס: עלילות פלאפל החתול",
            author: "גיא בן 10",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_falafel_1.jpg",
                "assets/img/gallery/kids_comic_falafel_2.jpg",
                "assets/img/gallery/kids_comic_falafel_3.jpg",
                "assets/img/gallery/kids_comic_falafel_4.jpg",
                "assets/img/gallery/kids_comic_falafel_5.jpg",
                "assets/img/gallery/kids_comic_falafel_6.png"
            ],
            tags: ["Scratch", "שידור מסרים", "משתני שיחה", "איור דיגיטלי"],
            link: "https://codicraft.es/projects/falafel-cat"
        },
        {
            id: 9,
            title: "קומיקס: המסע של סטיב במיינקראפט",
            author: "תום בן 11",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_steve_ch1.jpg",
                "assets/img/gallery/kids_comic_steve_ch2.jpg",
                "assets/img/gallery/kids_comic_steve_ch3.jpg",
                "assets/img/gallery/kids_comic_steve_nether.jpg",
                "assets/img/gallery/kids_comic_steve_ender.jpg"
            ],
            tags: ["מיינקראפט קוד", "רדסטון", "לוגיקת תנועה", "זוויות מצלמה"],
            link: "https://codicraft.es/projects/steve-minecraft"
        },
        {
            id: 10,
            title: "קומיקס: טנדר פלאש - גיבור העל",
            author: "אלון בן 11",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_thunder_flash_1.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_2.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_3.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_4.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_5.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_6.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_7.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_8.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_9.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_10.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_11.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_part1.jpg",
                "assets/img/gallery/kids_comic_thunder_flash_part2.jpg"
            ],
            tags: ["תסריט דיגיטלי", "אפקטים מיוחדים", "ניהול משתנים", "אנימציה"],
            link: "https://codicraft.es/projects/thunder-flash"
        },
        {
            id: 11,
            title: "קומיקס: הרפתקאות רובל",
            author: "מאור בן 10",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_rubel_ch1.jpg",
                "assets/img/gallery/kids_comic_rubel_ch2.jpg",
                "assets/img/gallery/kids_comic_rubel_ch3.jpg",
                "assets/img/gallery/kids_comic_rubel_ch4.jpg",
                "assets/img/gallery/kids_comic_rubel_ch5.jpg",
                "assets/img/gallery/kids_comic_rubel_ch6.jpg",
                "assets/img/gallery/kids_comic_rubel_ch7.jpg"
            ],
            tags: ["חידות היגיון", "אלגוריתמיקה", "מעבר שלבים", "לוגיקה"],
            link: "https://codicraft.es/projects/rubel-journey"
        },
        {
            id: 12,
            title: "קומיקס: הרפתקאות סילבה במגרש",
            author: "רועי בן 11",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_silva_derby.jpg",
                "assets/img/gallery/kids_comic_silva_champions_league.jpg",
                "assets/img/gallery/kids_comic_silva_beitar_ch1.jpg",
                "assets/img/gallery/kids_comic_silva_beitar_ch2.jpg",
                "assets/img/gallery/kids_comic_silva_beitar_ch3.jpg",
                "assets/img/gallery/kids_comic_silva_ba_ch1.jpg",
                "assets/img/gallery/kids_comic_silva_ba_ch2.jpg",
                "assets/img/gallery/kids_comic_silva_real_loyalty.jpg"
            ],
            tags: ["משחקוני ספורט", "עיצוב עלילה", "תכנות תגובה", "לוגיקה"],
            link: "https://codicraft.es/projects/silva-football"
        },
        {
            id: 13,
            title: "קומיקס: קייטי החתולה",
            author: "שירה בת 9",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_katy_cat_p1.jpg",
                "assets/img/gallery/kids_comic_katy_cat_p2.jpg",
                "assets/img/gallery/kids_comic_katy_cat_p3.jpg",
                "assets/img/gallery/kids_comic_katy_cat_p4.jpg"
            ],
            tags: ["Scratch Jr", "מנוע קול ודיבור", "פתרון בעיות", "עיצוב דמות"],
            link: "https://codicraft.es/projects/katy-cat-adventures"
        },
        {
            id: 14,
            title: "קומיקס: סוניק ושדאו",
            author: "דני בן 10",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_sonic_shadow_cover.jpg",
                "assets/img/gallery/kids_comic_sonic_shadow_ch2.jpg",
                "assets/img/gallery/kids_comic_sonic_shadow_ch3.jpg"
            ],
            tags: ["זיהוי מקשים", "לולאת מהירות", "מרוץ דינמי"],
            link: "https://codicraft.es/projects/sonic-shadow"
        },
        {
            id: 15,
            title: "קומיקס: ליגת גיבורי העל",
            author: "נעמי וליאור (גילאי 10-11)",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_spiderman_noga.jpg",
                "assets/img/gallery/kids_comic_spiderman_sky.jpg",
                "assets/img/gallery/kids_comic_blue_hero.jpg",
                "assets/img/gallery/kids_comic_invisibility_counter.jpg"
            ],
            tags: ["גיבורי על", "אלגוריתם זיהוי", "לוגיקת הסוואה"],
            link: "https://codicraft.es/projects/superheroes-league"
        },
        {
            id: 16,
            title: "קומיקס: מקווין והפנתר",
            author: "יונתן בן 11",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_mcqueen_tiger_cover.jpg",
                "assets/img/gallery/kids_comic_mcqueen_tiger_p1.jpg",
                "assets/img/gallery/kids_comic_mcqueen_tiger_p2.jpg",
                "assets/img/gallery/kids_comic_panther_mcqueen_cover.jpg",
                "assets/img/gallery/kids_comic_panther_mcqueen_p2.jpg",
                "assets/img/gallery/kids_comic_panther_mcqueen_p5.jpg",
                "assets/img/gallery/kids_comic_panther_mcqueen_p7.jpg",
                "assets/img/gallery/kids_comic_panther_mcqueen_p8.jpg"
            ],
            tags: ["בלשות קוד", "לולאת מרוץ", "זמני תגובה", "תכנות תסריט"],
            link: "https://codicraft.es/projects/mcqueen-panther"
        },
        {
            id: 18,
            title: "קומיקס: עלילות דידי וטונג",
            author: "מאיה ודניאל (גילאי 9-10)",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_didi.jpg",
                "assets/img/gallery/kids_comic_tung_tung.jpg"
            ],
            tags: ["פרק יחיד", "מעברי סאונד", "כניסות דינמיות"],
            link: "https://codicraft.es/projects/didi-tung"
        },

        {
            id: 19,
            title: "קומיקס חדש (מהקובץ המכווץ)",
            author: "תלמידי קודיקראפט",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_new_zip_1.png",
                "assets/img/gallery/kids_comic_new_zip_2.png",
                "assets/img/gallery/kids_comic_new_zip_3.png",
                "assets/img/gallery/kids_comic_new_zip_4.png"
            ],
            tags: [],
            link: "https://codicraft.es/projects/collection-19"
        },

        {
            id: 20,
            title: "הקומיקס של יהלי",
            author: "יהלי",
            category: "comics",
            categoryName: "📚 קומיקס דיגיטלי",
            images: [
                "assets/img/gallery/kids_comic_yahli_1.jpeg",
                "assets/img/gallery/kids_comic_yahli_2.jpeg",
                "assets/img/gallery/kids_comic_yahli_3.jpeg",
                "assets/img/gallery/kids_comic_yahli_4.jpeg",
                "assets/img/gallery/kids_comic_yahli_5.jpeg",
                "assets/img/gallery/kids_comic_yahli_6.jpeg",
                "assets/img/gallery/kids_comic_yahli_7.jpeg",
                "assets/img/gallery/kids_comic_yahli_8.jpeg",
                "assets/img/gallery/kids_comic_yahli_9.jpeg",
                "assets/img/gallery/kids_comic_yahli_10.jpeg",
                "assets/img/gallery/kids_comic_yahli_11.jpeg",
                "assets/img/gallery/kids_comic_yahli_12.jpeg",
                "assets/img/gallery/kids_comic_yahli_13.jpeg",
                "assets/img/gallery/kids_comic_yahli_14.jpeg",
                "assets/img/gallery/kids_comic_yahli_15.jpeg",
                "assets/img/gallery/kids_comic_yahli_16.jpeg",
                "assets/img/gallery/kids_comic_yahli_17.jpeg",
                "assets/img/gallery/kids_comic_yahli_18.jpeg"
            ],
            tags: [],
            link: "https://codicraft.es/projects/collection-20"
        },
        {
            id: 21,
            title: "משחק: ברנבי - עדכון החנות האלוהי (SHOP UPDATE GODLY)",
            author: "תלמידי קודיקראפט",
            category: "games",
            categoryName: "🎮 משחקי קודיקראפט",
            images: [
                "assets/img/gallery/game_barnaby_shop.png"
            ],
            tags: ["מנוע משחק", "ברנבי", "עדכון חנות", "JS Game"],
            link: "barnaby.html"
        },
        {
            id: 22,
            title: "משחק: פלטפורמר מודרני - שדרוגי כוח (POWERUPS)",
            author: "תלמידי קודיקראפט",
            category: "games",
            categoryName: "🎮 משחקי קודיקראפט",
            images: [
                "assets/img/gallery/game_platformer_powerups.png"
            ],
            tags: ["פלטפורמר", "שדרוגי כוח", "פיזיקה", "JS Game"],
            link: "modern_platformer.html"
        },
        {
            id: 23,
            title: "משחק: מיני מריו - קפיצת חלל (SPACE JUMP)",
            author: "תלמידי קודיקראפט",
            category: "games",
            categoryName: "🎮 משחקי קודיקראפט",
            images: [
                "assets/img/gallery/game_mario_space_jump.png"
            ],
            tags: ["קפיצה", "מריו", "חלל", "JS Game"],
            link: "mini_mario.html"
        }
    ];

    const grid = document.getElementById("gallery-grid");
    const filters = document.querySelectorAll(".filter-btn");
    
    // Modal elements
    const modal = document.getElementById("project-modal");
    const modalClose = document.getElementById("modal-close");
    const modalImage = document.getElementById("modal-image");
    const modalCategory = document.getElementById("modal-category");
    const modalTitle = document.getElementById("modal-title");
    const modalAuthor = document.getElementById("modal-author");
    const modalTags = document.getElementById("modal-tags");
    const qrImg = document.getElementById("share-qr-img");
    const playContainer = document.getElementById("modal-play-container");
    
    // Carousel controls
    const carouselPrev = document.getElementById("carousel-prev");
    const carouselNext = document.getElementById("carousel-next");
    const carouselCounter = document.getElementById("carousel-counter");
    const thumbnailsContainer = document.getElementById("modal-thumbnails");

    // Modal state
    let activeProject = null;
    let currentImageIndex = 0;

    // Populate gallery grid without description
    function renderGallery(filterVal = "all") {
        if (!grid) return;
        grid.innerHTML = "";

        const filtered = filterVal === "all" ? projects : projects.filter(p => p.category === filterVal);

        filtered.forEach(p => {
            const card = document.createElement("div");
            card.className = "project-card";
            card.setAttribute("data-id", p.id);
            
            // Format item count label (HEBREW)
            const countLabel = p.category === 'games' ? 'משחק פעיל 🎮' : `${p.images.length} עמודים 📖`;

            card.innerHTML = `
                <div class="card-img-container">
                    <img loading="lazy" src="${p.images[0]}" alt="${p.title}">
                    <span class="card-category-badge">${p.categoryName}</span>
                    <span class="card-item-count">${countLabel}</span>
                </div>
                <div class="card-content">
                    <h3>${p.title}</h3>
                    <div class="card-tags" style="margin-top: auto;">
                        ${p.tags.map(t => `<span>#${t}</span>`).join("")}
                    </div>
                </div>
            `;
            
            // Open modal on click
            card.addEventListener("click", () => openProjectModal(p));
            grid.appendChild(card);
        });
    }

    // Filter switching
    filters.forEach(btn => {
        btn.addEventListener("click", () => {
            filters.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderGallery(btn.getAttribute("data-filter"));
        });
    });

    // Modal opening & state init
    function openProjectModal(p) {
        if (!modal) return;
        activeProject = p;
        currentImageIndex = 0;

        modalCategory.textContent = p.categoryName;
        modalTitle.textContent = p.title;
        modalAuthor.textContent = "";
        
        // Populate play button container (only show play button for actual playable game links)
        if (playContainer) {
            playContainer.innerHTML = "";
            if (p.link && p.link.endsWith(".html")) {
                const playBtn = document.createElement("a");
                playBtn.href = p.link;
                playBtn.target = "_blank";
                playBtn.className = "play-game-btn";
                playBtn.innerHTML = `<span>🎮</span> שחקו במשחק במסך מלא!`;
                playContainer.appendChild(playBtn);
            }
        }
        
        // Populate tags
        modalTags.innerHTML = p.tags.map(t => `<span>${t}</span>`).join("");
        
        // Generate QR code (if link is relative, make it absolute for QR scanning)
        const qrLink = p.link.startsWith("http") ? p.link : window.location.origin + "/" + p.link;
        generateQR(qrLink);
        
        // Handle Game vs Comic view
        const carouselWrap = document.getElementById("modal-carousel-wrapper");
        const arcadeWrap = document.getElementById("modal-arcade-cabinet");
        const arcadeIframe = document.getElementById("arcade-iframe");

        if (p.category === "games") {
            if (carouselWrap) carouselWrap.style.display = "none";
            if (arcadeWrap) arcadeWrap.style.display = "flex";
            if (arcadeIframe) arcadeIframe.src = p.link;
            
            // Hide thumbnails list section
            const thumbSection = document.getElementById("modal-thumbnail-section");
            if (thumbSection) thumbSection.style.display = "none";
            
            if (carouselCounter) carouselCounter.style.display = "none";
        } else {
            if (carouselWrap) carouselWrap.style.display = "flex";
            if (arcadeWrap) arcadeWrap.style.display = "none";
            if (arcadeIframe) arcadeIframe.src = "";
            
            if (carouselCounter) carouselCounter.style.display = "block";
            
            // Update carousel views
            updateCarousel();
        }
        
        // Show modal
        modal.classList.add("active");
    }

    // Update carousel views based on currentImageIndex
    function updateCarousel() {
        if (!activeProject) return;
        
        const imgs = activeProject.images;
        const count = imgs.length;

        // Set image source
        modalImage.src = imgs[currentImageIndex];

        // Format counter (HEBREW)
        const typeLabel = "עמוד";
        carouselCounter.textContent = `${typeLabel} ${currentImageIndex + 1} מתוך ${count}`;

        // Show or hide arrows depending on image count
        if (count <= 1) {
            carouselPrev.style.display = "none";
            carouselNext.style.display = "none";
        } else {
            carouselPrev.style.display = "flex";
            carouselNext.style.display = "flex";
        }

        // Render thumbnails
        renderThumbnails();
    }

    // Generate thumbnails list track
    function renderThumbnails() {
        if (!thumbnailsContainer || !activeProject) return;
        thumbnailsContainer.innerHTML = "";

        const imgs = activeProject.images;
        
        // Hide thumbnails container if only 1 image exists to reduce clutter
        const thumbSection = document.getElementById("modal-thumbnail-section");
        if (imgs.length <= 1) {
            if (thumbSection) thumbSection.style.display = "none";
            return;
        } else {
            if (thumbSection) thumbSection.style.display = "block";
        }

        imgs.forEach((imgSrc, index) => {
            const item = document.createElement("div");
            item.className = `thumbnail-item ${index === currentImageIndex ? "active" : ""}`;
            item.innerHTML = `<img src="${imgSrc}" alt="Page ${index + 1}">`;
            
            item.addEventListener("click", () => {
                currentImageIndex = index;
                updateCarousel();
            });

            thumbnailsContainer.appendChild(item);
        });

        // Center scroll active thumbnail
        const activeThumb = thumbnailsContainer.children[currentImageIndex];
        if (activeThumb) {
            thumbnailsContainer.scrollTo({
                left: activeThumb.offsetLeft - (thumbnailsContainer.clientWidth / 2) + (activeThumb.clientWidth / 2),
                behavior: 'smooth'
            });
        }
    }

    // Arrow controls listeners
    if (carouselPrev) {
        carouselPrev.addEventListener("click", () => {
            if (!activeProject) return;
            const count = activeProject.images.length;
            currentImageIndex = (currentImageIndex - 1 + count) % count;
            updateCarousel();
        });
    }

    if (carouselNext) {
        carouselNext.addEventListener("click", () => {
            if (!activeProject) return;
            const count = activeProject.images.length;
            currentImageIndex = (currentImageIndex + 1) % count;
            updateCarousel();
        });
    }

    // Keyboard support inside modal
    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("active") || !activeProject) return;

        if (e.key === "ArrowLeft") {
            // For RTL layout: Left arrow goes to NEXT page/card
            carouselNext.click();
        } else if (e.key === "ArrowRight") {
            // For RTL layout: Right arrow goes to PREVIOUS page/card
            carouselPrev.click();
        } else if (e.key === "Escape") {
            closeModal();
        }
    });

    function closeModal() {
        if (modal) modal.classList.remove("active");
        const iframe = document.getElementById("arcade-iframe");
        if (iframe) iframe.src = ""; // Stop Scratch audio
        activeProject = null;
    }

    if (modalClose) {
        modalClose.addEventListener("click", closeModal);
    }

    // Close on overlay click
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Arcade Cabinet Buttons Event Listeners
    const btnRestart = document.getElementById("arcade-btn-restart");
    const btnFullscreen = document.getElementById("arcade-btn-fullscreen");
    const btnScratchLink = document.getElementById("arcade-btn-scratch");
    const arcadeIframe = document.getElementById("arcade-iframe");

    if (btnRestart && arcadeIframe) {
        btnRestart.addEventListener("click", () => {
            const src = arcadeIframe.src;
            arcadeIframe.src = "";
            setTimeout(() => { arcadeIframe.src = src; }, 50);
        });
    }

    if (btnFullscreen && arcadeIframe) {
        btnFullscreen.addEventListener("click", () => {
            if (arcadeIframe.requestFullscreen) {
                arcadeIframe.requestFullscreen();
            } else if (arcadeIframe.webkitRequestFullscreen) {
                arcadeIframe.webkitRequestFullscreen();
            } else if (arcadeIframe.msRequestFullscreen) {
                arcadeIframe.msRequestFullscreen();
            }
        });
    }

    if (btnScratchLink) {
        btnScratchLink.addEventListener("click", () => {
            if (activeProject && activeProject.link) {
                const scratchPage = activeProject.link.replace("/embed", "");
                window.open(scratchPage, "_blank");
            }
        });
    }

    // Real Scannable QR Code via free API (qrserver.com)
    function generateQR(text) {
        if (!qrImg) return;
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
    }

    // Initial render
    renderGallery();
});
