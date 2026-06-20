export default defineAppConfig({
  pages: [
    'pages/risk/index',
    'pages/order/index',
    'pages/rectify/index',
    'pages/order-detail/index',
    'pages/rectify-submit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '高支模监测',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/risk/index',
        text: '风险提醒'
      },
      {
        pagePath: 'pages/order/index',
        text: '停浇指令'
      },
      {
        pagePath: 'pages/rectify/index',
        text: '整改反馈'
      }
    ]
  }
})
