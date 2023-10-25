
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    props: {},
    meta: {
      isPublic: false,
    },
    children: [
      { path: '', name:'Homepage', props: {}, component: () => import('pages/IndexPage.vue') }
    ]
  },
  {
    path: '/auth',
    component: () => import('layouts/FullLayout.vue'),
    children: [
      { path: 'login', name:"AuthLogin", 
        meta: {
          isPublic: true,
        },
        component: () => import('pages/auth/LoginPage.vue') },
      { path: 'register', name:"AuthRegister", 
        meta: {
          isPublic: true,
        },
        component: () => import('pages/auth/RegisterPage.vue') },
    ]
  },


  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
