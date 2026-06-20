import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PourOrder, RectifyItem, RectifySubmission, SignRecord, SubmissionHistoryEntry, TeamType } from '@/types';
import { mockOrders, mockRectifyList } from '@/data/mockData';

interface AppContextType {
  orders: PourOrder[];
  rectifyList: RectifyItem[];
  rectifySubmissions: Record<string, RectifySubmission>;
  confirmOrder: (orderId: string, confirmerName: string, confirmerRole: string, teamType: TeamType, teamLabel: string) => boolean;
  approveRectify: (rectifyId: string, reviewer: string) => void;
  rejectRectify: (rectifyId: string, reviewer: string, reason: string, rejectPhotos?: string[]) => void;
  submitRectify: (rectifyId: string, data: RectifySubmission) => void;
  getRectifySubmission: (rectifyId: string) => RectifySubmission | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const now = () => new Date().toLocaleString('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit'
}).replace(/\//g, '-');

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<PourOrder[]>(mockOrders);
  const [rectifyList, setRectifyList] = useState<RectifyItem[]>(mockRectifyList);
  const [rectifySubmissions, setRectifySubmissions] = useState<Record<string, RectifySubmission>>({});

  const confirmOrder = useCallback((orderId: string, confirmerName: string, confirmerRole: string, teamType: TeamType, teamLabel: string): boolean => {
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
          teamType,
          teamLabel,
          confirmTime: now()
        };
        const updatedSignRecords = [...o.signRecords, newRecord];
        const signedTeamTypes = new Set(updatedSignRecords.map((r) => r.teamType));
        const requiredTeams = o.requiredTeams || ['scaffolding', 'concrete'];
        const allSigned = requiredTeams.every((t) => signedTeamTypes.has(t));
        return {
          ...o,
          status: allSigned ? 'confirmed' as const : 'pending' as const,
          confirmTime: newRecord.confirmTime,
          confirmer: confirmerName,
          signRecords: updatedSignRecords
        };
      })
    );
    return !alreadyConfirmed;
  }, []);

  const approveRectify = useCallback((rectifyId: string, reviewer: string) => {
    setRectifyList((prev) =>
      prev.map((r) => {
        if (r.id !== rectifyId) return r;
        const reviewTime = now();
        const updatedHistory = r.submissionHistory.map((entry, idx) => {
          if (idx === r.submissionHistory.length - 1) {
            return { ...entry, result: 'approved' as const, reviewer, reviewTime };
          }
          return entry;
        });
        return {
          ...r,
          status: 'approved' as const,
          statusText: '已通过',
          reviewer,
          reviewTime,
          submissionHistory: updatedHistory
        };
      })
    );
  }, []);

  const rejectRectify = useCallback((rectifyId: string, reviewer: string, reason: string, rejectPhotos?: string[]) => {
    setRectifyList((prev) =>
      prev.map((r) => {
        if (r.id !== rectifyId) return r;
        const reviewTime = now();
        const updatedHistory = r.submissionHistory.map((entry, idx) => {
          if (idx === r.submissionHistory.length - 1) {
            return { ...entry, result: 'rejected' as const, rejectReason: reason, rejectPhotos, reviewer, reviewTime };
          }
          return entry;
        });
        return {
          ...r,
          status: 'rejected' as const,
          statusText: '已打回',
          rejectReason: reason,
          reviewer,
          reviewTime,
          submissionHistory: updatedHistory
        };
      })
    );
  }, []);

  const submitRectify = useCallback((rectifyId: string, data: RectifySubmission) => {
    setRectifyList((prev) =>
      prev.map((r) => {
        if (r.id !== rectifyId) return r;
        const newEntry: SubmissionHistoryEntry = {
          round: r.submissionHistory.length + 1,
          photos: data.photos,
          voicePath: data.voicePath,
          voiceDuration: data.voiceDuration,
          textDesc: data.textDesc,
          submitTime: data.submitTime,
          result: 'pending_review'
        };
        return {
          ...r,
          status: 'submitted' as const,
          statusText: '待审核',
          submitTime: data.submitTime,
          photos: data.photos,
          voiceDesc: data.voiceDuration > 0 ? `语音说明(${data.voiceDuration}")` : undefined,
          rejectReason: undefined,
          reviewer: undefined,
          reviewTime: undefined,
          submissionHistory: [...r.submissionHistory, newEntry]
        };
      })
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
