
const rpcServices = require('../../../../utils/rpcService')

exports.rpcServiceName = "WarRoomService"

exports.register  = rpcServices.rpcFunctionFactory(
    exports.rpcServiceName, "register")