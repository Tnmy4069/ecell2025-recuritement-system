#!/bin/bash
# Run these commands in your terminal to set environment variables

vercel env add MONGODB_URI production
# When prompted, enter: mongodb+srv://robo:robo@robo.4v4au30.mongodb.net/ecell_recruitment?retryWrites=true&w=majority&appName=Robo

vercel env add JWT_SECRET production  
# When prompted, enter: your_jwt_secret_key_here_make_it_very_long_and_complex

vercel env add NEXTAUTH_SECRET production
# When prompted, enter: your_nextauth_secret_here

vercel env add NEXTAUTH_URL production
# When prompted, enter: https://your-vercel-domain.vercel.app

# Then redeploy
vercel --prod
