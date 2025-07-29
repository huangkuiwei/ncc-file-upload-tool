import request from '@/utils/request';

export function pageMdm_monitor_water(query) {
  return request({
    url: '/mdm/mdm_monitor_water/page',
    method: 'get',
    params: query,
  });
}

// 查询视图文件列表
export function delMdm_monitor_water(id) {
  return request({
    url: '/mdm/mdm_monitor_water',
    method: 'delete',
    params: { ids: id },
  });
}
