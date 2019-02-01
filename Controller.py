from EventManager import EventType
from Repository import Repository
import uuid

class Controller:
    def __init__(self, event_manager):
        self.event_manager = event_manager
        self.repository = Repository()

    def load_node(self, user_id, node_id):
        if node_id is None:
            node_id = self.repository.get_god_node_uuid()

        self.watch_node(user_id, node_id)

        children = self.repository.get_children_ids(node_id)
        for child_id in children:
            self.watch_node(user_id, child_id)

        parents = self.repository.get_parent_ids(node_id)
        for parent_id in parents:
            self.watch_node(user_id, parent_id)

    def watch_node(self, user_id, node_id):
        if self.event_manager.watch(user_id, node_id):
            data = self.repository.get_node(node_id)
            self.event_manager.throw_for_client(user_id, EventType.NODE_CHANGED, data)

    def update_new_client(self, user_id):
        self.load_node(user_id, None)

    def add_node(self, user_id, parent_id):
        node_id = str(uuid.uuid4())
        self.repository.add_node(node_id, parent_id)

        self.load_node(user_id, node_id)

    def update_node(self, node_id, data):
        self.repository.update_node(node_id, data)
        self.node_changed(node_id)

    def node_changed(self, node_id):
        data = self.repository.get_node(node_id)
        self.event_manager.throw(EventType.NODE_CHANGED, data)