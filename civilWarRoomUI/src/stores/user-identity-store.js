import { inject } from 'vue'
import { defineStore } from 'pinia'
import * as utilsBusEvents from  '../utils/bus-events'
import * as encryption from '../utils/encryption'
import { extend, LocalStorage } from 'quasar'

import { EventBus } from 'quasar'
const bus = new EventBus()
const localStorageKey = 'LS_sessionLoginObject'

export const useUserIdentityStore = defineStore('UserIdentity', {
  state: () => ({
    isUserIdentitySetted: false,
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
    loadCachedSessionIdentity() {
      if(this.isUserIdentitySetted)
        return;

      const lsobj = LocalStorage.getItem(localStorageKey) || {}
      this.setUserSessionIdentity(lsobj)
    },
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
        this.isUserIdentitySetted = true

        LocalStorage.set(localStorageKey, extend(true /* deep */, {}, sessionLoginObject))

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
