import { createResponse } from "../response";
export async function wechatApiGet(req : any) {
  await sendMessage("wechat callback get",'wxid_1axvc5m7w4so21')
  return createResponse("wechat callback");
}

async function handleChatGPTMessage(content: string, sender: string) {
  const groq_key = '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'
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer "+groq_key);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
      // "model": "gpt-3.5-turbo",
      "model": "mixtral-8x7b-32768",
      "messages": [{"role": "user", "content": content}],
      "temperature": 0.7
  });

  const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
  };

  try {
      const response = await fetch('https://proxy.wangyitu.tech/groq/v1/chat/completions', requestOptions);
      const x = await response.text();
      const result = JSON.parse(x)
      if(result['error']){
        await sendMessage(result['error']['message'], sender);
        return
      }

      // console.log(x,result['choices'])
      // console.log(result.choices[0].message.content)
      // 根据实际情况处理获取到的 result，比如可能需要将结果发送给 sender
      await sendMessage(result.choices[0].message.content, sender);
  } catch (error) {
      console.log('error', error);
  }
}
async function handleMessage(content: string, sender: string) {
  if(content === "/help"){
      // await handleHelp(content, sender);
      await sendMessage("need help...",sender)
  } else {
      await handleChatGPTMessage(content, sender);
  }
}
async function sendMessage(content: string, sender: string) {
  const wechat_url = "http://frp.yqfcn.com:7093"
  const myHeaders = new Headers();
  myHeaders.append('User-Agent', 'Apifox/1.0.0 (https://apifox.com)');
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify({
    aters: sender, // here should be sender
    msg: content, // here should be content
    receiver: sender // and here too
  });

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  try {
    const response = await fetch(wechat_url + '/text', requestOptions); // replaced 'http://xxx.com' with wechat_url
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.log('error', error);
  }
}

export async function wechatApi(req : any) {
  const body = await new Response(req.request.body).text();
  let bodyData = JSON.parse(body)
  const {content, sender} = bodyData;

  await handleMessage(content, sender)
  return createResponse("xx");
}
