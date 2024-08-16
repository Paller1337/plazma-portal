import { Button, createTheme, CSSVariablesResolver } from "@mantine/core"

export const plazmaTheme = createTheme({
    components: {
        Button: Button.extend({
            defaultProps: {
                color: 'cyan',
                variant: 'outline',
                py: 12,
            },
        }),
    },
})


export const resolver: CSSVariablesResolver = (themeColor) => ({
    variables: {
        '--portal-color-text': '#262626',
        '--portal-color-text-secondary': '#485066',
    },
    light: {},
    dark: {},
})