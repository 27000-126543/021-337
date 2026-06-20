import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, Textarea, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockRectifyList } from '@/data/mockData';
import { RectifyItem } from '@/types';

const typeOptions = [
  { value: 'scissors_brace', label: '剪刀撑' },
  { value: 'base_plate', label: '垫板' },
  { value: 'jacking', label: '顶托' }
];

const RectifySubmitPage: React.FC = () => {
  const router = useRouter();
  const rectifyId = router.params.id;
  const initType = router.params.type;

  const [rectifyItem, setRectifyItem] = useState<RectifyItem | null>(null);
  const [activeType, setActiveType] = useState<string>(initType || 'scissors_brace');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [textDesc, setTextDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('[RectifySubmitPage] 页面加载，整改ID:', rectifyId);
    if (rectifyId) {
      const found = mockRectifyList.find((r) => r.id === rectifyId);
      if (found) {
        setRectifyItem(found);
        setActiveType(found.type);
        if (found.status !== 'pending') {
          setPhotos([
            'https://picsum.photos/id/787/300/300',
            'https://picsum.photos/id/787/300/301'
          ]);
          setHasVoice(true);
          setVoiceDuration(45);
          setTextDesc('已按规范加固剪刀撑，检查合格。');
        }
      }
    }
  }, [rectifyId]);

  const handleAddPhoto = () => {
    Taro.chooseImage({
      count: 3 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('[RectifySubmitPage] 选择图片:', res.tempFilePaths);
        const newPhotos = [...photos, ...res.tempFilePaths].slice(0, 3);
        setPhotos(newPhotos);
      },
      fail: (err) => {
        console.error('[RectifySubmitPage] 选择图片失败:', err);
      }
    });
  };

  const handleDeletePhoto = (index: number, e) => {
    e.stopPropagation();
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoiceRecord = () => {
    if (hasVoice) {
      return;
    }
    
    if (isRecording) {
      setIsRecording(false);
      setHasVoice(true);
      setVoiceDuration(30);
      console.log('[RectifySubmitPage] 录音结束');
      Taro.showToast({
        title: '录音完成',
        icon: 'success',
        duration: 1500
      });
    } else {
      setIsRecording(true);
      console.log('[RectifySubmitPage] 开始录音');
    }
  };

  const handleDeleteVoice = () => {
    setHasVoice(false);
    setVoiceDuration(0);
  };

  const handleSubmit = () => {
    if (photos.length === 0) {
      Taro.showToast({
        title: '请上传整改照片',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (!hasVoice && !textDesc.trim()) {
      Taro.showToast({
        title: '请输入文字说明或语音说明',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    console.log('[RectifySubmitPage] 提交整改反馈');
    setSubmitting(true);
    
    setTimeout(() => {
      setSubmitting(false);
      Taro.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 1500
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }, 1500);
  };

  const isViewOnly = rectifyItem && rectifyItem.status !== 'pending';

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.content}>
        {rectifyItem && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>整改信息</Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>整改项</Text>
              <Text className={styles.infoValue}>{rectifyItem.title}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>施工段</Text>
              <Text className={styles.infoValue}>{rectifyItem.sectionName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>问题描述</Text>
              <Text className={styles.infoValue}>{rectifyItem.issueDesc}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>截止时间</Text>
              <Text className={styles.infoValue}>{rectifyItem.deadline}</Text>
            </View>
          </View>
        )}

        {!rectifyItem && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>整改类型</Text>
            <View className={styles.typeTabs}>
              {typeOptions.map((option) => (
                <Button
                  key={option.value}
                  className={classnames(
                    styles.typeTab,
                    activeType === option.value && styles.active
                  )}
                  onClick={() => setActiveType(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </View>
          </View>
        )}

        <View className={styles.card}>
          <Text className={styles.cardTitle}>
            照片上传
            <Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.section}>
            <View className={styles.sectionLabel}>
              <Text>
                {typeOptions.find((t) => t.value === activeType)?.label}整改照片
                <Text className={styles.required}>*</Text>
              </Text>
              <Text style={{ fontSize: '24rpx', color: '#86909c' }}>
                {photos.length}/3
              </Text>
            </View>
            <View className={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} className={styles.photoItem}>
                  {!isViewOnly && (
                    <View
                      className={styles.deleteBtn}
                      onClick={(e) => handleDeletePhoto(index, e)}
                    >
                      ×
                    </View>
                  )}
                  <Image
                    className={styles.photoImg}
                    src={photo}
                    mode="aspectFill"
                  />
                </View>
              ))}
              {photos.length < 3 && !isViewOnly && (
                <View className={styles.addPhoto} onClick={handleAddPhoto}>
                  <Text className={styles.addIcon}>+</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>处理说明</Text>
          <View className={styles.voiceSection}>
            <View className={styles.sectionLabel}>
              <Text>语音说明</Text>
            </View>
            {hasVoice ? (
              <View className={styles.voiceRecorded}>
                <Button className={styles.playBtn}>▶</Button>
                <View className={styles.voiceProgress}>
                  <View className={styles.voiceBar}></View>
                </View>
                <Text className={styles.voiceDuration}>{voiceDuration}"</Text>
                {!isViewOnly && (
                  <Button className={styles.voiceDelete} onClick={handleDeleteVoice}>
                    删除
                  </Button>
                )}
              </View>
            ) : (
              !isViewOnly && (
                <Button
                  className={classnames(
                    styles.voiceBtn,
                    isRecording && styles.recording
                  )}
                  onClick={handleVoiceRecord}
                >
                  <Text className={styles.voiceIcon}>
                    {isRecording ? '🔴' : '🎤'}
                  </Text>
                  <Text>{isRecording ? '录音中...点击结束' : '点击开始录音'}</Text>
                </Button>
              )
            )}
          </View>

          <View className={styles.section} style={{ marginTop: '32rpx' }}>
            <View className={styles.sectionLabel}>
              <Text>文字说明</Text>
            </View>
            <Textarea
              className={styles.textarea}
              placeholder="请输入整改处理情况说明..."
              value={textDesc}
              onInput={(e) => setTextDesc(e.detail.value)}
              maxlength={200}
              disabled={isViewOnly}
            />
          </View>
        </View>
      </View>

      {!isViewOnly && (
        <View className={styles.footer}>
          <Button
            className={classnames(
              styles.submitBtn,
              submitting && styles.disabled
            )}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '提交整改'}
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

export default RectifySubmitPage;
