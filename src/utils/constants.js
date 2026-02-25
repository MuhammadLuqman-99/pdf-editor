export const RENDER_SCALE = 1.5

export const TOOLS = [
  { id: 'pages', label: 'Pages', group: 'nav' },
  { id: 'divider1', type: 'divider' },
  { id: 'undo', label: 'Undo', group: 'history' },
  { id: 'redo', label: 'Redo', group: 'history' },
  { id: 'divider2', type: 'divider' },
  { id: 'select', label: 'Select', group: 'edit' },
  { id: 'text', label: 'Text', group: 'edit' },
  { id: 'sign', label: 'Sign', group: 'edit' },
  { id: 'initials', label: 'Initials', group: 'edit' },
  { id: 'divider3', type: 'divider' },
  { id: 'erase', label: 'Erase', group: 'shape' },
  { id: 'image', label: 'Image', group: 'shape' },
  { id: 'divider4', type: 'divider' },
  { id: 'check', label: 'Check', group: 'symbol' },
  { id: 'cross', label: 'Cross', group: 'symbol' },
  { id: 'circle', label: 'Circle', group: 'symbol' },
  { id: 'divider5', type: 'divider' },
  { id: 'table', label: 'Table', group: 'insert' },
  { id: 'textbox', label: 'Text Box', group: 'insert' },
  { id: 'date', label: 'Date', group: 'insert' },
  { id: 'divider6', type: 'divider' },
  { id: 'blackout', label: 'Blackout', group: 'markup' },
  { id: 'highlight', label: 'Highlight', group: 'markup' },
  { id: 'divider7', type: 'divider' },
  { id: 'draw', label: 'Draw', group: 'draw' },
  { id: 'line', label: 'Line', group: 'draw' },
  { id: 'arrow', label: 'Arrow', group: 'draw' },
  { id: 'divider8', type: 'divider' },
  { id: 'sticky', label: 'Sticky', group: 'extra' },
  { id: 'watermark', label: 'Watermark', group: 'extra' },
]

export const TEXT_TOOLS = ['text', 'textbox', 'sticky', 'date']
export const DRAG_TOOLS = ['blackout', 'highlight', 'erase', 'textbox', 'line', 'arrow', 'circle']
export const SHAPE_TOOLS = ['blackout', 'highlight', 'erase', 'circle']
