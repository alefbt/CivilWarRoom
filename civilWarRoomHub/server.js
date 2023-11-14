const logger = require('./utils/logger');
const dotenv = require('dotenv');
const appContext = require('./utils/appContext').getAppContext()
const packageConfig = require('./package.json')
logger.info("Starting server of War Room Hub")


appContext.addBoot("Add global vars", (resolve, reject) => {
  
  // Use `.env` config when the NODE_ENV is other than production
  if (process.env.NODE_ENV !== 'production') {
    logger.warn("development mode")
    dotenv.config();
  }

  appContext.add('envvar', process.env)
  appContext.add('packageConfig', packageConfig)

  resolve()
})

appContext.addBoot("Add Cache context", (resolve, reject) => {
  
  const cache = require('./utils/cache')
  appContext.add('cache', cache)

  resolve()
})

appContext.addBoot("Add KeyStore to context", (resolve, reject) => {
  // Boot keystore
  const keystoreUtil = require('./utils/keystore')
  appContext.add(keystoreUtil.appContextName, keystoreUtil.load(process.env.KEYSTORE_FILE))

  resolve()
})

appContext.addBoot("Add DataStore service and models to context", (resolve,reject)=>{
  const datastore = require('./utils/dataStore')
  appContext.add("dataStoreUtils", datastore)

  datastore.init(appContext).then((f)=>{
    appContext.add(datastore.appContextName, f)
    resolve()
  })

})


appContext.addBoot("Add RpcServices to context", (resolve,reject)=>{
  const rpcServices = require('./utils/rpcService')

  rpcServices.initAppContext(appContext).then((f)=>{
    appContext.add(rpcServices.appContextName, f)
    resolve()
  })
})


appContext.addBoot("Add WebServer", (resolve,reject)=>{
  const express = require('express')
  const serveStatic = require('serve-static')

  const app = express()

  // Security
  var { expressjwt: jwt } = require("express-jwt");

  const securityTool = require('./utils/security')

  app.use(
    jwt({
      secret: securityTool.getJWTSecretKey(appContext),
      algorithms: ["HS256"],
    }).unless({ path: [
      "/hub/api/v1/auth",
      "/hub/api/v1/info",
      "/echo"
    ] })
  );


  const helmet = require('helmet')
  app.use(helmet())
  app.disable('x-powered-by')



  // General
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
    res.send('Hub!')
  })

  app.get('/echo', (req, res) => {
    console.log(req.body);      // your JSON
    res.send(req.body);    // echo the result back
  })

  // custom 404
  app.use((req, res, next) => {
    res.status(404).send({success:false, message:"Sorry can't find that!"})
  })

  // custom error handler
  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send({success:false, message:'Something broke!'})
  })

  app.listen(port, () => {
    logger.info(`Started listening on port ${port}`);
    resolve()
  })
})


appContext.addPostBoot("Add HubIdentity", (resolve, reject) => {
  const hubIdentity = require('./app/warroomhub-identity-tools')
  
  hubIdentity.getIdentity(appContext).then((wridentity)=>{
    appContext.add(hubIdentity.appContextName, wridentity)

    logger.info(`!## War Room Name : _${wridentity.name}_`)
    logger.info(`!## War Room certificate fingertprint : ${wridentity.fingerprint}`)
    resolve()

  }) .catch( (e) => {
      reject(e)
  })
})


appContext.boot().then( () => {
  logger.debug("Boot success.")

  appContext.postboot().then( () => {
    logger.debug("PostBoot success.")

    // const rtest = require('./app/api/v1/services/RpcUserService')
    // for(var i = 0 ; i < 1 ; i++ )
    //   rtest.fib(appContext,12).then(r=>{
    //     console.log("WORKS!",r)
    //   }).catch(f=>{
    //     console.log("ERROR",f)})
      logger.info("Boot success. finished loading")      
     })
     .catch( (e) => {
        logger.error("Postboot ERROR:")
        logger.error(e)
        process.exit(1)
    })
}) 
.catch( (e) => {
  logger.error("FATAL ERROR:")
    logger.error(e)
    process.exit(1)

})






