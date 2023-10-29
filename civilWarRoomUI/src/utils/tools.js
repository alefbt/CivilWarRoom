

export const objToBase64 = function(obj){
    let objJsonStr = JSON.stringify(obj);
    return btoa(objJsonStr.toString('utf-8'));
}

export const base64ToObj = function(base64String){
    const json = atob(base64String.toString('utf-8'));
    return JSON.parse(json);
}


export const convertUint8_to_hexStr = function (uint8) {
    return Array.from(uint8)
      .map((i) => i.toString(16).padStart(2, '0'))
      .join('');
  }