
const logger = require('./logger')

const appContext = {
    inited: false,
    objs: {}
}

if(!appContext.inited){
    appContext.bootSquance = []
    appContext._bootSquancePromises = []

    appContext.postbootSquance = []
    appContext._postbootSquancePromises = []

    logger.info('initiated appContext')

    appContext.set = appContext.add = (name,obj) => {
        appContext.objs[name] = obj
        logger.debug(`Setting "${name}" in context`)
    }

    appContext.get = (name) => {
        return appContext.objs[name]
    }



    appContext.addBoot = (name, initFN) => {
        logger.debug(`Adding to boot '${name}'`)
        appContext.bootSquance.push( (resolve,reject)=>{ 
            logger.debug(`Executing '${name}'`)
            initFN(resolve, reject)
        })
    }

    appContext.addPostBoot = (name, initFN) => {
        logger.debug(`Adding to post-boot '${name}'`)
        appContext.postbootSquance.push( (resolve,reject)=>{ 
            logger.debug(`PostBoot Executing '${name}'`)
            initFN(resolve, reject)
        })
    }

    
    appContext.boot = () => {
        appContext.bootSquance.forEach( (__itmBootSeqFunc) => {
            appContext._bootSquancePromises.push(new Promise( (fnResolve, fnReject)=>{
                try{
                    __itmBootSeqFunc(fnResolve, fnReject)
                }catch(ex){
                    logger.error(ex)
                    fnReject(ex)
                }
            }))
        })

        return Promise.all(appContext._bootSquancePromises)
    }

    appContext.postboot = () => {
        appContext.postbootSquance.forEach( (__itmBootSeqFunc) => {
            appContext._postbootSquancePromises.push(new Promise( (fnResolve, fnReject)=>{
                try{
                    __itmBootSeqFunc(fnResolve, fnReject)
                }catch(ex){
                    logger.error(ex)
                    fnReject(ex)
                }
            }))
        })

        return Promise.all(appContext._postbootSquancePromises)
    }
    appContext.inited = true
}


exports.getAppContext = () => {
    return appContext
}
exports.appContext = global.getAppContext = appContext
