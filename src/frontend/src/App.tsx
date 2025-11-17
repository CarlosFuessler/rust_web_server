import './App.css'
import Hexagons from './components/Hexagons'
import { GridSimulator } from './components/GridSimulator'

function App() {

  return (
    <>
      <Hexagons />
      <div style={{ marginTop: '40px' }}>
        <GridSimulator />
      </div>
    </>
  )
}

export default App