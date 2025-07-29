<template>
  <div>
    <el-form
      ref="form"
      :model="dataPO"
      :rules="rules"
      label-width="100px"
      :disabled="disabled"
      :class="{ 'is-disabled': disabled }"
    >
      <el-form-item label="公告菜单：" prop="noticemenu">
        <el-select v-model="dataPO.noticemenu" placeholder="请选择公告菜单" class="fill-width">
          <el-option v-for="dict in dict.type['6001']" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态：">
        <el-radio-group v-model="dataPO.state">
          <el-radio v-for="dict in dict.type['1002']" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="公告内容：">
        <el-input v-model="dataPO.content" type="textarea" :rows="5" placeholder="请输入公告内容" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getMdm_config_notice } from '@/api/mdm/mdm_config_notice';

export default {
  name: 'Mdm_config_noticeEdit',

  model: {
    prop: 'bundle',
    event: 'on-bind',
  },

  dicts: ['6001', '1002'],

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
        noticemenu: [{ required: true, message: '公告菜单不能为空', trigger: 'blur' }],
      },
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
      this.getMdm_config_notice(this.dataPO.id);
    }
  },

  methods: {
    /** 双向绑定数据 */
    bindModel(data) {
      this.$emit('on-bind', data);
    },

    /** 表单重置 */
    reset() {
      this.dataPO = {
        id: null,
        noticemenu: null,
        state: '10021001',

        content: null,
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
    getMdm_config_notice(id) {
      this.reset();
      getMdm_config_notice(id).then((response) => {
        const data = response.data;

        if (data.content) {
          data.content = data.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')
        }

        this.bindModel(data);
      });
    },
  },
};
</script>
