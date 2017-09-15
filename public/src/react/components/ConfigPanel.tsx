import * as React from "react";
import axios from "axios";

class ConfigPanel extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {
            config: ''
        };
    }

    getConfig() {

        let that = this;
        axios.get("/api/config").then(function (response: any) {

            let resp = JSON.stringify(response.data, null, 2);

            console.log(resp);
            that.setState({ config: resp });
        }).catch(function (error: any) {
            console.log(error);
        });
    }

    componentDidMount() {
        this.getConfig();
    }

    render() {

        return <div className="panel">
            <h4>Configuration</h4>
            <pre>
                {this.state.config}
            </pre>
        </div>;

    }
}

export default ConfigPanel;