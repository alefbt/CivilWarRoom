
const rpcServices = require('../../../../utils/rpcService')

// exports.rpcServiceName = "rpc-test-service"
exports.rpcServiceName = "FibService"

exports.fib = (appContext, nubmer) => {

    return rpcServices.runServiceFun(
            appContext,
            exports.rpcServiceName,
            "fib",
            nubmer
        )
}