// Vercel serverless function to proxy API requests and add CORS headers
export default async function handler(req, res) {
  // Get the origin from the request headers
  const origin = req.headers.origin || req.headers.host
  
  // Define allowed origins for production
  const allowedOrigins = [
    'https://momtabare-front.vercel.app',
    'https://momtabare-front-git-main.vercel.app',
    'https://momtabare-front-git-develop.vercel.app',
    // Add your custom domain here when you have one
    // 'https://yourdomain.com'
  ]
  
  // Check if origin is allowed or if we're in development
  const isAllowedOrigin = allowedOrigins.includes(origin) || 
                         origin?.includes('localhost') || 
                         origin?.includes('127.0.0.1') ||
                         process.env.NODE_ENV === 'development'
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0])
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Accept-Language, X-Localization, X-XSRF-TOKEN'
  )

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[PROXY] OPTIONS request from ${origin}`)
    res.status(200).end()
    return
  }

  try {
    // Extract the path from the request
    const { path, ...queryParams } = req.query
    const apiPath = Array.isArray(path) ? path.join('/') : path
    
    // Build the target URL
    const targetUrl = `https://admin.momtabare.com/${apiPath}`
    
    // Add query parameters if they exist
    const urlParams = new URLSearchParams(queryParams)
    const finalUrl = urlParams.toString() ? `${targetUrl}?${urlParams.toString()}` : targetUrl
    
    console.log(`[PROXY] ${req.method} ${finalUrl}`)
    
    // Prepare headers for the backend request
    const backendHeaders = {
      'Authorization': req.headers.authorization || '',
      'Accept-Language': req.headers['accept-language'] || '',
      'X-Localization': req.headers['x-localization'] || '',
      'X-XSRF-TOKEN': req.headers['x-xsrf-token'] || '',
      'X-Requested-With': 'XMLHttpRequest'
    }
    
    // Only add Content-Type for requests with body
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      backendHeaders['Content-Type'] = 'application/json'
    }

    // Forward the request to the backend
    const backendResponse = await fetch(finalUrl, {
      method: req.method,
      headers: backendHeaders,
      body: req.method !== 'GET' && req.method !== 'DELETE' ? JSON.stringify(req.body) : undefined,
    })

    const data = await backendResponse.text()
    
    // Set the same status code as the backend response
    res.status(backendResponse.status)
    
    // Forward response headers
    backendResponse.headers.forEach((value, key) => {
      if (!key.toLowerCase().startsWith('access-control-')) {
        res.setHeader(key, value)
      }
    })
    
    res.send(data)
  } catch (error) {
    console.error('Proxy error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      method: req.method,
      path: req.query.path
    })
    res.status(500).json({ 
      error: 'Proxy request failed',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
