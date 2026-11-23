// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const sheriff = require('@softarc/eslint-plugin-sheriff');

const PHYSICAL_UTILITY_REGEX =
  /(?:^|\s|:|-)(?:ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br)-[a-zA-Z0-9_./[\]%]+|(?:^|\s|:)(?:text-left|text-right|float-left|float-right)(?=\s|$|["'`])/u;

const ALLOW_PHYSICAL_MARKER = /moz-allow-physical:\s*\S+/u;
const ALLOW_LITERAL_MARKER = /moz-allow-literal:\s*\S+/u;

const mozakretyPlugin = {
  rules: {
    'no-physical-direction': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Forbid physical-direction Tailwind utilities (ml-*, mr-*, pl-*, pr-*, left-*, right-*, text-left, text-right, border-l/r, rounded-l/r, float-left/right). Use logical utilities (ms-*, me-*, ps-*, pe-*, start-*, end-*, text-start, text-end, border-s/e, rounded-s/e).',
        },
        schema: [],
      },
      create(context) {
        const sourceText = context.sourceCode?.text ?? '';
        if (ALLOW_PHYSICAL_MARKER.test(sourceText)) {
          return {};
        }

        function checkValue(node, text) {
          if (typeof text !== 'string') {
            return;
          }
          const match = PHYSICAL_UTILITY_REGEX.exec(text);
          if (match) {
            context.report({
              node,
              message: `Physical-direction utility "${match[0].trim()}" is forbidden (Constitution Principle IX). Use logical Tailwind utilities (ms-*, me-*, ps-*, pe-*, start-*, end-*, text-start, text-end, border-s/e, rounded-s/e).`,
            });
          }
        }

        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              checkValue(node, node.value);
            }
          },
          TemplateElement(node) {
            checkValue(node, node.value?.raw ?? '');
          },
          TextAttribute(node) {
            if (node.name === 'class' || node.name === 'ngClass') {
              checkValue(node, node.value);
            }
          },
        };
      },
    },
    'no-translate-instant': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Forbid TranslateService.instant() in application code; use translate pipe in templates or toSignal(translate.stream(...)) in TypeScript.',
        },
        schema: [],
      },
      create(context) {
        return {
          'CallExpression[callee.type="MemberExpression"][callee.property.name="instant"]'(node) {
            context.report({
              node,
              message:
                'TranslateService.instant() is forbidden outside unit tests. Use the translate pipe in templates or toSignal(translate.stream(...)) in TypeScript.',
            });
          },
        };
      },
    },
    'no-untranslated-template-text': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Forbid hardcoded user-facing text nodes in Angular templates; use the ngx-translate pipe.',
        },
        schema: [],
      },
      create(context) {
        const sourceText = context.sourceCode?.text ?? '';
        if (ALLOW_LITERAL_MARKER.test(sourceText)) {
          return {};
        }
        return {
          Text(node) {
            const value = typeof node.value === 'string' ? node.value.trim() : '';
            if (value.length > 0 && /\p{L}/u.test(value)) {
              context.report({
                node,
                message: `Hardcoded user-facing template string "${value.slice(0, 40)}" is forbidden (Constitution Principle IX). Use an ngx-translate key with the translate pipe.`,
              });
            }
          },
        };
      },
    },
  },
};

module.exports = defineConfig([
  {
    ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'tools/**'],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      mozakrety: mozakretyPlugin,
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      sheriff.configs.all,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app', 'moz'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'moz'],
          style: 'kebab-case',
        },
      ],
      'mozakrety/no-physical-direction': 'error',
      'mozakrety/no-translate-instant': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['primeng', 'primeng/*', '@primeuix/*'],
              message:
                'Direct PrimeNG imports are forbidden outside src/app/shared/ui (and core theme config). Use moz-* wrapper components from shared/ui.',
            },
            {
              regex: '^\\.{1,2}/(?:\\.\\./)*(?:core|shared|domain)(?:/|$)',
              message:
                "Use the public path aliases instead of relative paths into core/shared/domain: '@core/<module>', '@shared/ui', or '@domain/<capability>'.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/app/shared/ui/**/*.ts',
      'src/app/core/theme/**/*.ts',
      'src/app/core/config/**/*.ts',
      'src/app/core/providers/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      'mozakrety/no-translate-instant': 'off',
    },
  },
  {
    files: ['src/app/shared/ui/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/no-output-on-prefix': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-unassigned-vars': 'off',
    },
  },
  {
    files: ['src/app/**/*.html'],
    plugins: {
      mozakrety: mozakretyPlugin,
    },
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      'mozakrety/no-physical-direction': 'error',
      'mozakrety/no-untranslated-template-text': 'error',
    },
  },
  {
    files: ['src/app/shared/ui/**/*.html'],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
    },
  },
]);
