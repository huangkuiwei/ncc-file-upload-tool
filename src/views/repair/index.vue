<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <action-button
            hashKey="mdm:mdm_repair_bill:save"
            plain
            type="primary"
            @click="repairEditDialog = true"
            v-hasPermi="['mdm:mdm_repair_bill:save']"
          >
            新建
          </action-button>
        </el-col>

        <el-col :span="1.5">
          <action-button
              hashKey="mdm:mdm_repair_bill:delete"
              plain
              type="primary"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['mdm:mdm_repair_bill:delete']"
          >
            删除
          </action-button>
        </el-col>

        <el-col :span="1.5">
          <el-upload
            hashKey="mdm:mdm_repair_bill:import"
            v-hasPermi="['mdm:mdm_repair_bill:import']"
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
            hashKey="mdm:mdm_repair_bill:export"
            plain
            type="primary"
            @click="handleExport"
            v-hasPermi="['mdm:mdm_repair_bill:export']"
          >
            导出
          </action-button>
        </el-col>

        <right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery" @reset="resetQuery">
          <template>
            <el-form-item label="负责人：" prop="mainName">
              <el-input
                v-model="conPO.mainName"
                placeholder="请输入负责人"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>

            <el-form-item label="整治类型：" prop="repairType">
              <el-select v-model="conPO.repairType" placeholder="请选择整治类型" clearable>
                <el-option v-for="dict in repairTypeList" :key="dict.id" :label="dict.name" :value="dict.name" />
              </el-select>
            </el-form-item>

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
      show-check
      v-loading="loading"
      :filter="conPO"
      :data="pageDataPO"
      @selection-change="handleSelectionChange"
      @pagination="pageMdm_repair_bill"
    >
      <el-table-column label="楼栋整治类型" align="center" prop="repairType" show-overflow-tooltip />
      <el-table-column label="地块" align="center" prop="massifName" show-overflow-tooltip />
      <el-table-column label="楼栋" align="center" prop="banName" show-overflow-tooltip />
      <el-table-column label="住户" align="center" prop="doorName" show-overflow-tooltip />
      <el-table-column label="负责人" align="center" prop="mainName" show-overflow-tooltip />
      <el-table-column label="整治日期" align="center" prop="repairDate" show-overflow-tooltip />
    </mti-table>

    <repair-edit-dialog v-if="repairEditDialog" v-model="repairEditDialog" @submit="pageMdm_repair_bill" />
  </div>
</template>

<script>
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import { delMdm_repair_bill, pageMdm_repair_bill } from '@/api/repair'
import request from '@/utils/request';
import repairEditDialog from './components/repairEditDialog.vue';

export default {
  name: 'repairIndex',

  components: {
    repairEditDialog,
  },

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
        mainName: null,
        repairType: null,
        massifName: null,
        banName: null,
        beginDate: null,
        endDate: null,
      },
      date: null,
      // 表单参数
      dataPO: {},
      massifList: [],
      banList: [],
      repairTypeList: [],
      repairEditDialog: false,
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
    this.pageMdm_repair_bill();

    this.getRepairTypeList();
    this.getClassList('massifName').then((res) => {
      this.massifList = res;
    });
    this.getClassList('banName').then((res) => {
      this.banList = res;
    });
  },

  methods: {
    getRepairTypeList() {
      return request({
        url: '/mdm/mdm_config_parameter/getNodeData?name=整治类型',
        method: 'post',
      }).then((res) => {
        this.repairTypeList = res.data;
      });
    },

    getClassList(columns) {
      return request({
        url: '/mdm/mdm_repair_bill/pullData',
        method: 'get',
        params: {
          columns,
        },
      });
    },

    pageMdm_repair_bill() {
      this.loading = true;
      this.conPO = this.$table.pager(this.conPO);
      pageMdm_repair_bill(this.conPO).then((response) => {
        this.pageDataPO = response;
        this.loading = false;
      });
    },

    /** 表单重置 */
    reset() {
      this.dataPO = {
        massifName: null,
        repairType: null,
        banName: null,
        beginDate: null,
        endDate: null,
      };
      this.disabled = false;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO = this.$table.pager(this.conPO, true);
      this.pageMdm_repair_bill();
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
            return delMdm_repair_bill(id);
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
        url: '/mdm/mdm_repair_bill/importData',
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(() => {
          this.pageMdm_repair_bill();
        })
        .finally(() => {
          this.loading = false;
        });
    },

    handleExport() {
      this.exportExcel(
        '/mdm/mdm_repair_bill/export',
        {
          mainName: this.conPO.mainName,
          repairType: this.conPO.repairType,
          massifName: this.conPO.massifName,
          banName: this.conPO.banName,
          beginDate: this.conPO.beginDate,
          endDate: this.conPO.endDate,
        },
        `${new Date().getTime()}.xlsx`,
      );
    },
  },
};
</script>
