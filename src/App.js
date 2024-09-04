import './App.css';
import React, {useState} from 'react';
import {BrowserRouter as Router, 
  Switch, Route, Link} from "react-router-dom";
import Dashboard from './windows/Dashboard/Dashboard';
import New from './windows/New/New'
import Report_Date from './windows/Date/Report_Date'
import Selector from './windows/Selector/Selector'
import RegisterEntry from './windows/register_entry/RegisterEntry'
import Multiple_Selector from './windows/Multiple_Selector/Multiple_Selector'
import MemoEntry from './windows/memo_entry/MemoEntry'
import OrderFormEntry from './windows/OrderForm/OrderForm';
import View from './windows/View/View'
import Login from './windows/Login/Login'
import DataEntry from './windows/DataEntry/DataEntry';
import {base} from './proxy_url'

// creating a context
export const LoginContext = React.createContext()

// change it back to hash router
function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  // Checking if the right proxy is being set
  return (
    <>
    <LoginContext.Provider value={{token, setToken}}>
    <Router>
        {token && token != "" && token != undefined? 
      <Switch>
        <Route path="/memo_entry/:party/:supplier" component={MemoEntry} />
        <Route path="/new/:entity" component={New}/>
        <Route path="/multiple_selector/:report/:mode/:from/:to/:suppliers" component={Multiple_Selector} />
        <Route path="/date_select/:report" component={Report_Date} />
        <Route path="/selector/:mode/:type/:supplier"  component={Selector}/>
        <Route path="/register_entry/:type/:supplier?" component={RegisterEntry}/>
        <Route path="/order_form" component={OrderFormEntry}/>
        <Route path="/data_entry" component={DataEntry}/>
        <Route path="/view" component={View}/>
        <Route path="/" exact component={Dashboard}/>
      </Switch>
        :
        <Login />
        }
    </Router>
    </LoginContext.Provider>
    
    </>
  );
}

export default App;
