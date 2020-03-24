const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const PurgecssPlugin = require('purgecss-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require('path');
const glob = require('glob-all');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'production';
const sass = require('sass');

module.exports = webpackMerge(commonConfig({ env: ENV }), {
    // Enable source maps. Please note that this will slow down the build.
    // You have to enable it in Terser config below and in tsconfig.json as well
    // devtool: 'source-map',
    entry: {
        global: './src/main/webapp/content/scss/global.scss',
        main: './src/main/webapp/app/app.main'
    },
    output: {
        path: utils.root('build/resources/main/static/'),
        filename: 'app/[name].[hash].bundle.js',
        chunkFilename: 'app/[id].[hash].chunk.js'
    },
    module: {
        rules: [
        {
            test: /\.scss$/,
            use: ['to-string-loader', 'css-loader', 'postcss-loader', {
                loader: 'sass-loader',
                options: { implementation: sass }
            }],
            exclude: /(vendor\.scss|global\.scss)/
        },
        {
            test: /(vendor\.scss|global\.scss)/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: '../'
                    }
                },
                'css-loader',
                'postcss-loader',
                {
                    loader: 'sass-loader',
                    options: { implementation: sass }
                }
            ]
        },
        {
            test: /\.css$/,
            use: ['to-string-loader', 'css-loader'],
            exclude: /(vendor\.css|global\.css)/
        },
        {
            test: /(vendor\.css|global\.css)/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: '../'
                    }
                },
                'css-loader',
                'postcss-loader'
            ]
        }]
    },
    optimization: {
        runtimeChunk: false,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                cache: true,
                // sourceMap: true, // Enable source maps. Please note that this will slow down the build
                terserOptions: {
                    ecma: 6,
                    ie8: false,
                    toplevel: true,
                    module: true,
                    compress: {
                        dead_code: true,
                        warnings: false,
                        properties: true,
                        drop_debugger: true,
                        conditionals: true,
                        booleans: true,
                        loops: true,
                        unused: true,
                        toplevel: true,
                        if_return: true,
                        inline: true,
                        join_vars: true,
                        ecma: 6,
                        module: true
                    },
                    output: {
                        comments: false,
                        beautify: false,
                        indent_level: 2,
                        ecma: 6
                    },
                    mangle: {
                        module: true,
                        toplevel: true
                    }
                }
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'content/[name].[contenthash].css',
            chunkFilename: 'content/[id].css'
        }),
        new PurgecssPlugin({
            paths: glob.sync([
                path.join(utils.root('src/main/webapp'), '*.*'),
                path.join(utils.root('src/main/webapp/app'), '**/*.*')
            ]),
            whitelist: [
                'close', // Toast close button
                'fade', 'show', // Popups
                'pagination' // Pager
            ], 
            // selectors beginning pattern and all children of the selectors are preserved
            // see: https://www.purgecss.com/configuration
            whitelistPatternsChildren: [
                /^jhi/, // Jhipster
                /^alert/, // Toasts
                /^alerts/, // Toasts
                /^fa/, // Font Awesome
                /^ui/, // PrimeNG
                /^ng/, // Angular
                /^pi/, // Angular
                /^modal/, // Popups
                /^ngb/, // NG-Bootstrap
                /^form/, // Forms
                /^row/, /^col/, /^justify/, // https://getbootstrap.com/docs/4.0/layout/overview/
                /^d-/, // https://getbootstrap.com/docs/4.0/utilities/display/
                /page/, // Pager
                /^progress/, /^bg-/, // Progress bar 
                /running/ // Spinner
            ]
        }),
        new MomentLocalesPlugin({
            localesToKeep: [
                // jhipster-needle-i18n-language-moment-webpack - JHipster will add/remove languages in this array
            ]
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            // Webpack statistics in target folder
            reportFilename: '../stats.html'
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            exclude: [/swagger-ui/]
        })
    ],
    mode: 'production'
});
