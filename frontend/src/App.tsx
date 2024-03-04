import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/NavBar/NavBar'
import PipelinesPage from './pages/PipelinesPage/PipelinesPage'
import AddPipelinePage from './pages/AddPipelinesPage/AddPipelinePage'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import PipelineItem from './pages/PipelinesPage/PipelineItem'

function App() {


  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <>
      <BrowserRouter>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Navbar />
          <Routes>
            <Route path="/home" element={<PipelinesPage />} />
            <Route path="/pipelines" element={<PipelinesPage />} />
            <Route path="/pipelines/:id" element={<PipelineItem />} />
            <Route path="/add" element={<AddPipelinePage />} />
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </>
  )
}

export default App
