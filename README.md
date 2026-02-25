# PDF Editor

A simple, browser-based PDF editor that lets you add text, checkmarks, and crosses directly onto any PDF file — then save the edited version.

**Live Demo:** [https://pdf-editor-smoky-six.vercel.app/](https://pdf-editor-smoky-six.vercel.app/)

![PDF Editor Screenshot](https://img.shields.io/badge/Status-Live-brightgreen) ![HTML](https://img.shields.io/badge/Built%20with-HTML%2FJS-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

| Feature | Description |
|---------|-------------|
| **Text Tool** | Click anywhere on the PDF to add editable text |
| **Check ✓** | Add checkmarks for form checkboxes |
| **Cross ✗** | Add crosses for form checkboxes |
| **Drag & Move** | Reposition any added element by dragging |
| **Font Size** | Adjustable from 8px to 24px |
| **Color Picker** | Change text color to any color |
| **Zoom** | Zoom in/out for precise editing |
| **Undo** | Ctrl+Z to undo last action |
| **Save PDF** | Ctrl+S to download the edited PDF |
| **Page Navigation** | Thumbnail sidebar for quick page navigation |
| **Drag & Drop** | Drop PDF files directly into the editor |

## How to Use

1. Open the [PDF Editor](https://pdf-editor-smoky-six.vercel.app/)
2. Click **"Open PDF"** or drag & drop your PDF file
3. Select a tool (Text, Check ✓, or Cross ✗)
4. Click anywhere on the PDF to add content
5. Drag elements to reposition them
6. Click **"Save PDF"** to download your edited file

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo last action |
| `Ctrl + S` | Save/download PDF |

## Tech Stack

- **PDF.js** — PDF rendering in the browser
- **pdf-lib** — PDF modification and export
- **Vanilla JS** — No frameworks, pure JavaScript
- **Vercel** — Hosting and deployment

## Privacy

All PDF processing happens **entirely in your browser**. No files are uploaded to any server. Your documents stay private and secure.

## Local Development

Simply open `index.html` in your browser — no build tools or server required.

```bash
git clone https://github.com/MuhammadLuqman-99/pdf-editor.git
cd pdf-editor
# Open index.html in your browser
```

## License

MIT
