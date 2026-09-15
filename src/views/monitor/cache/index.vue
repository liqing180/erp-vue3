<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header
            ><Monitor style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">{{
              $t('server.BasicInformation')
            }}</span></template
          >
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.RedisVersion') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.redis_version }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.OperationMode') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{
                        cache.info.redis_mode == 'standalone' ? '单机' : '集群'
                      }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.Port') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.tcp_port }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.NumberofClients') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.connected_clients }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.UptimeDays') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.uptime_in_days }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.UsedMemory') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.used_memory_human }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.CPUUsage') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{
                        parseFloat(cache.info.used_cpu_user_children).toFixed(2)
                      }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      {{ $t('server.MemoryConfiguration') }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.maxmemory_human }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.AOFEnabled') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.aof_enabled == '0' ? '否' : '是' }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.RDBSuccess') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.rdb_last_bgsave_status }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ $t('server.NumberofKeys') }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.dbSize">
                      {{ cache.dbSize }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      {{ $t('server.NetworkInputOutput') }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.instantaneous_input_kbps }}kps/{{
                        cache.info.instantaneous_output_kbps
                      }}kps
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header
            ><PieChart
              style="width: 1em; height: 1em; vertical-align: middle"
            />
            <span style="vertical-align: middle">{{
              $t('server.CommandStatistics')
            }}</span></template
          >
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstats" style="height: 420px" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header
            ><Odometer
              style="width: 1em; height: 1em; vertical-align: middle"
            />
            <span style="vertical-align: middle">{{
              $t('server.MemoryInformation')
            }}</span></template
          >
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="usedmemory" style="height: 420px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Cache">
import { getCache } from '@/api/monitor/cache'
import * as echarts from 'echarts'

const cache = ref([])
const commandstats = ref(null)
const usedmemory = ref(null)
const { proxy } = getCurrentInstance()
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
function getList() {
  // proxy.$modal.loading('正在加载缓存监控数据，请稍候！')
  proxy.$modal.loading()
  getCache().then(response => {
    proxy.$modal.closeLoading()
    cache.value = response.data
    const commandstatsIntance = echarts.init(commandstats.value, 'macarons')
    commandstatsIntance.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {c} ({d}%)'
      },
      series: [
        {
          name: t('server.order'),
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: response.data.commandStats,
          animationEasing: 'cubicInOut',
          animationDuration: 1000
        }
      ]
    })
    const usedmemoryInstance = echarts.init(usedmemory.value, 'macarons')
    usedmemoryInstance.setOption({
      tooltip: {
        formatter: '{b} <br/>{a} : ' + cache.value.info.used_memory_human
      },
      series: [
        {
          name: t('server.Peak'),
          type: 'gauge',
          min: 0,
          max: 1000,
          detail: {
            formatter: cache.value.info.used_memory_human
          },
          data: [
            {
              value: parseFloat(cache.value.info.used_memory_human),
              name: t('server.Memoryconsumption')
            }
          ]
        }
      ]
    })
    window.addEventListener('resize', () => {
      commandstatsIntance.resize()
      usedmemoryInstance.resize()
    })
  })
}

getList()
</script>
