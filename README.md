# CivilWarRoom
A system that supports a state of war for civilian needs. Because of a war situation in Israel, the people of Israel unite and open war rooms to help each other in a war situation.

# Quick start

## Build docker
Requirements:
* node.js  > 20.0.0
* yarn > 1.22
* docker > 20

Building:
```bash
cd ./scripts/
./build-production-package.sh
```

Running docker: 
```bash
docker run -p 8080:8080  alefbt.com/warroom
```

# Architecture
See more about the architecture [here](./docs/architecture/README.md)

![OverAll Architecture](./docs/architecture/images/OverAllArchitecture.png)

## War Room UI
Responsible for user interface and interaction via WebSocket to WarRoom Hub

* Code folder found `./civilWarRoomUI` see [here](./civilWarRoomUI/README.md)
* Base on [Quasar framework](https://quasar.dev/)

## War Room Hub
Responsible for be repository for data
and also serves the UI

### Requirements
* MongoDB >= mongodb-community-server:7.0.0-ubi8
* RabbitMQ >= 3
* Redis

## Process Description
### Authentication
UI means only on the browser of the user e.g. FrontEnd

![Auth process activity](./docs/architecture/images/Auth%20Process%20Activity.png)

# Development
Working with GitFlow methodolgy, it means that you open a branch for each task you want to develop e.g. `feature/<name>` and commit the changes and push after that we will do pull request and marge to development branch.

First run the `civilWarRoomHub` the UI has Proxy to API calls to the Hub.
```bash
cd civilWarRoomHub
yarn run dev

cd civilWarRoomUI
yarn run dev
```
or you can go to folder `dockers/civil-war-room-dev-env-1` and run `docker-compose up`

# License
* GPLv3 license
* All rights reserved to Yehuda Korotkin