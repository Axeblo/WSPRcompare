import React from "react";
import "../styles/EntriesCounter.css"

function EntriesCounter({datasets, defaultDatasetIndex}) {
    if( !Array.isArray(datasets) )
        return <div className="EntriesCounter error">incorrect data</div>

    var dataset = datasets[defaultDatasetIndex];

    if( dataset === undefined )
        return <div className="EntriesCounter error">No dataset at index</div>

    var status = dataset["status"];
    if( status === undefined )
        return <div className="EntriesCounter error">No status set</div>

    if( status === "loading" )
        return <div className="EntriesCounter"><div className="loading"><div className="lds-dual-ring"></div></div></div>

    if( status === "no_action" )
        return <div className="EntriesCounter">No query</div>

    var dataTable = dataset["dataTable"];
    if(dataTable === undefined)
        return <div className="EntriesCounter error">No dataTable</div>
    
    if(dataTable === null)
        return <div className="EntriesCounter error">No dataTable</div>
 
    if( dataTable.data === undefined )
        return <div className="EntriesCounter">No data</div>;

    return <div className="EntriesCounter">{dataTable.data.length}</div>
}

export default EntriesCounter;