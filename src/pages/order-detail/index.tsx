import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockOrders } from '@/data/mockData';
import { PourOrder } from '@/types';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.id;
  const [order, setOrder] = useState<PourOrder | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    console.log('[OrderDetailPage] 页面加载，订单ID:', orderId);
    const found = mockOrders.find((o) => o.id === orderId);
    if (found) {
      setOrder(found);
      setConfirmed(found.status === 'confirmed');
    }
  }, [orderId]);

  const handleConfirm = () => {
    if (confirmed) return;
    
    console.log('[OrderDetailPage] 确认指令');
    Taro.showModal({
      title: '确认收到指令',
      content: '请确认已收到该指令，并立即通知所有相关作业人员执行。',
      confirmText: '确认收到',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          setConfirmed(true);
          Taro.showToast({
            title: '确认成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  };

  if (!order) {
    return (
      <View className={styles.page}>
        <Text style={{ padding: '32rpx' }}>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={classnames(styles.header, styles[order.type])}>
        <View className={styles.orderType}>{order.typeLabel}</View>
        <Text className={styles.orderTitle}>{order.title}</Text>
        <Text className={styles.orderSection}>{order.sectionName}</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>指令原因</Text>
          <Text className={styles.reasonText}>{order.detailReason}</Text>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>相关测点</Text>
          <View className={styles.affectedList}>
            {order.affectedPoints.map((point, index) => (
              <View key={index} className={styles.affectedItem}>
                <Text className={styles.affectedName}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>指令信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>发布人</Text>
            <Text className={styles.infoValue}>{order.publisher}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>发布时间</Text>
            <Text className={styles.infoValue}>{order.publishTime}</Text>
          </View>
          {confirmed && order.confirmTime && (
            <>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>确认人</Text>
                <Text className={styles.infoValue}>{order.confirmer}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>确认时间</Text>
                <Text className={styles.infoValue}>{order.confirmTime}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View className={styles.footer}>
        {confirmed ? (
          <View className={styles.confirmedBadge}>
            ✓ 已确认收到
          </View>
        ) : (
          <Button
            className={classnames(styles.confirmBtn, confirmed && styles.disabled)}
            onClick={handleConfirm}
          >
            确认收到
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderDetailPage;
