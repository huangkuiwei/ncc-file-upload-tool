import request from '@/utils/request';

// 查询首页模型列表
export function pageMdm_config_homemodel(query) {
  return request({
    url: '/mdm/mdm_config_homemodel/list',
    method: 'get',
    params: query,
  });
}

// 删除首页模型
export function delMdm_config_homemodel(id) {
  return request({
    url: '/mdm/mdm_config_homemodel',
    method: 'delete',
    params: { ids: id },
  });
}

// 更新首页模型实景地址
export function pageMdm_config_Real(data) {
  return request({
    url: '/mdm/mdm_config_homemodel',
    method: 'put',
    data: data,
  });
}
