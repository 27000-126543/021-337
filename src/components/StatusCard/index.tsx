import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { ConstructionSection } from '@/types';

interface StatusCardProps {
  section: ConstructionSection;
}

const StatusCard: React.FC<StatusCardProps> = ({ section }) => {
  return (
    <View className={classnames(styles.statusCard, styles[section.level])}>
      <Text className={styles.sectionName}>{section.name}</Text>
      
      <View className={styles.statusRow}>
        <View className={styles.statusBadge}>{section.levelText}</View>
        <Text className={styles.workStatus}>{section.workStatusText}</Text>
      </View>

      <Text className={styles.mainStatus}>
        {section.isWorkAllowed ? '可以作业' : '禁止作业'}
      </Text>
      <Text className={styles.statusDesc}>
        {section.isWorkAllowed 
          ? '按要求做好安全防护，关注异常测点' 
          : '立即停止作业，人员撤离至安全区域'}
      </Text>

      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <Text className={styles.infoValue}>{section.abnormalCount}</Text>
          <Text className={styles.infoLabel}>异常测点</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoValue}>{section.forbiddenAreas.length}</Text>
          <Text className={styles.infoLabel}>禁入区域</Text>
        </View>
      </View>

      <Text className={styles.updateTime}>更新时间：{section.updateTime}</Text>
    </View>
  );
};

export default StatusCard;
