function binCoeff(n, m) {
    if (n < m) {
        return 0;
    }

    if (n < 2 * m) {
        m = n - m;
    }

    let res = new BigNumber(1);
    for (let i = 0; i < m; ++i) {
        res = (res.times(n - i)).div(i + 1);
    }

    return res;
}

class WeakCompositions {
    constructor(parts = 0, m = 0) {
        this.parts = parts;
        this.m = m;
    }

    composition(idx) {
        let b_idx = new BigNumber(idx);
        let wComposition = new Array(this.parts).fill(0);

        let n = wComposition.length - 1;
        let k = this.m;
        let wIt = 0;
        while (n > 0 && k > 0) {
            let i = 0;
            let classSize = binCoeff(n + (k - i) - 1, k - i);
            while (classSize.lte(b_idx) && i < k) {
                b_idx = b_idx.minus(classSize);
                i++;
                classSize = binCoeff(n + (k - i) - 1, k - i);
            }
            wComposition[wIt] = i;
            n--;
            k -= i;
            wIt++;
        }
        wComposition[wIt] = k;

        if (b_idx.gt(0)) {
            throw new Error("Index out-of-range");
        }

        return wComposition;
    }

    getParts() {
        return this.parts;
    }

    getM() {
        return this.m;
    }

    size() {
        return binCoeff(this.parts + this.m - 1, this.m);
    }
}

function gamma(tuple) {
    const mSize = Math.floor(Math.sqrt(tuple.length));

    if (mSize * mSize !== tuple.length) {
        throw new Error("The tuple size is not a perfect square");
    }

    let M = [];
    let tIt = 0;
    for (let i = 0; i < mSize; i++) {
        M.push(new Array(mSize).fill(0));
        for (let j = 0; j < mSize; j++) {
            M[i][j] = tuple[tIt];
            tIt++;
        }
    }

    return M;
}

function invGamma(A) {
    if (A.length === 0) {
        return []; // Return empty array
    }

    let tuple = new Array(A.length * A[0].length).fill(0);

    let tIt = 0; // Index for tuple
    for (var row in A) {
        for (let j = 0; j < A[0].length; j++) {
            tuple[tIt] = A[i][j];
            tIt++;
        }
    }

    return tuple;
}

function sampledVarRhoCounter(sigma, n, m, c, numOfSamples) {
    const indicatorFunction = (matrix) => {
        const result = sigma(matrix);
        if (result <= c) {
            return 1.0;
        }

        return 0.0;
    };

    const wc = new WeakCompositions(n * n, m);

    const random = () => (BigNumber.random().times(wc.size())).integerValue(BigNumber.ROUND_FLOOR);

    let counter = 0;
    for (let i = 0; i < numOfSamples; ++i) {
        const randomIndex = random();
        const mI = gamma(wc.composition(randomIndex)); // Use the composition function
        counter += indicatorFunction(mI); // the promise from the function
    }

    return counter
}

function fullVarRhoCounter(sigma, n, m, c) {
    const indicatorFunction = (matrix) => {
        const result = sigma(matrix);
        if (result <= c) {
            return 1.0;
        }

        return 0.0;
    };

    const wc = new WeakCompositions(n * n, m);
    const numOfMatrices = wc.size();

    let counter = BigNumber(0);
    for (let i = BigNumber(0); i.lt(numOfMatrices); i = i.plus(1)) {
        const mI = gamma(wc.composition(i)); // Use composition function
        counter += indicatorFunction(mI); // the result
    }

    return counter
}

function sampleProbabilityMatrix(A) {
    let total = 0.0;
    const rows = A.length;
    const cols = A[0].length; // Assuming all rows have the same number of columns

    // Generate random numbers and calculate the total
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            A[i][j] = -Math.log(Math.random());
            total += A[i][j];
        }
    }

    // Normalize the matrix elements
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            A[i][j] /= total;
        }
    }
}

function sampledRhoCounter(sigma, n, c, numOfSamples) {
    const indicatorFunction = (matrix) => {
        const result = sigma(matrix);
        if (result <= c) {
            return 1.0;
        }

        return 0.0;
    };

    let M = [];
    for (let i = 0; i < n; i++) {
        M.push(new Array(n).fill(0.0));
    }

    let counter = 0;
    for (let i = 0; i < numOfSamples; ++i) {
        sampleProbabilityMatrix(A);

        counter += indicatorFunction(A);
    }

    return counter
}

function sampledVarRho(sigma, n, m, c, numOfSamples) {
    return sampledVarRhoCounter(sigma, n, m, c, numOfSamples) / numOfSamples;
}

function fullVarRho(sigma, n, m, c) {
    const wc = new WeakCompositions(n * n, m);

    let counter = fullVarRhoCounter(sigma, n, m, c);

    return counter.div(wc.size());
}

function sampledRho(sigma, n, c, numOfSamples) {
    return sampledRhoCounter(sigma, n, c, numOfSamples) / numOfSamples;
}
