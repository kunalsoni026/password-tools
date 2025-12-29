from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import secrets
import string
import math

app = Flask(__name__)
CORS(app)

UPPERCASE = string.ascii_uppercase
LOWERCASE = string.ascii_lowercase
DIGITS = string.digits
SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/|<>"

@app.route("/")
def home():
    return render_template("index.html")  # ← THIS serves your blue UI!

@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.json or {}
    length = int(data.get("length", 12))
    
    pools = []
    if data.get("include_uppercase") == "yes": pools.append(UPPERCASE)
    if data.get("include_lowercase") == "yes": pools.append(LOWERCASE)
    if data.get("include_digits") == "yes": pools.append(DIGITS)
    if data.get("include_symbols") == "yes": pools.append(SYMBOLS)
    
    all_chars = "".join(pools)
    password = "".join(secrets.choice(all_chars) for _ in range(length))
    entropy = length * math.log2(len(all_chars))
    
    return jsonify({
        "password": password,
        "entropy": round(entropy, 2),
        "strength": "STRONG"
    })

@app.route("/api/check", methods=["POST"])
def check():
    data = request.json or {}
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "Password required"}), 400
    
    charset_size = 0
    if any(c.islower() for c in password): charset_size += 26
    if any(c.isupper() for c in password): charset_size += 26
    if any(c.isdigit() for c in password): charset_size += 10
    if any(c in SYMBOLS for c in password): charset_size += 32
    
    entropy = len(password) * math.log2(charset_size) if charset_size else 0
    strength = "STRONG" if entropy > 60 else "WEAK"
    
    return jsonify({
        "length": len(password),
        "entropy": round(entropy, 2),
        "strength": strength,
        "tips": "Good password!"
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)

