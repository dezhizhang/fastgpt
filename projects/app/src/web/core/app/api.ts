import { GET, POST, DELETE, PUT } from '@/web/common/api/request';
import type { AppSchema } from '@/types/mongoSchema';
import type { AppListItemType, AppUpdateParams } from '@/types/app';
import { RequestPaging } from '@/types/index';
import { addDays } from 'date-fns';
import type { GetAppChatLogsParams } from '@/global/core/api/appReq.d';
import type { CreateAppParams } from '@/types/app';

/**
 * 获取模型列表
 */
export const getMyApps = () => GET<AppListItemType[]>('/app/myApps');

/**
 * 创建一个模型
 */
export const postCreateApp = (data: CreateAppParams) => POST<string>('/app/create', data);

/**
 * 根据 ID 删除模型
 */
export const delModelById = (id: string) => DELETE(`/app/del?appId=${id}`);

/**
 * 根据 ID 获取模型
 */
export const getModelById = (id: string) => GET<AppSchema>(`/app/detail?appId=${id}`);

/**
 * 根据 ID 更新模型
 */
export const putAppById = (id: string, data: AppUpdateParams) =>
  PUT(`/app/update?appId=${id}`, data);

/* 共享市场 */
/**
 * 获取共享市场模型
 */
export const getShareModelList = (data: { searchText?: string } & RequestPaging) =>
  POST(`/app/share/getModels`, data);

/**
 * 收藏/取消收藏模型
 */
export const triggerModelCollection = (appId: string) =>
  POST<number>(`/app/share/collection?appId=${appId}`);

// ====================== data
export const getAppTotalUsage = (data: { appId: string }) =>
  POST<{ date: String; total: number }[]>(`/app/data/totalUsage`, {
    ...data,
    start: addDays(new Date(), -13),
    end: addDays(new Date(), 1)
  }).then((res) => (res.length === 0 ? [{ date: new Date(), total: 0 }] : res));

// =================== chat logs
export const getAppChatLogs = (data: GetAppChatLogsParams) => POST(`/app/getChatLogs`, data);
