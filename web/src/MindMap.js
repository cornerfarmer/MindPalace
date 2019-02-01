import React from 'react';
import * as d3 from "d3";

const layer_offset = 50;
const space_between = 50;
const node_width = 70;

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
        window.addEventListener("resize", this.rebuildNodes.bind(this));
    }

      componentWillUnmount() {
        window.removeEventListener("resize", this.rebuildNodes.bind(this));
      }


    addChildNodes(mapNodes, parentMapNode, except_node=null) {

        var child_x = parentMapNode.x - this.calc_x_offset(parentMapNode.node.children.length - 1) / 2;
        for (const child of parentMapNode.node.children) {
            if (except_node !== child) {
                mapNodes.push({node: child, x: child_x, y: parentMapNode.y + layer_offset});
            }
            child_x += space_between + node_width;
        }
    }

    addParentNodes(mapNodes, node, prevMapNode) {
        var parent = node.main_parent;
        if (parent !== null) {
            var x_offset = this.calc_x_offset(parent.children.indexOf(node)) - this.calc_x_offset(parent.children.length) / 2;

            mapNodes.push({node: parent, x: prevMapNode.x - x_offset, y: prevMapNode.y - layer_offset});

            this.addParentNodes(mapNodes, parent, mapNodes[mapNodes.length - 1]);
            this.addChildNodes(mapNodes, parent, node);
        }
    }

    calc_x_offset(node_number) {
        return node_number * (space_between + node_width)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.focusedNode in this.props.nodes) {
          this.rebuildNodes();
        }
    }

    rebuildNodes() {
        var mapNodes = [];
        var nodesContainer = d3.select(this.nodes.current);
        const focusedNode = this.props.nodes[this.state.focusedNode];

        mapNodes.push({node: focusedNode, x: nodesContainer.node().getBoundingClientRect().width / 2, y: nodesContainer.node().getBoundingClientRect().height / 2});
        this.addParentNodes(mapNodes, focusedNode, mapNodes[0]);
        this.addChildNodes(mapNodes, mapNodes[0]);

        var nodeElements = nodesContainer
            .selectAll("div")
            .data(mapNodes);

        nodeElements.exit().remove();
        nodeElements.enter().append("div")
            .attr("class", "node")
            .merge(nodeElements)
            .text(d => d.node.content)
            .style("left", d => d.x + "px")
            .style("top", d => d.y + "px");
    }

    render() {
        return (
             <div className="mind-map">
                 <svg ref={this.svg}></svg>
                 <div ref={this.nodes} className="nodes">
                 </div>
             </div>
        );
    }
}

export default MindMap;