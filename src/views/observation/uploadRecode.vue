<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_monitor_upload_record:download"
            plain
            type="primary"
            :disabled="single"
            @click="download"
            v-hasPermi="['mdm:mdm_monitor_upload_record:download']"
          >
            下载
          </action-button>
        </el-col>

        <right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery" @reset="resetQuery">
          <template>
            <el-form-item label="观测类型：" prop="earlyStatus">
              <el-select v-model="conPO.typeName" placeholder="请选择观测类型" clearable>
                <el-option label="沉降观测" value="沉降观测" />
                <el-option label="水位观测" value="水位观测" />
              </el-select>
            </el-form-item>

            <el-form-item label="上传日期：" prop="date">
              <el-date-picker
                v-model="date"
                type="daterange"
                align="right"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              >
              </el-date-picker>
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
      @pagination="pageMdm_upload_record"
    >
      <el-table-column label="文件名" align="center" prop="fileName" show-overflow-tooltip />
      <el-table-column label="观测类型" align="center" prop="typeName" show-overflow-tooltip />
      <el-table-column label="项目看板展示" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span v-if="row.showDr === '0'">是</span>
          <span v-if="row.showDr === '1'">否</span>
        </template>
      </el-table-column>
      <el-table-column label="上传日期" align="center" prop="createDate" show-overflow-tooltip />
      <el-table-column label="上传人" align="center" prop="createByName" show-overflow-tooltip />
    </mti-table>
  </div>
</template>

<script>
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import { pageMdm_upload_record } from '@/api/observation/uploadRecode';
import request from '@/utils/request';
import { FileUtil } from 'ctcemti-ui/src/utils/base/FileUtil';

export default {
  name: 'observationUploadRecode',

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
        beginDate: null,
        endDate: null,
        typeName: null,
      },
      date: null,
      // 表单参数
      dataPO: {},
    };
  },

  watch: {
    date(value) {
      if (value) {
        this.conPO.beginDate = DateUtil.format(value[0], 'yyyy-MM-dd');
        this.conPO.endDate = DateUtil.format(value[1], 'yyyy-MM-dd');
      } else {
        this.conPO.beginDate = null;
        this.conPO.endDate = null;
      }
    },
  },

  created() {
    this.pageMdm_upload_record();
  },

  methods: {
    pageMdm_upload_record() {
      this.loading = true;
      this.conPO = this.$table.pager(this.conPO);
      pageMdm_upload_record(this.conPO).then((response) => {
        this.pageDataPO = response;
        this.loading = false;
      });
    },

    /** 表单重置 */
    reset() {
      this.dataPO = {
        beginDate: null,
        endDate: null,
        typeName: null,
      };
      this.disabled = false;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO = this.$table.pager(this.conPO, true);
      this.pageMdm_upload_record();
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

    download() {
      request({
        url: `/mdm/mdm_monitor_upload_record/download?fileId=${this.ids[0]}`,
        method: 'get',
        responseType: 'blob',
      }).then((res) => {
        FileUtil.resolveBlob(res);
      });
    },
  },
};
</script>
