import request from '@/utils/request';

export function pageMdm_electron_monitor(query) {
  return request({
    url: '/mdm/mdm_electron_monitor/page',
    method: 'get',
    params: query,
  });
}
