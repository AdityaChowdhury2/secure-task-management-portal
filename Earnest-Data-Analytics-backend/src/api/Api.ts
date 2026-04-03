/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CreateEmployeeDTO {
  /**
   * @format email
   * @example "john.doe@example.com"
   */
  email: string;
  /** @example "P@ssw0rd!" */
  password: string;
  /** @example "+1234567890" */
  phone?: string | null;
  /** @example "John Doe" */
  name: string;
  role: "ADMIN" | "EMPLOYEE";
}

export interface TResponse {
  /** @example 200 */
  statusCode?: number;
  /** @example true */
  success?: boolean;
  /** @example "Operation completed successfully" */
  message?: string;
  data?: object;
}

export interface EmployeeData {
  /** @example "cjld2cjxh0000qzrmn831i7rn" */
  id: string;
  /**
   * @format email
   * @example "jane.doe@example.com"
   */
  email: string;
  /** @example "Jane Doe" */
  name: string;
  /** @example "EMP-0001" */
  employeeId: string;
  /** @example "+1234567890" */
  phone: string;
}

export type CreateEmployeeResponse = TResponse & {
  data?: EmployeeData;
};

export type AllEmployeesResponse = TResponse & {
  data?: EmployeeData[];
};

export type EmployeeDetailsResponse = TResponse & {
  data?: EmployeeData;
};

export interface TErrorSource {
  /**
   * The field (or array index) that caused the error
   * @example "email"
   */
  path: string | number;
  /**
   * A human‐readable error message for this field
   * @example "Email is required"
   */
  message: string;
}

export interface TGenericErrorResponse {
  /**
   * HTTP status code of the error
   * @format int32
   * @example 400
   */
  statusCode: number;
  /**
   * A general error message
   * @example "Validation Error"
   */
  message: string;
  /** Field‐specific error details */
  errorSources: TErrorSource[];
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Ahlan Printing Works API
 * @version 1.0.0
 *
 * API documentation for Ahlan Printing Works backend
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Auth
     * @name V1AuthLoginCreate
     * @summary Login user
     * @request POST:/api/v1/auth/login
     * @secure
     */
    v1AuthLoginCreate: (
      data: {
        /** @example "admin@ahlan.com" */
        email: string;
        /** @example "admin123" */
        password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/v1/auth/login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name V1AuthRefreshTokenCreate
     * @summary Refresh access token using refresh token
     * @request POST:/api/v1/auth/refresh-token
     * @secure
     */
    v1AuthRefreshTokenCreate: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/api/v1/auth/refresh-token`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name V1AuthLogoutDelete
     * @summary Logout user and revoke token
     * @request DELETE:/api/v1/auth/logout
     * @secure
     */
    v1AuthLogoutDelete: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/auth/logout`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Employees
     * @name V1EmployeeCreateCreate
     * @summary Create a new employee
     * @request POST:/api/v1/employee/create
     * @secure
     */
    v1EmployeeCreateCreate: (
      data: CreateEmployeeDTO,
      params: RequestParams = {},
    ) =>
      this.request<CreateEmployeeResponse, TGenericErrorResponse | void>({
        path: `/api/v1/employee/create`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Employees
     * @name V1EmployeeList
     * @summary Get all employees
     * @request GET:/api/v1/employee
     * @secure
     */
    v1EmployeeList: (params: RequestParams = {}) =>
      this.request<AllEmployeesResponse, void>({
        path: `/api/v1/employee`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Employees
     * @name V1EmployeeDetail
     * @summary Get employee details
     * @request GET:/api/v1/employee/{id}
     * @secure
     */
    v1EmployeeDetail: (id: any, params: RequestParams = {}) =>
      this.request<EmployeeDetailsResponse, void>({
        path: `/api/v1/employee/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Health
     * @name V1HealthList
     * @summary Health check endpoint
     * @request GET:/api/v1/health
     * @secure
     */
    v1HealthList: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example "ok" */
          status?: string;
          /** @example "connected" */
          database?: string;
        },
        void
      >({
        path: `/api/v1/health`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
