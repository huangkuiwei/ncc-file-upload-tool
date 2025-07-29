<template>
  <div class="project-board">
    <div class="left-board">
      <el-tree
        style="height: 100%; overflow: auto"
        :expand-on-click-node="false"
        :props="props"
        :load="loadNode"
        lazy
        highlight-current
      >
        <template slot-scope="{ node, data }">
          <span class="tree-content" @click="currentChange(data, node)">
            {{ data.name }}
          </span>
        </template>
      </el-tree>
    </div>

    <div class="model-view">
      <iframe v-if="modelUrl" ref="modelIframe" :src="modelUrl" @load="onLoad" @error="loading && loading.close()" />
      <!--<iframe v-if="modelUrl" ref="modelIframe" :src="''" @load="onLoad" @error="loading && loading.close()" />-->
    </div>

    <div class="right-board" style="height: 100%; overflow: auto">
      <template v-if="lazy">
        <el-tree
          key="lazyTreeKey"
          :expand-on-click-node="false"
          :props="props1"
          :load="(...arg) => loadNodeRight(...arg, 0)"
          lazy
          highlight-current
          empty-text=""
        >
          <template slot-scope="{ node, data }">
            <span class="tree-content" @click="getFolderDetail(data, node)">
              {{ data.nodeName }}
            </span>
          </template>
        </el-tree>
      </template>

      <template v-else>
        <el-tree
          key="noLazyTreeKey"
          :data="rightTreeData"
          :expand-on-click-node="false"
          :props="props1"
          highlight-current
          empty-text=""
        >
          <template slot-scope="{ node, data }">
            <span class="tree-content" @click="getFolderDetail(data, node)">
              {{ data.nodeName }}
            </span>
          </template>
        </el-tree>
      </template>

      <el-tree
        :expand-on-click-node="false"
        :props="props1"
        :load="(...arg) => loadNodeRight(...arg, 1)"
        lazy
        highlight-current
        empty-text=""
      >
        <template slot-scope="{ node, data }">
          <span class="tree-content" @click="getFolderDetail(data, node)">
            {{ data.nodeName }}
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request';
import { pageMdm_config_homemodel } from '@/api/mdm/mdm_config_homemodel';
import { formatBytes, modelIframePostMes } from '@/utils/tools';
import { DateUtil } from 'ctcemti-ui/src/utils/base/DateUtil';

export default {
  name: 'projectBoardIndex',

  data() {
    return {
      props: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf',
      },
      props1: {
        label: 'nodeName',
        children: 'children',
        isLeaf: 'leaf',
      },
      initData: [
        {
          name: 'NCC项目看板',
        },
      ],
      pageDataPO: {},
      modelBaseUrl: process.env.VUE_APP_MODEL_BASE_URL,
      modelUrl: '',
      bimPath: '',
      fileSize: '',
      realityUrl: '',
      loading: null,
      imgSuffixList: ['.png', '.jpg', '.jpeg', '.gif'],
      videoSuffixList: ['.ogg', '.mp4', '.webm', 'wav', 'mp3', 'aac'],
      pdfSuffixList: ['.pdf'],
      folderPath: [],
      lazy: false,
      rightTreeData: [],
      massif: null,
      ban: null,
      isHomeModel: true,
      customViewData: null,
      modelList: [],
    };
  },

  created() {
    this.pageMdm_config_homemodel();
    window.addEventListener('message', this.messageCallback);

    if (this.$route.path === '/index') {
      this.loading = this.$loading({
        target: '.project-board',
        lock: true,
        body: true,
        background: 'rgba(255, 255, 255, 0.2)',
        text: '数据加载中...',
      });
    }
  },

  beforeDestroy() {
    window.removeEventListener('message', this.messageCallback);
  },

  methods: {
    async messageCallback(messageRes) {
      if (messageRes.data.command == 'addNewView') {
        request({
          url: `/mdm/mdm_config_view`,
          method: 'post',
          data: {
            name: messageRes.data.data.name,
            jsonTxt: messageRes.data.data.jsonTxt,
          },
        });
      } else if (messageRes.data.command == 'deleteNewView') {
        request({
          url: `/mdm/mdm_config_view`,
          method: 'delete',
          params: {
            name: messageRes.data.data,
          },
        });
      } else if (messageRes.data.command == 'ImodelClose') {
        if (!this.isHomeModel) {
          this.bimPath = this.bimPathBak;
          let homeModelUrl = this.modelUrl;
          this.modelUrl = '';
          await this.$nextTick();
          this.modelUrl = homeModelUrl;
          this.isHomeModel = true;
        }
      } else if (messageRes.data.cmd == 'onloadImodel') {
        if (this.customViewData) {
          setTimeout(() => {
            modelIframePostMes(this.$refs.modelIframe.contentWindow, 'showCustomView', this.customViewData);
            this.customViewData = null;
          }, 3000);
        }
      } else if (messageRes.data.command == 'clickLabel') {
        let name = messageRes.data.data;
        let data = this.modelList.find((item) => item.name.split('#')[0] === name.split('-')[1]);

        // TODO 测试用
        // data.filepath = "D:\\Ncc文件\\17d0ef4b-b8ed-6284-da3a-c5c30e742641\\8区_3栋.rvt.bim"

        if (data?.dataType === '模型' && data?.filepath) {
          if (this.modelBaseUrl) {
            let urls = decodeURIComponent(data.filepath.replace(/\\/g, '/')).split('/');
            this.bimPath = data.filepath;

            let sendData = {
              fileOriginalUrl: process.env.VUE_APP_BASE_API,
              fileName: urls[urls.length - 1],
              bimPath: this.bimPath,
              filePath: this.bimPath,
              fileSuffix: '.bim',
              fileType: '2',
              fileSize: formatBytes(Number(this.fileSize)),
            };

            modelIframePostMes(this.$refs.modelIframe.contentWindow, 'changeModel', sendData);
            modelIframePostMes(this.$refs.modelIframe.contentWindow, 'CurrentFile', sendData);
            modelIframePostMes(this.$refs.modelIframe.contentWindow, 'showBackBtn', null);
          } else {
            this.modelUrl = this.modelBaseUrl + '/?' + encodeURIComponent(data.filepath.replace(/\\/g, '/'));
            this.bimPath = data.filepath;
          }

          this.isHomeModel = false;
        }
      }
    },

    /** 查询首页模型列表 */
    pageMdm_config_homemodel() {
      pageMdm_config_homemodel().then((response) => {
        this.pageDataPO = response.data;

        let modelInfo = this.pageDataPO.find((item) => item.code === 'model') || {};
        let realityInfo = this.pageDataPO.find((item) => item.code === 'scene') || {};
        let sizeInfo = this.pageDataPO.find((item) => item.code === 'sizeCode') || {};

        if (modelInfo) {
          this.modelUrl = this.modelBaseUrl + '/?' + encodeURIComponent(modelInfo.value.replace(/\\/g, '/'));
          this.bimPath = modelInfo.value;
          this.fileSize = sizeInfo.value;
          this.homeModelUrl = this.modelUrl;
          this.bimPathBak = modelInfo.value;
        }

        if (realityInfo) {
          this.realityUrl = realityInfo.value;
        }
      });
    },

    getData(id) {
      return request({
        url: `/mdm/mdm_config/list?id=${id || ''}`,
        method: 'get',
      });
    },

    async loadNode(node, resolve) {
      if (node.level === 0) {
        this.$nextTick(() => {
          let nodeData = node.childNodes[0];
          nodeData.expanded = true;
          nodeData.loadData();
        });

        return resolve(this.initData);
      } else if (node.level === 1) {
        let res = await this.getData();

        this.$nextTick(() => {
          let nodeData = node.childNodes.find((item) => item.data.name === 'NCC一期');
          nodeData.expanded = true;
          nodeData.loadData();
        });

        resolve(res.data);
      } else {
        if (node.data.id !== undefined) {
          let res = await this.getData(node.data.id);
          resolve(res.data);
        } else {
          resolve([]);
        }
      }
    },

    async currentChange(data, node) {
      if (data.name === 'NCC项目看板') {
        if (!this.isHomeModel) {
          this.bimPath = this.bimPathBak;
          let homeModelUrl = this.modelUrl;
          this.modelUrl = '';
          await this.$nextTick();
          this.modelUrl = homeModelUrl;
          this.isHomeModel = true;
          return;
        }
      }

      if (data.dataType === '模型' && data.filepath) {
        if (this.modelBaseUrl) {
          let urls = decodeURIComponent(data.filepath.replace(/\\/g, '/')).split('/');
          this.bimPath = data.filepath;

          let sendData = {
            fileOriginalUrl: process.env.VUE_APP_BASE_API,
            fileName: urls[urls.length - 1],
            bimPath: this.bimPath,
            filePath: this.bimPath,
            fileSuffix: '.bim',
            fileType: '2',
            fileSize: formatBytes(Number(this.fileSize)),
          };

          modelIframePostMes(this.$refs.modelIframe.contentWindow, 'changeModel', sendData);
          modelIframePostMes(this.$refs.modelIframe.contentWindow, 'CurrentFile', sendData);
          modelIframePostMes(this.$refs.modelIframe.contentWindow, 'showBackBtn', null);
        } else {
          this.modelUrl = this.modelBaseUrl + '/?' + encodeURIComponent(data.filepath.replace(/\\/g, '/'));
          this.bimPath = data.filepath;
        }

        this.isHomeModel = false;
      } else if (data.dataType === '视图') {
        if (!this.isHomeModel) {
          this.bimPath = this.bimPathBak;

          request({
            url: '/mdm/mdm_config_view/view',
            method: 'get',
            params: {
              id: data.id,
            },
          })
            .then(async (res) => {
              if (res.data) {
                this.customViewData = {
                  view: JSON.stringify([JSON.parse(res.data)]),
                  name: data.name,
                };

                let res1 = await this.getData(data.id);
                this.modelList = res1.data;
              }
            })
            .finally(async () => {
              this.modelUrl = '';
              await this.$nextTick();
              this.modelUrl = this.homeModelUrl;
              this.isHomeModel = true;
            });
        } else {
          request({
            url: '/mdm/mdm_config_view/view',
            method: 'get',
            params: {
              id: data.id,
            },
          }).then(async (res) => {
            if (res.data) {
              modelIframePostMes(this.$refs.modelIframe.contentWindow, 'showCustomView', {
                view: JSON.stringify([JSON.parse(res.data)]),
                name: data.name,
              });

              let res1 = await this.getData(data.id);
              this.modelList = res1.data;
            }
          });
        }
      }

      // 点击根节点
      if (node.level === 1) {
        this.lazy = false;
        this.rightTreeData = [];

        modelIframePostMes(this.$refs.modelIframe.contentWindow, 'ModelReduction');
        modelIframePostMes(this.$refs.modelIframe.contentWindow, 'showLabelsByNames', {
          names: ['1号地块', '2号地块', '2号补偿地块', '3号地块'],
        });
      }

      if (node.level === 2) {
        modelIframePostMes(this.$refs.modelIframe.contentWindow, 'showCustomViewByName', {
          name: data.name,
        });
      }

      if (node.level === 2) {
        this.rightTreeData = [];
        this.lazy = false;
      }

      // 点击地块/楼栋
      if (node.level === 3 || node.level === 4) {
        if (node.level === 3) {
          this.massif = node.data.id;
          this.ban = null;
        } else if (node.level === 3) {
          this.massif = node.parent.data.id;
          this.ban = node.data.id;
        }

        request({
          url: '/mdm/mdm_config_homemodel/rightList',
          method: 'get',
          params: {
            massif: this.massif,
            ban: this.ban,
          },
        }).then((res) => {
          res.data = res.data.filter((item) => item.id !== 'repairData' && item.id !== 'surveyData');

          this.rightTreeData = this.handleTree(res.data, 'id', 'parentId');
          this.lazy = false;
        });
      }

      // 住户
      if (node.level === 5) {
        modelIframePostMes(this.$refs.modelIframe.contentWindow, 'showZhuhuCom', data);
      }
    },

    async loadNodeRight(node, resolve, type) {
      let res = await request({
        url: '/mdm/mdm_config_homemodel/rightList',
        method: 'get',
        params: {
          id: node.data && node.data.id,
          nodeType: node.data && node.data.nodeType,
          monitorName: node.data && node.data.nodeType === 'alarmLevelData' ? node.parent.data.id : undefined,
          monitorType: node.data && node.data.nodeType === 'monitorStatusData' ? node.parent.data.id : undefined,
        },
      });

      res.data.forEach((item) => {
        if (
          item.fileSuffix ||
          item.repairType ||
          (node.data && node.data.nodeType === 'alarmLevelData') ||
          (node.data && node.data.nodeType === 'monitorStatusData')
        ) {
          item.leaf = true;
        }

        item.nodeName = item.nodeName || item.mainName || item.name || item.dit;
      });

      if (node.level === 0) {
        if (type === 0) {
          resolve(res.data.filter((item) => item.id !== 'repairData' && item.id !== 'surveyData'));
        } else {
          resolve(res.data.filter((item) => item.id === 'repairData' || item.id === 'surveyData'));
        }
      } else {
        if (type === 0) {
          resolve(res.data);
        } else {
          if (
            node.data.id === 'repairData' ||
            node.data.nodeType === 'monitorData' ||
            node.data.nodeType === 'monitorSubsideData' ||
            node.data.nodeType === 'monitorWaterData'
          ) {
            res.data.forEach((item) => {
              item.leaf = true;
            });
          }

          resolve(res.data);
        }
      }
    },

    getFolderDetail(data, node) {
      this.folderPath = [];
      this.setFolderPath(node);

      if (
        this.folderPath[0].nodeName === '竣工资料' ||
        this.folderPath[0].nodeName === '整治资料' ||
        this.folderPath[0].nodeName === '物业运维'
      ) {
        if (data?.fileSuffix) {
          let previewSuffixList = this.imgSuffixList.concat(this.videoSuffixList, this.pdfSuffixList);

          if (previewSuffixList.includes(data.fileSuffix?.toLowerCase())) {
            request({
              url: '/mdm/mdm_file_run/preview',
              method: 'get',
              params: {
                fileId: data.id,
              },
            }).then((res) => {
              let url = res.data;
              window.open(url);
            });
          } else {
            this.$message.info('该格式文件不支持在线预览');
          }

          localStorage.setItem('folderPath', JSON.stringify(this.folderPath.slice(0, -1)));
        } else {
          localStorage.setItem('folderPath', JSON.stringify(this.folderPath));
        }

        if (this.folderPath[0].nodeName === '竣工资料') {
          this.$router.push('/completionData/index');
        } else if (this.folderPath[0].nodeName === '整治资料') {
          this.$router.push('/repair/data');
        } else if (this.folderPath[0].nodeName === '物业运维') {
          this.$router.push('/propertyOperation');
        }
      } else if (this.folderPath[0].nodeName === '楼栋整治') {
        if (node.level === 2) {
          this.getHighLightData(node).then((res) => {
            modelIframePostMes(this.$refs.modelIframe.contentWindow, 'nccLDZZ', res.data);
          });
        }
      } else if (this.folderPath[1].nodeName === '电子监测') {
        if (node.level === 4) {
          this.getHighLightData(node).then((res) => {
            res.data.forEach((item) => {
              item.lastCollectingTime = DateUtil.format(item.lastCollectingTime, 'yyyy-MM-dd HH:mm:ss');
            });

            modelIframePostMes(this.$refs.modelIframe.contentWindow, 'nccDZJC', res.data);
          });
        }
      } else if (this.folderPath[1].nodeName === '人工监测') {
        if (node.level === 4) {
          this.getHighLightData(node).then((res) => {
            modelIframePostMes(this.$refs.modelIframe.contentWindow, 'nccDZJC', res.data);
          });
        }
      }
    },

    getHighLightData(node) {
      return request({
        url: '/mdm/mdm_config_homemodel/rightList',
        method: 'get',
        params: {
          id: node.data && node.data.id,
          nodeType: node.data && node.data.nodeType,
          monitorName: node.data && node.data.nodeType === 'alarmLevelData' ? node.parent.data.id : undefined,
          monitorType:
            node.data && (node.data.nodeType === 'monitorStatusData' || node.data.nodeType === 'monitorWaterStatusData')
              ? node.parent.data.id
              : undefined,
        },
      });
    },

    setFolderPath(obj) {
      if (obj.data && !Array.isArray(obj.data)) {
        this.folderPath = [obj.data, ...this.folderPath];
      }

      if (obj.parent && obj.parent.data) {
        this.setFolderPath(obj.parent);
      }
    },

    onLoad() {
      modelIframePostMes(this.$refs.modelIframe.contentWindow, 'szbReadonly', null);
      modelIframePostMes(this.$refs.modelIframe.contentWindow, 'hideBackBtn', null);

      let urls = decodeURIComponent(this.modelUrl).split('/');

      modelIframePostMes(this.$refs.modelIframe.contentWindow, 'CurrentFile', {
        fileOriginalUrl: process.env.VUE_APP_BASE_API,
        fileName: urls[urls.length - 1],
        bimPath: this.bimPath,
        filePath: this.bimPath,
        fileSuffix: '.bim',
        fileType: '2',
        fileSize: formatBytes(Number(this.fileSize)),
      });

      modelIframePostMes(this.$refs.modelIframe.contentWindow, 'bwVersionName', {
        bwVersionName: 'ncc',
      });

      setTimeout(() => {
        modelIframePostMes(this.$refs.modelIframe.contentWindow, 'addReality', {
          url: this.realityUrl,
        });
      }, 1000);

      this.loading && this.loading.close();
    },
  },
};
</script>

<style scoped lang="scss">
.project-board {
  position: fixed;
  background: #ffffff;
  padding: 10px;
  left: 217px;
  right: 10px;
  top: 110px;
  bottom: 10px;
  z-index: 1;
  display: flex;

  .left-board {
    width: 180px;

    .tree-content {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      height: 100%;
      line-height: 26px;
    }
  }

  .right-board {
    padding-left: 10px;
    width: 240px;
    font-size: 14px;

    .tree-content {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      height: 100%;
      line-height: 26px;
    }

    ::v-deep .el-tree__empty-block {
      display: none;
    }
  }

  .model-view {
    flex-grow: 1;
    position: relative;

    > iframe {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}
</style>
