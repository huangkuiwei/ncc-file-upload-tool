import request from '@/utils/request';

// 查询模型管理列表
export function pageMdm_config_model(query) {
  return request({
    url: '/mdm/mdm_config_model/page',
    method: 'get',
    params: query,
  });
}

// 删除模型管理
export function delMdm_config_model(id) {
  return request({
    url: '/mdm/mdm_config_model',
    method: 'delete',
    params: { ids: id },
  });
}
