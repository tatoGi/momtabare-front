export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
export const isClient = typeof window !== 'undefined';

export const getBaseUrl = (): string => {
  if (isClient) {
    return window.location.origin;
  }
  // Fallback for SSR
  return isProduction 
    ? 'https://www.momtabare.com' 
    : 'http://localhost:3000';
};
