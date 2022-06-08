from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv, find_dotenv
from flask_cors import CORS
import psycopg2
import os
load_dotenv(find_dotenv())

app = Flask(__name__)
CORS(app)

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/leaderboard', methods=['GET'])
def get_items():
    conn = psycopg2.connect(
        dbname=os.getenv('DB_DATABASE'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host="host.docker.internal")
    cur = conn.cursor()
    cur.execute("SELECT * FROM leaderboard;")
    results = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(results)

@app.route('/leaderboard/correct', methods=['GET'])
def get_items_correct():
    conn = psycopg2.connect(
        dbname=os.getenv('DB_DATABASE'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host="host.docker.internal")
    cur = conn.cursor()
    cur.execute("SELECT * FROM leaderboard ORDER BY answerscorrect DESC;")
    results = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(results)

@app.route('/leaderboard/accuracy', methods=['GET'])
def get_items_accuracy():
    conn = psycopg2.connect(
        dbname=os.getenv('DB_DATABASE'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host="host.docker.internal")
    cur = conn.cursor()
    cur.execute("SELECT * FROM leaderboard ORDER BY accuracy DESC;")
    results = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(results)
