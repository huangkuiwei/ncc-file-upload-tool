<template>
  <div>
    <el-form
      ref="form"
      :model="dataPO"
      :rules="rules"
      label-width="120px"
      :disabled="disabled"
      :class="{ 'is-disabled': disabled }"
    >
      <el-form-item label="选择视图文件：" prop="viewId">
        <el-select v-model="dataPO.viewId" placeholder="请选择选择视图文件" class="fill-width">
          <el-option v-for="item of viewList" :value="item.id" :key="item.id" :label="item.name" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { pageDetailedMdm_config_view } from '@/api/mdm/mdm_config_view';

export default {
  name: 'Mdm_config_viewEdit',

  model: {
    prop: 'bundle',
    event: 'on-bind',
  },

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },

    bundle: {
      type: Object,
      default: () => ({}),
    },

    selectRow: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      rules: {
        viewId: [{ required: true, message: '视图文件不能为空', trigger: 'blur' }],
      },
      viewList: [],
    };
  },

  computed: {
    dataPO: {
      get: function () {
        return this.bundle;
      },
      set: function () {},
    },
  },

  created() {
    this.getViewList();
  },

  methods: {
    getViewList() {
      pageDetailedMdm_config_view({
        total: 0,
        pageNum: 1,
        pageSize: 1000,
      }).then((response) => {
        this.viewList = response.rows;

        if (this.selectRow.viewname) {
          let item = this.viewList.find((item) => item.name === this.selectRow.viewname);

          if (item) {
            this.dataPO.viewId = item.id;
          }
        }
      });
    },

    /** 表单校验 */
    validate(f) {
      this.$refs['form'].validate((valid, data) => {
        if (typeof f === 'function') {
          return f(valid, data);
        } else {
          return new Promise((resolve, reject) => {
            if (valid) {
              resolve(data);
            } else {
              reject();
            }
          });
        }
      });
    },

    /** 清除表单验证 */
    clearValidate() {
      this.$refs['form'].clearValidate();
    },
  },
};
</script>
