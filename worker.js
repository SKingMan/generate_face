addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    })
  }

  // 获取GET请求参数
  const url = new URL(request.url)
  const data = url.searchParams.get('data')
  
  if (!data) {
    return new Response('Missing data parameter', { status: 400 })
  }

  // 构建API请求体
  const apiRequestBody = {
    bot_id: '7478584611401416743',
    user_id: '123456789',
    stream: true,
    auto_save_history: true,
    additional_messages: [
      {
        role: 'user',
        content: data,
        content_type: 'text'
      }
    ]
  }

  try {
    // 发送API请求
    const response = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pat_czCrM3HCXzMkHqvTx1oGLM40masX8cdfuZ7CfRKV15cWIpKp6FHZm3ekcFMzML04',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    })

    // 设置响应头
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    // 创建TransformStream来处理流式响应
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    // 处理API响应流
    const reader = response.body.getReader()
    ;(async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          await writer.write(value)
        }
      } catch (error) {
        console.error('Error processing stream:', error)
      } finally {
        await writer.close()
      }
    })()

    return new Response(readable, { headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
  }
}