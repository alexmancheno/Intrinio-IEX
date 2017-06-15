'use strict';

var IntrinioRealtime = require('intrinio-realtime');
var Config = require(process.cwd() + '\\config.js');

// Create an IntrinioRealtime instance
var ir = new IntrinioRealtime({
    username: Config.Intrinio_Keys.username,
    password: Config.Intrinio_Keys.password,
})

const sql = require('mssql')

const config = {
    user: Config.Database_Config.user,
    password: Config.Database_Config.password,
    server: Config.Database_Config.server, // You can use 'localhost\\instance' to connect to named instance
    database: Config.Database_Config.database,

    options: {
        encrypt: false // Use this if you're on Windows Azure
    }
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
       request.query(String.format(`insert into Demo_Table(Ticker, Quote_Type, Price, Size, Original_Timestamp) values ('{0}', '{1}', {2}, {3}, {4});`, ticker, type, price, size, timestamp));
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