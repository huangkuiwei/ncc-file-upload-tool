<template>
  <el-popover
    placement="bottom"
    width="700"
    trigger="manual"
    :visible-arrow="false"
    :value="showUploadBox"
    @input="SET_SHOW_UPLOADED_BOX($event)"
    class="upload-popover"
    popper-class="upload-popover-box"
  >
    <img
      slot="reference"
      style="width: 32px; cursor: pointer"
      src="@/assets/images/upload-download.png"
      alt=""
      @click="SET_SHOW_UPLOADED_BOX(!showUploadBox)"
    />

    <div class="upload-popover-content">
      <div class="title">
        <span>上传完成（{{ successFileList.length }}/{{ uploadFileList.length }}）</span>
        <span style="cursor: pointer" @click="SET_SHOW_UPLOADED_BOX(false)">X</span>
      </div>

      <div class="options">
        <el-button @click="startAll">全部开始</el-button>
        <el-button @click="pauseAll">全部暂停</el-button>
        <el-button @click="cancelAll">全部取消</el-button>
      </div>

      <div class="upload-list">
        <el-table border :data="uploadFileList" row-key="taskId">
          <el-table-column
            type="index"
            :index="(index) => index + 1"
            label="序号"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column label="文件名" align="center" prop="filename" width="200px" show-overflow-tooltip />
          <el-table-column label="文件大小" align="center" show-overflow-tooltip>
            <template slot-scope="scoped"> {{ formatBytes(scoped.row.size) }} </template>
          </el-table-column>
          <el-table-column label="进度" align="center">
            <template slot-scope="scoped"> {{ scoped.row.progress }}% </template>
          </el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="scoped">
              <div class="progress-box">
                <div v-if="scoped.row.status === 'uploading'">
                  <span class="bar" :class="[scoped.row.status]" :style="{ width: scoped.row.progress + '%' }" />
                  <span class="tip">进行中</span>
                </div>

                <div v-if="scoped.row.status === 'pause'">
                  <span class="bar" :class="[scoped.row.status]" :style="{ width: scoped.row.progress + '%' }" />
                  <span class="tip">已暂停</span>
                </div>

                <div v-if="scoped.row.status === 'success'">
                  <span class="bar" :class="[scoped.row.status]" :style="{ width: scoped.row.progress + '%' }" />
                  <span class="tip">已完成</span>
                </div>

                <div v-if="scoped.row.status === 'ready'">
                  <span class="bar" :class="[scoped.row.status]" :style="{ width: scoped.row.progress + '%' }" />
                  <span class="tip">等待中</span>
                </div>

                <div v-if="scoped.row.status === 'cancel'">
                  <span class="bar" :class="[scoped.row.status]" :style="{ width: scoped.row.progress + '%' }" />
                  <span class="tip">已取消</span>
                </div>

                <div v-if="scoped.row.status === 'error'">
                  <span class="bar" :class="[scoped.row.status]" :style="{ width: scoped.row.progress + '%' }" />
                  <span class="tip" style="color: #ff8686">错误</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120px">
            <template slot-scope="scoped">
              <div class="options">
                <template v-if="scoped.row.status === 'uploading'">
                  <i class="el-icon el-icon-video-pause" @click="pauseRow(scoped.row)" title="暂停"></i>
                </template>

                <template v-if="scoped.row.status === 'pause'">
                  <i class="el-icon el-icon-video-play" @click="goOn(scoped.row)" title="继续"></i>
                </template>

                <template
                  v-if="
                    scoped.row.status === 'success' || scoped.row.status === 'cancel' || scoped.row.status === 'error'
                  "
                >
                  <i class="el-icon el-icon-delete" title="删除" @click="deleteImodel(scoped.row)"></i>
                </template>

                <template
                  v-if="
                    scoped.row.status === 'uploading' || scoped.row.status === 'ready' || scoped.row.status === 'pause'
                  "
                >
                  <i class="el-icon el-icon-circle-close" title="取消下载" @click="cancelRow(scoped.row)"></i>
                </template>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-popover>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { singleFilePartPointUpload, formatBytes } from '@/utils/tools';

export default {
  name: 'uploadListPopover',

  data() {
    return {
      formatBytes,
    };
  },

  computed: {
    ...mapState('mdm', ['uploadFileList', 'showUploadBox']),

    successFileList() {
      return this.uploadFileList.filter((item) => item.status === 'success');
    },
  },

  watch: {
    uploadFileList: [
      {
        async handler(value) {
          let hasUploading = value.find((item) => item.status === 'uploading');

          if (!hasUploading) {
            const nextUploadFile = value.find((item) => item.status === 'ready');

            if (nextUploadFile) {
              nextUploadFile.status = 'uploading';
              await singleFilePartPointUpload(nextUploadFile);
            }
          }
        },
      },
      {
        async handler(value) {
          if (!value) {
            return;
          }

          localStorage.setItem('uploadFileList', JSON.stringify(value));
        },
        deep: true,
      }
    ],
  },

  methods: {
    ...mapMutations('mdm', ['SET_SHOW_UPLOADED_BOX', 'EDIT_UPLOAD_FILE']),

    // 继续下载
    goOn(row) {
      row.status = 'uploading';
      singleFilePartPointUpload(row);
    },

    // 删除当前任务
    deleteImodel(row) {
      row.status = 'error';

      this.EDIT_UPLOAD_FILE({
        action: 'delete',
        data: row,
      });
    },

    async cancelRow(row) {
      row.status = 'cancel';

      const hasUploading = this.uploadFileList.find((item) => item.status === 'uploading');
      const nextUploadFile = this.uploadFileList.find((item) => item.status === 'ready');

      if (!hasUploading && nextUploadFile) {
        nextUploadFile.status = 'uploading';
        await singleFilePartPointUpload(nextUploadFile);
      }
    },

    async pauseRow(row) {
      row.status = 'pause';

      const hasUploading = this.uploadFileList.find((item) => item.status === 'uploading');
      const nextUploadFile = this.uploadFileList.find((item) => item.status === 'ready');

      if (!hasUploading && nextUploadFile) {
        nextUploadFile.status = 'uploading';
        await singleFilePartPointUpload(nextUploadFile);
      }
    },

    async startAll() {
      this.uploadFileList.forEach((item) => {
        if (item.status === 'pause') {
          item.status = 'ready';
        }
      });

      let hasUploading = this.uploadFileList.find((item) => item.status === 'uploading');

      if (!hasUploading) {
        const nextUploadFile = this.uploadFileList.find((item) => item.status === 'ready');

        if (nextUploadFile) {
          nextUploadFile.status = 'uploading';
          await singleFilePartPointUpload(nextUploadFile);
        }
      }
    },

    pauseAll() {
      this.uploadFileList.forEach((item) => {
        if (item.status === 'uploading' || item.status === 'ready') {
          item.status = 'pause';
        }
      });
    },

    cancelAll() {
      this.uploadFileList.forEach((item) => {
        if (item.status === 'uploading' || item.status === 'pause' || item.status === 'ready') {
          item.status = 'cancel';
        }
      });
    },
  },
};
</script>

<style lang="scss">
.upload-popover {
  .el-popover__reference-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.upload-popover-box {
  padding: 0 !important;
  border: none !important;

  > .upload-popover-content {
    > .title {
      padding: 8px 15px;
      color: #000000;
      background: #999999;
      font-size: 18px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    > .options {
      margin: 10px 10px 0;
    }

    > .upload-list {
      padding: 10px;
      max-height: 60vh;
      overflow: auto;

      .progress-box {
        height: 23px;
        width: 100%;
        border: 1px solid #999999;
        text-align: center;

        > div {
          width: 100%;
          height: 100%;
          position: relative;

          > .bar {
            position: absolute;
            inset: 0;

            &.uploading {
              background: #7eff95;
            }

            &.pause {
              background: #dddddd;
            }

            &.success {
              background: #7eff95;
            }

            &.ready {
              background: #c2fdcc;
            }

            &.cancel {
              background: #999999;
            }

            &.error {
              background: #ff8686;
            }
          }

          > .tip {
            position: relative;
            z-index: 1;
          }
        }
      }

      .options {
        i {
          color: #8f9ab4;
          font-size: 16px;
          cursor: pointer;

          &:not(:first-child) {
            margin-left: 10px;
          }
        }
      }
    }
  }
}
</style>
