#!/usr/bin/env node

/**
 * Environment Setup Script for Momtabare Frontend
 * 
 * This script helps you set up environment files for different environments
 */

import fs from 'fs'
import path from 'path'

const LOCAL_ENV_CONTENT = `# Local Development Environment
# This file is used for local development only

# Backend API URLs
VITE_BACKEND_URL=http://127.0.0.1:8000

# Default locale for API calls
VITE_DEFAULT_LOCALE=ka
`

const PRODUCTION_ENV_CONTENT = `# Production Environment Variables
# These should be set in Vercel Dashboard, not in a file

# Backend API URLs
VITE_BACKEND_URL_PRODUCTION=https://admin.momtabare.com

# Default locale for API calls
VITE_DEFAULT_LOCALE=ka
`

function createLocalEnv() {
  const localEnvPath = '.env.local'
  
  if (fs.existsSync(localEnvPath)) {
    console.log('⚠️  .env.local already exists')
    return
  }
  
  fs.writeFileSync(localEnvPath, LOCAL_ENV_CONTENT)
  console.log('✅ Created .env.local for local development')
}

function showVercelInstructions() {
  console.log('\n🚀 Vercel Production Setup Instructions:')
  console.log('1. Go to https://vercel.com/dashboard')
  console.log('2. Select your momtabare-front project')
  console.log('3. Go to Settings → Environment Variables')
  console.log('4. Add these variables:')
  console.log('   - Name: VITE_BACKEND_URL_PRODUCTION')
  console.log('   - Value: https://admin.momtabare.com')
  console.log('   - Environment: Production ✅')
  console.log('5. Redeploy your application')
  console.log('\n📝 Note: You cannot upload .env files to Vercel!')
}

function main() {
  console.log('🔧 Setting up environment files...\n')
  
  createLocalEnv()
  showVercelInstructions()
  
  console.log('\n✨ Setup complete!')
  console.log('\n🔍 To debug environment detection, add this to your component:')
  console.log("import { getEnvironmentInfo } from '@/utils/config/env'")
  console.log('console.log(getEnvironmentInfo())')
}

main()
