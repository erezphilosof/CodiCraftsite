/* Codi's Weather Station JS Engine */

class CodiWeatherStation {
    constructor() {
        this.weatherAPI = "https://api.open-meteo.com/v1/forecast";
        this.geocodeAPI = "https://nominatim.openstreetmap.org/reverse"; // Free geocoding to get city name
        
        // Defaults (Tel Aviv coords)
        this.coords = {
            latitude: 32.0853,
            longitude: 34.7818,
            city: "תל אביב"
        };
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.cacheDOM();
            this.bindEvents();
            this.detectLocationAndLoadWeather();
        });
    }

    cacheDOM() {
        this.container = document.getElementById('weather-station-container');
        this.bubble = document.getElementById('weather-station-bubble');
        this.window = document.getElementById('weather-station-window');
        this.closeBtn = document.getElementById('weather-close-btn');
        
        this.tempBadge = this.bubble ? this.bubble.querySelector('.temp-badge') : null;
        this.iconEl = this.bubble ? this.bubble.querySelector('.weather-icon-wrapper') : null;
        
        this.cityEl = document.getElementById('weather-city');
        this.tempEl = document.getElementById('weather-temperature');
        this.conditionEl = document.getElementById('weather-condition');
        this.mascotEl = document.getElementById('weather-mascot');
        this.adviceEl = document.getElementById('weather-advice');
    }

    bindEvents() {
        if (this.bubble && this.window) {
            this.bubble.addEventListener('click', (e) => {
                e.stopPropagation();
                this.window.classList.toggle('hidden');
            });
        }

        if (this.closeBtn && this.window) {
            this.closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.window.classList.add('hidden');
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.window && !this.window.classList.contains('hidden') && !this.container.contains(e.target)) {
                this.window.classList.add('hidden');
            }
        });
    }

    detectLocationAndLoadWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    this.coords.latitude = position.coords.latitude;
                    this.coords.longitude = position.coords.longitude;
                    
                    // Get City Name via free openstreetmap reverse geocoding API
                    try {
                        const geoUrl = `${this.geocodeAPI}?format=json&lat=${this.coords.latitude}&lon=${this.coords.longitude}&accept-language=he`;
                        const res = await fetch(geoUrl, {
                            headers: {
                                "Accept-Language": "he"
                            }
                        });
                        const data = await res.json();
                        
                        // Extract city / town / village
                        const address = data.address;
                        const city = address.city || address.town || address.village || address.city_district || "מזג אוויר מקומי";
                        this.coords.city = city;
                    } catch (e) {
                        console.warn('Geocoding failed, using default name:', e);
                        this.coords.city = "מזג אוויר מקומי";
                    }
                    
                    this.fetchWeather();
                },
                (error) => {
                    console.warn('Geolocation blocked/failed, using default Tel Aviv weather:', error);
                    this.fetchWeather();
                }
            );
        } else {
            this.fetchWeather();
        }
    }

    async fetchWeather() {
        try {
            const url = `${this.weatherAPI}?latitude=${this.coords.latitude}&longitude=${this.coords.longitude}&current_weather=true`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data && data.current_weather) {
                this.updateWeatherUI(data.current_weather);
            }
        } catch (e) {
            console.error('Weather fetch failed:', e);
            if (this.conditionEl) {
                this.conditionEl.textContent = "שגיאה בטעינה";
            }
        }
    }

    updateWeatherUI(weather) {
        const temp = Math.round(weather.temperature);
        const code = weather.weathercode;
        
        // Update temp text
        if (this.tempEl) this.tempEl.textContent = `${temp}°C`;
        if (this.tempBadge) this.tempBadge.textContent = `${temp}°C`;
        if (this.cityEl) this.cityEl.textContent = this.coords.city;
        
        // Interpret WMO weather codes
        let icon = "☀️";
        let conditionText = "בהיר";
        let mascotImg = "assets/img/gallery/mascot_expr_confident.png"; // default
        let adviceText = "";

        if (code === 0) {
            icon = "☀️";
            conditionText = "בהיר ושמשי";
            mascotImg = "assets/img/gallery/mascot_expr_happy.png";
            adviceText = "השמש זורחת! ☀️ מזג אוויר נהדר. קחו הפסקה של 10 דקות מהמקלדת, צאו לשאוף אוויר צח בחוץ, ואז תחזרו לקודד!";
        } else if (code >= 1 && code <= 3) {
            icon = "⛅";
            conditionText = "מעונן חלקית";
            mascotImg = "assets/img/gallery/mascot_expr_thinking.png";
            adviceText = "קצת מעונן בחוץ היום ☁️. זמן מצוין לעשות סיעור מוחות, לפתור חידות היגיון ולשפר את חשיבת הסייבר שלכם!";
        } else if (code >= 45 && code <= 48) {
            icon = "🌫️";
            conditionText = "ערפילי";
            mascotImg = "assets/img/gallery/mascot_expr_thinking.png";
            adviceText = "ערפל בחוץ! 🌫️ זה הזמן המושלם ללמוד על אלגוריתמי ניווט וחיישנים ברובוטיקה.";
        } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
            icon = "🌧️";
            conditionText = "גשום";
            mascotImg = "assets/img/gallery/mascot_debugger.png";
            adviceText = "בחוץ גשום! 🌧️ מזג אוויר מושלם להישאר בבית, להכין שוקו חם ולכתוב קוד למשחק הבא שלכם!";
        } else if (code >= 71 && code <= 77) {
            icon = "❄️";
            conditionText = "שלג";
            mascotImg = "assets/img/gallery/mascot_expr_surprised.png";
            adviceText = "קפוא בחוץ! ❄️ מעגלים אלקטרוניים עובדים מעולה בקור, אבל אתם צריכים להתחמם עם משימת קוד מאתגרת!";
        } else if (code >= 95 && code <= 99) {
            icon = "⛈️";
            conditionText = "סופת רעמים";
            mascotImg = "assets/img/gallery/mascot_expr_excited.png";
            adviceText = "סופת רעמים מטורפת בחוץ! ⚡ רעמים וברקים הם השראה מצוינת לאפקטים מיוחדים (FX) במשחק שלכם!";
        } else {
            icon = "☁️";
            conditionText = "מעונן";
            mascotImg = "assets/img/gallery/mascot_expr_thinking.png";
            adviceText = "מעונן בחוץ. זמן מושלם לשדרג את העיצובים של הפרויקטים שלכם בגלריה!";
        }

        // Hot weather advice override
        if (temp > 30) {
            mascotImg = "assets/img/gallery/mascot_expr_wink.png";
            adviceText = "וואו, חם מאוד בחוץ היום! 🔥 אל תשכחו לשתות הרבה מים, לשבת מול המזגן ולשמור על ראש קריר מול המקלדת!";
        }

        // Apply to elements
        if (this.iconEl) this.iconEl.textContent = icon;
        if (this.conditionEl) this.conditionEl.textContent = `${conditionText} • ${icon}`;
        if (this.mascotEl) this.mascotEl.src = mascotImg;
        if (this.adviceEl) this.adviceEl.textContent = adviceText;
    }
}

// Instantiate
new CodiWeatherStation();
