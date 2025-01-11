import { defineConfig } from "@rsbuild/core";

export default defineConfig({
    dev: {
        hmr: true,
        watchFiles: {
            paths: ['src/**/*.ts', 'src/**/*.tsx', 'public/circuits/*.json'],
        },
    },
});
