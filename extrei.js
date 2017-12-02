const puppeteer = require('puppeteer')
const fs = require('fs');

PATH_ROOT = "./";

async function getLatestDate(page, url){
  await page.goto(url) // ページへ移動
  // 任意のJavaScriptを実行
  console.log("got pages")

  const hotelNames = await page.evaluate(() => {
    const node = document.querySelectorAll("td.Ttl");
    const array = [];
    console.log(node);
    for(item of node){
        array.push(item.innerText);
        
    }
    return array;
});

  //return await page.content() // ページのhtmlソースを返す
}


//ファイルの追記関数
function appendFile(path, data) {
    fs.appendFile(path, data, function (err) {
      if (err) {
          throw err;
      }
    });
}
  

!(async() => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const latestDate = await getLatestDate(page, 'https://min-fx.jp/market/indicators/')
    //appendFile("./test.html", latestDate)
    //console.log("saved html")
    //console.log(latestDate)

    browser.close()
  } catch(e) {
    console.error(e)
  }
})()