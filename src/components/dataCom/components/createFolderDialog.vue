<template>
  <el-dialog
    v-dialogDrag
    class="download-dialog"
    :title="title"
    :visible="value"
    @update:visible="$emit('input', $event)"
    width="550px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="modelState" :rules="rules" :label-width="labelWidth">
      <template v-if="folderMode === 1 || folderMode === 2">
        <el-form-item label="文件夹名称：" prop="filename">
          <el-input v-model="modelState.filename" placeholder="请输入文件夹名称" />
        </el-form-item>

        <el-form-item label="关联地块：" prop="massif">
          <el-select
            v-model="modelState.massif"
            placeholder="请关联地块"
            :disabled="modelState.isAddMassifBan || massifDisabled"
            class="fill-width"
          >
            <el-option v-for="item in massifList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="关联楼栋：" prop="ban">
          <el-select
            v-model="modelState.ban"
            placeholder="请关联楼栋"
            :disabled="modelState.isAddMassifBan || banDisabled"
            class="fill-width"
          >
            <el-option v-for="item in banList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </template>

      <el-form-item label="储存路径：" v-if="folderMode === 1 || folderMode === 3">
        <template>
          <template v-if="localFolderPath.length">
            <span style="cursor: pointer; color: #4457ff" v-for="(item, index) of localFolderPath" @click="open = true">
              <span style="text-decoration: underline">{{ item.filename }}</span>
              <span v-if="index !== localFolderPath.length - 1">></span>
            </span>
          </template>

          <span v-else style="cursor: pointer; color: #4457ff; text-decoration: underline" @click="open = true"
            >请选择路径</span
          >
        </template>
      </el-form-item>

      <template v-if="folderMode === 1">
        <el-form-item label="创建地块/楼栋文件夹：" prop="isAddMassifBan" v-if="folderMode === 1">
          <el-checkbox v-model="modelState.isAddMassifBan" />
        </el-form-item>
      </template>
    </el-form>

    <div slot="footer">
      <el-button @click="$emit('input', false)">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="submit">确 定</el-button>
    </div>

    <select-folder-path-dialog
      :file-type="fileType"
      v-if="open"
      v-model="open"
      @selectFolderPathSubmit="selectFolderPathSubmit"
    />
  </el-dialog>
</template>

<script>
import request from '@/utils/request';
import SelectFolderPathDialog from '@/components/dataCom/components/selectFolderPathDialog.vue';

export default {
  name: 'createFolderDialog',

  components: {
    SelectFolderPathDialog,
  },

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    folderPath: {
      type: Array,
      default: () => [],
    },
    folderId: {
      type: String,
    },
    folderMode: {
      type: Number,
      required: true,
    },
    operationRow: {
      type: Object,
      default: () => ({}),
    },
    fileType: {
      type: String,
    },
  },

  data() {
    return {
      modelState: {
        filename: null,
        ban: null,
        massif: null,
        isAddMassifBan: false,
      },
      massifList: [],
      banList: [],
      rules: {
        filename: [{ required: true, trigger: 'blur', message: '文件名称不能为空' }],
      },
      localFolderPath: [],
      open: false,
      folderDetail: {},
      submitLoading: false,
      massifDisabled: false,
      banDisabled: false,
    };
  },

  computed: {
    title() {
      switch (this.folderMode) {
        case 1:
          return '新建文件夹';
        case 2:
          return '编辑文件夹';
        case 3:
          return '移动文件夹';
        default:
          return '';
      }
    },

    labelWidth() {
      switch (this.folderMode) {
        case 1:
          return '160px';
        case 2:
          return '110px';
        case 3:
          return '90px';
        default:
          return '';
      }
    },
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
    if (this.folderMode === 3) {
      this.localFolderPath = [];
    } else {
      this.localFolderPath = JSON.parse(JSON.stringify(this.folderPath));
    }

    this.getFolderDetail();

    if (this.folderMode === 2) {
      this.getParentFolderDetail();
    }

    this.getMassifList();
  },

  methods: {
    getFolderDetail() {
      request({
        url: '/mdm/mdm_file_run/get',
        method: 'get',
        params: {
          id: this.folderMode === 1 ? this.folderId : this.operationRow.id,
        },
      }).then((res) => {
        this.folderDetail = res.data;

        if (this.folderDetail.massif) {
          this.modelState.massif = this.folderDetail.massif;

          if (this.folderMode === 1) {
            this.massifDisabled = true;
          }
        }

        if (this.folderMode !== 1) {
          this.modelState.filename = this.folderDetail.filename;
        }

        setTimeout(() => {
          if (this.folderDetail.ban) {
            this.modelState.ban = this.folderDetail.ban;

            if (this.folderMode === 1) {
              this.banDisabled = true;
            }
          }
        });
      });
    },

    getParentFolderDetail() {
      request({
        url: '/mdm/mdm_file_run/get',
        method: 'get',
        params: {
          id: this.operationRow.parentId,
        },
      }).then((res) => {
        if (res.data.massif) {
          this.massifDisabled = true;
        }

        setTimeout(() => {
          if (res.data.ban) {
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

    selectFolderPathSubmit(folderPath) {
      this.localFolderPath = folderPath;
    },

    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.submitLoading = true;

          if (this.folderMode === 1) {
            request({
              url: `/mdm/mdm_file_run`,
              method: 'post',
              data: {
                ...this.modelState,
                parentId: this.localFolderPath[this.localFolderPath.length - 1].id,
                massif: this.modelState.isAddMassifBan ? null : this.modelState.massif,
                ban: this.modelState.isAddMassifBan ? null : this.modelState.ban,
              },
            })
              .then((response) => {
                this.$modal.msgSuccess('操作成功');
                this.submitLoading = false;

                document.dispatchEvent(
                  new CustomEvent('uploadOSSRefresh', {
                    detail: {
                      parentId: this.localFolderPath[this.localFolderPath.length - 1].id,
                    },
                  }),
                );

                this.$emit('createFolderSubmit');
                this.$emit('input', false);
              })
              .catch(() => {
                this.submitLoading = false;
              });
          } else {
            let params = {};

            if (this.folderMode === 2) {
              params = {
                id: this.operationRow.id,
                filename: this.modelState.filename,
                massif: this.modelState.massif,
                ban: this.modelState.ban,
              };
            } else if (this.folderMode === 3) {
              params = {
                id: this.operationRow.id,
                parentId: this.localFolderPath[this.localFolderPath.length - 1].id,
              };
            }

            request({
              url: `/mdm/mdm_file_run`,
              method: 'put',
              data: params,
            })
              .then((response) => {
                this.$modal.msgSuccess('操作成功');
                this.submitLoading = false;

                document.dispatchEvent(
                  new CustomEvent('createFolderSubmit', {
                    detail: {
                      parentId: this.localFolderPath[this.localFolderPath.length - 1].id,
                    },
                  }),
                );

                this.$emit('createFolderSubmit');
                this.$emit('input', false);
              })
              .catch(() => {
                this.submitLoading = false;
              });
          }
        } else {
          this.focusError();
        }
      });
    },
  },
};
</script>
