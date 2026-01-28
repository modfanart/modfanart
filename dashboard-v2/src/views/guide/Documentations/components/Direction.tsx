import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Direction = () => {
	return (
		<>
			<p>
				برای راه‌اندازی جهت اپلیکیشن، کافیست فیلد{' '}
				<code>direction</code> را به{' '}
				<code>&apos;ltr&apos;</code> یا <code>&apos;rtl&apos;</code> در{' '}
				<code>src/configs/theme.config.ts</code> تنظیم کنید. به‌عنوان مثال:
			</p>
			<SyntaxHighlighter language="ts">{`export const themeConfig = {
	...
	direction: 'rtl'
}`}</SyntaxHighlighter>
			<div className="mt-10" id="hook">
				<h5>هوک</h5>
				<p className="mt-1">
					شما می‌توانید از طریق هوک آماده‌ی ما به جهت دسترسی پیدا کرده یا آن را به‌روزرسانی کنید.
				</p>
				<SyntaxHighlighter language="tsx">{`import React from 'react'
import Button from '@/components/ui/Button'
import InputGroup from '@/components/ui/InputGroup'
import useDirection from '@/utils/hooks/useDirection'
import type { Direction } from '@/@types/theme';

const dirList = [
	{ value: 'ltr', label: 'LTR' },
	{ value: 'rtl', label: 'RTL' }
]

const DirectionSwitcher = () => {

	const [direction, setDirection] = useDirection()

	const onDirChange = (val: Direction) => {
		setDirection(val)
	}

	return (
		<InputGroup size="sm">
			{
				dirList.map(dir => (
					<Button 
						key={dir.value}
						active={direction === dir.value}
						onClick={() => onDirChange(dir.value)}
					>
						{dir.label}
					</Button>
				))
			}
		</InputGroup>
	)
}

export default DirectionSwitcher
`}</SyntaxHighlighter>
			</div>
		</>
	)
}

export default Direction
