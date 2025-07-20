const inputColor = '#ff0000';
const fontsize = 14;

export const cssBaseLineOverrides = () => {
  return {
    '@global': {
      html: {
        lineHeight: 1.15,
        '-ms-text-size-adjust': '100%',
        '-webkit-text-size-adjust': '100%',
        boxSizing: 'border-box' as any,
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
      },
      '& body, html': {
        fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, sans-serif',
        fontSize: fontsize,
        margin: 0,
        padding: 0,
        height: '100%',
        width: '100%',
      },
      '#root': {
        height: '100%',
      },
      '*': {
        boxSizing: 'border-box' as any,
      },
      '.Mui-error input': {
        '[class$="placeholder"]': {
          color: inputColor,
        },
        '&::-webkit-input-placeholder': {
          color: inputColor,
          fontSize: fontsize,
          opacity: '1 !important',
        },

        '&::-moz-placeholder': {
          color: inputColor,
          fontSize: fontsize,
          opacity: '1 !important',
        },

        '&:-ms-input-placeholder': {
          color: inputColor,
          fontSize: fontsize,
          opacity: '1 !important',
        },

        '&:-moz-placeholder': {
          color: inputColor,
          fontSize: fontsize,
          opacity: '1 !important',
        },
      },
      'input::-ms-reveal, input::-ms-clear': {
        display: 'none',
      },

      '@media print': {
        '[class*="Dialog-header"]': {
          display: 'none',
        },
      },

      'article,aside,footer,header,nav,section': {
        display: 'block',
      },

      'h1': {
        margin: '.67em 0',
        fontSize: '2em',
      },

      'figcaption,figure': {
        display: 'block',
      },

      'figure': {
        margin: '1em 40px',
      },

      'hr': {
        boxSizing: 'content-box' as any,
        height: 0,
        overflow: 'visible',
      },

      'main': {
        display: 'block',
      },

      'pre': {
        fontFamily: 'monospace',
        fontSize: '1em',
      },

      'a': {
        '-webkit-text-decoration-skip': 'objects',
        backgroundColor: 'transparent',
        textDecoration: 'none',
      },

      'abbr[title]': {
        borderBottom: 'none',
        '-webkit-text-decoration': 'underline dotted',
        textDecoration: 'underline dotted',
      },

      'b, strong': {
        fontWeight: 700,
      },

      'code,kbd,samp': {
        fontFamily: 'monospace',
        fontSize: '1em',
      },

      'dfn': {
        fontStyle: 'italic',
      },

      'mark': {
        color: '#000',
        backgroundColor: '#ff0',
      },

      'small': {
        fontSize: '80%',
      },

      'img': {
        borderStyle: 'none',
      },

      'svg:not(:root)': {
        overflow: 'hidden',
      },

      'button,input,optgroup,select,textarea': {
        margin: 0,
        fontSize: '100%',
        lineHeight: 1.15,
      },

      'button': {
        overflow: 'visible',
        '-webkit-appearance': 'button',
      },

      'html [type=button]': {
        '-webkit-appearance': 'button',
      },

      '[type=reset]': {
        '-webkit-appearance': 'button',
      },

      '[type=submit]': {
        '-webkit-appearance': 'button',
      },

      'button::-moz-focus-inner': {
        borderStyle: 'none',
        padding: 0,
      },

      '[type=button]::-moz-focus-inner': {
        borderStyle: 'none',
        padding: 0,
      },

      '[type=reset]::-moz-focus-inner': {
        borderStyle: 'none',
        padding: 0,
      },

      '[type=submit]::-moz-focus-inner': {
        borderStyle: 'none',
        padding: 0,
      },

      'button:-moz-focusring': {
        outline: '1px dotted buttontext',
      },

      '[type=button]:-moz-focusring': {
        outline: '1px dotted buttontext',
      },

      '[type=reset]:-moz-focusring': {
        outline: '1px dotted buttontext',
      },

      '[type=submit]:-moz-focusring': {
        outline: '1px dotted buttontext',
      },

      'input': {
        overflow: 'visible',
      },

      '[type=checkbox]': {
        boxSizing: 'border-box' as any,
        padding: 0,
      },

      '[type=radio]': {
        boxSizing: 'border-box' as any,
        padding: 0,
      },

      '[type=number]::-webkit-inner-spin-button': {
        height: 'auto',
      },

      '[type=number]::-webkit-outer-spin-button': {
        height: 'auto',
      },

      '[type=search]': {
        '-webkit-appearance': 'textfield',
        'outlineOffset': '-2px',
      },

      '[type=search]::-webkit-search-cancel-button': {
        '-webkit-appearance': 'none',
      },

      '[type=search]::-webkit-search-decoration': {
        '-webkit-appearance': 'none'
      },

      '::-webkit-file-upload-button': {
        '-webkit-appearance': 'button',
        font: 'inherit',
      },

      'fieldset': {
        padding: '.35em .75em .625em',
      },

      'textarea': {
        overflow: 'auto',
      },

      'details': {
        display: 'block',
      },

      'summary': {
        display: 'list-item',
      },

      'menu': {
        display: 'block',
      },

      'canvas': {
        display: 'inline-block',
      },
    },
  }
}
