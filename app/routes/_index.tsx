import { PersonalProfile } from '~/components/personal-profile'
import type { Route } from './+types/_index'
import { useLoaderData } from 'react-router'
import { renderMarkdown } from '~/lib/markdown.server'

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'Ikaleio' },
		{ name: 'description', content: '关于 Ikaleio' }
	]
}

export async function loader({ context }: Route.LoaderArgs) {
	const description = await renderMarkdown(`
来自中国的高二学生，前 OIer，具有一定全栈开发和运维经验。技术栈：TypeScript/JavaScript, Bun.js, Next.js, Remix, Docker, Python

通常使用 Telegram，你一般可以在那里找到我。

博客链接：[Ikaleio's Blog](https://blog.ikale.io)
    `)

	const data = {
		name: 'Ikaleio',
		title: '独立开发者',
		bio: 'To infinte and beyond.',
		description,
		avatarUrl: `https://ice.frostsky.com/2025/01/01/a708ffdfddedf422ff65711712252614.webp`,
		backgroundUrl:
			'https://ice.frostsky.com/2025/01/01/a0321a08e8f6ce0f5c757bdad9e4853b.webp',
		contactLinks: [
			{
				iconName: 'github',
				href: 'https://github.com/Ikaleio',
				label: 'GitHub'
			},
			{
				iconName: 'telegram',
				href: 'https://t.me/Ikaleio',
				label: 'Telegram'
			}
		]
	}
	return data
}

export default function Index() {
	const data = useLoaderData<typeof loader>()
	return <PersonalProfile {...data} />
}
