<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-upload
            hashKey="mdm:mdm_monitor_subside:import"
            v-hasPermi="['mdm:mdm_monitor_subside:import']"
            action="/"
            accept=".xls,.xlsx"
            :show-file-list="false"
            :http-request="handleImport"
          >
            <action-button plain type="primary" @click="handleImport">导入</action-button>
          </el-upload>
        </el-col>

        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_monitor_subside:remove"
            plain
            type="primary"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['mdm:mdm_monitor_subside:remove']"
          >
            删除
          </action-button>
        </el-col>
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_monitor_subside:export"
            plain
            type="primary"
            @click="handleExport"
            v-hasPermi="['mdm:mdm_monitor_subside:export']"
          >
            导出
          </action-button>
        </el-col>

        <right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery" @reset="resetQuery">
          <template>
            <el-form-item label="报警状态：" prop="earlyStatus">
              <el-select v-model="conPO.earlyStatus" placeholder="请选择报警状态" clearable>
                <el-option
                  v-for="dict in earlyStatusList"
                  :key="dict.earlyStatus"
                  :label="dict.earlyStatus"
                  :value="dict.earlyStatus"
                />
              </el-select>
            </el-form-item>

            <!--<el-form-item label="监测状态：" prop="monitorStatus">-->
            <!--  <el-select v-model="conPO.monitorStatus" placeholder="请选择监测状态" clearable>-->
            <!--    <el-option-->
            <!--      v-for="dict in monitorStatusList"-->
            <!--      :key="dict.monitorStatus"-->
            <!--      :label="dict.monitorStatus"-->
            <!--      :value="dict.monitorStatus"-->
            <!--    />-->
            <!--  </el-select>-->
            <!--</el-form-item>-->

            <el-form-item label="地块：" prop="massifName">
              <el-select v-model="conPO.massifName" placeholder="请选择地块" clearable>
                <el-option
                  v-for="dict in massifList"
                  :key="dict.massifName"
                  :label="dict.massifName"
                  :value="dict.massifName"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="楼栋：" prop="banName">
              <el-select v-model="conPO.banName" placeholder="请选择楼栋" clearable>
                <el-option v-for="dict in banList" :key="dict.banName" :label="dict.banName" :value="dict.banName" />
              </el-select>
            </el-form-item>

            <el-form-item label="观测日期：" prop="date">
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
      id="observation_data_table"
      show-order
      show-check
      v-loading="loading"
      :filter="conPO"
      :data="pageDataPO"
      @selection-change="handleSelectionChange"
      @pagination="pageMdm_monitor_subside"
    >
      <el-table-column label="观测日期" align="center" prop="date" width="110" />
      <el-table-column label="地块" align="center" prop="massifName" width="80" />
      <el-table-column label="楼栋" align="center" prop="banName" width="80">
        <template slot-scope="{ row }">
          <span>{{ row.banName === 'null' ? '' : row.banName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="渗漏治理情况" align="center" prop="situation" :width="columnWidth(4)" />
      <el-table-column label="控制点（mm）" align="center" prop="dit" :width="columnWidth(5)">
        <template slot-scope="{ row }">
          <span style="white-space: pre-wrap">{{ row.dit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本月变化（mm）" align="center" prop="monthChange" :width="columnWidth(6)" />
      <el-table-column label="100天内累计变形（mm）" align="center" prop="fate" :width="columnWidth(7)" />
      <el-table-column label="近100天最大变形速率mm/100d" align="center" prop="subside" :width="columnWidth(8)" />
      <el-table-column label="累计沉降" align="center" prop="totalSubside" :width="columnWidth(9)" />
      <el-table-column label="累计变形速率mm/100d" align="center" prop="cumulative" :width="columnWidth(10)" />
      <el-table-column label="报警状态" align="center" prop="earlyStatus" width="110" />
    </mti-table>
  </div>
</template>

<script>
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import { pageMdm_monitor_subside, delMdm_monitor_subside } from '@/api/observation';
import request from '@/utils/request';

export default {
  name: 'observationIndex',

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
        massifName: null,
        banName: null,
        monitorStatus: null,
        earlyStatus: null,
        beginDate: null,
        endDate: null,
      },
      selection: [],
      date: null,
      // 表单参数
      dataPO: {},
      massifList: [],
      banList: [],
      monitorStatusList: [],
      earlyStatusList: [],
    };
  },

  computed: {
    columnWidth() {
      return (index) => {
        let col = document.querySelector(`#observation_data_table table colgroup col:nth-child(${index + 2})`);

        if (col) {
          return col.width;
        }

        return undefined;
      };
    },
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
    this.pageMdm_monitor_subside();

    this.getClassList('massifName').then((res) => {
      this.massifList = res;
    });
    this.getClassList('banName').then((res) => {
      this.banList = res;
    });
    this.getClassList('monitorStatus').then((res) => {
      this.monitorStatusList = res;
    });
    this.getClassList('earlyStatus').then((res) => {
      this.earlyStatusList = res;
    });
  },

  methods: {
    getClassList(columns) {
      return request({
        url: '/mdm/mdm_monitor_subside/pullData',
        method: 'get',
        params: {
          columns,
        },
      });
    },

    pageMdm_monitor_subside() {
      this.loading = true;
      this.conPO = this.$table.pager(this.conPO);
      pageMdm_monitor_subside(this.conPO).then((response) => {
        this.pageDataPO = response;
        this.loading = false;
      });
    },

    /** 表单重置 */
    reset() {
      this.dataPO = {
        massifName: null,
        banName: null,
        monitorStatus: null,
        earlyStatus: null,
        beginDate: null,
        endDate: null,
      };
      this.disabled = false;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO = this.$table.pager(this.conPO, true);
      this.pageMdm_monitor_subside();
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
      this.selection = selection;
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
          return delMdm_monitor_subside(id);
        })
        .then(() => {
          this.tableKey = id;
          this.handleQuery();
          this.$modal.msgSuccess('操作成功');
        });
    },

    handleImport(event) {
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
        url: '/mdm/mdm_monitor_subside/importData',
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(() => {
          this.pageMdm_monitor_subside();
        })
        .finally(() => {
          this.loading = false;
        });
    },

    handleExport() {
      this.exportExcel('mdm/mdm_monitor_subside/export', {
        massifName: this.conPO.massifName,
        banName: this.conPO.banName,
        monitorStatus: this.conPO.monitorStatus,
        earlyStatus: this.conPO.earlyStatus,
        beginDate: this.conPO.beginDate,
        endDate: this.conPO.endDate,
      }, `${new Date().getTime()}.xlsx`);
    },
  },
};
</script>
