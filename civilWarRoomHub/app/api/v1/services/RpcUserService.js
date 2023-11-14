
const rpcServices = require('../../../../utils/rpcService')

exports.rpcServiceName = "UserService"

exports.register  = rpcServices.rpcFunctionFactory(
    exports.rpcServiceName, "register")

exports.signIn      = rpcServices.rpcFunctionFactory(
    exports.rpcServiceName, "signIn")

exports.loginSuccess  = rpcServices.rpcFunctionFactory(
    exports.rpcServiceName, "loginSuccess")