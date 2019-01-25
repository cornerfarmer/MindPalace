from EventManager import EventType
from Repository import Repository
import uuid

class Controller:
    def __init__(self, event_manager):
        self.event_manager = event_manager
        self.repository = Repository()

    def load_node(self, user_id, node_id):
        if node_id is None:
            data = self.repository.get_god_node()
        else:
            data = self.repository.get_node(node_id)

        self.event_manager.watch(user_id, node_id)
        self.event_manager.throw_for_client(user_id, EventType.NODE_CHANGED, data)

    def update_new_client(self, user_id):
        self.load_node(user_id, None)

    def add_node(self, user_id, data):
        node_id = str(uuid.uuid4())
        node_id = self.repository.add_node(node_id, data)
        self.load_node(user_id, node_id)