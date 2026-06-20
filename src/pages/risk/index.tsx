import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusCard from '@/components/StatusCard';
import MeasurePointItem from '@/components/MeasurePointItem';
import { mockSections } from '@/data/mockData';
import { ConstructionSection, MeasurePoint } from '@/types';

const RiskPage: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>(mockSections[0].id);
  const [refreshing, setRefreshing] = useState(false);

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
      Taro.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    }, 1000);
  };

  const handleSectionChange = (id: string) => {
    setActiveSectionId(id);
  };

  React.useEffect(() => {
    console.log('[RiskPage] 页面加载，当前施工段:', activeSectionId);
  }, [activeSectionId]);

  if (!activeSection) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className={styles.page} 
      scrollY
      onScrollToLower={() => {}}
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.sectionSelect}>
        <Text className={styles.selectLabel}>选择施工段</Text>
        <View className={styles.sectionTabs}>
          {mockSections.map((section) => (
            <Button
              key={section.id}
              className={classnames(
                styles.sectionTab,
                section.id === activeSectionId && styles.active
              )}
              onClick={() => handleSectionChange(section.id)}
            >
              {section.name}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.content}>
        <StatusCard section={activeSection} />

        <Text className={styles.sectionTitle}>异常测点</Text>
        <View className={styles.pointList}>
          {abnormalPoints.length > 0 ? (
            abnormalPoints.map((point) => (
              <MeasurePointItem key={point.id} point={point} />
            ))
          ) : (
            <View className={styles.safeTip}>
              所有测点正常，无异常
            </View>
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
            <View className={styles.emptyState}>
              暂无禁入区域
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default RiskPage;
