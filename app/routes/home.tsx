import {
	Button,
	FileUpload,
	Heading,
	HStack,
	Icon,
	Input,
	RadioCard,
	Text,
	Textarea,
	VStack,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { LuCamera, LuLink2, LuText, LuUpload } from "react-icons/lu";
import LinkResult from "~/components/link-result.client";
import { toaster } from "~/components/ui/toaster";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Share Toolbox - Share Text, Links & Images | 24-Hour Temporary Links" },
		{
			name: "description",
			content: "Free online sharing tool to quickly generate short links for text, URLs, and images. Secure and convenient, valid for 24 hours. No registration required, share your content instantly.",
		},
		{
			name: "keywords",
			content: "short link generator,share text,share link,share image,temporary share,online sharing tool,URL shortener,file sharing,quick share,24 hour link,ephemeral sharing,paste tool",
		},
		{
			name: "author",
			content: "Share Toolbox",
		},
		{
			name: "robots",
			content: "index, follow",
		},
		{
			name: "googlebot",
			content: "index, follow",
		},
		// Open Graph
		{
			property: "og:title",
			content: "Share Toolbox - Share Text, Links & Images",
		},
		{
			property: "og:description",
			content: "Free online sharing tool to quickly generate short links for text, URLs, and images. Secure and convenient, valid for 24 hours.",
		},
		{
			property: "og:type",
			content: "website",
		},
		{
			property: "og:url",
			content: "https://sharetoolbox.com",
		},
		{
			property: "og:site_name",
			content: "Share Toolbox",
		},
		{
			property: "og:locale",
			content: "en_US",
		},
		{
			property: "og:locale:alternate",
			content: "zh_CN",
		},
		// Twitter Card
		{
			name: "twitter:card",
			content: "summary_large_image",
		},
		{
			name: "twitter:title",
			content: "Share Toolbox - Share Text, Links & Images",
		},
		{
			name: "twitter:description",
			content: "Free online sharing tool to quickly generate short links for text, URLs, and images. Secure and convenient, valid for 24 hours.",
		},
		// Additional SEO
		{
			name: "theme-color",
			content: "#ffffff",
		},
		{
			name: "mobile-web-app-capable",
			content: "yes",
		},
		{
			name: "apple-mobile-web-app-capable",
			content: "yes",
		},
		{
			name: "apple-mobile-web-app-status-bar-style",
			content: "default",
		},
		// Canonical
		{
			tagName: "link",
			rel: "canonical",
			href: "https://sharetoolbox.com",
		},
	];
}

const items = [
	{ value: "text", title: "Text", icon: LuText },
	{ value: "link", title: "Link", icon: LuLink2 },
	{ value: "image", title: "Image", icon: LuCamera },
];

export default function Home(_: Route.ComponentProps) {
	const [linkId, setLinkId] = useState("");
	const [type, setType] = useState("text");
	const [text, setText] = useState("");
	const [link, setLink] = useState("");
	const [image, setImage] = useState<File | null>(null);

	function cleanContent() {
		setText("");
		setLink("");
		setImage(null);
		setLinkId("")
	}

	const mutation = useMutation({
		mutationFn: async () => {
			switch (type) {
				case "text": {
					if (text.trim() === "") {
						throw new Error("Text is required");
					}
					break;
				}
				case "link": {
					if (link.trim() === "") {
						throw new Error("Link is required");
					}
					try {
						const url = new URL(link);
						if (!url.protocol.startsWith("http")) {
							throw new Error("Invalid URL");
						}
					} catch {
						throw new Error("Invalid URL");
					}
					break;
				}
				case "image":
					if (!image) {
						throw new Error("Image is required");
					}
					if (image.size > 5 * 1024 * 1024) {
						throw new Error("Image must be less than 5MB");
					}
					break;
			}
			const formData = new FormData();
			formData.append("type", type);
			if (type === "image" && image) {
				formData.append("content", image);
			} else {
				formData.append("content", text || link);
			}
			const response = await fetch("/api/share", {
				method: "POST",
				body: formData,
			});
			const json = (await response.json()) as { id: string };
			return json;
		},
		onSuccess: (data) => {
			setLinkId(data.id);
			toaster.success({
				title: "Shared successfully",
				description: "Your content has been shared successfully",
			});
		},
		onError: (e) => {
			toaster.error({
				title: e.message,
				description: "Please try again later",
			});
		},
	});

	return (
		<VStack p={4} minH="dvh">
			<HStack my={4}>
				<Heading>SHARE TOOLBOX</Heading>
			</HStack>
			<VStack w="full" maxW="2xl" mx="auto" flex={1} gap="4">
				<RadioCard.Root
					orientation="vertical"
					align="center"
					maxW="xs"
					w="full"
					defaultValue="text"
					onValueChange={(detail) => {
						setType(detail.value as string);
						cleanContent();
					}}
				>
					<HStack>
						{items.map((item) => (
							<RadioCard.Item key={item.value} value={item.value}>
								<RadioCard.ItemHiddenInput />
								<RadioCard.ItemControl>
									<Icon as={item.icon} />
									<RadioCard.ItemText fontSize="xs" fontWeight="semibold">
										{item.title}
									</RadioCard.ItemText>
								</RadioCard.ItemControl>
							</RadioCard.Item>
						))}
					</HStack>
				</RadioCard.Root>
				<VStack gap="4" w="full" maxW="2xl">
					{type === "text" && (
						<Textarea
							value={text}
							onChange={(e) => setText(e.currentTarget.value)}
							placeholder="Enter your text here"
							autoresize
							resize="none"
							minH="24"
							maxH="96"
							w="full"
						/>
					)}
					{type === "link" && (
						<Input
							value={link}
							onChange={(e) => setLink(e.currentTarget.value)}
							placeholder="Enter your link here"
							w="full"
						/>
					)}
					{type === "image" && (
						<FileUpload.Root
							mx="auto"
							accept={[
								"image/png",
								"image/jpeg",
								"image/jpg",
								"image/avif",
								"image/webp",
							]}
							onFileAccept={(e) => {
								setImage(e.files[0] ?? null);
							}}
						>
							<FileUpload.HiddenInput />
							<FileUpload.Trigger asChild>
								<Button variant="subtle" mx="auto">
									<LuUpload /> Select Image
								</Button>
							</FileUpload.Trigger>
							<FileUpload.List />
						</FileUpload.Root>
					)}
					<Button
						w="full"
						type="submit"
						loading={mutation.isPending}
						onClick={() => {
							mutation.mutate();
						}}
					>
						SHARE
					</Button>
				</VStack>
				<VStack>
					<Text fontSize="xs">Your link will be expired after 24 hours</Text>
				</VStack>
				{linkId && !mutation.isPending && <LinkResult linkId={linkId} />}
			</VStack>
			<VStack>
				<Text fontSize="xs">{`${new Date().getFullYear()} © SHARE TOOLBOX`}</Text>
			</VStack>
		</VStack>
	);
}
