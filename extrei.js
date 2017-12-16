const puppeteer = require('puppeteer');
const moment = require('moment');
const fs = require('fs');
const eilist_json = require("./eilist.json");

PATH_ROOT = "./";

// ################
// ### issue
// ################
// ★時刻を扱える形式に変換(splitまで完了)

//################
//### Complete
//################

//時刻配列の一括変換関数
function transformDateArray(DateArray, PeriodWeek) { //PeriodWeek = [開始月,開始日,終了月,終了日]

  let retArray = [];
  let now = moment();

  for(let i = 0; i< DateArray.length; i++){
    
    var strdate = String(DateArray[i]);

    //不要文字列の整形
    strdate = strdate.replace(/\n/g,"");
    strdate = strdate.replace(/ /g,"");

    let array = strdate.split("日");

    let year = now.year();
    let month = now.month() + 1;
    let day = array[0];

    //指標日が開始日よりも小さい => 月またぎあり
    if(day <= PeriodWeek[1]){
      month += 1;

      if(month == 13) month = 1;
    }
       
    var strdate_arranged = year + "." + month + "." + array[0] + " " + array[1]; 

    retArray.push(strdate_arranged)
  
  }
   
    return retArray;

}

//Webページにアクセスして、
async function getEIListWithDate(page, url){
  
  await page.goto(url,{waitUntil:"networkidle2"}); // ページへ移動

  await page.waitFor(3000); //ページロードを待つ
  
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

      let retArray = [];

      var tempPeriod = nodePeriod.innerHTML;
      tempPeriod = tempPeriod.replace(/<small>/g, "");
      tempPeriod = tempPeriod.replace(/<\/small>/g, "");
      tempPeriod = tempPeriod.replace(/ /g, "");
      tempPeriod = tempPeriod.replace(/\n/g, "");
      tempPeriod = tempPeriod.replace(/　/g, "");
      tempPeriod = tempPeriod.replace(/\t/g, "");
      tempPeriod = tempPeriod.replace(/日（.）/g, "");

      let tempArray = tempPeriod.split("～");
      let tempArray_a = tempArray[0].split("月");
      let tempArray_b = tempArray[1].split("月");

      retArray.push(tempArray_a[0],tempArray_a[1],tempArray_b[0],tempArray_b[1]);

      return retArray;
        
  }); //end page.evaluate
    
  console.log("date:",array_date.length)

  console.log("title:",array_title.length)

  console.log("currency:",array_currency.length)
  
  console.log("periodWeek:",PeriodWeek);
    
  array_date = transformDateArray(array_date,PeriodWeek);
  
  const EIjson = await page.evaluate(({array_date, array_currency, array_title}) => {
    
    let array_json = []

    for(let i = 0; i < array_date.length; i++){

      //var dateArranged = transformDate(String(array_date[i]));

      var single_json = {"date": array_date[i], "currency": array_currency[i], "title": array_title[i]}

      array_json.push(single_json);

    }

    return array_json;
        
  }, {array_date, array_currency, array_title}); //end page.evaluate

  //console.log("EIjson:",EIjson);

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

    const resultWebData = await getEIListWithDate(page, 'https://min-fx.jp/market/indicators/')
    //const resultData = await getEIList(page, 'https://min-fx.jp/market/indicators/') //動作確認用テスト
    //const resultData = await getPageTitle(page, 'https://min-fx.jp/market/indicators/') //動作確認用テスト

    //appendFile("./test.html", latestDate)
    //console.log("saved html")
    
    console.log("resultData: ", resultWebData);

    //console.log(eilist_json);

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

function analyzeData(WebData){





  
}