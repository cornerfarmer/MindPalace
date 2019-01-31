import React from 'react';
import ReconnectingEventSource from "reconnecting-eventsource";
import MindMap from "./MindMap";
import EditBar from "./EditBar";

export const Command = Object.freeze({"UPDATE":1, "DELETE":2, "CREATE":3});

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            nodes: {}
        };

        this.onSendCommand = this.onSendCommand.bind(this);

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
            const newNode = JSON.parse(e.data);

            const nodes = Object.assign({}, app.state.nodes);

            if (newNode.id in nodes) {
                nodes[newNode.id].content = newNode.content;
                nodes[newNode.id].parents = newNode.parents; //TODO: Diff
            } else {
                nodes[newNode.id] = newNode;
                nodes[newNode.id].children = [];
            }

            var parent_nodes = [];
            for (const parent of newNode.parents) {
                if (!(parent in nodes))
                    nodes[parent] = {id: parent, children: [], content: ""};
                parent_nodes.push(nodes[parent])
            }
            nodes[newNode.id].parents = parent_nodes;

            for (const parent of newNode.parents) {
                if (!(newNode.id in parent.children))
                    parent.children.push(newNode);
            }

            app.setState({
                nodes: nodes
            });
            console.log(app.state.nodes);
        });

    }

    onSendCommand(command, args) {
        var data = new FormData();

        if (command === Command.UPDATE) {
            let node = args;
            data.append("data", JSON.stringify(node));

            fetch("/update_node/" + node.id,
                {
                    method: "POST",
                    body: data
                })
                .then(res => res.json())
                .then(
                    (result) => {

                    },
                    (error) => {

                    }
                );
        } else if (command === Command.CREATE) {
            let parent_id = args;
            fetch("/add_node/" + this.user_id + "/" + parent_id)
            .then(res => res.json())
            .then(
                (result) => {

                },
                (error) => {

                }
            );
        }
    }

    render() {
        return (
            <div id="page">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-8">
                            <MindMap nodes={this.state.nodes}/>
                        </div>
                        <div className="col-sm-4">
                            <EditBar nodes={this.state.nodes} onSendCommand={this.onSendCommand}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

App.Command = Command;

export default App;