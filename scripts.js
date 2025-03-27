const API_URL = "https://atlantico.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const entregaForm = document.getElementById("entregaForm");

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

    if (window.location.pathname.includes("panel.html")) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) window.location.href = "login.html";

        document.getElementById("welcomeMsg").textContent = `Bienvenido, ${user.role}`;
        if (user.role === "admin") {
            document.getElementById("entregaSection").style.display = "block";
        }

        fetch(`${API_URL}/stock`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                const tbody = document.querySelector("#stockTable tbody");
                Object.entries(data).forEach(([codigo, info]) => {
                    const row = `<tr><td>${codigo}</td><td>${info.descripcion}</td><td>${info.cantidad_disponible}</td><td>${info.ubicacion}</td></tr>`;
                    tbody.innerHTML += row;
                });
            });

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