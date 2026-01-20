import './App.css'
import Hexagons from './components/Hexagons'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <Hexagons />
    </ThemeProvider>
  )
}

export default App