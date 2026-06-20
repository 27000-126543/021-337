import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { PourOrder, TeamType } from '@/types';

const teamLabels: Record<TeamType, string> = {
  scaffolding: '架子工班组',
  concrete: '混凝土班组'
};

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.id;
  const { orders, confirmOrder } = useAppStore();
  const [order, setOrder] = useState<PourOrder | null>(null);

  useEffect(() => {
    const found = orders.find((o) => o.id === orderId);
    if (found) setOrder(found);
  }, [orderId, orders]);

  const alreadySignedByMe = order?.signRecords.some((r) => r.confirmerName === '当前班长') ?? false;

  const getTeamSignStatus = () => {
    if (!order) return { signed: [], unsigned: [] };
    const requiredTeams = order.requiredTeams || ['scaffolding', 'concrete'];
    const signedTeamTypes = new Set(order.signRecords.map((r) => r.teamType));
    const signed = requiredTeams.filter((t) => signedTeamTypes.has(t));
    const unsigned = requiredTeams.filter((t) => !signedTeamTypes.has(t));
    return { signed, unsigned };
  };

  const handleConfirm = (teamType: TeamType) => {
    if (!order || alreadySignedByMe) return;

    const teamLabel = teamLabels[teamType];
    Taro.showModal({
      title: '签收确认',
      content: `请确认已收到该指令（${teamLabel}）`,
      confirmText: '确认签收',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const success = confirmOrder(order.id, '当前班长', '班组长', teamType, teamLabel);
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
    return <View className={styles.page}><Text style={{ padding: '32rpx', color: '#86909c' }}>加载中...</Text></View>;
  }

  const { signed, unsigned } = getTeamSignStatus();

  const signRecordsByTeam: Record<string, typeof order.signRecords> = {};
  order.signRecords.forEach((r) => {
    const key = r.teamType;
    if (!signRecordsByTeam[key]) signRecordsByTeam[key] = [];
    signRecordsByTeam[key].push(r);
  });

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

        {unsigned.length > 0 && (
          <View className={styles.unsignedCard}>
            <Text className={styles.unsignedTitle}>待签收班组</Text>
            {unsigned.map((team) => (
              <View key={team} className={styles.unsignedItem}>
                <Text className={styles.unsignedName}>{teamLabels[team]}</Text>
                {!alreadySignedByMe && (
                  <Button className={styles.unsignedBtn} onClick={() => handleConfirm(team)}>
                    签收
                  </Button>
                )}
              </View>
            ))}
          </View>
        )}

        {order.signRecords.length > 0 && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>签收记录</Text>
            {Object.entries(signRecordsByTeam).map(([teamType, records]) => (
              <View key={teamType} className={styles.signTeamGroup}>
                <Text className={styles.signTeamGroupTitle}>{teamLabels[teamType as TeamType] || teamType}</Text>
                {records.map((record) => (
                  <View key={record.id} className={styles.signRecord}>
                    <View className={styles.signRecordLeft}>
                      <Text className={styles.signRecordName}>{record.confirmerName}</Text>
                      <Text className={styles.signRecordRole}>{record.confirmerRole}</Text>
                    </View>
                    <Text className={styles.signRecordTime}>{record.confirmTime}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.footer}>
        {alreadySignedByMe ? (
          <View className={styles.confirmedBadge}>✓ 您已签收</View>
        ) : (
          <View className={styles.footerBtns}>
            {unsigned.map((team) => (
              <Button key={team} className={styles.confirmBtn} onClick={() => handleConfirm(team)}>
                {teamLabels[team]}签收
              </Button>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderDetailPage;
