const ws = require('ws')
const WebSocket = ws.WebSocket
const logger = require('./logger');

var expressWs = require('express-ws')
const clients = new Map();

module.exports = (appContext, expressServer) => {

  const wsInstance = expressWs(expressServer)

  expressServer.ws('/ws/main', function(ws, req) {

    ws.on('message', function(msg) {
      console.log("WS", msg);
    });

    
    ws.on('connection', function(a,b,c) {
      const metadata = {
        "isAuthed": false
      }
      console.log(a,b,c)
      clients.set(ws, metadata);
    });


    ws.on("close", () => {
      clients.delete(ws);
    });
      
    
  })
}
