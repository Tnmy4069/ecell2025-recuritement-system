# Vercel Environment Variables Configuration

## Add these in your Vercel project settings:

### Required Environment Variables:
- Name: MONGODB_URI
  Value: mongodb+srv://robo:robo@robo.4v4au30.mongodb.net/?retryWrites=true&w=majority&appName=Robo

- Name: JWT_SECRET  
  Value: your_jwt_secret_key_here_make_it_very_long_and_complex

- Name: NEXTAUTH_SECRET
  Value: your_nextauth_secret_here

- Name: NEXTAUTH_URL
  Value: https://your-vercel-app-url.vercel.app

## Steps to add in Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project: ecell2025-recuritement-system
3. Go to Settings > Environment Variables
4. Add each variable above with their values
5. Make sure to set them for all environments (Production, Preview, Development)
6. Redeploy your application

## Alternative: Use Vercel CLI
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```
