<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
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

    <mti-table show-order v-loading="loading" :filter="conPO" :data="pageDataPO" @pagination="pageMdm_share">
      <el-table-column label="文件名称" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <div style="display: flex; align-items: center">
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
      <el-table-column label="文件大小" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }" v-if="row.filesize">
          {{ formatBytes(row.filesize) }}
        </template>
      </el-table-column>
      <el-table-column label="文件类型" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span v-if="row.filetype === '1'">竣工资料</span>
          <span v-if="row.filetype === '2'">整治资料</span>
          <span v-if="row.filetype === '3'">物业运维</span>
          <span v-if="row.filetype === '4'">观测资料</span>
        </template>
      </el-table-column>
      <el-table-column label="分享时间" align="center" prop="createDate" show-overflow-tooltip />
      <el-table-column label="分享有效期" align="center" prop="shareDeadline" show-overflow-tooltip />
      <el-table-column label="分享状态" align="center" prop="shareType" show-overflow-tooltip />
      <el-table-column label="下载次数" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          {{ row.download || '0' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <div class="share-page-option">
            <template v-if="row.shareType === '已取消' || row.shareType === '过期'">
              <i class="el-icon el-icon-share" title="重新分享" @click="share(row)"></i>
            </template>

            <template v-else>
              <i class="el-icon el-icon-link" title="复制" @click="copy(row)"></i>
              <i class="el-icon el-icon-circle-close" title="取消分享" @click="close(row)"></i>
            </template>
          </div>
        </template>
      </el-table-column>

      <shareFileDialog
        v-if="shareDialog"
        v-model="shareDialog"
        :operationRows="operationRows"
        :againShare="true"
        @submit="pageMdm_share"
      />
    </mti-table>
  </div>
</template>

<script>
import request from '@/utils/request';
import { formatBytes } from '@/utils/tools';
import global_function from 'ctcemti-ui/src/api/gateway/global_function';
import shareFileDialog from '@/components/dataCom/components/shareFileDialog.vue';

export default {
  name: 'sharePage',

  components: {
    shareFileDialog,
  },

  data() {
    return {
      // 列表加载遮罩层
      loading: false,
      // 分页列表参数
      pageDataPO: {},
      // 查询参数
      conPO: {
        filename: null,
      },
      // 表单参数
      dataPO: {},
      imgSuffixList: ['.png', '.jpg', '.jpeg', '.gif'],
      videoSuffixList: ['.ogg', '.mp4', '.webm', 'wav', 'mp3', 'aac'],
      pdfSuffixList: ['.pdf'],
      formatBytes,
      shareDialog: false,
      operationRows: [],
    };
  },

  created() {
    this.pageMdm_share();
  },

  methods: {
    pageMdm_share() {
      this.loading = true;
      this.conPO = this.$table.pager(this.conPO);
      request({
        url: '/mdm/mdm_file_run/myShare',
        method: 'get',
        params: this.conPO,
      }).then((response) => {
        response.rows.forEach((item) => {
          if (item.filesize) {
            item.filesuffix = '.' + item.filename.split('.')[1];
          }
        });

        this.pageDataPO = response;
        this.loading = false;
      });
    },

    /** 表单重置 */
    reset() {
      this.dataPO = {
        filename: null,
      };
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.conPO = this.$table.pager(this.conPO, true);
      this.pageMdm_share();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },

    share(row) {
      this.operationRows = [row];
      this.shareDialog = true;
    },

    copy(row) {
      global_function.copy(location.origin + '/#/share?id=' + row.shareId);
    },

    close(row) {
      this.$confirm('是否确认取消当前文件分享？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(function () {
          return request({
            url: 'mdm/mdm_file_run/delShare',
            method: 'delete',
            params: { ids: row.id },
          });
        })
        .then(() => {
          this.handleQuery();
          this.$modal.msgSuccess('操作成功');
        });
    },
  },
};
</script>

<style lang="scss">
.tableLinkIcon {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  flex-shrink: 0;
}

.share-page-option {
  i {
    margin: 0 5px;
    font-size: 18px;
    cursor: pointer;
  }
}
</style>
