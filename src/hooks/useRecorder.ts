import { useState, useRef, useCallback } from 'react';
import Taro from '@tarojs/taro';

interface UseRecorderReturn {
  isRecording: boolean;
  hasRecorded: boolean;
  voicePath: string;
  voiceDuration: number;
  isPlaying: boolean;
  startRecord: () => void;
  stopRecord: () => Promise<{ tempFilePath: string; duration: number } | null>;
  playVoice: () => void;
  stopPlay: () => void;
  deleteVoice: () => void;
}

export const useRecorder = (): UseRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [voicePath, setVoicePath] = useState('');
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const recorderManagerRef = useRef<Taro.RecorderManager | null>(null);
  const innerAudioContextRef = useRef<Taro.InnerAudioContext | null>(null);
  const startTimeRef = useRef<number>(0);

  const getRecorderManager = useCallback(() => {
    if (!recorderManagerRef.current) {
      const manager = Taro.getRecorderManager();
      console.log('[useRecorder] 创建录音管理器');

      manager.onStart(() => {
        console.log('[useRecorder] 录音开始');
        startTimeRef.current = Date.now();
        setIsRecording(true);
      });

      manager.onStop((res) => {
        console.log('[useRecorder] 录音结束', res);
        const duration = Math.max(1, Math.round(res.duration / 1000));
        setIsRecording(false);
        setHasRecorded(true);
        setVoicePath(res.tempFilePath);
        setVoiceDuration(duration);
        Taro.showToast({
          title: `录音完成 ${duration}"`,
          icon: 'success',
          duration: 1500
        });
      });

      manager.onError((err) => {
        console.error('[useRecorder] 录音错误', err);
        setIsRecording(false);
        Taro.showToast({
          title: '录音失败',
          icon: 'none',
          duration: 1500
        });
      });

      recorderManagerRef.current = manager;
    }
    return recorderManagerRef.current;
  }, []);

  const getInnerAudioContext = useCallback(() => {
    if (!innerAudioContextRef.current) {
      const ctx = Taro.createInnerAudioContext();
      console.log('[useRecorder] 创建音频播放器');

      ctx.onPlay(() => {
        console.log('[useRecorder] 开始播放');
        setIsPlaying(true);
      });

      ctx.onEnded(() => {
        console.log('[useRecorder] 播放结束');
        setIsPlaying(false);
      });

      ctx.onStop(() => {
        console.log('[useRecorder] 播放停止');
        setIsPlaying(false);
      });

      ctx.onError((err) => {
        console.error('[useRecorder] 播放错误', err);
        setIsPlaying(false);
      });

      innerAudioContextRef.current = ctx;
    }
    return innerAudioContextRef.current;
  }, []);

  const startRecord = useCallback(() => {
    console.log('[useRecorder] 调用开始录音');
    const manager = getRecorderManager();
    manager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    });
  }, [getRecorderManager]);

  const stopRecord = useCallback(async (): Promise<{ tempFilePath: string; duration: number } | null> => {
    console.log('[useRecorder] 调用停止录音');
    const manager = getRecorderManager();
    manager.stop();
    
    return new Promise((resolve) => {
      setTimeout(() => {
        if (voicePath) {
          resolve({ tempFilePath: voicePath, duration: voiceDuration });
        } else {
          resolve(null);
        }
      }, 500);
    });
  }, [getRecorderManager, voicePath, voiceDuration]);

  const playVoice = useCallback(() => {
    if (!voicePath) {
      console.warn('[useRecorder] 无录音文件可播放');
      return;
    }
    console.log('[useRecorder] 播放录音:', voicePath);
    const ctx = getInnerAudioContext();
    ctx.src = voicePath;
    ctx.play();
  }, [voicePath, getInnerAudioContext]);

  const stopPlay = useCallback(() => {
    console.log('[useRecorder] 停止播放');
    if (innerAudioContextRef.current) {
      innerAudioContextRef.current.stop();
    }
    setIsPlaying(false);
  }, []);

  const deleteVoice = useCallback(() => {
    console.log('[useRecorder] 删除录音');
    stopPlay();
    setHasRecorded(false);
    setVoicePath('');
    setVoiceDuration(0);
  }, [stopPlay]);

  return {
    isRecording,
    hasRecorded,
    voicePath,
    voiceDuration,
    isPlaying,
    startRecord,
    stopRecord,
    playVoice,
    stopPlay,
    deleteVoice
  };
};
