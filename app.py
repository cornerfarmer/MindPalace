from flask import Flask, jsonify, Response


from flask import request, render_template, send_from_directory

from Controller import Controller
from EventManager import EventManager
import json
try:
  from pathlib2 import Path
except ImportError:
  from pathlib import Path
import os
from werkzeug.utils import secure_filename
import hashlib
def run():
    event_manager = EventManager()

    controller = Controller(event_manager)

    app = Flask(__name__, static_folder="web/dist", static_url_path="/static", template_folder="web/dist")

    @app.route('/')
    def static_page():
        return render_template('index.html')

    @app.route('/update/<string:user_id>')
    def update(user_id):
        def gen():
            with app.app_context():
                q = event_manager.subscribe(user_id)
                print("subscribe")

                controller.update_new_client(user_id)

                try:
                    while True:
                        event = q.get()
                        yield event.encode()
                finally:
                    event_manager.unsubscribe(user_id)
                    print("unsubscribe")

        return Response(gen(), mimetype="text/event-stream")

    @app.route('/load_node/<string:user_id>/<string:node_id>')
    def load_node(user_id, node_id):
        return jsonify(controller.load_node(user_id, node_id))

    @app.route('/add_node/<string:user_id>/<string:parent_id>')
    @app.route('/add_node/<string:user_id>/<string:parent_id>/<int:sorting>')
    def add_node(user_id, parent_id, sorting=-1):
        node_id = controller.add_node(user_id, parent_id, sorting)
        return jsonify({'id': node_id})

    @app.route('/update_content/<string:node_id>', methods=['POST'])
    def update_content(node_id):
        controller.update_node(node_id, json.loads(request.form.get('data')))

        return ""

    @app.route('/update_file/<string:node_id>', methods=['POST'])
    def update_file(node_id):
        if 'file' in request.files:
            file = request.files['file']

            if file.filename != '':
                hash_md5 = hashlib.md5()
                for chunk in iter(lambda: file.stream.read(4096), b""):
                    hash_md5.update(chunk)
                file.stream.seek(0)

                filename = secure_filename(node_id + "_" + hash_md5.hexdigest() + file.filename[file.filename.rfind('.'):])

                file.save(os.path.join("data/uploads/", filename))

                controller.delete_file(node_id)
                controller.update_node(node_id, {"file": filename + "/" + file.mimetype})

        return ""

    @app.route('/file/<string:path>')
    def file(path):
        return send_from_directory('data/uploads', path)

    @app.route('/delete_node/<string:node_id>')
    def delete_node(node_id):
        controller.delete_node(node_id)

        return ""

    @app.route('/delete_file/<string:node_id>')
    def delete_file(node_id):
        controller.delete_file(node_id)

        return ""

    @app.route('/move_node/<string:node_id>/<string:old_parent>/<string:new_parent>')
    @app.route('/move_node/<string:node_id>/<string:old_parent>/<string:new_parent>/<int:sorting>')
    def move_node(node_id, old_parent, new_parent, sorting=-1):
        controller.move_node(node_id, old_parent, new_parent, sorting)

        return ""

    return app

def create_app():
    return run()