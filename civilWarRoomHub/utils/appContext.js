
const logger = require('./logger')
const appContext = {
    objs: {}
}

logger.info('initiated appContext')

appContext.add = (name,obj) => {
    appContext.objs[name] = obj
    logger.debug(`Added "${name}" to context`)
}

appContext.get = (name,obj) => {
    return appContext.objs[name]
}

exports.getAppContext = () => {
    return appContext
}

exports.appContext = global.getAppContext = appContext




// const boot = (appContext) => new Promise((resolve, reject) => {
//     resolve(appContext)
// })

// function setContext(context) {
//     global._appContext = appContext = context
// }

// function getAppContext() {
//     return new Promise((resolve, reject) => {

//         if(typeof appContext.loaded === 'undefined' || !appContext.loaded)
//             if(typeof global._appContext !== 'undefined')
//                 if(typeof global._appContext.loaded !== 'undefined' && global._appContext.loaded)
//                     appContext = global._appContext
                
                    

//         if(typeof global._appContext === 'undefined')
//             global._appContext = appContext
        

//         if (global._appContext.loaded)
//             return resolve(global._appContext)

//         boot(global._appContext).then((ctx) => {
//             setContext(ctx)
//             resolve(ctx)
//         });
//     })
// }


// if (typeof global.getAppContext === 'function' && global.getAppContext) {
//     // skip
// } else {
//     global.getAppContext = getAppContext;
// }



