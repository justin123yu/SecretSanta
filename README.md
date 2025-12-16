# Secret Santa Application

A Next.js application for organizing Secret Santa gift exchanges with user authentication, partner assignments, and information sharing.

## Features

- 🔐 User authentication (sign up and login)
- 🔑 Admin-initiated password reset with temporary URLs
- 🎲 Random partner assignment system
- 📅 Scheduled assignment date configuration
- 💬 Information sharing between partners
- 👨‍💼 Admin panel for managing assignments
- 🚫 Exclude users from randomizer
- 👀 View and reveal all assignments (admin only)
- 🎨 Modern UI with shadcn/ui components

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Neon Database** (PostgreSQL)
- **bcryptjs** for password hashing

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Neon Database:**
   - Create a free account at [Neon](https://neon.tech)
   - Create a new project and database
   - Copy your connection string

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your Neon database connection string:
     ```
     DATABASE_URL=postgresql://user:password@host/database?sslmode=require
     ```

4. **Initialize the database:**
   ```bash
   npm run init-db
   ```
   This will create all necessary tables in your Neon database.
   
   **Note:** When deploying to Vercel, the database is automatically initialized during the build process via the `postbuild` script.

5. **Create an admin user:**
   - Sign up through the application
   - You'll need to manually set `is_admin = true` in the database for your user, or modify the signup route to make the first user an admin

6. **Run the application:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up:** Users can create accounts by providing their name, email, and password
2. **Login:** Users log in with their credentials
3. **Set Assignment Date (Admin):** Admin users can set when assignments should be revealed
4. **Exclude Users (Admin):** Admin can exclude users from the randomizer who shouldn't participate
5. **Reset User Passwords (Admin):** Admin can generate password reset links for users. Click "Reset Password" next to any user to generate a temporary URL (expires in 24 hours) that can be sent to the user.
6. **Run Randomizer (Admin):** Admin can manually trigger the randomizer or wait for the scheduled date (only non-excluded users will be assigned)
7. **View Assignments (Admin):** Admin can view and reveal all Secret Santa assignments
8. **View Partner:** Once assignments are made, users can see their Secret Santa partner
9. **Share Information:** Users can provide information (wishlist, sizes, interests) that their Secret Santa can see

## Database Schema

- **users:** Stores user accounts with authentication info and exclusion status
- **assignments:** Stores Secret Santa pairings (giver → receiver)
- **user_info:** Stores information users share with their Secret Santa
- **randomizer_config:** Stores the scheduled assignment date
- **password_reset_tokens:** Stores temporary password reset tokens (expire in 24 hours)

### User Exclusion

Users can be excluded from the randomizer by admins. Excluded users will not be assigned as givers or receivers when the randomizer runs. The `excluded` field in the `users` table controls this.

### Password Reset

Admins can generate password reset links for any user. These links:
- Are unique, secure tokens
- Expire after 24 hours
- Can only be used once
- Allow users to set a new password without knowing their old one

To use: Go to Admin Panel → Manage Users → Click "Reset Password" next to a user → Copy the generated URL and send it to them.

## Making a User Admin

To make a user an admin, you can run this SQL query in your Neon database console:

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

## Automatic Randomizer Execution

The randomizer can run automatically on the scheduled date. You have two options:

1. **Manual Execution:** Use the admin panel to run the randomizer manually
2. **Automatic Execution:** The `vercel.json` file is already configured with a cron job that calls `/api/admin/check-randomizer` daily at midnight UTC. This endpoint will automatically run the randomizer if the scheduled date has arrived.

## Deployment to Vercel

### Prerequisites
- A Vercel account ([sign up here](https://vercel.com))
- A Neon database (already set up)
- Your code pushed to GitHub

### Steps

1. **Connect your GitHub repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository (`justin123yu/SecretSanta`)

2. **Configure Environment Variables:**
   - In the Vercel project settings, go to "Environment Variables"
   - Add your `DATABASE_URL` from Neon:
     - **Name:** `DATABASE_URL`
     - **Value:** Your Neon database connection string
     - **Environment:** Production, Preview, and Development (select all)

3. **Optional: Set Base URL (for password reset links):**
   - Add `NEXT_PUBLIC_BASE_URL` environment variable
   - **Value:** Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - This ensures password reset links use the correct domain

4. **Deploy:**
   - Vercel will automatically detect Next.js and deploy
   - The build process will install dependencies and build the Next.js application

5. **Database Initialization:**
   The database is **automatically initialized during the Vercel build process**. 
   
   When Vercel runs `npm run build`, it automatically executes the `postbuild` script which runs `npm run init-db`. This means:
   - ✅ Database tables are created automatically on every deployment
   - ✅ No manual steps required after deployment
   - ✅ Safe to run multiple times (uses `CREATE TABLE IF NOT EXISTS`)
   
   **Manual initialization (if needed):**
   - Run locally: `npm run init-db` (requires `DATABASE_URL` in your `.env.local`)
   - Or use the API endpoint: `POST https://your-app.vercel.app/api/init-db`

6. **Create Admin User:**
   - After deployment, sign up through your Vercel URL
   - Connect to your Neon database console
   - Run: `UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';`

### Vercel Configuration

The `vercel.json` file is already configured with:
- Automatic cron job for randomizer checks (daily at midnight UTC)
- Build and install commands

### Notes
- The database initialization runs automatically on each deployment
- Environment variables are securely stored in Vercel
- The cron job will automatically check and run the randomizer on scheduled dates

## Project Structure

```
├── app/
│   ├── api/          # API routes for auth, admin, and user actions
│   ├── admin/        # Admin panel page
│   ├── dashboard/    # User dashboard
│   ├── login/        # Login page
│   └── signup/       # Signup page
├── components/
│   └── ui/           # shadcn/ui components
├── lib/
│   ├── auth.ts       # Authentication functions
│   ├── db.ts         # Database connection and initialization
│   ├── session.ts    # Session management
│   ├── assignments.ts # Assignment management
│   └── randomizer.ts  # Randomizer logic
└── ...
```

## License

MIT

