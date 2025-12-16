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
   - Start the development server: `npm run dev`
   - Visit `http://localhost:3000/api/init-db` in your browser or use a tool like Postman to make a POST request
   - This will create all necessary tables

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
2. **Automatic Execution:** Set up a cron job to call `/api/admin/check-randomizer` daily. This endpoint will automatically run the randomizer if the scheduled date has arrived.

For example, if deploying on Vercel, you can add this to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/admin/check-randomizer",
    "schedule": "0 0 * * *"
  }]
}
```

This will check daily at midnight UTC if the randomizer should run.

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

