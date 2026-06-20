import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import { mockOrders } from '@/data/mockData';
import { PourOrder } from '@/types';

type TabType = 'all' | 'pending' | 'confirmed';

const OrderPage: React.FC = () => {
  const [orders, setOrders] = useState<PourOrder[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const handleConfirm = (id: string) => {
    console.log('[OrderPage] 确认指令:', id);
    Taro.showModal({
      title: '确认收到',
      content: '请确认已收到该指令并通知相关作业人员',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === id
                ? {
                    ...o,
                    status: 'confirmed' as const,
                    confirmTime: '2024-01-15 22:35',
                    confirmer: '李班长'
                  }
                : o
            )
          );
          Taro.showToast({
            title: '确认成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    }, 1000);
  };

  React.useEffect(() => {
    console.log('[OrderPage] 页面加载，待确认指令数:', pendingCount);
  }, [pendingCount]);

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      {pendingCount > 0 && (
        <View style={{ padding: '0 32rpx', paddingTop: '24rpx' }}>
          <View className={styles.pendingCount}>
            <Text className={styles.pendingText}>待确认指令</Text>
            <Text className={styles.pendingNum}>{pendingCount}</Text>
          </View>
        </View>
      )}

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'all' && styles.active)}
          onClick={() => setActiveTab('all')}
        >
          全部
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'pending' && styles.active)}
          onClick={() => setActiveTab('pending')}
        >
          待确认
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'confirmed' && styles.active)}
          onClick={() => setActiveTab('confirmed')}
        >
          已确认
        </View>
      </View>

      <View className={styles.orderList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onConfirm={handleConfirm}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text>暂无指令</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderPage;
