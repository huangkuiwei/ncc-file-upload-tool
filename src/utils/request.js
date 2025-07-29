import axios from 'axios';
import { Message, MessageBox } from 'element-ui';
import store from '@/store';
import router from '@/router';
import { getToken, getRequestConfig, getHeadersAuthorization } from 'ctcemti-ui/src/utils/auth';
import errorCode from 'ctcemti-ui/src/utils/errorCode';
import { UrlUtil } from 'ctcemti-ui/src/utils/base/UrlUtil';
import { StringUtil } from 'ctcemti-ui/src/utils/base/StringUtil';
import tab from 'ctcemti-ui/src/plugins/tab';
import { doDecryptStr, doEncrypt } from 'ctcemti-ui/src/utils/smCrypto';
import settings from '@/settings';
import { closeModel } from '@/utils/tools';

// 是否显示重新登录
let isReLogin;

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_BASE_API,
  // 超时
  timeout: settings.requestTimeOut,
});

// 创建axios实例
const kjService = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_KJ_BASE_API,
  // 超时
  timeout: settings.requestTimeOut,
});

function requestInterceptors(config) {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false;
  if (getToken() && !isToken) {
    config.headers[getRequestConfig().headersTokenKey] = getRequestConfig().headersTokenValue;
  }

  // 参数加密
  if (settings.requestEncrypt) {
    config.headers['encrypt'] = true;
    if (config.data) config.data = { data: doEncrypt(config.data) };
  }

  // Get请求映射Params参数
  if (config.method === 'get' && config.params) {
    const params = UrlUtil.tansParams(config.params).slice(0, -1);
    const url = config.url + '?' + (settings.requestEncrypt ? `data=${doEncrypt(params)}` : params);
    config.params = {};
    config.url = url;
  }

  // 用户修改接口请求方式
  if (getRequestConfig().changeRequestMethod && typeof getRequestConfig().changeRequestMethod === 'function') {
    const { method, httpMethod } = getRequestConfig().changeRequestMethod(config.method, config.url);

    if (method && httpMethod) {
      if (httpMethod.toUpperCase() != method.toUpperCase()) {
        config.headers['X-HTTP-Method-Override'] = httpMethod;
      }

      config.method = method;
    }
  }

  return config;
}

function requestErrorInterceptors(error) {
  Promise.reject(error);
}

// request拦截器
service.interceptors.request.use(requestInterceptors, requestErrorInterceptors);
kjService.interceptors.request.use(requestInterceptors, requestErrorInterceptors);

function responseInterceptors(res) {
  const isDecrypt = res.headers.encrypt && res.headers.encrypt.includes('true');
  const resData = isDecrypt ? doDecryptStr(res.data) : res.data;
  // 未设置状态码则默认成功状态
  const code = resData.code || 200 || 1;
  // 获取错误信息
  const msg = errorCode[code] || resData.msg || errorCode['default'];
  // 二进制数据则直接返回
  if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
    const contentType = res.headers['content-type'];
    if (resData.size === 0 || (contentType && contentType.includes('json'))) {
      const data = resData;
      let fileReader = new FileReader();
      fileReader.readAsText(data);
      fileReader.onload = function (result) {
        let jsonData = JSON.parse(result.target.result);
        Message.closeAll();
        Message({
          message: jsonData.msg,
          type: settings.responseWarningMessageType,
          duration: 5 * 1000,
        });
      };
      return Promise.reject(res);
    }
    return res;
  }

  if (code === 401) {
    if (!isReLogin) {
      isReLogin = true;
      MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或重新登录', '系统提示', {
        confirmButtonText: '重新登录',
        showCancelButton: false,
        type: 'warning',
      })
        .then(() => {
          isReLogin = false;
          store.dispatch('Logout').then(() => {
            // 如果是登录页面不需要重新加载
            if (window.location.hash.indexOf('#/login') != 0) {
              if (tab && tab.closeAllPage) {
                tab.closeAllPage();
              }
              router.push(`/login?redirect=${router.app._route.fullPath}`);
            }
          });
        })
        .catch(() => {
          isReLogin = false;
        });
    }
    return null;
  } else if (code === 500) {
    Message.closeAll();
    Message({
      message: StringUtil.getExceptionMessage(msg),
      type: settings.responseWarningMessageType,
    });
    return Promise.reject(resData);
  } else if (code === 10081001) {
    return resData;
  }
  // 模型被占用，关闭模型
  else if (code === -120) {
    // let filePath = resData.msg
    // closeModel(
    //   process.env.VUE_APP_MODEL_BASE_URL + "/?" + filePath + '?closemodel',
    //   () => {
    //     // TODO
    //     // service({
    //     //   url: '/mdm/mdm_config_homemodel',
    //     //   method: 'delete',
    //     //   params: {ids: id}
    //     // })
    //     console.log("resData", resData)
    //   }
    // );
    return resData;
  } else if (code !== 200) {
    Message.closeAll();
    Message.error({
      message: StringUtil.getExceptionMessage(msg),
      type: settings.responseWarningMessageType,
    });
    return Promise.reject(resData);
  } else {
    return resData;
  }
}

function responseErrorInterceptors(error) {
  let { message, response } = error;
  if (message == 'Network Error') {
    message = '服务连接异常，请联系管理员检查服务是否启动状态';
  } else if (message.includes('timeout')) {
    message = '请求超时，请检查网络是否稳定';
  } else {
    message = StringUtil.getExceptionMessage(message);
    if (response && response.data && response.data.msg) {
      message += ' : ' + response.data.msg;
    }
  }
  Message.closeAll();
  Message({
    message: message,
    type: settings.responseWarningMessageType,
    duration: 5 * 1000,
  });
  return Promise.reject(error);
}

// 响应拦截器
service.interceptors.response.use(responseInterceptors, responseErrorInterceptors);
kjService.interceptors.response.use(responseInterceptors, responseErrorInterceptors);

export default service;

export { kjService };
