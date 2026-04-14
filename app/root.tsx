import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Provider } from "~/components/ui/provider";
import { Toaster } from "~/components/ui/toaster";

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<link rel="manifest" href="/manifest.json" />
				<Meta />
				<Links />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebApplication",
							name: "Share Toolbox",
							description: "Free online sharing tool to quickly generate short links for text, URLs, and images. Secure and convenient, valid for 24 hours.",
							url: "https://sharetoolbox.com",
							applicationCategory: "UtilityApplication",
							operatingSystem: "All",
							offers: {
								"@type": "Offer",
								price: "0",
								priceCurrency: "USD",
							},
							featureList: [
								"Share text content",
								"Share links and URLs",
								"Share images",
								"Generate short links",
								"24-hour validity period",
							],
						}),
					}}
				/>
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const [queryClient] = useState(() => new QueryClient());
	return (
		<QueryClientProvider client={queryClient}>
			<Provider>
				<Outlet />
				<Toaster />
			</Provider>
		</QueryClientProvider>
	);
}
