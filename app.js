let termekekData = [];
let kosar = {}; // { termekId: mennyiseg }

document.addEventListener("DOMContentLoaded", () => {
  // Fülek kezelése (marad változatlan)
  const links = document.querySelectorAll("nav ul li a");
  const sections = document.querySelectorAll(".tab-content");

  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.dataset.tab;

      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      sections.forEach(s => {
        if (s.id === target) s.classList.add("active");
        else s.classList.remove("active");
      });

      if(target === "kosar") {
        megjelenitKosar();
      }
    });
  });

  // Termékek betöltése és megjelenítése
  fetch("termekek.json")
    .then(res => res.json())
    .then(data => {
      termekekData = data.termekek;
      megjelenitTermekek(termekekData);
      betoltKosar();
    })
    .catch(err => {
      console.error("Hiba a termékek betöltésekor:", err);
      document.getElementById("termekek-container").innerHTML = "<p>Nem sikerült betölteni a termékeket.</p>";
    });

  // Rendelés gomb kezelése
  document.getElementById("rendeles-gomb").addEventListener("click", () => {
    if(Object.keys(kosar).length === 0) return;

    // Egyszerű rendelés leadás, itt lehet backend helye
    document.getElementById("rendeles-uzenet").textContent = "Köszönjük a rendelést! Hamarosan felvesszük veled a kapcsolatot.";
    kosar = {};
    mentKosar();
    megjelenitKosar();
  });
});

// Termékek megjelenítése termék dobozokkal és kosár gombbal
function megjelenitTermekek(termekek) {
  const container = document.getElementById("termekek-container");
  container.innerHTML = "";
  termekek.forEach(termek => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${termek.nev}</h3>
      <p><strong>Ár:</strong> ${termek.ar} ${termek.valuta}</p>
      <p><strong>Készlet:</strong> ${termek.keszlet} db</p>
      <button data-id="${termek.id}">Kosárba teszem</button>
    `;
    container.appendChild(card);
  });

  // Gombok eseménykezelője
  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      addKosarba(id);
    });
  });
}

// Kosár kezelés

function betoltKosar() {
  const kosarString = localStorage.getItem("rozsavirag_kosar");
  kosar = kosarString ? JSON.parse(kosarString) : {};
}

function mentKosar() {
  localStorage.setItem("rozsavirag_kosar", JSON.stringify(kosar));
}

function addKosarba(termekId) {
  const termek = termekekData.find(t => t.id == termekId);
  if(!termek) return alert("Hiba: nem található termék.");

  const jelenlegiDb = kosar[termekId] || 0;
  if(jelenlegiDb + 1 > termek.keszlet) {
    alert(`Sajnos csak ${termek.keszlet} db van készleten ebből a termékből.`);
    return;
  }

  kosar[termekId] = jelenlegiDb + 1;
  mentKosar();
  alert(`"${termek.nev}" hozzáadva a kosárhoz.`);
}

// Kosár megjelenítése a Kosár fülön
function megjelenitKosar() {
  const container = document.getElementById("kosar-container");
  const osszegzesElem = document.getElementById("kosar-osszegzes");
  const rendelesUzenet = document.getElementById("rendeles-uzenet");
  const rendelesGomb = document.getElementById("rendeles-gomb");

  rendelesUzenet.textContent = "";

  container.innerHTML = "";

  if(Object.keys(kosar).length === 0) {
    container.innerHTML = "<p>A kosarad üres.</p>";
    osszegzesElem.textContent = "";
    rendelesGomb.style.display = "none";
    return;
  }

  const tabla = document.createElement("table");
  tabla.style.width = "100%";
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Termék</th>
        <th>Ár (db)</th>
        <th>Mennyiség</th>
        <th>Összeg</th>
        <th>Törlés</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabla.querySelector("tbody");
  let teljesOsszeg = 0;

  for(const termekId in kosar) {
    const termek = termekekData.find(t => t.id == termekId);
    const db = kosar[termekId];
    const osszeg = termek.ar * db;
    teljesOsszeg += osszeg;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${termek.nev}</td>
      <td>${termek.ar} ${termek.valuta}</td>
      <td><input type="number" min="1" max="${termek.keszlet}" value="${db}" data-id="${termekId}" class="mennyiseg-input" style="width:60px"></td>
      <td>${osszeg} ${termek.valuta}</td>
      <td><button data-id="${termekId}" class="torles-btn">X</button></td>
    `;
    tbody.appendChild(tr);
  }

  container.appendChild(tabla);

  osszegzesElem.textContent = `Összesen: ${teljesOsszeg} HUF`;

  rendelesGomb.style.display = "inline-block";

  // Mennyiség változtatás kezelése
  tbody.querySelectorAll(".mennyiseg-input").forEach(input => {
    input.addEventListener("change", (e) => {
      const id = e.target.getAttribute("data-id");
      let ujDb = parseInt(e.target.value);

      if(isNaN(ujDb) || ujDb < 1) ujDb = 1;

      const termek = termekekData.find(t => t.id == id);

      if(ujDb > termek.keszlet) {
        alert(`Sajnos csak ${termek.keszlet} darab van készleten.`);
        ujDb = termek.keszlet;
        e.target.value = ujDb;
      }

      kosar[id] = ujDb;
      mentKosar();
      megjelenitKosar();
    });
  });

  // Törlés gombok kezelése
  tbody.querySelectorAll(".torles-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      delete kosar[id];
      mentKosar();
      megjelenitKosar();
    });
  });
}
