import request from '@/utils/request';

export function pageMdm_upload_record(query) {
  return request({
    url: '/mdm/mdm_monitor_upload_record/page',
    method: 'get',
    params: query,
  });
}
