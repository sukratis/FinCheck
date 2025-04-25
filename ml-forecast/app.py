from flask import Flask, request, jsonify
from flask_cors import CORS
from forecast import generate_forecast

app = Flask(__name__)
CORS(app)

@app.route('/api/forecast', methods=['POST'])
def forecast():
    data = request.get_json()
    try:
        return jsonify(generate_forecast(data))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
