<template>
  <div>
    <el-form
      ref="form"
      :model="dataPO"
      :rules="rules"
      label-width="100px"
      :disabled="disabled"
      :class="{ 'is-disabled': disabled }"
      class="mdmConfigParameterEditForm"
    >
      <el-form-item label="标签名称：" prop="name">
        <el-input v-model="dataPO.name" placeholder="请输入标签名称" />
      </el-form-item>

      <el-form-item label="上级标签：" prop="parentId">
        <treeselect
          v-if="pageDataPO.length"
          v-model="dataPO.parentId"
          :options="pageDataPO"
          :show-count="true"
          :clearable="true"
          :disabled="disabled"
          :placeholder="disabled ? '空' : '为空时新增第一级层级'"
        />

        <treeselect v-else :options="[]" placeholder="为空时新增第一级配置" />
      </el-form-item>

      <el-form-item label="标签状态：">
        <el-radio-group v-model="dataPO.state">
          <el-radio v-for="dict in dict.type['1002']" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="颜色：" prop="colour">
        <div style="margin-top: 3px; padding-left: 10px" v-if="disabled">
          <span :style="{ background: dataPO.colour, width: '16px', height: '16px', display: 'inline-block' }" />
        </div>

        <template v-else>
          <el-radio-group class="select-color-radio" v-model="color">
            <el-radio :label="0">无</el-radio>

            <el-radio :label="1">
              <colorPicker :value="dataPO.colour || ''" @input="onColorChange" />
            </el-radio>
          </el-radio-group>
        </template>
      </el-form-item>

      <el-form-item label="备注：" prop="remark">
        <el-input v-model="dataPO.remark" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getMdm_config_parameter, pageMdm_config_parameter } from '@/api/mdm/mdm_config_parameter';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'Mdm_config_parameterEdit',

  components: {
    Treeselect,
  },

  model: {
    prop: 'bundle',
    event: 'on-bind',
  },

  dicts: ['1002'],

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    bundle: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      // 表单校验
      rules: {
        name: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
        // parentId: [{ required: true, message: '上级id不能为空', trigger: 'blur' }],
        state: [{ required: true, message: '标签状态不能为空', trigger: 'blur' }],
      },
      color: 0,
      pageDataPO: [],
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
    this.reset();
    if (this.dataPO.id) {
      this.getMdm_config_parameter(this.dataPO.id);
    }
  },

  mounted() {
    this.getAllData();
  },

  methods: {
    getAllData() {
      let loading = this.$loading({
        target: '.mdmConfigParameterEditForm',
        lock: true,
        background: 'rgba(255, 255, 255, 0.6)',
      });

      pageMdm_config_parameter({
        state: '10021001',
      })
        .then((response) => {
          let data = response.data || [];

          data = data.map((item) => {
            if (item.id === this.dataPO.id) {
              return {
                label: item.name,
                ...item,
                isDisabled: true,
              };
            }

            return {
              label: item.name,
              ...item,
            };
          });

          this.pageDataPO = this.handleTree(data, 'id', 'parentId');
        })
        .finally(() => {
          loading.close();
        });
    },

    /** 双向绑定数据 */
    bindModel(data) {
      this.$emit('on-bind', data);
    },

    onColorChange($event) {
      this.dataPO.colour = $event;
    },

    /** 表单重置 */
    reset() {
      this.dataPO = {
        id: null,
        name: null,
        parentId: null,
        code: null,
        state: '10021001',
        colour: '#000000',
        remark: null,
      };
      this.resetForm('form');
    },

    /** 表单校验 */
    validate(f) {
      this.bindModel(this.bundle);
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

    /** 修改按钮操作 */
    getMdm_config_parameter(id) {
      this.reset();
      getMdm_config_parameter(id).then((response) => {
        const data = response.data;

        if (data.parentId === '0') {
          data.parentId = null;
        }

        this.bindModel(data);

        if (data.colour) {
          this.color = 1;
        } else {
          this.color = 0;
        }
      });
    },
  },
};
</script>

<style lang="scss">
.el-form-item__content {
  .select-color-radio {
    display: flex !important;
    align-items: center !important;
    margin-top: 6px;

    .el-radio {
      display: flex;
      align-items: center;
    }
  }
}
</style>
