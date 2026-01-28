import ToolButtonBold from '@/components/shared/RichTextEditor/toolButtons/ToolButtonBold'
import ToolButtonItalic from '@/components/shared/RichTextEditor/toolButtons/ToolButtonItalic'
import ToolButtonStrike from '@/components/shared/RichTextEditor/toolButtons/ToolButtonStrike'
import ToolButtonCode from '@/components/shared/RichTextEditor/toolButtons/ToolButtonCode'
import ToolButtonOrderedList from '@/components/shared/RichTextEditor/toolButtons/ToolButtonOrderedList'
import ToolButtonCodeBlock from '@/components/shared/RichTextEditor/toolButtons/ToolButtonCodeBlock'
import ToolButtonBlockquote from '@/components/shared/RichTextEditor/toolButtons/ToolButtonBlockquote'
import ToolButtonHorizontalRule from '@/components/shared/RichTextEditor/toolButtons/ToolButtonHorizontalRule'
import ToolButtonHeading from '@/components/shared/RichTextEditor/toolButtons/ToolButtonHeading'
import ToolButtonBulletList from '@/components/shared/RichTextEditor/toolButtons/ToolButtonBulletList'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

type EditArticleBodyProps = {
    content?: string
}

const EditArticleBody = ({ content }: EditArticleBodyProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                },
                orderedList: {
                    keepMarks: true,
                },
            }),
        ],
        editorProps: {
            attributes: {
                class: 'm-2 focus:outline-none',
            },
        },
        content,
    })

    if (!editor) return null

    return (
        <div>
            <div className="flex gap-x-1 gap-y-2 p-2 border-t border-b border-gray-200 dark:border-gray-700">
                <ToolButtonBold editor={editor} />
                <ToolButtonItalic editor={editor} />
                <ToolButtonStrike editor={editor} />
                <ToolButtonCode editor={editor} />
                <ToolButtonBlockquote editor={editor} />
                <ToolButtonHeading editor={editor} />
                <ToolButtonBulletList editor={editor} />
                <ToolButtonOrderedList editor={editor} />
                <ToolButtonCodeBlock editor={editor} />
                <ToolButtonHorizontalRule editor={editor} />
            </div>
            <EditorContent
                className="min-h-[200px] overflow-auto px-2 prose max-w-full"
                editor={editor}
            />
        </div>
    )
}

export default EditArticleBody
