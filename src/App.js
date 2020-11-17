import './App.less';
import routes from './router'
import dva from './store'
import { HashRouter } from "react-router-dom";
import { renderRoutes } from "react-router-config";
import {Provider} from 'react-redux'
function App () {
  const app = dva()
  app.model()
  const store = app.start()
 

  return (
    <Provider store={store}>
      <HashRouter>
        {renderRoutes(routes)}
      </HashRouter>
    </Provider>
  );
}

export default App;
