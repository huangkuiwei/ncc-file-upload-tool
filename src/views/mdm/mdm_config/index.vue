<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_config:save"
            type="primary"
            @click="handleAdd"
            v-hasPermi="['mdm:mdm_config:save']"
          >
            新增
          </action-button>
        </el-col>
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_config:update"
            plain
            type="primary"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['mdm:mdm_config:update']"
          >
            修改
          </action-button>
        </el-col>
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_config:remove"
            plain
            type="primary"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['mdm:mdm_config:remove']"
          >
            删除
          </action-button>
        </el-col>
        <el-col :span="1.5">
          <el-upload
            hashKey="mdm:mdm_config:import"
            v-hasPermi="['mdm:mdm_config:import']"
            action="/"
            accept=".xls,.xlsx"
            :show-file-list="false"
            :http-request="handleImport"
          >
            <action-button plain type="primary" @click="handleImport">导入</action-button>
          </el-upload>
        </el-col>

        <right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery" @reset="resetQuery">
          <template>
            <el-form-item label="标签：" prop="name">
              <el-input v-model="conPO.name" placeholder="请输入标签" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="状态：" prop="state">
              <el-select v-model="conPO.state" placeholder="请选择状态" clearable>
                <el-option
                  v-for="dict in dict.type['1002']"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </template>
        </right-toolbar>
      </el-row>
    </el-form>

    <el-table
      border
      :key="tableKey"
      v-loading="loading"
      :data="lazy ? pageDataPO : showDataList"
      row-key="id"
      ref="tableTree"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      @row-click="handleRowClick"
      @row-dblclick="handleView"
      @selection-change="handleSelectionChange"
      :lazy="lazy"
      :load="listChildren"
      :header-cell-style="{ 'text-align': 'center' }"
      :height="lazy ? queryTableHeight + 50 : queryTableHeight - 2"
      highlight-current-row
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column type="index" :index="(index) => index + 1" label="序号" align="center" show-overflow-tooltip />
      <el-table-column label="标签" align="center" prop="name" width="160" />
      <el-table-column label="标签编码" align="center" prop="code" show-overflow-tooltip />
      <!--<el-table-column label="标签id" align="center" prop="id" width="160" />-->
      <el-table-column label="上级标签" align="center" show-overflow-tooltip>
        <template slot-scope="scope" v-if="scope.row.parent">
          {{ scope.row.parent.name }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <dict-tag :options="dict.type['1002']" :value="scope.row.state" />
        </template>
      </el-table-column>
      <el-table-column label="展示类型" align="center" prop="dataType" show-overflow-tooltip />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="创建人" align="center" prop="createByName" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createDate" width="160" />
      <el-table-column label="修改人" align="center" prop="updateByName" show-overflow-tooltip />
      <el-table-column label="修改时间" align="center" prop="updateDate" width="160" />
    </el-table>

    <pagination
      v-show="totalPage > 0 && !lazy"
      :total="totalPage"
      :page.sync="filter.pageNum"
      :limit.sync="filter.pageSize"
      :pager-count="pagerCount"
      :pageSizes="pageSizes"
      @pagination="onPagination"
    />

    <!-- 添加或修改配置管理对话框 -->
    <el-dialog
      v-dialogDrag
      class="scrollbar"
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <edit v-if="open" ref="form" :disabled="disabled" v-model="dataPO" />

      <div slot="footer" class="dialog-footer" v-show="!disabled">
        <el-button @click="cancel">关 闭</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { StringUtil } from 'ctcemti-ui/src/utils/base/StringUtil';
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import { addMdm_config, delMdm_config, pageMdm_config, updateMdm_config } from '@/api/mdm/mdm_config';
import Edit from '@/views/mdm/mdm_config/edit.vue';
import request from '@/utils/request';

export default {
  name: 'Mdm_config',

  components: {
    Edit,
  },

  dicts: ['1002'],

  data() {
    return {
      queryTableHeight: StringUtil.setTableHeight(),
      // 遮罩层
      loading: false,
      // 新增修改提交遮罩层
      submitLoading: false,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 表单禁用
      disabled: false,
      // 行政区域表格数据
      pageDataPO: [],
      // 存loadTree参数
      pageDataPOMaps: new Map(),
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      conPO: {
        name: null,
        state: null,
        parentId: '0',
      },
      // 表单参数
      dataPO: {},
      // 选中项
      selection: [],
      tableKey: 0,
      lazy: true,
      showDataList: [],
      filter: {
        total: 0,
        pageNum: 1,
        pageSize: 15,
      },
      pagerCount: 5,
      pageSizes: [5, 15, 30, 50, 100],
    };
  },

  created() {
    this.pageMdm_config();
  },

  computed: {
    totalPage() {
      return this.pageDataPO.length;
    },
  },

  methods: {
    onPagination(pageData) {
      this.$refs.tableTree.bodyWrapper.scrollTop = 0;
      this.showDataList = this.pageDataPO.slice((pageData.page - 1) * pageData.limit, pageData.page * pageData.limit);
    },

    /** 清空选择数据 */
    clearSelection() {
      const selection = [];
      this.ids = [];
      this.single = selection.length != 1;
      this.multiple = !selection.length;
      this.selection = selection;
      this.$refs.tableTree.clearSelection();
    },

    /** 多选框选中数据 **/
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
      this.selection = selection;
    },

    pageMdm_config() {
      if (this.conPO.name || this.conPO.state) {
        this.conPO.parentId = null;
      }

      this.loading = true;
      pageMdm_config(this.conPO).then((response) => {
        const data = response.data || [];

        data.forEach((item) => {
          item.parent = data.find((x) => x.id === item.parentId) || {};
          item.createDate = DateUtil.format(item.createDate, 'yyyy-MM-dd HH:mm:ss');
          item.updateDate = DateUtil.format(item.updateDate, 'yyyy-MM-dd HH:mm:ss');
          item.hasChildren = true;
        });

        if (this.conPO.name || this.conPO.state) {
          this.pageDataPO = data;
          this.lazy = false;
          this.showDataList = this.pageDataPO.slice(0, this.filter.pageSize);
          this.filter.pageNum = 1;
        } else {
          this.pageDataPO = this.handleTree(data, 'id', 'parentId');
          this.lazy = true;
        }

        this.tableKey = new Date().getTime();
        this.loading = false;
        this.selectRowId = undefined;
      });
    },

    /** 查询子数据（懒加载） */
    listChildren(tree, treeNode, resolve) {
      if (typeof tree == 'object') {
        this.pageDataPOMaps.set(`${tree.id}`, {
          tree,
          treeNode,
          resolve,
        });
      }
      if (tree && tree.id) {
        this.conPO.parentId = tree.id;
        pageMdm_config(this.conPO).then((response) => {
          const data = response.data || [];

          data.forEach((item) => {
            item.parent = tree;
            item.createDate = DateUtil.format(item.createDate, 'yyyy-MM-dd HH:mm:ss');
            item.updateDate = DateUtil.format(item.updateDate, 'yyyy-MM-dd HH:mm:ss');
            item.hasChildren = true;
          });

          resolve(data);
        });
      }
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },

    // 表单重置
    reset() {
      this.dataPO = {
        id: null,
        name: null,
        parentId: '0',
        code: null,
        state: '10021001',
        dataType: null,
        remark: null,
      };
      this.resetForm('form');
      this.disabled = false;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO.parentId = '0';
      this.pageMdm_config();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },

    handleRowClick(row) {
      this.selectRowId = row.id;
    },

    /** 双击列表行查看行数据详情操作 */
    handleView(row) {
      this.reset();
      const id = row.id;
      this.dataPO.id = id;
      this.open = true;
      this.disabled = true;
      this.title = '查看配置管理';
      this.$nextTick(() => {
        this.$refs['form'].clearValidate();
      });
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.dataPO.parentId = this.selectRowId;
      this.open = true;
      this.title = '添加配置管理';
    },

    /** 修改按钮操作 */
    handleUpdate() {
      this.reset();
      const id = this.ids[0];
      this.dataPO.id = id;
      this.open = true;
      this.title = '修改配置管理';
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dataPO.id != null) {
            updateMdm_config({
              ...this.dataPO,
              parentId: this.dataPO.parentId || '0',
            }).then(() => {
              this.$modal.msgSuccess('操作成功');
              this.open = false;
              this.conPO.parentId = '0';
              // 清空选择
              this.clearSelection();

              this.tableKey = new Date().getTime();
              this.pageMdm_config();
            });
          } else {
            addMdm_config({
              ...this.dataPO,
              parentId: this.dataPO.parentId || '0',
            }).then((response) => {
              this.$modal.msgSuccess('操作成功');
              this.open = false;
              const parentId = this.dataPO.parentId;
              this.conPO.parentId = parentId || '0';
              if (!parentId || parentId === '0') {
                this.pageMdm_config();
              } else {
                this.tableKey = new Date().getTime();
                const { tree, treeNode, resolve } = this.pageDataPOMaps.get(`${parentId}`) || {};
                this.listChildren(tree, treeNode, resolve);
              }
            });
          }
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete() {
      let id = '';
      const row = this.selection;
      if (Array.isArray(row)) {
        id = row.map((item) => item.id).toString();
      } else if (typeof row == 'object') {
        id = row.id;
      }
      this.$confirm('是否确认删除所选择的数据？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(function () {
          return delMdm_config(id);
        })
        .then(() => {
          this.tableKey = id;
          this.handleQuery();
          this.$modal.msgSuccess('操作成功');
        });
    },

    handleImport(event) {
      if (!event) return;

      const file = event.file;
      const fileAllName = file.name.split('.');
      const currentType = fileAllName[fileAllName.length - 1];

      if (currentType.toLocaleLowerCase() !== 'xls' && currentType.toLocaleLowerCase() !== 'xlsx') {
        this.$modal.msgError(`文件格式不正确, 请上传 .xls，.xlsx 格式文件!`);
        return;
      }

      let formData = new FormData();
      formData.append('file', file);

      this.loading = true;

      request({
        url: '/mdm/mdm_config/importData',
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(() => {
          this.pageMdm_config();
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.app-container {
  ::v-deep .el-table {
    .el-table__row {
      td {
        &:nth-child(3) {
          text-align: left !important;
        }
      }
    }
  }
}
</style>
