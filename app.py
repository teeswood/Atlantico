from flask import Flask, request, jsonify, session
from flask_cors import CORS
import json
import os

app = Flask(__name__)
app.secret_key = 'clave-super-secreta'
CORS(app, supports_credentials=True)

# Cargar usuarios
with open("users.json", "r") as f:
    USERS = json.load(f)

# Cargar stock real
with open("db.json", "r") as f:
    STOCK_REAL = json.load(f)

# Cargar stock teórico
if os.path.exists("db_stock_teorico.json"):
    with open("db_stock_teorico.json", "r") as f:
        STOCK_TEORICO = json.load(f)
else:
    STOCK_TEORICO = {}

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = USERS.get(data["username"])
    if user and user["password"] == data["password"]:
        session["user"] = {"username": data["username"], "role": user["role"]}
        return jsonify({"message": "Login successful", "role": user["role"]})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user", None)
    return jsonify({"message": "Logged out"})

@app.route("/stock", methods=["GET"])
def get_stock():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(STOCK_REAL)

@app.route("/stock_teorico", methods=["GET"])
def get_teorico():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(STOCK_TEORICO)

@app.route("/diferencias", methods=["GET"])
def get_diferencias():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    diferencias = {}
    for code, data in STOCK_TEORICO.items():
        teorica = data.get("cantidad_teorica", 0)
        real = STOCK_REAL.get(code, {}).get("cantidad_disponible", 0)
        diferencia = real - teorica
        diferencias[code] = {
            "descripcion": data["descripcion"],
            "diferencia": diferencia
        }
    return jsonify(diferencias)

@app.route("/entregar", methods=["POST"])
def entregar():
    if "user" not in session or session["user"]["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    codigo = data["codigo"]
    cantidad = data["cantidad"]
    subcontrata = data["subcontrata"]

    if codigo not in STOCK_REAL:
        return jsonify({"error": "Material no encontrado"}), 404
    if STOCK_REAL[codigo]["cantidad_disponible"] < cantidad:
        return jsonify({"error": "Stock insuficiente"}), 400

    STOCK_REAL[codigo]["cantidad_disponible"] -= cantidad
    entrega = {"subcontrata": subcontrata, "cantidad": cantidad}
    STOCK_REAL[codigo]["entregas"].append(entrega)

    with open("db.json", "w") as f:
        json.dump(STOCK_REAL, f, indent=4)

    return jsonify({"message": "Entrega registrada"})

if __name__ == "__main__":
    app.run(debug=True)
