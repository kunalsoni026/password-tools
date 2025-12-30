from flask import Flask, jsonify, request
from flask_cors import CORS
import secrets
import string
import math
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    try:
        with open('index.html', 'r') as f:
            return f.read()
    except:
        return '<h1>Password Tools Live!</h1>'

@app.route('/static/<path:filename>')
def static_files(filename):
    return app.send_static_file(filename)

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json or {}
    length = int(data.get('length', 16))
    pools = []
    if data.get('include_uppercase', True) == 'yes': pools.append(string.ascii_uppercase)
    if data.get('include_lowercase', True) == 'yes': pools.append(string.ascii_lowercase)
    if data.get('include_digits', True) == 'yes': pools.append(string.digits)
    if data.get('include_symbols', True) == 'yes': pools.append('!@#$%^&*()_+-=[]{}|;:,.<>?')
    
    chars = ''.join(pools)
    password = ''.join(secrets.choice(chars) for _ in range(length))
    entropy = length * len(chars).bit_length()
    
    return jsonify({
        'password': password,
        'entropy': round(entropy, 1),
        'strength': 'STRONG' if entropy > 80 else 'MEDIUM' if entropy > 50 else 'WEAK'
    })

@app.route('/api/check', methods=['POST'])
def check():
    data = request.json or {}
    pwd = data.get('password', '')
    score = len(pwd) * 4
    return jsonify({
        'length': len(pwd),
        'entropy': round(score, 1),
        'strength': 'STRONG' if score > 80 else 'MEDIUM' if score > 50 else 'WEAK',
        'tips': 'Use longer passwords with symbols!'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
