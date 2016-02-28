/// <reference path="Grib2Data.ts" />
/// <reference path="Interpolate.ts" />

import { dataSource } from './Grid2Data.ts';
import { bilinearInterpolateVector } from './Interpolate.ts';

type Grid<T> = T[][]
type Field<T> = (i: number, j: number) => T

interface GridResult<T> {
    grid: Grid<T>;
    field: Field<T>;
    date: Date;
    dataSource: string;
}

function floorMod(a: number, n: number):number {
    const f = a - n * Math.floor(a / n);
    // HACK: when a is extremely close to an n transition, f can be equal to n. This is bad because f must be
    //       within range [0, n). Check for this corner case. Example: a:=-1e-16, n:=10. What is the proper fix?
    return f === n ? 0 : f;
}

function isValue(x: any) {
    return x != null && x != undefined;
}

function makeField<T extends number | number[]>(header: Header, grid: Grid<T>, interpolate: InterpolateFunc<T>): Field<T> {
    const λ0 = header.lo1;
    const φ0 = header.la1;
    const Δλ = header.dx;
    const Δφ = header.dy;
    return (λ: number, φ: number) => {
        const i = floorMod(λ - λ0, 360) / Δλ;
        const j = (φ0 - φ) / Δφ;
        const fi = Math.floor(i);
        const ci = fi + 1;
        const fj = Math.floor(j);
        const cj = fj + 1;
        let row: T[];
        if ((row = grid[fj])) {
            const g00 = row[fi];
            const g10 = row[ci];
            if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
                const g01 = row[fi];
                const g11 = row[ci];
                if (isValue(g01) && isValue(g11)) {
                    // All four points found, so interpolate the value.
                    return interpolate({
                        x: i - fi,
                        y: j - fj,
                        g00,
                        g10, g01, g11
                    });
                }
            }
        }
        console.warn("cannot interpolate: " + λ + "," + φ + ": " + fi + " " + ci + " " + fj + " " + cj);
        return null;
    }
}

function makeGrid<T extends number | number[]>(accessor: (idx: number) => T, ni: number, nj: number, isContinuous: boolean) {
    let grid: Grid<T> = [];
    let p = 0;
    for (let j = 0; j < nj; ++j) {
        let row: T[] = [];
        for (let i = 0; i < ni; ++i, ++p) {
            row[i] = accessor(p);
        }
        if (isContinuous) {
            row.push(row[0]);
        }
        grid[j] = row;
    }
    return grid;
}

function build(data: Grib2Data,
    interpolateFunc: InterpolateFunc<number[]> = bilinearInterpolateVector): GridResult<number[]> {
    const header1 = data.segments[0].header;
    const accessor = (idx: number) => data.segments.map(segment => segment.data[idx]);
    const dataSource = dataSource(header1);
    const date = new Date(header1.refTime);
    date.setHours(date.getHours() + header1.forecastTime);
    const isContinuous = Math.floor(header1.nx * header1.dx) >= 360;
    const grid = makeGrid(accessor, header1.nx, header1.ny, isContinuous);
    const field = makeField(header1, grid, interpolateFunc);
    return {
        grid,
        date,
        dataSource,
        field
    }
}
