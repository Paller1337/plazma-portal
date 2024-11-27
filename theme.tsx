import { Button, createTheme, CSSVariablesResolver, Switch } from "@mantine/core"

export const plazmaTheme = createTheme({
    components: {
        Button: Button.extend({
            defaultProps: {
                color: 'cyan',
                variant: 'outline',
                py: 12,
            },
        }),
        Switch: Switch.extend({
            defaultProps: {
                color: 'rgb(86, 117, 75)'
            },
        })
    },
})


export const resolver: CSSVariablesResolver = (themeColor) => ({
    variables: {
        '--portal-color-text': '#262626',
        '--portal-color-text-secondary': '#485066',
    },
    light: {
    },
    dark: {},
})