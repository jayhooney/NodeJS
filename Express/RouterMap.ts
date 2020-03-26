/**
 * 라우터 정의 인터페이스
 *
 * @export
 * @interface IRouterInfo
 */
export interface IRouterInfo {
  method: string;
  addr: string;
  name: string;
  query: string;
}

/**
 * 라우터 맵
 */
export const routerMap = Object.freeze(
  new Map([
    [
      400,
      {
        method: "POST",
        addr: "/addProject",
        name: "ADD_PROJECT",
        query: "INSERT QUERY;"
      }
    ],
    [
      401,
      {
        method: "DELETE",
        addr: "/deleteProject",
        name: "DELETE_PROJECT",
        query: "DELETE QUERY;"
      }
    ],
    [
      402,
      {
        method: "PUT",
        addr: "/updateProject",
        name: "UPDATE_PROJECT",
        query: "UPDATE QUERY;"
      }
    ],
    [
      403,
      {
        method: "GET",
        addr: "/projectList",
        name: "PROJECT_LIST",
        query: `SELECT QUERY;`
      }
    ]
  ])
);
