import request from '@/utils/request';

export function pageMdm_repair_bill(query) {
  return request({
    url: '/mdm/mdm_repair_bill/page',
    method: 'get',
    params: query,
  });
}

export function delMdm_repair_bill(id) {
  return request({
    url: '/mdm/mdm_repair_bill',
    method: 'delete',
    params: { ids: id },
  });
}
