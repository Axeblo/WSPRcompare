import './BottomBar.css';
import './App.css';
import { connect } from 'react-redux';

import MyTable from './MyTable';

function prmiseNoDataTable(WSPRPromise,WSPRData,WSPRError) {
    if(!WSPRPromise)
      return <div className="loading_table">No data 😓</div>;
    if(!WSPRData) {
      if(!WSPRError)
        return <div className="loading_table"><div className="lds-dual-ring"></div></div>;
      else
        return <h1>Error...</h1>;
    }
    if(!WSPRError)
      return "";
  }

function BottomBar({data}) {
    // return <div className="BottomBar">{data.map(row=>(<div>{row[3]}</div>) )}</div>;
    console.log(data);
    return <div className="BottomBar"><MyTable data={data.data} meta={data.meta}/></div>;
}

function mapStateToProps(state) {
    return {
      data: state.data
    }
  }
  
export default connect(mapStateToProps)(BottomBar);