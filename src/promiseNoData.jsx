import './styles/promiseNoData.css';
function promiseNoData(WSPRPromiseState) {
    if(!WSPRPromiseState.promise)
      return <div className="loading">No data 😓</div>;
    if(!WSPRPromiseState.data) {
      if(!WSPRPromiseState.error)
        return <div className="loading"><div className="lds-dual-ring"></div></div>;
      else
        return <h1>Promise error...</h1>;
    }
    if(!WSPRPromiseState.error)
      return "";
  }

  export default promiseNoData;