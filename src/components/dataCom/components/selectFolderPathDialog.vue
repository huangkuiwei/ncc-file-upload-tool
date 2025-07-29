<template>
  <el-dialog
    v-dialogDrag
    class="select-folder-path-dialog"
    title="选择存储路径"
    :visible="value"
    @update:visible="$emit('input', $event)"
    width="500px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-tree
      style="height: 100%; overflow: auto"
      :expand-on-click-node="true"
      :props="props"
      :load="loadNode"
      lazy
      highlight-current
      ref="treeRef"
    >
      <template slot-scope="{ node, data }">
        <span class="tree-content" @click="getFolderDetail(data, node)">
          {{ data.filename }}
        </span>
      </template>
    </el-tree>

    <div slot="footer">
      <el-button @click="$emit('input', false)">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'selectFolderPathDialog',

  props: {
    value: {
      type: Boolean,
      default: false,
    },

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

  methods: {
    async loadNode(node, resolve) {
      let res = await this.getTreeData((node.data && node.data.id) || '0');

      if (node.level === 0) {
        this.folderPath = res.data;
      }

      return resolve(res.data);
    },

    getTreeData(id) {
      return request({
        url: `/mdm/mdm_file_run/list`,
        method: 'get',
        params: {
          id: id,
          filetype: this.fileType,
        },
      });
    },

    getFolderDetail(data, node) {
      this.folderPath = [];
      this.setFolderPath(node);
    },

    setFolderPath(obj) {
      if (obj.data) {
        this.folderPath = [obj.data, ...this.folderPath];
      }

      if (obj.parent && obj.parent.data) {
        this.setFolderPath(obj.parent);
      }
    },

    submit() {
      this.$emit('selectFolderPathSubmit', this.folderPath);
      this.$emit('input', false);
    },
  },
};
</script>

<style lang="scss">
.select-folder-path-dialog {
  .el-dialog__body {
    height: 50vh;
    overflow: auto;

    .tree-content {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      height: 100%;
      display: flex;
      align-items: center;
    }
  }
}
</style>
