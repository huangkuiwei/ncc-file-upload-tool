import Vue from 'vue'
import Vuex from 'vuex'
import app from 'ctcemti-ui/src/store/modules/app'
import user from 'ctcemti-ui/src/store/modules/user'
import tagsView from 'ctcemti-ui/src/store/modules/tagsView'
import permission from 'ctcemti-ui/src/store/modules/permission'
import ssoUser from "@/store/modules/ssoUser";
import settings from 'ctcemti-ui/src/store/modules/settings'
import getters from './getters'
import mdm from '@/store/mdm'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    user,
    ssoUser,
    tagsView,
    permission,
    settings,
    mdm
  },
  getters
})

export default store
