interface BranchOption {
    name: string;
    value: string;
}

interface GetBranchesOptions {
    withMergedStatus?: boolean;
}

export type GetBranchesFn = (
    options?: GetBranchesOptions
) => Promise<BranchOption[]>;
