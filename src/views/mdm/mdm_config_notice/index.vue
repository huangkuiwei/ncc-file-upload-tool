<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_config_notice:save"
            type="primary"
            @click="handleAdd"
            v-hasPermi="['mdm:mdm_config_notice:save']"
          >
            新增
          </action-button>
        </el-col>
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_config_notice:update"
            plain
            type="primary"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['mdm:mdm_config_notice:update']"
          >
            修改
          </action-button>
        </el-col>
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_config_notice:remove"
            plain
            type="primary"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['mdm:mdm_config_notice:remove']"
          >
            删除
          </action-button>
        </el-col>

        <right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery" @reset="resetQuery">
          <template>
            <el-form-item label="公告菜单：" prop="noticemenu">
              <el-select v-model="conPO.noticemenu" placeholder="请选择公告菜单" clearable>
                <el-option
                  v-for="dict in dict.type['6001']"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
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

    <mti-table
      show-order
      show-check
      v-loading="loading"
      :filter="conPO"
      :data="pageDataPO"
      @selection-change="handleSelectionChange"
      @pagination="pageMdm_config_notice"
      @row-dblclick="handleView"
    >
      <el-table-column label="公告菜单" align="center" prop="noticemenu" show-overflow-tooltip>
        <template slot-scope="scope">
          <dict-tag :options="dict.type['6001']" :value="scope.row.noticemenu" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="state" show-overflow-tooltip>
        <template slot-scope="scope">
          <dict-tag :options="dict.type['1002']" :value="scope.row.state" />
        </template>
      </el-table-column>
      <el-table-column label="公告内容" align="center" show-overflow-tooltip>
        <template slot-scope="scope" v-if="scope.row.content">
          <span>{{ scope.row.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createByName" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createDate" width="160" />
      <el-table-column label="修改人" align="center" prop="updateByName" show-overflow-tooltip />
      <el-table-column label="修改时间" align="center" prop="updateDate" width="160" />
    </mti-table>

    <!-- 添加或修改公告管理对话框 -->
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
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import {
  pageMdm_config_notice,
  delMdm_config_notice,
  addMdm_config_notice,
  updateMdm_config_notice,
} from '@/api/mdm/mdm_config_notice';
import Edit from './edit.vue';

export default {
  name: 'Mdm_config_notice',

  components: {
    Edit,
  },

  dicts: ['6001', '1002'],

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
        noticemenu: null,
        state: null,
      },
      // 表单参数
      dataPO: {},
    };
  },

  created() {
    this.pageMdm_config_notice();
  },

  methods: {
    /** 查询公告管理列表 */
    pageMdm_config_notice() {
      this.loading = true;
      this.conPO = this.$table.pager(this.conPO);
      pageMdm_config_notice(this.conPO).then((response) => {
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
        noticemenu: null,
        state: '10021001',
        content: null,
      };
      this.disabled = false;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO = this.$table.pager(this.conPO, true);
      this.pageMdm_config_notice();
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

    /** 双击列表行查看行数据详情操作 */
    handleView(row) {
      this.reset();
      const id = row.id;
      this.dataPO.id = id;
      this.open = true;
      this.disabled = true;
      this.title = '查看公告管理';
      this.$nextTick(() => {
        this.$refs['form'].clearValidate();
      });
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = '添加公告管理';
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      this.dataPO.id = id;
      this.open = true;
      this.title = '修改公告管理';
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.dataPO.id != null) {
            updateMdm_config_notice(this.dataPO)
              .then((response) => {
                this.$modal.msgSuccess('操作成功');
                this.open = false;
                this.submitLoading = false;
                this.pageMdm_config_notice();
              })
              .catch(() => {
                this.submitLoading = false;
              });
          } else {
            addMdm_config_notice(this.dataPO)
              .then((response) => {
                this.$modal.msgSuccess('新增成功');
                this.open = false;
                this.submitLoading = false;
                this.pageMdm_config_notice();
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

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join();
      this.$modal
        .confirm('是否确认删除所选择的数据？')
        .then(function () {
          return delMdm_config_notice(ids);
        })
        .then(() => {
          this.pageMdm_config_notice();
          this.$modal.msgSuccess('删除成功');
        })
        .catch(() => {});
    },
  },
};
</script>
