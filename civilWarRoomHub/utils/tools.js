

exports.objToBase64 = function(obj){
    let objJsonStr = JSON.stringify(obj);
    return Buffer.from(objJsonStr.toString('utf-8')).toString("base64");
}

exports.base64ToObj = function(base64String){
    const json = Buffer.from(base64String, "base64").toString('utf-8');
    return JSON.parse(json);
}
