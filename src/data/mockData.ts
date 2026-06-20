import { ConstructionSection, PourOrder, RectifyItem } from '@/types';

export const mockSection: ConstructionSection = {
  id: 'sec-001',
  name: '地下一层A区顶板',
  level: 'warning',
  levelText: '预警',
  isWorkAllowed: true,
  workStatusText: '允许作业 注意风险',
  abnormalCount: 3,
  warningCount: 2,
  updateTime: '2024-01-15 22:30',
  measurePoints: [
    {
      id: 'mp-001',
      name: 'A-12号立杆',
      type: 'settlement',
      typeLabel: '沉降',
      value: 8.5,
      unit: 'mm',
      threshold: 10,
      level: 'warning',
      location: 'A区中部',
      updateTime: '2024-01-15 22:28',
      suggestion: '沉降接近预警值，建议暂停该区域浇筑，检查立杆底座和垫板是否松动，必要时加固剪刀撑',
      relatedOrderIds: ['order-001'],
      relatedRectifyIds: ['rect-001']
    },
    {
      id: 'mp-002',
      name: 'B-05号模板',
      type: 'inclination',
      typeLabel: '倾角',
      value: 2.1,
      unit: '°',
      threshold: 3,
      level: 'warning',
      location: 'B区北侧',
      updateTime: '2024-01-15 22:25',
      suggestion: '倾角变化过快，建议检查支撑体系是否到位，暂停振捣作业，检查顶托是否松动',
      relatedOrderIds: ['order-001'],
      relatedRectifyIds: ['rect-004']
    },
    {
      id: 'mp-003',
      name: 'C-08号立杆',
      type: 'axial_force',
      typeLabel: '轴力',
      value: 45.2,
      unit: 'kN',
      threshold: 50,
      level: 'warning',
      location: 'C区东侧',
      updateTime: '2024-01-15 22:20',
      suggestion: '轴力接近限值，建议检查该区域堆载是否超标，减少一次性浇筑厚度',
      relatedOrderIds: ['order-001'],
      relatedRectifyIds: []
    },
    {
      id: 'mp-004',
      name: 'A-05号立杆',
      type: 'settlement',
      typeLabel: '沉降',
      value: 3.2,
      unit: 'mm',
      threshold: 10,
      level: 'safe',
      location: 'A区西侧',
      updateTime: '2024-01-15 22:30',
      suggestion: '',
      relatedOrderIds: [],
      relatedRectifyIds: []
    },
    {
      id: 'mp-005',
      name: 'B-10号模板',
      type: 'inclination',
      typeLabel: '倾角',
      value: 0.8,
      unit: '°',
      threshold: 3,
      level: 'safe',
      location: 'B区中部',
      updateTime: '2024-01-15 22:29',
      suggestion: '',
      relatedOrderIds: [],
      relatedRectifyIds: []
    }
  ],
  forbiddenAreas: [
    {
      id: 'fa-001',
      name: 'A-12立杆周边3米范围',
      reason: '沉降接近预警值，人员禁止长时间停留'
    },
    {
      id: 'fa-002',
      name: 'B-05模板下方区域',
      reason: '倾角变化较快，暂停该区域振捣作业'
    }
  ]
};

export const mockSections: ConstructionSection[] = [
  mockSection,
  {
    id: 'sec-002',
    name: '地下一层B区顶板',
    level: 'safe',
    levelText: '正常',
    isWorkAllowed: true,
    workStatusText: '允许正常作业',
    abnormalCount: 0,
    warningCount: 0,
    updateTime: '2024-01-15 22:30',
    measurePoints: [
      {
        id: 'mp-006',
        name: 'B-01号立杆',
        type: 'settlement',
        typeLabel: '沉降',
        value: 2.1,
        unit: 'mm',
        threshold: 10,
        level: 'safe',
        location: 'B区西侧',
        updateTime: '2024-01-15 22:28',
        suggestion: '',
        relatedOrderIds: [],
        relatedRectifyIds: []
      }
    ],
    forbiddenAreas: []
  },
  {
    id: 'sec-003',
    name: '二层C区梁板',
    level: 'danger',
    levelText: '危险',
    isWorkAllowed: false,
    workStatusText: '禁止作业 立即撤离',
    abnormalCount: 5,
    warningCount: 3,
    updateTime: '2024-01-15 22:15',
    measurePoints: [],
    forbiddenAreas: [
      {
        id: 'fa-003',
        name: 'C区全部区域',
        reason: '多个测点超预警值，全部人员撤离'
      }
    ]
  }
];

export const mockOrders: PourOrder[] = [
  {
    id: 'order-001',
    type: 'stop_pouring',
    typeLabel: '停浇指令',
    title: 'A区立即停止浇筑',
    sectionName: '地下一层A区',
    reason: 'A-12立杆沉降接近预警值',
    detailReason: 'A-12号立杆沉降值已达8.5mm，接近10mm预警值，且沉降速率有加快趋势。B-05号模板倾角变化过快，2小时内变化0.5°。为确保施工安全，项目部决定暂停A区混凝土浇筑作业，待加固处理并经监测确认安全后方可恢复。',
    publishTime: '2024-01-15 22:10',
    publisher: '张工（安全总监）',
    status: 'pending',
    signRecords: [],
    affectedPoints: ['A-12号立杆', 'B-05号模板', 'C-08号立杆']
  },
  {
    id: 'order-002',
    type: 'slow_pouring',
    typeLabel: '限速指令',
    title: 'B区降低浇筑速度',
    sectionName: '地下一层B区',
    reason: '模板荷载增长过快',
    detailReason: 'B区浇筑速度过快，模板体系荷载增长速率超过设计允许值，需减慢浇筑速度，控制每小时浇筑方量不超过15立方，确保模板体系有足够时间适应荷载变化。',
    publishTime: '2024-01-15 20:30',
    publisher: '李工（技术负责人）',
    status: 'confirmed',
    signRecords: [
      {
        id: 'sign-001',
        confirmerName: '王班长',
        confirmerRole: '架子工班组长',
        confirmTime: '2024-01-15 20:35'
      },
      {
        id: 'sign-002',
        confirmerName: '赵班长',
        confirmerRole: '混凝土班组长',
        confirmTime: '2024-01-15 20:37'
      }
    ],
    affectedPoints: ['B-05号模板', 'B-10号模板']
  },
  {
    id: 'order-003',
    type: 'stop_pouring',
    typeLabel: '停浇指令',
    title: 'C区全面停止作业',
    sectionName: '二层C区',
    reason: '多个测点超预警值',
    detailReason: 'C区有5个监测点超过预警值，其中3个点超过危险值，模板体系存在较大安全风险，立即停止所有作业，人员全部撤离至安全区域。',
    publishTime: '2024-01-15 21:45',
    publisher: '张工（安全总监）',
    status: 'confirmed',
    signRecords: [
      {
        id: 'sign-003',
        confirmerName: '赵班长',
        confirmerRole: '架子工班组长',
        confirmTime: '2024-01-15 21:48'
      }
    ],
    affectedPoints: ['C-01立杆', 'C-03立杆', 'C-07模板', 'C-09模板', 'C-11立杆']
  }
];

export const mockRectifyList: RectifyItem[] = [
  {
    id: 'rect-001',
    title: 'A-12立杆加固',
    sectionName: '地下一层A区',
    issueDesc: '立杆沉降接近预警值，需加固剪刀撑',
    deadline: '2024-01-16 08:00',
    status: 'pending',
    statusText: '待整改',
    type: 'scissors_brace',
    typeLabel: '剪刀撑'
  },
  {
    id: 'rect-002',
    title: 'B区垫板检查',
    sectionName: '地下一层B区',
    issueDesc: '部分立杆垫板下沉，需更换加厚垫板',
    deadline: '2024-01-16 12:00',
    status: 'submitted',
    statusText: '待审核',
    submitTime: '2024-01-16 07:30',
    type: 'base_plate',
    typeLabel: '垫板'
  },
  {
    id: 'rect-003',
    title: 'C区顶托调整',
    sectionName: '二层C区',
    issueDesc: '顶托伸出长度超标，需调整立杆高度',
    deadline: '2024-01-15 24:00',
    status: 'approved',
    statusText: '已通过',
    submitTime: '2024-01-15 22:00',
    reviewer: '张工',
    reviewTime: '2024-01-15 23:00',
    type: 'jacking',
    typeLabel: '顶托'
  },
  {
    id: 'rect-004',
    title: 'A区东侧剪刀撑补充',
    sectionName: '地下一层A区',
    issueDesc: '缺少横向剪刀撑，需按规范补充',
    deadline: '2024-01-16 10:00',
    status: 'rejected',
    statusText: '已打回',
    submitTime: '2024-01-15 22:00',
    rejectReason: '照片不清晰，无法确认加固位置，请重新拍照上传，确保能看到立杆编号和加固部位',
    reviewer: '张工',
    reviewTime: '2024-01-15 23:10',
    type: 'scissors_brace',
    typeLabel: '剪刀撑'
  },
  {
    id: 'rect-005',
    title: 'A区西侧垫板更换',
    sectionName: '地下一层A区',
    issueDesc: 'A-05立杆垫板出现裂纹，需更换',
    deadline: '2024-01-16 14:00',
    status: 'pending',
    statusText: '待整改',
    type: 'base_plate',
    typeLabel: '垫板'
  }
];
