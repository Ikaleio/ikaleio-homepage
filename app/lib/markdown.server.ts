import MarkdownIt from 'markdown-it'
import Shiki from '@shikijs/markdown-it'

let md: MarkdownIt | null = null

async function createMarkdownRenderer() {
	if (md) return md

	md = new MarkdownIt({
		html: true,
		breaks: true
	}).use(
		await Shiki({
			theme: 'github-dark'
		})
	)

	return md
}

export async function renderMarkdown(content: string) {
	const renderer = await createMarkdownRenderer()
	return renderer.render(content)
}
