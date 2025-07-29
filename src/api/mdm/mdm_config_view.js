import request from '@/utils/request';

// 查询视图管理列表
export function pageMdm_config_view(query) {
  return request({
    url: '/mdm/mdm_config_view/page',
    method: 'get',
    params: query,
  });
}

// 查询视图文件列表
export function pageDetailedMdm_config_view(query) {
  return request({
    url: '/mdm/mdm_config_view/pagedetailed',
    method: 'get',
    params: query,
  });
}

// 修改绑定的视图文件
export function updateBisaveMdm_config_view(data) {
  return request({
    url: '/mdm/mdm_config_view/bisave',
    method: 'post',
    data: data,
  });
}
