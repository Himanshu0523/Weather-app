# Solara - Live Weather App

A modern, responsive weather dashboard built with plain HTML, CSS, and vanilla JavaScript. It features an interactive HTML5 Canvas animation engine that changes visuals based on real-time weather conditions.

🔗 **[Live Production URL](https://weather-app-orcin-seven-13.vercel.app/)**

---

## ✨ Features

- **Real-Time Data:** Displays global Temperature, Wind, Humidity, Pressure, UV Index, and a 5-Day Forecast.
- **Dynamic Canvas Physics:** Implements custom particle engines for realistic weather visuals:
  - ☀️ **Sunlight:** Pulsing gradient beams and glowing solar particles.
  - 🌧️ **Rain:** High-velocity falling droplets with localized ground splash ripples.
  - ❄️ **Snow:** Twinkling flakes with realistic horizontal sinusoidal wave drifts.
  - ☁️ **Clouds:** Smoothly drifting volumetric cloud clusters layered for visual depth.
- **Auto-Responsive:** Uses a `ResizeObserver` loop to automatically resize the canvas layout dynamically.

---

## 🛠️ Quick Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd Weather-app
   ```
2. **Run the app:**
   Simply double-click the `index.html` file to open it in any web browser.

---

## ⚠️ Security Warning

Your API key is currently exposed directly in the frontend JavaScript file:
```javascript
const API_KEY = 'Enter your API key';
```
To prevent unauthorized use, consider hiding it using **Vercel Environment Variables** paired with a backend serverless function (`/api/`) in production.

---

## 🔄 How to Push Updates

Vercel will automatically rebuild and deploy your changes every time you push code to GitHub:

```bash
git add .
git commit -m "Your update message here"
git push origin main
```
