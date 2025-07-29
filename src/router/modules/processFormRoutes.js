/**
 * 流程表单路由
 * @type {[{path: string, component: (function(): Promise<*>), meta: {icon: string, title: string}, name: string}]}
 */
export const processFormRoutes = [
  {
    path: 'demoProcessForm',
    component:  () => import(/* webpackChunkName: "flowable" */ 'ctcemti-ui/src/views/devops/demo/flowable/demoProcessForm.vue'),
    name: 'demoProcessForm',
    meta: { title: '测试流程表单', icon: '' }
  }
]

export const startFormRoutes = [
  {
    path: 'demoStartForm/:id',
    component:  () => import(/* webpackChunkName: "flowable" */ 'ctcemti-ui/src/views/devops/demo/flowable/demoProcessForm.vue'),
    name: 'demoStartForm',
    meta: { title: '测试流程表单', icon: '' }
  }
]
