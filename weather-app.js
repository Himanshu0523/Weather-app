
const API_KEY = '93da37e830d893d85ec77c5a9b9e4142';

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const mainIcon = document.getElementById('mainIcon');
const mainTemp = document.getElementById('mainTemp');
const mainCity = document.getElementById('mainCity');
const conditionDesc = document.getElementById('conditionDesc');
const humidityVal = document.getElementById('humidityVal');
const windVal = document.getElementById('windVal');
const pressureVal = document.getElementById('pressureVal');
const feelsLikeSpan = document.getElementById('feelsLike');
const dewPointSpan = document.getElementById('dewPoint');
const visibilitySpan = document.getElementById('visibility');
const windGustSpan = document.getElementById('windGust');
const sunriseSpan = document.getElementById('sunriseTime');
const sunsetSpan = document.getElementById('sunsetTime');
const cloudCoverSpan = document.getElementById('cloudCover');
const uvIndexSpan = document.getElementById('uvIndex');
const forecastContainer = document.getElementById('forecastList');
const statusMsgDiv = document.getElementById('statusMsg');

// CANVAS setup
const canvas = document.getElementById('weather-canvas');
let ctx = canvas.getContext('2d');
let animationId = null;
let currentWeatherType = 'clear';
let timeCounter = 0;

let zoneWidth = 0, zoneHeight = 0;
const animationZone = document.getElementById('animationZone');

function resizeCanvasToZone() {
    if (!animationZone) return;
    const rect = animationZone.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    zoneWidth = rect.width;
    zoneHeight = rect.height;
    canvas.width = zoneWidth;
    canvas.height = zoneHeight;
    initWeatherAnimation(currentWeatherType);
}

const resizeObserver = new ResizeObserver(() => resizeCanvasToZone());
if (animationZone) resizeObserver.observe(animationZone);
window.addEventListener('resize', () => setTimeout(resizeCanvasToZone, 80));

// EXACT SUNLIGHT ANIMATION SYSTEM 
let sunBeams = [];
let sunParticles = [];

class SunBeam {
    constructor(angle) {
        this.angle = angle;
        this.length = 50 + Math.random() * 40;
        this.thickness = 2.5 + Math.random() * 3;
    }
    draw(cx, cy, time) {
        const pulse = 0.65 + Math.sin(time * 0.005 + this.angle) * 0.2;
        const rot = this.angle + time * 0.0007;
        const ex = cx + Math.cos(rot) * this.length * (0.7 + pulse * 0.3);
        const ey = cy + Math.sin(rot) * this.length * (0.7 + pulse * 0.3);
        
        const grad = ctx.createLinearGradient(cx, cy, ex, ey);
        grad.addColorStop(0, `rgba(255, 220, 100, ${0.8 * pulse})`);
        grad.addColorStop(0.7, `rgba(255, 170, 50, ${0.3 * pulse})`);
        grad.addColorStop(1, `rgba(255, 120, 20, 0)`);
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.thickness * pulse;
        ctx.stroke();
    }
}

class SunParticle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * zoneWidth;
        this.y = 15 + Math.random() * zoneHeight * 0.45;
        this.radius = 2 + Math.random() * 5;
        this.life = 0.6 + Math.random() * 0.7;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.25;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.003;
        if (this.life <= 0 || this.x < -40 || this.x > zoneWidth + 40 || this.y < -40 || this.y > zoneHeight + 40) {
            this.reset();
            return false;
        }
        return true;
    }
    draw() {
        const intensity = this.life * 0.9;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * intensity, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 130, ${intensity * 0.8})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * intensity * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 210, 80, ${intensity * 0.3})`;
        ctx.fill();
    }
}

// EXACT RAIN SYSTEM 
let rainDrops = [];
let rainRipples = [];

class RainDrop {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * zoneWidth;
        this.y = Math.random() * zoneHeight - 50;
        this.length = 10 + Math.random() * 16;
        this.speed = 10 + Math.random() * 18;
        this.opacity = 0.45 + Math.random() * 0.45;
    }
    update() {
        this.y += this.speed;
        if (this.y > zoneHeight) {
            this.createRipple();
            this.y = -this.length;
            this.x = Math.random() * zoneWidth;
        }
    }
    createRipple() {
        rainRipples.push({ x: this.x, y: zoneHeight - 5, radius: 3, alpha: 0.6 });
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.strokeStyle = `rgba(140, 200, 255, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

// EXACT SNOW SYSTEM 
let snowFlakes = [];

class SnowFlake {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * zoneWidth;
        this.y = Math.random() * zoneHeight;
        this.radius = 2 + Math.random() * 5;
        this.speed = 0.8 + Math.random() * 3;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.006 + Math.random() * 0.016;
        this.twinkle = Math.random() * Math.PI * 2;
    }
    update() {
        this.y += this.speed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;
        this.twinkle += 0.05;
        if (this.y > zoneHeight) {
            this.y = -this.radius;
            this.x = Math.random() * zoneWidth;
        }
        if (this.x > zoneWidth) this.x = 0;
        if (this.x < 0) this.x = zoneWidth;
    }
    draw() {
        const sparkle = 0.7 + Math.sin(this.twinkle) * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkle})`;
        ctx.fill();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2 / 6) + this.wobble;
            const tx = this.x + Math.cos(angle) * this.radius * 1.2;
            const ty = this.y + Math.sin(angle) * this.radius * 1.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = `rgba(255, 255, 255, ${sparkle * 0.6})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

// ========== EXACT CLOUD SYSTEM ==========
let clouds = [];

class Cloud {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * zoneWidth;
        this.y = 20 + Math.random() * zoneHeight * 0.35;
        this.radius = 35 + Math.random() * 55;
        this.speed = 0.2 + Math.random() * 0.6;
        this.opacity = 0.18 + Math.random() * 0.2;
    }
    update() {
        this.x += this.speed;
        if (this.x > zoneWidth + this.radius) {
            this.x = -this.radius;
            this.y = 20 + Math.random() * zoneHeight * 0.35;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${this.opacity})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.5, this.y - 6, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.radius * 0.45, this.y - 9, this.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
    }
}

// EXACT THUNDER SYSTEM 
let lightningBolts = [];

class LightningBolt {
    constructor() {
        this.x = Math.random() * zoneWidth;
        this.y = 0;
        this.segments = [];
        let cx = this.x, cy = this.y;
        for (let i = 0; i < 7; i++) {
            cx += (Math.random() - 0.5) * 40;
            cy += 40 + Math.random() * 45;
            this.segments.push({ x: cx, y: cy });
        }
        this.life = 1;
    }
    update() {
        this.life -= 0.05;
        return this.life > 0;
    }
    draw() {
        if (this.segments.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        for (let s of this.segments) ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = `rgba(255, 240, 110, ${this.life})`;
        ctx.lineWidth = 4 * this.life;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        for (let s of this.segments) ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = `rgba(255, 200, 50, ${this.life * 0.6})`;
        ctx.lineWidth = 10 * this.life;
        ctx.stroke();
    }
}

function initWeatherAnimation(type) {
    rainDrops = [];
    snowFlakes = [];
    clouds = [];
    sunBeams = [];
    sunParticles = [];
    lightningBolts = [];
    rainRipples = [];
    
    if (type === 'rain') {
        const count = Math.min(220, Math.floor(zoneWidth / 3.5));
        for (let i = 0; i < count; i++) rainDrops.push(new RainDrop());
        for (let i = 0; i < 10; i++) clouds.push(new Cloud());
    } 
    else if (type === 'snow') {
        const count = Math.min(160, Math.floor(zoneWidth / 4));
        for (let i = 0; i < count; i++) snowFlakes.push(new SnowFlake());
        for (let i = 0; i < 7; i++) clouds.push(new Cloud());
    } 
    else if (type === 'clouds') {
        for (let i = 0; i < 22; i++) clouds.push(new Cloud());
    } 
    else if (type === 'clear') {
        for (let i = 0; i < 48; i++) {
            sunBeams.push(new SunBeam((i * Math.PI * 2) / 48));
        }
        for (let i = 0; i < 90; i++) sunParticles.push(new SunParticle());
    } 
    else if (type === 'thunder') {
        const count = Math.min(200, Math.floor(zoneWidth / 3.5));
        for (let i = 0; i < count; i++) rainDrops.push(new RainDrop());
        for (let i = 0; i < 12; i++) clouds.push(new Cloud());
    }
}

function updateRipples() {
    for (let i = 0; i < rainRipples.length; i++) {
        const r = rainRipples[i];
        r.radius += 1.2;
        r.alpha -= 0.025;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(120, 190, 255, ${r.alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (r.alpha <= 0 || r.radius > 35) rainRipples.splice(i, 1);
    }
}

function animateWeather() {
    if (!ctx || zoneWidth === 0 || zoneHeight === 0) {
        requestAnimationFrame(animateWeather);
        return;
    }
    ctx.clearRect(0, 0, zoneWidth, zoneHeight);
    timeCounter++;
    
    const sunX = zoneWidth * 0.2;
    const sunY = zoneHeight * 0.26;
    
    if (currentWeatherType === 'clear') {
        // Layer 1: Outer corona glow
        const outerGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 130);
        outerGrad.addColorStop(0, 'rgba(255, 225, 110, 0.95)');
        outerGrad.addColorStop(0.3, 'rgba(255, 190, 70, 0.65)');
        outerGrad.addColorStop(0.6, 'rgba(255, 150, 40, 0.35)');
        outerGrad.addColorStop(0.85, 'rgba(255, 100, 20, 0.1)');
        outerGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');
        ctx.beginPath();
        ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
        ctx.fillStyle = outerGrad;
        ctx.fill();
        
        // Layer 2: Mid corona with pulse
        const midPulse = Math.sin(timeCounter * 0.005) * 0.1 + 0.9;
        const midGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 85);
        midGrad.addColorStop(0, `rgba(255, 245, 160, 1)`);
        midGrad.addColorStop(0.5, `rgba(255, 210, 90, ${0.7 * midPulse})`);
        midGrad.addColorStop(1, `rgba(255, 160, 50, 0)`);
        ctx.beginPath();
        ctx.arc(sunX, sunY, 85, 0, Math.PI * 2);
        ctx.fillStyle = midGrad;
        ctx.fill();
        
        // Layer 3: Radiant beams
        for (let beam of sunBeams) {
            beam.draw(sunX, sunY, timeCounter);
        }
        
        // Layer 4: Core sun (pulsing)
        const corePulse = Math.sin(timeCounter * 0.007) * 0.1 + 0.9;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 38 * corePulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 248, 170, 1)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 210, 1)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 240, 1)';
        ctx.fill();
        
        // Layer 5: God rays
        for (let i = 0; i < 36; i++) {
            const angle = (i * Math.PI * 2 / 36) + timeCounter * 0.0005;
            const ex = sunX + Math.cos(angle) * 140;
            const ey = sunY + Math.sin(angle) * 140;
            const grad = ctx.createLinearGradient(sunX, sunY, ex, ey);
            grad.addColorStop(0, `rgba(255, 220, 100, 0.2)`);
            grad.addColorStop(1, `rgba(255, 180, 60, 0)`);
            ctx.beginPath();
            ctx.moveTo(sunX, sunY);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 10;
            ctx.stroke();
        }
        
        // Layer 6: Floating light particles
        for (let particle of sunParticles) {
            particle.update();
            particle.draw();
        }
        
        // Layer 7: Lens flares
        for (let i = 0; i < 6; i++) {
            const angle = timeCounter * 0.003 + i * Math.PI / 3;
            const fx = sunX + Math.cos(angle) * 60;
            const fy = sunY + Math.sin(angle) * 60;
            ctx.beginPath();
            ctx.arc(fx, fy, 7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 225, 120, 0.3)`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(fx - 4, fy - 3, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 200, 80, 0.4)`;
            ctx.fill();
        }
        
        // Layer 8: Soft ambient glow
        ctx.beginPath();
        ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 100, 0.12)`;
        ctx.fill();
    }
    else if (currentWeatherType === 'rain') {
        for (let drop of rainDrops) { drop.update(); drop.draw(); }
        updateRipples();
        for (let cloud of clouds) { cloud.update(); cloud.draw(); }
    }
    else if (currentWeatherType === 'snow') {
        for (let flake of snowFlakes) { flake.update(); flake.draw(); }
        for (let cloud of clouds) { cloud.update(); cloud.draw(); }
    }
    else if (currentWeatherType === 'clouds') {
        for (let cloud of clouds) { cloud.update(); cloud.draw(); }
    }
    else if (currentWeatherType === 'thunder') {
        for (let drop of rainDrops) { drop.update(); drop.draw(); }
        updateRipples();
        for (let cloud of clouds) { cloud.update(); cloud.draw(); }
        
        if (Math.random() < 0.012 && lightningBolts.length < 2) {
            lightningBolts.push(new LightningBolt());
        }
        for (let i = lightningBolts.length-1; i >= 0; i--) {
            const alive = lightningBolts[i].update();
            lightningBolts[i].draw();
            if (!alive) lightningBolts.splice(i, 1);
        }
        if (lightningBolts.length > 0 && Math.random() < 0.25) {
            ctx.fillStyle = `rgba(255, 248, 200, 0.22)`;
            ctx.fillRect(0, 0, zoneWidth, zoneHeight);
        }
    }
    
    requestAnimationFrame(animateWeather);
}

function setWeatherAnimation(weatherMain, iconCode) {
    const main = weatherMain.toLowerCase();
    let newType = currentWeatherType;
    if (main.includes('rain') || main.includes('drizzle') || iconCode.includes('09') || iconCode.includes('10')) newType = 'rain';
    else if (main.includes('snow') || iconCode.includes('13')) newType = 'snow';
    else if (main.includes('cloud') || iconCode.includes('03') || iconCode.includes('04')) newType = 'clouds';
    else if (main.includes('thunder') || iconCode.includes('11')) newType = 'thunder';
    else newType = 'clear';
    
    if (newType !== currentWeatherType) {
        currentWeatherType = newType;
        initWeatherAnimation(currentWeatherType);
    }
}

// ========== WEATHER API FUNCTIONS ==========
function setStatus(text, isError = false) {
    statusMsgDiv.innerHTML = `<span style="background:${isError ? 'rgba(220,70,80,0.85)' : 'rgba(0,0,0,0.55)'}; padding:6px 20px; border-radius:60px; backdrop-filter:blur(4px); font-size:0.8rem;">${text}</span>`;
    setTimeout(() => { if(statusMsgDiv.innerHTML.includes(text)) statusMsgDiv.innerHTML = ''; }, 3200);
}

function formatTime(unixSec, timezoneOffsetSec) {
    const date = new Date((unixSec + timezoneOffsetSec) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

async function getCoordinates(cityName) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;
    const resp = await fetch(geoUrl);
    if (!resp.ok) throw new Error('Location error');
    const data = await resp.json();
    if (!data.length) throw new Error(`"${cityName}" not found`);
    return { lat: data[0].lat, lon: data[0].lon, name: data[0].name, country: data[0].country };
}

async function fetchFullWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&appid=${API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Weather service error');
    return await resp.json();
}

async function fetchCurrentFallback(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Unable to fetch');
    return await resp.json();
}

function renderForecast(dailyArray, tzOffset) {
    if (!dailyArray || dailyArray.length === 0) {
        forecastContainer.innerHTML = '<div class="forecast-item">N/A</div>';
        return;
    }
    const nextDays = dailyArray.slice(1, 6);
    forecastContainer.innerHTML = '';
    nextDays.forEach(day => {
        const date = new Date((day.dt + tzOffset) * 1000);
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = day.weather[0].icon;
        const temp = Math.round(day.temp.day);
        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `<div style="font-size:0.7rem; color:#ffdba5;">${weekday}</div>
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width:38px">
                        <div style="font-size:1rem; font-weight:600;">${temp}°</div>`;
        forecastContainer.appendChild(item);
    });
}

async function loadWeatherForCity(cityQuery) {
    if (!cityQuery || !cityQuery.trim()) { setStatus("Enter a city name", true); return; }
    setStatus(`🔍 Connecting to weather data...`);
    try {
        const coord = await getCoordinates(cityQuery.trim());
        const cityDisplay = `${coord.name}, ${coord.country}`;
        mainCity.innerText = cityDisplay;
        
        let wData, fallback = false;
        try {
            wData = await fetchFullWeather(coord.lat, coord.lon);
        } catch (e) {
            wData = { current: null, daily: null, fallbackCurrent: await fetchCurrentFallback(coord.lat, coord.lon) };
            fallback = true;
        }
        
        if (!fallback && wData.current) {
            const c = wData.current;
            const tz = wData.timezone_offset || 0;
            mainTemp.innerHTML = `${Math.round(c.temp)}<span>°C</span>`;
            conditionDesc.innerText = c.weather[0].description;
            mainIcon.src = `https://openweathermap.org/img/wn/${c.weather[0].icon}@4x.png`;
            humidityVal.innerText = `${c.humidity}%`;
            windVal.innerText = `${Math.round(c.wind_speed)} km/h`;
            pressureVal.innerText = `${c.pressure} hPa`;
            feelsLikeSpan.innerText = `${Math.round(c.feels_like)}°C`;
            dewPointSpan.innerText = `${Math.round(c.dew_point)}°C`;
            visibilitySpan.innerText = `${(c.visibility / 1000).toFixed(1)} km`;
            windGustSpan.innerText = c.wind_gust ? `${Math.round(c.wind_gust)} km/h` : `${Math.round(c.wind_speed)} km/h`;
            cloudCoverSpan.innerText = `${c.clouds}%`;
            uvIndexSpan.innerText = c.uvi ? c.uvi.toFixed(1) : '—';
            if (c.sunrise) sunriseSpan.innerText = formatTime(c.sunrise, tz);
            if (c.sunset) sunsetSpan.innerText = formatTime(c.sunset, tz);
            if (wData.daily) renderForecast(wData.daily, tz);
            setWeatherAnimation(c.weather[0].main, c.weather[0].icon);
        } else if (fallback && wData.fallbackCurrent) {
            const c = wData.fallbackCurrent;
            mainTemp.innerHTML = `${Math.round(c.main.temp)}<span>°C</span>`;
            conditionDesc.innerText = c.weather[0].description;
            mainIcon.src = `https://openweathermap.org/img/wn/${c.weather[0].icon}@4x.png`;
            humidityVal.innerText = `${c.main.humidity}%`;
            windVal.innerText = `${Math.round(c.wind.speed)} km/h`;
            pressureVal.innerText = `${c.main.pressure} hPa`;
            feelsLikeSpan.innerText = `${Math.round(c.main.feels_like)}°C`;
            visibilitySpan.innerText = `${(c.visibility / 1000).toFixed(1)} km`;
            cloudCoverSpan.innerText = `${c.clouds.all}%`;
            uvIndexSpan.innerText = '—';
            if (c.sys.sunrise && c.sys.sunset) {
                const off = c.timezone || 0;
                sunriseSpan.innerText = formatTime(c.sys.sunrise, off);
                sunsetSpan.innerText = formatTime(c.sys.sunset, off);
            }
            forecastContainer.innerHTML = '<div class="forecast-item">5-day upgrade</div>';
            setWeatherAnimation(c.weather[0].main, c.weather[0].icon);
        }
        localStorage.setItem('lastCity', cityDisplay);
        const animName = currentWeatherType === 'clear' ? 'RADIANT SUNLIGHT' : 
                         currentWeatherType === 'rain' ? 'PRECISE RAIN' : 
                         currentWeatherType === 'snow' ? 'GENTLE SNOW' : 
                         currentWeatherType === 'thunder' ? 'THUNDERSTORM' : 'DRIFTING CLOUDS';
        setStatus(`✨ ${cityDisplay} • ${animName} animation active`);
    } catch (err) {
        setStatus(`⚠️ ${err.message}`, true);
        mainCity.innerText = cityQuery.trim();
    }
}

function handleSearch() {
    const val = cityInput.value.trim();
    if (!val) { setStatus("Enter a city name", true); return; }
    loadWeatherForCity(val);
    cityInput.blur();
}

// ========== EVENT LISTENERS & INITIALIZATION ==========
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        resizeCanvasToZone();
        const last = localStorage.getItem('lastCity');
        if (last && last.includes(',')) {
            cityInput.value = last.split(',')[0];
            loadWeatherForCity(last.split(',')[0]);
        } else {
            cityInput.value = "Kyoto";
            loadWeatherForCity("Kyoto");
        }
        cityInput.focus();
        animateWeather();
    }, 120);
});