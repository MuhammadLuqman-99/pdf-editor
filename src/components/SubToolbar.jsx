import React from 'react'
import { TEXT_TOOLS } from '../utils/constants'

export default function SubToolbar({ fontSize, onFontSizeChange, textColor, onTextColorChange, strokeWidth, onStrokeWidthChange, currentTool }) {
  const showFontSize = TEXT_TOOLS.includes(currentTool) || currentTool === 'textbox'
  const showStroke = ['circle', 'line', 'arrow', 'draw'].includes(currentTool)

  return (
    <div className="sub-toolbar">
      {showFontSize && (
        <>
          <label>
            Size:
            <select value={fontSize} onChange={(e) => onFontSizeChange(parseInt(e.target.value))}>
              {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36].map(s => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </label>
        </>
      )}
      <label>
        Color:
        <input
          type="color"
          className="color-picker"
          value={textColor}
          onChange={(e) => onTextColorChange(e.target.value)}
          title="Color"
        />
      </label>
      {showStroke && (
        <label>
          Stroke:
          <select value={strokeWidth} onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 8].map(w => (
              <option key={w} value={w}>{w}px</option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
