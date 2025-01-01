import MarkdownIt from 'markdown-it'

let md: MarkdownIt | null = null

async function createMarkdownRenderer() {
	if (md) return md

	md = new MarkdownIt({
		html: true,
		breaks: true
	})

	// 添加自定义链接渲染
	md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
		tokens[idx].attrPush([
			'class',
			'text-blue-500 hover:text-blue-600 transition-colors'
		])
		return self.renderToken(tokens, idx, options)
	}

	return md
}

export async function renderMarkdown(content: string) {
	const renderer = await createMarkdownRenderer()
	return renderer.render(content)
}
