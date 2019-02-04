import sqlite3
from flask import g

god_node_uuid = "00000000-0000-0000-0000-000000000000"
fields = ["content", "file"]

class Repository:
    def __init__(self):
        pass

    def con(self):
        con = getattr(g, '_database_con', None)
        if con is None:
            con = g._database_con = sqlite3.connect('data/database.db')
            #self._create_tables()

        return con

    def _create_tables(self):
        with self.con() as con:
            con.execute("CREATE TABLE nodes (id char(36) primary key, content text DEFAULT '', file text DEFAULT '')")
            con.execute("CREATE TABLE node_connections (parent char(36), child char(36), is_main boolean, sorting integer, PRIMARY KEY (parent, child))")
            con.execute('INSERT INTO nodes VALUES (?, ?, ?)', (god_node_uuid, "Home", ""))

    def add_node(self, uuid, parent_uuid):
        with self.con() as con:
            con.execute('INSERT INTO nodes VALUES (?, ?, ?)', (uuid, "", ""))
            max_sorting = con.execute('SELECT max(sorting) FROM node_connections WHERE  parent=?', (parent_uuid,)).fetchone()[0]
            con.execute('INSERT INTO node_connections VALUES (?, ?, ?, ?)', (parent_uuid, uuid, True, 0 if max_sorting is None else max_sorting + 1))

    def move_node(self, node_id, old_parent, new_parent):
        with self.con() as con:
            con.execute('DELETE FROM node_connections WHERE child=? AND parent=?', (node_id, old_parent))
            max_sorting = con.execute('SELECT max(sorting) FROM node_connections WHERE parent=?', (new_parent,)).fetchone()[0]
            con.execute('INSERT INTO node_connections VALUES (?, ?, ?, ?)', (new_parent, node_id, True, 0 if max_sorting is None else max_sorting + 1))

    def change_sorting(self, parent_id, node_id, new_sorting):
        with self.con() as con:
            children_to_change = con.execute('SELECT child FROM node_connections WHERE parent=? AND sorting >= ?', (parent_id, new_sorting)).fetchall()
            children_to_change = [child[0] for child in children_to_change]
            con.execute('UPDATE node_connections SET sorting = sorting + 1 WHERE parent=? AND child in (%s)' % ','.join('?' * len(children_to_change)), tuple([parent_id] + children_to_change))
            con.execute('UPDATE node_connections SET sorting = ? WHERE parent=? AND child=?', (new_sorting, parent_id, node_id))
            return children_to_change

    def update_node(self, uuid, data):
        with self.con() as con:
            update_fields = set(fields) & set(data.keys())
            set_rule = ""
            for key in update_fields:
                set_rule += key + "=?,"
            con.execute('UPDATE nodes SET ' + set_rule[:-1] + ' WHERE id=?', tuple([data[key] for key in update_fields]) + (uuid,))

    def delete_node(self, node_id):
        with self.con() as con:
            con.execute('DELETE FROM node_connections WHERE child=?', (node_id,))
            con.execute('DELETE FROM nodes WHERE id=?', (node_id,))

    def add_connection(self, parent_uuid, child_uuid):
        with self.con() as con:
            con.execute('INSERT INTO node_connections VALUES (?, ?)', (parent_uuid, child_uuid))


    def get_node(self, uuid):
        with self.con() as con:
            data = con.execute('SELECT id, content, file, group_concat(node_connections.parent), group_concat(node_connections.sorting), main_connections.parent FROM nodes LEFT JOIN node_connections ON node_connections.child=id LEFT JOIN node_connections AS main_connections ON main_connections.is_main = 1 AND main_connections.child=id WHERE id=? GROUP BY id', (uuid,)).fetchone()

            parent_ids = [] if data[3] is None else data[3].split(',')
            parent_sortings = [] if data[4] is None else data[4].split(',')
            return {
                "id": data[0],
                "content": data[1],
                "file": data[2],
                "parents":  [{'id': a, 'sorting': int(b)} for a, b in zip(parent_ids, parent_sortings)],
                "main_parent": data[5],
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
