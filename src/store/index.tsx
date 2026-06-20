import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PourOrder, RectifyItem } from '@/types';
import { mockOrders, mockRectifyList } from '@/data/mockData';

interface RectifySubmission {
  photos: string[];
  voicePath?: string;
  voiceDuration: number;
  textDesc: string;
  submitTime: string;
}

interface AppContextType {
  orders: PourOrder[];
  rectifyList: RectifyItem[];
  rectifySubmissions: Record<string, RectifySubmission>;
  confirmOrder: (orderId: string, confirmer?: string) => void;
  submitRectify: (rectifyId: string, data: RectifySubmission) => void;
  getRectifySubmission: (rectifyId: string) => RectifySubmission | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<PourOrder[]>(mockOrders);
  const [rectifyList, setRectifyList] = useState<RectifyItem[]>(mockRectifyList);
  const [rectifySubmissions, setRectifySubmissions] = useState<Record<string, RectifySubmission>>({});

  const confirmOrder = useCallback((orderId: string, confirmer: string = '当前班长') => {
    console.log('[Store] 确认订单:', orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.status === 'pending'
          ? {
              ...o,
              status: 'confirmed' as const,
              confirmTime: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }).replace(/\//g, '-'),
              confirmer
            }
          : o
      )
    );
  }, []);

  const submitRectify = useCallback((rectifyId: string, data: RectifySubmission) => {
    console.log('[Store] 提交整改:', rectifyId, data);
    setRectifyList((prev) =>
      prev.map((r) =>
        r.id === rectifyId
          ? {
              ...r,
              status: 'submitted' as const,
              statusText: '已提交',
              submitTime: data.submitTime,
              photos: data.photos
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
