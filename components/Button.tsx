interface ButtonProps {
    text: string
    outlined?: boolean
    stretch?: boolean
    onClick?: () => void
    disabled?: boolean
}

export default function Button(props: ButtonProps) {

    return (
        <div className={`portal-button${props.outlined ? ' portal-button_outline' : ''}${props.stretch ? ' portal-button_stretch' : ''}${props.disabled ? ' portal-button_disabled' : ''}`}
            onClick={!props.disabled ? props.onClick : () => { }}
        >
            {props.text}
        </div>
    )
}