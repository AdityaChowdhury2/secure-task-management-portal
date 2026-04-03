import { Prisma, PrismaClient } from "@prisma/client";

export type QueryBuilderResult<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export class PrismaQueryBuilder<T, Args extends Prisma.SelectSubset<any, any>> {
  private prismaModel: any;
  private args: Args;
  private query: Record<string, any>;

  private page = 1;
  private limit = 10;
  private skip = 0;

  constructor(prismaModel: any, query: Record<string, any>) {
    this.prismaModel = prismaModel;
    this.query = query;
    this.args = {} as Args;
  }

  search(fields: string[]) {
    const searchTerm = this.query.searchTerm;
    if (searchTerm && typeof searchTerm === "string") {
      this.args.where = {
        OR: fields.map((field) => ({
          [field]: { contains: searchTerm },
        })),
      };
    }

    return this;
  }

  // filter() {
  //   const { page, limit, sort, fields, searchTerm, ...filters } = this.query;

  //   const whereConditions: Record<string, any> = {};

  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (typeof value === "string") {
  //       if (value.startsWith("gt:")) {
  //         whereConditions[key] = { gt: new Date(value.slice(3)) };
  //       } else if (value.startsWith("gte:")) {
  //         whereConditions[key] = { gte: new Date(value.slice(4)) };
  //       } else if (value.startsWith("lt:")) {
  //         whereConditions[key] = { lt: new Date(value.slice(3)) };
  //       } else if (value.startsWith("lte:")) {
  //         whereConditions[key] = { lte: new Date(value.slice(4)) };
  //       } else if (value.startsWith("from:")) {
  //         whereConditions[key] = {
  //           ...(whereConditions[key] || {}),
  //           gte: new Date(value.slice(5)),
  //         };
  //       } else if (value.startsWith("to:")) {
  //         whereConditions[key] = {
  //           ...(whereConditions[key] || {}),
  //           lte: new Date(value.slice(3)),
  //         };
  //       } else {
  //         whereConditions[key] = value;
  //       }
  //     } else {
  //       whereConditions[key] = value;
  //     }
  //   });

  //   this.args.where = {
  //     ...(this.args.where || {}),
  //     ...whereConditions,
  //   };

  //   return this;
  // }

  // filter() {
  //   const {
  //     page,
  //     limit,
  //     sort,
  //     fields,
  //     searchTerm, // ✅ ensure this is destructured
  //     ...filters
  //   } = this.query;

  //   const whereConditions: Record<string, any> = {};

  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (typeof value === "string") {
  //       if (value.startsWith("gt:")) {
  //         whereConditions[key] = { gt: value.slice(3) };
  //       } else if (value.startsWith("gte:")) {
  //         whereConditions[key] = { gte: value.slice(4) };
  //       } else if (value.startsWith("lt:")) {
  //         whereConditions[key] = { lt: value.slice(3) };
  //       } else if (value.startsWith("lte:")) {
  //         whereConditions[key] = { lte: value.slice(4) };
  //       } else {
  //         whereConditions[key] = value;
  //       }
  //     } else {
  //       whereConditions[key] = value;
  //     }
  //   });

  //   this.args.where = {
  //     ...(this.args.where || {}),
  //     ...whereConditions,
  //   };

  //   return this;
  // }

  filter() {
    const { page, limit, sort, fields, searchTerm, ...filters } = this.query;
    console.log("filters ==>", filters);

    const whereConditions: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];

      values.forEach((val) => {
        if (typeof val === "string") {
          if (val.startsWith("gt:")) {
            whereConditions[key] = {
              ...(whereConditions[key] || {}),
              gt: new Date(val.slice(3)),
            };
          } else if (val.startsWith("gte:")) {
            whereConditions[key] = {
              ...(whereConditions[key] || {}),
              gte: new Date(val.slice(4)),
            };
          } else if (val.startsWith("lt:")) {
            whereConditions[key] = {
              ...(whereConditions[key] || {}),
              lt: new Date(val.slice(3)),
            };
          } else if (val.startsWith("lte:")) {
            whereConditions[key] = {
              ...(whereConditions[key] || {}),
              lte: new Date(val.slice(4)),
            };
          } else if (val.startsWith("from:")) {
            whereConditions[key] = {
              ...(whereConditions[key] || {}),
              gte: new Date(val.slice(5)),
            };

            // if user did not also send "to:", default lte = now
            if (!values.some((v) => v.startsWith("to:"))) {
              whereConditions[key].lte = new Date();
            }
          } else if (val.startsWith("to:")) {
            const date = new Date(val.slice(3));
            date.setUTCHours(23, 59, 59, 999); // include full day
            whereConditions[key] = {
              ...(whereConditions[key] || {}),
              lte: date,
            };
          } else {
            whereConditions[key] = val;
          }
        }
      });
    });

    this.args.where = {
      ...(this.args.where || {}),
      ...whereConditions,
    };

    return this;
  }

  sort() {
    console.log("sort ==>", this.query.sort);
    if (this.query.sort) {
      const fields = this.query.sort.split(",");
      this.args.orderBy = fields.map((field: string) => {
        const order: Prisma.SortOrder = field.startsWith("-") ? "desc" : "asc";
        const fieldName = field.replace(/^-/, "");
        return { [fieldName]: order };
      });
    } else {
      this.args.orderBy = [{ createdAt: "desc" }];
    }

    return this;
  }

  paginate() {
    this.page = Number(this.query.page) || 1;
    this.limit = Number(this.query.limit) || 10;
    this.skip = (this.page - 1) * this.limit;
    this.args.skip = this.skip;
    this.args.take = this.limit;
    return this;
  }

  fields(defaultFields: string[] = []) {
    if (this.query.fields) {
      // client-specified fields override everything
      const fields = this.query.fields.split(",");
      this.args.select = fields.reduce(
        (acc: Record<string, boolean>, field: string) => {
          acc[field.trim()] = true;
          return acc;
        },
        {}
      );
    } else if (defaultFields.length) {
      // only apply defaults if query.fields not provided
      this.args.select = defaultFields.reduce(
        (acc: Record<string, boolean>, field: string) => {
          acc[field] = true;
          return acc;
        },
        {}
      );
    }
    // if nothing set → leave args.select undefined → Prisma will return all fields
    return this;
  }

  include(includeArgs: Record<string, any>) {
    if (this.args.select) {
      // already doing a select (fields picked) → merge relation into select
      this.args.select = {
        ...this.args.select,
        ...includeArgs, // e.g. { employee: true } or { employee: { select: {...} } }
      };
    } else {
      // no select → use Prisma’s default include behavior (all fields + relation(s))
      this.args.include = includeArgs;
    }
    return this;
  }

  // include(includeArgs: Args["include"]) {
  //   this.args.include = includeArgs;
  //   return this;
  // }

  async buildWithMeta(): Promise<QueryBuilderResult<T>> {
    const total = await this.prismaModel.count({ where: this.args.where });
    const data = await this.prismaModel.findMany(this.args);

    return {
      data,
      meta: {
        total,
        page: this.page,
        limit: this.limit,
        pages: Math.ceil(total / this.limit),
      },
    };
  }
}
