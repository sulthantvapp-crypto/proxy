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

    let modifiedRequest = new Request(targetUrl.toString(), {
      headers: request.headers,
      method: request.method,
      body: request.body,
      redirect: 'follow'
    });

    modifiedRequest.headers.set('Host', targetUrl.host);
    modifiedRequest.headers.set('Referer', targetUrl.origin + '/');
    modifiedRequest.headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    try {
      let response = await fetch(modifiedRequest);
      let newResponse = new Response(response.body, response);
      
      // CORS പ്രശ്നങ്ങൾ வരാതിരിക്കാൻ
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', '*');

      return newResponse;
    } catch (e) {
      return new Response('Proxy Error: ' + e.message, { status: 500 });
    }
  }
};
