export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrlParam = url.searchParams.get('url');

    if (!targetUrlParam) {
      return new Response('Please provide a target URL using ?url=...', { status: 400 });
    }

    let targetUrl;
    try {
      targetUrl = new URL(targetUrlParam);
    } catch (e) {
      return new Response('Invalid target URL', { status: 400 });
    }

    // ഒറിജിനൽ ബ്രൗസർ റിക്വസ്റ്റ് പോലെ ഹെഡേഴ്സ് സെറ്റ് ചെയ്യുന്നു
    let modifiedRequest = new Request(targetUrl.toString(), {
      headers: {
        "Host": targetUrl.host,
        "Referer": "https://ployan.me/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Forwarded-For": request.headers.get("CF-Connecting-IP") || ""
      },
      method: request.method,
      body: request.method === 'GET' || request.method === 'HEAD' ? null : request.body,
      redirect: 'follow'
    });

    try {
      let response = await fetch(modifiedRequest);
      
      // പുതിയ റെസ്പോൺസ് ഉണ്ടാക്കി CORS ഹെഡേഴ്സ് അലോയ് ചെയ്യുന്നു
      let newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', '*');

      return newResponse;
    } catch (e) {
      return new Response('Proxy Error: ' + e.message, { status: 500 });
    }
  }
};
