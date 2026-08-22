import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Palette,
  Table as TableIcon,
  Columns,
  Rows3,
  Trash2,
  Code2,
  WrapText,
  ChevronDown,
} from 'lucide-react';
import { useCallback, useState, useRef, useEffect } from 'react';

/**
 * Cleans up messy HTML: collapses excessive blank lines, trims whitespace,
 * removes empty paragraphs runs, and normalises non-breaking spaces.
 */
function formatHTML(html) {
  return (
    html
      // replace &nbsp; sequences with a single regular space
      .replace(/(&nbsp;\s*){2,}/g, ' ')
      // collapse 3+ consecutive empty <p> tags (including those with only whitespace/&nbsp;) into one
      .replace(/(<p[^>]*>(\s|&nbsp;)*<\/p>\s*){3,}/gi, '<p></p>\n')
      // remove trailing whitespace inside paragraphs
      .replace(/<p([^>]*)>\s+/gi, '<p$1>')
      .replace(/\s+<\/p>/gi, '</p>')
      // normalise multiple consecutive <br> into a single one
      .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
      // tidy up extra whitespace between block tags
      .replace(/>\s{2,}</g, '>\n<')
      .trim()
  );
}

/**
 * TipTap Rich Text Editor Component
 *
 * Features:
 * - Full text formatting (bold, italic, underline, strike, inline code)
 * - Headings H1–H3, lists, blockquote
 * - Text alignment, color, highlight
 * - Table insert & management
 * - Link and image insertion
 * - Format Content (clean up excess whitespace / empty paragraphs)
 * - HTML Source view — see & edit raw HTML tags directly
 * - Undo / Redo
 */
export default function TipTapEditor({ content = '', onChange, placeholder = 'Write your content...' }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');
  const tableMenuRef = useRef(null);
  const colorPickerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target)) {
        setShowTableMenu(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-burgundy-500 underline hover:text-burgundy-600',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-sm my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-burgundy max-w-none focus:outline-none min-h-[300px] px-4 py-3 tiptap-editor-content',
      },
    },
  });

  // ─── Link handlers ───────────────────────────────────────────────────────────
  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (editor) editor.chain().focus().unsetLink().run();
  }, [editor]);

  // ─── Image handler ───────────────────────────────────────────────────────────
  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  }, [editor, imageUrl]);

  // ─── Color handler ───────────────────────────────────────────────────────────
  const setColor = useCallback(
    (color) => {
      if (editor) {
        editor.chain().focus().setColor(color).run();
        setShowColorPicker(false);
      }
    },
    [editor],
  );

  // ─── Table handler ───────────────────────────────────────────────────────────
  const insertTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
      setShowTableMenu(false);
    }
  }, [editor, tableRows, tableCols]);

  // ─── Format Content handler ──────────────────────────────────────────────────
  const handleFormatContent = useCallback(() => {
    if (!editor) return;
    const cleaned = formatHTML(editor.getHTML());
    editor.commands.setContent(cleaned, false);
    onChange(cleaned);
  }, [editor, onChange]);

  // ─── Source Mode handlers ────────────────────────────────────────────────────
  const toggleSourceMode = useCallback(() => {
    if (!editor) return;
    if (!sourceMode) {
      // entering source mode — snapshot current HTML
      setSourceHtml(editor.getHTML());
    } else {
      // leaving source mode — push edited HTML back into the editor
      editor.commands.setContent(sourceHtml, false);
      onChange(sourceHtml);
    }
    setSourceMode((prev) => !prev);
  }, [editor, sourceMode, sourceHtml, onChange]);

  const applySourceChanges = useCallback(() => {
    if (!editor) return;
    editor.commands.setContent(sourceHtml, false);
    onChange(sourceHtml);
    setSourceMode(false);
  }, [editor, sourceHtml, onChange]);

  if (!editor) {
    return <div className="text-gray-400 text-sm p-4">Loading editor...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-sm bg-white">
      {/* ── Toolbar ── */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {/* Color & Highlight */}
        <div className="relative" ref={colorPickerRef}>
          <ToolbarButton onClick={() => setShowColorPicker(!showColorPicker)} title="Text Color">
            <Palette className="w-4 h-4" />
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg p-2 z-20 flex gap-1">
              {['#000000', '#7C2D37', '#D4AF37', '#1e40af', '#dc2626', '#16a34a', '#9333ea'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColor(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetColor().run()}
                className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-xs text-gray-500"
                title="Remove color"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {/* ── Table ── */}
        <div className="relative" ref={tableMenuRef}>
          <ToolbarButton
            onClick={() => setShowTableMenu(!showTableMenu)}
            active={editor.isActive('table')}
            title="Table"
          >
            <span className="flex items-center gap-0.5">
              <TableIcon className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </span>
          </ToolbarButton>

          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg p-3 z-20 w-56">
              {/* Insert table */}
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Insert Table</p>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs text-gray-600 w-10">Rows</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value))}
                  className="w-16 h-7 px-2 border border-gray-200 rounded-sm text-xs"
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs text-gray-600 w-10">Cols</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value))}
                  className="w-16 h-7 px-2 border border-gray-200 rounded-sm text-xs"
                />
              </div>
              <button
                type="button"
                onClick={insertTable}
                className="w-full h-7 bg-burgundy-600 text-white text-xs rounded-sm hover:bg-burgundy-700 mb-3"
              >
                Insert {tableRows}×{tableCols} Table
              </button>

              {/* Table operations — only shown when cursor is inside a table */}
              {editor.isActive('table') && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2 border-t border-gray-100 pt-2">
                    Edit Table
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    <TableOpButton
                      icon={<Columns className="w-3 h-3" />}
                      label="Add Col Before"
                      onClick={() => {
                        editor.chain().focus().addColumnBefore().run();
                        setShowTableMenu(false);
                      }}
                    />
                    <TableOpButton
                      icon={<Columns className="w-3 h-3" />}
                      label="Add Col After"
                      onClick={() => {
                        editor.chain().focus().addColumnAfter().run();
                        setShowTableMenu(false);
                      }}
                    />
                    <TableOpButton
                      icon={<Rows3 className="w-3 h-3" />}
                      label="Add Row Before"
                      onClick={() => {
                        editor.chain().focus().addRowBefore().run();
                        setShowTableMenu(false);
                      }}
                    />
                    <TableOpButton
                      icon={<Rows3 className="w-3 h-3" />}
                      label="Add Row After"
                      onClick={() => {
                        editor.chain().focus().addRowAfter().run();
                        setShowTableMenu(false);
                      }}
                    />
                    <TableOpButton
                      icon={<Trash2 className="w-3 h-3" />}
                      label="Delete Col"
                      onClick={() => {
                        editor.chain().focus().deleteColumn().run();
                        setShowTableMenu(false);
                      }}
                      danger
                    />
                    <TableOpButton
                      icon={<Trash2 className="w-3 h-3" />}
                      label="Delete Row"
                      onClick={() => {
                        editor.chain().focus().deleteRow().run();
                        setShowTableMenu(false);
                      }}
                      danger
                    />
                    <TableOpButton
                      icon={<Trash2 className="w-3 h-3" />}
                      label="Delete Table"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setShowTableMenu(false);
                      }}
                      danger
                      className="col-span-2"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {/* Link */}
        <ToolbarButton
          onClick={() => setShowLinkInput(!showLinkInput)}
          active={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton onClick={removeLink} title="Remove Link">
            <span className="text-xs font-bold">✕</span>
          </ToolbarButton>
        )}

        {/* Image */}
        <ToolbarButton onClick={() => setShowImageInput(!showImageInput)} title="Add Image">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {/* Format Content */}
        <ToolbarButton onClick={handleFormatContent} title="Format Content — remove excess spaces & empty lines">
          <WrapText className="w-4 h-4" />
        </ToolbarButton>

        {/* HTML Source View */}
        <ToolbarButton onClick={toggleSourceMode} active={sourceMode} title="Toggle HTML Source View">
          <Code2 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        {/* Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* ── Link Input ── */}
      {showLinkInput && (
        <div className="border-b border-gray-200 p-3 bg-gray-50 flex gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 h-8 px-3 border border-gray-200 rounded-sm text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
          />
          <button
            type="button"
            onClick={addLink}
            className="px-3 h-8 bg-burgundy-600 text-white text-sm rounded-sm hover:bg-burgundy-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-3 h-8 bg-gray-200 text-gray-700 text-sm rounded-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Image Input ── */}
      {showImageInput && (
        <div className="border-b border-gray-200 p-3 bg-gray-50 flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (https://...)"
            className="flex-1 h-8 px-3 border border-gray-200 rounded-sm text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addImage()}
          />
          <button
            type="button"
            onClick={addImage}
            className="px-3 h-8 bg-burgundy-600 text-white text-sm rounded-sm hover:bg-burgundy-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowImageInput(false)}
            className="px-3 h-8 bg-gray-200 text-gray-700 text-sm rounded-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Source Mode ── */}
      {sourceMode ? (
        <div className="flex flex-col">
          <div className="border-b border-gray-200 px-3 py-2 bg-amber-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5" /> HTML Source — edit tags directly, then click Apply
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applySourceChanges}
                className="px-3 h-7 bg-burgundy-600 text-white text-xs rounded-sm hover:bg-burgundy-700"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={toggleSourceMode}
                className="px-3 h-7 bg-gray-200 text-gray-700 text-xs rounded-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
          <textarea
            value={sourceHtml}
            onChange={(e) => setSourceHtml(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[300px] max-h-[500px] p-4 font-mono text-xs text-gray-800 bg-gray-900 text-green-300 resize-y focus:outline-none"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          />
        </div>
      ) : (
        /* ── WYSIWYG Editor ── */
        <div className="max-h-[500px] overflow-y-auto">
          <EditorContent editor={editor} placeholder={placeholder} />
        </div>
      )}

      {/* ── Status bar ── */}
      <div className="border-t border-gray-200 px-4 py-1.5 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>
          {editor.isActive('table') && (
            <span className="text-burgundy-600 font-medium">
              Inside table — use Table menu to add/remove rows &amp; columns
            </span>
          )}
          {editor.isActive('code') && !editor.isActive('table') && (
            <span className="text-blue-600 font-medium">Inline code active</span>
          )}
        </span>
        <span className="flex items-center gap-3">
          {sourceMode && <span className="text-amber-600 font-medium">HTML source mode</span>}
          <span>
            {/* word count from plain text */}
            {editor.getText().trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        'p-1.5 rounded transition-colors',
        active ? 'bg-burgundy-100 text-burgundy-700' : 'text-gray-600 hover:bg-gray-100',
        disabled ? 'opacity-30 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ─── Table Operation Button ───────────────────────────────────────────────────
function TableOpButton({ icon, label, onClick, danger = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-1 px-2 py-1 text-xs rounded-sm border transition-colors',
        danger ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
        className,
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}
