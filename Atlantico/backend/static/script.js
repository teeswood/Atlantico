document.addEventListener("DOMContentLoaded", function() {
    fetch('/api/arrivals')
        .then(response => response.json())
        .then(arrivals => {
            let calendar = document.getElementById('calendar');
            for (let date in arrivals) {
                let day = document.createElement('div');
                day.className = 'day red';
                day.innerHTML = `<strong>${date}</strong>`;
                day.onclick = () => showArrivals(date, arrivals[date]);
                calendar.appendChild(day);
            }
        });
});

function showArrivals(date, containers) {
    let modal = document.getElementById("modal");
    let modalHeader = document.getElementById("modal-header");
    let modalBody = document.getElementById("modal-body");

    modalHeader.innerHTML = `Llegadas del ${date}`;
    modalBody.innerHTML = containers.map(c => `<div onclick="showContainer('${c}')">${c}</div>`).join('');
    
    modal.style.display = "block";
}

function showContainer(containerId) {
    fetch(`/api/container/${containerId}`)
        .then(response => response.json())
        .then(items => {
            let modalBody = document.getElementById("modal-body");
            modalBody.innerHTML = `<h3>Contenedor ${containerId}</h3><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
        });
}

function closeModal() { document.getElementById("modal").style.display = "none"; }
