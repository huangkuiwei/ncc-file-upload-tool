<template>
  <div class="app-container">
    <el-form :model="conPO" ref="queryForm" inline class="mti-form-query" @submit.native.prevent>
      <el-row :gutter="10" class="mb8">
        <right-toolbar :show-more="false" :showSearchClear="false" @queryTable="handleQuery">
          <template>
            <el-form-item label="地块：" prop="massif">
              <el-select v-model="conPO.massif" placeholder="请选择地块" clearable @change="handleQuery">
                <el-option v-for="item in massifList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="楼栋：" prop="ban">
              <el-select v-model="conPO.ban" placeholder="请选择楼栋" clearable @change="handleQuery">
                <el-option v-for="item in banList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </template>
        </right-toolbar>
      </el-row>
    </el-form>

    <div class="chart">
      <div class="files-count-box">
        <div>
          <span>总计文件数：</span>
          <span class="num">{{ filesCount }}</span>
        </div>
      </div>

      <div id="chat1"></div>

      <div class="select-time">
        <span>年份：</span>
        <el-date-picker
          v-model="conPO.year"
          type="year"
          placeholder="请选择年份"
          :clearable="false"
          @change="handleQuery"
        />
      </div>

      <div id="chat2"></div>
      <div id="chat3"></div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request';
import * as echarts from 'echarts';

export default {
  name: 'statistical',

  data() {
    return {
      conPO: {
        massif: null,
        ban: null,
        year: new Date(),
      },
      massifList: [],
      banList: [],
      fileCountInfo: [],
      monthCountInfo: {},
    };
  },

  mounted() {
    this.handleQuery();
    this.getMassifList();
  },

  watch: {
    'conPO.massif'(value) {
      this.conPO.ban = null;

      if (value) {
        request({
          url: '/mdm/mdm_file_run/Levelist',
          method: 'get',
          params: {
            id: value,
          },
        }).then((res) => {
          this.banList = res.data;
        });
      }
    },
  },

  computed: {
    filesCount() {
      let count = 0;
      this.fileCountInfo.forEach((item) => {
        count += Number(item.total);
      });

      return count;
    },
  },

  methods: {
    handleQuery() {
      setTimeout(() => {
        this.getFilesCount();
        this.getMonthCount();
      });
    },

    getFilesCount() {
      request({
        method: 'get',
        url: '/mdm/mdm_file_run/getFileCount',
        params: {
          massif: this.conPO.massif,
          ban: this.conPO.ban,
        },
      }).then((res) => {
        this.fileCountInfo = res.data;

        let chartDom = document.getElementById('chat1');
        let myChart = echarts.init(chartDom);
        let option;

        option = {
          title: {},
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            bottom: 'left',
          },
          grid: {
            top: '3%',
            left: '3%',
            right: '3%',
            bottom: '12%',
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
          },
          yAxis: {
            type: 'category',
            data: ['其他', '图片', '文档'],
          },
          series: [
            {
              name: '竣工资料',
              type: 'bar',
              data: this.fileCountInfo.filter((item) => item.filetype === '竣工资料').map((item) => Number(item.total)),
            },
            {
              name: '整治资料',
              type: 'bar',
              data: this.fileCountInfo.filter((item) => item.filetype === '整治资料').map((item) => Number(item.total)),
            },
            {
              name: '物业运维',
              type: 'bar',
              data: this.fileCountInfo.filter((item) => item.filetype === '物业运维').map((item) => Number(item.total)),
            },
          ],
        };

        option && myChart.setOption(option);
      });
    },

    getMonthCount() {
      request({
        method: 'get',
        url: '/mdm/mdm_repair_bill/getMonthCount',
        params: {
          ...this.conPO,
          year: this.conPO.year.getFullYear(),
        },
      }).then((res) => {
        this.monthCountInfo = res.data;

        let chartDom = document.getElementById('chat2');
        let myChart = echarts.init(chartDom);
        let option;

        option = {
          title: {},
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            bottom: 'left',
          },
          grid: {
            top: '3%',
            left: '3%',
            right: '3%',
            bottom: '8%',
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              name: '探槽开挖',
              data: this.monthCountInfo
                .filter((item) => item.repairType === '探槽开挖')
                .map((item) => Number(item.total)),
              type: 'bar',
            },
            {
              name: '墙面加固',
              data: this.monthCountInfo
                .filter((item) => item.repairType === '墙面加固')
                .map((item) => Number(item.total)),
              type: 'bar',
            },
            {
              name: '渗透处理',
              data: this.monthCountInfo
                .filter((item) => item.repairType === '渗透处理')
                .map((item) => Number(item.total)),
              type: 'bar',
            },
            {
              name: '裂缝维修',
              data: this.monthCountInfo
                .filter((item) => item.repairType === '裂缝维修')
                .map((item) => Number(item.total)),
              type: 'bar',
            },
          ],
        };

        option && myChart.setOption(option);

        let chartDom1 = document.getElementById('chat3');
        let myChart1 = echarts.init(chartDom1);
        let option1;

        option1 = {
          title: {},
          tooltip: {
            trigger: 'item',
          },
          legend: {
            bottom: 'left',
          },
          series: [
            {
              name: 'Access From',
              type: 'pie',
              radius: '50%',
              data: [
                {
                  value: this.monthCountInfo
                    .filter((item) => item.repairType === '探槽开挖')
                    .map((item) => Number(item.total))
                    .reduce((x, y) => x + y, 0),
                  name: '探槽开挖',
                },
                {
                  value: this.monthCountInfo
                    .filter((item) => item.repairType === '墙面加固')
                    .map((item) => Number(item.total))
                    .reduce((x, y) => x + y, 0),
                  name: '墙面加固',
                },
                {
                  value: this.monthCountInfo
                    .filter((item) => item.repairType === '渗透处理')
                    .map((item) => Number(item.total))
                    .reduce((x, y) => x + y, 0),
                  name: '渗透处理',
                },
                {
                  value: this.monthCountInfo
                    .filter((item) => item.repairType === '裂缝维修')
                    .map((item) => Number(item.total))
                    .reduce((x, y) => x + y, 0),
                  name: '裂缝维修',
                },
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
        };

        option1 && myChart1.setOption(option1);
      });
    },

    getMassifList() {
      request({
        url: '/mdm/mdm_file_run/Levelist',
        method: 'get',
        params: {
          id: '0',
        },
      }).then((res) => {
        this.massifList = res.data;
      });
    },
  },
};
</script>

<style scoped lang="scss">
.app-container {
  .chart {
    padding: 0 50px;
    display: flex;
    flex-wrap: wrap;

    > div {
      width: 50%;
      flex-grow: 0;
      flex-shrink: 0;
      margin-bottom: 20px;

      &.select-time {
        width: 100%;
        color: #606266;
        font-size: 14px;
        font-weight: 700;
      }
    }

    > .files-count-box {
      display: flex;

      > div {
        padding: 0 100px;
        height: 300px;
        width: 60%;
        border: 1px solid #cccccc;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 22px;
        font-weight: bold;
        color: #333333;

        > span {
          margin: 5px 0;

          &.num {
            font-size: 46px;
          }
        }
      }
    }

    > #chat1 {
      height: 300px;
    }

    > #chat2 {
      height: 350px;
    }

    > #chat3 {
      height: 350px;
    }
  }
}
</style>
