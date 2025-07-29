<template>
  <el-row class="app-container">
    <div class="home-model-config">
      <div class="home-model-upload">
        <span class="title">首页模型：</span>

        <template v-if="modelInfo.value">
          <span class="value">{{ modelInfo.value }}</span>
          <el-upload action="/" accept=".bim" :show-file-list="false" :http-request="onUploadChange">
            <el-button type="primary">重新上传</el-button>
          </el-upload>
        </template>

        <template v-else>
          <el-upload action="/" accept=".bim" :show-file-list="false" :http-request="onUploadChange">
            <el-button type="primary">上传</el-button>
          </el-upload>
        </template>
      </div>

      <div class="home-model-scene">
        <span class="title">实景地址：</span>
        <div>
          <div v-for="(item, index) of sceneInfo" :key="index">
            <el-input class="value" v-model="item.value" placeholder="请输入实景地址" />
            <el-button v-if="sceneInfo.length > 1" style="margin-left: 10px" @click="sceneInfo.splice(index, 1)">删除</el-button>
          </div>

          <div style="align-self: flex-end; display: flex; align-items: center">
            <el-button @click="sceneInfo.push({ value: `` })" :loading="loading">新增实景地址</el-button>
            <el-button type="primary" @click="saveScreen" :loading="loading">保存</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-row>
</template>

<script>
import { mapMutations } from 'vuex';
import { delMdm_config_homemodel, pageMdm_config_homemodel, pageMdm_config_Real } from '@/api/mdm/mdm_config_homemodel';

export default {
  name: 'Mdm_config_homemodel',

  data() {
    return {
      submitLoading: false,
      pageDataPO: [],
      loading: false,
      sceneInfo: [],
    };
  },

  watch: {
    pageDataPO() {
      let scene = this.pageDataPO.find((item) => item.code === 'scene')?.value;
      this.sceneInfo = scene?.split(';').map(item => ({ value: item })) || []

      if (!this.sceneInfo.length) {
        this.sceneInfo.push({ value: '' })
      }
    }
  },

  computed: {
    modelInfo() {
      let info = this.pageDataPO.find((item) => item.code === 'model') || {};

      if (info.value) {
        info.value = info.value.slice(info.value.lastIndexOf('/') + 1);
      }

      return info;
    },

    sizeInfo() {
      return this.pageDataPO.find((item) => item.code === 'sizeCode') || {};
    },
  },

  mounted() {
    this.pageMdm_config_homemodel();
    document.addEventListener('uploadLocalRefresh', this.pageMdm_config_homemodel);
  },

  beforeDestroy() {
    document.removeEventListener('uploadLocalRefresh', this.pageMdm_config_homemodel);
  },

  methods: {
    ...mapMutations('mdm', ['SET_SHOW_UPLOADED_BOX', 'EDIT_UPLOAD_FILE']),

    /** 查询首页模型列表 */
    async pageMdm_config_homemodel(event) {
      const loading = this.$loading({
        target: '.app-container',
        lock: true,
        background: 'rgba(255, 255, 255, 0.1)',
      });

      if (event) {
        let { uploadItem, savePathText } = event.detail;

        if (uploadItem.uploadType === 'homeLocal') {
          await pageMdm_config_Real({
            id: this.modelInfo.id,
            value: savePathText,
          });

          await pageMdm_config_Real({
            id: this.sizeInfo.id,
            value: uploadItem.file.size,
          });
        }
      }

      pageMdm_config_homemodel().then((response) => {
        this.pageDataPO = response.data;
        loading.close();
      });
    },

    // 保存实景
    saveScreen() {
      if (!this.sceneInfo.every(item => item.value)) {
        this.$modal.msgError('实景地址不能为空');
        return;
      }

      this.loading = true;

      pageMdm_config_Real({
        id: this.pageDataPO.find((item) => item.code === 'scene').id,
        value: this.sceneInfo.map(item => item.value).join(';'),
      }).then(() => {
        this.$modal.msgSuccess('操作成功');
        this.loading = false;
        this.pageMdm_config_homemodel();
      });
    },

    // 上传
    async onUploadChange(event) {
      const file = event.file;
      const fileAllName = file.name.split('.');
      const currentType = fileAllName[fileAllName.length - 1];

      if (currentType.toLocaleLowerCase() !== 'bim') {
        this.$modal.msgError(`文件格式不正确, 请上传 .bim 格式文件!`);
        return;
      }

      await delMdm_config_homemodel(this.modelInfo.id).catch(() => {});

      this.EDIT_UPLOAD_FILE({
        action: 'add',
        data: {
          uploadType: 'homeLocal',
          id: '',
          taskId: Date.now().toString() + file.uid,
          file: file,
          filename: file.name,
          size: file.size,
          progress: 0, // 0 - 100
          status: 'ready', // ready error success uploading pause
          fileMd5: '',
          checkUploadUrl: '',
          fileUploadUrl: '',
          parts: [],
        },
      });

      setTimeout(() => {
        this.SET_SHOW_UPLOADED_BOX(true);
      });
    },
  },
};
</script>

<style lang="scss">
.home-model-config {
  display: flex;
  flex-direction: column;

  > .home-model-upload {
    margin-bottom: 10px;
    display: flex;
    align-items: center;

    > .title {
      width: 90px;
    }

    > div {
      > .el-input {
        width: 300px;
        margin-bottom: 10px;
      }
    }

    > .value {
      margin-right: 20px;
    }
  }

  > .home-model-scene {
    margin-bottom: 10px;
    display: flex;

    > .title {
      width: 90px;
    }

    > div {
      display: flex;
      flex-direction: column;

      .el-input {
        width: 400px;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
