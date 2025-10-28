const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

function renderStars(rating=0){
  const full = Math.floor(rating);
  const half = rating - full >= .5;
  let html = '';
  for(let i=0;i<5;i++){
    const fill = i < full ? '#fbbf24' : (i===full && half ? 'url(#half)' : 'none');
    const stroke = i < full || (i===full && half) ? '#fbbf24' : '#3a404b';
    html += `<svg class="star" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="half" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stop-color="#fbbf24"/><stop offset="50%" stop-color="transparent"/>
        </linearGradient>
      </defs>
      <path d="M12 2l2.9 6.1 6.7.6-5 4.4 1.5 6.7L12 16l-6.1 3.8 1.5-6.7-5-4.4 6.7-.6z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`
  }
  return `<span class="stars" title="${rating.toFixed(1)} de 5">${html}</span>`;
}

const money = (n, currency="COP") => new Intl.NumberFormat('es-CO', {style:'currency', currency}).format(n);

async function loadBarberias(){
  try {
    const res = await fetch('barberias.json', {cache:'no-store'});
    const base = await res.json();
    const extra = JSON.parse(localStorage.getItem('barberias_extra')||'[]');
    return [...base, ...extra];
  } catch(e){
    return JSON.parse(localStorage.getItem('barberias_extra')||'[]');
  }
}

async function saveBarberia(newItem, files, logoFile){
  const fotosBase64 = [];

  if (files && files.length){
    for (let f of files){
      const base64 = await toBase64(f);
      fotosBase64.push(base64);
    }
  }

  if (logoFile){
    newItem.logo = await toBase64(logoFile);
  }

  newItem.photos = fotosBase64;

  const extra = JSON.parse(localStorage.getItem('barberias_extra')||'[]');
  extra.push(newItem);
  localStorage.setItem('barberias_extra', JSON.stringify(extra));
}

function toBase64(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=>resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function distanceKm(lat1, lon1, lat2, lon2){
  function toRad(d){return d*Math.PI/180}
  const R = 6371;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toast(msg, ms=2500){
  const t = document.createElement('div');
  t.className='toast'; 
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.remove()}, ms);
}

const params = new URLSearchParams(location.search);

(function highlightNav(){
  const path = location.pathname.split('/').pop();
  $$('nav a').forEach(a=>{
    if(a.getAttribute('href')===path){
      a.style.background = 'rgba(255,255,255,.08)';
    }
  })
})();

document.addEventListener("DOMContentLoaded", () => {
  const btnClear = document.getElementById("btnclear");
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (confirm("¿Seguro que quieres eliminar todas las barberías registradas?")) {
        localStorage.removeItem("barberias_extra"); 
        toast("Todas las barberías fueron eliminadas.");
        if (typeof renderList === "function") renderList();
      }
    });
  }

  const btnConoceMas = document.getElementById("btn-conoce-mas");
  const sobreNosotros = document.getElementById("sobre-nosotros");

  if (btnConoceMas && sobreNosotros) {
    btnConoceMas.addEventListener("click", function (e) {
      e.preventDefault();
      if (sobreNosotros.style.display === "block") {
        sobreNosotros.style.display = "none";
      } else {
        sobreNosotros.style.display = "block";
        sobreNosotros.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  /* 🌟 --- NUEVO: menú hamburguesa responsive --- 🌟 */
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      // Cambia el ícono ☰ a ✖️ cuando el menú está abierto
      menuToggle.textContent = navMenu.classList.contains("active") ? "✖" : "☰";
    });
  }
});



/* 🚀 Conexión con Firebase y Firestore */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCFsX78jkxeRO-q0iyVSHe-aEYv0JEZew",
  authDomain: "deluxe-barber-shop-5e9c8.firebaseapp.com",
  projectId: "deluxe-barber-shop-5e9c8",
  storageBucket: "deluxe-barber-shop-5e9c8.firebasestorage.app",
  messagingSenderId: "138851802233",
  appId: "1:138851802233:web:dc73c59db611d8292e08a8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 🔹 Reemplaza el loadBarberias antiguo por esta versión */
window.loadBarberias = async function() {
  try {
    const barberiasCol = collection(db, "barberias");
    const barberiasSnapshot = await getDocs(barberiasCol);
    const barberiasList = barberiasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return barberiasList;
  } catch (error) {
    console.error("Error al cargar barberías desde Firestore:", error);
    return [];
  }
};

/* 🔹 Guarda barberías en Firebase */
window.saveBarberia = async function(newItem) {
  try {
    await addDoc(collection(db, "barberias"), newItem);
    toast("Barbería registrada correctamente en Firebase ✅");
  } catch (error) {
    console.error("Error al guardar la barbería:", error);
    toast("Error al registrar la barbería ❌");
  }
};




