
const rpcServices = require('../../../../utils/rpcService')

exports.rpcServiceName = "WarRoomHubService"

exports.register  = rpcServices.rpcFunctionFactory(
    exports.rpcServiceName, "register")