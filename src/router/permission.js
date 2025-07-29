import router from '@/router';
import store from '@/store';
import settings from '@/settings';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { getToken, removeToken } from 'ctcemti-ui/src/utils/auth';
import { ArrayUtil } from 'ctcemti-ui/src/utils/base/ArrayUtil';
import TabUtil from 'ctcemti-ui/src/plugins/tab';

NProgress.configure({ showSpinner: false });

export const defaultWhiteList = [
  '/login',
  '/forgetPassword',
  '/auth-redirect',
  '/bind',
  '/register',
  '/401',
  '/404',
  '/apiInfo',
  '/s',
];

/** 获取默认配置 */
const dashboardSidebarOpened = settings && settings.dashboardSidebarOpened;
const dashboardPath = settings && settings.dashboardPath ? settings.dashboardPath : [];
const reLogin = settings && settings.reLogin;
export const routerWhiteList =
  settings && settings.routerWhiteList && Array.isArray(settings.routerWhiteList) ? settings.routerWhiteList : [];

router.beforeEach((to, from, next) => {
  NProgress.start();

  /** 左侧菜单是否收缩 */
  if (ArrayUtil.oneOf(to.path, dashboardPath) && !dashboardSidebarOpened) {
    store.dispatch('app/closeSideBar', { withoutAnimation: false });
  } else {
    store.dispatch('app/openSideBar', { withoutAnimation: false });
  }

  /** 如果是单点登录的路由 先进行removeToken */
  if (to.path === '/ssoLogin') {
    removeToken();
  }

  /** token有效 */
  if (getToken()) {
    /** 三级及以上菜单缓存 */
    if (to.matched && to.matched.length > 2) {
      to.matched.splice(1, to.matched.length - 2);
    }

    to.meta.title && store.dispatch('settings/setTitle', to.meta.title);
    /* has token*/
    if (to.path === '/login' || to.path === '/forgetPassword') {
      if (reLogin) {
        next();
      } else {
        next({ path: '/' });
      }
      NProgress.done();
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        store
          .dispatch('GetInfo')
          .then(() => {
            // 未配置平台角色，提示用户未授权访问平台
            if (!store.getters.roles || store.getters.roles.length === 0) {
              removeToken();
              next('/401');
              return;
            }
            store.dispatch('GenerateRoutes').then((accessRoutes) => {
              // 后端没传菜单过来
              if (accessRoutes.length == 1 && accessRoutes[0].redirect == '/404') {
                next();
              } else {
                // 根据roles权限生成可访问的路由表
                router.addRoutes(accessRoutes); // 动态新增可访问路由表
                next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
              }
            });
            // 加载省市区数据
            store.dispatch('region/getRegion');
            //取文件预览地址
            store.dispatch('GetPreviewUrl');
            //取是否开启验证标志(微服务开启)
            store.dispatch('GetAppSecurityProperties');
          })
          .catch((err) => {
            store.dispatch('Logout').then(() => {
              if (TabUtil && TabUtil.closeAllPage) {
                TabUtil.closeAllPage();
              }
              router.push('/login');
            });
          });
      } else {
        next();
      }
    }
  } else {
    // 没有token
    if (defaultWhiteList.concat(routerWhiteList).indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  store.dispatch('app/changeLoadBeforeState', false);
  NProgress.done();
});
