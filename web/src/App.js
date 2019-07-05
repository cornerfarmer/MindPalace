import React from 'react';
import ReconnectingEventSource from "reconnecting-eventsource";
import MindMap from "./MindMap";
import EditBar from "./EditBar";
import 'react-image-lightbox/style.css';

export const Command = Object.freeze({"UPDATE":1, "DELETE":2, "CREATE":3, "MOVE":4, "LOAD":5, "DELETE_FILE":6, "UPDATE_FILE":7});

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            nodes: {},
            focusedNode: "00000000-0000-0000-0000-000000000000",
            selectedNode: "00000000-0000-0000-0000-000000000000"
        };

        this.selectNode = this.selectNode.bind(this);
        this.onSendCommand = this.onSendCommand.bind(this);
        this.focusNode = this.focusNode.bind(this);

        function uuidv4() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }

        this.user_id = uuidv4();
        this.evtSource = new ReconnectingEventSource("/update/" + this.user_id);

        var app = this;
        this.evtSource.addEventListener("NODE_CHANGED", function (e) {
            const newNodeData = JSON.parse(e.data);

            const nodes = Object.assign({}, app.state.nodes);

            if (newNodeData.id in nodes) {
                nodes[newNodeData.id].content = newNodeData.content;
                nodes[newNodeData.id].file = newNodeData.file;

                for (const parent of nodes[newNodeData.id].parents) {
                    if (newNodeData.parents.findIndex(e => e.id === parent.id) === -1) {
                        const child_index = parent.children.findIndex(e => e.node.id === newNodeData.id);
                        parent.children.splice(child_index, 1)
                    }
                }

                nodes[newNodeData.id].parents = newNodeData.parents;
            } else {
                nodes[newNodeData.id] = newNodeData;
                nodes[newNodeData.id].children = [];
                nodes[newNodeData.id].loaded = false;
            }
            const newNode = nodes[newNodeData.id];

            var parent_nodes = [];
            for (const parent of newNode.parents) {
                if (!(parent.id in nodes))
                    nodes[parent.id] = {id: parent, children: [], content: ""};

                parent_nodes.push(nodes[parent.id]);
                if (parent.id === newNodeData.main_parent)
                    newNode.main_parent = nodes[parent.id];
            }

            for (const parent_index in parent_nodes) {
                const parent = parent_nodes[parent_index];
                const parentData = newNodeData.parents[parent_index];
                var child_index = -1;
                for (const c in parent.children) {
                    if (parent.children[c].node.id === newNode.id) {
                        child_index = c;
                        break;
                    }
                }

                if (child_index === -1)
                    parent.children.push({node: newNode, sorting: parentData.sorting});
                else if (parent.children[child_index].sorting !== parentData.sorting)
                    parent.children[child_index].sorting = parentData.sorting;

                if (child_index === -1 || parent.children[child_index].sorting !== parentData.sorting)
                    parent.children.sort(function(a, b){return a.sorting - b.sorting});
            }

            newNode.parents = parent_nodes;

            app.setState({
                nodes: nodes
            });
            console.log(app.state.nodes);
        });

        this.evtSource.addEventListener("NODE_DELETED", function (e) {
            const nodeData = JSON.parse(e.data);

            const nodes = Object.assign({}, app.state.nodes);

            if (nodeData.id in nodes) {
                const nodeToDelete = nodes[nodeData.id];
                for (const parent of nodeToDelete.parents) {
                    var child_index = -1;
                    for (const c in parent.children) {
                        if (parent.children[c].node.id === nodeData.id) {
                            child_index = c;
                            break;
                        }
                    }

                    parent.children.splice(child_index, 1);
                }
                delete nodes[nodeData.id];
            }

            app.setState({
                nodes: nodes
            });
        });

    }

    onSendCommand(command, args, callback=null) {
        var data = new FormData();

        if (command === Command.UPDATE) {
            let node = args;
            data.append("data", JSON.stringify(node));

            fetch("/update_content/" + node.id,
                {
                    method: "POST",
                    body: data
                })
                .then(
                    (result) => {
                        if (callback !== null)
                            callback(result);
                    },
                    (error) => {

                    }
                );
        } else if (command === Command.UPDATE_FILE) {
            const formData = new FormData();
            formData.append('file', args.file);

            fetch("/update_file/" + args.node_id, {
                method: 'POST',
                body: formData
            })
            .then(
                (result) => {
                    if (callback !== null)
                        callback(result);
                },
                (error) => {

                }
            );
        } else if (command === Command.CREATE) {
            fetch("/add_node/" + this.user_id + "/" + args.parent_id + "/" + args.sorting)
            .then(res => res.json())
            .then(
                (result) => {
                    if (callback !== null)
                        callback(result);
                },
                (error) => {

                }
            );
        } else if (command === Command.DELETE) {
            fetch("/delete_node/" + args)
            .then(
                (result) => {
                    if (callback !== null)
                        callback(result);
                },
                (error) => {

                }
            );
        }  else if (command === Command.DELETE_FILE) {
            fetch("/delete_file/" + args)
            .then(
                (result) => {
                    if (callback !== null)
                        callback(result);
                },
                (error) => {

                }
            );
        } else if (command === Command.MOVE) {
            fetch("/move_node/" + args.node_id + "/" + args.old_parent_id + "/" + args.new_parent_id + ("sorting" in args ? "/" + args.sorting : ""))
            .then(
                (result) => {
                    if (callback !== null)
                        callback(result);
                },
                (error) => {

                }
            );
        } else if (command === Command.LOAD) {
            fetch("/load_node/" + this.user_id + "/" + args.node_id)
            .then(
                (result) => {
                    const nodes = Object.assign({}, this.state.nodes);

                    nodes[args.node_id].loaded = true;

                    this.setState({
                        nodes: nodes
                    });

                    if (callback !== null)
                        callback(result);
                },
                (error) => {

                }
            );
        }
    }

     selectNode(node_id) {
        this.setState({
            selectedNode: node_id
        });
    }

    focusNode(node_id) {
        if (node_id in this.state.nodes) {
            if (!this.state.nodes[node_id].loaded) {
                this.onSendCommand(Command.LOAD, {node_id: node_id});
            }

            this.setState({
                focusedNode: node_id
            });
        }
    }

    render() {
        return (
            <div id="page">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-9">
                            <MindMap nodes={this.state.nodes} onSendCommand={this.onSendCommand} focusedNode={this.state.focusedNode} focusNode={this.focusNode} selectedNode={this.state.selectedNode} selectNode={this.selectNode}/>
                        </div>
                        <div className="col-sm-3">
                            <EditBar nodes={this.state.nodes} onSendCommand={this.onSendCommand} focusedNode={this.state.focusedNode} focusNode={this.focusNode} selectedNode={this.state.selectedNode} selectNode={this.selectNode}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

App.Command = Command;

export default App;