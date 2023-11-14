
exports.toJsonStr = function(obj){
    return JSON.stringify(obj).toString('utf-8')
}
exports.fromJson = function(json){
    return JSON.parse(json)
}

exports.objToBase64 = function(obj){
    return Buffer.from(exports.toJsonStr(obj)).toString("base64");
}

exports.base64ToObj = function(base64String){
    const json = Buffer.from(base64String, "base64").toString('utf-8');
    return exports.fromJson(json);
}
