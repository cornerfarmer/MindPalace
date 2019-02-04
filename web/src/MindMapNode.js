import React from 'react';
import File from "./File";

class MindMapNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        console.log(this.props.node.id);
        console.log(this.props.enlarged_id);
        return (
            <div>
                {this.props.node.file && <File file={this.props.node.file} width="100%" height={100} />}
                {this.props.node.id === this.props.enlarged_id ? (
                    <span>{this.props.node.content}</span>
                    ) : (
                    <span>{this.props.node.content.substr(0, 30)} {this.props.node.content.length > 30 && <a onClick={() => this.props.enlarge(this.props.node.id)}>More...</a>}</span>
                )}
            </div>
        );
    }
}

export default MindMapNode;