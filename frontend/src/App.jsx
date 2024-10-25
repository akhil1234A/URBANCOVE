import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import AdminLogin from './Pages/Admin/Login'
const App = () => {
  return (
    <Router>
    <Routes>
      <Route path='/admin/login' element={<AdminLogin/>}/>
    </Routes>
  </Router>
  )
}

export default App
