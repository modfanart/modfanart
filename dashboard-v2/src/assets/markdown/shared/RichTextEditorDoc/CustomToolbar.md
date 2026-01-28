```jsx
import RichTextEditor from '@/components/shared/RichTextEditor'

const CustomToolbar = () => {
    return (
        <RichTextEditor
            content="<strong>Hello World</strong>"
            customToolBar={(
                editor,
                {
                    ToolButtonStrike,
                    ToolButtonHeading,
                    ToolButtonOrderedList,
                    ToolButtonBulletList,
                },
            ) => {
                return (
                    <>
                        <ToolButtonHeading editor={editor} />
                        <ToolButtonStrike editor={editor} />
                        <ToolButtonOrderedList editor={editor} />
                        <ToolButtonBulletList editor={editor} />
                    </>
                )
            }}
        />
    )
}

export default CustomToolbar
```
