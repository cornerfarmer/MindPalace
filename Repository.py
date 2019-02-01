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
            #self._create_tables()

        return con

    def _create_tables(self):
        with self.con() as con:
            con.execute("CREATE TABLE nodes (id char(36) primary key, content text DEFAULT '')")
            con.execute("CREATE TABLE node_connections (parent char(36), child char(36), is_main boolean, PRIMARY KEY (parent, child))")
            con.execute('INSERT INTO nodes VALUES (?, ?)', (god_node_uuid, "Home"))

    def add_node(self, uuid, parent_uuid):
        with self.con() as con:
            con.execute('INSERT INTO nodes VALUES (?, ?)', (uuid, ""))
            con.execute('INSERT INTO node_connections VALUES (?, ?, ?)', (parent_uuid, uuid, True))

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
            data = con.execute('SELECT id, content, group_concat(node_connections.parent), main_connections.parent FROM nodes LEFT JOIN node_connections ON node_connections.child=id LEFT JOIN node_connections AS main_connections ON main_connections.is_main = 1 AND main_connections.child=id WHERE id=? GROUP BY id', (uuid,)).fetchone()

            return {
                "id": data[0],
                "content": data[1],
                "parents": [] if data[2] is None else data[2].split(','),
                "main_parent": data[3],
            }


    def get_children_ids(self, uuid):
        with self.con() as con:
            children = con.execute('SELECT child FROM node_connections WHERE parent=?', (uuid,)).fetchall()

            return [child[0] for child in children]

    def get_parent_ids(self, uuid):
        with self.con() as con:
            parents = con.execute('SELECT parent FROM node_connections WHERE child=?', (uuid,)).fetchall()

            return [parent[0] for parent in parents]

    def get_god_node_uuid(self):
        return god_node_uuid
