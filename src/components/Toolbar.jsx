import React from 'react'
import { TOOLS } from '../utils/constants'
import { TOOL_ICONS, CommentIcon, SearchIcon, SettingsIcon } from '../utils/icons'

const ACTION_TOOLS = ['undo', 'redo', 'pages']
const NON_ACTIVE_TOOLS = ['undo', 'redo', 'pages', 'sign', 'initials', 'image', 'watermark', 'table']

export default function Toolbar({ currentTool, onToolSelect, editMode, onToggleEditMode }) {
  return (
    <div className="toolbar">
      <div className="toolbar-tools">
        {TOOLS.map((tool, i) => {
          if (tool.type === 'divider') return <div key={tool.id} className="toolbar-divider" />
          const Icon = TOOL_ICONS[tool.id]
          if (!Icon) return null
          const isActive = !NON_ACTIVE_TOOLS.includes(tool.id) && currentTool === tool.id
          return (
            <button
              key={tool.id}
              className={`tool-btn ${isActive ? 'active' : ''}`}
              onClick={() => onToolSelect(tool.id)}
              title={tool.label}
            >
              <Icon />
              <span>{tool.label}</span>
            </button>
          )
        })}
      </div>
      <div className="toolbar-right">
        <div className="toggle-wrapper">
          <span>Edit PDF</span>
          <button
            className={`toggle-switch ${editMode ? 'on' : ''}`}
            onClick={onToggleEditMode}
            title={editMode ? 'Editing enabled' : 'Editing disabled'}
          />
        </div>
        <button className="tool-btn" title="Comments (coming soon)" disabled>
          <CommentIcon />
          <span>Comment</span>
        </button>
        <button className="tool-btn" title="Search (coming soon)" disabled>
          <SearchIcon />
          <span>Search</span>
        </button>
        <button className="tool-btn" title="Settings (coming soon)" disabled>
          <SettingsIcon />
          <span>Settings</span>
        </button>
      </div>
    </div>
  )
}
