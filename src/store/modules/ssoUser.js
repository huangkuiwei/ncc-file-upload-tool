import Cookies from "js-cookie";
import { ssoLogin } from "@/api/ssoLogin";
import {
  getToken,
  setToken,
  setExpiresIn,
  removeToken,
} from "ctcemti-ui/src/utils/auth";
import {getInfo} from "ctcemti-ui/src/api/system/user";
import {StringUtil} from "ctcemti-ui/src/utils/base/StringUtil";

const ssoUser = {
  actions: {
    // 登录
    selfSsoLogin({ commit }, userInfo) {
      // 登录前 把之前的去除
      Cookies.set('menuGroup', '');
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      //commit('SET_PERMISSION_ORG_IDS', []);
      commit('SET_FUNCTIONS', []);
      removeToken();

      const username = userInfo.username.trim();
      return new Promise((resolve, reject) => {
        selfSsoLogin(username)
          .then((res) => {
            let data = res.data;
            setToken(data.access_token);
            commit("SET_TOKEN", data.access_token);
            //setExpiresIn(data.expires_in);
            //commit("SET_EXPIRES_IN", data.expires_in);

            getInfo().then(res => {
              if (!res) {
                reject(new Error('error'));
              }

              const data = res.data || {};
              const user = data.user;
              commit('SET_USERINFO', user);
              commit('SET_ID', user.userId);
              commit('SET_NAME', user.userName);
              commit('SET_REAL_NAME', user.realName);
              commit('SET_GENDER', user.gender);
              commit('SET_AVATAR', user.avatar);
              commit('SET_SIGNATURE', user.signature);
              commit('SET_ORG_ID', user.orgId);
              commit('SET_ORG_NAME', user.orgName);
              commit('SET_UNIT_ORG_ID', user.unitOrgId);
              commit('SET_ASSIGN_ORG_ID', user.assignOrgId);
              commit('SET_ASSIGN_UNIT_ORG_ID', user.assignUnitOrgId);
              commit('SET_ASSIGN_ORG_NAME', user.assignOrgName);
              commit('SET_POST_ID', user.postId);
              commit('SET_ROLE_ID', user.roleId);
              commit('SET_ROLES', data.roles);
              commit('SET_PERMISSIONS', data.permissions);
              commit('SET_FUNCTIONS', data.functions);
            }).catch(error => {
              reject(error);
            })

            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 登录
    ssoLogin({ commit }, userInfo) {
      // 登录前 把之前的去除
      Cookies.set('menuGroup', '');
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      //commit('SET_PERMISSION_ORG_IDS', []);
      commit('SET_FUNCTIONS', []);
      removeToken();

      console.log("ssoLogin");
      const username = userInfo.username.trim();
      return new Promise((resolve, reject) => {
        ssoLogin(username)
          .then((res) => {
            let data = res.data;
            setToken(data.access_token);
            commit("SET_TOKEN", data.access_token);
            //setExpiresIn(data.expires_in);
            //commit("SET_EXPIRES_IN", data.expires_in);

            getInfo().then(res => {
              if (!res) {
                reject(new Error('error'));
              }

              const data = res.data || {};
              const user = data.user;
              commit('SET_USERINFO', user);
              commit('SET_ID', user.userId);
              commit('SET_NAME', user.userName);
              commit('SET_REAL_NAME', user.realName);
              commit('SET_GENDER', user.gender);
              commit('SET_AVATAR', user.avatar);
              commit('SET_SIGNATURE', user.signature);
              commit('SET_ORG_ID', user.orgId);
              commit('SET_ORG_NAME', user.orgName);
              commit('SET_UNIT_ORG_ID', user.unitOrgId);
              commit('SET_ASSIGN_ORG_ID', user.assignOrgId);
              commit('SET_ASSIGN_UNIT_ORG_ID', user.assignUnitOrgId);
              commit('SET_ASSIGN_ORG_NAME', user.assignOrgName);
              commit('SET_POST_ID', user.postId);
              commit('SET_ROLE_ID', user.roleId);
              commit('SET_ROLES', data.roles);
              commit('SET_PERMISSIONS', data.permissions);
              commit('SET_FUNCTIONS', data.functions);
            }).catch(error => {
              reject(error);
            })

            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    //appLogin
    appLogin({ commit }, userInfo) {
      console.log("appLogin");
      return new Promise((resolve, reject) => {
        appLogin(userInfo)
          .then((res) => {
            let data = res.data;
            setToken(data.access_token);
            commit("SET_TOKEN", data.access_token);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    //微信登录Login
    wxLogin({ commit }, userInfo) {
      console.log("wxLogin");
      return new Promise((resolve, reject) => {
        appLogin(userInfo)
          .then((res) => {
            let data = res.data;
            setToken(data.access_token);
            commit("SET_TOKEN", data.access_token);
            getInfo().then(res => {
              if (!res) {
                reject(new Error('error'));
              }

              const data = res.data || {};
              const user = data.user;
              commit('SET_USERINFO', user);
              commit('SET_ID', user.userId);
              commit('SET_NAME', user.userName);
              commit('SET_REAL_NAME', user.realName);
              commit('SET_GENDER', user.gender);
              commit('SET_AVATAR', user.avatar);
              commit('SET_SIGNATURE', user.signature);
              commit('SET_ORG_ID', user.orgId);
              commit('SET_ORG_NAME', user.orgName);
              commit('SET_UNIT_ORG_ID', user.unitOrgId);
              commit('SET_ASSIGN_ORG_ID', user.assignOrgId);
              commit('SET_ASSIGN_UNIT_ORG_ID', user.assignUnitOrgId);
              commit('SET_ASSIGN_ORG_NAME', user.assignOrgName);
              commit('SET_POST_ID', user.postId);
              commit('SET_ROLE_ID', user.roleId);
              commit('SET_ROLES', data.roles);
              commit('SET_PERMISSIONS', data.permissions);
              commit('SET_FUNCTIONS', data.functions);
            }).catch(error => {
              reject(error);
            })
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

  },
};

export default ssoUser;
