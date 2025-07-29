<template>
  <div class="folder-tree">
    <el-tree
      ref="treeRef"
      style="height: 100%; overflow: auto"
      :expand-on-click-node="false"
      :props="props"
      :load="loadNode"
      node-key="id"
      lazy
      highlight-current
    >
      <template slot-scope="{ node, data }">
        <span class="tree-content" @click="getFolderDetail(data, node)">
          {{ data.filename }}
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'folderTree',

  props: {
    fileType: {
      type: String,
    },
  },

  data() {
    return {
      props: {
        label: 'filename',
        children: 'children',
        isLeaf: 'isLeaf',
      },

      folderPath: [],
    };
  },

  created() {
    document.addEventListener('uploadOSSRefresh', this.uploadOSSRefresh);
  },

  beforeDestroy() {
    document.removeEventListener('uploadOSSRefresh', this.uploadOSSRefresh);
  },

  methods: {
    uploadOSSRefresh(event) {
      let { parentId } = event.detail;
      this.refreshTreeNode(parentId);
    },

    async loadNode(node, resolve) {
      let res = await this.getData((node.data && node.data.id) || '0');

      if (node.level === 0) {
        this.folderPath = res.data;
        this.$emit('showFolderDetail', this.folderPath, true);
      }

      return resolve(res.data);
    },

    getData(id) {
      return request({
        url: `/mdm/mdm_file_run/list`,
        method: 'get',
        params: {
          id: id,
          filetype: this.fileType,
        },
      });
    },

    refreshTreeNode(parentId) {
      let node = this.$refs.treeRef.getNode(parentId);

      if (node) {
        node.loaded = false;
        node.expand(); // 主动调用展开节点方法，重新查询该节点下的所有子节点
      }
    },

    getFolderDetail(data, node) {
      this.folderPath = [];
      this.setFolderPath(node);

      this.$emit('showFolderDetail', this.folderPath);
    },

    setFolderPath(obj) {
      if (obj.data) {
        this.folderPath = [obj.data, ...this.folderPath];
      }

      if (obj.parent && obj.parent.data) {
        this.setFolderPath(obj.parent);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.folder-tree {
  height: 100%;
  overflow: hidden;

  .tree-content {
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
  }
}
</style>
