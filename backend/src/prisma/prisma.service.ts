import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const SOFT_DELETE_MODELS = new Set([
  'Employee',
  'Education',
  'Relative',
  'WorkExperience',
]);

function withNotDeleted<T extends { where?: Record<string, unknown> }>(
  model: string,
  args: T,
): T {
  if (!SOFT_DELETE_MODELS.has(model)) {
    return args;
  }

  const where = args.where ?? {};
  if (Object.prototype.hasOwnProperty.call(where, 'isDeleted')) {
    return args;
  }

  return {
    ...args,
    where: {
      ...where,
      isDeleted: false,
    },
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });

    const client = this.$extends({
      query: {
        $allModels: {
          findMany({ model, args, query }) {
            return query(withNotDeleted(model, args));
          },
          findFirst({ model, args, query }) {
            return query(withNotDeleted(model, args));
          },
          findFirstOrThrow({ model, args, query }) {
            return query(withNotDeleted(model, args));
          },
          count({ model, args, query }) {
            return query(withNotDeleted(model, args));
          },
        },
      },
    });

    const instance = client as unknown as this;
    instance.onModuleInit = () => this.$connect();
    instance.onModuleDestroy = () => this.$disconnect();
    return instance;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
