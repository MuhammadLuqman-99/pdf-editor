import React from 'react'

const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
const s25 = { ...s, strokeWidth: 2.5 }
const v = '0 0 24 24'

export const HomeIcon = () => <svg viewBox={v} {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
export const ChevronDown = () => <svg viewBox={v} {...s}><polyline points="6 9 12 15 18 9"/></svg>
export const DownloadIcon = () => <svg viewBox={v} {...s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
export const PrintIcon = () => <svg viewBox={v} {...s}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
export const ShareIcon = () => <svg viewBox={v} {...s}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
export const UploadIcon = () => <svg viewBox={v} {...s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>

// Toolbar icons
export const PagesIcon = () => <svg viewBox={v} {...s}><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="10" y1="3" x2="10" y2="21"/></svg>
export const UndoIcon = () => <svg viewBox={v} {...s}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
export const RedoIcon = () => <svg viewBox={v} {...s}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
export const SelectIcon = () => <svg viewBox={v} {...s}><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
export const TextIcon = () => <svg viewBox={v} {...s}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
export const SignIcon = () => <svg viewBox={v} {...s}><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
export const InitialsIcon = () => <svg viewBox={v} {...s}><text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">Aa</text></svg>
export const EraseIcon = () => <svg viewBox={v} {...s}><path d="M20 20H7L3 16l9.5-9.5a2.83 2.83 0 0 1 4 0L20 10a2.83 2.83 0 0 1 0 4L15 19"/></svg>
export const ImageIcon = () => <svg viewBox={v} {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
export const CheckIcon = () => <svg viewBox={v} {...s25}><polyline points="20 6 9 17 4 12"/></svg>
export const CrossIcon = () => <svg viewBox={v} {...s25}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
export const CircleIcon = () => <svg viewBox={v} {...s}><circle cx="12" cy="12" r="9"/></svg>
export const TableIcon = () => <svg viewBox={v} {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
export const TextBoxIcon = () => <svg viewBox={v} {...s}><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/></svg>
export const DateIcon = () => <svg viewBox={v} {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><text x="8" y="18" fontSize="7" fill="currentColor" stroke="none">25</text></svg>
export const BlackoutIcon = () => <svg viewBox={v} {...s}><rect x="3" y="5" width="18" height="14" rx="1" fill="currentColor"/></svg>
export const HighlightIcon = () => <svg viewBox={v} {...s}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
export const DrawIcon = () => <svg viewBox={v} {...s}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
export const LineIcon = () => <svg viewBox={v} {...s25}><line x1="5" y1="19" x2="19" y2="5"/></svg>
export const ArrowIcon = () => <svg viewBox={v} {...s25}><line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/></svg>
export const StickyIcon = () => <svg viewBox={v} {...s}><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/><polyline points="14 3 14 8 21 8"/></svg>
export const WatermarkIcon = () => <svg viewBox={v} {...s}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>

export const CommentIcon = () => <svg viewBox={v} {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
export const SearchIcon = () => <svg viewBox={v} {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
export const SettingsIcon = () => <svg viewBox={v} {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>

export const ZoomInIcon = () => <svg viewBox={v} {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
export const ZoomOutIcon = () => <svg viewBox={v} {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
export const ChevronUp = () => <svg viewBox={v} {...s}><polyline points="18 15 12 9 6 15"/></svg>
export const FitIcon = () => <svg viewBox={v} {...s}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m10 0h3a2 2 0 0 0 2-2v-3"/></svg>

export const PdfIcon = () => <svg viewBox={v} {...s} width="64" height="64"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>

export const TOOL_ICONS = {
  pages: PagesIcon, undo: UndoIcon, redo: RedoIcon, select: SelectIcon,
  text: TextIcon, sign: SignIcon, initials: InitialsIcon, erase: EraseIcon,
  image: ImageIcon, check: CheckIcon, cross: CrossIcon, circle: CircleIcon,
  table: TableIcon, textbox: TextBoxIcon, date: DateIcon, blackout: BlackoutIcon,
  highlight: HighlightIcon, draw: DrawIcon, line: LineIcon, arrow: ArrowIcon,
  sticky: StickyIcon, watermark: WatermarkIcon,
}
