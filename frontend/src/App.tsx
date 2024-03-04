import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/NavBar/NavBar'
import PipelinesPage from './pages/PipelinesPage/PipelinesPage'
import AddPipelinePage from './pages/AddPipelinesPage/AddPipelinePage'

function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/home" element={<PipelinesPage />} />
          <Route path="/pipelines" element={<PipelinesPage />} />
          <Route path="/add" element={<AddPipelinePage />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
