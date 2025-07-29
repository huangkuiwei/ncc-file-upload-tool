<template>
  <div class="s-index">
    <div class="left">
      <div>文件数量：{{ shareInfo.total }}</div>
      <div>分享用户：{{ shareInfo.createByName }}</div>
      <div>分享时间：{{ shareInfo.createDate }}</div>
      <div>过期时间：{{ shareInfo.expirationTime }}</div>
    </div>

    <div class="right">
      <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <action-button plain type="primary" :disabled="multiple" @click="downloadFile()"> 下载 </action-button>
          </el-col>

          <right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery" @reset="resetQuery">
            <template>
              <el-form-item label="文件名称：" prop="name">
                <el-input
                  v-model="conPO.filename"
                  placeholder="请输入文件名称"
                  clearable
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </template>
          </right-toolbar>
        </el-row>
      </el-form>

      <div class="folder-path">
        <span class="back" @click="goBack">返回上一级</span>

        <div class="path-item">
          <span v-for="(item, index) of folderPath" :key="item.id">
            <span @click="jumpPath(index)">{{ item.filename }}</span>
            <span style="padding: 0 5px" v-if="index !== folderPath.length - 1">></span>
          </span>
        </div>
      </div>

      <mti-table
        show-order
        show-check
        v-loading="loading"
        :filter="conPO"
        :data="pageDataPO"
        @selection-change="handleSelectionChange"
        @pagination="pageMdm_config"
      >
        <el-table-column label="文件名称" align="center" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <div style="display: flex; align-items: center; cursor: pointer" @click="preview(row)">
              <svg v-if="!row.filesuffix" class="tableLinkIcon" aria-hidden="true" style="width: 24px; height: 24px">
                <use xlink:href="#icon-wenjianjia" />
              </svg>

              <!--<svg v-else-if="row.filesuffix.toLowerCase() === '.bim'" class="tableLinkIcon" aria-hidden="true">-->
              <!--  <use xlink:href="#icon-BIMwenjian" />-->
              <!--</svg>-->

              <svg
                v-else-if="imgSuffixList.indexOf(row.filesuffix.toLowerCase()) > -1"
                class="tableLinkIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-tupian" />
              </svg>

              <svg
                v-else-if="videoSuffixList.indexOf(row.filesuffix.toLowerCase()) > -1"
                class="tableLinkIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-shipin" />
              </svg>

              <!--<svg-->
              <!--  v-else-if="row.filesuffix.toLowerCase() === '.doc' || row.filesuffix.toLowerCase() === '.docx'"-->
              <!--  class="tableLinkIcon"-->
              <!--  aria-hidden="true"-->
              <!--&gt;-->
              <!--  <use xlink:href="#icon-word" />-->
              <!--</svg>-->

              <!--<svg-->
              <!--  v-else-if="row.filesuffix.toLowerCase() === '.xls' || row.filesuffix.toLowerCase() === '.xlsx'"-->
              <!--  class="tableLinkIcon"-->
              <!--  aria-hidden="true"-->
              <!--&gt;-->
              <!--  <use xlink:href="#icon-excel" />-->
              <!--</svg>-->

              <!--<svg-->
              <!--  v-else-if="row.filesuffix.toLowerCase() === '.ppt' || row.filesuffix.toLowerCase() === '.pptx'"-->
              <!--  class="tableLinkIcon"-->
              <!--  aria-hidden="true"-->
              <!--&gt;-->
              <!--  <use xlink:href="#icon-ppt" />-->
              <!--</svg>-->

              <svg
                v-else-if="pdfSuffixList.indexOf(row.filesuffix.toLowerCase()) > -1"
                class="tableLinkIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-pdf" />
              </svg>

              <svg v-else class="tableLinkIcon" aria-hidden="true">
                <use xlink:href="#icon-weizhiwenjian" />
              </svg>

              <span class="filename">{{ row.filename }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" align="center" prop="filesize" show-overflow-tooltip>
          <template slot-scope="{ row }" v-if="row.filesuffix">
            {{ formatBytes(row.filesize) }}
          </template>
        </el-table-column>
        <el-table-column label="关联楼栋/地块" align="center" prop="createDate" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ row.massif }}<span v-if="row.ban && row.massif">/</span>{{ row.ban }}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" align="center" prop="updateDate" show-overflow-tooltip />
        <el-table-column label="操作" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="options">
              <i
                style="cursor: pointer"
                class="el-icon el-icon-download"
                title="下载"
                @click="downloadFile(scope.row, $event)"
              />
            </div>
          </template>
        </el-table-column>
      </mti-table>
    </div>

    <download-dialog
      v-if="downloadDialog"
      v-model="downloadDialog"
      :operationRows="operationRows"
      @downloadSubmit="downloadSubmit"
    />
  </div>
</template>

<script>
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import { FileUtil } from 'ctcemti-ui/src/utils/base/FileUtil';
import request from '@/utils/request';
import DownloadDialog from '@/components/dataCom/components/downloadDialog.vue';
import { formatBytes } from '@/utils/tools';

export default {
  name: 'shareIndex',

  data() {
    return {
      id: null,
      shareInfo: {},
      loading: false,
      // 查询参数
      conPO: {
        filename: null,
      },
      pageDataPO: {},
      imgSuffixList: ['.png', '.jpg', '.jpeg', '.gif'],
      videoSuffixList: ['.ogg', '.mp4', '.webm', 'wav', 'mp3', 'aac'],
      pdfSuffixList: ['.pdf'],
      single: true,
      multiple: true,
      downloadDialog: false,
      ids: [],
      selectRows: [],
      operationRows: [],
      folderPath: [],
      folderId: null,
      formatBytes,
    };
  },

  components: {
    DownloadDialog,
  },

  created() {
    this.id = this.$route.query.id;

    this.getShareInfo();
    this.pageMdm_config();
  },

  methods: {
    getShareInfo() {
      request({
        url: '/mdm/mdm_file_run/shareModel',
        method: 'get',
        params: {
          shareId: this.id,
        },
      }).then((res) => {
        this.shareInfo = res.data;

        this.folderPath.push({
          filename: '分享文件',
          id: this.shareInfo.id,
        });
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO = this.$table.pager(this.conPO, true);
      this.pageMdm_config(this.folderId);
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },

    /** 查询配置管理列表 */
    pageMdm_config() {
      this.loading = true;
      this.conPO = this.$table.pager(this.conPO);

      let url = '';
      let params = {};

      if (!this.folderId || this.folderId === this.shareInfo.id) {
        url = '/mdm/mdm_file_run/shareList';
        params = {
          ...this.conPO,
          shareId: this.id,
        };
      } else {
        url = '/mdm/mdm_file_run/page';
        params = {
          ...this.conPO,
          id: this.folderId,
        };
      }

      request({
        url,
        method: 'get',
        params,
      }).then((response) => {
        let data = response.data || response.rows;

        data.forEach((item) => {
          let splits = item.filename.split('.');

          if (splits.length === 1) {
            item.filesuffix = '';
          } else {
            item.filesuffix = '.' + splits[splits.length - 1];
          }

          item.createDate = DateUtil.format(item.createDate, 'yyyy-MM-dd HH:mm:ss');
          item.updateDate = DateUtil.format(item.updateDate, 'yyyy-MM-dd HH:mm:ss');
        });

        this.pageDataPO = response;
        this.loading = false;
      });
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.selectRows = selection;
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    // 预览
    preview(row) {
      if (!row.filesuffix) {
        this.folderId = row.id;
        this.folderPath.push(row);
        this.pageMdm_config();
      } else {
        let previewSuffixList = this.imgSuffixList.concat(this.videoSuffixList, this.pdfSuffixList);

        if (previewSuffixList.includes(row.filesuffix.toLowerCase())) {
          request({
            url: '/mdm/mdm_file_run/preview',
            method: 'get',
            params: {
              fileId: row.id,
            },
          }).then((res) => {
            let url = res.data;
            window.open(url);
          });
        } else {
          this.$message.info('该格式文件不支持在线预览');
        }
      }
    },

    // 下载
    downloadFile(row, $event) {
      if ($event) {
        $event.stopPropagation();
      }

      if (row) {
        this.operationRows = [row];
      } else {
        this.operationRows = this.selectRows;
      }

      this.downloadDialog = true;
    },

    downloadSubmit() {
      this.downloadDialog = false;

      let ids = this.operationRows.map(item => item.id);

      if (this.operationRows.length === 1 && this.operationRows.every((item) => item.filesuffix)) {
        window.open(`${process.env.VUE_APP_BASE_API}/mdm/mdm_file_run/download?fileId=${ids[0]}`);

        request({
          url: '/mdm/mdm_file_run/ShareSummation',
          method: 'get',
          params: {
            fileId: this.folderPath[1]?.id || ids,
            shareId: this.id,
          },
        })
      } else {
        const loading = this.$loading({
          target: '.app-container',
          lock: true,
          background: 'rgba(255, 255, 255, 0.1)',
          text: '文件正在压缩打包下载，请稍等...',
        });

        request({
          url: '/mdm/mdm_file_run/downloadZip',
          method: 'post',
          responseType: 'blob',
          data: {
            fileIds: ids,
          },
        })
          .then((res) => {
            FileUtil.resolveBlob(res);
          })
          .finally(() => {
            loading.close();
          });

        if (this.folderPath.length === 1) {
          ids.forEach(id => {
            request({
              url: '/mdm/mdm_file_run/ShareSummation',
              method: 'get',
              params: {
                fileId: id,
                shareId: this.id,
              },
            })
          })
        } else {
          request({
            url: '/mdm/mdm_file_run/ShareSummation',
            method: 'get',
            params: {
              fileId: this.folderPath[1].id,
              shareId: this.id,
            },
          })
        }
      }
    },

    jumpPath(index) {
      if (this.folderPath.length === 1) {
        this.$message.info('已经是第一级文件夹了');
      } else {
        this.folderId = this.folderPath[index].id;
        this.folderPath = this.folderPath.slice(0, index + 1);
        this.pageMdm_config();
      }
    },

    goBack() {
      if (this.folderPath.length === 1) {
        this.$message.info('已经是第一级文件夹了');
      } else {
        this.folderId = this.folderPath[this.folderPath.length - 2].id;
        this.folderPath = this.folderPath.slice(0, -1);
        this.pageMdm_config();
      }
    },
  },
};
</script>

<style scoped lang="scss">
.s-index {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 10px;

  > .left {
    width: 240px;
    padding: 10px;
    flex-shrink: 0;
    border: 1px solid #cccccc;
    font-size: 14px;

    > div {
      margin-bottom: 20px;
    }
  }

  > .right {
    flex-grow: 1;
    overflow: auto;
    padding: 0 10px;

    .folder-path {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;

      > .back {
        display: flex;
        align-items: center;
        line-height: 1;
        padding-right: 5px;
        margin-right: 5px;
        border-right: 1px solid #000;
        color: #0d84ff;
        cursor: pointer;
      }

      > .path-item {
        > span {
          cursor: pointer;
          color: #0d84ff;
        }
      }
    }

    .tableLinkIcon {
      width: 20px;
      height: 20px;
      margin-right: 5px;
      flex-shrink: 0;
    }
  }
}
</style>
