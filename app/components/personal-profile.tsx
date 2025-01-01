import React from 'react'
import * as icons from 'simple-icons'
import { Card, CardContent } from '~/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'

interface ContactLink {
	iconName: string
	href: string
	label: string
}

interface PersonalProfileProps {
	name: string
	title: string
	bio: string
	description: string
	avatarUrl: string
	backgroundUrl: string
	contactLinks: ContactLink[]
}

const SvgIcon: React.FC<{ name: string; className?: string }> = ({
	name,
	className
}) => {
	// 转换图标名称为正确的格式，例如: 'github' -> 'siGithub'
	const normalizedName = `si${name.charAt(0).toUpperCase()}${name.slice(
		1
	)}` as keyof typeof icons
	const icon = icons[normalizedName]

	if (!icon) {
		console.warn(`Icon not found: ${name} (${normalizedName})`)
		return null
	}

	return (
		<svg
			role='img'
			viewBox='0 0 24 24'
			className={className}
			fill='currentColor'
		>
			<path d={(icon as icons.SimpleIcon).path} />
		</svg>
	)
}

export function PersonalProfile({
	name,
	title,
	bio,
	description,
	avatarUrl,
	backgroundUrl,
	contactLinks
}: PersonalProfileProps) {
	return (
		<div className='relative min-h-screen w-full overflow-hidden'>
			<img
				src={backgroundUrl}
				alt='Background'
				className='absolute inset-0 w-full h-full object-cover z-0'
			/>
			<div className='absolute inset-0 flex items-center justify-center p-4'>
				<Card className='w-full max-w-4xl backdrop-blur-3xl bg-gray-800/30'>
					<CardContent className='p-6'>
						<div className='flex flex-col md:flex-row gap-6'>
							{/* Left Section - Avatar */}
							<div className='md:w-1/3'>
								<Avatar className='w-full h-auto aspect-square'>
									<AvatarImage src={avatarUrl} alt={name} />
									<AvatarFallback>{name}</AvatarFallback>
								</Avatar>
							</div>

							{/* Right Section - Info */}
							<div className='md:w-2/3 space-y-4'>
								<div className='flex items-center space-x-4'>
									<h1 className='text-3xl font-bold'>{name}</h1>
									<p className='text-xl text-muted-foreground'>[{title}]</p>
								</div>

								<div className='space-y-2'>
									<p className='text-base'>{bio}</p>
									<div
										className='prose prose-sm prose-invert max-w-none text-sm text-muted-foreground [&>p]:text-sm [&>p]:text-muted-foreground'
										dangerouslySetInnerHTML={{ __html: description }}
									/>
								</div>

								<div className='flex flex-wrap gap-2'>
									{contactLinks.map((link, index) => (
										<Button
											key={index}
											variant='secondary'
											size='icon'
											className='bg-white/10 hover:bg-white/20'
											asChild
										>
											<a
												href={link.href}
												target='_blank'
												rel='noopener noreferrer'
												aria-label={link.label}
											>
												<SvgIcon name={link.iconName} className='h-5 w-5' />
											</a>
										</Button>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
