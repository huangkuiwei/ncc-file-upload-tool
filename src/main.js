import Vue from 'vue'
import Cookies from 'js-cookie'
import Element from 'element-ui'
import VueMeta from 'vue-meta' // 头部标签组件
import VXETable from 'vxe-table'
// import Print from 'vue-print-nb' // vue3 版本需要执行 npm install vue3-print-nb --save， 引用import print from 'vue3-print-nb'
import store from './store'
import router from './router'
import './assets/icons' // icon
import 'ctcemti-ui/src/assets/iconfont/iconfont.css' // iconfont
import VlTree from '@sangtian152/virtual-tree'

import "@sangtian152/virtual-tree/lib/vl-tree.css"
import 'vxe-table/lib/style.css'
import '@/router/permission' // permission control
import MtiComponents from 'ctcemti-ui/src/components/index'
import App from './App'
import 'ctcemti-ui/src/assets/styles/element-variables.scss'
import 'ctcemti-ui/src/assets/styles/index.scss' // global css
import 'ctcemti-ui/src/assets/styles/custom.scss' // custom css
import directive from 'ctcemti-ui/src/directive' // directive
import plugins from 'ctcemti-ui/src/plugins' // plugins
import { getDicts } from "ctcemti-ui/src/api/system/dict/data"
import { getConfigKey } from "ctcemti-ui/src/api/system/config"
import { TreeUtil } from "ctcemti-ui/src/utils/base/TreeUtil"
import { JsonUtil } from 'ctcemti-ui/src/utils/base/JsonUtil'
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil'
import { DictUtil } from 'ctcemti-ui/src/utils/base/DictUtil'
import { FileUtil } from 'ctcemti-ui/src/utils/base/FileUtil'
import Pagination from "ctcemti-ui/src/components/Pagination" // 分页组件
import RightToolbar from "ctcemti-ui/src/components/RightToolbar" // 自定义表格工具组件
import Editor from "ctcemti-ui/src/components/Editor" // 富文本组件
import FileUpload from "ctcemti-ui/src/components/FileUpload" // 文件上传组件
import ImageUpload from "ctcemti-ui/src/components/ImageUpload" // 图片上传组件
import DictTag from 'ctcemti-ui/src/components/DictTag' // 字典标签组件
import DictData from 'ctcemti-ui/src/components/DictData' // 字典数据组件
import ActionButton from "ctcemti-ui/src/components/Button/ActionButton" // 操作按钮
import { DomUtil } from "ctcemti-ui/src/utils/base/DomUtil" // Dom操作工具类
import { CurrencyUtil } from "ctcemti-ui/src/utils/base/CurrencyUtil"
import { StringUtil } from "ctcemti-ui/src/utils/base/StringUtil"
import MtiUtils from "ctcemti-ui/src/utils/index"
import vcolorpicker from 'vcolorpicker'

// bpmnProcessDesigner 需要引入
import "ctcemti-ui/src/components/bpmnProcessDesigner/package/theme/index.scss";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "@/assets/icons/iconfont/iconfont.js";
import "@/assets/icons/iconfont2/iconfont.js";
import '@/utils/dialogDrag';

// 全局方法、属性挂载
Vue.prototype.getDicts = getDicts;
Vue.prototype.getConfigKey = getConfigKey;
Vue.prototype.parseTime = DateUtil.format;
Vue.prototype.resetForm = JsonUtil.resetForm;
Vue.prototype.addDateRange = DateUtil.addDateRange;
Vue.prototype.getDictLabel = DictUtil.getDictLabel;
Vue.prototype.getDictLabels = DictUtil.getDictLabels;
Vue.prototype.excludeDict = DictUtil.excludeDict;
Vue.prototype.handleTree = TreeUtil.handleTree;
Vue.prototype.exportExcel = FileUtil.exportExcel;
Vue.prototype.focusError = DomUtil.focusError;
Vue.prototype.showTableColumn = () => {
  return store.state.settings.actionColumn;
};

// 全局组件挂载
Vue.component('DictTag', DictTag)
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
Vue.component('Editor', Editor)
Vue.component('FileUpload', FileUpload)
Vue.component('ImageUpload', ImageUpload)
Vue.component('ActionButton', ActionButton)

Vue.use(VlTree)
Vue.use(VXETable)
Vue.use(directive)
Vue.use(plugins)
Vue.use(VueMeta)
// Vue.use(Print)
Vue.use(MtiComponents)
Vue.use(MtiUtils)
Vue.use(vcolorpicker)
DictData.install()

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: Cookies.get('size') || 'mini' // set element-ui default size
})

Vue.config.productionTip = false



/******************************************
 * custom settings
 * @Date 2021年8月8日
 * ****************************************
 */
/** 列宽定义*/
Vue.prototype.getColumnWidth = (index, width) => {
  let colsWidth = Cookies.get(router.currentRoute.path);
  if (colsWidth != null && colsWidth.length > 0 && index <= colsWidth.length - 1) {
    if (typeof colsWidth === 'string') {
      colsWidth = JSON.parse(colsWidth);
    }
    return colsWidth[index].width;
  }
  if (width) {
    console.log('width', width);
    return width;
  }
  return {};
};

/**
 * 处理数值计算精度
 */
// 加
Number.prototype['add'] = function (...arg) {
  let r1; let r2; let m; let result = this;
  arg.forEach(value => {
    try { r1 = result.toString().split('.')[1].length; } catch (e) { r1 = 0; }
    try { r2 = value.toString().split('.')[1].length; } catch (e) { r2 = 0; }
    m = Math.pow(10, Math.max(r1, r2));
    result = Math.round(result * m + value * m) / m;
  });
  return result;
};
// 减
Number.prototype['sub'] = function (...arg) {
  let r1; let r2; let m; let result = this;
  arg.forEach(value => {
    try { r1 = result.toString().split('.')[1].length; } catch (e) { r1 = 0; }
    try { r2 = value.toString().split('.')[1].length; } catch (e) { r2 = 0; }
    m = Math.pow(10, Math.max(r1, r2));
    let n = (r1 >= r2) ? r1 : r2;
    result = Number((Math.round(result * m - value * m) / m).toFixed(n));
  });
  return result;
};
// 乘
Number.prototype['mul'] = function (...arg) {
  let result = this;
  arg.forEach(value => {
    let m = 0; let s1 = result.toString(); let s2 = value.toString();
    try { m += s1.split('.')[1].length; } catch (e) { }
    try { m += s2.split('.')[1].length; } catch (e) { }
    result = Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
  });
  return result;
};
// 除
Number.prototype['div'] = function (...arg) {
  var result = this;
  arg.forEach(value => {
    let t1 = 0; let t2 = 0; let r1; let r2;
    try { t1 = result.toString().split('.')[1].length; } catch (e) { }
    try { t2 = value.toString().split('.')[1].length; } catch (e) { }
    r1 = Number(result.toString().replace('.', ''));
    r2 = Number(value.toString().replace('.', ''));
    result = (r1 / r2) * Math.pow(10, t2 - t1);
  });
  return result;
};

/**
 * 全局数据格式化方法
 */
/** 数据格式化 */
Vue.prototype.numberFormat = function (val, decimal) {
  decimal = decimal || 2;
  let formatValue = StringUtil.toFixed(val, decimal);
  return formatValue;
};

/** 金额格式化 */
Vue.prototype.currencyFormat = function (val, decimal) {
  let formatValue = CurrencyUtil.format(val, true, null, decimal);
  return formatValue;
};

/**
 * 定义全局异常
 */
const errorHandler = (err, vm, info) => {
  console.log(`Error: ${err.toString()}\nInfo: ${info}`);
  /**
   * 定义SkyWalking前端收集器
   * @param error
   */
  // ClientMonitor.reportFrameErrors({
  //   collector: process.env.VUE_APP_VUE_APP_SKYWALKING_COLLECTOR_URL,
  //   service: process.env.VUE_APP_ROOT_PATH,
  //   pagePath: router.currentRoute.path,
  //   serviceVersion: 'v1.0.0',
  // }, err);
}
Vue.config.errorHandler = errorHandler;
Vue.prototype.$throw = (error) => errorHandler(error, this);

window.onerror = function (message, source, line, column, error) {
  console.error(`Source: ${source}\nLine: ${line}\nColumn: ${column}\nError: ${message}`);
}

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
