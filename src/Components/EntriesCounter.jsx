import React from "react";
import "../styles/EntriesCounter.css"

function EntriesCounter({dataTable}) {
    if( !dataTable || !dataTable.data )
        return <div className="EntriesCounter">No data</div>;
    return (
        <div className="EntriesCounter">{dataTable.data.length}</div>
    );
}

export default EntriesCounter;