import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import { processFormRoutes, startFormRoutes } from './modules/processFormRoutes'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component:  () => import('ctcemti-ui/src/views/redirect')
      }
    ]
  },
  {
    path: '/login',
    component:  () => import('@/views/login'),
    hidden: true
  },
  {
    path: "/ssoLogin",
    component: () => import("@/views/ssoLogin"),
    hidden: true,
  },
  {
    path: '/register',
    component:  () => import('ctcemti-ui/src/views/register'),
    hidden: true
  },
  {
    path: '/share',
    component:  () => import('@/views/share/index'),
    hidden: true
  },
  {
    path: '/404',
    component:  () => import('ctcemti-ui/src/views/error/404'),
    hidden: true
  },
  {
    path: '/401',
    component:  () => import('ctcemti-ui/src/views/error/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'index',
    children: [
      {
        path: 'index',
        component:  () => import('@/views/projectBoard'),
        name: 'Index',
        meta: { title: '项目看板', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component:  () => import('ctcemti-ui/src/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'message',
        component:  () => import('@/views/system/message/index'),
        name: 'Message',
        meta: { title: '消息中心' }
      },
      {
        path: 'dict-data/index/:typeId(\\d+)',
        component:  () => import('ctcemti-ui/src/views/system/dict/data'),
        name: 'Data',
        meta: { title: '字典数据', activeMenu: '/system/sysResource/dict' }
      },
      // {
      //   path: 'org-model/orgEdit',
      //   component:  () => import('ctcemti-ui/src/views/system/org/edit'),
      //   name: 'orgEdit',
      //   meta: { title: '编辑组织', icon: '', activeMenu: '/system/organization/org' }
      // },
      // {
      //   path: 'org-model/postStd',
      //   component:  () => import('ctcemti-ui/src/views/system/postStd/index'),
      //   name: 'postStd',
      //   meta: { title: '标准岗位库', icon: '', activeMenu: '/system/organization/postStdGroup' }
      // }
    ]
  },
  {
    path: '/job-log',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index',
        component:  () => import('ctcemti-ui/src/views/job/log'),
        name: 'JobLog',
        meta: { title: '调度日志', activeMenu: '/scheduler/job' }
      }
    ]
  },
  {
    path: '/generator/edit',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index',
        component:  () => import('ctcemti-ui/src/views/devops/generator/editTable'),
        name: 'GenEdit',
        meta: { title: '修改生成配置', activeMenu: '/devops/generator' }
      }
    ]
  },
  {
    path: '/flowable',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'definition/modelEditor/:id(\\d+)',
        component:  () => import('ctcemti-ui/src/views/flowable/definition/modelEditor'),
        name: 'DefinitionModel',
        meta: { title: '流程设计', icon: '', activeMenu: '/flowable/definition' }
      },
      {
        path: 'definition/history/:key',
        component:  () => import('ctcemti-ui/src/views/flowable/definition/history'),
        name: 'DefinitionHistory',
        meta: { title: '流程定义历史', icon: '', activeMenu: '/flowable/definition' }
      },
      {
        path: 'activity/:processInstanceId/:taskId',
        component:  () => import('ctcemti-ui/src/components/bpmnProcessViewer/activity'),
        name: 'FlowActivity',
        meta: { title: '流程处理', icon: '' },
        children: [
          ...processFormRoutes
        ]
      },
      {
        path: 'start/:processKey/:businessKey',
        component:  () => import('ctcemti-ui/src/components/bpmnProcessViewer/start'),
        name: 'FlowStart',
        meta: { title: '流程发起', icon: '' },
        children: [
          ...startFormRoutes
        ]
      },
      {
        path: 'view/:processInstanceId/:businessKey',
        component:  () => import('ctcemti-ui/src/components/bpmnProcessViewer/view'),
        name: 'FlowView',
        meta: { title: '流程查看', icon: '' },
        children: [
          ...processFormRoutes
        ]
      }
    ]
  },
  {
    path: '/app',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'version/:appId',
        component:  () => import('ctcemti-ui/src/views/system/app/appVersion/index'),
        name: 'AppVersion',
        meta: { title: '历史版本', activeMenu: '/system/app' }
      },
      {
        path: 'redeemCode/:appId',
        component:  () => import('ctcemti-ui/src/views/system/app/appRedeemCode/index'),
        name: 'AppRedeemCode',
        meta: { title: '兑换码', activeMenu: '/system/app' }
      }
    ]
  }
]

// 防止连续点击多次路由报错
let routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(err => err)
}

export default new Router({
  mode: 'hash', // history: 去掉url中的#,  hash访问路径存在#
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})
