interface ButtonProps {
    text: string
    outlined?: boolean
    stretch?: boolean
    onClick?: () => void
}

export default function Button(props: ButtonProps) {

    return (
        <div className={`portal-button${props.outlined ? ' portal-button_outline' : ''} ${props.stretch ? ' portal-button_stretch' : ''}`}
            onClick={props.onClick}
        >
            {props.text}
        </div>
    )
}