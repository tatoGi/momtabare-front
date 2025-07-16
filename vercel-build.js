import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.VITE_APP_VERSION = process.env.VERCEL_GIT_COMMIT_SHA || 'local';

// Install dependencies and build
try {
  console.log('🔧 Preparing build environment...');
  
  // Install all dependencies, including devDependencies
  console.log('📦 Installing all dependencies...');
  execSync('npm install --production=false --prefer-offline --no-audit --progress=false', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'development' // Ensure devDependencies are installed
    }
  });
  
  // Verify Vite is installed
  console.log('🔍 Verifying Vite installation...');
  execSync('npx vite --version', { stdio: 'inherit' });
  
  // Build the application
  console.log('🏗️  Building application...');
  execSync('npx vite build --mode production', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=4096',
      // Ensure Vite uses the local installation
      PATH: `${process.env.PATH}:${process.cwd()}/node_modules/.bin`
    }
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed with error:', error);
  process.exit(1);
}
