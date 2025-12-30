from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import secrets
import string
import math
import os

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json or {}
    length = int(data.get('length', 12))
    pools = []
    if data.get('include_uppercase') == 'yes': pools.append(string.ascii_uppercase)
    if data.get('include_lowercase') == 'yes': pools.append(string.ascii_lowercase)
    if data.get('include_digits') == 'yes': pools.append(string.digits)
    if data.get('include_symbols') == 'yes': pools.append("!@#$%^&*()-_=+[]{};:,.?/|<>")
    
    all_chars = ''.join(pools)
    password = ''.join(secrets.choice(all_chars) for _ in range(length))
    entropy = length * math.log2(len(all_chars))
    
    return jsonify({
        'password': password,
        'entropy': round(entropy, 2),
        'strength': 'STRONG' if entropy > 60 else 'MEDIUM'
    })

@app.route('/api/check', methods=['POST'])
def check():
    data = request.json or {}
    password = data.get('password', '')
    charset_size = 94  # full charset
    entropy = len(password) * math.log2(charset_size) if password else 0
    return jsonify({
        'length': len(password),
        'entropy': round(entropy, 2),
        'strength': 'STRONG' if entropy > 60 else 'WEAK',
        'tips': 'Good password!'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
