interface InterpolateParam<T extends number | number[]> {
    x: number;
    y: number;
    g00: T;
    g10: T;
    g01: T;
    g11: T;
}

interface InterpolateFunc<T extends number | number[]> {
    (param: InterpolateParam<T>): T
}

function bilinearInterpolateScalar(p: InterpolateParam<number>): number {
    const rx = (1 - p.x);
    const ry = (1 - p.y);
    return p.g00 * rx * ry + p.g10 * p.x * ry + p.g01 * rx * p.y + p.g11 * p.x * p.y;
}

function bilinearInterpolateVector(p: InterpolateParam<number[]>): number[] {
    const rx = (1 - p.x);
    const ry = (1 - p.y);
    const a = rx * ry;
    const b = p.x * ry;
    const c = rx * p.y;
    const d = p.x * p.y;
    const u: number = p.g00[0] * a + p.g10[0] * b + p.g01[0] * c + p.g11[0] * d;
    const v: number = p.g00[1] * a + p.g10[1] * b + p.g01[1] * c + p.g11[1] * d;
    return [u, v, Math.sqrt(u * u + v * v)];
}
