const puppeteer = require('puppeteer')
const moment = require('moment')
const fs = require('fs');

PATH_ROOT = "./";

// ################
// ### issue
// ################
// ★時刻を扱える形式に変換(splitまで完了)

//################
//### Complete
//################

//時刻変換関数
function transformDate(strdate) {

  //不要文字列の整形
  strdate = strdate.replace(/\n/g,"");
  strdate = strdate.replace(/ /g,"");

  let array = strdate.split("日");

  //console.log(array[0])

  let now = moment();
  let year = now.year();
  let month = now.month() + 1;
  
  //console.log(now);

  let retTime = year + "." + month + "." + array[0] + " " + array[1]; 

  return retTime;
}

//Webページにアクセスして、
async function getEIListWithDate(page, url){
  
  await page.goto(url,{waitUntil:"networkidle2"}); // ページへ移動
  
  let array_date = await page.evaluate(() => {   

    //時刻に関する文字列の取得
    const nodeTxtCenter =document.querySelectorAll("td.txt-center");
    //const nodeTtl =document.querySelectorAll("td.Ttl ");

    var temp_date =  [];

    for(item of nodeTxtCenter){

      //時刻情報の抽出
      if(item.innerText.match(/日/)){

        temp_date.push(item.innerText);
        //console.log(item.innerText);

      }
      
    }

    return temp_date;

  }); //end page.evaluate

  //経済指標名の取得
  const array_title = await page.evaluate(() => {   
    
      const nodeTtl =document.querySelectorAll("td.Ttl ");
  
      let temp_title =  [];

      for(item of nodeTtl){
          temp_title.push(item.innerText);
      }
          
      return temp_title;
        
  }); //end page.evaluate

  //通貨名の取得
  const array_currency = await page.evaluate(() => {   
    
      const nodeCurr =document.querySelectorAll("td.currency");
  
      let temp_curr =  [];

      for(item of nodeCurr){
          temp_curr.push(item.innerText);
      }
          
      return temp_curr;
        
  }); //end page.evaluate

  //日付けの範囲の取得
  const PeriodWeek = await page.evaluate(() => {   
    
      const nodePeriod =document.querySelector("span#periodWeek");

      var tempPeriod = nodePeriod.innerHTML;
      tempPeriod = tempPeriod.replace(/<small>/g, "");
      tempPeriod = tempPeriod.replace(/<\/small>/g, "");
      tempPeriod = tempPeriod.replace(/ /g, "");

      array_period = tempPeriod.split("～");

      const retPeriod = array_period[0]

      return retPeriod;
        
  }); //end page.evaluate
    
  console.log("date:",array_date.length)

  console.log("title:",array_title.length)

  console.log("currency:",array_currency.length)
  
  console.log("periodWeek:",PeriodWeek);
   
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

  return EIjson;
}

//テスト用関数　経済指標の名前だけListで返す（日付と連動しない）　動作確認OK
async function getEIList(page, url){

  await page.goto(url,{waitUntil:"networkidle2"}); // ページへ移動

  const EIList = await page.evaluate(() => {
    const node =document.querySelectorAll("td.Ttl ");
    const array = [];
    
    for(item of node){
        array.push(item.innerText);
        console.log("item:",item.innerText);
    }
    return array;
  });

  return EIList;

}

//テスト用関数　ページのタイトルを抽出　動作確認OK
async function getPageTitle(page, url){

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
  

// main関数
(async() => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const resultData = await getEIListWithDate(page, 'https://min-fx.jp/market/indicators/')
    //const resultData = await getEIList(page, 'https://min-fx.jp/market/indicators/') //動作確認用テスト
    //const resultData = await getPageTitle(page, 'https://min-fx.jp/market/indicators/') //動作確認用テスト

    //appendFile("./test.html", latestDate)
    //console.log("saved html")
    //console.log("resultData: ", resultData);

    browser.close()
  } catch(e) {
    console.error(e)
  }
})()


//ファイルの追記関数
function appendFile(path, data) {
  fs.appendFile(path, data, function (err) {
    if (err) {
        throw err;
    }
  });
}