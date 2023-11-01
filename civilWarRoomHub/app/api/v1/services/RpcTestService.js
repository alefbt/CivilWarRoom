
const rpcServices = require('../../../../utils/rpcService')

/*
Example for useage

    const rtest = require('./..../RpcThisService')

    rtest.fib(appContext,20).then(r=>{
      console.log("WORKS!",r)
    }).catch(f=>{
      console.log("ERROR",f)})

*/
exports.rpcServiceName = "rpc-test-service"

exports.fib = (appContext, nubmer) => {
    const functionName="fib-function"
    
    return rpcServices.runServiceFun(
            appContext,
            exports.rpcServiceName,
            functionName,
            nubmer
        )
}