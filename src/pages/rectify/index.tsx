import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store';

const RectifyPage: React.FC = () => {
  const { rectifyList, approveRectify, rejectRectify } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const pendingCount = rectifyList.filter((item) => item.status === 'pending').length;
  const submittedCount = rectifyList.filter((item) => item.status === 'submitted').length;
  const approvedCount = rectifyList.filter((item) => item.status === 'approved').length;
  const rejectedCount = rectifyList.filter((item) => item.status === 'rejected').length;

  useDidShow(() => {
    console.log('[RectifyPage] 页面显示，列表数量:', rectifyList.length);
  });

  const handleSubmit = (id: string, e) => {
    e.stopPropagation();
    const item = rectifyList.find((r) => r.id === id);
    if (item && (item.status === 'pending' || item.status === 'rejected')) {
      Taro.navigateTo({ url: `/pages/rectify-submit/index?id=${id}` });
    } else {
      Taro.navigateTo({ url: `/pages/rectify-submit/index?id=${id}` });
    }
  };

  const handleApprove = (id: string, e) => {
    e.stopPropagation();
    Taro.showModal({
      title: '审核通过',
      content: '确认该整改项验收合格？',
      confirmText: '通过',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          approveRectify(id, '项目部审核');
          Taro.showToast({ title: '已通过', icon: 'success', duration: 1500 });
        }
      }
    });
  };

  const handleReject = (id: string, e) => {
    e.stopPropagation();
    Taro.showModal({
      title: '打回整改',
      editable: true,
      placeholderText: '请输入打回原因',
      confirmText: '打回',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const reason = res.content?.trim() || '整改不合格，请重新处理';
          rejectRectify(id, '项目部审核', reason);
          Taro.showToast({ title: '已打回', icon: 'none', duration: 1500 });
        }
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

  const handleAdd = () => {
    Taro.showActionSheet({
      itemList: ['剪刀撑加固', '垫板整改', '顶托调整'],
      success: (res) => {
        const types = ['scissors_brace', 'base_plate', 'jacking'];
        Taro.navigateTo({ url: `/pages/rectify-submit/index?type=${types[res.tapIndex]}` });
      }
    });
  };

  const getActionText = (status: string) => {
    switch (status) {
      case 'pending': return '去整改';
      case 'submitted': return '审核';
      case 'approved': return '查看详情';
      case 'rejected': return '重新提交';
      default: return '查看';
    }
  };

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
            <Text className={styles.statLabel}>待审核</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.approved)}>{approvedCount}</Text>
            <Text className={styles.statLabel}>已通过</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statNum, styles.rejected)}>{rejectedCount}</Text>
            <Text className={styles.statLabel}>已打回</Text>
          </View>
        </View>
      </View>

      <View className={styles.rectifyList}>
        {rectifyList.length > 0 ? (
          rectifyList.map((item) => (
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

              {item.rejectReason && (
                <View className={styles.rejectBox}>
                  <Text className={styles.rejectLabel}>打回原因：</Text>
                  <Text className={styles.rejectReason}>{item.rejectReason}</Text>
                </View>
              )}

              {item.reviewer && item.reviewTime && (
                <Text className={styles.reviewInfo}>
                  审核：{item.reviewer} {item.reviewTime}
                </Text>
              )}

              <View className={styles.itemFooter}>
                <Text className={styles.deadline}>截止：{item.deadline}</Text>
                <View className={styles.actionBtns}>
                  {item.status === 'submitted' && (
                    <>
                      <Button
                        className={classnames(styles.actionBtn, styles.rejectBtn)}
                        onClick={(e) => handleReject(item.id, e)}
                      >
                        打回
                      </Button>
                      <Button
                        className={classnames(styles.actionBtn, styles.approveBtn)}
                        onClick={(e) => handleApprove(item.id, e)}
                      >
                        通过
                      </Button>
                    </>
                  )}
                  <Button
                    className={classnames(
                      styles.submitBtn,
                      (item.status === 'approved') && styles.viewOnly
                    )}
                    onClick={(e) => handleSubmit(item.id, e)}
                  >
                    {getActionText(item.status)}
                  </Button>
                </View>
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
