<template>
  <div>
    <el-form ref="form" :model="modelState" :rules="rules" label-width="140px">
      <el-form-item label="文件类型：" prop="fileType">
        <el-radio-group
          v-model="modelState.fileType"
          placeholder="请选择文件类型"
          class="fill-width"
          @change="onSelectFileChange"
        >
          <el-radio :label="1">文件</el-radio>
          <el-radio :label="2">文件夹</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="关联方式：">
        <el-radio-group v-model="modelState.typeStr" class="fill-width">
          <el-radio key="0" label="0">选择地块楼栋关联</el-radio>
          <el-radio key="1" label="1">自动匹配地块楼栋</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="选择文件/文件夹：" prop="fileList">
        <el-upload
          class="upload-file"
          action="/"
          multiple
          :show-file-list="false"
          :http-request="(arg) => onUploadChange(arg, true)"
          v-if="modelState.fileList.length"
        >
          <div style="text-align: left">
            <el-button type="primary">重新选择</el-button>
          </div>
        </el-upload>

        <el-upload
          class="upload-file"
          action="/"
          multiple
          :show-file-list="false"
          :http-request="onUploadChange"
          v-else
        >
          <el-button type="primary">{{ modelState.fileType === 1 ? '上传文件' : '上传文件夹' }}</el-button>
        </el-upload>

        <div v-if="modelState.fileList.length" style="color: #0d84ff">
          <template v-if="modelState.fileType === 1">
            <div v-for="item of modelState.fileList" :key="item.name">
              {{ item.webkitRelativePath || item.name }}
            </div>
          </template>

          <template v-else>
            {{ modelState.fileList[0].webkitRelativePath.split('/')[0] }}
          </template>
        </div>
      </el-form-item>

      <template v-if="modelState.typeStr === '0'">
        <el-form-item label="关联地块：" prop="massif">
          <el-select v-model="modelState.massif" placeholder="请关联地块" :disabled="massifDisabled" class="fill-width">
            <el-option v-for="item in massifList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="关联楼栋：" prop="ban">
          <el-select v-model="modelState.ban" placeholder="请关联楼栋" :disabled="banDisabled" class="fill-width">
            <el-option v-for="item in banList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </template>

      <el-form-item label="储存路径：" prop="id">
        <span style="cursor: pointer; color: #4457ff" v-for="(item, index) of localFolderPath" @click="open = true">
          <span style="text-decoration: underline">{{ item.filename }}</span>
          <span v-if="index !== localFolderPath.length - 1">></span>
        </span>
      </el-form-item>
    </el-form>

    <div class="dialog-footer" style="text-align: right; padding-bottom: 20px">
      <el-button @click="$emit('cancel')">关 闭</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitLoading">提 交</el-button>
    </div>

    <select-folder-path-dialog
      :file-type="fileType"
      v-if="open"
      v-model="open"
      @selectFolderPathSubmit="selectFolderPathSubmit"
    />
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import request from '@/utils/request';
import SelectFolderPathDialog from '@/components/dataCom/components/selectFolderPathDialog.vue';

export default {
  name: 'completionDataEdit',

  components: {
    SelectFolderPathDialog,
  },

  props: {
    folderId: {
      type: String,
    },

    folderPath: {
      type: Array,
      default: () => [],
    },

    fileType: {
      type: String,
    },
  },

  data() {
    const validatePass = (rule, value, callback) => {
      if (!value || !value.length) {
        callback(new Error('上传文件不能为空'));
      } else {
        callback();
      }
    };

    return {
      modelState: {
        fileType: 1,
        fileList: [],
        massif: null,
        ban: null,
        typeStr: '0',
      },
      // 表单校验
      rules: {
        fileList: [{ required: true, validator: validatePass, trigger: 'blur' }],
      },
      submitLoading: false,
      massifList: [],
      banList: [],
      folderDetail: {},
      localFolderPath: [],
      open: false,
      massifDisabled: false,
      banDisabled: false,
    };
  },

  watch: {
    'modelState.massif'(value) {
      this.modelState.ban = null;

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
  },

  created() {
    this.localFolderPath = JSON.parse(JSON.stringify(this.folderPath));

    this.getFolderDetail();
    this.getMassifList();
  },

  methods: {
    ...mapMutations('mdm', ['EDIT_UPLOAD_FILE', 'SET_SHOW_UPLOADED_BOX']),

    getFolderDetail() {
      request({
        url: '/mdm/mdm_file_run/get',
        method: 'get',
        params: {
          id: this.folderId,
        },
      }).then((res) => {
        this.folderDetail = res.data;

        if (this.folderDetail.massif) {
          this.modelState.massif = this.folderDetail.massif;
          this.massifDisabled = true;
        }

        setTimeout(() => {
          if (this.folderDetail.ban) {
            this.modelState.ban = this.folderDetail.ban;
            this.banDisabled = true;
          }
        });
      });
    },

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

    onUploadChange(event, reset) {
      const file = event.file;

      if (reset) {
        this.modelState.fileList = [];
      }

      this.modelState.fileList.push(file);
    },

    onSelectFileChange(data) {
      this.modelState.fileList = [];
      let inputFiles = document.querySelectorAll('.upload-file .el-upload__input');

      if (data === 1) {
        inputFiles.forEach((item) => {
          item.webkitdirectory = false;
        });
      } else {
        inputFiles.forEach((item) => {
          item.webkitdirectory = true;
        });
      }
    },

    /** 表单重置 */
    reset() {
      this.resetForm('form');
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

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          let id = this.localFolderPath[this.localFolderPath.length - 1].id;

          console.log('id', id);

          for (const file of this.modelState.fileList) {
            this.EDIT_UPLOAD_FILE({
              action: 'add',
              data: {
                uploadType: 'oss',
                id: id,
                taskId: Date.now().toString() + file.uid,
                file: file,
                filename: file.name,
                size: file.size,
                progress: 0, // 0 - 100
                status: 'ready', // ready error success uploading pause
                fileMd5: '',
                checkUploadUrl: null,
                fileUploadUrl: null,
                massif: this.modelState.massif,
                ban: this.modelState.ban,
                typeStr: this.modelState.typeStr,
                parts: [],
              },
            });
          }

          this.submitLoading = false;

          this.$emit('cancel');

          setTimeout(() => {
            this.SET_SHOW_UPLOADED_BOX(true);
          });
        } else {
          this.focusError();
        }
      });
    },

    selectFolderPathSubmit(folderPath) {
      this.localFolderPath = folderPath;
    },
  },
};
</script>
