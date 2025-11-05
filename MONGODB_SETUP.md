# MongoDB Atlas Setup Guide (Free)

## Step-by-Step Instructions

### Step 1: Create Account
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email (or Google/GitHub)
3. **No credit card required** - Free tier is completely free

### Step 2: Create Free Cluster
1. After logging in, click **"Build a Database"**
2. Select **"M0 FREE"** (Free Shared Cluster)
3. Choose a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click **"Create"** (takes 3-5 minutes)

### Step 3: Create Database User
1. Go to **Security → Database Access**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username (e.g., `admin`)
5. Click **"Autogenerate Secure Password"** and **SAVE IT** (you'll need it!)
6. Set privilege to **"Atlas admin"**
7. Click **"Add User"**

### Step 4: Allow Network Access
1. Go to **Security → Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add `0.0.0.0/0` manually)
   - This allows Vercel's servers to connect
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to your cluster and click **"Connect"**
2. Choose **"Connect your application"**
3. Select **"Node.js"** and version **"5.5 or later"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<password>`** with your actual database user password
6. **Add database name** before the `?`:
   ```
   mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/attendance-portal?retryWrites=true&w=majority
   ```

### Step 6: Add to Vercel
1. Go to your Vercel project dashboard
2. Click on your project → **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Enter:
   - **Name:** `MONGODB_URI`
   - **Value:** Your complete connection string (from Step 5)
   - **Environment:** Select all (Production, Preview, Development)
5. Click **"Save"**
6. Go to **Deployments** tab and click **"Redeploy"** on your latest deployment

### Step 7: For Local Development
1. Create a `.env.local` file in your project root:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/attendance-portal?retryWrites=true&w=majority
   ```
2. Replace with your actual connection string

## Free Tier Limits
- **512 MB storage** - More than enough for attendance data
- **Shared resources** - Perfect for small to medium applications
- **No expiration** - Free forever (with usage limits)

## Troubleshooting

### Connection Error
- Make sure you replaced `<password>` in the connection string
- Verify Network Access allows all IPs (0.0.0.0/0)
- Check that your database user has proper permissions

### Still Getting Errors?
- Double-check the connection string format
- Make sure there are no extra spaces
- Verify the database name is included before the `?`

## Need Help?
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Free tier info: https://www.mongodb.com/cloud/atlas/pricing

