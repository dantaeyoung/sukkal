# models.py (SQLite database model)
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Audio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.String(255))
    name = db.Column(db.String(255))
    speaker = db.Column(db.String(255))
    filename = db.Column(db.String(255))

