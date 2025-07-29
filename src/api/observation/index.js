import request from '@/utils/request';

export function pageMdm_monitor_subside(query) {
  return request({
    url: '/mdm/mdm_monitor_subside/page',
    method: 'get',
    params: query,
  });
}

// 查询视图文件列表
export function delMdm_monitor_subside(id) {
  return request({
    url: '/mdm/mdm_monitor_subside',
    method: 'delete',
    params: { ids: id },
  });
}
