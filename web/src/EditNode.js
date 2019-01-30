import React from 'react';
import * as d3 from "d3";

class EditNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: props.node.content
        };
        this.contentField = React.createRef();

        this.updateContent = this.updateContent.bind(this);
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    updateContent(evt) {
        const newNode = Object.assign(this.props.node, {content: evt.target.value});

        this.props.onNodeChange(newNode);
        this.setState({
            content: evt.target.value
        });
    }

    render() {
        return (
             <div>
                 <input ref={this.contentField} type="text" name="content" value={this.state.content} onChange={evt => this.updateContent(evt)} />
             </div>
        );
    }
}

export default EditNode;