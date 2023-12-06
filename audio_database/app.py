# app.py
from flask import Flask, request, jsonify, make_response, render_template
from models import db, Audio
import os
import uuid

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///audio.db'
db.init_app(app)


@app.route('/upload', methods=['POST'])
def upload_audio():
    if 'audio_file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    audio_file = request.files['audio_file']
    if audio_file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if audio_file:
        # Generate a unique filename (e.g., using UUID)
        unique_filename = str(uuid.uuid4()) + '.mp3'
        filename = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        audio_file.save(filename)

        # Save metadata and filename in the database
        data = {
            'timestamp': request.form['timestamp'],
            'name': request.form['name'],
            'speaker': request.form['speaker'],
            'misc': request.form['misc'],
            'filename': unique_filename,
        }
        new_audio = Audio(**data)
        db.session.add(new_audio)
        db.session.commit()

        return jsonify({'message': 'File uploaded successfully'}), 201


@app.route('/audio/<int:audio_id>', methods=['GET'])
def get_audio(audio_id):
    audio = Audio.query.get(audio_id)
    if audio is None:
        return jsonify({'message': 'Audio not found'}), 404

    # Retrieve the associated audio file and send it as a response
    audio_filename = os.path.join(app.config['UPLOAD_FOLDER'], audio.filename)
    if os.path.exists(audio_filename):
        with open(audio_filename, 'rb') as file:
            response = make_response(file.read())
            response.headers['Content-Type'] = 'audio/mpeg'
            return response
    else:
        return jsonify({'message': 'Audio file not found'}), 404



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test')
def testindex():
    return render_template('testindex.html')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        app.run(debug=True, host="0.0.0.0", port=5001, ssl_context=('certs/cert.pem', 'certs/key.pem'))
