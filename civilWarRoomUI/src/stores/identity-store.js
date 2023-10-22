import { defineStore } from 'pinia';

export const useIdentityStore = defineStore('Identity', {
  state: () => ({
    isAuthenticated: false,
    identityId: '',
    identityPublicKey: '',
    jwtPublicKey: '',
    jwtToken: '',
  }),
  getters: {
    //doubleCount: (state) => state.counter * 2,
  },
  actions: {
    setIdentity(userPublicKey){
      try{
        this.identityPublicKey = userPublicKey
        this.isAuthenticated = true;
      }catch(e){
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
