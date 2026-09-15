import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import configPrettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'

// import { loadEnv } from 'vite'
// const env = loadEnv(mode, process.cwd())
export default [
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 12,
      sourceType: 'module'
    }
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    ignores: ['**/dist/**', '**/node_modules/**'],
    plugins: {
      prettier: pluginPrettier
    },
    rules: {
      ...configPrettier.rules,
      ...pluginPrettier.configs.recommended.rules,
      // 可根据需要调整规则
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ],
      // 'prettier/prettier': 'off',
      'no-unused-vars': 'off', //
      'no-var': 'error', // 要求使用 let 或 const 而不是 var
      'no-multiple-empty-lines': ['warn', { max: 2 }], // 不允许多个空行
      // 'no-console': env.VITE_APP_TITLE === 'production' ? 'error' : 'off',
      // 'no-debugger': env.VITE_APP_TITLE === 'production' ? 'error' : 'off',
      'no-unexpected-multiline': 'off', // 禁止空余的多行
      'no-useless-escape': 'off',
      'vue/multi-word-component-names': 'off', // 要求组件名称始终为 “-” 链接的单词
      'vue/script-setup-uses-vars': 'error', // 防止<script setup>使用的变量<template>被标记为未使用
      'vue/no-mutating-props': 'off', // 不允许组件 prop的改变
      'vue/attribute-hyphenation': 'off',
      'no-undef': 'off',
      'no-prototype-builtins': 'off',
      'vue/no-unused-vars': 'off',
      'vue/valid-define-emits': 'off',
      'no-empty': 'off',
      'vue/require-valid-default-prop': 'off'
    }
  }
]
