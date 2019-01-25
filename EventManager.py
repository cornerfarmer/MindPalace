import json
import logging
from enum import Enum
try:
  from pathlib2 import Path
except ImportError:
  from pathlib import Path
try:
    from Queue import Queue
except ImportError:
    from queue import Queue

class FlashMessage:
    def __init__(self, message, short, level):
        self.message = message
        self.short = short
        self.level = level

class ServerSentEvent(object):
    def __init__(self, event_type, data, parent_data=None):
        self.data = self._pack_data_for_client(event_type, data, parent_data)
        self.event = event_type

    def _pack_data_for_client(self, event_type, data, parent_data=None):
        data_client = {}
        if event_type in [EventType.NODE_CHANGED]:
            data_client = data.copy()
        else:
            raise LookupError("Given data type not supported: " + str(data))

        return data_client

    def encode(self):
        if not self.data:
            return ""
        lines = ""
        print( str(self.event.value))
        lines += "event: " + str(self.event.value) + "\n"
        lines += "data: " + json.dumps(self.data) + "\n"
        return lines + "\n\n"


class EventType(Enum):
    NODE_CHANGED = "NODE_CHANGED"

class EventManager:
    def __init__(self):
        self.subscriptions = []
        #self.logger = Logger(Path('.'), 'global')

    def subscribe(self, user_id):
        subscription = self._user_by_id(user_id)
        if subscription is None:
            self.subscriptions.append({"queue": Queue(), "watch_list": set(), "id": user_id})
            subscription = self.subscriptions[-1]

        return subscription["queue"]

    def throw(self, event_type, data, parent_data=None):
        event = ServerSentEvent(event_type, data, parent_data)
        for subscription in self.subscriptions:
            if data["id"] in subscription["watch_list"]:
                subscription["queue"].put(event)

    def throw_for_client(self, user_id, event_type, data, parent_data=None):
        event = ServerSentEvent(event_type, data, parent_data)
        self._user_by_id(user_id)["queue"].put(event)

    def unsubscribe(self, subscription):
        self.subscriptions.remove(subscription)

    def log(self, message, short="", level=logging.INFO):
        #self.logger.log(message, level)
        if short is "":
            short = message
        self.throw(EventType.FLASH_MESSAGE, FlashMessage(message, short, level))

    def _user_by_id(self, user_id):
        for subscription in self.subscriptions:
            if subscription["id"] == user_id:
                return subscription
        return None

    def watch(self, user_id, node_id):
        self._user_by_id(user_id)["watch_list"].add(node_id)