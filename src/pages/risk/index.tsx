import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import StatusCard from '@/components/StatusCard';
import MeasurePointItem from '@/components/MeasurePointItem';
import { useAppStore } from '@/store';
import { mockSections } from '@/data/mockData';
import { ConstructionSection, MeasurePoint, TeamType } from '@/types';

const teamLabels: Record<TeamType, string> = {
  scaffolding: '架子工班组',
  concrete: '混凝土班组'
};

const RiskPage: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>(mockSections[0].id);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MeasurePoint | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { orders, rectifyList } = useAppStore();

  useDidShow(() => {
    console.log('[RiskPage] 页面显示，数据刷新');
  });

  const activeSection: ConstructionSection | undefined = mockSections.find(
    (s) => s.id === activeSectionId
  );

  const abnormalPoints: MeasurePoint[] =
    activeSection?.measurePoints.filter((p) => p.level !== 'safe') || [];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success', duration: 1500 });
    }, 1000);
  };

  const handleSectionChange = (id: string) => {
    setActiveSectionId(id);
    setSelectedPoint(null);
    setShowModal(false);
  };

  const handlePointClick = (point: MeasurePoint) => {
    setSelectedPoint(point);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPoint(null);
  };

  const handleGoOrder = (orderId: string) => {
    setShowModal(false);
    Taro.switchTab({ url: '/pages/order/index' }).then(() => {
      setTimeout(() => {
        Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}` });
      }, 300);
    });
  };

  const handleGoRectify = (rectifyId: string) => {
    setShowModal(false);
    Taro.switchTab({ url: '/pages/rectify/index' }).then(() => {
      setTimeout(() => {
        Taro.navigateTo({ url: `/pages/rectify-submit/index?id=${rectifyId}` });
      }, 300);
    });
  };

  const getRelatedOrders = (orderIds: string[]) => orders.filter((o) => orderIds.includes(o.id));
  const getRelatedRectifyItems = (rectifyIds: string[]) => rectifyList.filter((r) => rectifyIds.includes(r.id));

  const getOrderSignStatus = (order: any) => {
    const requiredTeams = order.requiredTeams || [];
    const signedTeams = new Set(order.signRecords.map((r: any) => r.teamType));
    const unsignedTeams = requiredTeams.filter((t: TeamType) => !signedTeams.has(t));
    return { signedTeams, unsignedTeams, allSigned: unsignedTeams.length === 0 };
  };

  if (!activeSection) {
    return <View className={styles.page}><Text>加载中...</Text></View>;
  }

  return (
    <ScrollView className={styles.page} scrollY refresherEnabled refresherTriggered={refreshing} onRefresherRefresh={handleRefresh}>
      <View className={styles.sectionSelect}>
        <Text className={styles.selectLabel}>选择施工段</Text>
        <View className={styles.sectionTabs}>
          {mockSections.map((section) => (
            <Button key={section.id}
              className={classnames(styles.sectionTab, section.id === activeSectionId && styles.active)}
              onClick={() => handleSectionChange(section.id)}
            >{section.name}</Button>
          ))}
        </View>
      </View>

      <View className={styles.content}>
        <StatusCard section={activeSection} />

        <Text className={styles.sectionTitle}>异常测点</Text>
        <View className={styles.pointList}>
          {abnormalPoints.length > 0 ? (
            abnormalPoints.map((point) => (
              <View key={point.id} onClick={() => handlePointClick(point)}>
                <MeasurePointItem point={point} />
              </View>
            ))
          ) : (
            <View className={styles.safeTip}>所有测点正常，无异常</View>
          )}
        </View>

        <Text className={styles.sectionTitle}>禁入区域</Text>
        <View className={styles.forbiddenList}>
          {activeSection.forbiddenAreas.length > 0 ? (
            activeSection.forbiddenAreas.map((area) => (
              <View key={area.id} className={styles.forbiddenItem}>
                <Text className={styles.forbiddenName}>{area.name}</Text>
                <Text className={styles.forbiddenReason}>{area.reason}</Text>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>暂无禁入区域</View>
          )}
        </View>
      </View>

      {showModal && selectedPoint && (
        <View className={styles.modalOverlay} onClick={handleCloseModal}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={classnames(styles.modalHeader, styles[selectedPoint.level])}>
              <Text className={styles.modalTitle}>{selectedPoint.name}</Text>
              <View className={styles.modalClose} onClick={handleCloseModal}>×</View>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              <View className={styles.modalInfo}>
                <View className={styles.modalInfoRow}>
                  <Text className={styles.modalInfoLabel}>监测类型</Text>
                  <Text className={styles.modalInfoValue}>{selectedPoint.typeLabel}</Text>
                </View>
                <View className={styles.modalInfoRow}>
                  <Text className={styles.modalInfoLabel}>当前值</Text>
                  <Text className={classnames(styles.modalInfoValue, styles[selectedPoint.level])}>
                    {selectedPoint.value}{selectedPoint.unit}
                  </Text>
                </View>
                <View className={styles.modalInfoRow}>
                  <Text className={styles.modalInfoLabel}>预警值</Text>
                  <Text className={styles.modalInfoValue}>{selectedPoint.threshold}{selectedPoint.unit}</Text>
                </View>
              </View>

              {selectedPoint.suggestion && (
                <View className={styles.suggestionCard}>
                  <Text className={styles.suggestionTitle}>处置建议</Text>
                  <Text className={styles.suggestionText}>{selectedPoint.suggestion}</Text>
                </View>
              )}

              {(selectedPoint.relatedOrderIds.length > 0 || selectedPoint.relatedRectifyIds.length > 0) && (
                <View className={styles.progressSection}>
                  <Text className={styles.progressTitle}>处置进度</Text>

                  {selectedPoint.relatedOrderIds.length > 0 && getRelatedOrders(selectedPoint.relatedOrderIds).map((order) => {
                    const { unsignedTeams, allSigned } = getOrderSignStatus(order);
                    return (
                      <View key={order.id} className={styles.progressItem}>
                        <View className={styles.progressItemHeader} onClick={() => handleGoOrder(order.id)}>
                          <View className={styles.progressItemLeft}>
                            <View className={classnames(styles.relatedTypeTag, styles[order.type])}>{order.typeLabel}</View>
                            <Text className={styles.progressItemTitle}>{order.title}</Text>
                          </View>
                          <Text className={styles.relatedArrow}>›</Text>
                        </View>
                        <View className={styles.progressStatus}>
                          {allSigned ? (
                            <View className={styles.progressTagDone}>✓ 已全部签收</View>
                          ) : (
                            <View className={styles.progressTagPending}>
                              未签收：{unsignedTeams.map((t: TeamType) => teamLabels[t]).join('、')}
                            </View>
                          )}
                          {order.signRecords.length > 0 && (
                            <Text className={styles.progressDetail}>
                              已签：{order.signRecords.map((s) => s.confirmerName).join('、')}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}

                  {selectedPoint.relatedRectifyIds.length > 0 && getRelatedRectifyItems(selectedPoint.relatedRectifyIds).map((item) => (
                    <View key={item.id} className={styles.progressItem}>
                      <View className={styles.progressItemHeader} onClick={() => handleGoRectify(item.id)}>
                        <View className={styles.progressItemLeft}>
                          <View className={classnames(styles.relatedStatusTag, styles[item.status])}>{item.statusText}</View>
                          <Text className={styles.progressItemTitle}>{item.title}</Text>
                        </View>
                        <Text className={styles.relatedArrow}>›</Text>
                      </View>
                      <View className={styles.progressStatus}>
                        {item.status === 'pending' && <Text className={styles.progressDetail}>等待班组长整改</Text>}
                        {item.status === 'submitted' && <Text className={styles.progressDetail}>已提交，等待项目部审核</Text>}
                        {item.status === 'approved' && <View className={styles.progressTagDone}>✓ 已通过验收</View>}
                        {item.status === 'rejected' && <View className={styles.progressTagRejected}>已打回，需重新提交</View>}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {selectedPoint.relatedOrderIds.length === 0 && selectedPoint.relatedRectifyIds.length === 0 && (
                <View className={styles.noRelated}><Text>暂无关联指令或整改项</Text></View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default RiskPage;
