from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Datos de llegadas de contenedores
arrivals = {
    "2025-02-12": ["HAMU2005372", "HLBU3126701", "TEMU8468056"],
    "2025-02-17": ["CMAU6816660", "TEMU6341479", "TXGU7148723"],
    "2025-02-21": ["HLXU8312199", "GCXU5146161", "FANU1861020"]
}

# Contenido de cada contenedor
container_contents = {
    "HAMU2005372": ["Postes W8x13", "Tornillos M10x30"],
    "HLBU3126701": ["Postes W8x18", "Tornillos M12x40"],
    "TEMU8468056": ["Perfiles de Giro", "Cables de corriente"]
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/arrivals')
def get_arrivals():
    return jsonify(arrivals)

@app.route('/api/container/<container_id>')
def get_container_contents(container_id):
    return jsonify(container_contents.get(container_id, ["Información no disponible"]))

if __name__ == "__main__":
    app.run(debug=True)
