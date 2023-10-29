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

const cache = require('./utils/cache')
appContext.add('cache', cache)

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

// Security
const encTools = require('./utils/encryption')
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
  res.send('Hello World!')
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
})



