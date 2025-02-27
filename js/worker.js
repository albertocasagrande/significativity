importScripts('stat_coeffs.js');
importScripts('https://cdn.jsdelivr.net/npm/bignumber.js@9.1.2/bignumber.min.js');
importScripts('significativity.js');

self.onmessage = (e) => {
    const sigma = sigmas[e.data.sigma_name];
    const n = e.data.matrix_size;
    const m = e.data.num_of_tests;
    const c = e.data.sigma_value;
    const M = e.data.num_of_samples;

    self.postMessage({
        "in_set": sampledVarRhoCounter(sigma, n, m, c, M),
        "num_of_samples": M
    });
};
