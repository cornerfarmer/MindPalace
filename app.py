from flask import Flask, jsonify, Response


from flask import request, render_template

from Controller import Controller
from EventManager import EventManager
import json
try:
  from pathlib2 import Path
except ImportError:
  from pathlib import Path

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

    @app.route('/add_node/<string:user_id>/<string:parent_id>/')
    def add_node(user_id, parent_id):
        controller.add_node(user_id, parent_id)
        return ""

    @app.route('/update_node/<string:node_id>', methods=['POST'])
    def update_node(node_id):
        controller.update_node(node_id, json.loads(request.form.get('data')))

        return ""

    return app

def create_app():
    return run()