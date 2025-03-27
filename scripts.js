const API_URL = "https://atlantico-1.onrender.com";
const TEORICO_URL = "https://atlantico-1.onrender.com/stock_teorico"; // Esto se simula con un nuevo endpoint

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const entregaForm = document.getElementById("entregaForm");
    const user = JSON.parse(localStorage.getItem("user"));

    if (window.location.pathname.includes("login.html")) {
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const username = document.getElementById("username").value;
                const password = document.getElementById("password").value;
                const res = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem("user", JSON.stringify(data));
                    window.location.href = "panel.html";
                } else {
                    document.getElementById("errorMsg").textContent = data.error;
                }
            });
        }
    }

    if (window.location.pathname.includes("panel.html")) {
        if (!user) {
            document.body.innerHTML = "<h2>Sesión cerrada</h2><a href='login.html'>Volver a iniciar sesión</a>";
            return;
        }

        document.getElementById("welcomeMsg").textContent = `Bienvenido, ${user.role}`;
        if (user.role === "admin") {
            document.getElementById("entregaSection").style.display = "block";
        }

        document.getElementById("verReal").addEventListener("click", () => cargarStock("real"));
        document.getElementById("verTeorico").addEventListener("click", () => cargarStock("teorico"));
        document.getElementById("verDiferencias").addEventListener("click", () => cargarStock("diferencias"));

        cargarStock("real");

        if (entregaForm) {
            entregaForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const codigo = document.getElementById("codigo").value;
                const cantidad = parseInt(document.getElementById("cantidad").value);
                const subcontrata = document.getElementById("subcontrata").value;

                const res = await fetch(`${API_URL}/entregar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ codigo, cantidad, subcontrata })
                });

                const data = await res.json();
                document.getElementById("entregaMsg").textContent = data.message || data.error;
                cargarStock("real");
            });
        }
    }
});

function logout() {
    fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
    }).then(() => {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}

async function cargarStock(tipo) {
    let endpoint = `${API_URL}/stock`;
    if (tipo === "teorico") endpoint = `${API_URL}/stock_teorico`;
    if (tipo === "diferencias") endpoint = `${API_URL}/diferencias`;

    const res = await fetch(endpoint, { credentials: "include" });
    const data = await res.json();

    const tbody = document.querySelector("#stockTable tbody");
    tbody.innerHTML = "";

    if (tipo === "diferencias") {
        Object.entries(data).forEach(([codigo, info]) => {
            const row = `<tr><td>${codigo}</td><td>${info.descripcion}</td><td>${info.diferencia}</td></tr>`;
            tbody.innerHTML += row;
        });
    } else {
        Object.entries(data).forEach(([codigo, info]) => {
            const row = `<tr><td>${codigo}</td><td>${info.descripcion}</td><td>${info.cantidad_disponible || info.cantidad_teorica}</td><td>${info.ubicacion}</td></tr>`;
            tbody.innerHTML += row;
        });
    }
}
