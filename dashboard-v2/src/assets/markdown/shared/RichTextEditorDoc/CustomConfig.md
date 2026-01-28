```jsx
import { useState } from 'react'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { useEditor } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'

const CustomConfig = () => {
    const [content, setcontent] = useState('Hello World')

    const editor = useEditor({
        extensions: [Paragraph, Text, Heading, Document],
        editorProps: {
            attributes: {
                class: 'm-2 focus:outline-none',
            },
        },
        content,
        onUpdate({ editor }) {
            setcontent(editor.getHTML())
        },
    })

    return (
        <RichTextEditor
            customEditor={editor}
            customToolBar={(
                editor,
                { ToolButtonParagraph, ToolButtonHeading },
            ) => {
                return (
                    <>
                        <ToolButtonHeading editor={editor} />
                        <ToolButtonParagraph editor={editor} />
                    </>
                )
            }}
        />
    )
}

export default CustomConfig
```
