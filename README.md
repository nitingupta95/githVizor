# GitVizor

> A SaaS‑style application built by Nitin Gupta to provide scalable, multi-tenant management with modern web technologies.

## 🧩 Project Overview  
GitHub SaaS is a full-stack, production-ready SaaS boilerplate designed to handle user authentication, subscription management, and real-time collaboration.  
It provides a flexible foundation for building SaaS applications with robust backend APIs and a responsive frontend.

## 🚀 Tech Stack  
- **Frontend**: React / Next.js / Vite  
- **Backend**: Node.js + Express + Prisma + MongoDB  
- **Database**: MongoDB  
- **Auth & Security**: JWT, OAuth (GitHub OAuth)  
- **Deployment**: Vercel  
- **Others**: Stripe (billing), Socket.io (real-time updates)

## 📦 Features  
- ✅ Multi‑tenant architecture  
- 🔐 Secure authentication with JWT & OAuth  
- 💳 Stripe billing and subscription management  
- 🧑‍💼 Role‑based access control (RBAC)  
- 📊 Admin dashboard for analytics  
- 📨 Real‑time notifications and collaboration  

## 🛠️ Getting Started  
### Prerequisites  
- Node.js (>=18)  
- npm or yarn  
- MongoDB instance (local or cloud)  
- Stripe API keys & GitHub OAuth credentials  

### Installation  
```bash
git clone https://github.com/nitingupta95/githubSaas.git
cd githubSaas
npm install
```

### Configuration  
Copy `.env.example` to `.env` and update environment variables:  
```env
DATABASE_URL= your-databse-url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-key
CLERK_SECRET_KEY=your-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL='/sync-user'
GITHUB_TOKEN=your-token
GEMINI_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key
ASSEMBLYAI_API_KEY=your-api-key
STRIPE_SECRET_KEY=your-secret-key
STRIPE_PUBLISHABLE_KEY=your-key 
STRIPE_WEBHOOK_SECRET=your-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_API_VERSION=2024-06-20
```

Run migrations (if using Prisma):  
```bash
npx prisma migrate dev
```

### Run Locally  
```bash
npm run dev
```  
App will be available at `http://localhost:3000`.

### Build for Production  
```bash
npm run build
npm run start
```

## 🧪 Tests  
```bash
npm run test
```

## 🧑‍💻 Contributing  
Contributions are always welcome!  
1. Fork the repository  
2. Create a branch (`git checkout -b feature/YourFeature`)  
3. Commit your changes  
4. Push to your fork  
5. Open a Pull Request  

## 📄 License  
Licensed under the [MIT License](LICENSE).

---
Made with ❤️ by [Nitin Gupta](https://github.com/nitingupta95)
