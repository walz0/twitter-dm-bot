import './App.css';
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';
import Home from './components/Home';
import Config from './components/Config';

function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route path="/">
                        <Home />            
                    </Route>
                    <Route path="/results">

                    </Route>
                    <Route path="/config">
                        <Config />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
