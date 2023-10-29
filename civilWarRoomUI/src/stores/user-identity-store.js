import { inject } from 'vue'
import { defineStore } from 'pinia'
import * as utilsBusEvents from  '../utils/bus-events'
import * as encryption from '../utils/encryption'

import { EventBus } from 'quasar'
const bus = new EventBus()

export const useUserIdentityStore = defineStore('UserIdentity', {
  state: () => ({
    displayName: '',
    isAuthenticated: false,
    sessionKey: '',
    jwtToken: '',
    jwtData: {},
    roles: [],
    validationSettings: {}
  }),
  getters: {
    //doubleCount: (state) => state.counter * 2,
  },
  actions: {
    setUserSessionIdentity(sessionLoginObject){
      try {

        this.jwtToken = sessionLoginObject.jwt
        this.jwtData = encryption.openJWT(this.jwtToken)
        this.displayName = this.jwtData.displayName
        this.roles = this.jwtData.roles
        this.warRoom = this.jwtData.warRoom
        this.sessionKey = sessionLoginObject.sessionKey
        this.validationSettings = sessionLoginObject.validation
        this.isAuthenticated = true
        bus.emit(utilsBusEvents.e_LOGIN, 1)

      } catch(e) {
        console.log("useIdentityStore.setIdentity error: ", e.message);
        return e;
      }
    }
    /*
    increment() {
      this.counter++;
    },*/
  },
});
