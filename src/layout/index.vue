<template>
  <div>
    <!--
    <mti-layout
      :subDataScopeSwitch="false"  // 是否打开子数据权限切换,默认否
      :dataScopeSwitch="false"  // 是否打开数据权限切换,默认是
      :search="false"  // 是否打开菜单功能搜索,默认是
      :sizeSelect="false"  // 是否打开布局尺寸切换,默认是
      :screenFull="false"  // 是否打开全屏切换,默认是
    >
       // 此处插槽，可增加其他组件
    </mti-layout>
-->

    <mti-layout :search="false" :sizeSelect="false" :screenFull="false" :messageCount="false">
      <div slot="logo" class="logo-wrapper" style="display: flex;align-items: center">
        <img src="@/assets/images/ncc.png" style="width: 50px;height: 50px" alt="">
        <span style="font-weight: bold;color:#fff;font-size: 20px;margin-left: 10px">NCC项目管理平台</span>
      </div>

      <!--<div class="share-btn">-->
      <!--  <i class="el-icon el-icon-share" @click="jumpShare"></i>-->
      <!--</div>-->

      <UploadListPopover />
    </mti-layout>
  </div>
</template>

<script>
import MtiLayout from 'ctcemti-ui/src/layout/index';
import UploadListPopover from '@/components/UploadListPopover.vue';
export default {
  name: 'Layout',
  components: {
    MtiLayout,
    UploadListPopover,
  },
  data() {
    return {};
  },
  created() {},
  methods: {
    jumpShare() {
      this.$router.push({ path: `/share/page` });
    },
  },
};
</script>

<style scoped lang="scss">
.share-btn {
  display: flex;
  align-content: center;
  justify-content: center;

  i {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 26px;
    margin-right: 10px;
    cursor: pointer;
  }
}
</style>
