<template>
  <el-dialog
    v-dialogDrag
    class="share-file-dialog"
    title="文件分享"
    :visible="value"
    @update:visible="$emit('input', $event)"
    width="550px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="modelState" :rules="rules" label-width="160px">
      <el-form-item label="分享文件/文件夹：">
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

      <el-form-item label="有效期：" prop="day">
        <el-select
          v-model="modelState.day"
          placeholder="请关联地块"
          :disabled="modelState.isAddMassifBan"
          class="fill-width"
        >
          <el-option label="1天" :value="1" />
          <el-option label="7天" :value="7" />
          <el-option label="30天" :value="30" />
          <el-option label="永久有效" :value="undefined" />
        </el-select>
      </el-form-item>

      <el-form-item label="文件链接：" v-if="step === 2">
        <el-input v-model="shareLink" disabled />
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button @click="$emit('input', false)">取 消</el-button>
      <el-button v-if="step === 1" type="primary" :loading="submitLoading" @click="submit">确 定</el-button>
      <el-button v-if="step === 2" type="primary" @click="copyLink">复制链接</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request';
import global_function from 'ctcemti-ui/src/api/gateway/global_function';

export default {
  name: 'shareFileDialog',

  props: {
    value: {
      type: Boolean,
      default: false,
    },

    operationRows: {
      type: Array,
      default: () => [],
    },

    againShare: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      modelState: {
        day: 7,
      },
      rules: {},
      submitLoading: false,
      step: 1,
      shareLink: '',
    };
  },

  methods: {
    submit() {
      this.submitLoading = true;

      let url = '';
      let params = {};

      if (this.againShare) {
        url = '/mdm/mdm_file_run/againShare';
        params = {
          ...this.modelState,
          shareId: this.operationRows.map((item) => item.shareId).join('.'),
        };
      } else {
        url = '/mdm/mdm_file_run/share';
        params = {
          ...this.modelState,
          fileId: this.operationRows.map((item) => item.id),
        };
      }

      request({
        url,
        method: 'post',
        data: params,
      })
        .then((response) => {
          this.$modal.msgSuccess('操作成功');
          this.submitLoading = false;

          this.step = 2;

          if (this.againShare) {
            this.shareLink = location.origin + '/#/share?id=' + this.operationRows[0].shareId;
            this.$emit('submit');
          } else {
            this.shareLink = location.origin + '/#/share?id=' + response.data;
          }
        })
        .catch(() => {
          this.submitLoading = false;
        });
    },

    copyLink() {
      global_function.copy(this.shareLink);
    },
  },
};
</script>

<style lang="scss">
.share-file-dialog {
}
</style>
