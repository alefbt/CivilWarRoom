const logger = require('./utils/logger');
const dotenv = require('dotenv');
const appContext = require('./utils/appContext').getAppContext()
const packageConfig = require('./package.json')
logger.info("Starting server of War Room Hub")

// Use `.env` config when the NODE_ENV is other than production
if (process.env.NODE_ENV !== 'production') {
  logger.warn("development mode")
  dotenv.config();
}


appContext.add('envvar', process.env)
appContext.add('packageConfig', packageConfig)

// Boot keystore
const secretstore = require('./utils/keystore').load(process.env.KEYSTORE_FILE);
appContext.add('keystore', secretstore)


// Verify if GPG Hub exists
const warroomIdentity = require('./app/war-room-identity-tools')
warroomIdentity.getIdentity(appContext).then((wridentity)=>{
  appContext.add('warroomIdentity', wridentity)
  logger.info(`!## War Room Name : _${wridentity.name}_`)
  logger.info(`!## War Room certificate fingertprint : ${wridentity.fingerprint}`)
})


const express = require('express')
const serveStatic = require('serve-static')

const app = express()

app.use(serveStatic("./public"))
app.use(express.json());
const port = process.env.PORT || 8080

appContext.add('expressApp', app)


app.use((req, res, next) => {

  if(logger.isDebugEnabled)
    logger.debug(`Request url : ${req.url}`)

  next()
})

const wrApi1Routes = require('./app/api/v1')
wrApi1Routes.attachRouter(appContext, app)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/echo', (req, res) => {
  console.log(req.body);      // your JSON
  res.send(req.body);    // echo the result back
})

app.listen(port, () => {
  logger.info(`Started listening on port ${port}`);
})



/*
app.all('*', (req, res) =>{
  logger.debug(req.url)

  res.status(404).json({
      success: false,
      data: '404'
  })
})
(/)


const errorHandler = function (error, request, response, next) {
  // Error handling middleware functionality
  console.log( `error ${error.message}`) // log the error
  const status = error.status || 400
  // send back an easily understandable error message to the caller
  response.status(status).send(error.message)
}

app.use(errorHandler)





// 

/*

*/

/*

from: https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener

var privateKey = fs.readFileSync( 'privatekey.pem' );
var certificate = fs.readFileSync( 'certificate.pem' );

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port);



const https = require('node:https');
const fs = require('node:fs');

const options = {
  pfx: fs.readFileSync('test/fixtures/test_cert.pfx'),
  passphrase: 'sample',
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000); 
*/


