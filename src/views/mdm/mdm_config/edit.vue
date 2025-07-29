<template>
  <div>
    <el-form
      ref="form"
      :model="dataPO"
      :rules="rules"
      label-width="100px"
      :disabled="disabled"
      :class="{ 'is-disabled': disabled }"
      class="mdmConfigEditForm"
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

        <treeselect v-else :options="[]" placeholder="为空时新增第一级层级" />
      </el-form-item>

      <el-form-item label="标签状态：">
        <el-radio-group v-model="dataPO.state">
          <el-radio v-for="dict in dict.type['1002']" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="展示类型：" prop="dataType">
        <el-select v-model="dataPO.dataType" placeholder="请选择展示类型" class="fill-width">
          <el-option value="无">无</el-option>
          <el-option value="模型">模型</el-option>
          <el-option value="视图">视图</el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="备注：" prop="remark">
        <el-input :rows="4" v-model="dataPO.remark" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getMdm_config, pageMdm_config } from '@/api/mdm/mdm_config';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
  name: 'Mdm_configEdit',

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
        dataType: [{ required: true, message: '展示类型不能为空', trigger: 'blur' }],
      },
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
      this.getMdm_config(this.dataPO.id);
    }
  },

  mounted() {
    this.getAllData();
  },

  methods: {
    getAllData() {
      let loading = this.$loading({
        target: '.mdmConfigEditForm',
        lock: true,
        background: 'rgba(255, 255, 255, 0.6)',
      });

      pageMdm_config({
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

    /** 表单重置 */
    reset() {
      this.dataPO = {
        id: null,
        name: null,
        parentId: null,
        code: null,
        state: '10021001',
        dataType: null,
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
    getMdm_config(id) {
      this.reset();
      getMdm_config(id).then((response) => {
        const data = response.data;

        if (data.parentId === '0') {
          data.parentId = null;
        }

        this.bindModel(data);
      });
    },
  },
};
</script>

<style lang="scss">
.vue-treeselect__menu {
  max-height: 200px !important;
}
</style>
