<template>
  <div id="app">
    <router-view />

    <template v-if="showProjectBoard">
      <transition name="fade-transform" mode="out-in">
        <projectBoard v-show="$route.path === '/index'" />
      </transition>
    </template>
  </div>
</template>

<script>
import projectBoard from '@/components/projectBoard.vue';
import { mapState } from 'vuex';
import { defaultWhiteList, routerWhiteList } from '@/router/permission'
import { setToken } from 'ctcemti-ui/src/utils/auth'

const { ipcRenderer } = require('electron');

export default {
  name: 'App',

  components: {
    projectBoard,
  },

  data() {
    return {
      showProjectBoard: false,
      routeRecode: []
    }
  },

  created() {
    ipcRenderer.on('renderer-scheme', (event, args) => {
      console.log('renderer-scheme', args)

      let urls = args.split('/');
      let tokenItem = urls.find(item => item.includes('Admin-Token'));

      if (tokenItem) {
        let tokens = tokenItem.split('=');
        let token = tokens[1];
        setToken(token)

        if (this.$route.path === '/login') {
          this.$router.push('/completionData/index')
        }
      }
    });
  },

  computed: {
    ...mapState('tagsView', ['cachedViews']),
  },

  watch: {
    $route(value) {
      if (defaultWhiteList.concat(routerWhiteList).indexOf(value.path) !== -1) {
        this.showProjectBoard = false;
      } else {
        this.showProjectBoard = true;
      }
    },

    cachedViews(value) {
      if (value.includes('Index') && !this.routeRecode.includes('Index')) {
        this.showProjectBoard = false;

        this.$nextTick(() => {
          this.showProjectBoard = true;
        })
      }

      this.routeRecode = JSON.parse(JSON.stringify(value))
    },
  },

  metaInfo() {
    return {
      title: this.$store.state.settings.dynamicTitle && this.$store.state.settings.title,
      titleTemplate: (title) => {
        return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE;
      },
    };
  },
};
</script>
