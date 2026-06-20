import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockRectifyList } from '@/data/mockData';
import { RectifyItem } from '@/types';

const RectifyPage: React.FC = () => {
  const [list, setList] = useState<RectifyItem[]>(mockRectifyList);
  const [refreshing, setRefreshing] = useState(false);

  const pendingCount = list.filter((item) => item.status === 'pending').length;
  const submittedCount = list.filter((item) => item.status === 'submitted').length;
  const verifiedCount = list.filter((item) => item.status === 'verified').length;

  const handleSubmit = (id: string, e) => {
    e.stopPropagation();
    console.log('[RectifyPage] 提交整改:', id);
    Taro.navigateTo({
      url: `/pages/rectify-submit/index?id=${id}`
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

  const handleAdd = () => {
    Taro.showActionSheet({
      itemList: ['剪刀撑加固', '垫板整改', '顶托调整'],
      success: (res) => {
        const types = ['scissors_brace', 'base_plate', 'jacking'];
        Taro.navigateTo({
          url: `/pages/rectify-submit/index?type=${types[res.tapIndex]}`
        });
      }
    });
  };

  React.useEffect(() => {
    console.log('[RectifyPage] 页面加载，待整改数:', pendingCount);
  }, [pendingCount]);

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.pending)}>{pendingCount}</Text>
            <Text className={styles.statLabel}>待整改</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.submitted)}>{submittedCount}</Text>
            <Text className={styles.statLabel}>已提交</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.verified)}>{verifiedCount}</Text>
            <Text className={styles.statLabel}>已验收</Text>
          </View>
        </View>
      </View>

      <View className={styles.rectifyList}>
        {list.length > 0 ? (
          list.map((item) => (
            <View key={item.id} className={styles.rectifyItem}>
              <View className={styles.itemHeader}>
                <Text className={styles.itemTitle}>{item.title}</Text>
                <View className={classnames(styles.statusBadge, styles[item.status])}>
                  {item.statusText}
                </View>
              </View>
              <Text className={styles.itemSection}>
                <Text className={styles.typeTag}>{item.typeLabel}</Text>
                {item.sectionName}
              </Text>
              <Text className={styles.itemDesc}>{item.issueDesc}</Text>
              <View className={styles.itemFooter}>
                <Text className={styles.deadline}>
                  截止：{item.deadline}
                </Text>
                <Button
                  className={classnames(
                    styles.submitBtn,
                    item.status !== 'pending' && styles.submitted
                  )}
                  onClick={(e) => handleSubmit(item.id, e)}
                >
                  {item.status === 'pending' ? '去整改' : '查看详情'}
                </Button>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text>暂无整改项</Text>
          </View>
        )}
      </View>

      <View className={styles.fab} onClick={handleAdd}>
        <Text>+</Text>
      </View>
    </ScrollView>
  );
};

export default RectifyPage;
