import request from '@/utils/request';

// 查询公告管理列表
export function pageMdm_config_notice(query) {
  return request({
    url: '/mdm/mdm_config_notice/page',
    method: 'get',
    params: query,
  });
}

// 查询公告管理详细
export function getMdm_config_notice(id) {
  return request({
    url: '/mdm/mdm_config_notice/get',
    method: 'get',
    params: { id: id },
  });
}

// 新增公告管理
export function addMdm_config_notice(data) {
  return request({
    url: '/mdm/mdm_config_notice',
    method: 'post',
    data: data,
  });
}

// 修改公告管理
export function updateMdm_config_notice(data) {
  return request({
    url: '/mdm/mdm_config_notice',
    method: 'put',
    data: data,
  });
}

// 删除公告管理
export function delMdm_config_notice(id) {
  return request({
    url: '/mdm/mdm_config_notice',
    method: 'delete',
    params: { ids: id },
  });
}
