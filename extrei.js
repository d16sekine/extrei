const puppeteer = require('puppeteer')
const fs = require('fs');

PATH_ROOT = "./";

// ################
// ### issue
// ################
// ★時刻を扱える形式に変換(splitまで完了)


//時刻変換関数
function transformDate(strdate) {
  
  let array = strdate.split("日")

  //console.log(array[0])
  
  return array[0]
}

async function getEIListWithDate(page, url){
  
  await page.goto(url); // ページへ移動
  
  let array_date = await page.evaluate(() => {   

    const nodeTxtCenter =document.querySelectorAll("td.txt-center");
    //const nodeTtl =document.querySelectorAll("td.Ttl ");

    var temp_date =  [];

    for(item of nodeTxtCenter){

      //時刻情報の抽出
      if(item.innerText.match(/日/)){

        temp_date.push(item.innerText);

      }
      
    }

    return temp_date;

  }); //end page.evaluate

  const array_title = await page.evaluate(() => {   
    
      const nodeTtl =document.querySelectorAll("td.Ttl ");
  
      let temp_title =  [];

      for(item of nodeTtl){
          temp_title.push(item.innerText);
      }
          
      return temp_title;
        
  }); //end page.evaluate

  const array_currency = await page.evaluate(() => {   
    
      const nodeCurr =document.querySelectorAll("td.currency");
  
      let temp_curr =  [];

      for(item of nodeCurr){
          temp_curr.push(item.innerText);
      }
          
      return temp_curr;
        
  }); //end page.evaluate
    
  console.log("date:",array_date.length)

  console.log("title:",array_title.length)

  console.log("currency:",array_currency.length)
   
  //時刻の整形
  for(let i = 0; i< array_date.length; i++){

    array_date[i] = transformDate(String(array_date[i]));
    
  }
    
  


  const EIjson = await page.evaluate(({array_date, array_currency, array_title}) => {
    
    let array_json = []

    for(let i = 0; i < array_date.length; i++){

      //var dateArranged = transformDate(String(array_date[i]));

      var single_json = {"date": array_date[i], "currency": array_currency[i], "title": array_title[i]}

      array_json.push(single_json);

    }

    return array_json;
        
  }, {array_date, array_currency, array_title}); //end page.evaluate

  console.log("EIjson:",EIjson);

  return 56;
}

//テスト用関数　経済指標の名前だけListで返す（日付と連動しない）　動作確認OK
async function getEIList(page, url){

    await page.goto(url); // ページへ移動

  const EIList = await page.evaluate(() => {
    const node =document.querySelectorAll("td.Ttl ");
    const array = [];
    
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
    console.log("resultData: ", resultData);

    browser.close()
  } catch(e) {
    console.error(e)
  }
})()