import './App.css';
import {useEffect} from 'react';
import {HashRouter as Router, 
  Switch, Route, Link} from "react-router-dom"
import Home from './windows/home/Home';
import New from './windows/New/New'
import Report_Date from './windows/Date/Report_Date'
import Selector from './windows/Selector/Selector'
import Register_entry from './windows/register_entry/Register_entry'
import Multiple_Selector from './windows/Multiple_Selector/Multiple_Selector'
import Memo_entry from './windows/memo_entry/Memo_entry'
function App() {

  const nextString = "Supplier"

  return (
    <>
    <Router>
      <Switch>
        <Route path="/memo_entry/:party/:supplier" component={Memo_entry} />
        <Route path="/new/:entity" component={New}/>
        <Route path="/multiple_selector/:report/:mode/:from/:to/:suppliers" component={Multiple_Selector} />
        <Route path="/date_select/:report" component={Report_Date} />
        <Route path="/selector/:mode/:type/:supplier"  component={Selector}/>
        <Route path="/register_entry/:supplier" component={Register_entry}/>
        <Route path="/" exact component={Home}/>
      </Switch>
    </Router>
    </>
  );
}

export default App;
