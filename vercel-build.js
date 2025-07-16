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
  
  console.log('📦 Installing dependencies...');
  execSync('npm ci --prefer-offline --no-audit --progress=false', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('🏗️  Building application...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed with error:', error);
  process.exit(1);
}
