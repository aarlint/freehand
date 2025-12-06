import { useRef, useState, useEffect } from 'react'
import getStroke from 'perfect-freehand'
import { IoArrowBack, IoTrash, IoColorPalette, IoAdd } from 'react-icons/io5'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(8)
  const [context, setContext] = useState(null)
  const [currentStroke, setCurrentStroke] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMenu, setShowMenu] = useState(true)
  const [drawings, setDrawings] = useState([])
  const [currentDrawingId, setCurrentDrawingId] = useState(null)
  const [saveStatus, setSaveStatus] = useState('')
  const [recentColors, setRecentColors] = useState(['#000000'])

  // Load drawings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('drawings')
    if (saved) {
      setDrawings(JSON.parse(saved))
    }
  }, [])


  // Setup canvas when entering drawing mode
  useEffect(() => {
    if (showMenu) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Setup high-DPI canvas
    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`

    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    ctx.scale(dpr, dpr)
    setContext(ctx)

    // Load existing drawing or start fresh
    const drawing = drawings.find(d => d.id === currentDrawingId)
    if (drawing && drawing.data) {
      const img = new Image()
      img.onload = () => {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
        ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight)
      }
      img.src = drawing.data
    } else {
      // New drawing - white canvas
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
    }

    const resizeCanvas = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
      ctx.putImageData(imageData, 0, 0)
    }

    // Prevent scrolling
    const preventScroll = (e) => e.preventDefault()
    canvas.addEventListener('touchstart', preventScroll, { passive: false })
    canvas.addEventListener('touchmove', preventScroll, { passive: false })

    window.addEventListener('resize', resizeCanvas)
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('touchstart', preventScroll)
      canvas.removeEventListener('touchmove', preventScroll)
    }
  }, [showMenu, currentDrawingId])

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0
    const x = clientX - rect.left
    const y = clientY - rect.top
    const pressure = e.pressure || 0.5
    return [x, y, pressure]
  }

  const getSvgPathFromStroke = (stroke) => {
    if (!stroke.length) return ''

    const d = stroke.reduce((acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    }, ['M', ...stroke[0], 'Q'])

    d.push('Z')
    return d.join(' ')
  }

  const startDrawing = (e) => {
    if (!context) return
    setIsDrawing(true)
    const point = getCoordinates(e)
    setCurrentStroke([point])
  }

  const draw = (e) => {
    if (!isDrawing || !context) return
    e.preventDefault()

    const point = getCoordinates(e)
    const newStroke = [...currentStroke, point]
    setCurrentStroke(newStroke)

    // Use simple line drawing for immediate feedback
    if (currentStroke.length > 0) {
      const [prevX, prevY] = currentStroke[currentStroke.length - 1]
      const [x, y, pressure] = point

      context.strokeStyle = color
      context.lineWidth = lineWidth * (pressure || 0.5)
      context.lineCap = 'round'
      context.lineJoin = 'round'

      context.beginPath()
      context.moveTo(prevX, prevY)
      context.lineTo(x, y)
      context.stroke()
      context.closePath()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setCurrentStroke([])
  }

  const saveDrawing = () => {
    if (!canvasRef.current) {
      console.log('No canvas ref')
      return
    }

    const dataURL = canvasRef.current.toDataURL()
    const timestamp = Date.now()

    const newDrawing = {
      id: currentDrawingId || timestamp,
      data: dataURL,
      thumbnail: dataURL,
      updatedAt: timestamp
    }

    console.log('Saving drawing:', { id: newDrawing.id, currentDrawingId })

    setDrawings(prevDrawings => {
      const updatedDrawings = currentDrawingId
        ? prevDrawings.map(d => d.id === currentDrawingId ? newDrawing : d)
        : [...prevDrawings, newDrawing]

      console.log('Updated drawings count:', updatedDrawings.length)
      localStorage.setItem('drawings', JSON.stringify(updatedDrawings))
      return updatedDrawings
    })
  }

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, window.innerWidth, window.innerHeight)
  }

  const createNewDrawing = () => {
    const id = Date.now()
    setCurrentDrawingId(id)
    setShowMenu(false)
  }

  const loadDrawing = (id) => {
    setCurrentDrawingId(id)
    setShowMenu(false)
  }

  const deleteDrawing = (id) => {
    const updatedDrawings = drawings.filter(d => d.id !== id)
    setDrawings(updatedDrawings)
    localStorage.setItem('drawings', JSON.stringify(updatedDrawings))
  }

  const backToMenu = () => {
    setSaveStatus('Saving...')

    if (canvasRef.current && currentDrawingId) {
      const dataURL = canvasRef.current.toDataURL()
      const timestamp = Date.now()

      const newDrawing = {
        id: currentDrawingId,
        data: dataURL,
        thumbnail: dataURL,
        updatedAt: timestamp
      }

      setDrawings(prevDrawings => {
        const exists = prevDrawings.find(d => d.id === currentDrawingId)
        const updatedDrawings = exists
          ? prevDrawings.map(d => d.id === currentDrawingId ? newDrawing : d)
          : [...prevDrawings, newDrawing]

        localStorage.setItem('drawings', JSON.stringify(updatedDrawings))
        setSaveStatus(`Saved! (${updatedDrawings.length} total)`)

        setTimeout(() => {
          setShowMenu(true)
          setCurrentDrawingId(null)
          setSaveStatus('')
        }, 500)

        return updatedDrawings
      })
    } else {
      setShowMenu(true)
      setCurrentDrawingId(null)
      setSaveStatus('')
    }
  }

  const selectColor = (newColor) => {
    setColor(newColor)

    // Add to recent colors if not already present
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== newColor)
      return [newColor, ...filtered].slice(0, 4)
    })
  }

  const colors = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
  const sizes = [4, 8, 16, 24, 32]

  return (
    <div className="draw-app">
      {showMenu ? (
        <div className="menu">
          <h1 className="menu-title">Free Hand</h1>
          <div className="drawings-grid">
            <div className="new-canvas-card" onClick={createNewDrawing}>
              <IoAdd className="plus-icon" />
            </div>
            {drawings.map((drawing) => (
              <div key={drawing.id} className="drawing-card">
                <img
                  src={drawing.thumbnail}
                  alt="Drawing"
                  onClick={() => loadDrawing(drawing.id)}
                />
                <button
                  className="delete-btn"
                  onClick={() => deleteDrawing(drawing.id)}
                >
                  <IoTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="canvas"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
          />

          {saveStatus && (
            <div className="save-indicator">
              {saveStatus}
            </div>
          )}

          <button className="back-btn" onClick={backToMenu}>
            <IoArrowBack /> Menu
          </button>

          <div className={`palette ${isExpanded ? 'expanded' : ''}`}>
            {recentColors.length > 0 && (
              <div className="recent-colors">
                {recentColors.map((c, i) => (
                  <button
                    key={`${c}-${i}`}
                    className={`recent-color ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            )}

            <button
              className="palette-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <IoColorPalette />
            </button>

            {isExpanded && (
              <div className="palette-content">
                <div className="palette-section">
                  <label className="palette-label">Color Picker</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => selectColor(e.target.value)}
                    className="color-picker"
                  />
                </div>

                <div className="palette-divider"></div>

                <div className="palette-section">
                  <label className="palette-label">Preset Colors</label>
                  <div className="color-bubbles">
                    {colors.map((c) => (
                      <button
                        key={c}
                        className={`color-bubble ${color === c ? 'active' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => selectColor(c)}
                      />
                    ))}
                  </div>
                </div>

                <div className="palette-divider"></div>

                <div className="palette-section">
                  <div className="size-bubbles">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        className={`size-bubble ${lineWidth === size ? 'active' : ''}`}
                        onClick={() => setLineWidth(size)}
                      >
                        <div
                          className="size-indicator"
                          style={{
                            width: `${Math.min(size / 2, 16)}px`,
                            height: `${Math.min(size / 2, 16)}px`
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="palette-divider"></div>

                <button className="clear-bubble" onClick={clearCanvas}>
                  <IoTrash />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
