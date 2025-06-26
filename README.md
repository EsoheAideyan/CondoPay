# CondoPay – Modern Rent Payment & Management App

## Overview
CondoPay is a web application designed to modernize rent payments and management for condo organizations. It enables tenants to view rent status, log payments, and receive digital receipts, while providing admins with tools to manage buildings, tenants, and payment records. The app is built with security, transparency, and ease-of-use in mind.

## Features
- **Tenant Portal**
  - Secure login (email/password, 2FA planned)
  - View rent history, due dates, payment status
  - Download/email payment receipts
- **Admin Dashboard**
  - Add/manage buildings and tenants
  - Track payment status by unit
  - Send reminders or notices
- **Payment Handling**
  - Manual payment logging (MVP)
  - Future: Interac e-Transfer, Plaid, or VoPay integration
- **Audit Trail**
  - Immutable logs for all payments and actions
  - Timestamped, hashed confirmations
- **Extras (Future)**
  - Maintenance request portal
  - Notices board
  - Multi-language support

## Tech Stack
- **Frontend:** React, TypeScript, TailwindCSS, Jest, Cypress
- **Backend:** Node.js, Express, Firebase Auth, Firestore
- **Payments:** Manual logging (MVP), future integration with Interac/Plaid/VoPay
- **Security:** HTTPS, end-to-end encryption for sensitive data, audit trails

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- [npm](https://www.npmjs.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli) (if using Firebase)
- [VS Code](https://code.visualstudio.com/) (recommended)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/condopay.git
   cd condopay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` and fill in your Firebase/Supabase credentials.

4. **Run the app**
   ```bash
   npm start
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
