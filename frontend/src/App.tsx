import Login from "./autenticacion/Login"
import RegisterUser from "./autenticacion/RegisterUser"
import { Route, Routes, BrowserRouter } from "react-router-dom"
import Home from "./user/Home"
import Productos from "./user/pages/Productos"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<RegisterUser />} />
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Home />} />
          <Route path='/productos' element={<Productos />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
