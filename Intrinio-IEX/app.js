'use strict';

var IntrinioRealtime = require('intrinio-realtime');
var Config = require(process.cwd() + '\\config.js');
var sql = require('mssql')
// Create an IntrinioRealtime instance

const ir = new IntrinioRealtime({
    username: Config.Intrinio_Keys.username,
    password: Config.Intrinio_Keys.password,
})

const config = {
    user: Config.Database_Config.user,
    password: Config.Database_Config.password,
    server: Config.Database_Config.server,
    database: Config.Database_Config.database,
    realTimeTable: Config.Database_Config.realTimeTable
}
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: fs.createReadStream('Demo-Stocks.txt')
});

rl.on('line', (line) => {
    var words = line.split(',');
    var ticker = words[0];
    ir.join(ticker);
});

 sql.connect(config, err => {
     // ... error checks

     const request = new sql.Request()
     request.stream = true // You can set streaming differently for each request

     // Listen for quotes
     ir.onQuote(quote => {
       var { ticker, type, price, size, timestamp } = quote;
      //request.query(String.format(`insert into {0} (Ticker, Quote_Type, Price, Size, Original_Timestamp) values ('{1}', '{2}', {3}, {4}, {5});`, config.realTimeTable, ticker, type, price, size, timestamp));
       //console.log(quote);
       console.log("QUOTE: ", ticker, type, price, size, timestamp);
     })

     request.on('error', err => {
         console.log("error !" + err);
     })
 })

sql.on('error', err => {
    // ... error handler
})

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}