# MongoDB Atlas - Quick Setup (5 Minutes)

## Step 1: Create Account
Go to: https://mongodb.com/cloud/atlas

Click "Start Free" and sign up with your email.

## Step 2: Create Cluster
1. Click "Create" → "Create a Deployment"
2. Choose **M0 Shared** (free tier)
3. Select your region (closest to you)
4. Click "Create Deployment"
5. Wait 2-3 minutes for cluster to be ready

## Step 3: Create Database User
1. Go to "Database Access" (left menu)
2. Click "Add New Database User"
3. Username: `device_intel_prod`
4. Password: Generate a strong one (save it!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

## Step 4: Allow Network Access
1. Go to "Network Access" (left menu)
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Databases" → Click "Connect"
2. Select "Drivers"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your database user credentials
5. **Save this as your MONGO_URL**

Example format:
```
mongodb+srv://device_intel_prod:YOUR_PASSWORD@cluster.mongodb.net/device_intel_prod?retryWrites=true&w=majority
```

---

## Once You Have Your MONGO_URL

Send it to me and I'll deploy everything!

**Total time: 5 minutes**
