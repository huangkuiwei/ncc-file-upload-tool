## 业务数据操作的公共方法
# 调用方式, 在vue created () {...}中调用
this.business.list业务名().then(response => {
    this.业务名DataList = response.data;
});

如,查询项目分部
this.business.listProject().then(response => {
    this.projectDataList = response.data;
});

# 公共方法集
1 查询项目分部：this.business.listProject()
2 查询产品类型：this.business.listProject()
3 查询材料分类：this.business.listPartCategory()
