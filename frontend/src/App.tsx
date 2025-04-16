import Login from "./pages/Login"
import RegisterUser from "./pages/RegisterUser"
import { Route, Routes, BrowserRouter } from "react-router-dom"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<RegisterUser />} />
          <Route path='/' element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
