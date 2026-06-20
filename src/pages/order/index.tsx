import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import { useAppStore } from '@/store';
import { TeamType } from '@/types';

type TabType = 'all' | 'pending' | 'confirmed';

const teamLabels: Record<TeamType, string> = {
  scaffolding: '架子工班组',
  concrete: '混凝土班组'
};

const OrderPage: React.FC = () => {
  const { orders, confirmOrder } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const handleConfirm = (id: string) => {
    Taro.showActionSheet({
      itemList: ['架子工班组', '混凝土班组'],
      success: (res) => {
        const teams: TeamType[] = ['scaffolding', 'concrete'];
        const labels = ['架子工班组', '混凝土班组'];
        const teamType = teams[res.tapIndex];
        const teamLabel = labels[res.tapIndex];

        Taro.showModal({
          title: '签收确认',
          content: `请确认已收到该指令（${teamLabel}）`,
          confirmText: '确认签收',
          cancelText: '取消',
          success: (modalRes) => {
            if (modalRes.confirm) {
              const success = confirmOrder(id, '当前班长', '班组长', teamType, teamLabel);
              if (success) {
                Taro.showToast({ title: '签收成功', icon: 'success', duration: 1500 });
              } else {
                Taro.showToast({ title: '您已确认过该指令', icon: 'none', duration: 2000 });
              }
            }
          }
        });
      }
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.showToast({ title: '刷新成功', icon: 'success', duration: 1500 });
    }, 1000);
  };

  const getSignSummary = (order: any) => {
    if (order.signRecords.length === 0) return null;
    const byTeam: Record<string, string[]> = {};
    order.signRecords.forEach((r: any) => {
      const label = r.teamLabel || teamLabels[r.teamType] || r.teamType;
      if (!byTeam[label]) byTeam[label] = [];
      byTeam[label].push(r.confirmerName);
    });
    return byTeam;
  };

  return (
    <ScrollView className={styles.page} scrollY refresherEnabled refresherTriggered={refreshing} onRefresherRefresh={handleRefresh}>
      {pendingCount > 0 && (
        <View style={{ padding: '0 32rpx', paddingTop: '24rpx' }}>
          <View className={styles.pendingCount}>
            <Text className={styles.pendingText}>待确认指令</Text>
            <Text className={styles.pendingNum}>{pendingCount}</Text>
          </View>
        </View>
      )}

      <View className={styles.tabs}>
        <View className={classnames(styles.tabItem, activeTab === 'all' && styles.active)} onClick={() => setActiveTab('all')}>
          全部 ({orders.length})
        </View>
        <View className={classnames(styles.tabItem, activeTab === 'pending' && styles.active)} onClick={() => setActiveTab('pending')}>
          待确认 ({pendingCount})
        </View>
        <View className={classnames(styles.tabItem, activeTab === 'confirmed' && styles.active)} onClick={() => setActiveTab('confirmed')}>
          已确认 ({orders.length - pendingCount})
        </View>
      </View>

      <View className={styles.orderList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const byTeam = getSignSummary(order);
            return (
              <View key={order.id}>
                <OrderCard order={order} onConfirm={handleConfirm} />
                {byTeam && (
                  <View className={styles.signSummary}>
                    {Object.entries(byTeam).map(([team, names]) => (
                      <View key={team} className={styles.signTeamRow}>
                        <Text className={styles.signTeamLabel}>{team}：</Text>
                        <Text className={styles.signTeamNames}>{names.join('、')}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
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
