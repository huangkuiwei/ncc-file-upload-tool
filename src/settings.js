/**
 * 框架配置
 */
module.exports = {

  /**
   * 是否显示顶部导航
   */
  topNav: false,

  /**
   * 是否显示 tagsView
   */
  tagsView: true,

  /**
   * 是否显示logo
   */
  sidebarLogo: true,

  /**
   * 是否显示动态标题
   */
  dynamicTitle: false,

  /**
   * 是否显示列表操作列
   */
  actionColumn: false,

  /**
   * Cookie token标识, 以区分同一框架下的不同系统token存储
   */
  tokenKey: null,

  // /**
  //  * 左边菜单栏默认打开状态
  //  */
  // defaultSidebarOpened: true,

  // /**
  //  * 左边菜单栏在首页或大屏页面dashboard下的打开状态
  //  */
  // dashboardSidebarOpened: false,
  //
  // /**
  //  * 首页或大屏dashboard页面的路径
  //  */
  // dashboardPath: ['/','/index'],

  routerWhiteList: ['/ssoLogin']
}
