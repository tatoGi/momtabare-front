// Vercel serverless function to proxy API requests and add CORS headers
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', 'https://momtabare-front.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Accept-Language, X-Localization'
  )

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // Extract the path from the request
    const { path, ...queryParams } = req.query
    const apiPath = Array.isArray(path) ? path.join('/') : path
    
    // Build the target URL
    const targetUrl = `https://admin.momtabare.com/${apiPath}`
    
    // Forward the request to the backend
    const backendResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        'Accept-Language': req.headers['accept-language'] || '',
        'X-Localization': req.headers['x-localization'] || '',
        'X-XSRF-TOKEN': req.headers['x-xsrf-token'] || '',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
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
    res.status(500).json({ error: 'Proxy request failed' })
  }
}
