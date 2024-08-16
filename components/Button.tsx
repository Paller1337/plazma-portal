interface ButtonProps {
    text: string
    outlined?: boolean
    stretch?: boolean
    onClick?: (e?: any) => void
    disabled?: boolean
    color?: string
    bgColor?: string
}

export default function Button(props: ButtonProps) {

    return (
        <div className={`portal-button${props.outlined ? ' portal-button_outline' : ''}${props.stretch ? ' portal-button_stretch' : ''}${props.disabled ? ' portal-button_disabled' : ''}`}
            onClick={!props.disabled ? props.onClick : () => { }}
            style={{
                color: props.color, backgroundColor: props.bgColor
            }}
        >
            {props.text}
        </div>
    )
}