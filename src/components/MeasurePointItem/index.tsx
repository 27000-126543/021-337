import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { MeasurePoint } from '@/types';

interface MeasurePointItemProps {
  point: MeasurePoint;
}

const MeasurePointItem: React.FC<MeasurePointItemProps> = ({ point }) => {
  return (
    <View className={classnames(styles.pointItem, styles[point.level])}>
      <View className={styles.pointInfo}>
        <Text className={styles.pointName}>{point.name}</Text>
        <View className={styles.pointMeta}>
          <Text className={styles.pointType}>{point.typeLabel}</Text>
          <Text className={styles.pointLocation}>{point.location}</Text>
        </View>
      </View>
      <View className={styles.pointValue}>
        <Text className={styles.valueText}>
          {point.value}
          <Text className={styles.valueUnit}>{point.unit}</Text>
        </Text>
        <Text className={styles.thresholdText}>阈值 {point.threshold}{point.unit}</Text>
      </View>
    </View>
  );
};

export default MeasurePointItem;
