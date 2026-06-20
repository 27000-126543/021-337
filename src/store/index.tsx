import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PourOrder, RectifyItem, RectifySubmission, SignRecord } from '@/types';
import { mockOrders, mockRectifyList } from '@/data/mockData';

interface AppContextType {
  orders: PourOrder[];
  rectifyList: RectifyItem[];
  rectifySubmissions: Record<string, RectifySubmission>;
  confirmOrder: (orderId: string, confirmerName: string, confirmerRole: string) => boolean;
  approveRectify: (rectifyId: string, reviewer: string) => void;
  rejectRectify: (rectifyId: string, reviewer: string, reason: string) => void;
  submitRectify: (rectifyId: string, data: RectifySubmission) => void;
  getRectifySubmission: (rectifyId: string) => RectifySubmission | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<PourOrder[]>(mockOrders);
  const [rectifyList, setRectifyList] = useState<RectifyItem[]>(mockRectifyList);
  const [rectifySubmissions, setRectifySubmissions] = useState<Record<string, RectifySubmission>>({});

  const confirmOrder = useCallback((orderId: string, confirmerName: string, confirmerRole: string): boolean => {
    let alreadyConfirmed = false;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const exists = o.signRecords.some((r) => r.confirmerName === confirmerName);
        if (exists) {
          alreadyConfirmed = true;
          return o;
        }
        const newRecord: SignRecord = {
          id: `sign_${Date.now()}`,
          confirmerName,
          confirmerRole,
          confirmTime: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '-')
        };
        const updatedSignRecords = [...o.signRecords, newRecord];
        return {
          ...o,
          status: 'confirmed' as const,
          confirmTime: newRecord.confirmTime,
          confirmer: confirmerName,
          signRecords: updatedSignRecords
        };
      })
    );
    console.log('[Store] 确认订单:', orderId, '已确认过:', alreadyConfirmed);
    return !alreadyConfirmed;
  }, []);

  const approveRectify = useCallback((rectifyId: string, reviewer: string) => {
    console.log('[Store] 审核通过:', rectifyId);
    setRectifyList((prev) =>
      prev.map((r) =>
        r.id === rectifyId
          ? {
              ...r,
              status: 'approved' as const,
              statusText: '已通过',
              reviewer,
              reviewTime: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).replace(/\//g, '-')
            }
          : r
      )
    );
  }, []);

  const rejectRectify = useCallback((rectifyId: string, reviewer: string, reason: string) => {
    console.log('[Store] 审核打回:', rectifyId, '原因:', reason);
    setRectifyList((prev) =>
      prev.map((r) =>
        r.id === rectifyId
          ? {
              ...r,
              status: 'rejected' as const,
              statusText: '已打回',
              rejectReason: reason,
              reviewer,
              reviewTime: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).replace(/\//g, '-')
            }
          : r
      )
    );
  }, []);

  const submitRectify = useCallback((rectifyId: string, data: RectifySubmission) => {
    console.log('[Store] 提交整改:', rectifyId);
    setRectifyList((prev) =>
      prev.map((r) =>
        r.id === rectifyId
          ? {
              ...r,
              status: 'submitted' as const,
              statusText: '待审核',
              submitTime: data.submitTime,
              photos: data.photos,
              voiceDesc: data.voiceDuration > 0 ? `语音说明(${data.voiceDuration}")` : undefined,
              rejectReason: undefined,
              reviewer: undefined,
              reviewTime: undefined
            }
          : r
      )
    );
    setRectifySubmissions((prev) => ({
      ...prev,
      [rectifyId]: data
    }));
  }, []);

  const getRectifySubmission = useCallback(
    (rectifyId: string) => rectifySubmissions[rectifyId],
    [rectifySubmissions]
  );

  return (
    <AppContext.Provider
      value={{
        orders,
        rectifyList,
        rectifySubmissions,
        confirmOrder,
        approveRectify,
        rejectRectify,
        submitRectify,
        getRectifySubmission
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
};
