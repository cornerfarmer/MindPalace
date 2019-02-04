import React from 'react';
import * as d3 from "d3";
import {Command} from "./App";
import Lightbox from 'react-image-lightbox';


class File extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lightBox: false
        };
        this.openLightBox = this.openLightBox.bind(this);
    }

    openLightBox(e) {
        this.setState({ lightBox: true });
        e.stopPropagation();
    }

    render() {
        let content = <div>Nothing</div>;

        let filename = this.props.file.substr(0, this.props.file.indexOf("/"));
        let mimetype = this.props.file.substr(this.props.file.indexOf("/") + 1);

        if (mimetype.startsWith("image/")) {
            content = <div>
                <img src={"/file/" + filename} height="100" onClick={this.openLightBox} />
                {this.state.lightBox && (
                  <Lightbox
                    mainSrc={"/file/" + filename}
                    onCloseRequest={() => this.setState({ lightBox: false })}
                  />
                )}
            </div>
        } else {
            content = <a href={"/file/" + filename} target="_blank">Open file</a>
        }

        return (
            <div>
                {content}
            </div>
        );
    }
}

export default File;