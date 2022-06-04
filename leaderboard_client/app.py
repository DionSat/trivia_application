from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

if __name__ == '__main__':
    app.run(debug=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:Qm5RNjEp@localhost:5432/leaderboard'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

#create model
# class Item(db.Model):
#   id = db.Column(db.Integer, primary_key=True)
#   username = db.Column(db.String(255), unique=True, nullable=False)
#   answerscorrect = db.Column(db.Integer, unique=True, nullable=False)
#   totalanswered = db.Column(db.Integer, unique=True, nullable=False)
#   accuracy = db.Column(db.Float, unique=True, nullable=False)

#   def __init__(self, username, answserscorrect, totalanswered, accuracy):
#     self.username = username
#     self.answerscorrect = answserscorrect
#     self.totalanswered = totalanswered
#     self.accuracy = accuracy

# db.create_all()

leaderboard = db.Table('leaderboard', db.metadata, autoload=True, autoload_with=db.engine)
    
@app.route('/leaderboard', methods=['GET'])
def get_items():
    results = db.session.query(leaderboard).all()
    return jsonify(results)

@app.route('/leaderboard/correct', methods=['GET'])
def get_items_correct():
    results = db.session.query(leaderboard.answerscorrect).all()
    return jsonify(results)

@app.route('/leaderboard/accuracy', methods=['GET'])
def get_items_accuracy():
    results = db.session.query(leaderboard.accuracy).all()
    return jsonify(results)
