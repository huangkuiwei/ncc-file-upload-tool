<template>
  <div class="app-container">
    <div class="container-left">
      <folder-tree @showFolderDetail="showFolderDetail" :fileType="fileType" />
    </div>

    <div class="container-right">
      <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <action-button
              :hashKey="`mdm:mdm_file_run:upload${permissions}`"
              type="primary"
              @click="uploadFile"
              v-hasPermi="[`mdm:mdm_file_run:upload${permissions}`]"
            >
              上传
            </action-button>
          </el-col>
          <!--<el-col :span="1.5">-->
          <!--  <action-button-->
          <!--    :hashKey="`mdm:mdm_file_run:share${permissions}`"-->
          <!--    plain-->
          <!--    type="primary"-->
          <!--    :disabled="multiple"-->
          <!--    @click="shareFile()"-->
          <!--    v-hasPermi="[`mdm:mdm_file_run:share${permissions}`]"-->
          <!--  >-->
          <!--    分享-->
          <!--  </action-button>-->
          <!--</el-col>-->
          <!--<el-col :span="1.5">-->
          <!--  <action-button-->
          <!--    :hashKey="`mdm:mdm_file_run:download${permissions}`"-->
          <!--    plain-->
          <!--    type="primary"-->
          <!--    :disabled="multiple"-->
          <!--    @click="downloadFile()"-->
          <!--    v-hasPermi="[`mdm:mdm_file_run:download${permissions}`]"-->
          <!--  >-->
          <!--    下载-->
          <!--  </action-button>-->
          <!--</el-col>-->
          <!--<el-col :span="1.5">-->
          <!--  <action-button-->
          <!--    :hashKey="`mdm:mdm_file_run:del${permissions}`"-->
          <!--    plain-->
          <!--    type="primary"-->
          <!--    :disabled="multiple"-->
          <!--    @click="deleteFile()"-->
          <!--    v-hasPermi="[`mdm:mdm_file_run:del${permissions}`]"-->
          <!--  >-->
          <!--    删除-->
          <!--  </action-button>-->
          <!--</el-col>-->
          <el-col :span="1.5">
            <action-button
              :hashKey="`mdm:mdm_file_run:save${permissions}`"
              plain
              type="primary"
              @click="createFolder"
              v-hasPermi="[`mdm:mdm_file_run:save${permissions}`]"
            >
              新建文件夹
            </action-button>
          </el-col>
          <el-col :span="1.5" v-if="noticeData">
            <el-tooltip placement="bottom-start" effect="light">
              <i class="el-icon el-icon-warning-outline" style="font-size: 24px; margin-top: 2px; margin-left: 20px" />

              <div slot="content" style="width: 350px">
                <div v-html="noticeData" />
              </div>
            </el-tooltip>
          </el-col>

          <!--<right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery" @reset="resetQuery">-->
          <!--  <template>-->
          <!--    <el-form-item label="文件名称：" prop="name">-->
          <!--      <el-input-->
          <!--        v-model="conPO.filename"-->
          <!--        placeholder="请输入文件名称"-->
          <!--        clearable-->
          <!--        @keyup.enter.native="handleQuery"-->
          <!--      />-->
          <!--    </el-form-item>-->
          <!--  </template>-->
          <!--</right-toolbar>-->
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
        id="completion_data_table"
        show-order
        show-check
        v-loading="loading"
        :filter="conPO"
        :data="pageDataPO"
        @selection-change="handleSelectionChange"
        @pagination="pageMdm_config"
      >
        <el-table-column label="文件名称" align="center" width="220" show-overflow-tooltip>
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

              <svg
                v-else-if="row.filesuffix.toLowerCase() === '.doc' || row.filesuffix.toLowerCase() === '.docx'"
                class="tableLinkIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-word" />
              </svg>

              <svg
                v-else-if="row.filesuffix.toLowerCase() === '.xls' || row.filesuffix.toLowerCase() === '.xlsx'"
                class="tableLinkIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-excel" />
              </svg>

              <svg
                v-else-if="row.filesuffix.toLowerCase() === '.ppt' || row.filesuffix.toLowerCase() === '.pptx'"
                class="tableLinkIcon"
                aria-hidden="true"
              >
                <use xlink:href="#icon-ppt" />
              </svg>

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
        <el-table-column label="上传人" align="center" prop="createByName" show-overflow-tooltip />
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
        <el-table-column label="修改时间" align="center" prop="updateDate" width="160" />
        <!--<el-table-column label="操作" align="center" width="160">-->
        <!--  <template slot-scope="scope">-->
        <!--    <div class="options">-->
        <!--      <i class="el-icon el-icon-share" title="分享" @click="shareFile(scope.row)" />-->
        <!--      <i-->
        <!--        class="el-icon el-icon-delete"-->
        <!--        title="删除"-->
        <!--        v-hasPermi="[`mdm:mdm_file_run:del${permissions}`]"-->
        <!--        @click="deleteFile(scope.row)"-->
        <!--      />-->
        <!--      <i-->
        <!--        class="el-icon el-icon-download"-->
        <!--        title="下载"-->
        <!--        v-hasPermi="[`mdm:mdm_file_run:download${permissions}`]"-->
        <!--        @click="downloadFile(scope.row)"-->
        <!--      />-->

        <!--      <template v-if="!scope.row.filesuffix">-->
        <!--        <i class="el-icon el-icon-edit" title="编辑文件夹" @click="editFolder(scope.row)" />-->
        <!--        <i class="el-icon el-icon-edit-outline" title="移动文件夹" @click="removeFolder(scope.row)" />-->
        <!--      </template>-->
        <!--    </div>-->
        <!--  </template>-->
        <!--</el-table-column>-->
      </mti-table>
    </div>

    <!-- 添加或修改配置管理对话框 -->
    <el-dialog
      v-dialogDrag
      class="scrollbar"
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <edit
        v-if="open"
        ref="form"
        :folderId="folderId"
        :folderPath="folderPath"
        :fileType="fileType"
        @cancel="cancel"
      />
    </el-dialog>

    <download-dialog
      v-if="downloadDialog"
      v-model="downloadDialog"
      :operationRows="operationRows"
      @downloadSubmit="downloadSubmit"
    />

    <create-folder-dialog
      v-if="createFolderDialog"
      v-model="createFolderDialog"
      :folderPath="folderPath"
      :folderId="folderId"
      :folderMode="folderMode"
      :operationRow="operationRows[0]"
      :fileType="fileType"
      @createFolderSubmit="pageMdm_config"
    />

    <share-file-dialog v-if="shareFileDialog" v-model="shareFileDialog" :operationRows="operationRows" />
  </div>
</template>

<script>
import Sortable from 'sortablejs';

import Edit from './edit.vue';
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';
import { FileUtil } from 'ctcemti-ui/src/utils/base/FileUtil';
import FolderTree from '@/components/dataCom/components/folderTree.vue';
import request from '@/utils/request';
import DownloadDialog from '@/components/dataCom/components/downloadDialog.vue';
import { formatBytes } from '@/utils/tools';
import CreateFolderDialog from '@/components/dataCom/components/createFolderDialog.vue';
import ShareFileDialog from '@/components/dataCom/components/shareFileDialog.vue';

export default {
  name: 'dataCom',

  props: {
    fileType: {
      type: String,
    },

    permissions: {
      type: String,
      default: '',
    },
  },

  components: {
    ShareFileDialog,
    CreateFolderDialog,
    DownloadDialog,
    FolderTree,
    Edit,
  },

  dicts: ['1002'],

  data() {
    return {
      // 列表加载遮罩层
      loading: false,
      // 表单禁用
      disabled: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 分页列表参数
      pageDataPO: [],
      // 查询参数
      conPO: {
        filename: null,
      },
      // 表单参数
      dataPO: {},
      selectRows: [],
      operationRows: [],
      imgSuffixList: ['.png', '.jpg', '.jpeg', '.gif'],
      videoSuffixList: ['.ogg', '.mp4', '.webm', 'wav', 'mp3', 'aac'],
      officeSuffixList: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
      pdfSuffixList: ['.pdf'],
      noticeData: '',
      folderId: undefined,
      folderPath: [],
      downloadDialog: false,
      formatBytes,
      createFolderDialog: false,
      shareFileDialog: false,
      folderMode: 1, // 1 新增文件夹 2 编辑文件夹 3 移动文件夹
    };
  },

  created() {
    let tempFolderPath = localStorage.getItem('folderPath');

    if (tempFolderPath) {
      this.folderPath = JSON.parse(tempFolderPath);

      this.folderPath.forEach((item) => {
        item.filename = item.nodeName;
      });

      localStorage.removeItem('folderPath');
    }
  },

  mounted() {
    document.addEventListener('uploadLocalRefresh', this.pageMdm_config);
    document.addEventListener('uploadOSSRefresh', this.pageMdm_config);

    let id;

    if (this.fileType === '1') {
      id = 60011001;
    } else if (this.fileType === '2') {
      id = 60011002;
    } else if (this.fileType === '3') {
      id = 60011003;
    } else if (this.fileType === '4') {
      id = 60011004;
    }

    this.getNoticeData(id);
  },

  beforeDestroy() {
    document.removeEventListener('uploadLocalRefresh', this.pageMdm_config);
    document.removeEventListener('uploadOSSRefresh', this.pageMdm_config);
  },

  methods: {
    base64Encode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
},
    getNoticeData(id) {
      request({
        url: '/mdm/mdm_file_run/getNotice',
        method: 'get',
        params: {
          noticemenuid: id,
        },
      }).then((res) => {
        this.noticeData = res.data.content;
      });
    },

    /** 查询配置管理列表 */
    pageMdm_config() {
      this.loading = true;
      this.conPO = this.$table.pager(this.conPO);
      request({
        url: '/mdm/mdm_file_run/page',
        method: 'get',
        params: {
          ...this.conPO,
          id: this.folderId,
        },
      }).then((response) => {
        console.log('response', response);
        let data = response.data || response.rows;

        data.forEach((item) => {
          item.createDate = DateUtil.format(item.createDate, 'yyyy-MM-dd HH:mm:ss');
          item.updateDate = DateUtil.format(item.updateDate, 'yyyy-MM-dd HH:mm:ss');
        });

        this.pageDataPO = response;
        this.loading = false;

        this.$nextTick(() => {
          if (!this.sortTable) {
            const table = document.querySelector("#completion_data_table .el-table__body-wrapper tbody");
            this.sortTable = Sortable.create(table, {
              group: 'shared',
              animation: 150,
              ghostClass: 'sortable-ghost', //拖拽样式
              easing: 'cubic-bezier(1, 0, 0, 1)',
              onStart: (item) => {
                // console.log(item);
              },

              // 结束拖动事件
              onEnd: (item) => {
                if (item.newIndex !== item.oldIndex) {
                  let params = {}

                  // 往上移动
                  if (item.newIndex < item.oldIndex) {
                    params = {
                      value: 1,
                      ida: this.pageDataPO.rows[item.oldIndex].id,
                      idb: this.pageDataPO.rows[item.newIndex].id,
                    }
                  } else {
                    params = {
                      value: -1,
                      ida: this.pageDataPO.rows[item.oldIndex].id,
                      idb: this.pageDataPO.rows[item.newIndex].id
                    }
                  }

                  request({
                    url: '/mdm/mdm_file_run/mobileSorting',
                    method: 'get',
                    params: params,
                  }).then(() => {
                    const arr = this.pageDataPO.rows;
                    const currentRow = arr.splice(item.oldIndex, 1)[0]
                    arr.splice(item.newIndex, 0, currentRow )
                    this.pageDataPO.rows = [];
                    this.pageMdm_config()
                  })
                }
              },
            })
          }
        })
      });
    },

    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 表单重置 */
    reset() {
      this.dataPO = {
        id: null,
      };
      this.disabled = false;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO = this.$table.pager(this.conPO, true);
      this.pageMdm_config();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.selectRows = selection;
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    /** 上传 */
    uploadFile() {
      this.reset();
      this.open = true;
      this.title = '文件上传';
    },

    /** 分享 */
    shareFile(row) {
      if (row) {
        this.operationRows = [row];
      } else {
        this.operationRows = this.selectRows;
      }

      this.shareFileDialog = true;
    },

    // 删除文件
    deleteFile(row) {
      this.$modal
        .confirm('是否确认删除所选择的数据？')
        .then(() => {
          let ids = '';

          if (row) {
            ids = row.id;
          } else {
            ids = this.ids.join();
          }

          return request({
            url: '/mdm/mdm_file_run',
            method: 'delete',
            params: {
              ids,
            },
          });
        })
        .then(() => {
          this.pageMdm_config();
          this.$modal.msgSuccess('删除成功');

          document.dispatchEvent(new CustomEvent('uploadOSSRefresh', {
            detail: {
              parentId: this.folderPath[this.folderPath.length - 1].id
            }
          }));
        })
        .catch(() => {});
    },

    // 下载
    downloadFile(row) {
      if (row) {
        this.operationRows = [row];
      } else {
        this.operationRows = this.selectRows;
      }

      this.downloadDialog = true;
    },

    downloadSubmit() {
      this.downloadDialog = false;

      if (this.selectRows.length === 1 && this.selectRows.every((item) => item.filesuffix)) {
        window.open(`${process.env.VUE_APP_BASE_API}/mdm/mdm_file_run/download?fileId=${this.ids[0]}`);
      } else {
        const loading = this.$loading({
          target: '.app-container',
          lock: true,
          background: 'rgba(255, 255, 255, 0.1)',
        });

        request({
          url: '/mdm/mdm_file_run/downloadZip',
          method: 'post',
          responseType: 'blob',
          data: {
            fileIds: this.ids,
          },
        })
          .then((res) => {
            FileUtil.resolveBlob(res);
          })
          .finally(() => {
            loading.close();
          });
      }
    },

    // 新建文件夹
    createFolder() {
      this.folderMode = 1;
      this.createFolderDialog = true;
    },

    // 编辑
    editFolder(row) {
      this.folderMode = 2;
      this.operationRows = [row];
      this.createFolderDialog = true;
    },

    // 移动
    removeFolder(row) {
      this.folderMode = 3;
      this.operationRows = [row];
      this.createFolderDialog = true;
    },

    showFolderDetail(folderPath, first) {
      if (first && this.folderPath.length) {
        this.folderId = this.folderPath[this.folderPath.length - 1].id;
      } else {
        this.folderId = folderPath[folderPath.length - 1].id;
        this.folderPath = folderPath;
      }

      console.log(this.folderPath)
      console.log(this.folderId)

      this.pageMdm_config();
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
        } else if (this.officeSuffixList.includes(row.filesuffix.toLowerCase())) {
          window.open('https://kkfileview-dit.diccp.com/onlinePreview?url='+encodeURIComponent(this.base64Encode('https://minio1-view-dic.diccp.com/mti-ncc/'+row.filepath)));
           //FileUtil.previewRemote(row.id, 'AHSZ', row.filesuffix.split('.')[1])
        } else {
          this.$message.info('该格式文件不支持在线预览');
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.app-container {
  display: flex;

  > .container-left {
    width: 250px;
    display: none;
    flex-shrink: 0;
    border: 1px solid #cccccc;
  }

  > .container-right {
    flex-grow: 1;
    overflow: hidden;
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

    ::v-deep #completion_data_table {
      .el-table {
        min-width: 100%;
      }

      .el-table__row {
        td {
          &:nth-child(3) {
            text-align: left !important;
          }

          &:nth-child(8) {
            text-align: left !important;
          }
        }
      }
    }

    .tableLinkIcon {
      width: 20px;
      height: 20px;
      margin-right: 5px;
      flex-shrink: 0;
    }

    .filename {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
</style>

<style lang="scss">
.el-tooltip__popper {
  padding: 0 5px;
}
</style>
