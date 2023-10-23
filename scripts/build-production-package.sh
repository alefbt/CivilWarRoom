#!/bin/sh
set -e

me="$(basename "$(test -L "$0" && readlink "$0" || echo "$0")")"

SCRIPT=$(realpath "$me")
SCRIPTPATH=$(dirname "$SCRIPT")
PROJECTROOT=$(realpath "$SCRIPTPATH/..")

if [ false != false ] ; then 
    cd ${PROJECTROOT}/civilWarRoomUI
    yarn install
    yarn run build

    cd ${PROJECTROOT}/civilWarRoomHub
    yarn install
    yarn run build
fi

rm -rf ${SCRIPTPATH}/production-package-builder/src-hub
mkdir -p ${SCRIPTPATH}/production-package-builder/src-hub

rm -rf ${SCRIPTPATH}/production-package-builder/src-ui
mkdir -p ${SCRIPTPATH}/production-package-builder/src-ui

rm -rf ${SCRIPTPATH}/production-package-builder/src-marged-package
mkdir -p ${SCRIPTPATH}/production-package-builder/src-marged-package


cd ${SCRIPTPATH}/production-package-builder
yarn install
yarn run build

docker build . -t alefbt.com/warroom

echo "DONE. =============================== :-)"
echo "Awesome, now you can run:"
echo " $ docker run -p 8080:8080  alefbt.com/warroom"
echo " "
