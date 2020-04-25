
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

function numberGenerator(arr, seed, count, top) {
  let pos = 0
  while (arr.length < count) {
    let randNum = top + 1

    while (randNum > top) {
      randNum = seed.charCodeAt(pos) + 1
      pos += 1
    }

    if (arr.indexOf(randNum) < 0) {
      arr.push(randNum);
    }
  }
  
  return arr;
}

let getSeed = async () => {
  const csprng = await fetch("https://csprng.xyz/v1/api?length=60000")
  const csprngJson = await csprng.json()
  return atob(csprngJson.Data)
}

async function handleRequest(request) {
  const seed = await getSeed()
  let lottoNums = numberGenerator([], seed, 5, 70)
  lottoNums.sort((a, b) => a - b)

  lottoHtml = `<html>
<head>
<title>Lava Millions</title>
<style>
  .logo, .numbers, .footer {
    text-align: center;
  }
  .logo {
    margin: 3em;
  }
  .footer {
    margin-top: 5em;
    font-size: 0.8em;
    font-family: Tahoma, Geneva, sans-serif;
  }
  a, a:active, a:visited 
  { 
    color: #0066cc; 
  }
</style>
</head>
<body>
<div class="logo">
  <img alt="Mega Millions" src="https://static.jgc.org/mm/logo.png" />
</div>`

  lottoString = ''

  lottoHtml += `</div>
<div class="numbers">`

  lottoNums.forEach(lottoNum => {
    lottoHtml += '<img src="https://static.jgc.org/mm/home_ball_'+lottoNum+'.png" alt="'+lottoNum+'" />';
    lottoString += lottoNum + ', '
  })

  const seed2 = await getSeed()
  const goldBall = numberGenerator([], seed2, 1, 25)

  lottoHtml += '<img src="https://static.jgc.org/mm/home_ball_gold_'+goldBall+'.png" alt="'+goldBall+'" />';
  lottoString += 'gold='+goldBall

  lottoHtml += `</div>
<div class="footer">Here are your Mega Millions numbers picked at random using Cloudflare's <a href="https://blog.cloudflare.com/randomness-101-lavarand-in-production/" target="_blank">Lava Lamps.</a>
<br/>This site is not affilliated with <a href="https://www.megamillions.com" target="_blank">Mega Millions</a>.
<br/>This site is entirely serverless and written using a <a href="https://www.cloudflare.com/products/cloudflare-workers/">Cloudflare Worker</a>.</div>`

  var a = new ArrayBuffer(20);
  var bytes = new Uint8Array(a);
  bytes.forEach((_, i) => {
    bytes[i] = seed.charCodeAt(i);
  });
    
  var offset = 0
  lottoHtml += "<div class=\"footer\">"
  for (row = 0; row < 1; row++) {
    for (col = 0; col < 20; col++) {
    lottoHtml += "<img src=\"https://static.jgc.org/"
    lottoHtml += ((bytes[Math.floor(offset/8)] & 0x01) == 0x01)?"orange":"blue"
    lottoHtml += ".png\">"
    bytes[Math.floor(offset/8)] >>>= 1
    offset += 1
    }
  }

  lottoHtml += "</div></body></html>"

  return new Response(lottoHtml, {headers: {'Content-Type': 'text/html', 'x-winning-ticket': lottoString}})
}
