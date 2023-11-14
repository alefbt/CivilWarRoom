const logger = require('./logger');
const encTools = require('./encryption') 
const utilTools = require('./tools') 

const amqp = require('amqplib/callback_api');
const warroomHubIdentity = require('../app/warroomhub-identity-tools')
exports.appContextName = "rpcServices"

exports.serviceFunctionQueueName = (rpcServiceName,funcName)=>{
    return `hub-rpcsrv-${rpcServiceName}-${funcName}`
}


exports.runServiceFun = async (appContext, rpcServiceName, funcName, param) => {
    return new Promise((resolve,reject)=>{
        appContext.get(exports.appContextName).execServicFunc(
            appContext,
            appContext.get(exports.appContextName).channel,
            rpcServiceName,
            funcName,
            param
            ,
            (err,result)=>{
                
                if( err  ){
                    logger.error(`Exists Error is : ${err} `)
                    logger.error(`rpcService.runServiceFun:${rpcServiceName}.${funcName}(params=${param}) = Result: Error. ${result}`)
                    return reject(err)

                }
                
                if(result["success"] != true){
                    logger.error(`Success response : ${result['success']} `)
                    logger.error(`Error message is : ${result['message']} `)
                    logger.error(`rpcService.runServiceFun:${rpcServiceName}.${funcName}(params=${param}) = Result: Error. ${result}`)
                    return reject(Error(`Unsuccess RPC operation.\nResponse from server was without success=ture attribute.\n request function: rpcService.runServiceFun:${rpcServiceName}.${funcName}(params)`))

                }
                return resolve(result)
            }
        )
    })
}

/**
 * Function for internal use of services/*Service.js
 * @param {*} funName 
 * @returns 
 */
exports.rpcFunctionFactory = (rpcServiceName, funName) => {
    return (appContext, userObj) => {
        return exports.runServiceFun(
                appContext,
                rpcServiceName,
                funName,
                userObj
            )
    }
}


async function _exec_serive_func(appContext, 
    channel, 
    rpcServiceName,
    funcName,
    param,
    errOrResult){

        

        warroomHubIdentity.getIdentity(appContext)
        .then(wrroomhubIdentity=>{
            channel.assertQueue('', 
                { exclusive: true }, 
                function(error2, q) {

                    if (error2) 
                        return rj(error2)

                    var correlationId = `corrid:${encTools.generateRandomKey()}`
                    var responed = false

                    logger.debug(`rpcService._exec_serive_func: ${rpcServiceName}.${funcName}(${param})`);
                

                    setTimeout(()=>{
                        if(!responed){
                            responed = true
                            errOrResult(new Error("Timeout"),null)
                        }
                    },5000)

                    channel.consume(q.queue, function(msg) {
                        if (msg.properties.correlationId == correlationId) {
                            if(responed){
                                return
                            }
                            responed = true

                            var _contentType =  "undefined"
                            var outContent = msg.content.toString()

                            if ( '_contentType' in msg.properties.headers)
                                _contentType = msg.properties.headers['_contentType']

                            switch(_contentType){
       
                                case 'application/json':
                                    outContent = utilTools.fromJson(msg.content.toString())
                                    errOrResult(null, outContent)
                                    break
        
                                case 'undefined':
                                default:
                                    var _errMsg = `Content type ${_contentType} is undefined`
                                    console.error(_errMsg)
                                    return  errOrResult(_errMsg, null)
                            }
                        }
                        }, {
                        noAck: true
                    });
                
                    
                    var contentType = ""
                    var dataToSend = param


                    if (typeof dataToSend == 'function'){
                        param = param()
                    }

                                
                    switch(typeof param){
                        case 'undefined':
                            dataToSend=""
                            break

                        case 'array':
                        case 'object':
                            dataToSend = utilTools.toJsonStr(param)
                            contentType="application/json"
                            break

                        case 'number':
                        default:
                            dataToSend = param.toString()
                            contentType="text/plain"
                        
                    }

                
                    channel.publish(
                        'hub-eventsource', // exchange
                        exports.serviceFunctionQueueName(rpcServiceName,funcName), //routing key
                        Buffer.from(dataToSend), // content
                        {
                            correlationId: correlationId,
                            replyTo: q.queue,
                            headers: {
                                HubRPC:	`${rpcServiceName}.${funcName}`,
                                _messageVersion: "1-init",
                                _jwt: "",
                                _user: "anonymuse",
                                _userInfo: "serverIniting",

                                _contentType: contentType,
                                _sendingTime: new Date().toISOString(),
                                messageUniqueId: `${new Date().getTime()}:${encTools.generateRandomKey()}`,

                                uiFingerprint: "",
                                hubFingerprint: wrroomhubIdentity.fingerprint
                            }
                        }
                    );

                    /*
                    channel.sendToQueue(
                            exports.serviceFunctionQueueName(rpcServiceName,funcName),
                        Buffer.from(param.toString()),{
                            correlationId: correlationId,
                            replyTo: q.queue });
                            */

                })
    
        })
        .catch(ex=>{
            errOrResult(ex,null)
        })
    }



exports.initAppContext = async (appContext) => {
    return new Promise((resolve,reject)=>{
        
        const context = {
            'connection':{},
            'channel':{},
        }

        const amqurl = appContext.get("envvar").AMQ_URL

        amqp.connect(amqurl, function(error0, connection) {
            if (error0) 
                return reject(error0)
            
            context['connection'] = connection


            connection.createChannel(function(error1, channel) {
                if (error1) 
                    return reject(error1)

                context['channel'] =channel
                context['execServicFunc'] = _exec_serive_func

                resolve(context)
              });
              
        });
    })
}