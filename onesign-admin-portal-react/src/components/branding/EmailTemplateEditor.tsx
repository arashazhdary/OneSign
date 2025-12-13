import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  htmlBody?: string;
  type: EmailTemplateType;
}

export type EmailTemplateType =
  | 'welcome'
  | 'password_reset'
  | 'magic_link'
  | 'mfa_code'
  | 'account_locked';

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onChange: (template: EmailTemplate) => void;
  primaryColor?: string;
}

const AVAILABLE_VARIABLES = [
  { key: '{{user.name}}', description: 'User full name' },
  { key: '{{user.firstName}}', description: 'User first name' },
  { key: '{{user.lastName}}', description: 'User last name' },
  { key: '{{user.email}}', description: 'User email address' },
  { key: '{{reset_link}}', description: 'Password reset link' },
  { key: '{{magic_link}}', description: 'Magic link for authentication' },
  { key: '{{mfa_code}}', description: 'MFA verification code' },
  { key: '{{company.name}}', description: 'Company name' },
  { key: '{{support.email}}', description: 'Support email address' },
];

export default function EmailTemplateEditor({
  template,
  onChange,
  primaryColor = '#6366f1',
}: EmailTemplateEditorProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder: t('tenant.branding.emails.editor.placeholder', 'Start writing your email template...'),
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: template.htmlBody || template.body || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange({
        ...template,
        htmlBody: html,
        body: editor.getText(),
      });
    },
  });

  useEffect(() => {
    if (editor && template.htmlBody && editor.getHTML() !== template.htmlBody) {
      editor.commands.setContent(template.htmlBody || template.body || '');
    }
  }, [template.id]);

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertVariable = (variable: string) => {
    editor?.chain().focus().insertContent(variable + ' ').run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Template Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t('tenant.branding.emails.templateName', 'Template Name')}
        </label>
        <input
          type="text"
          value={template.name}
          onChange={(e) => onChange({ ...template, name: e.target.value })}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      {/* Subject Line */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t('tenant.branding.emails.subject', 'Subject Line')}
        </label>
        <input
          type="text"
          value={template.subject}
          onChange={(e) => onChange({ ...template, subject: e.target.value })}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          placeholder={t('tenant.branding.emails.subjectPlaceholder', 'Enter email subject...')}
        />
      </div>

      {/* Editor Toolbar */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-slate-200 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.bold', 'Bold')}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.italic', 'Italic')}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive('strike') ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.strikethrough', 'Strikethrough')}
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-slate-200 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.heading1', 'Heading 1')}
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.heading2', 'Heading 2')}
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.heading3', 'Heading 3')}
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-slate-200 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.bulletList', 'Bullet List')}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.orderedList', 'Numbered List')}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-slate-200 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.alignLeft', 'Align Left')}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.alignCenter', 'Align Center')}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.alignRight', 'Align Right')}
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.alignJustify', 'Justify')}
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Link & Image */}
          <div className="flex gap-1 border-r border-slate-200 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={setLink}
              className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                editor.isActive('link') ? 'bg-slate-200 dark:bg-slate-700' : ''
              }`}
              title={t('tenant.branding.emails.editor.insertLink', 'Insert Link')}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={addImage}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={t('tenant.branding.emails.editor.insertImage', 'Insert Image')}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Preview */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-auto ${
              showPreview ? 'bg-slate-200 dark:bg-slate-700' : ''
            }`}
            title={t('common.preview', 'Preview')}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Content */}
        {!showPreview ? (
          <EditorContent
            editor={editor}
            className="prose prose-slate dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
          />
        ) : (
          <div
            className="prose prose-slate dark:prose-invert max-w-none p-4 min-h-[300px] bg-white dark:bg-slate-900"
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        )}
      </div>

      {/* Available Variables */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {t('tenant.branding.emails.availableVariables', 'Available Variables')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {AVAILABLE_VARIABLES.map((variable) => (
            <button
              key={variable.key}
              type="button"
              onClick={() => insertVariable(variable.key)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors text-left"
              title={variable.description}
            >
              <Code className="w-3 h-3 flex-shrink-0" />
              <span className="font-mono text-xs truncate">{variable.key}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          {t('tenant.branding.emails.variablesHint', 'Click on a variable to insert it into your template. These will be replaced with actual values when emails are sent.')}
        </p>
      </div>
    </div>
  );
}
