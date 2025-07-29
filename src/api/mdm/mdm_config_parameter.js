import request from '@/utils/request';

// 查询参数管理列表
export function pageMdm_config_parameter(query) {
  return request({
    url: '/mdm/mdm_config_parameter/page',
    method: 'get',
    params: query,
  });
}

// 查询参数管理详细
export function getMdm_config_parameter(id) {
  return request({
    url: '/mdm/mdm_config_parameter/get',
    method: 'get',
    params: { id: id },
  });
}

// 新增参数管理
export function addMdm_config_parameter(data) {
  return request({
    url: '/mdm/mdm_config_parameter',
    method: 'post',
    data: data,
  });
}

// 修改参数管理
export function updateMdm_config_parameter(data) {
  return request({
    url: '/mdm/mdm_config_parameter',
    method: 'put',
    data: data,
  });
}

// 删除参数管理
export function delMdm_config_parameter(id) {
  return request({
    url: '/mdm/mdm_config_parameter',
    method: 'delete',
    params: { ids: id },
  });
}
