export type IdModel<M> = {
    [P in keyof M]?: M[P];
} & { id: string };
