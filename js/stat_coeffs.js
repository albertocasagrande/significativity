function sumMatrix(A) {
    var res = 0

    for (var row in A) {
        for (var col in A) {
            res = res + A[row][col]
        }
    }

    return res
}

function countNotNullRowsCols(A) {
    var rows = 0;
    var cols = 0;

    for (var row in A) {
        var col = 0;
        while (col < A.length && A[row][col] == 0) {
            col = col + 1;
        }
        rows = rows + (col < A.length && A[row][col] != 0 ? 1 : 0);
    }

    for (var col in A[0]) {
        var row = 0;
        while (row < A.length && A[row][col] == 0) {
            row = row + 1;
        }
        cols = cols + (row < A.length && A[row][col] != 0 ? 1 : 0);
    }

    return [rows, cols];
}

function _H_Y(A) {
    var h = 0
    for (var row in A) {
        var py = 0
        for (var col in A[row]) {
            py = py + A[row][col]
        }
        if (py != 0) {
            h = h - py * Math.log2(py)
        }
    }

    return h
}


function _H_X(A) {
    At = A[0].map((_, col) => A.map(row => row[col]));

    return _H_Y(At)
}

function _H_XY(A) {
    var h = 0;
    for (var row in A) {
        for (var col in A[row]) {
            if (A[row][col] != 0) {
                h = h - A[row][col] * Math.log2(A[row][col])
            }
        }
    }

    return h
}

function H_X(A) {
    var sumA = sumMatrix(A)

    return _H_X(A) / sumA + Math.log2(sumA)
}

function H_Y(A) {
    var sumA = sumMatrix(A)

    return _H_Y(A) / sumA + Math.log2(sumA)
}

function H_XY(A) {
    var sumA = sumMatrix(A)

    return _H_XY(A) / sumA + Math.log2(sumA)
}

function limit_single_row(cols, not_null_cols) {
    return (cols - not_null_cols) / cols;
}

function IAstar(A) {
    var not_nulls = countNotNullRowsCols(A);

    for (var idx in not_nulls) {
        if (not_nulls[idx] == 1) {
            return limit_single_row(A.length, not_nulls[1 - idx]);
        }
    }

    var sumA = sumMatrix(A);
    var zero = sumA * Math.log2(sumA);

    var _H_YA = _H_Y(A);
    var _H_XA = _H_X(A);

    if (_H_XA < _H_YA) {
        return (_H_XA + _H_YA - _H_XY(A) + zero) / (_H_XA + zero);
    }

    return (_H_XA + _H_YA - _H_XY(A) + zero) / (_H_YA + zero)
}

function _getProbabilityMatrix(A) {
    let sum = sumMatrix(A);

    const P = [];
    for (var row in A) {
        let new_row = new Array(row.length).fill(0.0);
        for (var col in A[row]) {
            new_row[col] = A[row][col] / sum;
        }
        P.push(new_row);
    }

    return P;
}

function _getColumnProbability(P) {
    let columnProb = new Array(P[0].length).fill(0.0);

    for (var row in P) {
        for (var col in P[row]) {
            columnProb[col] += P[row][col];
        }
    }

    return columnProb;
}

function _getRowProbability(P) {
    let rowProb = new Array(P.length).fill(0.0);

    for (var row in P) {
        for (var col in P[row]) {
            rowProb[row] += P[row][col];
        }
    }

    return rowProb;
}

function kappa(A) {
    let P = _getProbabilityMatrix(A);

    let p0 = 0.0;
    let pe = 0.0;

    const R = _getRowProbability(P);
    const C = _getColumnProbability(P);

    for (var row in P) {
        p0 += P[row][row];
        pe += R[row] * C[row];
    }

    return (p0 - pe) / (1 - pe);
}

function diagNotSmallerThanHalf(A) {
    var total = 0;
    var diag = 0;
    for (var y = 0; y < A.length; y++) {
        for (var x = 0; x < A[y].length; x++) {
            total += A[y][x];
        }
        diag += A[y][y];
    }

    return 2 * diag >= total;
}

const sigmas = { "Cohen's kappa": kappa, "IA*": IAstar };