import React from 'react';
import ReconnectingEventSource from "reconnecting-eventsource";
import MindMap from "./MindMap";
import EditBar from "./EditBar";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: {}
        };

        this.onNodeChange = this.onNodeChange.bind(this);

        function uuidv4() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }

        this.evtSource = new ReconnectingEventSource("/update/" + uuidv4());

        var app = this;
        this.evtSource.addEventListener("NODE_CHANGED", function (e) {
            const newNode = JSON.parse(e.data);
            console.log(newNode);

            const nodes = Object.assign({}, app.state.nodes, {[newNode.id]: newNode});

            app.setState({
                nodes: nodes
            });
            console.log(app.state.nodes);
        });

    }

    onNodeChange(newNode) {
        var data = new FormData();

        data.append("data", JSON.stringify(newNode));

        fetch("/update_node/" + newNode.id,
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
                            <EditBar nodes={this.state.nodes} onNodeChange={this.onNodeChange}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;