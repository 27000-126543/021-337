import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { PourOrder, TeamType } from '@/types';

interface OrderCardProps {
  order: PourOrder;
  onConfirm?: (id: string) => void;
}

const teamLabels: Record<TeamType, string> = {
  scaffolding: '架子工',
  concrete: '混凝土'
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onConfirm }) => {
  const handleViewDetail = () => {
    Taro.navigateTo({
      url: `/pages/order-detail/index?id=${order.id}`
    });
  };

  const handleConfirm = (e) => {
    e.stopPropagation();
    onConfirm?.(order.id);
  };

  const requiredTeams = order.requiredTeams || ['scaffolding', 'concrete'];
  const signedTeams = new Set(order.signRecords.map((r) => r.teamType));
  const unsignedTeams = requiredTeams.filter((t) => !signedTeams.has(t));
  const allSigned = unsignedTeams.length === 0;

  return (
    <View
      className={classnames(styles.orderCard, !allSigned && styles.pending)}
      onClick={handleViewDetail}
    >
      <View className={styles.orderHeader}>
        <View className={classnames(styles.orderType, styles[order.type])}>
          {order.typeLabel}
        </View>
        <View className={classnames(styles.statusTag, allSigned ? 'confirmed' : styles.pending)}>
          {allSigned ? '已确认' : '待确认'}
        </View>
      </View>

      <Text className={styles.orderTitle}>{order.title}</Text>
      <Text className={styles.orderSection}>{order.sectionName}</Text>
      <Text className={styles.orderReason}>{order.reason}</Text>

      <View className={styles.teamStatusRow}>
        {requiredTeams.map((team) => (
          <View key={team} className={classnames(styles.teamTag, signedTeams.has(team) ? styles.signed : styles.unsigned)}>
            <Text className={styles.teamTagDot}></Text>
            <Text className={styles.teamTagName}>{teamLabels[team]}</Text>
            <Text className={styles.teamTagStatus}>{signedTeams.has(team) ? '已签' : '未签'}</Text>
          </View>
        ))}
      </View>

      <View className={styles.orderFooter}>
        <Text className={styles.orderTime}>发布时间：{order.publishTime}</Text>
        {!allSigned ? (
          <Button
            className={styles.confirmBtn}
            onClick={handleConfirm}
          >
            确认收到
          </Button>
        ) : (
          <Button
            className={styles.viewBtn}
            onClick={handleViewDetail}
          >
            查看详情
          </Button>
        )}
      </View>
    </View>
  );
};

export default OrderCard;
