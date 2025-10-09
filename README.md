# Share Toolbox

A free online sharing tool to quickly generate short links for text, URLs, and images. Secure and convenient, all shared content expires after 24 hours.

🔗 **Live Demo**: [https://sharetoolbox.com](https://sharetoolbox.com)

## ✨ Features

- 📝 **Share Text** - Quickly share text snippets with a short link
- 🔗 **Share Links** - Convert long URLs into short, shareable links
- 🖼️ **Share Images** - Upload and share images instantly
- ⏰ **24-Hour Expiry** - All shared content automatically expires after 24 hours
- 🚀 **No Registration** - Start sharing immediately without creating an account
- 🔒 **Secure** - Content is stored securely and automatically deleted
- 📱 **Responsive** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 19 + React Router 7
- **UI Framework**: Chakra UI v3
- **State Management**: TanStack Query
- **Language**: TypeScript
- **Build Tool**: Vite
- **Deployment**: Cloudflare Workers
- **Storage**: Cloudflare KV + Images

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

## 📦 Building for Production

Create a production build:

```bash
pnpm run build
```

## 🌐 Deployment

This project is deployed on Cloudflare Workers. To deploy:

```bash
cd workers
pnpm run deploy
```

### Environment Setup

Make sure you have the following Cloudflare resources configured:

- **KV Namespace** - For storing shared content
- **Images** - For image uploads
- **Rate Limiting** - To prevent abuse

## 📁 Project Structure

```
├── app/
│   ├── routes/          # Application routes
│   ├── components/      # React components
│   └── root.tsx         # Root layout
├── workers/             # Cloudflare Workers backend
├── public/              # Static assets
│   ├── robots.txt
│   ├── sitemap.xml
│   └── manifest.json
└── build/               # Production build output
```

## 🔍 SEO Optimization

This project includes comprehensive SEO optimizations:

- ✅ Complete meta tags (title, description, keywords)
- ✅ Open Graph tags for social media sharing
- ✅ Twitter Card support
- ✅ JSON-LD structured data
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ PWA manifest

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ using React Router and Cloudflare Workers.
