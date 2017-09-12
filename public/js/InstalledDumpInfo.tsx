import * as React from "react";
import axios from "axios";
import * as moment from "moment";

class InstalledDumpInfo extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {
            modificationDate: '',
            dumpSize: ''
        };
    }

    getInstalledDumpInfo() {

        let that = this;

        axios.get("/api/dump/installed").then(function (response: any) {

            let resp = response.data;
            var date = moment(resp.mtime);
            var dateComponent = date.utc().format('YYYY-MM-DD HH:mm:ss');

            that.setState({
                modificationDate: dateComponent,
                dumpSize: resp.size + ' bytes'
            });

        }).catch(function (error: any) {
            console.log(error);
        });
    }

    componentDidMount() {
        this.getInstalledDumpInfo();
    }

    render() {

        return <div className="panel">
            <h4>Installed dump info</h4>
            <div>Modification date: <span>{this.state.modificationDate}</span></div>
            <div>Dump size: <span>{this.state.dumpSize}</span></div>
        </div>;

    }
}

export default InstalledDumpInfo;