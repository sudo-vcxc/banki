fetch('termekek.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('termekek-container');
    data.termekek.forEach(termek => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h2>${termek.nev}</h2>
        <p><strong>Ár:</strong> ${termek.ar} ${termek.valuta}</p>
        <p><strong>Készlet:</strong> ${termek.keszlet} db</p>
      `;
      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error('Hiba a termékek betöltésekor:', error);
  });
