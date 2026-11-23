export const MESSAGE_TYPES = {
  Success: 1,
  Fail: 2,
  Warning: 3,
  Info: 4,
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export interface IResponseMsg {
  readonly code: number;
  readonly message: string;
  readonly refrenceID?: number;
  readonly rowNumber?: number;
  readonly excelSheetName?: string;
}

export interface IMessageModel {
  readonly messageType: number;
  readonly messageTypeName: string;
  readonly messages: readonly IResponseMsg[];
}

export interface IMetaModel {
  readonly pageCount: number;
  readonly totalItemCount: number;
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
  readonly isFirstPage: boolean;
  readonly isLastPage: boolean;
  readonly firstItemOnPage: number;
  readonly lastItemOnPage: number;
}

export interface IResponse<T = undefined> {
  readonly message: IMessageModel;
  readonly data: T;
}

export interface IResponseList<T = undefined> {
  readonly message: IMessageModel;
  readonly data: T;
  readonly meta: IMetaModel;
}

export function isApiResponseEnvelope(value: unknown): value is IResponse<unknown> {
  if (typeof value !== 'object' || value === null || !('message' in value)) {
    return false;
  }

  const candidate = value as { readonly message?: unknown };
  if (typeof candidate.message !== 'object' || candidate.message === null) {
    return false;
  }

  const msg = candidate.message as Partial<IMessageModel>;
  return typeof msg.messageType === 'number' && Array.isArray(msg.messages);
}

export function formatResponseMessage(item: IResponseMsg): string {
  const base = item.message?.trim() ?? '';
  if (!base) {
    return '';
  }

  const rowPart = item.rowNumber != null ? ` (#${String(item.rowNumber)})` : '';
  const sheetPart = item.excelSheetName ? ` [${item.excelSheetName}]` : '';
  return `${base}${rowPart}${sheetPart}`;
}

export interface PaginatedResult<T> {
  readonly data: T;
  readonly meta?: IMetaModel;
}

export function unwrapResponseData<T>(payload: unknown): T {
  return isApiResponseEnvelope(payload) ? (payload.data as T) : (payload as T);
}

export function unwrapPaginatedResponse<T>(payload: unknown): PaginatedResult<T> {
  if (isApiResponseEnvelope(payload)) {
    const paginated = payload as Partial<IResponseList<T>>;
    return {
      data: payload.data as T,
      meta: paginated.meta,
    };
  }
  return { data: payload as T };
}
