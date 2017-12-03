const puppeteer = require('puppeteer')
const fs = require('fs');

PATH_ROOT = "./";

async function getEIListWithDate(page, url){
  
  await page.goto(url); // ページへ移動
  
  const EIList = await page.evaluate(() => {

    const nodeTxtCenter =document.querySelectorAll("td.txt-center");
    const nodeTtl =document.querySelectorAll("td.Ttl ");

    const array_date = [];
    const array_title = [];

    var aPromise = new Promise(function(resolve,reject){
      for(item of nodeTxtCenter){

        //時刻情報の抽出
        if(item.innerText.match(/日/)){

          array_date.push(item.innerText);
          console.log("item:",item.innerText);

        }
        
      }
      console.log("aPromise");
      resolve(array_date);

    });

    var bPromise = new Promise(function(resolve,reject){
      for(item of nodeTtl){
        array_title.push(item.innerText);
      }
      console.log("bPromise");
      resolve(array_title);
    });

    Promise.all([aPromise,bPromise]).then((values)=>{

      console.log("Promise all func");
      console.log("array_date:", values[0].length);
      console.log("array_title:", values[1].length);

      return array_title;

    }); //end then

  }); //end page.evaluate

  return EIList;
}

//テスト用関数　経済指標の名前だけListで返す（日付と連動しない）　動作確認OK
async function getEIList(page, url){

    await page.goto(url); // ページへ移動

  const EIList = await page.evaluate(() => {
    const node =document.querySelectorAll("td.Ttl ");
    const array = [];
    
    console.log(node[0]);

    for(item of node){
        array.push(item.innerText);
    }
    return array;
  });

  return EIList;

}

//テスト用関数　ページのタイトルを抽出　動作確認OK
async function getTitle(page, url){

  console.log("start to get page");

  await page.goto(url); // ページへ移動

  console.log("finish to get page");

  const titleText = await page.evaluate(() => {

    const title = document.querySelector("title");

    return title.innerText; // ページのtitleを返す

  });

  console.log("titleName: ",titleText);

  return titleText;

}

//ファイルの追記関数
function appendFile(path, data) {
    fs.appendFile(path, data, function (err) {
      if (err) {
          throw err;
      }
    });
}
  

(async() => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const resultData = await getEIListWithDate(page, 'https://min-fx.jp/market/indicators/')
    //const resultData = await getTitle(page, 'https://min-fx.jp/market/indicators/') //動作確認用テスト
    //appendFile("./test.html", latestDate)
    //console.log("saved html")
    //console.log("resultData: ", resultData);

    browser.close()
  } catch(e) {
    console.error(e)
  }
})()