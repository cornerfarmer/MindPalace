import React from 'react';
import * as d3 from "d3";

class MindMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focusedNode: "00000000-0000-0000-0000-000000000000"
        };
        this.svg = React.createRef();
        this.nodes = React.createRef();
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.focusedNode in this.props.nodes) {
            var mapNodes = [];
            const focusedNode = this.props.nodes[this.state.focusedNode];

            mapNodes.push({node: focusedNode, x: 0, y: 0});

            var nodeElements = d3.select(this.nodes.current)
                .selectAll("div")
                .data(mapNodes);

            nodeElements.exit().remove();
            nodeElements.enter().append("div")
                .merge(nodeElements)
                .text(d => d.node.content)
                .style("left", d => d.x + "px")
                .style("top", d => d.y + "px");
        }
    }

    render() {
        return (
             <div className="container">
                 <svg ref={this.svg}></svg>
                 <div ref={this.nodes} className="nodes">
                 </div>
             </div>
        );
    }
}

export default MindMap;