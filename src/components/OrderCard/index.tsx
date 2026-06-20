import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { PourOrder } from '@/types';

interface OrderCardProps {
  order: PourOrder;
  onConfirm?: (id: string) => void;
}

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

  return (
    <View 
      className={classnames(styles.orderCard, order.status === 'pending' && styles.pending)}
      onClick={handleViewDetail}
    >
      <View className={styles.orderHeader}>
        <View className={classnames(styles.orderType, styles[order.type])}>
          {order.typeLabel}
        </View>
        <View className={classnames(styles.statusTag, styles[order.status])}>
          {order.status === 'pending' ? '待确认' : '已确认'}
        </View>
      </View>

      <Text className={styles.orderTitle}>{order.title}</Text>
      <Text className={styles.orderSection}>{order.sectionName}</Text>
      <Text className={styles.orderReason}>{order.reason}</Text>

      <View className={styles.orderFooter}>
        <Text className={styles.orderTime}>发布时间：{order.publishTime}</Text>
        {order.status === 'pending' ? (
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
