import React from 'react';
import * as d3 from "d3";
import EditNode from "./EditNode";

class EditBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focusedNode: "00000000-0000-0000-0000-000000000000",
            nodeListing: []
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.nodes !== this.props.nodes && this.state.focusedNode in this.props.nodes) {
            var nodeListing = [];
            const focusedNode = this.props.nodes[this.state.focusedNode];

            nodeListing.push(focusedNode);
            this.setState({
                nodeListing: nodeListing
            });
        }
    }

    render() {
        return (
             <div>
                 {this.state.nodeListing.map((node) => (
                     <EditNode
                         key={node.id}
                         node={node}
                         onNodeChange={this.props.onNodeChange}
                        />
                 ))}
             </div>
        );
    }
}

export default EditBar;