import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { Provider } from 'react-redux';


import { createStore } from 'redux';


const initialState = {
  data: [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]
};

function reducer(state = initialState, action) {
  switch(action.type) {
    case 'UPDATE_DATA':
      return {
        ...state,
        data: action.payload
      };
    default:
      return state;
  }
}

const store = createStore(reducer);


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // </React.StrictMode>,
)
