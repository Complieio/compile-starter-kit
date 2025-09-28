import React, { useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-styles.css';
import Quill from 'quill';
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing your note...",
  readOnly = false,
  className = "",
}) => {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video', 'imageSize'],
        ['blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        link: function(value: boolean) {
          if (value) {
            const href = prompt('Enter the URL:');
            if (href) {
              this.quill.format('link', href);
            }
          } else {
            this.quill.format('link', false);
          }
        },
        image: function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                const range = this.quill.getSelection();
                if (range) {
                  this.quill.insertEmbed(range.index, 'image', imageUrl);
                  this.quill.setSelection(range.index + 1);
                }
              };
              reader.readAsDataURL(file);
            }
          };
        },
        imageSize: function() {
          const range = this.quill.getSelection(true);
          if (!range) return;
          const getImageDom = () => {
            const leafAt = this.quill.getLeaf(range.index)?.[0];
            if (leafAt && leafAt.domNode && leafAt.domNode.tagName === 'IMG') return leafAt.domNode;
            const prevLeaf = this.quill.getLeaf(Math.max(range.index - 1, 0))?.[0];
            if (prevLeaf && prevLeaf.domNode && prevLeaf.domNode.tagName === 'IMG') return prevLeaf.domNode;
            const nextLeaf = this.quill.getLeaf(range.index + 1)?.[0];
            if (nextLeaf && nextLeaf.domNode && nextLeaf.domNode.tagName === 'IMG') return nextLeaf.domNode;
            return null;
          };
          const img = getImageDom();
          if (!img) {
            alert('Select an image (place the cursor next to it) to resize.');
            return;
          }
          const currentWidth = (img.style && img.style.width) ? img.style.width : '';
          const value = prompt('Set image width (e.g., 300px or 50%). Leave empty to reset.', currentWidth || '');
          if (value === null) return;
          const v = value.trim();
          if (!v) {
            img.style.width = '';
            img.style.height = '';
          } else {
            img.style.width = v;
            img.style.height = 'auto';
          }
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align', 'script',
    'direction', 'code-block'
  ];

  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          minHeight: '400px',
          fontSize: '16px',
        }}
      />
    </div>
  );
};