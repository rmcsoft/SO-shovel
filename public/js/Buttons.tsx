import * as React from "react";
import ExtractNormalizedDataButton from "./ExtractNormalizedDataButton";
import UpdateSoDumpButton from "./UpdateSoDumpButton";
import UpdateSoUserDumpButton from "./UpdateSoUserDumpButton";

class Buttons extends React.Component<any, any> {

    render() {
        return <div>
            <ExtractNormalizedDataButton />
            <UpdateSoDumpButton />
            <UpdateSoUserDumpButton />
        </div>;
    }
}

export default Buttons;