import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { PourOrder } from '@/types';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.id;
  const { orders, confirmOrder } = useAppStore();
  const [order, setOrder] = useState<PourOrder | null>(null);

  useEffect(() => {
    console.log('[OrderDetailPage] 页面加载，订单ID:', orderId);
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      setOrder(found);
    }
  }, [orderId, orders]);

  const alreadySignedByMe = order?.signRecords.some((r) => r.confirmerName === '当前班长') ?? false;

  const handleConfirm = () => {
    if (!order || alreadySignedByMe) return;

    Taro.showModal({
      title: '签收确认',
      content: '请确认已收到该指令，签收后将记录您的确认信息',
      confirmText: '确认签收',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const success = confirmOrder(order.id, '当前班长', '班组长');
          if (success) {
            Taro.showToast({ title: '签收成功', icon: 'success', duration: 1500 });
          } else {
            Taro.showToast({ title: '您已确认过该指令', icon: 'none', duration: 2000 });
          }
        }
      }
    });
  };

  if (!order) {
    return (
      <View className={styles.page}>
        <Text style={{ padding: '32rpx', color: '#86909c' }}>加载中...</Text>
      </View>
    );
  }

  const confirmed = order.status === 'confirmed';

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
        </View>

        {order.signRecords.length > 0 && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>签收记录 ({order.signRecords.length}人)</Text>
            {order.signRecords.map((record) => (
              <View key={record.id} className={styles.signRecord}>
                <View className={styles.signRecordLeft}>
                  <Text className={styles.signRecordName}>{record.confirmerName}</Text>
                  <Text className={styles.signRecordRole}>{record.confirmerRole}</Text>
                </View>
                <Text className={styles.signRecordTime}>{record.confirmTime}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.footer}>
        {alreadySignedByMe ? (
          <View className={styles.confirmedBadge}>✓ 您已签收</View>
        ) : confirmed ? (
          <Button className={styles.confirmBtn} onClick={handleConfirm}>
            签收确认
          </Button>
        ) : (
          <Button className={styles.confirmBtn} onClick={handleConfirm}>
            确认收到
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderDetailPage;
