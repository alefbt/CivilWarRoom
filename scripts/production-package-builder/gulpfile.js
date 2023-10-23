const { series,parallel, src, dest } = require('gulp');
const cleanDir = require('gulp-clean-dir');
var bump = require('gulp-bump');


const uiSourcePath = `../../civilWarRoomUI`,
      hubSourcePath = `../../civilWarRoomHub`

function clean(cb) {
    cleanDir('./src-ui/')
    cleanDir('./src-hub/')
    cb();
}

function bumpUIVersion(cb){
    return src(`${uiSourcePath}/package.json`)
    .pipe(bump({key: "version", type:'patch'}))
    .pipe(dest(`${uiSourcePath}/`));
}
function bumpHubVersion(cb){
    return src(`${hubSourcePath}/package.json`)
    .pipe(bump({key: "version", type:'patch'}))
    .pipe(dest(`${hubSourcePath}/`));
}
function copyHubFiles(cb){
    return src(`${hubSourcePath}/**/*`)
        .pipe(cleanDir('./src-hub/'))
        .pipe(dest('./src-hub/'));
}

function copyUIFiles(cb){
    return src(`${uiSourcePath}/dist/spa/**/*`)
        .pipe(cleanDir('./src-ui/'))
        .pipe(dest('./src-ui/'));
}

function copyHubToMargedPackage(cb){
    return src('./src-hub/**/*')
    .pipe(dest('./src-marged-package'));
}

function copyUIToMargedPackage(cb){
    return src('./src-ui/**/*')
    .pipe(dest('./src-marged-package/public'));
}

exports.build = series(clean,
    parallel(bumpUIVersion, bumpHubVersion),
    parallel(copyHubFiles, 
        series(
            copyUIFiles
            
        )
    ),
    copyHubToMargedPackage,
    copyUIToMargedPackage
    )
    
exports.default = series(clean);