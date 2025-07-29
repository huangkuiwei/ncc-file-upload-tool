<template>
  <el-dialog
    v-dialogDrag
    class="repair-edit-dialog"
    title="新建整治台账"
    :visible="value"
    @update:visible="$emit('input', $event)"
    width="550px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="modelState" :rules="rules" label-width="100px">
      <el-form-item label="整治类型：" prop="repairType">
        <el-select v-model="modelState.repairType" placeholder="请选择整治类型" multiple class="fill-width">
          <el-option v-for="dict in repairTypeList" :key="dict.id" :label="dict.name" :value="dict.name" />
        </el-select>
      </el-form-item>

      <el-form-item label="关联地块：" prop="massifName">
        <el-select v-model="modelState.massifName" placeholder="请关联地块" class="fill-width">
          <el-option v-for="item in massifNameList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="关联楼栋：" prop="banName">
        <el-select v-model="modelState.banName" placeholder="请关联楼栋" class="fill-width">
          <el-option v-for="item in banNameList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="关联住户：" prop="doorName">
        <el-select v-model="modelState.doorName" placeholder="请关联住户" class="fill-width">
          <el-option v-for="item in doorNameList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="整治日期：" prop="repairDate">
        <el-date-picker v-model="modelState.repairDate" type="date" placeholder="选择日期" class="fill-width" />
      </el-form-item>

      <el-form-item label="负责人：" prop="mainName">
        <el-input v-model="modelState.mainName" placeholder="请输入负责人" />
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button @click="$emit('input', false)">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request';
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';

export default {
  name: 'repairEditDialog',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      modelState: {
        repairType: [],
        massifName: null,
        banName: null,
        doorName: null,
        repairDate: null,
        mainName: null,
      },
      repairTypeList: [],
      massifNameList: [],
      banNameList: [],
      doorNameList: [],
      // 表单校验
      rules: {
        repairType: [{ required: true, message: '整治类型不能为空', trigger: 'blur' }],
        massifName: [{ required: true, message: '地块不能为空', trigger: 'blur' }],
        banName: [{ required: true, message: '楼栋不能为空', trigger: 'blur' }],
        repairDate: [{ required: true, message: '整治日期不能为空', trigger: 'blur' }],
        mainName: [{ required: true, message: '负责人不能为空', trigger: 'blur' }],
      },
      submitLoading: false,
    };
  },

  watch: {
    'modelState.massifName': {
      handler(value) {
        this.modelState.banName = null;
        this.modelState.doorName = null;

        if (value) {
          request({
            url: '/mdm/mdm_file_run/Levelist',
            method: 'get',
            params: {
              id: value,
            },
          }).then((res) => {
            this.banNameList = res.data;
          });
        }
      },

      immediate: true,
    },

    'modelState.banName': {
      handler(value) {
        this.modelState.doorName = null;

        if (value) {
          request({
            url: '/mdm/mdm_file_run/Levelist',
            method: 'get',
            params: {
              id: value,
            },
          }).then((res) => {
            this.doorNameList = res.data;
          });
        }
      },

      immediate: true,
    },
  },

  created() {
    this.getMassifNameList();
    this.getRepairTypeList();
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

    getMassifNameList() {
      request({
        url: '/mdm/mdm_file_run/Levelist',
        method: 'get',
        params: {
          id: '0',
        },
      }).then((res) => {
        this.massifNameList = res.data;
      });
    },

    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.submitLoading = true;

          request({
            url: '/mdm/mdm_repair_bill',
            method: 'post',
            data: {
              ...this.modelState,
              massifName: this.massifNameList.find((item) => item.id === this.modelState.massifName).name,
              banName: this.banNameList.find((item) => item.id === this.modelState.banName).name,
              doorName: this.doorNameList.find((item) => item.id === this.modelState.doorName)?.name,
              repairDate: DateUtil.format(this.modelState.repairDate, 'yyyy-MM-dd'),
              repairType: this.modelState.repairType.join(','),
            },
          }).then(() => {
            this.$modal.msgSuccess('操作成功');
            this.submitLoading = false;

            this.$emit('submit');
            this.$emit('input', false);
          });
        } else {
          this.focusError();
        }
      });
    },
  },
};
</script>
