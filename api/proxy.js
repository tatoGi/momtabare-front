// Vercel serverless function to proxy API requests and add CORS headers
export default async function handler(req, res) {
  // Get the origin from the request headers
  const origin = req.headers.origin || req.headers.host
  
  // Define allowed origins for production
  // cors
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
    // The apiPath from the route /api/(.*) will be like "en/api/categories"
    // We need to call https://admin.momtabare.com/en/api/categories
    const targetUrl = `https://admin.momtabare.com/${apiPath}`
    
    // Add query parameters if they exist
    const urlParams = new URLSearchParams(queryParams)
    const finalUrl = urlParams.toString() ? `${targetUrl}?${urlParams.toString()}` : targetUrl
    
    // Prepare headers for the backend request
    const backendHeaders = {
      'Authorization': req.headers.authorization || '',
      'Accept-Language': req.headers['accept-language'] || '',
      'X-Localization': req.headers['x-localization'] || '',
      'X-XSRF-TOKEN': req.headers['x-xsrf-token'] || '',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Accept-Encoding': 'identity' // Disable compression to avoid decoding issues
    }
    
    // Only add Content-Type for requests with body
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      backendHeaders['Content-Type'] = 'application/json'
    }

    console.log(`[PROXY] ${req.method} ${finalUrl}`)
    console.log(`[PROXY] Request headers:`, backendHeaders)

    // Forward the request to the backend
    const backendResponse = await fetch(finalUrl, {
      method: req.method,
      headers: backendHeaders,
      body: req.method !== 'GET' && req.method !== 'DELETE' ? JSON.stringify(req.body) : undefined,
    })

    const data = await backendResponse.text()
    
    console.log(`[PROXY] Backend response status: ${backendResponse.status}`)
    console.log(`[PROXY] Backend response headers:`, Object.fromEntries(backendResponse.headers.entries()))
    console.log(`[PROXY] Response data length: ${data.length}`)
    console.log(`[PROXY] Response data preview:`, data.substring(0, 200))
    
    // Set the same status code as the backend response
    res.status(backendResponse.status)
    
    // Set content type explicitly
    const contentType = backendResponse.headers.get('content-type') || 'application/json'
    res.setHeader('Content-Type', contentType)
    
    // Forward other response headers (excluding CORS and compression headers)
    backendResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (!lowerKey.startsWith('access-control-') && 
          !lowerKey.startsWith('content-encoding') &&
          !lowerKey.startsWith('transfer-encoding')) {
        res.setHeader(key, value)
      }
    })
    
    // Ensure no compression headers are sent to client
    res.removeHeader('content-encoding')
    res.removeHeader('transfer-encoding')
    
    // Handle different response types
    if (contentType.includes('application/json')) {
      try {
        const jsonData = JSON.parse(data)
        console.log(`[PROXY] Parsed JSON data type:`, typeof jsonData)
        console.log(`[PROXY] Is array:`, Array.isArray(jsonData))
        if (Array.isArray(jsonData)) {
          console.log(`[PROXY] Array length:`, jsonData.length)
        } else if (jsonData && typeof jsonData === 'object') {
          console.log(`[PROXY] Object keys:`, Object.keys(jsonData))
          // If it's an error response, log it but still return it
          if (jsonData.error || jsonData.message) {
            console.log(`[PROXY] Error response:`, jsonData)
          }
        }
        res.json(jsonData)
      } catch (parseError) {
        console.error(`[PROXY] JSON parse error:`, parseError)
        console.error(`[PROXY] Raw data:`, data)
        // Return empty array for categories/pages if parsing fails
        if (apiPath.includes('categories') || apiPath.includes('pages')) {
          console.log(`[PROXY] Returning empty array for failed ${apiPath}`)
          res.json([])
        } else {
          res.send(data)
        }
      }
    } else {
      res.send(data)
    }
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
