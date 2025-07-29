import request from '@/utils/request'

//授权登录
export function ssoLogin(username) {
  return request({
    url: '/ssoLogin?userName='+username,
    headers: {
      isToken: false
    },
    method: 'get',
  })
}

//授权登录
export function selfSsoLogin(username) {
  return request({
    url: '/selfSsoLogin?userName='+username,
    headers: {
      isToken: false
    },
    method: 'get',
  })
}
