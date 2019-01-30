import sqlite3
from flask import g

god_node_uuid = "00000000-0000-0000-0000-000000000000"
fields = ["content"]

class Repository:
    def __init__(self):
        pass

    def con(self):
        con = getattr(g, '_database_con', None)
        if con is None:
            con = g._database_con = sqlite3.connect('data.db')
            #c = g._database_cursor = conn.cursor()
            #self._create_tables()

        return con

    def _create_tables(self):
        with self.con() as con:
            con.execute("CREATE TABLE nodes (id char(36) primary key, content text)")
            con.execute("CREATE TABLE node_connections (parent char(36), child char(36), PRIMARY KEY (parent, child))")
            con.execute('INSERT INTO nodes VALUES (?, ?)', (god_node_uuid, ""))

    def add_node(self, uuid, parent_uuid, data):
        with self.con() as con:
            con.execute('INSERT INTO nodes VALUES (?, ?)', (uuid,) + tuple([data[key] for key in fields]))
            con.execute('INSERT INTO node_connections VALUES (?, ?)', (parent_uuid, uuid))

    def update_node(self, uuid, data):
        with self.con() as con:
            set_rule = ""
            for key in fields:
                set_rule += key + "=?,"
            con.execute('UPDATE nodes SET ' + set_rule[:-1] + ' WHERE id=?', tuple([data[key] for key in fields]) + (uuid,))

    def add_connection(self, parent_uuid, child_uuid):
        with self.con() as con:
            con.execute('INSERT INTO node_connections VALUES (?, ?)', (parent_uuid, child_uuid))


    def get_node(self, uuid):
        with self.con() as con:
            data = con.execute('SELECT * FROM nodes WHERE id=?', (uuid,)).fetchone()

            return {
                "id": data[0],
                "content": data[1],
            }

    def get_god_node(self):
        return self.get_node(god_node_uuid)
