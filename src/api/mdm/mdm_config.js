import request from '@/utils/request';

// 查询配置管理列表
export function pageMdm_config(query) {
  return request({
    url: '/mdm/mdm_config/page',
    method: 'get',
    params: query,
  });
}

// 查询配置管理详细
export function getMdm_config(id) {
  return request({
    url: '/mdm/mdm_config/get',
    method: 'get',
    params: { id: id },
  });
}

// 新增配置管理
export function addMdm_config(data) {
  return request({
    url: '/mdm/mdm_config',
    method: 'post',
    data: data,
  });
}

// 修改配置管理
export function updateMdm_config(data) {
  return request({
    url: '/mdm/mdm_config',
    method: 'put',
    data: data,
  });
}

// 删除配置管理
export function delMdm_config(id) {
  return request({
    url: '/mdm/mdm_config',
    method: 'delete',
    params: { ids: id },
  });
}
