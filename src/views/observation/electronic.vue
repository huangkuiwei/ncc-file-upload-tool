<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_monitor_water:export"
            plain
            type="primary"
            @click="handleExport"
            v-hasPermi="['mdm:mdm_monitor_water:export']"
          >
            导出
          </action-button>
        </el-col>

        <right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery" @reset="resetQuery">
          <template>
            <el-form-item label="监测项类型：" prop="monitorName">
              <el-input
                v-model="conPO.monitorName"
                placeholder="请输入监测项类型"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>

            <el-form-item label="监测点名称：" prop="name">
              <el-input
                v-model="conPO.name"
                placeholder="请输入监测点名称"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>

            <el-form-item label="预警状态：" prop="alarmLevel">
              <el-select v-model="conPO.alarmLevel" placeholder="请选择预警状态" clearable>
                <el-option label="一级预警" value="1" />
                <el-option label="二级预警" value="2" />
                <el-option label="三级预警" value="3" />
              </el-select>
            </el-form-item>

            <el-form-item label="整治日期：" prop="date">
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
      v-loading="loading"
      :filter="conPO"
      :data="pageDataPO"
      @selection-change="handleSelectionChange"
      @pagination="pageMdm_electron_monitor"
    >
      <el-table-column label="监测项类型" align="center" prop="monitorName" show-overflow-tooltip />
      <el-table-column label="监测点名称" align="center" prop="name" show-overflow-tooltip />
      <el-table-column label="监测点读数/X(°)" align="center" prop="lastDeviceData" show-overflow-tooltip />
      <el-table-column label="即时形变/Y(°)" align="center" prop="lastSinkingData" show-overflow-tooltip />
      <el-table-column label="累计形变/Z(°)" align="center" prop="lastSinkingAccumulation" show-overflow-tooltip />
      <el-table-column label="单位" align="center" prop="unit" show-overflow-tooltip />
      <el-table-column label="采集时间" align="center" prop="lastCollectingTime" show-overflow-tooltip />
      <el-table-column label="预警状态" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span v-if="row.alarmLevel === '1'">一级预警</span>
          <span v-if="row.alarmLevel === '2'">二级预警</span>
          <span v-if="row.alarmLevel === '3'">三级预警</span>
        </template>
      </el-table-column>
    </mti-table>
  </div>
</template>

<script>
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import { pageMdm_electron_monitor } from '@/api/observation/electronic';

export default {
  name: 'observationElectronic',

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
        monitorName: null,
        name: null,
        alarmLevel: null,
        beginDate: null,
        endDate: null,
      },
      date: null,
      // 表单参数
      dataPO: {},
      massifList: [],
      banList: [],
      monitorStatusList: [],
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
    this.pageMdm_electron_monitor();
  },

  methods: {
    pageMdm_electron_monitor() {
      this.loading = true;
      this.conPO = this.$table.pager(this.conPO);
      pageMdm_electron_monitor(this.conPO).then((response) => {
        const data = response.rows || [];

        data.forEach((item) => {
          item.lastCollectingTime = DateUtil.format(item.lastCollectingTime, 'yyyy-MM-dd HH:mm:ss');
        });

        this.pageDataPO = response;
        this.loading = false;
      });
    },

    /** 表单重置 */
    reset() {
      this.dataPO = {
        monitorName: null,
        name: null,
        alarmLevel: null,
        beginDate: null,
        endDate: null,
      };
      this.disabled = false;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO = this.$table.pager(this.conPO, true);
      this.pageMdm_electron_monitor();
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

    handleExport() {
      this.exportExcel('mdm/mdm_electron_monitor/export', {
        monitorName: this.conPO.monitorName,
        name: this.conPO.name,
        alarmLevel: this.conPO.alarmLevel,
        beginDate: this.conPO.beginDate,
        endDate: this.conPO.endDate,
      }, `${new Date().getTime()}.xlsx`);
    },
  },
};
</script>
