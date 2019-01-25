import React from 'react';
import ReconnectingEventSource from "reconnecting-eventsource";

class App extends React.Component {
    constructor(props) {
        super(props);

        function uuidv4() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }

        this.evtSource = new ReconnectingEventSource("/update/" + uuidv4());
    }

    render() {
        return (
            <div id="page">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-8">
                        </div>
                        <div className="col-sm-4">
                        </div>
                    </div>
                </div>
                <ControlBar evtSource={this.evtSource}/>
            </div>
        );
    }
}

export default App;