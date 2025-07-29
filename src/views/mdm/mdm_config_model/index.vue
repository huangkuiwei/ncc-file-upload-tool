<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
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
      @selection-change="handleSelectionChange"
      :lazy="lazy"
      :load="listChildren"
      :header-cell-style="{ 'text-align': 'center' }"
      :height="lazy ? queryTableHeight + 50 : queryTableHeight - 2"
      highlight-current-row
    >
      <el-table-column type="index" :index="(index) => index + 1" label="序号" align="center" show-overflow-tooltip />
      <el-table-column label="模型标签" align="center" prop="name" width="160" />
      <el-table-column label="标签编号" align="center" prop="code" show-overflow-tooltip />
      <el-table-column label="关联模型" align="center" show-overflow-tooltip>
        <template slot-scope="scope" v-if="scope.row.dataType === '模型'">
          <el-button type="text" v-if="!scope.row.filename" @click="handleAdd">关联模型</el-button>
          <span v-else>{{ scope.row.filename }}</span>
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

      <el-table-column label="操作" align="center" width="160">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.dataType === '模型' && scope.row.filename" @click="handleAdd"
            >修改关联模型</el-button
          >
          <el-button
            type="text"
            v-if="scope.row.dataType === '模型' && scope.row.filename"
            @click="viewModel(scope.row)"
            >预览</el-button
          >
        </template>
      </el-table-column>
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

    <!-- 添加或修改模型管理对话框 -->
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

    <div class="model-view" v-if="modelUrl">
      <iframe ref="modelIframe" :src="modelUrl" @load="onLoad" />
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import { StringUtil } from 'ctcemti-ui/src/utils/base/StringUtil';
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import { delMdm_config_model, pageMdm_config_model } from '@/api/mdm/mdm_config_model';
import Edit from './edit.vue';
import { modelIframePostMes } from '@/utils/tools';

export default {
  name: 'Mdm_config_model',

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
      modelUrl: '',
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
    this.pageMdm_config_model();
    document.addEventListener('uploadLocalRefresh', this.refreshPageData);
    window.addEventListener('message', this.messageCallback);
  },

  beforeDestroy() {
    document.removeEventListener('uploadLocalRefresh', this.refreshPageData);
    window.removeEventListener('message', this.messageCallback);
    this.modelUrl = null;
  },

  deactivated() {
    this.modelUrl = null;
  },

  computed: {
    totalPage() {
      return this.pageDataPO.length;
    },
  },

  methods: {
    ...mapMutations('mdm', ['EDIT_UPLOAD_FILE', 'SET_SHOW_UPLOADED_BOX']),

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

    refreshPageData(event) {
      let { uploadItem } = event.detail;

      if (uploadItem.uploadType === 'linkLocal') {
        const parentId = this.dataPO.parentId;
        this.conPO.parentId = parentId;
        // 清空选择
        this.clearSelection();
        if (parentId == '0') {
          this.pageMdm_config_model();
        } else {
          const { tree, treeNode, resolve } = this.pageDataPOMaps.get(`${parentId}`) || {};
          this.listChildren(tree, treeNode, resolve);
        }
      }
    },

    messageCallback(messageRes) {
      if (messageRes.data.command == 'ImodelClose') {
        this.modelUrl = null;
      }
    },

    /** 多选框选中数据 **/
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.selection = selection;
    },

    pageMdm_config_model() {
      if (this.conPO.name || this.conPO.state) {
        this.conPO.parentId = null;
      }
      this.loading = true;
      pageMdm_config_model(this.conPO).then((response) => {
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
        pageMdm_config_model(this.conPO).then((response) => {
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
        parentId: '0',
      };
      this.disabled = false;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO.parentId = '0';
      this.pageMdm_config_model();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },

    handleRowClick(row) {
      if (row.parentId === '0') {
        this.dataPO = { ...row, massif: row.id, filename: null };
      } else {
        this.dataPO = { ...row, massif: row.parent && row.parent.id, ban: row.id, filename: null };
      }
    },

    /** 新增按钮操作 */
    handleAdd() {
      setTimeout(() => {
        this.open = true;
        this.title = '关联模型';
      });
    },

    viewModel(row) {
      this.modelUrl = process.env.VUE_APP_MODEL_BASE_URL + '/?' + encodeURIComponent(row.filepath.replace(/\\/g, '/'));
      this.bimPath = row.filepath;
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.dataPO.id) {
            await delMdm_config_model(this.dataPO.id).catch(() => {});

            this.EDIT_UPLOAD_FILE({
              action: 'add',
              data: {
                uploadType: 'linkLocal',
                id: this.dataPO.id,
                taskId: Date.now().toString() + this.dataPO.file.uid,
                file: this.dataPO.file,
                filename: this.dataPO.file.name,
                size: this.dataPO.file.size,
                progress: 0, // 0 - 100
                status: 'ready', // ready error success uploading pause
                fileMd5: '',
                checkUploadUrl: '',
                fileUploadUrl: '',
                parts: [],
              },
            });

            this.open = false;
            this.submitLoading = false;

            setTimeout(() => {
              this.SET_SHOW_UPLOADED_BOX(true);
            });
          } else {
          }
        } else {
          this.focusError();
        }
      });
    },

    onLoad() {
      modelIframePostMes(this.$refs.modelIframe.contentWindow, 'szbReadonly', null);

      let urls = decodeURIComponent(this.modelUrl).split('/');

      modelIframePostMes(this.$refs.modelIframe.contentWindow, 'CurrentFile', {
        fileOriginalUrl: process.env.VUE_APP_BASE_API,
        fileName: urls[urls.length - 1],
        bimPath: this.bimPath,
        filePath: this.bimPath,
        fileSuffix: '.bim',
        fileType: '2',
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
        &:nth-child(2) {
          text-align: left !important;
        }
      }
    }
  }

  .model-view {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 99999;
    background: #ffffff;

    > iframe {
      width: 100%;
      height: 100%;
      outline: 0;
      border: 0;
    }
  }
}
</style>
