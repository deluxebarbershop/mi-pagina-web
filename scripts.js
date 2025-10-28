// ✅ Funciones básicas de ayuda
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
        fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;
  }
  return `<span class="stars" title="${rating.toFixed(1)} de 5">${html}</span>`;
}

function toast(msg, ms=2500){
  const t = document.createElement('div');
  t.className='toast'; 
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.remove()}, ms);
}

// ✅ Menú activo
(function highlightNav(){
  const path = location.pathname.split('/').pop();
  $$('nav a').forEach(a=>{
    if(a.getAttribute('href')===path){
      a.style.background = 'rgba(255,255,255,.08)';
    }
  });
})();

// ✅ Cargar después de que la página esté lista
document.addEventListener("DOMContentLoaded", () => {

  // Botón eliminar todas las barberías
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

  // Sección “Conoce más”
  const btnConoceMas = document.getElementById("btn-conoce-mas");
  const sobreNosotros = document.getElementById("sobre-nosotros");
  if (btnConoceMas && sobreNosotros) {
    btnConoceMas.addEventListener("click", e => {
      e.preventDefault();
      sobreNosotros.style.display = 
        sobreNosotros.style.display === "block" ? "none" : "block";
      sobreNosotros.scrollIntoView({ behavior: "smooth" });
    });
  }

  // 🌟 Menú desplegable en celular
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      menuToggle.textContent = navMenu.classList.contains("active") ? "✖" : "☰";
    });
  }

});

// 🚀 Conexión con Firebase
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

// 🔹 Cargar barberías desde Firebase
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

// 🔹 Guardar barberías en Firebase
window.saveBarberia = async function(newItem) {
  try {
    await addDoc(collection(db, "barberias"), newItem);
    toast("Barbería registrada correctamente en Firebase ✅");
  } catch (error) {
    console.error("Error al guardar la barbería:", error);
    toast("Error al registrar la barbería ❌");
  }
};





