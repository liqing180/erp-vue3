let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today
/* 
非插件字段
meetingDataSource: 事件的类型， 1 会议 2: 线索  3: 商机的活动
*/
// // 品红色
// #f5276b
// // 绿色
// #4CAF50
// // 紫色
// #673AB7
// // 蓝色
// #2196F3
// // 橙色
// #FF9800
// // 棕色
// #795548
// // 靛蓝色
// #3F51B5
// // 红色
// #F44336
// // 青色
// #00BCD4
// // 深紫色
// #9C27B0
// // 蓝灰色
// #607D8B
// // 深青色
// #009688

export const colors = [
  // '#E8BB1D',
  '#4CAF50',
  '#673AB7',
  '#2196F3',
  '#FF9800',
  '#795548',
  '#3F51B5',
  '#F44336',
  '#00BCD4',
  '#9C27B0',
  '#607D8B',
  '#009688',
  '#f5276b'
]
export const getColors = index => {
  if (index === 0) {
    return '#E8BB1D'
  }
  return colors[(index - 1) % colors.length]
}
export const INITIAL_EVENTS = [
  /* {
    id: createEventId(),
    title: '全天会议',
    start: todayStr,
    allDay: true,
    meetingDataSource: 1,
    backgroundColor: colors[0],
    contentData: {
      title: '全天会议',
      start: todayStr,
      allDay: true,
      meetingDataSource: 1,
      backgroundColor: colors[0]
    }
    // editable: false // 可以拖拽事件
  },
  {
    allDay: false,
    id: createEventId(),
    title: '一个小时的会议',
    // start: todayStr + 'T13:00:00',
    // end: todayStr + 'T13:30:00',
    start: Date.now(),
    end: Date.now() + 1000 * 60 * 60 * 1,
    meetingDataSource: 1,
    backgroundColor: colors[0]
  },
  {
    id: createEventId(),
    title: '全天会议2',
    start: todayStr,
    allDay: true,
    meetingDataSource: 1,
    backgroundColor: colors[3]
    // editable: false // 可以拖拽事件
  },
  {
    allDay: false,
    id: createEventId(),
    title: '一个小时的会议2',
    start: Date.now() + 1000 * 60 * 60 * 1,
    end: Date.now() + 1000 * 60 * 60 * 2,
    meetingDataSource: 1,
    backgroundColor: colors[3]
  } */
]

export function createEventId() {
  return String(eventGuid++)
}
