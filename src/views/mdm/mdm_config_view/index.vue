<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
        <right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery" @reset="resetQuery">
          <template>
            <el-form-item label="视图名" prop="name">
              <el-input v-model="conPO.name" placeholder="请输入视图名" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="state">
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

    <mti-table
      show-order
      v-loading="loading"
      :filter="conPO"
      :data="pageDataPO"
      @selection-change="handleSelectionChange"
      @pagination="pageMdm_config_view"
      @row-click="handleRowClick"
    >
      <el-table-column label="视图标签" align="center" prop="name" show-overflow-tooltip />
      <el-table-column label="标签编号" align="center" prop="code" show-overflow-tooltip />
      <el-table-column label="关联视图文件" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" v-if="!scope.row.viewname" @click="handleAdd">关联视图文件</el-button>
          <span v-else>{{ scope.row.viewname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <dict-tag :options="dict.type['1002']" :value="scope.row.state" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="创建人" align="center" prop="createByName" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createDate" width="160" />
      <el-table-column label="修改人" align="center" prop="updateByName" show-overflow-tooltip />
      <el-table-column label="修改时间" align="center" prop="updateDate" width="160" />

      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.viewname" @click="handleAdd">修改关联视图文件</el-button>
        </template>
      </el-table-column>
    </mti-table>

    <!-- 添加或修改视图管理对话框 -->
    <el-dialog
      v-dialogDrag
      class="scrollbar"
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <edit v-if="open" ref="form" :disabled="disabled" v-model="dataPO" :selectRow="selectRow" />

      <div slot="footer" class="dialog-footer" v-show="!disabled">
        <el-button @click="cancel">关 闭</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">提 交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import { pageMdm_config_view, updateBisaveMdm_config_view } from '@/api/mdm/mdm_config_view';
import Edit from './edit.vue';

export default {
  name: 'Mdm_config_view',

  components: {
    Edit,
  },

  dicts: ['1002'],

  data() {
    return {
      // 列表加载遮罩层
      loading: false,
      // 新增修改提交遮罩层
      submitLoading: false,
      // 表单禁用
      disabled: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 分页列表参数
      pageDataPO: {},
      // 查询参数
      conPO: {
        name: null,
        state: null,
      },
      // 表单参数
      dataPO: {},
      selectRow: {},
    };
  },

  created() {
    this.pageMdm_config_view();
  },

  methods: {
    pageMdm_config_view() {
      this.loading = true;
      this.conPO = this.$table.pager(this.conPO);
      pageMdm_config_view(this.conPO).then((response) => {
        let data = response.data || response.rows;

        data.forEach((item) => {
          item.createDate = DateUtil.format(item.createDate, 'yyyy-MM-dd HH:mm:ss');
          item.updateDate = DateUtil.format(item.updateDate, 'yyyy-MM-dd HH:mm:ss');
        });

        this.pageDataPO = response;
        this.loading = false;
      });
    },

    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 表单重置 */
    reset() {
      this.dataPO = {
        id: null,
        name: null,
        state: null,
        viewId: null,
      };
      this.disabled = false;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO = this.$table.pager(this.conPO, true);
      this.pageMdm_config_view();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    handleRowClick(row) {
      this.selectRow = { ...row }
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = '添加视图文件';
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.dataPO.viewId) {
            updateBisaveMdm_config_view({
              viewId: this.dataPO.viewId,
              levelId: this.selectRow.id,
            })
              .then((response) => {
                this.$modal.msgSuccess('操作成功');
                this.open = false;
                this.submitLoading = false;
                this.pageMdm_config_view();
              })
              .catch(() => {
                this.submitLoading = false;
              });
          }
        } else {
          this.focusError();
        }
      });
    },
  },
};
</script>
