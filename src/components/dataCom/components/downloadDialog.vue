<template>
  <el-dialog
    v-dialogDrag
    class="download-dialog"
    title="文件下载"
    :visible="value"
    @update:visible="$emit('input', $event)"
    width="600px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="form" label-width="140px">
      <el-form-item label="下载文件/文件夹：">
        <template v-if="operationRows.length === 1">
          <span style="color: #5774ff">{{ operationRows[0].filename }}</span>
        </template>

        <template v-else>
          <span style="color: #5774ff">{{ operationRows[0].filename }}</span>
          等
          <span style="color: #5774ff">（{{ operationRows.length }}）</span>
          个文件/文件夹
        </template>
      </el-form-item>

      <el-form-item label="文件大小：">
        共 <span style="color: #5774ff">{{ selectFileSize }}</span>
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button @click="$emit('input', false)">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { formatBytes } from '@/utils/tools';
import request from '@/utils/request';

export default {
  name: 'downloadDialog',

  props: {
    value: {
      type: Boolean,
      default: false,
    },

    operationRows: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      selectFileSize: null,
    };
  },

  watch: {
    operationRows: {
      async handler(newValue) {
        let res = await request({
          url: '/mdm/mdm_file_run/getFilesize',
          method: 'get',
          params: {
            id: newValue.map((item) => item.id).join(','),
          },
        });

        this.selectFileSize = formatBytes(res.data || 0);
      },
      immediate: true,
    },
  },

  methods: {
    submit() {
      this.$emit('downloadSubmit');
    },
  },
};
</script>

<style lang="scss">
.download-dialog {
}
</style>
