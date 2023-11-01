const logger = require('./logger');
const encTools = require('./encryption') 
const amqp = require('amqplib/callback_api');

exports.appContextName = "rpcServices"

exports.serviceFunctionQueueName = (rpcServiceName,funcName)=>{
    return `hub-rpcsrv-${rpcServiceName}-${funcName}`
}

async function _exec_serive_func(appContext, 
    channel, 
    rpcServiceName,
    funcName,
    param,
    errOrResult){

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
                        errOrResult(null, msg.content.toString())
                    }
                    }, {
                    noAck: true
                });
            
                
                var dataToSend = ""
                
                switch(typeof param){
                    case 'undefined':
                        dataToSend=""
                        break

                    case 'array':
                    case 'object':
                        dataToSend = JSON.stringify(obj).toString('utf-8')
                        break
                    case 'function':
                        dataToSend = param()
                        break
                    case 'number':
                    default:
                        dataToSend = param.toString()
                    
                }

                channel.publish(
                    'hub-eventsource', // exchange
                    exports.serviceFunctionQueueName(rpcServiceName,funcName), //routing key
                    Buffer.from(param.toString()), // content
                    {
                        correlationId: correlationId,
                        replyTo: q.queue,
                        headers: {
                            HubRPC:	`${rpcServiceName}.${funcName}`
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
                if(err)
                    return reject(err)
                return resolve(result)
            }
        )
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