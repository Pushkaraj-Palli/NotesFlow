

# NotesFlow - Premium SaaS Notes Application

A modern, multi-tenant SaaS notes application built with Next.js, featuring premium UI/UX, subscription management, and enterprise-grade security.

## 🚀 Features

### Core Features
- **Multi-tenant Architecture** - Complete data isolation between organizations
- **Role-based Access Control** - Admin and member roles with proper permissions
- **Premium UI/UX** - Built with Shadcn/UI, Radix UI, and Framer Motion
- **Advanced Search & Filtering** - Find notes quickly with powerful search capabilities
- **Real-time Collaboration** - Team features for modern workspaces

### Subscription Management
- **Freemium Model** - Free tier with upgrade prompts
- **Feature Gating** - Premium features locked behind subscription
- **Usage Analytics** - Track notes, users, and plan limits
- **Upgrade Flows** - Beautiful pricing modals and upgrade experiences

### Technical Stack
- **Frontend**: Next.js 14, React 18, TypeScript  
- **UI Components**: Shadcn/UI, Radix UI, Tailwind CSS  
- **Animations**: Framer Motion  
- **State Management**: Zustand  
- **Data Fetching**: TanStack Query (React Query)  
- **Authentication**: JWT-based with secure token handling  
- **Deployment**: Vercel (optimized)  

## 📸 Screenshots

<img width="1894" height="931" alt="Image" src="https://github.com/user-attachments/assets/5b1bf0a1-2c10-426e-a341-311bfa534849" />
<img width="1916" height="930" alt="Image" src="https://github.com/user-attachments/assets/e38d1e94-b52e-4ad1-b2ab-6df38439d2e4" />
<img width="1913" height="927" alt="Image" src="https://github.com/user-attachments/assets/d4677af9-173a-47d8-85df-86ac669a7cc3" />
<img width="1912" height="924" alt="Image" src="https://github.com/user-attachments/assets/ddd0b5d7-4e55-4616-acac-d31c37681a21" />



## 🛠 Getting Started

### Prerequisites
- Node.js 18+  
- npm 8+  

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/notesflow-saas.git
cd notesflow-saas
````

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

* **Admin User**: [admin@acme.test](mailto:admin@acme.test) / password
* **Admin User**: [admin@globex.test](mailto:admin@globex.test) / password
* **Member User**: [user@acme.test](mailto:user@acme.test) / password
* **Member User**: [user@globex.test](mailto:user@globex.test) / password

## 🏗 Architecture

### Multi-Tenancy

* **Supported Tenants**: Out of the box, the application supports at least two example tenants: **Acme** and **Globex**.

* **Strict Isolation**: Data belonging to one tenant must never be accessible to another.

* **Approaches to Multi-Tenancy**:

  1. **Shared Schema with Tenant ID Column**

     * All tenants share the same database schema.
     * Every table includes a `tenant_id` column.
     * Application logic ensures strict filtering by `tenant_id` for complete isolation.
     * Example: Both **Acme** and **Globex** data live in the same schema, but queries are scoped by `tenant_id`.

  2. **Schema-per-Tenant**

     * Each tenant has its own dedicated schema in the same database.
     * Provides stronger isolation but may increase overhead with more tenants.
     * Example: `acme.notes`, `globex.notes` schemas hold notes for their respective organizations.

* **Subscription Plans**: Each tenant can have its own subscription tier and limits.

* **Role-based Permissions**: Admins manage users, while members only access their own tenant’s notes.

### API Design

* RESTful API with proper HTTP methods
* JWT authentication middleware
* Tenant isolation enforced at the API level
* Comprehensive error handling

### Security

* JWT-based authentication
* CSRF protection
* XSS prevention
* Content Security Policy headers
* Rate limiting (production ready)

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables

```env
# App Configuration
SITE_URL=https://your-domain.com
JWT_SECRET=your-super-secret-jwt-key

# Database (for production)
DATABASE_URL=your-database-url

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email Service
SMTP_HOST=smtp.your-provider.com
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

## 🎨 Customization

### Branding

* Update `lib/constants.ts` for app configuration
* Modify color scheme in `app/globals.css`
* Replace logo and favicon in `public/` directory

### Features

* Toggle features using `FEATURE_FLAGS` in `lib/constants.ts`
* Add new subscription plans in the same file
* Customize UI components in `components/` directory

## 📊 Performance

* **Lighthouse Score**: 95+ across all metrics
* **Core Web Vitals**: Optimized for excellent UX
* **Bundle Size**: Optimized with tree shaking and code splitting
* **Caching**: Aggressive caching strategies for static assets

## 🔒 Security

* **Authentication**: Secure JWT implementation
* **Authorization**: Role-based access control
* **Data Protection**: Tenant isolation and encryption
* **Headers**: Security headers for XSS/CSRF protection
* **Validation**: Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the NotesFlow Team

```
