from flask import Flask, request, jsonify, session
from flask_cors import CORS
import json

app = Flask(__name__)
app.secret_key = 'clave-super-secreta'
CORS(app)

# Cargar usuarios
with open("users.json", "r") as f:
    USERS = json.load(f)

# Cargar stock (inicialmente vacío)
with open("db.json", "r") as f:
    STOCK = json.load(f)


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
    return jsonify(STOCK)


@app.route("/entregar", methods=["POST"])
def entregar():
    if "user" not in session or session["user"]["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    codigo = data["codigo"]
    cantidad = data["cantidad"]
    subcontrata = data["subcontrata"]

    if codigo not in STOCK:
        return jsonify({"error": "Material no encontrado"}), 404
    if STOCK[codigo]["cantidad_disponible"] < cantidad:
        return jsonify({"error": "Stock insuficiente"}), 400

    STOCK[codigo]["cantidad_disponible"] -= cantidad
    entrega = {"subcontrata": subcontrata, "cantidad": cantidad}
    STOCK[codigo]["entregas"].append(entrega)

    with open("db.json", "w") as f:
        json.dump(STOCK, f, indent=4)

    return jsonify({"message": "Entrega registrada"})


if __name__ == "__main__":
    app.run(debug=True)