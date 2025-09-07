import {ObjectLiteral, Repository, SelectQueryBuilder} from "typeorm";

export interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export async function paginate<T extends ObjectLiteral>(
    repo: Repository<T> | SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = 10,
    alias?: string
): Promise<PaginationResult<T>> {
    const offset = (page - 1) * limit;

    let qb: SelectQueryBuilder<T>;
    if (repo instanceof Repository) {
        qb = repo.createQueryBuilder(alias || "t");
    } else {
        qb = repo;
    }

    const [data, total] = await qb.skip(offset).take(limit).getManyAndCount();

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
