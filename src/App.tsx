
import './App.css'
import {Provider} from 'react-redux'
import store from './store/store'
import { BrowserRouter,Route,Routes } from 'react-router-dom'

function App() {


  return (
    <>
      <Provider store={store}>
        <BrowserRouter> 
          <Routes>
            <Route path='/' element={<h1>This is home page</h1>} />
          </Routes>
        </BrowserRouter>

      </Provider>
    
    
    </>
  )
}

export default App
