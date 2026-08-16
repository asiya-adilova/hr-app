export class PageInfo {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;

  constructor(pageIndex: number, pageSize: number, totalCount: number) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.totalCount = totalCount;

    this.totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
  }
}

export class PagedResult<T> {
  data: T[];
  paging: PageInfo;

  constructor(
    data: T[],
    pageIndex: number,
    pageSize: number,
    totalCount: number,
  ) {
    this.data = data;
    this.paging = new PageInfo(pageIndex, pageSize, totalCount);
  }
}
