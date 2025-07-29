<template>
  <div>
    <el-form
      ref="form"
      :model="dataPO"
      :rules="rules"
      label-width="140px"
      :disabled="disabled"
      :class="{ 'is-disabled': disabled }"
    >
      <el-form-item label="选择文件：" prop="filename">
        <el-upload action="/" accept=".bim" :show-file-list="false" :http-request="onUploadChange">
          <div style="text-align: left" v-if="file && file.name">
            <el-button type="primary">重新选择</el-button>
            <div>文件名：{{ file.name }}</div>
          </div>
          <el-button type="primary" v-else>上传文件</el-button>
        </el-upload>
      </el-form-item>

      <template v-if="showLinkMassif">
        <el-form-item label="关联地块：" prop="massif">
          <el-select v-model="dataPO.massif" placeholder="请关联地块" class="fill-width">
            <el-option v-for="item in massifList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="关联楼栋：" prop="ban">
          <el-select v-model="dataPO.ban" placeholder="请关联楼栋" class="fill-width">
            <el-option v-for="item in banList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'Mdm_config_modelEdit',

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
  },

  data() {
    return {
      massifList: [],
      banList: [],
      // 表单校验
      rules: {
        filename: [{ required: true, message: '上传文件不能为空', trigger: 'blur' }],
        massif: this.bundle.parentId === '0' ? [] : [{ required: true, message: '关联地块不能为空', trigger: 'blur' }],
        ban: this.bundle.parentId === '0' ? [] : [{ required: true, message: '关联楼栋不能为空', trigger: 'blur' }],
      },
      file: null,
      timer: 1,
      showLinkMassif: this.bundle.parentId === '0' ? false : true,
    };
  },

  watch: {
    'dataPO.massif': {
      handler(value) {
        if (this.timer !== 1) {
          this.dataPO.ban = null;
        }

        this.timer += 1;

        if (value) {
          request({
            url: '/mdm/mdm_file_run/Levelist',
            method: 'get',
            params: {
              id: value,
            },
          }).then((res) => {
            this.banList = res.data;
          });
        }
      },

      immediate: true,
    },
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
    this.getMassifList();
  },

  methods: {
    getMassifList() {
      request({
        url: '/mdm/mdm_file_run/Levelist',
        method: 'get',
        params: {
          id: '0',
        },
      }).then((res) => {
        this.massifList = res.data;
      });
    },

    /** 双向绑定数据 */
    bindModel(data) {
      this.$emit('on-bind', data);
    },

    onUploadChange(event) {
      const file = event.file;
      const fileAllName = file.name.split('.');
      const currentType = fileAllName[fileAllName.length - 1];

      if (currentType.toLocaleLowerCase() !== 'bim') {
        this.$modal.msgError(`文件格式不正确, 请上传 .bim 格式文件!`);
        return;
      }

      this.file = file;
      this.dataPO.file = file;

      this.$set(this.dataPO, 'filename', file.name);
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
  },
};
</script>
