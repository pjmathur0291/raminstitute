import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
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
} from 'lucide-react';
import { useCallback, useState } from 'react';

/**
 * TipTap Rich Text Editor Component
 *
 * Full-featured WYSIWYG editor with all necessary extensions
 * for blog content creation
 */
export default function TipTapEditor({ content = '', onChange, placeholder = 'Write your content...' }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
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
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-burgundy max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  }, [editor, imageUrl]);

  const setColor = useCallback(
    (color) => {
      if (editor) {
        editor.chain().focus().setColor(color).run();
        setShowColorPicker(false);
      }
    },
    [editor],
  );

  if (!editor) {
    return <div className="text-gray-400 text-sm p-4">Loading editor...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-sm bg-white">
      {/* Toolbar */}
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

        <div className="w-px h-6 bg-gray-300 mx-1" />

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

        <div className="w-px h-6 bg-gray-300 mx-1" />

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
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

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

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Color & Highlight */}
        <div className="relative">
          <ToolbarButton onClick={() => setShowColorPicker(!showColorPicker)} title="Text Color">
            <Palette className="w-4 h-4" />
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg p-2 z-10 flex gap-1">
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

        <div className="w-px h-6 bg-gray-300 mx-1" />

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

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Link Input */}
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

      {/* Image Input */}
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

      {/* Editor Content */}
      <EditorContent editor={editor} placeholder={placeholder} />

      {/* Character Count */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500 text-right">
        {editor.storage.characterCount?.characters() || 0} characters
      </div>
    </div>
  );
}

/**
 * Toolbar Button Component
 */
function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-1.5 rounded transition-colors
        ${active ? 'bg-burgundy-100 text-burgundy-700' : 'text-gray-600 hover:bg-gray-100'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );
}
